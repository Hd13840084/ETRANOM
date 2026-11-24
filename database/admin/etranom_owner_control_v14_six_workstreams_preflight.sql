-- ETRANOM Owner Control V14: six-workstream readiness/preflight report.
-- Read-only. Run after V1-V13 on STAGING. It does not mutate game data.
with checks(check_id, ok, detail) as (
  select 'player_profiles_table', to_regclass('public.player_profiles') is not null, 'وجود جدول پروفایل بازیکنان' union all
  select 'game_saves_table', to_regclass('public.game_saves') is not null, 'وجود جدول ذخیره بازی' union all
  select 'inventory_rpc', to_regprocedure('public.etranom_admin_patch_player_inventory_v13(uuid,text,text,integer,text)') is not null, 'RPC عملیات امن کیف و تجهیزات V13' union all
  select 'typed_save_rpc', to_regprocedure('public.etranom_admin_patch_player_save_v12(uuid,text,jsonb)') is not null, 'RPC ویرایش محدود آمار شخصیت V12' union all
  select 'ban_trigger_save', exists(select 1 from pg_trigger where tgname='etranom_ban_guard_game_saves_v13' and not tgisinternal), 'تریگر محافظ بن روی ذخیره‌ها' union all
  select 'ban_trigger_profile', exists(select 1 from pg_trigger where tgname='etranom_ban_guard_player_profiles_v13' and not tgisinternal), 'تریگر محافظ بن روی پروفایل‌ها' union all
  select 'skill_catalog', to_regclass('public.etranom_shared_skill_catalog') is not null, 'کاتالوگ مهارت مشترک' union all
  select 'party_skill_catalog', to_regclass('public.party_battle_skill_catalog') is not null, 'کاتالوگ مهارت نبرد گروهی' union all
  select 'pvp_matches', to_regclass('public.pvp_matches') is not null, 'جدول مسابقات PvP' union all
  select 'market_transactions', to_regclass('public.market_transactions') is not null, 'جدول تراکنش‌های بازار' union all
  select 'treasury_table', to_regclass('public.etranom_platform_treasury') is not null, 'خزانه پلتفرم' union all
  select 'treasury_snapshot_rpc', to_regprocedure('public.etranom_admin_treasury_snapshot_v10()') is not null, 'RPC گزارش خزانه'
)
select check_id, ok, detail, now() as checked_at from checks order by check_id;

-- Inventory JSON shape sampling is intentionally omitted: never expose player data in this global preflight.
-- Companion/Legion fields vary by save schema; V14 therefore does not invent write paths for them.
