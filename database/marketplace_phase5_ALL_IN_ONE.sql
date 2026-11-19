-- ETRANOM Phase 5: player-to-player marketplace (transactional escrow)
-- Run after game_saves_setup.sql and the existing player_profiles setup.
create table if not exists public.market_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  item_snapshot jsonb not null,
  quantity integer not null check(quantity between 1 and 999),
  unit_price bigint not null check(unit_price between 1 and 100000000),
  status text not null default 'active' check(status in ('active','sold','cancelled','expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '14 days',
  buyer_id uuid references auth.users(id),
  sold_at timestamptz
);
create index if not exists market_listings_active_idx on public.market_listings(created_at desc) where status='active';
create index if not exists market_listings_seller_idx on public.market_listings(seller_id,status,created_at desc);
alter table public.market_listings enable row level security;
drop policy if exists market_listings_public_active_read on public.market_listings;
create policy market_listings_public_active_read on public.market_listings for select to authenticated using(status='active' and expires_at>now() or seller_id=auth.uid());
revoke all on public.market_listings from anon,authenticated;
grant select on public.market_listings to authenticated;

create or replace function public.etranom_market_list(p_item_id text,p_quantity integer,p_unit_price bigint)
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); s public.game_saves%rowtype; inv jsonb; item jsonb; have_qty integer:=0; remaining integer; listing_id uuid;
begin
 if uid is null then raise exception 'auth_required'; end if;
 if p_quantity not between 1 and 999 or p_unit_price not between 1 and 100000000 then raise exception 'market_invalid_amount'; end if;
 if p_item_id is null or length(p_item_id)>100 then raise exception 'market_invalid_item'; end if;
 select * into s from public.game_saves where user_id=uid for update;
 if not found then raise exception 'game_save_missing'; end if;
 inv:=coalesce(s.save_data->'inventory','[]'::jsonb);
 select value,coalesce((value->>'qty')::integer,1) into item,have_qty from jsonb_array_elements(inv) as e(value) where value->>'id'=p_item_id limit 1;
 if item is null or have_qty<p_quantity then raise exception 'market_item_unavailable'; end if;
 if coalesce(item->>'bound','false')='true' or coalesce(item->>'tradeable','true')='false' then raise exception 'market_item_not_tradeable'; end if;
 remaining:=have_qty-p_quantity;
 select coalesce(jsonb_agg(case when value->>'id'=p_item_id and remaining>0 then jsonb_set(value,'{qty}',to_jsonb(remaining),true) else value end),'[]'::jsonb)
 into inv from jsonb_array_elements(coalesce(s.save_data->'inventory','[]'::jsonb)) as e(value) where value->>'id'<>p_item_id or remaining>0;
 update public.game_saves set save_data=jsonb_set(save_data,'{inventory}',inv,true),updated_at=now() where user_id=uid;
 insert into public.market_listings(seller_id,item_id,item_snapshot,quantity,unit_price)
 values(uid,p_item_id,item-'qty',p_quantity,p_unit_price) returning id into listing_id;
 return jsonb_build_object('success',true,'listing_id',listing_id);
end $$;

create or replace function public.etranom_market_buy(p_listing_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); l public.market_listings%rowtype; buyer public.game_saves%rowtype; seller public.game_saves%rowtype; buyer_gold bigint; buyer_inv jsonb; seller_gold bigint; item jsonb; found_item boolean:=false;
begin
 if uid is null then raise exception 'auth_required'; end if;
 select * into l from public.market_listings where id=p_listing_id for update;
 if not found or l.status<>'active' or l.expires_at<=now() then raise exception 'market_listing_unavailable'; end if;
 if l.seller_id=uid then raise exception 'market_cannot_buy_own'; end if;
 -- Lock both saves in deterministic order to avoid deadlocks.
 perform 1 from public.game_saves where user_id in (uid,l.seller_id) order by user_id for update;
 select * into buyer from public.game_saves where user_id=uid;
 select * into seller from public.game_saves where user_id=l.seller_id;
 if buyer.user_id is null or seller.user_id is null then raise exception 'game_save_missing'; end if;
 buyer_gold:=coalesce((buyer.save_data->>'gold')::bigint,0);
 if buyer_gold < l.unit_price*l.quantity then raise exception 'market_insufficient_gold'; end if;
 buyer_inv:=coalesce(buyer.save_data->'inventory','[]'::jsonb);
 select exists(select 1 from jsonb_array_elements(buyer_inv) as e(value) where value->>'id'=l.item_id) into found_item;
 if found_item then
  select jsonb_agg(case when value->>'id'=l.item_id then jsonb_set(value,'{qty}',to_jsonb(coalesce((value->>'qty')::integer,1)+l.quantity),true) else value end) into buyer_inv from jsonb_array_elements(buyer_inv) as e(value);
 else
  buyer_inv:=buyer_inv||jsonb_build_array(l.item_snapshot||jsonb_build_object('qty',l.quantity));
 end if;
 update public.game_saves set save_data=jsonb_set(jsonb_set(save_data,'{gold}',to_jsonb(buyer_gold-l.unit_price*l.quantity),true),'{inventory}',buyer_inv,true),updated_at=now() where user_id=uid;
 seller_gold:=coalesce((seller.save_data->>'gold')::bigint,0);
 update public.game_saves set save_data=jsonb_set(save_data,'{gold}',to_jsonb(seller_gold+l.unit_price*l.quantity),true),updated_at=now() where user_id=l.seller_id;
 update public.market_listings set status='sold',buyer_id=uid,sold_at=now() where id=l.id;
 return jsonb_build_object('success',true,'total_paid',l.unit_price*l.quantity,'item_id',l.item_id,'quantity',l.quantity);
