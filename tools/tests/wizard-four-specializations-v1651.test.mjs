import test from 'node:test';
import assert from 'node:assert/strict';
import { ARCANE_MAGE } from '../../systems/classes/arcane-mage-v130.js';
import { ELEMENTALIST } from '../../systems/classes/elementalist.js';
import { WARLOCK } from '../../systems/classes/warlock.js';
import { NECROMANCER } from '../../systems/classes/necromancer.js';
import { resolveSkillAtRank, calculateWizardManaCost, normalizeWizardCombatProgress } from '../../systems/classes/wizard-combat-runtime.js';

const specs = [ARCANE_MAGE, ELEMENTALIST, WARLOCK, NECROMANCER];

test('all four wizard specializations expose ten level-gated active skills', () => {
  for (const spec of specs) {
    assert.equal(spec.skills.length, 10, `${spec.specialization}: skill count`);
    assert.deepEqual(spec.skills.map(s => s.unlockLevel).sort((a,b)=>a-b), [1,2,3,4,5,6,7,8,9,10]);
    assert.equal(new Set(spec.skills.map(s=>s.id)).size, 10, `${spec.specialization}: duplicate skill id`);
  }
});

test('every active skill has six defined upgrades and a valid mana/cooldown profile', () => {
  for (const spec of specs) for (const skill of spec.skills) {
    assert.ok(skill.id && skill.name && skill.type, `${spec.specialization}: incomplete skill identity`);
    assert.equal(skill.upgrades?.length, 6, `${spec.specialization}/${skill.id}: expected six upgrades`);
    const mana = Number(skill.manaPct ?? skill.manaCostPercent);
    assert.ok(Number.isFinite(mana) && mana > 0 && mana <= 100, `${spec.specialization}/${skill.id}: invalid mana cost`);
    assert.ok(Number.isFinite(Number(skill.cooldownTurns)) && Number(skill.cooldownTurns) >= 0, `${spec.specialization}/${skill.id}: invalid cooldown`);
    const maxRank = resolveSkillAtRank(skill, 7);
    assert.ok(maxRank && maxRank.id === skill.id, `${spec.specialization}/${skill.id}: rank resolver failed`);
    assert.ok(Number(maxRank.manaPct ?? maxRank.manaCostPercent) > 0, `${spec.specialization}/${skill.id}: rank mana invalid`);
  }
});

test('all four specializations provide ten ascended choices and 32+ passive talents', () => {
  for (const spec of specs) {
    assert.equal(spec.ascendedSkills?.length, 10, `${spec.specialization}: ascended skill count`);
    const talents = (spec.talentBranches || []).reduce((n,b)=>n+(b.talents?.length||b.talentIds?.length||0),0) + (spec.talents?.length||0);
    assert.ok(talents >= 32, `${spec.specialization}: expected at least 32 passive talents, got ${talents}`);
  }
});

test('shared wizard runtime keeps mana costs bounded and normalizes persistent skill progress', () => {
  assert.equal(calculateWizardManaCost(1000, 10, {manaCostReductionPct:25}), 75);
  const p = normalizeWizardCombatProgress({skillRanks:{x:7},unlockedTalents:['a','a'],buffs:{power:1}});
  assert.equal(p.skillRanks.x, 7);
  assert.deepEqual(p.unlockedTalents, ['a']);
  assert.equal(p.buffs.power, 1);
});

test('every active skill type is connected to a live combat handler', async () => {
  const fs = await import('node:fs');
  const game = fs.readFileSync(new URL('../../game.js', import.meta.url), 'utf8');
  const index = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const arcaneHandler = game.slice(game.indexOf('function arcaneUseSkill('), game.indexOf('function arcaneUseAscended('));
  const wizardHandler = game.slice(game.indexOf('function wizardRuntimeUseSkill('), game.indexOf('function playerClassPortrait('));
  const handlers = [arcaneHandler, wizardHandler, wizardHandler, wizardHandler];
  for (let i = 0; i < specs.length; i++) {
    for (const skill of specs[i].skills) {
      const handled = handlers[i].includes(`case '${skill.type}'`) || handlers[i].includes(`type==='${skill.type}'`);
      assert.ok(handled, `${specs[i].specialization}/${skill.id}: unhandled combat type ${skill.type}`);
    }
  }
  const warlockSkill = WARLOCK.skills.find(s => s.id === 'true_name_shatter');
  assert.equal(warlockSkill.type, 'true_name_debuff');
  assert.ok(wizardHandler.includes("type==='true_name_debuff'"));
  assert.ok(game.includes("type==='true_name_debuff'?"));
  assert.match(index, /game\.js\?v=1961/);
  assert.match(index, /warlock\.js\?v=1931/);
});
