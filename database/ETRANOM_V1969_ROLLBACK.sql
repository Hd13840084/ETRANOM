-- V1969 rollback: remove only the new gateway layer. Does not modify legacy RPCs.
begin;
revoke all on function public.etranom_party_battle_act_v1969(uuid,text,integer,uuid) from public, anon, authenticated;
revoke all on function public.etranom_pvp_action_v1969(uuid,text,uuid) from public, anon, authenticated;
revoke all on function public.etranom_pvp_skill_action_v1969(uuid,text,uuid,text,uuid) from public, anon, authenticated;
revoke all on function public.etranom_prune_combat_action_receipts_v1969(integer) from public, anon, authenticated, service_role;
drop function if exists public.etranom_party_battle_act_v1969(uuid,text,integer,uuid);
drop function if exists public.etranom_pvp_action_v1969(uuid,text,uuid);
drop function if exists public.etranom_pvp_skill_action_v1969(uuid,text,uuid,text,uuid);
drop function if exists public.etranom_prune_combat_action_receipts_v1969(integer);
drop table if exists public.combat_action_receipts_v1969;
commit;
