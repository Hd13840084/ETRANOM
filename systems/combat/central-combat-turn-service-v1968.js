/**
 * ETRANOM V1968 — transactional turn/lifecycle coordinator.
 *
 * This is a server-side integration boundary, not a browser-authoritative
 * combat engine. A production store MUST implement serializable per-combat
 * transactions (row lock / advisory lock) and persist request receipts in the
 * same transaction as state. Existing Solo/Party/PvP executors remain the
 * authority until each backend endpoint is explicitly migrated to this API.
 */
import { CentralCombatLifecycleV1956 } from './engines/central-combat-lifecycle-v1956.js';
import { prepareCombatActionV1967 } from './central-combat-runtime-v1967.js';
import { isCombatActionSupported } from './combat-contract.js';

export const CENTRAL_COMBAT_TURN_SERVICE_VERSION_V1968 = '1968.0.0';
const MODES = new Set(['solo', 'party', 'pvp']);
const obj = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const arr = value => Array.isArray(value) ? value : [];
const clone = value => structuredClone(value ?? {});
const terminal = value => ['victory', 'defeat', 'draw', 'completed', 'aborted'].includes(String(value || '').toLowerCase());

function validateStore(store) {
  if (!store || typeof store.transact !== 'function') {
    throw new TypeError('serializable_combat_store_required');
  }
}

/**
 * `store.transact(id, fn)` must serialize concurrent requests for the same
 * combat and expose getState/setState/getRequestResult/setRequestResult.
 */
export class CentralCombatTurnServiceV1968 {
  constructor({ store, executeAction, resolveTrustedSkillPlan, effectCompiler, terminalResolver } = {}) {
    validateStore(store);
    if (typeof executeAction !== 'function') throw new TypeError('authoritative_action_executor_required');
    this.store = store;
    this.executeAction = executeAction;
    this.resolveTrustedSkillPlan = typeof resolveTrustedSkillPlan === 'function' ? resolveTrustedSkillPlan : null;
    this.lifecycle = typeof effectCompiler === 'function' ? new CentralCombatLifecycleV1956({ effectCompiler }) : null;
    this.terminalResolver = typeof terminalResolver === 'function' ? terminalResolver : null;
    Object.freeze(this);
  }

