import { SPECIALIZATION_STAT_PROFILES } from './character-stat-core.js?v=1901&build=2081';
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const arr = value => Array.isArray(value) ? value : [];
const obj = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const CANONICAL_EFFECT_KEYS = Object.freeze(['damagePct', 'powerPct', 'healPct', 'shieldPct', 'chancePct', 'procChancePct', 'durationTurns', 'dotTurns', 'targetCount', 'maxTargets', 'attackPct', 'defensePct', 'magicPowerPct', 'healingPct', 'damageReductionPct', 'accuracyPct', 'critChancePct', 'speedPct', 'manaCostReductionPct', 'cooldownReductionTurns', 'lifeStealPct', 'reflectPct', 'dotPct', 'attackReductionPct', 'defenseReductionPct', 'armorPenPct', 'defensePenetrationPct', 'stunTurns', 'controlTurns', 'controlChancePct', 'enemyAttackReductionPct', 'bossEnemyAttackReductionPct', 'manaRegenPct', 'elementalDamagePct', 'elementalResistancePct', 'chargeGain', 'soulGain', 'resourceGain', 'rageGain', 'markTurns', 'linkPct', 'hits', 'summonHpPct', 'summonDamagePct']);
const SKILL_TYPE_ALIASES = Object.freeze({
    damage: 'single_damage', single_damage_debuff: 'single_damage', single_damage_cleanse: 'single_damage',
    single_damage_drain: 'damage_heal', life_steal: 'damage_heal',
    line_damage: 'multi_target_damage', area_damage: 'multi_target_damage', dual_element_combo: 'multi_target_damage',
    ultimate: 'ultimate_all_damage', ultimate_aoe: 'ultimate_all_damage', all_control_damage: 'all_control_damage', all_damage_debuff: 'all_control_damage',
    self_heal_cleanse: 'self_heal', permanent_recruit: 'summon', legion_defense_buff: 'self_buff', legion_offense_buff: 'self_buff',
    soul_command: 'self_buff', ultimate_choice: 'self_buff', ultimate_form: 'self_buff', self_revive: 'self_buff'
});
function normalizeUpgrade(upgrade = {}, index = 0) {
    var _a, _b;
    const raw = obj(upgrade);
    const modifier = { ...obj(raw.modifier), ...obj(raw.effects) };
    for (const key of CANONICAL_EFFECT_KEYS)
        if (raw[key] != null && modifier[key] == null)
            modifier[key] = raw[key];
    return Object.freeze({
        ...raw,
        rank: Math.max(2, Math.floor(n(raw.rank, index + 2))),
        pointsRequired: Math.max(1, Math.floor(n((_b = (_a = raw.pointsRequired) !== null && _a !== void 0 ? _a : raw.cost) !== null && _b !== void 0 ? _b : raw.skillPointsCost, 1))),
        modifier: Object.freeze(modifier),
        effects: Object.freeze({ ...obj(raw.effects), ...modifier })
    });
}
/** Normalize every legacy skill into the same transport and rank shape. Base
 * percentages and specialization-only effects are preserved without rebalance. */
