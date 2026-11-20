-- ETRANOM v157 / Group Battle Phase 8: server-authoritative Wizard skill actions
-- Apply after v156. This phase wires a verified subset of the four existing Wizard specialization modules.
begin;

create table if not exists public.party_battle_skill_catalog (
  specialization_key text not null,
  skill_id text not null,
  skill_data jsonb not null,
  enabled boolean not null default true,
  primary key(specialization_key,skill_id)
);
alter table public.party_battle_skill_catalog enable row level security;
revoke all on public.party_battle_skill_catalog from public,anon,authenticated;
insert into public.party_battle_skill_catalog(specialization_key,skill_id,skill_data) values
('wizard_arcane_mage','arcane_bolt', '{"id": "arcane_bolt", "name": "گلوله آرکین", "type": "single_damage", "manaPct": 3, "cooldownTurns": 0, "unlockLevel": 1, "damagePct": 130, "shieldPct": 0, "healPct": 0}'::jsonb),
('wizard_arcane_mage','arcane_shield', '{"id": "arcane_shield", "name": "سپر آرکین", "type": "shield", "manaPct": 8, "cooldownTurns": 3, "unlockLevel": 2, "damagePct": 0, "shieldPct": 180, "healPct": 0}'::jsonb),
('wizard_elementalist','ember_bolt', '{"id": "ember_bolt", "name": "گلوله اخگر", "type": "single_damage", "manaPct": 4, "cooldownTurns": 0, "unlockLevel": 1, "damagePct": 150, "shieldPct": 0, "healPct": 0}'::jsonb),
('wizard_elementalist','frozen_armor', '{"id": "frozen_armor", "name": "زره یخی", "type": "shield", "manaPct": 7, "cooldownTurns": 3, "unlockLevel": 2, "damagePct": 0, "shieldPct": 180, "healPct": 0}'::jsonb),
('wizard_elementalist','tidal_renewal', '{"id": "tidal_renewal", "name": "موج احیاگر", "type": "self_heal", "manaPct": 10, "cooldownTurns": 4, "unlockLevel": 6, "damagePct": 0, "shieldPct": 0, "healPct": 22}'::jsonb),
('wizard_warlock','forbidden_signature', '{"id": "forbidden_signature", "name": "مُهر ممنوعه", "type": "single_damage", "manaPct": 7, "cooldownTurns": 0, "unlockLevel": 1, "damagePct": 170, "shieldPct": 0, "healPct": 0}'::jsonb),
('wizard_necromancer','death_claw', '{"id": "death_claw", "name": "چنگال مرگ", "type": "single_damage", "manaPct": 7, "cooldownTurns": 0, "unlockLevel": 1, "damagePct": 220, "shieldPct": 0, "healPct": 0}'::jsonb),
('wizard_elementalist','radiant_judgment', '{"id": "radiant_judgment", "name": "داوری تابان", "type": "single_damage", "manaPct": 10, "cooldownTurns": 3, "unlockLevel": 7, "damagePct": 230, "shieldPct": 0, "healPct": 0}'::jsonb),
('wizard_elementalist','darkness_chains', '{"id": "darkness_chains", "name": "زنجیرهای تاریکی", "type": "single_damage", "manaPct": 11, "cooldownTurns": 4, "unlockLevel": 8, "damagePct": 175, "shieldPct": 0, "healPct": 0}'::jsonb)
on conflict(specialization_key,skill_id) do update set skill_data=excluded.skill_data,enabled=true;

alter table public.party_battle_actions drop constraint if exists party_battle_actions_action_check;
alter table public.party_battle_actions add constraint party_battle_actions_action_check
  check (action in ('attack','skill','guard','heal','potion') or action like 'skill:%');

create or replace function public.etranom_party_battle_snapshot(p_session_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid:=auth.uid(); v_party uuid; v_state public.party_battle_state%rowtype; v_members jsonb; v_monsters jsonb;
begin
  if uid is null then raise exception 'auth_required'; end if;
  select s.party_id into v_party from public.party_sessions s
    join public.party_members pm on pm.party_id=s.party_id and pm.user_id=uid where s.id=p_session_id;
  if v_party is null then raise exception 'battle_not_available'; end if;
  select * into v_state from public.party_battle_state where session_id=p_session_id;
  select coalesce(jsonb_agg(jsonb_build_object(
    'user_id',pm.user_id,'display_name',coalesce(pp.display_name,pp.username,'ماجراجو'),
    'level',coalesce(((v_state.player_combat -> (pm.user_id::text)) ->> 'level')::integer,pp.player_level,1),
    'player_class',coalesce((v_state.player_combat -> (pm.user_id::text)) ->> 'class',pp.player_class,'ماجراجو'),
    'specialization',coalesce(gs.save_data->'character'->>'specialization',''),
    'hp',coalesce((v_state.player_hp->>pm.user_id::text)::integer,0),
    'max_hp',coalesce(((v_state.player_combat -> (pm.user_id::text)) ->> 'max_hp')::integer,100),
    'mp',coalesce(((v_state.player_combat -> (pm.user_id::text)) ->> 'mp')::integer,0),
    'max_mp',coalesce(((v_state.player_combat -> (pm.user_id::text)) ->> 'max_mp')::integer,60),
    'attack',coalesce(((v_state.player_combat -> (pm.user_id::text)) ->> 'attack')::integer,1),
    'defense',coalesce(((v_state.player_combat -> (pm.user_id::text)) ->> 'defense')::integer,0),
    'kills',coalesce((v_state.kills_by_user->>pm.user_id::text)::integer,0),
    'ready',exists(select 1 from public.party_battle_actions a where a.session_id=p_session_id and a.round_no=v_state.round_no and a.user_id=pm.user_id),
    'connected',exists(select 1 from public.party_battle_presence bp where bp.session_id=p_session_id and bp.user_id=pm.user_id and bp.last_seen_at>now()-interval '45 seconds'),
    'last_seen_at',(select bp.last_seen_at from public.party_battle_presence bp where bp.session_id=p_session_id and bp.user_id=pm.user_id)
  ) order by pm.joined_at),'[]'::jsonb) into v_members
  from public.party_members pm
  left join public.player_profiles pp on pp.user_id=pm.user_id
  left join public.game_saves gs on gs.user_id=pm.user_id
  where pm.party_id=v_party;
  select coalesce(jsonb_agg(x || jsonb_build_object('index',ord)), '[]'::jsonb) into v_monsters
    from jsonb_array_elements(v_state.monsters) with ordinality as t(x,ord);
  return jsonb_build_object('session_id',p_session_id,'party_id',v_party,'region_id',v_state.region_id,
    'encounter_type',v_state.encounter_type,'group_size',v_state.group_size,'enemy_name',v_state.encounter_name,
    'round',v_state.round_no,'enemy_hp',v_state.monster_hp,'enemy_max_hp',v_state.monster_max_hp,
    'monsters',v_monsters,'members',v_members,'status',v_state.status);
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
  q numeric; xp_gain integer:=20; v_recipe text; v_class text; m record; enemy_damage integer; target_uid uuid; target_hp integer; member_damage integer; v_ledger_rows integer:=0; v_skill_id text; v_skill jsonb; v_skill_type text; v_spec_key text; v_spec_name text; v_mana_cost integer; v_cooldowns jsonb; v_action_label text:=p_action; v_skill_pct numeric; v_skill_value integer;
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
