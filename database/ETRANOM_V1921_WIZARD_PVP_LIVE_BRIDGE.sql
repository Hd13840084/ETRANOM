begin;
-- Preflight: the current Wizard Party catalog must be installed before this migration.
do $$
declare n integer; party_fingerprint text; pvp_fingerprint text;
begin
 if to_regclass('public.party_battle_skill_catalog') is null then raise exception 'v1921_requires_party_battle_skill_catalog'; end if;
 if to_regclass('public.pvp_matches') is null then raise exception 'v1921_requires_pvp_matches'; end if;
 if to_regprocedure('public.etranom_party_battle_act(uuid,text,integer)') is null then raise exception 'v1921_requires_party_battle_act_rpc'; end if;
 if to_regprocedure('public.etranom_pvp_action(uuid,text)') is null then raise exception 'v1921_requires_pvp_action_rpc'; end if;
 select md5(pg_get_functiondef(to_regprocedure('public.etranom_party_battle_act(uuid,text,integer)'))) into party_fingerprint;
 if party_fingerprint <> '358438d29c1cc29e80d7cccc4c5990d2' then raise exception 'v1921_party_rpc_fingerprint_mismatch_expected_358438d29c1cc29e80d7cccc4c5990d2_found_%',party_fingerprint; end if;
 select md5(pg_get_functiondef(to_regprocedure('public.etranom_pvp_action(uuid,text)'))) into pvp_fingerprint;
 if pvp_fingerprint <> '52c2c1a04eed2d85fac4a29af28fec2a' then raise exception 'v1921_pvp_action_fingerprint_mismatch_expected_52c2c1a04eed2d85fac4a29af28fec2a_found_%',pvp_fingerprint; end if;
 select count(distinct skill_id) into n from public.party_battle_skill_catalog
  where specialization_key in ('wizard_arcane_mage','wizard_elementalist','wizard_warlock','wizard_necromancer')
    and enabled and skill_id not in ('wizard_basic_strike','wizard_class_guard','wizard_class_finisher');
 if n<>40 then raise exception 'v1921_requires_exactly_40_enabled_wizard_skills_found_%',n; end if;
 if exists (select 1 from (select specialization_key,count(distinct skill_id) as skill_count from public.party_battle_skill_catalog where specialization_key in ('wizard_arcane_mage','wizard_elementalist','wizard_warlock','wizard_necromancer') and enabled group by specialization_key) q where q.skill_count<>10) then raise exception 'v1921_requires_10_enabled_skills_per_wizard_specialization'; end if;
 if to_regclass('public.pvp_player_stats') is null then raise exception 'v1921_requires_pvp_player_stats'; end if;
end $$;

-- Patch the existing Party RPC in place, preserving its other battle logic.
do $$
declare
  v_oid oid;
  v_def text;
  v_anchor text;
  v_count integer;
