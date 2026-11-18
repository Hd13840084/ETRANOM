-- ETRANOM Phase 5 - Part 3 (corrected)
-- Run only after Part 1 and Part 2 have completed successfully.

create or replace function public.etranom_market_snapshot(
  p_mine boolean default false,
  p_search text default null,
  p_category text default null,
  p_sort text default 'newest',
  p_limit integer default 40,
  p_offset integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
  result jsonb;
  q text := left(trim(coalesce(p_search, '')), 60);
  cat text := left(trim(coalesce(p_category, '')), 40);
  lim integer := greatest(1, least(coalesce(p_limit, 40), 80));
  off integer := greatest(0, least(coalesce(p_offset, 0), 10000));
begin
  if uid is null then
    raise exception 'auth_required';
  end if;

  if p_sort is null or p_sort not in ('newest', 'price_low', 'price_high', 'quantity') then
    raise exception 'market_invalid_sort';
  end if;

  select coalesce(
    jsonb_agg(
      to_jsonb(x)
      order by
        case when p_sort = 'price_low' then x.unit_price end asc,
        case when p_sort = 'price_high' then x.unit_price end desc,
        case when p_sort = 'quantity' then x.quantity end desc,
        case when p_sort = 'newest' then x.created_at end desc
    ),
    '[]'::jsonb
  )
  into result
  from (
    select
      l.id,
      l.seller_id,
      coalesce(p.display_name, p.username, 'بازیکن بازار') as seller_name,
      l.item_id,
      l.item_snapshot,
      l.quantity,
      l.unit_price,
      l.status,
      l.created_at,
      l.expires_at
    from public.market_listings as l
    left join public.player_profiles as p on p.user_id = l.seller_id
    where (
      (p_mine and l.seller_id = uid and l.status = 'active')
      or
      (not p_mine and l.status = 'active' and l.expires_at > now() and l.seller_id <> uid)
    )
      and (q = '' or l.item_id ilike '%' || q || '%' or coalesce(l.item_snapshot->>'name', '') ilike '%' || q || '%')
      and (cat = '' or coalesce(l.item_snapshot->>'category', l.item_snapshot->>'type', l.item_snapshot->>'slot', '') = cat)
    order by l.created_at desc
    limit lim offset off
  ) as x;

  return result;
end;
$$;

create or replace function public.etranom_market_history(
  p_limit integer default 40,
  p_offset integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
  result jsonb;
begin
  if uid is null then
    raise exception 'auth_required';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', t.id,
        'listing_id', t.listing_id,
        'seller_id', t.seller_id,
        'buyer_id', t.buyer_id,
        'item_id', t.item_id,
        'item_snapshot', t.item_snapshot,
        'quantity', t.quantity,
        'unit_price', t.unit_price,
        'total_paid', t.total_paid,
        'transaction_type', t.transaction_type,
        'created_at', t.created_at
      ) order by t.created_at desc
    ),
    '[]'::jsonb
  )
  into result
  from (
    select *
    from public.market_transactions
    where seller_id = uid or buyer_id = uid
    order by created_at desc
    limit greatest(1, least(coalesce(p_limit, 40), 80))
    offset greatest(0, least(coalesce(p_offset, 0), 10000))
  ) as t;

  return result;
end;
$$;

-- Revoke and grant each routine separately to avoid parser/client compatibility issues.
revoke all on function public.etranom_market_list(text, integer, bigint) from public, anon;
revoke all on function public.etranom_market_buy(uuid) from public, anon;
revoke all on function public.etranom_market_cancel(uuid) from public, anon;
revoke all on function public.etranom_market_snapshot(boolean, text, text, text, integer, integer) from public, anon;
revoke all on function public.etranom_market_history(integer, integer) from public, anon;
revoke all on function public.etranom_market_expire() from public, anon, authenticated;

grant execute on function public.etranom_market_list(text, integer, bigint) to authenticated;
grant execute on function public.etranom_market_buy(uuid) to authenticated;
grant execute on function public.etranom_market_cancel(uuid) to authenticated;
grant execute on function public.etranom_market_snapshot(boolean, text, text, text, integer, integer) to authenticated;
grant execute on function public.etranom_market_history(integer, integer) to authenticated;

-- Expiry processor remains restricted to trusted server/service-role execution.
