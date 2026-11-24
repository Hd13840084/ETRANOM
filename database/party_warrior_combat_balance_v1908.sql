-- ETRANOM V1908 Warrior combat balance + battle-scoped cooldown/buff repair.
-- Run AFTER V1907 ALL-IN-ONE. This patches the already-installed authoritative RPC.
begin;
do $v1908$
declare
  v_def text;
  v_old text;
  v_new text;
  v_count integer;
begin
  select pg_get_functiondef('public.etranom_party_battle_act(uuid,text,integer)'::regprocedure) into v_def;
  if v_def is null then raise exception 'v1908_party_rpc_missing'; end if;

  -- Add local accumulators without changing existing wizard resource logic.
  v_old := 'v_is_status boolean:=false;';
  v_new := v_old||' v_physical_buff_pct numeric:=0; v_defense_buff_pct numeric:=0; v_incoming_reduction_pct numeric:=0; v_evasion_pct numeric:=0;';
  if position(v_old in v_def)=0 then raise exception 'v1908_declaration_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  -- Reset battle-scoped state once, on the first action of a fresh round-1 session.
  -- This prevents buffs/shields/cooldowns from leaking into a new battle while
  -- preserving all in-battle cooldowns and effects after the first player acts.
  v_old := $anchor$profile:=profiles -> (uid::text);
  if profile is null then profile:=public.etranom_party_character_combat_profile(uid); profiles:=profiles||jsonb_build_object(uid::text,profile); end if;$anchor$;
  v_new := $replacement$profile:=profiles -> (uid::text);
  if profile is null then profile:=public.etranom_party_character_combat_profile(uid); profiles:=profiles||jsonb_build_object(uid::text,profile); end if;
  if st.round_no=1 and not exists(select 1 from public.party_battle_actions a where a.session_id=p_session_id) then
    select coalesce(jsonb_object_agg(e.key,
      jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(e.value,
        '{party_skill_cooldowns}','{}'::jsonb,true),
        '{party_skill_buffs}','{}'::jsonb,true),
        '{party_shield_reduction_pct}','0'::jsonb,true),
        '{party_evasion_turns}','0'::jsonb,true),
        '{party_statuses}','{}'::jsonb,true),
        '{party_summons}','[]'::jsonb,true),
        '{party_shield_hp}','0'::jsonb,true),
        '{party_shield_turns}','0'::jsonb,true)), '{}'::jsonb)
      into profiles from jsonb_each(coalesce(profiles,'{}'::jsonb)) e;
    profile:=profiles->(uid::text);
  end if;$replacement$;
  if position(v_old in v_def)=0 then raise exception 'v1908_battle_reset_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  -- Read damage percentages nested under effects for Chaos-style skill records.
  v_old := $anchor$v_skill_pct:=coalesce((v_skill->>'damagePct')::numeric,(v_skill->>'damagePercent')::numeric,(v_skill->>'powerPct')::numeric,$anchor$;
  v_new := $replacement$v_skill_pct:=coalesce((v_skill->>'damagePct')::numeric,(v_skill->>'damagePercent')::numeric,(v_skill->>'powerPct')::numeric,(v_skill->'effects'->>'damagePct')::numeric,$replacement$;
  if position(v_old in v_def)=0 then raise exception 'v1908_nested_damage_pct_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  -- Recognize all active damage/status/defense types used by the four Warrior catalogs.
  v_old := $anchor$v_is_damage:=v_skill_type in ('single_damage','damage','all_damage','all_damage_control','all_damage_debuff','all_control_damage','all_dot_control','multi_target_damage','ultimate_all_damage','dual_element_combo','single_damage_cleanse','single_damage_drain','life_steal','damage_heal','repeat_last_spell','multi_hit','all_damage_execute','line_damage','area_damage','ultimate_aoe','ultimate');$anchor$;
  v_new := $replacement$v_is_damage:=v_skill_type in ('single_damage','single_damage_debuff','damage','damage_over_time','multi_damage','aoe_control','all_damage','all_damage_control','all_damage_debuff','all_control_damage','all_dot_control','multi_target_damage','ultimate_all_damage','dual_element_combo','single_damage_cleanse','single_damage_drain','life_steal','damage_heal','repeat_last_spell','multi_hit','all_damage_execute','line_damage','area_damage','ultimate_aoe','ultimate');$replacement$;
  if position(v_old in v_def)=0 then raise exception 'v1908_damage_type_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  v_old := $anchor$v_is_aoe:=v_skill_type in ('all_damage','all_damage_control','all_damage_debuff','all_control_damage','all_dot_control','ultimate_all_damage','multi_target_damage','all_damage_execute','area_damage','ultimate_aoe','ultimate')$anchor$;
  v_new := $replacement$v_is_aoe:=v_skill_type in ('all_damage','all_damage_control','all_damage_debuff','all_control_damage','all_dot_control','ultimate_all_damage','multi_target_damage','multi_damage','aoe_control','all_damage_execute','area_damage','ultimate_aoe','ultimate')$replacement$;
  if position(v_old in v_def)=0 then raise exception 'v1908_aoe_type_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  v_old := $anchor$v_is_status:=v_skill_type in ('control','debuff','debuff_choice','control_choice','choice_control','true_name_debuff','mark','選択_debuff',' 선택_debuff','all_damage_control','all_damage_debuff','all_control_damage','all_dot_control','purge','link');$anchor$;
  v_new := $replacement$v_is_status:=v_skill_type in ('control','debuff','debuff_choice','control_choice','choice_control','true_name_debuff','mark','single_damage_debuff','damage_over_time','aoe_control','all_control_damage','all_damage_control','all_damage_debuff','all_dot_control','選択_debuff',' 선택_debuff','purge','link');$replacement$;
  if position(v_old in v_def)=0 then raise exception 'v1908_status_type_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  -- Evasion-type Warrior skills use the same timed-buff storage path.
  v_old := $anchor$'self_revive','counter','reflect_next') then$anchor$;
  v_new := $replacement$'self_revive','counter','reflect_next','evasion') then$replacement$;
  if position(v_old in v_def)=0 then raise exception 'v1908_evasion_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  -- Keep nested defense/attack effects instead of silently dropping them.
  v_old := $anchor$'defensePct',coalesce((v_skill->>'defensePct')::numeric,(v_skill->'effects'->>'defensePct')::numeric,0)$anchor$;
  v_new := $replacement$'defensePct',coalesce((v_skill->>'defensePct')::numeric,(v_skill->'effects'->>'defensePct')::numeric,0),'damageReductionPct',coalesce((v_skill->>'damageReductionPct')::numeric,(v_skill->'effects'->>'damageReductionPct')::numeric,0),'evasionPct',coalesce((v_skill->>'evasionPct')::numeric,(v_skill->'effects'->>'evasionPct')::numeric,0),'reflectPct',coalesce((v_skill->>'reflectPct')::numeric,(v_skill->'effects'->>'reflectPct')::numeric,0)$replacement$;
  if position(v_old in v_def)=0 then raise exception 'v1908_nested_buff_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  -- Read self-guard reduction from nested effect payloads and scale its shield from HP.
  v_old := $anchor$coalesce((v_skill->'effects'->>'allyDamageReductionPct')::integer,(v_skill->>'damageReductionPct')::integer,0)$anchor$;
  v_new := $replacement$coalesce((v_skill->'effects'->>'allyDamageReductionPct')::integer,(v_skill->>'damageReductionPct')::integer,(v_skill->'effects'->>'damageReductionPct')::integer,0)$replacement$;
  if position(v_old in v_def)=0 then raise exception 'v1908_shield_reduction_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);
  v_old := $anchor$floor(v_skill_power*greatest(1,coalesce((v_skill->>'shieldPct')::numeric,(v_skill->'effects'->>'shieldPct')::numeric,case when v_skill_type in ('self_guard','team_guard') then 22 else v_skill_value end))/100)::integer)),true);$anchor$;
  v_new := $replacement$floor((case when v_is_warrior then maxhp else v_skill_power end)*greatest(1,coalesce((v_skill->>'shieldPct')::numeric,(v_skill->'effects'->>'shieldPct')::numeric,case when v_skill_type in ('self_guard','team_guard') then 22 else v_skill_value end))/100)::integer)),true);$replacement$;
  if position(v_old in v_def)=0 then raise exception 'v1908_shield_hp_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  -- Apply timed physical attack/defense buffs to real battle stats.
  v_old := $anchor$v_skill_power:=greatest(1,v_skill_power*(1+greatest(-80,least(200,v_attack_reduction))/100));$anchor$;
  v_new := $replacement$v_skill_power:=greatest(1,v_skill_power*(1+greatest(-80,least(200,v_attack_reduction))/100));
  select coalesce(sum(coalesce((e.value->>'attackPct')::numeric,0)),0) into v_physical_buff_pct
    from jsonb_each(coalesce(profile->'party_skill_buffs','{}'::jsonb)) e
    where coalesce((e.value->>'turns')::integer,0)>0;
  select coalesce(sum(coalesce((e.value->>'defensePct')::numeric,0)),0) into v_defense_buff_pct
    from jsonb_each(coalesce(profile->'party_skill_buffs','{}'::jsonb)) e
    where coalesce((e.value->>'turns')::integer,0)>0;
  if v_spec_key like 'warrior_%' then
    attack_power:=greatest(1,floor(attack_power*(1+greatest(-50,least(60,v_physical_buff_pct))/100))::integer);
    v_skill_power:=greatest(1,attack_power);
  end if;
  defense_power:=greatest(0,floor(defense_power*(1+greatest(-50,least(80,v_defense_buff_pct))/100))::integer);$replacement$;
  if position(v_old in v_def)=0 then raise exception 'v1908_buff_application_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  -- Cap each resolved Warrior skill hit by target maximum HP. This preserves
  -- skill percentages/ranks while preventing 280-650% coefficients and ultimates
  -- from deleting ordinary enemies or bosses in a single action.
  v_old := $anchor$v_skill_damage:=greatest(1,coalesce((public.etranom_combat_resolve_damage(v_raw_damage,greatest(0,coalesce((target_row.x->>'defense')::numeric,0))*(1-v_defense_reduction/100),1,0,0,0,1.25,1,1,100,0,v_crit_chance,random()*100,1.5)->>'damage')::integer,0));$anchor$;
  v_new := $replacement$v_skill_damage:=greatest(1,coalesce((public.etranom_combat_resolve_damage(v_raw_damage,greatest(0,coalesce((target_row.x->>'defense')::numeric,0))*(1-v_defense_reduction/100),1,0,0,0,1.25,1,1,100,0,v_crit_chance,random()*100,1.5)->>'damage')::integer,0));
            if v_is_warrior then
              v_skill_damage:=least(v_skill_damage,greatest(1,floor(coalesce(nullif(target_row.x->>'max_hp','')::numeric,nullif(target_row.x->>'maxHp','')::numeric,nullif(target_row.x->>'hp','')::numeric,100) * case
                when coalesce((target_row.x->>'boss')::boolean,false) or coalesce((target_row.x->>'isBoss')::boolean,false) or lower(coalesce(target_row.x->>'encounterKind','')) in ('boss','area_boss','miniboss') or lower(coalesce(target_row.x->>'rank','')) like '%boss%' then case when v_skill_type in ('ultimate','ultimate_aoe','area_damage','all_damage_execute') then 25 else 18 end
                when v_skill_type in ('ultimate','ultimate_aoe','area_damage','all_damage_execute') then 45 else 30 end / 100)::integer));
            end if;$replacement$;
  if position(v_old in v_def)=0 then raise exception 'v1908_skill_damage_cap_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  -- Cap basic Warrior attacks too; these are separate from skill damage.
  v_old := $anchor$if v_skill_id is null then
      newhp:=greatest(0,coalesce((monster->>'hp')::integer,0)-damage);$anchor$;
  v_new := $replacement$if v_skill_id is null then
      if v_spec_key like 'warrior_%' then
        damage:=least(damage,greatest(1,floor(coalesce(nullif(monster->>'max_hp','')::numeric,nullif(monster->>'maxHp','')::numeric,nullif(monster->>'hp','')::numeric,100) * case
          when coalesce((monster->>'boss')::boolean,false) or coalesce((monster->>'isBoss')::boolean,false) or lower(coalesce(monster->>'encounterKind','')) in ('boss','area_boss','miniboss') or lower(coalesce(monster->>'rank','')) like '%boss%' then 12 else 20 end /100)::integer));
      end if;
      newhp:=greatest(0,coalesce((monster->>'hp')::integer,0)-damage);$replacement$;
  if position(v_old in v_def)=0 then raise exception 'v1908_basic_damage_cap_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  -- Apply timed damage reduction before the enemy hits the party.
  v_old := $anchor$member_damage:=enemy_damage;$anchor$;
  v_new := $replacement$member_damage:=enemy_damage;
        select greatest(0,least(80,coalesce(sum(coalesce((e.value->>'damageReductionPct')::numeric,0)),0))) into v_incoming_reduction_pct
          from jsonb_each(coalesce(profile->'party_skill_buffs','{}'::jsonb)) e
          where coalesce((e.value->>'turns')::integer,0)>0;
        member_damage:=greatest(0,floor(member_damage*(1-v_incoming_reduction_pct/100))::integer);
        select greatest(0,least(85,coalesce(sum(coalesce((e.value->>'evasionPct')::numeric,0)),0))) into v_evasion_pct
          from jsonb_each(coalesce(profile->'party_skill_buffs','{}'::jsonb)) e
          where coalesce((e.value->>'turns')::integer,0)>0;
        if v_evasion_pct>0 and random()*100<v_evasion_pct then member_damage:=0; end if;$replacement$;
  if position(v_old in v_def)=0 then raise exception 'v1908_incoming_reduction_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  execute v_def;
end
$v1908$;
commit;
