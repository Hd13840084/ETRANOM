-- ETRANOM V1907 Party Warrior RPC integration patch. Run after all four catalog parts.
begin;
do $v1907$
declare
  v_def text;
  v_old text;
  v_new text;
  v_count integer;
begin
  select pg_get_functiondef('public.etranom_party_battle_act(uuid,text,integer)'::regprocedure) into v_def;
  if v_def is null then raise exception 'v1907_party_rpc_missing'; end if;

  v_old := 'v_is_status boolean:=false;';
  v_new := v_old||' v_is_warrior boolean:=false; v_stamina integer:=0; v_max_stamina integer:=100; v_stamina_cost integer:=0; v_ally_profile jsonb;';
  if position(v_old in v_def)=0 then raise exception 'v1907_decl_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  -- Load the authoritative specialization and stamina from the saved character.
  v_old := $v1907str$level_no:=greatest(1,coalesce((profile->>'level')::integer,1));$v1907str$;
  v_new := v_old||$v1907insert$
  select gs.save_data into v_save_data from public.game_saves gs where gs.user_id=uid;
  v_spec_name:=coalesce(v_save_data->'character'->>'specializationId',v_save_data->'character'->>'specialization_id',v_save_data->'character'->>'specialization');
  v_spec_key:=case v_spec_name
    when 'warrior_sword_ascetic' then 'warrior_sword_ascetic' when 'warrior_1' then 'warrior_sword_ascetic' when 'زاهد شمشیر' then 'warrior_sword_ascetic' when 'Sword Ascetic' then 'warrior_sword_ascetic'
    when 'warrior_iron_bastion' then 'warrior_iron_bastion' when 'warrior_2' then 'warrior_iron_bastion' when 'دژ پولادین' then 'warrior_iron_bastion' when 'Iron Bastion' then 'warrior_iron_bastion'
    when 'warrior_chaos_warrior' then 'warrior_chaos_warrior' when 'warrior_chaos' then 'warrior_chaos_warrior' when 'warrior_3' then 'warrior_chaos_warrior' when 'جنگجوی آشوب' then 'warrior_chaos_warrior' when 'Chaos Warrior' then 'warrior_chaos_warrior'
    when 'warrior_apocalypse_harbinger' then 'warrior_apocalypse_harbinger' when 'warrior_4' then 'warrior_apocalypse_harbinger' when 'آورنده آخرالزمان' then 'warrior_apocalypse_harbinger' when 'Apocalypse Harbinger' then 'warrior_apocalypse_harbinger'
    else null end;
  v_is_warrior:=v_spec_key like 'warrior_%';
  v_max_stamina:=greatest(1,coalesce(nullif(v_save_data#>>'{character,maxStamina}','')::integer,100));
  v_stamina:=greatest(0,least(v_max_stamina,coalesce(nullif(profile->>'stamina','')::integer,nullif(v_save_data#>>'{character,stamina}','')::integer,v_max_stamina)));
  profile:=jsonb_set(profile,'{stamina}',to_jsonb(v_stamina),true);
  profile:=jsonb_set(profile,'{max_stamina}',to_jsonb(v_max_stamina),true);
$v1907insert$;
  if position(v_old in v_def)=0 then raise exception 'v1907_character_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  -- Both specialization-routing CASE expressions used by the V183 RPC accept Warrior IDs.
  v_old := $v1907str$when 'Necromancer' then 'wizard_necromancer' else null end;$v1907str$;
  v_new := $v1907str$when 'Necromancer' then 'wizard_necromancer' when 'warrior_sword_ascetic' then 'warrior_sword_ascetic' when 'warrior_1' then 'warrior_sword_ascetic' when 'زاهد شمشیر' then 'warrior_sword_ascetic' when 'Sword Ascetic' then 'warrior_sword_ascetic' when 'warrior_iron_bastion' then 'warrior_iron_bastion' when 'warrior_2' then 'warrior_iron_bastion' when 'دژ پولادین' then 'warrior_iron_bastion' when 'Iron Bastion' then 'warrior_iron_bastion' when 'warrior_chaos_warrior' then 'warrior_chaos_warrior' when 'warrior_chaos' then 'warrior_chaos_warrior' when 'warrior_3' then 'warrior_chaos_warrior' when 'جنگجوی آشوب' then 'warrior_chaos_warrior' when 'Chaos Warrior' then 'warrior_chaos_warrior' when 'warrior_apocalypse_harbinger' then 'warrior_apocalypse_harbinger' when 'warrior_4' then 'warrior_apocalypse_harbinger' when 'آورنده آخرالزمان' then 'warrior_apocalypse_harbinger' when 'Apocalypse Harbinger' then 'warrior_apocalypse_harbinger' else null end;$v1907str$;
  v_count := (length(v_def)-length(replace(v_def,v_old,'')))/length(v_old);
  if v_count < 1 then raise exception 'v1907_specialization_route_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  -- Warrior basic attacks must not enter the Wizard-only Legion/Pact progress loader.
  v_old := $v1907str$if v_skill_id is null and action_name in ('attack','skill') then$v1907str$;
  v_new := $v1907str$if v_skill_id is null and action_name in ('attack','skill') and not v_is_warrior then$v1907str$;
  if position(v_old in v_def)=0 then raise exception 'v1907_basic_attack_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  -- Physical specializations scale from physical attack, not wizard_power.
  v_old := $v1907str$if v_spec_key is null then raise exception 'party_skill_specialization_unsupported'; end if;$v1907str$;
  v_new := v_old||E'
      v_is_warrior:=v_spec_key like ''warrior_%'';
      if v_is_warrior then v_skill_power:=greatest(1,attack_power); end if;';
  if position(v_old in v_def)=0 then raise exception 'v1907_power_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  -- Resource costs: Wizard keeps its exact Mana/Pact behavior; Warrior uses Stamina.
  v_old := $v1907str$v_mana_cost:=greatest(0,case when coalesce(v_skill->>'manaPct',v_skill->>'manaCostPercent',v_skill->>'manaCostPct') is not null then ceil(maxmp*coalesce((v_skill->>'manaPct')::numeric,(v_skill->>'manaCostPercent')::numeric,(v_skill->>'manaCostPct')::numeric,0)/100)::integer else ceil(coalesce((v_skill->>'manaCost')::numeric,0))::integer end);$v1907str$;
  v_new := v_old||E'
      v_stamina_cost:=greatest(0,ceil(coalesce((v_skill->>''staminaCost'')::numeric,0))::integer);';
  if position(v_old in v_def)=0 then raise exception 'v1907_resource_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);
  v_old := $v1907str$if v_spec_key='wizard_warlock' and coalesce((v_wizard_progress->>'nextSkillManaReductionPct')::numeric,0)>0 and v_skill_id<>'stolen_moment' then$v1907str$;
  v_new := $v1907str$if v_is_warrior then if v_stamina<v_stamina_cost then raise exception 'insufficient_stamina'; end if; v_stamina:=v_stamina-v_stamina_cost; profile:=jsonb_set(profile,'{stamina}',to_jsonb(v_stamina),true); else if v_spec_key='wizard_warlock' and coalesce((v_wizard_progress->>'nextSkillManaReductionPct')::numeric,0)>0 and v_skill_id<>'stolen_moment' then$v1907str$;
  if position(v_old in v_def)=0 then raise exception 'v1907_resource_branch_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);
  v_old := $v1907str$else if mp<v_mana_cost then raise exception 'insufficient_mana'; end if; mp:=mp-v_mana_cost; end if;$v1907str$;
  v_new := $v1907str$else if mp<v_mana_cost then raise exception 'insufficient_mana'; end if; mp:=mp-v_mana_cost; end if; end if;$v1907str$;
  if position(v_old in v_def)=0 then raise exception 'v1907_resource_close_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  -- Include the canonical physical powerPct field and common Warrior attack shapes.
  v_old := $v1907str$v_skill_pct:=coalesce((v_skill->>'damagePct')::numeric,(v_skill->>'damagePercent')::numeric,$v1907str$;
  v_new := $v1907str$v_skill_pct:=coalesce((v_skill->>'damagePct')::numeric,(v_skill->>'damagePercent')::numeric,(v_skill->>'powerPct')::numeric,$v1907str$;
  if position(v_old in v_def)=0 then raise exception 'v1907_powerpct_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);
  v_old := $v1907str$v_is_damage:=v_skill_type in ('single_damage','damage','all_damage','all_damage_control','all_damage_debuff','all_control_damage','all_dot_control','multi_target_damage','ultimate_all_damage','dual_element_combo','single_damage_cleanse','single_damage_drain','life_steal','damage_heal','repeat_last_spell');$v1907str$;
  v_new := $v1907str$v_is_damage:=v_skill_type in ('single_damage','damage','all_damage','all_damage_control','all_damage_debuff','all_control_damage','all_dot_control','multi_target_damage','ultimate_all_damage','dual_element_combo','single_damage_cleanse','single_damage_drain','life_steal','damage_heal','repeat_last_spell','multi_hit','all_damage_execute','line_damage','area_damage','ultimate_aoe','ultimate');$v1907str$;
  if position(v_old in v_def)=0 then raise exception 'v1907_damage_types_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);
  v_old := $v1907str$v_is_aoe:=v_skill_type in ('all_damage','all_damage_control','all_damage_debuff','all_control_damage','all_dot_control','ultimate_all_damage','multi_target_damage')$v1907str$;
  v_new := $v1907str$v_is_aoe:=v_skill_type in ('all_damage','all_damage_control','all_damage_debuff','all_control_damage','all_dot_control','ultimate_all_damage','multi_target_damage','all_damage_execute','area_damage','ultimate_aoe','ultimate')$v1907str$;
  if position(v_old in v_def)=0 then raise exception 'v1907_aoe_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  -- Warrior marks/debuffs must enter the authoritative status pipeline.
  v_old := $v1907str$v_is_status:=v_skill_type in ('control','debuff','debuff_choice','control_choice','choice_control','true_name_debuff','選択_debuff',' 선택_debuff','all_damage_control','all_damage_debuff','all_control_damage','all_dot_control','purge','link');$v1907str$;
  v_new := $v1907str$v_is_status:=v_skill_type in ('control','debuff','debuff_choice','control_choice','choice_control','true_name_debuff','mark','選択_debuff',' 선택_debuff','all_damage_control','all_damage_debuff','all_control_damage','all_dot_control','purge','link');$v1907str$;
  if position(v_old in v_def)=0 then raise exception 'v1907_status_types_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  -- Normalize Warrior guard skills into the existing server-side shield path.
  v_old := $v1907str$if v_skill_type='shield' then$v1907str$;
  v_new := $v1907str$if v_skill_type in ('shield','self_guard','team_guard') then$v1907str$;
  if position(v_old in v_def)=0 then raise exception 'v1907_guard_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);
  v_old := $v1907str$floor(v_skill_power*v_skill_value/100)::integer)),true);$v1907str$;
  v_new := $v1907str$floor(v_skill_power*greatest(1,coalesce((v_skill->>'shieldPct')::numeric,(v_skill->'effects'->>'shieldPct')::numeric,case when v_skill_type in ('self_guard','team_guard') then 22 else v_skill_value end))/100)::integer)),true);$v1907str$;
  if position(v_old in v_def)=0 then raise exception 'v1907_shield_value_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  -- Pull nested effects into shared buffs for Warrior stance/buff skills.
  -- team_guard applies a short defensive layer to every current party member.
  v_old := $v1907str$profile:=jsonb_set(profile,'{party_shield_reduction_pct}',to_jsonb(greatest(0,least(80,coalesce((v_skill->'effects'->>'allyDamageReductionPct')::integer,(v_skill->>'damageReductionPct')::integer,0)))),true);$v1907str$;
  v_new := v_old||$v1907team$
        if v_skill_type='team_guard' then
          for m in select pm.user_id from public.party_members pm where pm.party_id=v_party and pm.user_id<>uid loop
            v_ally_profile:=coalesce(profiles->(m.user_id::text),'{}'::jsonb);
            v_ally_profile:=jsonb_set(v_ally_profile,'{party_shield_hp}',to_jsonb(greatest(coalesce((v_ally_profile->>'party_shield_hp')::integer,0),floor(coalesce((v_ally_profile->>'max_hp')::numeric,100)*.10)::integer)),true);
            v_ally_profile:=jsonb_set(v_ally_profile,'{party_shield_turns}',to_jsonb(greatest(1,coalesce((v_skill->'effects'->>'durationTurns')::integer,2))),true);
            v_ally_profile:=jsonb_set(v_ally_profile,'{party_shield_reduction_pct}',to_jsonb(greatest(0,least(80,coalesce((v_skill->'effects'->>'allyDamageReductionPct')::integer,14)))),true);
            profiles:=profiles||jsonb_build_object(m.user_id::text,v_ally_profile);
          end loop;
        end if;
$v1907team$;
  if position(v_old in v_def)=0 then raise exception 'v1907_team_guard_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  v_old := $v1907str$elsif v_skill_type in ('self_buff','evasion_counter','stance','empower','legion_defense_buff','legion_offense_buff','soul_command','ultimate_choice','ultimate_form','self_revive') then$v1907str$;
  v_new := $v1907str$elsif v_skill_type in ('self_buff','evasion_counter','stance','empower','legion_defense_buff','legion_offense_buff','soul_command','ultimate_choice','ultimate_form','self_revive','counter','reflect_next') then$v1907str$;
  if position(v_old in v_def)=0 then raise exception 'v1907_buff_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);
  v_old := $v1907str$'attackPct',coalesce((v_skill->>'attackPct')::numeric,0),'defensePct',coalesce((v_skill->>'defensePct')::numeric,0)$v1907str$;
  v_new := $v1907str$'attackPct',coalesce((v_skill->>'attackPct')::numeric,(v_skill->'effects'->>'attackPct')::numeric,0),'defensePct',coalesce((v_skill->>'defensePct')::numeric,(v_skill->'effects'->>'defensePct')::numeric,0)$v1907str$;
  if position(v_old in v_def)=0 then raise exception 'v1907_buff_fields_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  -- Keep the original Wizard allowlist intact and add Warrior catalog keys.
  v_old := $v1907str$raise exception 'party_wizard_skill_type_not_supported';$v1907str$;
  v_new := $v1907str$raise exception 'party_specialization_skill_type_not_supported';$v1907str$;
  if position(v_old in v_def)=0 then raise exception 'v1907_error_anchor_missing'; end if;
  v_def := replace(v_def,v_old,v_new);

  execute v_def;
end
$v1907$;
commit;
