import test from 'node:test';
import assert from 'node:assert/strict';
import { ARCANE_MAGE } from '../systems/classes/arcane-mage.js';
import { ELEMENTALIST } from '../systems/classes/elementalist.js';
import { WARLOCK } from '../systems/classes/warlock.js';
import { NECROMANCER } from '../systems/classes/necromancer.js';
import { loadSharedSkillCatalog, listAvailableSharedSkills } from '../systems/combat/shared-skill-runtime.js';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const sql = await readFile(new URL('../database/ETRANOM_V1921_WIZARD_PVP_LIVE_BRIDGE.sql', import.meta.url), 'utf8');
const partyPatch = await readFile(new URL('../database/wizard_party_shared_mechanics_v1921.sql', import.meta.url), 'utf8');
const pvpUi = await readFile(new URL('../systems/pvp/pvp-ui.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const partyRpc = await readFile(new URL('../database/reference/etranom_party_battle_act_live_snapshot_v1921.sql', import.meta.url), 'utf8');
const pvpActionRpc = await readFile(new URL('../database/reference/etranom_pvp_action_live_snapshot_v1921.sql', import.meta.url), 'utf8');
const specs = [ARCANE_MAGE, ELEMENTALIST, WARLOCK, NECROMANCER];
const allSkills = specs.flatMap(s => s.skills);

test('all four Wizard specializations expose exactly 40 unique skills', () => {
  assert.equal(specs.length, 4);
  assert.deepEqual(specs.map(s => s.skills.length), [10,10,10,10]);
  assert.equal(new Set(allSkills.map(s => s.id)).size, 40);
});

test('shared skill catalog loader exists and the PvP module imports cleanly', async () => {
  const catalog = await loadSharedSkillCatalog();
  assert.equal(catalog.schema, 'etranom.shared.skill.catalog.v1');
  assert.equal(catalog.specializations.filter(x => x.class_id === 'wizard').length, 4);
  assert.equal(catalog.specializations.filter(x => x.class_id === 'warrior').length, 4);
  const rows = listAvailableSharedSkills(catalog, {classId:'wizard', specializationId:'wizard_arcane_mage', level:50, ownedSkillIds:['arcane_bolt','arcane_shield']});
  assert.deepEqual(rows.map(x => x.id).sort(), ['arcane_bolt','arcane_shield']);
  assert.match(pvpUi, /loadSharedSkillCatalog, listAvailableSharedSkills/);
  assert.doesNotMatch(pvpUi, /specialization_id===spec\)/);
});


test('Supabase Party RPC snapshot already routes Wizard skills through the trusted 40-skill catalog', () => {
  assert.match(partyRpc, /from public\.party_battle_skill_catalog/);
  assert.match(partyRpc, /specialization_key=v_spec_key and skill_id=v_skill_id and enabled/);
  assert.match(partyRpc, /classProgress/);
  assert.match(partyRpc, /partyBattleSessionId/);
  assert.match(partyRpc, /wizard_necromancer/);
  assert.match(partyRpc, /wizard_warlock/);
  assert.match(partyRpc, /permanent_recruit/);
  assert.match(sql, /v1921_party_declare_anchor_missing/);
  assert.match(sql, /v1921_party_choice_validation_anchor_missing/);
  assert.match(sql, /v1921_party_arcane_cost_anchor_missing/);
  assert.match(sql, /v1921_party_skill_pct_anchor_missing/);
  for (const anchor of [
    'v_ally_profile jsonb;',
    "v_wizard_progress:=jsonb_set(v_wizard_progress,'{sovereignTurns}','0'::jsonb,true);",
    "when 'soul_domination' then 'chain' else null end;",
    "if level_no < coalesce((v_skill->>'unlockLevel')::integer,1) then raise exception 'party_skill_locked'; end if;",
    'v_skill_pct:=coalesce(',
    'v_skill_damage>0 then profile:=jsonb_set(profile',
    "v_target_monster:=jsonb_set(target_row.x,'{hp}'"
  ]) assert.ok(partyRpc.includes(anchor), `Live Party RPC anchor missing: ${anchor}`);
  assert.match(sql, /progress_key:=case when spec_key='wizard_arcane_mage' then 'arcaneMage'/);
});

test('PvP RPC uses the canonical Wizard Party catalog and server-side authorization', () => {
  assert.match(sql, /create or replace function public\.etranom_pvp_skill_action\(p_match uuid,p_skill_id text,p_target_id uuid default null,p_choice text default null\)/i);
  assert.match(sql, /from public\.party_battle_skill_catalog where specialization_key=spec_key and skill_id=p_skill_id and enabled/i);
  assert.match(sql, /auth\.uid\(\)/i);
  assert.match(sql, /for update/i);
  assert.match(sql, /m\.turn_player<>uid/i);
  assert.match(sql, /skill_not_owned/i);
  assert.match(sql, /skill_on_cooldown/i);
  assert.match(sql, /insufficient_mana/i);
  assert.match(sql, /pvp_hard_control|hardControl',false/i);
  assert.match(sql, /pvp_skill_not_applicable/i);
});

test('PvP migration handles first-action initialization, rank upgrades and Wizard mechanics', () => {
  for (const pattern of [
    /First action may be a skill/i,
    /skill_rank_step/i,
    /charge_cost/i,
    /arcane_blink/i,
    /arcane_bolt/i,
    /demons_testament/i,
    /reversal_of_sacrifice/i,
    /final_covenant/i,
    /death_claw/i,
    /return_threshold/i,
    /eternal_sovereign/i,
    /active_skill_effects/i,
    /revive_armed/i
  ]) assert.match(sql, pattern);
});

test('legacy PvP attack/guard RPC remains available and processes DOT, shield, evasion and revive', () => {
  assert.match(sql, /create or replace function public\.etranom_pvp_action\(p_match uuid, p_action text\)/i);
  for (const pattern of [/damage_over_time/i,/evade_next/i,/shield_hp/i,/revive_armed/i,/guard_next/i]) assert.match(sql, pattern);
  assert.match(sql, /grant execute on function public\.etranom_pvp_action\(uuid,text\) to authenticated/i);
});


test('Party RPC hotfix is fail-closed and wires Arcane charges, Elementalist combos, rank upgrades and Arcane save compatibility', () => {
  assert.match(partyPatch, /pg_get_functiondef\(v_oid\)/);
  assert.match(partyPatch, /v1921_party_declare_anchor_missing/);
  assert.match(partyPatch, /arcaneMage/);
  assert.match(partyPatch, /unlockedTalents/);
  assert.match(partyPatch, /charges/);
  assert.match(partyPatch, /arcane_singularity/);
  assert.match(partyPatch, /arcane_bolt/);
  assert.match(partyPatch, /elemental_fusion/);
  assert.match(partyPatch, /fire_wind/);
  assert.match(partyPatch, /light_dark/);
  assert.match(partyPatch, /skillRanks/);
  assert.match(partyPatch, /v_upgrade_pair/);
});

test('every current Wizard skill type is supported or deliberately blocked for PvP', () => {
  const supported = new Set([
    'single_damage','shield','all_damage','evasion_counter','all_control_damage','multi_target_damage',
    'repeat_last_spell','all_dot_control','self_buff','ultimate_all_damage','all_damage_control',
    'all_damage_debuff','self_heal_cleanse','single_damage_cleanse','single_damage_drain','dual_element_combo',
    'control','stance','empower','choice_control','link','purge','summon_resource','true_name_debuff',
    'ultimate_choice','damage','permanent_recruit','debuff_choice','legion_defense_buff','soul_command',
    'life_steal','legion_offense_buff','self_revive','control_choice','ultimate_form'
  ]);
  for (const skill of allSkills) assert.ok(supported.has(skill.type), `${skill.id}: ${skill.type}`);
  assert.match(sql, /skill_type='permanent_recruit' then raise exception 'pvp_skill_not_applicable'/);
});

test('PvP UI forwards explicit choices without accepting client combat values', () => {
  assert.match(html, /pvpSkillAction:async\(id,skillId,choice=null,requestId=createCombatRequestId\(\)\)/);
  assert.match(html, /p_choice:choice/);
  assert.match(html, /pvp-ui\.js\?v=1972/);
  assert.doesNotMatch(html.match(/pvpSkillAction:async\(id,skillId,choice=null\)=>\{[\s\S]*?\},/)?.[0]||'', /damage|heal|mana|hp:/i);
  for (const id of ['court_of_nameless','true_name_shatter','final_covenant','assembly_of_souls','death_memory','soul_domination','elemental_fusion']) assert.match(pvpUi, new RegExp(id));
  assert.match(pvpUi, /data-pvp-choice/);
  assert.match(pvpUi, /performSkill\(skillId,choice=null\)/);
  assert.match(pvpUi, /classProgress\?\.arcaneMage/);
});

test('PvP skill damage honors evade-next and shield reflection before finalizing victory', () => {
  assert.match(sql, /if coalesce\(\(tb->>'evade_next'\)::boolean,false\) then dmg:=0/);
  assert.match(sql, /reflect_pct:=greatest\(0,least\(80/);
  assert.match(sql, /reflect_damage:=greatest\(0,floor\(absorbed\*reflect_pct\/100\)::integer\)/);
  assert.match(sql, /reason','reflected_damage'/);
});


test('Arcane PvP treats chargeCost=all as a server-side full-charge spend and respects the 5/6 cap', () => {
  assert.match(sql, /if p_skill_id='arcane_singularity' then charge_cost:=charges/);
  assert.match(sql, /max_charges:=5\+case when[\s\S]*ancient_reserve[\s\S]*then 1 else 0 end/);
  assert.match(sql, /least\(max_charges,coalesce\(\(progress->>'charges'\)::integer,0\)\+greatest\(1,coalesce\(\(sd->>'chargeGain'\)::integer,1\)\)\)/);
  assert.match(sql, /charge_cost\*coalesce\(\(sd->>'chargeBonusPct'\)::numeric,5\)\/100/);
});


test('live RPC fingerprints match the uploaded Supabase exports and abort safely on drift', () => {
  assert.match(sql, /party_fingerprint <> '358438d29c1cc29e80d7cccc4c5990d2'/);
  assert.match(sql, /pvp_fingerprint <> '52c2c1a04eed2d85fac4a29af28fec2a'/);
  assert.match(sql, /v1921_party_rpc_fingerprint_mismatch/);
  assert.match(sql, /v1921_pvp_action_fingerprint_mismatch/);
  assert.match(sql, /begin;[\s\S]*commit;/);
});


test('Party and PvP Arcane charges both enforce the 5/6 cap', () => {
  assert.match(partyPatch, /v_arcane_charges:=greatest\(0,least\(v_arcane_max_charges/);
  assert.match(sql, /v_arcane_charges:=greatest\(0,least\(v_arcane_max_charges/);
  assert.match(sql, /max_charges:=5\+case when[\s\S]*ancient_reserve/);
});


test('uploaded Supabase RPC source snapshots match the guarded fingerprints', () => {
  const md5 = value => createHash('md5').update(value).digest('hex');
  assert.equal(md5(partyRpc), '358438d29c1cc29e80d7cccc4c5990d2');
  assert.equal(md5(pvpActionRpc), '52c2c1a04eed2d85fac4a29af28fec2a');
  assert.match(sql, /party_fingerprint <> '358438d29c1cc29e80d7cccc4c5990d2'/);
  assert.match(sql, /pvp_fingerprint <> '52c2c1a04eed2d85fac4a29af28fec2a'/);
});

test('Elementalist secondary combo effects are represented in Party and PvP', () => {
  assert.match(partyPatch, /water_wind.*light_dark/);
  assert.match(sql, /skill_power_reduction numeric/);
  assert.match(sql, /damage_pct:=damage_pct\*\(1-skill_power_reduction\/100\)/);
  assert.match(sql, /attackReductionPct',case when choice_key='water_earth' then 15 when choice_key in \('lightning_wind','water_wind'\) then 20/);
  assert.match(sql, /twilight_balance/);
});
