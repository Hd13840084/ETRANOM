/**
 * ETRANOM V1956 — deterministic shared effect resolver + combat lifecycle.
 * Shadow/reference engine only. It is not connected to authoritative live combat.
 * Effect operations must be produced by a trusted server-side compiler.
 */
export const CENTRAL_COMBAT_LIFECYCLE_VERSION_V1956 = '1956.0.0';
export const CENTRAL_EFFECT_PLAN_SCHEMA_V1956 = 'etranom.central-effect-plan.v1';
const MODES = new Set(['solo', 'party', 'pvp']);
const RESOURCES = new Set(['mana', 'stamina', 'energy', 'souls']);
const object = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const array = v => Array.isArray(v) ? v : [];
const num = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;
const pos = v => Math.max(0, num(v));
const int = (v, d = 0) => Math.floor(num(v, d));
const clone = v => structuredClone(v !== null && v !== void 0 ? v : {});
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
function actorResource(actor, resource) {
    const resources = object(actor.resources);
    if (resources[resource] != null)
        return pos(resources[resource]);
    if (resource === 'mana')
        return pos(actor.mp);
    return pos(actor[resource]);
}
function setActorResource(actor, resource, value) {
    actor.resources = { ...object(actor.resources), [resource]: pos(value) };
    if (resource === 'mana')
        actor.mp = pos(value);
    else
        actor[resource] = pos(value);
}
function maxResource(actor, resource) {
    var _a;
    const key = resource === 'mana' ? 'maxMp' : `max${resource[0].toUpperCase()}${resource.slice(1)}`;
    const alt = resource === 'mana' ? 'max_mp' : `max_${resource}`;
    return Math.max(0, num((_a = actor[key]) !== null && _a !== void 0 ? _a : actor[alt], Number.MAX_SAFE_INTEGER));
}
function living(entity) { return !!entity && pos(entity.hp) > 0; }
function resolveTargets(state, op, context) {
    var _a;
    const actor = object(state.actor), targets = array(state.targets);
    const selected = String((_a = context.targetId) !== null && _a !== void 0 ? _a : '');
    const selectedIds = array(context.targetIds).map(String);
    switch (op.scope || 'selected_target') {
        case 'self': return [actor];
        case 'selected_target': return targets.filter(t => String(t.id) === selected && living(t)).slice(0, 1);
        case 'all_live_targets': return targets.filter(living);
        case 'ordered_targets': return selectedIds.map(id => targets.find(t => String(t.id) === id)).filter(living);
        case 'all_allies': return [actor, ...array(state.allies)].filter(living);
        case 'selected_ally': return [actor, ...array(state.allies)].filter(t => String(t.id) === selected && living(t)).slice(0, 1);
        case 'all_corpses': return targets.filter(t => t && pos(t.hp) <= 0);
        default: throw new Error(`unsupported_effect_scope:${op.scope}`);
    }
}
function requireTargets(targets, op) {
    if (!targets.length && op.allowEmpty !== true)
        throw new Error(`effect_targets_missing:${op.scope || 'selected_target'}`);
}
function log(state, entry) { state.effectLog = [...array(state.effectLog), entry]; }
function damageEntity(target, amount) {
    var _a;
    const raw = pos(amount), absorbed = Math.min(pos(target.shield), raw);
    target.shield = pos(target.shield) - absorbed;
    const dealt = Math.min(pos(target.hp), raw - absorbed);
    target.hp = Math.max(0, pos(target.hp) - dealt);
    let revived = false;
    if (target.hp <= 0) {
        const wardIndex = array(target.statuses).findIndex(status => String(status.id || '').startsWith('death_ward:') && pos(status.reviveHpPct) > 0);
        if (wardIndex >= 0) {
            const ward = target.statuses[wardIndex];
            const maxHp = Math.max(1, num((_a = target.maxHp) !== null && _a !== void 0 ? _a : target.max_hp, 1));
            target.hp = Math.max(1, Math.floor(maxHp * clamp(num(ward.reviveHpPct, 25), 1, 100) / 100));
            target.statuses = array(target.statuses).filter((_, index) => index !== wardIndex);
            revived = true;
        }
    }
    return { damage: dealt, absorbed, hpAfter: target.hp, revived };
}
function applyDamage(state, op, context) {
    var _a;
    let targets = resolveTargets(state, op, context);
    if (op.maxTargets != null)
        targets = targets.slice(0, clamp(int(op.maxTargets), 1, 64));
    requireTargets(targets, op);
    const amount = pos(op.amount), results = [];
    for (let targetIndex = 0; targetIndex < targets.length; targetIndex++) {
        const target = targets[targetIndex];
        const targetAmount = amount * Math.pow(clamp(num(op.falloffPct, 100), 0, 100) / 100, targetIndex);
        const reactionAbsorb = array(target.reactions).filter(r => r.kind === 'absorb' && int(r.turns) > 0).reduce((sum, r) => sum + (r.amountPct != null ? targetAmount * clamp(num(r.amountPct), 0, 100) / 100 : pos(r.amount)), 0);
        const incoming = Math.max(0, targetAmount - reactionAbsorb);
        const hit = damageEntity(target, incoming);
        const retaliation = array(target.reactions).filter(r => ['reflect', 'counter', 'retaliate'].includes(r.kind) && int(r.turns) > 0 && hit.damage > 0);
        const reactionResults = retaliation.map(r => ({ kind: r.kind, ...damageEntity(object(state.actor), r.amountPct != null ? hit.damage * clamp(num(r.amountPct), 0, 100) / 100 : pos(r.amount)) }));
        results.push({ targetId: (_a = target.id) !== null && _a !== void 0 ? _a : null, ...hit, reactionAbsorbed: Math.min(targetAmount, reactionAbsorb), reactions: reactionResults });
    }
    log(state, { type: 'damage', sourceSkillId: context.skillId, results });
}
function applyHeal(state, op, context) {
    var _a, _b;
    const targets = resolveTargets(state, op, context);
    requireTargets(targets, op);
    const amount = pos(op.amount), results = [];
    for (const target of targets) {
        const before = pos(target.hp), max = Math.max(1, num((_a = target.maxHp) !== null && _a !== void 0 ? _a : target.max_hp, before));
        target.hp = Math.min(max, before + amount);
        results.push({ targetId: (_b = target.id) !== null && _b !== void 0 ? _b : null, healed: target.hp - before, hpAfter: target.hp });
    }
    log(state, { type: 'heal', sourceSkillId: context.skillId, results });
}
function applyStatus(state, op, context) {
    if (!op.status || typeof op.status.id !== 'string' || !op.status.id)
        throw new Error('status_definition_required');
    const targets = resolveTargets(state, op, context);
    requireTargets(targets, op);
    for (const target of targets) {
        const statuses = array(target.statuses).filter(s => String(s.id) !== op.status.id);
        statuses.push({ ...clone(op.status), turns: Math.max(1, int(op.status.turns, 1)), source: context.skillId });
        target.statuses = statuses;
    }
    log(state, { type: 'status_applied', statusId: op.status.id, targetIds: targets.map(t => { var _a; return (_a = t.id) !== null && _a !== void 0 ? _a : null; }) });
}
function removeStatus(state, op, context) {
    const targets = resolveTargets(state, op, context);
    requireTargets(targets, op);
    const ids = new Set(array(op.statusIds).map(String));
    const maxCount = Math.max(0, int(op.maxCount, 0));
    for (const target of targets) {
        const matches = array(target.statuses).filter(s => ids.size ? ids.has(String(s.id)) : s.polarity === (op.polarity || 'negative'));
        const removeIds = new Set((maxCount > 0 ? matches.slice(0, maxCount) : matches).map(s => String(s.id)));
        target.statuses = array(target.statuses).filter(s => !removeIds.has(String(s.id)));
    }
    log(state, { type: 'status_removed', targetIds: targets.map(t => { var _a; return (_a = t.id) !== null && _a !== void 0 ? _a : null; }), statusIds: [...ids] });
}
function changeResource(state, op, context) {
    const resource = String(op.resource || '');
    if (!RESOURCES.has(resource))
        throw new Error(`unsupported_resource:${resource}`);
    const actor = object(state.actor), before = actorResource(actor, resource), amount = pos(op.amount);
    const after = op.direction === 'gain' ? Math.min(maxResource(actor, resource), before + amount) : Math.max(0, before - amount);
    setActorResource(actor, resource, after);
    state.actor = actor;
    log(state, { type: `resource_${op.direction}`, resource, amount: Math.abs(after - before), sourceSkillId: context.skillId });
}
function applyModifier(state, op, context) {
    if (!op.stat || !Number.isFinite(Number(op.amount)))
        throw new Error('modifier_definition_required');
    const targets = resolveTargets(state, op, context);
    requireTargets(targets, op);
    for (const target of targets) {
        target.modifiers = [...array(target.modifiers), { stat: String(op.stat), amount: Number(op.amount), turns: Math.max(1, int(op.turns, 1)), source: context.skillId }];
    }
    log(state, { type: 'modifier_applied', stat: String(op.stat), targetIds: targets.map(t => { var _a; return (_a = t.id) !== null && _a !== void 0 ? _a : null; }) });
}
function applySummon(state, op, context) {
    if (!op.summon || typeof op.summon.id !== 'string' || !op.summon.id)
        throw new Error('summon_definition_required');
    const actor = object(state.actor), summons = array(actor.summons), max = clamp(int(op.maxSummons, 3), 1, 12);
    if (summons.length >= max)
        throw new Error('summon_capacity_reached');
    if (summons.some(s => String(s.id) === op.summon.id))
        throw new Error('summon_duplicate_id');
    actor.summons = [...summons, { ...clone(op.summon), hp: Math.max(1, num(op.summon.hp, 1)), permanent: op.summon.permanent === true, turns: op.summon.permanent === true ? 999999 : Math.max(1, int(op.summon.turns, 3)), source: context.skillId }];
    state.actor = actor;
    log(state, { type: 'summon_created', summonId: op.summon.id });
}
function applyMultiHit(state, op, context) {
    var _a;
    const hits = clamp(int(op.hits, 1), 1, 12);
    let targets = resolveTargets(state, op, context);
    if (op.maxTargets != null)
        targets = targets.slice(0, clamp(int(op.maxTargets), 1, 64));
    requireTargets(targets, op);
    const amount = pos(op.amount), results = [];
    for (let hit = 1; hit <= hits; hit++)
        for (const target of targets) {
            if (!living(target))
                continue;
            const reactionAbsorb = array(target.reactions).filter(r => r.kind === 'absorb' && int(r.turns) > 0).reduce((sum, r) => sum + (r.amountPct != null ? amount * clamp(num(r.amountPct), 0, 100) / 100 : pos(r.amount)), 0);
            const dealt = damageEntity(target, Math.max(0, amount - reactionAbsorb));
            const retaliation = array(target.reactions).filter(r => ['reflect', 'counter', 'retaliate'].includes(r.kind) && int(r.turns) > 0 && dealt.damage > 0);
            const reactions = retaliation.map(r => ({ kind: r.kind, ...damageEntity(object(state.actor), r.amountPct != null ? dealt.damage * clamp(num(r.amountPct), 0, 100) / 100 : pos(r.amount)) }));
            results.push({ hit, targetId: (_a = target.id) !== null && _a !== void 0 ? _a : null, ...dealt, reactionAbsorbed: Math.min(amount, reactionAbsorb), reactions });
        }
    log(state, { type: 'multi_hit', hits, results, sourceSkillId: context.skillId });
}
function applyReaction(state, op, context) {
    const kind = String(op.reaction || '');
    if (!['reflect', 'counter', 'absorb', 'retaliate'].includes(kind))
        throw new Error(`unsupported_reaction:${kind}`);
    const actor = object(state.actor);
    actor.reactions = [...array(actor.reactions), { kind, amount: pos(op.amount), amountPct: op.amountPct == null ? null : clamp(num(op.amountPct), 0, 100), turns: Math.max(1, int(op.turns, 1)), source: context.skillId }];
    state.actor = actor;
    log(state, { type: 'reaction_armed', reaction: kind, amount: pos(op.amount) });
}
function executeOperation(state, op, context) {
    var _a, _b, _c;
    if (!op || typeof op !== 'object' || Array.isArray(op))
        throw new TypeError('invalid_effect_operation');
    switch (op.type) {
        case 'damage': return applyDamage(state, op, context);
        case 'heal': return applyHeal(state, op, context);
        case 'shield': {
            const targets = resolveTargets(state, op, context);
            requireTargets(targets, op);
            for (const t of targets)
                t.shield = pos(t.shield) + pos(op.amount);
            log(state, { type: 'shield_applied', amount: pos(op.amount), targetIds: targets.map(t => { var _a; return (_a = t.id) !== null && _a !== void 0 ? _a : null; }) });
            return;
        }
        case 'apply_status': return applyStatus(state, op, context);
        case 'remove_status': return removeStatus(state, op, context);
        case 'resource_gain': return changeResource(state, { ...op, direction: 'gain' }, context);
        case 'resource_drain': return changeResource(state, { ...op, direction: 'drain' }, context);
        case 'modifier': return applyModifier(state, op, context);
        case 'summon': return applySummon(state, op, context);
        case 'multi_hit': return applyMultiHit(state, op, context);
        case 'reaction': return applyReaction(state, op, context);
        case 'taunt': {
            const targets = resolveTargets(state, op, context);
            requireTargets(targets, op);
            for (const t of targets)
                t.tauntedBy = (_b = (_a = state.actor) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null;
            log(state, { type: 'taunt', targetIds: targets.map(t => { var _a; return (_a = t.id) !== null && _a !== void 0 ? _a : null; }) });
            return;
        }
        case 'revive': {
            const targets = resolveTargets(state, op, context);
            requireTargets(targets, op);
            for (const t of targets)
                if (!living(t))
                    t.hp = Math.max(1, Math.floor(num((_c = t.maxHp) !== null && _c !== void 0 ? _c : t.max_hp, 1) * clamp(num(op.hpPct, 25), 1, 100) / 100));
            log(state, { type: 'revive', targetIds: targets.map(t => { var _a; return (_a = t.id) !== null && _a !== void 0 ? _a : null; }) });
            return;
        }
        default: throw new Error(`unsupported_effect_type:${op.type}`);
    }
}
/**
 * Executes a trusted compiled effect plan atomically. The compiler callback is
 * deliberately injected and must read server-owned skill definitions only.
 */
export class CentralCombatLifecycleV1956 {
    constructor({ effectCompiler } = {}) {
        if (typeof effectCompiler !== 'function')
            throw new TypeError('trusted_effect_compiler_required');
        this.effectCompiler = effectCompiler;
        Object.freeze(this);
    }
    executePreparedSkill({ plan, state, requestId, targetId = null, targetIds = [] } = {}) {
        var _a, _b, _c, _d, _e, _f;
        if (!plan || plan.schema !== 'etranom.central-skill-plan.v1' || plan.executionStatus !== 'prepared_only')
            throw new Error('prepared_skill_plan_required');
        if (!MODES.has(plan.mode))
            throw new TypeError(`unsupported_combat_mode:${plan.mode}`);
        const id = String(requestId || plan.requestId || '');
        if (!id)
            throw new TypeError('request_id_required');
        const initial = object(state), prior = object(initial._centralLifecycleResults)[id];
        if (prior)
            return { state: clone(prior.state), events: clone(prior.events), duplicate: true };
        const draft = clone(initial), actor = object(draft.actor);
        if (String((_a = actor.id) !== null && _a !== void 0 ? _a : '') !== String((_b = plan.actorId) !== null && _b !== void 0 ? _b : ''))
            throw new Error('actor_plan_mismatch');
        if (pos(actor.hp) <= 0)
            throw new Error('actor_unavailable');
        const resource = String(((_c = plan.resource) === null || _c === void 0 ? void 0 : _c.resource) || '');
        if (!RESOURCES.has(resource))
            throw new Error(`unsupported_resource:${resource}`);
        const cost = pos((_d = plan.resource) === null || _d === void 0 ? void 0 : _d.cost), available = actorResource(actor, resource);
        if (available < cost)
            throw new Error('insufficient_resource_at_commit');
        const compilerContext = Object.freeze({ mode: plan.mode, specializationId: plan.specializationId, skillId: plan.skillId, rank: plan.rank, stats: plan.stats, upgrade: plan.upgrade, talent: plan.talent, domain: plan.domain });
        const compiled = this.effectCompiler(plan, clone(draft), compilerContext);
        if (!compiled || compiled.schema !== CENTRAL_EFFECT_PLAN_SCHEMA_V1956 || !Array.isArray(compiled.operations))
            throw new Error('trusted_effect_plan_invalid');
        if (compiled.specializationId !== plan.specializationId || compiled.skillId !== plan.skillId)
            throw new Error('effect_plan_skill_mismatch');
        if (compiled.operations.length > 64)
            throw new Error('effect_plan_too_large');
        const context = Object.freeze({ mode: plan.mode, skillId: plan.skillId, targetId: targetId !== null && targetId !== void 0 ? targetId : plan.targetId, targetIds: array(targetIds).length ? targetIds : ((targetId !== null && targetId !== void 0 ? targetId : plan.targetId) ? [targetId !== null && targetId !== void 0 ? targetId : plan.targetId] : []) });
        const events = [];
        // Pay the cost before resolving effects. Resource-gain/drain effects then
        // compose in authored order instead of being overwritten by the payment.
        setActorResource(object(draft.actor), resource, available - cost);
        // All operations run on a private draft. A thrown operation discards all changes.
        for (let index = 0; index < compiled.operations.length; index++) {
            executeOperation(draft, compiled.operations[index], context);
            events.push({ type: 'effect', index, effect: compiled.operations[index].type });
        }
        const committedActor = object(draft.actor);
        committedActor.cooldowns = { ...object(committedActor.cooldowns), [plan.skillId]: Math.max(0, int((_e = plan.cooldown) === null || _e === void 0 ? void 0 : _e.turns)) };
        draft.actor = committedActor;
        events.push({ type: 'skill_committed', skillId: plan.skillId, resource, cost, cooldown: Math.max(0, int((_f = plan.cooldown) === null || _f === void 0 ? void 0 : _f.turns)) });
        draft._centralLifecycleResults = { ...object(draft._centralLifecycleResults), [id]: { state: clone(draft), events: clone(events) } };
        return { state: draft, events, duplicate: false };
    }
    resolveIncomingDamage({ state, targetId, sourceId = null, amount, requestId } = {}) {
        const id = String(requestId || '');
        if (!id)
            throw new TypeError('request_id_required');
        const initial = object(state), prior = object(initial._centralDamageResults)[id];
        if (prior)
            return { state: clone(prior.state), result: clone(prior.result), duplicate: true };
        const draft = clone(initial);
        const find = entityId => { var _a, _b; return String((_b = (_a = draft.actor) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '') === String(entityId) ? draft.actor : array(draft.targets).find(t => String(t.id) === String(entityId)); };
        const defender = find(targetId), attacker = sourceId == null ? null : find(sourceId);
        if (!defender || !living(defender))
            throw new Error('damage_target_unavailable');
        if (sourceId != null && !attacker)
            throw new Error('damage_source_unavailable');
        const raw = pos(amount);
        const reactionAbsorb = array(defender.reactions).filter(r => r.kind === 'absorb' && int(r.turns) > 0).reduce((sum, r) => sum + (r.amountPct != null ? raw * clamp(num(r.amountPct), 0, 100) / 100 : pos(r.amount)), 0);
        const hit = damageEntity(defender, Math.max(0, raw - reactionAbsorb));
        const reactionResults = [];
        if (attacker && hit.damage > 0)
            for (const reaction of array(defender.reactions)) {
                if (int(reaction.turns) <= 0 || !['reflect', 'counter', 'retaliate'].includes(reaction.kind))
                    continue;
                reactionResults.push({ kind: reaction.kind, ...damageEntity(attacker, reaction.amountPct != null ? hit.damage * clamp(num(reaction.amountPct), 0, 100) / 100 : pos(reaction.amount)) });
            }
        const result = { targetId: String(targetId), sourceId: sourceId == null ? null : String(sourceId), ...hit, reactionAbsorbed: Math.min(raw, reactionAbsorb), reactions: reactionResults };
        log(draft, { type: 'incoming_damage', ...result });
        draft._centralDamageResults = { ...object(draft._centralDamageResults), [id]: { state: clone(draft), result: clone(result) } };
        return { state: draft, result, duplicate: false };
    }
    tickTurn(state, { turnId, tickActorCooldowns = true, tickTargetCooldowns = false } = {}) {
        const id = String(turnId || '');
        if (!id)
            throw new TypeError('turn_id_required');
        const draft = clone(object(state));
        if (String(draft._centralLifecycleLastTickId || '') === id)
            return { state: draft, events: [], duplicate: true };
        const events = [];
        const tick = (entity, tickCooldowns) => {
            var _a, _b;
            if (!entity || typeof entity !== 'object')
                return;
            const statuses = [];
            for (const status of array(entity.statuses)) {
                const turns = Math.max(0, int(status.turns));
                if (turns <= 0)
                    continue;
                const dot = pos(status.dotDamage) || Math.floor(Math.max(0, num((_a = entity.maxHp) !== null && _a !== void 0 ? _a : entity.max_hp)) * pos(status.dotPct) / 100);
                if (dot > 0 && pos(entity.hp) > 0) {
                    const dealt = Math.min(pos(entity.hp), dot);
                    entity.hp = Math.max(0, pos(entity.hp) - dealt);
                    events.push({ type: 'dot_tick', targetId: (_b = entity.id) !== null && _b !== void 0 ? _b : null, statusId: status.id, damage: dealt });
                }
                if (turns > 1)
                    statuses.push({ ...status, turns: turns - 1 });
            }
            entity.statuses = statuses;
            entity.modifiers = array(entity.modifiers).map(m => ({ ...m, turns: Math.max(0, int(m.turns) - 1) })).filter(m => m.turns > 0);
            entity.reactions = array(entity.reactions).map(r => ({ ...r, turns: Math.max(0, int(r.turns) - 1) })).filter(r => r.turns > 0);
            entity.summons = array(entity.summons).map(s => s.permanent === true ? s : ({ ...s, turns: Math.max(0, int(s.turns) - 1) })).filter(s => (s.permanent === true || s.turns > 0) && pos(s.hp) > 0);
            if (tickCooldowns) {
                const next = {};
                for (const [skill, value] of Object.entries(object(entity.cooldowns))) {
                    const turns = Math.max(0, int(value) - 1);
                    if (turns > 0)
                        next[skill] = turns;
                }
                entity.cooldowns = next;
            }
        };
        tick(draft.actor, tickActorCooldowns);
        for (const target of array(draft.targets))
            tick(target, tickTargetCooldowns);
        for (const ally of array(draft.allies))
            tick(ally, tickTargetCooldowns);
        draft._centralLifecycleLastTickId = id;
        return { state: draft, events, duplicate: false };
    }
}
export function createTrustedCentralEffectPlanV1956(specializationId, skillId, operations) {
    if (!Array.isArray(operations))
        throw new TypeError('effect_operations_required');
    return Object.freeze({ schema: CENTRAL_EFFECT_PLAN_SCHEMA_V1956, specializationId: String(specializationId), skillId: String(skillId), operations: clone(operations) });
}
