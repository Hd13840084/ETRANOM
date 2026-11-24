-- ETRANOM v165.3: sync Region 1 multiplayer catalog and raise party coins by 20%.
begin;
insert into public.etranom_content_monsters(id,region_id,name_fa,kind,level,stats,material_ids,skills,respawns) values
('ash_crow','burnt_forest','کلاغ خاکستر','normal',1,'{"power":8,"speed":20,"endurance":5,"vitality":17,"intellect":3,"perception":21,"luck":3,"faith":2,"hp":250,"mp":0,"attack":20,"defense":4,"accuracy":90}'::jsonb,array['ash_crow_feather']::text[],'[]'::jsonb,true),
('ashen_flame_stalker','burnt_forest','سایه‌بان شعله‌مرده','normal',1,'{"power":9,"speed":22,"endurance":5,"vitality":19,"intellect":5,"perception":25,"luck":5,"faith":3,"hp":288,"mp":44,"attack":21,"defense":5,"accuracy":91}'::jsonb,array['ashen_stalker_essence']::text[],'["ashen_ambush"]'::jsonb,true),
('burnt_ash_wolf','burnt_forest','گرگ خاکستری سوخته','normal',1,'{"power":10,"speed":22,"endurance":5,"vitality":22,"intellect":3,"perception":26,"luck":2,"faith":2,"hp":325,"mp":0,"attack":23,"defense":6,"accuracy":92}'::jsonb,array['burnt_wolf_pelt']::text[],'[]'::jsonb,true),
('deadroot_crawler','burnt_forest','ریشه‌خوار مرده','normal',1,'{"power":10,"speed":24,"endurance":6,"vitality":24,"intellect":3,"perception":23,"luck":5,"faith":2,"hp":362,"mp":0,"attack":24,"defense":7,"accuracy":93}'::jsonb,array['deadroot_fiber']::text[],'[]'::jsonb,true),
('emberwound_stinger','burnt_forest','حشره آتش‌زخم','normal',1,'{"power":11,"speed":24,"endurance":6,"vitality":27,"intellect":5,"perception":27,"luck":5,"faith":3,"hp":400,"mp":59,"attack":26,"defense":8,"accuracy":94}'::jsonb,array['emberwound_stinger']::text[],'["emberwound_sting"]'::jsonb,true),
('ashroot_warden','burnt_forest','ریشه‌سالار خاکستر','mini_boss',1,'{"power":14,"speed":16,"endurance":9,"vitality":87,"intellect":11,"perception":21,"luck":3,"faith":3,"hp":1350,"mp":70,"attack":31,"defense":11,"accuracy":96}'::jsonb,array['ashroot_core','warden_bark_plate']::text[],'["warden_root_slam","warden_entangling_roots","warden_ember_core"]'::jsonb,true),
('thorn_grove_monster_1','thorn_grove','روباه خارپوش','normal',2,'{"power":9,"speed":19,"endurance":5,"vitality":25,"intellect":20,"perception":80,"luck":16,"faith":11,"hp":380,"mp":0,"attack":22,"defense":6,"accuracy":92}'::jsonb,array['thorn_hide']::text[],'[]'::jsonb,true),
('thorn_grove_monster_2','thorn_grove','کلاغ تیغ‌دار','normal',2,'{"power":10,"speed":20,"endurance":6,"vitality":29,"intellect":31,"perception":87,"luck":18,"faith":17,"hp":440,"mp":66,"attack":23,"defense":7,"accuracy":93}'::jsonb,array['barbed_quill']::text[],'["thorn_grove_barbed_dive"]'::jsonb,true),
('thorn_grove_monster_3','thorn_grove','کرم ریشه‌خوار','normal',2,'{"power":10,"speed":21,"endurance":6,"vitality":33,"intellect":26,"perception":76,"luck":14,"faith":21,"hp":500,"mp":0,"attack":25,"defense":8,"accuracy":94}'::jsonb,array['briar_sap']::text[],'[]'::jsonb,true),
('thorn_grove_monster_4','thorn_grove','سوسک خارخون','normal',2,'{"power":11,"speed":22,"endurance":7,"vitality":37,"intellect":50,"perception":91,"luck":22,"faith":30,"hp":560,"mp":84,"attack":26,"defense":9,"accuracy":95}'::jsonb,array['thorn_mandible']::text[],'["thorn_grove_spore_cloud"]'::jsonb,true),
('thorn_grove_monster_5','thorn_grove','گرگ بیشه‌خار','normal',2,'{"power":12,"speed":23,"endurance":8,"vitality":41,"intellect":39,"perception":100,"luck":24,"faith":24,"hp":620,"mp":0,"attack":28,"defense":10,"accuracy":96}'::jsonb,array['bramble_heart']::text[],'[]'::jsonb,true),
('thorn_grove_miniboss','thorn_grove','مادر بیشه‌خار','mini_boss',2,'{"power":15,"speed":15,"endurance":12,"vitality":134,"intellect":178,"perception":74,"luck":22,"faith":108,"hp":2015,"mp":112,"attack":34,"defense":14,"accuracy":98}'::jsonb,array['thorn_matriarch_blood','barbed_crown']::text[],'["heavy_strike","area_slam","guardian_fury"]'::jsonb,true),
('ash_hills_monster_1','ash_hills','سوسک سنگستر','normal',3,'{"power":10,"speed":18,"endurance":7,"vitality":43,"intellect":38,"perception":112,"luck":28,"faith":20,"hp":650,"mp":98,"attack":25,"defense":9,"accuracy":94}'::jsonb,array['ashstone_shard']::text[],'["ash_hills_cinder_burst"]'::jsonb,true),
('ash_hills_monster_2','ash_hills','مار خاکسترپوش','normal',3,'{"power":11,"speed":18,"endurance":8,"vitality":49,"intellect":49,"perception":121,"luck":30,"faith":24,"hp":740,"mp":0,"attack":26,"defense":10,"accuracy":95}'::jsonb,array['cinder_beetle_shell']::text[],'[]'::jsonb,true),
('ash_hills_monster_3','ash_hills','خرگوش خاکستری','normal',3,'{"power":12,"speed":20,"endurance":9,"vitality":55,"intellect":42,"perception":105,"luck":24,"faith":35,"hp":830,"mp":0,"attack":28,"defense":11,"accuracy":96}'::jsonb,array['grey_rockhide']::text[],'[]'::jsonb,true),
('ash_hills_monster_4','ash_hills','خفاش زغالین','normal',3,'{"power":12,"speed":20,"endurance":10,"vitality":61,"intellect":79,"perception":124,"luck":36,"faith":47,"hp":920,"mp":133,"attack":29,"defense":12,"accuracy":97}'::jsonb,array['coal_moth_dust']::text[],'["ash_hills_stone_skin"]'::jsonb,true),
('ash_hills_monster_5','ash_hills','دندان‌سنگ تپه','normal',3,'{"power":13,"speed":22,"endurance":10,"vitality":67,"intellect":63,"perception":136,"luck":38,"faith":38,"hp":1010,"mp":0,"attack":31,"defense":13,"accuracy":98}'::jsonb,array['slagfang_tooth']::text[],'[]'::jsonb,true),
('ash_hills_miniboss','ash_hills','سنگ‌شکن اخگر','mini_boss',3,'{"power":17,"speed":14,"endurance":15,"vitality":219,"intellect":340,"perception":109,"luck":37,"faith":205,"hp":3282,"mp":199,"attack":37,"defense":18,"accuracy":100}'::jsonb,array['cinder_colossus_core','basalt_plate']::text[],'["heavy_strike","area_slam","guardian_fury"]'::jsonb,true),
('vardash_river_monster_1','vardash_river','ماهی فلس‌خاکستری','normal',4,'{"power":12,"speed":16,"endurance":10,"vitality":63,"intellect":61,"perception":159,"luck":47,"faith":35,"hp":950,"mp":0,"attack":28,"defense":12,"accuracy":96}'::jsonb,array['vardash_scale']::text[],'[]'::jsonb,true),
('vardash_river_monster_2','vardash_river','مارماهی ورداش','normal',4,'{"power":12,"speed":17,"endurance":10,"vitality":72,"intellect":77,"perception":174,"luck":51,"faith":41,"hp":1080,"mp":177,"attack":29,"defense":13,"accuracy":97}'::jsonb,array['river_reed_fiber']::text[],'["vardash_river_current_lash"]'::jsonb,true),
('vardash_river_monster_3','vardash_river','خرچنگ گِل‌سنگ','normal',4,'{"power":13,"speed":18,"endurance":11,"vitality":81,"intellect":69,"perception":153,"luck":43,"faith":51,"hp":1210,"mp":0,"attack":31,"defense":14,"accuracy":98}'::jsonb,array['mudfin_tooth']::text[],'[]'::jsonb,true),
('vardash_river_monster_4','vardash_river','پرنده نیزار','normal',4,'{"power":13,"speed":19,"endurance":12,"vitality":89,"intellect":124,"perception":183,"luck":61,"faith":77,"hp":1340,"mp":0,"attack":32,"defense":15,"accuracy":99}'::jsonb,array['silver_gill']::text[],'[]'::jsonb,true),
('vardash_river_monster_5','vardash_river','شکارچی آب‌تیره','normal',4,'{"power":14,"speed":20,"endurance":13,"vitality":98,"intellect":102,"perception":201,"luck":64,"faith":64,"hp":1470,"mp":239,"attack":34,"defense":16,"accuracy":100}'::jsonb,array['current_pearl']::text[],'["vardash_river_depth_call"]'::jsonb,true),
('vardash_river_miniboss','vardash_river','مارسالار ورداش','mini_boss',4,'{"power":18,"speed":14,"endurance":19,"vitality":319,"intellect":557,"perception":144,"luck":55,"faith":335,"hp":4778,"mp":308,"attack":41,"defense":22,"accuracy":102}'::jsonb,array['river_hydra_scale','deepwater_essence']::text[],'["heavy_strike","area_slam","guardian_fury"]'::jsonb,true),
('southern_plains_monster_1','southern_plains','گرگ دشت‌گرد','normal',5,'{"power":13,"speed":14,"endurance":12,"vitality":90,"intellect":102,"perception":238,"luck":81,"faith":63,"hp":1350,"mp":0,"attack":31,"defense":15,"accuracy":98}'::jsonb,array['plainstalker_hide']::text[],'[]'::jsonb,true),
('southern_plains_monster_2','southern_plains','شاهین آفتاب‌سوخته','normal',5,'{"power":13,"speed":16,"endurance":13,"vitality":102,"intellect":128,"perception":263,"luck":88,"faith":73,"hp":1530,"mp":0,"attack":32,"defense":16,"accuracy":99}'::jsonb,array['sunhawk_feather']::text[],'[]'::jsonb,true),
('southern_plains_monster_3','southern_plains','موش‌خرمای خاکی','normal',5,'{"power":14,"speed":16,"endurance":14,"vitality":114,"intellect":127,"perception":231,"luck":77,"faith":89,"hp":1710,"mp":336,"attack":34,"defense":17,"accuracy":100}'::jsonb,array['drygrass_fiber']::text[],'["southern_plains_blood_rush"]'::jsonb,true),
('southern_plains_monster_4','southern_plains','گراز غبارآلود','normal',5,'{"power":15,"speed":18,"endurance":14,"vitality":126,"intellect":201,"perception":278,"luck":105,"faith":117,"hp":1890,"mp":0,"attack":35,"defense":18,"accuracy":101}'::jsonb,array['dusthorn']::text[],'[]'::jsonb,true),
('southern_plains_monster_5','southern_plains','شیر علفزار','normal',5,'{"power":16,"speed":18,"endurance":15,"vitality":138,"intellect":181,"perception":308,"luck":111,"faith":111,"hp":2070,"mp":408,"attack":37,"defense":19,"accuracy":102}'::jsonb,array['yellowfang_claw']::text[],'["southern_plains_sunfire_roar"]'::jsonb,true),
('southern_plains_miniboss','southern_plains','شاخ‌دار دشت جنوبی','mini_boss',5,'{"power":20,"speed":14,"endurance":22,"vitality":449,"intellect":845,"perception":185,"luck":82,"faith":508,"hp":6728,"mp":451,"attack":44,"defense":26,"accuracy":104}'::jsonb,array['plains_alpha_bone','savanna_heart']::text[],'["heavy_strike","area_slam","guardian_fury"]'::jsonb,true),
('rootbound_ruins_monster_1','rootbound_ruins','نگهبان شکسته','normal',5,'{"power":14,"speed":13,"endurance":14,"vitality":117,"intellect":197,"perception":451,"luck":152,"faith":130,"hp":1750,"mp":0,"attack":34,"defense":18,"accuracy":100}'::jsonb,array['rune_dust']::text[],'[]'::jsonb,true),
('rootbound_ruins_monster_2','rootbound_ruins','عنکبوت رون‌خورده','normal',5,'{"power":15,"speed":14,"endurance":15,"vitality":132,"intellect":238,"perception":488,"luck":169,"faith":139,"hp":1980,"mp":521,"attack":35,"defense":19,"accuracy":101}'::jsonb,array['rootstone_fragment']::text[],'["rootbound_ruins_rune_web"]'::jsonb,true),
('rootbound_ruins_monster_3','rootbound_ruins','پیکر ریشه‌ای','normal',5,'{"power":16,"speed":15,"endurance":16,"vitality":147,"intellect":249,"perception":438,"luck":146,"faith":164,"hp":2210,"mp":0,"attack":37,"defense":20,"accuracy":102}'::jsonb,array['ancient_thread']::text[],'[]'::jsonb,true),
('rootbound_ruins_monster_4','rootbound_ruins','سایه کتیبه','normal',5,'{"power":16,"speed":16,"endurance":17,"vitality":163,"intellect":360,"perception":512,"luck":190,"faith":209,"hp":2440,"mp":649,"attack":38,"defense":21,"accuracy":103}'::jsonb,array['sealed_wax']::text[],'["rootbound_ruins_ancient_pulse"]'::jsonb,true),
('rootbound_ruins_monster_5','rootbound_ruins','پاسدار بی‌نام','normal',5,'{"power":17,"speed":17,"endurance":18,"vitality":178,"intellect":327,"perception":558,"luck":205,"faith":205,"hp":2670,"mp":0,"attack":40,"defense":22,"accuracy":104}'::jsonb,array['memory_shard']::text[],'[]'::jsonb,true),
('rootbound_region_boss','rootbound_ruins','نگهبان واپسین ریشه‌پوش','area_boss',5,'{"power":22,"speed":13,"endurance":29,"vitality":613,"intellect":4076,"perception":238,"luck":105,"faith":2444,"hp":9200,"mp":1222,"attack":48,"defense":34,"accuracy":108}'::jsonb,array['rootbound_relic','old_guardian_seal','memory_shard']::text[],'["root_wave","rune_break","ancient_collapse"]'::jsonb,true)
on conflict(id) do update set region_id=excluded.region_id,name_fa=excluded.name_fa,kind=excluded.kind,level=excluded.level,stats=excluded.stats,material_ids=excluded.material_ids,skills=excluded.skills,respawns=excluded.respawns,updated_at=now();

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
  stamina_max numeric := 100;
  stamina_now numeric := 100;
  attack_stat text := 'power';
  attack_value numeric := 12;
  defense_value numeric := 0;
  vitality numeric := 12;
  intellect numeric := 10;
  faith numeric := 10;
  endurance numeric := 10;
  perception numeric := 10;
  luck numeric := 10;
  crit_chance numeric := 0;
  wizard_power numeric := 0;
  wizard_multiplier numeric := 1;
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
  level_no:=greatest(1,least(100,coalesce(nullif(c->>'level','')::integer,1)));
  vitality:=greatest(0,coalesce(nullif(stats->>'vitality','')::numeric,12));
  intellect:=greatest(0,coalesce(nullif(stats->>'intellect','')::numeric,10));
  perception:=greatest(0,coalesce(nullif(stats->>'perception','')::numeric,10));
  luck:=greatest(0,coalesce(nullif(stats->>'luck','')::numeric,10));
  faith:=greatest(0,coalesce(nullif(stats->>'faith','')::numeric,10));
  endurance:=greatest(0,coalesce(nullif(stats->>'endurance','')::numeric,10));
  if class_name in ('جادوگر','احضارگر','کشیش','شمن','Wizard') then attack_stat:='intellect';
  elsif class_name in ('راهب','پالادین') then attack_stat:='faith';
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
  -- +50% attack/skill power tuning for Arcane Mage, Elementalist and Warlock only.
  -- Necromancer is deliberately excluded; the same profile feeds group attacks and skills.
  if class_name in ('جادوگر','Wizard') and specialization_name in ('آرکین‌میج','آرکین میج','Arcane Mage','المنتالیست','Elementalist','وارلاک','Warlock') then
    attack_value:=floor(attack_value*1.50);
    wizard_multiplier:=1.50;
  end if;
  perception:=perception+coalesce(nullif(gear->>'perception','')::numeric,0);
  luck:=luck+coalesce(nullif(gear->>'luck','')::numeric,0);
  crit_chance:=least(55,greatest(0,coalesce(nullif(gear->>'crit','')::numeric,0)+coalesce(nullif(gear->>'luck','')::numeric,0)*.25+coalesce(nullif(gear->>'perception','')::numeric,0)*.15+greatest(0,coalesce(nullif(stats->>'luck','')::numeric,10))*.15+greatest(0,coalesce(nullif(stats->>'perception','')::numeric,10))*.08));
  wizard_power:=((intellect+coalesce(nullif(gear->>'intellect','')::numeric,0))*5+coalesce(nullif(gear->>'magicPower','')::numeric,0))*wizard_multiplier;
  defense_value:=greatest(0,coalesce(nullif(gear->>'defense','')::numeric,0)+floor(endurance*.5));
  hp_max:=greatest(1,coalesce(nullif(c->>'maxHp','')::numeric,120)+coalesce(nullif(gear->>'hp','')::numeric,0)+vitality*10);
  mp_max:=greatest(1,coalesce(nullif(c->>'maxMp','')::numeric,60)+coalesce(nullif(gear->>'mp','')::numeric,0)+intellect*8+case when class_name in ('راهب','کشیش','پالادین','شمن') then faith*8 else 0 end);
  hp_now:=greatest(0,least(hp_max,coalesce(nullif(c->>'hp','')::numeric,hp_max)));
  mp_now:=greatest(0,least(mp_max,coalesce(nullif(c->>'mp','')::numeric,mp_max)));
  stamina_max:=greatest(1,coalesce(nullif(c->>'maxStamina','')::numeric,100)+coalesce(nullif(gear->>'stamina','')::numeric,0));
  stamina_now:=greatest(0,least(stamina_max,coalesce(nullif(c->>'stamina','')::numeric,stamina_max)));
  return jsonb_build_object('level',level_no,'class',class_name,'specialization',specialization_name,'attack_stat',attack_stat,
    'hp',floor(hp_now),'max_hp',floor(hp_max),'mp',floor(mp_now),'max_mp',floor(mp_max),'stamina',floor(stamina_now),'max_stamina',floor(stamina_max),
    'attack',floor(attack_value),'defense',floor(defense_value),'perception',floor(perception),'crit_chance',crit_chance,'wizard_power',floor(wizard_power),'gear',gear);
