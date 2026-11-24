import test from 'node:test';
import assert from 'node:assert/strict';
import { createCentralCombatTurnServiceV1968, CENTRAL_COMBAT_TURN_SERVICE_VERSION_V1968 } from '../../systems/combat/central-combat-turn-service-v1968.js';
import { CENTRAL_EFFECT_PLAN_SCHEMA_V1956 } from '../../systems/combat/engines/central-combat-lifecycle-v1956.js';

function makeStore(initial) {
  let state = structuredClone(initial);
  const receipts = new Map();
  return {
    snapshot: () => structuredClone(state),
    transact: async (_id, fn) => {
      const draftState = structuredClone(state), draftReceipts = new Map(receipts);
      const tx = {
        getState: async () => structuredClone(draftState),
        setState: async value => { Object.keys(draftState).forEach(k => delete draftState[k]); Object.assign(draftState, structuredClone(value)); },
        getRequestResult: async key => draftReceipts.has(key) ? structuredClone(draftReceipts.get(key)) : null,
        setRequestResult: async (key, value) => draftReceipts.set(key, structuredClone(value))
      };
      const result = await fn(tx);
      state = draftState;
      receipts.clear(); for (const [k,v] of draftReceipts) receipts.set(k,v);
      return result;
    }
  };
}
const baseState = () => ({ mode:'solo', status:'active', turnNo:1, turnActorId:'hero', actor:{id:'hero',hp:100,maxHp:100,mp:50,maxMp:100,resources:{mana:50},cooldowns:{}}, targets:[{id:'enemy',hp:100,maxHp:100,statuses:[]}], allies:[] });

test('V1968 service has a stable version and requires a serializable transaction store', () => {
  assert.equal(CENTRAL_COMBAT_TURN_SERVICE_VERSION_V1968, '1968.0.0');
  assert.throws(() => createCentralCombatTurnServiceV1968({ executeAction:async()=>({}) }), /serializable_combat_store_required/);
});

test('normal action delegates to authoritative executor, advances turn and records idempotent receipt', async () => {
  const store = makeStore(baseState()); let calls = 0;
  const service = createCentralCombatTurnServiceV1968({ store, executeAction: async ({state,command}) => { calls++; state.targets[0].hp -= 10; return {state,result:{damage:10},turnAdvanced:true,nextTurnActorId:'ally-1',events:[{type:'attack'}]}; } });
  const args = {mode:'solo',combatId:'c1',actorId:'hero',requestId:'r1',intent:{action:'attack',targetId:'enemy'}};
  const first = await service.executeTurn(args);
  const duplicate = await service.executeTurn(args);
  assert.equal(calls,1); assert.equal(first.state.targets[0].hp,90); assert.equal(first.state.turnNo,2);
  assert.equal(first.state.turnActorId,'ally-1'); assert.equal(duplicate.duplicate,true);
});

test('turn ownership and mode policy are enforced before the executor is called', async () => {
  const store = makeStore({...baseState(),turnActorId:'other'}); let calls = 0;
  const service = createCentralCombatTurnServiceV1968({store,executeAction:async()=>{calls++;return {state:baseState()};}});
  await assert.rejects(()=>service.executeTurn({mode:'solo',combatId:'c1',actorId:'hero',requestId:'r1',intent:{action:'attack'}}),/not_your_turn/);
  const pvpStore = makeStore({...baseState(),mode:'pvp'});
  const pvpService = createCentralCombatTurnServiceV1968({store:pvpStore,executeAction:async()=>{calls++;return {state:pvpStore.snapshot()};}});
  await assert.rejects(()=>pvpService.executeTurn({mode:'pvp',combatId:'p1',actorId:'hero',requestId:'r2',intent:{action:'item'}}),/combat_action_not_supported/);
  assert.equal(calls,0);
});

