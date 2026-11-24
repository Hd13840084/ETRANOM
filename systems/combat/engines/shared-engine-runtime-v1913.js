/**
 * ETRANOM V1913 — Shared specialization engines.
 * Pure/deterministic domain layer. Persistence, authentication, turn ownership,
 * and transaction boundaries remain the responsibility of trusted adapters.
 * No engine reads client-provided damage or mutates an external database.
 */

export const ENGINE_VERSION = '1913.0.0';
export const COMBAT_MODES = Object.freeze(['solo', 'party', 'pvp']);
const own = (o, k) => Object.prototype.hasOwnProperty.call(o || {}, k);
const obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const arr = v => Array.isArray(v) ? v : [];
const num = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;
const int = (v, d = 0) => Math.max(0, Math.floor(num(v, d)));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, num(v)));
const clone = v => structuredClone(v ?? {});
const assertMode = mode => { if (!COMBAT_MODES.includes(mode)) throw new TypeError(`unsupported_combat_mode:${mode}`); };
const idOf = x => String(x?.id ?? '');

// 1. Resource Engine — reserve/commit/refund is explicit and idempotent by transaction id.
export class ResourceEngine {
  static balance(actor, resource) { return Math.max(0, num(obj(actor.resources)[resource] ?? actor[resource])); }
  static reserve(actor, resource, amount, transactionId) {
    if (!resource || !transactionId) throw new TypeError('resource_and_transaction_id_required');
    const cost = Math.max(0, num(amount));
    const state = clone(actor);
    const ledger = obj(state._resourceLedger);
    if (ledger[transactionId]) return { actor: state, reservation: ledger[transactionId], duplicate: true };
    const balance = this.balance(state, resource);
    if (balance < cost) throw new Error('insufficient_resource');
    const reservation = { id: String(transactionId), resource: String(resource), amount: cost, status: 'reserved' };
    state._resourceLedger = { ...ledger, [transactionId]: reservation };
    return { actor: state, reservation, duplicate: false };
  }
  static commit(actor, transactionId) {
    const state = clone(actor), ledger = obj(state._resourceLedger), row = ledger[transactionId];
    if (!row) throw new Error('resource_reservation_not_found');
    if (row.status === 'committed') return { actor: state, duplicate: true };
    if (row.status !== 'reserved') throw new Error('resource_reservation_not_committable');
    const resources = { ...obj(state.resources) };
    const current = this.balance(state, row.resource);
    if (current < row.amount) throw new Error('resource_balance_changed');
    resources[row.resource] = current - row.amount;
    state.resources = resources;
    if (own(state, row.resource)) state[row.resource] = resources[row.resource];
    state._resourceLedger = { ...ledger, [transactionId]: { ...row, status: 'committed' } };
    return { actor: state, duplicate: false };
  }
  static refund(actor, transactionId) {
    const state = clone(actor), ledger = obj(state._resourceLedger), row = ledger[transactionId];
    if (!row) return { actor: state, refunded: false };
    if (row.status === 'refunded') return { actor: state, refunded: false, duplicate: true };
    if (row.status !== 'committed') throw new Error('only_committed_resource_can_be_refunded');
    state.resources = { ...obj(state.resources), [row.resource]: this.balance(state, row.resource) + row.amount };
    if (own(state, row.resource)) state[row.resource] = state.resources[row.resource];
    state._resourceLedger = { ...ledger, [transactionId]: { ...row, status: 'refunded' } };
    return { actor: state, refunded: true, duplicate: false };
  }
}

// 2. Cooldown Engine — only successful actions start cooldown; one tick per player turn.
export class CooldownEngine {
  static ready(actor, skillId) { return int(obj(actor.cooldowns ?? actor.skillCooldowns)[skillId]) === 0; }
  static start(actor, skillId, turns, actionId) {
    if (!skillId || !actionId) throw new TypeError('skill_and_action_id_required');
    const state = clone(actor), ledger = obj(state._cooldownLedger);
    if (ledger[actionId]) return { actor: state, duplicate: true };
    if (!this.ready(state, skillId)) throw new Error('skill_on_cooldown');
    state.cooldowns = { ...obj(state.cooldowns ?? state.skillCooldowns), [skillId]: int(turns) };
    state._cooldownLedger = { ...ledger, [actionId]: true };
    return { actor: state, duplicate: false };
  }
  static tick(actor, turnId) {
    if (!turnId) throw new TypeError('turn_id_required');
    const state = clone(actor);
    if (state._cooldownLastTickId === String(turnId)) return { actor: state, duplicate: true };
    const source = obj(state.cooldowns ?? state.skillCooldowns), next = {};
    for (const [id, value] of Object.entries(source)) if (int(value) > 1) next[id] = int(value) - 1;
    state.cooldowns = next; state._cooldownLastTickId = String(turnId);
    return { actor: state, duplicate: false };
  }
}

