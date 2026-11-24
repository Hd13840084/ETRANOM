import { WARRIOR_EXECUTION_SPECS_V1942, WARRIOR_MODES_V1942 } from './v1942-warrior-execution-audit.mjs';

const SCENARIOS = Object.freeze([
  { id: 'rank1-domain1-normal', rank: 1, domainStage: 1, targetKind: 'normal', talents: false, controlResistPct: 0 },
  { id: 'rank4-domain2-normal-talents', rank: 4, domainStage: 2, targetKind: 'normal', talents: true, controlResistPct: 0 },
  { id: 'rank7-domain3-miniboss-talents', rank: 7, domainStage: 3, targetKind: 'miniboss', talents: true, controlResistPct: 25 },
  { id: 'rank7-domain3-boss-resistant', rank: 7, domainStage: 3, targetKind: 'boss', talents: true, controlResistPct: 90 }
]);
const clone = value => structuredClone(value);
function allTalents(spec) { return (spec.data.talentBranches || []).flatMap(branch => branch.talents || []); }
function fixture(spec, skill, form, scenario, mode) {
  const baseId = form === 'ascended' ? (skill.skillId || skill.baseSkillId) : skill.id;
  const talents = allTalents(spec);
  const unlockedTalents = scenario.talents ? talents.map(t => t.id) : [];
  const talentRanks = Object.fromEntries(talents.map(t => [t.id, scenario.talents ? Math.min(5, Number(t.rankCap || t.maxRank || 1)) : 0]));
  const domain = {
    active: true, stage: scenario.domainStage, usedThisBattle: false,
    ascendedUsed: form === 'ascended' && spec.id === 'warrior_apocalypse_harbinger', ascendedSkillId: form === 'ascended' ? skill.id : null,
    selectedBaseSkillId: baseId, turnsRemaining: 7, cooldownBattles: 0,
    stageUnlocked: scenario.domainStage, activationCount: 1
  };
  const progress = {
    skillRanks: Object.fromEntries(spec.data.skills.map(row => [row.id, scenario.rank])),
    unlockedTalents, talentRanks, domain,
    domainQuest: { started: true, guardianDefeats: 3, complete: true },
    cooldowns: {}, skillCooldowns: {}, statuses: {}, buffs: {}, marks: {}, links: {},
    rage: 100, incomingDamageThisTurn: 0, lowHpGuardUsed: false,
    turn: 4, turnCount: 4, battleTurn: 4
  };
  const actor = {
    id: `v1943-${spec.id}`, level: 50, attack: 160, power: 160, defense: 100,
    speed: 120, accuracy: 100, critChance: 0, hp: 5000, maxHp: 5000,
    stamina: 50000, maxStamina: 50000, skillPoints: 10000,
    classProgress: { [spec.id]: clone(progress) }, [spec.legacyKey]: clone(progress)
  };
  const targets = [1, 2, 3].map(index => ({
    id: `v1943-${scenario.targetKind}-${index}`, encounterId: `v1943-${scenario.targetKind}-${index}`,
    name: `${scenario.targetKind} fixture ${index}`, level: 50,
    hp: scenario.targetKind === 'boss' ? 500000 : 200000,
    maxHp: scenario.targetKind === 'boss' ? 500000 : 200000,
    defense: scenario.targetKind === 'normal' ? 20 : 90,
    enemyDefense: scenario.targetKind === 'normal' ? 20 : 90,
    evasion: 0, evasionPct: 0, controlResistPct: scenario.controlResistPct,
    kind: scenario.targetKind, encounterKind: scenario.targetKind,
    isBoss: scenario.targetKind === 'boss', isMiniboss: scenario.targetKind === 'miniboss',
    statuses: {}, statusEffects: [], armor: scenario.targetKind === 'boss' ? 100 : 30
  }));
  return { actor, targets, targetId: targets[0].id, mode,
    rolls: { hit: 0, crit: 99, control: 0 }, choice: 'damage', recruitRoll: 99,
    requestId: `v1943:${spec.id}:${skill.id}:${form}:${scenario.id}:${mode}` };
}
function resultSummary(spec, skill, form, scenario, mode, before, result) {
  const afterActor = result?.actor || before.actor;
  const afterTargets = Array.isArray(result?.targets) ? result.targets : before.targets;
  const baseId = form === 'ascended' ? (skill.skillId || skill.baseSkillId) : skill.id;
  const progress = result?.progress || afterActor.classProgress?.[spec.id] || afterActor[spec.legacyKey] || {};
  const oldProgress = before.actor.classProgress?.[spec.id] || before.actor[spec.legacyKey] || {};
  const changedKeys = [...new Set([...Object.keys(oldProgress), ...Object.keys(progress)])]
    .filter(key => JSON.stringify(oldProgress[key]) !== JSON.stringify(progress[key]));
  const damage = before.targets.reduce((sum, target) => {
    const after = afterTargets.find(row => String(row.id) === String(target.id));
    return sum + Math.max(0, Number(target.hp) - Number(after?.hp ?? target.hp));
  }, 0);
  const events = result?.log || result?.logs || result?.events || [];
  return {
    specializationId: spec.id, skillId: skill.id, baseSkillId: baseId, form,
    scenario: scenario.id, rank: scenario.rank, domainStage: scenario.domainStage,
    targetKind: scenario.targetKind, talentsEnabled: scenario.talents, mode,
    status: 'executed', damage,
    staminaSpent: Math.max(0, Number(before.actor.stamina) - Number(afterActor.stamina)),
    changedTargets: before.targets.filter((target, i) => Number(afterTargets[i]?.hp) !== Number(target.hp)).length,
    targetCount: afterTargets.length, eventCount: events.length,
    changedProgressKeys: changedKeys,
    stateChanged: damage > 0 || changedKeys.length > 0 || Number(before.actor.stamina) !== Number(afterActor.stamina) || events.length > 0,
    ascended: result?.ascended === true || events.some(event => event?.type === 'ascension')
  };
}
function canonical(result) {
  const copy = clone(result);
  if (copy && typeof copy === 'object') delete copy.mode;
  return JSON.stringify(copy);
}

