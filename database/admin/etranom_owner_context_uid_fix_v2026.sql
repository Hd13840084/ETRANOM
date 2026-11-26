-- ETRANOM OWNER CONTEXT UID FIX V2026
-- Fixes the case where Auth.getUser() validates the designated Owner,
-- but the admin context RPC returns {role:null} because the role-row lookup
-- does not resolve inside the RPC execution context.
-- Authorization remains server-side and is bound to the one immutable Owner UUID.

begin;

create or replace function public.etranom_admin_is_authorized_v1(p_permission text default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() = 'f9531c31-8c9f-495d-baf2-d19575982f78'::uuid;
$$;

create or replace function public.etranom_admin_context_v1()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_permissions jsonb;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  if auth.uid() is distinct from 'f9531c31-8c9f-495d-baf2-d19575982f78'::uuid then
    return jsonb_build_object('role', null, 'permissions', '{}'::jsonb);
  end if;

  -- The immutable Auth UUID is the authority for the single Owner account.
  -- The role table is used only to load the configured permission map.
  select ar.permissions
    into current_permissions
    from public.etranom_admin_roles as ar
   where ar.user_id = 'f9531c31-8c9f-495d-baf2-d19575982f78'::uuid;

  return jsonb_build_object(
    'role', 'owner',
    'permissions', coalesce(
      current_permissions,
      '{"audit":true,"roles":true,"world":true,"combat":true,"content":true,"economy":true,"players":true,"dashboard":true}'::jsonb
    )
  );
end;
$$;

revoke all on function public.etranom_admin_is_authorized_v1(text) from public, anon;
revoke all on function public.etranom_admin_context_v1() from public, anon;
grant execute on function public.etranom_admin_is_authorized_v1(text) to authenticated;
grant execute on function public.etranom_admin_context_v1() to authenticated;

commit;

-- SQL Editor runs without an end-user JWT, so auth.uid() here is expected to be NULL.
-- Verify function grants separately; verify the returned role from the signed-in game session.
select
  has_function_privilege('authenticated', 'public.etranom_admin_context_v1()', 'EXECUTE') as authenticated_can_execute,
  has_function_privilege('anon', 'public.etranom_admin_context_v1()', 'EXECUTE') as anon_can_execute;
