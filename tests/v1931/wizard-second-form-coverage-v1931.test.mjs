import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ARCANE_MAGE } from '../../systems/classes/arcane-mage.js';
import { ELEMENTALIST } from '../../systems/classes/elementalist.js';
import { WARLOCK } from '../../systems/classes/warlock.js';
import { NECROMANCER } from '../../systems/classes/necromancer.js';

const game = fs.readFileSync('game.js', 'utf8');
const arcaneBody = game.slice(game.indexOf('function arcaneUseAscended'), game.indexOf('function activateArcaneDomain'));
const wizardAscendedBody = game.slice(game.indexOf('function applyWizardAscendedEffect'), game.indexOf('function wizardUseAscended'));

test('Arcane Mage has an explicit Solo handler for all ten second forms', () => {
  assert.equal(ARCANE_MAGE.ascendedSkills.length, 10);
  for (const form of ARCANE_MAGE.ascendedSkills) {
    assert.ok(arcaneBody.includes(`case '${form.skillId}'`), `missing Arcane handler for ${form.id}`);
  }
});

test('Elementalist second forms cover all ten authored base-skill mechanics', () => {
  assert.equal(ELEMENTALIST.ascendedSkills.length, 10);
  const coveredTypes = new Set([
    'shield', 'self_heal_cleanse', 'multi_target_damage', 'all_damage_control',
    'all_damage_debuff', 'single_damage', 'single_damage_cleanse',
    'single_damage_drain', 'dual_element_combo', 'ultimate_all_damage'
  ]);
  for (const form of ELEMENTALIST.ascendedSkills) {
    const baseId = form.skillId || form.baseSkillId;
    const base = ELEMENTALIST.skills.find(skill => skill.id === baseId);
    assert.ok(base, `missing Elementalist base skill for ${form.id}`);
    assert.ok(coveredTypes.has(base.type), `missing Elementalist effect type ${base.type} for ${form.id}`);
    const explicitBranch = wizardAscendedBody.includes(`type==='${base.type}'`);
    const genericSingleDamage = base.type === 'single_damage' && wizardAscendedBody.includes('wizardRuntimeDamage(target,base,skill.name);if(target)target.wizardStatus');
    assert.ok(explicitBranch || genericSingleDamage, `missing Solo effect branch for ${form.id}/${base.type}`);
  }
});

test('Warlock and Necromancer have explicit Solo handlers for all twenty second forms', () => {
  assert.equal(WARLOCK.ascendedSkills.length, 10);
  assert.equal(NECROMANCER.ascendedSkills.length, 10);
  for (const form of [...WARLOCK.ascendedSkills, ...NECROMANCER.ascendedSkills]) {
    assert.ok(wizardAscendedBody.includes(`'${form.id}'`), `missing Solo effect handler for ${form.id}`);
  }
});

test('Elementalist second-form tactical mode is selected before the one-use form is consumed', () => {
  assert.match(game, /function applyWizardAscendedEffect\(skill,key,c,p,selectedMode=null\)/);
  assert.match(game, /base\.type==='dual_element_combo'&&!hasMatchingMode/);
  assert.ok(game.indexOf('c.pendingWizardAscendedSkill=id') < game.indexOf('const result=fn?.(p,id)'));
  assert.match(game, /if\(ascendedId\)wizardUseAscended\(ascendedId\);else wizardRuntimeUseSkill\(id\)/);
});

test('authored Warlock zero-cost forms remain zero-cost and Necromancer forms inherit base mana cost', () => {
  for (const form of WARLOCK.ascendedSkills) assert.equal(Number(form.manaCostPercent), 0, form.id);
  for (const form of NECROMANCER.ascendedSkills) {
    const base = NECROMANCER.skills.find(skill => skill.id === (form.skillId || form.baseSkillId));
    assert.ok(base);
    assert.equal(Number(form.manaPct ?? form.manaCostPercent ?? base.manaPct ?? base.manaCostPercent ?? 0), Number(base.manaPct ?? base.manaCostPercent ?? 0), form.id);
  }
});
