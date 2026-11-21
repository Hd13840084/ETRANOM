-- ETRANOM v183 Party RPC fragment; run in listed order.
begin;
create table if not exists public.etranom_v183_rpc_staging(part integer primary key,fragment text not null);
alter table public.etranom_v183_rpc_staging enable row level security;
revoke all on public.etranom_v183_rpc_staging from public,anon,authenticated;
insert into public.etranom_v183_rpc_staging(part,fragment) values (2,$v183_2$'false'::jsonb,true);
        v_wizard_progress:=jsonb_set(v_wizard_progress,'{reviveArmed}','false'::jsonb,true);
        v_wizard_progress:=jsonb_set(v_wizard_progress,'{sovereignTurns}','0'::jsonb,true);
      end if;
      if level_no < coalesce((v_skill->>'unlockLevel')::integer,1) then raise exception 'party_skill_locked'; end if;
      v_cooldowns:=coalesce(profile->'party_skill_cooldowns','{}'::jsonb);
      if coalesce((v_cooldowns->>v_skill_id)::integer,0)>0 and coalesce((v_cooldowns->>v_skill_id)::integer,0)>st.round_no then raise exception 'party_skill_cooldown'; end if;
      v_mana_cost:=greatest(0,case when coalesce(v_skill->>'manaPct',v_skill->>'manaCostPercent',v_skill->>'manaCostPct') is not null then ceil(maxmp*coalesce((v_skill->>'manaPct')::numeric,(v_skill->>'manaCostPercent')::numeric,(v_skill->>'manaCostPct')::numeric,0)/100)::integer else ceil(coalesce((v_skill->>'manaCost')::numeric,0))::integer end);
      if v_spec_key='wizard_warlock' and coalesce((v_wizard_progress->>'nextSkillManaReductionPct')::numeric,0)>0 and v_skill_id<>'stolen_moment' then
        v_mana_cost:=ceil(v_mana_cost*(1-least(80,(v_wizard_progress->>'nextSkillManaReductionPct')::numeric)/100))::integer;
      end if;
      if v_spec_key='wizard_warlock' and coalesce((v_wizard_progress->>'reversalArmed')::boolean,false) and v_skill_id<>'reversal_of_sacrifice' then
        v_reversal_cost:=greatest(1,ceil(maxhp*.07)::integer); if hp<=1 then raise exception 'warlock_sacrifice_hp_too_low'; end if;
        hp:=greatest(1,hp-v_reversal_cost); hpmap:=hpmap||jsonb_build_object(uid::text,hp);
      else if mp<v_mana_cost then raise exception 'insufficient_mana'; end if; mp:=mp-v_mana_cost; end if;
      v_skill_type:=coalesce(v_skill->>'type','');
      v_skill_pct:=coalesce((v_skill->>'damagePct')::numeric,(v_skill->>'damagePercent')::numeric,case when v_skill_id='death_claw' then 220 when v_skill_id='life_siphon' then 160 when v_skill_id='arcane_echo' then coalesce((profile->>'last_party_damage_pct')::numeric,100) else 0 end);
      v_skill_value:=greatest(0,coalesce((v_skill->>'shieldPct')::integer,case when v_skill_type='shield' then (v_skill->>'damagePct')::integer else 0 end));
      v_is_damage:=v_skill_type in ('single_damage','damage','all_damage','all_damage_control','all_damage_debuff','all_control_damage','all_dot_control','multi_target_damage','ultimate_all_damage','dual_element_combo','single_damage_cleanse','single_damage_drain','life_steal','damage_heal','repeat_last_spell');
      v_is_aoe:=v_skill_type in ('all_damage','all_damage_control','all_damage_debuff','all_control_damage','all_dot_control','ultimate_all_damage','multi_target_damage') or v_skill_id='court_of_nameless' or (v_skill_id='soul_domination' and p_target_index is null) or (v_skill_type='dual_element_combo' and p_target_index is null);
      v_is_status:=v_skill_type in ('control','debuff','debuff_choice','control_choice','choice_control','true_name_debuff','選択_debuff',' 선택_debuff','all_damage_control','all_damage_debuff','all_control_damage','all_dot_control','purge','link');
      -- Persistent Warlock pact state and Necromancer soul economy.
      if v_spec_key='wizard_warlock' then
        if v_skill_id='demons_testament' then
          if coalesce((v_wizard_progress->>'testamentActive')::boolean,false) then
            v_debt_count:=greatest(0,coalesce((v_wizard_progress->>'pactDebt')::integer,0));
            v_wizard_progress:=jsonb_set(v_wizard_progress,'{pactCredit}',to_jsonb(least(8,coalesce((v_wizard_progress->>'pactCredit')::integer,0)+floor(v_debt_count/2)::integer)),true);
            v_wizard_progress:=jsonb_set(v_wizard_progress,'{pactDebt}','0'::jsonb,true); v_wizard_progress:=jsonb_set(v_wizard_progress,'{testamentActive}','false'::jsonb,true);
          else v_wizard_progress:=jsonb_set(v_wizard_progress,'{testamentActive}','true'::jsonb,true); end if;
        elsif coalesce((v_wizard_progress->>'testamentActive')::boolean,false) and v_skill_id<>'final_covenant' then
          v_debt_count:=least(8,coalesce((v_wizard_progress->>'pactDebt')::integer,0)+1); v_wizard_progress:=jsonb_set(v_wizard_progress,'{pactDebt}',to_jsonb(v_debt_count),true);
          v_skill_pct:=v_skill_pct*(1+v_debt_count*.03);
          if v_debt_count=4 then hp:=greatest(1,hp-ceil(maxhp*.03)::integer); elsif v_debt_count=8 then hp:=greatest(1,hp-ceil(maxhp*.05)::integer); mp:=greatest(0,mp-ceil(maxmp*.05)::integer); end if;
          hpmap:=hpmap||jsonb_build_object(uid::text,hp);
        end if;
        if v_reversal_cost>0 then v_skill_pct:=v_skill_pct*1.55; v_wizard_progress:=jsonb_set(v_wizard_progress,'{reversalArmed}','false'::jsonb,true);
        elsif v_skill_id='reversal_of_sacrifice' then v_wizard_progress:=jsonb_set(v_wizard_progress,'{reversalArmed}','true'::jsonb,true); end if;
        if v_skill_id='stolen_moment' then v_wizard_progress:=jsonb_set(v_wizard_progress,'{nextSkillDamagePct}','15'::jsonb,true); v_wizard_progress:=jsonb_set(v_wizard_progress,'{nextSkillManaReductionPct}','20'::jsonb,true); end if;
        if coalesce((v_wizard_progress->>'nextSkillDamagePct')::numeric,0)>0 and v_skill_pct>0 and v_skill_id<>'stolen_moment' then v_skill_pct:=v_skill_pct*(1+least(50,(v_wizard_progress->>'nextSkillDamagePct')::numeric)/100); v_wizard_progress:=jsonb_set(v_wizard_progress,'{nextSkillDamagePct}','0'::jsonb,true); v_wizard_progress:=jsonb_set(v_wizard_progress,'{nextSkillManaReductionPct}','0'::jsonb,true); end if;
      end if;
      if v_skill_id='final_covenant' then
        v_debt_count:=greatest(0,coalesce((v_wizard_progress->>'pactDebt')::integer,0));
        if v_choice='annihilation' then v_is_damage:=true; v_is_aoe:=true; v_skill_pct:=360*(1+least(40,floor(v_debt_count/2)*8)/100);
        elsif v_choice='void' then v_is_damage:=true; v_is_aoe:=true; v_skill_pct:=160*(1+least(40,floor(v_debt_count/2)*8)/100); else v_is_status:=true; v_is_aoe:=true; end if;
        v_wizard_progress:=jsonb_set(v_wizard_progress,'{pactDebt}','0'::jsonb,true); v_wizard_progress:=jsonb_set(v_wizard_progress,'{pactCredit}','0'::jsonb,true);
      elsif v_skill_id='assembly_of_souls' and v_spec_key='wizard_necromancer' then
        v_debt_count:=greatest(0,coalesce((v_wizard_progress->>'souls')::integer,0)); if v_debt_count<1 then raise exception 'necromancer_no_souls'; end if;
        if v_choice='hunt' then v_is_damage:=true; v_is_aoe:=true; v_skill_pct:=greatest(12,v_debt_count*12); v_wizard_progress:=jsonb_set(v_wizard_progress,'{souls}','0'::jsonb,true);
        elsif v_choice='protect' then profile:=jsonb_set(profile,'{party_shield_hp}',to_jsonb(greatest(1,floor(v_skill_power*v_debt_count*.24)::integer)),true); profile:=jsonb_set(profile,'{party_shield_turns}','2'::jsonb,true); v_wizard_progress:=jsonb_set(v_wizard_progress,'{souls}','0'::jsonb,true);
        else hp:=least(maxhp,hp+floor(v_skill_power*v_debt_count*.12)::integer); mp:=least(maxmp,mp+floor(v_skill_power*v_debt_count*.12)::integer); hpmap:=hpmap||jsonb_build_object(uid::text,hp); v_wizard_progress:=jsonb_set(v_wizard_progress,'{souls}','0'::jsonb,true); end if;
      elsif v_skill_id='return_threshold' and v_spec_key='wizard_necromancer' then
        if coalesce((v_wizard_progress->>'souls')::integer,0)<3 then raise exception 'necromancer_not_enough_souls_for_revive'; end if;
        if coalesce((v_wizard_progress->>'reviveUsedThisBattle')::boolean,false) then raise exception 'necromancer_revive_already_used'; end if;
        v_wizard_progress:=jsonb_set(v_wizard_progress,'{souls}',to_jsonb((v_wizard_progress->>'souls')::integer-3),true); v_wizard_progress:=jsonb_set(v_wizard_progress,'{reviveArmed}','true'::jsonb,true); v_wizard_progress:=jsonb_set(v_wizard_progress,'{reviveUsedThisBattle}','true'::jsonb,true);
      elsif v_skill_id='eternal_sovereign' and v_spec_key='wizard_necromancer' then v_wizard_progress:=jsonb_set(v_wizard_progress,'{sovereignTurns}','3'::jsonb,true);
      end if;
      if v_skill_type='shield' then
        profile:=jsonb_set(profile,'{party_shield_hp}',to_jsonb(greatest(coalesce((profile->>'party_shield_hp')::integer,0),floor(v_skill_power*v_skill_value/100)::integer)),true);
        profile:=jsonb_set(profile,'{party_shield_turns}',to_jsonb(greatest(1,coalesce((v_skill->>'durationTurns')::integer,2))),true);
        profile:=jsonb_set(profile,'{party_shield_reduction_pct}',to_jsonb(greatest(0,least(80,coalesce((v_skill->>'damageReductionPct')::integer,0)))),true);
      elsif v_skill_type in ('self_heal','self_heal_cleanse') then
        v_heal_amount:=greatest(1,floor(v_skill_power*coalesce((v_skill->>'healPct')::numeric,v_skill_pct,100)/100)::integer);
        hp:=least(maxhp,hp+v_heal_amount); hpmap:=hpmap||jsonb_build_object(uid::text,hp);
        if v_skill_type='self_heal_cleanse' then profile:=jsonb_set(profile,'{party_statuses}','{}'::jsonb,true); end if;
      elsif v_skill_type in ('group_heal','heal_all') then
        v_heal_amount:=greatest(1,floor(v_skill_power*coalesce((v_skill->>'healPct')::numeric,100)/100)::integer);
        for m in select pm.user_id from public.party_members pm where pm.party_id=v_party loop
          target_hp:=coalesce((hpmap->>m.user_id::text)::integer,0);
          if target_hp>0 then
            target_hp:=least(greatest(1,coalesce(((profiles->(m.user_id::text))->>'max_hp')::integer,100)),target_hp+v_heal_amount);
            hpmap:=hpmap||jsonb_build_object(m.user_id::text,target_hp);
          end if;
        end loop;
      elsif v_skill_type in ('self_buff','evasion_counter','stance','empower','legion_defense_buff','legion_offense_buff','soul_command','ultimate_choice','ultimate_form','self_revive') then
        v_buff_data:=coalesce(profile->'party_skill_buffs','{}'::jsonb);
        v_buff_data:=jsonb_set(v_buff_data,array[v_skill_id],jsonb_build_object('turns',greatest(1,coalesce((v_skill->>'durationTurns')::integer,2)),'attackPct',coalesce((v_skill->>'attackPct')::numeric,0),'defensePct',coalesce((v_skill->>'defensePct')::numeric,0),'magicPowerPct',coalesce((v_skill->>'magicPowerPct')::numeric,0),'damageReductionPct',coalesce((v_skill->>'damageReductionPct')::numeric,0),'sourceType',v_skill_type),true);
        profile:=jsonb_set(profile,'{party_skill_buffs}',v_buff_data,true);
        if v_skill_type='evasion_counter' then profile:=jsonb_set(profile,'{party_evasion_turns}',to_jsonb(greatest(1,coalesce((v_skill->>'evadeTurns')::integer,1))),true); end if;
        if v_skill_type='self_revive' then profile:=jsonb_set(profile,'{party_revive_armed}','true'::jsonb,true); profile:=jsonb_set(profile,'{party_revive_hp_pct}',to_jsonb(greatest(1,coalesce((v_skill->>'reviveHealthPct')::integer,25))),true); end if;
        if v_skill_id='bone_blossom' then v_wizard_progress:=jsonb_set(v_wizard_progress,'{legionBuffs}',jsonb_build_object('defensePct',20,'attackPct',0,'turns',3),true); end if;
        if v_skill_id='kingdom_of_bones' then v_wizard_progress:=jsonb_set(v_wizard_progress,'{legio$v183_2$) on conflict(part) do update set fragment=excluded.fragment;
commit;
