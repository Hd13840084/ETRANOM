/**
 * ETRANOM V1967 — shared combat runtime gateway.
 *
 * This module centralizes the client-side combat contract and deterministic
 * damage primitive. It deliberately delegates authoritative state changes to
 * the existing Solo runtime or server RPCs for Party/PvP. It never accepts
 * client-calculated damage as authority and never replaces mode-specific rules.
 */
import { COMBAT_MODE, COMBAT_PROFILES, normalizeCombatIntent, normalizeCombatStats, resolveDamage } from './combat-core.js';
import { isCombatActionSupported } from './combat-contract.js';

export const CENTRAL_COMBAT_RUNTIME_VERSION_V1967 = '1967.0.0';
const MODES = new Set(Object.values(COMBAT_MODE));
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};

function parseIntent(mode, input = {}, options = {}) {
  const raw = object(input);
  let action = String(raw.action || '').trim().toLowerCase();
  let skillId = raw.skillId == null ? null : String(raw.skillId);
  let choice = raw.choice == null ? null : String(raw.choice);
  // Party's established RPC contract encodes skills as skill:<id>|<choice>.
  if (mode === 'party' && action === 'potion') action = 'item';
  if (mode === 'party' && action.startsWith('skill:')) {
    const [id, selected = ''] = action.slice(6).split('|', 2);
    action = 'skill'; skillId = id; choice = selected || choice;
  }
  if (!MODES.has(mode)) throw new TypeError(`unsupported_combat_mode:${mode}`);
  if (mode === 'pvp' && action === 'skill' && options.serverValidatedSkill === true) {
    const normalized = normalizeCombatIntent(mode, { ...raw, action: 'skill', skillId });
    return Object.freeze({ ...normalized, choice, serverValidatedSkill: true });
  }
  const normalized = normalizeCombatIntent(mode, { ...raw, action, skillId });
  if (!isCombatActionSupported(mode, normalized.action)) throw new Error(`combat_action_not_supported:${mode}:${normalized.action}`);
  if (normalized.action === 'skill' && !normalized.skillId) throw new Error('combat_skill_id_required');
  return Object.freeze({ ...normalized, choice });
}

export function prepareCombatActionV1967(mode, intent = {}, options = {}) {
  return parseIntent(String(mode || '').toLowerCase(), intent, options);
}

/** Validate then delegate to the mode's existing authoritative executor. */
export async function dispatchCombatActionV1967({ mode, intent, execute, context = {}, serverValidatedSkill = false } = {}) {
  const normalizedMode = String(mode || '').toLowerCase();
  if (typeof execute !== 'function') throw new TypeError('authoritative_combat_executor_required');
  const prepared = prepareCombatActionV1967(normalizedMode, intent, { serverValidatedSkill });
  const safeContext = Object.freeze({ ...object(context), mode: normalizedMode });
  // The executor is the only component allowed to mutate/persist combat state.
  return execute(Object.freeze({ ...prepared, context: safeContext }));
}

export function resolveCombatDamageV1967(mode, attacker, defender, tuning = {}, rolls = {}) {
  const normalizedMode = String(mode || '').toLowerCase();
  if (!MODES.has(normalizedMode)) throw new TypeError(`unsupported_combat_mode:${normalizedMode}`);
  return resolveDamage(normalizeCombatStats(attacker), normalizeCombatStats(defender), {
    ...COMBAT_PROFILES[normalizedMode], ...object(tuning)
  }, rolls);
}

export const CentralCombatRuntimeV1967 = Object.freeze({
  version: CENTRAL_COMBAT_RUNTIME_VERSION_V1967,
  modes: Object.freeze([...MODES]),
  prepareAction: prepareCombatActionV1967,
  dispatchAction: dispatchCombatActionV1967,
  normalizeStats: normalizeCombatStats,
  // Backward-compatible Solo signature used by the existing local battle runtime.
  resolveDamage: (attacker, defender, tuning = {}, rolls = {}) => resolveCombatDamageV1967('solo', attacker, defender, tuning, rolls),
  resolveDamageForMode: resolveCombatDamageV1967
});
