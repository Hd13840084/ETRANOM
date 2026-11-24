import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ELEMENTALIST } from '../../systems/classes/elementalist.js';

const game = fs.readFileSync('game.js', 'utf8');
const effectBlock = game.slice(game.indexOf('function applyWizardAscendedEffect'), game.indexOf('function wizardUseAscended'));
const useBlock = game.slice(game.indexOf('function wizardUseAscended'), game.indexOf('function wizardRuntimeTalentEffects'));

test('Elementalist Radiant Judgment ascension keeps its cleanse and anti-dark bonus', () => {
  const base = ELEMENTALIST.skills.find(x => x.id === 'radiant_judgment');
  const form = ELEMENTALIST.ascendedSkills.find(x => x.id === 'asc_radiant_judgment');
  assert.equal(base.type, 'single_damage_cleanse');
  assert.equal(form.skillId, base.id);
  assert.match(effectBlock, /type==='single_damage_cleanse'[\s\S]{0,500}c\.playerStatuses=\{\};if\(state\.dungeonDebuff\)state\.dungeonDebuff=null/);
  assert.match(effectBlock, /برتری نور/);
});

test('Elementalist Chains of Darkness ascension keeps attack reduction and mana drain', () => {
  const base = ELEMENTALIST.skills.find(x => x.id === 'darkness_chains');
  const form = ELEMENTALIST.ascendedSkills.find(x => x.id === 'asc_darkness_chains');
  assert.equal(base.type, 'single_damage_drain');
  assert.equal(form.skillId, base.id);
  assert.match(effectBlock, /type==='single_damage_drain'[\s\S]{0,500}attackReductionPct[\s\S]{0,250}target\.mp=Math\.max\(0/);
});

test('Elemental Fusion ascension asks for the same six tactical combinations before consuming the form', () => {
  const base = ELEMENTALIST.skills.find(x => x.id === 'elemental_fusion');
  const form = ELEMENTALIST.ascendedSkills.find(x => x.skillId === base.id);
  assert.equal(base.type, 'dual_element_combo');
  assert.ok(form);
  assert.match(useBlock, /base\.type==='dual_element_combo'&&!hasMatchingMode/);
  assert.match(useBlock, /c\.pendingWizardAscendedSkill=id;c\.pendingWizardOptions=wizardModeOptions\(base\.type\)/);
  assert.ok(useBlock.indexOf('c.pendingWizardAscendedSkill=id') < useBlock.indexOf('const result=fn?.(p,id)'));
  assert.match(effectBlock, /type==='dual_element_combo'[\s\S]{0,1000}c\.currentWizardElement='ترکیبی'/);
});

test('Ascended tactical choice routes to the ascended handler and cancel does not consume it', () => {
  assert.match(game, /const id=state\.combat\.pendingWizardSkill,ascendedId=state\.combat\.pendingWizardAscendedSkill[\s\S]{0,220}if\(ascendedId\)wizardUseAscended\(ascendedId\);else wizardRuntimeUseSkill\(id\)/);
  assert.match(game, /state\.combat\.pendingWizardAscendedSkill=null;state\.combat\.pendingWizardOptions=null;state\.combat\.pendingWizardMode=null/);
  assert.match(game, /مانا و تعالی مصرف نشد/);
});

test('Wizard ascended casts pay authored mana cost and apply cooldown to their base skill', () => {
  assert.match(useBlock, /manaPct=Number\(a\.manaPct\?\?a\.manaCostPercent\?\?base\.manaPct\?\?base\.manaCostPercent\?\?0\)/);
  assert.match(useBlock, /if\(\(Number\(state\.character\.mp\)\|\|0\)<manaCost\)/);
  assert.match(useBlock, /state\.character\.mp=Math\.max\(0,\(Number\(state\.character\.mp\)\|\|0\)-manaCost\)/);
  assert.match(useBlock, /c\.wizardCooldowns\[base\.id\]=Number\(c\.turn\|\|1\)\+Math\.max\(0,Number\(a\.cooldownTurns\?\?base\.cooldownTurns\)\|\|0\)/);
});