end $$;

create or replace function public.etranom_market_cancel(p_listing_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); l public.market_listings%rowtype; s public.game_saves%rowtype; inv jsonb; found_item boolean;
begin
 if uid is null then raise exception 'auth_required'; end if;
 select * into l from public.market_listings where id=p_listing_id for update;
 if not found or l.seller_id<>uid or l.status<>'active' then raise exception 'market_listing_unavailable'; end if;
 select * into s from public.game_saves where user_id=uid for update;
 if not found then raise exception 'game_save_missing'; end if;
 inv:=coalesce(s.save_data->'inventory','[]'::jsonb);
 select exists(select 1 from jsonb_array_elements(inv) as e(value) where value->>'id'=l.item_id) into found_item;
 if found_item then
  select jsonb_agg(case when value->>'id'=l.item_id then jsonb_set(value,'{qty}',to_jsonb(coalesce((value->>'qty')::integer,1)+l.quantity),true) else value end) into inv from jsonb_array_elements(inv) as e(value);
 else inv:=inv||jsonb_build_array(l.item_snapshot||jsonb_build_object('qty',l.quantity)); end if;
 update public.game_saves set save_data=jsonb_set(save_data,'{inventory}',inv,true),updated_at=now() where user_id=uid;
 update public.market_listings set status='cancelled' where id=l.id;
 return jsonb_build_object('success',true);
end $$;

create or replace function public.etranom_market_expire()
returns integer language plpgsql security definer set search_path=public as $$
declare n integer;
begin
 update public.market_listings set status='expired' where status='active' and expires_at<=now();
 get diagnostics n=row_count;
 return n;
end $$;
revoke all on function public.etranom_market_list(text,integer,bigint),public.etranom_market_buy(uuid),public.etranom_market_cancel(uuid),public.etranom_market_expire() from public,anon;
grant execute on function public.etranom_market_list(text,integer,bigint),public.etranom_market_buy(uuid),public.etranom_market_cancel(uuid) to authenticated;

create or replace function public.etranom_market_snapshot(p_mine boolean default false)
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); result jsonb;
begin
 if uid is null then raise exception 'auth_required'; end if;
 select coalesce(jsonb_agg(jsonb_build_object(
  'id',l.id,'seller_id',l.seller_id,'seller_name',coalesce(p.display_name,p.username,'بازیکن بازار'),
  'item_id',l.item_id,'item_snapshot',l.item_snapshot,'quantity',l.quantity,'unit_price',l.unit_price,
  'status',l.status,'created_at',l.created_at,'expires_at',l.expires_at
 ) order by l.created_at desc),'[]'::jsonb) into result
 from public.market_listings l left join public.player_profiles p on p.user_id=l.seller_id
 where (p_mine and l.seller_id=uid and l.status='active') or (not p_mine and l.status='active' and l.expires_at>now() and l.seller_id<>uid);
 return result;
end $$;
revoke all on function public.etranom_market_snapshot(boolean) from public,anon;
grant execute on function public.etranom_market_snapshot(boolean) to authenticated;
-- ETRANOM Phase 5 completion migration
-- Run AFTER marketplace_phase5.sql. Safe to re-run.

