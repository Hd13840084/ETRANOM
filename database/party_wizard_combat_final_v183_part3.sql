-- ETRANOM v183 Party RPC fragment; run in listed order.
begin;
create table if not exists public.etranom_v183_rpc_staging(part integer primary key,fragment text not null);
alter table public.etranom_v183_rpc_staging enable row level security;
revoke all on public.etranom_v183_rpc_staging from public,anon,authenticated;
insert into public.etranom_v183_rpc_staging(part,fragment) values (3,$v183_3$nBuffs}',jsonb_build_object('defensePct',0,'attackPct',20,'turns',3),true); end if;
        if v_skill_id='heir_of_hunger' then v_wizard_progress:=jsonb_set(v_wizard_progress,'{hungerTurns}','3'::jsonb,true); v_wizard_progress:=jsonb_set(v_wizard_progress,'{hungerReservoir}',to_jsonb(least(12,coalesce((v_wizard_progress->>'hungerReservoir')::integer,0))),true); end if;
        if v_skill_id='court_of_nameless' then v_wizard_progress:=jsonb_set(v_wizard_progress,'{courtMode}',to_jsonb(v_choice),true); v_wizard_progress:=jsonb_set(v_wizard_progress,'{courtTurns}','2'::jsonb,true); end if;
        if v_skill_id='final_covenant' and v_choice='dominion' then
          v_missing_hp:=0;
          for target_row in select q.x,q.ord::integer as ord from jsonb_array_elements(monsters) with ordinality q(x,ord) where coalesce((q.x->>'hp')::integer,0)>0 loop
            v_missing_hp:=v_missing_hp+greatest(0,coalesce((target_row.x->>'max_hp')::integer,coalesce((target_row.x->>'hp')::integer,0))-coalesce((target_row.x->>'hp')::integer,0));
            v_statuses:=coalesce(target_row.x->'statuses','{}'::jsonb);
            v_statuses:=jsonb_set(v_statuses,'{final_covenant}',jsonb_build_object('turns',2,'attackReductionPct',18,'sourceUserId',uid::text),true);
            v_target_monster:=jsonb_set(target_row.x,'{statuses}',v_statuses,true); monsters:=jsonb_set(monsters,array[(target_row.ord-1)::text],v_target_monster,true);
          end loop;
          hp:=least(maxhp,hp+floor(v_missing_hp*.18)::integer); hpmap:=hpmap||jsonb_build_object(uid::text,hp);
        elsif v_skill_id='final_covenant' and v_choice='void' then
          for target_row in select q.x,q.ord::integer as ord from jsonb_array_elements(monsters) with ordinality q(x,ord) where coalesce((q.x->>'hp')::integer,0)>0 loop
            v_target_monster:=jsonb_set(target_row.x,'{buffs}','{}'::jsonb,true); monsters:=jsonb_set(monsters,array[(target_row.ord-1)::text],v_target_monster,true);
          end loop;
        end if;
      elsif v_skill_type in ('summon','summon_resource') then
        v_summons:=coalesce(profile->'party_summons','[]'::jsonb);
        if jsonb_array_length(v_summons)>=3 then raise exception 'party_summon_capacity_reached'; end if;
        v_summon:=jsonb_build_object('id',v_skill_id||'_'||st.round_no,'sourceSkill',v_skill_id,'hp',greatest(1,floor(maxhp*coalesce((v_skill->>'summonHpPct')::numeric,35)/100)::integer),'attack',greatest(1,floor(attack_power*coalesce((v_skill->>'summonDamagePct')::numeric,50)/100)::integer),'turns',greatest(1,coalesce((v_skill->>'durationTurns')::integer,3)),'createdRound',st.round_no);
        v_summons:=v_summons||jsonb_build_array(v_summon); profile:=jsonb_set(profile,'{party_summons}',v_summons,true);
        if v_skill_id='heir_of_hunger' then
          v_wizard_progress:=jsonb_set(v_wizard_progress,'{hungerTurns}','3'::jsonb,true);
          v_wizard_progress:=jsonb_set(v_wizard_progress,'{hungerReservoir}',to_jsonb(least(12,coalesce((v_wizard_progress->>'hungerReservoir')::integer,0))),true);
        end if;
      elsif v_skill_type in ('permanent_recruit') then
        null; -- persistent corpse recruitment is validated and saved below
      elsif v_skill_type in ('control','debuff','debuff_choice','control_choice','choice_control','true_name_debuff','選択_debuff',' 선택_debuff','purge','link') then
        v_is_status:=true;
      elsif not v_is_damage then
        raise exception 'party_wizard_skill_type_not_supported';
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
        v_wizard_progress:=v_recruit_progress;
        update public.game_saves gs set save_data=jsonb_set(v_save_data,'{updatedAt}',to_jsonb(now()::text),true),updated_at=now() where gs.user_id=uid;
      else
        update public.game_saves gs set save_data=jsonb_set(gs.save_data,'{updatedAt}',to_jsonb(now()::text),true),updated_at=now() where gs.user_id=uid;
      end if;
    end if;
    if v_skill_id is not null then
      if v_spec_key='wizard_necromancer' and coalesce((v_wizard_progress->>'sovereignTurns')::integer,0)>0 then v_skill_power:=v_skill_power*1.20; end if;
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
            v_status_data:=jsonb_build_object('turns',greatest(1,coalesce((v_skill->>'durationTurns')::integer,2)),'dotPct',greatest(0,coalesce((v_skill->>'dotPct')::numeric,case when v_skill_id in ('death_claw','ember_bolt','life_siphon') then 12 else 0 end)),'attackReductionPct',greatest(0,least(80,coalesce((v_skill->>'attackReductionPct')::numeric,case when v_skill_id in ('forbidden_signature','darkness_chains','chain_lightning','tempest','stolen_moment','death_memory','true_name_shatter') then 15 else 0 end))),'defenseReductionPct',greatest(0,least(80,coalesce((v_skill->>'defenseReductionPct')::numeric,case when v_skill_id in ('earth_rupture','death_memory') then 10 else 0 end))),'linkPct',coalesce((v_skill->>'linkPct')::numeric,case when v_skill_id='hostage_heart' then 22 else 0 end),'healPct',case when v_skill_id='hostage_heart' then 18 else 0 end,'choice',coalesce(v_choice,''),'sourceUserId',uid::text,'specialSkillLocked',v_skill_id$v183_3$) on conflict(part) do update set fragment=excluded.fragment;
commit;
