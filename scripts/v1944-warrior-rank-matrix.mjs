import { WARRIOR_EXECUTION_SPECS_V1942, WARRIOR_MODES_V1942 } from './v1942-warrior-execution-audit.mjs';
const clone = x => structuredClone(x);
function makePayload(spec, skill, form, rank, mode) {
  const baseId = form === 'ascended' ? (skill.skillId || skill.baseSkillId) : skill.id;
  const apoc = spec.id === 'warrior_apocalypse_harbinger';
  const domain = { active: form === 'ascended', stage: 3, usedThisBattle: form === 'ascended', ascendedUsed: form === 'ascended' && apoc,
    ascendedSkillId: form === 'ascended' ? skill.id : null, selectedBaseSkillId: baseId, turnsRemaining: 8,
    cooldownBattles: 0, domainQuest: { complete: true } };
  const progress = { skillRanks: Object.fromEntries(spec.data.skills.map(s => [s.id, rank])), unlockedTalents: [], talentRanks: {},
    domain, domainQuest: { started: true, guardianDefeats: 3, complete: true }, cooldowns: {}, skillCooldowns: {},
    statuses: {}, buffs: {}, marks: {}, links: {}, rage: 0, incomingDamageThisTurn: 0, lowHpGuardUsed: false };
  const actor = { id: `v1944-${spec.id}`, level: 50, attack: 180, power: 180, defense: 120, speed: 120,
    accuracy: 100, critChance: 0, hp: 9000, maxHp: 9000, stamina: 50000, maxStamina: 50000,
    skillPoints: 10000, classProgress: { [spec.id]: clone(progress) }, [spec.legacyKey]: clone(progress) };
  const targets = [1,2,3].map(i => ({ id: `rank-${i}`, encounterId: `rank-${i}`, level: 50, hp: 1000000, maxHp: 1000000,
    defense: 40, enemyDefense: 40, isBoss: false, isMiniboss: false, kind: 'normal', encounterKind: 'normal', statuses: {} }));
  return { actor, targets, targetId: targets[0].id, mode, rolls: { hit: 0, crit: 99, bleed: 99 }, choice: 'damage', recruitRoll: 99,
    requestId: `v1944:${spec.id}:${skill.id}:${form}:${rank}:${mode}` };
}
function summarize(spec, skill, form, rank, mode, payload, result) {
  const actor = result.actor || payload.actor;
  const targets = result.targets || payload.targets;
  const damage = payload.targets.reduce((sum, t) => sum + Math.max(0, t.hp - (targets.find(x => String(x.id) === String(t.id))?.hp ?? t.hp)), 0);
  const events = result.log || result.logs || result.events || [];
  return { specializationId: spec.id, skillId: skill.id, form, rank, mode, damage,
    staminaBefore: 50000, staminaAfter: Number(actor.stamina ?? 50000), staminaSpent: 50000 - Number(actor.stamina ?? 50000),
    targetCount: targets.length, changedTargets: payload.targets.filter(t => (targets.find(x => x.id === t.id)?.hp ?? t.hp) !== t.hp).length,
    eventCount: events.length, stateChanged: damage > 0 || events.length > 0 || Number(actor.stamina ?? 50000) !== 50000 };
}
export function runWarriorRankMatrixV1944() {
  const rows = [], errors = [], parity = [];
  const oldRandom = Math.random;
  try {
    Math.random = () => 0.37;
    for (const spec of WARRIOR_EXECUTION_SPECS_V1942) {
      for (const [form, skills] of [['base', spec.data.skills], ['ascended', spec.data.ascendedSkills]]) {
        for (const skill of skills) for (let rank = 1; rank <= 7; rank++) {
          const outcomes = [];
          for (const mode of WARRIOR_MODES_V1942) {
            const payload = makePayload(spec, skill, form, rank, mode);
            try {
              const result = spec.resolve(skill.id, payload);
              if (!result || typeof result !== 'object' || (!result.actor && !result.targets && !result.log && !result.logs)) throw new Error('invalid_result_shape');
              const row = summarize(spec, skill, form, rank, mode, payload, result);
              if (!Number.isFinite(row.damage) || !Number.isFinite(row.staminaAfter) || row.staminaAfter < 0 || row.staminaAfter > 50000) throw new Error('invalid_numeric_or_resource_bounds');
              if (row.targetCount !== 3) throw new Error('target_shape_changed');
              rows.push({ ...row, status: 'executed' });
              outcomes.push({ mode, signature: JSON.stringify({ ...row, mode: undefined }) });
            } catch (error) {
              const row = { specializationId: spec.id, skillId: skill.id, form, rank, mode, status: 'error', error: String(error?.stack || error) };
              rows.push(row); errors.push(row);
            }
          }
          if (outcomes.length === WARRIOR_MODES_V1942.length) parity.push({ specializationId: spec.id, skillId: skill.id, form, rank,
            modeInvariant: outcomes.every(x => x.signature === outcomes[0].signature) });
        }
      }
    }
  } finally { Math.random = oldRandom; }
  return { version: '1944.0.0', rankRange: [1,2,3,4,5,6,7], forms: 80, modes: [...WARRIOR_MODES_V1942], expectedRows: 1680,
    totalRows: rows.length, executed: rows.filter(x => x.status === 'executed').length, errors,
    parityGroups: parity.length, parityFailures: parity.filter(x => !x.modeInvariant), rows, parity };
}
