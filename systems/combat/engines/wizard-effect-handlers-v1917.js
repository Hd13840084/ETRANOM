/**
 * ETRANOM V1917 — shared Wizard effect handler registry.
 *
 * This is an opt-in execution layer for V1916 plans. It deliberately consumes
 * effect values only from a trusted server-side effectProvider. It does not
 * read client-supplied damage/status/resource amounts and does not switch the
 * live combat resolver. Specialization mechanics must be supplied explicitly
 * through extensionHandlers until their semantics have parity tests.
 */
import {
  WIZARD_EFFECT_PLAN_VERSION,
  WIZARD_STANDARD_EFFECT_KINDS,
  executeWizardEffectPlanV1916
} from './wizard-effect-plan-v1916.js';

export const WIZARD_EFFECT_HANDLER_VERSION = '1917.0.0';
const MODES = new Set(['solo', 'party', 'pvp']);
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const positive = value => Math.max(0, finite(value));
const clone = value => structuredClone(value ?? {});

function getTargets(state, step, context) {
  const actor = object(state.actor);
  const targets = Array.isArray(state.targets) ? state.targets : [];
  switch (step.scope) {
    case 'self': return actor.id == null ? [actor] : [actor];
    case 'active_legion': return Array.isArray(actor.legion) ? actor.legion.filter(x => x && x.active !== false) : [];
    case 'selected_target': {
      const id = String(context.selectedTargetId ?? '');
      return targets.filter(t => String(t.id) === id && finite(t.hp, 0) > 0).slice(0, 1);
    }
    case 'all_live_targets': return targets.filter(t => finite(t.hp, 0) > 0);
    case 'ordered_targets':
    case 'runtime_selected_targets': {
      const ids = Array.isArray(context.selectedTargetIds) ? context.selectedTargetIds.map(String) : [];
      const byId = new Map(targets.map(t => [String(t.id), t]));
      return ids.map(id => byId.get(id)).filter(t => t && finite(t.hp, 0) > 0);
    }
    case 'selected_corpse': {
      const id = String(context.selectedTargetId ?? '');
      return targets.filter(t => String(t.id) === id && finite(t.hp, 0) <= 0).slice(0, 1);
    }
    default: throw new Error(`unsupported_effect_scope:${step.scope}`);
  }
}

function effectInput(step, state, context) {
  if (typeof context.effectProvider !== 'function') throw new Error('trusted_effect_provider_required');
  const input = context.effectProvider(Object.freeze({ step, state: clone(state), plan: context.plan, mode: context.mode }));
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError(`invalid_effect_input:${step.kind}`);
  return input;
}

