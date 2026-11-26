/**
 * ETRANOM Character Stat Core v1.0
 * Canonical stat formulas shared by every present and future class.
 * Class identity changes the offense channel, never the underlying stat rules.
 */
const n = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const CHARACTER_STAT_CORE_VERSION = '1.2.0';
export const DAMAGE_ARCHETYPES = Object.freeze({ PHYSICAL: 'physical', MAGICAL: 'magical', HYBRID: 'hybrid', ELDRITCH: 'eldritch' });
export const ATTRIBUTE_RULES = Object.freeze({
    power: { physicalAttack: 2.2, physicalSkillPower: 2.8 },
    intellect: { magicalAttack: 5, maxMana: 8 },
    speed: { evasionPctPerPointAbove10: 0.35, evasionCapPct: 45 },
    endurance: { damageReductionPctPerPointAbove10: 0.3, damageReductionCapPct: 60 },
    vitality: { maxHpPerPoint: 10 },
    perception: { magicalAccuracyPctPerPoint: 0.3, critPctPerPoint: 0.08 },
    luck: { critPctPerPoint: 0.15 },
    faith: { maxManaPerPoint: 4, faithClassMaxManaPerPoint: 8, magicResistancePctPerPoint: 0.2, healingPctPerPoint: 0.2 }
});
/** Canonical combat profile for every implemented specialization. The profile
 * selects an offense channel only; it cannot replace shared coefficients. */
export const SPECIALIZATION_STAT_PROFILES = Object.freeze({
    warrior_sword_ascetic: Object.freeze({ classId: 'warrior', damageArchetype: DAMAGE_ARCHETYPES.PHYSICAL, primaryAttribute: 'power', primaryResource: 'stamina' }),
    warrior_iron_bastion: Object.freeze({ classId: 'warrior', damageArchetype: DAMAGE_ARCHETYPES.PHYSICAL, primaryAttribute: 'power', primaryResource: 'stamina' }),
    warrior_chaos: Object.freeze({ classId: 'warrior', damageArchetype: DAMAGE_ARCHETYPES.PHYSICAL, primaryAttribute: 'power', primaryResource: 'stamina' }),
    warrior_apocalypse_harbinger: Object.freeze({ classId: 'warrior', damageArchetype: DAMAGE_ARCHETYPES.PHYSICAL, primaryAttribute: 'power', primaryResource: 'stamina' }),
    wizard_arcane_mage: Object.freeze({ classId: 'wizard', damageArchetype: DAMAGE_ARCHETYPES.MAGICAL, primaryAttribute: 'intellect', primaryResource: 'mana' }),
    wizard_elementalist: Object.freeze({ classId: 'wizard', damageArchetype: DAMAGE_ARCHETYPES.MAGICAL, primaryAttribute: 'intellect', primaryResource: 'mana' }),
    wizard_warlock: Object.freeze({ classId: 'wizard', damageArchetype: DAMAGE_ARCHETYPES.ELDRITCH, primaryAttribute: 'intellect', primaryResource: 'mana' }),
    wizard_necromancer: Object.freeze({ classId: 'wizard', damageArchetype: DAMAGE_ARCHETYPES.ELDRITCH, primaryAttribute: 'intellect', primaryResource: 'mana' })
});
/** Materialize the shared stat calculation once at the specialization boundary.
 * All eight current runtimes receive the same canonical attack/secondary-stat
 * snapshot. Legacy `attack`/`magicPower` values are treated as base values only
 * at this explicit boundary; callers can provide baseAttack/baseMagicAttack to
 * avoid ambiguity when their saved attack is already derived. */
