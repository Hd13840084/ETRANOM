-- ETRANOM content pack v1: additive migration; does not alter existing player/save tables.
-- Run once in Supabase SQL Editor. Safe to re-run.
begin;
create table if not exists public.etranom_content_regions (
  id text primary key, name_fa text not null, level_min int not null, level_max int not null,
  special_content jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now()
);
create table if not exists public.etranom_content_materials (
  id text primary key, region_id text not null references public.etranom_content_regions(id),
  name_fa text not null, source_kind text not null check(source_kind in ('normal','mini_boss','area_boss','exploration')),
  source_id text not null, updated_at timestamptz not null default now()
);
create table if not exists public.etranom_content_monsters (
  id text primary key, region_id text not null references public.etranom_content_regions(id),
  name_fa text not null, kind text not null check(kind in ('normal','mini_boss','area_boss')),
  level int not null default 1, stats jsonb not null, material_ids text[] not null default '{}',
  skills jsonb not null default '[]'::jsonb, respawns boolean not null default true,
  updated_at timestamptz not null default now()
);
create table if not exists public.etranom_content_recipes (
  id text primary key, class_name text not null, slot_name text not null, item_name text not null,
  item_level int not null default 1, rarity text not null check(rarity in ('معمولی','غیرمعمول','کمیاب','حماسی','افسانه‌ای','اسطوره‌ای')),
  region_id text not null references public.etranom_content_regions(id), ingredients jsonb not null,
  stats jsonb not null, effects jsonb not null default '[]'::jsonb,
  drop_source text not null, drop_chance numeric(6,3) not null,
  updated_at timestamptz not null default now()
);
create table if not exists public.etranom_exploration_rewards (
  id text primary key, content_id text not null, wave int not null check(wave between 1 and 5),
  reward_type text not null check(reward_type in ('material','recipe','treasure')),
  reward_payload jsonb not null, chance numeric(6,3) not null default 100
);
create index if not exists etranom_monsters_region_idx on public.etranom_content_monsters(region_id,kind);
create index if not exists etranom_recipes_class_region_idx on public.etranom_content_recipes(class_name,region_id);

insert into public.etranom_content_regions(id,name_fa,level_min,level_max,special_content) values
('burnt_forest','جنگل سوخته',1,5,'{"dungeon":false,"ruins":false}'::jsonb),
('thorn_grove','بیشه خارزار',1,5,'{"dungeon":true,"dungeon_id":"dungeon_thorn","ruins":false}'::jsonb),
('ash_hills','تپه‌های خاکستر',1,5,'{"dungeon":false,"ruins":false}'::jsonb),
('vardash_river','رود ورداش',1,5,'{"dungeon":false,"ruins":false}'::jsonb),
('southern_plains','دشت جنوبی',1,5,'{"dungeon":true,"dungeon_id":"dungeon_south","ruins":false}'::jsonb),
('rootbound_ruins','ویرانه‌های ریشه‌پوش',1,5,'{"dungeon":false,"ruins":true,"exploration_waves":5,"has_monsters":false}'::jsonb)
on conflict(id) do update set name_fa=excluded.name_fa,level_min=excluded.level_min,level_max=excluded.level_max,special_content=excluded.special_content,updated_at=now();

