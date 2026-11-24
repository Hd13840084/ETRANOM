-- ETRANOM V1944: read-only online combat preflight.
-- Safe to run in Supabase SQL Editor. This script does not modify schema or data.
with routines as (
  select p.oid, p.proname, pg_get_function_identity_arguments(p.oid) as args,
         pg_get_functiondef(p.oid) as definition
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.proname in ('etranom_party_battle_act','etranom_pvp_skill_action','etranom_pvp_action')
), checks as (
  select 'party_rpc_exists'::text as check_id,
         exists(select 1 from routines where proname='etranom_party_battle_act') as passed,
         'وجود RPC نبرد گروهی'::text as description
  union all
  select 'party_row_lock', coalesce((select definition ilike '%for update%' from routines where proname='etranom_party_battle_act'),false), 'قفل تراکنشی ردیف نبرد گروهی'
  union all
  select 'party_duplicate_action_guard', coalesce((select definition ilike '%already_acted_this_round%' from routines where proname='etranom_party_battle_act'),false), 'جلوگیری از اقدام تکراری در Round'
  union all
  select 'party_warrior_route', coalesce((select definition ilike '%warrior_sword_ascetic%' and definition ilike '%warrior_iron_bastion%' and definition ilike '%warrior_chaos%' and definition ilike '%warrior_apocalypse_harbinger%' from routines where proname='etranom_party_battle_act'),false), 'Route چهار تخصص جنگجو در Party'
  union all
  select 'pvp_skill_rpc_exists', exists(select 1 from routines where proname='etranom_pvp_skill_action'), 'وجود RPC مهارت PvP'
  union all
  select 'pvp_row_lock', coalesce((select definition ilike '%for update%' from routines where proname='etranom_pvp_skill_action'),false), 'قفل تراکنشی Match در PvP'
  union all
  select 'pvp_turn_guard', coalesce((select definition ilike '%not_your_turn%' from routines where proname='etranom_pvp_skill_action'),false), 'بررسی مالکیت نوبت در PvP'
  union all
  select 'pvp_warrior_route', coalesce((select definition ilike '%warrior_sword_ascetic%' and definition ilike '%warrior_iron_bastion%' and definition ilike '%warrior_chaos%' and definition ilike '%warrior_apocalypse_harbinger%' from routines where proname='etranom_pvp_skill_action'),false), 'Route چهار تخصص جنگجو در PvP'
  union all
  select 'pvp_warrior_stamina', coalesce((select definition ilike '%staminaCost%' and definition ilike '%insufficient_stamina%' from routines where proname='etranom_pvp_skill_action'),false), 'هزینه و کنترل استقامت جنگجو در PvP'
)
select check_id, passed, description from checks order by check_id;

-- Trusted Party catalog inventory by Warrior specialization (if catalog exists).
select specialization_key, count(*) filter (where enabled) as enabled_skills,
       count(*) filter (where not enabled) as disabled_skills
from public.party_battle_skill_catalog
where specialization_key in ('warrior_sword_ascetic','warrior_iron_bastion','warrior_chaos_warrior','warrior_apocalypse_harbinger')
group by specialization_key order by specialization_key;
