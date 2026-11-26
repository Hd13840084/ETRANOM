/**
 * ETRANOM V1974 — extensible tactical monster AI.
 * Pure decision layer: it selects intent/target/skill but never mutates HP,
 * grants rewards, or bypasses the authoritative combat executor.
 */
import { createMonsterCombatEngineV1970 } from './monster-combat-engine-v1970.js?build=2081';
const obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const num = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const alive = x => { var _a; return num(x === null || x === void 0 ? void 0 : x.hp, num((_a = x === null || x === void 0 ? void 0 : x.resources) === null || _a === void 0 ? void 0 : _a.hp, 1)) > 0 && (x === null || x === void 0 ? void 0 : x.alive) !== false; };
const hpRatio = x => { var _a, _b; return clamp(num(x === null || x === void 0 ? void 0 : x.hp, num((_a = x === null || x === void 0 ? void 0 : x.resources) === null || _a === void 0 ? void 0 : _a.hp, 1)) / Math.max(1, num(x === null || x === void 0 ? void 0 : x.maxHp, num((_b = x === null || x === void 0 ? void 0 : x.resources) === null || _b === void 0 ? void 0 : _b.maxHp, 1))), 0, 1); };
function roleOf(monster) {
    const role = String((monster === null || monster === void 0 ? void 0 : monster.aiRole) || (monster === null || monster === void 0 ? void 0 : monster.role) || '').toLowerCase();
    if (/guardian|tank|defen|مدافع|نگهبان/.test(role))
        return 'guardian';
    if (/assassin|hunter|fast|شکارچی|سریع/.test(role))
        return 'assassin';
    if (/support|healer|caster|جادو|پشتیبان/.test(role))
        return 'support';
    if (/boss|رهبر|باس/.test(role) || ['boss', 'area_boss', 'mini_boss', 'miniboss'].includes(monster === null || monster === void 0 ? void 0 : monster.kind))
        return 'boss';
    return 'striker';
}
function targetScore(monster, target, index, role) {
    const hp = hpRatio(target);
    const threat = num(target.threat, num(target.damageDealt, 0));
    const taunt = target.taunt === true ? 100000 : 0;
    const lowHpFocus = role === 'assassin' ? (1 - hp) * 45 : role === 'boss' ? (1 - hp) * 18 : (1 - hp) * 12;
    const threatWeight = role === 'support' ? 1.5 : role === 'boss' ? 1.2 : 0.8;
    const classBonus = role === 'guardian' && target.isHealer ? 12 : 0;
    return taunt + threat * threatWeight + lowHpFocus + classBonus - index * 0.0001;
}
function phaseFor(monster, config = {}) {
    const ratio = hpRatio(monster);
    const thresholds = Array.isArray(config.phaseThresholds) ? config.phaseThresholds : [0.25, 0.6];
    const sorted = thresholds.map(x => clamp(num(x, 0), 0, 1)).sort((a, b) => b - a);
    let phase = 1;
    for (const threshold of sorted)
        if (ratio <= threshold)
            phase++;
    return { phase, hpRatio: ratio, enraged: ratio <= clamp(num(config.enrageAt, 0.2), 0, 1) };
}
function skillIntent(monster, skillEntry, phase, config) {
    if (!(skillEntry === null || skillEntry === void 0 ? void 0 : skillEntry.definition))
        return null;
    const def = skillEntry.definition;
    const type = String(def.type || 'attack').toLowerCase();
    const effects = obj(def.effects);
    const cost = Math.max(0, num(effects.mp_cost, 0));
    const hp = hpRatio(monster);
    // Defensive skills are preferred when a boss/guardian is under pressure.
    if ((type === 'buff' || type === 'heal' || type === 'defense') && hp > num(config.defensiveSkillHpThreshold, 0.72))
        return null;
    return { type: 'skill', skillId: skillEntry.id, skillType: type, mpCost: cost, phase: phase.phase,
        damageMultiplier: Math.max(0, num(effects.damage_multiplier, 1)), reason: 'skill_ready' };
}
export function selectMonsterTargetV1974(monster, targets = [], { role = roleOf(monster) } = {}) {
    var _a;
    const candidates = targets.map((target, index) => ({ target, index, score: targetScore(monster, target, index, role) }))
        .filter(x => alive(x.target)).sort((a, b) => b.score - a.score);
    return ((_a = candidates[0]) === null || _a === void 0 ? void 0 : _a.target) || null;
}
export function decideMonsterActionV1974(monster = {}, targets = [], options = {}) {
    if (!alive(monster))
        return { action: 'none', reason: 'monster_defeated' };
    const living = (Array.isArray(targets) ? targets : []).filter(alive);
    if (!living.length)
        return { action: 'none', reason: 'no_valid_targets' };
    const config = { ...obj(monster.ai), ...obj(options.config) };
    const role = roleOf(monster);
    const phase = phaseFor(monster, config);
    const target = selectMonsterTargetV1974(monster, living, { role });
    if (!target)
        return { action: 'none', reason: 'no_valid_targets' };
    if (typeof options.chooseSkill === 'function') {
        const entry = options.chooseSkill(monster, { random: options.random || Math.random, chance: 1, minimumMp: 0 });
        const intent = skillIntent(monster, entry, phase, config);
        if (intent)
            return { action: 'skill', targetId: String(target.id || target.characterId || ''), role, phase, ...intent };
    }
    const base = { action: 'attack', targetId: String(target.id || target.characterId || ''), role, phase, damageMultiplier: 1 };
    if (phase.enraged && config.enrageAction === 'heavy_attack')
        return { ...base, action: 'heavy_attack', damageMultiplier: Math.max(1, num(config.enrageDamageMultiplier, 1.35)), reason: 'enrage' };
    if (role === 'guardian' && hpRatio(monster) < num(config.guardianDefendBelow, 0.35))
        return { ...base, action: 'defend', targetId: null, reason: 'guardian_low_hp' };
    return { ...base, reason: 'default_attack' };
}
export function createMonsterAIEngineV1974({ skillMap = {}, config = {} } = {}) {
    const combat = createMonsterCombatEngineV1970({ skillMap });
    return Object.freeze({
        version: '1974.0.0',
        selectTarget: selectMonsterTargetV1974,
        decide: (monster, targets, options = {}) => decideMonsterActionV1974(monster, targets, {
            ...options, config: { ...obj(config), ...obj(options.config) },
            chooseSkill: options.chooseSkill || ((m, o) => combat.chooseSkill(m, o))
        }),
        phase: (monster, overrides = {}) => phaseFor(monster, { ...obj(config), ...obj(overrides) })
    });
}
