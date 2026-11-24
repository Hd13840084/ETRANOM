-- ETRANOM OWNER CONTROL V2 — player dossier (read-only)
-- Depends on Owner Control V1 and the verified player_profiles/game_saves schema.
-- Safe to re-run. Does not modify player data.
begin;

create or replace function public.etranom_admin_get_player_v1(p_player_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile jsonb;
  v_save_data jsonb;
  v_ban jsonb;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if not public.etranom_admin_is_authorized_v1('players') then
    raise exception 'ADMIN_FORBIDDEN';
  end if;
  if p_player_id is null then raise exception 'PLAYER_ID_REQUIRED'; end if;

  select to_jsonb(p) into v_profile
  from public.player_profiles p
  where p.user_id = p_player_id;
  if v_profile is null then raise exception 'PLAYER_NOT_FOUND'; end if;

  select s.save_data into v_save_data
  from public.game_saves s
  where s.user_id = p_player_id;

  select jsonb_build_object(
    'active', b.active and (b.expires_at is null or b.expires_at > now()),
    'reason', b.reason,
    'banned_at', b.banned_at,
    'expires_at', b.expires_at
  ) into v_ban
  from public.etranom_player_bans b
  where b.player_id = p_player_id;

  insert into public.etranom_admin_audit_logs(actor_id,action,target_type,target_id,details)
  values(auth.uid(),'player_dossier_view','player',p_player_id::text,'{}'::jsonb);

  return jsonb_build_object(
    'profile', v_profile,
    'save_data', v_save_data,
    'ban', coalesce(v_ban, jsonb_build_object('active',false))
  );
end;
$$;

revoke all on function public.etranom_admin_get_player_v1(uuid) from public, anon;
grant execute on function public.etranom_admin_get_player_v1(uuid) to authenticated;

commit;
