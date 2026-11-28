/**
 * ETRANOM V1958 — complete authored effect profiles for the eight implemented
 * specializations. This remains shadow/reference-only; legacy combat is still
 * authoritative until server-side parity and transaction checks are complete.
 */
import { IMPLEMENTED_SPECIALIZATION_DATA_V1939 } from './shared-engine-specialization-orchestrator-v1939.js?build=2081';
import { CENTRAL_EFFECT_PLAN_SCHEMA_V1956 } from './central-combat-lifecycle-v1956.js?build=2081';
export const CENTRAL_SKILL_EFFECT_COMPILER_VERSION_V1958 = '1958.0.0';
const obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const arr = v => Array.isArray(v) ? v : [];
const n = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const canon = id => String(id || '').replace('warrior_chaos_warrior', 'warrior_chaos');
const BASE = Object.fromEntries(Object.entries(IMPLEMENTED_SPECIALIZATION_DATA_V1939).map(([id, s]) => [canon(id), s]));
const STAGE_MULTIPLIER = Object.freeze({
    wizard_arcane_mage: [1.15, 1.25, 1.35, 1.45], wizard_elementalist: [1.15, 1.25, 1.35, 1.45],
    wizard_warlock: [1.08, 1.14, 1.20, 1.28], wizard_necromancer: [1.10, 1.15, 1.20, 1.25],
    warrior_sword_ascetic: [1.15, 1.25, 1.35, 1.45], warrior_iron_bastion: [1.10, 1.15, 1.18, 1.22],
    warrior_chaos: [1.10, 1.15, 1.20, 1.25], warrior_apocalypse_harbinger: [1.05, 1.10, 1.15, 1.20]
});
const DOMAIN_STAGE_STATS = Object.freeze({
    wizard_arcane_mage: [{ magicPower: 15, manaRegen: 20, castEfficiency: 10, controlResist: 30 }, { magicPower: 25, manaRegen: 30, castEfficiency: 15, controlResist: 40 }, { magicPower: 35, manaRegen: 40, castEfficiency: 20, controlResist: 50 }, { magicPower: 45, manaRegen: 50, castEfficiency: 25, controlResist: 60 }],
    wizard_elementalist: [{ magicPower: 15, elementalDamage: 10, elementalResistance: 10 }, { magicPower: 25, elementalDamage: 15, elementalResistance: 15 }, { magicPower: 35, elementalDamage: 20, elementalResistance: 20 }, { magicPower: 45, elementalDamage: 25, elementalResistance: 25 }],
    wizard_warlock: [{ magicPower: 10, controlResist: 10 }, { magicPower: 15, controlResist: 15 }, { magicPower: 20, controlResist: 20 }, { magicPower: 25, controlResist: 25 }],
    wizard_necromancer: [{ magicPower: 10, summonPower: 10 }, { magicPower: 15, summonPower: 15 }, { magicPower: 20, summonPower: 20 }, { magicPower: 25, summonPower: 25 }],
    warrior_sword_ascetic: [{ attack: 15, accuracy: 10 }, { attack: 25, accuracy: 15 }, { attack: 35, accuracy: 20 }, { attack: 45, accuracy: 25 }],
    warrior_iron_bastion: [{ defense: 10, controlResist: 8 }, { defense: 15, controlResist: 12 }, { defense: 18, attack: 15 }, { defense: 22, attack: 20, controlResist: 15 }],
    warrior_chaos: [{ attack: 10, controlResist: 10 }, { attack: 15, controlPower: 15 }, { attack: 20, linkTransfer: 20 }, { attack: 25, controlPower: 25 }],
    warrior_apocalypse_harbinger: [{ skillPower: 5, area: 5 }, { controlDuration: 10 }, { skillPower: 15, markPower: 15 }, { skillPower: 20, ascensionChoice: 1 }]
});
const ASC_MULTIPLIER = Object.freeze({
    wizard_arcane_mage: 1, wizard_elementalist: 1, wizard_warlock: 1, wizard_necromancer: 1.35,
    warrior_sword_ascetic: 1.4, warrior_iron_bastion: 1, warrior_chaos: 1.3, warrior_apocalypse_harbinger: 1.35
});
const ASC_NUMERIC = Object.freeze({
    'wizard_arcane_mage:arcane_bolt': { damagePct: 600, splashPct: 200, defensePenetrationPct: 30 },
    'wizard_arcane_mage:arcane_shield': { shieldPct: 900, durationTurns: 4, damageReductionPct: 20, cleanseCount: 2 },
    'wizard_arcane_mage:arcane_explosion': { damagePct: 750, secondWavePct: 250, stunTurns: 1, bossSlowPct: 15 },
    'wizard_arcane_mage:arcane_blink': { evadeTurns: 2, counterDamagePct: 250, shieldPct: 300 },
    'wizard_arcane_mage:ancient_rune': { initialDamagePct: 300, finalDamagePct: 400, enemyAttackReductionPct: 20, durationTurns: 3, bossSlowPct: 10 },
    'wizard_arcane_mage:prismatic_lance': { damagePct: 800, falloffPct: 85, defenseDownPct: 20, maxTargets: 8 },
    'wizard_arcane_mage:arcane_echo': { repeats: [50, 40, 30] },
    'wizard_arcane_mage:gravity_well': { dotPct: 100, dotTurns: 6, enemyAttackReductionPct: 25, finalDamagePct: 0 },
    'wizard_arcane_mage:arcane_overload': { durationTurns: 5, magicPowerPct: 70, castEfficiencyPct: 30, manaCostReductionPct: 25 },
    'wizard_arcane_mage:arcane_singularity': { prepTurns: 1, channelTurns: 3, damagePerChannelPct: 150, finalDamagePct: 800, chargeBonusPct: 5 },
    'wizard_elementalist:ember_bolt': { damagePct: 330 }, 'wizard_elementalist:frozen_armor': { shieldPct: 396 },
    'wizard_elementalist:chain_lightning': { damagePct: 319, maxTargets: 3 }, 'wizard_elementalist:tempest': { damagePct: 209 },
    'wizard_elementalist:earth_rupture': { damagePct: 286 }, 'wizard_elementalist:tidal_renewal': { healPct: 484 },
    'wizard_elementalist:radiant_judgment': { damagePct: 506 }, 'wizard_elementalist:darkness_chains': { damagePct: 385 },
    'wizard_elementalist:elemental_fusion': { damagePct: 440 }, 'wizard_elementalist:primordial_cataclysm': { damagePct: 1056 },
    'warrior_iron_bastion:ironcleave': { damagePct: 300, executeThresholdPct: 30, executeBonusPct: 20, bossBonusPct: 10 },
    'warrior_iron_bastion:unyielding_wall': { durationTurns: 3, damageReductionPct: 35, retaliationPct: 5 },
    'warrior_iron_bastion:quake_of_iron': { damagePct: 190, slowPct: 20, bossControlPct: 10 },
    'warrior_iron_bastion:fortress_stance': { defensePct: 35, controlResistPct: 30, speedPct: -10, durationTurns: 3, shieldMaxHpPct: 8 },
    'warrior_iron_bastion:breaker_slam': { damagePct: 330, shieldBreakPct: 30, bossShieldBreakPct: 8 },
    'warrior_iron_bastion:iron_reprisal': { reflectPct: 40, durationTurns: 2, bossReflectPct: 18 },
    'warrior_iron_bastion:marching_bastion': { allyDamageReductionPct: 25, controlResistPct: 10, durationTurns: 3 },
    'warrior_iron_bastion:shatterguard': { damagePct: 260, defenseBreakPct: 25, durationTurns: 2, bossDefenseBreakPct: 10 },
    'warrior_iron_bastion:colossus_rage': { attackPct: 35, defensePct: 20, speedPct: -5, durationTurns: 3, fatigueAttackPct: -8 },
    'warrior_iron_bastion:last_bastion': { damagePct: 520, allyShieldHpPct: 10, maxShieldPct: 30 }
});
const ASC_CUSTOM = Object.freeze({
    'wizard_warlock:forbidden_signature': { damagePct: 170, attackDownPct: 8, turns: 3, reflectPct: 28, manaReturnPct: 6 },
    'wizard_warlock:stolen_moment': { sealTurns: 1, nextSkillPowerPct: 35, nextSkillCostReductionPct: 25, bossNextSkillDownPct: 20, bossCostIncreasePct: 15 },
    'wizard_warlock:demons_testament': { debtPerSkill: 2, debtDamagePct: 5, maxDebt: 8 },
    'wizard_warlock:reversal_of_sacrifice': { hpCostPct: 12, nextSkillPowerPct: 100, refundPct: 60 },
    'wizard_warlock:court_of_nameless': { allThreeJudgments: true, turns: 3, bossEffectPct: 60 },
    'wizard_warlock:hostage_heart': { linkPct: 35, healPct: 25, turns: 3, breakDamagePct: 120 },
    'wizard_warlock:erasure_from_reality': { banishTurns: 1, purgeCount: 1, bossNextSkillDownPct: 40 },
    'wizard_warlock:heir_of_hunger': { summonTurns: 4, manaDrainPct: 18, maxStoredPct: 18 },
    'wizard_warlock:true_name_shatter': { twoClauses: true, turns: 3, bossEffectPct: 65 },
    'wizard_warlock:final_covenant': { damagePct: 420, purgeCount: 1, healLostHpPct: 15, debtBonusPerTwoPct: 10, maxDebtBonusPct: 50 },
    'wizard_necromancer:death_claw': { damagePct: 220, dotPct: 22, dotTurns: 3, markedBonusPct: 20, soulOnKill: 1 },
    'wizard_necromancer:legion': { normalChancePct: 35, minibossChancePct: 12, bossChancePct: 7, maxStored: 10, maxActive: 3, permanent: true },
    'wizard_necromancer:death_memory': { attackDownPct: 15, defenseDownPct: 15, magicDownPct: 15, turns: 3, bossEffectPct: 50 },
    'wizard_necromancer:bone_blossom': { defensePct: 18, resistPct: 12, bleedChancePct: 20, bleedDamagePct: 5, turns: 3 },
    'wizard_necromancer:assembly_of_souls': { huntDamagePct: 100, guardAbsorbPct: 25, healPct: 15, manaGainPct: 10 },
    'wizard_necromancer:life_siphon': { dotPct: 30, dotTurns: 3, healFromDamagePct: 30, legionSharePct: 20, bossEffectPct: 50 },
    'wizard_necromancer:kingdom_of_bones': { attackPct: 20, critPct: 12, armorPenPct: 15, turns: 3, maxSouls: 2 },
    'wizard_necromancer:return_threshold': { reviveHpPct: 35, turns: 3, oncePerBattle: true, soulCost: 3 },
    'wizard_necromancer:soul_domination': { controlTurns: 2, chainTargets: 3, bossEffectPct: 35 },
    'wizard_necromancer:eternal_sovereign': { darkDamagePct: 20, legionPowerPct: 20, legionLifestealPct: 15, turns: 3, oncePerBattle: true },
    'warrior_sword_ascetic:black_crescent': { damageMultiplier: 1.4, extraHitPct: 55 },
    'warrior_sword_ascetic:mist_step': { evadeTurns: 2, counterPct: 220, accuracyPct: 25 },
    'warrior_sword_ascetic:soul_blade': { damageMultiplier: 1.4, defensePenetrationPct: 45 },
    'warrior_sword_ascetic:body_sword_unity': { attackPct: 35, accuracyPct: 25, turns: 4 },
    'warrior_sword_ascetic:echo': { reflectPct: 65, bossReflectCapPct: 30, turns: 1 },
    'warrior_sword_ascetic:crimson_blossom': { hits: 5, damagePerHitPct: 75, bleedPct: 20, bleedTurns: 3 },
    'warrior_sword_ascetic:mountain_river_cleave': { damageMultiplier: 1.4, defensePenetrationPct: 65, bossDamageCapPct: 30 },
    'warrior_sword_ascetic:absolute_instinct': { evadePct: 60, counterPct: 180, controlResistPct: 35, turns: 3 },
    'warrior_sword_ascetic:mind_blade': { damageMultiplier: 1.4, accuracyPct: 35, evasionDownPct: 25, defensePenetrationPct: 35 },
    'warrior_sword_ascetic:silent_finale': { damageMultiplier: 1.4, allTargets: true, executeNormalOnly: true },
    'warrior_chaos:chaos_rend': { damageMultiplier: 1.3, adjacentDamagePct: 45 },
    'warrior_chaos:primordial_rage': { attackPct: 30, rageGain: 30, synergyPct: 15, turns: 4 },
    'warrior_chaos:fractured_chance': { controlTurns: 2, controlChancePct: 100, selfCrit: 12 },
    'warrior_chaos:paradox_knot': { linkPct: 50, turns: 4, sharedStatus: true },
    'warrior_chaos:endless_wound': { dotMultiplier: 1.35, dotTurns: 4, reactiveOnActionPct: 25 },
    'warrior_chaos:broken_moments_prison': { damageMultiplier: 1.3, controlTurns: 2, finalBurstPct: 90 },
    'warrior_chaos:chaos_fangs': { hits: 4, damageMultiplier: 1.3 },
    'warrior_chaos:moment_slip': { damageReductionPct: 60, turns: 3, delayNegativeStatus: true },
    'warrior_chaos:discordant_vessel': { reflectPct: 50, turns: 3 },
    'warrior_chaos:undefined_end': { damageMultiplier: 1.3, controlTurns: 2, finalBurstPct: 160 },
    'warrior_apocalypse_harbinger:apoc_strike': { damageMultiplier: 1.35, splashPct: 55 },
    'warrior_apocalypse_harbinger:world_rift': { damageMultiplier: 1.35, dotPct: 35, dotTurns: 4, slowPct: 20, waves: 2 },
    'warrior_apocalypse_harbinger:meteor_rain': { damageMultiplier: 1.35, hits: 3, burnPct: 25, burnTurns: 2, finalBurstPct: 100 },
    'warrior_apocalypse_harbinger:existence_inversion': { controlTurns: 2, slamDamagePct: 100, controlChancePct: 100 },
    'warrior_apocalypse_harbinger:end_mark': { markTurns: 3, detonationPct: 250, splashPct: 50 },
    'warrior_apocalypse_harbinger:ruin_crown': { attackPct: 30, controlResistPct: 25, turns: 4, killResourcePct: 5 },
    'warrior_apocalypse_harbinger:captivity_dominion': { controlTurns: 2, finalSlamPct: 120, maxTargets: 5 },
    'warrior_apocalypse_harbinger:outside_time': { slowPct: 30, delayTurns: 1, finalBurstPct: 120 },
    'warrior_apocalypse_harbinger:kingfall': { damageMultiplier: 1.35, waves: 3, defenseBreakPct: 20 },
    'warrior_apocalypse_harbinger:worlds_end': { damageMultiplier: 1.35, phases: 4, finalBurstPct: 220, bossExecute: false }
});
function getSkill(specId, skillId) { var _a; return arr((_a = BASE[canon(specId)]) === null || _a === void 0 ? void 0 : _a.skills).find(s => String(s.id) === String(skillId)); }
function getAsc(specId, skillId) { var _a; return arr((_a = BASE[canon(specId)]) === null || _a === void 0 ? void 0 : _a.ascendedSkills).find(a => String(a.skillId || a.baseSkillId) === String(skillId)); }
function getPower(plan, isWizard) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const stats = obj(((_a = plan === null || plan === void 0 ? void 0 : plan.stats) === null || _a === void 0 ? void 0 : _a.stats) || (plan === null || plan === void 0 ? void 0 : plan.stats));
    return Math.max(0, n(isWizard ? ((_d = (_c = (_b = stats.magicPower) !== null && _b !== void 0 ? _b : stats.magicalAttack) !== null && _c !== void 0 ? _c : stats.attackPower) !== null && _d !== void 0 ? _d : (_e = plan === null || plan === void 0 ? void 0 : plan.stats) === null || _e === void 0 ? void 0 : _e.magicPower) : ((_h = (_g = (_f = stats.attack) !== null && _f !== void 0 ? _f : stats.physicalAttack) !== null && _g !== void 0 ? _g : stats.attackPower) !== null && _h !== void 0 ? _h : (_j = plan === null || plan === void 0 ? void 0 : plan.stats) === null || _j === void 0 ? void 0 : _j.attack)));
}
function stageIndex(domain) { return clamp(Math.floor(n(domain === null || domain === void 0 ? void 0 : domain.stage, 1)) - 1, 0, 3); }
function stageMultiplier(specId, domain) { var _a; return (domain === null || domain === void 0 ? void 0 : domain.active) === true ? (((_a = STAGE_MULTIPLIER[canon(specId)]) === null || _a === void 0 ? void 0 : _a[stageIndex(domain)]) || 1) : 1; }
function pctFrom(skill, keys, fallback = 0) { var _a; for (const k of keys)
    if ((skill === null || skill === void 0 ? void 0 : skill[k]) != null)
        return Math.max(0, n(skill[k])); for (const k of keys)
    if (((_a = skill === null || skill === void 0 ? void 0 : skill.effects) === null || _a === void 0 ? void 0 : _a[k]) != null)
        return Math.max(0, n(skill.effects[k])); return fallback; }
