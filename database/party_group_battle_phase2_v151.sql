-- ETRANOM Group Battle Phase 2 / v151
-- Adds server-authoritative character-derived HP/MP/attack/defense to the group battle.
-- Apply AFTER party_group_battle_phase6.sql (v150) and the existing party battle migrations.
begin;

alter table public.party_battle_state
  add column if not exists player_combat jsonb not null default '{}'::jsonb;

alter table public.party_battle_actions
  drop constraint if exists party_battle_actions_action_check;
alter table public.party_battle_actions
  add constraint party_battle_actions_action_check
  check (action in ('attack','skill','guard','heal','potion'));

-- Build a combat profile from the same saved character/equipment data used by game.js.
-- Client-supplied stats are never accepted by the combat RPC.
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
  defense_value:=greatest(0,coalesce(nullif(gear->>'defense','')::numeric,0)+floor(endurance*.5));
  hp_max:=greatest(1,coalesce(nullif(c->>'maxHp','')::numeric,120)+coalesce(nullif(gear->>'hp','')::numeric,0)+vitality*10);
  mp_max:=greatest(1,coalesce(nullif(c->>'maxMp','')::numeric,60)+coalesce(nullif(gear->>'mp','')::numeric,0)+intellect*8+case when class_name in ('راهب','کشیش','پالادین','شمن') then faith*8 else 0 end);
  hp_now:=greatest(0,least(hp_max,coalesce(nullif(c->>'hp','')::numeric,hp_max)));
  mp_now:=greatest(0,least(mp_max,coalesce(nullif(c->>'mp','')::numeric,mp_max)));
  return jsonb_build_object('level',level_no,'class',class_name,'attack_stat',attack_stat,
    'hp',floor(hp_now),'max_hp',floor(hp_max),'mp',floor(mp_now),'max_mp',floor(mp_max),
    'attack',floor(attack_value),'defense',floor(defense_value),'gear',gear);
end $$;

-- Runs after the v150 bootstrap trigger and replaces its placeholder HP with saved character stats.
create or replace function public.etranom_party_battle_load_character_profiles()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  p record;
  profiles jsonb := '{}'::jsonb;
  hps jsonb := '{}'::jsonb;
begin
  if new.status <> 'active' then return new; end if;
  for p in select pm.user_id from public.party_members pm where pm.party_id=new.party_id loop
    profiles:=profiles || jsonb_build_object(p.user_id::text,public.etranom_party_character_combat_profile(p.user_id));
    hps:=hps || jsonb_build_object(p.user_id::text,((profiles -> (p.user_id::text)) ->> 'hp')::integer);
  end loop;
  update public.party_battle_state
    set player_combat=profiles,player_hp=hps,updated_at=now()
    where session_id=new.id;
  return new;
end $$;

drop trigger if exists zz_etranom_party_load_character_profiles on public.party_sessions;
create trigger zz_etranom_party_load_character_profiles after insert on public.party_sessions
for each row execute function public.etranom_party_battle_load_character_profiles();

