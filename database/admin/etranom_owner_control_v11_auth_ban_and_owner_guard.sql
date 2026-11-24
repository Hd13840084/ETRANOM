-- ETRANOM Owner Control V11 — Auth ban lifecycle, server-side ban gates, immutable Owner identity.
-- Depends on Owner Control V1-V10 and the exact RPC/table set in V2015. Apply to STAGING first.
begin;

create or replace function public.etranom_assert_player_access_v11(p_user_id uuid default auth.uid())
returns void language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 if p_user_id is null or p_user_id <> auth.uid() then raise exception 'PLAYER_IDENTITY_MISMATCH'; end if;
 if p_user_id = 'f9531c31-8c9f-495d-baf2-d19575982f78'::uuid then return; end if;
 if exists (select 1 from public.etranom_player_bans b where b.player_id=p_user_id and b.active and (b.expires_at is null or b.expires_at>now())) then
   raise exception 'PLAYER_BANNED';
 end if;
end; $$;
revoke all on function public.etranom_assert_player_access_v11(uuid) from public,anon;
grant execute on function public.etranom_assert_player_access_v11(uuid) to authenticated;

create or replace function public.etranom_guild_create(p_name text,p_tag text,p_description text default '')
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); save_row public.game_saves%rowtype; gid uuid;
 clean_name text:=btrim(p_name); clean_tag text:=upper(regexp_replace(btrim(p_tag),'[^A-Za-z0-9]','','g'));
 policy jsonb:=public.etranom_owner_published_policy_v9('guild_config');
 fee integer:=greatest(0,least(1000000000,case when coalesce(policy->>'creation_cost','') ~ '^[0-9]{1,10}$' then (policy->>'creation_cost')::integer else 1000 end));
 current_gold numeric;
begin
 if uid is null then raise exception 'auth_required'; end if;
 perform public.etranom_assert_player_access_v11(uid);
 if coalesce(lower(policy->>'creation_enabled'),'true')='false' then raise exception 'guild_creation_disabled'; end if;
 if char_length(clean_name)<3 or char_length(clean_name)>32 then raise exception 'guild_name_length'; end if;
 if char_length(clean_tag)<2 or char_length(clean_tag)>5 then raise exception 'guild_tag_length'; end if;
 if exists(select 1 from public.guild_members where user_id=uid) then raise exception 'already_in_guild'; end if;
 select * into save_row from public.game_saves where user_id=uid for update;
 if not found then raise exception 'game_save_missing'; end if;
 current_gold:=coalesce((save_row.save_data->>'gold')::numeric,0);
 if current_gold<fee then raise exception 'guild_fee_insufficient'; end if;
 update public.game_saves set save_data=jsonb_set(save_data,'{gold}',to_jsonb(current_gold-fee),true),updated_at=now() where user_id=uid;
 insert into public.guilds(name,tag,description,leader_id) values(clean_name,clean_tag,left(coalesce(p_description,''),240),uid) returning id into gid;
 insert into public.guild_members(guild_id,user_id,role) values(gid,uid,'leader');
 return jsonb_build_object('guild_id',gid,'fee_paid',fee,'success',true);
exception when unique_violation then raise exception 'guild_name_or_tag_taken';
end $$;

create or replace function public.etranom_market_list(p_item_id text,p_quantity integer,p_unit_price bigint)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); s public.game_saves%rowtype; inv jsonb; item jsonb; have_qty integer:=0; remaining integer; listing_id uuid; active_count integer;
 policy jsonb:=public.etranom_owner_published_policy_v9('economy_rule');
