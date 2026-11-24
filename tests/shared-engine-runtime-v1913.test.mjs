import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ResourceEngine, CooldownEngine, StatusEngine, SpecialEffectEngine, ReactionEngine,
  MultiHitEngine, SummonEngine, SkillUpgradeEngine, TalentEngine, DomainEngine,
  AscensionEngine, StatEngine, SkillEngine, CombatLifecycleEngine, CombatResultEngine,
  createSharedCombatAdapter, ENGINE_VERSION
} from '../systems/combat/engines/shared-engine-runtime-v1913.js';
import { createSpecializationRegistry } from '../systems/combat/specialization-registry.js';
import { readFileSync } from 'node:fs';
const manifest = JSON.parse(readFileSync(new URL('../content/classes/SPECIALIZATION_REGISTRY_V1.json', import.meta.url), 'utf8'));

test('engine version and all three adapter modes', () => {
  assert.equal(ENGINE_VERSION, '1913.0.0');
  for (const mode of ['solo','party','pvp']) assert.equal(createSharedCombatAdapter(mode).mode, mode);
  assert.throws(() => createSharedCombatAdapter('raid'), /unsupported_combat_mode/);
});

test('resource reserve/commit/refund is atomic and idempotent', () => {
  const a = { resources: { mana: 50 } };
  const r = ResourceEngine.reserve(a, 'mana', 20, 'x');
  assert.equal(ResourceEngine.balance(r.actor, 'mana'), 50);
  const c = ResourceEngine.commit(r.actor, 'x');
  assert.equal(ResourceEngine.balance(c.actor, 'mana'), 30);
  assert.equal(ResourceEngine.commit(c.actor, 'x').actor.resources.mana, 30);
  const f = ResourceEngine.refund(c.actor, 'x');
  assert.equal(f.actor.resources.mana, 50);
  assert.throws(() => ResourceEngine.reserve(a, 'mana', 60, 'y'), /insufficient_resource/);
});

test('cooldown starts after action and ticks once per turn', () => {
  const s = CooldownEngine.start({ cooldowns: {} }, 'fire', 2, 'act1').actor;
  assert.equal(s.cooldowns.fire, 2);
  assert.equal(CooldownEngine.tick(s, 'turn1').actor.cooldowns.fire, 1);
  assert.equal(CooldownEngine.tick(CooldownEngine.tick(s, 'turn1').actor, 'turn1').actor.cooldowns.fire, 1);
  assert.equal(CooldownEngine.tick(s, 'turn2').actor.cooldowns.fire, 1);
});

test('status stack, refresh, cleanse, tick and duplicate protection', () => {
  let t = StatusEngine.apply({ hp: 10 }, { id: 'burn', durationTurns: 2, stackRule: 'stack', stacks: 1, maxStacks: 3, tickPolicy: 'turn_start', tickValue: 2 }).target;
  t = StatusEngine.apply(t, { id: 'burn', durationTurns: 3, stackRule: 'stack', stacks: 1, maxStacks: 3, tickPolicy: 'turn_start', tickValue: 2 }).target;
  assert.equal(t.statuses.burn.stacks, 2);
  const tick = StatusEngine.tick(t, 't1');
  assert.equal(tick.events[0].type, 'status_tick');
  assert.equal(StatusEngine.tick(tick.target, 't1').duplicate, true);
  assert.deepEqual(StatusEngine.cleanse(tick.target).removed, ['burn']);
});

test('status expires and death cleanup clears temporary combat state', () => {
  const t = StatusEngine.apply({ hp: 1 }, { id: 'slow', durationTurns: 1 }).target;
  assert.equal(StatusEngine.tick(t, 'turn').target.statuses.slow, undefined);
  assert.deepEqual(StatusEngine.cleanupOnDeath({ statuses: { x: {} }, summons: [{}], shield: {} }).summons, []);
});

test('effect engine supports registered standard effects and rejects unknown effects', () => {
  const engine = new SpecialEffectEngine();
  const out = engine.execute({ actor: {}, target: { hp: 10 }, mode: 'solo' }, { kind: 'shield', amount: 5, durationTurns: 2 });
  assert.equal(out.target.shield.hp, 5);
  assert.throws(() => engine.execute({ actor: {}, target: {}, mode: 'pvp' }, { kind: 'arbitrary_code' }), /unknown_or_unregistered_effect/);
});

test('extension effect handler is registered under controlled id', () => {
  const engine = new SpecialEffectEngine();
  engine.registerExtension('necromancer.legion.v1', 'summon', (ctx, fx) => { ctx.target.summoned = fx.count; return ctx; });
  assert.equal(engine.execute({ actor: {}, target: {}, mode: 'party' }, { kind: 'summon', count: 2 }).target.summoned, 2);
});

