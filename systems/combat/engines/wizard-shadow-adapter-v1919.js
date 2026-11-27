/**
 * ETRANOM V1919 — controlled, opt-in Wizard shared-plan shadow adapter.
 * Runs the V1918 plan on an isolated clone alongside the legacy resolver.
 * It NEVER changes the authoritative result or writes persistence/live state.
 * effectProvider MUST be a trusted server-side provider.
 */
import { compileWizardEffectPlanV1916 } from './wizard-effect-plan-v1916.js?build=2081';
import { createWizardCompleteEffectHandlersV1918 } from './wizard-specialization-extensions-v1918.js?build=2081';
import { executeWizardEffectPlanV1917 } from './wizard-effect-handlers-v1917.js?build=2081';
import { resolveWizardSpecializationSkill } from '../specialization-skill-bridge.js?build=2081';
export const WIZARD_SHADOW_ADAPTER_VERSION_V1919 = '1919.0.0';
const clone = value => structuredClone(value !== null && value !== void 0 ? value : {});
const asObject = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const MODES = new Set(['solo', 'party', 'pvp']);
function projectState(state) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const actor = asObject(state === null || state === void 0 ? void 0 : state.actor);
    const targets = Array.isArray(state === null || state === void 0 ? void 0 : state.targets) ? state.targets : [];
    return {
        actor: {
            id: (_a = actor.id) !== null && _a !== void 0 ? _a : null,
            hp: Number((_b = actor.hp) !== null && _b !== void 0 ? _b : 0), mp: Number((_d = (_c = actor.mp) !== null && _c !== void 0 ? _c : actor.mana) !== null && _d !== void 0 ? _d : 0),
            stamina: Number((_e = actor.stamina) !== null && _e !== void 0 ? _e : 0),
            classProgress: clone((_g = (_f = actor.classProgress) !== null && _f !== void 0 ? _f : actor.class_progress) !== null && _g !== void 0 ? _g : {})
        },
        targets: targets.map(t => { var _a, _b, _c; return ({ id: (_a = t.id) !== null && _a !== void 0 ? _a : null, hp: Number((_b = t.hp) !== null && _b !== void 0 ? _b : 0), statuses: clone((_c = t.statuses) !== null && _c !== void 0 ? _c : {}) }); }),
        effectLog: clone((_h = state === null || state === void 0 ? void 0 : state.effectLog) !== null && _h !== void 0 ? _h : [])
    };
}
export function runWizardSharedPlanShadowV1919({ mode, specializationId, skillId, actor = {}, targets = [], selectedTargetId = null, selectedTargetIds = [], requestId, payload = {}, effectProvider, legacyResolver = resolveWizardSpecializationSkill, handlers = createWizardCompleteEffectHandlersV1918() } = {}) {
    if (!MODES.has(String(mode)))
        throw new TypeError(`unsupported_combat_mode:${mode}`);
    if (typeof effectProvider !== 'function')
        throw new Error('trusted_effect_provider_required');
    if (typeof legacyResolver !== 'function')
        throw new TypeError('legacy_resolver_required');
    if (!requestId)
        throw new TypeError('request_id_required');
    const plan = compileWizardEffectPlanV1916(specializationId, skillId);
    if (!plan || plan.status !== 'compiled')
        throw new Error('wizard_effect_plan_not_compiled');
    // Both executions receive isolated copies. Legacy remains authoritative.
    const legacyResult = legacyResolver(specializationId, skillId, {
        ...clone(payload), mode, actor: clone(actor), targets: clone(targets), targetId: selectedTargetId
    });
    const initialPlanState = { actor: clone(actor), targets: clone(targets) };
    const planResult = executeWizardEffectPlanV1917(plan, initialPlanState, {
        mode, requestId: String(requestId), selectedTargetId,
        selectedTargetIds: clone(selectedTargetIds), effectProvider, plan
    }, handlers);
    const legacyProjection = projectState({ actor: legacyResult === null || legacyResult === void 0 ? void 0 : legacyResult.actor, targets: legacyResult === null || legacyResult === void 0 ? void 0 : legacyResult.targets, effectLog: legacyResult === null || legacyResult === void 0 ? void 0 : legacyResult.log });
    const planProjection = projectState(planResult.state);
    const summary = Object.freeze({
        mode, specializationId, skillId, planVersion: plan.version,
        legacyResultAvailable: Boolean(legacyResult), planExecuted: true,
        actorHpEqual: legacyProjection.actor.hp === planProjection.actor.hp,
        actorMpEqual: legacyProjection.actor.mp === planProjection.actor.mp,
        targetHpEqual: JSON.stringify(legacyProjection.targets.map(x => [x.id, x.hp])) === JSON.stringify(planProjection.targets.map(x => [x.id, x.hp])),
        legacyTargetCount: legacyProjection.targets.length,
        planTargetCount: planProjection.targets.length,
        parity: legacyProjection.actor.hp === planProjection.actor.hp &&
            legacyProjection.actor.mp === planProjection.actor.mp &&
            JSON.stringify(legacyProjection.targets.map(x => [x.id, x.hp])) === JSON.stringify(planProjection.targets.map(x => [x.id, x.hp]))
    });
    return Object.freeze({
        version: WIZARD_SHADOW_ADAPTER_VERSION_V1919,
        authoritativeResult: legacyResult,
        shadow: Object.freeze({ state: planResult.state, events: planResult.events, duplicate: planResult.duplicate }),
        comparison: summary,
        authoritativeSource: 'legacy_resolver',
        persisted: false,
        liveCutover: false
    });
}
export function auditWizardShadowAdapterModesV1919() {
    return Object.freeze({ version: WIZARD_SHADOW_ADAPTER_VERSION_V1919,
        supportedModes: Object.freeze(['solo', 'party', 'pvp']),
        requiresTrustedEffectProvider: true, legacyRemainsAuthoritative: true,
        writesPersistence: false, enablesLiveCutover: false });
}
