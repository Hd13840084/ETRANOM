import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NECROMANCER_COMMON_COMPANIONS, NECROMANCER_COMPANION_ATTRIBUTE_KEYS, resolveNecromancerCompanionLevel, chooseNecromancerCompanionIntent } from '../../systems/classes/necromancer-common-companions-v1982.js';

test('Common companion pack contains 20 unique species and canonical eight stats only', () => {
  assert.equal(NECROMANCER_COMMON_COMPANIONS.length, 20);
  assert.equal(new Set(NECROMANCER_COMMON_COMPANIONS.map(x => x.id)).size, 20);
  assert.deepEqual(NECROMANCER_COMPANIONS_KEYS(), ['power','speed','endurance','vitality','intellect','perception','luck','faith']);
});
function NECROMANCER_COMPANIONS_KEYS(){ return [...NECROMANCER_COMPANION_ATTRIBUTE_KEYS]; }

test('Every Common species has identity, portrait, eight attributes, growth, passive, three skills and AI', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  for (const c of NECROMANCER_COMMON_COMPANIONS) {
    assert.ok(c.lore && c.role && c.portrait);
    assert.ok(fs.existsSync(path.join(root, c.portrait)), `missing portrait ${c.portrait}`);
    assert.deepEqual(Object.keys(c.stats).sort(), [...NECROMANCER_COMPANION_ATTRIBUTE_KEYS].sort());
    assert.deepEqual(Object.keys(c.growthPerLevel).sort(), [...NECROMANCER_COMPANION_ATTRIBUTE_KEYS].sort());
    assert.equal(c.skills.length, 3);
    assert.ok(c.passive.description && c.combatAI.rules.length >= 2);
    assert.equal(c.evolution.nextRank, 'uncommon');
  }
});

test('Level scaling is clamped to 1..100 and does not change rank', () => {
  const a = resolveNecromancerCompanionLevel('little_skeleton', 100);
  assert.equal(a.level, 100); assert.equal(a.rank, 'common');
  assert.ok(a.stats.power >= 8);
  assert.equal(resolveNecromancerCompanionLevel('little_skeleton', 0).level, 1);
});

test('Combat AI chooses support for a critically injured ally and otherwise falls back safely', () => {
  const support = chooseNecromancerCompanionIntent('grave_spirit', { allies:[{id:'a',hp:20,maxHp:100}], enemies:[{id:'e',hp:100,maxHp:100}], cooldowns:{} });
  assert.equal(support.action, 'use_skill');
  assert.ok(['warden_shroud','grave_blessing'].includes(support.skillId));
  const fallback = chooseNecromancerCompanionIntent('little_skeleton', { enemies:[{id:'e',hp:100,maxHp:100}], cooldowns:{bone_tap:1,skitter_step:3,rib_dart:3} });
  assert.equal(fallback.action, 'basic_attack');
});
