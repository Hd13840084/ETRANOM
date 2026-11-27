/** ETRANOM shared skill/equipment/item resolver.
 * Pure deterministic mechanics only: callers persist the returned state after
 * validating ownership, turn, resources, cooldown and target on the server.
 */
import { ARCANE_MAGE } from '../classes/arcane-mage.js?build=2081';
import { ELEMENTALIST } from '../classes/elementalist.js?build=2081';
import { WARLOCK } from '../classes/warlock.js?build=2081';
import { NECROMANCER } from '../classes/necromancer.js?build=2081';
import SWORD_ASCETIC from '../../content/classes/warrior_sword_ascetic_v1.json' with { type: 'json' };
import IRON_BASTION from '../../content/classes/warrior_iron_bastion_v1.json' with { type: 'json' };
import CHAOS_WARRIOR from '../../content/classes/warrior_chaos_warrior_v1.json' with { type: 'json' };
import APOCALYPSE_HARBINGER from '../../content/classes/warrior_apocalypse_harbinger_v1.json' with { type: 'json' };
import { resolveActorAttackPower, resolveCanonicalSkillDamage } from './character-stat-core.js?v=1904&build=2081';
const n = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const clone = v => JSON.parse(JSON.stringify(v !== null && v !== void 0 ? v : {}));
export const SHARED_SKILL_RUNTIME_VERSION = '1904.0.0';
export const BASE_STAT_FIELDS = Object.freeze(['attack', 'defense', 'maxHp', 'maxMp', 'magicPower', 'accuracy', 'critChance', 'speed']);
export const EFFECT_FIELDS = Object.freeze(['attackPct', 'defensePct', 'magicPowerPct', 'healingPct', 'damagePct', 'damageReductionPct', 'accuracyPct', 'critChancePct', 'speedPct', 'manaCostReductionPct', 'cooldownReductionTurns', 'cooldownReductionPct', 'lifeStealPct', 'reflectPct', 'dotPct', 'attackReductionPct', 'defenseReductionPct']);
const TYPES = new Set(['single_damage', 'multi_target_damage', 'all_damage', 'all_control_damage', 'all_dot_control', 'ultimate_all_damage', 'shield', 'self_heal', 'heal', 'group_heal', 'summon', 'summon_resource', 'control', 'debuff', 'self_buff', 'evasion_counter', 'repeat_last_spell', 'damage_heal', 'purge', 'link']);
export function normalizeCombatEffects(...sources) {
    const out = {};
    for (const src of sources) {
        if (!src || typeof src !== 'object')
            continue;
        for (const k of EFFECT_FIELDS) {
            const v = n(src[k], 0);
            if (v)
                out[k] = clamp(n(out[k]) + v, -90, 500);
        }
    }
    return Object.freeze(out);
}
export function collectEquipmentEffects(character = {}, equipment = {}, activePotions = []) {
    const out = {};
    const equipped = equipment && typeof equipment === 'object' ? equipment : (character.equipment || {});
    for (const item of Object.values(equipped)) {
        if (!item || typeof item !== 'object')
            continue;
        const fx = item.combatEffects || item.effects || item.stats || {};
        for (const k of [...EFFECT_FIELDS, ...BASE_STAT_FIELDS]) {
            const v = n(fx[k], 0);
            if (v)
                out[k] = n(out[k]) + v;
        }
    }
    for (const potion of Array.isArray(activePotions) ? activePotions : []) {
        const fx = (potion === null || potion === void 0 ? void 0 : potion.combatEffects) || (potion === null || potion === void 0 ? void 0 : potion.effects) || {};
        for (const k of [...EFFECT_FIELDS, ...BASE_STAT_FIELDS]) {
            const v = n(fx[k], 0);
            if (v)
                out[k] = n(out[k]) + v;
        }
    }
    return Object.freeze({ ...normalizeCombatEffects(out), ...Object.fromEntries(BASE_STAT_FIELDS.filter(k => n(out[k]) !== 0).map(k => [k, n(out[k])])) });
}
export function applyCombatLoadout(base = {}, effects = {}) {
    const out = { ...clone(base) };
    for (const k of BASE_STAT_FIELDS) {
        if (n(effects[k]) !== 0)
            out[k] = Math.max(k === 'maxHp' || k === 'maxMp' ? 0 : 0, n(out[k]) + n(effects[k]));
    }
    for (const k of ['attackPct', 'defensePct', 'magicPowerPct', 'accuracyPct', 'critChancePct', 'speedPct']) {
        const stat = k.replace('Pct', '');
        if (n(effects[k]) !== 0)
            out[stat] = Math.max(0, n(out[stat]) * (1 + n(effects[k]) / 100));
    }
    return out;
}
function hpCap(x) { var _a; return Math.max(1, n((_a = x.maxHp) !== null && _a !== void 0 ? _a : x.max_hp, 1)); }
function requestedPartyMember(actor, id) { return (actor.partyMembers || []).find(x => id !== null && id !== undefined && String(x.id) === String(id) && n(x.hp) > 0) || null; }
function applyHeal(target, amount) { const max = hpCap(target), before = clamp(n(target.hp), 0, max), after = Math.min(max, before + Math.max(0, Math.floor(amount))); return { ...target, hp: after, healed: after - before }; }
function applyDamage(target, amount) { const before = Math.max(0, n(target.hp)), damage = Math.min(before, Math.max(0, Math.floor(amount))); return { ...target, hp: before - damage, damageTaken: damage }; }
function skillDamage(skill, actor, target, effects) {
    var _a, _b, _c;
    const archetype = String(actor.damageArchetype || '').toLowerCase();
    const canonical = actor.useCanonicalStatCore === true && actor.stats && archetype ? resolveActorAttackPower(actor) : null;
    const legacyPower = Math.max(0, n(skill.scalingStat === 'attack' ? actor.attack : skill.scalingStat === 'magicPower' ? actor.magicPower : ((_a = actor.magicPower) !== null && _a !== void 0 ? _a : actor.attack)));
    const power = canonical ? (skill.scalingStat === 'attack' && archetype === 'physical' ? canonical.physicalSkillPower : canonical.attackPower) : legacyPower;
    const pct = Math.max(0, n((_b = skill.damagePct) !== null && _b !== void 0 ? _b : skill.powerPct, 100));
    const bonus = n(effects.damagePct) + n(skill.damageBonusPct);
    const statusValues = Object.values(target.statuses || {});
    const defenseReduction = clamp(statusValues.reduce((v, x) => v + n(x === null || x === void 0 ? void 0 : x.defenseReductionPct), 0), 0, 80);
    const damageReduction = statusValues.reduce((v, x) => v + n(x === null || x === void 0 ? void 0 : x.damageReductionPct), n(target.damageReductionPct));
    const flatBonus = n(effects.flatDamage) + n(skill.flatDamage);
    return resolveCanonicalSkillDamage({ attackPower: power, damagePct: pct, percentBonus: bonus, flatBonus, targetDefense: (_c = target.defense) !== null && _c !== void 0 ? _c : target.enemyDefense, defenseReductionPct: defenseReduction, targetDamageReductionPct: damageReduction }).damage;
}
/** Resolve catalog records by stable id. Catalog must be loaded from the trusted game content bundle. */
const WIZARD_SPEC_ALIASES = Object.freeze({ wizard_arcane_mage: 'wizard_1', wizard_elementalist: 'wizard_2', wizard_warlock: 'wizard_3', wizard_necromancer: 'wizard_4', 'آرکین‌میج': 'wizard_1', 'آرکین میج': 'wizard_1', 'Arcane Mage': 'wizard_1', 'المنتالیست': 'wizard_2', 'Elementalist': 'wizard_2', 'وارلاک': 'wizard_3', 'Warlock': 'wizard_3', 'نکرومنسر': 'wizard_4', 'Necromancer': 'wizard_4' });
const WIZARD_SPECS = Object.freeze([
    { classId: 'wizard', catalogId: 'wizard_1', id: 'wizard_arcane_mage', progressKey: 'arcaneMage', data: ARCANE_MAGE },
    { classId: 'wizard', catalogId: 'wizard_2', id: 'wizard_elementalist', data: ELEMENTALIST },
    { classId: 'wizard', catalogId: 'wizard_3', id: 'wizard_warlock', data: WARLOCK },
    { classId: 'wizard', catalogId: 'wizard_4', id: 'wizard_necromancer', data: NECROMANCER }
]);
const WARRIOR_SPECS = Object.freeze([
    { classId: 'warrior', catalogId: 'warrior_1', id: 'warrior_sword_ascetic', data: SWORD_ASCETIC, progressKey: 'warrior_sword_ascetic' },
    { classId: 'warrior', catalogId: 'warrior_2', id: 'warrior_iron_bastion', data: IRON_BASTION, progressKey: 'warrior_iron_bastion' },
    { classId: 'warrior', catalogId: 'warrior_3', id: 'warrior_chaos_warrior', data: CHAOS_WARRIOR, progressKey: 'warrior_chaos' },
    { classId: 'warrior', catalogId: 'warrior_4', id: 'warrior_apocalypse_harbinger', data: APOCALYPSE_HARBINGER, progressKey: 'warrior_apocalypse_harbinger' }
]);
const ALL_SPECS = Object.freeze([...WIZARD_SPECS, ...WARRIOR_SPECS]);
const SPEC_ALIASES = Object.freeze({
    wizard_1: 'wizard_arcane_mage', wizard_2: 'wizard_elementalist', wizard_3: 'wizard_warlock', wizard_4: 'wizard_necromancer',
    warrior_1: 'warrior_sword_ascetic', warrior_2: 'warrior_iron_bastion', warrior_3: 'warrior_chaos_warrior', warrior_4: 'warrior_apocalypse_harbinger',
    warrior_chaos: 'warrior_chaos_warrior', 'زاهد شمشیر': 'warrior_sword_ascetic', 'Sword Ascetic': 'warrior_sword_ascetic',
    'دژ پولادین': 'warrior_iron_bastion', 'Iron Bastion': 'warrior_iron_bastion', 'جنگجوی آشوب': 'warrior_chaos_warrior', 'Chaos Warrior': 'warrior_chaos_warrior',
    'آورنده آخرالزمان': 'warrior_apocalypse_harbinger', 'Apocalypse Harbinger': 'warrior_apocalypse_harbinger'
});
function canonicalWizardSpec(id) { const raw = String(id || ''); return WIZARD_SPEC_ALIASES[raw] || raw; }
/** Build the PvP picker catalog from the same shipped specialization data used by Solo.
 * No database catalog or stale wizard_1 placeholder rows are required for display.
 */
