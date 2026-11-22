import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { upgradeIronBastionSkill } from '../systems/combat/iron-bastion-runtime.js';
import { upgradeApocalypseSkill } from '../systems/combat/apocalypse-harbinger-runtime.js';
import { upgradeChaosWarriorSkill } from '../systems/combat/chaos-warrior-runtime.js';
import { resolveSwordAsceticSkill } from '../systems/combat/sword-ascetic-runtime.js';
import { resolveSkillAtRank } from '../systems/classes/wizard-combat-runtime.js';
import { ARCANE_MAGE } from '../systems/classes/arcane-mage.js';
import { ELEMENTALIST } from '../systems/classes/elementalist.js';
import { WARLOCK } from '../systems/classes/warlock.js';
import { NECROMANCER } from '../systems/classes/necromancer.js';

test('all four Warrior specialization upgrade paths can reach rank seven', () => {
  const iron = upgradeIronBastionSkill({ level:50, skillPoints:1, classProgress:{warrior_iron_bastion:{skillRanks:{ironcleave:6}}} }, 'ironcleave');
  assert.equal(iron.progress.skillRanks.ironcleave, 7);
  assert.throws(() => upgradeIronBastionSkill({ level:50, skillPoints:1, classProgress:{warrior_iron_bastion:{skillRanks:{ironcleave:7}}} }, 'ironcleave'), /max_rank/);

  const apocalypse = upgradeApocalypseSkill({ level:50, skillPoints:1, classProgress:{warrior_apocalypse_harbinger:{skillRanks:{apoc_strike:6}}} }, 'apoc_strike');
  assert.equal(apocalypse.progress.skillRanks.apoc_strike, 7);
  assert.throws(() => upgradeApocalypseSkill({ level:50, skillPoints:1, classProgress:{warrior_apocalypse_harbinger:{skillRanks:{apoc_strike:7}}} }, 'apoc_strike'), /max_rank/);

  const chaos = upgradeChaosWarriorSkill({ level:50, skillPoints:1, classProgress:{warrior_chaos:{skillRanks:{chaos_rend:6}}} }, 'chaos_rend');
  assert.equal(chaos.progress.skillRanks.chaos_rend, 7);
  assert.throws(() => upgradeChaosWarriorSkill({ level:50, skillPoints:1, classProgress:{warrior_chaos:{skillRanks:{chaos_rend:7}}} }, 'chaos_rend'), /max/);

  const sword = resolveSwordAsceticSkill('black_crescent', { actor:{level:50,attack:100,stamina:100,classProgress:{warrior_sword_ascetic:{skillRanks:{black_crescent:7}}}}, targets:[{id:'e',hp:10000,defense:0}], targetId:'e' });
  assert.ok(sword.log.some(x=>x.type==='damage'&&x.amount>0));
});

test('all four Wizard specialization data sets carry six rank upgrades per skill', () => {
  for (const spec of [ARCANE_MAGE,ELEMENTALIST,WARLOCK,NECROMANCER]) {
    assert.equal(spec.skills.length,10);
    for (const skill of spec.skills) {
      assert.equal(skill.upgrades.length,6,`${spec.id}/${skill.id}`);
      const rank7 = resolveSkillAtRank(skill,7);
      assert.ok(rank7);
    }
  }
});

test('Wizard specializations no longer receive a hidden +50% global damage multiplier', () => {
  const source = fs.readFileSync(new URL('../game.js', import.meta.url), 'utf8');
  assert.match(source, /function wizardSpecializationAttackMultiplier\(\)\{return 1;\}/);
  assert.match(source, /function wizardSpecializationSkillPowerMultiplier\(\)\{return 1;\}/);
  assert.doesNotMatch(source, /isArcaneMage\(\)\|\|isElementalist\(\)\|\|isWarlock\(\)\?1\.5:1/);
});