begin
 if uid is null then raise exception 'auth_required'; end if;
 perform public.etranom_assert_player_access_v11(uid);
 if coalesce(lower(policy->>'trading_enabled'),'true')='false' then raise exception 'market_trading_disabled'; end if;
 if p_quantity is null or p_quantity not between 1 and 999 or p_unit_price is null or p_unit_price not between 1 and 100000000 then raise exception 'market_invalid_amount'; end if;
 if p_item_id is null or length(trim(p_item_id)) not between 1 and 100 then raise exception 'market_invalid_item'; end if;
 select * into s from public.game_saves where user_id=uid for update;
 if not found then raise exception 'game_save_missing'; end if;
 select count(*) into active_count from public.market_listings where seller_id=uid and status='active' and expires_at>now();
 if active_count>=30 then raise exception 'market_listing_limit'; end if;
 inv:=coalesce(s.save_data->'inventory','[]'::jsonb);
 if jsonb_typeof(inv)<>'array' then raise exception 'market_inventory_invalid'; end if;
 select value,greatest(1,coalesce(nullif(value->>'qty','')::integer,1)) into item,have_qty
 from jsonb_array_elements(inv) as e(value) where value->>'id'=p_item_id limit 1;
 if item is null or have_qty<p_quantity then raise exception 'market_item_unavailable'; end if;
 if lower(coalesce(item->>'bound','false'))='true' or lower(coalesce(item->>'tradeable','true'))='false' then raise exception 'market_item_not_tradeable'; end if;
 remaining:=have_qty-p_quantity;
 select coalesce(jsonb_agg(case when value->>'id'=p_item_id and remaining>0 then jsonb_set(value,'{qty}',to_jsonb(remaining),true) else value end),'[]'::jsonb)
 into inv from jsonb_array_elements(coalesce(s.save_data->'inventory','[]'::jsonb)) as e(value) where value->>'id'<>p_item_id or remaining>0;
 update public.game_saves set save_data=jsonb_set(save_data,'{inventory}',inv,true),updated_at=now() where user_id=uid;
 insert into public.market_listings(seller_id,item_id,item_snapshot,quantity,unit_price) values(uid,p_item_id,item-'qty',p_quantity,p_unit_price) returning id into listing_id;
 return jsonb_build_object('success',true,'listing_id',listing_id,'expires_in_days',14);
end $$;

create or replace function public.etranom_market_buy(p_listing_id uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); l public.market_listings%rowtype; buyer public.game_saves%rowtype; seller public.game_saves%rowtype;
 buyer_gold bigint; buyer_inv jsonb; seller_gold bigint; total bigint; fee bigint; net bigint; fee_pct numeric;
 found_item boolean:=false; policy jsonb:=public.etranom_owner_published_policy_v9('economy_rule');
begin
 if uid is null then raise exception 'auth_required'; end if;
 perform public.etranom_assert_player_access_v11(uid);
 if coalesce(lower(policy->>'trading_enabled'),'true')='false' then raise exception 'market_trading_disabled'; end if;
 select * into l from public.market_listings where id=p_listing_id for update;
 if not found or l.status<>'active' or l.expires_at<=now() then raise exception 'market_listing_unavailable'; end if;
 if l.seller_id=uid then raise exception 'market_cannot_buy_own'; end if;
 total:=l.unit_price::bigint*l.quantity::bigint;
 if total>9000000000000000 then raise exception 'market_invalid_amount'; end if;
 fee_pct:=greatest(0,least(25,case when coalesce(policy->>'market_fee_pct','') ~ '^[0-9]{1,3}([.][0-9]{1,4})?$' then (policy->>'market_fee_pct')::numeric else 0 end));
 fee:=floor(total*fee_pct/100)::bigint; net:=total-fee;
 perform 1 from public.game_saves where user_id in (uid,l.seller_id) order by user_id for update;
 select * into buyer from public.game_saves where user_id=uid;
 select * into seller from public.game_saves where user_id=l.seller_id;
 if buyer.user_id is null or seller.user_id is null then raise exception 'game_save_missing'; end if;
 buyer_gold:=coalesce(nullif(buyer.save_data->>'gold','')::bigint,0);
 if buyer_gold<total then raise exception 'market_insufficient_gold'; end if;
 buyer_inv:=coalesce(buyer.save_data->'inventory','[]'::jsonb);
 select exists(select 1 from jsonb_array_elements(buyer_inv) as e(value) where value->>'id'=l.item_id) into found_item;
 if found_item then
  select jsonb_agg(case when value->>'id'=l.item_id then jsonb_set(value,'{qty}',to_jsonb(greatest(1,coalesce(nullif(value->>'qty','')::integer,1))+l.quantity),true) else value end) into buyer_inv from jsonb_array_elements(buyer_inv) as e(value);
 else buyer_inv:=buyer_inv||jsonb_build_array(l.item_snapshot||jsonb_build_object('qty',l.quantity)); end if;
 update public.game_saves set save_data=jsonb_set(jsonb_set(save_data,'{gold}',to_jsonb(buyer_gold-total),true),'{inventory}',buyer_inv,true),updated_at=now() where user_id=uid;
 seller_gold:=coalesce(nullif(seller.save_data->>'gold','')::bigint,0);
 update public.game_saves set save_data=jsonb_set(save_data,'{gold}',to_jsonb(seller_gold+net),true),updated_at=now() where user_id=l.seller_id;
 update public.market_listings set status='sold',buyer_id=uid,sold_at=now() where id=l.id;
 insert into public.market_transactions(listing_id,seller_id,buyer_id,item_id,item_snapshot,quantity,unit_price,total_paid,transaction_type,platform_fee,seller_net)
 values(l.id,l.seller_id,uid,l.item_id,l.item_snapshot,l.quantity,l.unit_price,total,'sale',fee,net);
 return jsonb_build_object('success',true,'total_paid',total,'platform_fee',fee,'seller_net',net,'item_id',l.item_id,'quantity',l.quantity,'listing_id',l.id);
