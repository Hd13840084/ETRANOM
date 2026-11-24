/**
 * ETRANOM V1919 — controlled, opt-in Wizard shared-plan shadow adapter.
 * Runs the V1918 plan on an isolated clone alongside the legacy resolver.
 * It NEVER changes the authoritative result or writes persistence/live state.
 * effectProvider MUST be a trusted server-side provider.
 */
import { compileWizardEffectPlanV1916 } from './wizard-effect-plan-v1916.js';
import { createWizardCompleteEffectHandlersV1918 } from './wizard-specialization-extensions-v1918.js';
import { executeWizardEffectPlanV1917 } from './wizard-effect-handlers-v1917.js';
import { resolveWizardSpecializationSkill } from '../specialization-skill-bridge.js';

export const WIZARD_SHADOW_ADAPTER_VERSION_V1919 = '1919.0.0';
const clone = value => structuredClone(value ?? {});
const asObject = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const MODES = new Set(['solo', 'party', 'pvp']);

function projectState(state) {
  const actor = asObject(state?.actor);
  const targets = Array.isArray(state?.targets) ? state.targets : [];
  return {
    actor: {
      id: actor.id ?? null,
      hp: Number(actor.hp ?? 0), mp: Number(actor.mp ?? actor.mana ?? 0),
      stamina: Number(actor.stamina ?? 0),
      classProgress: clone(actor.classProgress ?? actor.class_progress ?? {})
    },
    targets: targets.map(t => ({ id: t.id ?? null, hp: Number(t.hp ?? 0), statuses: clone(t.statuses ?? {}) })),
    effectLog: clone(state?.effectLog ?? [])
  };
}

export function runWizardSharedPlanShadowV1919({
  mode, specializationId, skillId, actor = {}, targets = [], selectedTargetId = null,
  selectedTargetIds = [], requestId, payload = {}, effectProvider,
  legacyResolver = resolveWizardSpecializationSkill, handlers = createWizardCompleteEffectHandlersV1918()
} = {}) {
  if (!MODES.has(String(mode))) throw new TypeError(`unsupported_combat_mode:${mode}`);
  if (typeof effectProvider !== 'function') throw new Error('trusted_effect_provider_required');
  if (typeof legacyResolver !== 'function') throw new TypeError('legacy_resolver_required');
  if (!requestId) throw new TypeError('request_id_required');

  const plan = compileWizardEffectPlanV1916(specializationId, skillId);
  if (!plan || plan.status !== 'compiled') throw new Error('wizard_effect_plan_not_compiled');

  // Both executions receive isolated copies. Legacy remains authoritative.
  const legacyResult = legacyResolver(specializationId, skillId, {
    ...clone(payload), mode, actor: clone(actor), targets: clone(targets), targetId: selectedTargetId
  });
  const initialPlanState = { actor: clone(actor), targets: clone(targets) };
  const planResult = executeWizardEffectPlanV1917(plan, initialPlanState, {
    mode, requestId: String(requestId), selectedTargetId,
    selectedTargetIds: clone(selectedTargetIds), effectProvider, plan
  }, handlers);

  const legacyProjection = projectState({ actor: legacyResult?.actor, targets: legacyResult?.targets, effectLog: legacyResult?.log });
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