end $$;

create or replace function public.etranom_party_battle_bootstrap()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_count integer;
  v_monster_count integer;
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
    v_monster_count:=v_count + floor(random()*(2*v_count+1))::integer;
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
        'defense',greatest(0,coalesce((v_monster.stats->>'defense')::integer,0)),
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
      'defense',greatest(0,round(coalesce((v_monster.stats->>'defense')::numeric,0)*v_scale)::integer),
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

create or replace function public.etranom_party_battle_act(p_session_id uuid,p_action text,p_target_index integer default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid:=auth.uid(); v_party uuid; st public.party_battle_state%rowtype;
  profiles jsonb; hpmap jsonb; guards jsonb; monsters jsonb; kills jsonb; profile jsonb;
  monster jsonb; item jsonb; drop_item jsonb; inventory jsonb; next_inventory jsonb; v_save_data jsonb;
  idx integer; ord integer; hp integer; maxhp integer; mp integer; maxmp integer; attack_power integer; defense_power integer;
  damage integer:=0; newhp integer; done_count integer; alive_count integer; level_no integer;
  action_name text:=p_action; potion_effect text; potion_power integer; found_potion boolean:=false;
  material_drops jsonb:='[]'::jsonb; coins integer:=0; min_coins integer; max_coins integer; monster_level integer;
  q numeric; xp_gain integer:=20; v_recipe text; v_class text; m record; enemy_damage integer; target_uid uuid; target_hp integer; member_damage integer; v_ledger_rows integer:=0; v_recipe_rarity text; v_recipe_chance numeric; v_skill_id text; v_skill jsonb; v_skill_type text; v_spec_key text; v_spec_name text; v_mana_cost integer; v_cooldowns jsonb; v_action_label text:=p_action; v_skill_pct numeric; v_skill_value integer; v_perception numeric:=10; v_hit_chance numeric:=85; v_crit_chance numeric:=0; v_skill_power numeric:=0; v_raw_damage numeric:=0;
begin
  if uid is null then raise exception 'auth_required'; end if;
  if left(action_name,6)='skill:' then v_skill_id:=substring(action_name from 7); action_name:='skill'; end if;
  if action_name not in ('attack','skill','guard','heal','potion','retreat') then raise exception 'battle_action_invalid'; end if;
  if v_skill_id is not null and (v_skill_id !~ '^[a-z0-9_]+$' or length(v_skill_id)>48) then raise exception 'party_skill_invalid'; end if;
  select s.party_id into v_party from public.party_sessions s join public.party_members pm on pm.party_id=s.party_id and pm.user_id=uid
    where s.id=p_session_id and s.status='active';
  if v_party is null then raise exception 'battle_not_available'; end if;
  select * into st from public.party_battle_state where session_id=p_session_id for update;
  if st.status<>'active' then raise exception 'battle_already_finished'; end if;
  perform public.etranom_party_battle_heartbeat(p_session_id);
  if exists(select 1 from public.party_battle_retreats r where r.session_id=p_session_id and r.user_id=uid) then
    raise exception 'party_player_already_retreated';
  end if;
  if action_name<>'retreat' and exists(select 1 from public.party_battle_actions a where a.session_id=p_session_id and a.round_no=st.round_no and a.user_id=uid) then
    raise exception 'already_acted_this_round';
  end if;
  profiles:=st.player_combat; hpmap:=st.player_hp; guards:=st.player_guard; monsters:=st.monsters; kills:=st.kills_by_user;
  profile:=profiles -> (uid::text);
  if profile is null then profile:=public.etranom_party_character_combat_profile(uid); profiles:=profiles||jsonb_build_object(uid::text,profile); end if;
  hp:=coalesce((hpmap->>uid::text)::integer,0); maxhp:=greatest(1,coalesce((profile->>'max_hp')::integer,100));
  mp:=greatest(0,coalesce((profile->>'mp')::integer,0)); maxmp:=greatest(1,coalesce((profile->>'max_mp')::integer,60));
  attack_power:=greatest(1,coalesce((profile->>'attack')::integer,10)); defense_power:=greatest(0,coalesce((profile->>'defense')::integer,0));
  level_no:=greatest(1,coalesce((profile->>'level')::integer,1));
  v_perception:=greatest(0,coalesce((profile->>'perception')::numeric,10));
  v_crit_chance:=greatest(0,least(55,coalesce((profile->>'crit_chance')::numeric,0)));
  v_skill_power:=greatest(1,coalesce((profile->>'wizard_power')::numeric,attack_power*5+coalesce((profile->'gear'->>'magicPower')::numeric,0)));
  if hp<=0 then raise exception 'player_defeated'; end if;

  if action_name in ('attack','skill') then
    if v_skill_id is not null then
      select gs.save_data->'character'->>'specialization' into v_spec_name
        from public.game_saves gs where gs.user_id=uid;
      v_spec_key:=case v_spec_name
        when 'آرکین‌میج' then 'wizard_arcane_mage'
        when 'آرکین میج' then 'wizard_arcane_mage'
        when 'Arcane Mage' then 'wizard_arcane_mage'
        when 'المنتالیست' then 'wizard_elementalist'
        when 'Elementalist' then 'wizard_elementalist'
        when 'وارلاک' then 'wizard_warlock'
        when 'Warlock' then 'wizard_warlock'
        when 'نکرومنسر' then 'wizard_necromancer'
        when 'Necromancer' then 'wizard_necromancer' else null end;
      if v_spec_key is null then raise exception 'party_skill_specialization_unsupported'; end if;
      select skill_data into v_skill from public.party_battle_skill_catalog
        where specialization_key=v_spec_key and skill_id=v_skill_id and enabled;
      if v_skill is null then raise exception 'party_skill_not_available'; end if;
      if level_no < coalesce((v_skill->>'unlockLevel')::integer,1) then raise exception 'party_skill_locked'; end if;
      v_cooldowns:=coalesce(profile->'party_skill_cooldowns','{}'::jsonb);
      if coalesce((v_cooldowns->>v_skill_id)::integer,0)>0 and coalesce((v_cooldowns->>v_skill_id)::integer,0)>=st.round_no then raise exception 'party_skill_cooldown'; end if;
      v_mana_cost:=greatest(0,ceil(maxmp*coalesce((v_skill->>'manaPct')::numeric,0)/100)::integer);
      if mp<v_mana_cost then raise exception 'insufficient_mana'; end if;
      mp:=mp-v_mana_cost;
      v_skill_type:=coalesce(v_skill->>'type','');
      v_skill_pct:=coalesce((v_skill->>'damagePct')::numeric,0);
      v_skill_value:=greatest(0,coalesce((v_skill->>'shieldPct')::integer,0));
      if v_skill_type='shield' then
        profile:=jsonb_set(profile,'{party_shield_hp}',to_jsonb(greatest(coalesce((profile->>'party_shield_hp')::integer,0),floor((attack_power*5+coalesce((profile->'gear'->>'magicPower')::integer,0))*v_skill_value/100)::integer)),true);
        profile:=jsonb_set(profile,'{party_shield_turns}',to_jsonb(greatest(1,coalesce((v_skill->>'durationTurns')::integer,2))),true);
      elsif v_skill_type='self_heal' then
        hpmap:=hpmap||jsonb_build_object(uid::text,least(maxhp,hp+greatest(1,floor((attack_power*5+coalesce((profile->'gear'->>'magicPower')::integer,0))*coalesce((v_skill->>'healPct')::numeric,220)/100)::integer)));
      elsif v_skill_type not in ('single_damage') then
        raise exception 'party_skill_effect_not_supported_yet';
      end if;
      v_cooldowns:=jsonb_set(v_cooldowns,array[v_skill_id],to_jsonb(st.round_no+greatest(0,coalesce((v_skill->>'cooldownTurns')::integer,0))),true);
      profile:=jsonb_set(profile,'{party_skill_cooldowns}',v_cooldowns,true);
    end if;
    idx:=null; monster:=null;
    if p_target_index is not null then
      select q.x,q.ord::integer into monster,idx from jsonb_array_elements(monsters) with ordinality q(x,ord)
       where q.ord=p_target_index and coalesce((q.x->>'hp')::integer,0)>0;
    else
      for item,ord in select x,ord::integer from jsonb_array_elements(monsters) with ordinality q(x,ord) loop
        if coalesce((item->>'hp')::integer,0)>0 then idx:=ord; monster:=item; exit; end if;
      end loop;
    end if;
    if idx is null then raise exception 'party_target_invalid_or_defeated'; end if;
    if v_skill_id is not null then
      v_hit_chance:=greatest(65,least(99,88+(v_perception-10)*.30));
      if v_skill_type='single_damage' then
        if random()*100>=v_hit_chance then damage:=0;
        else
          damage:=greatest(1,floor(v_skill_power*v_skill_pct/100*(100/(100+greatest(0,coalesce((monster->>'defense')::numeric,0))*1.25)))::integer);
          if random()*100<v_crit_chance then damage:=floor(damage*1.5)::integer; end if;
        end if;
      else damage:=0; end if;
    elsif action_name='skill' then
      if mp<8 then raise exception 'insufficient_mana'; end if;
      mp:=mp-8; v_hit_chance:=greatest(65,least(98,85+(v_perception-10)*.35));
      if random()*100>=v_hit_chance then damage:=0;
      else damage:=greatest(5,floor((10+attack_power*2.8+random()*4)*(100/(100+greatest(0,coalesce((monster->>'defense')::numeric,0))*1.25)))::integer); end if;
    else
      v_hit_chance:=greatest(65,least(98,85+(v_perception-10)*.35));
      if random()*100>=v_hit_chance then damage:=0;
      else
        v_raw_damage:=attack_power*2.2+random()*4;
        if random()*100<v_crit_chance then v_raw_damage:=v_raw_damage+greatest(2,floor(attack_power*.5)); end if;
        damage:=greatest(3,floor(v_raw_damage*(100/(100+greatest(0,coalesce((monster->>'defense')::numeric,0))*1.25)))::integer);
      end if;
    end if;
    if v_skill_id is not null and v_skill_type in ('shield','self_heal') then
      newhp:=coalesce((monster->>'hp')::integer,0);
    else
      newhp:=greatest(0,coalesce((monster->>'hp')::integer,0)-damage);
      monster:=jsonb_set(monster,'{hp}',to_jsonb(newhp),true);
      monsters:=jsonb_set(monsters,array[(idx-1)::text],monster,true);
    end if;

    if v_skill_id is null or v_skill_type='single_damage' then
    if newhp=0 then
      kills:=jsonb_set(kills,array[uid::text],to_jsonb(coalesce((kills->>uid::text)::integer,0)+1),true);
      for drop_item in select value from jsonb_array_elements(coalesce(monster->'material_ids','[]'::jsonb)) loop
        if random()<0.5 then material_drops:=material_drops||jsonb_build_array(jsonb_build_object('id',drop_item#>>'{}','qty',1)); end if;
      end loop;
      monster_level:=greatest(1,least(5,coalesce((monster->>'level')::integer,1)));
      case monster_level when 1 then min_coins:=10;max_coins:=15; when 2 then min_coins:=100;max_coins:=200;
        when 3 then min_coins:=400;max_coins:=600; when 4 then min_coins:=1000;max_coins:=1800; else min_coins:=3000;max_coins:=5000; end case;
      q:=greatest(0,least(1,(coalesce((monster->>'max_hp')::numeric,100)+4*coalesce((monster->>'attack')::numeric,10))/greatest(1,monster_level*500)::numeric));
      coins:=round((min_coins+floor((max_coins-min_coins+1)*least(.999999,random()*.65+.35*q))::integer)*1.20)::integer;
      v_class:=coalesce(nullif(profile->>'class',''),'جنگجو'); -- retained for backward-compatible profile parsing; recipe access is public.
      v_recipe:=null; v_recipe_rarity:=null; v_recipe_chance:=null;
      select r.id,d.rarity,case when d.rarity='اسطوره‌ای' then 2 else d.drop_chance end
        into v_recipe,v_recipe_rarity,v_recipe_chance
        from public.etranom_content_recipes r
        join public.etranom_recipe_drop_catalog d on d.recipe_id=r.id
       where d.region_id=st.region_id
         and d.source_id=coalesce(monster->>'id','')
         and d.source_type in ('monster','dungeon_boss','tower_boss')
         and (d.rarity<>'اسطوره‌ای' or d.source_id='rootbound_region_boss')
       order by random() limit 1;
      if v_recipe is not null and random()*100 >= coalesce(v_recipe_chance,0) then v_recipe:=null; end if;
      select gs.save_data into v_save_data from public.game_saves gs where gs.user_id=uid for update;
      if v_save_data is null then raise exception 'player_save_missing_for_party_reward'; end if;
      inventory:=case when jsonb_typeof(v_save_data->'inventory')='array' then v_save_data->'inventory' else '[]'::jsonb end;
      for drop_item in select value from jsonb_array_elements(material_drops) loop
        found_potion:=false; next_inventory:='[]'::jsonb;
        for item in select value from jsonb_array_elements(inventory) loop
          if item->>'id'=drop_item->>'id' and not found_potion then
            next_inventory:=next_inventory||jsonb_set(item,'{qty}',to_jsonb(coalesce(nullif(item->>'qty','')::integer,1)+coalesce((drop_item->>'qty')::integer,1)),true); found_potion:=true;
          else next_inventory:=next_inventory||jsonb_build_array(item); end if;
        end loop;
        if not found_potion then next_inventory:=next_inventory||jsonb_build_array(jsonb_build_object('id',drop_item->>'id','name',drop_item->>'id','qty',1,'category','material')); end if;
        inventory:=next_inventory;
      end loop;
      -- XP is taken from the encounter record when present; 15 remains the
      -- compatibility fallback for older encounter payloads.
      xp_gain:=public.etranom_monster_xp_from_hp(monster);
      -- Insert the unique kill row BEFORE mutating the persistent save. The
      -- transaction and unique key together make all rewards idempotent.
      insert into public.party_battle_kill_ledger(session_id,monster_index,monster_id,user_id,material_drops,recipe_id,xp,coins)
        values(p_session_id,idx,coalesce(monster->>'id','monster'),uid,material_drops,v_recipe,xp_gain,coins)
        on conflict(session_id,monster_index) do nothing;
      get diagnostics v_ledger_rows = row_count;
      if v_ledger_rows = 1 then
        v_save_data:=jsonb_set(jsonb_set(v_save_data,'{gold}',to_jsonb(coalesce(nullif(v_save_data->>'gold','')::bigint,0)+coins),true),'{inventory}',inventory,true);
        v_save_data:=jsonb_set(v_save_data,'{character,xp}',to_jsonb(coalesce(nullif(v_save_data#>>'{character,xp}','')::bigint,0)+xp_gain),true);
        if v_recipe is not null then
          if jsonb_typeof(v_save_data->'knownRecipes')<>'array' or v_save_data->'knownRecipes' is null then
            v_save_data:=jsonb_set(v_save_data,'{knownRecipes}','[]'::jsonb,true);
          end if;
          if not (v_save_data->'knownRecipes' @> jsonb_build_array(v_recipe)) then
            v_save_data:=jsonb_set(v_save_data,'{knownRecipes}',(v_save_data->'knownRecipes')||jsonb_build_array(v_recipe),true);
          end if;
        end if;
        update public.game_saves gs set save_data=jsonb_set(v_save_data,'{updatedAt}',to_jsonb(now()::text),true),updated_at=now() where gs.user_id=uid;
        insert into public.party_battle_reward_ledger(session_id,user_id,xp,coins,materials)
          values(p_session_id,uid,xp_gain,coins,material_drops)
          on conflict(session_id,user_id) do update set xp=public.party_battle_reward_ledger.xp+excluded.xp,
            coins=public.party_battle_reward_ledger.coins+excluded.coins,materials=public.party_battle_reward_ledger.materials||excluded.materials;
      end if;
    end if;
    end if;
  elsif action_name='guard' then
    guards:=guards||jsonb_build_object(uid::text,true);
  elsif action_name='heal' then
    newhp:=least(maxhp,hp+greatest(20,floor(maxhp*.20)::integer)); hpmap:=hpmap||jsonb_build_object(uid::text,newhp);
  elsif action_name='potion' then
    select gs.save_data into v_save_data from public.game_saves gs where gs.user_id=uid for update;
    if v_save_data is null then raise exception 'player_save_missing'; end if;
    inventory:=case when jsonb_typeof(v_save_data->'inventory')='array' then v_save_data->'inventory' else '[]'::jsonb end;
    next_inventory:='[]'::jsonb;
    for item in select value from jsonb_array_elements(inventory) loop
      if not found_potion and coalesce((item->>'qty')::integer,0)>0 and coalesce(item->>'effect','') in ('hp','mp','regen') then
        potion_effect:=item->>'effect'; potion_power:=greatest(1,coalesce((item->>'power')::integer,50));
        if (potion_effect='mp' and mp>=maxmp) or (potion_effect<>'mp' and hp>=maxhp) then raise exception 'party_resource_already_full'; end if;
        found_potion:=true;
        if potion_effect='mp' then mp:=least(maxmp,mp+potion_power); else hpmap:=hpmap||jsonb_build_object(uid::text,least(maxhp,hp+case when potion_effect='regen' then potion_power*3 else potion_power end)); end if;
        if coalesce((item->>'qty')::integer,1)>1 then next_inventory:=next_inventory||jsonb_build_array(jsonb_set(item,'{qty}',to_jsonb((item->>'qty')::integer-1),true)); end if;
      else next_inventory:=next_inventory||jsonb_build_array(item); end if;
    end loop;
    if not found_potion then raise exception 'party_potion_unavailable'; end if;
    update public.game_saves gs set save_data=jsonb_set(v_save_data,'{inventory}',next_inventory,true),updated_at=now() where gs.user_id=uid;
  elsif action_name='retreat' then
    insert into public.party_battle_retreats(session_id,user_id)
      values(p_session_id,uid) on conflict(session_id,user_id) do nothing;
    update public.party_battle_presence
      set last_seen_at=now()-interval '2 days'
      where session_id=p_session_id and user_id=uid;
  end if;

  profile:=jsonb_set(profile,'{mp}',to_jsonb(mp),true);
  profiles:=profiles||jsonb_build_object(uid::text,profile);
  insert into public.party_battle_actions(session_id,round_no,user_id,action,damage)
    values(p_session_id,st.round_no,uid,coalesce(v_action_label,action_name),damage)
    on conflict(session_id,round_no,user_id) do update set action=excluded.action,damage=0;
  -- Only current party members participate in the turn barrier. A member who
  -- leaves or disconnects cannot keep the remaining group waiting forever.
  select count(*) into alive_count
    from public.party_members pm
    where pm.party_id=v_party
      and coalesce((hpmap->>pm.user_id::text)::integer,0)>0
      and not exists(select 1 from public.party_battle_retreats r where r.session_id=p_session_id and r.user_id=pm.user_id)
      and exists(select 1 from public.party_battle_presence bp where bp.session_id=p_session_id and bp.user_id=pm.user_id and bp.last_seen_at>now()-interval '45 seconds');
  select count(*) into done_count
    from public.party_battle_actions a
    where a.session_id=p_session_id and a.round_no=st.round_no
      and exists(select 1 from public.party_members pm
        where pm.party_id=v_party and pm.user_id=a.user_id)
      and coalesce((hpmap->>a.user_id::text)::integer,0)>0
      and not exists(select 1 from public.party_battle_retreats r where r.session_id=p_session_id and r.user_id=a.user_id)
      and exists(select 1 from public.party_battle_presence bp where bp.session_id=p_session_id and bp.user_id=a.user_id and bp.last_seen_at>now()-interval '45 seconds');

  if not exists(select 1 from jsonb_array_elements(monsters) e(value) where coalesce((e.value->>'hp')::integer,0)>0) then
    st.status:='victory'; st.completed_at:=now();
  elsif alive_count=0 then
    st.status:='defeat'; st.completed_at:=now();
  elsif done_count>=alive_count then
    select value into monster from jsonb_array_elements(monsters) where coalesce((value->>'hp')::integer,0)>0 limit 1;
    enemy_damage:=greatest(1,coalesce((monster->>'attack')::integer,12));
    for m in select pm.user_id from public.party_members pm
      where pm.party_id=v_party
        and not exists(select 1 from public.party_battle_retreats r where r.session_id=p_session_id and r.user_id=pm.user_id)
        and exists(select 1 from public.party_battle_presence bp where bp.session_id=p_session_id and bp.user_id=pm.user_id and bp.last_seen_at>now()-interval '45 seconds') loop
      target_hp:=coalesce((hpmap->>m.user_id::text)::integer,0);
      if target_hp>0 then
        profile:=profiles -> (m.user_id::text);
        defense_power:=greatest(0,coalesce((profile->>'defense')::integer,0));
        member_damage:=enemy_damage;
        profile:=profiles -> (m.user_id::text);
        if coalesce((profile->>'party_shield_turns')::integer,0)>0 then
          v_skill_value:=greatest(0,coalesce((profile->>'party_shield_hp')::integer,0));
          if v_skill_value>0 then
            v_skill_value:=greatest(0,v_skill_value-member_damage);
            member_damage:=greatest(0,member_damage-coalesce((profile->>'party_shield_hp')::integer,0));
            profile:=jsonb_set(profile,'{party_shield_hp}',to_jsonb(v_skill_value),true);
          end if;
          profile:=jsonb_set(profile,'{party_shield_turns}',to_jsonb(greatest(0,(profile->>'party_shield_turns')::integer-1)),true);
        end if;
        if coalesce((guards->>m.user_id::text)::boolean,false) then member_damage:=greatest(0,floor(member_damage*.5)::integer); end if;
        newhp:=greatest(0,target_hp-case when member_damage=0 then 0 else greatest(1,floor(member_damage*(100/(100+defense_power*1.25)))::integer) end);
        hpmap:=hpmap||jsonb_build_object(m.user_id::text,newhp);
        profiles:=profiles||jsonb_build_object(m.user_id::text,profile);
      end if;
    end loop;
    if not exists(select 1 from public.party_members pm where pm.party_id=v_party
      and coalesce((hpmap->>pm.user_id::text)::integer,0)>0
      and not exists(select 1 from public.party_battle_retreats r where r.session_id=p_session_id and r.user_id=pm.user_id)) then st.status:='defeat'; st.completed_at:=now();
    else st.round_no:=st.round_no+1; guards:='{}'::jsonb; end if;
  end if;

  update public.party_battle_state set monsters=monsters,kills_by_user=kills,
    monster_hp=(select coalesce(sum((e.value->>'hp')::integer),0) from jsonb_array_elements(monsters) e(value)),
    round_no=st.round_no,status=st.status,player_hp=hpmap,player_guard=guards,player_combat=profiles,
    updated_at=now(),completed_at=st.completed_at where session_id=p_session_id;
  if action_name='retreat' then
    select gs.save_data into v_save_data from public.game_saves gs where gs.user_id=uid for update;
    if v_save_data is not null then
      v_save_data:=jsonb_set(v_save_data,'{character,hp}',to_jsonb(coalesce((hpmap->>uid::text)::integer,0)),true);
      v_save_data:=jsonb_set(v_save_data,'{character,mp}',to_jsonb(coalesce((profiles->(uid::text)->>'mp')::integer,0)),true);
      update public.game_saves gs set save_data=v_save_data,updated_at=now() where gs.user_id=uid;
    end if;
  end if;
  if st.status in ('victory','defeat') then
    -- Persist the final surviving HP/MP values without overwriting inventory/gold rewards.
    for m in select pm.user_id from public.party_members pm where pm.party_id=v_party loop
      select gs.save_data into v_save_data from public.game_saves gs where gs.user_id=m.user_id for update;
      if v_save_data is not null then
        profile:=profiles -> (m.user_id::text);
        v_save_data:=jsonb_set(v_save_data,'{character,hp}',to_jsonb(coalesce((hpmap->>m.user_id::text)::integer,0)),true);
        v_save_data:=jsonb_set(v_save_data,'{character,mp}',to_jsonb(coalesce((profile->>'mp')::integer,0)),true);
        update public.game_saves gs set save_data=v_save_data,updated_at=now() where gs.user_id=m.user_id;
      end if;
    end loop;
    update public.party_sessions set status='completed',finished_at=now() where id=p_session_id and status='active';
    update public.parties set status='forming',region_id=null,updated_at=now() where id=v_party;
    update public.party_members set is_ready=false where party_id=v_party;
  end if;
  return public.etranom_party_battle_snapshot(p_session_id);
end $$;

commit;
