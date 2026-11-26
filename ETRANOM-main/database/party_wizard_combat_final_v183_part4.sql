-- ETRANOM v183 Party RPC fragment; run in listed order.
begin;
create table if not exists public.etranom_v183_rpc_staging(part integer primary key,fragment text not null);
alter table public.etranom_v183_rpc_staging enable row level security;
revoke all on public.etranom_v183_rpc_staging from public,anon,authenticated;
insert into public.etranom_v183_rpc_staging(part,fragment) values (4,$v183_4$='stolen_moment' or (v_skill_id='soul_domination' and v_choice='silence'),'controlled',v_skill_id='soul_domination' and v_choice='dominate','attackReductionPct',greatest(0,least(80,case when v_skill_id='true_name_shatter' and v_choice='will' then 20 when v_skill_id='death_memory' and v_choice='war' then 20 when v_skill_id='soul_domination' and v_choice='chain' then 20 when v_skill_id='forbidden_signature' then 8 else coalesce((v_skill->>'attackReductionPct')::numeric,0) end)),'defenseReductionPct',greatest(0,least(80,case when v_skill_id='true_name_shatter' and v_choice='body' then 22 when v_skill_id='death_memory' and v_choice='survival' then 20 else coalesce((v_skill->>'defenseReductionPct')::numeric,0) end)),'skillPowerReductionPct',case when v_skill_id='true_name_shatter' and v_choice='magic' then 25 when v_skill_id='death_memory' and v_choice='magic' then 25 when v_skill_id='soul_domination' and v_choice='chain' then 15 else 0 end);
            v_statuses:=jsonb_set(v_statuses,array[v_skill_id],v_status_data,true); v_target_monster:=jsonb_set(v_target_monster,'{statuses}',v_statuses,true);
          end if;
          monsters:=jsonb_set(monsters,array[(target_row.ord-1)::text],v_target_monster,true);
          damage:=damage+v_skill_damage;
          if v_skill_damage>0 then profile:=jsonb_set(profile,'{last_party_damage_pct}',to_jsonb(v_skill_pct),true); end if;
        end loop;
        select q.x into monster from jsonb_array_elements(monsters) with ordinality q(x,ord) where q.ord=idx;
        newhp:=coalesce((monster->>'hp')::integer,0);
        if v_skill_type in ('life_steal','single_damage_drain') and damage>0 then hp:=least(maxhp,hp+greatest(1,floor(damage*0.30)::integer)); hpmap:=hpmap||jsonb_build_object(uid::text,hp); end if;
        if v_reversal_cost>0 and damage>0 then hp:=least(maxhp,hp+floor(v_reversal_cost*.35)::integer); hpmap:=hpmap||jsonb_build_object(uid::text,hp); end if;
        if v_skill_id='death_claw' and newhp<=0 then v_wizard_progress:=jsonb_set(v_wizard_progress,'{souls}',to_jsonb(least(99,coalesce((v_wizard_progress->>'souls')::integer,0)+1)),true); end if;
        if v_skill_type='single_damage_cleanse' then profile:=jsonb_set(profile,'{party_statuses}','{}'::jsonb,true); end if;
      elsif v_is_status then
        if v_skill_id='stolen_moment' then
          v_wizard_progress:=jsonb_set(v_wizard_progress,'{nextSkillDamagePct}','15'::jsonb,true);
          v_wizard_progress:=jsonb_set(v_wizard_progress,'{nextSkillManaReductionPct}','20'::jsonb,true);
        elsif v_skill_id='court_of_nameless' then
          v_wizard_progress:=jsonb_set(v_wizard_progress,'{courtMode}',to_jsonb(v_choice),true);
          v_wizard_progress:=jsonb_set(v_wizard_progress,'{courtTurns}','2'::jsonb,true);
        end if;
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
            if v_skill_id='true_name_shatter' and v_choice='bond' then target_row.x:=jsonb_set(target_row.x,'{buffs}','{}'::jsonb,true); end if;
            v_status_data:=jsonb_build_object('turns',greatest(1,coalesce((v_skill->>'durationTurns')::integer,2)),'dotPct',greatest(0,coalesce((v_skill->>'dotPct')::numeric,case when v_skill_id in ('death_claw','ember_bolt','life_siphon') then 12 else 0 end)),'attackReductionPct',greatest(0,least(80,coalesce((v_skill->>'attackReductionPct')::numeric,case when v_skill_id in ('forbidden_signature','darkness_chains','chain_lightning','tempest','stolen_moment','death_memory','true_name_shatter') then 15 else 0 end))),'defenseReductionPct',greatest(0,least(80,coalesce((v_skill->>'defenseReductionPct')::numeric,case when v_skill_id in ('earth_rupture','death_memory') then 10 else 0 end))),'linkPct',coalesce((v_skill->>'linkPct')::numeric,case when v_skill_id='hostage_heart' then 22 else 0 end),'healPct',case when v_skill_id='hostage_heart' then 18 else 0 end,'choice',coalesce(v_choice,''),'sourceUserId',uid::text,'specialSkillLocked',v_skill_id='stolen_moment' or (v_skill_id='soul_domination' and v_choice='silence'),'controlled',v_skill_id='soul_domination' and v_choice='dominate','attackReductionPct',greatest(0,least(80,case when v_skill_id='true_name_shatter' and v_choice='will' then 20 when v_skill_id='death_memory' and v_choice='war' then 20 when v_skill_id='soul_domination' and v_choice='chain' then 20 when v_skill_id='forbidden_signature' then 8 else coalesce((v_skill->>'attackReductionPct')::numeric,0) end)),'defenseReductionPct',greatest(0,least(80,case when v_skill_id='true_name_shatter' and v_choice='body' then 22 when v_skill_id='death_memory' and v_choice='survival' then 20 else coalesce((v_skill->>'defenseReductionPct')::numeric,0) end)),'skillPowerReductionPct',case when v_skill_id='true_name_shatter' and v_choice='magic' then 25 when v_skill_id='death_memory' and v_choice='magic' then 25 when v_skill_id='soul_domination' and v_choice='chain' then 15 else 0 end);
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

    -- Active Necromancer legion members attack once per owner action in Party combat.
    if v_spec_key='wizard_necromancer' then
      v_debt_count:=0;
      for status_row in
        select member.value from jsonb_array_elements(coalesce(v_wizard_progress->'legion','[]'::jsonb)) member(value)
        where coalesce((member.value->>'hp')::integer,0)>0
          and coalesce(v_wizard_progress->'activeLegionIds','[]'::jsonb) @> jsonb_build_array(coalesce(member.value->>'id',member.value->>'instanceId'))
      loop
        select q.x,q.ord::integer into target_row from jsonb_array_elements(monsters) with ordinality q(x,ord)
          where coalesce((q.x->>'hp')::integer,0)>0 order by q.ord limit 1;
        if found then
          v_skill_damage:=greatest(1,coalesce((public.etranom_combat_resolve_damage(
            greatest(1,coalesce((status_row.value->>'attack')::numeric,1)*(1+coalesce((v_wizard_progress#>>'{legionBuffs,attackPct}')::numeric,0)/100)),
            greatest(0,coalesce((target_row.x->>'defense')::numeric,0)),1,0,0,0,1.25,1,1,100,0,0,random()*100,1.5)->>'damage')::integer,0));
          target_row.x:=jsonb_set(target_row.x,'{hp}',to_jsonb(greatest(0,coalesce((target_row.x->>'hp')::integer,0)-v_skill_damage)),true);
          monsters:=jsonb_set(monsters,array[(target_row.ord-1)::text],target_row.x,true);
          damage:=damage+v_skill_damage;
          if coalesce((target_row.x->>'hp')::integer,0)<=0 and v_debt_count<2 then
            v_wizard_progress:=jsonb_set(v_wizard_progress,'{souls}',to_jsonb(least(99,coalesce((v_wizard_progress->>'souls')::integer,0)+1)),true);
            v_debt_count:=v_debt_count+1;
          end if;
        end if;
      end loop;
    end if;

    -- Every newly defeated target (including AoE/DOT/legion kills) receives exactly one ledger entry.
    for kill_row in select q.x,q.ord::integer as ord from jsonb_array_elements(monsters) with ordinality q(x,ord)
      where coalesce((q.x->>'hp')::integer,0)<=0
        and not exists(select 1 from public.party_battle_kill_ledger kl where kl.session_id=p_session_id and kl.monster_index=q.ord::integer)
    loop
      idx:=kill_row.ord; monster:=kill_row.x;
 $v183_4$) on conflict(part) do update set fragment=excluded.fragment;
commit;
