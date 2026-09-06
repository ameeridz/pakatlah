begin;

create function public.create_decision(
  p_question text,
  p_organizer_name text,
  p_options jsonb,
  p_closes_at timestamptz default null
)
returns table (decision_id uuid, public_token text, manage_token text)
language plpgsql security definer set search_path = ''
as $$
declare
  v_decision_id uuid;
  v_public_token text;
  v_manage_token text;
  v_option_count integer;
  v_distinct_option_count integer;
  v_option jsonb;
  v_position integer := 0;
begin
  p_question := btrim(coalesce(p_question, ''));
  p_organizer_name := btrim(coalesce(p_organizer_name, ''));
  if char_length(p_question) not between 1 and 120 then raise exception 'Question must contain between 1 and 120 characters.' using errcode = '22023'; end if;
  if char_length(p_organizer_name) not between 1 and 40 then raise exception 'Organizer name must contain between 1 and 40 characters.' using errcode = '22023'; end if;
  if p_options is null or jsonb_typeof(p_options) <> 'array' then raise exception 'Options must be provided as a JSON array.' using errcode = '22023'; end if;
  v_option_count := jsonb_array_length(p_options);
  if v_option_count not between 2 and 6 then raise exception 'A decision must contain between 2 and 6 options.' using errcode = '22023'; end if;
  if exists (select 1 from jsonb_array_elements(p_options) v where jsonb_typeof(v) <> 'string' or char_length(btrim(v #>> '{}')) not between 1 and 60) then raise exception 'Every option must be text containing between 1 and 60 characters.' using errcode = '22023'; end if;
  select count(distinct lower(btrim(v #>> '{}'))) into v_distinct_option_count from jsonb_array_elements(p_options) v;
  if v_distinct_option_count <> v_option_count then raise exception 'Options must be unique.' using errcode = '22023'; end if;
  if p_closes_at is not null and p_closes_at <= now() then raise exception 'Closing time must be in the future.' using errcode = '22023'; end if;

  insert into public.decisions(question, organizer_name, closes_at)
  values (p_question, p_organizer_name, p_closes_at)
  returning id, decisions.public_token, decisions.manage_token
  into v_decision_id, v_public_token, v_manage_token;

  for v_option in select value from jsonb_array_elements(p_options) loop
    v_position := v_position + 1;
    insert into public.decision_options(decision_id, name, position)
    values (v_decision_id, btrim(v_option #>> '{}'), v_position);
  end loop;

  return query select v_decision_id, v_public_token, v_manage_token;
end;
$$;

revoke all on function public.create_decision(text, text, jsonb, timestamptz) from public, anon, authenticated;
grant execute on function public.create_decision(text, text, jsonb, timestamptz) to anon, authenticated;
commit;
