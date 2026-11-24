import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createApocalypseProgress, unlockApocalypseSkills, resolveApocalypseSkill } from '../systems/combat/apocalypse-harbinger-runtime.js';

const actor = { level: 30, attack: 200, stamina: 100, skillPoints: 0,
  classProgress: { warrior_apocalypse_harbinger: createApocalypseProgress() } };
unlockApocalypseSkills(actor);

// A 420% ultimate must not remove an entire normal enemy or boss in one cast.
const targets = [
  { id: 'normal', name: 'normal', hp: 1000, maxHp: 1000, encounterKind: 'normal', statuses: {} },
  { id: 'boss', name: 'boss', hp: 1000, maxHp: 1000, encounterKind: 'boss', isBoss: true, statuses: {} }
];
const ultimate = resolveApocalypseSkill('worlds_end', { actor, targets, targetId: 'normal' });
assert.ok(ultimate.targets[0].hp >= 550, 'normal target must retain at least 55% HP after ultimate');
assert.ok(ultimate.targets[1].hp >= 750, 'boss must retain at least 75% HP after ultimate');

// Ruin Crown's 20% bonus is applied once, not once in the base hit and again as a second hit.
const actor2 = { level: 30, attack: 100, stamina: 100,
  classProgress: { warrior_apocalypse_harbinger: createApocalypseProgress() } };
unlockApocalypseSkills(actor2);
const buff = resolveApocalypseSkill('ruin_crown', { actor: actor2, targets: [] });
const strike = resolveApocalypseSkill('apoc_strike', { actor: actor2, targets: [{ id: 'dummy', hp: 5000, maxHp: 5000, defense: 0 }], targetId: 'dummy' });
assert.equal(strike.damage, 192, 'Ruin Crown 20% must be applied exactly once to 160% base damage');

// The Party SQL migration must contain the critical guardrails and type routes.
const sql = fs.readFileSync(new URL('../database/party_warrior_combat_balance_v1908.sql', import.meta.url), 'utf8');
for (const token of ['v1908_skill_damage_cap_anchor_missing', 'v1908_basic_damage_cap_anchor_missing', 'party_skill_cooldowns', 'damageReductionPct', 'evasionPct', 'v1908_battle_reset_anchor_missing', "'single_damage_debuff'", "'multi_damage'", "'aoe_control'"]) {
  assert.ok(sql.includes(token), `SQL migration missing ${token}`);
}
console.log('V1908 warrior damage caps, Apocalypse double-buff fix, and Party SQL guardrail checks passed.');
