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
