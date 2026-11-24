import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { prepareCombatActionV1967, dispatchCombatActionV1967, resolveCombatDamageV1967, CENTRAL_COMBAT_RUNTIME_VERSION_V1967 } from '../../systems/combat/central-combat-runtime-v1967.js';

const root = new URL('../../', import.meta.url);
const readJson = path => JSON.parse(fs.readFileSync(new URL(path, root), 'utf8'));

test('central gateway exposes the expected version and all three combat modes', () => {
  assert.equal(CENTRAL_COMBAT_RUNTIME_VERSION_V1967, '1967.0.0');
  assert.equal(prepareCombatActionV1967('solo', { action: 'attack' }).action, 'attack');
  assert.equal(prepareCombatActionV1967('party', { action: 'skill:fire_bolt|empowered' }).skillId, 'fire_bolt');
  assert.equal(prepareCombatActionV1967('party', { action: 'potion' }).action, 'item');
  assert.equal(prepareCombatActionV1967('pvp', { action: 'guard' }).action, 'guard');
});

test('mode policies reject actions that are not enabled for that mode', () => {
  assert.throws(() => prepareCombatActionV1967('pvp', { action: 'item' }), /combat_action_not_supported/);
  assert.throws(() => prepareCombatActionV1967('solo', { action: 'heal' }), /combat_action_not_supported/);
  assert.throws(() => prepareCombatActionV1967('party', { action: 'skill:../bad' }), /Invalid skill identifier/);
});

test('PvP skill dispatch is allowed only through an explicitly server-validated executor', async () => {
  await assert.rejects(() => dispatchCombatActionV1967({ mode: 'pvp', intent: { action: 'skill', skillId: 'fire_bolt' }, execute: async () => true }), /combat_action_not_supported/);
  let called = 0;
  const result = await dispatchCombatActionV1967({ mode: 'pvp', intent: { action: 'skill', skillId: 'fire_bolt', choice: 'empowered' }, serverValidatedSkill: true, context: { matchId: 'm1' }, execute: async command => { called++; return { action: command.action, skillId: command.skillId, matchId: command.context.matchId }; } });
  assert.equal(called, 1); assert.deepEqual(result, { action: 'skill', skillId: 'fire_bolt', matchId: 'm1' });
});

test('gateway delegates persistence and authority instead of mutating state itself', async () => {
  let observed = null;
  const expected = { status: 'accepted', authoritative: true };
  const result = await dispatchCombatActionV1967({ mode: 'party', intent: { action: 'attack', targetId: 'enemy-1' }, execute: async command => { observed = command; return expected; } });
  assert.equal(result, expected); assert.equal(observed.mode, 'party'); assert.equal(observed.targetId, 'enemy-1');
});

test('all modes share the same deterministic damage implementation while retaining mode profiles', () => {
  const a = { attack: 50, hp: 100, maxHp: 100, accuracy: 100, critChance: 0 };
  const d = { defense: 10, hp: 100, maxHp: 100 };
  const rolls = { hit: 0, crit: 99, variance: 0 };
  const solo = resolveCombatDamageV1967('solo', a, d, {}, rolls);
  const party = resolveCombatDamageV1967('party', a, d, {}, rolls);
  const pvp = resolveCombatDamageV1967('pvp', a, d, {}, rolls);
  assert.deepEqual(solo, party);
  assert.notEqual(solo.damage, pvp.damage);
});

test('dungeon progression remains five normal waves followed by the sixth boss wave', () => {
  const dungeons = readJson('content/packs/region_one_master_v2/dungeons/dungeons.json');
  assert.ok(dungeons.length > 0);
  for (const dungeon of dungeons) {
    assert.equal(dungeon.normal_waves, 5, `${dungeon.id}: normal_waves`);
    assert.equal(dungeon.boss_wave, 6, `${dungeon.id}: boss_wave`);
    assert.equal(dungeon.wave_count, 6, `${dungeon.id}: wave_count`);
  }
});

test('tower remains exactly twenty floors with the original four-floor encounter cycle', () => {
  const tower = readJson('content/packs/region_one_master_v2/tower/tower.json');
  assert.equal(tower.floor_count, 20);
  assert.equal(tower.floors.length, 20);
  const cycle = ['normal', 'miniboss', 'miniboss', 'boss'];
  tower.floors.forEach((floor, index) => {
    assert.equal(floor.floor, index + 1);
    assert.equal(floor.type, cycle[index % 4], `floor ${floor.floor} type`);
  });
});

test('Party and PvP delegate commands through the shared gateway without replacing their RPCs', () => {
  const party = fs.readFileSync(new URL('../../systems/party/party-combat.js', import.meta.url), 'utf8');
  const pvp = fs.readFileSync(new URL('../../systems/pvp/pvp-ui.js', import.meta.url), 'utf8');
  assert.match(party, /dispatchRemoteCombatActionV1972/);
  assert.match(party, /this\.api\.battleAction\(session\.id, action, targetIndex, requestId\)/);
  assert.doesNotMatch(pvp, /dispatchCombatActionV1967/);
  assert.match(pvp, /this\.api\.pvpSkillAction\(this\.currentMatch,skillId,choice\)/);
  assert.match(pvp, /this\.api\.pvpAction\(this\.currentMatch,action\)/);
});

test('Solo battle retains a backwards-compatible shared damage fallback through the central runtime', () => {
  const game = fs.readFileSync(new URL('../../game.js', import.meta.url), 'utf8');
  assert.match(game, /ETRANOM_CENTRAL_COMBAT_RUNTIME\|\|window\.ETRANOM_COMBAT_CORE/);
  assert.match(game, /sharedCore\.resolveDamage/);
});
