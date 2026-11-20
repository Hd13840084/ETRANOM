-- ETRANOM Party: least-privilege read access for Supabase Postgres Changes
-- Apply AFTER database/party.sql. Safe to re-run.

begin;

-- SECURITY DEFINER avoids recursive RLS when policies inspect party_members.
create or replace function public.party_user_is_member(p_party_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.party_members pm
    where pm.party_id = p_party_id
      and pm.user_id = auth.uid()
  );
$$;

revoke all on function public.party_user_is_member(uuid)
  from public, anon;
grant execute on function public.party_user_is_member(uuid)
  to authenticated;

-- Realtime requires SELECT privilege as well as an RLS SELECT policy.
-- No client INSERT/UPDATE/DELETE privileges are granted.
grant select on table public.parties, public.party_members
  to authenticated;

-- A user can read only the party they currently belong to.
drop policy if exists party_members_read_own_party on public.party_members;
create policy party_members_read_own_party
  on public.party_members
  for select
  to authenticated
  using (public.party_user_is_member(party_id));

drop policy if exists parties_read_own_party on public.parties;
create policy parties_read_own_party
  on public.parties
  for select
  to authenticated
  using (public.party_user_is_member(id));

-- Ensure the two subscribed tables are in supabase_realtime publication.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'parties'
  ) then
    alter publication supabase_realtime add table public.parties;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'party_members'
  ) then
    alter publication supabase_realtime add table public.party_members;
  end if;
end;
$$;

commit;

-- Note: party_invites and party_sessions remain RPC-only in this patch.
-- This patch does not grant client write access and does not expose party data
-- to users who are not current members.
