import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeNecromancerProgress, recruitNecromancerLegion } from '../systems/classes/necromancer.js';

test('two same-species legion members receive distinct stable instance IDs', () => {
  let p = { legion: [], activeLegionIds: [] };
  p = recruitNecromancerLegion(p, { name: 'کلاغ', speciesId: 'crow', hp: 120, maxHp: 120, attack: 31, defense: 12, recruitable: true }, 0).progress;
  p = recruitNecromancerLegion(p, { name: 'کلاغ', speciesId: 'crow', hp: 90, maxHp: 90, attack: 24, defense: 8, recruitable: true }, 0).progress;
  assert.equal(p.legion.length, 2);
  assert.notEqual(p.legion[0].id, p.legion[1].id);
  assert.deepEqual(p.activeLegionIds, [p.legion[0].id, p.legion[1].id]);
  const again = normalizeNecromancerProgress(p);
  assert.deepEqual(again.activeLegionIds, p.activeLegionIds);
});

test('recruited member snapshots living monster combat stats as its own base stats', () => {
  const result = recruitNecromancerLegion({ legion: [], activeLegionIds: [] }, {
    name: 'کلاغ', speciesId: 'crow', hp: 120, maxHp: 120, attack: 31, defense: 12, recruitable: true
  }, 0);
  assert.equal(result.ok, true);
  const m = result.member;
  assert.equal(m.baseMaxHp, 120);
  assert.equal(m.maxHp, 120);
  assert.equal(m.hp, 120);
  assert.equal(m.baseAttack, 31);
  assert.equal(m.attack, 31);
  assert.equal(m.baseDefense, 12);
  assert.equal(m.defense, 12);
});

test('legacy duplicate IDs are repaired and never make a species-wide selection', () => {
  const p = normalizeNecromancerProgress({
    legion: [
      { id: 'crow', name: 'کلاغ', speciesId: 'crow', hp: 50, maxHp: 50, attack: 10 },
      { id: 'crow', name: 'کلاغ', speciesId: 'crow', hp: 40, maxHp: 40, attack: 8 }
    ],
    activeLegionIds: ['crow']
  });
  assert.notEqual(p.legion[0].id, p.legion[1].id);
  assert.equal(p.activeLegionIds.length, 1);
  assert.equal(p.activeLegionIds[0], p.legion[0].id);
});