function applyDamage(state, step, context) {
  const input = effectInput(step, state, context);
  const amount = positive(input.amount);
  const targets = getTargets(state, step, context);
  if (!targets.length) throw new Error(`effect_targets_missing:${step.scope}`);
  for (const target of targets) target.hp = Math.max(0, finite(target.hp) - amount);
  state.effectLog ??= [];
  state.effectLog.push({ kind: 'damage', amount, targetIds: targets.map(t => t.id ?? null) });
}
function applyHeal(state, step, context) {
  const input = effectInput(step, state, context), amount = positive(input.amount);
  const targets = getTargets(state, step, context);
  if (!targets.length) throw new Error(`effect_targets_missing:${step.scope}`);
  for (const target of targets) target.hp = Math.min(Math.max(1, finite(target.maxHp, finite(target.hp))), Math.max(0, finite(target.hp)) + amount);
  state.effectLog ??= []; state.effectLog.push({ kind: 'heal', amount, targetIds: targets.map(t => t.id ?? null) });
}
function applyShield(state, step, context) {
  const input = effectInput(step, state, context), amount = positive(input.amount);
  const targets = getTargets(state, step, context);
  if (!targets.length) throw new Error(`effect_targets_missing:${step.scope}`);
  for (const target of targets) target.shield = positive(target.shield) + amount;
  state.effectLog ??= []; state.effectLog.push({ kind: 'shield', amount, targetIds: targets.map(t => t.id ?? null) });
}
function applyStatus(state, step, context) {
  const input = effectInput(step, state, context);
  if (!input.status || typeof input.status !== 'object' || !input.status.id) throw new Error('status_definition_required');
  const targets = getTargets(state, step, context);
  if (!targets.length) throw new Error(`effect_targets_missing:${step.scope}`);
  for (const target of targets) {
    target.statuses = Array.isArray(target.statuses) ? target.statuses : [];
    target.statuses = [...target.statuses.filter(s => s.id !== input.status.id), clone(input.status)];
  }
  state.effectLog ??= []; state.effectLog.push({ kind: 'apply_status', statusId: input.status.id, targetIds: targets.map(t => t.id ?? null) });
}
function cleanse(state, step, context) {
  const input = effectInput(step, state, context), targets = getTargets(state, step, context);
  if (!targets.length) throw new Error(`effect_targets_missing:${step.scope}`);
  const remove = new Set(Array.isArray(input.statusIds) ? input.statusIds.map(String) : []);
  for (const target of targets) target.statuses = (Array.isArray(target.statuses) ? target.statuses : []).filter(s => remove.size ? !remove.has(String(s.id)) : s.polarity !== 'negative');
  state.effectLog ??= []; state.effectLog.push({ kind: 'cleanse', targetIds: targets.map(t => t.id ?? null) });
}
function resourceChange(direction) {
  return (state, step, context) => {
    const input = effectInput(step, state, context), amount = positive(input.amount);
    const actor = object(state.actor), resource = String(input.resource || 'mana');
    if (!['mana', 'stamina', 'energy', 'souls'].includes(resource)) throw new Error(`unsupported_resource:${resource}`);
    const maxKey = `max${resource[0].toUpperCase()}${resource.slice(1)}`;
    const current = positive(actor[resource]);
    actor[resource] = direction > 0 ? Math.min(positive(actor[maxKey] ?? Number.MAX_SAFE_INTEGER), current + amount) : Math.max(0, current - amount);
    state.actor = actor; state.effectLog ??= [];
    state.effectLog.push({ kind: direction > 0 ? 'resource_gain' : 'resource_drain', resource, amount });
  };
}
function statModifier(state, step, context) {
  const input = effectInput(step, state, context), targets = getTargets(state, step, context);
  if (!input.stat || !Number.isFinite(Number(input.amount))) throw new Error('stat_modifier_definition_required');
  if (!targets.length) throw new Error(`effect_targets_missing:${step.scope}`);
  for (const target of targets) {
    target.modifiers = Array.isArray(target.modifiers) ? target.modifiers : [];
    target.modifiers.push({ stat: String(input.stat), amount: Number(input.amount), durationTurns: Math.max(1, Math.floor(positive(input.durationTurns) || 1)), source: context.plan.skillId });
  }
  state.effectLog ??= []; state.effectLog.push({ kind: 'stat_modifier', stat: String(input.stat), targetIds: targets.map(t => t.id ?? null) });
}
function summon(state, step, context) {
  const input = effectInput(step, state, context);
  if (!input.summon || typeof input.summon !== 'object' || !input.summon.id) throw new Error('summon_definition_required');
  const actor = object(state.actor); actor.summons = Array.isArray(actor.summons) ? actor.summons : [];
  const max = Math.max(1, Math.floor(positive(input.maxSummons) || 3));
  if (actor.summons.length >= max) throw new Error('summon_capacity_reached');
  actor.summons.push(clone(input.summon)); state.actor = actor;
  state.effectLog ??= []; state.effectLog.push({ kind: 'summon', summonId: input.summon.id });
}
function multiHit(state, step, context) {
  const input = effectInput(step, state, context);
  const hits = Math.max(1, Math.min(12, Math.floor(positive(input.hits) || 1)));
  const perHit = positive(input.amount), targets = getTargets(state, step, context);
  if (!targets.length) throw new Error(`effect_targets_missing:${step.scope}`);
  const results = [];
  for (let hit = 0; hit < hits; hit++) for (const target of targets) {
    const dealt = Math.min(positive(target.hp), perHit); target.hp = Math.max(0, positive(target.hp) - perHit);
    results.push({ hit: hit + 1, targetId: target.id ?? null, amount: dealt });
  }
  state.effectLog ??= []; state.effectLog.push({ kind: 'multi_hit', hits, results });
}
function taunt(state, step, context) {
  const input = effectInput(step, state, context), targets = getTargets(state, step, context);
  if (!targets.length) throw new Error(`effect_targets_missing:${step.scope}`);
  const actorId = state.actor?.id;
  for (const target of targets) target.tauntedBy = actorId ?? input.tauntedBy ?? 'self';
  state.effectLog ??= []; state.effectLog.push({ kind: 'taunt', targetIds: targets.map(t => t.id ?? null) });
}
function revive(state, step, context) {
  const input = effectInput(step, state, context), targets = getTargets(state, step, context);
  if (!targets.length) throw new Error(`effect_targets_missing:${step.scope}`);
  for (const target of targets) {
    if (positive(target.hp) > 0) continue;
    target.hp = Math.max(1, Math.floor(positive(target.maxHp) * Math.min(100, positive(input.hpPct) || 25) / 100));
  }
  state.effectLog ??= []; state.effectLog.push({ kind: 'revive', targetIds: targets.map(t => t.id ?? null) });
}
function dispel(state, step, context) {
  const input = effectInput(step, state, context), targets = getTargets(state, step, context);
  if (!targets.length) throw new Error(`effect_targets_missing:${step.scope}`);
  const remove = new Set(Array.isArray(input.statusIds) ? input.statusIds.map(String) : []);
  for (const target of targets) target.statuses = (Array.isArray(target.statuses) ? target.statuses : []).filter(s => remove.size ? !remove.has(String(s.id)) : s.polarity !== 'positive');
  state.effectLog ??= []; state.effectLog.push({ kind: 'dispel', targetIds: targets.map(t => t.id ?? null) });
}

