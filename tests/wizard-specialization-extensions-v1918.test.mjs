import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWizardEffectPlanCatalogV1916 } from '../systems/combat/engines/wizard-effect-plan-v1916.js';
import { createWizardEffectHandlersV1917 } from '../systems/combat/engines/wizard-effect-handlers-v1917.js';
import { createWizardSpecializationExtensionsV1918, auditWizardSpecializationExtensionsV1918, getWizardSpecializationExtensionIdsV1918, createWizardCompleteEffectHandlersV1918, auditWizardCompleteEffectCoverageV1918 } from '../systems/combat/engines/wizard-specialization-extensions-v1918.js';

const ext = createWizardSpecializationExtensionsV1918();
const run = (id, state, input, extra = {}) => {
  const fn = ext[id]; assert.equal(typeof fn, 'function', `missing ${id}`);
  const step = { kind: 'extension', scope: 'selected_target', handlerId: id };
  fn(state, step, { mode: 'solo', plan: { skillId: 'test' }, effectProvider: () => input, ...extra });
  return state;
};

test('V1918 registers all 21 Wizard specialization extension handlers', () => {
  assert.equal(getWizardSpecializationExtensionIdsV1918().length, 21);
  const audit = auditWizardSpecializationExtensionsV1918(buildWizardEffectPlanCatalogV1916(), ext);
  assert.equal(audit.missingExtensionCount, 0);
  assert.equal(audit.completeForWizardPlanCatalog, true);
  assert.equal(audit.liveCutoverReady, false);
});

test('V1918 merged handler registry resolves every compiled Wizard plan step', () => {
  const merged = createWizardCompleteEffectHandlersV1918();
  assert.equal(auditWizardCompleteEffectCoverageV1918(buildWizardEffectPlanCatalogV1916()).missingHandlerCount, 0);
  const missing = [];
  for (const p of buildWizardEffectPlanCatalogV1916()) for (const s of p.steps) if (typeof merged[s.handlerId] !== 'function' && typeof merged[s.kind] !== 'function') missing.push(s.handlerId);
  assert.deepEqual(missing, []);
});

test('Arcane Blink arms bounded evasion and does not create spatial state', () => {
  const s = run('wizard.arcane-mage.evasion_counter', { actor: { id: 'hero' }, targets: [] }, { evasionDurationTurns: 2, counterDamagePct: 50 });
  assert.equal(s.actor.arcaneMageProgress.evasion.charges, 2);
  assert.equal(s.actor.arcaneMageProgress.evasion.armed, true);
  assert.equal('x' in s.actor, false);
});

test('Arcane Echo refuses to recursively replay itself and scales trusted damage', () => {
  const s = { actor: { id: 'hero', lastEligibleSpell: { skillId: 'arcane_bolt', baseAmount: 100, targetId: 'm1' } }, targets: [{ id: 'm1', hp: 200 }] };
  run('wizard.arcane-mage.repeat_last_spell', s, { repeatPct: 40 });
  assert.equal(s.targets[0].hp, 160);
  assert.throws(() => run('wizard.arcane-mage.repeat_last_spell', { actor: { id: 'hero' }, targets: [] }, { replay: { skillId: 'arcane_echo', baseAmount: 10 } }), /no_eligible_spell/);
});

test('Elemental Fusion requires distinct supported pair and applies trusted amount', () => {
  const s = { actor: { id: 'hero' }, targets: [{ id: 'm1', hp: 100 }] };
  run('wizard.elementalist.dual_element_combo', s, { elements: ['fire', 'wind'], amount: 30 });
  assert.equal(s.targets[0].hp, 70);
  assert.throws(() => run('wizard.elementalist.dual_element_combo', { actor: {}, targets: [{ id: 'm', hp: 10 }] }, { elements: ['fire', 'fire'], amount: 1 }), /two_distinct/);
});

test('Warlock Pact toggle converts each two debt to one capped credit', () => {
  const s = { actor: { id: 'hero', warlockProgress: { testamentActive: true, pactDebt: 5, pactCredit: 1 } }, targets: [] };
  run('wizard.warlock.pact_toggle', s, {});
  assert.equal(s.actor.warlockProgress.testamentActive, false);
  assert.equal(s.actor.warlockProgress.pactDebt, 0);
  assert.equal(s.actor.warlockProgress.pactCredit, 3);
});

