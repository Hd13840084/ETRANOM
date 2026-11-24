/**
 * ETRANOM V1972 — central combat runtime integration layer.
 *
 * This module is the single routing contract for live Solo, Party and PvP
 * action entry points. It does not move authority from existing executors:
 * Solo remains local-save authoritative; Party/PvP remain server-RPC
 * authoritative. The adapter makes mode, action, request identity and
 * execution boundaries explicit and testable.
 */
import { prepareCombatActionV1967, dispatchCombatActionV1967 } from './central-combat-runtime-v1967.js';

export const CENTRAL_COMBAT_RUNTIME_VERSION_V1972 = '1972.0.0';
const obj = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const MODES = new Set(['solo', 'party', 'pvp']);
const SOLO_ALIASES = Object.freeze({ defend: 'guard', flee: 'retreat', potion: 'item', scroll: 'item' });

export function normalizeCombatActionV1972(mode, intent = {}, options = {}) {
  const normalizedMode = String(mode || '').trim().toLowerCase();
  if (!MODES.has(normalizedMode)) throw new TypeError(`unsupported_combat_mode:${normalizedMode}`);
  const raw = obj(intent);
  let action = String(raw.action || '').trim().toLowerCase();
  let normalizedIntent = { ...raw, action };
  if (normalizedMode === 'solo') {
    if (action.startsWith('potion:') || action.startsWith('scroll:')) normalizedIntent = { ...raw, action: 'item', itemId: action.slice(action.indexOf(':') + 1) };
    else if (SOLO_ALIASES[action]) normalizedIntent = { ...raw, action: SOLO_ALIASES[action] };
  }
  if (normalizedMode === 'party' && action === 'potion') normalizedIntent = { ...raw, action: 'item' };
  return prepareCombatActionV1967(normalizedMode, normalizedIntent, { serverValidatedSkill: options.serverValidatedSkill === true });
}

/** Synchronous Solo adapter: the existing local combat executor still mutates state. */
export function dispatchSoloCombatActionV1972({ intent, context = {}, execute } = {}) {
  if (typeof execute !== 'function') throw new TypeError('solo_authoritative_executor_required');
  const prepared = normalizeCombatActionV1972('solo', intent);
  const safeContext = Object.freeze({ ...obj(context), mode: 'solo', runtimeVersion: CENTRAL_COMBAT_RUNTIME_VERSION_V1972 });
  const result = execute(Object.freeze({ ...prepared, context: safeContext }));
  return Object.freeze({ accepted: true, mode: 'solo', action: prepared.action, result, runtimeVersion: CENTRAL_COMBAT_RUNTIME_VERSION_V1972 });
}

/** Async Party/PvP adapter: delegates to the existing authenticated RPC. */
export async function dispatchRemoteCombatActionV1972({ mode, intent, requestId, execute, context = {}, serverValidatedSkill = false } = {}) {
  const normalizedMode = String(mode || '').trim().toLowerCase();
  if (!['party', 'pvp'].includes(normalizedMode)) throw new TypeError('remote_combat_mode_required');
  const id = String(requestId || '').trim();
  if (!id) throw new TypeError('combat_request_id_required');
  if (typeof execute !== 'function') throw new TypeError('server_authoritative_executor_required');
  const prepared = normalizeCombatActionV1972(normalizedMode, intent, { serverValidatedSkill });
  const result = await dispatchCombatActionV1967({
    mode: normalizedMode, intent: { ...prepared, action: prepared.action },
    serverValidatedSkill, context: { ...obj(context), requestId: id, runtimeVersion: CENTRAL_COMBAT_RUNTIME_VERSION_V1972 },
    execute: command => execute({ command, requestId: id, context: { ...obj(context), mode: normalizedMode } })
  });
  return result;
}

export function getCentralCombatIntegrationManifestV1972() {
  return Object.freeze({
    version: CENTRAL_COMBAT_RUNTIME_VERSION_V1972,
    modes: Object.freeze({
      solo: Object.freeze({ route: 'dispatchSoloCombatActionV1972', authority: 'existing_local_combat_executor', persistence: 'existing_game_save' }),
      party: Object.freeze({ route: 'dispatchRemoteCombatActionV1972', authority: 'Supabase etranom_party_battle_act_v1969', idempotency: 'V1969 request receipt' }),
      pvp: Object.freeze({ route: 'dispatchRemoteCombatActionV1972', authority: 'Supabase etranom_pvp_action_v1969 / etranom_pvp_skill_action_v1969', idempotency: 'V1969 request receipt' })
    }),
    limitations: Object.freeze(['V1968 transactional lifecycle service is not installed as a live PostgreSQL transaction adapter.', 'Solo remains browser-save authoritative until a server-backed Solo endpoint is implemented.'])
  });
}

export const CentralCombatRuntimeV1972 = Object.freeze({
  version: CENTRAL_COMBAT_RUNTIME_VERSION_V1972,
  normalizeAction: normalizeCombatActionV1972,
  dispatchSolo: dispatchSoloCombatActionV1972,
  dispatchRemote: dispatchRemoteCombatActionV1972,
  manifest: getCentralCombatIntegrationManifestV1972
});