export function normalizeSpecializationSkillRecord(skill = {}, specializationId) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
    const profile = SPECIALIZATION_STAT_PROFILES[String(specializationId || '')];
    if (!profile)
        throw new TypeError('unknown_specialization_contract_profile');
    const manaPercent = (_b = (_a = skill.manaPct) !== null && _a !== void 0 ? _a : skill.manaCostPercent) !== null && _b !== void 0 ? _b : skill.manaCostPct;
    const staminaCost = (_c = skill.staminaCost) !== null && _c !== void 0 ? _c : skill.stamina_cost;
    const flatResourceCost = (_e = (_d = skill.resourceCost) !== null && _d !== void 0 ? _d : staminaCost) !== null && _e !== void 0 ? _e : skill.manaCost;
    const resourceCost = flatResourceCost != null ? Math.max(0, n(flatResourceCost)) : Math.max(0, n(manaPercent));
    const effects = { ...obj(skill.effects) };
    for (const key of CANONICAL_EFFECT_KEYS)
        if (skill[key] != null && effects[key] == null)
            effects[key] = skill[key];
    const aliases = {
        damagePct: (_h = (_g = (_f = skill.damagePct) !== null && _f !== void 0 ? _f : skill.damagePercent) !== null && _g !== void 0 ? _g : skill.powerPct) !== null && _h !== void 0 ? _h : effects.damagePct,
        healPct: (_j = skill.healPct) !== null && _j !== void 0 ? _j : effects.healPct,
        shieldPct: (_k = skill.shieldPct) !== null && _k !== void 0 ? _k : effects.shieldPct,
        chancePct: (_m = (_l = skill.chancePct) !== null && _l !== void 0 ? _l : skill.procChancePct) !== null && _m !== void 0 ? _m : effects.chancePct,
        durationTurns: (_p = (_o = skill.durationTurns) !== null && _o !== void 0 ? _o : skill.dotTurns) !== null && _p !== void 0 ? _p : effects.durationTurns,
        targetCount: (_r = (_q = skill.targetCount) !== null && _q !== void 0 ? _q : skill.maxTargets) !== null && _r !== void 0 ? _r : effects.targetCount
    };
    for (const [key, value] of Object.entries(aliases))
        if (value != null && effects[key] == null)
            effects[key] = value;
    const legacyType = String(skill.type || 'single_damage');
    const normalizedType = SKILL_TYPE_ALIASES[legacyType] || legacyType;
    const effectList = Object.entries(effects).map(([kind, amount]) => ({
        kind, amount: n(amount),
        unit: /Pct$|Percent$/.test(kind) ? (['damagePct', 'powerPct', 'healPct', 'shieldPct'].includes(kind) ? 'percent_of_base' : 'percentage_points') : /Turns$/.test(kind) ? 'turns' : /Chance$/.test(kind) ? 'chance' : 'flat'
    }));
    const upgrades = arr(skill.upgrades).slice(0, 6).map(normalizeUpgrade);
    while (upgrades.length < 6)
        upgrades.push(normalizeUpgrade({}, upgrades.length));
    return Object.freeze({
        ...skill,
        id: String(skill.id || ''),
        specializationId: String(specializationId),
        classId: profile.classId,
        nameFa: String((_u = (_t = (_s = skill.nameFa) !== null && _s !== void 0 ? _s : skill.name_fa) !== null && _t !== void 0 ? _t : skill.name) !== null && _u !== void 0 ? _u : ''),
        type: legacyType,
        legacyType,
        contractType: normalizedType,
        target: (_w = (_v = skill.target) !== null && _v !== void 0 ? _v : skill.targetType) !== null && _w !== void 0 ? _w : 'single_enemy',
        unlockLevel: Math.max(1, Math.floor(n((_x = skill.unlockLevel) !== null && _x !== void 0 ? _x : skill.unlock_level, 1))),
        resourceType: profile.primaryResource,
        resourceCost,
        resourceCostMode: flatResourceCost != null ? 'flat' : (manaPercent != null ? 'percent_of_max' : 'flat'),
        resourceCostPercent: manaPercent == null ? 0 : Math.max(0, n(manaPercent)),
        cooldownTurns: Math.max(0, Math.floor(n((_y = skill.cooldownTurns) !== null && _y !== void 0 ? _y : skill.cooldown_turns))),
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
            talents: Object.freeze(talents.map((talent, index) => {
                var _a;
                return Object.freeze({
                    ...talent,
                    id: String(talent.id || `${branch.id || 'branch'}_${index + 1}`),
                    branchId: String(talent.branchId || branch.id || ''),
                    rankCap: Math.max(1, Math.floor(n((_a = talent.rankCap) !== null && _a !== void 0 ? _a : talent.maxRank, 1)))
                });
            }))
        });
    });
}
function normalizeDomain(domain = {}) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const raw = obj(domain);
    const sourceStages = arr(raw.stages);
    const stages = sourceStages.map((stage, index) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        const s = obj(stage);
        return Object.freeze({
            ...s,
            stage: Math.max(1, Math.floor(n((_a = s.stage) !== null && _a !== void 0 ? _a : s.stageNumber, index + 1))),
            unlockLevel: Math.max(1, Math.floor(n((_d = (_c = (_b = s.unlockLevel) !== null && _b !== void 0 ? _b : s.level) !== null && _c !== void 0 ? _c : raw.unlockLevel) !== null && _d !== void 0 ? _d : raw.level, 1))),
            activationCost: Math.max(0, n((_e = s.activationCost) !== null && _e !== void 0 ? _e : raw.activationCost, 0)),
            durationTurns: Math.max(0, Math.floor(n((_h = (_g = (_f = s.durationTurns) !== null && _f !== void 0 ? _f : s.durationPlayerTurns) !== null && _g !== void 0 ? _g : raw.durationTurns) !== null && _h !== void 0 ? _h : raw.durationPlayerTurns, 0))),
            durationMode: String((_k = (_j = s.durationMode) !== null && _j !== void 0 ? _j : raw.durationMode) !== null && _k !== void 0 ? _k : ((n((_o = (_m = (_l = s.durationTurns) !== null && _l !== void 0 ? _l : s.durationPlayerTurns) !== null && _m !== void 0 ? _m : raw.durationTurns) !== null && _o !== void 0 ? _o : raw.durationPlayerTurns, 0) > 0) ? 'player_turns' : 'battle')),
            cooldownTurns: Math.max(0, Math.floor(n((_q = (_p = s.cooldownTurns) !== null && _p !== void 0 ? _p : raw.cooldownTurns) !== null && _q !== void 0 ? _q : raw.cooldownBattles, 0))),
            effects: Object.freeze({ ...obj(s.effects), ...Object.fromEntries(Object.entries(s).filter(([key, value]) => CANONICAL_EFFECT_KEYS.includes(key) && Number.isFinite(Number(value)))) }),
            legacyEffects: Object.freeze([...arr(s.effects).filter(x => typeof x === 'string'), ...(typeof s.effect === 'string' ? [s.effect] : []), ...(typeof s.feature === 'string' ? [s.feature] : [])]),
            modeRules: Object.freeze({ solo: 'shared_rules', party: 'shared_rules', pvp: 'server_tuned', ...obj(s.modeRules) })
        });
    });
    return Object.freeze({
        ...raw,
        unlockLevel: Math.max(1, Math.floor(n((_d = (_b = (_a = raw.unlockLevel) !== null && _a !== void 0 ? _a : raw.level) !== null && _b !== void 0 ? _b : (_c = sourceStages[0]) === null || _c === void 0 ? void 0 : _c.unlockLevel) !== null && _d !== void 0 ? _d : (_e = sourceStages[0]) === null || _e === void 0 ? void 0 : _e.level, 1))),
        activationCost: Math.max(0, n(raw.activationCost, 0)),
        durationTurns: Math.max(0, Math.floor(n((_j = (_g = (_f = raw.durationTurns) !== null && _f !== void 0 ? _f : raw.durationPlayerTurns) !== null && _g !== void 0 ? _g : (_h = sourceStages[0]) === null || _h === void 0 ? void 0 : _h.durationTurns) !== null && _j !== void 0 ? _j : (_k = sourceStages[0]) === null || _k === void 0 ? void 0 : _k.durationPlayerTurns, 0))),
        cooldownTurns: Math.max(0, Math.floor(n((_l = raw.cooldownTurns) !== null && _l !== void 0 ? _l : raw.cooldownBattles, 0))),
        stages: Object.freeze(stages),
        modeRules: Object.freeze({ solo: 'shared_rules', party: 'shared_rules', pvp: 'server_tuned', ...obj(raw.modeRules) })
    });
}
function normalizeAscensions(spec = {}) {
    return arr(spec.ascendedSkills).map((ascension, index) => {
        var _a, _b, _c;
        return Object.freeze({
            ...ascension,
            id: String(ascension.id || `ascension_${index + 1}`),
            baseSkillId: String((_c = (_b = (_a = ascension.baseSkillId) !== null && _a !== void 0 ? _a : ascension.skillId) !== null && _b !== void 0 ? _b : ascension.baseSkill) !== null && _c !== void 0 ? _c : ''),
            effects: Object.freeze({ ...obj(ascension.effects), ...Object.fromEntries(Object.entries(ascension).filter(([key, value]) => CANONICAL_EFFECT_KEYS.includes(key) && Number.isFinite(Number(value)))) }),
            selectionLimitPerDomainActivation: 1,
            oneUsePerDomain: true,
            modeRules: Object.freeze({ solo: 'shared_rules', party: 'shared_rules', pvp: 'server_tuned', ...obj(ascension.modeRules) })
        });
    });
}
/** Audit data completeness, not merely array lengths. The audit intentionally
 * reports unresolved content references instead of silently inventing balance. */