test('Warlock choice handlers reject invalid choices and create target statuses', () => {
  const s = { actor: { id: 'hero' }, targets: [{ id: 'boss', hp: 100, isBoss: true }] };
  run('wizard.warlock.true_name_choice', s, { choice: 'will' }, { selectedTargetId: 'boss' });
  assert.equal(s.targets[0].statuses.true_name_shatter.attackReductionPct, 10);
  assert.throws(() => run('wizard.warlock.court_choice', { actor: {}, targets: [] }, { choice: 'bad' }), /invalid_court/);
});

test('Necromancer recruitment respects ten-member capacity and trusted roll', () => {
  const s = { actor: { id: 'hero', necromancerProgress: { legion: [] } }, targets: [{ id: 'corpse', hp: 0, maxHp: 50, name: 'Ash Hound' }] };
  run('wizard.necromancer.permanent_recruit', s, { roll: 10, member: { id: 'hound-1', hp: 50, maxHp: 50 } }, { selectedTargetId: 'corpse' });
  assert.equal(s.actor.necromancerProgress.legion.length, 1);
  assert.equal(s.actor.necromancerProgress.legion[0].active, true);
  assert.throws(() => run('wizard.necromancer.permanent_recruit', { actor: { necromancerProgress: { legion: [] } }, targets: [{ id: 'c', hp: 0 }] }, { chancePct: 35 }, { selectedTargetId: 'c' }), /trusted_recruit_roll/);
});

test('Necromancer Soul Command consumes souls and caps healing/resources', () => {
  const s = { actor: { id: 'hero', hp: 90, maxHp: 100, mp: 95, maxMp: 100, magicPower: 10, necromancerProgress: { souls: 4, legion: [] } }, targets: [] };
  run('wizard.necromancer.soul_command', s, { choice: 'feed', powerPerSoul: 5 });
  assert.equal(s.actor.hp, 100); assert.equal(s.actor.mp, 100); assert.equal(s.actor.necromancerProgress.souls, 0);
});

test('Necromancer Return Threshold spends souls once and enforces once-per-battle', () => {
  const s = { actor: { id: 'hero', necromancerProgress: { souls: 3 } }, targets: [] };
  run('wizard.necromancer.soul_cost', s, {});
  assert.equal(s.actor.necromancerProgress.souls, 0);
  assert.throws(() => run('wizard.necromancer.soul_cost', s, {}), /already_armed/);
});

test('Necromancer domination forbids boss domination', () => {
  const s = { actor: { id: 'hero' }, targets: [{ id: 'boss', hp: 500, isBoss: true }] };
  assert.throws(() => run('wizard.necromancer.control_choice', s, { choice: 'dominate' }, { selectedTargetId: 'boss' }), /boss_cannot_be_dominated/);
});

test('all extensions require trusted effect provider at invocation', () => {
  const fn = ext['wizard.warlock.sacrifice_arm'];
  assert.throws(() => fn({ actor: {} }, { handlerId: 'wizard.warlock.sacrifice_arm' }, { mode: 'solo' }), /trusted_effect_provider_required/);
});

test('Warlock Stolen Moment locks special skill and primes next spell bonuses', () => {
  const s = { actor: { id: 'w' }, targets: [{ id: 'm', hp: 20 }] };
  run('wizard.warlock.stolen_moment', s, {}, { selectedTargetId: 'm' });
  assert.equal(s.targets[0].statuses.stolen_moment.specialSkillLocked, true);
  assert.equal(s.actor.warlockProgress.nextSkillDamagePct, 15);
});

test('Warlock Reversal of Sacrifice arms a non-lethal cost for later trusted resolver', () => {
  const s = { actor: { id: 'w', hp: 100 } };
  run('wizard.warlock.sacrifice_arm', s, { sacrificeHpPct: 7 });
  assert.equal(s.actor.warlockProgress.reversalArmed, true);
  assert.equal(s.actor.hp, 100);
});