export async function loadSharedSkillCatalog() {
    return Object.freeze({ schema: 'etranom.shared.skill.catalog.v1', class_core_skills: Object.freeze([]), specializations: Object.freeze(ALL_SPECS.map(spec => Object.freeze({ class_id: spec.classId, specialization_id: spec.catalogId, specialization_key: spec.id, progress_key: spec.progressKey || spec.id, skills: Object.freeze((spec.data.skills || []).map(skill => Object.freeze({ ...skill, id: String(skill.id), class_id: spec.classId, specialization_id: spec.catalogId, specialization_key: spec.id, implementation_status: 'implemented' }))), ascendedSkills: Object.freeze((spec.data.ascendedSkills || []).map(skill => Object.freeze({ ...skill }))), domain: Object.freeze({ ...spec.data.domain }) }))) });
}
export function normalizeSharedSpecializationId(id) { return SPEC_ALIASES[String(id || '')] || canonicalWizardSpec(id); }
function actualSkills(specId = null, classId = null) {
    return ALL_SPECS.filter(s => (!classId || s.classId === classId) && (!specId || s.catalogId === normalizeSharedSpecializationId(specId) || s.id === normalizeSharedSpecializationId(specId) || s.id === specId))
        .flatMap(s => (s.data.skills || []).map(skill => ({ ...skill, class_id: s.classId, specialization_id: s.catalogId, specialization_key: s.id, progress_key: s.progressKey || s.id, implementation_status: 'implemented' })));
}
export function listAvailableSharedSkills(catalog, { classId = null, specializationId = null, level = 1, ownedSkillIds = [] } = {}) {
    const owned = new Set((Array.isArray(ownedSkillIds) ? ownedSkillIds : []).map(String));
    if (!catalog || catalog.schema !== 'etranom.shared.skill.catalog.v1' || (classId && !['wizard', 'warrior'].includes(classId)))
        return [];
    const specId = specializationId ? normalizeSharedSpecializationId(specializationId) : null;
    const core = (catalog.class_core_skills || []).filter(x => x.class_id === classId && x.implementation_status !== 'shell');
    const rows = [...core, ...actualSkills(specId, classId)];
    return rows.filter(x => (!specId || !x.specialization_key || x.specialization_key === specId || x.specialization_id === specId) && n(x.unlockLevel, 1) <= n(level, 1) && owned.has(String(x.id))).map(x => Object.freeze({ ...x }));
}
export function findSharedSkill(catalog, skillId, specializationId = null, classId = 'wizard') {
    const id = String(skillId || '');
    if (!catalog || catalog.schema !== 'etranom.shared.skill.catalog.v1' || !['wizard', 'warrior'].includes(classId))
        return null;
    const specId = specializationId ? normalizeSharedSpecializationId(specializationId) : null;
    const actual = actualSkills(specId, classId).find(x => x.id === id);
    if (actual)
        return actual;
    const base = (catalog.class_core_skills || []).find(x => x.id === id && x.class_id === classId && x.implementation_status !== 'shell');
    if (base)
        return base;
    return null;
}
/** Apply an incoming hit to a combatant, consuming shield before HP. */
export function absorbCombatDamage(target = {}, incoming = 0) {
    const out = clone(target), raw = Math.max(0, Math.floor(n(incoming)));
    let left = raw;
    const shield = out.shield && typeof out.shield === 'object' ? { ...out.shield } : null;
    if (shield && n(shield.hp) > 0 && n(shield.turns) > 0) {
        const reduction = clamp(n(shield.reductionPct), 0, 80) / 100;
        const mitigated = Math.max(0, Math.floor(left * (1 - reduction)));
        const absorbed = Math.min(n(shield.hp), mitigated);
        shield.hp = Math.max(0, n(shield.hp) - absorbed);
        left = Math.max(0, mitigated - absorbed);
        out.shield = shield;
    }
    const hp = Math.max(0, n(out.hp));
    const taken = Math.min(hp, left);
    out.hp = hp - taken;
    out.damageTaken = taken;
    out.absorbed = raw - left;
    return out;
}
/** Resolve one already-authorized skill. No client damage/heal numbers are accepted. */
export function resolveCombatSkill({ mode = 'solo', skill, actor = {}, targets = [], effects = {}, targetId = null, rolls = {} } = {}) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (!['solo', 'party', 'pvp'].includes(mode))
        throw new TypeError('unsupported_combat_mode');
    if (!skill || !/^[a-z0-9_]{1,48}$/i.test(String(skill.id || '')))
        throw new TypeError('invalid_skill');
    const type = String(skill.type || 'single_damage');
    if (!TYPES.has(type))
        throw new TypeError('unsupported_skill_type');
    const fx = normalizeCombatEffects(effects);
    const a = clone(actor);
    let enemies = (Array.isArray(targets) ? targets : []).map(clone);
    let log = [];
    let summons = Array.isArray(a.summons) ? a.summons.slice(0, 2) : [];
    const skillId = String(skill.id);
    const cooldowns = { ...(a.skillCooldowns || {}) };
    if (n(cooldowns[skillId]) > 0)
        throw new Error('skill_on_cooldown');
    const baseCost = Math.max(0, n((_a = skill.manaCost) !== null && _a !== void 0 ? _a : skill.manaPct, 0));
    const cost = Math.max(0, Math.ceil(baseCost * (1 - clamp(n(fx.manaCostReductionPct), 0, 80) / 100)));
    if (n(a.mp) < cost)
        throw new Error('insufficient_mana');
    a.mp = Math.max(0, n(a.mp) - cost);
    const cooldownBase = Math.max(0, Math.floor(n(skill.cooldownTurns)));
    const cooldownReduction = Math.max(0, n(fx.cooldownReductionTurns)) + Math.ceil(cooldownBase * clamp(n(fx.cooldownReductionPct), 0, 80) / 100);
    const effectiveCooldown = Math.max(0, cooldownBase - Math.floor(cooldownReduction));
    if (effectiveCooldown > 0)
        cooldowns[skillId] = effectiveCooldown;
    else
        delete cooldowns[skillId];
    a.skillCooldowns = cooldowns;
    const chosenTargetId = (_b = targetId !== null && targetId !== void 0 ? targetId : skill.targetId) !== null && _b !== void 0 ? _b : null;
    const primary = enemies.find(t => chosenTargetId !== null && String(t.id) === String(chosenTargetId) && n(t.hp) > 0) || enemies.find(t => n(t.hp) > 0);
    const scale = 1 + n(fx.damagePct) / 100;
    const healScale = 1 + n(fx.healingPct) / 100;
    if (['self_heal', 'heal', 'group_heal'].includes(type)) {
        const requestedAlly = (a.partyMembers || []).find(x => chosenTargetId !== null && String(x.id) === String(chosenTargetId) && n(x.hp) > 0);
        const recipients = type === 'group_heal' && mode !== 'pvp' ? [a, ...(a.partyMembers || [])] : [skill.target === 'ally' && requestedAlly ? requestedAlly : a];
        for (const r of recipients) {
            const h = applyHeal(r, Math.max(1, n((_c = a.magicPower) !== null && _c !== void 0 ? _c : a.attack) * n(skill.healPct, 100) / 100 * healScale));
            if (r === a)
                Object.assign(a, h);
            else {
                const ix = (a.partyMembers || []).findIndex(x => x.id === r.id);
                if (ix >= 0)
                    a.partyMembers[ix] = h;
            }
            log.push({ type: 'heal', target: r.id || 'self', amount: h.healed });
        }
    }
    else if (type === 'shield') {
        const shieldTarget = skill.target === 'ally' && requestedPartyMember(a, chosenTargetId) ? requestedPartyMember(a, chosenTargetId) : a;
        shieldTarget.shield = { hp: Math.max(n((_d = shieldTarget.shield) === null || _d === void 0 ? void 0 : _d.hp), Math.floor(n((_e = a.magicPower) !== null && _e !== void 0 ? _e : a.attack) * n(skill.shieldPct, 100) / 100)), turns: Math.max(1, Math.floor(n(skill.durationTurns, 2))), reductionPct: clamp(n(skill.damageReductionPct) + n(fx.damageReductionPct), 0, 80) };
        if (shieldTarget !== a) {
            const ix = (a.partyMembers || []).findIndex(x => String(x.id) === String(shieldTarget.id));
            if (ix >= 0)
                a.partyMembers[ix] = shieldTarget;
        }
        log.push({ type: 'shield', target: shieldTarget.id || 'self', amount: shieldTarget.shield.hp });
    }
    else if (type === 'summon' || type === 'summon_resource') {
        const cap = mode === 'pvp' ? 1 : 3;
        if (summons.length >= cap)
            throw new Error('summon_capacity_reached');
        const summon = { id: `${skill.id}_summon_${summons.length + 1}`, sourceSkill: skill.id, hp: Math.max(1, Math.floor(n(a.maxHp, 100) * n(skill.summonHpPct, 35) / 100)), attack: Math.max(1, Math.floor(n(a.attack) * n(skill.summonDamagePct, 60) / 100)), turns: Math.max(1, Math.floor(n(skill.durationTurns, 2))), controlled: true };
        summons.push(summon);
        a.summons = summons;
        log.push({ type: 'summon', summonId: summon.id });
    }
    else if (type === 'self_buff' || type === 'evasion_counter') {
        const buffEffects = normalizeCombatEffects(skill.effects || skill, fx);
        a.buffs = { ...(a.buffs || {}), [skill.id]: { turns: Math.max(1, Math.floor(n(skill.durationTurns, 2))), effects: buffEffects } };
        a.combatEffects = normalizeCombatEffects(a.combatEffects || {}, buffEffects);
        log.push({ type: 'buff', skillId: skill.id });
    }
    else if (['control', 'debuff', 'all_control_damage', 'all_dot_control'].includes(type)) {
        const selected = enemies.filter(t => n(t.hp) > 0 && (type !== 'control' || t.id === (primary === null || primary === void 0 ? void 0 : primary.id)));
        for (const t of selected) {
            t.statuses = { ...(t.statuses || {}), [skill.id]: { turns: Math.max(1, Math.floor(n((_f = skill.durationTurns) !== null && _f !== void 0 ? _f : skill.dotTurns, 2))), attackReductionPct: clamp(n(skill.attackReductionPct) + n(fx.attackReductionPct), 0, 80), defenseReductionPct: clamp(n(skill.defenseReductionPct) + n(fx.defenseReductionPct), 0, 80), dotPct: Math.max(0, n(skill.dotPct)) } };
            if (mode === 'pvp')
                t.statuses[skill.id].hardControl = false;
            else
                t.statuses[skill.id].hardControl = type === 'control' || Boolean(skill.stunTurns || skill.controlTurns);
            log.push({ type: 'control', target: t.id, hard: t.statuses[skill.id].hardControl });
        }
        if (n(skill.damagePct) > 0) {
            for (const t of selected) {
                const d = skillDamage(skill, a, t, fx);
                Object.assign(t, applyDamage(t, d));
                log.push({ type: 'damage', target: t.id, amount: d });
            }
        }
    }
    else if (['single_damage', 'multi_target_damage', 'all_damage', 'all_control_damage', 'all_dot_control', 'ultimate_all_damage', 'damage_heal', 'repeat_last_spell'].includes(type)) {
        const selected = (type === 'single_damage' || type === 'damage_heal') ? [primary].filter(Boolean) : enemies.filter(t => n(t.hp) > 0).slice(0, Math.max(1, Math.floor(n(skill.maxTargets, 8))));
        for (const t of selected) {
            const d = skillDamage(skill, a, t, fx);
            Object.assign(t, applyDamage(t, d));
            log.push({ type: 'damage', target: t.id, amount: d });
            if (n(skill.dotPct) > 0)
                t.statuses = { ...(t.statuses || {}), [skill.id]: { turns: Math.max(1, Math.floor(n(skill.dotTurns, 2))), dotPct: n(skill.dotPct) } };
            if (n(skill.attackReductionPct) > 0)
                t.statuses = { ...(t.statuses || {}), [skill.id]: { turns: Math.max(1, Math.floor(n(skill.durationTurns, 2))), attackReductionPct: n(skill.attackReductionPct), hardControl: false } };
            if (type === 'damage_heal') {
                const h = applyHeal(a, Math.max(1, d * n((_g = skill.healPct) !== null && _g !== void 0 ? _g : skill.lifeStealPct, 35) / 100 * healScale));
                Object.assign(a, h);
                log.push({ type: 'heal', target: 'self', amount: h.healed });
            }
            else if (n(fx.lifeStealPct) > 0 || n(skill.lifeStealPct) > 0) {
                const h = applyHeal(a, d * clamp(n(fx.lifeStealPct) || n(skill.lifeStealPct), 0, 100) / 100);
                Object.assign(a, h);
                log.push({ type: 'heal', target: 'self', amount: h.healed });
            }
        }
    }
    else if (type === 'purge') {
        if (primary) {
            primary.statuses = {};
            log.push({ type: 'purge', target: primary.id });
        }
    }
    else if (type === 'link') {
        if (primary) {
            primary.statuses = { ...(primary.statuses || {}), [skill.id]: { turns: Math.max(1, Math.floor(n(skill.durationTurns, 3))), linkPct: Math.max(0, n(skill.linkPct, 20)), source: 'wizard' } };
            a.links = { ...(a.links || {}), [skill.id]: { targetId: primary.id, turns: Math.max(1, Math.floor(n(skill.durationTurns, 3))), linkPct: Math.max(0, n(skill.linkPct, 20)) } };
            log.push({ type: 'link', target: primary.id });
        }
    }
    return Object.freeze({ mode, actor: a, targets: enemies, summons, log, skillId: skill.id });
}
/** Advance duration-based combat effects once at the authoritative round boundary.
 * Applies damage-over-time before decrementing durations; callers persist the returned state.
 */
