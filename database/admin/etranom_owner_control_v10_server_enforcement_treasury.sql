-- ETRANOM Owner Control V10
-- Server-side enforcement for Party/PvP and auditable platform-fee treasury.
-- Depends on V1-V9, party_bugfix_phase5.sql, pvp_leaderboards_phase6.sql,
-- and the marketplace transaction schema. Apply to STAGING first.
begin;

-- Party creation/invitation/acceptance are enforced in SECURITY DEFINER RPCs,
-- not only in the browser. The existing hard game limit remains four members.
create or replace function public.create_party(p_region_id text default null)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_user uuid:=auth.uid(); v_party uuid; policy jsonb:=public.etranom_owner_published_policy_v9('party_config');
begin
 if v_user is null then raise exception 'Authentication required'; end if;
 if coalesce(lower(policy->>'party_enabled'),'true')='false' then raise exception 'party_disabled_by_admin'; end if;
 if exists(select 1 from public.party_members where user_id=v_user) then raise exception 'Already in a party'; end if;
 if p_region_id is not null and p_region_id not in ('burnt_forest','thorn_grove','ash_hills','vardash_river','southern_plains','rootbound_ruins') then raise exception 'Invalid region'; end if;
 insert into public.parties(leader_id,region_id,status) values(v_user,p_region_id,'forming') returning id into v_party;
 insert into public.party_members(party_id,user_id,role,is_ready) values(v_party,v_user,'leader',false);
 return jsonb_build_object('success',true,'party_id',v_party);
end $$;

create or replace function public.invite_party_member(p_target_user_id uuid)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_user uuid:=auth.uid(); v_party uuid; v_leader uuid; v_status text; v_count integer; v_limit integer; v_invite uuid;
 policy jsonb:=public.etranom_owner_published_policy_v9('party_config');
begin
 if v_user is null then raise exception 'Authentication required'; end if;
 if coalesce(lower(policy->>'invites_enabled'),'true')='false' then raise exception 'party_invites_disabled_by_admin'; end if;
 select pm.party_id,p.leader_id,p.status into v_party,v_leader,v_status from public.party_members pm join public.parties p on p.id=pm.party_id where pm.user_id=v_user for update of p;
 if v_party is null then raise exception 'You are not in a party'; end if;
 if v_leader<>v_user then raise exception 'Only leader can invite'; end if;
 if v_status not in('forming','preparing') then raise exception 'Party is not accepting new members'; end if;
 if p_target_user_id is null or p_target_user_id=v_user then raise exception 'Invalid invite target'; end if;
 if not public.party_are_friends(v_user,p_target_user_id) then raise exception 'Target player is not your friend'; end if;
 v_limit:=greatest(2,least(4,case when coalesce(policy->>'max_members','') ~ '^[0-9]{1,2}$' then (policy->>'max_members')::integer else 4 end));
 select count(*) into v_count from public.party_members where party_id=v_party;
 if v_count>=v_limit then raise exception 'Party is full'; end if;
 if exists(select 1 from public.party_members where user_id=p_target_user_id) then raise exception 'Target player is already in a party'; end if;
 update public.party_invites set status='expired',responded_at=now() where party_id=v_party and receiver_id=p_target_user_id and status='pending' and expires_at<=now();
 if exists(select 1 from public.party_invites where party_id=v_party and receiver_id=p_target_user_id and status='pending' and expires_at>now()) then raise exception 'Invitation already pending'; end if;
 insert into public.party_invites(party_id,sender_id,receiver_id) values(v_party,v_user,p_target_user_id) returning id into v_invite;
 return jsonb_build_object('success',true,'invite_id',v_invite,'party_limit',v_limit);
end $$;

create or replace function public.respond_party_invite(p_invite_id uuid,p_accept boolean)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_user uuid:=auth.uid(); v_party uuid; v_status text; v_expires timestamptz; v_party_status text; v_count integer; v_limit integer;
 policy jsonb:=public.etranom_owner_published_policy_v9('party_config');
