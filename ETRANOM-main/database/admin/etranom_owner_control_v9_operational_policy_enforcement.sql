-- ETRANOM Owner Control V9 — operational policy enforcement
-- Depends on Owner Control V1-V8 and marketplace_phase5_parts/02_marketplace_transactions_and_secure_operations.sql
-- Run on STAGING first. Default policies preserve current behavior.
begin;

create or replace function public.etranom_owner_published_policy_v9(p_type text)
returns jsonb
language plpgsql
stable
security definer
set search_path=''
as $$
declare result jsonb;
begin
  if p_type not in ('economy_rule','guild_config','party_config','pvp_config','progression_rule','ban_policy','world_event','world_setting','class_balance') then
    raise exception 'INVALID_POLICY_TYPE';
  end if;
  select c.payload into result
  from public.etranom_admin_content c
  where c.content_type=p_type and c.status='published'
    and coalesce(lower(c.payload->>'enabled'),'true')<>'false'
  order by case when c.content_id='default' or coalesce((c.payload->>'is_default')::boolean,false) then 0 else 1 end,
           c.updated_at desc
  limit 1;
  return coalesce(result,'{}'::jsonb);
end;
$$;
revoke all on function public.etranom_owner_published_policy_v9(text) from public,anon,authenticated;

-- Guild creation fee is now read on the server from the published Owner policy.
create or replace function public.etranom_guild_create(p_name text,p_tag text,p_description text default '')
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); save_row public.game_saves%rowtype; gid uuid;
 clean_name text:=btrim(p_name); clean_tag text:=upper(regexp_replace(btrim(p_tag),'[^A-Za-z0-9]','','g'));
 policy jsonb:=public.etranom_owner_published_policy_v9('guild_config');
 fee integer:=greatest(0,least(1000000000,case when coalesce(policy->>'creation_cost','') ~ '^[0-9]{1,10}$' then (policy->>'creation_cost')::integer else 1000 end));
 current_gold numeric;
begin
 if uid is null then raise exception 'auth_required'; end if;
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

-- Keep fee columns explicit and auditable; zero fee preserves the old marketplace behavior.
alter table public.market_transactions add column if not exists platform_fee bigint not null default 0 check (platform_fee>=0);
alter table public.market_transactions add column if not exists seller_net bigint not null default 0 check (seller_net>=0);

create or replace function public.etranom_market_list(p_item_id text,p_quantity integer,p_unit_price bigint)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); s public.game_saves%rowtype; inv jsonb; item jsonb; have_qty integer:=0; remaining integer; listing_id uuid; active_count integer;
 policy jsonb:=public.etranom_owner_published_policy_v9('economy_rule');
begin
 if uid is null then raise exception 'auth_required'; end if;
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

revoke all on function public.etranom_guild_create(text,text,text),public.etranom_market_list(text,integer,bigint),public.etranom_market_buy(uuid) from public,anon;
grant execute on function public.etranom_guild_create(text,text,text),public.etranom_market_list(text,integer,bigint),public.etranom_market_buy(uuid) to authenticated;
commit;
