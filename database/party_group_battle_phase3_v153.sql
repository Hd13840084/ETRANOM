-- ETRANOM v153 — exact group monster scaling correction
-- Apply AFTER v150/v151/v152 migrations. No table/data reset is performed.
begin;

create or replace function public.etranom_party_battle_bootstrap()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_count integer;
  v_monster_count integer;
  v_base_count integer;
  v_count_roll numeric;
  v_monsters jsonb := '[]'::jsonb;
  v_player_hp jsonb := '{}'::jsonb;
  v_scale numeric;
  v_monster record;
  v_member record;
  v_index integer := 0;
  v_kind text;
begin
  if new.status <> 'active' then return new; end if;
  select count(*) into v_count from public.party_members where party_id=new.party_id;
  v_count:=greatest(2,least(4,v_count));
  v_kind:=coalesce(new.encounter_type,'normal');
  v_scale:=1 + 0.65 * (v_count-1);

  if v_kind='normal' then
    -- Roll the solo encounter size first, then multiply exactly by party size.
    -- A base roll of 1/2/3 therefore creates N/2N/3N monsters.
    v_count_roll:=random()*175;
    if v_count_roll<100 then v_base_count:=1;
    elsif v_count_roll<145 then v_base_count:=2;
    else v_base_count:=3; end if;
    v_monster_count:=v_base_count * v_count;
    for v_index in 1..v_monster_count loop
      select id,name_fa,level,stats,material_ids into v_monster
      from public.etranom_content_monsters
      where region_id=new.region_id and kind='normal'
      order by random() limit 1;
      if v_monster.id is null then raise exception 'party_region_monsters_missing'; end if;
      v_monsters:=v_monsters || jsonb_build_array(jsonb_build_object(
        'id',v_monster.id,'name',v_monster.name_fa,'kind','normal','level',v_monster.level,
        'hp',greatest(1,coalesce((v_monster.stats->>'hp')::integer,100)),
        'max_hp',greatest(1,coalesce((v_monster.stats->>'hp')::integer,100)),
        'attack',greatest(1,coalesce((v_monster.stats->>'attack')::integer,10)),
        'material_ids',to_jsonb(coalesce(v_monster.material_ids,'{}'::text[]))
      ));
    end loop;
  else
    select id,name_fa,level,stats,material_ids,kind into v_monster
    from public.etranom_content_monsters
    where region_id=new.region_id
      and kind=case when v_kind='mini_boss' then 'mini_boss' else 'area_boss' end
    order by random() limit 1;
    if v_monster.id is null then raise exception 'party_elite_encounter_missing'; end if;
    v_monsters:=jsonb_build_array(jsonb_build_object(
      'id',v_monster.id,'name',v_monster.name_fa,'kind',v_kind,'level',v_monster.level,
      'hp',greatest(1,round(coalesce((v_monster.stats->>'hp')::numeric,500)*v_scale)::integer),
      'max_hp',greatest(1,round(coalesce((v_monster.stats->>'hp')::numeric,500)*v_scale)::integer),
      'attack',greatest(1,round(coalesce((v_monster.stats->>'attack')::numeric,25)*v_scale)::integer),
      'material_ids',to_jsonb(coalesce(v_monster.material_ids,'{}'::text[]))
    ));
  end if;

  for v_member in
    select pm.user_id,coalesce(pp.player_level,1) player_level
    from public.party_members pm left join public.player_profiles pp on pp.user_id=pm.user_id
    where pm.party_id=new.party_id
  loop
    v_player_hp:=v_player_hp || jsonb_build_object(v_member.user_id::text,100+greatest(1,least(999,v_member.player_level))*12);
  end loop;

  insert into public.party_battle_state(
    session_id,party_id,region_id,encounter_id,encounter_name,round_no,
    monster_hp,monster_max_hp,player_hp,encounter_type,group_size,monsters,kills_by_user
  ) values (
    new.id,new.party_id,new.region_id,
    coalesce(v_monsters->0->>'id','party_encounter'),
    coalesce(v_monsters->0->>'name','گروه هیولاها'),1,
    (select coalesce(sum((e.value->>'hp')::integer),0) from jsonb_array_elements(v_monsters) as e(value)),
    (select coalesce(sum((e.value->>'max_hp')::integer),0) from jsonb_array_elements(v_monsters) as e(value)),
    v_player_hp,v_kind,v_count,v_monsters,'{}'::jsonb
  ) on conflict(session_id) do nothing;
  return new;
end $$;

commit;
