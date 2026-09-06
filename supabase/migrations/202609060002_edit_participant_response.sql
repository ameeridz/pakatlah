-- Pakatlah: allow a verified participant to retrieve and edit their own response.
-- Run once in Supabase SQL Editor.
-- Also copy this file into supabase/migrations/ after it runs successfully.

begin;

create or replace function public.get_participant_response(
  p_public_token text,
  p_response_token text
)
returns jsonb
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  p_public_token := btrim(coalesce(p_public_token, ''));
  p_response_token := btrim(coalesce(p_response_token, ''));

  if char_length(p_public_token) < 1 then
    raise exception 'Public token is required.'
      using errcode = '22023';
  end if;

  if char_length(p_response_token) < 1 then
    raise exception 'Response token is required.'
      using errcode = '22023';
  end if;

  select jsonb_build_object(
    'participantId', participant.id,
    'participantName', participant.name,
    'decisionId', decision.id,
    'status', decision.status,
    'closesAt', decision.closes_at,
    'canEdit', (
      decision.status = 'open'
      and (decision.closes_at is null or decision.closes_at > now())
    ),
    'responses', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'optionId', decision_option.id,
            'optionName', decision_option.name,
            'position', decision_option.position,
            'score', participant_response.reaction_score
          )
          order by decision_option.position
        )
        from public.participant_responses as participant_response
        join public.decision_options as decision_option
          on decision_option.id = participant_response.option_id
        where participant_response.participant_id = participant.id
      ),
      '[]'::jsonb
    )
  )
  into v_result
  from public.decisions as decision
  join public.participants as participant
    on participant.decision_id = decision.id
  where decision.public_token = p_public_token
    and participant.response_token = p_response_token
  limit 1;

  return v_result;
end;
$$;

revoke all on function public.get_participant_response(text, text)
from public;

revoke all on function public.get_participant_response(text, text)
from anon, authenticated;

grant execute on function public.get_participant_response(text, text)
to anon, authenticated;

create or replace function public.update_participant_response(
  p_public_token text,
  p_response_token text,
  p_participant_name text,
  p_responses jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_decision_id uuid;
  v_participant_id uuid;
  v_decision_status text;
  v_closes_at timestamptz;
  v_option_count integer;
  v_response_count integer;
  v_distinct_option_count integer;
  v_response jsonb;
  v_option_id uuid;
  v_score integer;
begin
  p_public_token := btrim(coalesce(p_public_token, ''));
  p_response_token := btrim(coalesce(p_response_token, ''));
  p_participant_name := btrim(coalesce(p_participant_name, ''));

  if char_length(p_public_token) < 1 then
    raise exception 'Public token is required.'
      using errcode = '22023';
  end if;

  if char_length(p_response_token) < 1 then
    raise exception 'Response token is required.'
      using errcode = '22023';
  end if;

  if char_length(p_participant_name) not between 1 and 40 then
    raise exception 'Participant name must contain between 1 and 40 characters.'
      using errcode = '22023';
  end if;

  if p_responses is null or jsonb_typeof(p_responses) <> 'array' then
    raise exception 'Responses must be provided as a JSON array.'
      using errcode = '22023';
  end if;

  select
    decision.id,
    participant.id,
    decision.status,
    decision.closes_at
  into
    v_decision_id,
    v_participant_id,
    v_decision_status,
    v_closes_at
  from public.decisions as decision
  join public.participants as participant
    on participant.decision_id = decision.id
  where decision.public_token = p_public_token
    and participant.response_token = p_response_token
  limit 1;

  if v_decision_id is null or v_participant_id is null then
    return null;
  end if;

  if v_decision_status <> 'open'
     or (v_closes_at is not null and v_closes_at <= now()) then
    raise exception 'This response can no longer be edited.'
      using errcode = '55000';
  end if;

  select count(*)
  into v_option_count
  from public.decision_options as decision_option
  where decision_option.decision_id = v_decision_id;

  v_response_count := jsonb_array_length(p_responses);

  if v_response_count <> v_option_count then
    raise exception 'Every option must receive exactly one response.'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_responses) as response_value
    where jsonb_typeof(response_value) <> 'object'
       or not (response_value ? 'optionId')
       or not (response_value ? 'score')
       or jsonb_typeof(response_value -> 'optionId') <> 'string'
       or jsonb_typeof(response_value -> 'score') <> 'number'
       or (response_value ->> 'score') !~ '^[0-3]$'
  ) then
    raise exception 'Every response must include a valid option and score from 0 to 3.'
      using errcode = '22023';
  end if;

  select count(distinct response_value ->> 'optionId')
  into v_distinct_option_count
  from jsonb_array_elements(p_responses) as response_value;

  if v_distinct_option_count <> v_option_count then
    raise exception 'Each option can only be answered once.'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_responses) as response_value
    left join public.decision_options as decision_option
      on decision_option.id = (response_value ->> 'optionId')::uuid
     and decision_option.decision_id = v_decision_id
    where decision_option.id is null
  ) then
    raise exception 'One or more options do not belong to this decision.'
      using errcode = '22023';
  end if;

  update public.participants
  set name = p_participant_name
  where id = v_participant_id;

  for v_response in
    select value
    from jsonb_array_elements(p_responses)
  loop
    v_option_id := (v_response ->> 'optionId')::uuid;
    v_score := (v_response ->> 'score')::integer;

    update public.participant_responses
    set reaction_score = v_score
    where participant_id = v_participant_id
      and option_id = v_option_id;

    if not found then
      raise exception 'A stored response is missing for one or more options.'
        using errcode = 'P0002';
    end if;
  end loop;

  return jsonb_build_object(
    'participantId', v_participant_id,
    'participantName', p_participant_name,
    'status', 'updated',
    'updatedAt', now()
  );
end;
$$;

revoke all on function public.update_participant_response(text, text, text, jsonb)
from public;

revoke all on function public.update_participant_response(text, text, text, jsonb)
from anon, authenticated;

grant execute on function public.update_participant_response(text, text, text, jsonb)
to anon, authenticated;

commit;
