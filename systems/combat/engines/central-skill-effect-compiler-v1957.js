/**
 * ETRANOM V1957 — audited bridge from the eight implemented specialization
 * definitions into the V1956 trusted effect-plan contract.
 *
 * This module is deliberately conservative: only skill IDs whose complete
 * primitive behavior can be represented by V1956 are enabled. Bespoke legacy
 * mechanics are reported as requiring a dedicated adapter and are rejected.
 */
import { IMPLEMENTED_SPECIALIZATION_DATA_V1939 } from './shared-engine-specialization-orchestrator-v1939.js?build=2081';
import { CENTRAL_EFFECT_PLAN_SCHEMA_V1956 } from './central-combat-lifecycle-v1956.js?build=2081';
export const CENTRAL_SKILL_EFFECT_COMPILER_VERSION_V1957 = '1957.0.0';
const obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const n = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const idKey = (spec, skill) => `${spec}:${skill}`;
// Explicit allow-list. A skill is not enabled merely because its type name
// resembles a primitive; secondary mechanics must also be representable.
const MAP = Object.freeze({
    'wizard_arcane_mage:arcane_shield': 'shield',
    'wizard_elementalist:ember_bolt': 'single_damage',
    'wizard_elementalist:frozen_armor': 'shield',
    'wizard_elementalist:tempest': 'all_damage',
    'wizard_elementalist:earth_rupture': 'damage_defense_debuff',
    'wizard_elementalist:primordial_cataclysm': 'all_damage',
    'warrior_sword_ascetic:black_crescent': 'single_damage',
    'warrior_sword_ascetic:soul_blade': 'single_damage',
    'warrior_sword_ascetic:mountain_river_cleave': 'single_damage',
    'warrior_sword_ascetic:mind_blade': 'single_damage',
    'warrior_iron_bastion:ironcleave': 'damage_defense_debuff',
    'warrior_iron_bastion:quake_of_iron': 'damage_slow',
    'warrior_iron_bastion:fortress_stance': 'self_modifiers',
    'warrior_iron_bastion:shatterguard': 'damage_defense_debuff',
    'warrior_iron_bastion:colossus_rage': 'self_modifiers',
    'warrior_chaos:chaos_rend': 'damage_mark',
    'warrior_chaos:endless_wound': 'dot',
    'warrior_chaos:chaos_fangs': 'aoe_multi_hit',
    'warrior_apocalypse_harbinger:apoc_strike': 'single_damage',
    'warrior_apocalypse_harbinger:meteor_rain': 'all_damage',
    'warrior_apocalypse_harbinger:kingfall': 'all_damage',
    'warrior_apocalypse_harbinger:worlds_end': 'all_damage'
});
function statPower(plan) {
    var _a, _b, _c, _d, _e;
    const stats = obj((_a = plan === null || plan === void 0 ? void 0 : plan.stats) === null || _a === void 0 ? void 0 : _a.stats);
    const isWizard = String((plan === null || plan === void 0 ? void 0 : plan.classId) || '').toLowerCase() === 'wizard';
    return Math.max(0, n(isWizard ? ((_c = (_b = stats.magicPower) !== null && _b !== void 0 ? _b : stats.magicalAttack) !== null && _c !== void 0 ? _c : stats.attackPower) : ((_e = (_d = stats.attack) !== null && _d !== void 0 ? _d : stats.physicalAttack) !== null && _e !== void 0 ? _e : stats.attackPower)));
}
function pct(skill, keys, fallback = 0) {
    var _a;
    for (const key of keys)
        if ((skill === null || skill === void 0 ? void 0 : skill[key]) != null)
            return Math.max(0, n(skill[key]));
    for (const key of keys)
        if (((_a = skill === null || skill === void 0 ? void 0 : skill.effects) === null || _a === void 0 ? void 0 : _a[key]) != null)
            return Math.max(0, n(skill.effects[key]));
    return fallback;
}
function scopeFor(plan, kind = 'selected_target') {
    var _a;
    if (kind === 'self')
        return 'self';
    const target = String(((_a = plan === null || plan === void 0 ? void 0 : plan.skill) === null || _a === void 0 ? void 0 : _a.target) || '').toLowerCase();
    if (/(تمام|همه|all|زنده)/.test(target))
        return 'all_live_targets';
    return 'selected_target';
}
function status(id, polarity, turns, extra = {}, scope = 'selected_target') {
    return { type: 'apply_status', scope, status: { id, polarity, turns: Math.max(1, Math.floor(n(turns, 1))), ...extra } };
}
function modifierOps(skill, duration, targetScope = 'self') {
    var _a, _b, _c;
    const fx = obj(skill.effects), ops = [];
    const aliases = [
        ['attackPct', 'attack'], ['magicPowerPct', 'magicPower'], ['defensePct', 'defense'],
        ['damageReductionPct', 'damageReductionPct'], ['controlResistPct', 'controlResistPct'],
        ['speedPct', 'speed'], ['castSpeedPct', 'castSpeed']
    ];
    for (const [key, stat] of aliases) {
        const value = n((_a = fx[key]) !== null && _a !== void 0 ? _a : skill[key]);
        if (value)
            ops.push({ type: 'modifier', scope: targetScope, stat, amount: value, turns: Math.max(1, Math.floor(n((_c = (_b = fx.durationTurns) !== null && _b !== void 0 ? _b : skill.durationTurns) !== null && _c !== void 0 ? _c : duration, 1))) });
    }
    return ops;
}
export function auditCentralSkillEffectCoverageV1957() {
    const rows = [];
    for (const [specializationId, spec] of Object.entries(IMPLEMENTED_SPECIALIZATION_DATA_V1939)) {
        for (const skill of Array.isArray(spec.skills) ? spec.skills : []) {
            const key = idKey(specializationId, String(skill.id));
            rows.push({ specializationId, skillId: String(skill.id), type: String(skill.type || ''),
                mapping: MAP[key] || null, status: MAP[key] ? 'primitive_mapped' : 'custom_adapter_required' });
        }
    }
    const mapped = rows.filter(r => r.mapping).length;
    return Object.freeze({ version: CENTRAL_SKILL_EFFECT_COMPILER_VERSION_V1957, total: rows.length, mapped,
        customRequired: rows.length - mapped, parityVerified: false, executionAuthority: 'shadow_only', rows: Object.freeze(rows.map(Object.freeze)) });
}
export function compileCentralSkillEffectPlanV1957(plan, state, context = {}) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const specId = String((plan === null || plan === void 0 ? void 0 : plan.specializationId) || '');
    const skillId = String((plan === null || plan === void 0 ? void 0 : plan.skillId) || '');
    const key = idKey(specId, skillId), mapping = MAP[key];
    if (!mapping)
        throw new Error(`skill_requires_specialized_effect_adapter:${key}`);
    const skill = obj(plan.skill), fx = obj(skill.effects), power = statPower(plan);
    if (Math.floor(n(plan.rank, 1)) !== 1)
        throw new Error(`ranked_skill_adapter_required:${key}`);
    if (((_a = plan.domain) === null || _a === void 0 ? void 0 : _a.active) === true || ((_b = plan.domain) === null || _b === void 0 ? void 0 : _b.ascensionId) || Object.keys(obj((_c = plan.talent) === null || _c === void 0 ? void 0 : _c.modifiers)).length) {
        throw new Error(`progression_effect_adapter_required:${key}`);
    }
    if (Object.keys(obj((_d = plan.upgrade) === null || _d === void 0 ? void 0 : _d.modifiers)).length || (Array.isArray((_e = plan.upgrade) === null || _e === void 0 ? void 0 : _e.appliedUpgradeIds) && plan.upgrade.appliedUpgradeIds.length)) {
        throw new Error(`ranked_skill_adapter_required:${key}`);
    }
    const duration = Math.max(1, Math.floor(n((_h = (_g = (_f = fx.durationTurns) !== null && _f !== void 0 ? _f : skill.durationTurns) !== null && _g !== void 0 ? _g : skill.dotTurns) !== null && _h !== void 0 ? _h : 1, 1)));
    const damagePct = pct(skill, ['damagePct', 'powerPct']);
    const amount = power * damagePct / 100;
    const single = { type: 'damage', scope: 'selected_target', amount };
    const all = { type: 'damage', scope: 'all_live_targets', amount };
    let operations;
    switch (mapping) {
        case 'single_damage':
            if (!(amount > 0))
                throw new Error(`skill_damage_definition_missing:${key}`);
            operations = [single];
            break;
        case 'all_damage':
            if (!(amount > 0))
                throw new Error(`skill_damage_definition_missing:${key}`);
            operations = [all];
            break;
        case 'two_stage_aoe_damage': {
            const initial = power * pct(skill, ['initialDamagePct']) / 100;
            if (!(initial > 0 && amount > 0))
                throw new Error(`skill_damage_definition_missing:${key}`);
            operations = [{ ...all, amount: initial }, all];
            break;
        }
        case 'shield': {
            const shieldPct = pct(skill, ['shieldPct', 'damagePct']);
            if (!(shieldPct > 0))
                throw new Error(`skill_shield_definition_missing:${key}`);
            operations = [{ type: 'shield', scope: 'self', amount: power * shieldPct / 100 }];
            break;
        }
        case 'damage_attack_debuff':
        case 'damage_defense_debuff': {
            if (!(amount > 0))
                throw new Error(`skill_damage_definition_missing:${key}`);
            const reduction = mapping === 'damage_attack_debuff'
                ? pct(skill, ['enemyAttackReductionPct', 'attackReductionPct'])
                : pct(skill, ['defenseReductionPct', 'defenseBreakPct']);
            const stat = mapping === 'damage_attack_debuff' ? 'attack' : 'defense';
            operations = [scopeFor(plan) === 'all_live_targets' ? all : single];
            if (reduction > 0)
                operations.push({ type: 'modifier', scope: scopeFor(plan), stat, amount: -reduction, turns: duration });
            break;
        }
        case 'dot_attack_debuff':
        case 'dot': {
            const dotPct = pct(skill, ['dotPct']);
            if (!(dotPct > 0))
                throw new Error(`skill_dot_definition_missing:${key}`);
            operations = [status(`dot:${skillId}`, 'negative', n((_l = (_k = (_j = fx.dotTurns) !== null && _j !== void 0 ? _j : skill.dotTurns) !== null && _k !== void 0 ? _k : skill.durationTurns) !== null && _l !== void 0 ? _l : duration), { dotDamage: power * dotPct / 100 }, scopeFor(plan))];
            if (mapping === 'dot_attack_debuff') {
                const reduction = pct(skill, ['enemyAttackReductionPct']);
                if (reduction > 0)
                    operations.push({ type: 'modifier', scope: 'all_live_targets', stat: 'attack', amount: -reduction, turns: duration });
            }
            break;
        }
        case 'self_modifiers':
            operations = modifierOps(skill, duration);
            if (!operations.length)
                throw new Error(`skill_modifier_definition_missing:${key}`);
            break;
        case 'reflect_reaction': {
            const reflectPct = pct(skill, ['reflectPct']);
            const reactionAmount = power * (reflectPct || pct(skill, ['powerPct']) || 100) / 100;
            operations = [{ type: 'reaction', reaction: 'reflect', amount: reactionAmount, turns: duration }];
            break;
        }
        case 'multi_hit':
        case 'aoe_multi_hit': {
            const hitPct = mapping === 'multi_hit' ? Math.max(1, pct(skill, ['powerPct'])) : pct(skill, ['damagePct']);
            const hits = clamp(Math.floor(n(fx.hits, mapping === 'multi_hit' ? 3 : 3)), 1, 12);
            if (!(hitPct > 0))
                throw new Error(`skill_hit_definition_missing:${key}`);
            operations = [{ type: 'multi_hit', scope: mapping === 'multi_hit' ? 'selected_target' : 'all_live_targets', hits, amount: power * hitPct / 100 }];
            break;
        }
        case 'damage_slow': {
            if (!(amount > 0))
                throw new Error(`skill_damage_definition_missing:${key}`);
            operations = [all, status(`slow:${skillId}`, 'negative', duration, { slowPct: pct(skill, ['slowPct']) }, 'all_live_targets')];
            break;
        }
        case 'damage_mark': {
            if (!(amount > 0))
                throw new Error(`skill_damage_definition_missing:${key}`);
            operations = [single, status(`mark:${skillId}`, 'negative', n(fx.markTurns, duration), { marked: true }, 'selected_target')];
            break;
        }
        case 'aoe_damage_control': {
            if (!(amount > 0))
                throw new Error(`skill_damage_definition_missing:${key}`);
            operations = [all, status(`control:${skillId}`, 'negative', n(fx.controlTurns, duration), { control: true }, 'all_live_targets')];
            break;
        }
        default: throw new Error(`unsupported_skill_mapping:${mapping}`);
    }
    return { schema: CENTRAL_EFFECT_PLAN_SCHEMA_V1956, specializationId: specId, skillId, operations,
        compilerVersion: CENTRAL_SKILL_EFFECT_COMPILER_VERSION_V1957, source: 'server_owned_specialization_definition' };
}
export function createCentralSkillEffectCompilerV1957() {
    return (plan, state, context) => compileCentralSkillEffectPlanV1957(plan, state, context);
}