-- Material records: five ordinary-monster materials and two elite/boss materials per area.
insert into public.etranom_content_materials(id,region_id,name_fa,source_kind,source_id) values
('burnt_wolf_pelt','burnt_forest','پوست گرگ سوخته','normal','burnt_forest_monster_1'),('ash_crow_feather','burnt_forest','پر کلاغ خاکستر','normal','burnt_forest_monster_2'),('deadroot_fiber','burnt_forest','الیاف ریشه مرده','normal','burnt_forest_monster_3'),('emberwound_stinger','burnt_forest','نیش آتش‌زخم','normal','burnt_forest_monster_4'),('ashen_stalker_essence','burnt_forest','عصاره سایه‌بان شعله‌مرده','normal','burnt_forest_monster_5'),('ashroot_core','burnt_forest','هسته ریشه‌سالار','mini_boss','burnt_forest_miniboss'),('warden_bark_plate','burnt_forest','صفحه پوست ریشه‌سالار','mini_boss','burnt_forest_miniboss'),
('thorn_hide','thorn_grove','پوست روباه خارپوش','normal','thorn_grove_monster_1'),('barbed_quill','thorn_grove','پر تیغ‌دار','normal','thorn_grove_monster_2'),('briar_sap','thorn_grove','شیره بیشه','normal','thorn_grove_monster_3'),('thorn_mandible','thorn_grove','آرواره خارخون','normal','thorn_grove_monster_4'),('bramble_heart','thorn_grove','قلب بیشه‌خار','normal','thorn_grove_monster_5'),('thorn_matriarch_blood','thorn_grove','خون مادر خارها','mini_boss','thorn_grove_miniboss'),('barbed_crown','thorn_grove','تاج تیغی','mini_boss','thorn_grove_miniboss'),
('ashstone_shard','ash_hills','خرده‌سنگستر','normal','ash_hills_monster_1'),('cinder_beetle_shell','ash_hills','پوسته سوسک','normal','ash_hills_monster_2'),('grey_rockhide','ash_hills','چرم سنگی','normal','ash_hills_monster_3'),('coal_moth_dust','ash_hills','گرد زغالین','normal','ash_hills_monster_4'),('slagfang_tooth','ash_hills','دندان سنگی','normal','ash_hills_monster_5'),('cinder_colossus_core','ash_hills','هسته غول اخگر','mini_boss','ash_hills_miniboss'),('basalt_plate','ash_hills','صفحه بازالتی','mini_boss','ash_hills_miniboss'),
('vardash_scale','vardash_river','فلس ورداش','normal','vardash_river_monster_1'),('river_reed_fiber','vardash_river','الیاف نی رود','normal','vardash_river_monster_2'),('mudfin_tooth','vardash_river','دندان گل‌ماهی','normal','vardash_river_monster_3'),('silver_gill','vardash_river','آبشش نقره‌ای','normal','vardash_river_monster_4'),('current_pearl','vardash_river','مروارید جریان','normal','vardash_river_monster_5'),('river_hydra_scale','vardash_river','فلس هیدرای رود','mini_boss','vardash_river_miniboss'),('deepwater_essence','vardash_river','جوهر ژرفاب','mini_boss','vardash_river_miniboss'),
('plainstalker_hide','southern_plains','پوست دشت‌گرد','normal','southern_plains_monster_1'),('sunhawk_feather','southern_plains','پر شاهین آفتاب','normal','southern_plains_monster_2'),('drygrass_fiber','southern_plains','الیاف علف خشک','normal','southern_plains_monster_3'),('dusthorn','southern_plains','شاخ غبار','normal','southern_plains_monster_4'),('yellowfang_claw','southern_plains','چنگال زرد','normal','southern_plains_monster_5'),('plains_alpha_bone','southern_plains','استخوان آلفای دشت','mini_boss','southern_plains_miniboss'),('savanna_heart','southern_plains','قلب ساوانا','mini_boss','southern_plains_miniboss'),
('rune_dust','rootbound_ruins','گرد رون','exploration','rootbound_ruins'),('rootstone_fragment','rootbound_ruins','تکه‌سنگ ریشه‌ای','exploration','rootbound_ruins'),('ancient_thread','rootbound_ruins','نخ باستانی','exploration','rootbound_ruins'),('sealed_wax','rootbound_ruins','موم مهرشده','exploration','rootbound_ruins'),('memory_shard','rootbound_ruins','خرده‌یادمان','exploration','rootbound_ruins'),('rootbound_relic','rootbound_ruins','یادگار ریشه‌پوش','area_boss','rootbound_region_boss'),('old_guardian_seal','rootbound_ruins','مهر نگهبان کهن','area_boss','rootbound_region_boss')
on conflict(id) do update set region_id=excluded.region_id,name_fa=excluded.name_fa,source_kind=excluded.source_kind,source_id=excluded.source_id,updated_at=now();

