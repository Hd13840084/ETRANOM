CREATE OR REPLACE FUNCTION public.etranom_party_battle_act(p_session_id uuid, p_action text, p_target_index integer DEFAULT NULL::integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  uid uuid:=auth.uid(); v_party uuid; st public.party_battle_state%rowtype;
  profiles jsonb; hpmap jsonb; guards jsonb; v_monsters jsonb; kills jsonb; profile jsonb;
  monster jsonb; item jsonb; drop_item jsonb; inventory jsonb; next_inventory jsonb; v_save_data jsonb;
  idx integer; ord integer; hp integer; maxhp integer; mp integer; maxmp integer; attack_power integer; defense_power integer;
  damage integer:=0; newhp integer; done_count integer; alive_count integer; level_no integer;
  action_name text:=p_action; potion_effect text; potion_power integer; found_potion boolean:=false;
  material_drops jsonb:='[]'::jsonb; coins integer:=0; min_coins integer; max_coins integer; monster_level integer;
  q numeric; xp_gain integer:=20; v_recipe text; v_class text; m record; enemy_damage integer; target_uid uuid; target_hp integer; member_damage integer; v_ledger_rows integer:=0; v_recipe_rarity text; v_recipe_chance numeric; v_skill_id text; v_skill jsonb; v_skill_type text; v_action_arg text; v_choice text; v_wizard_progress jsonb:='{}'::jsonb; v_reversal_cost integer:=0; v_debt_count integer:=0; v_missing_hp integer:=0; v_wizard_progress_loaded boolean:=false; v_spec_key text; v_spec_name text; v_mana_cost integer; v_cooldowns jsonb; v_action_label text:=p_action; v_skill_pct numeric; v_skill_value integer; v_perception numeric:=10; v_hit_chance numeric:=85; v_crit_chance numeric:=0; v_skill_power numeric:=0; v_raw_damage numeric:=0; v_heal_amount integer:=0; v_statuses jsonb; v_status_data jsonb; v_buff_data jsonb; v_summons jsonb; v_summon jsonb; v_attack_reduction numeric:=0; v_defense_reduction numeric:=0; v_dot_damage integer:=0; v_skill_damage integer:=0; v_absorb integer:=0; v_target_monster jsonb; v_recruit_progress jsonb; v_recruit_legion jsonb; v_recruit_member jsonb; v_recruit_chance numeric:=35; v_recruit_roll numeric:=0; v_member_id uuid; target_row record; kill_row record; status_row record; status_key text; v_is_aoe boolean:=false; v_is_damage boolean:=false; v_is_status boolean:=false; v_physical_buff_pct numeric:=0; v_defense_buff_pct numeric:=0; v_incoming_reduction_pct numeric:=0; v_evasion_pct numeric:=0; v_is_warrior boolean:=false; v_stamina integer:=0; v_max_stamina integer:=100; v_stamina_cost integer:=0; v_ally_profile jsonb;
begin
  if uid is null then raise exception 'auth_required'; end if;
  if left(action_name,6)='skill:' then v_action_arg:=substring(action_name from 7); v_skill_id:=split_part(v_action_arg,'|',1); v_choice:=nullif(split_part(v_action_arg,'|',2),''); if array_length(string_to_array(v_action_arg,'|'),1)>2 then raise exception 'party_skill_choice_invalid'; end if; action_name:='skill'; end if;
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
  profiles:=st.player_combat; hpmap:=st.player_hp; guards:=st.player_guard; v_monsters:=st.monsters; kills:=st.kills_by_user;
  profile:=profiles -> (uid::text);
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
  end if;
  hp:=coalesce((hpmap->>uid::text)::integer,0); maxhp:=greatest(1,coalesce((profile->>'max_hp')::integer,100));
  mp:=greatest(0,coalesce((profile->>'mp')::integer,0)); maxmp:=greatest(1,coalesce((profile->>'max_mp')::integer,60));
  attack_power:=greatest(1,coalesce((profile->>'attack')::integer,10)); defense_power:=greatest(0,coalesce((profile->>'defense')::integer,0));
  level_no:=greatest(1,coalesce((profile->>'level')::integer,1));
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

  v_perception:=greatest(0,coalesce((profile->>'perception')::numeric,10));
  v_crit_chance:=greatest(0,least(55,coalesce((profile->>'crit_chance')::numeric,0)));
  v_skill_power:=greatest(1,coalesce((profile->>'wizard_power')::numeric,attack_power*5+coalesce((profile->'gear'->>'magicPower')::numeric,0)));
  select coalesce(sum((value->>'magicPowerPct')::numeric),0) into v_attack_reduction from jsonb_each(coalesce(profile->'party_skill_buffs','{}'::jsonb));
  v_skill_power:=greatest(1,v_skill_power*(1+greatest(-80,least(200,v_attack_reduction))/100));
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
  defense_power:=greatest(0,floor(defense_power*(1+greatest(-50,least(80,v_defense_buff_pct))/100))::integer);
  if hp<=0 then raise exception 'player_defeated'; end if;
  -- Load Wizard specialization progress for basic attacks too, so Necromancer legion turns are not skill-button dependent.
  if v_skill_id is null and action_name in ('attack','skill') and not v_is_warrior then
    select coalesce(gs.save_data->'character'->>'specializationId',gs.save_data->'character'->>'specialization_id',gs.save_data->'character'->>'specialization') into v_spec_name from public.game_saves gs where gs.user_id=uid;
    v_spec_key:=case v_spec_name when 'wizard_arcane_mage' then 'wizard_arcane_mage' when 'wizard_elementalist' then 'wizard_elementalist' when 'wizard_warlock' then 'wizard_warlock' when 'wizard_necromancer' then 'wizard_necromancer' when 'آرکین‌میج' then 'wizard_arcane_mage' when 'آرکین میج' then 'wizard_arcane_mage' when 'Arcane Mage' then 'wizard_arcane_mage' when 'المنتالیست' then 'wizard_elementalist' when 'Elementalist' then 'wizard_elementalist' when 'وارلاک' then 'wizard_warlock' when 'Warlock' then 'wizard_warlock' when 'نکرومنسر' then 'wizard_necromancer' when 'Necromancer' then 'wizard_necromancer' when 'warrior_sword_ascetic' then 'warrior_sword_ascetic' when 'warrior_1' then 'warrior_sword_ascetic' when 'زاهد شمشیر' then 'warrior_sword_ascetic' when 'Sword Ascetic' then 'warrior_sword_ascetic' when 'warrior_iron_bastion' then 'warrior_iron_bastion' when 'warrior_2' then 'warrior_iron_bastion' when 'دژ پولادین' then 'warrior_iron_bastion' when 'Iron Bastion' then 'warrior_iron_bastion' when 'warrior_chaos_warrior' then 'warrior_chaos_warrior' when 'warrior_chaos' then 'warrior_chaos_warrior' when 'warrior_3' then 'warrior_chaos_warrior' when 'جنگجوی آشوب' then 'warrior_chaos_warrior' when 'Chaos Warrior' then 'warrior_chaos_warrior' when 'warrior_apocalypse_harbinger' then 'warrior_apocalypse_harbinger' when 'warrior_4' then 'warrior_apocalypse_harbinger' when 'آورنده آخرالزمان' then 'warrior_apocalypse_harbinger' when 'Apocalypse Harbinger' then 'warrior_apocalypse_harbinger' else null end;
    if v_spec_key is not null then
      select gs.save_data into v_save_data from public.game_saves gs where gs.user_id=uid for update;
      v_wizard_progress:=coalesce(v_save_data#>array['classProgress',v_spec_key],'{}'::jsonb);
      if coalesce(v_wizard_progress->>'partyBattleSessionId','')<>p_session_id::text then
        v_wizard_progress:=jsonb_set(v_wizard_progress,'{partyBattleSessionId}',to_jsonb(p_session_id::text),true);
        v_wizard_progress:=jsonb_set(v_wizard_progress,'{testamentActive}','false'::jsonb,true);
        v_wizard_progress:=jsonb_set(v_wizard_progress,'{pactDebt}','0'::jsonb,true);
        v_wizard_progress:=jsonb_set(v_wizard_progress,'{reversalArmed}','false'::jsonb,true);
        v_wizard_progress:=jsonb_set(v_wizard_progress,'{nextSkillDamagePct}','0'::jsonb,true);
        v_wizard_progress:=jsonb_set(v_wizard_progress,'{nextSkillManaReductionPct}','0'::jsonb,true);
        v_wizard_progress:=jsonb_set(v_wizard_progress,'{reviveUsedThisBattle}','false'::jsonb,true);
        v_wizard_progress:=jsonb_set(v_wizard_progress,'{reviveArmed}','false'::jsonb,true);
        v_wizard_progress:=jsonb_set(v_wizard_progress,'{sovereignTurns}','0'::jsonb,true);
      end if;
      v_wizard_progress_loaded:=true;
    end if;
  end if;

  if action_name in ('attack','skill') then
    if v_skill_id is not null then
      select coalesce(gs.save_data->'character'->>'specializationId',gs.save_data->'character'->>'specialization_id',gs.save_data->'character'->>'specialization') into v_spec_name
        from public.game_saves gs where gs.user_id=uid;
      v_spec_key:=case v_spec_name
        when 'wizard_arcane_mage' then 'wizard_arcane_mage'
        when 'wizard_elementalist' then 'wizard_elementalist'
        when 'wizard_warlock' then 'wizard_warlock'
        when 'wizard_necromancer' then 'wizard_necromancer'
        when 'آرکین‌میج' then 'wizard_arcane_mage'
        when 'آرکین میج' then 'wizard_arcane_mage'
        when 'Arcane Mage' then 'wizard_arcane_mage'
        when 'المنتالیست' then 'wizard_elementalist'
        when 'Elementalist' then 'wizard_elementalist'
        when 'وارلاک' then 'wizard_warlock'
        when 'Warlock' then 'wizard_warlock'
        when 'نکرومنسر' then 'wizard_necromancer'
        when 'Necromancer' then 'wizard_necromancer' when 'warrior_sword_ascetic' then 'warrior_sword_ascetic' when 'warrior_1' then 'warrior_sword_ascetic' when 'زاهد شمشیر' then 'warrior_sword_ascetic' when 'Sword Ascetic' then 'warrior_sword_ascetic' when 'warrior_iron_bastion' then 'warrior_iron_bastion' when 'warrior_2' then 'warrior_iron_bastion' when 'دژ پولادین' then 'warrior_iron_bastion' when 'Iron Bastion' then 'warrior_iron_bastion' when 'warrior_chaos_warrior' then 'warrior_chaos_warrior' when 'warrior_chaos' then 'warrior_chaos_warrior' when 'warrior_3' then 'warrior_chaos_warrior' when 'جنگجوی آشوب' then 'warrior_chaos_warrior' when 'Chaos Warrior' then 'warrior_chaos_warrior' when 'warrior_apocalypse_harbinger' then 'warrior_apocalypse_harbinger' when 'warrior_4' then 'warrior_apocalypse_harbinger' when 'آورنده آخرالزمان' then 'warrior_apocalypse_harbinger' when 'Apocalypse Harbinger' then 'warrior_apocalypse_harbinger' else null end;
      if v_spec_key is null then raise exception 'party_skill_specialization_unsupported'; end if;
      v_is_warrior:=v_spec_key like 'warrior_%';
      if v_is_warrior then v_skill_power:=greatest(1,attack_power); end if;
      select skill_data into v_skill from public.party_battle_skill_catalog
        where specialization_key=v_spec_key and skill_id=v_skill_id and enabled;
      if v_skill is null then raise exception 'party_skill_not_available'; end if;
      if v_choice is null then v_choice:=case v_skill_id when 'court_of_nameless' then 'silence' when 'true_name_shatter' then 'will' when 'final_covenant' then 'annihilation' when 'assembly_of_souls' then 'hunt' when 'death_memory' then 'war' when 'soul_domination' then 'chain' else null end; end if;
      if (v_skill_id='court_of_nameless' and v_choice not in ('silence','refund','confiscation')) or (v_skill_id='true_name_shatter' and v_choice not in ('body','will','magic','bond')) or (v_skill_id='final_covenant' and v_choice not in ('annihilation','dominion','void')) or (v_skill_id='assembly_of_souls' and v_choice not in ('hunt','protect','feed')) or (v_skill_id='death_memory' and v_choice not in ('war','survival','magic')) or (v_skill_id='soul_domination' and v_choice not in ('dominate','chain','silence')) then raise exception 'party_skill_choice_invalid'; end if;
      select gs.save_data into v_save_data from public.game_saves gs where gs.user_id=uid for update;
      if v_save_data is null then raise exception 'player_save_missing'; end if;
      v_wizard_progress:=coalesce(v_save_data#>array['classProgress',v_spec_key],'{}'::jsonb);
      if jsonb_typeof(v_wizard_progress)<>'object' then v_wizard_progress:='{}'::jsonb; end if;
      -- Battle-limited resources reset once for a new session, not on reconnect.
      if coalesce(v_wizard_progress->>'partyBattleSessionId','')<>p_session_id::text then
        v_wizard_progress:=jsonb_set(v_wizard_progress,'{partyBattleSessionId}',to_jsonb(p_session_id::text),true);
        v_wizard_progress:=jsonb_set(v_wizard_progress,'{testamentActive}','false'::jsonb,true);
        v_wizard_progress:=jsonb_set(v_wizard_progress,'{pactDebt}','0'::jsonb,true);
        v_wizard_progress:=jsonb_set(v_wizard_progress,'{reversalArmed}','false'::jsonb,true);
        v_wizard_progress:=jsonb_set(v_wizard_progress,'{nextSkillDamagePct}','0'::jsonb,true);
        v_wizard_progress:=jsonb_set(v_wizard_progress,'{nextSkillManaReductionPct}','0'::jsonb,true);
        v_wizard_progress:=jsonb_set(v_wizard_progress,'{reviveUsedThisBattle}','false'::jsonb,true);
        v_wizard_progress:=jsonb_set(v_wizard_progress,'{reviveArmed}','false'::jsonb,true);
        v_wizard_progress:=jsonb_set(v_wizard_progress,'{sovereignTurns}','0'::jsonb,true);
      end if;
      if level_no < coalesce((v_skill->>'unlockLevel')::integer,1) then raise exception 'party_skill_locked'; end if;
      v_cooldowns:=coalesce(profile->'party_skill_cooldowns','{}'::jsonb);
      if coalesce((v_cooldowns->>v_skill_id)::integer,0)>0 and coalesce((v_cooldowns->>v_skill_id)::integer,0)>st.round_no then raise exception 'party_skill_cooldown'; end if;
      v_mana_cost:=greatest(0,case when coalesce(v_skill->>'manaPct',v_skill->>'manaCostPercent',v_skill->>'manaCostPct') is not null then ceil(maxmp*coalesce((v_skill->>'manaPct')::numeric,(v_skill->>'manaCostPercent')::numeric,(v_skill->>'manaCostPct')::numeric,0)/100)::integer else ceil(coalesce((v_skill->>'manaCost')::numeric,0))::integer end);
      v_stamina_cost:=greatest(0,ceil(coalesce((v_skill->>'staminaCost')::numeric,0))::integer);
      if v_is_warrior then if v_stamina<v_stamina_cost then raise exception 'insufficient_stamina'; end if; v_stamina:=v_stamina-v_stamina_cost; profile:=jsonb_set(profile,'{stamina}',to_jsonb(v_stamina),true); else if v_spec_key='wizard_warlock' and coalesce((v_wizard_progress->>'nextSkillManaReductionPct')::numeric,0)>0 and v_skill_id<>'stolen_moment' then
        v_mana_cost:=ceil(v_mana_cost*(1-least(80,(v_wizard_progress->>'nextSkillManaReductionPct')::numeric)/100))::integer;
      end if;
      if v_spec_key='wizard_warlock' and coalesce((v_wizard_progress->>'reversalArmed')::boolean,false) and v_skill_id<>'reversal_of_sacrifice' then
        v_reversal_cost:=greatest(1,ceil(maxhp*.07)::integer); if hp<=1 then raise exception 'warlock_sacrifice_hp_too_low'; end if;
        hp:=greatest(1,hp-v_reversal_cost); hpmap:=hpmap||jsonb_build_object(uid::text,hp);
      else if mp<v_mana_cost then raise exception 'insufficient_mana'; end if; mp:=mp-v_mana_cost; end if; end if;
      v_skill_type:=coalesce(v_skill->>'type','');
      v_skill_pct:=coalesce((v_skill->>'damagePct')::numeric,(v_skill->>'damagePercent')::numeric,(v_skill->>'powerPct')::numeric,(v_skill->'effects'->>'damagePct')::numeric,case when v_skill_id='death_claw' then 220 when v_skill_id='life_siphon' then 160 when v_skill_id='arcane_echo' then coalesce((profile->>'last_party_damage_pct')::numeric,100) else 0 end);
      v_skill_value:=greatest(0,coalesce((v_skill->>'shieldPct')::integer,case when v_skill_type='shield' then (v_skill->>'damagePct')::integer else 0 end));
      v_is_damage:=v_skill_type in ('single_damage','single_damage_debuff','damage','damage_over_time','multi_damage','aoe_control','all_damage','all_damage_control','all_damage_debuff','all_control_damage','all_dot_control','multi_target_damage','ultimate_all_damage','dual_element_combo','single_damage_cleanse','single_damage_drain','life_steal','damage_heal','repeat_last_spell','multi_hit','all_damage_execute','line_damage','area_damage','ultimate_aoe','ultimate');
      v_is_aoe:=v_skill_type in ('all_damage','all_damage_control','all_damage_debuff','all_control_damage','all_dot_control','ultimate_all_damage','multi_target_damage','multi_damage','aoe_control','all_damage_execute','area_damage','ultimate_aoe','ultimate') or v_skill_id='court_of_nameless' or (v_skill_id='soul_domination' and p_target_index is null) or (v_skill_type='dual_element_combo' and p_target_index is null);
      v_is_status:=v_skill_type in ('control','debuff','debuff_choice','control_choice','choice_control','true_name_debuff','mark','single_damage_debuff','damage_over_time','aoe_control','all_control_damage','all_damage_control','all_damage_debuff','all_dot_control','選択_debuff',' 선택_debuff','purge','link');
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
      if v_skill_type in ('shield','self_guard','team_guard') then
        profile:=jsonb_set(profile,'{party_shield_hp}',to_jsonb(greatest(coalesce((profile->>'party_shield_hp')::integer,0),floor((case when v_is_warrior then maxhp else v_skill_power end)*greatest(1,coalesce((v_skill->>'shieldPct')::numeric,(v_skill->'effects'->>'shieldPct')::numeric,case when v_skill_type in ('self_guard','team_guard') then 22 else v_skill_value end))/100)::integer)),true);
        profile:=jsonb_set(profile,'{party_shield_turns}',to_jsonb(greatest(1,coalesce((v_skill->>'durationTurns')::integer,2))),true);
        profile:=jsonb_set(profile,'{party_shield_reduction_pct}',to_jsonb(greatest(0,least(80,coalesce((v_skill->'effects'->>'allyDamageReductionPct')::integer,(v_skill->>'damageReductionPct')::integer,(v_skill->'effects'->>'damageReductionPct')::integer,0)))),true);
        if v_skill_type='team_guard' then
          for m in select pm.user_id from public.party_members pm where pm.party_id=v_party and pm.user_id<>uid loop
            v_ally_profile:=coalesce(profiles->(m.user_id::text),'{}'::jsonb);
            v_ally_profile:=jsonb_set(v_ally_profile,'{party_shield_hp}',to_jsonb(greatest(coalesce((v_ally_profile->>'party_shield_hp')::integer,0),floor(coalesce((v_ally_profile->>'max_hp')::numeric,100)*.10)::integer)),true);
            v_ally_profile:=jsonb_set(v_ally_profile,'{party_shield_turns}',to_jsonb(greatest(1,coalesce((v_skill->'effects'->>'durationTurns')::integer,2))),true);
            v_ally_profile:=jsonb_set(v_ally_profile,'{party_shield_reduction_pct}',to_jsonb(greatest(0,least(80,coalesce((v_skill->'effects'->>'allyDamageReductionPct')::integer,14)))),true);
            profiles:=profiles||jsonb_build_object(m.user_id::text,v_ally_profile);
          end loop;
        end if;

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
      elsif v_skill_type in ('self_buff','evasion_counter','stance','empower','legion_defense_buff','legion_offense_buff','soul_command','ultimate_choice','ultimate_form','self_revive','counter','reflect_next','evasion') then
        v_buff_data:=coalesce(profile->'party_skill_buffs','{}'::jsonb);
        v_buff_data:=jsonb_set(v_buff_data,array[v_skill_id],jsonb_build_object('turns',greatest(1,coalesce((v_skill->>'durationTurns')::integer,2)),'attackPct',coalesce((v_skill->>'attackPct')::numeric,(v_skill->'effects'->>'attackPct')::numeric,0),'defensePct',coalesce((v_skill->>'defensePct')::numeric,(v_skill->'effects'->>'defensePct')::numeric,0),'damageReductionPct',coalesce((v_skill->>'damageReductionPct')::numeric,(v_skill->'effects'->>'damageReductionPct')::numeric,0),'evasionPct',coalesce((v_skill->>'evasionPct')::numeric,(v_skill->'effects'->>'evasionPct')::numeric,0),'reflectPct',coalesce((v_skill->>'reflectPct')::numeric,(v_skill->'effects'->>'reflectPct')::numeric,0),'magicPowerPct',coalesce((v_skill->>'magicPowerPct')::numeric,0),'damageReductionPct',coalesce((v_skill->>'damageReductionPct')::numeric,0),'sourceType',v_skill_type),true);
        profile:=jsonb_set(profile,'{party_skill_buffs}',v_buff_data,true);
        if v_skill_type='evasion_counter' then profile:=jsonb_set(profile,'{party_evasion_turns}',to_jsonb(greatest(1,coalesce((v_skill->>'evadeTurns')::integer,1))),true); end if;
        if v_skill_type='self_revive' then profile:=jsonb_set(profile,'{party_revive_armed}','true'::jsonb,true); profile:=jsonb_set(profile,'{party_revive_hp_pct}',to_jsonb(greatest(1,coalesce((v_skill->>'reviveHealthPct')::integer,25))),true); end if;
        if v_skill_id='bone_blossom' then v_wizard_progress:=jsonb_set(v_wizard_progress,'{legionBuffs}',jsonb_build_object('defensePct',20,'attackPct',0,'turns',3),true); end if;
        if v_skill_id='kingdom_of_bones' then v_wizard_progress:=jsonb_set(v_wizard_progress,'{legionBuffs}',jsonb_build_object('defensePct',0,'attackPct',20,'turns',3),true); end if;
        if v_skill_id='heir_of_hunger' then v_wizard_progress:=jsonb_set(v_wizard_progress,'{hungerTurns}','3'::jsonb,true); v_wizard_progress:=jsonb_set(v_wizard_progress,'{hungerReservoir}',to_jsonb(least(12,coalesce((v_wizard_progress->>'hungerReservoir')::integer,0))),true); end if;
        if v_skill_id='court_of_nameless' then v_wizard_progress:=jsonb_set(v_wizard_progress,'{courtMode}',to_jsonb(v_choice),true); v_wizard_progress:=jsonb_set(v_wizard_progress,'{courtTurns}','2'::jsonb,true); end if;
        if v_skill_id='final_covenant' and v_choice='dominion' then
          v_missing_hp:=0;
          for target_row in select q.x,q.ord::integer as ord from jsonb_array_elements(v_monsters) with ordinality q(x,ord) where coalesce((q.x->>'hp')::integer,0)>0 loop
            v_missing_hp:=v_missing_hp+greatest(0,coalesce((target_row.x->>'max_hp')::integer,coalesce((target_row.x->>'hp')::integer,0))-coalesce((target_row.x->>'hp')::integer,0));
            v_statuses:=coalesce(target_row.x->'statuses','{}'::jsonb);
            v_statuses:=jsonb_set(v_statuses,'{final_covenant}',jsonb_build_object('turns',2,'attackReductionPct',18,'sourceUserId',uid::text),true);
            v_target_monster:=jsonb_set(target_row.x,'{statuses}',v_statuses,true); v_monsters:=jsonb_set(v_monsters,array[(target_row.ord-1)::text],v_target_monster,true);
          end loop;
          hp:=least(maxhp,hp+floor(v_missing_hp*.18)::integer); hpmap:=hpmap||jsonb_build_object(uid::text,hp);
        elsif v_skill_id='final_covenant' and v_choice='void' then
          for target_row in select q.x,q.ord::integer as ord from jsonb_array_elements(v_monsters) with ordinality q(x,ord) where coalesce((q.x->>'hp')::integer,0)>0 loop
            v_target_monster:=jsonb_set(target_row.x,'{buffs}','{}'::jsonb,true); v_monsters:=jsonb_set(v_monsters,array[(target_row.ord-1)::text],v_target_monster,true);
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
        raise exception 'party_specialization_skill_type_not_supported';
      end if;
      v_cooldowns:=jsonb_set(v_cooldowns,array[v_skill_id],to_jsonb(st.round_no+greatest(0,coalesce((v_skill->>'cooldownTurns')::integer,0))),true);
      profile:=jsonb_set(profile,'{party_skill_cooldowns}',v_cooldowns,true);
    end if;
    idx:=null; monster:=null;
    if p_target_index is not null then
      select q.x,q.ord::integer into monster,idx from jsonb_array_elements(v_monsters) with ordinality q(x,ord)
       where q.ord=p_target_index and (coalesce((q.x->>'hp')::integer,0)>0 or (v_skill_type='permanent_recruit' and coalesce((q.x->>'hp')::integer,0)<=0));
    else
      if v_skill_type='permanent_recruit' then raise exception 'necromancer_recruit_requires_selected_corpse'; end if;
      for item,ord in select x,ord::integer from jsonb_array_elements(v_monsters) with ordinality q(x,ord) loop
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
      monster:=jsonb_set(monster,'{recruitAttempted}','true'::jsonb,true); v_monsters:=jsonb_set(v_monsters,array[(idx-1)::text],monster,true);
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
        for target_row in select q.x,q.ord::integer as ord from jsonb_array_elements(v_monsters) with ordinality q(x,ord)
          where coalesce((q.x->>'hp')::integer,0)>0 and (v_is_aoe or q.ord=idx)
          order by q.ord
          limit case when v_skill_type='multi_target_damage' then greatest(1,coalesce((v_skill->>'maxTargets')::integer,3)) else 999 end loop
          if random()*100<v_hit_chance then
            v_raw_damage:=v_skill_power*v_skill_pct/100;
            v_skill_value:=greatest(0,coalesce((v_skill->>'defensePenetrationPct')::integer,0));
            v_attack_reduction:=greatest(0,least(80,coalesce((target_row.x->'statuses'->v_skill_id->>'defenseReductionPct')::numeric,0)));
            v_defense_reduction:=greatest(0,least(80,v_skill_value));
            v_skill_damage:=greatest(1,coalesce((public.etranom_combat_resolve_damage(v_raw_damage,greatest(0,coalesce((target_row.x->>'defense')::numeric,0))*(1-v_defense_reduction/100),1,0,0,0,1.25,1,1,100,0,v_crit_chance,random()*100,1.5)->>'damage')::integer,0));
            if v_is_warrior then
              v_skill_damage:=least(v_skill_damage,greatest(1,floor(coalesce(nullif(target_row.x->>'max_hp','')::numeric,nullif(target_row.x->>'maxHp','')::numeric,nullif(target_row.x->>'hp','')::numeric,100) * case
                when coalesce((target_row.x->>'boss')::boolean,false) or coalesce((target_row.x->>'isBoss')::boolean,false) or lower(coalesce(target_row.x->>'encounterKind','')) in ('boss','area_boss','miniboss') or lower(coalesce(target_row.x->>'rank','')) like '%boss%' then case when v_skill_type in ('ultimate','ultimate_aoe','area_damage','all_damage_execute') then 25 else 18 end
                when v_skill_type in ('ultimate','ultimate_aoe','area_damage','all_damage_execute') then 45 else 30 end / 100)::integer));
            end if;
          else v_skill_damage:=0; end if;
          v_target_monster:=jsonb_set(target_row.x,'{hp}',to_jsonb(greatest(0,coalesce((target_row.x->>'hp')::integer,0)-v_skill_damage)),true);
          if (v_is_status or v_skill_id in ('death_claw','ember_bolt','life_siphon','forbidden_signature','darkness_chains','chain_lightning','tempest','earth_rupture')) and (coalesce((v_skill->>'dotPct')::numeric,case when v_skill_id in ('death_claw','ember_bolt','life_siphon') then 12 else 0 end)>0 or coalesce((v_skill->>'attackReductionPct')::numeric,case when v_skill_id in ('forbidden_signature','darkness_chains','chain_lightning','tempest','stolen_moment','death_memory','true_name_shatter') then 15 else 0 end)>0 or coalesce((v_skill->>'defenseReductionPct')::numeric,case when v_skill_id in ('earth_rupture','death_memory') then 10 else 0 end)>0) then
            v_statuses:=coalesce(v_target_monster->'statuses','{}'::jsonb);
            v_status_data:=jsonb_build_object('turns',greatest(1,coalesce((v_skill->>'durationTurns')::integer,2)),'dotPct',greatest(0,coalesce((v_skill->>'dotPct')::numeric,case when v_skill_id in ('death_claw','ember_bolt','life_siphon') then 12 else 0 end)),'attackReductionPct',greatest(0,least(80,coalesce((v_skill->>'attackReductionPct')::numeric,case when v_skill_id in ('forbidden_signature','darkness_chains','chain_lightning','tempest','stolen_moment','death_memory','true_name_shatter') then 15 else 0 end))),'defenseReductionPct',greatest(0,least(80,coalesce((v_skill->>'defenseReductionPct')::numeric,case when v_skill_id in ('earth_rupture','death_memory') then 10 else 0 end))),'linkPct',coalesce((v_skill->>'linkPct')::numeric,case when v_skill_id='hostage_heart' then 22 else 0 end),'healPct',case when v_skill_id='hostage_heart' then 18 else 0 end,'choice',coalesce(v_choice,''),'sourceUserId',uid::text,'specialSkillLocked',v_skill_id='stolen_moment' or (v_skill_id='soul_domination' and v_choice='silence'),'controlled',v_skill_id='soul_domination' and v_choice='dominate','attackReductionPct',greatest(0,least(80,case when v_skill_id='true_name_shatter' and v_choice='will' then 20 when v_skill_id='death_memory' and v_choice='war' then 20 when v_skill_id='soul_domination' and v_choice='chain' then 20 when v_skill_id='forbidden_signature' then 8 else coalesce((v_skill->>'attackReductionPct')::numeric,0) end)),'defenseReductionPct',greatest(0,least(80,case when v_skill_id='true_name_shatter' and v_choice='body' then 22 when v_skill_id='death_memory' and v_choice='survival' then 20 else coalesce((v_skill->>'defenseReductionPct')::numeric,0) end)),'skillPowerReductionPct',case when v_skill_id='true_name_shatter' and v_choice='magic' then 25 when v_skill_id='death_memory' and v_choice='magic' then 25 when v_skill_id='soul_domination' and v_choice='chain' then 15 else 0 end);
            v_statuses:=jsonb_set(v_statuses,array[v_skill_id],v_status_data,true); v_target_monster:=jsonb_set(v_target_monster,'{statuses}',v_statuses,true);
          end if;
          v_monsters:=jsonb_set(v_monsters,array[(target_row.ord-1)::text],v_target_monster,true);
          damage:=damage+v_skill_damage;
          if v_skill_damage>0 then profile:=jsonb_set(profile,'{last_party_damage_pct}',to_jsonb(v_skill_pct),true); end if;
        end loop;
        select q.x into monster from jsonb_array_elements(v_monsters) with ordinality q(x,ord) where q.ord=idx;
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
          for target_row in select q.x,q.ord::integer as ord from jsonb_array_elements(v_monsters) with ordinality q(x,ord)
            where coalesce((q.x->>'hp')::integer,0)>0 and (v_is_aoe or q.ord=idx) order by q.ord loop
            v_target_monster:=jsonb_set(target_row.x,'{buffs}','{}'::jsonb,true);
            v_monsters:=jsonb_set(v_monsters,array[(target_row.ord-1)::text],v_target_monster,true);
          end loop;
        else
          for target_row in select q.x,q.ord::integer as ord from jsonb_array_elements(v_monsters) with ordinality q(x,ord)
            where coalesce((q.x->>'hp')::integer,0)>0 and (v_is_aoe or q.ord=idx) order by q.ord loop
            v_statuses:=coalesce(target_row.x->'statuses','{}'::jsonb);
            if v_skill_id='true_name_shatter' and v_choice='bond' then target_row.x:=jsonb_set(target_row.x,'{buffs}','{}'::jsonb,true); end if;
            v_status_data:=jsonb_build_object('turns',greatest(1,coalesce((v_skill->>'durationTurns')::integer,2)),'dotPct',greatest(0,coalesce((v_skill->>'dotPct')::numeric,case when v_skill_id in ('death_claw','ember_bolt','life_siphon') then 12 else 0 end)),'attackReductionPct',greatest(0,least(80,coalesce((v_skill->>'attackReductionPct')::numeric,case when v_skill_id in ('forbidden_signature','darkness_chains','chain_lightning','tempest','stolen_moment','death_memory','true_name_shatter') then 15 else 0 end))),'defenseReductionPct',greatest(0,least(80,coalesce((v_skill->>'defenseReductionPct')::numeric,case when v_skill_id in ('earth_rupture','death_memory') then 10 else 0 end))),'linkPct',coalesce((v_skill->>'linkPct')::numeric,case when v_skill_id='hostage_heart' then 22 else 0 end),'healPct',case when v_skill_id='hostage_heart' then 18 else 0 end,'choice',coalesce(v_choice,''),'sourceUserId',uid::text,'specialSkillLocked',v_skill_id='stolen_moment' or (v_skill_id='soul_domination' and v_choice='silence'),'controlled',v_skill_id='soul_domination' and v_choice='dominate','attackReductionPct',greatest(0,least(80,case when v_skill_id='true_name_shatter' and v_choice='will' then 20 when v_skill_id='death_memory' and v_choice='war' then 20 when v_skill_id='soul_domination' and v_choice='chain' then 20 when v_skill_id='forbidden_signature' then 8 else coalesce((v_skill->>'attackReductionPct')::numeric,0) end)),'defenseReductionPct',greatest(0,least(80,case when v_skill_id='true_name_shatter' and v_choice='body' then 22 when v_skill_id='death_memory' and v_choice='survival' then 20 else coalesce((v_skill->>'defenseReductionPct')::numeric,0) end)),'skillPowerReductionPct',case when v_skill_id='true_name_shatter' and v_choice='magic' then 25 when v_skill_id='death_memory' and v_choice='magic' then 25 when v_skill_id='soul_domination' and v_choice='chain' then 15 else 0 end);
            v_statuses:=jsonb_set(v_statuses,array[v_skill_id],v_status_data,true);
            v_target_monster:=jsonb_set(target_row.x,'{statuses}',v_statuses,true);
            v_monsters:=jsonb_set(v_monsters,array[(target_row.ord-1)::text],v_target_monster,true);
          end loop;
        end if;
        select q.x into monster from jsonb_array_elements(v_monsters) with ordinality q(x,ord) where q.ord=idx;
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
      if v_spec_key like 'warrior_%' then
        damage:=least(damage,greatest(1,floor(coalesce(nullif(monster->>'max_hp','')::numeric,nullif(monster->>'maxHp','')::numeric,nullif(monster->>'hp','')::numeric,100) * case
          when coalesce((monster->>'boss')::boolean,false) or coalesce((monster->>'isBoss')::boolean,false) or lower(coalesce(monster->>'encounterKind','')) in ('boss','area_boss','miniboss') or lower(coalesce(monster->>'rank','')) like '%boss%' then 12 else 20 end /100)::integer));
      end if;
      newhp:=greatest(0,coalesce((monster->>'hp')::integer,0)-damage);
      monster:=jsonb_set(monster,'{hp}',to_jsonb(newhp),true);
      v_monsters:=jsonb_set(v_monsters,array[(idx-1)::text],monster,true);
    end if;

    -- Existing Wizard summons attack once on their owner's later attack/skill action.
    -- A summon created this round starts attacking on the next round.
    v_summons:=coalesce(profile->'party_summons','[]'::jsonb);
    if jsonb_typeof(v_summons)='array' then
      for status_row in select value from jsonb_array_elements(v_summons) loop
        if coalesce((status_row.value->>'hp')::integer,0)>0
          and coalesce((status_row.value->>'turns')::integer,0)>0
          and coalesce((status_row.value->>'createdRound')::integer,0)<st.round_no then
          select q.x,q.ord::integer into target_row from jsonb_array_elements(v_monsters) with ordinality q(x,ord)
            where coalesce((q.x->>'hp')::integer,0)>0 order by q.ord limit 1;
          if found then
            v_skill_damage:=greatest(1,coalesce((public.etranom_combat_resolve_damage(
              greatest(1,coalesce((status_row.value->>'attack')::numeric,1)),
              greatest(0,coalesce((target_row.x->>'defense')::numeric,0)),1,0,0,0,1.25,1,1,
              100,0,0,random()*100,1.5)->>'damage')::integer,0));
            target_row.x:=jsonb_set(target_row.x,'{hp}',to_jsonb(greatest(0,coalesce((target_row.x->>'hp')::integer,0)-v_skill_damage)),true);
            v_monsters:=jsonb_set(v_monsters,array[(target_row.ord-1)::text],target_row.x,true);
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
        select q.x,q.ord::integer into target_row from jsonb_array_elements(v_monsters) with ordinality q(x,ord)
          where coalesce((q.x->>'hp')::integer,0)>0 order by q.ord limit 1;
        if found then
          v_skill_damage:=greatest(1,coalesce((public.etranom_combat_resolve_damage(
            greatest(1,coalesce((status_row.value->>'attack')::numeric,1)*(1+coalesce((v_wizard_progress#>>'{legionBuffs,attackPct}')::numeric,0)/100)),
            greatest(0,coalesce((target_row.x->>'defense')::numeric,0)),1,0,0,0,1.25,1,1,100,0,0,random()*100,1.5)->>'damage')::integer,0));
          target_row.x:=jsonb_set(target_row.x,'{hp}',to_jsonb(greatest(0,coalesce((target_row.x->>'hp')::integer,0)-v_skill_damage)),true);
          v_monsters:=jsonb_set(v_monsters,array[(target_row.ord-1)::text],target_row.x,true);
          damage:=damage+v_skill_damage;
          if coalesce((target_row.x->>'hp')::integer,0)<=0 and v_debt_count<2 then
            v_wizard_progress:=jsonb_set(v_wizard_progress,'{souls}',to_jsonb(least(99,coalesce((v_wizard_progress->>'souls')::integer,0)+1)),true);
            v_debt_count:=v_debt_count+1;
          end if;
        end if;
      end loop;
    end if;

    -- Every newly defeated target (including AoE/DOT/legion kills) receives exactly one ledger entry.
    for kill_row in select q.x,q.ord::integer as ord from jsonb_array_elements(v_monsters) with ordinality q(x,ord)
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
    end loop;
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

  if v_wizard_progress_loaded or (v_skill_id is not null and v_spec_key is not null) then
    profile:=jsonb_set(profile,'{party_wizard_progress}',v_wizard_progress,true);
    select gs.save_data into v_save_data from public.game_saves gs where gs.user_id=uid for update;
    if v_save_data is not null then v_save_data:=jsonb_set(v_save_data,array['classProgress',v_spec_key],v_wizard_progress,true); update public.game_saves gs set save_data=jsonb_set(v_save_data,'{updatedAt}',to_jsonb(now()::text),true),updated_at=now() where gs.user_id=uid; end if;
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

  if not exists(select 1 from jsonb_array_elements(v_monsters) e(value) where coalesce((e.value->>'hp')::integer,0)>0) then
    st.status:='victory'; st.completed_at:=now();
  elsif alive_count=0 then
    st.status:='defeat'; st.completed_at:=now();
  elsif done_count>=alive_count then
    -- Tick monster DOT/debuffs once per completed group round; persisted on the battle state.
    for target_row in select q.x,q.ord::integer as ord from jsonb_array_elements(v_monsters) with ordinality q(x,ord) where coalesce((q.x->>'hp')::integer,0)>0 loop
      v_statuses:=coalesce(target_row.x->'statuses','{}'::jsonb);
      for status_row in select key,value from jsonb_each(v_statuses) loop
        v_status_data:=status_row.value;
        if coalesce((v_status_data->>'turns')::integer,0)>0 and coalesce((v_status_data->>'dotPct')::numeric,0)>0 then
          v_dot_damage:=greatest(1,floor(coalesce((target_row.x->>'max_hp')::numeric,(target_row.x->>'hp')::numeric,1)*least(50,(v_status_data->>'dotPct')::numeric)/100)::integer);
          target_row.x:=jsonb_set(target_row.x,'{hp}',to_jsonb(greatest(0,coalesce((target_row.x->>'hp')::integer,0)-v_dot_damage)),true);
        end if;
        v_status_data:=jsonb_set(v_status_data,'{turns}',to_jsonb(greatest(0,coalesce((v_status_data->>'turns')::integer,0)-1)),true);
        if coalesce((v_status_data->>'turns')::integer,0)<=0 then v_statuses:=v_statuses-status_row.key; else v_statuses:=jsonb_set(v_statuses,array[status_row.key],v_status_data,true); end if;
      end loop;
      target_row.x:=jsonb_set(target_row.x,'{statuses}',v_statuses,true);
      v_monsters:=jsonb_set(v_monsters,array[(target_row.ord-1)::text],target_row.x,true);
    end loop;
    -- Player-side buff durations expire at the same authoritative round boundary.
    for m in select pm.user_id from public.party_members pm where pm.party_id=v_party loop
      profile:=profiles->(m.user_id::text); v_buff_data:=coalesce(profile->'party_skill_buffs','{}'::jsonb);
      for status_row in select key,value from jsonb_each(v_buff_data) loop
        v_status_data:=jsonb_set(status_row.value,'{turns}',to_jsonb(greatest(0,coalesce((status_row.value->>'turns')::integer,0)-1)),true);
        if coalesce((v_status_data->>'turns')::integer,0)<=0 then v_buff_data:=v_buff_data-status_row.key; else v_buff_data:=jsonb_set(v_buff_data,array[status_row.key],v_status_data,true); end if;
      end loop;
      profile:=jsonb_set(profile,'{party_skill_buffs}',v_buff_data,true);
      v_summons:=coalesce(profile->'party_summons','[]'::jsonb); v_buff_data:='[]'::jsonb;
      for status_row in select value from jsonb_array_elements(v_summons) loop
        v_status_data:=jsonb_set(status_row.value,'{turns}',to_jsonb(greatest(0,coalesce((status_row.value->>'turns')::integer,0)-1)),true);
        if coalesce((v_status_data->>'turns')::integer,0)>0 and coalesce((v_status_data->>'hp')::integer,0)>0 then v_buff_data:=v_buff_data||jsonb_build_array(v_status_data); end if;
      end loop;
      profile:=jsonb_set(profile,'{party_summons}',v_buff_data,true); profiles:=profiles||jsonb_build_object(m.user_id::text,profile);
    end loop;
    -- DOT can defeat players before the enemy action; no dead player receives another hit.
    for m in select pm.user_id from public.party_members pm where pm.party_id=v_party loop
      profile:=profiles->(m.user_id::text); v_statuses:=coalesce(profile->'party_statuses','{}'::jsonb); target_hp:=coalesce((hpmap->>m.user_id::text)::integer,0);
      for status_row in select key,value from jsonb_each(v_statuses) loop
        v_status_data:=status_row.value;
        if target_hp>0 and coalesce((v_status_data->>'dotPct')::numeric,0)>0 then
          v_dot_damage:=greatest(1,floor(coalesce((profile->>'max_hp')::numeric,100)*least(50,(v_status_data->>'dotPct')::numeric)/100)::integer); target_hp:=greatest(0,target_hp-v_dot_damage);
        end if;
        v_status_data:=jsonb_set(v_status_data,'{turns}',to_jsonb(greatest(0,coalesce((v_status_data->>'turns')::integer,0)-1)),true);
        if coalesce((v_status_data->>'turns')::integer,0)<=0 then v_statuses:=v_statuses-status_row.key; else v_statuses:=jsonb_set(v_statuses,array[status_row.key],v_status_data,true); end if;
      end loop;
      if target_hp<=0 and coalesce((profile->>'party_revive_armed')::boolean,false) then
        target_hp:=greatest(1,floor(coalesce((profile->>'max_hp')::numeric,100)*coalesce((profile->>'party_revive_hp_pct')::numeric,25)/100)::integer);
        profile:=jsonb_set(profile,'{party_revive_armed}','false'::jsonb,true);
        profile:=jsonb_set(profile,'{party_revive_used}','true'::jsonb,true);
      end if;
      hpmap:=hpmap||jsonb_build_object(m.user_id::text,target_hp); profile:=jsonb_set(profile,'{party_statuses}',v_statuses,true); profiles:=profiles||jsonb_build_object(m.user_id::text,profile);
    end loop;
    select value into monster from jsonb_array_elements(v_monsters) where coalesce((value->>'hp')::integer,0)>0 limit 1;
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
        select greatest(0,least(80,coalesce(sum(coalesce((e.value->>'damageReductionPct')::numeric,0)),0))) into v_incoming_reduction_pct
          from jsonb_each(coalesce(profile->'party_skill_buffs','{}'::jsonb)) e
          where coalesce((e.value->>'turns')::integer,0)>0;
        member_damage:=greatest(0,floor(member_damage*(1-v_incoming_reduction_pct/100))::integer);
        select greatest(0,least(85,coalesce(sum(coalesce((e.value->>'evasionPct')::numeric,0)),0))) into v_evasion_pct
          from jsonb_each(coalesce(profile->'party_skill_buffs','{}'::jsonb)) e
          where coalesce((e.value->>'turns')::integer,0)>0;
        if v_evasion_pct>0 and random()*100<v_evasion_pct then member_damage:=0; end if;
        profile:=profiles -> (m.user_id::text);
        select greatest(0,least(80,coalesce(max((value->>'attackReductionPct')::numeric),0))) into v_attack_reduction from jsonb_each(coalesce(monster->'statuses','{}'::jsonb));
        member_damage:=greatest(1,floor(member_damage*(1-v_attack_reduction/100))::integer);
        if coalesce((profile->>'party_evasion_turns')::integer,0)>0 then member_damage:=0; profile:=jsonb_set(profile,'{party_evasion_turns}',to_jsonb(greatest(0,(profile->>'party_evasion_turns')::integer-1)),true); end if;
        v_summons:=coalesce(profile->'party_summons','[]'::jsonb);
        if jsonb_typeof(v_summons)='array' and jsonb_array_length(v_summons)>0 then
          v_summon:=v_summons->0; v_absorb:=least(member_damage,greatest(0,coalesce((v_summon->>'hp')::integer,0)));
          member_damage:=greatest(0,member_damage-v_absorb); v_summon:=jsonb_set(v_summon,'{hp}',to_jsonb(greatest(0,coalesce((v_summon->>'hp')::integer,0)-v_absorb)),true);
          if coalesce((v_summon->>'hp')::integer,0)<=0 then v_summons:=v_summons-'0'; else v_summons:=jsonb_set(v_summons,'{0}',v_summon,true); end if;
          profile:=jsonb_set(profile,'{party_summons}',v_summons,true);
        end if;
        if coalesce((profile->>'party_shield_turns')::integer,0)>0 then
          v_skill_value:=greatest(0,coalesce((profile->>'party_shield_hp')::integer,0));
          if v_skill_value>0 then
            v_skill_value:=greatest(0,v_skill_value-member_damage);
            member_damage:=greatest(0,floor(member_damage*(1-greatest(0,least(80,coalesce((profile->>'party_shield_reduction_pct')::numeric,0)))/100)::integer)-coalesce((profile->>'party_shield_hp')::integer,0));
            profile:=jsonb_set(profile,'{party_shield_hp}',to_jsonb(v_skill_value),true);
          end if;
          profile:=jsonb_set(profile,'{party_shield_turns}',to_jsonb(greatest(0,(profile->>'party_shield_turns')::integer-1)),true);
        end if;
        if coalesce((guards->>m.user_id::text)::boolean,false) then member_damage:=greatest(0,floor(member_damage*.5)::integer); end if;
        newhp:=greatest(0,target_hp-case when member_damage=0 then 0 else greatest(1,floor(member_damage*(100/(100+defense_power*1.25)))::integer) end);
        if newhp<=0 and coalesce((profile->>'party_revive_armed')::boolean,false) then newhp:=greatest(1,floor(coalesce((profile->>'max_hp')::numeric,100)*coalesce((profile->>'party_revive_hp_pct')::numeric,25)/100)::integer); profile:=jsonb_set(profile,'{party_revive_armed}','false'::jsonb,true); profile:=jsonb_set(profile,'{party_revive_used}','true'::jsonb,true); end if;
        hpmap:=hpmap||jsonb_build_object(m.user_id::text,newhp);
        profiles:=profiles||jsonb_build_object(m.user_id::text,profile);
      end if;
    end loop;
    if not exists(select 1 from public.party_members pm where pm.party_id=v_party
      and coalesce((hpmap->>pm.user_id::text)::integer,0)>0
      and not exists(select 1 from public.party_battle_retreats r where r.session_id=p_session_id and r.user_id=pm.user_id)) then st.status:='defeat'; st.completed_at:=now();
    else st.round_no:=st.round_no+1; guards:='{}'::jsonb; end if;
  end if;

  update public.party_battle_state set monsters=v_monsters,kills_by_user=kills,
    monster_hp=(select coalesce(sum((e.value->>'hp')::integer),0) from jsonb_array_elements(v_monsters) e(value)),
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
end $function$
