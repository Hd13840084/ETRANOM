/**
 * ETRANOM V1955 — Central class/specialization engine foundation.
 *
 * This is a deterministic preparation and validation layer. It deliberately
 * does NOT replace the live Solo/Party/PvP resolvers yet. The legacy runtime
 * remains authoritative until execution parity and server transaction safety
 * are demonstrated.
 */
import { IMPLEMENTED_SPECIALIZATION_DATA_V1939, sharedSpecializationRegistryV1939 } from './shared-engine-specialization-orchestrator-v1939.js?build=2081';
import { normalizeSpecializationSkillRecord, auditSpecializationContent } from '../specialization-contract-runtime.js?v=1901&build=2081';
import { resolveSpecializationCombatActor } from '../character-stat-core.js?v=1901&build=2081';
import { StatEngine, SkillUpgradeEngine, TalentEngine, CooldownEngine } from './shared-engine-runtime-v1913.js?build=2081';
export const CENTRAL_CLASS_ENGINE_VERSION_V1955 = '1955.0.0';
export const CENTRAL_CLASS_ENGINE_SCHEMA_V1955 = 'etranom.central-class-engine.v1';
const obj = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const arr = value => Array.isArray(value) ? value : [];
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clampInt = (value, min, max, fallback = min) => Math.max(min, Math.min(max, Math.floor(n(value, fallback))));
const clone = value => structuredClone(value !== null && value !== void 0 ? value : {});
const deepFreeze = value => {
    if (!value || typeof value !== 'object' || Object.isFrozen(value))
        return value;
    Object.freeze(value);
    for (const child of Object.values(value))
        deepFreeze(child);
    return value;
};
const LEGACY_PROGRESS_KEYS_V1955 = Object.freeze({
    wizard_arcane_mage: 'arcaneMageProgress',
    wizard_elementalist: 'elementalistProgress',
    wizard_warlock: 'warlockProgress',
    wizard_necromancer: 'necromancerProgress',
    warrior_sword_ascetic: 'swordAsceticProgress',
    warrior_iron_bastion: 'ironBastionProgress',
    warrior_chaos: 'chaosWarriorProgress',
    warrior_apocalypse_harbinger: 'apocalypseProgress'
});
function progressFor(actor, specializationId) {
    var _a, _b;
    const legacyKey = LEGACY_PROGRESS_KEYS_V1955[specializationId];
    return obj(((_a = actor === null || actor === void 0 ? void 0 : actor.classProgress) === null || _a === void 0 ? void 0 : _a[specializationId]) || ((_b = actor === null || actor === void 0 ? void 0 : actor.classProgress) === null || _b === void 0 ? void 0 : _b[specializationId.replace('warrior_chaos', 'warrior_chaos_warrior')]) || (legacyKey ? actor === null || actor === void 0 ? void 0 : actor[legacyKey] : null) || (actor === null || actor === void 0 ? void 0 : actor.specializationProgress));
}
function resourceMaximum(actor, resource) {
    var _a, _b, _c;
    if (resource === 'mana' || resource === 'mp')
        return Math.max(0, n((_a = actor.maxMp) !== null && _a !== void 0 ? _a : actor.max_mp, actor.mp));
    if (resource === 'stamina')
        return Math.max(0, n((_b = actor.maxStamina) !== null && _b !== void 0 ? _b : actor.max_stamina, actor.stamina));
    return Math.max(0, n((_c = actor.resourceMaxima) === null || _c === void 0 ? void 0 : _c[resource]));
}
function resourceCostFor(skill, actor) {
    const resource = String(skill.resourceType || 'mana');
    if (skill.resourceCostMode === 'percent_of_max') {
        const maximum = resourceMaximum(actor, resource);
        return { resource, cost: Math.ceil(maximum * Math.max(0, n(skill.resourceCostPercent)) / 100), costMode: 'percent_of_max' };
    }
    return { resource, cost: Math.max(0, n(skill.resourceCost)), costMode: 'flat' };
}
function currentResource(actor, resource) {
    return Math.max(0, n(obj(actor.resources)[resource], resource === 'mana' ? actor.mp : actor[resource]));
}
function talentTreeFor(spec) {
    const global = new Map(arr(spec.talents).map(t => [String((t === null || t === void 0 ? void 0 : t.id) || ''), t]));
    return { branches: arr(spec.talentBranches).map(branch => ({
            ...branch,
            talents: arr(branch.talentIds).length
                ? branch.talentIds.map(id => global.get(String(id))).filter(Boolean)
                : arr(branch.talents)
        })) };
}
function targetNeedsSelection(target) {
    const value = String(target || '').toLowerCase();
    if (value.includes('all') || value.includes('همه') || value.includes('multiple'))
        return false;
    return value.includes('enemy') || value.includes('دشمن');
}
export class CentralSpecializationEngineV1955 {
    constructor({ registry = sharedSpecializationRegistryV1939, content = IMPLEMENTED_SPECIALIZATION_DATA_V1939 } = {}) {
        this.registry = registry;
        this.content = content;
        Object.freeze(this);
    }
    audit() {
        const registry = this.registry.counts;
        const rows = Object.entries(this.content).map(([key, spec]) => {
            const canonicalId = this.registry.resolveCanonicalId(key);
            const audit = auditSpecializationContent(spec, canonicalId || key);
            return { specializationId: canonicalId || key, ok: audit.ok, errors: audit.errors, counts: audit.counts };
        });
        const errors = [];
        if (registry.classes !== 10)
            errors.push(`class_slots:${registry.classes}/10`);
        if (registry.specializations !== 40)
            errors.push(`specialization_slots:${registry.specializations}/40`);
        if (registry.implemented !== 8)
            errors.push(`implemented_slots:${registry.implemented}/8`);
        if (registry.reserved !== 32)
            errors.push(`reserved_slots:${registry.reserved}/32`);
        if (rows.length !== 8)
            errors.push(`content_records:${rows.length}/8`);
        for (const row of rows)
            if (!row.ok)
                errors.push(`${row.specializationId}:${row.errors.join(',')}`);
        return deepFreeze({ schema: CENTRAL_CLASS_ENGINE_SCHEMA_V1955, version: CENTRAL_CLASS_ENGINE_VERSION_V1955,
            ok: errors.length === 0, registry, content: rows, errors });
    }
    inspect(specializationId) {
        var _a;
        const canonicalId = this.registry.resolveCanonicalId(specializationId);
        if (!canonicalId)
            throw new Error('specialization_not_registered');
        const record = this.registry.getSpecialization(canonicalId);
        const content = this.content[canonicalId] || this.content[specializationId];
        return deepFreeze({ specializationId: canonicalId, classId: record.classId, status: record.status,
            playable: record.status === 'implemented' && !!content,
            dimensions: content ? {
                skills: arr(content.skills).length,
                talentBranches: arr(content.talentBranches).length,
                talents: arr(content.talentBranches).reduce((sum, branch) => sum + (arr(branch.talentIds).length || arr(branch.talents).length), 0),
                domainStages: arr((_a = content.domain) === null || _a === void 0 ? void 0 : _a.stages).length,
                ascensions: arr(content.ascendedSkills).length
            } : null });
    }
    prepareSkill({ mode, specializationId, skillId, actor = {}, targetId = null, targets = [], requestId } = {}) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        if (!['solo', 'party', 'pvp'].includes(String(mode)))
            throw new TypeError(`unsupported_combat_mode:${mode}`);
        if (!requestId)
            throw new TypeError('request_id_required');
        const canonicalId = this.registry.resolveCanonicalId(specializationId);
        if (!canonicalId || !this.registry.isPlayable(canonicalId))
            throw new Error('specialization_not_playable');
        const spec = this.content[canonicalId] || this.content[specializationId];
        if (!spec)
            throw new Error('specialization_content_missing');
        const rawSkill = arr(spec.skills).find(row => String(row === null || row === void 0 ? void 0 : row.id) === String(skillId));
        if (!rawSkill)
            throw new Error('skill_not_found');
        const normalized = normalizeSpecializationSkillRecord(rawSkill, canonicalId);
        if (n(actor.level, 1) < normalized.unlockLevel)
            throw new Error('skill_level_locked');
        const progress = progressFor(actor, canonicalId);
        const cooldowns = { ...obj(actor.cooldowns), ...obj(actor.skillCooldowns), ...obj(progress.cooldowns), ...obj(progress.skillCooldowns) };
        const cooldownActor = { ...actor, cooldowns };
        if (!CooldownEngine.ready(cooldownActor, normalized.id))
            throw new Error('skill_on_cooldown');
        const resource = resourceCostFor(normalized, actor);
        const available = currentResource(actor, resource.resource);
        if (available < resource.cost)
            throw new Error('insufficient_resource');
        const targetIdValue = targetId !== null && targetId !== void 0 ? targetId : (targetNeedsSelection(normalized.target) ? ((_b = (_a = targets.find(row => n(row === null || row === void 0 ? void 0 : row.hp) > 0)) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null) : null);
        if (targetNeedsSelection(normalized.target) && !targetIdValue)
            throw new Error('skill_target_required');
        if (targetIdValue && targets.length && !targets.some(row => String(row === null || row === void 0 ? void 0 : row.id) === String(targetIdValue) && n(row === null || row === void 0 ? void 0 : row.hp) > 0)) {
            throw new Error('skill_target_invalid');
        }
        const rank = clampInt((_c = progress.skillRanks) === null || _c === void 0 ? void 0 : _c[normalized.id], 1, 7, 1);
        const selectedUpgrades = arr((_d = progress.selectedUpgrades) === null || _d === void 0 ? void 0 : _d[normalized.id]);
        const upgrade = SkillUpgradeEngine.resolve(normalized, rank, selectedUpgrades);
        const tree = talentTreeFor(spec);
        const selectedTalents = [...new Set([...arr(progress.unlockedTalents), ...arr(progress.selectedTalents)])];
        const talentValidation = TalentEngine.validate(tree, selectedTalents, {
            points: n(progress.talentPoints, Infinity), level: n(actor.level, 1)
        });
        if (!talentValidation.ok)
            throw new Error(`invalid_talent_progress:${talentValidation.errors.join('|')}`);
        const talent = TalentEngine.collectModifiers(tree, selectedTalents);
        const canonicalActor = resolveSpecializationCombatActor({ ...actor }, canonicalId);
        const statSources = [
            { id: 'talents', effects: talent.modifiers },
            { id: 'skill_rank', effects: upgrade.modifiers },
            { id: 'domain', effects: obj(((_e = progress.domain) === null || _e === void 0 ? void 0 : _e.active) ? progress.domain.effects : {}) },
            { id: 'ascension', effects: obj(((_f = progress.domain) === null || _f === void 0 ? void 0 : _f.active) ? progress.domain.ascensionEffects : {}) }
        ];
        const stats = StatEngine.buildSnapshot({
            ...obj(canonicalActor.canonicalCombatStats),
            attack: n(canonicalActor.attack, (_g = canonicalActor.canonicalCombatStats) === null || _g === void 0 ? void 0 : _g.attackPower),
            magicPower: n(canonicalActor.magicPower, (_h = canonicalActor.canonicalCombatStats) === null || _h === void 0 ? void 0 : _h.attackPower),
            hp: n(actor.hp), maxHp: n((_j = actor.maxHp) !== null && _j !== void 0 ? _j : actor.max_hp),
            mp: n(actor.mp), maxMp: n((_k = actor.maxMp) !== null && _k !== void 0 ? _k : actor.max_mp),
            stamina: n(actor.stamina), maxStamina: n((_l = actor.maxStamina) !== null && _l !== void 0 ? _l : actor.max_stamina)
        }, statSources);
        const plan = {
            schema: 'etranom.central-skill-plan.v1', engineVersion: CENTRAL_CLASS_ENGINE_VERSION_V1955,
            mode, actorId: String(actor.id || ''), specializationId: canonicalId, classId: canonicalId.split('_')[0],
            skillId: normalized.id, requestId: String(requestId), targetId: targetIdValue == null ? null : String(targetIdValue),
            skill: normalized, rank, upgrade, talent: { selected: selectedTalents, modifiers: talent.modifiers, sources: talent.sources },
            stats, resource: { ...resource, availableBefore: available },
            cooldown: { turns: normalized.cooldownTurns, ready: true },
            domain: { active: ((_m = progress.domain) === null || _m === void 0 ? void 0 : _m.active) === true, stage: n((_o = progress.domain) === null || _o === void 0 ? void 0 : _o.stage), ascensionId: ((_p = progress.domain) === null || _p === void 0 ? void 0 : _p.ascensionId) || null },
            extensionNamespace: `specialization:${canonicalId}`,
            executionStatus: 'prepared_only'
        };
        return deepFreeze(plan);
    }
}
export const centralSpecializationEngineV1955 = new CentralSpecializationEngineV1955();
export function auditCentralClassEngineV1955() { return centralSpecializationEngineV1955.audit(); }