function durationOf(skill, fallback = 2) { var _a, _b, _c, _d, _e; return Math.max(1, Math.floor(n((_d = (_c = (_a = skill === null || skill === void 0 ? void 0 : skill.durationTurns) !== null && _a !== void 0 ? _a : (_b = skill === null || skill === void 0 ? void 0 : skill.effects) === null || _b === void 0 ? void 0 : _b.durationTurns) !== null && _c !== void 0 ? _c : skill === null || skill === void 0 ? void 0 : skill.dotTurns) !== null && _d !== void 0 ? _d : (_e = skill === null || skill === void 0 ? void 0 : skill.effects) === null || _e === void 0 ? void 0 : _e.turns, fallback))); }
function scope(plan, target = 'selected_target') { var _a; if (target === 'self')
    return 'self'; if (target === 'all_allies')
    return 'all_allies'; if (target === 'ordered_targets')
    return 'ordered_targets'; if (/تمام|همه|all|زنده/i.test(String(((_a = plan === null || plan === void 0 ? void 0 : plan.skill) === null || _a === void 0 ? void 0 : _a.target) || '')))
    return 'all_live_targets'; return 'selected_target'; }
function damage(power, pct, mult = 1) { return Math.max(0, power * Math.max(0, pct) * mult / 100); }
function mod(stat, amount, turns, scope = 'self') { return { type: 'modifier', scope, stat, amount, turns: Math.max(1, Math.floor(n(turns, 1))) }; }
function status(id, polarity, turns, extra = {}, scope = 'selected_target') { return { type: 'apply_status', scope, status: { id, polarity, turns: Math.max(1, Math.floor(n(turns, 1))), ...extra } }; }
function baseOperations(specId, skill, power, mult, plan) {
    var _a, _b, _c, _d, _e, _f, _g;
    const id = String(skill.id), type = String(skill.type || ''), fx = obj(skill.effects), duration = durationOf(skill), targetScope = scope(plan), raw = pctFrom(skill, ['damagePct', 'powerPct']);
    const dmg = (v = raw) => ({ type: 'damage', scope: targetScope, amount: damage(power, v, mult) });
    const allDmg = (v = raw) => ({ type: 'damage', scope: 'all_live_targets', amount: damage(power, v, mult) });
    const out = [];
    switch (type) {
        case 'single_damage':
            out.push(dmg());
            break;
        case 'damage':
            out.push(dmg());
            if (duration > 1)
                out.push(status(`death_wound:${id}`, 'negative', duration, { dotDamage: damage(power, 22, mult) }));
            break;
        case 'shield':
            out.push({ type: 'shield', scope: 'self', amount: damage(power, pctFrom(skill, ['shieldPct', 'damagePct'], 180), mult) });
            break;
        case 'all_damage':
            out.push(allDmg());
            break;
        case 'evasion_counter':
            out.push({ type: 'reaction', reaction: 'counter', amount: damage(power, pctFrom(skill, ['counterDamagePct'], 0), mult), turns: duration });
            out.push(status(`evade:${id}`, 'positive', duration, { evadeNextAttack: true }, 'self'));
            break;
        case 'all_control_damage':
            out.push(allDmg());
            out.push(mod('attack', -pctFrom(skill, ['enemyAttackReductionPct'], 15), duration, 'all_live_targets'));
            out.push(status(`slow:${id}`, 'negative', Math.max(1, n(skill.slowTurns, 2)), { slowPct: 15 }, 'all_live_targets'));
            break;
        case 'multi_target_damage': {
            const max = Math.max(1, Math.floor(n(skill.maxTargets, 5)));
            out.push({ type: 'damage', scope: /همه|تمام|all/i.test(String(skill.target || '')) ? 'all_live_targets' : 'ordered_targets', amount: damage(power, raw, mult), maxTargets: max, falloffPct: n(skill.falloffPct, 100) });
            break;
        }
        case 'repeat_last_spell':
            out.push(status(`repeat_next:${id}`, 'positive', 1, { repeatLastSpellPct: pctFrom(skill, ['repeatPct'], 40) }, 'self'));
            break;
        case 'all_dot_control':
            out.push(status(`dot:${id}`, 'negative', Math.max(1, n(skill.dotTurns, 3)), { dotDamage: damage(power, pctFrom(skill, ['dotPct'], 45), mult) }, 'all_live_targets'));
            out.push(mod('attack', -pctFrom(skill, ['enemyAttackReductionPct'], 15), duration, 'all_live_targets'));
            break;
        case 'self_buff': {
            const aliases = [['attackPct', 'attack'], ['magicPowerPct', 'magicPower'], ['defensePct', 'defense'], ['castSpeedPct', 'castSpeed'], ['castEfficiencyPct', 'castEfficiency'], ['manaCostReductionPct', 'manaCostReduction'], ['controlResistPct', 'controlResist'], ['controlResistancePct', 'controlResist'], ['speedPct', 'speed']];
            for (const [k, s] of aliases) {
                const v = n((_a = fx[k]) !== null && _a !== void 0 ? _a : skill[k]);
                if (v)
                    out.push(mod(s, v * mult, duration));
            }
            if (!out.length)
                out.push(status(`empower:${id}`, 'positive', duration, { powerPct: 20 * mult }, 'self'));
            break;
        }
        case 'ultimate_all_damage':
            out.push({ type: 'damage', scope: 'all_live_targets', amount: damage(power, pctFrom(skill, ['initialDamagePct'], raw * .45), mult) });
            out.push({ type: 'damage', scope: 'all_live_targets', amount: damage(power, raw, mult) });
            break;
        case 'all_damage_control':
            out.push(allDmg());
            out.push(status(`control:${id}`, 'negative', duration, { control: true, controlChancePct: 35 }, 'all_live_targets'));
            break;
        case 'all_damage_debuff':
            out.push(allDmg());
            out.push(mod('defense', -15, duration, 'all_live_targets'));
            break;
        case 'self_heal_cleanse':
            out.push({ type: 'heal', scope: 'self', amount: damage(power, raw, mult) });
            out.push({ type: 'remove_status', scope: 'self', polarity: 'negative' });
            break;
        case 'single_damage_cleanse':
            out.push(dmg());
            out.push({ type: 'remove_status', scope: 'self', polarity: 'negative' });
            break;
        case 'single_damage_drain':
            out.push(dmg());
            out.push({ type: 'resource_gain', resource: 'mana', amount: damage(power, raw * .15, mult) });
            break;
        case 'dual_element_combo':
            out.push({ type: 'multi_hit', scope: targetScope === 'all_live_targets' ? 'all_live_targets' : 'selected_target', hits: 2, amount: damage(power, raw * .6, mult) });
            break;
        case 'control':
            out.push(status(`control:${id}`, 'negative', duration, { control: true, controlTurns: n(fx.controlTurns, 1), controlChancePct: 100 }, targetScope));
            break;
        case 'stance':
            out.push(mod('magicPower', 3, duration));
            out.push(status(`pact_debt:${id}`, 'positive', Math.max(1, duration), { debtPerSkill: 1, maxStacks: 8 }, 'self'));
            break;
        case 'empower':
            out.push(status(`next_skill_empower:${id}`, 'positive', 1, { nextSkillPowerPct: 55, hpCostPct: 7, refundPct: 35 }, 'self'));
            break;
        case 'choice_control':
            out.push(status(`judgment:${id}`, 'negative', duration, { choices: ['silence', 'reprisal', 'confiscation'], choiceRequired: true }, 'all_live_targets'));
            break;
        case 'link':
            out.push(status(`link:${id}`, 'negative', duration, { linkPct: n(fx.linkPct, 22), linkedTo: 'actor' }, targetScope));
            break;
        case 'purge':
            out.push({ type: 'remove_status', scope: targetScope, polarity: 'positive', statusIds: [] });
            out.push(status(`erasure:${id}`, 'negative', 1, { banished: true }, targetScope));
            break;
        case 'summon_resource':
            out.push({ type: 'summon', maxSummons: 3, summon: { id: `${id}_hunger`, name: 'موجود گرسنگی', hp: Math.max(1, Math.round(power * .5)), turns: Math.max(1, n(skill.durationTurns, 3)), manaDrainPct: 2 } });
            break;
        case 'true_name_debuff':
            out.push(status(`true_name:${id}`, 'negative', duration, { clauses: ['body', 'will', 'magic', 'bond'], choiceRequired: true }, targetScope));
            break;
        case 'ultimate_choice':
            out.push(allDmg(pctFrom(skill, ['damagePct'], 360)));
            out.push({ type: 'remove_status', scope: 'all_live_targets', polarity: 'positive' });
            out.push({ type: 'heal', scope: 'self', amount: damage(power, 15, mult) });
            break;
        case 'permanent_recruit':
            out.push(status(`legion_recruit:${id}`, 'positive', 99, { recruit: true, normalChancePct: 35, minibossChancePct: 12, bossChancePct: 7, maxStored: 10, maxActive: 3 }, 'self'));
            break;
        case 'debuff_choice':
            out.push(status(`memory:${id}`, 'negative', duration, { choices: ['attack_down', 'defense_down', 'magic_down'], choiceRequired: true, bossEffectPct: 50 }, targetScope));
            break;
        case 'legion_defense_buff':
            out.push(mod('defense', 18 * mult, duration, 'all_allies'));
            out.push(mod('controlResist', 12 * mult, duration, 'all_allies'));
            break;
        case 'soul_command':
            out.push(status(`soul_command:${id}`, 'positive', 1, { choices: ['hunt', 'guard', 'feed'], choiceRequired: true }, 'self'));
            break;
        case 'life_steal':
            out.push(status(`life_siphon:${id}`, 'negative', duration, { dotDamage: damage(power, 30, mult), healFromDamagePct: 30 }, targetScope));
            break;
        case 'legion_offense_buff':
            out.push(mod('attack', 20 * mult, duration, 'all_allies'));
            out.push(mod('armorPen', 15 * mult, duration, 'all_allies'));
            break;
        case 'self_revive':
            out.push(status(`death_ward:${id}`, 'positive', 3, { reviveHpPct: 25, oncePerBattle: true, soulCost: 3 }, 'self'));
            break;
        case 'control_choice':
            out.push(status(`soul_control:${id}`, 'negative', 3, { choices: ['dominate', 'chain', 'silence'], choiceRequired: true, bossEffectPct: 35 }, targetScope));
            break;
        case 'ultimate_form':
            out.push(mod('magicPower', 20 * mult, duration));
            out.push(mod('legionPower', 20 * mult, duration, 'all_allies'));
            out.push(status(`eternal_sovereign:${id}`, 'positive', duration, { legionLifestealPct: 15 }, 'self'));
            break;
        case 'reflect_next':
            out.push({ type: 'reaction', reaction: 'reflect', amountPct: pctFrom(skill, ['reflectPct'], 45), turns: 1 });
            break;
        case 'multi_hit': {
            const hits = clamp(Math.floor(n(skill.hits, 3)), 1, 12);
            out.push({ type: 'multi_hit', scope: targetScope, hits, amount: damage(power, pctFrom(skill, ['damagePerHitPct'], 75), mult) });
            break;
        }
        case 'all_damage_execute':
            out.push(allDmg());
            out.push(status(`execute_guard:${id}`, 'negative', 1, { executeNormalOnly: true, bossImmune: true }, 'all_live_targets'));
            break;
        case 'self_guard':
            out.push({ type: 'reaction', reaction: 'absorb', amountPct: pctFrom(fx, ['damageReductionPct'], 22) * mult, turns: duration });
            break;
        case 'counter':
            out.push({ type: 'reaction', reaction: 'reflect', amountPct: pctFrom(fx, ['reflectPct'], 30) * mult, turns: duration });
            break;
        case 'team_guard':
            out.push(mod('damageReductionPct', pctFrom(fx, ['allyDamageReductionPct'], 14) * mult, duration, 'all_allies'));
            break;
        case 'single_damage_debuff':
            out.push(dmg());
            out.push(mod('defense', -pctFrom(fx, ['defenseBreakPct'], 15) * mult, duration, targetScope));
            if (n(fx.markTurns) > 0)
                out.push(status(`mark:${id}`, 'negative', n(fx.markTurns), { marked: true }, targetScope));
            break;
        case 'ultimate_aoe':
            out.push(allDmg());
            out.push({ type: 'shield', scope: 'self', amount: damage(power, pctFrom(fx, ['maxShieldPct'], 24), mult) });
            break;
        case 'damage_over_time':
            out.push(status(`dot:${id}`, 'negative', n(fx.turns, 3), { dotDamage: damage(power, pctFrom(fx, ['dotPct'], 38), mult) }, targetScope));
            break;
        case 'aoe_control':
            out.push(allDmg());
            out.push(status(`control:${id}`, 'negative', n(fx.controlTurns, 1), { control: true }, 'all_live_targets'));
            break;
        case 'multi_damage':
            out.push({ type: 'multi_hit', scope: 'all_live_targets', hits: clamp(n(fx.hits, 3), 1, 12), amount: damage(power, pctFrom(fx, ['damagePct'], 115) / Math.max(1, n(fx.hits, 3)), mult) });
            break;
        case 'evasion':
            out.push(mod('damageReductionPct', pctFrom(fx, ['damageReductionPct'], 45) * mult, duration, 'self'));
            out.push(status(`evasion:${id}`, 'positive', duration, { delayNegativeStatus: true }, 'self'));
            break;
        case 'passive':
            out.push({ type: 'reaction', reaction: 'reflect', amountPct: pctFrom(fx, ['reactivePct'], 35) * mult, turns: duration });
            break;
        case 'line_damage':
            out.push({ type: 'damage', scope: 'ordered_targets', amount: damage(power, raw, mult), maxTargets: 4 });
            out.push(status(`rift:${id}`, 'negative', duration, { dotDamage: damage(power, 20, mult), slowPct: 15 }, 'ordered_targets'));
            break;
        case 'area_damage':
            out.push(allDmg());
            out.push(status(`burn:${id}`, 'negative', 2, { dotDamage: damage(power, 20, mult) }, 'all_live_targets'));
            break;
        case 'mark':
            out.push(status(`mark:${id}`, 'negative', 3, { marked: true, detonationPct: 150, stacking: true }, targetScope));
            break;
        case 'ultimate':
            out.push(allDmg());
            out.push(status(`control:${id}`, 'negative', n(fx.controlTurns, 1), { control: true, bossControlReduced: true }, 'all_live_targets'));
            break;
        default: throw new Error(`skill_type_adapter_missing:${specId}:${id}:${type}`);
    }
    // Explicit secondary mechanics retained from the source skill records.
    if (n((_b = fx.armorPenPct) !== null && _b !== void 0 ? _b : skill.armorPenPct) > 0)
        out.push(status(`armor_pen:${id}`, 'positive', 1, { defensePenetrationPct: n((_c = fx.armorPenPct) !== null && _c !== void 0 ? _c : skill.armorPenPct) }, 'self'));
    if (n((_d = fx.defenseBreakPct) !== null && _d !== void 0 ? _d : skill.defenseReductionPct) > 0 && !out.some(o => o.type === 'modifier' && o.stat === 'defense'))
        out.push(mod('defense', -n((_e = fx.defenseBreakPct) !== null && _e !== void 0 ? _e : skill.defenseReductionPct), duration, targetScope));
    if (n((_f = fx.bonusVsArmoredPct) !== null && _f !== void 0 ? _f : skill.bonusVsArmoredPct) > 0)
        out.push(status(`armored_bonus:${id}`, 'positive', 1, { bonusVsArmoredPct: n((_g = fx.bonusVsArmoredPct) !== null && _g !== void 0 ? _g : skill.bonusVsArmoredPct) }, 'self'));
    if (n(fx.rageGain) > 0)
        out.push({ type: 'resource_gain', resource: 'energy', amount: n(fx.rageGain) });
    if (n(skill.chargeGain) > 0)
        out.push(status(`arcane_charge:${id}`, 'positive', 1, { chargeGain: n(skill.chargeGain) }, 'self'));
    if (n(fx.selfCrit) > 0 && !out.some(o => o.stat === 'critChance'))
        out.push(mod('critChance', n(fx.selfCrit), duration, 'self'));
    if (n(fx.slowPct) > 0 && !out.some(o => { var _a; return (_a = o.status) === null || _a === void 0 ? void 0 : _a.slowPct; }))
        out.push(status(`slow:${id}`, 'negative', duration, { slowPct: n(fx.slowPct) }, targetScope));
    return out;
}
function ascendedOperations(specId, baseSkill, form, power, stageMult, plan) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const key = `${canon(specId)}:${baseSkill.id}`, numeric = ASC_NUMERIC[key] || {}, custom = ASC_CUSTOM[key] || {};
    const domainStage = stageIndex(plan.domain) + 1;
    const stageName = ({ 2: 'mastery', 3: 'ascension', 4: 'absolute' })[domainStage];
    const stageOverride = stageName ? obj((_a = form === null || form === void 0 ? void 0 : form.stages) === null || _a === void 0 ? void 0 : _a[stageName]) : {};
    const merged = { ...baseSkill, ...numeric, ...obj(form), ...stageOverride, ...custom, type: baseSkill.type, id: baseSkill.id };
    const ascMult = ASC_MULTIPLIER[canon(specId)] || 1.3;
    const effectiveMult = stageMult * (1 + n(stageOverride.damageBonusPct, 0) / 100);
    // Numeric ascended definitions authored in source take precedence. For legacy
    // forms with descriptive-only text, the explicit V1958 coefficient is used.
    if (merged.damageMultiplier)
        merged.powerPct = n((_c = (_b = baseSkill.powerPct) !== null && _b !== void 0 ? _b : baseSkill.damagePct) !== null && _c !== void 0 ? _c : (_d = baseSkill.effects) === null || _d === void 0 ? void 0 : _d.damagePct, 100) * merged.damageMultiplier;
    else if (merged.damagePct == null && merged.powerPct == null && merged.damagePerHitPct == null && merged.healPct == null && merged.shieldPct == null && ['single_damage', 'damage', 'all_damage', 'all_damage_control', 'all_damage_debuff', 'multi_target_damage', 'line_damage', 'area_damage', 'ultimate', 'ultimate_aoe', 'ultimate_all_damage', 'all_damage_execute', 'multi_damage', 'aoe_control', 'single_damage_debuff'].includes(baseSkill.type))
        merged.powerPct = n((_f = (_e = baseSkill.powerPct) !== null && _e !== void 0 ? _e : baseSkill.damagePct) !== null && _f !== void 0 ? _f : (_g = baseSkill.effects) === null || _g === void 0 ? void 0 : _g.damagePct, 100) * ascMult;
    if (merged.damagePct != null)
        merged.powerPct = merged.damagePct;
    if (merged.shieldPct != null)
        merged.effects = { ...(baseSkill.effects || {}), shieldPct: merged.shieldPct };
    if (merged.hits != null)
        merged.effects = { ...(baseSkill.effects || {}), hits: merged.hits };
    if (merged.dotPct != null)
        merged.effects = { ...(baseSkill.effects || {}), dotPct: merged.dotPct, turns: merged.dotTurns || merged.turns || baseSkill.durationTurns || 3 };
    let ops = baseOperations(specId, merged, power, effectiveMult, plan);
    const extra = [];
    if (merged.splashPct)
        extra.push({ type: 'damage', scope: 'all_live_targets', amount: damage(power, merged.splashPct, effectiveMult) });
    if (merged.secondWavePct)
        extra.push({ type: 'damage', scope: 'all_live_targets', amount: damage(power, merged.secondWavePct, effectiveMult) });
    if (merged.thirdWavePct)
        extra.push({ type: 'damage', scope: 'all_live_targets', amount: damage(power, merged.thirdWavePct, effectiveMult) });
    if (merged.finalBurstPct)
        extra.push({ type: 'damage', scope: 'all_live_targets', amount: damage(power, merged.finalBurstPct, effectiveMult) });
    if (merged.finalDamagePct)
        extra.push({ type: 'damage', scope: 'all_live_targets', amount: damage(power, merged.finalDamagePct, effectiveMult) });
    if (merged.initialDamagePct && baseSkill.type === 'all_control_damage') {
        for (const op of ops)
            if (op.type === 'damage')
                op.amount = damage(power, merged.initialDamagePct, stageMult);
    }
    if (merged.damagePct && baseSkill.type === 'ultimate_choice') {
        for (const op of ops)
            if (op.type === 'damage')
                op.amount = damage(power, merged.damagePct, stageMult);
    }
    if (merged.enemyAttackReductionPct)
        extra.push(mod('attack', -merged.enemyAttackReductionPct, merged.durationTurns || 3, 'all_live_targets'));
    if (merged.defenseDownPct || merged.defenseBreakPct)
        extra.push(mod('defense', -(merged.defenseDownPct || merged.defenseBreakPct), merged.durationTurns || 2, 'all_live_targets'));
    if (merged.attackDownPct)
        extra.push(mod('attack', -merged.attackDownPct, merged.turns || 3, 'selected_target'));
    if (merged.reflectPct)
        extra.push({ type: 'reaction', reaction: 'reflect', amountPct: merged.reflectPct, turns: merged.turns || 2 });
    if (merged.damageReductionPct)
        extra.push(mod('damageReductionPct', merged.damageReductionPct, merged.turns || 2, 'self'));
    if (merged.attackPct)
        extra.push(mod('attack', merged.attackPct, merged.turns || 3, 'self'));
    if (merged.accuracyPct)
        extra.push(mod('accuracy', merged.accuracyPct, merged.turns || 3, 'self'));
    if (merged.selfCrit)
        extra.push(mod('critChance', merged.selfCrit, merged.turns || 2, 'self'));
    if (merged.slowPct)
        extra.push(status(`slow:${baseSkill.id}`, 'negative', merged.turns || 2, { slowPct: merged.slowPct }, 'all_live_targets'));
    if (merged.defensePct)
        extra.push(mod('defense', merged.defensePct, merged.turns || 3, 'self'));
    if (merged.controlResistPct)
        extra.push(mod('controlResist', merged.controlResistPct, merged.turns || 3, 'self'));
    if (merged.dotPct && !ops.some(o => { var _a; return o.type === 'apply_status' && String((_a = o.status) === null || _a === void 0 ? void 0 : _a.id).includes('dot'); }))
        extra.push(status(`asc_dot:${baseSkill.id}`, 'negative', merged.dotTurns || merged.turns || 3, { dotDamage: damage(power, merged.dotPct, effectiveMult) }, 'selected_target'));
    if (merged.controlTurns)
        extra.push(status(`asc_control:${baseSkill.id}`, 'negative', merged.controlTurns, { control: true }, 'all_live_targets'));
    if (merged.cleanseCount)
        extra.push({ type: 'remove_status', scope: 'self', polarity: 'negative', maxCount: merged.cleanseCount });
    if (merged.healPct && baseSkill.type === 'self_heal_cleanse') {
        for (const op of ops)
            if (op.type === 'heal')
                op.amount = damage(power, merged.healPct, effectiveMult);
    }
    else if (merged.healPct)
        extra.push({ type: 'heal', scope: 'self', amount: damage(power, merged.healPct, effectiveMult) });
    if (merged.evasionDownPct)
        extra.push(mod('evasion', -merged.evasionDownPct, merged.turns || 2, 'selected_target'));
    if (merged.counterPct)
        extra.push({ type: 'reaction', reaction: 'counter', amount: damage(power, merged.counterPct, effectiveMult), turns: merged.evadeTurns || 2 });
    if (merged.evadeTurns || merged.evadePct)
        extra.push(status(`asc_evasion:${baseSkill.id}`, 'positive', merged.evadeTurns || merged.turns || 2, { evadeTurns: merged.evadeTurns || 2, evadePct: merged.evadePct || 100 }, 'self'));
    if (merged.shieldBreakPct)
        extra.push(status(`shield_break:${baseSkill.id}`, 'negative', 1, { shieldBreakPct: merged.shieldBreakPct, bossShieldBreakPct: merged.bossShieldBreakPct || null }, 'selected_target'));
    if (merged.executeThresholdPct)
        extra.push(status(`execute_rule:${baseSkill.id}`, 'positive', 1, { executeThresholdPct: merged.executeThresholdPct, executeBonusPct: merged.executeBonusPct, bossBonusPct: merged.bossBonusPct }, 'self'));
    if (merged.bleedPct)
        extra.push(status(`bleed:${baseSkill.id}`, 'negative', merged.bleedTurns || 3, { dotDamage: damage(power, merged.bleedPct, effectiveMult) }, 'selected_target'));
    if (merged.soulOnKill)
        extra.push(status(`soul_on_kill:${baseSkill.id}`, 'positive', 1, { soulOnKill: merged.soulOnKill }, 'self'));
    if (merged.bossDamageCapPct)
        extra.push(status(`boss_cap:${baseSkill.id}`, 'positive', 1, { bossDamageCapPct: merged.bossDamageCapPct }, 'self'));
    if (merged.reactiveOnActionPct)
        extra.push(status(`reactive_wound:${baseSkill.id}`, 'negative', merged.dotTurns || 4, { reactiveOnActionPct: merged.reactiveOnActionPct }, 'selected_target'));
    if (merged.delayNegativeStatus)
        extra.push(status(`delay_debuff:${baseSkill.id}`, 'positive', merged.turns || 3, { delayNegativeStatus: true }, 'self'));
    if (merged.markBonusPct)
        extra.push(status(`mark_bonus:${baseSkill.id}`, 'positive', merged.turns || 3, { markBonusPct: merged.markBonusPct }, 'self'));
    if (merged.allThreeJudgments)
        extra.push(status(`three_judgments:${baseSkill.id}`, 'negative', merged.turns || 3, { judgments: ['silence', 'reprisal', 'confiscation'], bossEffectPct: merged.bossEffectPct || 60 }, 'all_live_targets'));
    if (merged.defensePenetrationPct || merged.armorPenPct)
        extra.push(status(`armor_pen:${baseSkill.id}`, 'positive', 1, { defensePenetrationPct: merged.defensePenetrationPct || merged.armorPenPct }, 'self'));
    if (merged.maxTargets)
        for (const op of ops)
            if (op.scope === 'ordered_targets' || op.scope === 'all_live_targets')
                op.maxTargets = merged.maxTargets;
    if (merged.falloffPct)
        for (const op of ops)
            if (op.type === 'damage' && op.scope === 'ordered_targets')
                op.falloffPct = merged.falloffPct;
    if (merged.echoPct)
        extra.push({ type: 'damage', scope: 'selected_target', amount: damage(power, merged.damagePct * merged.echoPct / 100, effectiveMult) });
    if (merged.returnWavePct)
        extra.push({ type: 'damage', scope: 'all_live_targets', amount: damage(power, merged.returnWavePct, effectiveMult) });
    if (merged.bossSlowPct)
        extra.push(status(`boss_slow:${baseSkill.id}`, 'negative', 2, { bossSlowPct: merged.bossSlowPct }, 'all_live_targets'));
    if (merged.adjacentDamagePct)
        extra.push({ type: 'damage', scope: 'all_live_targets', amount: damage(power, merged.adjacentDamagePct, effectiveMult) });
    if (merged.slamDamagePct)
        extra.push({ type: 'damage', scope: 'all_live_targets', amount: damage(power, merged.slamDamagePct, effectiveMult) });
    if (merged.detonationPct)
        extra.push(status(`detonation:${baseSkill.id}`, 'negative', merged.markTurns || 3, { detonationPct: merged.detonationPct }, 'selected_target'));
    if (merged.summonTurns)
        extra.push({ type: 'summon', maxSummons: 3, summon: { id: `${baseSkill.id}_asc_summon`, name: 'تجلی تعالی', hp: Math.max(1, Math.round(power)), turns: merged.summonTurns } });
    if (merged.permanent)
        extra.push(status(`legion_asc:${baseSkill.id}`, 'positive', 99, { recruitChance: { normal: merged.normalChancePct, miniboss: merged.minibossChancePct, boss: merged.bossChancePct }, maxStored: merged.maxStored, maxActive: merged.maxActive, permanent: true }, 'self'));
    if (merged.reviveHpPct)
        extra.push(status(`death_ward:${baseSkill.id}`, 'positive', merged.turns || 3, { reviveHpPct: merged.reviveHpPct, oncePerBattle: true }, 'self'));
    if (merged.nextSkillPowerPct)
        extra.push(status(`next_skill:${baseSkill.id}`, 'positive', 1, { powerPct: merged.nextSkillPowerPct, costReductionPct: merged.nextSkillCostReductionPct || 0 }, 'self'));
    if (merged.linkPct)
        extra.push(status(`asc_link:${baseSkill.id}`, 'negative', merged.turns || 3, { linkPct: merged.linkPct }, 'selected_target'));
    if (merged.debtPerSkill)
        extra.push(status(`asc_debt:${baseSkill.id}`, 'positive', 8, { debtPerSkill: merged.debtPerSkill, debtDamagePct: merged.debtDamagePct, maxStacks: merged.maxDebt }, 'self'));
    if (merged.hits) {
        const hitOp = ops.find(o => o.type === 'multi_hit');
        if (hitOp) {
            hitOp.hits = clamp(merged.hits, 1, 12);
            if (merged.damagePerHitPct)
                hitOp.amount = damage(power, merged.damagePerHitPct, effectiveMult);
        }
    }
    if (merged.channelTurns && merged.channelTurns > 1)
        for (let i = 1; i < Math.min(merged.channelTurns, 4); i++)
            extra.push({ type: 'damage', scope: 'all_live_targets', amount: damage(power, merged.damagePerChannelPct || 150, stageMult) });
    if (merged.waves && merged.waves > 1)
        for (let i = 1; i < Math.min(merged.waves, 4); i++)
            extra.push({ type: 'damage', scope: 'all_live_targets', amount: damage(power, n((_j = (_h = merged.powerPct) !== null && _h !== void 0 ? _h : merged.damagePct) !== null && _j !== void 0 ? _j : baseSkill.powerPct, 100) * .35, effectiveMult) });
    if (merged.purgeCount)
        extra.push({ type: 'remove_status', scope: 'all_live_targets', polarity: 'positive', maxCount: merged.purgeCount });
    if (merged.damagePct && baseSkill.type === 'multi_target_damage')
        for (const op of ops)
            if (op.type === 'damage')
                op.amount = damage(power, merged.damagePct, stageMult);
    if (merged.damagePct && baseSkill.type === 'ultimate_all_damage')
        for (const op of ops)
            if (op.type === 'damage')
                op.amount = damage(power, merged.damagePct, stageMult);
    if (merged.huntDamagePct)
        extra.push({ type: 'damage', scope: 'all_live_targets', amount: damage(power, merged.huntDamagePct, effectiveMult) });
    if (merged.healLostHpPct)
        extra.push({ type: 'heal', scope: 'self', amount: damage(power, merged.healLostHpPct, effectiveMult) });
    return [...ops, ...extra];
}
export function auditCentralSkillEffectCoverageV1958() {
    const rows = [];
    for (const [specializationId, spec] of Object.entries(BASE))
        for (const skill of arr(spec.skills)) {
            const form = getAsc(specializationId, skill.id);
            rows.push({ specializationId, skillId: skill.id, type: skill.type, hasAscendedForm: !!form, ascendedId: (form === null || form === void 0 ? void 0 : form.id) || null, baseAdapter: 'authored', ascendedAdapter: 'authored' });
        }
    const missing = rows.filter(r => !r.hasAscendedForm);
    return Object.freeze({ version: CENTRAL_SKILL_EFFECT_COMPILER_VERSION_V1958, totalSkills: rows.length, baseAdapters: rows.length, ascendedForms: rows.filter(r => r.hasAscendedForm).length, missingAscendedForms: missing.length, domainStageProfiles: Object.keys(DOMAIN_STAGE_STATS).length, parityVerified: false, executionAuthority: 'shadow_only', rows: Object.freeze(rows.map(Object.freeze)) });
}
export function buildCentralSkillEffectCatalogV1958({ referencePower = 1000 } = {}) {
    const rows = [];
    for (const [specializationId, spec] of Object.entries(BASE))
        for (const skill of arr(spec.skills)) {
            const form = getAsc(specializationId, skill.id);
            const basePlan = compileCentralSkillEffectPlanV1958({ specializationId, skillId: skill.id, skill, stats: { attack: referencePower, magicPower: referencePower, stats: { attack: referencePower, magicPower: referencePower } }, domain: { active: false } }, {});
            const ascPlan = compileCentralSkillEffectPlanV1958({ specializationId, skillId: skill.id, skill, stats: { attack: referencePower, magicPower: referencePower, stats: { attack: referencePower, magicPower: referencePower } }, domain: { active: true, stage: 4, ascensionId: form.id } }, {});
            rows.push(Object.freeze({ specializationId, skillId: skill.id, skillName: skill.name || skill.id, skillType: skill.type, base: { operations: basePlan.operations }, ascended: { id: form.id, name: form.name || form.id, description: form.description || '', operations: ascPlan.operations } }));
        }
    return Object.freeze({ version: CENTRAL_SKILL_EFFECT_COMPILER_VERSION_V1958, referencePower, skills: rows.length, rows: Object.freeze(rows) });
}
export function resolveCentralDomainProfileV1958(specializationId, stage = 1) {
    var _a, _b, _c, _d;
    const id = canon(specializationId), spec = BASE[id];
    if (!spec)
        throw new Error('specialization_not_implemented');
    const index = clamp(Math.floor(n(stage, 1)) - 1, 0, 3), record = arr((_a = spec.domain) === null || _a === void 0 ? void 0 : _a.stages)[index];
    if (!record)
        throw new Error('domain_stage_missing');
    return Object.freeze({ specializationId: id, stage: index + 1, unlockLevel: n((_b = record.unlockLevel) !== null && _b !== void 0 ? _b : record.level, 25), durationTurns: n((_c = record.durationPlayerTurns) !== null && _c !== void 0 ? _c : record.durationTurns, 5), multiplier: ((_d = STAGE_MULTIPLIER[id]) === null || _d === void 0 ? void 0 : _d[index]) || 1, stats: Object.freeze({ ...DOMAIN_STAGE_STATS[id][index] }), stageRecord: record });
}
export function compileCentralDomainActivationPlanV1958(specializationId, stage = 1) {
    const profile = resolveCentralDomainProfileV1958(specializationId, stage), operations = [];
    for (const [stat, amount] of Object.entries(profile.stats))
        if (typeof amount === 'number' && amount !== 0)
            operations.push(mod(stat, amount, profile.durationTurns, 'self'));
    const id = profile.specializationId;
    if (id === 'wizard_arcane_mage' && profile.stage >= 3)
        operations.push(status('domain_core_wave', 'positive', profile.durationTurns, { periodicDamagePct: profile.stage === 4 ? 50 : 30, intervalTurns: profile.stage === 4 ? 2 : 1 }, 'self'));
    if (id === 'warrior_sword_ascetic')
        operations.push(status('thousand_swords_wave', 'positive', profile.durationTurns, { periodicDamagePct: profile.stage === 1 ? 15 : profile.stage === 2 ? 20 : profile.stage === 3 ? 25 : 30, intervalTurns: profile.stage === 1 ? 2 : 1 }, 'self'));
    if (id === 'warrior_apocalypse_harbinger' && profile.stage >= 3)
        operations.push(status('end_mark_domain_amp', 'positive', profile.durationTurns, { markBonusPct: profile.stage === 4 ? 20 : 15 }, 'self'));
    return Object.freeze({ schema: CENTRAL_EFFECT_PLAN_SCHEMA_V1956, specializationId: id, skillId: '__domain_activation__', operations, domainProfile: profile, compilerVersion: CENTRAL_SKILL_EFFECT_COMPILER_VERSION_V1958 });
}
export function compileCentralSkillEffectPlanV1958(plan, state = {}, context = {}) {
    const specId = canon(plan === null || plan === void 0 ? void 0 : plan.specializationId), skillId = String((plan === null || plan === void 0 ? void 0 : plan.skillId) || ''), spec = BASE[specId];
    if (!spec)
        throw new Error(`specialization_not_implemented:${specId}`);
    const base = getSkill(specId, skillId);
    if (!base)
        throw new Error(`skill_not_found:${specId}:${skillId}`);
    const domain = obj(plan.domain), active = domain.active === true, stage = active ? stageIndex(domain) + 1 : 1;
    const selectedId = String(domain.ascensionId || domain.selectedAscensionId || '');
    const form = selectedId ? arr(spec.ascendedSkills).find(a => String(a.id) === selectedId) : null;
    if (selectedId && (!active || !form || String(form.skillId || form.baseSkillId) !== skillId))
        throw new Error('ascension_form_skill_mismatch');
    const power = getPower(plan, specId.startsWith('wizard_'));
    const multiplier = stageMultiplier(specId, domain);
    const skillForBase = { ...base, ...obj(plan.skill), id: skillId, type: base.type };
    let operations;
    if (form)
        operations = ascendedOperations(specId, base, form, power, multiplier, plan);
    else
        operations = baseOperations(specId, skillForBase, power, multiplier, plan);
    if (!operations.length)
        throw new Error(`empty_effect_plan:${specId}:${skillId}`);
    if (operations.length > 64)
        throw new Error('effect_plan_too_large');
    return { schema: CENTRAL_EFFECT_PLAN_SCHEMA_V1956, specializationId: specId, skillId, operations, form: form ? 'ascended' : 'base', ascendedFormId: (form === null || form === void 0 ? void 0 : form.id) || null, domainStage: active ? stage : 0, domainMultiplier: multiplier, source: 'server_owned_specialization_catalog', compilerVersion: CENTRAL_SKILL_EFFECT_COMPILER_VERSION_V1958 };
}
export function createCentralSkillEffectCompilerV1958() { return (plan, state, context) => compileCentralSkillEffectPlanV1958(plan, state, context); }
