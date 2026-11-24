import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSafeZoneContentGate,
  createSafeZonePlatform,
  ETRANOM_SAFE_ZONE_READINESS,
  SAFE_ZONE_MODULE_TYPES,
  SAFE_ZONE_SHARED_CAPABILITIES
} from '../../systems/safe-zone/safe-zone-platform.js';

test('content gate requires approval of all ten classes and all ten danger regions',()=>{
  const gate=createSafeZoneContentGate(ETRANOM_SAFE_ZONE_READINESS);
  assert.equal(gate.ready,false);
  assert.equal(gate.required.classes,10);
  assert.equal(gate.required.regions,10);
  assert.equal(gate.missing.classes.length,10);
  assert.equal(gate.missing.regions.length,10);
});

test('safe-zone content is blocked while the world design gate is locked',()=>{
  const p=createSafeZonePlatform({readiness:ETRANOM_SAFE_ZONE_READINESS});
  for(const type of SAFE_ZONE_MODULE_TYPES){
    const result=p.registerModule({id:`empty_${type}`,type,version:'1.0.0',entries:[]});
    assert.equal(result.ok,true,type);
    assert.equal(result.module.enabled,false,type);
  }
  const blocked=p.registerModule({id:'future_shop',type:'vendor_catalogs',entries:[{id:'future_vendor_item'}]});
  assert.equal(blocked.ok,false);
  assert.equal(blocked.error,'content_gate_locked');
  assert.equal(p.audit().activeContentCount,0);
});

test('a complete approved design baseline unlocks the common content platform',()=>{
  const classes=Object.fromEntries(['warrior','wizard','gunner','assassin','monk','paladin','priest','ranger','shaman','summoner'].map(id=>[id,{status:'approved',approved:true}]));
  const regions=Object.fromEntries(Array.from({length:10},(_,i)=>[`danger_region_${String(i+1).padStart(2,'0')}`,{status:'approved',approved:true}]));
  const p=createSafeZonePlatform({readiness:{classes,regions}});
  assert.equal(p.gate.ready,true);
  const r=p.registerModule({id:'future_city_services',type:'services',entries:[{id:'service_alpha'}]});
  assert.equal(r.ok,true);
  assert.equal(r.module.enabled,false,'registration never silently activates content');
  assert.equal(p.activateModule('services','future_city_services').ok,true);
  assert.equal(p.audit().activeContentCount,1);
});

test('all safe-zone entity types use one capability vocabulary and building steward contract',()=>{
  const p=createSafeZonePlatform();
  const npc=p.createEntity({id:'npc_sample',entityType:'npc',name:'NPC',capabilities:['overview','dialogue']});
  const building=p.createEntity({id:'building_sample',entityType:'building',name:'Building',stewardId:'npc_sample',capabilities:['overview','dialogue','services']});
  const landmark=p.createEntity({id:'landmark_sample',entityType:'landmark',name:'Landmark',capabilities:['overview','location']});
  assert.equal(npc.ok,true);assert.equal(building.ok,true);assert.equal(landmark.ok,true);
  assert.ok(SAFE_ZONE_SHARED_CAPABILITIES.includes('commerce'));
  assert.equal(p.createEntity({id:'building_bad',entityType:'building',name:'Bad',capabilities:['overview']}).ok,false);
  assert.equal(p.createEntity({id:'npc_bad',entityType:'npc',name:'Bad',capabilities:['custom_mechanic']}).ok,false);
});

test('unknown module categories and duplicate module IDs are rejected',()=>{
  const p=createSafeZonePlatform();
  assert.equal(p.registerModule({id:'bad_type',type:'special_shop',entries:[]}).error,'unsupported_module_type');
  assert.equal(p.registerModule({id:'dialogues',type:'dialogue_trees',entries:[]}).ok,true);
  assert.equal(p.registerModule({id:'dialogues',type:'dialogue_trees',entries:[]}).error,'duplicate_module');
});

test('all future NPC/building actions pass through one capability-checked dispatcher',async()=>{
  const p=createSafeZonePlatform({readiness:{
    classes:Object.fromEntries(['warrior','wizard','gunner','assassin','monk','paladin','priest','ranger','shaman','summoner'].map(id=>[id,{approved:true}])),
    regions:Object.fromEntries(Array.from({length:10},(_,i)=>[`danger_region_${String(i+1).padStart(2,'0')}`,{approved:true}]))
  }});
  const entity=p.createEntity({id:'npc_vendor',entityType:'npc',name:'Vendor',capabilities:['overview','dialogue','commerce']}).entity;
  assert.equal((await p.dispatch(entity,'buy')).error,'shared_action_handler_not_installed');
  assert.equal(p.registerActionHandler('buy',async({action,payload})=>({ok:true,action,receiptId:payload.receiptId||'test'})).ok,true);
  assert.deepEqual(await p.dispatch(entity,'buy',{receiptId:'r1'}),{ok:true,action:'buy',receiptId:'r1'});
  assert.equal((await p.dispatch(entity,'craft')).error,'capability_not_available');
});
