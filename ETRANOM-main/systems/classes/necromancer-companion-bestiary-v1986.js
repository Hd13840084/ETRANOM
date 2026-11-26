/** ETRANOM V1986 — combined companion bestiary. */
import { NECROMANCER_COMMON_COMPANIONS, NECROMANCER_COMPANION_ATTRIBUTE_KEYS, resolveNecromancerCompanionLevel, chooseNecromancerCompanionIntent as chooseBaseIntent } from './necromancer-common-companions-v1995.js?build=2081';
import { NECROMANCER_UNCOMMON_COMPANIONS } from './necromancer-uncommon-companions-v1985.js?build=2081';
import { NECROMANCER_RARE_COMPANIONS, chooseRareCompanionIntent } from './necromancer-rare-companions-v1986.js?build=2081';
export { NECROMANCER_COMPANION_ATTRIBUTE_KEYS, resolveNecromancerCompanionLevel };
export const NECROMANCER_ALL_COMPANIONS = Object.freeze([...NECROMANCER_COMMON_COMPANIONS, ...NECROMANCER_UNCOMMON_COMPANIONS, ...NECROMANCER_RARE_COMPANIONS]);
export function chooseNecromancerCompanionIntent(companionOrId, context = {}) {
    var _a, _b, _c, _d, _e, _f;
    const id = typeof companionOrId === 'string' ? companionOrId : companionOrId === null || companionOrId === void 0 ? void 0 : companionOrId.id;
    if (NECROMANCER_RARE_COMPANIONS.some(x => x.id === id))
        return chooseRareCompanionIntent(companionOrId, context);
    const source = typeof companionOrId === 'string' ? NECROMANCER_ALL_COMPANIONS.find(x => x.id === id) : companionOrId;
    if (!source)
        return null;
    const enemies = (context.enemies || []).filter(x => { var _a; return Number((_a = x.hp) !== null && _a !== void 0 ? _a : 1) > 0; }), allies = (context.allies || []).filter(x => { var _a; return Number((_a = x.hp) !== null && _a !== void 0 ? _a : 1) > 0; });
    const lowest = [...allies].sort((a, b) => Number(a.hp) / Math.max(1, Number(a.maxHp) || 1) - Number(b.hp) / Math.max(1, Number(b.maxHp) || 1))[0];
    const weakest = [...enemies].sort((a, b) => Number(a.hp) / Math.max(1, Number(a.maxHp) || 1) - Number(b.hp) / Math.max(1, Number(b.maxHp) || 1))[0];
    const ready = (source.skills || []).filter(s => { var _a; return Number(((_a = context.cooldowns) === null || _a === void 0 ? void 0 : _a[s.id]) || 0) <= 0 && (context.canUseSkill ? context.canUseSkill(s) !== false : true); });
    const rules = ((_a = source.combatAI) === null || _a === void 0 ? void 0 : _a.rules) || [];
    let selected = null;
    if (lowest && Number(lowest.hp) / Math.max(1, Number(lowest.maxHp) || 1) <= .65 && rules.some(x => /protect|support|heal/.test(x)))
        selected = ready.find(s => ['heal', 'shield', 'guard'].includes(s.type) || s.target === 'lowest_hp_ally');
    if (!selected && enemies.length >= 2 && rules.some(x => /multi|area|aoe|control|illusion/.test(x)))
        selected = ready.find(s => ['magic_aoe', 'physical_multi', 'control', 'debuff', 'dot'].includes(s.type));
    if (!selected && Number((_b = context.selfHpPct) !== null && _b !== void 0 ? _b : 100) <= 70 && rules.some(x => /guard|counter|frontline|protect/.test(x)))
        selected = ready.find(s => ['guard', 'shield'].includes(s.type));
    if (!selected && rules.some(x => /buff|support/.test(x)))
        selected = ready.find(s => ['buff', 'heal', 'shield'].includes(s.type));
    if (!selected && weakest)
        selected = ready.find(s => ['physical', 'magic', 'counter', 'physical_debuff', 'physical_leech', 'magic_aoe', 'physical_multi', 'dot'].includes(s.type));
    if (!selected)
        return chooseBaseIntent(source, context);
    const targetId = selected.target === 'self' ? ((_c = context.selfId) !== null && _c !== void 0 ? _c : null) : selected.target === 'lowest_hp_ally' ? ((_e = (_d = lowest === null || lowest === void 0 ? void 0 : lowest.id) !== null && _d !== void 0 ? _d : context.selfId) !== null && _e !== void 0 ? _e : null) : ['all_enemies', 'two_enemies', 'all_allies'].includes(selected.target) ? null : ((_f = weakest === null || weakest === void 0 ? void 0 : weakest.id) !== null && _f !== void 0 ? _f : null);
    return { action: 'use_skill', skillId: selected.id, targetId, targetMode: selected.target, reason: 'species_authored_priority', skill: JSON.parse(JSON.stringify(selected)) };
}