test('trusted skill plans use the shared lifecycle for resource cost, effects and cooldowns', async () => {
  const store = makeStore(baseState());
  const plan = {schema:'etranom.central-skill-plan.v1',mode:'solo',actorId:'hero',specializationId:'wizard_arcane_mage',skillId:'arcane_bolt',requestId:'r-skill',resource:{resource:'mana',cost:10},cooldown:{turns:2},executionStatus:'prepared_only'};
  const service = createCentralCombatTurnServiceV1968({
    store, executeAction:async()=>{throw new Error('legacy executor must not run for central skill');},
    resolveTrustedSkillPlan:async ({skillId,actorId,mode}) => ({...plan,skillId,actorId,mode}),
    effectCompiler:() => ({schema:CENTRAL_EFFECT_PLAN_SCHEMA_V1956,specializationId:'wizard_arcane_mage',skillId:'arcane_bolt',operations:[{type:'damage',scope:'selected_target',amount:25}]})
  });
  const result = await service.executeTurn({mode:'solo',combatId:'c1',actorId:'hero',requestId:'r-skill',intent:{action:'skill',skillId:'arcane_bolt',targetId:'enemy'}});
  assert.equal(result.state.actor.mp,40); assert.equal(result.state.actor.resources.mana,40);
  assert.equal(result.state.targets[0].hp,75); assert.equal(result.state.actor.cooldowns.arcane_bolt,1);
  assert.ok(result.events.some(e=>e.type==='skill_committed'));
});

test('shared lifecycle ticks status damage once after a committed turn', async () => {
  const initial = baseState();
  initial.targets[0].statuses = [{id:'burn',turns:2,dotDamage:7}];
  const store = makeStore(initial);
  const service = createCentralCombatTurnServiceV1968({
    store, executeAction:async ({state}) => ({state,result:{accepted:true},turnAdvanced:true}),
    effectCompiler:() => ({schema:CENTRAL_EFFECT_PLAN_SCHEMA_V1956,specializationId:'x',skillId:'x',operations:[]})
  });
  const result = await service.executeTurn({mode:'solo',combatId:'c1',actorId:'hero',requestId:'r-dot',intent:{action:'attack'}});
  assert.equal(result.state.targets[0].hp,93);
  assert.equal(result.state.targets[0].statuses[0].turns,1);
  assert.ok(result.events.some(e=>e.type==='dot_tick'&&e.damage===7));
});

test('PvP skills require a server-resolved trusted plan; no client effect plan is consumed', async () => {
  const state = {...baseState(),mode:'pvp'}; const store = makeStore(state);
  const plan = {schema:'etranom.central-skill-plan.v1',mode:'pvp',actorId:'hero',specializationId:'wizard_arcane_mage',skillId:'arcane_bolt',requestId:'server-plan',resource:{resource:'mana',cost:5},cooldown:{turns:1},executionStatus:'prepared_only'};
  const service = createCentralCombatTurnServiceV1968({store,executeAction:async()=>({state}),resolveTrustedSkillPlan:async()=>plan,effectCompiler:()=>({schema:CENTRAL_EFFECT_PLAN_SCHEMA_V1956,specializationId:'wizard_arcane_mage',skillId:'arcane_bolt',operations:[{type:'damage',scope:'selected_target',amount:5}]})});
  const result = await service.executeTurn({mode:'pvp',combatId:'p1',actorId:'hero',requestId:'pvp-r1',intent:{action:'skill',skillId:'arcane_bolt',targetId:'enemy',clientPlan:{operations:[{type:'damage',amount:999999}]}}});
  assert.equal(result.state.targets[0].hp,95);
});

test('terminal resolver records a single authoritative combat finish result', async () => {
  const store = makeStore(baseState());
  const service = createCentralCombatTurnServiceV1968({store,executeAction:async({state})=>({state,result:{ok:true}}),terminalResolver:async()=>({status:'victory',winnerId:'hero',reason:'all_enemies_defeated'})});
  const result = await service.executeTurn({mode:'solo',combatId:'c1',actorId:'hero',requestId:'r-end',intent:{action:'attack'}});
  assert.equal(result.state.status,'victory'); assert.equal(result.state.winnerId,'hero');
  await assert.rejects(()=>service.executeTurn({mode:'solo',combatId:'c1',actorId:'hero',requestId:'r-new',intent:{action:'attack'}}),/combat_already_finished/);
});
