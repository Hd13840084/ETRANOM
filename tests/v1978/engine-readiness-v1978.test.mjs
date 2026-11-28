import test from 'node:test';
import assert from 'node:assert/strict';
import {buildEngineReadinessReportV1978,getProductionBindingManifestV1978,ENGINE_READINESS_VERSION_V1978} from '../../systems/combat/engine-readiness-v1978.js';

test('readiness audit loads all ten engine modules and validates their public contracts',()=>{
 const r=buildEngineReadinessReportV1978();
 assert.equal(r.version,ENGINE_READINESS_VERSION_V1978);
 assert.equal(r.counts.requiredModules,10);
 assert.equal(r.counts.availableModules,10);
 assert.equal(r.readiness.engineModulesPresent,true);
});
test('audit does not mislabel module presence as live production integration',()=>{
 const r=buildEngineReadinessReportV1978();
 assert.equal(r.readiness.fullyLiveIntegrated,false);
 assert.equal(r.counts.unverifiedProductionBindings,8);
 assert.ok(r.blockers.unverifiedProductionBindings.includes('pvp_combat'));
 assert.ok(r.blockers.unverifiedProductionBindings.includes('reward_settlement'));
});
test('class and region content gates stay closed until all approvals are supplied',()=>{
 const r=buildEngineReadinessReportV1978({classCatalog:{approved:true,approvedSpecializations:40},regionManifest:{approved:true,approvedRegions:10,zonesPerRegion:6}});
 assert.equal(r.gates.contentGateOpen,true);
 assert.equal(r.readiness.readyToBeginAuthoredContent,true);
 const incomplete=buildEngineReadinessReportV1978({classCatalog:{approved:true,approvedSpecializations:8},regionManifest:{approved:true,approvedRegions:1,zonesPerRegion:6}});
 assert.equal(incomplete.gates.contentGateOpen,false);
});
test('a backend adapter is only marked live when transaction and production verification are explicit',()=>{
 const weak=buildEngineReadinessReportV1978({backendAdapters:{solo_combat:{execute(){},transactional:true}}});
 assert.equal(weak.productionBindings.find(x=>x.id==='solo_combat').productionVerified,false);
 const verified=buildEngineReadinessReportV1978({backendAdapters:{solo_combat:{execute(){},transactional:true,productionVerified:true}}});
 assert.equal(verified.productionBindings.find(x=>x.id==='solo_combat').productionVerified,true);
});
test('binding manifest is immutable and lists the known production boundaries',()=>{
 const manifest=getProductionBindingManifestV1978();
 assert.equal(manifest.length,8);
 assert.ok(Object.isFrozen(manifest));
 assert.ok(manifest.some(x=>x.id==='monster_ai'&&x.status==='module_only'));
});
test('audit explicitly records that it did not mutate, deploy or execute SQL',()=>{
 const r=buildEngineReadinessReportV1978();
 assert.deepEqual(r.safety,{noLiveMutationPerformed:true,noSqlExecuted:true,noDeploymentPerformed:true});
});
