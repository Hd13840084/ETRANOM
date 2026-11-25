-- ETRANOM V2022 FINAL OWNER SECURITY HARDENING
-- Based on the supplied one-row Supabase audit (106 routines, 38 policies, 9 triggers, 46 RLS tables).
-- Safe/idempotent ACL hardening only. Does not rewrite game, trade, market, Party, PvP, or save logic.
-- Run as postgres in Supabase SQL Editor.

BEGIN;

-- These five routines are trigger handlers, not client RPC endpoints.
-- PostgreSQL triggers invoke their trigger functions without requiring callers to have EXECUTE.
-- Remove direct client invocation while preserving trigger operation.
REVOKE ALL ON FUNCTION public.create_etranom_player_profile() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.etranom_archive_game_save_v1643() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.etranom_global_chat_prepare_message() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.etranom_owner_role_guard_v11() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.etranom_sync_player_profile_from_save() FROM PUBLIC, anon, authenticated;

-- Server-only scheduled market expiry. Keep available to postgres/service_role only.
REVOKE ALL ON FUNCTION public.etranom_market_expire() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.etranom_market_expire() TO postgres, service_role;

COMMIT;

-- Post-migration assertions: any row returned here is a failed condition.
WITH expected(fn, args) AS (
  VALUES
    ('create_etranom_player_profile', ''),
    ('etranom_archive_game_save_v1643', ''),
    ('etranom_global_chat_prepare_message', ''),
    ('etranom_owner_role_guard_v11', ''),
    ('etranom_sync_player_profile_from_save', ''),
    ('etranom_market_expire', '')
), resolved AS (
  SELECT e.fn, e.args, p.oid, p.proacl
  FROM expected e
  LEFT JOIN pg_proc p
    ON p.pronamespace = 'public'::regnamespace
   AND p.proname = e.fn
   AND pg_get_function_identity_arguments(p.oid) = e.args
)
SELECT fn AS failed_function, 'function_missing' AS failure
FROM resolved WHERE oid IS NULL
UNION ALL
SELECT r.fn, 'client_execute_still_granted_to_' || g.role_name
FROM resolved r
CROSS JOIN (VALUES ('anon'), ('authenticated')) AS g(role_name)
WHERE r.oid IS NOT NULL
  AND has_function_privilege(g.role_name, r.oid, 'EXECUTE')
UNION ALL
SELECT r.fn, 'public_execute_still_granted'
FROM resolved r
WHERE r.oid IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM aclexplode(COALESCE(r.proacl, acldefault('f', (SELECT proowner FROM pg_proc WHERE oid=r.oid)))) a
    WHERE a.grantee = 0 AND a.privilege_type = 'EXECUTE'
  );