begin
 if v_user is null then raise exception 'Authentication required'; end if;
 select i.party_id,i.status,i.expires_at into v_party,v_status,v_expires from public.party_invites i where i.id=p_invite_id and i.receiver_id=v_user for update;
 if v_party is null then raise exception 'Invitation not found'; end if;
 if v_status<>'pending' then raise exception 'Invitation is no longer pending'; end if;
 if v_expires<=now() then update public.party_invites set status='expired',responded_at=now() where id=p_invite_id; return jsonb_build_object('success',false,'expired',true); end if;
 if not p_accept then update public.party_invites set status='rejected',responded_at=now() where id=p_invite_id; return jsonb_build_object('success',true,'accepted',false); end if;
 if coalesce(lower(policy->>'party_enabled'),'true')='false' or coalesce(lower(policy->>'invites_enabled'),'true')='false' then raise exception 'party_invites_disabled_by_admin'; end if;
 if exists(select 1 from public.party_members where user_id=v_user) then raise exception 'Already in a party'; end if;
 select p.status into v_party_status from public.parties p where p.id=v_party for update;
 if v_party_status not in('forming','preparing') or v_party_status is null then raise exception 'Party is no longer available'; end if;
 v_limit:=greatest(2,least(4,case when coalesce(policy->>'max_members','') ~ '^[0-9]{1,2}$' then (policy->>'max_members')::integer else 4 end));
 select count(*) into v_count from public.party_members where party_id=v_party;
 if v_count>=v_limit then raise exception 'Party is full'; end if;
 insert into public.party_members(party_id,user_id,role,is_ready) values(v_party,v_user,'member',false);
 update public.party_invites set status='accepted',responded_at=now() where id=p_invite_id;
 update public.party_invites set status='cancelled',responded_at=now() where receiver_id=v_user and status='pending' and id<>p_invite_id;
 return jsonb_build_object('success',true,'accepted',true,'party_id',v_party,'party_limit',v_limit);
end $$;

-- PvP policy is now checked in both challenge creation and acceptance RPCs.
create or replace function public.etranom_pvp_challenge(p_target uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); cid uuid; policy jsonb:=public.etranom_owner_published_policy_v9('pvp_config');
begin
 if uid is null then raise exception 'auth_required'; end if;
 if coalesce(lower(policy->>'pvp_enabled'),'true')='false' then raise exception 'pvp_disabled_by_admin'; end if;
 if p_target is null or p_target=uid then raise exception 'invalid_target'; end if;
 if not exists(select 1 from public.player_profiles where user_id=uid) or not exists(select 1 from public.player_profiles where user_id=p_target) then raise exception 'profile_missing'; end if;
 if exists(select 1 from public.pvp_challenges where status='pending' and expires_at>now() and ((challenger_id=uid and opponent_id=p_target) or (challenger_id=p_target and opponent_id=uid))) then raise exception 'challenge_exists'; end if;
 insert into public.pvp_challenges(challenger_id,opponent_id) values(uid,p_target) returning id into cid;
 return jsonb_build_object('success',true,'challenge_id',cid);
end $$;

create or replace function public.etranom_pvp_respond(p_challenge uuid,p_accept boolean)
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); c public.pvp_challenges%rowtype; pa public.player_profiles%rowtype; pb public.player_profiles%rowtype; mid uuid; winner uuid; sa integer; sb integer; policy jsonb:=public.etranom_owner_published_policy_v9('pvp_config');
begin
 if uid is null then raise exception 'auth_required'; end if;
 select * into c from public.pvp_challenges where id=p_challenge for update;
 if not found or c.opponent_id<>uid then raise exception 'challenge_not_found'; end if;
 if c.status<>'pending' or c.expires_at<=now() then raise exception 'challenge_expired'; end if;
 if not p_accept then update public.pvp_challenges set status='declined',responded_at=now() where id=c.id; return jsonb_build_object('success',true,'status','declined'); end if;
 if coalesce(lower(policy->>'pvp_enabled'),'true')='false' then raise exception 'pvp_disabled_by_admin'; end if;
 select * into pa from public.player_profiles where user_id=c.challenger_id;
 select * into pb from public.player_profiles where user_id=c.opponent_id;
 if pa.user_id is null or pb.user_id is null then raise exception 'profile_missing'; end if;
 sa:=greatest(1,coalesce(pa.player_level,1))*10+(ascii(left(coalesce(pa.player_class,'?'),1))%7);
 sb:=greatest(1,coalesce(pb.player_level,1))*10+(ascii(left(coalesce(pb.player_class,'?'),1))%7);
 winner:=case when sa>sb then c.challenger_id when sb>sa then c.opponent_id else null end;
 update public.pvp_challenges set status='accepted',responded_at=now() where id=c.id;
 insert into public.pvp_matches(challenge_id,player_a,player_b,winner_id,level_a,level_b,score_a,score_b) values(c.id,c.challenger_id,c.opponent_id,winner,pa.player_level,pb.player_level,sa,sb) returning id into mid;
 insert into public.pvp_player_stats(user_id,wins,losses,draws) values(c.challenger_id,case when winner=c.challenger_id then 1 else 0 end,case when winner=c.opponent_id then 1 else 0 end,case when winner is null then 1 else 0 end),(c.opponent_id,case when winner=c.opponent_id then 1 else 0 end,case when winner=c.challenger_id then 1 else 0 end,case when winner is null then 1 else 0 end)
 on conflict(user_id) do update set wins=pvp_player_stats.wins+excluded.wins,losses=pvp_player_stats.losses+excluded.losses,draws=pvp_player_stats.draws+excluded.draws,updated_at=now();
 return jsonb_build_object('success',true,'match_id',mid,'winner_id',winner,'score_a',sa,'score_b',sb,'note','نتیجه نسخه فعلی بر اساس سطح و کلاس و سمت سرور محاسبه شد؛ این هنوز نبرد نوبتی کامل نیست.');
