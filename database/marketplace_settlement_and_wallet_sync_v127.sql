-- ETRANOM v127: atomic marketplace settlement and seller wallet protection.
-- Run this migration in Supabase SQL Editor after the marketplace phase-5 schema.
-- The item is held in market_listings escrow; a successful purchase MUST NOT return it
-- to the seller. Buyer debit, seller credit, inventory delivery and listing completion
-- are one PostgreSQL transaction (all roll back together on any error).

create or replace function public.etranom_market_buy(p_listing_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_listing public.market_listings%rowtype;
  v_buyer public.game_saves%rowtype;
  v_seller public.game_saves%rowtype;
  v_buyer_gold bigint;
  v_seller_gold bigint;
  v_total bigint;
  v_buyer_inventory jsonb;
  v_item_exists boolean;
begin
  if v_uid is null then raise exception 'auth_required'; end if;

  select * into v_listing
    from public.market_listings
   where id = p_listing_id
   for update;
  if not found or v_listing.status <> 'active' or v_listing.expires_at <= now() then
    raise exception 'market_listing_unavailable';
  end if;
  if v_listing.seller_id = v_uid then raise exception 'market_cannot_buy_own'; end if;

  v_total := v_listing.unit_price::bigint * v_listing.quantity::bigint;
  if v_total <= 0 or v_total > 9000000000000000 then raise exception 'market_invalid_amount'; end if;

  -- Lock both save rows in the same deterministic order to avoid deadlocks.
  perform 1
    from public.game_saves
   where user_id in (v_uid, v_listing.seller_id)
   order by user_id
   for update;

  select * into v_buyer from public.game_saves where user_id = v_uid;
  select * into v_seller from public.game_saves where user_id = v_listing.seller_id;
  if v_buyer.user_id is null or v_seller.user_id is null then raise exception 'game_save_missing'; end if;

  v_buyer_gold := coalesce(nullif(v_buyer.save_data->>'gold','')::bigint, 0);
  v_seller_gold := coalesce(nullif(v_seller.save_data->>'gold','')::bigint, 0);
  if v_buyer_gold < v_total then raise exception 'market_insufficient_gold'; end if;
  if v_seller_gold + v_total > 9000000000000000 then raise exception 'market_wallet_limit'; end if;

  v_buyer_inventory := coalesce(v_buyer.save_data->'inventory', '[]'::jsonb);
  if jsonb_typeof(v_buyer_inventory) <> 'array' then raise exception 'market_inventory_invalid'; end if;
  select exists (
    select 1 from jsonb_array_elements(v_buyer_inventory) e(value)
     where e.value->>'id' = v_listing.item_id
  ) into v_item_exists;

  if v_item_exists then
    select coalesce(jsonb_agg(
      case when e.value->>'id' = v_listing.item_id then
        jsonb_set(e.value, '{qty}', to_jsonb(greatest(1, coalesce(nullif(e.value->>'qty','')::integer,1)) + v_listing.quantity), true)
      else e.value end
    ), '[]'::jsonb)
      into v_buyer_inventory
      from jsonb_array_elements(v_buyer_inventory) e(value);
  else
    v_buyer_inventory := v_buyer_inventory || jsonb_build_array(v_listing.item_snapshot || jsonb_build_object('qty', v_listing.quantity));
  end if;

  -- Debit buyer and credit seller directly in their persisted saves.
  update public.game_saves
     set save_data = jsonb_set(
           jsonb_set(save_data, '{gold}', to_jsonb(v_buyer_gold - v_total), true),
           '{inventory}', v_buyer_inventory, true),
         updated_at = now()
   where user_id = v_uid;

  update public.game_saves
     set save_data = jsonb_set(save_data, '{gold}', to_jsonb(v_seller_gold + v_total), true),
         updated_at = now()
   where user_id = v_listing.seller_id;

  update public.market_listings
     set status = 'sold', buyer_id = v_uid, sold_at = now()
   where id = v_listing.id and status = 'active';
  if not found then raise exception 'market_listing_unavailable'; end if;

  insert into public.market_transactions
    (listing_id, seller_id, buyer_id, item_id, item_snapshot, quantity, unit_price, total_paid, transaction_type)
  values
    (v_listing.id, v_listing.seller_id, v_uid, v_listing.item_id, v_listing.item_snapshot,
     v_listing.quantity, v_listing.unit_price, v_total, 'sale');

  return jsonb_build_object(
    'success', true,
    'listing_id', v_listing.id,
    'item_id', v_listing.item_id,
    'quantity', v_listing.quantity,
    'total_paid', v_total,
    'seller_credited', v_total,
    'status', 'sold'
  );
end;
$$;

revoke all on function public.etranom_market_buy(uuid) from public, anon;
grant execute on function public.etranom_market_buy(uuid) to authenticated;

-- The game client polls its own persisted save while online; this RPC is not needed.
-- Keep direct reads restricted by the existing game_saves RLS policy.
