-- ETRANOM V2023: Owner-only administration access and server-side enforcement.
-- Run in Supabase SQL Editor after the existing Owner Control migrations.
-- This intentionally disables all non-owner admin roles for the admin RPC layer.

begin;

create or replace function public.etranom_admin_is_authorized_v1(p_permission text default null)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_role text;
begin
  if auth.uid() is distinct from 'f9531c31-8c9f-495d-baf2-d19575982f78'::uuid then
    return false;
  end if;

  select ar.role
    into current_role
    from public.etranom_admin_roles as ar
   where ar.user_id = auth.uid();

  return current_role = 'owner';
end;
$$;

create or replace function public.etranom_admin_context_v1()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_role text;
  current_permissions jsonb;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  if auth.uid() is distinct from 'f9531c31-8c9f-495d-baf2-d19575982f78'::uuid then
    return jsonb_build_object('role', null, 'permissions', '{}'::jsonb);
  end if;

  select ar.role, ar.permissions
    into current_role, current_permissions
    from public.etranom_admin_roles as ar
   where ar.user_id = auth.uid();

  if current_role is distinct from 'owner' then
    return jsonb_build_object('role', null, 'permissions', '{}'::jsonb);
  end if;

  return jsonb_build_object(
    'role', 'owner',
    'permissions', coalesce(current_permissions, '{}'::jsonb)
  );
end;
$$;

revoke all on function public.etranom_admin_is_authorized_v1(text) from public, anon;
revoke all on function public.etranom_admin_context_v1() from public, anon;
grant execute on function public.etranom_admin_is_authorized_v1(text) to authenticated;
grant execute on function public.etranom_admin_context_v1() to authenticated;

commit;

-- Post-deploy verification: expected one row with owner_only=true and owner_context_role='owner'.
select
  auth.uid() as caller_uid,
  public.etranom_admin_is_authorized_v1('dashboard') as owner_only,
  public.etranom_admin_context_v1()->>'role' as owner_context_role;
