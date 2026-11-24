import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const game = fs.readFileSync('game.js', 'utf8');
const activate = game.slice(game.indexOf('function wizardActivateDomain'), game.indexOf('function applyWizardAscendedEffect'));
const ascended = game.slice(game.indexOf('function wizardUseAscended'), game.indexOf('function wizardRuntimeTalentEffects'));

test('Wizard Domain activation is player-phase only and blocked during pending enemy reaction', () => {
  assert.match(activate, /state\.combat\.phase!=='player'/);
  assert.match(activate, /state\.combat\.enemyTurnPending/);
});

test('all non-Arcane Wizard second forms enforce the mapped base skill cooldown before any tactical prompt or resource spend', () => {
  const guard = ascended.indexOf("if((Number(c.wizardCooldowns[base.id])||0)>Number(c.turn||1))");
  const tacticalPrompt = ascended.indexOf("base.type==='dual_element_combo'");
  const manaSpend = ascended.indexOf('state.character.mp=Math.max(0,(Number(state.character.mp)||0)-manaCost)');
  const consume = ascended.indexOf('const result=fn?.(p,id)');
  assert.ok(guard >= 0, 'missing ascended cooldown guard');
  assert.ok(tacticalPrompt < 0 || guard < tacticalPrompt, 'cooldown must be checked before tactical selection');
  assert.ok(guard < consume, 'cooldown must be checked before consuming the second form');
  assert.ok(guard < manaSpend, 'cooldown must be checked before mana is spent');
  assert.match(ascended.slice(guard, tacticalPrompt), /pendingWizardMode=null/);
  assert.match(ascended.slice(guard, tacticalPrompt), /pendingWizardOptions=null/);
});

test('second-form cooldown is stored under the canonical base-skill id', () => {
  assert.match(ascended, /c\.wizardCooldowns\[base\.id\]=Number\(c\.turn\|\|1\)\+Math\.max\(0,Number\(a\.cooldownTurns\?\?base\.cooldownTurns\)\|\|0\)/);
});
