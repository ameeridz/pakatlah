begin;
create table public.participants (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid not null references public.decisions(id) on delete cascade,
  name text not null,
  response_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint participants_name_length check (char_length(btrim(name)) between 1 and 40)
);
create table public.participant_responses (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  option_id uuid not null references public.decision_options(id) on delete cascade,
  reaction_score smallint not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint participant_responses_score_range check (reaction_score between 0 and 3),
  constraint participant_responses_unique_option unique (participant_id, option_id)
);
create index participants_decision_id_idx on public.participants(decision_id);
create index participant_responses_participant_id_idx on public.participant_responses(participant_id);
create index participant_responses_option_id_idx on public.participant_responses(option_id);
create trigger participants_set_updated_at before update on public.participants for each row execute function public.set_updated_at();
create trigger participant_responses_set_updated_at before update on public.participant_responses for each row execute function public.set_updated_at();
alter table public.participants enable row level security;
alter table public.participant_responses enable row level security;
revoke all on table public.participants from anon, authenticated;
revoke all on table public.participant_responses from anon, authenticated;

create function public.submit_participant_response(p_public_token text, p_participant_name text, p_responses jsonb)
returns table (participant_id uuid, response_token text)
language plpgsql security definer set search_path = ''
as $$
declare
  v_decision_id uuid; v_status text; v_closes_at timestamptz; v_participant_id uuid; v_token text;
  v_option_count integer; v_response_count integer; v_distinct integer; v_response jsonb;
begin
  p_public_token := btrim(coalesce(p_public_token, ''));
  p_participant_name := btrim(coalesce(p_participant_name, ''));
  if char_length(p_participant_name) not between 1 and 40 then raise exception 'Participant name must contain between 1 and 40 characters.' using errcode = '22023'; end if;
  if p_responses is null or jsonb_typeof(p_responses) <> 'array' then raise exception 'Responses must be provided as a JSON array.' using errcode = '22023'; end if;
  select id, status, closes_at into v_decision_id, v_status, v_closes_at from public.decisions where public_token = p_public_token limit 1;
  if v_decision_id is null then raise exception 'Decision was not found.' using errcode = 'P0002'; end if;
  if v_status <> 'open' or (v_closes_at is not null and v_closes_at <= now()) then raise exception 'Responses are closed for this decision.' using errcode = '55000'; end if;
  select count(*) into v_option_count from public.decision_options where decision_id = v_decision_id;
  v_response_count := jsonb_array_length(p_responses);
  if v_response_count <> v_option_count then raise exception 'Every option must receive exactly one response.' using errcode = '22023'; end if;
  if exists (select 1 from jsonb_array_elements(p_responses) r where jsonb_typeof(r) <> 'object' or not (r ? 'optionId') or not (r ? 'score') or jsonb_typeof(r -> 'optionId') <> 'string' or jsonb_typeof(r -> 'score') <> 'number' or (r ->> 'score')::integer not between 0 and 3) then raise exception 'Every response must include a valid option and score from 0 to 3.' using errcode = '22023'; end if;
  select count(distinct r ->> 'optionId') into v_distinct from jsonb_array_elements(p_responses) r;
  if v_distinct <> v_option_count then raise exception 'Each option can only be answered once.' using errcode = '22023'; end if;
  if exists (select 1 from jsonb_array_elements(p_responses) r left join public.decision_options o on o.id = (r ->> 'optionId')::uuid and o.decision_id = v_decision_id where o.id is null) then raise exception 'One or more options do not belong to this decision.' using errcode = '22023'; end if;
  insert into public.participants(decision_id, name) values (v_decision_id, p_participant_name) returning id, participants.response_token into v_participant_id, v_token;
  for v_response in select value from jsonb_array_elements(p_responses) loop
    insert into public.participant_responses(participant_id, option_id, reaction_score)
    values (v_participant_id, (v_response ->> 'optionId')::uuid, (v_response ->> 'score')::integer);
  end loop;
  return query select v_participant_id, v_token;
end;
$$;
revoke all on function public.submit_participant_response(text, text, jsonb) from public, anon, authenticated;
grant execute on function public.submit_participant_response(text, text, jsonb) to anon, authenticated;
commit;
