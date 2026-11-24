import test from 'node:test';
import assert from 'node:assert/strict';
import { centralSpecializationEngineV1955 } from '../systems/combat/engines/central-specialization-engine-v1955.js';
import { CentralCombatLifecycleV1956, createTrustedCentralEffectPlanV1956, CENTRAL_COMBAT_LIFECYCLE_VERSION_V1956 } from '../systems/combat/engines/central-combat-lifecycle-v1956.js';

const actor = (overrides = {}) => ({ id:'hero-1', level:50, hp:100, maxHp:100, mp:100, maxMp:100, stamina:100, maxStamina:100, resources:{mana:100,stamina:100}, cooldowns:{}, ...overrides });
const state = (overrides = {}) => ({ actor:actor(), targets:[{id:'enemy-1',hp:100,maxHp:100,shield:0,statuses:[]}], allies:[], ...overrides });
function setup(ops) {
  const engine = new CentralCombatLifecycleV1956({ effectCompiler: plan => createTrustedCentralEffectPlanV1956(plan.specializationId, plan.skillId, ops) });
  const plan = centralSpecializationEngineV1955.prepareSkill({ mode:'solo', specializationId:'wizard_arcane_mage', skillId:'arcane_bolt', actor:actor(), targetId:'enemy-1', targets:[{id:'enemy-1',hp:100}], requestId:'plan-1' });
  return { engine, plan };
}