export function runWarriorScenarioAuditV1943() {
  const rows = [], errors = [], parity = [];
  const originalRandom = Math.random;
  try {
    Math.random = () => 0.5;
    for (const spec of WARRIOR_EXECUTION_SPECS_V1942) {
      for (const [form, skills] of [['base', spec.data.skills], ['ascended', spec.data.ascendedSkills]]) {
        for (const skill of skills) for (const scenario of SCENARIOS) {
          const results = [];
          for (const mode of WARRIOR_MODES_V1942) {
            const payload = fixture(spec, skill, form, scenario, mode);
            const before = clone(payload);
            try {
              const result = spec.resolve(skill.id, payload);
              if (!result || typeof result !== 'object' || (!result.actor && !result.targets && !result.log && !result.logs)) throw new Error('invalid_result_shape');
              const row = resultSummary(spec, skill, form, scenario, mode, before, result);
              rows.push(row); results.push({ mode, signature: canonical(result), row });
            } catch (error) {
              const row = { specializationId: spec.id, skillId: skill.id, form, scenario: scenario.id, mode,
                status: 'execution_error', error: String(error?.stack || error) };
              rows.push(row); errors.push(row);
            }
          }
          if (results.length === WARRIOR_MODES_V1942.length) parity.push({ specializationId: spec.id, skillId: skill.id,
            form, scenario: scenario.id, modeInvariant: results.every(item => item.signature === results[0].signature),
            summaries: results.map(item => item.row) });
        }
      }
    }
  } finally { Math.random = originalRandom; }
  return {
    version: '1943.0.0', scenarios: clone(SCENARIOS), modes: [...WARRIOR_MODES_V1942],
    totalRows: rows.length, expectedRows: 960,
    uniqueSkillForms: 80, scenarioCount: SCENARIOS.length,
    executed: rows.filter(row => row.status === 'executed').length,
    errors, parityChecks: parity.length, parityFailures: parity.filter(row => !row.modeInvariant),
    rows, parity
  };
}