test('Warlock Court, Hostage Link and Hunger Reservoir persist their distinct state', () => {
  const s = { actor: { id: 'w' }, targets: [{ id: 'm', hp: 100 }] };
  run('wizard.warlock.court_choice', s, { choice: 'confiscation' }, { selectedTargetId: 'm' });
  run('wizard.warlock.link', s, { linkPct: 22, healPct: 18 }, { selectedTargetId: 'm' });
  run('wizard.warlock.hunger_reservoir', s, { gain: 2 });
  assert.equal(s.actor.warlockProgress.courtMode, 'confiscation');
  assert.equal(s.actor.warlockProgress.hostageTargetId, 'm');
  assert.equal(s.actor.warlockProgress.hungerReservoir, 2);
});

test('Warlock Final Covenant consumes debt and applies chosen trusted damage', () => {
  const s = { actor: { id: 'w', warlockProgress: { pactDebt: 4, pactCredit: 2 } }, targets: [{ id: 'm', hp: 100 }] };
  run('wizard.warlock.final_covenant_choice', s, { choice: 'annihilation', amount: 50 }, { selectedTargetId: 'm' });
  assert.equal(s.targets[0].hp, 42); // 50 * (1 + 2 * 8%) damage from 100 HP
  assert.equal(s.actor.warlockProgress.pactDebt, 0);
  assert.equal(s.actor.warlockProgress.pactCredit, 0);
});

test('Necromancer Soul on Kill awards at most one soul for a corpse', () => {
  const s = { actor: { id: 'n', necromancerProgress: { souls: 0 } }, targets: [{ id: 'dead', hp: 0 }] };
  run('wizard.necromancer.soul_on_kill', s, {}, { selectedTargetId: 'dead' });
  run('wizard.necromancer.soul_on_kill', s, {}, { selectedTargetId: 'dead' });
  assert.equal(s.actor.necromancerProgress.souls, 1);
});

test('Necromancer Death Memory applies boss-scaled selected debuff', () => {
  const s = { actor: { id: 'n' }, targets: [{ id: 'boss', hp: 100, isBoss: true }] };
  run('wizard.necromancer.death_memory_choice', s, { choice: 'war' }, { selectedTargetId: 'boss' });
  assert.equal(s.targets[0].statuses.death_memory.attackReductionPct, 10);
});

test('Necromancer Bone Blossom and Kingdom of Bones only buff active living legion', () => {
  const s = { actor: { id: 'n', necromancerProgress: { legion: [{ id: 'a', hp: 10, active: true }, { id: 'b', hp: 0, active: true }, { id: 'c', hp: 10, active: false }] } } };
  run('wizard.necromancer.legion_defense', s, { defensePct: 20 });
  run('wizard.necromancer.legion_offense', s, { attackPct: 20 });
  const [a,b,c] = s.actor.necromancerProgress.legion;
  assert.equal(a.defenseBuffPct, 20); assert.equal(a.attackBuffPct, 20);
  assert.equal(b.defenseBuffPct, undefined); assert.equal(c.attackBuffPct, undefined);
});

test('Necromancer Life Siphon shares only the trusted healing fraction among living active legion', () => {
  const s = { actor: { id: 'n', necromancerProgress: { legion: [{ id: 'a', hp: 10, maxHp: 100, active: true }, { id: 'b', hp: 10, maxHp: 100, active: true }] } } };
  run('wizard.necromancer.legion_share_heal', s, { healedAmount: 100, sharePct: 20 });
  assert.equal(s.actor.necromancerProgress.legion[0].hp, 20);
  assert.equal(s.actor.necromancerProgress.legion[1].hp, 20);
});

test('Necromancer Eternal Sovereign is once per battle and empowers active legion', () => {
  const s = { actor: { id: 'n', necromancerProgress: { legion: [{ id: 'a', hp: 20, active: true }] } } };
  run('wizard.necromancer.sovereign_form', s, { durationTurns: 3, damagePct: 20, legionPct: 20 });
  assert.equal(s.actor.necromancerProgress.sovereignUsedThisBattle, true);
  assert.equal(s.actor.necromancerProgress.legion[0].sovereignBuffPct, 20);
  assert.throws(() => run('wizard.necromancer.sovereign_form', s, {}), /once_per_battle/);
});