end $$;

-- Platform treasury: every inserted marketplace transaction contributes its fee
-- exactly once in the same database transaction. The ledger is append-only for clients.
create table if not exists public.etranom_platform_treasury (
 id smallint primary key check(id=1), balance bigint not null default 0 check(balance>=0), updated_at timestamptz not null default now()
);
insert into public.etranom_platform_treasury(id,balance) values(1,0) on conflict(id) do nothing;
create table if not exists public.etranom_platform_treasury_ledger (
 id bigint generated always as identity primary key,
 market_transaction_id uuid not null unique references public.market_transactions(id) on delete restrict,
 fee_amount bigint not null check(fee_amount>=0), created_at timestamptz not null default now()
);
alter table public.etranom_platform_treasury enable row level security;
alter table public.etranom_platform_treasury_ledger enable row level security;
revoke all on public.etranom_platform_treasury,public.etranom_platform_treasury_ledger from public,anon,authenticated;

create or replace function public.etranom_platform_treasury_collect_v10()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if coalesce(new.platform_fee,0)>0 then
  insert into public.etranom_platform_treasury_ledger(market_transaction_id,fee_amount) values(new.id,new.platform_fee)
  on conflict(market_transaction_id) do nothing;
  if found then update public.etranom_platform_treasury set balance=balance+new.platform_fee,updated_at=now() where id=1; end if;
 end if;
 return new;
end $$;
drop trigger if exists trg_etranom_platform_treasury_collect_v10 on public.market_transactions;
create trigger trg_etranom_platform_treasury_collect_v10 after insert on public.market_transactions for each row execute function public.etranom_platform_treasury_collect_v10();

create or replace function public.etranom_admin_treasury_snapshot_v10()
returns jsonb language plpgsql security definer set search_path='' as $$
declare bal bigint; tx_count bigint; fees bigint;
begin
 if not public.etranom_admin_is_authorized_v1('economy') then raise exception 'admin_forbidden'; end if;
 select balance into bal from public.etranom_platform_treasury where id=1;
 select count(*),coalesce(sum(fee_amount),0) into tx_count,fees from public.etranom_platform_treasury_ledger;
 return jsonb_build_object('balance',coalesce(bal,0),'fee_transactions',tx_count,'total_collected',fees);
end $$;

revoke all on function public.create_party(text),public.invite_party_member(uuid),public.respond_party_invite(uuid,boolean),public.etranom_pvp_challenge(uuid),public.etranom_pvp_respond(uuid,boolean),public.etranom_platform_treasury_collect_v10(),public.etranom_admin_treasury_snapshot_v10() from public,anon;
grant execute on function public.create_party(text),public.invite_party_member(uuid),public.respond_party_invite(uuid,boolean),public.etranom_pvp_challenge(uuid),public.etranom_pvp_respond(uuid,boolean) to authenticated;
grant execute on function public.etranom_admin_treasury_snapshot_v10() to authenticated;
commit;
