import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSharedSkillCatalog, listAvailableSharedSkills, normalizeSharedSpecializationId } from '../../systems/combat/shared-skill-runtime.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sql = fs.readFileSync(path.join(root, 'database/ETRANOM_V1954_WARRIOR_PVP_COMPLETE.sql'), 'utf8');
const ui = fs.readFileSync(path.join(root, 'systems/pvp/pvp-ui.js'), 'utf8');

test('V1954 exposes all four Warrior PvP specialization catalogs', async () => {
  const catalog = await loadSharedSkillCatalog();
  const warrior = catalog.specializations.filter(x => x.class_id === 'warrior');
  assert.equal(warrior.length, 4);
  assert.deepEqual(warrior.map(x => x.skills.length), [10,10,10,10]);
  assert.deepEqual(warrior.map(x => x.ascendedSkills.length), [10,10,10,10]);
});

test('V1954 normalizes all canonical Warrior progression keys and aliases', () => {
  assert.equal(normalizeSharedSpecializationId('warrior_1'), 'warrior_sword_ascetic');
  assert.equal(normalizeSharedSpecializationId('warrior_2'), 'warrior_iron_bastion');
  assert.equal(normalizeSharedSpecializationId('warrior_3'), 'warrior_chaos_warrior');
  assert.equal(normalizeSharedSpecializationId('warrior_chaos'), 'warrior_chaos_warrior');
  assert.equal(normalizeSharedSpecializationId('warrior_4'), 'warrior_apocalypse_harbinger');
});

test('V1954 lists owned Warrior skills from the correct specialization', async () => {
  const catalog = await loadSharedSkillCatalog();
  const rows = listAvailableSharedSkills(catalog, {
    classId: 'warrior', specializationId: 'warrior_chaos', level: 50,
    ownedSkillIds: ['primal_fury','chaos_fangs','undefined_end']
  });
  assert.deepEqual(rows.map(x => x.id).sort(), ['chaos_fangs','primal_fury','undefined_end']);
});

test('PvP UI renders Warrior stamina and Domain/Ascension controls', () => {
  assert.match(ui, /هزینه از استقامت/);
  assert.match(ui, /data-pvp-warrior-domain/);
  assert.match(ui, /data-pvp-warrior-ascension/);
  assert.match(ui, /select:/);
});

test('PvP RPC locks the authoritative save row before reading Warrior stamina', () => {
  assert.match(sql, /FROM public\.game_saves WHERE user_id=actor_id FOR UPDATE/i);
  assert.match(sql, /live_character:=coalesce\(live_save_data->'character'/i);
  assert.match(sql, /save_data=jsonb_set\(coalesce\(live_save_data/i);
  assert.match(sql, /warrior_chaos_warrior' then 'warrior_chaos'/);
});

test('PvP RPC supports server-side Domain activation and one selected Ascension', () => {
  assert.match(sql, /p_skill_id='warrior_domain'/);
  assert.match(sql, /warrior_ascension_already_used/);
  assert.match(sql, /asc_silent_finale/);
  assert.match(sql, /worlds_end_ascended/);
  assert.match(sql, /etranom_pvp_tick_warrior_domain/);
});

test('PvP RPC contains dedicated multi-hit, guard, reflect, and mark mechanics', () => {
  assert.match(sql, /IF skill_type='multi_hit' THEN/i);
  assert.match(sql, /FOR hit_index IN 1\.\.hit_count LOOP/i);
  assert.match(sql, /skill_type='team_guard'/);
  assert.match(sql, /skill_type in \('counter','reflect_next'\)/);
  assert.match(sql, /'{end_mark}'/);
});

test('V1954 preserves authenticated/service-role grants and excludes anon', () => {
  assert.match(sql, /REVOKE ALL ON FUNCTION public\.etranom_pvp_skill_action\(uuid,text,uuid,text\) FROM PUBLIC, anon/i);
  assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.etranom_pvp_skill_action\(uuid,text,uuid,text\) TO authenticated, service_role/i);
  assert.equal((sql.match(/\$function\$/g)||[]).length % 2, 0);
});

test('V1954 restricts Ascension selections to the current specialization and owned base skill', () => {
  assert.match(sql, /warrior_sword_ascetic' and selected_asc not in/);
  assert.match(sql, /warrior_iron_bastion' and selected_asc not in/);
  assert.match(sql, /warrior_chaos_warrior' and selected_asc not in/);
  assert.match(sql, /warrior_apocalypse_harbinger' and selected_asc not in/);
  assert.match(sql, /skill_not_owned/);
  assert.match(sql, /warrior_ascension_not_castable/);
});

test('V1954 enables only the newly supported Echo handler and preserves passive Incompatible Vessel as disabled', () => {
  assert.match(sql, /UPDATE public\.party_battle_skill_catalog[\s\S]*SET enabled=true[\s\S]*specialization_key='warrior_sword_ascetic'[\s\S]*skill_id='echo'/i);
  assert.match(sql, /passive Incompatible Vessel remains disabled/i);
  assert.match(ui, /x\.type!=='passive'/);
});

test('V1954 post-apply verification is read-only', () => {
  const verify = fs.readFileSync(path.join(root, 'database/ETRANOM_V1954_POST_APPLY_VERIFY_READONLY.sql'), 'utf8');
  assert.match(verify, /SELECT p\.proname/i);
  assert.doesNotMatch(verify, /\b(INSERT|UPDATE|DELETE|ALTER|DROP|CREATE)\b/i);
});
