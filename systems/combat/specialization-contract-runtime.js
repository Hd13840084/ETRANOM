import { SPECIALIZATION_STAT_PROFILES } from './character-stat-core.js?v=1901';

const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const arr = value => Array.isArray(value) ? value : [];
const obj = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const CANONICAL_EFFECT_KEYS = Object.freeze(['damagePct','powerPct','healPct','shieldPct','chancePct','procChancePct','durationTurns','dotTurns','targetCount','maxTargets','attackPct','defensePct','magicPowerPct','healingPct','damageReductionPct','accuracyPct','critChancePct','speedPct','manaCostReductionPct','cooldownReductionTurns','lifeStealPct','reflectPct','dotPct','attackReductionPct','defenseReductionPct','armorPenPct','defensePenetrationPct','stunTurns','controlTurns','controlChancePct','enemyAttackReductionPct','bossEnemyAttackReductionPct','manaRegenPct','elementalDamagePct','elementalResistancePct','chargeGain','soulGain','resourceGain','rageGain','markTurns','linkPct','hits','summonHpPct','summonDamagePct']);
const SKILL_TYPE_ALIASES = Object.freeze({
  damage:'single_damage', single_damage_debuff:'single_damage', single_damage_cleanse:'single_damage',
  single_damage_drain:'damage_heal', life_steal:'damage_heal',
  line_damage:'multi_target_damage', area_damage:'multi_target_damage', dual_element_combo:'multi_target_damage',
  ultimate:'ultimate_all_damage', ultimate_aoe:'ultimate_all_damage', all_control_damage:'all_control_damage', all_damage_debuff:'all_control_damage',
  self_heal_cleanse:'self_heal', permanent_recruit:'summon', legion_defense_buff:'self_buff', legion_offense_buff:'self_buff',
  soul_command:'self_buff', ultimate_choice:'self_buff', ultimate_form:'self_buff', self_revive:'self_buff'
});

function normalizeUpgrade(upgrade = {}, index = 0) {
  const raw = obj(upgrade);
  const modifier = { ...obj(raw.modifier), ...obj(raw.effects) };
  for (const key of CANONICAL_EFFECT_KEYS) if (raw[key] != null && modifier[key] == null) modifier[key] = raw[key];
  return Object.freeze({
    ...raw,
    rank: Math.max(2, Math.floor(n(raw.rank, index + 2))),
    pointsRequired: Math.max(1, Math.floor(n(raw.pointsRequired ?? raw.cost ?? raw.skillPointsCost, 1))),
    modifier: Object.freeze(modifier),
    effects: Object.freeze({ ...obj(raw.effects), ...modifier })
  });
}

/** Normalize every legacy skill into the same transport and rank shape. Base
 * percentages and specialization-only effects are preserved without rebalance. */
export function normalizeSpecializationSkillRecord(skill = {}, specializationId) {
  const profile = SPECIALIZATION_STAT_PROFILES[String(specializationId || '')];
  if (!profile) throw new TypeError('unknown_specialization_contract_profile');
  const manaPercent = skill.manaPct ?? skill.manaCostPercent ?? skill.manaCostPct;
  const staminaCost = skill.staminaCost ?? skill.stamina_cost;
  const flatResourceCost = skill.resourceCost ?? staminaCost ?? skill.manaCost;
  const resourceCost = flatResourceCost != null ? Math.max(0, n(flatResourceCost)) : Math.max(0, n(manaPercent));
  const effects = { ...obj(skill.effects) };
  for (const key of CANONICAL_EFFECT_KEYS) if (skill[key] != null && effects[key] == null) effects[key] = skill[key];
  const aliases = {
    damagePct: skill.damagePct ?? skill.damagePercent ?? skill.powerPct ?? effects.damagePct,
    healPct: skill.healPct ?? effects.healPct,
    shieldPct: skill.shieldPct ?? effects.shieldPct,
    chancePct: skill.chancePct ?? skill.procChancePct ?? effects.chancePct,
    durationTurns: skill.durationTurns ?? skill.dotTurns ?? effects.durationTurns,
    targetCount: skill.targetCount ?? skill.maxTargets ?? effects.targetCount
  };
  for (const [key, value] of Object.entries(aliases)) if (value != null && effects[key] == null) effects[key] = value;
  const legacyType = String(skill.type || 'single_damage');
  const normalizedType = SKILL_TYPE_ALIASES[legacyType] || legacyType;
  const effectList = Object.entries(effects).map(([kind, amount]) => ({
    kind, amount: n(amount),
    unit: /Pct$|Percent$/.test(kind) ? (['damagePct','powerPct','healPct','shieldPct'].includes(kind) ? 'percent_of_base' : 'percentage_points') : /Turns$/.test(kind) ? 'turns' : /Chance$/.test(kind) ? 'chance' : 'flat'
  }));
  const upgrades = arr(skill.upgrades).slice(0, 6).map(normalizeUpgrade);
  while (upgrades.length < 6) upgrades.push(normalizeUpgrade({}, upgrades.length));
  return Object.freeze({
    ...skill,
    id: String(skill.id || ''),
    specializationId: String(specializationId),
    classId: profile.classId,
    nameFa: String(skill.nameFa ?? skill.name_fa ?? skill.name ?? ''),
    type: legacyType,
    legacyType,
    contractType: normalizedType,
    target: skill.target ?? skill.targetType ?? 'single_enemy',
    unlockLevel: Math.max(1, Math.floor(n(skill.unlockLevel ?? skill.unlock_level, 1))),
    resourceType: profile.primaryResource,
    resourceCost,
    resourceCostMode: flatResourceCost != null ? 'flat' : (manaPercent != null ? 'percent_of_max' : 'flat'),
    resourceCostPercent: manaPercent == null ? 0 : Math.max(0, n(manaPercent)),
    cooldownTurns: Math.max(0, Math.floor(n(skill.cooldownTurns ?? skill.cooldown_turns))),
    effects: Object.freeze(effects),
    effectList: Object.freeze(effectList),
    upgrades: Object.freeze(upgrades),
    rankCap: 7
  });
}