create table if not exists public.market_transactions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null,
  seller_id uuid not null references auth.users(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  item_snapshot jsonb not null,
  quantity integer not null check (quantity between 1 and 999),
  unit_price bigint not null check (unit_price > 0),
  total_paid bigint not null check (total_paid >= 0),
  transaction_type text not null check (transaction_type in ('sale','expiry_return','cancel_return')),
  created_at timestamptz not null default now()
);
create index if not exists market_transactions_buyer_idx on public.market_transactions(buyer_id,created_at desc);
create index if not exists market_transactions_seller_idx on public.market_transactions(seller_id,created_at desc);
alter table public.market_transactions enable row level security;
drop policy if exists market_transactions_own_read on public.market_transactions;
create policy market_transactions_own_read on public.market_transactions for select to authenticated using (buyer_id=auth.uid() or seller_id=auth.uid());
revoke all on public.market_transactions from anon,authenticated;
grant select on public.market_transactions to authenticated;

-- Listing creation: validates item, stack quantity, per-player active listing cap,
-- and snapshots the item so later catalogue edits do not mutate existing escrow.
create or replace function public.etranom_market_list(p_item_id text,p_quantity integer,p_unit_price bigint)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); s public.game_saves%rowtype; inv jsonb; item jsonb; have_qty integer:=0; remaining integer; listing_id uuid; active_count integer;
begin
 if uid is null then raise exception 'auth_required'; end if;
 if p_quantity is null or p_quantity not between 1 and 999 or p_unit_price is null or p_unit_price not between 1 and 100000000 then raise exception 'market_invalid_amount'; end if;
 if p_item_id is null or length(trim(p_item_id)) not between 1 and 100 then raise exception 'market_invalid_item'; end if;
 select * into s from public.game_saves where user_id=uid for update;
 if not found then raise exception 'game_save_missing'; end if;
 select count(*) into active_count from public.market_listings where seller_id=uid and status='active' and expires_at>now();
 if active_count>=30 then raise exception 'market_listing_limit'; end if;
 inv:=coalesce(s.save_data->'inventory','[]'::jsonb);
 if jsonb_typeof(inv)<>'array' then raise exception 'market_inventory_invalid'; end if;
 select value, greatest(1,coalesce(nullif(value->>'qty','')::integer,1)) into item,have_qty
 from jsonb_array_elements(inv) as e(value) where value->>'id'=p_item_id limit 1;
 if item is null or have_qty<p_quantity then raise exception 'market_item_unavailable'; end if;
 if lower(coalesce(item->>'bound','false'))='true' or lower(coalesce(item->>'tradeable','true'))='false' then raise exception 'market_item_not_tradeable'; end if;
 remaining:=have_qty-p_quantity;
 select coalesce(jsonb_agg(case when value->>'id'=p_item_id and remaining>0 then jsonb_set(value,'{qty}',to_jsonb(remaining),true) else value end),'[]'::jsonb)
 into inv from jsonb_array_elements(coalesce(s.save_data->'inventory','[]'::jsonb)) as e(value) where value->>'id'<>p_item_id or remaining>0;
 update public.game_saves set save_data=jsonb_set(save_data,'{inventory}',inv,true),updated_at=now() where user_id=uid;
 insert into public.market_listings(seller_id,item_id,item_snapshot,quantity,unit_price)
 values(uid,p_item_id,item-'qty',p_quantity,p_unit_price) returning id into listing_id;
 return jsonb_build_object('success',true,'listing_id',listing_id,'expires_in_days',14);
end $$;

