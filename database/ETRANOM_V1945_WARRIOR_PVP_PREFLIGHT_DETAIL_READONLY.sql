-- ETRANOM V1945: read-only detail query for Warrior PvP readiness.
-- Does not modify schema, functions, catalog rows, or player data.
select specialization_key, skill_id, skill_data->>'name' as skill_name,
       skill_data->>'type' as skill_type, enabled,
       coalesce((skill_data->>'staminaCost')::integer,0) as stamina_cost,
       coalesce((skill_data->>'cooldownTurns')::integer,0) as cooldown_turns
from public.party_battle_skill_catalog
where specialization_key in (
 'warrior_sword_ascetic','warrior_iron_bastion',
 'warrior_chaos_warrior','warrior_apocalypse_harbinger'
)
order by specialization_key, coalesce((skill_data->>'unlockLevel')::integer,0), skill_id;

-- Inspect the currently installed PvP skill RPC and its specialization/resource gates.
select p.proname, pg_get_function_identity_arguments(p.oid) as arguments,
       (pg_get_functiondef(p.oid) ilike '%warrior_sword_ascetic%') as has_sword_route,
       (pg_get_functiondef(p.oid) ilike '%warrior_iron_bastion%') as has_iron_route,
       (pg_get_functiondef(p.oid) ilike '%warrior_chaos%') as has_chaos_route,
       (pg_get_functiondef(p.oid) ilike '%warrior_apocalypse_harbinger%') as has_apocalypse_route,
       (pg_get_functiondef(p.oid) ilike '%insufficient_stamina%') as has_stamina_guard
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname='etranom_pvp_skill_action';
