import test from 'node:test';
import assert from 'node:assert/strict';
import { runWarriorRankMatrixV1944 } from '../scripts/v1944-warrior-rank-matrix.mjs';
import { activateSwordAsceticDomain, tickSwordAsceticDomain } from '../systems/combat/sword-ascetic-runtime.js';
import { createIronBastionProgress, activateIronBastionDomain } from '../systems/combat/iron-bastion-runtime.js';
import { createChaosWarriorProgress, activateChaosDomain, selectChaosAscension, endChaosDomain } from '../systems/combat/chaos-warrior-runtime.js';
import { createApocalypseProgress, activateWorldsEnd, selectApocalypseAscension, endWorldsEnd } from '../systems/combat/apocalypse-harbinger-runtime.js';

const matrix = runWarriorRankMatrixV1944();

test('V1944 executes all 80 base/Ascension forms at ranks 1–7 in all three modes', () => {
  assert.equal(matrix.totalRows, 1680);
  assert.equal(matrix.executed, 1680);
  assert.deepEqual(matrix.errors, []);
});

test('V1944 all 560 rank/mode groups preserve deterministic mode parity', () => {
  assert.equal(matrix.parityGroups, 560);
  assert.deepEqual(matrix.parityFailures, []);
});

test('V1944 every execution keeps stamina and target values within valid numeric bounds', () => {
  for (const row of matrix.rows) {
    assert.ok(Number.isFinite(row.damage));
    assert.ok(Number.isFinite(row.staminaAfter));
    assert.ok(row.staminaAfter >= 0 && row.staminaAfter <= row.staminaBefore);
    assert.equal(row.targetCount, 3);
  }
});

test('V1944 damaging skills do not lose damage when rank increases under the same fixture', () => {
  const groups = new Map();
  for (const row of matrix.rows) {
    const key = `${row.specializationId}|${row.skillId}|${row.form}|${row.mode}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  for (const [key, rows] of groups) {
    rows.sort((a,b) => a.rank-b.rank);
    if (rows.some(row => row.damage > 0)) {
      for (let i=1;i<rows.length;i++) assert.ok(rows[i].damage >= rows[i-1].damage, `${key} rank ${rows[i].rank}`);
    }
  }
});

test('V1944 all four specialization Domains activate from valid level/quest state', () => {
  const sword = activateSwordAsceticDomain({ level: 50, attack: 100, classProgress: { warrior_sword_ascetic: { domainQuest: { complete: true } } } }, { level: 50 });
  const ironP = createIronBastionProgress(); ironP.domainQuest.complete = true;
  const iron = activateIronBastionDomain({ level: 50, classProgress: { warrior_iron_bastion: ironP } }, { level: 50 });
  const chaosP = createChaosWarriorProgress(); chaosP.domainQuest.complete = true;
  const chaos = activateChaosDomain({ level: 50, classProgress: { warrior_chaos: chaosP } }, { level: 50 });
  const apocP = { ...createApocalypseProgress(), domainQuest: { complete: true } };
  const apoc = activateWorldsEnd({ level: 50, classProgress: { warrior_apocalypse_harbinger: apocP } });
  for (const result of [sword, iron, chaos, apoc]) assert.equal(result.domain.active, true);
});

test('V1944 Chaos and Apocalypse enforce one selected Ascension and allow clean Domain shutdown', () => {
  const cp = createChaosWarriorProgress(); cp.domainQuest.complete = true;
  const c = activateChaosDomain({ level: 50, classProgress: { warrior_chaos: cp } }).actor;
  const selected = selectChaosAscension(c, 'chaos_asc_1').actor;
  assert.throws(() => selectChaosAscension(selected, 'chaos_asc_2'), /chaos_ascension_used/);
  assert.equal(endChaosDomain(selected).domain?.active ?? endChaosDomain(selected).progress.domain.active, false);

  const ap = { ...createApocalypseProgress(), domainQuest: { complete: true } };
  const a = activateWorldsEnd({ level: 50, classProgress: { warrior_apocalypse_harbinger: ap } }).actor;
  const selectedA = selectApocalypseAscension(a, 'apoc_strike_ascended').actor;
  assert.throws(() => selectApocalypseAscension(selectedA, 'world_rift_ascended'), /ascension_already_used/);
  assert.equal(endWorldsEnd(selectedA).progress.domain.active, false);
});

test('V1944 Sword Domain turn lifecycle emits a wave and expires cleanly', () => {
  const activated = activateSwordAsceticDomain({ level: 50, attack: 100, classProgress: { warrior_sword_ascetic: { domainQuest: { complete: true } } } }, { level: 50 });
  let actor = activated.actor;
  const duration = actor.classProgress.warrior_sword_ascetic.domain.turnsRemaining;
  let result;
  for (let i=0;i<duration;i++) { result = tickSwordAsceticDomain(actor, [{ id: 'boss', hp: 100000, maxHp: 100000, isBoss: true }]); actor = result.actor; }
  assert.equal(result.actor.classProgress.warrior_sword_ascetic.domain.active, false);
  assert.ok(result.log.some(row => row.type === 'sword_domain_ended'));
});
