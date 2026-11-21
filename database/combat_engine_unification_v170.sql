-- ETRANOM v170: route authoritative party and PvP damage through shared combat math.
-- Additive/reversible in scope: only replaces the two existing action RPC bodies.
-- Apply AFTER all existing v165.3 / party / PvP migrations. Does not rewrite saves or ledgers.
-- Shared resolver is immutable; authoritative RPCs continue to lock sessions/matches and
-- derive combatant stats from server-side state. Client-submitted damage is never accepted.
begin;

create or replace function public.etranom_combat_resolve_damage(
  p_attack numeric,
  p_defense numeric,
  p_power_scale numeric default 1,
  p_flat_bonus numeric default 0,
  p_variance numeric default 0,
  p_variance_roll numeric default 0,
  p_defense_scale numeric default 1.25,
  p_guard_multiplier numeric default 1,
  p_min_damage integer default 1,
  p_hit_chance numeric default 100,
  p_hit_roll numeric default 0,
  p_crit_chance numeric default 0,
  p_crit_roll numeric default 100,
  p_crit_multiplier numeric default 1.5
) returns jsonb
language plpgsql
immutable
security invoker
set search_path = ''
as $$
declare
  v_attack numeric := greatest(0, coalesce(p_attack,0));
  v_defense numeric := greatest(0, coalesce(p_defense,0));
  v_hit_chance numeric := greatest(0,least(100,coalesce(p_hit_chance,100)));
  v_crit_chance numeric := greatest(0,least(100,coalesce(p_crit_chance,0)));
  v_roll numeric := greatest(0,least(99.999999,coalesce(p_hit_roll,0)));
  v_crit_roll numeric := greatest(0,least(99.999999,coalesce(p_crit_roll,100)));
  v_variance_roll numeric := greatest(0,least(0.999999,coalesce(p_variance_roll,0)));
  v_raw numeric;
  v_damage integer;
  v_critical boolean;
begin
  if v_roll >= v_hit_chance then
    return jsonb_build_object('hit',false,'critical',false,'damage',0,'reason','miss');
  end if;
  v_raw := v_attack * greatest(0,coalesce(p_power_scale,1))
    + coalesce(p_flat_bonus,0)
    + greatest(0,coalesce(p_variance,0)) * v_variance_roll;
  v_damage := greatest(greatest(0,coalesce(p_min_damage,1)),
    floor(v_raw * (100 / (100 + v_defense * greatest(0,coalesce(p_defense_scale,1.25))))
      * greatest(0,least(1,coalesce(p_guard_multiplier,1))))::integer);
  v_critical := v_crit_roll < v_crit_chance;
  if v_critical then
    v_damage := floor(v_damage * greatest(1,coalesce(p_crit_multiplier,1.5)))::integer;
  end if;
  return jsonb_build_object('hit',true,'critical',v_critical,'damage',greatest(0,v_damage),'reason',null);
