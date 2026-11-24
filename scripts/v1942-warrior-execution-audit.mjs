import SWORD from '../content/classes/warrior_sword_ascetic_v1.json' with { type: 'json' };
import IRON from '../content/classes/warrior_iron_bastion_v1.json' with { type: 'json' };
import CHAOS from '../content/classes/warrior_chaos_v1.json' with { type: 'json' };
import APOCALYPSE from '../content/classes/warrior_apocalypse_harbinger_v1.json' with { type: 'json' };
import { resolveSwordAsceticSkill } from '../systems/combat/sword-ascetic-runtime.js';
import { resolveIronBastionSkill } from '../systems/combat/iron-bastion-runtime.js';
import { resolveChaosSkill } from '../systems/combat/chaos-warrior-runtime.js';
import { resolveApocalypseSkill } from '../systems/combat/apocalypse-harbinger-runtime.js';

export const WARRIOR_EXECUTION_SPECS_V1942 = Object.freeze([
  { id: 'warrior_sword_ascetic', data: SWORD, legacyKey: 'swordAsceticProgress', resolve: resolveSwordAsceticSkill },
  { id: 'warrior_iron_bastion', data: IRON, legacyKey: 'ironBastionProgress', resolve: resolveIronBastionSkill },
  { id: 'warrior_chaos', data: CHAOS, legacyKey: 'chaosWarriorProgress', resolve: resolveChaosSkill },
  { id: 'warrior_apocalypse_harbinger', data: APOCALYPSE, legacyKey: 'apocalypseProgress', resolve: resolveApocalypseSkill }
]);
export const WARRIOR_MODES_V1942 = Object.freeze(['solo', 'party', 'pvp']);

function clone(value) { return structuredClone(value); }
function makeFixture(spec, skill, form, mode) {
  const baseId = form === 'ascended' ? (skill.skillId || skill.baseSkillId) : skill.id;
  const domain = {
    active: form === 'ascended', stage: 3, usedThisBattle: false,
    ascendedUsed: spec.id === 'warrior_apocalypse_harbinger' && form === 'ascended',
    ascendedSkillId: form === 'ascended' ? skill.id : null,
    selectedBaseSkillId: baseId, turnsRemaining: 5, cooldownBattles: 0
  };
  const progress = {
    skillRanks: Object.fromEntries(spec.data.skills.map(row => [row.id, 1])),
    unlockedTalents: [], talentRanks: {}, domain,
    domainQuest: { started: true, guardianDefeats: 3, complete: true },
    cooldowns: {}, skillCooldowns: {}, statuses: {}, buffs: {}, marks: {}, links: {}, rage: 0,
    incomingDamageThisTurn: 0, lowHpGuardUsed: false
  };
  const actor = {
    id: 'v1942-warrior-fixture', level: 50, attack: 100, power: 100,
    defense: 50, speed: 100, accuracy: 100, critChance: 0,
    hp: 1000, maxHp: 1000, stamina: 10000, maxStamina: 10000,
    skillPoints: 1000, classProgress: { [spec.id]: clone(progress) },
    [spec.legacyKey]: clone(progress)
  };
  const targets = [1, 2, 3].map(index => ({
    id: `v1942-enemy-${index}`, encounterId: `v1942-enemy-${index}`,
    name: `Fixture Enemy ${index}`, level: 50, hp: 100000, maxHp: 100000,
    defense: 0, enemyDefense: 0, evasion: 0, evasionPct: 0,
    kind: 'normal', encounterKind: 'normal', isBoss: false, isMiniboss: false,
    statuses: {}
  }));
  return { actor, targets, targetId: targets[0].id, mode,
    rolls: { hit: 0, crit: 99 }, choice: 'damage', recruitRoll: 99,
    requestId: `v1942:${spec.id}:${skill.id}:${mode}` };
}
function canonicalResult(result) {
  const value = clone(result);
  if (value && typeof value === 'object') delete value.mode;
  return JSON.stringify(value);
}
function summarize(spec, skill, form, mode, before, result) {
  const afterActor = result?.actor || before.actor;
  const afterTargets = Array.isArray(result?.targets) ? result.targets : before.targets;
  const baseId = form === 'ascended' ? (skill.skillId || skill.baseSkillId) : skill.id;
  const progress = result?.progress || afterActor.classProgress?.[spec.id] || afterActor[spec.legacyKey] || {};
  const beforeProgress = before.actor.classProgress?.[spec.id] || before.actor[spec.legacyKey] || {};
  const changedProgressKeys = [...new Set([...Object.keys(beforeProgress), ...Object.keys(progress)])]
    .filter(key => JSON.stringify(beforeProgress[key]) !== JSON.stringify(progress[key]));
  const damage = before.targets.reduce((sum, target) => {
    const after = afterTargets.find(row => String(row.id) === String(target.id));
    return sum + Math.max(0, Number(target.hp || 0) - Number(after?.hp ?? target.hp));
  }, 0);
  return {
    specializationId: spec.id, form, skillId: skill.id, baseSkillId: baseId, mode,
    status: 'executed', damage,
    staminaSpent: Math.max(0, Number(before.actor.stamina) - Number(afterActor.stamina)),
    cooldownRecorded: Boolean(progress.cooldowns?.[baseId] || progress.skillCooldowns?.[baseId] || afterActor.skillCooldowns?.[baseId]),
    targetCount: afterTargets.length,
    changedTargets: before.targets.filter((target, index) => Number(afterTargets[index]?.hp) !== Number(target.hp)).length,
    logCount: (result?.log || result?.logs || result?.events || []).length,
    changedProgressKeys,
    stateChanged: damage > 0 || changedProgressKeys.length > 0 || Number(before.actor.stamina) !== Number(afterActor.stamina) || (result?.log || result?.logs || result?.events || []).length > 0,
    ascended: result?.ascended === true || (result?.log || []).some(event => event?.type === 'ascension')
  };
}