function normalizeTalentBranches(spec = {}) {
  const globalTalents = new Map(arr(spec.talents).map(t => [String(t.id), t]));
  return arr(spec.talentBranches).map((branch, branchIndex) => {
    const ids = arr(branch.talentIds);
    const talents = ids.length
      ? ids.map(id => globalTalents.get(String(id)) || { id: String(id), unresolvedReference: true })
      : arr(branch.talents);
    return Object.freeze({
      ...branch,
      branchIndex: branchIndex + 1,
      talents: Object.freeze(talents.map((talent, index) => Object.freeze({
        ...talent,
        id: String(talent.id || `${branch.id || 'branch'}_${index + 1}`),
        branchId: String(talent.branchId || branch.id || ''),
        rankCap: Math.max(1, Math.floor(n(talent.rankCap ?? talent.maxRank, 1)))
      })))
    });
  });
}

function normalizeDomain(domain = {}) {
  const raw = obj(domain);
  const sourceStages = arr(raw.stages);
  const stages = sourceStages.map((stage, index) => {
    const s = obj(stage);
    return Object.freeze({
      ...s,
      stage: Math.max(1, Math.floor(n(s.stage ?? s.stageNumber, index + 1))),
      unlockLevel: Math.max(1, Math.floor(n(s.unlockLevel ?? s.level ?? raw.unlockLevel ?? raw.level, 1))),
      activationCost: Math.max(0, n(s.activationCost ?? raw.activationCost, 0)),
      durationTurns: Math.max(0, Math.floor(n(s.durationTurns ?? s.durationPlayerTurns ?? raw.durationTurns ?? raw.durationPlayerTurns, 0))),
      durationMode: String(s.durationMode ?? raw.durationMode ?? ((n(s.durationTurns ?? s.durationPlayerTurns ?? raw.durationTurns ?? raw.durationPlayerTurns, 0) > 0) ? 'player_turns' : 'battle')),
      cooldownTurns: Math.max(0, Math.floor(n(s.cooldownTurns ?? raw.cooldownTurns ?? raw.cooldownBattles, 0))),
      effects: Object.freeze({ ...obj(s.effects), ...Object.fromEntries(Object.entries(s).filter(([key, value]) => CANONICAL_EFFECT_KEYS.includes(key) && Number.isFinite(Number(value)))) }),
      legacyEffects: Object.freeze([...arr(s.effects).filter(x => typeof x === 'string'), ...(typeof s.effect === 'string' ? [s.effect] : []), ...(typeof s.feature === 'string' ? [s.feature] : [])]),
      modeRules: Object.freeze({ solo: 'shared_rules', party: 'shared_rules', pvp: 'server_tuned', ...obj(s.modeRules) })
    });
  });
  return Object.freeze({
    ...raw,
    unlockLevel: Math.max(1, Math.floor(n(raw.unlockLevel ?? raw.level ?? sourceStages[0]?.unlockLevel ?? sourceStages[0]?.level, 1))),
    activationCost: Math.max(0, n(raw.activationCost, 0)),
    durationTurns: Math.max(0, Math.floor(n(raw.durationTurns ?? raw.durationPlayerTurns ?? sourceStages[0]?.durationTurns ?? sourceStages[0]?.durationPlayerTurns, 0))),
    cooldownTurns: Math.max(0, Math.floor(n(raw.cooldownTurns ?? raw.cooldownBattles, 0))),
    stages: Object.freeze(stages),
    modeRules: Object.freeze({ solo: 'shared_rules', party: 'shared_rules', pvp: 'server_tuned', ...obj(raw.modeRules) })
  });
}

