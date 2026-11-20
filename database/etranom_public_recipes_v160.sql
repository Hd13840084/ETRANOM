-- ETRANOM v160: all 260 crafting recipes are public to every class.
-- Run once AFTER the existing v158 group-battle SQL and content-pack SQL.
begin;

alter table public.etranom_content_recipes
  add column if not exists public_access boolean not null default true,
  add column if not exists original_class_name text;
update public.etranom_content_recipes
   set original_class_name=coalesce(original_class_name,class_name), public_access=true;

create table if not exists public.etranom_recipe_drop_catalog (
  recipe_id text primary key references public.etranom_content_recipes(id) on delete cascade,
  region_id text not null,
  source_type text not null check(source_type in ('monster','dungeon_treasure','dungeon_boss','tower_boss')),
  source_id text not null,
  rarity text not null,
  drop_chance numeric(6,3) not null default 0,
  public_access boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.etranom_recipe_drop_catalog enable row level security;
revoke all on public.etranom_recipe_drop_catalog from public,anon,authenticated;
do $$ begin
  create policy etranom_recipe_drop_catalog_read on public.etranom_recipe_drop_catalog for select to authenticated using (public_access=true);
exception when duplicate_object then null; end $$;
grant select on public.etranom_recipe_drop_catalog to authenticated;

insert into public.etranom_recipe_drop_catalog(recipe_id,region_id,source_type,source_id,rarity,drop_chance,public_access)
values
('recipe_0_0_0','burnt_forest','monster','ash_crow','معمولی',35.0),
('recipe_0_0_1','thorn_grove','dungeon_treasure','dungeon_thorn','کمیاب',15.0),
('recipe_0_1_0','ash_hills','monster','ash_hills_monster_4','غیرمعمول',20.0),
('recipe_0_1_1','vardash_river','monster','vardash_river_monster_4','افسانه‌ای',4.0),
('recipe_0_2_0','southern_plains','dungeon_boss','dungeon_boss_dungeon_south','حماسی',8.0),
('recipe_0_2_1','rootbound_ruins','tower_boss','tower_boss_floor04','افسانه‌ای',4.0),
('recipe_0_3_0','burnt_forest','monster','burnt_ash_wolf','غیرمعمول',20.0),
('recipe_0_3_1','thorn_grove','monster','thorn_grove_miniboss','کمیاب',15.0),
('recipe_0_4_0','ash_hills','monster','ash_hills_monster_3','غیرمعمول',20.0),
('recipe_0_4_1','vardash_river','monster','vardash_river_monster_5','افسانه‌ای',4.0),
('recipe_0_5_0','southern_plains','monster','southern_plains_miniboss','افسانه‌ای',4.0),
('recipe_0_5_1','rootbound_ruins','monster','rootbound_region_boss','اسطوره‌ای',2.0),
('recipe_0_6_0','burnt_forest','monster','ashroot_warden','معمولی',35.0),
('recipe_0_6_1','thorn_grove','monster','thorn_grove_monster_2','کمیاب',15.0),
('recipe_0_7_0','ash_hills','monster','ash_hills_monster_1','غیرمعمول',20.0),
('recipe_0_7_1','vardash_river','monster','vardash_river_monster_3','افسانه‌ای',4.0),
('recipe_0_8_0','southern_plains','monster','southern_plains_monster_2','حماسی',8.0),
('recipe_0_8_1','rootbound_ruins','monster','rootbound_ruins_monster_4','افسانه‌ای',4.0),
('recipe_0_9_0','burnt_forest','monster','deadroot_crawler','غیرمعمول',20.0),
('recipe_0_9_1','thorn_grove','monster','thorn_grove_monster_5','کمیاب',15.0),
('recipe_0_10_0','ash_hills','monster','ash_hills_monster_2','غیرمعمول',20.0),
('recipe_0_10_1','vardash_river','monster','vardash_river_miniboss','افسانه‌ای',4.0),
('recipe_0_11_0','southern_plains','dungeon_treasure','dungeon_south','افسانه‌ای',4.0),
('recipe_0_11_1','rootbound_ruins','monster','rootbound_region_boss','اسطوره‌ای',2.0),
('recipe_0_12_0','burnt_forest','monster','ashroot_warden','معمولی',35.0),
('recipe_0_12_1','thorn_grove','dungeon_boss','dungeon_boss_dungeon_thorn','کمیاب',15.0),
('recipe_1_0_0','thorn_grove','dungeon_treasure','dungeon_thorn','غیرمعمول',20.0),
('recipe_1_0_1','ash_hills','monster','ash_hills_monster_3','غیرمعمول',20.0),
('recipe_1_1_0','vardash_river','monster','vardash_river_monster_2','حماسی',8.0),
('recipe_1_1_1','southern_plains','dungeon_boss','dungeon_boss_dungeon_south','حماسی',8.0),
('recipe_1_2_0','rootbound_ruins','monster','rootbound_region_boss','اسطوره‌ای',2.0),
('recipe_1_2_1','burnt_forest','monster','ashen_flame_stalker','غیرمعمول',20.0),
('recipe_1_3_0','thorn_grove','monster','thorn_grove_monster_1','غیرمعمول',20.0),
('recipe_1_3_1','ash_hills','monster','ash_hills_miniboss','غیرمعمول',20.0),
('recipe_1_4_0','vardash_river','monster','vardash_river_monster_3','حماسی',8.0),
('recipe_1_4_1','southern_plains','monster','southern_plains_monster_5','افسانه‌ای',4.0),
('recipe_1_5_0','rootbound_ruins','tower_boss','tower_boss_floor16','افسانه‌ای',4.0),
('recipe_1_5_1','burnt_forest','monster','burnt_ash_wolf','معمولی',35.0),
('recipe_1_6_0','thorn_grove','monster','thorn_grove_miniboss','غیرمعمول',20.0),
('recipe_1_6_1','ash_hills','monster','ash_hills_monster_2','غیرمعمول',20.0),
('recipe_1_7_0','vardash_river','monster','vardash_river_monster_1','حماسی',8.0),
('recipe_1_7_1','southern_plains','monster','southern_plains_monster_3','حماسی',8.0),
('recipe_1_8_0','rootbound_ruins','monster','rootbound_region_boss','اسطوره‌ای',2.0),
('recipe_1_8_1','burnt_forest','monster','emberwound_stinger','غیرمعمول',20.0),
('recipe_1_9_0','thorn_grove','monster','thorn_grove_monster_3','غیرمعمول',20.0),
('recipe_1_9_1','ash_hills','monster','ash_hills_monster_5','غیرمعمول',20.0),
('recipe_1_10_0','vardash_river','monster','vardash_river_monster_2','حماسی',8.0),
('recipe_1_10_1','southern_plains','dungeon_treasure','dungeon_south','افسانه‌ای',4.0),
('recipe_1_11_0','rootbound_ruins','tower_boss','tower_boss_floor08','افسانه‌ای',4.0),
('recipe_1_11_1','burnt_forest','monster','ashroot_warden','معمولی',35.0),
('recipe_1_12_0','thorn_grove','dungeon_boss','dungeon_boss_dungeon_thorn','غیرمعمول',20.0),
('recipe_1_12_1','ash_hills','monster','ash_hills_monster_1','غیرمعمول',20.0),
('recipe_2_0_0','ash_hills','monster','ash_hills_monster_1','حماسی',8.0),
('recipe_2_0_1','vardash_river','monster','vardash_river_monster_4','حماسی',8.0),
('recipe_2_1_0','southern_plains','dungeon_boss','dungeon_boss_dungeon_south','افسانه‌ای',4.0),
('recipe_2_1_1','rootbound_ruins','monster','rootbound_region_boss','اسطوره‌ای',2.0),
('recipe_2_2_0','burnt_forest','monster','deadroot_crawler','معمولی',35.0),
('recipe_2_2_1','thorn_grove','dungeon_boss','dungeon_boss_dungeon_thorn','غیرمعمول',20.0),
('recipe_2_3_0','ash_hills','monster','ash_hills_monster_4','حماسی',8.0),
('recipe_2_3_1','vardash_river','monster','vardash_river_miniboss','حماسی',8.0),
('recipe_2_4_0','southern_plains','monster','southern_plains_monster_3','حماسی',8.0),
('recipe_2_4_1','rootbound_ruins','monster','rootbound_ruins_monster_5','افسانه‌ای',4.0),
('recipe_2_5_0','burnt_forest','monster','ashen_flame_stalker','غیرمعمول',20.0),
('recipe_2_5_1','thorn_grove','monster','thorn_grove_monster_1','غیرمعمول',20.0),
('recipe_2_6_0','ash_hills','monster','ash_hills_miniboss','حماسی',8.0),
('recipe_2_6_1','vardash_river','monster','vardash_river_monster_2','حماسی',8.0),
('recipe_2_7_0','southern_plains','monster','southern_plains_monster_1','افسانه‌ای',4.0),
('recipe_2_7_1','rootbound_ruins','monster','rootbound_region_boss','اسطوره‌ای',2.0),
('recipe_2_8_0','burnt_forest','monster','ash_crow','معمولی',35.0),
('recipe_2_8_1','thorn_grove','monster','thorn_grove_monster_4','غیرمعمول',20.0),
('recipe_2_9_0','ash_hills','monster','ash_hills_monster_3','حماسی',8.0),
('recipe_2_9_1','vardash_river','monster','vardash_river_monster_5','حماسی',8.0),
('recipe_2_10_0','southern_plains','dungeon_treasure','dungeon_south','حماسی',8.0),
('recipe_2_10_1','rootbound_ruins','tower_boss','tower_boss_floor08','افسانه‌ای',4.0),
('recipe_2_11_0','burnt_forest','monster','ashen_flame_stalker','غیرمعمول',20.0),
('recipe_2_11_1','thorn_grove','dungeon_treasure','dungeon_thorn','غیرمعمول',20.0),
('recipe_2_12_0','ash_hills','monster','ash_hills_miniboss','حماسی',8.0),
('recipe_2_12_1','vardash_river','monster','vardash_river_monster_1','حماسی',8.0),
('recipe_3_0_0','vardash_river','monster','vardash_river_monster_1','کمیاب',15.0),
('recipe_3_0_1','southern_plains','dungeon_treasure','dungeon_south','افسانه‌ای',4.0),
('recipe_3_1_0','rootbound_ruins','tower_boss','tower_boss_floor04','افسانه‌ای',4.0),
('recipe_3_1_1','burnt_forest','monster','emberwound_stinger','معمولی',35.0),
('recipe_3_2_0','thorn_grove','dungeon_boss','dungeon_boss_dungeon_thorn','معمولی',35.0),
('recipe_3_2_1','ash_hills','monster','ash_hills_monster_5','حماسی',8.0),
('recipe_3_3_0','vardash_river','monster','vardash_river_monster_4','کمیاب',15.0),
('recipe_3_3_1','southern_plains','monster','southern_plains_miniboss','حماسی',8.0),
('recipe_3_4_0','rootbound_ruins','monster','rootbound_region_boss','اسطوره‌ای',2.0),
('recipe_3_4_1','burnt_forest','monster','ashroot_warden','غیرمعمول',20.0),
('recipe_3_5_0','thorn_grove','monster','thorn_grove_monster_5','معمولی',35.0),
('recipe_3_5_1','ash_hills','monster','ash_hills_monster_1','حماسی',8.0),
('recipe_3_6_0','vardash_river','monster','vardash_river_miniboss','کمیاب',15.0),
('recipe_3_6_1','southern_plains','monster','southern_plains_monster_2','افسانه‌ای',4.0),
('recipe_3_7_0','rootbound_ruins','monster','rootbound_ruins_monster_3','افسانه‌ای',4.0),
('recipe_3_7_1','burnt_forest','monster','deadroot_crawler','معمولی',35.0),
('recipe_3_8_0','thorn_grove','monster','thorn_grove_monster_2','معمولی',35.0),
('recipe_3_8_1','ash_hills','monster','ash_hills_monster_4','حماسی',8.0),
('recipe_3_9_0','vardash_river','monster','vardash_river_monster_3','کمیاب',15.0),
('recipe_3_9_1','southern_plains','monster','southern_plains_monster_5','حماسی',8.0),
('recipe_3_10_0','rootbound_ruins','monster','rootbound_region_boss','اسطوره‌ای',2.0),
('recipe_3_10_1','burnt_forest','monster','emberwound_stinger','غیرمعمول',20.0),
('recipe_3_11_0','thorn_grove','dungeon_treasure','dungeon_thorn','معمولی',35.0),
('recipe_3_11_1','ash_hills','monster','ash_hills_miniboss','حماسی',8.0),
('recipe_3_12_0','vardash_river','monster','vardash_river_miniboss','کمیاب',15.0),
('recipe_3_12_1','southern_plains','dungeon_boss','dungeon_boss_dungeon_south','افسانه‌ای',4.0),
('recipe_4_0_0','southern_plains','dungeon_treasure','dungeon_south','حماسی',8.0),
('recipe_4_0_1','rootbound_ruins','tower_boss','tower_boss_floor08','افسانه‌ای',4.0),
('recipe_4_1_0','burnt_forest','monster','ash_crow','غیرمعمول',20.0),
('recipe_4_1_1','thorn_grove','dungeon_boss','dungeon_boss_dungeon_thorn','معمولی',35.0),
('recipe_4_2_0','ash_hills','monster','ash_hills_monster_3','کمیاب',15.0),
('recipe_4_2_1','vardash_river','monster','vardash_river_monster_5','کمیاب',15.0),
('recipe_4_3_0','southern_plains','monster','southern_plains_monster_4','افسانه‌ای',4.0),
('recipe_4_3_1','rootbound_ruins','monster','rootbound_region_boss','اسطوره‌ای',2.0),
('recipe_4_4_0','burnt_forest','monster','ashen_flame_stalker','معمولی',35.0),
('recipe_4_4_1','thorn_grove','monster','thorn_grove_miniboss','معمولی',35.0),
('recipe_4_5_0','ash_hills','monster','ash_hills_monster_5','کمیاب',15.0),
('recipe_4_5_1','vardash_river','monster','vardash_river_monster_1','کمیاب',15.0),
('recipe_4_6_0','southern_plains','monster','southern_plains_monster_1','حماسی',8.0),
('recipe_4_6_1','rootbound_ruins','tower_boss','tower_boss_floor20','افسانه‌ای',4.0),
('recipe_4_7_0','burnt_forest','monster','burnt_ash_wolf','غیرمعمول',20.0),
('recipe_4_7_1','thorn_grove','monster','thorn_grove_monster_3','معمولی',35.0),
('recipe_4_8_0','ash_hills','monster','ash_hills_monster_2','کمیاب',15.0),
('recipe_4_8_1','vardash_river','monster','vardash_river_monster_4','کمیاب',15.0),
('recipe_4_9_0','southern_plains','monster','southern_plains_miniboss','افسانه‌ای',4.0),
('recipe_4_9_1','rootbound_ruins','monster','rootbound_region_boss','اسطوره‌ای',2.0),
('recipe_4_10_0','burnt_forest','monster','ash_crow','معمولی',35.0),
('recipe_4_10_1','thorn_grove','dungeon_treasure','dungeon_thorn','معمولی',35.0),
('recipe_4_11_0','ash_hills','monster','ash_hills_monster_5','کمیاب',15.0),
('recipe_4_11_1','vardash_river','monster','vardash_river_miniboss','کمیاب',15.0),
('recipe_4_12_0','southern_plains','dungeon_boss','dungeon_boss_dungeon_south','حماسی',8.0),
('recipe_4_12_1','rootbound_ruins','tower_boss','tower_boss_floor16','افسانه‌ای',4.0),
('recipe_5_0_0','rootbound_ruins','monster','rootbound_region_boss','اسطوره‌ای',2.0),
('recipe_5_0_1','burnt_forest','monster','deadroot_crawler','غیرمعمول',20.0),
('recipe_5_1_0','thorn_grove','dungeon_boss','dungeon_boss_dungeon_thorn','کمیاب',15.0),
('recipe_5_1_1','ash_hills','monster','ash_hills_miniboss','کمیاب',15.0),
('recipe_5_2_0','vardash_river','monster','vardash_river_monster_3','افسانه‌ای',4.0),
('recipe_5_2_1','southern_plains','dungeon_boss','dungeon_boss_dungeon_south','افسانه‌ای',4.0),
('recipe_5_3_0','rootbound_ruins','monster','rootbound_ruins_monster_1','افسانه‌ای',4.0),
('recipe_5_3_1','burnt_forest','monster','ashroot_warden','معمولی',35.0),
('recipe_5_4_0','thorn_grove','monster','thorn_grove_monster_3','کمیاب',15.0),
('recipe_5_4_1','ash_hills','monster','ash_hills_monster_5','کمیاب',15.0),
('recipe_5_5_0','vardash_river','monster','vardash_river_monster_5','افسانه‌ای',4.0),
('recipe_5_5_1','southern_plains','monster','southern_plains_monster_1','حماسی',8.0),
('recipe_5_6_0','rootbound_ruins','monster','rootbound_region_boss','اسطوره‌ای',2.0),
('recipe_5_6_1','burnt_forest','monster','ash_crow','غیرمعمول',20.0),
('recipe_5_7_0','thorn_grove','monster','thorn_grove_monster_1','کمیاب',15.0),
('recipe_5_7_1','ash_hills','monster','ash_hills_monster_3','کمیاب',15.0),
('recipe_5_8_0','vardash_river','monster','vardash_river_monster_2','افسانه‌ای',4.0),
('recipe_5_8_1','southern_plains','monster','southern_plains_monster_4','افسانه‌ای',4.0),
('recipe_5_9_0','rootbound_ruins','tower_boss','tower_boss_floor04','افسانه‌ای',4.0),
('recipe_5_9_1','burnt_forest','monster','ashen_flame_stalker','معمولی',35.0),
('recipe_5_10_0','thorn_grove','dungeon_treasure','dungeon_thorn','کمیاب',15.0),
('recipe_5_10_1','ash_hills','monster','ash_hills_monster_4','کمیاب',15.0),
('recipe_5_11_0','vardash_river','monster','vardash_river_monster_5','افسانه‌ای',4.0),
('recipe_5_11_1','southern_plains','dungeon_treasure','dungeon_south','حماسی',8.0),
('recipe_5_12_0','rootbound_ruins','monster','rootbound_region_boss','اسطوره‌ای',2.0),
('recipe_5_12_1','burnt_forest','monster','burnt_ash_wolf','غیرمعمول',20.0),
('recipe_6_0_0','burnt_forest','monster','burnt_ash_wolf','معمولی',35.0),
('recipe_6_0_1','thorn_grove','dungeon_treasure','dungeon_thorn','کمیاب',15.0),
('recipe_6_1_0','ash_hills','monster','ash_hills_monster_2','غیرمعمول',20.0),
('recipe_6_1_1','vardash_river','monster','vardash_river_miniboss','افسانه‌ای',4.0),
('recipe_6_2_0','southern_plains','dungeon_boss','dungeon_boss_dungeon_south','حماسی',8.0),
('recipe_6_2_1','rootbound_ruins','tower_boss','tower_boss_floor12','افسانه‌ای',4.0),
('recipe_6_3_0','burnt_forest','monster','emberwound_stinger','غیرمعمول',20.0),
('recipe_6_3_1','thorn_grove','monster','thorn_grove_miniboss','کمیاب',15.0),
('recipe_6_4_0','ash_hills','monster','ash_hills_monster_3','غیرمعمول',20.0),
('recipe_6_4_1','vardash_river','monster','vardash_river_monster_5','افسانه‌ای',4.0),
('recipe_6_5_0','southern_plains','monster','southern_plains_monster_5','افسانه‌ای',4.0),
('recipe_6_5_1','rootbound_ruins','monster','rootbound_region_boss','اسطوره‌ای',2.0),
('recipe_6_6_0','burnt_forest','monster','burnt_ash_wolf','معمولی',35.0),
('recipe_6_6_1','thorn_grove','monster','thorn_grove_monster_2','کمیاب',15.0),
('recipe_6_7_0','ash_hills','monster','ash_hills_monster_1','غیرمعمول',20.0),
('recipe_6_7_1','vardash_river','monster','vardash_river_monster_3','افسانه‌ای',4.0),
('recipe_6_8_0','southern_plains','monster','southern_plains_monster_2','حماسی',8.0),
('recipe_6_8_1','rootbound_ruins','tower_boss','tower_boss_floor20','افسانه‌ای',4.0),
('recipe_6_9_0','burnt_forest','monster','deadroot_crawler','غیرمعمول',20.0),
('recipe_6_9_1','thorn_grove','monster','thorn_grove_monster_5','کمیاب',15.0),
('recipe_6_10_0','ash_hills','monster','ash_hills_monster_2','غیرمعمول',20.0),
('recipe_6_10_1','vardash_river','monster','vardash_river_monster_4','افسانه‌ای',4.0),
('recipe_6_11_0','southern_plains','dungeon_treasure','dungeon_south','افسانه‌ای',4.0),
('recipe_6_11_1','rootbound_ruins','monster','rootbound_region_boss','اسطوره‌ای',2.0),
('recipe_6_12_0','burnt_forest','monster','ashroot_warden','معمولی',35.0),
('recipe_6_12_1','thorn_grove','dungeon_boss','dungeon_boss_dungeon_thorn','کمیاب',15.0),
('recipe_7_0_0','thorn_grove','dungeon_treasure','dungeon_thorn','غیرمعمول',20.0),
('recipe_7_0_1','ash_hills','monster','ash_hills_monster_4','غیرمعمول',20.0),
('recipe_7_1_0','vardash_river','monster','vardash_river_monster_2','حماسی',8.0),
('recipe_7_1_1','southern_plains','dungeon_boss','dungeon_boss_dungeon_south','حماسی',8.0),
('recipe_7_2_0','rootbound_ruins','monster','rootbound_region_boss','اسطوره‌ای',2.0),
('recipe_7_2_1','burnt_forest','monster','ashen_flame_stalker','غیرمعمول',20.0),
('recipe_7_3_0','thorn_grove','monster','thorn_grove_monster_4','غیرمعمول',20.0),
('recipe_7_3_1','ash_hills','monster','ash_hills_miniboss','غیرمعمول',20.0),
('recipe_7_4_0','vardash_river','monster','vardash_river_monster_3','حماسی',8.0),
('recipe_7_4_1','southern_plains','monster','southern_plains_miniboss','افسانه‌ای',4.0),
('recipe_7_5_0','rootbound_ruins','tower_boss','tower_boss_floor20','افسانه‌ای',4.0),
('recipe_7_5_1','burnt_forest','monster','burnt_ash_wolf','معمولی',35.0),
('recipe_7_6_0','thorn_grove','monster','thorn_grove_monster_1','غیرمعمول',20.0),
('recipe_7_6_1','ash_hills','monster','ash_hills_monster_2','غیرمعمول',20.0),
('recipe_7_7_0','vardash_river','monster','vardash_river_monster_1','حماسی',8.0),
('recipe_7_7_1','southern_plains','monster','southern_plains_monster_3','حماسی',8.0),
('recipe_7_8_0','rootbound_ruins','monster','rootbound_region_boss','اسطوره‌ای',2.0),
('recipe_7_8_1','burnt_forest','monster','emberwound_stinger','غیرمعمول',20.0),
('recipe_7_9_0','thorn_grove','monster','thorn_grove_monster_3','غیرمعمول',20.0),
('recipe_7_9_1','ash_hills','monster','ash_hills_monster_5','غیرمعمول',20.0),
('recipe_7_10_0','vardash_river','monster','vardash_river_monster_2','حماسی',8.0),
('recipe_7_10_1','southern_plains','dungeon_treasure','dungeon_south','افسانه‌ای',4.0),
('recipe_7_11_0','rootbound_ruins','tower_boss','tower_boss_floor12','افسانه‌ای',4.0),
('recipe_7_11_1','burnt_forest','monster','ashroot_warden','معمولی',35.0),
('recipe_7_12_0','thorn_grove','dungeon_boss','dungeon_boss_dungeon_thorn','غیرمعمول',20.0),
('recipe_7_12_1','ash_hills','monster','ash_hills_monster_1','غیرمعمول',20.0),
('recipe_8_0_0','ash_hills','monster','ash_hills_monster_1','حماسی',8.0),
('recipe_8_0_1','vardash_river','monster','vardash_river_monster_4','حماسی',8.0),
('recipe_8_1_0','southern_plains','dungeon_boss','dungeon_boss_dungeon_south','افسانه‌ای',4.0),
('recipe_8_1_1','rootbound_ruins','monster','rootbound_region_boss','اسطوره‌ای',2.0),
('recipe_8_2_0','burnt_forest','monster','deadroot_crawler','معمولی',35.0),
('recipe_8_2_1','thorn_grove','dungeon_boss','dungeon_boss_dungeon_thorn','غیرمعمول',20.0),
('recipe_8_3_0','ash_hills','monster','ash_hills_monster_4','حماسی',8.0),
('recipe_8_3_1','vardash_river','monster','vardash_river_miniboss','حماسی',8.0),
('recipe_8_4_0','southern_plains','monster','southern_plains_monster_3','حماسی',8.0),
('recipe_8_4_1','rootbound_ruins','tower_boss','tower_boss_floor16','افسانه‌ای',4.0),
('recipe_8_5_0','burnt_forest','monster','ashen_flame_stalker','غیرمعمول',20.0),
('recipe_8_5_1','thorn_grove','monster','thorn_grove_miniboss','غیرمعمول',20.0),
('recipe_8_6_0','ash_hills','monster','ash_hills_miniboss','حماسی',8.0),
('recipe_8_6_1','vardash_river','monster','vardash_river_monster_2','حماسی',8.0),
('recipe_8_7_0','southern_plains','monster','southern_plains_monster_1','افسانه‌ای',4.0),
('recipe_8_7_1','rootbound_ruins','monster','rootbound_region_boss','اسطوره‌ای',2.0),
('recipe_8_8_0','burnt_forest','monster','ash_crow','معمولی',35.0),
('recipe_8_8_1','thorn_grove','monster','thorn_grove_monster_4','غیرمعمول',20.0),
('recipe_8_9_0','ash_hills','monster','ash_hills_monster_3','حماسی',8.0),
('recipe_8_9_1','vardash_river','monster','vardash_river_monster_5','حماسی',8.0),
('recipe_8_10_0','southern_plains','dungeon_treasure','dungeon_south','حماسی',8.0),
('recipe_8_10_1','rootbound_ruins','tower_boss','tower_boss_floor12','افسانه‌ای',4.0),
('recipe_8_11_0','burnt_forest','monster','emberwound_stinger','غیرمعمول',20.0),
('recipe_8_11_1','thorn_grove','dungeon_treasure','dungeon_thorn','غیرمعمول',20.0),
('recipe_8_12_0','ash_hills','monster','ash_hills_miniboss','حماسی',8.0),
('recipe_8_12_1','vardash_river','monster','vardash_river_monster_1','حماسی',8.0),
('recipe_9_0_0','vardash_river','monster','vardash_river_monster_1','کمیاب',15.0),
('recipe_9_0_1','southern_plains','dungeon_treasure','dungeon_south','افسانه‌ای',4.0),
('recipe_9_1_0','rootbound_ruins','monster','rootbound_ruins_monster_2','افسانه‌ای',4.0),
('recipe_9_1_1','burnt_forest','monster','ashroot_warden','معمولی',35.0),
('recipe_9_2_0','thorn_grove','dungeon_boss','dungeon_boss_dungeon_thorn','معمولی',35.0),
('recipe_9_2_1','ash_hills','monster','ash_hills_monster_5','حماسی',8.0),
('recipe_9_3_0','vardash_river','monster','vardash_river_monster_4','کمیاب',15.0),
('recipe_9_3_1','southern_plains','monster','southern_plains_miniboss','حماسی',8.0),
('recipe_9_4_0','rootbound_ruins','monster','rootbound_region_boss','اسطوره‌ای',2.0),
('recipe_9_4_1','burnt_forest','monster','ashen_flame_stalker','غیرمعمول',20.0),
('recipe_9_5_0','thorn_grove','monster','thorn_grove_monster_5','معمولی',35.0),
('recipe_9_5_1','ash_hills','monster','ash_hills_monster_1','حماسی',8.0),
('recipe_9_6_0','vardash_river','monster','vardash_river_monster_1','کمیاب',15.0),
('recipe_9_6_1','southern_plains','monster','southern_plains_monster_2','افسانه‌ای',4.0),
('recipe_9_7_0','rootbound_ruins','tower_boss','tower_boss_floor04','افسانه‌ای',4.0),
('recipe_9_7_1','burnt_forest','monster','deadroot_crawler','معمولی',35.0),
('recipe_9_8_0','thorn_grove','monster','thorn_grove_monster_2','معمولی',35.0),
('recipe_9_8_1','ash_hills','monster','ash_hills_monster_4','حماسی',8.0),
('recipe_9_9_0','vardash_river','monster','vardash_river_monster_3','کمیاب',15.0),
('recipe_9_9_1','southern_plains','monster','southern_plains_monster_5','حماسی',8.0),
('recipe_9_10_0','rootbound_ruins','monster','rootbound_region_boss','اسطوره‌ای',2.0),
('recipe_9_10_1','burnt_forest','monster','emberwound_stinger','غیرمعمول',20.0),
('recipe_9_11_0','thorn_grove','dungeon_treasure','dungeon_thorn','معمولی',35.0),
('recipe_9_11_1','ash_hills','monster','ash_hills_miniboss','حماسی',8.0),
('recipe_9_12_0','vardash_river','monster','vardash_river_miniboss','کمیاب',15.0),
('recipe_9_12_1','southern_plains','dungeon_boss','dungeon_boss_dungeon_south','افسانه‌ای',4.0)
on conflict(recipe_id) do update set region_id=excluded.region_id,source_type=excluded.source_type,source_id=excluded.source_id,rarity=excluded.rarity,drop_chance=excluded.drop_chance,public_access=true,updated_at=now();

-- The server-side group battle now selects the recipe assigned to the defeated enemy,
-- without filtering by the killer's class. Mythic recipes retain the 2% final-boss rule.
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
  q numeric; xp_gain integer:=20; v_recipe text; v_class text; m record; enemy_damage integer; target_uid uuid; target_hp integer; member_damage integer; v_ledger_rows integer:=0; v_recipe_rarity text; v_recipe_chance numeric; v_skill_id text; v_skill jsonb; v_skill_type text; v_spec_key text; v_spec_name text; v_mana_cost integer; v_cooldowns jsonb; v_action_label text:=p_action; v_skill_pct numeric; v_skill_value integer;
begin
  if uid is null then raise exception 'auth_required'; end if;
  if left(action_name,6)='skill:' then v_skill_id:=substring(action_name from 7); action_name:='skill'; end if;
  if action_name not in ('attack','skill','guard','heal','potion') then raise exception 'battle_action_invalid'; end if;
  if v_skill_id is not null and (v_skill_id !~ '^[a-z0-9_]+$' or length(v_skill_id)>48) then raise exception 'party_skill_invalid'; end if;
  select s.party_id into v_party from public.party_sessions s join public.party_members pm on pm.party_id=s.party_id and pm.user_id=uid
    where s.id=p_session_id and s.status='active';
  if v_party is null then raise exception 'battle_not_available'; end if;
  select * into st from public.party_battle_state where session_id=p_session_id for update;
  if st.status<>'active' then raise exception 'battle_already_finished'; end if;
  perform public.etranom_party_battle_heartbeat(p_session_id);
  if exists(select 1 from public.party_battle_actions a where a.session_id=p_session_id and a.round_no=st.round_no and a.user_id=uid) then raise exception 'already_acted_this_round'; end if;
  profiles:=st.player_combat; hpmap:=st.player_hp; guards:=st.player_guard; monsters:=st.monsters; kills:=st.kills_by_user;
  profile:=profiles -> (uid::text);
  if profile is null then profile:=public.etranom_party_character_combat_profile(uid); profiles:=profiles||jsonb_build_object(uid::text,profile); end if;
  hp:=coalesce((hpmap->>uid::text)::integer,0); maxhp:=greatest(1,coalesce((profile->>'max_hp')::integer,100));
  mp:=greatest(0,coalesce((profile->>'mp')::integer,0)); maxmp:=greatest(1,coalesce((profile->>'max_mp')::integer,60));
  attack_power:=greatest(1,coalesce((profile->>'attack')::integer,10)); defense_power:=greatest(0,coalesce((profile->>'defense')::integer,0));
  level_no:=greatest(1,coalesce((profile->>'level')::integer,1));
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
      if v_skill_type='single_damage' then
        damage:=greatest(1,floor((attack_power*5+coalesce((profile->'gear'->>'magicPower')::integer,0))*v_skill_pct/100*(100/(100+greatest(0,coalesce((monster->>'defense')::integer,0))*1.25)))::integer);
      else damage:=0; end if;
    elsif action_name='skill' then
      if mp<8 then raise exception 'insufficient_mana'; end if;
      mp:=mp-8; damage:=greatest(5,floor((10+attack_power*2.8)*(100/(100+greatest(0,coalesce((monster->>'defense')::integer,0))*1.25)) )::integer);
    else
      damage:=greatest(3,floor((attack_power*2.2)*(100/(100+greatest(0,coalesce((monster->>'defense')::integer,0))*1.25)))::integer);
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
      coins:=min_coins+floor((max_coins-min_coins+1)*least(.999999,random()*.65+.35*q))::integer;
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
      -- XP is taken from the encounter record when present; 20 remains the
      -- compatibility fallback for older encounter payloads.
      xp_gain:=greatest(0,coalesce(nullif(monster->>'xp','')::integer,20));
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
  end if;

  profile:=jsonb_set(profile,'{mp}',to_jsonb(mp),true);
  profiles:=profiles||jsonb_build_object(uid::text,profile);
  insert into public.party_battle_actions(session_id,round_no,user_id,action,damage) values(p_session_id,st.round_no,uid,coalesce(v_action_label,action_name),damage);
  -- Only current party members participate in the turn barrier. A member who
  -- leaves or disconnects cannot keep the remaining group waiting forever.
  select count(*) into alive_count
    from public.party_members pm
    where pm.party_id=v_party
      and coalesce((hpmap->>pm.user_id::text)::integer,0)>0
      and exists(select 1 from public.party_battle_presence bp where bp.session_id=p_session_id and bp.user_id=pm.user_id and bp.last_seen_at>now()-interval '45 seconds');
  select count(*) into done_count
    from public.party_battle_actions a
    where a.session_id=p_session_id and a.round_no=st.round_no
      and exists(select 1 from public.party_members pm
        where pm.party_id=v_party and pm.user_id=a.user_id)
      and coalesce((hpmap->>a.user_id::text)::integer,0)>0
      and exists(select 1 from public.party_battle_presence bp where bp.session_id=p_session_id and bp.user_id=a.user_id and bp.last_seen_at>now()-interval '45 seconds');

  if not exists(select 1 from jsonb_array_elements(monsters) e(value) where coalesce((e.value->>'hp')::integer,0)>0) then
    st.status:='victory'; st.completed_at:=now();
  elsif done_count>=alive_count and alive_count>0 then
    select value into monster from jsonb_array_elements(monsters) where coalesce((value->>'hp')::integer,0)>0 limit 1;
    enemy_damage:=greatest(1,coalesce((monster->>'attack')::integer,12));
    for m in select pm.user_id from public.party_members pm
      where pm.party_id=v_party and exists(select 1 from public.party_battle_presence bp where bp.session_id=p_session_id and bp.user_id=pm.user_id and bp.last_seen_at>now()-interval '45 seconds') loop
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
    if not exists(select 1 from public.party_members pm where pm.party_id=v_party and coalesce((hpmap->>pm.user_id::text)::integer,0)>0) then st.status:='defeat'; st.completed_at:=now();
    else st.round_no:=st.round_no+1; guards:='{}'::jsonb; end if;
  end if;

  update public.party_battle_state set monsters=monsters,kills_by_user=kills,
    monster_hp=(select coalesce(sum((e.value->>'hp')::integer),0) from jsonb_array_elements(monsters) e(value)),
    round_no=st.round_no,status=st.status,player_hp=hpmap,player_guard=guards,player_combat=profiles,
    updated_at=now(),completed_at=st.completed_at where session_id=p_session_id;
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

revoke all on function public.etranom_party_battle_snapshot(uuid) from public,anon;
grant execute on function public.etranom_party_battle_snapshot(uuid) to authenticated;

revoke all on function public.etranom_party_battle_act(uuid,text,integer) from public,anon;
grant execute on function public.etranom_party_battle_act(uuid,text,integer) to authenticated;
commit;
