begin;
-- Aggregate helper RPCs. These functions expose no manage token or other participants' identities.
create or replace function public.get_public_decision(p_public_token text)
returns jsonb language plpgsql security definer stable set search_path = ''
as $$
declare v jsonb;
begin
  select jsonb_build_object('id',d.id,'question',d.question,'organizerName',d.organizer_name,'status',d.status,'closesAt',d.closes_at,'createdAt',d.created_at,
    'finalOption',case when f.id is null then null else jsonb_build_object('id',f.id,'name',f.name,'position',f.position) end,
    'options',coalesce((select jsonb_agg(jsonb_build_object('id',o.id,'name',o.name,'position',o.position) order by o.position) from public.decision_options o where o.decision_id=d.id),'[]'::jsonb))
  into v from public.decisions d left join public.decision_options f on f.id=d.final_option_id where d.public_token=btrim(coalesce(p_public_token,'')) limit 1;
  return v;
end;
$$;

create function public.get_participant_results(p_public_token text, p_response_token text)
returns jsonb language plpgsql security definer stable set search_path = ''
as $$
declare v_id uuid; v_pid uuid; v jsonb;
begin
  select d.id,p.id into v_id,v_pid from public.decisions d join public.participants p on p.decision_id=d.id where d.public_token=btrim(coalesce(p_public_token,'')) and p.response_token=btrim(coalesce(p_response_token,'')) limit 1;
  if v_id is null then return null; end if;
  select jsonb_build_object('id',d.id,'question',d.question,'organizerName',d.organizer_name,'status',d.status,'closesAt',d.closes_at,
    'participantCount',(select count(*) from public.participants p where p.decision_id=d.id),
    'currentParticipant',jsonb_build_object('id',cp.id,'name',cp.name),
    'finalOption',case when f.id is null then null else jsonb_build_object('id',f.id,'name',f.name,'position',f.position) end,
    'options',coalesce((select jsonb_agg(jsonb_build_object('id',x.id,'name',x.name,'position',x.position,'responseCount',x.response_count,'consensusScore',x.consensus_score,'rejectionCount',x.rejection_count,'rejectionRate',x.rejection_rate) order by x.consensus_score desc,x.rejection_rate asc,x.position asc)
      from (select o.id,o.name,o.position,count(r.id)::int response_count,case when count(r.id)=0 then 0 else round((coalesce(sum(r.reaction_score),0)::numeric/(count(r.id)*3))*100,1) end consensus_score,count(r.id) filter(where r.reaction_score=0)::int rejection_count,case when count(r.id)=0 then 0 else round((count(r.id) filter(where r.reaction_score=0)::numeric/count(r.id))*100,1) end rejection_rate from public.decision_options o left join public.participant_responses r on r.option_id=o.id where o.decision_id=d.id group by o.id,o.name,o.position)x),'[]'::jsonb))
  into v from public.decisions d join public.participants cp on cp.id=v_pid left join public.decision_options f on f.id=d.final_option_id where d.id=v_id;
  return v;
end;
$$;

-- Organizer aggregate and participant detail dashboard.
create function public.get_manage_dashboard(p_manage_token text)
returns jsonb language plpgsql security definer stable set search_path = ''
as $$
declare v_id uuid; v jsonb;
begin
  select id into v_id from public.decisions where manage_token=btrim(coalesce(p_manage_token,'')) limit 1;
  if v_id is null then return null; end if;
  select jsonb_build_object('id',d.id,'publicToken',d.public_token,'question',d.question,'organizerName',d.organizer_name,'status',d.status,'closesAt',d.closes_at,'createdAt',d.created_at,'updatedAt',d.updated_at,
    'finalOption',case when f.id is null then null else jsonb_build_object('id',f.id,'name',f.name,'position',f.position) end,
    'participantCount',(select count(*) from public.participants p where p.decision_id=d.id),
    'options',coalesce((select jsonb_agg(jsonb_build_object('id',x.id,'name',x.name,'position',x.position,'responseCount',x.response_count,'totalScore',x.total_score,'consensusScore',x.consensus_score,'rejectionCount',x.rejection_count,'rejectionRate',x.rejection_rate) order by x.consensus_score desc,x.rejection_rate asc,x.position asc)
      from (select o.id,o.name,o.position,count(r.id)::int response_count,coalesce(sum(r.reaction_score),0)::int total_score,case when count(r.id)=0 then 0 else round((sum(r.reaction_score)::numeric/(count(r.id)*3))*100,1) end consensus_score,count(r.id) filter(where r.reaction_score=0)::int rejection_count,case when count(r.id)=0 then 0 else round((count(r.id) filter(where r.reaction_score=0)::numeric/count(r.id))*100,1) end rejection_rate from public.decision_options o left join public.participant_responses r on r.option_id=o.id where o.decision_id=d.id group by o.id,o.name,o.position)x),'[]'::jsonb),
    'participants',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'name',p.name,'createdAt',p.created_at,'responses',coalesce((select jsonb_agg(jsonb_build_object('optionId',o.id,'optionName',o.name,'position',o.position,'score',r.reaction_score) order by o.position) from public.participant_responses r join public.decision_options o on o.id=r.option_id where r.participant_id=p.id),'[]'::jsonb)) order by p.created_at) from public.participants p where p.decision_id=d.id),'[]'::jsonb))
  into v from public.decisions d left join public.decision_options f on f.id=d.final_option_id where d.id=v_id;
  return v;
end;
$$;

revoke all on function public.get_public_decision(text) from public, anon, authenticated;
revoke all on function public.get_participant_results(text,text) from public, anon, authenticated;
revoke all on function public.get_manage_dashboard(text) from public, anon, authenticated;
grant execute on function public.get_public_decision(text) to anon, authenticated;
grant execute on function public.get_participant_results(text,text) to anon, authenticated;
grant execute on function public.get_manage_dashboard(text) to anon, authenticated;
commit;