export function runWarriorExecutionAuditV1942() {
  const rows = [];
  const errors = [];
  const modeParity = [];
  const originalRandom = Math.random;
  try {
    // Deterministic random source for authored proc branches; restored in finally.
    Math.random = () => 0.99;
    for (const spec of WARRIOR_EXECUTION_SPECS_V1942) {
      for (const [form, skills] of [['base', spec.data.skills], ['ascended', spec.data.ascendedSkills]]) {
        for (const skill of skills) {
          const outcomes = [];
          for (const mode of WARRIOR_MODES_V1942) {
            const payload = makeFixture(spec, skill, form, mode);
            const before = clone(payload);
            try {
              const result = spec.resolve(skill.id, payload);
              if (!result || typeof result !== 'object' || (!result.actor && !result.targets && !result.log && !result.logs)) {
                throw new Error('invalid_result_shape');
              }
              const row = summarize(spec, skill, form, mode, before, result);
              rows.push(row);
              outcomes.push({ mode, canonical: canonicalResult(result), summary: row });
            } catch (error) {
              const row = { specializationId: spec.id, form, skillId: skill.id, baseSkillId: skill.skillId || skill.baseSkillId || skill.id,
                mode, status: 'fixture_or_execution_error', error: String(error?.message || error) };
              rows.push(row); errors.push(row);
            }
          }
          if (outcomes.length === WARRIOR_MODES_V1942.length) {
            const same = outcomes.every(item => item.canonical === outcomes[0].canonical);
            modeParity.push({ specializationId: spec.id, form, skillId: skill.id, modeInvariant: same,
              summaries: outcomes.map(item => item.summary) });
          }
        }
      }
    }
  } finally {
    Math.random = originalRandom;
  }
  return {
    version: '1942.0.0', fixtureProfile: 'level-50-domain-stage-3-three-live-targets-deterministic-proc-rolls',
    modes: [...WARRIOR_MODES_V1942], totalRows: rows.length,
    uniqueSkillForms: rows.length / WARRIOR_MODES_V1942.length,
    executed: rows.filter(row => row.status === 'executed').length,
    errors, modeParityFailures: modeParity.filter(row => !row.modeInvariant),
    rows, modeParity
  };
}