end $$;

create or replace function public.create_party(p_region_id text default null)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_user uuid:=auth.uid(); v_party uuid; policy jsonb:=public.etranom_owner_published_policy_v9('party_config');
begin
 if v_user is null then raise exception 'Authentication required'; end if;
 perform public.etranom_assert_player_access_v11(v_user);
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
 perform public.etranom_assert_player_access_v11(v_user);
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
 perform public.etranom_assert_player_access_v11(v_user);
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

create or replace function public.etranom_pvp_challenge(p_target uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); cid uuid; policy jsonb:=public.etranom_owner_published_policy_v9('pvp_config');
begin
 if uid is null then raise exception 'auth_required'; end if;
 perform public.etranom_assert_player_access_v11(uid);
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
 perform public.etranom_assert_player_access_v11(uid);
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

-- Owner identity cannot be demoted, reassigned or deleted even by role-management SQL paths.
create or replace function public.etranom_owner_role_guard_v11()
returns trigger language plpgsql set search_path='' as $$
begin
 if (tg_op='DELETE' and old.user_id='f9531c31-8c9f-495d-baf2-d19575982f78'::uuid) then raise exception 'OWNER_ROLE_IMMUTABLE'; end if;
 if (tg_op='UPDATE' and old.user_id='f9531c31-8c9f-495d-baf2-d19575982f78'::uuid) then
   if new.user_id<>old.user_id or new.role<>'owner' then raise exception 'OWNER_ROLE_IMMUTABLE'; end if;
 end if;
 if (tg_op='INSERT' and new.role='owner' and new.user_id<>'f9531c31-8c9f-495d-baf2-d19575982f78'::uuid) then raise exception 'OWNER_ID_NOT_ALLOWED'; end if;
 if tg_op='DELETE' then return old; end if;
 return new;
end; $$;
drop trigger if exists trg_etranom_owner_role_guard_v11 on public.etranom_admin_roles;
create trigger trg_etranom_owner_role_guard_v11 before insert or update or delete on public.etranom_admin_roles for each row execute function public.etranom_owner_role_guard_v11();

-- Auth access changes are performed only by the Edge Function using the service-role secret.
insert into public.etranom_admin_audit_logs(actor_id,action,target_type,target_id,details)
select auth.uid(),'owner_control_v11_migration','system','owner_security',jsonb_build_object('migration','v11','server_ban_gates',8,'owner_role_immutable',true)
where auth.uid() is not null;
commit;
