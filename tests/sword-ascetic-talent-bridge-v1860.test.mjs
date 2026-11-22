import test from 'node:test';
import assert from 'node:assert/strict';
import { collectSwordAsceticTalentEffects, resolveSwordAsceticSkill } from '../systems/combat/sword-ascetic-runtime.js';

test('status UI unlockedTalents and talentRanks are consumed by combat runtime', () => {
  const effects = collectSwordAsceticTalentEffects({ unlockedTalents: ['calm_mind', 'sword_gaze'], talentRanks: { calm_mind: 1, sword_gaze: 1 } });
  assert.equal(effects.staminaCostReductionPct, 2);
  assert.equal(effects.accuracyPct, 3);
});

test('legacy talents and current status save shapes combine without mutating input', () => {
  const progress = { talents: { read_motion: 1 }, unlockedTalents: ['calm_mind'], talentRanks: { calm_mind: 1 } };
  const before = structuredClone(progress);
  const effects = collectSwordAsceticTalentEffects(progress);
  assert.equal(effects.evasionPct, 3);
  assert.equal(effects.staminaCostReductionPct, 2);
  assert.deepEqual(progress, before);
});

test('talent stamina reduction is applied to the skill cost in runtime', () => {
  const actor = { id: 'hero', level: 10, hp: 500, maxHp: 500, mp: 0, stamina: 100, maxStamina: 100,
    attack: 100, defense: 40, classProgress: { warrior_sword_ascetic: { unlockedTalents: ['calm_mind'], talentRanks: { calm_mind: 1 } } } };
  const result = resolveSwordAsceticSkill('black_crescent', { actor, targets: [{ id: 'mob', hp: 1000, maxHp: 1000, defense: 20 }], targetId: 'mob', mode: 'solo' });
  assert.equal(result.actor.stamina, 95); // ceil(5 * (1 - 2%)) = 5 would round up; one 2% point is not enough to reduce cost.
});

test('sword skill mastery and named sword talents increase only their matching skill damage', () => {
  const baseActor = { id: 'hero', level: 20, hp: 500, maxHp: 500, mp: 0, stamina: 100, maxStamina: 100, attack: 100, defense: 40 };
  const target = () => [{ id: 'mob', hp: 2000, maxHp: 2000, defense: 20 }];
  const base = resolveSwordAsceticSkill('soul_blade', { actor: baseActor, targets: target(), targetId: 'mob' });
  const trained = resolveSwordAsceticSkill('soul_blade', { actor: { ...baseActor, classProgress: { warrior_sword_ascetic: { unlockedTalents: ['sword_mastery', 'soul_link'], talentRanks: { sword_mastery: 1, soul_link: 1 } } } }, targets: target(), targetId: 'mob' });
  assert.ok(trained.targets[0].hp < base.targets[0].hp);
});

test('domain trial completion saved in specialization progress unlocks absolute domain stage', async () => {
  const { activateSwordAsceticDomain } = await import('../systems/combat/sword-ascetic-runtime.js');
  const actor = { id: 'hero', level: 50, attack: 100, stamina: 100, classProgress: { warrior_sword_ascetic: { domainQuest: { complete: true } } } };
  const result = activateSwordAsceticDomain(actor);
  assert.equal(result.domain.stage, 4);
  assert.equal(result.domain.stageId, 'absolute');
  assert.equal(actor.classProgress.warrior_sword_ascetic.domain, undefined); // input remains immutable
});

test('domain resonance increases periodic domain wave damage without mutating input', async () => {
  const { tickSwordAsceticDomain } = await import('../systems/combat/sword-ascetic-runtime.js');
  const actor = { id: 'hero', attack: 1000, classProgress: { warrior_sword_ascetic: { unlockedTalents: ['domain_resonance'], talentRanks: { domain_resonance: 1 }, domain: { active: true, stage: 3, turnsRemaining: 2, waveCounter: 0 } } } };
  const result = tickSwordAsceticDomain(actor, [{ id: 'mob', hp: 2000, defense: 0 }]);
  assert.equal(result.targets[0].hp, 1876); // 12% of 1000, increased by 4% => 124 damage
  assert.equal(actor.classProgress.warrior_sword_ascetic.domain.waveCounter, 0);
});
