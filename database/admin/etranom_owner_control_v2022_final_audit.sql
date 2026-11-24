-- ETRANOM V2022 final verification. Returns exactly one JSON row.
-- Does not expose player save values or private user content.
WITH
routines AS (
  SELECT jsonb_agg(jsonb_build_object(
    'name', p.proname,
    'identity_arguments', pg_get_function_identity_arguments(p.oid),
    'security_definer', p.prosecdef,
    'owner', pg_get_userbyid(p.proowner),
    'search_path', p.proconfig,
    'acl', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'grantee', CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee) END,
        'privilege', a.privilege_type,
        'grantable', a.is_grantable
      ))
      FROM aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) a
      WHERE a.privilege_type = 'EXECUTE'
    ), '[]'::jsonb),
    'definition', pg_get_functiondef(p.oid)
  ) ORDER BY p.proname, pg_get_function_identity_arguments(p.oid)) AS data
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.prokind IN ('f','p')
),
policies AS (
  SELECT jsonb_agg(jsonb_build_object(
    'table', tablename, 'policy', policyname, 'command', cmd,
    'roles', roles, 'using', qual, 'with_check', with_check
  ) ORDER BY tablename, policyname) AS data
  FROM pg_policies WHERE schemaname='public'
),
triggers AS (
  SELECT jsonb_agg(jsonb_build_object(
    'table', c.relname, 'trigger', t.tgname,
    'enabled', t.tgenabled, 'definition', pg_get_triggerdef(t.oid, true)
  ) ORDER BY c.relname, t.tgname) AS data
  FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
  JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND NOT t.tgisinternal
),
rls AS (
  SELECT jsonb_agg(jsonb_build_object(
    'table', c.relname, 'enabled', c.relrowsecurity, 'forced', c.relforcerowsecurity
  ) ORDER BY c.relname) AS data
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relkind='r'
),
save_shape AS (
  SELECT COALESCE(jsonb_object_agg(k, v), '{}'::jsonb) AS data
  FROM (
    SELECT e.key AS k, jsonb_build_object('rows_with_key', count(*), 'value_types', jsonb_agg(DISTINCT jsonb_typeof(e.value))) AS v
    FROM public.game_saves gs
    CROSS JOIN LATERAL jsonb_each(CASE WHEN jsonb_typeof(gs.save_data)='object' THEN gs.save_data ELSE '{}'::jsonb END) e
    GROUP BY e.key
  ) s
),
owner_role AS (
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'user_id', user_id, 'role', role,
    'permissions_keys', CASE WHEN jsonb_typeof(permissions)='object' THEN (SELECT jsonb_agg(k.key ORDER BY k.key) FROM jsonb_object_keys(permissions) AS k(key)) ELSE '[]'::jsonb END
  )), '[]'::jsonb) AS data
  FROM public.etranom_admin_roles
  WHERE user_id='f9531c31-8c9f-495d-baf2-d19575982f78'::uuid
),
checks AS (
  SELECT jsonb_build_object(
    'owner_role_present', EXISTS (SELECT 1 FROM public.etranom_admin_roles WHERE user_id='f9531c31-8c9f-495d-baf2-d19575982f78'::uuid AND role='owner'),
    'owner_role_unique', (SELECT count(*)=1 FROM public.etranom_admin_roles WHERE role='owner'),
    'trigger_functions_not_client_executable', NOT EXISTS (
      SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
      WHERE n.nspname='public' AND p.proname IN (
        'create_etranom_player_profile','etranom_archive_game_save_v1643',
        'etranom_global_chat_prepare_message','etranom_owner_role_guard_v11',
        'etranom_sync_player_profile_from_save'
      ) AND (has_function_privilege('anon',p.oid,'EXECUTE') OR has_function_privilege('authenticated',p.oid,'EXECUTE') OR EXISTS (SELECT 1 FROM aclexplode(COALESCE(p.proacl, acldefault('f',p.proowner))) a WHERE a.grantee=0 AND a.privilege_type='EXECUTE'))
    ),
    'market_expire_server_only', EXISTS (
      SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
      WHERE n.nspname='public' AND p.proname='etranom_market_expire'
        AND NOT has_function_privilege('anon',p.oid,'EXECUTE')
        AND NOT has_function_privilege('authenticated',p.oid,'EXECUTE')
        AND has_function_privilege('service_role',p.oid,'EXECUTE')
    ),
    'rls_disabled_public_tables', COALESCE((SELECT jsonb_agg(c.relname ORDER BY c.relname) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND NOT c.relrowsecurity), '[]'::jsonb)
  ) AS data
)
SELECT jsonb_build_object(
  'version','V2022',
  'generated_at',now(),
  'counts',jsonb_build_object(
    'routines',(SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.prokind IN ('f','p')),
    'policies',(SELECT count(*) FROM pg_policies WHERE schemaname='public'),
    'triggers',(SELECT count(*) FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND NOT t.tgisinternal),
    'rls_tables',(SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND c.relrowsecurity)
  ),
  'checks',(SELECT data FROM checks),
  'owner_role',(SELECT data FROM owner_role),
  'save_data_top_level_shape',(SELECT data FROM save_shape),
  'routines',(SELECT data FROM routines),
  'policies',(SELECT data FROM policies),
  'triggers',(SELECT data FROM triggers),
  'tables_rls',(SELECT data FROM rls)
) AS etranom_v2022_final_audit;
