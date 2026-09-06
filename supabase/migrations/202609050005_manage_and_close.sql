begin;
create function public.close_decision_responses(p_manage_token text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_id uuid; v_status text;
begin
  p_manage_token := btrim(coalesce(p_manage_token, ''));
  select id, status into v_id, v_status from public.decisions where manage_token = p_manage_token limit 1;
  if v_id is null then return null; end if;
  if v_status = 'finalized' then raise exception 'A finalized decision cannot be reopened or closed again.' using errcode = '55000'; end if;
  if v_status = 'open' then update public.decisions set status = 'closed' where id = v_id; end if;
  return jsonb_build_object('id', v_id, 'status', 'closed');
end;
$$;
revoke all on function public.close_decision_responses(text) from public, anon, authenticated;
grant execute on function public.close_decision_responses(text) to anon, authenticated;
commit;