  async executeTurn({ mode, combatId, actorId, requestId, intent = {}, context = {} } = {}) {
    const normalizedMode = String(mode || '').toLowerCase();
    const id = String(combatId || ''), actorKey = String(actorId || ''), requestKey = String(requestId || '');
    if (!MODES.has(normalizedMode)) throw new TypeError(`unsupported_combat_mode:${normalizedMode}`);
    if (!id || !actorKey || !requestKey) throw new TypeError('combat_actor_and_request_ids_required');
    const raw = obj(intent), action = String(raw.action || '').trim().toLowerCase();

    return this.store.transact(id, async tx => {
      const prior = await tx.getRequestResult(requestKey);
      if (prior) return { ...clone(prior), duplicate: true };

      const state = obj(await tx.getState());
      if (!state || !Object.keys(state).length) throw new Error('combat_state_not_found');
      if (String(state.mode || normalizedMode).toLowerCase() !== normalizedMode) throw new Error('combat_mode_mismatch');
      if (terminal(state.status) || terminal(state.outcome)) throw new Error('combat_already_finished');
      const actor = obj(state.actor);
      if (String(actor.id || '') !== actorKey) throw new Error('combat_actor_mismatch');
      const turnOwner = String(state.turnActorId ?? state.turn_actor_id ?? '');
      if (!turnOwner) throw new Error('authoritative_turn_owner_missing');
      if (turnOwner !== actorKey) throw new Error('not_your_turn');
      if (Number(actor.hp) <= 0) throw new Error('actor_unavailable');

      let prepared;
      let nextState = clone(state);
      let actionResult;
      let events = [];
      let turnAdvanced = false;
      let nextTurnActorId = null;

      if (action === 'skill') {
        if (!this.resolveTrustedSkillPlan || !this.lifecycle) throw new Error('trusted_skill_lifecycle_not_configured');
        // Skill plans are built from server-owned character progress/catalogs;
        // no client-provided plan or effect operations are accepted.
        const skillId = String(raw.skillId || '');
        const trustedPlan = await this.resolveTrustedSkillPlan({
          mode: normalizedMode, combatId: id, actorId: actorKey, skillId,
          targetId: raw.targetId == null ? null : String(raw.targetId),
          state: clone(state), context: clone(context)
        });
        if (!trustedPlan || trustedPlan.executionStatus !== 'prepared_only') throw new Error('trusted_skill_plan_unavailable');
        prepared = prepareCombatActionV1967(normalizedMode, { ...raw, action: 'skill', skillId }, { serverValidatedSkill: normalizedMode === 'pvp' });
        const committed = this.lifecycle.executePreparedSkill({
          plan: trustedPlan, state: nextState, requestId: requestKey,
          targetId: raw.targetId ?? trustedPlan.targetId,
          targetIds: arr(raw.targetIds)
        });
        nextState = committed.state;
        events = committed.events;
        actionResult = { accepted: true, skillId, lifecycle: 'central' };
        turnAdvanced = true;
      } else {
        if (!isCombatActionSupported(normalizedMode, action)) throw new Error(`combat_action_not_supported:${normalizedMode}:${action}`);
        prepared = prepareCombatActionV1967(normalizedMode, raw);
        const executed = await this.executeAction({
          mode: normalizedMode, combatId: id, actorId: actorKey,
          requestId: requestKey, command: prepared,
          state: clone(nextState), context: clone(context), transaction: tx
        });
        if (!executed || typeof executed !== 'object' || !executed.state) throw new Error('authoritative_action_result_invalid');
        nextState = clone(executed.state);
        actionResult = clone(executed.result ?? { accepted: true });
        events = arr(executed.events).map(clone);
        turnAdvanced = executed.turnAdvanced === true;
        nextTurnActorId = executed.nextTurnActorId == null ? null : String(executed.nextTurnActorId);
      }

      if (turnAdvanced && this.lifecycle) {
        const turnNo = Math.max(1, Number(state.turnNo ?? state.turn_no) || 1);
        const ticked = this.lifecycle.tickTurn(nextState, {
          turnId: `${id}:${turnNo}:${actorKey}:${requestKey}`,
          tickActorCooldowns: true,
          tickTargetCooldowns: false
        });
        nextState = ticked.state;
        events = [...events, ...ticked.events];
      }

      if (nextTurnActorId) nextState.turnActorId = nextTurnActorId;
      if (turnAdvanced) {
        const oldNo = Math.max(1, Number(state.turnNo ?? state.turn_no) || 1);
        nextState.turnNo = oldNo + 1;
      }

      const resolution = this.terminalResolver
        ? await this.terminalResolver({ mode: normalizedMode, state: clone(nextState), previousState: clone(state), actorId: actorKey, action: prepared })
        : null;
      if (resolution && terminal(resolution.status)) {
        nextState.status = String(resolution.status).toLowerCase();
        if (resolution.winnerId != null) nextState.winnerId = String(resolution.winnerId);
        if (resolution.reason != null) nextState.finishReason = String(resolution.reason);
        events.push({ type: 'combat_finished', status: nextState.status, winnerId: nextState.winnerId ?? null });
      }

      const result = {
        accepted: true, duplicate: false, mode: normalizedMode,
        combatId: id, requestId: requestKey, action: prepared.action,
        actionResult, events: clone(events), state: clone(nextState),
        turnAdvanced, status: nextState.status || 'active'
      };
      await tx.setState(nextState);
      await tx.setRequestResult(requestKey, result);
      return result;
    });
  }
}

export function createCentralCombatTurnServiceV1968(options) {
  return new CentralCombatTurnServiceV1968(options);
}