-- The browser game remains authoritative for offline/local saves. These tables are a shared catalog mirror.
-- RLS allows authenticated clients to read content; only service-role/admin should write.
alter table public.etranom_content_regions enable row level security;
alter table public.etranom_content_materials enable row level security;
alter table public.etranom_content_monsters enable row level security;
alter table public.etranom_content_recipes enable row level security;
alter table public.etranom_exploration_rewards enable row level security;
do $$ begin
  create policy etranom_content_regions_read on public.etranom_content_regions for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy etranom_content_materials_read on public.etranom_content_materials for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy etranom_content_monsters_read on public.etranom_content_monsters for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy etranom_content_recipes_read on public.etranom_content_recipes for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy etranom_exploration_rewards_read on public.etranom_exploration_rewards for select to authenticated using (true);
exception when duplicate_object then null; end $$;

-- Seed all 36 enemy definitions (30 normal + 5 mini-boss + 1 regional boss).
do $$
declare
  regions text[] := array['burnt_forest','thorn_grove','ash_hills','vardash_river','southern_plains','rootbound_ruins'];
  names text[][] := array[
    array['گرگ خاکستری سوخته','کلاغ خاکستر','ریشه‌خوار مرده','حشره آتش‌زخم','سایه‌بان شعله‌مرده'],
    array['روباه خارپوش','کلاغ تیغ‌دار','کرم ریشه‌خوار','سوسک خارخون','گرگ بیشه‌خار'],
    array['سوسک سنگستر','مار خاکسترپوش','خرگوش خاکستری','خفاش زغالین','دندان‌سنگ تپه'],
    array['ماهی فلس‌خاکستری','مارماهی ورداش','خرچنگ گل‌سنگ','پرنده نیزار','شکارچی آب‌تیره'],
    array['گرگ دشت‌گرد','شاهین آفتاب‌سوخته','موش‌خرمای خاکی','گراز غبارآلود','شیر علفزار'],
    array['نگهبان شکسته','عنکبوت رون‌خورده','پیکر ریشه‌ای','سایه کتیبه','پاسدار بی‌نام']
  ];
  mini_names text[] := array['گرگ‌سالار سوخته','مادر بیشه‌خار','سنگ‌شکن اخگر','مارسالار ورداش','شاخ‌دار دشت جنوبی'];
  i int; j int; mid text;
begin
  for i in 1..6 loop
    for j in 1..5 loop
      mid := regions[i]||'_monster_'||j;
      insert into public.etranom_content_monsters(id,region_id,name_fa,kind,level,stats,material_ids,skills)
      values(mid,regions[i],names[i][j],'normal',1,
        jsonb_build_object('hp',case when i=1 then (array[45,30,80,38,55])[j] else 42+j*11+i*4 end,
          'attack',7+j+i,'defense',1+j+(i/2),'speed',5+j*2),
        array[(select id from public.etranom_content_materials where region_id=regions[i] and source_kind='normal' order by id limit 1 offset j-1)],'[]'::jsonb)
      on conflict(id) do update set name_fa=excluded.name_fa,stats=excluded.stats,material_ids=excluded.material_ids;
    end loop;
    if i<6 then
      insert into public.etranom_content_monsters(id,region_id,name_fa,kind,level,stats,material_ids,skills)
      values(regions[i]||'_miniboss',regions[i],mini_names[i],'mini_boss',1,
        jsonb_build_object('hp',360+i*35,'attack',17+i*2,'defense',13+i,'speed',6+i),
        array(select id from public.etranom_content_materials where region_id=regions[i] and source_kind='mini_boss' order by id),
        jsonb_build_array('یورش سنگین','ضربه منطقه‌ای','خشم نگهبان'))
      on conflict(id) do update set name_fa=excluded.name_fa,stats=excluded.stats,material_ids=excluded.material_ids;
    else
      insert into public.etranom_content_monsters(id,region_id,name_fa,kind,level,stats,material_ids,skills)
      values('rootbound_region_boss',regions[i],'نگهبان واپسین ریشه‌پوش','area_boss',1,
        jsonb_build_object('hp',950,'attack',28,'defense',22,'speed',8),
        array(select id from public.etranom_content_materials where region_id=regions[i] and source_kind='area_boss' order by id),
        jsonb_build_array('موج ریشه‌ها','شکستن کتیبه','فروپاشی باستانی'))
      on conflict(id) do update set name_fa=excluded.name_fa,stats=excluded.stats,material_ids=excluded.material_ids;
    end if;
  end loop;
