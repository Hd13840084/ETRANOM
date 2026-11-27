import test from 'node:test';
import assert from 'node:assert/strict';
import { ETRANOM_PATH_SYSTEM_V2143, findPathV2143, isOnWalkableCorridorV2143, auditPathSystemV2143 } from '../../systems/world/path-system-v2143.js';

test('V2143 builds connected authored navigation network',()=>{
 const a=auditPathSystemV2143(); assert.equal(a.ok,true,JSON.stringify(a.errors));
 assert.equal(a.roadLinks,3); assert.equal(a.gateApproaches,10); assert.ok(a.landmarkFootpaths>=5);
 assert.ok(ETRANOM_PATH_SYSTEM_V2143.nodes.length>0);
});
test('A-star finds a route between capital and farmland',()=>{
 const p=findPathV2143({x:1500,y:1050},{x:490,y:800}); assert.equal(p.ok,true); assert.ok(p.path.length>=3); assert.ok(p.distance>0);
});
test('walkable corridor classifier accepts route and rejects remote terrain',()=>{
 assert.equal(isOnWalkableCorridorV2143(1390,1110),true);
 assert.equal(isOnWalkableCorridorV2143(8000,6000),false);
 assert.equal(isOnWalkableCorridorV2143(NaN,0),false);
});
test('sealed gate approach is represented as terminal access, not unlocked gate',()=>{
 const e=ETRANOM_PATH_SYSTEM_V2143.edges.find(x=>x.gateId==='gate_n');
 assert.ok(e); assert.equal(e.terminal,'sealed-gate-threshold'); assert.equal(e.gateState,'preserve-existing-rules');
});
