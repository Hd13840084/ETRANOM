-- ETRANOM v184: repair ambiguous PL/pgSQL identifier in party retreat RPC.
-- Requires the v183 party RPC and its v181.1 prerequisites to be installed.
-- Safe to run repeatedly: the function is read from the live database and
-- CREATE OR REPLACE is executed after renaming the local variable only.
begin;
do $v184_fix$
declare
  v_definition text;
begin
  if to_regprocedure('public.etranom_party_battle_act(uuid,text,integer)') is null then
    raise exception 'etranom_party_battle_act_missing: install the v181.1/v183 party RPC first';
  end if;

  v_definition := pg_get_functiondef(
    'public.etranom_party_battle_act(uuid,text,integer)'::regprocedure
  );

  -- Rename the local PL/pgSQL variable and its unqualified references.
  -- Restore the qualified row field and the left-hand table column assignment.
  v_definition := regexp_replace(v_definition, E'\\mmonsters\\M', 'v_monsters', 'g');
  v_definition := replace(v_definition, 'st.v_monsters', 'st.monsters');
  v_definition := regexp_replace(
    v_definition,
    E'(set\\s+)v_monsters(\\s*=\\s*)v_monsters',
    E'\\1monsters\\2v_monsters',
    'g'
  );

  if v_definition !~* 'v_monsters' then
    raise exception 'v184_party_retreat_patch_failed: local monsters variable was not renamed';
  end if;

  execute v_definition;
end
$v184_fix$;
commit;