-- Atomic purchase with deterministic save-row lock order and inventory stack merge.
create or replace function public.etranom_market_buy(p_listing_id uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); l public.market_listings%rowtype; buyer public.game_saves%rowtype; seller public.game_saves%rowtype; buyer_gold bigint; buyer_inv jsonb; seller_gold bigint; total bigint; found_item boolean:=false;
begin
 if uid is null then raise exception 'auth_required'; end if;
 select * into l from public.market_listings where id=p_listing_id for update;
 if not found or l.status<>'active' or l.expires_at<=now() then raise exception 'market_listing_unavailable'; end if;
 if l.seller_id=uid then raise exception 'market_cannot_buy_own'; end if;
 total:=l.unit_price::bigint*l.quantity::bigint;
 if total>9000000000000000 then raise exception 'market_invalid_amount'; end if;
 perform 1 from public.game_saves where user_id in (uid,l.seller_id) order by user_id for update;
 select * into buyer from public.game_saves where user_id=uid;
 select * into seller from public.game_saves where user_id=l.seller_id;
 if buyer.user_id is null or seller.user_id is null then raise exception 'game_save_missing'; end if;
 buyer_gold:=coalesce(nullif(buyer.save_data->>'gold','')::bigint,0);
 if buyer_gold<total then raise exception 'market_insufficient_gold'; end if;
 buyer_inv:=coalesce(buyer.save_data->'inventory','[]'::jsonb);
 select exists(select 1 from jsonb_array_elements(buyer_inv) as e(value) where value->>'id'=l.item_id) into found_item;
 if found_item then
  select jsonb_agg(case when value->>'id'=l.item_id then jsonb_set(value,'{qty}',to_jsonb(greatest(1,coalesce(nullif(value->>'qty','')::integer,1))+l.quantity),true) else value end)
  into buyer_inv from jsonb_array_elements(buyer_inv) as e(value);
 else buyer_inv:=buyer_inv||jsonb_build_array(l.item_snapshot||jsonb_build_object('qty',l.quantity)); end if;
 update public.game_saves set save_data=jsonb_set(jsonb_set(save_data,'{gold}',to_jsonb(buyer_gold-total),true),'{inventory}',buyer_inv,true),updated_at=now() where user_id=uid;
 seller_gold:=coalesce(nullif(seller.save_data->>'gold','')::bigint,0);
 update public.game_saves set save_data=jsonb_set(save_data,'{gold}',to_jsonb(seller_gold+total),true),updated_at=now() where user_id=l.seller_id;
 update public.market_listings set status='sold',buyer_id=uid,sold_at=now() where id=l.id;
 insert into public.market_transactions(listing_id,seller_id,buyer_id,item_id,item_snapshot,quantity,unit_price,total_paid,transaction_type)
 values(l.id,l.seller_id,uid,l.item_id,l.item_snapshot,l.quantity,l.unit_price,total,'sale');
 return jsonb_build_object('success',true,'total_paid',total,'item_id',l.item_id,'quantity',l.quantity,'listing_id',l.id);
end $$;

-- Cancellation returns escrow to the seller and records the event.
create or replace function public.etranom_market_cancel(p_listing_id uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); l public.market_listings%rowtype; s public.game_saves%rowtype; inv jsonb; found_item boolean;
begin
 if uid is null then raise exception 'auth_required'; end if;
 select * into l from public.market_listings where id=p_listing_id for update;
 if not found or l.seller_id<>uid or l.status<>'active' then raise exception 'market_listing_unavailable'; end if;
 select * into s from public.game_saves where user_id=uid for update;
 if not found then raise exception 'game_save_missing'; end if;
 inv:=coalesce(s.save_data->'inventory','[]'::jsonb);
 select exists(select 1 from jsonb_array_elements(inv) as e(value) where value->>'id'=l.item_id) into found_item;
 if found_item then
  select jsonb_agg(case when value->>'id'=l.item_id then jsonb_set(value,'{qty}',to_jsonb(greatest(1,coalesce(nullif(value->>'qty','')::integer,1))+l.quantity),true) else value end) into inv from jsonb_array_elements(inv) as e(value);
 else inv:=inv||jsonb_build_array(l.item_snapshot||jsonb_build_object('qty',l.quantity)); end if;
 update public.game_saves set save_data=jsonb_set(save_data,'{inventory}',inv,true),updated_at=now() where user_id=uid;
 update public.market_listings set status='cancelled' where id=l.id;
 insert into public.market_transactions(listing_id,seller_id,buyer_id,item_id,item_snapshot,quantity,unit_price,total_paid,transaction_type)
 values(l.id,uid,uid,l.item_id,l.item_snapshot,l.quantity,l.unit_price,0,'cancel_return');
 return jsonb_build_object('success',true,'returned_quantity',l.quantity);
end $$;