function normalizeAscensions(spec = {}) {
  return arr(spec.ascendedSkills).map((ascension, index) => Object.freeze({
    ...ascension,
    id: String(ascension.id || `ascension_${index + 1}`),
    baseSkillId: String(ascension.baseSkillId ?? ascension.skillId ?? ascension.baseSkill ?? ''),
    effects: Object.freeze({ ...obj(ascension.effects), ...Object.fromEntries(Object.entries(ascension).filter(([key, value]) => CANONICAL_EFFECT_KEYS.includes(key) && Number.isFinite(Number(value)))) }),
    selectionLimitPerDomainActivation: 1,
    oneUsePerDomain: true,
    modeRules: Object.freeze({ solo: 'shared_rules', party: 'shared_rules', pvp: 'server_tuned', ...obj(ascension.modeRules) })
  }));
}

/** Audit data completeness, not merely array lengths. The audit intentionally
 * reports unresolved content references instead of silently inventing balance. */
export function auditSpecializationContent(spec = {}, specializationId = spec.id) {
  const errors = [];
  const skills = arr(spec.skills);
  const branches = normalizeTalentBranches(spec);
  const talents = branches.flatMap(branch => branch.talents);
  const domainStages = arr(spec.domain?.stages);
  const ascensions = arr(spec.ascendedSkills);
  if (skills.length !== 10) errors.push(`skills:${skills.length}/10`);
  if (branches.length !== 4) errors.push(`talentBranches:${branches.length}/4`);
  if (talents.length !== 32) errors.push(`talents:${talents.length}/32`);
  if (branches.some(branch => branch.talents.length !== 8)) errors.push('talent_branch_size_must_be_8');
  if (talents.some(t => t.unresolvedReference)) errors.push('unresolved_talent_reference');
  if (domainStages.length !== 4) errors.push(`domainStages:${domainStages.length}/4`);
  if (ascensions.length !== 10) errors.push(`ascensions:${ascensions.length}/10`);
  if (new Set(skills.map(s => String(s.id))).size !== skills.length) errors.push('duplicate_skill_id');
  if (new Set(talents.map(t => String(t.id))).size !== talents.length) errors.push('duplicate_talent_id');
  if (new Set(ascensions.map(a => String(a.id))).size !== ascensions.length) errors.push('duplicate_ascension_id');
  for (const skill of skills) {
    if (!skill.id) errors.push('skill_missing_id');
    if (!skill.name && !skill.nameFa && !skill.name_fa) errors.push(`skill_missing_name:${skill.id}`);
    if (!skill.type) errors.push(`skill_missing_type:${skill.id}`);
    if (!skill.target && !skill.targetType) errors.push(`skill_missing_target:${skill.id}`);
    if (!Number.isFinite(Number(skill.unlockLevel))) errors.push(`skill_missing_unlock_level:${skill.id}`);
    if (!Number.isFinite(Number(skill.cooldownTurns))) errors.push(`skill_missing_cooldown:${skill.id}`);
    if (arr(skill.upgrades).length !== 6) errors.push(`skill_upgrades:${skill.id}:${arr(skill.upgrades).length}/6`);
    if (skill.type === 'single_damage' || skill.type === 'damage' || skill.type === 'single_damage_debuff' || skill.type === 'multi_target_damage' || skill.type === 'all_damage') {
      const damage = skill.damagePct ?? skill.powerPct ?? skill.effects?.damagePct;
      if (!Number.isFinite(Number(damage)) && !Number.isFinite(Number(skill.effects?.damagePct))) errors.push(`skill_missing_damage_percent:${skill.id}`);
    }
  }
  return Object.freeze({ specializationId: String(specializationId || ''), ok: errors.length === 0, errors,
    counts: { skills: skills.length, talentBranches: branches.length, talents: talents.length, domainStages: domainStages.length, ascensions: ascensions.length } });
}

export function normalizeSpecializationContentRecord(spec = {}) {
  const id = String(spec.id || '');
  if (!SPECIALIZATION_STAT_PROFILES[id]) throw new TypeError('unknown_specialization_contract_profile');
  return Object.freeze({
    ...spec,
    id,
    classId: SPECIALIZATION_STAT_PROFILES[id].classId,
    skills: Object.freeze(arr(spec.skills).map(skill => normalizeSpecializationSkillRecord(skill, id))),
    talentBranches: Object.freeze(normalizeTalentBranches(spec)),
    domain: normalizeDomain(spec.domain),
    ascendedSkills: Object.freeze(normalizeAscensions(spec)),
    ascensions: Object.freeze(normalizeAscensions(spec)),
    progressionContract: Object.freeze({ skillRankCap: 7, skillUpgrades: 6, talentBranches: 4, talentsPerBranch: 8, domainStages: 4, ascensions: 10, ascensionSelectionLimitPerDomainActivation: 1 }),
    combatModes: Object.freeze(['solo', 'party', 'pvp'])
  });
}
