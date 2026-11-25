-- ETRANOM v181.1 party RPC installer — fragment 2/3. Run after the Wizard catalog parts.
begin;
insert into public.etranom_v181_rpc_staging(part,fragment) values (2,$v181part$,'name',coalesce(monster->>'name',monster->>'enemy','Undead'),'level',coalesce((monster->>'level')::integer,level_no),'hp',greatest(1,coalesce((monster->>'max_hp')::integer,coalesce((monster->>'hp')::integer,1))),'maxHp',greatest(1,coalesce((monster->>'max_hp')::integer,1)),'baseMaxHp',greatest(1,coalesce((monster->>'max_hp')::integer,1)),'attack',greatest(1,coalesce((monster->>'attack')::integer,1)),'baseAttack',greatest(1,coalesce((monster->>'attack')::integer,1)),'defense',greatest(0,coalesce((monster->>'defense')::integer,0)),'baseDefense',greatest(0,coalesce((monster->>'defense')::integer,0)),'permanent',true);
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
      damage:=0;
      if v_is_damage then
        for target_row in select q.x,q.ord::integer as ord from jsonb_array_elements(monsters) with ordinality q(x,ord)
          where coalesce((q.x->>'hp')::integer,0)>0 and (v_is_aoe or q.ord=idx)
          order by q.ord
          limit case when v_skill_type='multi_target_damage' then greatest(1,coalesce((v_skill->>'maxTargets')::integer,3)) else 999 end loop
          if random()*100<v_hit_chance then
            v_raw_damage:=v_skill_power*v_skill_pct/100;
            v_skill_value:=greatest(0,coalesce((v_skill->>'defensePenetrationPct')::integer,0));
            v_attack_reduction:=greatest(0,least(80,coalesce((target_row.x->'statuses'->v_skill_id->>'defenseReductionPct')::numeric,0)));
            v_defense_reduction:=greatest(0,least(80,v_skill_value));
            v_skill_damage:=greatest(1,coalesce((public.etranom_combat_resolve_damage(v_raw_damage,greatest(0,coalesce((target_row.x->>'defense')::numeric,0))*(1-v_defense_reduction/100),1,0,0,0,1.25,1,1,100,0,v_crit_chance,random()*100,1.5)->>'damage')::integer,0));
          else v_skill_damage:=0; end if;
          v_target_monster:=jsonb_set(target_row.x,'{hp}',to_jsonb(greatest(0,coalesce((target_row.x->>'hp')::integer,0)-v_skill_damage)),true);
          if (v_is_status or v_skill_id in ('death_claw','ember_bolt','life_siphon','forbidden_signature','darkness_chains','chain_lightning','tempest','earth_rupture')) and (coalesce((v_skill->>'dotPct')::numeric,case when v_skill_id in ('death_claw','ember_bolt','life_siphon') then 12 else 0 end)>0 or coalesce((v_skill->>'attackReductionPct')::numeric,case when v_skill_id in ('forbidden_signature','darkness_chains','chain_lightning','tempest','stolen_moment','death_memory','true_name_shatter') then 15 else 0 end)>0 or coalesce((v_skill->>'defenseReductionPct')::numeric,case when v_skill_id in ('earth_rupture','death_memory') then 10 else 0 end)>0) then
            v_statuses:=coalesce(v_target_monster->'statuses','{}'::jsonb);
            v_status_data:=jsonb_build_object('turns',greatest(1,coalesce((v_skill->>'durationTurns')::integer,2)),'dotPct',greatest(0,coalesce((v_skill->>'dotPct')::numeric,case when v_skill_id in ('death_claw','ember_bolt','life_siphon') then 12 else 0 end)),'attackReductionPct',greatest(0,least(80,coalesce((v_skill->>'attackReductionPct')::numeric,case when v_skill_id in ('forbidden_signature','darkness_chains','chain_lightning','tempest','stolen_moment','death_memory','true_name_shatter') then 15 else 0 end))),'defenseReductionPct',greatest(0,least(80,coalesce((v_skill->>'defenseReductionPct')::numeric,case when v_skill_id in ('earth_rupture','death_memory') then 10 else 0 end))),'linkPct',coalesce((v_skill->>'linkPct')::numeric,22),'sourceUserId',uid::text);
            v_statuses:=jsonb_set(v_statuses,array[v_skill_id],v_status_data,true); v_target_monster:=jsonb_set(v_target_monster,'{statuses}',v_statuses,true);
          end if;
          monsters:=jsonb_set(monsters,array[(target_row.ord-1)::text],v_target_monster,true);
          damage:=damage+v_skill_damage;
          if v_skill_damage>0 then profile:=jsonb_set(profile,'{last_party_damage_pct}',to_jsonb(v_skill_pct),true); end if;
        end loop;
        select q.x into monster from jsonb_array_elements(monsters) with ordinality q(x,ord) where q.ord=idx;
        newhp:=coalesce((monster->>'hp')::integer,0);
        if v_skill_type in ('life_steal','single_damage_drain') and damage>0 then hp:=least(maxhp,hp+greatest(1,floor(damage*0.30)::integer)); hpmap:=hpmap||jsonb_build_object(uid::text,hp); end if;
        if v_skill_type='single_damage_cleanse' then profile:=jsonb_set(profile,'{party_statuses}','{}'::jsonb,true); end if;
      elsif v_is_status then
        if v_skill_type='purge' then
          for target_row in select q.x,q.ord::integer as ord from jsonb_array_elements(monsters) with ordinality q(x,ord)
            where coalesce((q.x->>'hp')::integer,0)>0 and (v_is_aoe or q.ord=idx) order by q.ord loop
            v_target_monster:=jsonb_set(target_row.x,'{buffs}','{}'::jsonb,true);
            monsters:=jsonb_set(monsters,array[(target_row.ord-1)::text],v_target_monster,true);
          end loop;
        else
          for target_row in select q.x,q.ord::integer as ord from jsonb_array_elements(monsters) with ordinality q(x,ord)
            where coalesce((q.x->>'hp')::integer,0)>0 and (v_is_aoe or q.ord=idx) order by q.ord loop
            v_statuses:=coalesce(target_row.x->'statuses','{}'::jsonb);
            v_status_data:=jsonb_build_object('turns',greatest(1,coalesce((v_skill->>'durationTurns')::integer,2)),'dotPct',greatest(0,coalesce((v_skill->>'dotPct')::numeric,case when v_skill_id in ('death_claw','ember_bolt','life_siphon') then 12 else 0 end)),'attackReductionPct',greatest(0,least(80,coalesce((v_skill->>'attackReductionPct')::numeric,case when v_skill_id in ('forbidden_signature','darkness_chains','chain_lightning','tempest','stolen_moment','death_memory','true_name_shatter') then 15 else 0 end))),'defenseReductionPct',greatest(0,least(80,coalesce((v_skill->>'defenseReductionPct')::numeric,case when v_skill_id in ('earth_rupture','death_memory') then 10 else 0 end))),'linkPct',coalesce((v_skill->>'linkPct')::numeric,22),'sourceUserId',uid::text);
            v_statuses:=jsonb_set(v_statuses,array[v_skill_id],v_status_data,true);
            v_target_monster:=jsonb_set(target_row.x,'{statuses}',v_statuses,true);
            monsters:=jsonb_set(monsters,array[(target_row.ord-1)::text],v_target_monster,true);
          end loop;
        end if;
        select q.x into monster from jsonb_array_elements(monsters) with ordinality q(x,ord) where q.ord=idx;
        newhp:=coalesce((monster->>'hp')::integer,0);
      else newhp:=coalesce((monster->>'hp')::integer,0); end if;
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
    if v_skill_id is null then
      newhp:=greatest(0,coalesce((monster->>'hp')::integer,0)-damage);
      monster:=jsonb_set(monster,'{hp}',to_jsonb(newhp),true);
      monsters:=jsonb_set(monsters,array[(idx-1)::text],monster,true);
    end if;

    -- Existing Wizard summons attack once on their owner's later attack/skill action.
    -- A summon created this round starts attacking on the next round.
    v_summons:=coalesce(profile->'party_summons','[]'::jsonb);
    if jsonb_typeof(v_summons)='array' then
      for status_row in select value from jsonb_array_elements(v_summons) loop
        if coalesce((status_row.value->>'hp')::integer,0)>0
          and coalesce((status_row.value->>'turns')::integer,0)>0
          and coalesce((status_row.value->>'createdRound')::integer,0)<st.round_no then
          select q.x,q.ord::integer into target_row from jsonb_array_elements(monsters) with ordinality q(x,ord)
            where coalesce((q.x->>'hp')::integer,0)>0 order by q.ord limit 1;
          if found then
            v_skill_damage:=greatest(1,coalesce((public.etranom_combat_resolve_damage(
              greatest(1,coalesce((status_row.value->>'attack')::numeric,1)),
              greatest(0,coalesce((target_row.x->>'defense')::numeric,0)),1,0,0,0,1.25,1,1,
              100,0,0,random()*100,1.5)->>'damage')::integer,0));
            target_row.x:=jsonb_set(target_row.x,'{hp}',to_jsonb(greatest(0,coalesce((target_row.x->>'hp')::integer,0)-v_skill_damage)),true);
            monsters:=jsonb_set(monsters,array[(target_row.ord-1)::text],target_row.x,true);
            damage:=damage+v_skill_damage;
          end if;
        end if;
      end loop;
    end if;

    -- Every newly defeated target (including AoE/DOT kills) receives exactly one ledger entry.
    for kill_row in select q.x,q.ord::integer as ord from jsonb_array_elements(monsters) with ordinality q(x,ord)
      where coalesce((q.x->>'hp')::integer,0)<=0
        and not exists(select 1 from public.party_battle_kill_ledger kl where kl.session_id=p_session_id and kl.monster_index=q.ord::integer)
    loop
      idx:=kill_row.ord; monster:=kill_row.x;
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
          if jsonb_typeof(v_save_data->'knownRecipes')<>'array' or v_save_dat$v181part$) on conflict(part) do update set fragment=excluded.fragment;
commit;