-- Service-role only expiry processor: refunds expired escrow into seller inventory.
create or replace function public.etranom_market_expire()
returns integer language plpgsql security definer set search_path=public,pg_temp as $$
declare l record; s public.game_saves%rowtype; inv jsonb; found_item boolean; n integer:=0;
begin
 for l in select * from public.market_listings where status='active' and expires_at<=now() order by expires_at for update skip locked loop
  select * into s from public.game_saves where user_id=l.seller_id for update;
  if not found then continue; end if;
  inv:=coalesce(s.save_data->'inventory','[]'::jsonb);
  select exists(select 1 from jsonb_array_elements(inv) as e(value) where value->>'id'=l.item_id) into found_item;
  if found_item then
   select jsonb_agg(case when value->>'id'=l.item_id then jsonb_set(value,'{qty}',to_jsonb(greatest(1,coalesce(nullif(value->>'qty','')::integer,1))+l.quantity),true) else value end) into inv from jsonb_array_elements(inv) as e(value);
  else inv:=inv||jsonb_build_array(l.item_snapshot||jsonb_build_object('qty',l.quantity)); end if;
  update public.game_saves set save_data=jsonb_set(save_data,'{inventory}',inv,true),updated_at=now() where user_id=l.seller_id;
  update public.market_listings set status='expired' where id=l.id;
  insert into public.market_transactions(listing_id,seller_id,buyer_id,item_id,item_snapshot,quantity,unit_price,total_paid,transaction_type)
  values(l.id,l.seller_id,l.seller_id,l.item_id,l.item_snapshot,l.quantity,l.unit_price,0,'expiry_return');
  n:=n+1;
 end loop;
 return n;
end $$;

-- Search/filter/sort and pagination. Category is read from snapshot category/type/slot.
create or replace function public.etranom_market_snapshot(
 p_mine boolean default false,p_search text default null,p_category text default null,
 p_sort text default 'newest',p_limit integer default 40,p_offset integer default 0
) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); result jsonb; q text:=left(trim(coalesce(p_search,'')),60); cat text:=left(trim(coalesce(p_category,'')),40); lim integer:=greatest(1,least(coalesce(p_limit,40),80)); off integer:=greatest(0,least(coalesce(p_offset,0),10000));
begin
 if uid is null then raise exception 'auth_required'; end if;
 if p_sort not in ('newest','price_low','price_high','quantity') then raise exception 'market_invalid_sort'; end if;
 select coalesce(jsonb_agg(to_jsonb(x) order by
   case when p_sort='price_low' then x.unit_price end asc,
   case when p_sort='price_high' then x.unit_price end desc,
   case when p_sort='quantity' then x.quantity end desc,
   case when p_sort='newest' then x.created_at end desc
 ),'[]'::jsonb) into result from (
  select l.id,l.seller_id,coalesce(p.display_name,p.username,'بازیکن بازار') seller_name,l.item_id,l.item_snapshot,l.quantity,l.unit_price,l.status,l.created_at,l.expires_at
  from public.market_listings l left join public.player_profiles p on p.user_id=l.seller_id
  where ((p_mine and l.seller_id=uid and l.status='active') or (not p_mine and l.status='active' and l.expires_at>now() and l.seller_id<>uid))
   and (q='' or l.item_id ilike '%'||q||'%' or coalesce(l.item_snapshot->>'name','') ilike '%'||q||'%')
   and (cat='' or coalesce(l.item_snapshot->>'category',l.item_snapshot->>'type',l.item_snapshot->>'slot','')=cat)
  order by l.created_at desc limit lim offset off
 ) x;
 return result;
end $$;

create or replace function public.etranom_market_history(p_limit integer default 40,p_offset integer default 0)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); result jsonb;
begin
 if uid is null then raise exception 'auth_required'; end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',t.id,'listing_id',t.listing_id,'seller_id',t.seller_id,'buyer_id',t.buyer_id,'item_id',t.item_id,'item_snapshot',t.item_snapshot,'quantity',t.quantity,'unit_price',t.unit_price,'total_paid',t.total_paid,'transaction_type',t.transaction_type,'created_at',t.created_at) order by t.created_at desc),'[]'::jsonb)
 into result from (select * from public.market_transactions where seller_id=uid or buyer_id=uid order by created_at desc limit greatest(1,least(coalesce(p_limit,40),80)) offset greatest(0,least(coalesce(p_offset,0),10000))) t;
 return result;
end $$;

revoke all on function public.etranom_market_list(text,integer,bigint),public.etranom_market_buy(uuid),public.etranom_market_cancel(uuid),public.etranom_market_snapshot(boolean,text,text,text,integer,integer),public.etranom_market_history(integer,integer),public.etranom_market_expire() from public,anon;
grant execute on function public.etranom_market_list(text,integer,bigint),public.etranom_market_buy(uuid),public.etranom_market_cancel(uuid),public.etranom_market_snapshot(boolean,text,text,text,integer,integer),public.etranom_market_history(integer,integer) to authenticated;
-- Expiry processor is deliberately not granted to normal players. Invoke it from a trusted
-- scheduled job / server using the Supabase service_role key (never expose that key in the client).
revoke all on function public.etranom_market_expire() from public,anon,authenticated;