// 3. Status Engine — status keys, stack rules, tick policies and expiry are explicit.
export class StatusEngine {
  static apply(target, status) {
    const s = obj(status), id = String(s.id || s.kind || '');
    if (!id || !Number.isFinite(Number(s.durationTurns)) || int(s.durationTurns) < 1) throw new TypeError('invalid_status_definition');
    const state = clone(target), statuses = { ...obj(state.statuses) }, previous = obj(statuses[id]);
    const incoming = { ...s, id, durationTurns: int(s.durationTurns), stacks: Math.max(1, int(s.stacks, 1)) };
    const rule = s.stackRule || 'refresh';
    if (previous.id && rule === 'stack') {
      const max = Math.max(1, int(s.maxStacks, 99));
      incoming.stacks = Math.min(max, int(previous.stacks, 1) + incoming.stacks);
      incoming.durationTurns = s.refreshRule === 'keep_longer' ? Math.max(int(previous.durationTurns), incoming.durationTurns) : incoming.durationTurns;
    } else if (previous.id && rule === 'keep_stronger') {
      const prevPower = Math.abs(num(previous.value ?? previous.percent));
      const nextPower = Math.abs(num(incoming.value ?? incoming.percent));
      if (prevPower > nextPower) incoming.value = previous.value, incoming.percent = previous.percent;
      incoming.durationTurns = Math.max(int(previous.durationTurns), incoming.durationTurns);
    }
    statuses[id] = incoming; state.statuses = statuses;
    return { target: state, status: incoming };
  }
  static remove(target, statusId) { const state = clone(target), statuses = { ...obj(state.statuses) }; delete statuses[statusId]; state.statuses = statuses; return state; }
  static cleanse(target, predicate = () => true) {
    const state = clone(target), removed = [], kept = {};
    for (const [id, status] of Object.entries(obj(state.statuses))) { if (predicate(status, id)) removed.push(id); else kept[id] = status; }
    state.statuses = kept; return { target: state, removed };
  }
  static tick(target, turnId, { onTick = null } = {}) {
    if (!turnId) throw new TypeError('turn_id_required');
    const state = clone(target);
    if (state._statusLastTickId === String(turnId)) return { target: state, events: [], duplicate: true };
    const statuses = {}, events = [];
    for (const [id, raw] of Object.entries(obj(state.statuses))) {
      const s = { ...raw };
      if (s.tickPolicy === 'turn_start' || s.tickPolicy === 'every_player_turn') {
        const event = { type: 'status_tick', statusId: id, stacks: Math.max(1, int(s.stacks, 1)), value: num(s.tickValue ?? s.value) };
        events.push(event); if (onTick) onTick(state, event);
      }
      s.durationTurns = int(s.durationTurns) - 1;
      if (s.durationTurns > 0) statuses[id] = s;
      else events.push({ type: 'status_expired', statusId: id });
    }
    state.statuses = statuses; state._statusLastTickId = String(turnId);
    return { target: state, events, duplicate: false };
  }
  static cleanupOnDeath(target) { const state = clone(target); state.statuses = {}; state.summons = []; state.shield = null; return state; }
}

