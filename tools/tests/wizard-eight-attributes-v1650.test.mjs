import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const game = fs.readFileSync(new URL('../../game.js', import.meta.url), 'utf8');
const index = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');

test('all eight attributes have an explicit gameplay effect description', () => {
  for (const key of ['power','speed','endurance','vitality','intellect','perception','luck','faith']) {
    assert.match(game, new RegExp(`${key}:'[^']+'`));
  }
});

test('strength/power and intellect are routed to physical and magical attack formulas', () => {
  assert.match(game, /function canonicalOffensiveStats\(\)/);
  assert.match(game, /stats:\{power:characterStat\('power'\),intellect:characterStat\('intellect'\)\}/);
  assert.match(game, /physicalSkillPower:physicalBase\+power\*2\.8/);
  assert.match(game, /magicalAttack:magicalBase\+intellect\*5/);
  assert.match(game, /function wizardRuntimePower\(\)/);
});

test('endurance, vitality, speed and perception affect mitigation, HP, evasion and accuracy', () => {
  assert.match(game, /totalEndurance-10\)\*\.003/);
  assert.match(game, /vitality\*10/);
  assert.match(game, /function characterEvasionChance\(\)/);
  assert.match(game, /const hitChance=clamp\(88\+\(characterStat\('perception'\)-10\)\*\.3/);
});

test('luck and faith affect criticals, recipes, mana, magic resistance and healing', () => {
  assert.match(game, /characterStat\('luck'\)\*\.15/);
  assert.match(game, /characterStat\("luck"\)-10\)\*\.08/);
  assert.match(game, /faith\*\(faithClass\?8:4\)/);
  assert.match(game, /function characterFaithResistancePct\(\)/);
  assert.match(game, /function wizardHealingMultiplier\(\)/);
});

test('wizard attribute descriptions are visible in both specialization attribute panels', () => {
  assert.ok((game.match(/ATTRIBUTE_EFFECT_TEXT\[k\]/g) || []).length >= 2);
});

test('game module cache is advanced for the attribute engine changes', () => {
  assert.match(index, /game\.js\?v=1961/);
});
