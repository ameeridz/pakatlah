begin;
create function public.get_public_decision(p_public_token text)
returns jsonb language plpgsql security definer stable set search_path = ''
as $$
declare v_result jsonb;
begin
  p_public_token := btrim(coalesce(p_public_token, ''));
  if char_length(p_public_token) < 1 then raise exception 'Public token is required.' using errcode = '22023'; end if;
  select jsonb_build_object(
    'id', d.id, 'question', d.question, 'organizerName', d.organizer_name,
    'status', d.status, 'closesAt', d.closes_at, 'createdAt', d.created_at,
    'options', coalesce((select jsonb_agg(jsonb_build_object('id', o.id, 'name', o.name, 'position', o.position) order by o.position) from public.decision_options o where o.decision_id = d.id), '[]'::jsonb)
  ) into v_result from public.decisions d where d.public_token = p_public_token limit 1;
  return v_result;
end;
$$;
revoke all on function public.get_public_decision(text) from public, anon, authenticated;
grant execute on function public.get_public_decision(text) to anon, authenticated;
commit;
