-- SUPERSEDED by party_region_one_xp_scaling_v1853.sql. Do not run this historical patch for current deployments.
-- ETRANOM V1852: Region 1 monsters stop granting combat XP at player level 5.
-- This updates the shared helper used by the current party battle RPCs; it does
-- not change HP, damage, materials, gold, recipes, kills, or player save data.
begin;

create or replace function public.etranom_monster_xp_from_hp(p_monster jsonb)
returns integer
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_player_level integer := 1;
  v_region_id text;
  v_hp numeric;
begin
  select coalesce(nullif(gs.save_data#>>'{character,level}','')::integer,1)
    into v_player_level
    from public.game_saves gs
   where gs.user_id = auth.uid();
  v_player_level := greatest(1,coalesce(v_player_level,1));

  v_region_id := coalesce(nullif(p_monster->>'region_id',''),nullif(p_monster->>'regionId',''));
  if v_region_id is null then
    select m.region_id into v_region_id
      from public.etranom_content_monsters m
     where m.id = coalesce(p_monster->>'id','')
     limit 1;
  end if;

  if v_player_level >= 5 and v_region_id in (
    'burnt_forest','thorn_grove','ash_hills',
    'southern_plains','vardash_river','rootbound_ruins'
  ) then
    return 0;
  end if;

  v_hp := coalesce(
    nullif(p_monster->>'max_hp','')::numeric,
    nullif(p_monster->>'maxHp','')::numeric,
    nullif(p_monster->>'hp','')::numeric,
    nullif(p_monster#>>'{stats,hp}','')::numeric,
    15
  );
  return greatest(1,floor(greatest(1,v_hp)/15)::integer);
end;
$$;

revoke all on function public.etranom_monster_xp_from_hp(jsonb) from public, anon;
grant execute on function public.etranom_monster_xp_from_hp(jsonb) to authenticated;

commit;
