-- ETRANOM V1954 post-apply verification. READ ONLY: SELECT statements only.

-- 1) Verify the three installed server functions and their security mode.
SELECT p.proname AS function_name,
       pg_get_function_identity_arguments(p.oid) AS arguments,
       p.prosecdef AS security_definer,
       p.proconfig AS function_settings,
       CASE WHEN p.proname='etranom_pvp_skill_action'
                  AND pg_get_functiondef(p.oid) ILIKE '%warrior_domain%'
                  AND pg_get_functiondef(p.oid) ILIKE '%live_save_data%'
                  AND pg_get_functiondef(p.oid) ILIKE '%multi_hit%'
            THEN true
            WHEN p.proname='etranom_pvp_action'
                  AND pg_get_functiondef(p.oid) ILIKE '%etranom_pvp_tick_warrior_domain%'
            THEN true
            WHEN p.proname='etranom_pvp_tick_warrior_domain'
            THEN true ELSE false END AS v1954_signature_present
FROM pg_proc p
JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public'
  AND p.proname IN ('etranom_pvp_skill_action','etranom_pvp_action','etranom_pvp_tick_warrior_domain')
ORDER BY p.proname;

-- 2) Verify the expected execution grants; anon must not have access.
SELECT routine_name, grantee, privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema='public'
  AND routine_name IN ('etranom_pvp_skill_action','etranom_pvp_action','etranom_pvp_tick_warrior_domain')
ORDER BY routine_name, grantee, privilege_type;

-- 3) Verify Warrior catalog availability. No player data or user IDs are read.
SELECT specialization_key,
       count(*) AS total_skills,
       count(*) FILTER (WHERE enabled) AS enabled_skills,
       count(*) FILTER (WHERE NOT enabled) AS disabled_skills
FROM public.party_battle_skill_catalog
WHERE specialization_key IN (
  'warrior_sword_ascetic',
  'warrior_iron_bastion',
  'warrior_chaos_warrior',
  'warrior_apocalypse_harbinger'
)
GROUP BY specialization_key
ORDER BY specialization_key;

-- 4) Echo should be enabled by V1954; Incompatible Vessel remains passive/disabled.
SELECT specialization_key, skill_id, enabled,
       skill_data->>'type' AS skill_type
FROM public.party_battle_skill_catalog
WHERE (specialization_key='warrior_sword_ascetic' AND skill_id='echo')
   OR (specialization_key='warrior_chaos_warrior' AND skill_id='incompatible_vessel')
ORDER BY specialization_key, skill_id;
