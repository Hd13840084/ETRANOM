-- ETRANOM v164: +8% Wizard attack tuning for Arcane Mage, Elementalist and Warlock.
-- Necromancer is intentionally unchanged. Apply once after party_group_battle_phase2_v151.sql.
-- Existing battle sessions keep their original snapshot; the tuning applies to new sessions.
begin;

create or replace function public.etranom_party_character_combat_profile(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  s jsonb := '{}'::jsonb;
  c jsonb := '{}'::jsonb;
  stats jsonb := '{}'::jsonb;
  slots jsonb := '{}'::jsonb;
  slot record;
  effect record;
  gear jsonb := '{}'::jsonb;
  class_name text := 'جنگجو';
  specialization_name text := '';
  level_no integer := 1;
  hp_max numeric := 120;
  hp_now numeric := 120;
  mp_max numeric := 60;
  mp_now numeric := 60;
  attack_stat text := 'power';
  attack_value numeric := 12;
  defense_value numeric := 0;
  vitality numeric := 12;
  intellect numeric := 10;
  faith numeric := 10;
  endurance numeric := 10;
  slot_ratio numeric;
  effect_value numeric;
begin
  select gs.save_data into s from public.game_saves gs where gs.user_id=p_user_id;
  if s is null then s:='{}'::jsonb; end if;
  c:=coalesce(s->'character','{}'::jsonb);
  stats:=coalesce(c->'stats','{}'::jsonb);
  slots:=coalesce(s->'equipmentSlots','{}'::jsonb);
  class_name:=coalesce(nullif(c->>'archetype',''),nullif(c->>'player_class',''),'جنگجو');
  specialization_name:=btrim(coalesce(c->>'specialization',''));
  level_no:=greatest(1,least(50,coalesce(nullif(c->>'level','')::integer,1)));
  vitality:=greatest(0,coalesce(nullif(stats->>'vitality','')::numeric,12));
  intellect:=greatest(0,coalesce(nullif(stats->>'intellect','')::numeric,10));
  faith:=greatest(0,coalesce(nullif(stats->>'faith','')::numeric,10));
  endurance:=greatest(0,coalesce(nullif(stats->>'endurance','')::numeric,10));
  if class_name in ('راهب','کشیش','پالادین','شمن') then attack_stat:='faith';
  elsif class_name in ('جادوگر','احضارگر') then attack_stat:='intellect';
  else attack_stat:='power'; end if;
  for slot in select key,value from jsonb_each(slots) loop
    if jsonb_typeof(slot.value)='object' then
      slot_ratio:=1;
      if nullif(slot.value->>'maxDurability','') is not null and coalesce(nullif(slot.value->>'maxDurability','')::numeric,0)>0 then
        slot_ratio:=greatest(0,least(1,coalesce(nullif(slot.value->>'durability','')::numeric,100)/nullif(slot.value->>'maxDurability','')::numeric));
      end if;
      for effect in select key,value from jsonb_each(coalesce(slot.value->'effects','{}'::jsonb)) loop
        if jsonb_typeof(effect.value)='number' then
          effect_value:=(effect.value#>>'{}')::numeric * slot_ratio;
          gear:=jsonb_set(gear,array[case when effect.key='agility' then 'speed' else effect.key end],to_jsonb(coalesce(nullif(gear->>(case when effect.key='agility' then 'speed' else effect.key end),'')::numeric,0)+floor(effect_value)),true);
        end if;
      end loop;
    end if;
  end loop;
  attack_value:=greatest(1,coalesce(nullif(stats->>attack_stat,'')::numeric,12)+coalesce(nullif(gear->>attack_stat,'')::numeric,0));
  -- A restrained +8% attack tuning for Arcane Mage, Elementalist and Warlock only.
  -- Necromancer is deliberately excluded; the same profile feeds group attacks and skills.
  if class_name in ('جادوگر','Wizard') and specialization_name in ('آرکین‌میج','آرکین میج','Arcane Mage','المنتالیست','Elementalist','وارلاک','Warlock') then
    attack_value:=floor(attack_value*1.08);
  end if;
  defense_value:=greatest(0,coalesce(nullif(gear->>'defense','')::numeric,0)+floor(endurance*.5));
  hp_max:=greatest(1,coalesce(nullif(c->>'maxHp','')::numeric,120)+coalesce(nullif(gear->>'hp','')::numeric,0)+vitality*10);
  mp_max:=greatest(1,coalesce(nullif(c->>'maxMp','')::numeric,60)+coalesce(nullif(gear->>'mp','')::numeric,0)+intellect*8+case when class_name in ('راهب','کشیش','پالادین','شمن') then faith*8 else 0 end);
  hp_now:=greatest(0,least(hp_max,coalesce(nullif(c->>'hp','')::numeric,hp_max)));
  mp_now:=greatest(0,least(mp_max,coalesce(nullif(c->>'mp','')::numeric,mp_max)));
  return jsonb_build_object('level',level_no,'class',class_name,'specialization',specialization_name,'attack_stat',attack_stat,
    'hp',floor(hp_now),'max_hp',floor(hp_max),'mp',floor(mp_now),'max_mp',floor(mp_max),
    'attack',floor(attack_value),'defense',floor(defense_value),'gear',gear);
end $$;


commit;
