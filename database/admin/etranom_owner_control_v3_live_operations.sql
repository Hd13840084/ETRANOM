-- ETRANOM OWNER CONTROL V3: live operational read APIs
-- Requires V1. Read-only access to allow-listed existing game tables.
begin;

create or replace function public.etranom_admin_live_overview_v1()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb := '{}'::jsonb;
  t text;
  n bigint;
  tables text[] := array[
    'player_profiles','game_saves','etranom_content_regions','etranom_content_monsters',
    'etranom_content_materials','etranom_content_recipes','etranom_shared_skill_catalog',
    'market_listings','market_transactions','guilds','guild_members','global_messages',
    'private_messages','parties','party_members','party_sessions','party_battle_state',
    'pvp_matches','pvp_player_stats','game_save_conflicts','game_save_history'
  ];
begin
  if not public.etranom_admin_is_authorized_v1('dashboard') then raise exception 'ADMIN_FORBIDDEN'; end if;
  foreach t in array tables loop
    if to_regclass('public.' || t) is not null then
      execute format('select count(*) from public.%I', t) into n;
      result := result || jsonb_build_object(t, n);
    end if;
  end loop;
  result := result || jsonb_build_object('captured_at', now());
  return result;
end;
$$;

create or replace function public.etranom_admin_table_preview_v1(
  p_table text,
  p_limit integer default 50,
  p_offset integer default 0
)
returns setof jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  required_permission text;
begin
  required_permission := case p_table
    when 'player_profiles' then 'players'
    when 'game_saves' then 'players'
    when 'game_save_history' then 'players'
    when 'game_save_conflicts' then 'players'
    when 'market_listings' then 'economy'
    when 'market_transactions' then 'economy'
    when 'guilds' then 'economy'
    when 'guild_members' then 'economy'
    when 'etranom_content_regions' then 'world'
    when 'etranom_content_monsters' then 'world'
    when 'etranom_content_materials' then 'world'
    when 'etranom_content_recipes' then 'world'
    when 'etranom_shared_skill_catalog' then 'combat'
    when 'pvp_matches' then 'combat'
    when 'pvp_player_stats' then 'combat'
    when 'party_sessions' then 'combat'
    when 'party_battle_state' then 'combat'
    when 'party_members' then 'combat'
    when 'parties' then 'combat'
    when 'global_messages' then 'community'
    when 'private_messages' then 'community'
    else null
  end;
  if required_permission is null then raise exception 'TABLE_NOT_ALLOWED'; end if;
  if not public.etranom_admin_is_authorized_v1(required_permission) then raise exception 'ADMIN_FORBIDDEN'; end if;
  if to_regclass('public.' || p_table) is null then raise exception 'TABLE_NOT_FOUND'; end if;
  return query execute format(
    'select to_jsonb(x) from public.%I x order by to_jsonb(x)::text limit $1 offset $2',
    p_table
  ) using least(greatest(coalesce(p_limit,50),1),100), greatest(coalesce(p_offset,0),0);
end;
$$;

revoke all on function public.etranom_admin_live_overview_v1() from public, anon;
revoke all on function public.etranom_admin_table_preview_v1(text,integer,integer) from public, anon;
grant execute on function public.etranom_admin_live_overview_v1() to authenticated;
grant execute on function public.etranom_admin_table_preview_v1(text,integer,integer) to authenticated;


-- V3.1: Owner-only role administration. The designated Owner cannot be demoted.
create or replace function public.etranom_admin_list_roles_v1()
returns setof jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is distinct from 'f9531c31-8c9f-495d-baf2-d19575982f78'::uuid then
    raise exception 'OWNER_ONLY';
  end if;
  return query select jsonb_build_object(
    'user_id', r.user_id, 'role', r.role, 'permissions', r.permissions,
    'created_at', r.created_at, 'created_by', r.created_by
  ) from public.etranom_admin_roles r order by r.created_at asc;
end;
$$;

create or replace function public.etranom_admin_set_role_v1(
  p_user_id uuid,
  p_role text,
  p_permissions jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed_permissions text[] := array['dashboard','players','content','audit','roles','economy','world','combat','community'];
  k text;
begin
  if auth.uid() is distinct from 'f9531c31-8c9f-495d-baf2-d19575982f78'::uuid then
    raise exception 'OWNER_ONLY';
  end if;
  if p_user_id is null then raise exception 'USER_ID_REQUIRED'; end if;
  if p_role not in ('super_admin','game_admin','moderator','support') then
    raise exception 'INVALID_ADMIN_ROLE';
  end if;
  if p_user_id = 'f9531c31-8c9f-495d-baf2-d19575982f78'::uuid then
    raise exception 'OWNER_PROTECTED';
  end if;
  if jsonb_typeof(coalesce(p_permissions,'{}'::jsonb)) <> 'object' then raise exception 'INVALID_PERMISSIONS'; end if;
  for k in select jsonb_object_keys(coalesce(p_permissions,'{}'::jsonb)) loop
    if not (k = any(allowed_permissions)) then raise exception 'UNKNOWN_PERMISSION'; end if;
    if jsonb_typeof(p_permissions->k) <> 'boolean' then raise exception 'PERMISSION_MUST_BE_BOOLEAN'; end if;
  end loop;
  if not exists(select 1 from auth.users u where u.id=p_user_id) then raise exception 'AUTH_USER_NOT_FOUND'; end if;
  insert into public.etranom_admin_roles(user_id,role,permissions,created_by)
  values(p_user_id,p_role,coalesce(p_permissions,'{}'::jsonb),auth.uid())
  on conflict(user_id) do update set role=excluded.role,permissions=excluded.permissions;
  insert into public.etranom_admin_audit_logs(actor_id,action,target_type,target_id,details)
  values(auth.uid(),'admin_role_set','admin',p_user_id::text,jsonb_build_object('role',p_role,'permissions',coalesce(p_permissions,'{}'::jsonb)));
  return jsonb_build_object('user_id',p_user_id,'role',p_role,'permissions',coalesce(p_permissions,'{}'::jsonb));
end;
$$;

revoke all on function public.etranom_admin_list_roles_v1() from public, anon;
revoke all on function public.etranom_admin_set_role_v1(uuid,text,jsonb) from public, anon;
grant execute on function public.etranom_admin_list_roles_v1() to authenticated;
grant execute on function public.etranom_admin_set_role_v1(uuid,text,jsonb) to authenticated;

commit;
