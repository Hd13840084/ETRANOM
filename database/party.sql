-- =========================================================
-- ETRANOM PARTY SYSTEM
-- Version: 1.0
-- Database: Supabase / PostgreSQL
-- =========================================================

begin;

-- =========================================================
-- 1. TABLES
-- =========================================================

create table if not exists public.parties (
    id uuid primary key default gen_random_uuid(),

    leader_id uuid not null references auth.users(id)
        on delete cascade,

    region_id text,

    status text not null default 'forming'
        check (status in (
            'forming',
            'preparing',
            'active',
            'completed',
            'disbanded'
        )),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


create table if not exists public.party_members (
    id uuid primary key default gen_random_uuid(),

    party_id uuid not null references public.parties(id)
        on delete cascade,

    user_id uuid not null references auth.users(id)
        on delete cascade,

    role text not null default 'member'
        check (role in ('leader', 'member')),

    is_ready boolean not null default false,

    joined_at timestamptz not null default now(),

    unique (party_id, user_id),

    unique (user_id)
);


create table if not exists public.party_invites (
    id uuid primary key default gen_random_uuid(),

    party_id uuid not null references public.parties(id)
        on delete cascade,

    sender_id uuid not null references auth.users(id)
        on delete cascade,

    receiver_id uuid not null references auth.users(id)
        on delete cascade,

    status text not null default 'pending'
        check (status in (
            'pending',
            'accepted',
            'rejected',
            'cancelled',
            'expired'
        )),

    created_at timestamptz not null default now(),

    expires_at timestamptz not null
        default (now() + interval '2 minutes'),

    responded_at timestamptz,

    check (sender_id <> receiver_id)
);


create table if not exists public.party_sessions (
    id uuid primary key default gen_random_uuid(),

    party_id uuid not null references public.parties(id)
        on delete cascade,

    region_id text not null,

    status text not null default 'preparing'
        check (status in (
            'preparing',
            'active',
            'completed',
            'cancelled'
        )),

    started_at timestamptz,
    finished_at timestamptz,

    created_at timestamptz not null default now()
);


-- =========================================================
-- 2. INDEXES
-- =========================================================

create index if not exists idx_party_members_party
on public.party_members(party_id);

create index if not exists idx_party_members_user
on public.party_members(user_id);

create index if not exists idx_party_invites_receiver
on public.party_invites(receiver_id, status);

create index if not exists idx_party_invites_sender
on public.party_invites(sender_id, status);

create index if not exists idx_party_sessions_party
on public.party_sessions(party_id);


-- =========================================================
-- 3. RLS
-- Direct table access is disabled.
-- Access is provided through controlled RPC functions.
-- =========================================================

alter table public.parties enable row level security;
alter table public.party_members enable row level security;
alter table public.party_invites enable row level security;
alter table public.party_sessions enable row level security;

revoke all on public.parties from anon, authenticated;
revoke all on public.party_members from anon, authenticated;
revoke all on public.party_invites from anon, authenticated;
revoke all on public.party_sessions from anon, authenticated;


-- =========================================================
-- 4. HELPER: CHECK FRIENDSHIP
-- Uses the existing friendships table.
-- =========================================================

create or replace function public.party_are_friends(
    p_user_a uuid,
    p_user_b uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.friendships f
        where f.user_low = least(p_user_a, p_user_b)
          and f.user_high = greatest(p_user_a, p_user_b)
    );
$$;


-- =========================================================
-- 5. CREATE PARTY
-- =========================================================

create or replace function public.create_party()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user uuid := auth.uid();
    v_party uuid;
begin
    if v_user is null then
        raise exception 'Authentication required';
    end if;

    if exists (
        select 1
        from public.party_members
        where user_id = v_user
    ) then
        raise exception 'Already in a party';
    end if;

    insert into public.parties (leader_id)
    values (v_user)
    returning id into v_party;

    insert into public.party_members (
        party_id,
        user_id,
        role
    )
    values (
        v_party,
        v_user,
        'leader'
    );

    return jsonb_build_object(
        'success', true,
        'party_id', v_party
    );
end;
$$;


-- =========================================================
-- 6. GET MY PARTY
-- =========================================================

create or replace function public.get_my_party()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user uuid := auth.uid();
    v_party uuid;
    v_result jsonb;
begin
    if v_user is null then
        raise exception 'Authentication required';
    end if;

    select party_id
    into v_party
    from public.party_members
    where user_id = v_user;

    if v_party is null then
        return null;
    end if;

    select jsonb_build_object(
        'id', p.id,
        'leader_id', p.leader_id,
        'region_id', p.region_id,
        'status', p.status,
        'members', (
            select jsonb_agg(
                jsonb_build_object(
                    'user_id', m.user_id,
                    'role', m.role,
                    'is_ready', m.is_ready,
                    'joined_at', m.joined_at,
                    'username', pr.username,
                    'display_name', pr.display_name,
                    'player_level', pr.player_level,
                    'player_class', pr.player_class
                )
                order by m.joined_at
            )
            from public.party_members m
            left join public.player_profiles pr
                on pr.user_id = m.user_id
            where m.party_id = p.id
        )
    )
    into v_result
    from public.parties p
    where p.id = v_party;

    return v_result;
end;
$$;


-- =========================================================
-- 7. INVITE FRIEND
-- =========================================================

create or replace function public.invite_party_member(
    p_target_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user uuid := auth.uid();
    v_party uuid;
    v_leader uuid;
    v_count integer;
    v_invite uuid;
begin
    if v_user is null then
        raise exception 'Authentication required';
    end if;

    select pm.party_id, p.leader_id
    into v_party, v_leader
    from public.party_members pm
    join public.parties p on p.id = pm.party_id
    where pm.user_id = v_user
    for update of p;

    if v_party is null then
        raise exception 'You are not in a party';
    end if;

    if v_leader <> v_user then
        raise exception 'Only leader can invite';
    end if;

    if p_target_user_id = v_user then
        raise exception 'Cannot invite yourself';
    end if;

    if not public.party_are_friends(v_user, p_target_user_id) then
        raise exception 'Target player is not your friend';
    end if;

    select count(*)
    into v_count
    from public.party_members
    where party_id = v_party;

    if v_count >= 4 then
        raise exception 'Party is full';
    end if;

    if exists (
        select 1
        from public.party_members
        where user_id = p_target_user_id
    ) then
        raise exception 'Target player is already in a party';
    end if;

    if exists (
        select 1
        from public.party_invites
        where party_id = v_party
          and receiver_id = p_target_user_id
          and status = 'pending'
          and expires_at > now()
    ) then
        raise exception 'Invitation already pending';
    end if;

    insert into public.party_invites (
        party_id,
        sender_id,
        receiver_id
    )
    values (
        v_party,
        v_user,
        p_target_user_id
    )
    returning id into v_invite;

    return jsonb_build_object(
        'success', true,
        'invite_id', v_invite
    );
end;
$$;


-- =========================================================
-- 8. RESPOND TO INVITATION
-- p_accept = true / false
-- =========================================================

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
    v_count integer;
    v_leader uuid;
begin
    if v_user is null then
        raise exception 'Authentication required';
    end if;

    select party_id, status
    into v_party, v_status
    from public.party_invites
    where id = p_invite_id
      and receiver_id = v_user
    for update;

    if v_party is null then
        raise exception 'Invitation not found';
    end if;

    if v_status <> 'pending' then
        raise exception 'Invitation is no longer pending';
    end if;

    if exists (
        select 1
        from public.party_invites
        where id = p_invite_id
          and expires_at <= now()
    ) then
        update public.party_invites
        set status = 'expired',
            responded_at = now()
        where id = p_invite_id;

        raise exception 'Invitation expired';
    end if;

    if not p_accept then
        update public.party_invites
        set status = 'rejected',
            responded_at = now()
        where id = p_invite_id;

        return jsonb_build_object('success', true);
    end if;

    if exists (
        select 1
        from public.party_members
        where user_id = v_user
    ) then
        raise exception 'Already in a party';
    end if;

    select leader_id
    into v_leader
    from public.parties
    where id = v_party
      and status = 'forming'
    for update;

    if v_leader is null then
        raise exception 'Party is no longer available';
    end if;

    select count(*)
    into v_count
    from public.party_members
    where party_id = v_party;

    if v_count >= 4 then
        raise exception 'Party is full';
    end if;

    insert into public.party_members (
        party_id,
        user_id,
        role
    )
    values (
        v_party,
        v_user,
        'member'
    );

    update public.party_invites
    set status = 'accepted',
        responded_at = now()
    where id = p_invite_id;

    update public.party_invites
    set status = 'cancelled',
        responded_at = now()
    where receiver_id = v_user
      and status = 'pending'
      and id <> p_invite_id;

    return jsonb_build_object(
        'success', true,
        'party_id', v_party
    );
end;
$$;


-- =========================================================
-- 9. SET READY
-- =========================================================

create or replace function public.set_party_ready(
    p_ready boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user uuid := auth.uid();
    v_party uuid;
begin
    if v_user is null then
        raise exception 'Authentication required';
    end if;

    select party_id
    into v_party
    from public.party_members
    where user_id = v_user;

    if v_party is null then
        raise exception 'Not in a party';
    end if;

    update public.party_members
    set is_ready = p_ready
    where party_id = v_party
      and user_id = v_user;

    return jsonb_build_object(
        'success', true,
        'ready', p_ready
    );
end;
$$;


-- =========================================================
-- 10. TRANSFER LEADERSHIP
-- =========================================================

create or replace function public.transfer_party_leadership(
    p_target_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user uuid := auth.uid();
    v_party uuid;
begin
    if v_user is null then
        raise exception 'Authentication required';
    end if;

    select party_id
    into v_party
    from public.party_members
    where user_id = v_user
    for update;

    if v_party is null then
        raise exception 'Not in a party';
    end if;

    if not exists (
        select 1
        from public.parties
        where id = v_party
          and leader_id = v_user
    ) then
        raise exception 'Only leader can transfer leadership';
    end if;

    if not exists (
        select 1
        from public.party_members
        where party_id = v_party
          and user_id = p_target_user_id
    ) then
        raise exception 'Target is not a party member';
    end if;

    update public.party_members
    set role = 'member'
    where party_id = v_party;

    update public.party_members
    set role = 'leader',
        is_ready = false
    where party_id = v_party
      and user_id = p_target_user_id;

    update public.parties
    set leader_id = p_target_user_id,
        updated_at = now()
    where id = v_party;

    return jsonb_build_object('success', true);
end;
$$;


-- =========================================================
-- 11. KICK MEMBER
-- =========================================================

create or replace function public.kick_party_member(
    p_target_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user uuid := auth.uid();
    v_party uuid;
begin
    if v_user is null then
        raise exception 'Authentication required';
    end if;

    select party_id
    into v_party
    from public.party_members
    where user_id = v_user;

    if v_party is null then
        raise exception 'Not in a party';
    end if;

    if not exists (
        select 1
        from public.parties
        where id = v_party
          and leader_id = v_user
    ) then
        raise exception 'Only leader can kick members';
    end if;

    if p_target_user_id = v_user then
        raise exception 'Leader cannot kick themselves';
    end if;

    delete from public.party_members
    where party_id = v_party
      and user_id = p_target_user_id;

    if not found then
        raise exception 'Target is not a party member';
    end if;

    return jsonb_build_object('success', true);
end;
$$;


-- =========================================================
-- 12. LEAVE PARTY
-- =========================================================

create or replace function public.leave_party()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user uuid := auth.uid();
    v_party uuid;
    v_new_leader uuid;
begin
    if v_user is null then
        raise exception 'Authentication required';
    end if;

    select party_id
    into v_party
    from public.party_members
    where user_id = v_user;

    if v_party is null then
        raise exception 'Not in a party';
    end if;

    delete from public.party_members
    where party_id = v_party
      and user_id = v_user;

    select user_id
    into v_new_leader
    from public.party_members
    where party_id = v_party
    order by joined_at
    limit 1;

    if v_new_leader is null then
        update public.parties
        set status = 'disbanded',
            updated_at = now()
        where id = v_party;
    else
        update public.parties
        set leader_id = v_new_leader,
            updated_at = now()
        where id = v_party;

        update public.party_members
        set role = case
            when user_id = v_new_leader then 'leader'
            else 'member'
        end
        where party_id = v_party;
    end if;

    return jsonb_build_object('success', true);
end;
$$;


-- =========================================================
-- 13. DISBAND PARTY
-- =========================================================

create or replace function public.disband_party()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user uuid := auth.uid();
    v_party uuid;
begin
    if v_user is null then
        raise exception 'Authentication required';
    end if;

    select id
    into v_party
    from public.parties
    where leader_id = v_user
      and status in ('forming', 'preparing');

    if v_party is null then
        raise exception 'No party to disband';
    end if;

    update public.parties
    set status = 'disbanded',
        updated_at = now()
    where id = v_party;

    delete from public.party_members
    where party_id = v_party;

    return jsonb_build_object('success', true);
end;
$$;


-- =========================================================
-- 14. CANCEL INVITATION
-- =========================================================

create or replace function public.cancel_party_invite(
    p_invite_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user uuid := auth.uid();
begin
    if v_user is null then
        raise exception 'Authentication required';
    end if;

    update public.party_invites
    set status = 'cancelled',
        responded_at = now()
    where id = p_invite_id
      and sender_id = v_user
      and status = 'pending';

    if not found then
        raise exception 'Invitation not found or not cancellable';
    end if;

    return jsonb_build_object('success', true);
end;
$$;


-- =========================================================
-- 15. GET RECEIVED INVITATIONS
-- =========================================================

create or replace function public.get_party_invites()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user uuid := auth.uid();
    v_result jsonb;
begin
    if v_user is null then
        raise exception 'Authentication required';
    end if;

    select coalesce(
        jsonb_agg(
            jsonb_build_object(
                'id', i.id,
                'party_id', i.party_id,
                'sender_id', i.sender_id,
                'sender_name', pr.display_name,
                'sender_username', pr.username,
                'created_at', i.created_at,
                'expires_at', i.expires_at
            )
        ),
        '[]'::jsonb
    )
    into v_result
    from public.party_invites i
    left join public.player_profiles pr
        on pr.user_id = i.sender_id
    where i.receiver_id = v_user
      and i.status = 'pending'
      and i.expires_at > now();

    return v_result;
end;
$$;


-- =========================================================
-- 16. GET SENT INVITATIONS
-- =========================================================

create or replace function public.get_sent_party_invites()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user uuid := auth.uid();
    v_result jsonb;
begin
    if v_user is null then
        raise exception 'Authentication required';
    end if;

    select coalesce(
        jsonb_agg(
            jsonb_build_object(
                'id', i.id,
                'party_id', i.party_id,
                'receiver_id', i.receiver_id,
                'receiver_name', pr.display_name,
                'status', i.status,
                'created_at', i.created_at,
                'expires_at', i.expires_at
            )
        ),
        '[]'::jsonb
    )
    into v_result
    from public.party_invites i
    left join public.player_profiles pr
        on pr.user_id = i.receiver_id
    where i.sender_id = v_user
      and i.status = 'pending'
      and i.expires_at > now();

    return v_result;
end;
$$;


-- =========================================================
-- 17. SELECT REGION
-- =========================================================

create or replace function public.select_party_region(
    p_region_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user uuid := auth.uid();
    v_party uuid;
begin
    if v_user is null then
        raise exception 'Authentication required';
    end if;

    if p_region_id not in (
        'burnt_forest',
        'thornbush_grove',
        'ash_hills',
        'verdash_river',
        'southern_plains'
    ) then
        raise exception 'Invalid region';
    end if;

    select id
    into v_party
    from public.parties
    where leader_id = v_user
      and status = 'forming'
    for update;

    if v_party is null then
        raise exception 'Only party leader can select region';
    end if;

    update public.parties
    set region_id = p_region_id,
        status = 'preparing',
        updated_at = now()
    where id = v_party;

    update public.party_members
    set is_ready = false
    where party_id = v_party;

    return jsonb_build_object(
        'success', true,
        'region_id', p_region_id
    );
end;
$$;


-- =========================================================
-- 18. START PARTY SESSION
-- =========================================================

create or replace function public.start_party_session()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user uuid := auth.uid();
    v_party uuid;
    v_region text;
    v_count integer;
    v_ready integer;
    v_session uuid;
begin
    if v_user is null then
        raise exception 'Authentication required';
    end if;

    select id, region_id
    into v_party, v_region
    from public.parties
    where leader_id = v_user
      and status = 'preparing'
    for update;

    if v_party is null then
        raise exception 'Party is not ready to start';
    end if;

    if v_region is null then
        raise exception 'No region selected';
    end if;

    select count(*),
           count(*) filter (where is_ready = true)
    into v_count, v_ready
    from public.party_members
    where party_id = v_party;

    if v_count < 2 then
        raise exception 'At least two members required';
    end if;

    if v_ready <> v_count then
        raise exception 'All members must be ready';
    end if;

    insert into public.party_sessions (
        party_id,
        region_id,
        status,
        started_at
    )
    values (
        v_party,
        v_region,
        'active',
        now()
    )
    returning id into v_session;

    update public.parties
    set status = 'active',
        updated_at = now()
    where id = v_party;

    return jsonb_build_object(
        'success', true,
        'session_id', v_session,
        'region_id', v_region
    );
end;
$$;


-- =========================================================
-- 19. GET MY PARTY SESSION
-- =========================================================

create or replace function public.get_my_party_session()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user uuid := auth.uid();
    v_party uuid;
    v_result jsonb;
begin
    if v_user is null then
        raise exception 'Authentication required';
    end if;

    select party_id
    into v_party
    from public.party_members
    where user_id = v_user;

    if v_party is null then
        return null;
    end if;

    select jsonb_build_object(
        'id', s.id,
        'party_id', s.party_id,
        'region_id', s.region_id,
        'status', s.status,
        'started_at', s.started_at
    )
    into v_result
    from public.party_sessions s
    where s.party_id = v_party
      and s.status in ('preparing', 'active')
    order by s.created_at desc
    limit 1;

    return v_result;
end;
$$;


-- =========================================================
-- 20. FINISH PARTY SESSION
-- No rewards are granted by this function.
-- Combat rewards must be validated server-side separately.
-- =========================================================

create or replace function public.finish_party_session(
    p_result text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user uuid := auth.uid();
    v_party uuid;
    v_session uuid;
begin
    if v_user is null then
        raise exception 'Authentication required';
    end if;

    select p.id
    into v_party
    from public.parties p
    where p.leader_id = v_user
      and p.status = 'active'
    for update;

    if v_party is null then
        raise exception 'Active party not found';
    end if;

    if p_result not in ('completed', 'cancelled') then
        raise exception 'Invalid session result';
    end if;

    select id
    into v_session
    from public.party_sessions
    where party_id = v_party
      and status = 'active'
    order by created_at desc
    limit 1
    for update;

    if v_session is null then
        raise exception 'Active session not found';
    end if;

    update public.party_sessions
    set status = p_result,
        finished_at = now()
    where id = v_session;

    update public.parties
    set status = 'forming',
        region_id = null,
        updated_at = now()
    where id = v_party;

    update public.party_members
    set is_ready = false
    where party_id = v_party;

    return jsonb_build_object(
        'success', true,
        'session_id', v_session,
        'status', p_result
    );
end;
$$;


-- =========================================================
-- 21. FUNCTION PERMISSIONS
-- =========================================================

revoke all on function public.party_are_friends(uuid, uuid)
from public, anon, authenticated;

revoke all on function public.create_party()
from public, anon;

revoke all on function public.get_my_party()
from public, anon;

revoke all on function public.invite_party_member(uuid)
from public, anon;

revoke all on function public.respond_party_invite(uuid, boolean)
from public, anon;

revoke all on function public.set_party_ready(boolean)
from public, anon;

revoke all on function public.transfer_party_leadership(uuid)
from public, anon;

revoke all on function public.kick_party_member(uuid)
from public, anon;

revoke all on function public.leave_party()
from public, anon;

revoke all on function public.disband_party()
from public, anon;

revoke all on function public.cancel_party_invite(uuid)
from public, anon;

revoke all on function public.get_party_invites()
from public, anon;

revoke all on function public.get_sent_party_invites()
from public, anon;

revoke all on function public.select_party_region(text)
from public, anon;

revoke all on function public.start_party_session()
from public, anon;

revoke all on function public.get_my_party_session()
from public, anon;

revoke all on function public.finish_party_session(text)
from public, anon;


grant execute on function public.create_party()
to authenticated;

grant execute on function public.get_my_party()
to authenticated;

grant execute on function public.invite_party_member(uuid)
to authenticated;

grant execute on function public.respond_party_invite(uuid, boolean)
to authenticated;

grant execute on function public.set_party_ready(boolean)
to authenticated;

grant execute on function public.transfer_party_leadership(uuid)
to authenticated;

grant execute on function public.kick_party_member(uuid)
to authenticated;

grant execute on function public.leave_party()
to authenticated;

grant execute on function public.disband_party()
to authenticated;

grant execute on function public.cancel_party_invite(uuid)
to authenticated;

grant execute on function public.get_party_invites()
to authenticated;

grant execute on function public.get_sent_party_invites()
to authenticated;

grant execute on function public.select_party_region(text)
to authenticated;

grant execute on function public.start_party_session()
to authenticated;

grant execute on function public.get_my_party_session()
to authenticated;

grant execute on function public.finish_party_session(text)
to authenticated;


commit;

-- =========================================================
-- END OF ETRANOM PARTY SQL
-- =========================================================