test('reaction order is deterministic and duplicate IDs are rejected', () => {
  const e = new ReactionEngine(), seen = [];
  e.register('after_hit', 'low', c => { seen.push('low'); return c; }, 1);
  e.register('after_hit', 'high', c => { seen.push('high'); return c; }, 10);
  e.dispatch('after_hit', {}, {});
  assert.deepEqual(seen, ['high','low']);
  assert.throws(() => e.register('after_hit', 'low', () => {}), /duplicate_reaction/);
});

test('multi-hit resolves each hit independently and stops on death', () => {
  let calls = 0;
  const r = MultiHitEngine.resolve({ hits: 5, target: { hp: 7 }, resolveHit: t => { calls++; const d = Math.min(3,t.hp); return { target: { hp: t.hp-d }, damage: d, evaded: false }; } });
  assert.equal(calls, 3); assert.equal(r.target.hp, 0); assert.equal(r.totalDamage, 7);
});

test('multi-hit enforces maximum count', () => {
  const r = MultiHitEngine.resolve({ hits: 99, target: { hp: 99 }, hitPolicy: 'continue', resolveHit: t => ({ target: { hp: t.hp-1 }, damage: 1 }) });
  assert.equal(r.hits.length, 20);
});

test('summon cap, action and dead summon cleanup', () => {
  let owner = { id: 'p', summons: [] };
  owner = SummonEngine.summon(owner, { id: 's1', hp: 4 }, { maxActive: 1 }).owner;
  assert.throws(() => SummonEngine.summon(owner, { id: 's2', hp: 4 }, { maxActive: 1 }), /summon_limit_reached/);
  const turn = SummonEngine.resolveTurn(owner, s => ({ summon: { ...s, hp: 0 }, events: [{ type: 'summon_attack' }] }));
  assert.equal(turn.events[0].type, 'summon_attack');
  assert.equal(SummonEngine.resolveTurn(turn.owner, s => ({ summon: s })).owner.summons.length, 0);
});

test('skill upgrades combine only valid rank steps', () => {
  const rows = Array.from({ length: 6 }, (_, i) => ({ id: `u${i+1}`, effects: { damagePct: 2 } }));
  const r = SkillUpgradeEngine.resolve({ upgrades: rows }, 4);
  assert.equal(r.modifiers.damagePct, 6); assert.equal(r.appliedUpgradeIds.length, 3);
});

test('skill upgrade contract rejects missing six records', () => assert.throws(() => SkillUpgradeEngine.resolve({ upgrades: [] }, 1), /six_upgrades/));

test('talent engine checks prerequisites, level and point budget', () => {
  const tree = { branches: [{ talents: [{ id: 'a', unlockLevel: 1 }, { id: 'b', unlockLevel: 10, requires: ['a'], effects: { attack: 2 } }] }] };
  assert.equal(TalentEngine.validate(tree, ['a','b'], { points: 2, level: 10 }).ok, true);
  assert.equal(TalentEngine.validate(tree, ['b'], { points: 1, level: 5 }).ok, false);
  assert.equal(TalentEngine.collectModifiers(tree, ['b']).modifiers.attack, 2);
});

test('domain activation validates mode, level, resource and expires once', () => {
  const domain = { stages: [{ stage: 1, unlockLevel: 5, activationCost: 10, durationTurns: 2, effects: { attackPct: 10 } }] };
  const actor = { level: 5, resources: { mana: 20 } };
  assert.throws(() => DomainEngine.activate(actor, domain, { stage: 1, level: 4, mode: 'solo', activationId: 'a' }), /level_locked/);
  let active = DomainEngine.activate(actor, domain, { stage: 1, level: 5, mode: 'solo', activationId: 'a' }).actor;
  assert.equal(active.resources.mana, 10);
  active = DomainEngine.tick(active, 'turn1').actor;
  assert.equal(active.domain.durationTurns, 1);
  assert.equal(DomainEngine.tick(active, 'turn1').duplicate, true);
  assert.equal(DomainEngine.tick(active, 'turn2').expired, true);
});

test('ascension is limited to one choice per domain activation', () => {
  const actor = { _domainActivationId: 'd1', domain: { active: true } }, options = [{ id: 'a', effects: { attackPct: 5 } }, { id: 'b' }];
  const selected = AscensionEngine.select(actor, options, 'a', 'd1').actor;
  assert.equal(selected.domain.ascensionId, 'a');
  assert.throws(() => AscensionEngine.select(selected, options, 'b', 'd1'), /already_selected/);
});

test('stat engine aggregates traceable modifiers without specialization formula', () => {
  const r = StatEngine.buildSnapshot({ attack: 10, maxHp: 50 }, [{ id: 'gear', effects: { attack: 2 } }, { id: 'talent', effects: { attack: 3, maxHp: -100 } }]);
  assert.equal(r.stats.attack, 15); assert.equal(r.stats.maxHp, 0); assert.equal(r.trace.length, 3);
});

