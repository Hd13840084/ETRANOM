import test from 'node:test';
import assert from 'node:assert/strict';
import { applyOwnerRuntimeAdapters, publishOwnerRuntimeConfig, resolveMonsterAiPolicyV2012, resolveOwnerRuntimePoliciesV2012 } from '../../systems/admin/owner-runtime-adapters-v2011.js';

test('V2012 applies owner AI to the stable monster id and exposes bounded policy', () => {
  const pack = { monsters: [{ id: 'm1', ai: { skill_chance: 0.2 } }], classes: [] };
  const rows = [{ content_type: 'monster_ai', content_id: 'm1_ai', version: 3, payload: { id: 'm1_ai', monster_id: 'm1', skill_chance: 0.8, minimum_mp: 14 } }];
  const result = applyOwnerRuntimeAdapters(pack, rows);
  assert.equal(pack.monsters[0].ai.skill_chance, 0.8);
  assert.equal(result.catalog.monster_ai[0].monster_id, 'm1');
  const policy = resolveMonsterAiPolicyV2012(pack.monsters[0]);
  assert.equal(policy.skillChance, 0.8);
  assert.equal(policy.minimumMp, 14);
});

test('V2012 clamps unsafe AI values and ignores invalid shapes', () => {
  assert.equal(resolveMonsterAiPolicyV2012({ ai: { skill_chance: 9, minimum_mp: -10 } }).skillChance, 1);
  assert.equal(resolveMonsterAiPolicyV2012({ ai: { skill_chance: -4, minimum_mp: 999999 } }).skillChance, 0);
  assert.equal(resolveMonsterAiPolicyV2012({ ai: [] }).minimumMp, 10);
});

test('V2012 publishes the eight workstream policy catalogs without mutating player data', () => {
  publishOwnerRuntimeConfig({ economy_rule: [{ id: 'economy-main' }], guild_config: [{ id: 'guild-main' }], pvp_config: [{ id: 'pvp-main' }] });
  const policies = resolveOwnerRuntimePoliciesV2012();
  assert.equal(policies.economy_rule[0].id, 'economy-main');
  assert.equal(policies.guild_config[0].id, 'guild-main');
  assert.equal(policies.pvp_config[0].id, 'pvp-main');
  assert.ok(Array.isArray(policies.progression_rule));
});