create or replace function public.etranom_party_battle_snapshot(p_session_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid:=auth.uid(); v_party uuid; v_state public.party_battle_state%rowtype; v_members jsonb; v_monsters jsonb;
  p jsonb;
begin
  if uid is null then raise exception 'auth_required'; end if;
  select s.party_id into v_party from public.party_sessions s
    join public.party_members pm on pm.party_id=s.party_id and pm.user_id=uid where s.id=p_session_id;
  if v_party is null then raise exception 'battle_not_available'; end if;
  select * into v_state from public.party_battle_state where session_id=p_session_id;
  select coalesce(jsonb_agg(jsonb_build_object(
    'user_id',pm.user_id,'display_name',coalesce(pp.display_name,pp.username,'ماجراجو'),
    'level',coalesce(((v_state.player_combat -> (pm.user_id::text)) ->> 'level')::integer,pp.player_level,1),
    'player_class',coalesce((v_state.player_combat -> (pm.user_id::text)) ->> 'class',to_jsonb(pp)->>'player_class',to_jsonb(pp)->>'archetype','ماجراجو'),
    'hp',coalesce((v_state.player_hp->>pm.user_id::text)::integer,0),
    'max_hp',coalesce(((v_state.player_combat -> (pm.user_id::text)) ->> 'max_hp')::integer,100),
    'mp',coalesce(((v_state.player_combat -> (pm.user_id::text)) ->> 'mp')::integer,0),
    'max_mp',coalesce(((v_state.player_combat -> (pm.user_id::text)) ->> 'max_mp')::integer,60),
    'attack',coalesce(((v_state.player_combat -> (pm.user_id::text)) ->> 'attack')::integer,1),
    'defense',coalesce(((v_state.player_combat -> (pm.user_id::text)) ->> 'defense')::integer,0),
    'kills',coalesce((v_state.kills_by_user->>pm.user_id::text)::integer,0),
    'ready',exists(select 1 from public.party_battle_actions a where a.session_id=p_session_id and a.round_no=v_state.round_no and a.user_id=pm.user_id)
  ) order by pm.joined_at),'[]'::jsonb) into v_members
  from public.party_members pm left join public.player_profiles pp on pp.user_id=pm.user_id where pm.party_id=v_party;
  select coalesce(jsonb_agg(x || jsonb_build_object('index',ord)), '[]'::jsonb) into v_monsters
    from jsonb_array_elements(v_state.monsters) with ordinality as t(x,ord);
  return jsonb_build_object('session_id',p_session_id,'party_id',v_party,'region_id',v_state.region_id,
    'encounter_type',v_state.encounter_type,'group_size',v_state.group_size,'enemy_name',v_state.encounter_name,
    'round',v_state.round_no,'enemy_hp',v_state.monster_hp,'enemy_max_hp',v_state.monster_max_hp,
    'monsters',v_monsters,'members',v_members,'status',v_state.status);
end $$;

-- Server-authoritative basic attacks, mana skill, guard, heal and consumable potion.
-- A single action per living member per round remains enforced by the unique action ledger.
drop function if exists public.etranom_party_battle_act(uuid,text,integer);
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
  q numeric; xp_gain integer:=20; v_recipe text; v_class text; m record; enemy_damage integer; target_uid uuid; target_hp integer; member_damage integer;
begin
  if uid is null then raise exception 'auth_required'; end if;
  if action_name not in ('attack','skill','guard','heal','potion') then raise exception 'battle_action_invalid'; end if;
  select s.party_id into v_party from public.party_sessions s join public.party_members pm on pm.party_id=s.party_id and pm.user_id=uid
    where s.id=p_session_id and s.status='active';
  if v_party is null then raise exception 'battle_not_available'; end if;
  select * into st from public.party_battle_state where session_id=p_session_id for update;
  if st.status<>'active' then raise exception 'battle_already_finished'; end if;
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
    if action_name='skill' then
      if mp<8 then raise exception 'insufficient_mana'; end if;
      mp:=mp-8; damage:=greatest(5,floor((10+attack_power*2.8)*(100/(100+greatest(0,coalesce((monster->>'defense')::integer,0))*1.25)) )::integer);
    else
      damage:=greatest(3,floor((attack_power*2.2)*(100/(100+greatest(0,coalesce((monster->>'defense')::integer,0))*1.25)))::integer);
    end if;
    newhp:=greatest(0,coalesce((monster->>'hp')::integer,0)-damage);
    monster:=jsonb_set(monster,'{hp}',to_jsonb(newhp),true);
    monsters:=jsonb_set(monsters,array[(idx-1)::text],monster,true);

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
      v_class:=coalesce(nullif(profile->>'class',''),'جنگجو');
      v_recipe:=null;
      select r.id into v_recipe from public.etranom_content_recipes r where r.region_id=st.region_id and r.class_name=v_class order by random() limit 1;
      if v_recipe is not null and random()*100 >= coalesce((select r.drop_chance from public.etranom_content_recipes r where r.id=v_recipe),0) then v_recipe:=null; end if;
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
      v_save_data:=jsonb_set(jsonb_set(v_save_data,'{gold}',to_jsonb(coalesce(nullif(v_save_data->>'gold','')::bigint,0)+coins),true),'{inventory}',inventory,true);
      update public.game_saves gs set save_data=jsonb_set(v_save_data,'{updatedAt}',to_jsonb(now()::text),true),updated_at=now() where gs.user_id=uid;
      insert into public.party_battle_kill_ledger(session_id,monster_index,monster_id,user_id,material_drops,recipe_id,xp,coins)
        values(p_session_id,idx,coalesce(monster->>'id','monster'),uid,material_drops,v_recipe,xp_gain,coins) on conflict(session_id,monster_index) do nothing;
      insert into public.party_battle_reward_ledger(session_id,user_id,xp,coins,materials)
        values(p_session_id,uid,xp_gain,coins,material_drops)
        on conflict(session_id,user_id) do update set xp=public.party_battle_reward_ledger.xp+excluded.xp,
          coins=public.party_battle_reward_ledger.coins+excluded.coins,materials=public.party_battle_reward_ledger.materials||excluded.materials;
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
  insert into public.party_battle_actions(session_id,round_no,user_id,action,damage) values(p_session_id,st.round_no,uid,action_name,damage);
  select count(*) into alive_count from jsonb_each_text(hpmap) e where e.value::integer>0;
  select count(*) into done_count from public.party_battle_actions a where a.session_id=p_session_id and a.round_no=st.round_no
    and coalesce((hpmap->>a.user_id::text)::integer,0)>0;

  if not exists(select 1 from jsonb_array_elements(monsters) e(value) where coalesce((e.value->>'hp')::integer,0)>0) then
    st.status:='victory'; st.completed_at:=now();
  elsif done_count>=alive_count and alive_count>0 then
    select value into monster from jsonb_array_elements(monsters) where coalesce((value->>'hp')::integer,0)>0 limit 1;
    enemy_damage:=greatest(1,coalesce((monster->>'attack')::integer,12));
    for m in select pm.user_id from public.party_members pm where pm.party_id=v_party loop
      target_hp:=coalesce((hpmap->>m.user_id::text)::integer,0);
      if target_hp>0 then
        profile:=profiles -> (m.user_id::text);
        defense_power:=greatest(0,coalesce((profile->>'defense')::integer,0));
        member_damage:=enemy_damage;
        if coalesce((guards->>m.user_id::text)::boolean,false) then member_damage:=greatest(1,floor(member_damage*.5)::integer); end if;
        newhp:=greatest(0,target_hp-greatest(1,floor(member_damage*(100/(100+defense_power*1.25)))::integer));
        hpmap:=hpmap||jsonb_build_object(m.user_id::text,newhp);
      end if;
    end loop;
    if not exists(select 1 from jsonb_each_text(hpmap) e where e.value::integer>0) then st.status:='defeat'; st.completed_at:=now();
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

revoke all on function public.etranom_party_character_combat_profile(uuid) from public,anon,authenticated;
revoke all on function public.etranom_party_battle_load_character_profiles() from public,anon,authenticated;
revoke all on function public.etranom_party_battle_snapshot(uuid) from public,anon;
revoke all on function public.etranom_party_battle_act(uuid,text,integer) from public,anon;
grant execute on function public.etranom_party_battle_snapshot(uuid) to authenticated;
grant execute on function public.etranom_party_battle_act(uuid,text,integer) to authenticated;
commit;
