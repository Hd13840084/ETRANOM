import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const game = readFileSync(new URL('../../game.js', import.meta.url), 'utf8');
const partyUI = readFileSync(new URL('../../systems/party/party-ui.js', import.meta.url), 'utf8');
const partyCss = readFileSync(new URL('../../systems/party/party.css', import.meta.url), 'utf8');
const sql = readFileSync(new URL('../../database/wizard_three_specs_power_boost_v1649.sql', import.meta.url), 'utf8');

test('current Wizard runtime does not apply a hidden specialization-wide attack multiplier', () => {
  assert.match(game, /v1900: no hidden specialization-wide attack multiplier/);
  assert.match(game, /function wizardSpecializationAttackMultiplier\(\)\{return 1;\}/);
  assert.match(game, /function wizardSpecializationSkillPowerMultiplier\(\)\{return 1;\}/);
  assert.match(game, /wizardRuntimePower\(\)\*wizardSpecializationSkillPowerMultiplier\(\)/);
  assert.match(game, /wizardRuntimePower\(\).*?wizardSpecializationAttackMultiplier\(\)/s);
});

test('Solo combat locks input during the visible enemy reaction window', () => {
  assert.match(game, /combatRef\.enemyTurnPending=true;\s*combatRef\.phase="enemy_reaction";/);
  assert.match(game, /reactionDeadline=Date\.now\(\)\+2600/);
  assert.match(game, /actionLocked=c\.phase!=='player'\|\|!!c\.enemyTurnPending/);
  assert.match(game, /نوبت واکنش دشمنان؛ تا بازگشت نوبت بازیکن صبر کن|پیش از حمله دشمن/);
  assert.match(game, /combatRef\.phase==='enemy_reaction'/);
});

test('group battle prevents duplicate submissions and waits before showing the result', () => {
  assert.match(partyUI, /if \(this\._actionPending\) return;/);
  assert.match(partyUI, /this\._actionPending = true/);
  assert.match(partyUI, /setTimeout\(resolve, 550\)/);
  assert.match(partyUI, /this\._actionPending = false/);
});

test('group battle content scrolls in the modal on touch devices', () => {
  assert.match(partyCss, /#etr-party-card:has\(\.etr-party-battle\) #etr-party-body\{[^}]*overflow-y:auto/s);
  assert.match(partyCss, /-webkit-overflow-scrolling:touch/);
  assert.match(partyCss, /touch-action:pan-y/);
});