test('skill engine resolves only playable canonical specialization and validates target', () => {
  const registry = createSpecializationRegistry(manifest);
  const engine = new SkillEngine({ registry, skillResolver: () => ({ id: 'bolt', unlockLevel: 1, resourceType: 'mana', resourceCost: 5, target: 'single_enemy', cooldownTurns: 2, effects: [{ kind: 'damage' }] }) });
  const actor = { id: 'p', level: 10, resources: { mana: 10 }, cooldowns: {} };
  assert.throws(() => engine.prepare({ mode: 'solo', specializationId: 'gunner_1', skillId: 'bolt', targetId: 'e' }, actor), /not_playable/);
  assert.throws(() => engine.prepare({ mode: 'solo', specializationId: 'wizard_arcane_mage', skillId: 'bolt' }, actor), /target_required/);
  const prepared = engine.prepare({ mode: 'solo', specializationId: 'warrior_chaos_warrior', skillId: 'bolt', targetId: 'e', requestId: 'r1' }, actor);
  assert.equal(prepared.specializationId, 'warrior_chaos');
});

test('skill execution commits resource, applies damage and cooldown', () => {
  const registry = createSpecializationRegistry(manifest);
  const engine = new SkillEngine({ registry, skillResolver: () => ({ id: 'bolt', unlockLevel: 1, resourceType: 'mana', resourceCost: 3, target: 'single_enemy', cooldownTurns: 2, effects: [{ kind: 'damage' }] }) });
  const actor = { id: 'p', level: 2, attack: 10, resources: { mana: 10 }, cooldowns: {} };
  const p = engine.prepare({ mode: 'solo', specializationId: 'wizard_arcane_mage', skillId: 'bolt', targetId: 'e', requestId: 'r1' }, actor);
  const out = engine.execute(p, actor, { id: 'e', hp: 20 }, { resolveDamage: () => 7 });
  assert.equal(out.actor.resources.mana, 7); assert.equal(out.target.hp, 13); assert.equal(out.actor.cooldowns.bolt, 2);
});

test('lifecycle checks victory before enemy phase and blocks duplicate turns', () => {
  const engine = new CombatLifecycleEngine(); let enemyCalled = false;
  const payload = { mode: 'party', actor: { id: 'p', hp: 10 }, targets: [{ id: 'e', hp: 2 }], turnId: 't1', action: (a, ts) => ({ actor: a, targets: [{ ...ts[0], hp: 0 }] }), enemyPhase: () => { enemyCalled = true; return {}; } };
  const first = engine.runTurn(payload); assert.equal(first.result, 'victory'); assert.equal(enemyCalled, false);
  assert.equal(engine.runTurn({ ...payload, actor: first.actor }).duplicate, true);
});

test('lifecycle runs each living enemy independently when adapter supplies per-enemy phase', () => {
  const engine = new CombatLifecycleEngine();
  const out = engine.runTurn({ mode: 'party', actor: { id: 'p', hp: 20 }, targets: [{ id: 'm1', hp: 5 }, { id: 'm2', hp: 5 }, { id: 'm3', hp: 0 }], turnId: 't', action: a => ({ actor: a }), enemyPhase: (a, ts) => { let next = { ...a }; const events = []; for (const m of ts.filter(x => x.hp > 0)) { next.hp -= 2; events.push({ type: 'enemy_attack', monsterId: m.id }); } return { actor: next, targets: ts, events }; } });
  assert.equal(out.actor.hp, 16); assert.deepEqual(out.events.map(e => e.monsterId), ['m1','m2']);
});

test('combat result envelope is stable and mode-specific', () => {
  const r = CombatResultEngine.create({ mode: 'pvp', actor: { id: 'a', hp: 10, mp: 2 }, targets: [{ id: 'b', hp: 0 }], turnId: 4, requestId: 'q' });
  assert.equal(r.schema, 'etranom.combat.result.v1'); assert.equal(r.result, 'victory'); assert.equal(r.mode, 'pvp');
});

test('skill request replay returns the stored result without applying damage twice', () => {
  const registry = createSpecializationRegistry(manifest);
  const engine = new SkillEngine({ registry, skillResolver: () => ({ id: 'bolt', unlockLevel: 1, resourceType: 'mana', resourceCost: 2, target: 'single_enemy', cooldownTurns: 1, effects: [{ kind: 'damage' }] }) });
  const actor = { id: 'p', level: 2, attack: 10, resources: { mana: 10 }, cooldowns: {} };
  const prepared = engine.prepare({ mode: 'solo', specializationId: 'wizard_arcane_mage', skillId: 'bolt', targetId: 'e', requestId: 'same-request' }, actor);
  const first = engine.execute(prepared, actor, { id: 'e', hp: 20 }, { resolveDamage: () => 5 });
  const replay = engine.execute(prepared, first.actor, first.target, { resolveDamage: () => 5 });
  assert.equal(replay.duplicate, true);
  assert.equal(replay.target.hp, 15);
  assert.equal(replay.actor.resources.mana, 8);
});
