import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const game = readFileSync(new URL('../../game.js', import.meta.url), 'utf8');
const partyUI = readFileSync(new URL('../../systems/party/party-ui.js', import.meta.url), 'utf8');
const partyCss = readFileSync(new URL('../../systems/party/party.css', import.meta.url), 'utf8');
const sql = readFileSync(new URL('../../database/wizard_three_specs_power_boost_v1649.sql', import.meta.url), 'utf8');

test('v164.9 applies a 50% attack and skill-power multiplier only to the three non-Necromancer Wizard specs', () => {
  assert.match(game, /function wizardSpecializationAttackMultiplier\(\)\{return isArcaneMage\(\)\|\|isElementalist\(\)\|\|isWarlock\(\)\?1\.5:1;\}/);
  assert.match(game, /wizardRuntimePower\(\).*?wizardSpecializationAttackMultiplier\(\)/s);
  assert.match(game, /function wizardSpecializationSkillPowerMultiplier\(\)\{return isArcaneMage\(\)\|\|isElementalist\(\)\|\|isWarlock\(\)\?1\.5:1;\}/);
  assert.match(game, /wizardRuntimeSkillPower\(\).*?wizardRuntimePower\(\)\*wizardSpecializationSkillPowerMultiplier/s);
  assert.match(game, /function arcaneApplyShield\(amount,turns,reflectPct=0\).*?amount\*wizardSpecializationSkillPowerMultiplier\(\)/s);
  assert.match(game, /arcaneDamageEnemy\(enemy,damagePct/);
  assert.match(game, /wizardSpecializationAttackMultiplier\(\).*?extraDamage/s);
  assert.match(sql, /attack_value:=floor\(attack_value\*1\.50\)/);
  assert.match(sql, /specialization_name in/);
  assert.doesNotMatch(sql, /'نکرومنسر'.*?1\.50/s);
});

test('solo combat keeps a phase lock and adds a visible pause before enemy response', () => {
  assert.match(game, /combatRef\.enemyTurnPending=true;\s*combatRef\.phase="enemy";/);
  assert.match(game, /نوبت بازیکن پایان یافت؛ دشمنان پس از مکث کوتاه واکنش نشان می‌دهند/);
  assert.match(game, /actionLocked=c\.phase!=='player'\|\|!!c\.enemyTurnPending/);
  assert.match(game, /نوبت واکنش دشمنان؛ تا بازگشت نوبت بازیکن صبر کن/);
  assert.match(game, /await new Promise\(resolve=>window\.setTimeout\(resolve,520\)\)/);
  assert.match(game, /await enemyTurn\(\)/);
  assert.match(game, /\},850\);\s*\}\s*function fight\(action\)/);
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