export function tickCombatStatuses(combatant = {}, options = {}) {
    var _a, _b;
    const out = clone(combatant), logs = [];
    const turnId = (options === null || options === void 0 ? void 0 : options.turnId) == null ? null : String(options.turnId);
    const alreadyTicked = turnId !== null && String((_a = out._combatLifecycleLastTickId) !== null && _a !== void 0 ? _a : '') === turnId;
    if (alreadyTicked)
        return Object.freeze({ combatant: out, log: [] });
    const tickCooldowns = (options === null || options === void 0 ? void 0 : options.tickCooldowns) !== false;
    if (tickCooldowns) {
        const tickMap = map => { if (!map || typeof map !== 'object' || Array.isArray(map))
            return; for (const [id, value] of Object.entries(map)) {
            const next = Math.max(0, Math.floor(n(value) - 1));
            if (next <= 0)
                delete map[id];
            else
                map[id] = next;
        } };
        const tickProgress = progress => { if (!progress || typeof progress !== 'object' || Array.isArray(progress))
            return; tickMap(progress.skillCooldowns); tickMap(progress.skill_cooldowns); tickMap(progress.cooldowns); };
        tickMap(out.skillCooldowns);
        tickMap(out.skill_cooldowns);
        tickMap(out.cooldowns);
        const classProgress = out.classProgress || out.class_progress || {};
        for (const progress of Object.values(classProgress))
            tickProgress(progress);
        tickProgress(out.specializationProgress);
        tickProgress(out.specialization_progress);
    }
    // The lifecycle marker belongs to the turn boundary, not to the cooldown
    // branch: specialization runtimes may own their cooldown tick and still need
    // the same idempotency guard for statuses/domain timers.
    if (turnId !== null)
        out._combatLifecycleLastTickId = turnId;
    if ((options === null || options === void 0 ? void 0 : options.tickStatuses) !== false) {
        const statuses = { ...(out.statuses || {}) };
        for (const [id, status] of Object.entries(statuses)) {
            const turns = Math.max(0, n(status === null || status === void 0 ? void 0 : status.turns));
            if (turns <= 0) {
                delete statuses[id];
                continue;
            }
            const dot = Math.max(0, n(status.dotPct));
            if (dot > 0 && n(out.hp) > 0) {
                const amount = Math.min(n(out.hp), Math.max(1, Math.floor(n((_b = out.maxHp) !== null && _b !== void 0 ? _b : out.max_hp, 100) * dot / 100)));
                out.hp = Math.max(0, n(out.hp) - amount);
                logs.push({ type: 'dot', statusId: id, amount });
            }
            const next = turns - 1;
            if (next <= 0)
                delete statuses[id];
            else
                statuses[id] = { ...status, turns: next };
        }
        out.statuses = statuses;
        if (out.shield && n(out.shield.turns) > 0) {
            out.shield = { ...out.shield, turns: n(out.shield.turns) - 1 };
            if (out.shield.turns <= 0 || n(out.shield.hp) <= 0)
                out.shield = null;
        }
        for (const key of ['buffs']) {
            if (out[key] && typeof out[key] === 'object') {
                for (const [id, buff] of Object.entries(out[key])) {
                    const turns = Math.max(0, n(buff === null || buff === void 0 ? void 0 : buff.turns) - 1);
                    if (turns <= 0)
                        delete out[key][id];
                    else
                        out[key][id] = { ...buff, turns };
                }
            }
        }
        if (Array.isArray(out.summons))
            out.summons = out.summons.map(x => ({ ...x, turns: Math.max(0, n(x.turns) - 1) })).filter(x => x.turns > 0 && n(x.hp) > 0);
    }
    return Object.freeze({ combatant: out, log: logs });
}