export function resolveSpecializationCombatActor(actor = {}, specializationId) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    const profile = SPECIALIZATION_STAT_PROFILES[String(specializationId || '')];
    if (!profile)
        throw new TypeError('unknown_specialization_stat_profile');
    if (actor.canonicalStatVersion === CHARACTER_STAT_CORE_VERSION && actor.specializationId === String(specializationId))
        return actor;
    const stats = {
        ...(actor.attributes || {}),
        ...(actor.combatStats || {}),
        ...(actor.stats || {})
    };
    for (const key of Object.keys(ATTRIBUTE_RULES)) {
        if (stats[key] == null && actor[key] != null)
            stats[key] = actor[key];
    }
    const gear = actor.gear || actor.equipmentStats || {};
    const resolved = resolveCharacterStats({
        stats, gear,
        baseAttack: (_c = (_b = (_a = actor.baseAttack) !== null && _a !== void 0 ? _a : actor.classBaseAttack) !== null && _b !== void 0 ? _b : actor.attack) !== null && _c !== void 0 ? _c : 0,
        baseMagicAttack: (_f = (_e = (_d = actor.baseMagicAttack) !== null && _d !== void 0 ? _d : actor.classBaseMagicAttack) !== null && _e !== void 0 ? _e : actor.magicPower) !== null && _f !== void 0 ? _f : 0,
        baseMaxHp: (_h = (_g = actor.baseMaxHp) !== null && _g !== void 0 ? _g : actor.classBaseMaxHp) !== null && _h !== void 0 ? _h : 0,
        baseMaxMana: (_k = (_j = actor.baseMaxMana) !== null && _j !== void 0 ? _j : actor.classBaseMaxMana) !== null && _k !== void 0 ? _k : 0,
        faithClass: actor.faithClass === true,
        damageArchetype: profile.damageArchetype,
        bonusDamageReductionPct: actor.baseDamageReductionPct
    });
    const baseAttack = n((_o = (_m = (_l = actor.baseAttack) !== null && _l !== void 0 ? _l : actor.classBaseAttack) !== null && _m !== void 0 ? _m : actor.attack) !== null && _o !== void 0 ? _o : 0);
    const baseMagicAttack = n((_r = (_q = (_p = actor.baseMagicAttack) !== null && _p !== void 0 ? _p : actor.classBaseMagicAttack) !== null && _q !== void 0 ? _q : actor.magicPower) !== null && _r !== void 0 ? _r : 0);
    const out = { ...actor, stats, gear: { ...gear }, baseAttack, baseMagicAttack, damageArchetype: profile.damageArchetype,
        specializationId: String(specializationId), classId: profile.classId,
        canonicalStatVersion: CHARACTER_STAT_CORE_VERSION,
        canonicalCombatStats: resolved,
        physicalAttack: resolved.physicalAttack,
        magicalAttack: resolved.magicalAttack,
        evasionPct: Math.max(n(actor.evasionPct), resolved.evasionPct),
        damageReductionPct: Math.max(n(actor.damageReductionPct), resolved.damageReductionPct),
        critChance: Math.max(n(actor.critChance), resolved.critChancePct),
        critChancePct: Math.max(n(actor.critChancePct), resolved.critChancePct),
        magicalAccuracyPct: Math.max(n(actor.magicalAccuracyPct), resolved.magicalAccuracyPct),
        magicResistancePct: Math.max(n(actor.magicResistancePct), resolved.magicResistancePct),
        healingBonusPct: Math.max(n(actor.healingBonusPct), resolved.healingBonusPct),
        useCanonicalStatCore: true
    };
    if (profile.damageArchetype === DAMAGE_ARCHETYPES.PHYSICAL) {
        // Martial skills scale from the shared 2.8 coefficient; normal attack
        // consumers can use physicalAttack (2.2 coefficient) explicitly.
        out.attack = resolved.physicalSkillPower;
        out.skillPower = resolved.physicalSkillPower;
    }
    else {
        out.magicPower = resolved.attackPower;
        out.skillPower = resolved.attackPower;
    }
    // Recalculate resource maxima only when an explicit base value is supplied;
    // otherwise preserve legacy saved maxima during the compatibility migration.
    if (actor.baseMaxHp != null || actor.classBaseMaxHp != null) {
        const oldMax = Math.max(1, n((_s = actor.maxHp) !== null && _s !== void 0 ? _s : actor.max_hp, resolved.maxHp));
        const ratio = clamp(n(actor.hp, oldMax) / oldMax, 0, 1);
        out.maxHp = resolved.maxHp;
        out.hp = Math.floor(resolved.maxHp * ratio);
    }
    if (actor.baseMaxMana != null || actor.classBaseMaxMana != null) {
        const oldMax = Math.max(1, n((_t = actor.maxMp) !== null && _t !== void 0 ? _t : actor.max_mp, resolved.maxMana));
        const ratio = clamp(n(actor.mp, oldMax) / oldMax, 0, 1);
        out.maxMp = resolved.maxMana;
        out.mp = Math.floor(resolved.maxMana * ratio);
    }
    return out;
}
export function resolveCharacterStats(input = {}) {
    const s = input.stats || input;
    const gear = input.gear || {};
    const value = key => Math.max(0, n(s[key]) + n(gear[key]));
    const power = value('power'), intellect = value('intellect');
    const physicalBase = Math.max(0, n(input.baseAttack) + n(gear.attack));
    const magicalBase = Math.max(0, n(input.baseMagicAttack) + n(gear.magicPower));
    const physicalAttack = physicalBase + power * ATTRIBUTE_RULES.power.physicalAttack;
    const physicalSkillPower = physicalBase + power * ATTRIBUTE_RULES.power.physicalSkillPower;
    const magicalAttack = magicalBase + intellect * ATTRIBUTE_RULES.intellect.magicalAttack;
    const archetype = String(input.damageArchetype || DAMAGE_ARCHETYPES.PHYSICAL).toLowerCase();
    let attackPower;
    if (archetype === DAMAGE_ARCHETYPES.MAGICAL || archetype === DAMAGE_ARCHETYPES.ELDRITCH)
        attackPower = magicalAttack;
    else if (archetype === DAMAGE_ARCHETYPES.HYBRID)
        attackPower = (physicalAttack + magicalAttack) / 2;
    else
        attackPower = physicalAttack;
    const faithClass = input.faithClass === true;
    const maxMana = intellect * 8 + value('faith') * (faithClass ? 8 : 4) + Math.max(0, n(input.baseMaxMana)) + Math.max(0, n(gear.mp));
    const maxHp = Math.max(1, n(input.baseMaxHp, 100) + value('vitality') * 10 + Math.max(0, n(gear.hp)));
    const evasionPct = clamp(Math.max(0, value('speed') - 10) * 0.35 + n(gear.evasionPct), 0, 45);
    const damageReductionPct = clamp(Math.max(0, value('endurance') - 10) * 0.3 + n(input.bonusDamageReductionPct), 0, 60);
    const critChancePct = clamp(value('luck') * 0.15 + value('perception') * 0.08 + n(gear.critChancePct), 0, 55);
    const magicalAccuracyPct = clamp(value('perception') * 0.3 + n(input.baseAccuracyPct, 0) + n(gear.accuracyPct), 0, 100);
    const magicResistancePct = clamp(value('faith') * 0.2 + n(gear.magicResistancePct), 0, 30);
    const healingBonusPct = clamp(value('faith') * 0.2 + n(gear.healingBonusPct), 0, 35);
    return Object.freeze({ power, intellect, physicalAttack, physicalSkillPower, magicalAttack, attackPower,
        maxHp, maxMana, evasionPct, damageReductionPct, critChancePct, magicalAccuracyPct,
        magicResistancePct, healingBonusPct, damageArchetype: archetype });
}
/** Canonical offensive channel for any class or specialization. Existing legacy
 * actors may keep their precomputed attack values; new actors opt in with
 * damageArchetype and stats so no specialization can silently use another formula. */
