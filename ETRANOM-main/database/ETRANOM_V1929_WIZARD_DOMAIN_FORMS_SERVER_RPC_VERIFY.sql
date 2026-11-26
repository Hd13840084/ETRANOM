-- Run after ETRANOM_V1929_WIZARD_DOMAIN_FORMS_SERVER_RPC.sql.
select specialization_key,count(*) as domain_forms,count(distinct base_skill_id) as base_skills
from public.wizard_domain_skill_forms_v1929 group by specialization_key order by specialization_key;
select proname,pg_get_function_identity_arguments(p.oid) as args,
       position('etranom_wizard_apply_domain_form_v1929' in pg_get_functiondef(p.oid))>0 as domain_form_hooked
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in ('etranom_party_battle_act','etranom_pvp_skill_action')
order by proname;