export function auditSpecializationContent(spec = {}, specializationId = spec.id) {
    var _a, _b, _c, _d, _e;
    const errors = [];
    const skills = arr(spec.skills);
    const branches = normalizeTalentBranches(spec);
    const talents = branches.flatMap(branch => branch.talents);
    const domainStages = arr((_a = spec.domain) === null || _a === void 0 ? void 0 : _a.stages);
    const ascensions = arr(spec.ascendedSkills);
    if (skills.length !== 10)
        errors.push(`skills:${skills.length}/10`);
    if (branches.length !== 4)
        errors.push(`talentBranches:${branches.length}/4`);
    if (talents.length !== 32)
        errors.push(`talents:${talents.length}/32`);
    if (branches.some(branch => branch.talents.length !== 8))
        errors.push('talent_branch_size_must_be_8');
    if (talents.some(t => t.unresolvedReference))
        errors.push('unresolved_talent_reference');
    if (domainStages.length !== 4)
        errors.push(`domainStages:${domainStages.length}/4`);
    if (ascensions.length !== 10)
        errors.push(`ascensions:${ascensions.length}/10`);
    if (new Set(skills.map(s => String(s.id))).size !== skills.length)
        errors.push('duplicate_skill_id');
    if (new Set(talents.map(t => String(t.id))).size !== talents.length)
        errors.push('duplicate_talent_id');
    if (new Set(ascensions.map(a => String(a.id))).size !== ascensions.length)
        errors.push('duplicate_ascension_id');
    for (const skill of skills) {
        if (!skill.id)
            errors.push('skill_missing_id');
        if (!skill.name && !skill.nameFa && !skill.name_fa)
            errors.push(`skill_missing_name:${skill.id}`);
        if (!skill.type)
            errors.push(`skill_missing_type:${skill.id}`);
        if (!skill.target && !skill.targetType)
            errors.push(`skill_missing_target:${skill.id}`);
        if (!Number.isFinite(Number(skill.unlockLevel)))
            errors.push(`skill_missing_unlock_level:${skill.id}`);
        if (!Number.isFinite(Number(skill.cooldownTurns)))
            errors.push(`skill_missing_cooldown:${skill.id}`);
        if (arr(skill.upgrades).length !== 6)
            errors.push(`skill_upgrades:${skill.id}:${arr(skill.upgrades).length}/6`);
        if (skill.type === 'single_damage' || skill.type === 'damage' || skill.type === 'single_damage_debuff' || skill.type === 'multi_target_damage' || skill.type === 'all_damage') {
            const damage = (_c = (_b = skill.damagePct) !== null && _b !== void 0 ? _b : skill.powerPct) !== null && _c !== void 0 ? _c : (_d = skill.effects) === null || _d === void 0 ? void 0 : _d.damagePct;
            if (!Number.isFinite(Number(damage)) && !Number.isFinite(Number((_e = skill.effects) === null || _e === void 0 ? void 0 : _e.damagePct)))
                errors.push(`skill_missing_damage_percent:${skill.id}`);
        }
    }
    return Object.freeze({ specializationId: String(specializationId || ''), ok: errors.length === 0, errors,
        counts: { skills: skills.length, talentBranches: branches.length, talents: talents.length, domainStages: domainStages.length, ascensions: ascensions.length } });
}
export function normalizeSpecializationContentRecord(spec = {}) {
    const id = String(spec.id || '');
    if (!SPECIALIZATION_STAT_PROFILES[id])
        throw new TypeError('unknown_specialization_contract_profile');
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
