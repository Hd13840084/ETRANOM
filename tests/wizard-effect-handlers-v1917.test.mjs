import test from 'node:test';
import assert from 'node:assert/strict';
import { compileWizardEffectPlanV1916, buildWizardEffectPlanCatalogV1916 } from '../systems/combat/engines/wizard-effect-plan-v1916.js';
import { createWizardEffectHandlersV1917, auditWizardEffectHandlerCoverageV1917, executeWizardEffectPlanV1917, getWizardEffectHandlerKindsV1917 } from '../systems/combat/engines/wizard-effect-handlers-v1917.js';

const provider = values => () => values;

test('V1917 registers every standard effect kind declared by V1916', () => {
  assert.deepEqual(getWizardEffectHandlerKindsV1917(), ['apply_status','cleanse','damage','dispel','heal','multi_hit','resource_drain','resource_gain','revive','shield','stat_modifier','summon','taunt']);
});

test('V1917 damage handler resolves selected target and consumes only trusted provider amount', () => {
  const plan = compileWizardEffectPlanV1916('wizard_arcane_mage','arcane_bolt');
  const state = { actor:{id:'hero'}, targets:[{id:'m1',hp:100},{id:'m2',hp:100}] };
  const result = executeWizardEffectPlanV1917(plan,state,{mode:'solo',requestId:'d1',selectedTargetId:'m2',effectProvider:provider({amount:23})});
  assert.equal(result.state.targets[0].hp,100); assert.equal(result.state.targets[1].hp,77);
  assert.equal(state.targets[1].hp,100);
});

test('V1917 heal and cleanse execute in authored order', () => {
  const plan = compileWizardEffectPlanV1916('wizard_elementalist','tidal_renewal');
  const state = { actor:{id:'hero',hp:30,maxHp:100,statuses:[{id:'burn',polarity:'negative'}]}, targets:[] };
  const result = executeWizardEffectPlanV1917(plan,state,{mode:'party',requestId:'h1',effectProvider:({step})=>step.kind==='heal'?{amount:25}:{statusIds:['burn']}});
  assert.equal(result.state.actor.hp,55); assert.deepEqual(result.state.actor.statuses,[]);
  assert.deepEqual(result.events.map(e=>e.effect),['heal','cleanse']);
});

test('V1917 refuses to execute if trusted effect provider is absent', () => {
  const plan = compileWizardEffectPlanV1916('wizard_arcane_mage','arcane_bolt');
  assert.throws(()=>executeWizardEffectPlanV1917(plan,{actor:{},targets:[{id:'x',hp:10}]},{mode:'solo',requestId:'x'}),/trusted_effect_provider_required/);
});

test('V1917 extension handlers require a namespaced id and function', () => {
  assert.throws(()=>createWizardEffectHandlersV1917({extensionHandlers:{'permanent_recruit':()=>{}}}),/invalid_extension_handler_id/);
  assert.throws(()=>createWizardEffectHandlersV1917({extensionHandlers:{'wizard.necromancer.permanent_recruit':true}}),/invalid_extension_handler/);
  const handlers=createWizardEffectHandlersV1917({extensionHandlers:{'wizard.necromancer.permanent_recruit':()=>{}}});
  assert.equal(typeof handlers['wizard.necromancer.permanent_recruit'],'function');
});

test('V1917 coverage audit blocks claims of complete coverage while specialization handlers are absent', () => {
  const audit=auditWizardEffectHandlerCoverageV1917(buildWizardEffectPlanCatalogV1916(),createWizardEffectHandlersV1917());
  assert.ok(audit.standardHandlerCount>=13); assert.ok(audit.missingHandlerCount>0); assert.equal(audit.liveCutoverReady,false);
  assert.ok(audit.missing.every(x=>x.handlerId.startsWith('wizard.')));
});

test('V1917 status application requires a valid status definition', () => {
  const plan=compileWizardEffectPlanV1916('wizard_arcane_mage','ancient_rune');
  assert.throws(()=>executeWizardEffectPlanV1917(plan,{actor:{id:'hero'},targets:[{id:'m1',hp:20,statuses:[]}]},{mode:'solo',requestId:'bad-status',selectedTargetId:'m1',effectProvider:({step})=>step.kind==='damage'?{amount:1}:{status:{}}}),/status_definition_required/);
});

test('V1917 multi-hit handler applies each hit separately and records per-hit outcomes', () => {
  const fakePlan={version:'1916.0.0',status:'compiled',specializationId:'wizard_arcane_mage',skillId:'test',steps:[{index:0,kind:'multi_hit',scope:'selected_target',standard:true,handlerId:'multi_hit'}]};
  const result=executeWizardEffectPlanV1917(fakePlan,{actor:{id:'hero'},targets:[{id:'m',hp:50}]},{mode:'solo',requestId:'mh',selectedTargetId:'m',effectProvider:provider({hits:3,amount:7})});
  assert.equal(result.state.targets[0].hp,29); assert.equal(result.state.effectLog[0].results.length,3);
});
