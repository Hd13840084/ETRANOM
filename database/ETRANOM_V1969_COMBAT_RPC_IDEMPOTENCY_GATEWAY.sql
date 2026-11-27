-- ETRANOM V1969 — idempotent request gateway for existing authoritative Party/PvP RPCs.
-- Install after the current Party RPC chain and V1954 PvP RPCs.
-- Does not replace combat formulas or trust client-supplied combat state.
begin;

DO $preflight$
begin
  if to_regprocedure('public.etranom_party_battle_act(uuid,text,integer)') is null then
    raise exception 'v1969_requires_party_battle_act_uuid_text_integer';
  end if;
  if to_regprocedure('public.etranom_pvp_action(uuid,text)') is null then
    raise exception 'v1969_requires_pvp_action_uuid_text';
  end if;
  if to_regprocedure('public.etranom_pvp_skill_action(uuid,text,uuid,text)') is null then
    raise exception 'v1969_requires_pvp_skill_action_uuid_text_uuid_text';
  end if;
  if to_regclass('public.party_sessions') is null or to_regclass('public.party_members') is null
     or to_regclass('public.pvp_matches') is null then
    raise exception 'v1969_required_combat_tables_missing';
  end if;
end;
$preflight$;

create table if not exists public.combat_action_receipts_v1969 (
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('party','pvp')),
  combat_id uuid not null,
  operation text not null check (operation in ('party_action','pvp_action','pvp_skill')),
  request_id uuid not null,
  result jsonb not null check (jsonb_typeof(result) in ('object','array','string','number','boolean','null')),
  created_at timestamptz not null default now(),
  primary key (user_id, mode, combat_id, operation, request_id)
);

alter table public.combat_action_receipts_v1969 enable row level security;
revoke all on public.combat_action_receipts_v1969 from public, anon, authenticated;
grant all on public.combat_action_receipts_v1969 to service_role;

create or replace function public.etranom_party_battle_act_v1969(
  p_session_id uuid, p_action text, p_target_index integer default null, p_request_id uuid default null
) returns jsonb
language plpgsql security definer set search_path = '' as $function$
declare
  uid uuid := auth.uid();
  cached jsonb;
  result_json jsonb;
begin
  if uid is null then raise exception 'auth_required'; end if;
  if p_session_id is null or p_request_id is null then raise exception 'combat_request_id_required'; end if;
  if not exists(select 1 from public.party_sessions s join public.party_members pm on pm.party_id=s.party_id where s.id=p_session_id and pm.user_id=uid) then raise exception 'battle_not_available'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text||':party:'||p_session_id::text||':party_action:'||p_request_id::text,0));
  select result into cached from public.combat_action_receipts_v1969
   where user_id=uid and mode='party' and combat_id=p_session_id and operation='party_action' and request_id=p_request_id;
  if found then return cached || jsonb_build_object('duplicate',true,'request_id',p_request_id); end if;
  result_json := public.etranom_party_battle_act(p_session_id,p_action,p_target_index);
  insert into public.combat_action_receipts_v1969(user_id,mode,combat_id,operation,request_id,result)
  values(uid,'party',p_session_id,'party_action',p_request_id,result_json);
  return result_json || jsonb_build_object('duplicate',false,'request_id',p_request_id);
end;
$function$;

create or replace function public.etranom_pvp_action_v1969(
  p_match uuid, p_action text, p_request_id uuid
) returns jsonb
language plpgsql security definer set search_path = '' as $function$
declare
  uid uuid := auth.uid();
  cached jsonb;
  result_json jsonb;
begin
  if uid is null then raise exception 'auth_required'; end if;
  if p_match is null or p_request_id is null then raise exception 'combat_request_id_required'; end if;
  if not exists(select 1 from public.pvp_matches m where m.id=p_match and uid in (m.player_a,m.player_b)) then raise exception 'match_not_found'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text||':pvp:'||p_match::text||':pvp_action:'||p_request_id::text,0));
  select result into cached from public.combat_action_receipts_v1969
   where user_id=uid and mode='pvp' and combat_id=p_match and operation='pvp_action' and request_id=p_request_id;
  if found then return cached || jsonb_build_object('duplicate',true,'request_id',p_request_id); end if;
  result_json := public.etranom_pvp_action(p_match,p_action);
  insert into public.combat_action_receipts_v1969(user_id,mode,combat_id,operation,request_id,result)
  values(uid,'pvp',p_match,'pvp_action',p_request_id,result_json);
  return result_json || jsonb_build_object('duplicate',false,'request_id',p_request_id);
end;
$function$;

create or replace function public.etranom_pvp_skill_action_v1969(
  p_match uuid, p_skill_id text, p_target_id uuid default null, p_choice text default null, p_request_id uuid default null
) returns jsonb
language plpgsql security definer set search_path = '' as $function$
declare
  uid uuid := auth.uid();
  cached jsonb;
  result_json jsonb;
begin
  if uid is null then raise exception 'auth_required'; end if;
  if p_match is null or p_request_id is null then raise exception 'combat_request_id_required'; end if;
  if not exists(select 1 from public.pvp_matches m where m.id=p_match and uid in (m.player_a,m.player_b)) then raise exception 'match_not_found'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text||':pvp:'||p_match::text||':pvp_skill:'||p_request_id::text,0));
  select result into cached from public.combat_action_receipts_v1969
   where user_id=uid and mode='pvp' and combat_id=p_match and operation='pvp_skill' and request_id=p_request_id;
  if found then return cached || jsonb_build_object('duplicate',true,'request_id',p_request_id); end if;
  result_json := public.etranom_pvp_skill_action(p_match,p_skill_id,p_target_id,p_choice);
  insert into public.combat_action_receipts_v1969(user_id,mode,combat_id,operation,request_id,result)
  values(uid,'pvp',p_match,'pvp_skill',p_request_id,result_json);
  return result_json || jsonb_build_object('duplicate',false,'request_id',p_request_id);
end;
$function$;

revoke all on function public.etranom_party_battle_act_v1969(uuid,text,integer,uuid) from public, anon;
grant execute on function public.etranom_party_battle_act_v1969(uuid,text,integer,uuid) to authenticated;
revoke all on function public.etranom_pvp_action_v1969(uuid,text,uuid) from public, anon;
grant execute on function public.etranom_pvp_action_v1969(uuid,text,uuid) to authenticated;
revoke all on function public.etranom_pvp_skill_action_v1969(uuid,text,uuid,text,uuid) from public, anon;
grant execute on function public.etranom_pvp_skill_action_v1969(uuid,text,uuid,text,uuid) to authenticated;

-- Maintenance helper is intentionally service-role only.
create or replace function public.etranom_prune_combat_action_receipts_v1969(p_keep_days integer default 14)
returns integer language plpgsql security definer set search_path = '' as $function$
declare deleted_count integer;
begin
  if coalesce(auth.role(),'') <> 'service_role' then raise exception 'service_role_required'; end if;
  delete from public.combat_action_receipts_v1969
   where created_at < now() - make_interval(days => greatest(1,least(90,coalesce(p_keep_days,14))));
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$function$;
revoke all on function public.etranom_prune_combat_action_receipts_v1969(integer) from public, anon, authenticated;
grant execute on function public.etranom_prune_combat_action_receipts_v1969(integer) to service_role;

commit;
