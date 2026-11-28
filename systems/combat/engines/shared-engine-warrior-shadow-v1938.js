/**
 * ETRANOM V1938 — Warrior shared-engine shadow integration.
 *
 * All four Warrior specializations are preflighted through the canonical
 * registry + SkillEngine in validation-only mode. Their existing specialized
 * resolvers remain authoritative; this module does not commit resources,
 * cooldowns, effects, damage, or turn lifecycle changes.
 */
import { createSpecializationRegistry } from '../specialization-registry.js?build=2081';
import { normalizeSpecializationSkillRecord } from '../specialization-contract-runtime.js?v=1901&build=2081';
import { IRON_BASTION_DATA, resolveIronBastionSkill } from '../iron-bastion-runtime.js?v=1937&build=2081';
import { SWORD_ASCETIC_DATA, resolveSwordAsceticSkill } from '../sword-ascetic-runtime.js?v=1937&build=2081';
import { CHAOS_WARRIOR_DATA, resolveChaosSkill } from '../chaos-warrior-runtime.js?v=1901&build=2081';
import { APOCALYPSE_HARBINGER_DATA, resolveApocalypseSkill } from '../apocalypse-harbinger-runtime.js?v=1908&build=2081';
import { SkillEngine, StatEngine, CombatResultEngine, ENGINE_VERSION } from './shared-engine-runtime-v1913.js?build=2081';
const warriorData = Object.freeze({
    warrior_sword_ascetic: SWORD_ASCETIC_DATA,
    warrior_iron_bastion: IRON_BASTION_DATA,
    warrior_chaos: CHAOS_WARRIOR_DATA,
    warrior_apocalypse_harbinger: APOCALYPSE_HARBINGER_DATA
});
const manifest = {
    combat_modes: ['solo', 'party', 'pvp'],
    classes: [
        { id: 'wizard', status: 'implemented', specializations: [
                { id: 'wizard_arcane_mage', status: 'implemented' },
                { id: 'wizard_elementalist', status: 'implemented' },
                { id: 'wizard_warlock', status: 'implemented' },
                { id: 'wizard_necromancer', status: 'implemented' }
            ] },
        { id: 'warrior', status: 'implemented', specializations: [
                { id: 'warrior_sword_ascetic', status: 'implemented' },
                { id: 'warrior_iron_bastion', status: 'implemented' },
                { id: 'warrior_chaos', status: 'implemented', aliases: ['warrior_chaos_warrior'] },
                { id: 'warrior_apocalypse_harbinger', status: 'implemented' }
            ] },
        ...['gunner', 'assassin', 'monk', 'paladin', 'priest', 'ranger', 'shaman', 'summoner'].map(id => ({
            id, status: 'reserved', specializations: [1, 2, 3, 4].map(n => ({ id: `${id}_${n}`, status: 'reserved' }))
        }))
    ]
};
export const sharedEngineWarriorRegistryV1938 = createSpecializationRegistry(manifest);
const skillResolver = (specializationId, skillId) => {
    var _a, _b;
    const skill = (_b = (_a = warriorData[specializationId]) === null || _a === void 0 ? void 0 : _a.skills) === null || _b === void 0 ? void 0 : _b.find(row => String(row.id) === String(skillId));
    return skill ? normalizeSpecializationSkillRecord(skill, specializationId) : null;
};
const shadowSkillEngine = new SkillEngine({ registry: sharedEngineWarriorRegistryV1938, skillResolver });
let lastAudit = null;
const safeStats = actor => {
    var _a, _b, _c;
    return ({
        hp: actor === null || actor === void 0 ? void 0 : actor.hp, maxHp: (_a = actor === null || actor === void 0 ? void 0 : actor.maxHp) !== null && _a !== void 0 ? _a : actor === null || actor === void 0 ? void 0 : actor.max_hp,
        mp: actor === null || actor === void 0 ? void 0 : actor.mp, maxMp: (_b = actor === null || actor === void 0 ? void 0 : actor.maxMp) !== null && _b !== void 0 ? _b : actor === null || actor === void 0 ? void 0 : actor.max_mp,
        attack: (_c = actor === null || actor === void 0 ? void 0 : actor.attack) !== null && _c !== void 0 ? _c : actor === null || actor === void 0 ? void 0 : actor.power,
        defense: actor === null || actor === void 0 ? void 0 : actor.defense, speed: actor === null || actor === void 0 ? void 0 : actor.speed, level: actor === null || actor === void 0 ? void 0 : actor.level
    });
};
function projectWarriorActorForShadow(actor = {}, specializationId) {
    var _a;
    const progressKey = specializationId;
    const legacyKey = {
        warrior_sword_ascetic: 'swordAsceticProgress',
        warrior_iron_bastion: 'ironBastionProgress',
        warrior_chaos: 'chaosWarriorProgress',
        warrior_apocalypse_harbinger: 'apocalypseProgress'
    }[specializationId];
    const progress = ((_a = actor.classProgress) === null || _a === void 0 ? void 0 : _a[progressKey]) || actor[legacyKey] || {};
    // Cooldowns live in several established save locations. Project them into
    // the shared engine's canonical view without mutating or migrating the save.
    return {
        ...actor,
        cooldowns: {
            ...(actor.cooldowns || {}),
            ...(actor.skillCooldowns || {}),
            ...(progress.cooldowns || {}),
            ...(progress.skillCooldowns || {})
        }
    };
}
const legacyResolvers = Object.freeze({
    warrior_sword_ascetic: resolveSwordAsceticSkill,
    warrior_iron_bastion: resolveIronBastionSkill,
    warrior_chaos: resolveChaosSkill,
    warrior_apocalypse_harbinger: resolveApocalypseSkill
});
export function resolveWarriorSkillThroughSharedEngine({ mode, specializationId, skillId, payload = {}, legacyResolver } = {}) {
    var _a, _b, _c, _d, _e;
    if (!['solo', 'party', 'pvp'].includes(String(mode)))
        throw new TypeError(`unsupported_combat_mode:${mode}`);
    const canonicalId = sharedEngineWarriorRegistryV1938.resolveCanonicalId(specializationId);
    if (!canonicalId || !canonicalId.startsWith('warrior_') || !sharedEngineWarriorRegistryV1938.isPlayable(canonicalId)) {
        throw new Error('warrior_specialization_not_registered_or_playable');
    }
    const resolver = legacyResolver || legacyResolvers[canonicalId];
    if (typeof resolver !== 'function')
        throw new TypeError('legacy_resolver_required');
    const actor = payload.actor || {};
    const stats = StatEngine.buildSnapshot(safeStats(actor));
    let preflight = { ok: false, skipped: true, reason: 'skill_definition_not_found' };
    try {
        const shadowActor = projectWarriorActorForShadow(actor, canonicalId);
        const prepared = shadowSkillEngine.prepare({
            mode, actorId: actor.id, specializationId: canonicalId, skillId,
            targetId: (_c = (_a = payload.targetId) !== null && _a !== void 0 ? _a : (_b = payload.target) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : (_e = (_d = payload.targets) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.id,
            requestId: payload.requestId || `shadow:${mode}:${canonicalId}:${skillId}`
        }, shadowActor, { resource: 'stamina' });
        preflight = {
            ok: true, skipped: false, resource: prepared.resource, cost: prepared.cost,
            cooldownTurns: Number(prepared.skill.cooldownTurns) || 0,
            contractType: prepared.skill.contractType,
            target: prepared.skill.target
        };
    }
    catch (error) {
        // A shadow diagnostic must never block the established authoritative path.
        preflight = { ok: false, skipped: false, reason: String((error === null || error === void 0 ? void 0 : error.message) || error) };
    }
    const result = canonicalId === 'warrior_chaos'
        ? (() => { const value = resolver(skillId, { ...payload, mode }); return Object.freeze({ ...value, mode, skillId, baseSkillId: skillId }); })()
        : resolver(skillId, { ...payload, mode });
    const envelope = CombatResultEngine.create({
        mode, actor: (result === null || result === void 0 ? void 0 : result.actor) || actor,
        targets: (result === null || result === void 0 ? void 0 : result.targets) || payload.targets || [],
        events: (result === null || result === void 0 ? void 0 : result.log) || (result === null || result === void 0 ? void 0 : result.events) || [],
        turnId: payload.turnId || '', requestId: payload.requestId || ''
    });
    lastAudit = Object.freeze({
        engineVersion: ENGINE_VERSION, mode, specializationId: canonicalId,
        skillId: String(skillId), preflight, statSnapshot: stats.stats,
        result: envelope.result, legacyResultPreserved: true,
        timestamp: Date.now()
    });
    return result;
}
export function getSharedEngineWarriorAuditV1938() { return lastAudit; }
export function listWarriorShadowSpecializationsV1938() { return Object.keys(warriorData); }