export function resolveActorAttackPower(actor = {}) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const archetype = String(actor.damageArchetype || DAMAGE_ARCHETYPES.PHYSICAL).toLowerCase();
    const resolved = resolveCharacterStats({
        stats: actor.stats || {}, gear: actor.gear || {},
        baseAttack: (_b = (_a = actor.baseAttack) !== null && _a !== void 0 ? _a : actor.attack) !== null && _b !== void 0 ? _b : 0,
        baseMagicAttack: (_d = (_c = actor.baseMagicAttack) !== null && _c !== void 0 ? _c : actor.magicPower) !== null && _d !== void 0 ? _d : 0,
        baseMaxHp: (_g = (_f = (_e = actor.baseMaxHp) !== null && _e !== void 0 ? _e : actor.maxHp) !== null && _f !== void 0 ? _f : actor.max_hp) !== null && _g !== void 0 ? _g : 1,
        baseMaxMana: (_k = (_j = (_h = actor.baseMaxMana) !== null && _h !== void 0 ? _h : actor.maxMp) !== null && _j !== void 0 ? _j : actor.max_mp) !== null && _k !== void 0 ? _k : 0,
        faithClass: actor.faithClass === true, damageArchetype: archetype
    });
    return Object.freeze({ ...resolved, skillPower: archetype === DAMAGE_ARCHETYPES.PHYSICAL ? resolved.physicalSkillPower : resolved.attackPower });
}
/** Canonical damage equation used by every specialization damage archetype.
 * Skill percentages are applied once to the selected offense channel, additive
 * bonuses are applied once, then target defense is mitigated with the same curve.
 */