begin
  v_oid:=to_regprocedure('public.etranom_party_battle_act(uuid,text,integer)');
  if v_oid is null then raise exception 'v1921_party_battle_rpc_not_found'; end if;
  v_def:=pg_get_functiondef(v_oid);


  v_anchor:=$a$v_wizard_progress:=coalesce(v_save_data#>array['classProgress',v_spec_key],'{}'::jsonb);$a$;
  if position(v_anchor in v_def)=0 then raise exception 'v1921_party_arcane_load_anchor_missing'; end if;
  v_def:=replace(v_def,v_anchor,$b$v_wizard_progress:=case when v_spec_key='wizard_arcane_mage' then coalesce(v_save_data#>'{classProgress,arcaneMage}',v_save_data#>array['classProgress',v_spec_key],'{}'::jsonb) else coalesce(v_save_data#>array['classProgress',v_spec_key],'{}'::jsonb) end;$b$);

  v_anchor:=$c$if v_save_data is not null then v_save_data:=jsonb_set(v_save_data,array['classProgress',v_spec_key],v_wizard_progress,true); update public.game_saves gs set save_data=jsonb_set(v_save_data,'{updatedAt}',to_jsonb(now()::text),true),updated_at=now() where gs.user_id=uid; end if;$c$;
  if position(v_anchor in v_def)=0 then raise exception 'v1921_party_arcane_save_anchor_missing'; end if;
  v_def:=replace(v_def,v_anchor,$d$if v_save_data is not null then v_save_data:=jsonb_set(v_save_data,array['classProgress',v_spec_key],v_wizard_progress,true); if v_spec_key='wizard_arcane_mage' then v_save_data:=jsonb_set(v_save_data,'{classProgress,arcaneMage}',v_wizard_progress,true); end if; update public.game_saves gs set save_data=jsonb_set(v_save_data,'{updatedAt}',to_jsonb(now()::text),true),updated_at=now() where gs.user_id=uid; end if;$d$);

  v_anchor:='v_ally_profile jsonb;';
  if position(v_anchor in v_def)=0 then raise exception 'v1921_party_declare_anchor_missing'; end if;
  v_def:=replace(v_def,v_anchor,'v_ally_profile jsonb; v_arcane_charge_cost integer:=0; v_arcane_charges integer:=0; v_arcane_max_charges integer:=5; v_skill_rank integer:=1; v_rank_step integer; v_upgrade jsonb; v_upgrade_pair record; v_combo_base numeric:=0;');

  v_anchor:='v_wizard_progress:=jsonb_set(v_wizard_progress,''{sovereignTurns}'',''0''::jsonb,true);';
  v_count:=(length(v_def)-length(replace(v_def,v_anchor,'')))/greatest(1,length(v_anchor));
  if v_count<2 then raise exception 'v1921_party_session_reset_anchor_missing'; end if;
  v_def:=replace(v_def,v_anchor,v_anchor||' if v_spec_key=''wizard_arcane_mage'' then v_wizard_progress:=jsonb_set(v_wizard_progress,''{charges}'',''0''::jsonb,true); end if;');

  v_anchor:='when ''soul_domination'' then ''chain'' else null end;';
  if position(v_anchor in v_def)=0 then raise exception 'v1921_party_choice_default_anchor_missing'; end if;
  v_def:=replace(v_def,v_anchor,'when ''soul_domination'' then ''chain'' when ''elemental_fusion'' then ''fire_wind'' else null end;');

  v_anchor:=$e$or (v_skill_id='soul_domination' and v_choice not in ('dominate','chain','silence')) then raise exception 'party_skill_choice_invalid'; end if;$e$;
  if position(v_anchor in v_def)=0 then raise exception 'v1921_party_choice_validation_anchor_missing'; end if;
  v_def:=replace(v_def,v_anchor,$f$or (v_skill_id='soul_domination' and v_choice not in ('dominate','chain','silence')) or (v_skill_id='elemental_fusion' and v_choice not in ('fire_wind','fire_earth','water_wind','water_earth','lightning_wind','light_dark')) then raise exception 'party_skill_choice_invalid'; end if;$f$);

  v_anchor:=$g$if level_no < coalesce((v_skill->>'unlockLevel')::integer,1) then raise exception 'party_skill_locked'; end if;$g$;
  if position(v_anchor in v_def)=0 then raise exception 'v1921_party_rank_anchor_missing'; end if;
  v_def:=replace(v_def,v_anchor,
    'v_skill_rank:=greatest(1,least(7,coalesce(nullif(v_wizard_progress->''skillRanks''->>v_skill_id,'''')::integer,1))); '
    ||'if v_skill_rank>1 and jsonb_typeof(v_skill->''upgrades'')=''array'' then '
    ||'for v_rank_step in 2..v_skill_rank loop v_upgrade:=null; '
    ||'select value into v_upgrade from jsonb_array_elements(v_skill->''upgrades'') with ordinality u(value,ord) '
    ||'where coalesce(nullif(value->>''rank'','''')::integer,u.ord::integer+1)=v_rank_step limit 1; '
    ||'if v_upgrade is not null then for v_upgrade_pair in select key,value from jsonb_each(v_upgrade) '
    ||'where jsonb_typeof(value)=''number'' and key not in (''rank'',''pointsRequired'') loop '
    ||'v_skill:=jsonb_set(v_skill,array[v_upgrade_pair.key],v_upgrade_pair.value,true); end loop; end if; '
    ||'end loop; end if; '
    ||'if v_spec_key=''wizard_elementalist'' then v_skill_power:=v_skill_power*(1+coalesce((v_wizard_progress->>''elementalMastery'')::numeric,0)/100); end if; '
    ||v_anchor);

  v_anchor:=$h$v_mana_cost:=greatest(0,case when coalesce(v_skill->>'manaPct',v_skill->>'manaCostPercent',v_skill->>'manaCostPct') is not null then ceil(maxmp*coalesce((v_skill->>'manaPct')::numeric,(v_skill->>'manaCostPercent')::numeric,(v_skill->>'manaCostPct')::numeric,0)/100)::integer else ceil(coalesce((v_skill->>'manaCost')::numeric,0))::integer end);$h$;
  if position(v_anchor in v_def)=0 then raise exception 'v1921_party_arcane_cost_anchor_missing'; end if;
  v_def:=replace(v_def,v_anchor,v_anchor||
    ' if v_spec_key=''wizard_arcane_mage'' then '
    ||'v_arcane_max_charges:=5+case when coalesce(v_wizard_progress->''unlockedTalents'',''[]''::jsonb) @> ''["ancient_reserve"]''::jsonb then 1 else 0 end; '
    ||'v_arcane_charges:=greatest(0,least(v_arcane_max_charges,coalesce((v_wizard_progress->>''charges'')::integer,0))); '
    ||'if v_skill_id=''arcane_singularity'' then v_arcane_charge_cost:=v_arcane_charges; if v_arcane_charge_cost<1 then raise exception ''arcane_charges_insufficient''; end if; '
    ||'else v_arcane_charge_cost:=greatest(0,coalesce(nullif(v_skill->>''chargeCost'','''')::integer,0)); end if; '
    ||'if v_arcane_charges<v_arcane_charge_cost then raise exception ''arcane_charges_insufficient''; end if; '
    ||'if v_arcane_charge_cost>0 then v_wizard_progress:=jsonb_set(v_wizard_progress,''{charges}'',to_jsonb(v_arcane_charges-v_arcane_charge_cost),true); end if; end if;');

  v_anchor:=$i$v_skill_pct:=coalesce((v_skill->>'damagePct')::numeric,(v_skill->>'damagePercent')::numeric,(v_skill->>'powerPct')::numeric,(v_skill->'effects'->>'damagePct')::numeric,case when v_skill_id='death_claw' then 220 when v_skill_id='life_siphon' then 160 when v_skill_id='arcane_echo' then coalesce((profile->>'last_party_damage_pct')::numeric,100) else 0 end);$i$;
  if position(v_anchor in v_def)=0 then raise exception 'v1921_party_skill_pct_anchor_missing'; end if;
  v_def:=replace(v_def,v_anchor,v_anchor||
    ' if v_skill_id=''arcane_singularity'' and v_arcane_charge_cost>0 then v_skill_pct:=v_skill_pct*(1+v_arcane_charge_cost*coalesce((v_skill->>''chargeBonusPct'')::numeric,0)/100); end if; '
    ||'if v_skill_id=''elemental_fusion'' then '
    ||'v_combo_base:=case v_choice when ''fire_wind'' then 220 when ''fire_earth'' then 230 when ''water_wind'' then 190 when ''water_earth'' then 180 when ''lightning_wind'' then 240 else 250 end; v_skill_pct:=v_combo_base*coalesce(v_skill_pct,200)/200; '
    ||'v_skill_pct:=v_skill_pct*(1+coalesce((v_skill->>''comboEffectBonusPct'')::numeric,0)/100); '
    ||'v_skill:=jsonb_set(v_skill,''{damagePct}'',to_jsonb(v_skill_pct),true); '
    ||'v_skill:=jsonb_set(v_skill,''{dotPct}'',to_jsonb(case when v_choice=''fire_wind'' then 20 else 0 end),true); '
    ||'v_skill:=jsonb_set(v_skill,''{attackReductionPct}'',to_jsonb(case when v_choice=''water_earth'' then 15 when v_choice in (''lightning_wind'',''water_wind'',''light_dark'') then 20 else 0 end),true); '
    ||'v_skill:=jsonb_set(v_skill,''{defenseReductionPct}'',to_jsonb(case when v_choice=''fire_earth'' then 15 else 0 end),true); '
    ||'v_skill:=jsonb_set(v_skill,''{accuracyReductionPct}'',to_jsonb(case when v_choice=''water_wind'' then 20 else 0 end),true); '
    ||'v_skill:=jsonb_set(v_skill,''{skillPowerReductionPct}'',to_jsonb(case when v_choice=''light_dark'' then 20 else 0 end),true); end if;');

  v_anchor:=$j$if (v_is_status or v_skill_id in ('death_claw','ember_bolt','life_siphon','forbidden_signature','darkness_chains','chain_lightning','tempest','earth_rupture')) and$j$;
  if position(v_anchor in v_def)=0 then raise exception 'v1921_party_combo_status_anchor_missing'; end if;
  v_def:=replace(v_def,v_anchor,$k$if (v_is_status or v_skill_id='elemental_fusion' or v_skill_id in ('death_claw','ember_bolt','life_siphon','forbidden_signature','darkness_chains','chain_lightning','tempest','earth_rupture')) and$k$);

  v_anchor:=$l$if v_skill_damage>0 then profile:=jsonb_set(profile,'{last_party_damage_pct}',to_jsonb(v_skill_pct),true); end if;$l$;
  if position(v_anchor in v_def)=0 then raise exception 'v1921_party_arcane_gain_anchor_missing'; end if;
  v_def:=replace(v_def,v_anchor,v_anchor||
    ' if v_skill_id=''arcane_bolt'' and v_skill_damage>0 then '
    ||'v_wizard_progress:=jsonb_set(v_wizard_progress,''{charges}'',to_jsonb(least(v_arcane_max_charges,coalesce((v_wizard_progress->>''charges'')::integer,0)+greatest(1,coalesce((v_skill->>''chargeGain'')::integer,1)))),true); end if;');


  v_anchor:=$n$v_statuses:=jsonb_set(v_statuses,array[v_skill_id],v_status_data,true);$n$;
  if position(v_anchor in v_def)=0 then raise exception 'v1921_party_combo_status_fields_anchor_missing'; end if;
  v_def:=replace(v_def,v_anchor,"v_status_data:=jsonb_set(v_status_data,'{accuracyReductionPct}',to_jsonb(coalesce((v_skill->>'accuracyReductionPct')::numeric,0)),true); v_status_data:=jsonb_set(v_status_data,'{skillPowerReductionPct}',to_jsonb(coalesce((v_skill->>'skillPowerReductionPct')::numeric,0)),true); "||v_anchor);

  v_anchor:=$o$if v_skill_type in ('life_steal','single_damage_drain') and damage>0 then$o$;
  if position(v_anchor in v_def)=0 then raise exception 'v1921_party_elemental_mastery_anchor_missing'; end if;
  v_def:=replace(v_def,v_anchor,"if v_skill_id='elemental_fusion' and v_choice='light_dark' and coalesce(v_wizard_progress->'unlockedTalents','[]'::jsonb) @> '["twilight_balance"]'::jsonb then v_wizard_progress:=jsonb_set(v_wizard_progress,'{elementalMastery}',to_jsonb(coalesce((v_wizard_progress->>'elementalMastery')::numeric,0)+10),true); end if; "||v_anchor);

  v_anchor:=$m$v_target_monster:=jsonb_set(target_row.x,'{hp}',to_jsonb(greatest(0,coalesce((target_row.x->>'hp')::integer,0)-v_skill_damage)),true);$m$;
  if position(v_anchor in v_def)=0 then raise exception 'v1921_party_combo_mana_anchor_missing'; end if;
  v_def:=replace(v_def,v_anchor,v_anchor||
    ' if v_skill_id=''elemental_fusion'' and v_choice=''light_dark'' then '
    ||'v_target_monster:=jsonb_set(v_target_monster,''{mp}'',to_jsonb(greatest(0,coalesce((v_target_monster->>''mp'')::integer,0)-ceil(coalesce((v_target_monster->>''maxMp'')::numeric,coalesce((v_target_monster->>''mp'')::numeric,0))*0.05)::integer)),true); end if;');

  execute v_def;
end $$;

-- ETRANOM V1921 Wizard PvP live bridge. Uses the canonical 40-skill Party catalog.
-- No client damage/resource values are accepted. PvP hard-control and corpse recruitment are disabled by design.
create or replace function public.etranom_pvp_skill_action(p_match uuid,p_skill_id text,p_target_id uuid default null,p_choice text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 uid uuid:=auth.uid(); m public.pvp_matches%rowtype; s jsonb; actor jsonb; target jsonb;
 actor_key text; target_key text; actor_id uuid; target_id uuid;
 ac jsonb; tc jsonb; ab jsonb; tb jsonb; sk jsonb; sd jsonb;
 skill_type text; lvl integer; mp numeric; maxmp numeric; hp numeric; maxhp numeric; target_mp numeric; target_maxmp numeric; target_maxhp numeric; target_hp numeric; target_atk numeric; target_def numeric;
 atk numeric; mag numeric; def numeric; cost integer; cd integer; cooldowns jsonb;
 dmg integer:=0; heal integer:=0; shield integer:=0; next_player uuid; log_entry jsonb; status_data jsonb; summon_data jsonb; target_statuses jsonb; effect_row record; effect_key text; effect_json jsonb; actor_effects jsonb; actor_summons jsonb; actor_maxhp numeric; dot_damage integer:=0; attack_reduction numeric:=0; defense_reduction numeric:=0; skill_power_reduction numeric:=0; shield_state jsonb; shield_hp numeric; shield_reduction numeric:=0; absorbed numeric:=0; reflect_pct numeric:=0; reflect_damage integer:=0;
 spec_key text; progress_key text; progress jsonb; skill_rank integer:=1; skill_rank_step integer; upgrade_row jsonb; upgrade_pair record; choice_key text; damage_pct numeric:=0; charge_cost integer:=0; charges integer:=0; max_charges integer:=5; reversal_triggered boolean:=false; combo_base numeric:=0;
begin
 if uid is null then raise exception 'auth_required'; end if;
 if p_skill_id is null or p_skill_id !~ '^[a-z0-9_]{1,48}$' then raise exception 'invalid_skill_id'; end if;
 select * into m from public.pvp_matches where id=p_match and uid in (player_a,player_b) for update;
 if not found then raise exception 'match_not_found'; end if;
 if m.status<>'active' then raise exception 'match_not_active'; end if;
 if m.turn_player<>uid then raise exception 'not_your_turn'; end if;
 s:=coalesce(m.combat_state,'{}'::jsonb); 
 if m.player_a=uid then actor_key:='player_a'; target_key:='player_b'; actor_id:=m.player_a; target_id:=m.player_b; actor:=coalesce(s->'player_a','{}'::jsonb); target:=coalesce(s->'player_b','{}'::jsonb);
 else actor_key:='player_b'; target_key:='player_a'; actor_id:=m.player_b; target_id:=m.player_a; actor:=coalesce(s->'player_b','{}'::jsonb); target:=coalesce(s->'player_a','{}'::jsonb); end if;
 ac:=coalesce(actor->'save_snapshot'->'character','{}'::jsonb); tc:=coalesce(target->'save_snapshot'->'character','{}'::jsonb);
 if ac='{}'::jsonb or tc='{}'::jsonb then raise exception 'combat_character_data_missing'; end if;
 if p_target_id is not null and p_target_id<>target_id then raise exception 'invalid_pvp_skill_target'; end if;
 spec_key:=case coalesce(ac->>'specializationId',ac->>'specialization_id',ac->>'specialization')
   when 'wizard_arcane_mage' then 'wizard_arcane_mage' when 'wizard_1' then 'wizard_arcane_mage' when 'آرکین‌میج' then 'wizard_arcane_mage' when 'آرکین میج' then 'wizard_arcane_mage' when 'Arcane Mage' then 'wizard_arcane_mage'
   when 'wizard_elementalist' then 'wizard_elementalist' when 'wizard_2' then 'wizard_elementalist' when 'المنتالیست' then 'wizard_elementalist' when 'Elementalist' then 'wizard_elementalist'
   when 'wizard_warlock' then 'wizard_warlock' when 'wizard_3' then 'wizard_warlock' when 'وارلاک' then 'wizard_warlock' when 'Warlock' then 'wizard_warlock'
   when 'wizard_necromancer' then 'wizard_necromancer' when 'wizard_4' then 'wizard_necromancer' when 'نکرومنسر' then 'wizard_necromancer' when 'Necromancer' then 'wizard_necromancer' else null end;
 if spec_key is null then raise exception 'skill_specialization_mismatch'; end if;
 progress_key:=case when spec_key='wizard_arcane_mage' then 'arcaneMage' else spec_key end;
 if lower(coalesce(ac->>'classId',ac->>'class_id',ac->>'class',ac->>'archetype','')) not in ('wizard','جادوگر') then raise exception 'skill_class_mismatch'; end if;
 select skill_data into sd from public.party_battle_skill_catalog where specialization_key=spec_key and skill_id=p_skill_id and enabled;
 if sd is null then raise exception 'skill_not_in_trusted_catalog'; end if;
 progress:=coalesce(actor->'battle'->'class_progress'->progress_key,actor->'save_snapshot'->'classProgress'->progress_key,actor->'save_snapshot'->'classProgress'->spec_key,'{}'::jsonb);
 if jsonb_typeof(progress)<>'object' then progress:='{}'::jsonb; end if;
 skill_rank:=greatest(1,least(7,coalesce(nullif(progress->'skillRanks'->>p_skill_id,'')::integer,1)));
 lvl:=greatest(1,coalesce(nullif(ac->>'level','')::integer,nullif(ac->>'levelNo','')::integer,1));
 if lvl<coalesce((sd->>'unlockLevel')::integer,1) then raise exception 'skill_locked'; end if;
 if not (coalesce(ac->'skills','[]'::jsonb) @> jsonb_build_array(p_skill_id)
      or coalesce(ac->'unlockedSkills','[]'::jsonb) @> jsonb_build_array(p_skill_id)
      or coalesce(ac->'skillIds','[]'::jsonb) @> jsonb_build_array(p_skill_id)
      or coalesce(progress->'skillRanks','{}'::jsonb) ? p_skill_id) then raise exception 'skill_not_owned'; end if;
 -- Apply explicit numeric rank upgrades from the trusted catalog; prose-only bonuses remain presentation text.
 if skill_rank>1 and jsonb_typeof(sd->'upgrades')='array' then
   for skill_rank_step in 2..skill_rank loop
     upgrade_row:=null;
     select value into upgrade_row from jsonb_array_elements(sd->'upgrades') with ordinality u(value,ord)
      where coalesce(nullif(value->>'rank','')::integer,u.ord::integer+1)=skill_rank_step limit 1;
     if upgrade_row is not null then
       for upgrade_pair in select key,value from jsonb_each(upgrade_row)
        where jsonb_typeof(value)='number' and key not in ('rank','pointsRequired') loop
         sd:=jsonb_set(sd,array[upgrade_pair.key],upgrade_pair.value,true);
       end loop;
     end if;
   end loop;
 end if;
 choice_key:=coalesce(nullif(p_choice,''),case p_skill_id when 'court_of_nameless' then 'silence' when 'true_name_shatter' then 'will' when 'final_covenant' then 'annihilation' when 'assembly_of_souls' then 'hunt' when 'death_memory' then 'war' when 'soul_domination' then 'chain' when 'elemental_fusion' then 'fire_wind' else null end);
 if (p_skill_id='court_of_nameless' and choice_key not in ('silence','refund','confiscation')) or
    (p_skill_id='true_name_shatter' and choice_key not in ('body','will','magic','bond')) or
    (p_skill_id='final_covenant' and choice_key not in ('annihilation','dominion','void')) or
    (p_skill_id='assembly_of_souls' and choice_key not in ('hunt','protect','feed')) or
    (p_skill_id='death_memory' and choice_key not in ('war','survival','magic')) or
    (p_skill_id='soul_domination' and choice_key not in ('dominate','chain','silence')) or
    (p_skill_id='elemental_fusion' and choice_key not in ('fire_wind','fire_earth','water_wind','water_earth','lightning_wind','light_dark')) then raise exception 'invalid_skill_choice'; end if;
 ab:=coalesce(actor->'battle','{}'::jsonb); tb:=coalesce(target->'battle','{}'::jsonb);
 -- First action may be a skill: initialize both private battle snapshots atomically.
 if ab='{}'::jsonb or tb='{}'::jsonb then
   maxhp:=greatest(1,coalesce(nullif(ac->>'maxHp','')::numeric,nullif(ac->>'max_hp','')::numeric,nullif(ac#>>'{stats,maxHp}','')::numeric,nullif(ac->>'hp','')::numeric,1));
   hp:=greatest(0,least(maxhp,coalesce(nullif(ac->>'hp','')::numeric,maxhp)));
   maxmp:=greatest(0,coalesce(nullif(ac->>'maxMp','')::numeric,nullif(ac->>'max_mp','')::numeric,nullif(ac#>>'{stats,maxMp}','')::numeric,nullif(ac->>'mp','')::numeric,0));
   mp:=greatest(0,least(maxmp,coalesce(nullif(ac->>'mp','')::numeric,maxmp)));
   atk:=greatest(1,coalesce(nullif(ac->>'attack','')::numeric,nullif(ac#>>'{stats,attack}','')::numeric,10));
   mag:=greatest(1,coalesce(nullif(ac->>'magicPower','')::numeric,nullif(ac#>>'{stats,magicPower}','')::numeric,atk));
   def:=greatest(0,coalesce(nullif(ac->>'defense','')::numeric,nullif(ac#>>'{stats,defense}','')::numeric,0));
   ab:=jsonb_build_object('hp',hp,'max_hp',maxhp,'mp',mp,'max_mp',maxmp,'attack',atk,'magicPower',mag,'defense',def,'guard_next',false,'active_skill_effects','{}'::jsonb,'skill_cooldowns','{}'::jsonb,'summons','[]'::jsonb);
   target_maxhp:=greatest(1,coalesce(nullif(tc->>'maxHp','')::numeric,nullif(tc->>'max_hp','')::numeric,nullif(tc#>>'{stats,maxHp}','')::numeric,nullif(tc->>'hp','')::numeric,1));
   target_hp:=greatest(0,least(target_maxhp,coalesce(nullif(tc->>'hp','')::numeric,target_maxhp)));
   target_maxmp:=greatest(0,coalesce(nullif(tc->>'maxMp','')::numeric,nullif(tc->>'max_mp','')::numeric,nullif(tc#>>'{stats,maxMp}','')::numeric,nullif(tc->>'mp','')::numeric,0));
   target_mp:=greatest(0,least(target_maxmp,coalesce(nullif(tc->>'mp','')::numeric,target_maxmp)));
   target_atk:=greatest(1,coalesce(nullif(tc->>'attack','')::numeric,nullif(tc#>>'{stats,attack}','')::numeric,10));
   target_def:=greatest(0,coalesce(nullif(tc->>'defense','')::numeric,nullif(tc#>>'{stats,defense}','')::numeric,0));
   tb:=jsonb_build_object('hp',target_hp,'max_hp',target_maxhp,'mp',target_mp,'max_mp',target_maxmp,'attack',target_atk,'magicPower',greatest(1,coalesce(nullif(tc->>'magicPower','')::numeric,target_atk)),'defense',target_def,'guard_next',false,'active_skill_effects','{}'::jsonb,'skill_cooldowns','{}'::jsonb,'summons','[]'::jsonb);
 end if;
 -- Advance only the active combatant's timed effects at the start of their turn.
 -- DOT is applied before the action; expired effects are removed atomically with the turn.
 actor_effects:=coalesce(ab->'active_skill_effects','{}'::jsonb);
 hp:=greatest(0,coalesce((ab->>'hp')::numeric,0));
 actor_maxhp:=greatest(1,coalesce((ab->>'max_hp')::numeric,(ac->>'maxHp')::numeric,(ac->>'max_hp')::numeric,1));
 for effect_row in select key,value from jsonb_each(actor_effects) loop
   effect_key:=effect_row.key; effect_json:=effect_row.value;
   if greatest(0,coalesce((effect_json->>'turns')::integer,0))<=0 then
     actor_effects:=actor_effects-effect_key;
   else
     if greatest(0,coalesce((effect_json->>'dotPct')::numeric,0))>0 and hp>0 then
       dot_damage:=least(hp,greatest(1,floor(actor_maxhp*least(50,(effect_json->>'dotPct')::numeric)/100)::integer));
       hp:=greatest(0,hp-dot_damage);
     end if;
     effect_json:=jsonb_set(effect_json,'{turns}',to_jsonb(greatest(0,(effect_json->>'turns')::integer-1)),true);
     if coalesce((effect_json->>'turns')::integer,0)<=0 then actor_effects:=actor_effects-effect_key;
     else actor_effects:=jsonb_set(actor_effects,array[effect_key],effect_json,true); end if;
   end if;
 end loop;
 ab:=jsonb_set(ab,'{active_skill_effects}',actor_effects,true);
 ab:=jsonb_set(ab,'{hp}',to_jsonb(hp),true);
 -- Timers are advanced server-side too; no client can extend them by replaying a payload.
 if jsonb_typeof(ab->'shield')='object' then
   effect_json:=ab->'shield';
   effect_json:=jsonb_set(effect_json,'{turns}',to_jsonb(greatest(0,coalesce((effect_json->>'turns')::integer,0)-1)),true);
   ab:=case when coalesce((effect_json->>'turns')::integer,0)<=0 then ab-'shield' else jsonb_set(ab,'{shield}',effect_json,true) end;
 end if;
 actor_summons:=coalesce(ab->'summons','[]'::jsonb);
 if jsonb_typeof(actor_summons)='array' then
   summon_data:='[]'::jsonb;
   for effect_row in select value from jsonb_array_elements(actor_summons) loop
     effect_json:=jsonb_set(effect_row.value,'{turns}',to_jsonb(greatest(0,coalesce((effect_row.value->>'turns')::integer,0)-1)),true);
     if coalesce((effect_json->>'turns')::integer,0)>0 and coalesce((effect_json->>'hp')::integer,0)>0 then summon_data:=summon_data||jsonb_build_array(effect_json); end if;
   end loop;
   ab:=jsonb_set(ab,'{summons}',summon_data,true);
 end if;
 if hp<=0 and coalesce((ab->>'revive_armed')::boolean,false) then
   hp:=greatest(1,ceil(actor_maxhp*greatest(1,least(100,coalesce((ab->>'revive_hp_pct')::numeric,25)))/100));
   ab:=jsonb_set(ab,'{hp}',to_jsonb(hp),true); ab:=jsonb_set(ab,'{revive_armed}','false'::jsonb,true); ab:=jsonb_set(ab,'{revive_consumed}','true'::jsonb,true);
 end if;
 if hp<=0 then
   actor:=jsonb_set(actor,'{battle}',ab,true);
   if actor_key='player_a' then s:=jsonb_set(s,'{player_a}',actor,true); else s:=jsonb_set(s,'{player_b}',actor,true); end if;
   update public.pvp_matches set combat_state=s,status='completed',winner_id=target_id,completed_at=now(),updated_at=now(),last_action_at=now(),turn_no=turn_no+1,turn_player=null where id=p_match;
   insert into public.pvp_player_stats(user_id,wins,losses,draws) values(target_id,1,0,0),(actor_id,0,1,0) on conflict(user_id) do update set wins=public.pvp_player_stats.wins+excluded.wins,losses=public.pvp_player_stats.losses+excluded.losses,updated_at=now();
   return jsonb_build_object('success',true,'status','completed','reason','damage_over_time','winner_id',target_id);
 end if;
 if exists(select 1 from jsonb_each(coalesce(ab->'active_skill_effects','{}'::jsonb)) e where coalesce((e.value->>'specialSkillLocked')::boolean,false)) then raise exception 'pvp_special_skill_locked'; end if;
 hp:=greatest(0,coalesce((ab->>'hp')::numeric,0)); maxhp:=greatest(1,coalesce((ab->>'max_hp')::numeric,(ac->>'maxHp')::numeric,(ac->>'max_hp')::numeric,1));
 mp:=greatest(0,coalesce((ab->>'mp')::numeric,(ac->>'mp')::numeric,0)); maxmp:=greatest(0,coalesce((ab->>'max_mp')::numeric,(ac->>'maxMp')::numeric,(ac->>'max_mp')::numeric,0));
 atk:=greatest(1,coalesce((ab->>'attack')::numeric,(ac->>'attack')::numeric,10)); mag:=greatest(1,coalesce((ab->>'magicPower')::numeric,(ac->>'magicPower')::numeric,atk));
 select greatest(-50,least(200,coalesce(sum((value->>'magicPowerPct')::numeric),0))) into attack_reduction from jsonb_each(coalesce(ab->'active_skill_effects','{}'::jsonb));
 mag:=greatest(1,mag*(1+attack_reduction/100));
 if spec_key='wizard_elementalist' then mag:=greatest(1,mag*(1+coalesce((progress->>'elementalMastery')::numeric,0)/100)); end if;
 select greatest(-60,least(70,coalesce(max((value->>'attackReductionPct')::numeric),0)-coalesce(max((value->'effects'->>'attackPct')::numeric),0))) into attack_reduction from jsonb_each(coalesce(ab->'active_skill_effects','{}'::jsonb));
 select greatest(-60,least(70,coalesce(max((value->>'defenseReductionPct')::numeric),0)-coalesce(max((value->'effects'->>'defensePct')::numeric),0))) into defense_reduction from jsonb_each(coalesce(tb->'active_skill_effects','{}'::jsonb));
 atk:=greatest(1,atk*(1-attack_reduction/100));
 select greatest(0,least(80,coalesce(max((value->>'skillPowerReductionPct')::numeric),0))) into skill_power_reduction from jsonb_each(coalesce(ab->'active_skill_effects','{}'::jsonb));
 def:=greatest(0,coalesce((tb->>'defense')::numeric,0))*(1-defense_reduction/100); cooldowns:=coalesce(ab->'skill_cooldowns','{}'::jsonb);
 if coalesce((cooldowns->>p_skill_id)::integer,0)>m.turn_no then raise exception 'skill_on_cooldown'; end if;
 cost:=greatest(0,case when coalesce(sd->>'manaPct',sd->>'manaCostPercent',sd->>'manaCostPct') is not null then ceil(maxmp*coalesce((sd->>'manaPct')::numeric,(sd->>'manaCostPercent')::numeric,(sd->>'manaCostPct')::numeric,0)/100)::integer else ceil(coalesce((sd->>'manaCost')::numeric,0))::integer end);
 if spec_key='wizard_warlock' and coalesce((progress->>'nextSkillManaReductionPct')::numeric,0)>0 and p_skill_id<>'stolen_moment' then cost:=ceil(cost*(1-least(80,(progress->>'nextSkillManaReductionPct')::numeric)/100))::integer; end if;
 if mp<cost then raise exception 'insufficient_mana'; end if;
 mp:=mp-cost; skill_type:=coalesce(sd->>'type',''); cd:=greatest(0,coalesce((sd->>'cooldownTurns')::integer,0));
 if spec_key='wizard_arcane_mage' then
   max_charges:=5+case when coalesce(progress->'unlockedTalents','[]'::jsonb) @> '["ancient_reserve"]'::jsonb then 1 else 0 end;
   charges:=greatest(0,least(max_charges,coalesce((progress->>'charges')::integer,0)));
   if p_skill_id='arcane_singularity' then charge_cost:=charges; if charge_cost<1 then raise exception 'arcane_charges_insufficient'; end if;
   else charge_cost:=greatest(0,coalesce(nullif(sd->>'chargeCost','')::integer,0)); end if;
   if charges<charge_cost then raise exception 'arcane_charges_insufficient'; end if;
   if charge_cost>0 then progress:=jsonb_set(progress,'{charges}',to_jsonb(charges-charge_cost),true); end if;
 else charge_cost:=greatest(0,coalesce(nullif(sd->>'chargeCost','')::integer,0)); end if;
 if spec_key='wizard_warlock' and coalesce((progress->>'reversalArmed')::boolean,false) and p_skill_id<>'reversal_of_sacrifice' then
   if hp<=greatest(1,ceil(maxhp*.07)::integer) then raise exception 'warlock_sacrifice_hp_too_low'; end if;
   hp:=greatest(1,hp-ceil(maxhp*.07)::integer); ab:=jsonb_set(ab,'{hp}',to_jsonb(hp),true); progress:=jsonb_set(progress,'{reversalArmed}','false'::jsonb,true); reversal_triggered:=true;
 end if;
 if spec_key='wizard_warlock' and coalesce((progress->>'testamentActive')::boolean,false) and p_skill_id not in ('demons_testament','final_covenant') then
   charges:=least(8,coalesce((progress->>'pactDebt')::integer,0)+1); progress:=jsonb_set(progress,'{pactDebt}',to_jsonb(charges),true);
 end if;
 cooldowns:=jsonb_set(cooldowns,array[p_skill_id],to_jsonb(m.turn_no+cd+1),true);
 ab:=jsonb_set(ab,'{mp}',to_jsonb(mp),true); ab:=jsonb_set(ab,'{skill_cooldowns}',cooldowns,true);
 if skill_type in ('damage','single_damage','single_damage_debuff','single_damage_drain','single_damage_cleanse','life_steal','damage_heal','multi_target_damage','all_damage','all_damage_control','all_damage_debuff','ultimate_all_damage','all_control_damage','all_dot_control','dual_element_combo','repeat_last_spell','ultimate','area_damage','all_damage_execute','line_damage') then
   damage_pct:=greatest(1,coalesce((sd->>'damagePct')::numeric,(sd->>'damagePercent')::numeric,(sd->>'powerPct')::numeric,100));
   if skill_type='repeat_last_spell' then damage_pct:=greatest(1,coalesce((ab->>'last_damage_pct')::numeric,100)*coalesce((sd->>'repeatPct')::numeric,40)/100); end if;
   if p_skill_id='arcane_singularity' and charge_cost>0 then damage_pct:=damage_pct*(1+charge_cost*coalesce((sd->>'chargeBonusPct')::numeric,5)/100); end if;
   if reversal_triggered then damage_pct:=damage_pct*1.55; end if;
   if p_skill_id='final_covenant' then charges:=greatest(0,coalesce((progress->>'pactDebt')::integer,0)); damage_pct:=case choice_key when 'void' then 160 else 360 end*(1+least(40,floor(charges/2)*8)/100); progress:=jsonb_set(progress,'{pactDebt}','0'::jsonb,true); progress:=jsonb_set(progress,'{pactCredit}','0'::jsonb,true); end if;
   if spec_key='wizard_warlock' and coalesce((progress->>'nextSkillDamagePct')::numeric,0)>0 and p_skill_id<>'stolen_moment' then damage_pct:=damage_pct*(1+least(50,(progress->>'nextSkillDamagePct')::numeric)/100); progress:=jsonb_set(progress,'{nextSkillDamagePct}','0'::jsonb,true); progress:=jsonb_set(progress,'{nextSkillManaReductionPct}','0'::jsonb,true); end if;
   if spec_key='wizard_warlock' and coalesce((progress->>'pactDebt')::integer,0)>0 and coalesce((progress->>'testamentActive')::boolean,false) then damage_pct:=damage_pct*(1+least(8,(progress->>'pactDebt')::integer)*.03); end if;
   if p_skill_id='elemental_fusion' then combo_base:=case choice_key when 'fire_wind' then 220 when 'fire_earth' then 230 when 'water_wind' then 190 when 'water_earth' then 180 when 'lightning_wind' then 240 else 250 end; damage_pct:=combo_base*coalesce((sd->>'damagePct')::numeric,200)/200; damage_pct:=damage_pct*(1+coalesce((sd->>'comboEffectBonusPct')::numeric,0)/100); if coalesce(progress->'unlockedTalents','[]'::jsonb) @> '["eclipse"]'::jsonb and choice_key='light_dark' then damage_pct:=damage_pct*1.08; end if; if choice_key='light_dark' and coalesce(progress->'unlockedTalents','[]'::jsonb) @> '["twilight_balance"]'::jsonb then progress:=jsonb_set(progress,'{elementalMastery}',to_jsonb(coalesce((progress->>'elementalMastery')::numeric,0)+10),true); end if; end if;
   damage_pct:=damage_pct*(1-skill_power_reduction/100);
   if p_skill_id='assembly_of_souls' then charges:=greatest(0,coalesce((progress->>'souls')::integer,0)); if charges<1 then raise exception 'necromancer_no_souls'; end if; damage_pct:=greatest(12,charges*12); progress:=jsonb_set(progress,'{souls}','0'::jsonb,true); end if;
   dmg:=greatest(1,floor((case when sd->>'scalingStat'='magicPower' then mag else atk end)*damage_pct/100*100/(100+def*1.25))::integer);
   if coalesce((tb->>'evade_next')::boolean,false) then dmg:=0; tb:=jsonb_set(tb,'{evade_next}','false'::jsonb,true); end if;
   shield_state:=coalesce(tb->'shield','{}'::jsonb); shield_hp:=greatest(0,coalesce((shield_state->>'hp')::numeric,0)); shield_reduction:=greatest(0,least(80,coalesce((shield_state->>'reductionPct')::numeric,0))); reflect_pct:=greatest(0,least(80,coalesce((shield_state->>'reflectPct')::numeric,0)));
   if dmg>0 and shield_hp>0 and coalesce((shield_state->>'turns')::integer,0)>0 then dmg:=greatest(0,floor(dmg*(1-shield_reduction/100))::integer); absorbed:=least(shield_hp,dmg); shield_hp:=greatest(0,shield_hp-absorbed); dmg:=greatest(0,dmg-absorbed); shield_state:=jsonb_set(shield_state,'{hp}',to_jsonb(shield_hp),true); tb:=jsonb_set(tb,'{shield}',shield_state,true); reflect_damage:=greatest(0,floor(absorbed*reflect_pct/100)::integer); if reflect_damage>0 then hp:=greatest(0,hp-reflect_damage); ab:=jsonb_set(ab,'{hp}',to_jsonb(hp),true); end if; end if;
   target_hp:=greatest(0,coalesce((tb->>'hp')::numeric,1)-dmg); tb:=jsonb_set(tb,'{hp}',to_jsonb(target_hp),true);
   if skill_type in ('damage_heal','single_damage_drain','single_damage_cleanse','life_steal') then heal:=greatest(0,floor(dmg*coalesce((sd->>'lifeStealPct')::numeric,coalesce((sd->>'healPct')::numeric,case when skill_type in ('single_damage_drain','life_steal') then 30 else 25 end))/100)::integer); end if;
   ab:=jsonb_set(ab,'{last_damage_pct}',to_jsonb(damage_pct),true);
   if p_skill_id='arcane_bolt' then progress:=jsonb_set(progress,'{charges}',to_jsonb(least(max_charges,coalesce((progress->>'charges')::integer,0)+greatest(1,coalesce((sd->>'chargeGain')::integer,1)))),true); end if;
   if p_skill_id='death_claw' and target_hp<=0 then progress:=jsonb_set(progress,'{souls}',to_jsonb(least(99,coalesce((progress->>'souls')::integer,0)+1)),true); end if;
   if coalesce((sd->>'dotPct')::numeric,0)>0 or coalesce((sd->>'attackReductionPct')::numeric,0)>0 or coalesce((sd->>'defenseReductionPct')::numeric,0)>0 then
     target_statuses:=coalesce(tb->'active_skill_effects','{}'::jsonb);
     status_data:=jsonb_build_object('source_skill',p_skill_id,'turns',greatest(1,coalesce((sd->>'durationTurns')::integer,2)),'dotPct',greatest(0,coalesce((sd->>'dotPct')::numeric,0)),'attackReductionPct',least(60,greatest(0,coalesce((sd->>'attackReductionPct')::numeric,0))),'defenseReductionPct',least(60,greatest(0,coalesce((sd->>'defenseReductionPct')::numeric,0))),'hardControl',false);
     target_statuses:=jsonb_set(target_statuses,array[p_skill_id],status_data,true); tb:=jsonb_set(tb,'{active_skill_effects}',target_statuses,true);
   end if;
   if p_skill_id='elemental_fusion' then
     status_data:=jsonb_build_object('source_skill',p_skill_id,'turns',2,'hardControl',false,'dotPct',case when choice_key='fire_wind' then 20 else 0 end,'attackReductionPct',case when choice_key='water_earth' then 15 when choice_key in ('lightning_wind','water_wind') then 20 else 0 end,'defenseReductionPct',case when choice_key='fire_earth' then 15 else 0 end,'accuracyReductionPct',case when choice_key='water_wind' then 20 else 0 end,'skillPowerReductionPct',case when choice_key='light_dark' then 20 else 0 end);
     target_statuses:=coalesce(tb->'active_skill_effects','{}'::jsonb); target_statuses:=jsonb_set(target_statuses,array[p_skill_id],status_data,true); tb:=jsonb_set(tb,'{active_skill_effects}',target_statuses,true);
     if choice_key='light_dark' then target_mp:=greatest(0,coalesce((tb->>'mp')::numeric,0)); target_mp:=greatest(0,target_mp-ceil(coalesce((tb->>'max_mp')::numeric,target_mp)*.05)); tb:=jsonb_set(tb,'{mp}',to_jsonb(target_mp),true); end if;
   end if;
 elsif skill_type in ('self_heal','self_heal_cleanse','heal','group_heal','heal_all') then
   -- PvP ally/group healing is constrained to the acting player; a client target cannot heal the opponent.
   heal:=greatest(1,floor(mag*coalesce((sd->>'healPct')::numeric,100)/100)::integer);
 elsif skill_type='shield' then
   shield:=greatest(1,floor(mag*coalesce((sd->>'shieldPct')::numeric,100)/100)::integer);
 elsif skill_type in ('debuff','control','control_choice','choice_control','debuff_choice','true_name_debuff','link','purge') then
   -- Debuffs belong to the opponent, never to the caster. PvP control is soft only.
   target_statuses:=coalesce(tb->'active_skill_effects','{}'::jsonb);
   status_data:=jsonb_build_object('type',skill_type,'source_skill',p_skill_id,'turns',greatest(1,coalesce((sd->>'durationTurns')::integer,case when p_skill_id in ('stolen_moment','soul_domination') then 1 else 2 end)),'hardControl',false,'dotPct',greatest(0,coalesce((sd->>'dotPct')::numeric,0)),'attackReductionPct',least(60,greatest(0,case when p_skill_id='true_name_shatter' and choice_key='will' then 20 when p_skill_id='death_memory' and choice_key='war' then 20 when p_skill_id='soul_domination' and choice_key='chain' then 20 else coalesce((sd->>'attackReductionPct')::numeric,case when p_skill_id='forbidden_signature' then 8 else 0 end) end)),'defenseReductionPct',least(60,greatest(0,case when p_skill_id='true_name_shatter' and choice_key='body' then 22 when p_skill_id='death_memory' and choice_key='survival' then 20 else coalesce((sd->>'defenseReductionPct')::numeric,0) end)),'skillPowerReductionPct',case when choice_key='magic' then 25 else 0 end,'linkPct',coalesce((sd->>'linkPct')::numeric,case when p_skill_id='hostage_heart' then 22 else 0 end),'specialSkillLocked',p_skill_id='stolen_moment' or (p_skill_id='soul_domination' and choice_key='silence'));
   if p_skill_id='stolen_moment' then progress:=jsonb_set(progress,'{nextSkillDamagePct}','15'::jsonb,true); progress:=jsonb_set(progress,'{nextSkillManaReductionPct}','20'::jsonb,true); end if;
   if p_skill_id='true_name_shatter' and choice_key='bond' or p_skill_id='erasure_from_reality' then tb:=jsonb_set(tb,'{active_skill_effects}','{}'::jsonb,true); target_statuses:='{}'::jsonb; end if;
   target_statuses:=jsonb_set(target_statuses,array[p_skill_id],status_data,true); tb:=jsonb_set(tb,'{active_skill_effects}',target_statuses,true);
 elsif skill_type in ('evasion_counter','self_buff','stance','empower','legion_defense_buff','legion_offense_buff','ultimate_form','self_revive','counter','reflect_next','evasion','soul_command','ultimate_choice') then
   if p_skill_id='arcane_blink' then ab:=jsonb_set(ab,'{evade_next}','true'::jsonb,true); end if;
   if p_skill_id='return_threshold' then
     charges:=greatest(0,coalesce((progress->>'souls')::integer,0)); if charges<3 then raise exception 'necromancer_not_enough_souls_for_revive'; end if;
     if coalesce((progress->>'reviveUsedThisBattle')::boolean,false) then raise exception 'necromancer_revive_already_used'; end if;
     progress:=jsonb_set(progress,'{souls}',to_jsonb(charges-3),true); progress:=jsonb_set(progress,'{reviveUsedThisBattle}','true'::jsonb,true);
     ab:=jsonb_set(ab,'{revive_armed}','true'::jsonb,true); ab:=jsonb_set(ab,'{revive_hp_pct}',to_jsonb(greatest(1,coalesce((sd->>'reviveHealthPct')::numeric,25))),true);
   end if;
   if p_skill_id='demons_testament' then
     if coalesce((progress->>'testamentActive')::boolean,false) then charges:=greatest(0,coalesce((progress->>'pactDebt')::integer,0)); progress:=jsonb_set(progress,'{pactCredit}',to_jsonb(least(8,coalesce((progress->>'pactCredit')::integer,0)+floor(charges/2)::integer)),true); progress:=jsonb_set(progress,'{pactDebt}','0'::jsonb,true); progress:=jsonb_set(progress,'{testamentActive}','false'::jsonb,true);
     else progress:=jsonb_set(progress,'{testamentActive}','true'::jsonb,true); end if;
   end if;
   if p_skill_id='reversal_of_sacrifice' then progress:=jsonb_set(progress,'{reversalArmed}','true'::jsonb,true); end if;
   if spec_key='wizard_warlock' and coalesce((progress->>'reversalArmed')::boolean,false) and p_skill_id not in ('reversal_of_sacrifice','demons_testament') then progress:=jsonb_set(progress,'{reversalArmed}','false'::jsonb,true); end if;
   if p_skill_id='stolen_moment' then progress:=jsonb_set(progress,'{nextSkillDamagePct}','15'::jsonb,true); progress:=jsonb_set(progress,'{nextSkillManaReductionPct}','20'::jsonb,true); end if;
   if p_skill_id='eternal_sovereign' then progress:=jsonb_set(progress,'{sovereignTurns}','3'::jsonb,true); end if;
   if p_skill_id='bone_blossom' then progress:=jsonb_set(progress,'{legionBuffs}',jsonb_build_object('defensePct',20,'attackPct',0,'turns',3),true); end if;
   if p_skill_id='kingdom_of_bones' then progress:=jsonb_set(progress,'{legionBuffs}',jsonb_build_object('defensePct',0,'attackPct',20,'turns',3),true); end if;
   if p_skill_id='assembly_of_souls' then
     charges:=greatest(0,coalesce((progress->>'souls')::integer,0)); if charges<1 then raise exception 'necromancer_no_souls'; end if;
     if choice_key='protect' then shield:=greatest(1,floor(mag*charges*.24)::integer); elsif choice_key='feed' then heal:=greatest(1,floor(mag*charges*.12)::integer); end if; progress:=jsonb_set(progress,'{souls}','0'::jsonb,true);
   end if;
   if p_skill_id='final_covenant' and choice_key='dominion' then heal:=greatest(1,floor((maxhp-hp)*.18)::integer); end if;
   if p_skill_id='final_covenant' and choice_key in ('annihilation','void') then
     charges:=greatest(0,coalesce((progress->>'pactDebt')::integer,0));
     dmg:=greatest(1,floor(mag*(case choice_key when 'annihilation' then 3.6 else 1.6 end)*(1+least(40,floor(charges/2)*8)/100)*100/(100+def*1.25))::integer); progress:=jsonb_set(progress,'{pactDebt}','0'::jsonb,true); progress:=jsonb_set(progress,'{pactCredit}','0'::jsonb,true); target_hp:=greatest(0,coalesce((tb->>'hp')::numeric,1)-dmg); tb:=jsonb_set(tb,'{hp}',to_jsonb(target_hp),true);
   end if;
   if p_skill_id='assembly_of_souls' and choice_key='hunt' then
     dmg:=greatest(1,floor(mag*charges*.12*100/(100+def*1.25))::integer); target_hp:=greatest(0,coalesce((tb->>'hp')::numeric,1)-dmg); tb:=jsonb_set(tb,'{hp}',to_jsonb(target_hp),true);
   end if;
   if p_skill_id='darkness_chains' then
     target_mp:=greatest(0,coalesce((tb->>'mp')::numeric,0)); charges:=least(target_mp,greatest(1,ceil(coalesce((tb->>'max_mp')::numeric,target_mp)*coalesce((sd->>'manaDrainPct')::numeric,5)/100)::integer)); target_mp:=greatest(0,target_mp-charges); tb:=jsonb_set(tb,'{mp}',to_jsonb(target_mp),true);
   end if;
   if spec_key='wizard_necromancer' and coalesce((progress->>'sovereignTurns')::integer,0)>0 then dmg:=floor(dmg*1.2)::integer; end if;
   ab:=jsonb_set(coalesce(ab,'{}'::jsonb),array['active_skill_effects',p_skill_id],jsonb_build_object('type',skill_type,'turns',greatest(1,coalesce((sd->>'durationTurns')::integer,2)),'hardControl',false,'effects',coalesce(sd->'effects','{}'::jsonb),'magicPowerPct',coalesce((sd->>'magicPowerPct')::numeric,0),'damageReductionPct',coalesce((sd->>'damageReductionPct')::numeric,0),'reflectPct',coalesce((sd->>'reflectPct')::numeric,0)),true);
 elsif skill_type in ('summon','summon_resource') then
   summon_data:=coalesce(ab->'summons','[]'::jsonb);
   if jsonb_array_length(summon_data)>=1 then raise exception 'pvp_summon_capacity_reached'; end if;
   summon_data:=summon_data||jsonb_build_array(jsonb_build_object('id',p_skill_id||'_summon','sourceSkill',p_skill_id,'hp',greatest(1,floor(maxhp*coalesce((sd->>'summonHpPct')::numeric,35)/100)::integer),'attack',greatest(1,floor(atk*coalesce((sd->>'summonDamagePct')::numeric,50)/100)::integer),'turns',greatest(1,coalesce((sd->>'durationTurns')::integer,2))));
   ab:=jsonb_set(ab,'{summons}',summon_data,true);
 elsif skill_type='permanent_recruit' then raise exception 'pvp_skill_not_applicable';
 else raise exception 'unsupported_pvp_skill_type'; end if;
 if heal>0 then ab:=jsonb_set(ab,'{hp}',to_jsonb(least(maxhp,hp+heal)),true); end if;
 if p_skill_id='final_covenant' and choice_key='dominion' then target_statuses:=coalesce(tb->'active_skill_effects','{}'::jsonb); target_statuses:=jsonb_set(target_statuses,'{final_covenant}',jsonb_build_object('turns',2,'attackReductionPct',18,'hardControl',false),true); tb:=jsonb_set(tb,'{active_skill_effects}',target_statuses,true); end if;
 if shield>0 then ab:=jsonb_set(ab,'{shield}',jsonb_build_object('hp',shield,'turns',greatest(1,coalesce((sd->>'durationTurns')::integer,2)),'reductionPct',least(80,greatest(0,coalesce((sd->>'damageReductionPct')::numeric,0))),'reflectPct',least(80,greatest(0,coalesce((sd->>'reflectPct')::numeric,0)))),true); end if;
 if coalesce((ab->>'hp')::numeric,hp)<=0 and coalesce((ab->>'revive_armed')::boolean,false) then hp:=greatest(1,ceil(maxhp*greatest(1,least(100,coalesce((ab->>'revive_hp_pct')::numeric,25)))/100)); ab:=jsonb_set(ab,'{hp}',to_jsonb(hp),true); ab:=jsonb_set(ab,'{revive_armed}','false'::jsonb,true); ab:=jsonb_set(ab,'{revive_consumed}','true'::jsonb,true); end if;
 ab:=jsonb_set(ab,'{class_progress}',jsonb_set(coalesce(ab->'class_progress','{}'::jsonb),array[progress_key],progress,true),true);
 if coalesce((tb->>'hp')::numeric,1)<=0 and coalesce((tb->>'revive_armed')::boolean,false) then
   target_maxhp:=greatest(1,coalesce((tb->>'max_hp')::numeric,1)); target_hp:=greatest(1,ceil(target_maxhp*greatest(1,least(100,coalesce((tb->>'revive_hp_pct')::numeric,25)))/100));
   tb:=jsonb_set(tb,'{hp}',to_jsonb(target_hp),true); tb:=jsonb_set(tb,'{revive_armed}','false'::jsonb,true); tb:=jsonb_set(tb,'{revive_consumed}','true'::jsonb,true);
 end if;
 actor:=jsonb_set(actor,'{battle}',ab,true); target:=jsonb_set(target,'{battle}',tb,true);
 if dmg>0 then if actor_key='player_a' then update public.pvp_matches set score_a=score_a+dmg where id=p_match; else update public.pvp_matches set score_b=score_b+dmg where id=p_match; end if; end if;
 if actor_key='player_a' then s:=jsonb_set(s,'{player_a}',actor,true); s:=jsonb_set(s,'{player_b}',target,true); else s:=jsonb_set(s,'{player_b}',actor,true); s:=jsonb_set(s,'{player_a}',target,true); end if;
 log_entry:=jsonb_build_object('type','skill','skill_id',p_skill_id,'text',coalesce(sd->>'name_fa',sd->>'name',p_skill_id),'damage',dmg,'heal',heal,'shield',shield,'reflected',reflect_damage,'at',now());
 s:=jsonb_set(s,'{log}',coalesce(s->'log','[]'::jsonb)||jsonb_build_array(log_entry),true);
 if coalesce((ab->>'hp')::numeric,1)<=0 and coalesce((tb->>'hp')::numeric,1)>0 then
   update public.pvp_matches set combat_state=s,status='completed',winner_id=target_id,completed_at=now(),updated_at=now(),last_action_at=now(),turn_no=turn_no+1,turn_player=null where id=p_match;
   insert into public.pvp_player_stats(user_id,wins,losses,draws) values(target_id,1,0,0),(actor_id,0,1,0) on conflict(user_id) do update set wins=public.pvp_player_stats.wins+excluded.wins,losses=public.pvp_player_stats.losses+excluded.losses,updated_at=now();
   return jsonb_build_object('success',true,'status','completed','reason','reflected_damage','winner_id',target_id,'damage',dmg,'reflected',reflect_damage);
 end if;
 if coalesce((tb->>'hp')::numeric,1)<=0 then
   update public.pvp_matches set combat_state=s,status='completed',winner_id=uid,completed_at=now(),updated_at=now(),last_action_at=now(),turn_no=turn_no+1,turn_player=null where id=p_match;
   insert into public.pvp_player_stats(user_id,wins,losses,draws) values(actor_id,1,0,0),(target_id,0,1,0) on conflict(user_id) do update set wins=public.pvp_player_stats.wins+excluded.wins,losses=public.pvp_player_stats.losses+excluded.losses,updated_at=now();
   return jsonb_build_object('success',true,'status','completed','skill_id',p_skill_id,'damage',dmg,'heal',heal,'shield',shield,'reflected',reflect_damage);
 end if;
 next_player:=target_id;
 update public.pvp_matches set combat_state=s,turn_player=next_player,turn_no=turn_no+1,updated_at=now(),last_action_at=now() where id=p_match;
 return jsonb_build_object('success',true,'status','active','skill_id',p_skill_id,'damage',dmg,'heal',heal,'shield',shield,'reflected',reflect_damage,'turn_player',next_player,'turn_no',m.turn_no+1);
end; $$;
revoke all on function public.etranom_pvp_skill_action(uuid,text,uuid,text) from public,anon;
grant execute on function public.etranom_pvp_skill_action(uuid,text,uuid,text) to authenticated;

-- Preserve attack/guard compatibility and advance server-side PvP timers and defenses.
CREATE OR REPLACE FUNCTION public.etranom_pvp_action(p_match uuid, p_action text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  actor_effects jsonb; effect_row record; effect_key text; effect_json jsonb; actor_maxhp numeric; dot_damage integer:=0;
  shield_state jsonb; shield_hp numeric; shield_reduction numeric:=0; absorbed numeric:=0; reflect_pct numeric:=0; reflect_damage integer:=0; attack_reduction numeric:=0; defense_reduction numeric:=0;
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

  -- Advance actor-owned DOT/status/shield/summon timers once at the start of this turn.
  actor_effects := coalesce(actor_battle->'active_skill_effects','{}'::jsonb);
  hp := greatest(0,coalesce((actor_battle->>'hp')::numeric,0));
  actor_maxhp := greatest(1,coalesce((actor_battle->>'max_hp')::numeric,(actor_char->>'maxHp')::numeric,(actor_char->>'max_hp')::numeric,1));
  for effect_row in select key,value from jsonb_each(actor_effects) loop
    effect_key:=effect_row.key; effect_json:=effect_row.value;
    if greatest(0,coalesce((effect_json->>'turns')::integer,0))<=0 then actor_effects:=actor_effects-effect_key;
    else
      if greatest(0,coalesce((effect_json->>'dotPct')::numeric,0))>0 and hp>0 then
        dot_damage:=least(hp,greatest(1,floor(actor_maxhp*least(50,(effect_json->>'dotPct')::numeric)/100)::integer)); hp:=greatest(0,hp-dot_damage);
      end if;
      effect_json:=jsonb_set(effect_json,'{turns}',to_jsonb(greatest(0,(effect_json->>'turns')::integer-1)),true);
      if coalesce((effect_json->>'turns')::integer,0)<=0 then actor_effects:=actor_effects-effect_key; else actor_effects:=jsonb_set(actor_effects,array[effect_key],effect_json,true); end if;
    end if;
  end loop;
  actor_battle:=jsonb_set(actor_battle,'{active_skill_effects}',actor_effects,true);
  actor_battle:=jsonb_set(actor_battle,'{hp}',to_jsonb(hp),true);
  if jsonb_typeof(actor_battle->'shield')='object' then
    shield_state:=actor_battle->'shield';
    shield_state:=jsonb_set(shield_state,'{turns}',to_jsonb(greatest(0,coalesce((shield_state->>'turns')::integer,0)-1)),true);
    actor_battle:=case when coalesce((shield_state->>'turns')::integer,0)<=0 then actor_battle-'shield' else jsonb_set(actor_battle,'{shield}',shield_state,true) end;
  end if;
  if jsonb_typeof(actor_battle->'summons')='array' then
    actor_effects:='[]'::jsonb;
    for effect_row in select value from jsonb_array_elements(actor_battle->'summons') loop
      effect_json:=jsonb_set(effect_row.value,'{turns}',to_jsonb(greatest(0,coalesce((effect_row.value->>'turns')::integer,0)-1)),true);
      if coalesce((effect_json->>'turns')::integer,0)>0 and coalesce((effect_json->>'hp')::integer,0)>0 then actor_effects:=actor_effects||jsonb_build_array(effect_json); end if;
    end loop;
    actor_battle:=jsonb_set(actor_battle,'{summons}',actor_effects,true);
  end if;
  if hp<=0 and coalesce((actor_battle->>'revive_armed')::boolean,false) then
    hp:=greatest(1,ceil(actor_maxhp*greatest(1,least(100,coalesce((actor_battle->>'revive_hp_pct')::numeric,25)))/100));
    actor_battle:=jsonb_set(actor_battle,'{hp}',to_jsonb(hp),true); actor_battle:=jsonb_set(actor_battle,'{revive_armed}','false'::jsonb,true); actor_battle:=jsonb_set(actor_battle,'{revive_consumed}','true'::jsonb,true);
  end if;
  if hp<=0 then
    actor:=jsonb_set(actor,'{battle}',actor_battle,true);
    if actor_key='player_a' then s:=jsonb_set(s,'{player_a}',actor,true); else s:=jsonb_set(s,'{player_b}',actor,true); end if;
    update public.pvp_matches set combat_state=s,status='completed',winner_id=target_id,completed_at=now_at,updated_at=now_at,last_action_at=now_at,turn_no=turn_no+1,turn_player=null where id=p_match;
    insert into public.pvp_player_stats(user_id,wins,losses,draws) values(target_id,1,0,0),(actor_id,0,1,0) on conflict(user_id) do update set wins=public.pvp_player_stats.wins+excluded.wins,losses=public.pvp_player_stats.losses+excluded.losses,updated_at=now_at;
    return jsonb_build_object('success',true,'status','completed','reason','damage_over_time','winner_id',target_id);
  end if;

  if p_action = 'guard' then
    actor_battle := jsonb_set(actor_battle,'{guard_next}','true'::jsonb,true);
    log_text := coalesce(actor->>'name','بازیکن') || ' حالت دفاعی گرفت.';
  else
    guarded := coalesce((target_battle->>'guard_next')::boolean,false);
    select greatest(-60,least(70,coalesce(max((value->>'attackReductionPct')::numeric),0)-coalesce(max((value->'effects'->>'attackPct')::numeric),0))) into attack_reduction from jsonb_each(coalesce(actor_battle->'active_skill_effects','{}'::jsonb));
    select greatest(0,least(80,coalesce(max((value->>'defenseReductionPct')::numeric),0))) into defense_reduction from jsonb_each(coalesce(target_battle->'active_skill_effects','{}'::jsonb));
    raw_damage := greatest(1,coalesce((public.etranom_combat_resolve_damage(
      greatest(1,coalesce((actor_battle->>'attack')::numeric,10)*(1-attack_reduction/100)),
      greatest(0,coalesce((target_battle->>'defense')::numeric,0)*(1-defense_reduction/100)),
      1,0,3,random(),0.35,case when guarded then 0.5 else 1 end,1,
      100,0,0,100,1.5)->>'damage')::integer,0));
    damage := raw_damage;
    if coalesce((target_battle->>'evade_next')::boolean,false) then damage:=0; target_battle:=jsonb_set(target_battle,'{evade_next}','false'::jsonb,true); end if;
    shield_state:=coalesce(target_battle->'shield','{}'::jsonb);
    shield_hp:=greatest(0,coalesce((shield_state->>'hp')::numeric,0));
    shield_reduction:=greatest(0,least(80,coalesce((shield_state->>'reductionPct')::numeric,0)));
    reflect_pct:=greatest(0,least(80,coalesce((shield_state->>'reflectPct')::numeric,0)));
    if damage>0 and shield_hp>0 and coalesce((shield_state->>'turns')::integer,0)>0 then
      damage:=greatest(0,floor(damage*(1-shield_reduction/100))::integer);
      absorbed:=least(shield_hp,damage); shield_hp:=greatest(0,shield_hp-absorbed); damage:=greatest(0,damage-absorbed);
      shield_state:=jsonb_set(shield_state,'{hp}',to_jsonb(shield_hp),true);
      target_battle:=jsonb_set(target_battle,'{shield}',shield_state,true);
      reflect_damage:=greatest(0,floor(absorbed*reflect_pct/100)::integer);
      if reflect_damage>0 then actor_battle:=jsonb_set(actor_battle,'{hp}',to_jsonb(greatest(0,coalesce((actor_battle->>'hp')::numeric,1)-reflect_damage)),true); end if;
    end if;
    target_hp := greatest(0,coalesce((target_battle->>'hp')::numeric,1)-damage);
    target_max_hp:=greatest(1,coalesce((target_battle->>'max_hp')::numeric,1));
    if target_hp<=0 and coalesce((target_battle->>'revive_armed')::boolean,false) then
      target_hp:=greatest(1,ceil(target_max_hp*greatest(1,least(100,coalesce((target_battle->>'revive_hp_pct')::numeric,25)))/100));
      target_battle:=jsonb_set(target_battle,'{revive_armed}','false'::jsonb,true);
      target_battle:=jsonb_set(target_battle,'{revive_consumed}','true'::jsonb,true);
    end if;
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
  s := jsonb_set(s,'{log}',coalesce(s->'log','[]'::jsonb) || jsonb_build_array(jsonb_build_object('type',p_action,'text',log_text,'damage',damage,'reflected',reflect_damage,'at',now_at)),true);
  s := jsonb_set(s,'{round}',to_jsonb(greatest(1,ceil((m.turn_no+1)::numeric/2)::integer)),true);

  if coalesce((actor_battle->>'hp')::numeric,1)<=0 and coalesce((target_battle->>'hp')::numeric,1)>0 then
    winner:=target_id;
    update public.pvp_matches set combat_state=s,status='completed',winner_id=winner,completed_at=now_at,updated_at=now_at,last_action_at=now_at,turn_no=turn_no+1,turn_player=null where id=p_match;
    insert into public.pvp_player_stats(user_id,wins,losses,draws) values(target_id,1,0,0),(actor_id,0,1,0) on conflict(user_id) do update set wins=public.pvp_player_stats.wins+excluded.wins,losses=public.pvp_player_stats.losses+excluded.losses,updated_at=now_at;
    return jsonb_build_object('success',true,'status','completed','winner_id',winner,'reason','reflected_damage','damage',damage,'reflected',reflect_damage);
  end if;
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
$function$

revoke all on function public.etranom_pvp_action(uuid,text) from public,anon;
grant execute on function public.etranom_pvp_action(uuid,text) to authenticated;

commit;