end;
$$;


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
       where q.ord=p_target_index and (coalesce((q.x->>'hp')::integer,0)>0 or (v_skill_type='permanent_recruit' and coalesce((q.x->>'hp')::integer,0)<=0));
    else
      if v_skill_type='permanent_recruit' then raise exception 'necromancer_recruit_requires_selected_corpse'; end if;
      for item,ord in select x,ord::integer from jsonb_array_elements(monsters) with ordinality q(x,ord) loop
        if coalesce((item->>'hp')::integer,0)>0 then idx:=ord; monster:=item; exit; end if;
      end loop;
    end if;
    if idx is null then
      if v_skill_type='permanent_recruit' then raise exception 'necromancer_recruit_requires_selected_corpse';
      else raise exception 'party_target_invalid_or_defeated'; end if;
    end if;
    if v_skill_id is not null and v_skill_type='permanent_recruit' then
      if coalesce((monster->>'hp')::integer,0)>0 or coalesce((monster->>'boss')::boolean,false) or coalesce(monster->>'encounterKind','') in ('boss','area_boss') or coalesce((monster->>'recruitable')::boolean,true)=false then raise exception 'necromancer_recruit_invalid_corpse'; end if;
      select gs.save_data into v_save_data from public.game_saves gs where gs.user_id=uid for update;
      if v_save_data is null then raise exception 'player_save_missing'; end if;
      v_recruit_progress:=coalesce(v_save_data#>'{classProgress,wizard_necromancer}','{}'::jsonb);
      v_recruit_legion:=coalesce(v_recruit_progress->'legion','[]'::jsonb);
      if jsonb_array_length(v_recruit_legion)>=10 then raise exception 'legion_full'; end if;
      v_recruit_chance:=least(75,35+greatest(0,coalesce((v_recruit_progress->'skillRanks'->>'legion')::integer,1)-1)*3+coalesce((v_recruit_progress->'talentEffects'->>'legionRecruitChancePct')::numeric,0));
      v_recruit_roll:=random()*100;
      monster:=jsonb_set(monster,'{recruitAttempted}','true'::jsonb,true); monsters:=jsonb_set(monsters,array[(idx-1)::text],monster,true);
      if v_recruit_roll<v_recruit_chance then
        v_member_id:=gen_random_uuid();
        v_recruit_member:=jsonb_build_object('id',v_member_id::text,'instanceId',v_member_id::text,'speciesId',coalesce(monster->>'id','undead'),'name',coalesce(monster->>'name',monster->>'enemy','Undead'),'level',coalesce((monster->>'level')::integer,level_no),'hp',greatest(1,coalesce((monster->>'max_hp')::integer,coalesce((monster->>'hp')::integer,1))),'maxHp',greatest(1,coalesce((monster->>'max_hp')::integer,1)),'baseMaxHp',greatest(1,coalesce((monster->>'max_hp')::integer,1)),'attack',greatest(1,coalesce((monster->>'attack')::integer,1)),'baseAttack',greatest(1,coalesce((monster->>'attack')::integer,1)),'defense',greatest(0,coalesce((monster->>'defense')::integer,0)),'baseDefense',greatest(0,coalesce((monster->>'defense')::integer,0)),'permanent',true);
        v_recruit_legion:=v_recruit_legion||jsonb_build_array(v_recruit_member); v_recruit_progress:=jsonb_set(v_recruit_progress,'{legion}',v_recruit_legion,true);
        if jsonb_typeof(v_recruit_progress->'activeLegionIds')<>'array' then v_recruit_progress:=jsonb_set(v_recruit_progress,'{activeLegionIds}','[]'::jsonb,true); end if;
        if jsonb_array_length(v_recruit_progress->'activeLegionIds')<3 then v_recruit_progress:=jsonb_set(v_recruit_progress,'{activeLegionIds}',(v_recruit_progress->'activeLegionIds')||jsonb_build_array(v_recruit_member->>'id'),true); end if;
        v_save_data:=jsonb_set(v_save_data,'{classProgress,wizard_necromancer}',v_recruit_progress,true);
        update public.game_saves gs set save_data=jsonb_set(v_save_data,'{updatedAt}',to_jsonb(now()::text),true),updated_at=now() where gs.user_id=uid;
      else
        update public.game_saves gs set save_data=jsonb_set(gs.save_data,'{updatedAt}',to_jsonb(now()::text),true),updated_at=now() where gs.user_id=uid;
      end if;
    end if;
    if v_skill_id is not null then
      v_hit_chance:=greatest(65,least(99,88+(v_perception-10)*.30));
      if v_skill_type='single_damage' then
        if random()*100>=v_hit_chance then damage:=0;
        else
          v_raw_damage:=v_skill_power*v_skill_pct/100;
          damage:=greatest(1,coalesce((public.etranom_combat_resolve_damage(
            v_raw_damage,greatest(0,coalesce((monster->>'defense')::numeric,0)),1,0,0,0,1.25,1,1,100,0,
            v_crit_chance,random()*100,1.5)->>'damage')::integer,0));
        end if;
      else damage:=0; end if;
    elsif action_name='skill' then
      if mp<8 then raise exception 'insufficient_mana'; end if;
      mp:=mp-8; v_hit_chance:=greatest(65,least(98,85+(v_perception-10)*.35));
      if random()*100>=v_hit_chance then damage:=0;
      else
        v_raw_damage:=10+attack_power*2.8+random()*4;
        damage:=greatest(5,coalesce((public.etranom_combat_resolve_damage(
          v_raw_damage,greatest(0,coalesce((monster->>'defense')::numeric,0)),1,0,0,0,1.25,1,5,
          100,0,0,100,1.5)->>'damage')::integer,0));
      end if;
    else
      v_hit_chance:=greatest(65,least(98,85+(v_perception-10)*.35));
      if random()*100>=v_hit_chance then damage:=0;
      else
        v_raw_damage:=attack_power*2.2+random()*4;
        damage:=greatest(3,coalesce((public.etranom_combat_resolve_damage(
          v_raw_damage,greatest(0,coalesce((monster->>'defense')::numeric,0)),1,0,0,0,1.25,1,3,
          100,0,v_crit_chance,random()*100,1.5)->>'damage')::integer,0));
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

create or replace function public.etranom_pvp_action(p_match uuid, p_action text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  m public.pvp_matches%rowtype;
  s jsonb;
  a jsonb;
  b jsonb;
  actor jsonb;
  target jsonb;
  actor_key text;
  target_key text;
  actor_id uuid;
  target_id uuid;
  actor_battle jsonb;
  target_battle jsonb;
  actor_char jsonb;
  target_char jsonb;
  hp numeric;
  max_hp numeric;
  mp numeric;
  max_mp numeric;
  atk numeric;
  def numeric;
  target_hp numeric;
  target_max_hp numeric;
  target_mp numeric;
  target_max_mp numeric;
  target_atk numeric;
  target_def numeric;
  damage integer := 0;
  raw_damage integer := 0;
  guarded boolean := false;
  winner uuid;
  next_player uuid;
  log_text text;
  now_at timestamptz := now();
begin
  if uid is null then raise exception 'auth_required'; end if;
  if p_action not in ('attack','guard') then raise exception 'invalid_action'; end if;

  select * into m from public.pvp_matches
   where id = p_match and uid in (player_a,player_b)
   for update;
  if not found then raise exception 'match_not_found'; end if;
  if m.status <> 'active' then raise exception 'match_not_active'; end if;
  if m.turn_player <> uid then raise exception 'not_your_turn'; end if;

  s := coalesce(m.combat_state,'{}'::jsonb);
  a := coalesce(s->'player_a','{}'::jsonb);
  b := coalesce(s->'player_b','{}'::jsonb);
  if m.player_a = uid then
    actor_key := 'player_a'; target_key := 'player_b'; actor_id := m.player_a; target_id := m.player_b;
    actor := a; target := b;
  else
    actor_key := 'player_b'; target_key := 'player_a'; actor_id := m.player_b; target_id := m.player_a;
    actor := b; target := a;
  end if;

  -- Initialize combat-only values once from the private snapshots. The save itself is
  -- never accepted from the client and remains inaccessible through the public API.
  actor_char := coalesce(actor->'save_snapshot'->'character','{}'::jsonb);
  target_char := coalesce(target->'save_snapshot'->'character','{}'::jsonb);
  if actor_char='{}'::jsonb or target_char='{}'::jsonb then raise exception 'combat_character_data_missing'; end if;
  actor_battle := coalesce(actor->'battle','{}'::jsonb);
  target_battle := coalesce(target->'battle','{}'::jsonb);

  if actor_battle = '{}'::jsonb or target_battle = '{}'::jsonb then
    max_hp := greatest(1,coalesce(nullif(actor_char->>'maxHp','')::numeric,nullif(actor_char->>'max_hp','')::numeric,nullif(actor_char#>>'{stats,maxHp}','')::numeric,nullif(actor_char->>'hp','')::numeric));
    hp := greatest(0,least(max_hp,coalesce(nullif(actor_char->>'hp','')::numeric,max_hp)));
    max_mp := greatest(0,coalesce(nullif(actor_char->>'maxMp','')::numeric,nullif(actor_char->>'max_mp','')::numeric,nullif(actor_char#>>'{stats,maxMp}','')::numeric,nullif(actor_char->>'mp','')::numeric,0));
    mp := greatest(0,least(max_mp,coalesce(nullif(actor_char->>'mp','')::numeric,max_mp)));
    atk := greatest(1,coalesce(nullif(actor_char->>'attack','')::numeric,nullif(actor_char#>>'{stats,attack}','')::numeric,nullif(actor_char->>'strength','')::numeric,nullif(actor_char#>>'{attributes,strength}','')::numeric,10));
    def := greatest(0,coalesce(nullif(actor_char->>'defense','')::numeric,nullif(actor_char#>>'{stats,defense}','')::numeric,nullif(actor_char->>'endurance','')::numeric,nullif(actor_char#>>'{attributes,endurance}','')::numeric,0));
    actor_battle := jsonb_build_object('hp',hp,'max_hp',max_hp,'mp',mp,'max_mp',max_mp,'attack',atk,'defense',def,'guard_next',false);

    max_hp := greatest(1,coalesce(nullif(target_char->>'maxHp','')::numeric,nullif(target_char->>'max_hp','')::numeric,nullif(target_char#>>'{stats,maxHp}','')::numeric,nullif(target_char->>'hp','')::numeric));
    target_hp := greatest(0,least(max_hp,coalesce(nullif(target_char->>'hp','')::numeric,max_hp)));
    max_mp := greatest(0,coalesce(nullif(target_char->>'maxMp','')::numeric,nullif(target_char->>'max_mp','')::numeric,nullif(target_char#>>'{stats,maxMp}','')::numeric,nullif(target_char->>'mp','')::numeric,0));
    target_mp := greatest(0,least(max_mp,coalesce(nullif(target_char->>'mp','')::numeric,max_mp)));
    target_atk := greatest(1,coalesce(nullif(target_char->>'attack','')::numeric,nullif(target_char#>>'{stats,attack}','')::numeric,nullif(target_char->>'strength','')::numeric,nullif(target_char#>>'{attributes,strength}','')::numeric,10));
    target_def := greatest(0,coalesce(nullif(target_char->>'defense','')::numeric,nullif(target_char#>>'{stats,defense}','')::numeric,nullif(target_char->>'endurance','')::numeric,nullif(target_char#>>'{attributes,endurance}','')::numeric,0));
    target_battle := jsonb_build_object('hp',target_hp,'max_hp',max_hp,'mp',target_mp,'max_mp',max_mp,'attack',target_atk,'defense',target_def,'guard_next',false);
  end if;

  if p_action = 'guard' then
    actor_battle := jsonb_set(actor_battle,'{guard_next}','true'::jsonb,true);
    log_text := coalesce(actor->>'name','بازیکن') || ' حالت دفاعی گرفت.';
  else
    guarded := coalesce((target_battle->>'guard_next')::boolean,false);
    raw_damage := greatest(1,coalesce((public.etranom_combat_resolve_damage(
      coalesce((actor_battle->>'attack')::numeric,10),
      coalesce((target_battle->>'defense')::numeric,0),
      1,0,3,random(),0.35,case when guarded then 0.5 else 1 end,1,
      100,0,0,100,1.5)->>'damage')::integer,0));
    damage := raw_damage;
    target_hp := greatest(0,coalesce((target_battle->>'hp')::numeric,1)-damage);
    target_battle := jsonb_set(target_battle,'{hp}',to_jsonb(target_hp),true);
    target_battle := jsonb_set(target_battle,'{guard_next}','false'::jsonb,true);
    log_text := coalesce(actor->>'name','بازیکن') || ' حمله کرد و ' || damage || ' آسیب وارد کرد.' || case when guarded then ' دفاع حریف نیمی از آسیب را گرفت.' else '' end;
    if actor_key='player_a' then update public.pvp_matches set score_a=score_a+damage where id=p_match;
    else update public.pvp_matches set score_b=score_b+damage where id=p_match; end if;
  end if;

  actor := jsonb_set(actor,'{battle}',actor_battle,true);
  target := jsonb_set(target,'{battle}',target_battle,true);
  if actor_key='player_a' then a:=actor; b:=target; else b:=actor; a:=target; end if;
  s := jsonb_set(s,'{player_a}',a,true);
  s := jsonb_set(s,'{player_b}',b,true);
  s := jsonb_set(s,'{log}',coalesce(s->'log','[]'::jsonb) || jsonb_build_array(jsonb_build_object('type',p_action,'text',log_text,'damage',damage,'at',now_at)),true);
  s := jsonb_set(s,'{round}',to_jsonb(greatest(1,ceil((m.turn_no+1)::numeric/2)::integer)),true);

  if p_action='attack' and coalesce((target_battle->>'hp')::numeric,1)<=0 then
    winner := uid;
    update public.pvp_matches set combat_state=s,status='completed',winner_id=winner,
      completed_at=now_at,updated_at=now_at,last_action_at=now_at,turn_no=turn_no+1,turn_player=null
      where id=p_match;
    insert into public.pvp_player_stats(user_id,wins,losses,draws)
      values(actor_id,1,0,0),(target_id,0,1,0)
      on conflict(user_id) do update set wins=public.pvp_player_stats.wins+excluded.wins,
        losses=public.pvp_player_stats.losses+excluded.losses,updated_at=now_at;
    return jsonb_build_object('success',true,'status','completed','winner_id',winner,'damage',damage,'turn_no',m.turn_no+1);
  end if;

  next_player := target_id;
  update public.pvp_matches set combat_state=s,turn_player=next_player,turn_no=turn_no+1,
    updated_at=now_at,last_action_at=now_at where id=p_match;
  return jsonb_build_object('success',true,'status','active','damage',damage,'turn_player',next_player,'turn_no',m.turn_no+1);
end;
$$;

revoke all on function public.etranom_combat_resolve_damage(numeric,numeric,numeric,numeric,numeric,numeric,numeric,numeric,integer,numeric,numeric,numeric,numeric,numeric) from public, anon;
grant execute on function public.etranom_combat_resolve_damage(numeric,numeric,numeric,numeric,numeric,numeric,numeric,numeric,integer,numeric,numeric,numeric,numeric,numeric) to authenticated;
revoke all on function public.etranom_party_battle_act(uuid,text,integer) from public, anon;
grant execute on function public.etranom_party_battle_act(uuid,text,integer) to authenticated;
revoke all on function public.etranom_pvp_action(uuid,text) from public, anon;
grant execute on function public.etranom_pvp_action(uuid,text) to authenticated;
commit;
