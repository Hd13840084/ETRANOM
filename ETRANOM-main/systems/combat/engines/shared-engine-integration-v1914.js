/**
 * ETRANOM V1914 — Wizard shared-engine shadow integration.
 *
 * The legacy wizard resolver remains authoritative for gameplay in this phase.
 * The shared SkillEngine is run in PREPARE/validation-only shadow mode so that
 * differences can be audited without charging resources, starting cooldowns,
 * changing effects, or changing combat outcomes. This is an intentional
 * compatibility bridge, not the final live cutover.
 */
import { createSpecializationRegistry } from '../specialization-registry.js?build=2081';
import { normalizeSpecializationSkillRecord } from '../specialization-contract-runtime.js?v=1901&build=2081';
import { IMPLEMENTED_SPECIALIZATIONS } from '../specialization-skill-bridge.js?v=1900&build=2081';
import { SkillEngine, StatEngine, CombatResultEngine, ENGINE_VERSION } from './shared-engine-runtime-v1913.js?build=2081';
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
export const sharedEngineRegistryV1914 = createSpecializationRegistry(manifest);
const wizardSkillResolver = (specializationId, skillId) => {
    var _a, _b;
    const raw = (_b = (_a = IMPLEMENTED_SPECIALIZATIONS[specializationId]) === null || _a === void 0 ? void 0 : _a.skills) === null || _b === void 0 ? void 0 : _b.find(s => String(s.id) === String(skillId));
    return raw ? normalizeSpecializationSkillRecord(raw, specializationId) : null;
};
const shadowSkillEngine = new SkillEngine({ registry: sharedEngineRegistryV1914, skillResolver: wizardSkillResolver });
let lastAudit = null;
const safeStats = actor => {
    var _a, _b, _c;
    return ({
        hp: actor === null || actor === void 0 ? void 0 : actor.hp, maxHp: (_a = actor === null || actor === void 0 ? void 0 : actor.maxHp) !== null && _a !== void 0 ? _a : actor === null || actor === void 0 ? void 0 : actor.max_hp,
        mp: actor === null || actor === void 0 ? void 0 : actor.mp, maxMp: (_b = actor === null || actor === void 0 ? void 0 : actor.maxMp) !== null && _b !== void 0 ? _b : actor === null || actor === void 0 ? void 0 : actor.max_mp,
        attack: (_c = actor === null || actor === void 0 ? void 0 : actor.attack) !== null && _c !== void 0 ? _c : actor === null || actor === void 0 ? void 0 : actor.power, defense: actor === null || actor === void 0 ? void 0 : actor.defense,
        speed: actor === null || actor === void 0 ? void 0 : actor.speed, level: actor === null || actor === void 0 ? void 0 : actor.level
    });
};
export function resolveWizardSkillThroughSharedEngine({ mode, specializationId, skillId, payload = {}, legacyResolver } = {}) {
    if (!['solo', 'party', 'pvp'].includes(String(mode)))
        throw new TypeError(`unsupported_combat_mode:${mode}`);
    const canonicalId = sharedEngineRegistryV1914.resolveCanonicalId(specializationId);
    if (!canonicalId || !canonicalId.startsWith('wizard_') || !sharedEngineRegistryV1914.isPlayable(canonicalId)) {
        throw new Error('wizard_specialization_not_registered_or_playable');
    }
    if (typeof legacyResolver !== 'function')
        throw new TypeError('legacy_resolver_required');
    const actor = payload.actor || {};
    const stats = StatEngine.buildSnapshot(safeStats(actor));
    let preflight = { ok: false, skipped: true, reason: 'skill_definition_not_found' };
    try {
        const prepared = shadowSkillEngine.prepare({
            mode, actorId: actor.id, specializationId: canonicalId, skillId,
            targetId: payload.targetId, requestId: payload.requestId || `shadow:${mode}:${canonicalId}:${skillId}`
        }, actor, { resource: 'mana' });
        preflight = { ok: true, skipped: false, resource: prepared.resource, cost: prepared.cost,
            cooldownTurns: Number(prepared.skill.cooldownTurns) || 0, contractType: prepared.skill.contractType };
    }
    catch (error) {
        // Shadow diagnostics must never block the proven legacy gameplay path.
        preflight = { ok: false, skipped: false, reason: String((error === null || error === void 0 ? void 0 : error.message) || error) };
    }
    const result = legacyResolver(canonicalId, skillId, { ...payload, mode });
    const envelope = CombatResultEngine.create({
        mode, actor: (result === null || result === void 0 ? void 0 : result.actor) || actor, targets: (result === null || result === void 0 ? void 0 : result.targets) || payload.targets || [],
        events: (result === null || result === void 0 ? void 0 : result.log) || [], turnId: payload.turnId || '', requestId: payload.requestId || ''
    });
    lastAudit = Object.freeze({
        engineVersion: ENGINE_VERSION, mode, specializationId: canonicalId, skillId: String(skillId),
        preflight, statSnapshot: stats.stats, result: envelope.result,
        legacyResultPreserved: true, timestamp: Date.now()
    });
    return result;
}
export function getSharedEngineIntegrationAuditV1914() { return lastAudit; }