export function resolveCanonicalSkillDamage({ attackPower = 0, damagePct = 100, percentBonus = 0, flatBonus = 0, targetDefense = 0, defenseReductionPct = 0, targetDamageReductionPct = 0, minimumDamage = 1 } = {}) {
    const power = Math.max(0, n(attackPower));
    const pct = clamp(n(damagePct), 0, 10000);
    const bonus = clamp(n(percentBonus), -90, 500);
    const penetration = clamp(n(defenseReductionPct), 0, 80);
    const damageReduction = clamp(n(targetDamageReductionPct), 0, 90);
    const defense = Math.max(0, n(targetDefense) * (1 - penetration / 100));
    const raw = Math.max(0, power * pct / 100 * (1 + bonus / 100) + n(flatBonus));
    const mitigated = raw * 100 / (100 + defense * 1.25) * (1 - damageReduction / 100);
    const damage = raw > 0 ? Math.max(Math.max(0, Math.floor(n(minimumDamage))), Math.floor(mitigated)) : 0;
    return Object.freeze({ damage, raw, effectiveDefense: defense, damagePct: pct, percentBonus: bonus, defenseReductionPct: penetration, targetDamageReductionPct: damageReduction });
}
/** Shared percentage pipeline for damage/healing/shield effects. Percentages are
 * additive bonuses, applied once, after rank scaling and before defense. */
export function resolvePercentEffect(baseValue, percent = 0, flat = 0, limits = {}) {
    const base = Math.max(0, n(baseValue));
    const pct = clamp(n(percent), n(limits.minPct, -100), n(limits.maxPct, 1000));
    return Math.max(0, Math.floor(base * (1 + pct / 100) + n(flat)));
}
export function resolveSkillEffect(baseValue, effect = {}) {
    const base = Math.max(0, n(baseValue));
    const pct = clamp(n(effect.percent), -100, 1000);
    const flat = n(effect.flat);
    const chance = clamp(n(effect.chancePct), 0, 100);
    const duration = Math.max(0, Math.floor(n(effect.durationTurns)));
    return Object.freeze({ value: Math.max(0, Math.floor(base * (1 + pct / 100) + flat)),
        chancePct: chance, durationTurns: duration,
        cooldownTurns: Math.max(0, Math.floor(n(effect.cooldownTurns))),
        resourceCost: Math.max(0, n(effect.resourceCost)),
        targetCount: Math.max(1, Math.floor(n(effect.targetCount, 1))) });
}