end $$;

-- Generate the 260 class/slot recipes. Rarity assignment is deterministic and evenly distributed.
do $$
declare
  classes text[] := array['تفنگدار','راهب','جنگجو','جادوگر','رنجر','آدمکش','کشیش','پالادین','شمن','احضارگر'];
  slots text[] := array['سلاح اصلی','سلاح دوم','زره','کلاه','چکمه','دستکش','ساق‌پوش','بازوبند','حلقه ۱','حلقه ۲','گردنبند','شنل','نشان'];
  regions text[] := array['burnt_forest','thorn_grove','ash_hills','vardash_river','southern_plains','rootbound_ruins'];
  rarities text[] := array['معمولی','غیرمعمول','کمیاب','حماسی','افسانه‌ای','اسطوره‌ای'];
  rarity_chances numeric[] := array[35,20,15,8,4,2];
  ci int; si int; v int; ri int; rarity_i int; recipe_id text; mats text[]; stats jsonb;
begin
  for ci in 1..10 loop
    for si in 1..13 loop
      for v in 0..1 loop
        ri := ((ci*13+si*2+v-1)%6)+1;
        rarity_i := ((ci*7+si*3+v*2-1)%6)+1;
        recipe_id := 'recipe_'||(ci-1)||'_'||(si-1)||'_'||v;
        select array_agg(id order by id) into mats from public.etranom_content_materials
          where region_id=regions[ri] and source_kind in ('normal','exploration');
        stats := jsonb_build_object(
          case ci when 1 then 'agility' when 2 then 'endurance' when 3 then 'power' when 4 then 'intellect' when 5 then 'perception' when 6 then 'agility' when 7 then 'faith' when 8 then 'defense' when 9 then 'faith' else 'intellect' end,
          1+(rarity_i-1)*2+((si-1)/4));
        insert into public.etranom_content_recipes(id,class_name,slot_name,item_name,item_level,rarity,region_id,ingredients,stats,effects,drop_source,drop_chance)
        values(recipe_id,classes[ci],slots[si],regions[ri]||' • '||slots[si]||' • '||classes[ci]||' • '||v,1,rarities[rarity_i],regions[ri],
          jsonb_build_array(jsonb_build_object('material_id',mats[1],'quantity',2+rarity_i-1),jsonb_build_object('material_id',mats[least(2,cardinality(mats))],'quantity',1+((rarity_i-1)/2))),
          stats,jsonb_build_array('دوام پایه ۱۰۰','قابل ارتقا با سامانه ارتقای تجهیزات'),
          case when ri=6 then 'اکتشاف خرابه ریشه‌پوش' when ri=2 or ri=5 then 'محدوده و دانجن مرتبط' else regions[ri] end,
          rarity_chances[rarity_i])
        on conflict(id) do update set class_name=excluded.class_name,slot_name=excluded.slot_name,rarity=excluded.rarity,region_id=excluded.region_id,ingredients=excluded.ingredients,stats=excluded.stats,drop_chance=excluded.drop_chance,updated_at=now();
      end loop;
    end loop;
  end loop;
end $$;

commit;
