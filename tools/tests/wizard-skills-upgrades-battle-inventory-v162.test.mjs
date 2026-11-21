import test from 'node:test';
import assert from 'node:assert/strict';
import { ARCANE_MAGE } from '../../systems/classes/arcane-mage.js';
import { ELEMENTALIST } from '../../systems/classes/elementalist.js';
import { WARLOCK } from '../../systems/classes/warlock.js';
import { NECROMANCER } from '../../systems/classes/necromancer.js';
import { resolveSkillAtRank } from '../../systems/classes/wizard-combat-runtime.js';
import { readFileSync } from 'node:fs';

const specs = [ARCANE_MAGE, ELEMENTALIST, WARLOCK, NECROMANCER];
const game = readFileSync(new URL('../../game.js', import.meta.url), 'utf8');

test('each Wizard specialization can reach rank 7 with six one-point upgrades per skill', () => {
  for (const spec of specs) {
    assert.equal(spec.skills.length, 10, spec.specialization);
    assert.ok(spec.skills.every(s => s.upgrades?.length === 6), spec.specialization + ' six upgrade entries');
    const progression = spec.progression || {};
    assert.equal(Number(progression.skillUpgradeCost ?? progression.skillUpgradeCost), 1, spec.specialization + ' one point per rank');
    assert.equal(Number(progression.skillUpgradeCount ?? progression.upgradesPerSkill), 6, spec.specialization + ' six ranks');
  }
  // Level 50 yields 98 skill points; maxing ten skills and all 32 talents costs 92.
  assert.ok(10 * 6 + 32 <= 49 * 2);
});

test('Elementalist rank overlays preserve base damage while applying secondary rank effects', () => {
  const ember = resolveSkillAtRank(ELEMENTALIST.skills.find(s => s.id === 'ember_bolt'), 5);
  assert.equal(ember.damagePct, 190);
  assert.equal(ember.defensePenetrationPct, 10);
  const armor = resolveSkillAtRank(ELEMENTALIST.skills.find(s => s.id === 'frozen_armor'), 7);
  assert.equal(armor.shieldPct, 330);
  assert.equal(armor.shieldDurationTurns, 3);
  assert.equal(armor.freezeChancePct, 20);
  const chain = resolveSkillAtRank(ELEMENTALIST.skills.find(s => s.id === 'chain_lightning'), 7);
  assert.equal(chain.damagePct, 210);
  assert.equal(chain.maxTargets, 5);
});

test('prose-based Necromancer and Warlock rank upgrades resolve into a progressive effect multiplier', () => {
  const necro = resolveSkillAtRank(NECROMANCER.skills.find(s => s.id === 'death_claw'), 7);
  const warlock = resolveSkillAtRank(WARLOCK.skills.find(s => s.id === 'forbidden_signature'), 7);
  assert.equal(necro.rankEffectMultiplierPct, 150);
  assert.equal(warlock.rankEffectMultiplierPct, 148);
  assert.equal(warlock.manaCostPercent, 6);
});

test('battle enemy cards are wired to selectable targets and inventory uses one shared action panel', () => {
  assert.match(game, /data-target-enemy=/);
  assert.match(game, /querySelectorAll\("\[data-target-enemy\]"\)/);
  assert.match(game, /data-fight="items"/);
  assert.match(game, /data-use-combat-item="potion"/);
  assert.match(game, /data-use-combat-item="scroll"/);
  assert.match(game, /data-use-combat-item/);
  assert.doesNotMatch(game, /data-fight="potion"/);
  assert.doesNotMatch(game, /data-fight="scrolls"/);
});