test('V1956 exports a versioned shared lifecycle engine',()=>assert.equal(CENTRAL_COMBAT_LIFECYCLE_VERSION_V1956,'1956.0.0'));
test('executes trusted damage and commits resource/cooldown exactly once',()=>{
  const {engine,plan}=setup([{type:'damage',scope:'selected_target',amount:25}]);
  const first=engine.executePreparedSkill({plan,state:state(),requestId:'req-1',targetId:'enemy-1'});
  assert.equal(first.state.targets[0].hp,75); assert.equal(first.state.actor.mp,100-plan.resource.cost); assert.equal(first.state.actor.cooldowns.arcane_bolt,plan.cooldown.turns);
  const second=engine.executePreparedSkill({plan,state:first.state,requestId:'req-1',targetId:'enemy-1'});
  assert.equal(second.duplicate,true); assert.equal(second.state.targets[0].hp,75);
});
test('pays skill cost before ordered resource-gain effects',()=>{
  const {engine,plan}=setup([{type:'resource_gain',resource:'mana',amount:1}]);
  const result=engine.executePreparedSkill({plan,state:state(),requestId:'cost-then-gain',targetId:'enemy-1'});
  assert.equal(result.state.actor.mp,100-plan.resource.cost+1);
  assert.equal(result.state.actor.resources.mana,100-plan.resource.cost+1);
});
test('applies shield before damage and reports absorbed amount',()=>{
  const {engine,plan}=setup([{type:'shield',scope:'selected_target',amount:12},{type:'damage',scope:'selected_target',amount:20}]);
  const result=engine.executePreparedSkill({plan,state:state(),requestId:'shield-damage',targetId:'enemy-1'});
  assert.equal(result.state.targets[0].shield,0); assert.equal(result.state.targets[0].hp,92);
  assert.equal(result.state.effectLog[1].results[0].absorbed,12);
});
test('supports heal, status, cleanse, and stat modifier',()=>{
  const {engine,plan}=setup([
    {type:'heal',scope:'self',amount:30},{type:'apply_status',scope:'selected_target',status:{id:'burn',polarity:'negative',turns:3,dotDamage:4}},
    {type:'remove_status',scope:'selected_target',statusIds:['burn']},{type:'modifier',scope:'self',stat:'defense',amount:15,turns:2}
  ]);
  const s=state({actor:actor({hp:50})}); const result=engine.executePreparedSkill({plan,state:s,requestId:'utility',targetId:'enemy-1'});
  assert.equal(result.state.actor.hp,80); assert.equal(result.state.targets[0].statuses.length,0); assert.equal(result.state.actor.modifiers[0].stat,'defense');
});
test('supports multi-hit, reaction, taunt, revive and summon',()=>{
  const {engine,plan}=setup([
    {type:'multi_hit',scope:'selected_target',hits:3,amount:7},{type:'reaction',reaction:'reflect',amount:5,turns:2},
    {type:'taunt',scope:'selected_target'},{type:'summon',summon:{id:'spirit-1',hp:20,turns:2},maxSummons:2}
  ]);
  const result=engine.executePreparedSkill({plan,state:state(),requestId:'advanced',targetId:'enemy-1'});
  assert.equal(result.state.targets[0].hp,79); assert.equal(result.state.targets[0].tauntedBy,'hero-1');
  assert.equal(result.state.actor.reactions[0].kind,'reflect'); assert.equal(result.state.actor.summons[0].id,'spirit-1');
});
test('failed operation rolls back all state including resource cost and cooldown',()=>{
  const {engine,plan}=setup([{type:'damage',scope:'selected_target',amount:10},{type:'unsupported',scope:'self'}]);
  const before=state(); assert.throws(()=>engine.executePreparedSkill({plan,state:before,requestId:'rollback',targetId:'enemy-1'}),/unsupported_effect_type/);
  assert.equal(before.targets[0].hp,100); assert.equal(before.actor.mp,100); assert.deepEqual(before.actor.cooldowns,{});
});
test('rejects mismatched actor, skill plan, invalid resources and missing compiler',()=>{
  assert.throws(()=>new CentralCombatLifecycleV1956(),/trusted_effect_compiler_required/);
  const {engine,plan}=setup([]);
  assert.throws(()=>engine.executePreparedSkill({plan,state:state({actor:actor({id:'other'})}),requestId:'bad'}),/actor_plan_mismatch/);
  const bad=setup([]).plan; const broken={...bad,resource:{...bad.resource,resource:'gold'}};
  assert.throws(()=>engine.executePreparedSkill({plan:broken,state:state(),requestId:'bad-resource'}),/unsupported_resource/);
});
test('incoming damage resolves absorb and reflect reactions once',()=>{
  const {engine}=setup([]); const initial=state({actor:actor({reactions:[{kind:'absorb',amount:8,turns:2},{kind:'reflect',amount:6,turns:2}]}),targets:[{id:'enemy-1',hp:100,maxHp:100,shield:0,statuses:[]}]});
  const first=engine.resolveIncomingDamage({state:initial,targetId:'hero-1',sourceId:'enemy-1',amount:20,requestId:'incoming-1'});
  assert.equal(first.state.actor.hp,88); assert.equal(first.state.targets[0].hp,94);
  const duplicate=engine.resolveIncomingDamage({state:first.state,targetId:'hero-1',sourceId:'enemy-1',amount:20,requestId:'incoming-1'});
  assert.equal(duplicate.duplicate,true); assert.equal(duplicate.state.actor.hp,88); assert.equal(duplicate.state.targets[0].hp,94);
});
test('round tick applies DoT, decrements statuses/modifiers/reactions/summons and cooldowns once',()=>{
  const {engine}=setup([]); const initial=state({actor:actor({cooldowns:{a:2},statuses:[{id:'poison',turns:2,dotDamage:9}],modifiers:[{stat:'attack',amount:4,turns:2}],reactions:[{kind:'counter',turns:2}],summons:[{id:'s',hp:10,turns:2}]}),targets:[{id:'enemy-1',hp:100,maxHp:100,statuses:[{id:'burn',turns:1,dotDamage:5}]}]});
  const first=engine.tickTurn(initial,{turnId:'turn-1'}); assert.equal(first.state.actor.hp,91); assert.equal(first.state.targets[0].hp,95); assert.equal(first.state.actor.cooldowns.a,1);
  assert.equal(first.state.actor.statuses[0].turns,1); assert.equal(first.state.actor.summons[0].turns,1);
  const second=engine.tickTurn(first.state,{turnId:'turn-1'}); assert.equal(second.duplicate,true); assert.equal(second.state.actor.hp,91);
});
test('turn tick requires a stable turn id and effect plans are bounded',()=>{
  const {engine,plan}=setup([]); assert.throws(()=>engine.tickTurn(state(),{}),/turn_id_required/);
  const tooMany=Array.from({length:65},()=>({type:'damage',scope:'selected_target',amount:1}));
  const over=new CentralCombatLifecycleV1956({effectCompiler:p=>createTrustedCentralEffectPlanV1956(p.specializationId,p.skillId,tooMany)});
  assert.throws(()=>over.executePreparedSkill({plan,state:state(),requestId:'large',targetId:'enemy-1'}),/effect_plan_too_large/);
});
test('does not mutate caller state while executing',()=>{
  const {engine,plan}=setup([{type:'damage',scope:'selected_target',amount:1}]); const initial=state(); const snapshot=structuredClone(initial);
  engine.executePreparedSkill({plan,state:initial,requestId:'immutable',targetId:'enemy-1'}); assert.deepEqual(initial,snapshot);
});
