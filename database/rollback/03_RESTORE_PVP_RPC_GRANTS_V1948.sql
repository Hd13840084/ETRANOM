-- Run only after both V1948 function definitions in this folder have been restored.
REVOKE ALL ON FUNCTION public.etranom_pvp_skill_action(uuid,text,uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.etranom_pvp_skill_action(uuid,text,uuid,text) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.etranom_pvp_action(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.etranom_pvp_action(uuid,text) TO authenticated, service_role;
