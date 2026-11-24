-- ETRANOM Party Bugfix Phase 5
-- Fixes: canonical six region IDs, region selection while preparing,
-- invitation acceptance while preparing, and a more practical invite lifetime.
-- Apply AFTER database/party.sql. Safe to re-run.

begin;

alter table public.party_invites
  alter column expires_at set default (now() + interval '10 minutes');

create or replace function public.create_party(p_region_id text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_party uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if exists (select 1 from public.party_members where user_id = v_user) then
    raise exception 'Already in a party';
  end if;
  if p_region_id is not null and p_region_id not in (
    'burnt_forest','thorn_grove','ash_hills','vardash_river','southern_plains','rootbound_ruins'
  ) then raise exception 'Invalid region'; end if;

  insert into public.parties (leader_id, region_id, status)
  values (v_user, p_region_id, 'forming')
  returning id into v_party;

  insert into public.party_members (party_id, user_id, role, is_ready)
  values (v_party, v_user, 'leader', false);

  return jsonb_build_object('success', true, 'party_id', v_party);
end;
$$;

create or replace function public.invite_party_member(p_target_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_party uuid;
  v_leader uuid;
  v_party_status text;
  v_count integer;
  v_invite uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;

  select pm.party_id, p.leader_id, p.status
    into v_party, v_leader, v_party_status
  from public.party_members pm
  join public.parties p on p.id = pm.party_id
  where pm.user_id = v_user
  for update of p;

  if v_party is null then raise exception 'You are not in a party'; end if;
  if v_leader <> v_user then raise exception 'Only leader can invite'; end if;
  if v_party_status not in ('forming','preparing') then raise exception 'Party is not accepting new members'; end if;
  if p_target_user_id = v_user then raise exception 'Cannot invite yourself'; end if;
  if not public.party_are_friends(v_user, p_target_user_id) then raise exception 'Target player is not your friend'; end if;

  select count(*) into v_count from public.party_members where party_id = v_party;
  if v_count >= 4 then raise exception 'Party is full'; end if;
  if exists (select 1 from public.party_members where user_id = p_target_user_id) then
    raise exception 'Target player is already in a party';
  end if;

  -- Expire old pending rows before inserting, otherwise the partial unique index
  -- can reject a fresh invitation even though the old invitation is already stale.
  update public.party_invites
    set status = 'expired', responded_at = now()
  where party_id = v_party and receiver_id = p_target_user_id
    and status = 'pending' and expires_at <= now();

  if exists (select 1 from public.party_invites
    where party_id = v_party and receiver_id = p_target_user_id
      and status = 'pending' and expires_at > now()) then
    raise exception 'Invitation already pending';
  end if;

  insert into public.party_invites (party_id, sender_id, receiver_id)
  values (v_party, v_user, p_target_user_id)
  returning id into v_invite;

  return jsonb_build_object('success', true, 'invite_id', v_invite);
end;
$$;

create or replace function public.respond_party_invite(
  p_invite_id uuid,
  p_accept boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_party uuid;
  v_status text;
  v_expires_at timestamptz;
  v_party_status text;
  v_count integer;
begin
  if v_user is null then raise exception 'Authentication required'; end if;

  select i.party_id, i.status, i.expires_at
    into v_party, v_status, v_expires_at
  from public.party_invites i
  where i.id = p_invite_id and i.receiver_id = v_user
  for update;

  if v_party is null then raise exception 'Invitation not found'; end if;
  if v_status <> 'pending' then raise exception 'Invitation is no longer pending'; end if;

  if v_expires_at <= now() then
    update public.party_invites
      set status = 'expired', responded_at = now()
    where id = p_invite_id;
    return jsonb_build_object('success', false, 'expired', true,
      'message', 'Invitation expired');
  end if;

  if not p_accept then
    update public.party_invites
      set status = 'rejected', responded_at = now()
    where id = p_invite_id;
    return jsonb_build_object('success', true, 'accepted', false);
  end if;

  if exists (select 1 from public.party_members where user_id = v_user) then
    raise exception 'Already in a party';
  end if;

  -- Lock the party row so two invitees cannot exceed capacity concurrently.
  select p.status into v_party_status
  from public.parties p
  where p.id = v_party
  for update;

  -- New groups are moved to preparing immediately after region selection.
  -- Both forming and preparing are valid invitation states.
  if v_party_status not in ('forming', 'preparing') or v_party_status is null then
    raise exception 'Party is no longer available';
  end if;

  select count(*) into v_count
  from public.party_members where party_id = v_party;
  if v_count >= 4 then raise exception 'Party is full'; end if;

  insert into public.party_members (party_id, user_id, role, is_ready)
  values (v_party, v_user, 'member', false);

  update public.party_invites
    set status = 'accepted', responded_at = now()
  where id = p_invite_id;

  update public.party_invites
    set status = 'cancelled', responded_at = now()
  where receiver_id = v_user and status = 'pending' and id <> p_invite_id;

  return jsonb_build_object('success', true, 'accepted', true, 'party_id', v_party);
end;
$$;

create or replace function public.select_party_region(p_region_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_party uuid;
  v_status text;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if p_region_id not in (
    'burnt_forest','thorn_grove','ash_hills','vardash_river','southern_plains','rootbound_ruins'
  ) then raise exception 'Invalid region'; end if;

  select p.id, p.status into v_party, v_status
  from public.parties p
  where p.leader_id = v_user
  for update;

  if v_party is null then
    if exists (select 1 from public.party_members where user_id = v_user) then
      raise exception 'Only party leader can select region';
    end if;
    raise exception 'You are not in a party';
  end if;

  if v_status not in ('forming', 'preparing') then
    raise exception 'Region cannot be changed after the party starts';
  end if;

  update public.parties
    set region_id = p_region_id, status = 'preparing', updated_at = now()
  where id = v_party;

  -- Any region change invalidates previous ready confirmations.
  update public.party_members set is_ready = false where party_id = v_party;

  return jsonb_build_object('success', true, 'region_id', p_region_id,
    'status', 'preparing');
end;
$$;

revoke all on function public.create_party(text) from public, anon;
revoke all on function public.invite_party_member(uuid) from public, anon;
revoke all on function public.respond_party_invite(uuid, boolean) from public, anon;
revoke all on function public.select_party_region(text) from public, anon;
grant execute on function public.create_party(text) to authenticated;
grant execute on function public.invite_party_member(uuid) to authenticated;
grant execute on function public.respond_party_invite(uuid, boolean) to authenticated;
grant execute on function public.select_party_region(text) to authenticated;

commit;