// 4. Special Effect Engine — closed vocabulary; unknown effects fail closed.
export const STANDARD_EFFECTS = Object.freeze(new Set([
  'damage', 'heal', 'shield', 'apply_status', 'cleanse', 'resource_gain', 'resource_drain',
  'stat_modifier', 'summon', 'multi_hit', 'taunt', 'revive', 'dispel'
]));
export class SpecialEffectEngine {
  #handlers = new Map();
  constructor() {
    this.register('resource_gain', (ctx, fx) => { const r = String(fx.resource || ''); if (!r) throw new Error('effect_resource_required'); ctx.actor.resources = { ...obj(ctx.actor.resources), [r]: ResourceEngine.balance(ctx.actor, r) + Math.max(0, num(fx.amount)) }; return ctx; });
    this.register('resource_drain', (ctx, fx) => { const r = String(fx.resource || ''); if (!r) throw new Error('effect_resource_required'); const amount = Math.max(0, num(fx.amount)); if (ResourceEngine.balance(ctx.target, r) < amount) throw new Error('target_resource_insufficient'); ctx.target.resources = { ...obj(ctx.target.resources), [r]: ResourceEngine.balance(ctx.target, r) - amount }; return ctx; });
    this.register('apply_status', (ctx, fx) => { ctx.target = StatusEngine.apply(ctx.target, fx.status || fx).target; return ctx; });
    this.register('cleanse', (ctx, fx) => { ctx.target = StatusEngine.cleanse(ctx.target, s => fx.tags ? arr(fx.tags).some(t => arr(s.tags).includes(t)) : true).target; return ctx; });
    this.register('shield', (ctx, fx) => { ctx.target.shield = { hp: Math.max(0, num(fx.amount)), durationTurns: Math.max(1, int(fx.durationTurns, 1)), source: fx.source || 'effect' }; return ctx; });
  }
  register(kind, handler) { if (!STANDARD_EFFECTS.has(kind) || typeof handler !== 'function') throw new TypeError('invalid_effect_handler'); if (this.#handlers.has(kind)) throw new Error(`effect_handler_exists:${kind}`); this.#handlers.set(kind, handler); }
  registerExtension(extensionId, kind, handler) { if (!/^[a-z0-9_.-]{3,64}$/i.test(extensionId)) throw new TypeError('invalid_extension_id'); if (this.#handlers.has(kind)) throw new Error(`effect_handler_exists:${kind}`); if (typeof handler !== 'function') throw new TypeError('handler_required'); this.#handlers.set(kind, handler); }
  execute(context, effect) { const fx = obj(effect), handler = this.#handlers.get(String(fx.kind || '')); if (!handler) throw new Error(`unknown_or_unregistered_effect:${fx.kind}`); const ctx = { actor: clone(context.actor), target: clone(context.target), mode: context.mode, log: arr(context.log).slice() }; assertMode(ctx.mode); return handler(ctx, fx); }
}

// 5. Reaction Engine — deterministic ordered event subscriptions.
export class ReactionEngine {
  #handlers = new Map();
  register(eventType, id, handler, priority = 0) {
    if (!eventType || !id || typeof handler !== 'function') throw new TypeError('invalid_reaction_handler');
    const rows = this.#handlers.get(eventType) || [];
    if (rows.some(x => x.id === id)) throw new Error(`duplicate_reaction:${id}`);
    rows.push({ id, handler, priority: num(priority) }); rows.sort((a,b) => b.priority - a.priority || a.id.localeCompare(b.id)); this.#handlers.set(eventType, rows);
  }
  dispatch(eventType, context, event = {}) {
    let current = clone(context); const log = [];
    for (const row of this.#handlers.get(eventType) || []) { const result = row.handler(current, clone(event)); if (result !== undefined) current = result; log.push({ type: 'reaction', eventType, handlerId: row.id }); }
    return { context: current, log };
  }
}

// 6. Multi-Hit Engine — each hit independently resolves defense/evasion/crit through resolver.
export class MultiHitEngine {
  static resolve({ hits, target, resolveHit, hitPolicy = 'stop_on_death' }) {
    const count = clamp(Math.floor(num(hits, 1)), 1, 20); if (typeof resolveHit !== 'function') throw new TypeError('hit_resolver_required');
    let current = clone(target); const results = [];
    for (let index = 0; index < count; index++) {
      if (num(current.hp) <= 0 && hitPolicy === 'stop_on_death') break;
      const result = resolveHit(clone(current), index);
      if (!result || !result.target) throw new TypeError('hit_resolver_must_return_target');
      current = clone(result.target); results.push({ hit: index + 1, ...obj(result), target: undefined, hpAfter: num(current.hp) });
    }
    return { target: current, hits: results, totalDamage: results.reduce((sum, x) => sum + Math.max(0, num(x.damage)), 0) };
  }
}

// 7. Summon Engine — stable IDs, caps, independent turn actions and death cleanup.
export class SummonEngine {
  static summon(owner, definition, { maxActive = 3 } = {}) {
    const state = clone(owner), current = arr(state.summons).filter(s => num(s.hp) > 0);
    if (current.length >= clamp(int(maxActive, 3), 0, 20)) throw new Error('summon_limit_reached');
    const id = String(definition?.id || ''); if (!id || current.some(s => s.id === id)) throw new Error('invalid_or_duplicate_summon_id');
    const summon = { ...clone(definition), id, hp: Math.max(1, num(definition.hp, 1)), maxHp: Math.max(1, num(definition.maxHp ?? definition.hp, 1)), ownerId: String(owner.id || '') };
    state.summons = [...current, summon]; return { owner: state, summon };
  }
  static resolveTurn(owner, resolveAction) {
    if (typeof resolveAction !== 'function') throw new TypeError('summon_action_resolver_required');
    const state = clone(owner), events = [], summons = [];
    for (const summon of arr(state.summons)) {
      if (num(summon.hp) <= 0) { events.push({ type: 'summon_died', summonId: summon.id }); continue; }
      const result = resolveAction(clone(summon), clone(state));
      const next = clone(result?.summon || summon); summons.push(next); events.push(...arr(result?.events));
    }
    state.summons = summons; return { owner: state, events };
  }
}

// 8. Skill Upgrade Engine — rank 1..7, six upgrade records; modifiers are additive and traceable.
export class SkillUpgradeEngine {
  static resolve(skill, rank = 1, upgrades = []) {
    const r = clamp(Math.floor(num(rank, 1)), 1, 7), rows = arr(skill.upgrades);
    if (rows.length !== 6) throw new Error('skill_requires_six_upgrades');
    const selected = new Set(arr(upgrades).map(String)); const modifiers = {}, applied = [];
    for (let i = 0; i < r - 1; i++) {
      const row = rows[i], id = String(row.id || `upgrade_${i + 1}`);
      if (selected.size && !selected.has(id)) continue;
      for (const [key, value] of Object.entries(obj(row.effects))) modifiers[key] = num(modifiers[key]) + num(value);
      applied.push(id);
    }
    return { rank: r, modifiers, appliedUpgradeIds: applied };
  }
}

// 9. Talent Engine — prerequisites and point budgets are checked centrally.
export class TalentEngine {
  static validate(tree, selections, { points = Infinity, level = Infinity } = {}) {
    const chosen = new Set(arr(selections).map(String)), talents = arr(tree?.branches).flatMap(b => arr(b.talents));
    const byId = new Map(talents.map(t => [String(t.id), t])); const errors = [];
    if (chosen.size > num(points, Infinity)) errors.push('talent_points_exceeded');
    for (const id of chosen) { const t = byId.get(id); if (!t) { errors.push(`unknown_talent:${id}`); continue; }
      if (num(t.unlockLevel, 1) > num(level, Infinity)) errors.push(`talent_level_locked:${id}`);
      for (const req of arr(t.requires)) if (!chosen.has(String(req))) errors.push(`talent_prerequisite_missing:${id}:${req}`);
    }
    return { ok: errors.length === 0, errors, selected: [...chosen] };
  }
  static collectModifiers(tree, selections) {
    const chosen = new Set(arr(selections).map(String)), modifiers = {}, sources = [];
    for (const talent of arr(tree?.branches).flatMap(b => arr(b.talents))) if (chosen.has(String(talent.id))) {
      for (const [key, value] of Object.entries(obj(talent.effects))) modifiers[key] = num(modifiers[key]) + num(value);
      sources.push(String(talent.id));
    }
    return { modifiers, sources };
  }
}

// 10. Domain Engine — stage gating, cost, duration and one activation per battle.
export class DomainEngine {
  static activate(actor, domain, { stage, level, mode, activationId, resource = 'mana' } = {}) {
    assertMode(mode); const stages = arr(domain?.stages), row = stages.find(s => int(s.stage) === int(stage));
    if (!row) throw new Error('domain_stage_not_found');
    if (num(level) < num(row.unlockLevel, 1)) throw new Error('domain_stage_level_locked');
    if (!activationId) throw new TypeError('domain_activation_id_required');
    if (actor._domainActivationId === activationId) return { actor: clone(actor), duplicate: true };
    if (actor.domain?.active && int(actor.domain.durationTurns) > 0) throw new Error('domain_already_active');
    const cost = Math.max(0, num(row.activationCost));
    if (ResourceEngine.balance(actor, resource) < cost) throw new Error('insufficient_resource');
    const state = clone(actor); state.resources = { ...obj(state.resources), [resource]: ResourceEngine.balance(state, resource) - cost };
    state.domain = { active: true, stage: int(row.stage), durationTurns: int(row.durationTurns), effects: clone(row.effects || {}), mode };
    state._domainActivationId = String(activationId); return { actor: state, duplicate: false };
  }
  static tick(actor, turnId) {
    const state = clone(actor); if (!state.domain?.active) return { actor: state, expired: false, duplicate: false };
    if (!turnId) throw new TypeError('turn_id_required');
    if (state._domainLastTickId === String(turnId)) return { actor: state, expired: false, duplicate: true };
    state._domainLastTickId = String(turnId); state.domain.durationTurns = Math.max(0, int(state.domain.durationTurns) - 1);
    const expired = state.domain.durationTurns === 0; if (expired) state.domain.active = false;
    return { actor: state, expired, duplicate: false };
  }
}

// 11. Ascension Engine — exactly one selection for each domain activation.
export class AscensionEngine {
  static select(actor, options, ascensionId, activationId) {
    const option = arr(options).find(x => String(x.id) === String(ascensionId));
    if (!option) throw new Error('ascension_not_found');
    if (!activationId || String(actor._domainActivationId || '') !== String(activationId)) throw new Error('ascension_requires_current_domain_activation');
    const used = obj(actor._ascensionByActivation);
    if (used[activationId]) throw new Error('ascension_already_selected_for_activation');
    const state = clone(actor); state._ascensionByActivation = { ...used, [activationId]: String(ascensionId) };
    state.domain = { ...obj(state.domain), ascensionId: String(ascensionId), ascensionEffects: clone(option.effects || {}) };
    return { actor: state, ascension: option };
  }
}

// 12. Stat Engine — common modifier aggregation, no specialization-specific base formula.
export class StatEngine {
  static buildSnapshot(baseStats, sources = []) {
    const stats = clone(baseStats), trace = [];
    for (const source of sources) for (const [key, value] of Object.entries(obj(source.effects))) {
      if (!Number.isFinite(Number(value))) continue;
      stats[key] = num(stats[key]) + num(value); trace.push({ source: String(source.id || 'unknown'), stat: key, amount: num(value) });
    }
    for (const key of ['maxHp', 'maxMp', 'attack', 'defense', 'speed']) if (own(stats, key)) stats[key] = Math.max(0, num(stats[key]));
    return { stats, trace };
  }
}

// 13. Skill Engine — canonical intent validation and generic effect dispatch.
export class SkillEngine {
  constructor({ registry, effects = new SpecialEffectEngine(), skillResolver } = {}) { this.registry = registry; this.effects = effects; this.skillResolver = skillResolver; }
  prepare(intent, actor, context = {}) {
    assertMode(intent?.mode); const specializationId = this.registry?.resolveCanonicalId(intent.specializationId);
    if (!specializationId || !this.registry.isPlayable(specializationId)) throw new Error('specialization_not_playable');
    const skill = this.skillResolver?.(specializationId, intent.skillId);
    if (!skill) throw new Error('skill_not_found');
    if (num(actor.level, 1) < num(skill.unlockLevel, 1)) throw new Error('skill_level_locked');
    if (!CooldownEngine.ready(actor, skill.id)) throw new Error('skill_on_cooldown');
    const resource = String(skill.resourceType || context.resource || 'mana'), cost = Math.max(0, num(skill.resourceCost ?? skill.manaCost));
    if (ResourceEngine.balance(actor, resource) < cost) throw new Error('insufficient_resource');
    if (skill.target === 'single_enemy' && !intent.targetId) throw new Error('skill_target_required');
    return Object.freeze({ mode: intent.mode, actorId: String(actor.id || ''), specializationId, skill, targetId: intent.targetId ?? null, requestId: String(intent.requestId || ''), resource, cost });
  }
  execute(prepared, actor, target, { resolveDamage = (a, t, skill) => Math.max(1, Math.floor(num(a.attack) * num(skill.damagePct, 100) / 100 - num(t.defense))) } = {}) {
    if (!prepared.requestId) throw new TypeError('request_id_required');
    const prior = obj(actor._skillActionResults)[prepared.requestId];
    if (prior) return { ...clone(prior), duplicate: true };
    const tx = `skill:${prepared.requestId}`; let nextActor = clone(actor), nextTarget = clone(target), log = [];
    const reserved = ResourceEngine.reserve(nextActor, prepared.resource, prepared.cost, tx); nextActor = reserved.actor;
    nextActor = ResourceEngine.commit(nextActor, tx).actor;
    const rawEffects = prepared.skill.effects;
    const effects = Array.isArray(rawEffects) ? rawEffects : arr(prepared.skill.effectList);
    for (const fx of effects) {
      if (fx.kind === 'damage') { const damage = Math.max(0, Math.floor(resolveDamage(nextActor, nextTarget, prepared.skill, fx))); const before = Math.max(0, num(nextTarget.hp)); nextTarget.hp = Math.max(0, before - damage); log.push({ type: 'damage', amount: before - nextTarget.hp, targetId: idOf(nextTarget) }); }
      else { const result = this.effects.execute({ actor: nextActor, target: nextTarget, mode: prepared.mode, log }, fx); nextActor = result.actor; nextTarget = result.target; log = result.log; }
    }
    const cooldown = CooldownEngine.start(nextActor, prepared.skill.id, prepared.skill.cooldownTurns, tx); nextActor = cooldown.actor;
    const output = { actor: nextActor, target: nextTarget, log, result: nextTarget.hp <= 0 ? 'victory' : 'continue' };
    output.actor._skillActionResults = { ...obj(output.actor._skillActionResults), [prepared.requestId]: clone(output) };
    return output;
  }
}

// 14. Combat Lifecycle Engine — fixed phase ordering and exactly-once turn boundary.
export class CombatLifecycleEngine {
  constructor({ reactions = new ReactionEngine() } = {}) { this.reactions = reactions; }
  runTurn({ mode, actor, targets = [], turnId, action, enemyPhase = null, statusTick = true, cooldownTick = true } = {}) {
    assertMode(mode); if (!turnId) throw new TypeError('turn_id_required');
    const state = clone(actor), enemies = clone(targets);
    if (state._lifecycleLastTurnId === String(turnId)) return { actor: state, targets: enemies, events: [], duplicate: true, result: 'duplicate' };
    if (typeof action !== 'function') throw new TypeError('player_action_required');
    const actionResult = action(state, enemies); let nextActor = clone(actionResult?.actor ?? state), nextTargets = clone(actionResult?.targets ?? enemies), events = arr(actionResult?.events).slice();
    let result = nextTargets.every(t => num(t.hp) <= 0) ? 'victory' : 'continue';
    if (result !== 'victory' && typeof enemyPhase === 'function') {
      const phase = enemyPhase(nextActor, nextTargets); nextActor = clone(phase?.actor ?? nextActor); nextTargets = clone(phase?.targets ?? nextTargets); events.push(...arr(phase?.events));
      result = num(nextActor.hp) <= 0 ? 'defeat' : nextTargets.every(t => num(t.hp) <= 0) ? 'victory' : 'continue';
    }
    if (statusTick) {
      const ticked = StatusEngine.tick(nextActor, String(turnId)); nextActor = ticked.target; events.push(...ticked.events);
    }
    if (cooldownTick) nextActor = CooldownEngine.tick(nextActor, String(turnId)).actor;
    nextActor._lifecycleLastTurnId = String(turnId);
    return { actor: nextActor, targets: nextTargets, events, duplicate: false, result };
  }
}

// 15. Combat Result Engine — consistent, UI-agnostic result envelope.
export class CombatResultEngine {
  static create({ mode, actor, targets = [], events = [], turnId, requestId } = {}) {
    assertMode(mode); const result = num(actor?.hp) <= 0 ? 'defeat' : arr(targets).every(t => num(t.hp) <= 0) ? 'victory' : 'continue';
    return Object.freeze({ schema: 'etranom.combat.result.v1', engineVersion: ENGINE_VERSION, mode, result, turnId: String(turnId || ''), requestId: String(requestId || ''), actor: { id: idOf(actor), hp: Math.max(0, num(actor?.hp)), mp: Math.max(0, num(actor?.mp)) }, targets: arr(targets).map(t => ({ id: idOf(t), hp: Math.max(0, num(t.hp)) })), events: clone(events) });
  }
}

// 16. Shared adapter surface. Authorization and persistence are intentionally not implemented here.
export function createSharedCombatAdapter(mode, dependencies = {}) {
  assertMode(mode); const lifecycle = dependencies.lifecycle || new CombatLifecycleEngine();
  return Object.freeze({ mode, skillEngine: dependencies.skillEngine || null, lifecycle,
    runTurn: payload => lifecycle.runTurn({ ...payload, mode }),
    result: payload => CombatResultEngine.create({ ...payload, mode })
  });
}
