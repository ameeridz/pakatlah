begin;
alter table public.decisions add column final_option_id uuid references public.decision_options(id) on delete restrict;
create index decisions_final_option_id_idx on public.decisions(final_option_id);
create function public.finalize_decision(p_manage_token text, p_option_id uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_id uuid; v_status text; v_name text;
begin
  select id, status into v_id, v_status from public.decisions where manage_token = btrim(coalesce(p_manage_token, '')) limit 1;
  if v_id is null then return null; end if;
  if v_status = 'open' then raise exception 'Responses must be closed before finalizing the decision.' using errcode = '55000'; end if;
  if v_status = 'finalized' then raise exception 'This decision has already been finalized.' using errcode = '55000'; end if;
  select name into v_name from public.decision_options where id = p_option_id and decision_id = v_id limit 1;
  if v_name is null then raise exception 'The selected option does not belong to this decision.' using errcode = '22023'; end if;
  update public.decisions set status = 'finalized', final_option_id = p_option_id where id = v_id;
  return jsonb_build_object('id', v_id, 'status', 'finalized', 'finalOptionId', p_option_id, 'finalOptionName', v_name);
end;
$$;
revoke all on function public.finalize_decision(text, uuid) from public, anon, authenticated;
grant execute on function public.finalize_decision(text, uuid) to anon, authenticated;
commit;