const STANDARD_HANDLERS = Object.freeze({
  damage: applyDamage, heal: applyHeal, shield: applyShield, apply_status: applyStatus,
  cleanse, resource_gain: resourceChange(1), resource_drain: resourceChange(-1),
  stat_modifier: statModifier, summon, multi_hit: multiHit, taunt, revive, dispel
});

export function createWizardEffectHandlersV1917({ extensionHandlers = {} } = {}) {
  const handlers = { ...STANDARD_HANDLERS };
  for (const [id, handler] of Object.entries(extensionHandlers)) {
    if (!/^wizard\.(arcane-mage|elementalist|warlock|necromancer)\.[a-z0-9_.-]+$/i.test(id)) throw new TypeError(`invalid_extension_handler_id:${id}`);
    if (typeof handler !== 'function') throw new TypeError(`invalid_extension_handler:${id}`);
    if (handlers[id]) throw new Error(`handler_id_collision:${id}`);
    handlers[id] = handler;
  }
  return Object.freeze(handlers);
}

export function auditWizardEffectHandlerCoverageV1917(plans, handlers) {
  const missing = [];
  for (const plan of Array.isArray(plans) ? plans : []) for (const step of plan.steps || []) {
    if (typeof handlers?.[step.handlerId] !== 'function' && typeof handlers?.[step.kind] !== 'function') missing.push({ specializationId: plan.specializationId, skillId: plan.skillId, handlerId: step.handlerId });
  }
  return Object.freeze({ version: WIZARD_EFFECT_HANDLER_VERSION, planVersion: WIZARD_EFFECT_PLAN_VERSION,
    standardHandlerCount: Object.keys(STANDARD_HANDLERS).length,
    registeredExtensionCount: Object.keys(handlers || {}).filter(id => id.startsWith('wizard.')).length,
    missingHandlerCount: missing.length, missing: Object.freeze(missing), liveCutoverReady: false });
}

export function executeWizardEffectPlanV1917(plan, state, context = {}, handlers = createWizardEffectHandlersV1917()) {
  if (!plan || plan.version !== WIZARD_EFFECT_PLAN_VERSION) throw new Error('unsupported_effect_plan_version');
  if (!MODES.has(String(context.mode || ''))) throw new TypeError(`unsupported_combat_mode:${context.mode}`);
  if (typeof context.effectProvider !== 'function') throw new Error('trusted_effect_provider_required');
  return executeWizardEffectPlanV1916(plan, state, context, handlers);
}

export function getWizardEffectHandlerKindsV1917() {
  return Object.freeze([...WIZARD_STANDARD_EFFECT_KINDS].filter(kind => typeof STANDARD_HANDLERS[kind] === 'function').sort());
}
