import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { buildWorldPhysicsWorldV2161, isWorldPositionBlockedV2161 } from '../../systems/world/physics-collision-v2161.js';
import { auditContactRasterV2165 } from '../../systems/world/contact-raster-v2165.js';
import { createRigidBody3DV2165, stepRigidBody3DV2165, auditBridgeRigidBody3DV2165 } from '../../systems/world/bridge-rigidbody-3d-v2165.js';
import { createInteriorLevelsStateV2165, changeInteriorFloorV2165, setInteriorFloorPlayerV2165, getInteriorFloorPlayerV2165, auditInteriorLevelsV2165 } from '../../systems/safe-zone/interior-levels-v2165.js';
import { createSnowStructuralStateV2165, stepSnowStructuralGeometryV2165, auditSnowStructuralGeometryV2165 } from '../../systems/world/snow-structural-geometry-v2165.js';
import { auditVehicleSuspensionV2165, initializeVehicleSuspensionV2165, stepVehicleSuspensionV2165 } from '../../systems/world/vehicle-suspension-v2165.js';
import { auditStage23FinalQualityV2165 } from '../../systems/world/stage23-final-quality-v2165.js';
import { ETRANOM_WORLD_STRUCTURE_V2138 } from '../../systems/world/world-structure-v2138.js';
import { ETRANOM_VEHICLE_SYSTEM_V2149 } from '../../systems/world/vehicle-system-v2149.js';
import { ETRANOM_TREES_VEGETATION_V2148 } from '../../systems/safe-zone/trees-vegetation-v2148.js';
import { ETRANOM_INTERIOR_ARCHITECTURE_V2144 } from '../../systems/safe-zone/interior-architecture-v2144.js';

const root=resolve('.'),gameSource=readFileSync(resolve(root,'game.js'),'utf8');
function readArray(marker){
  const at=gameSource.indexOf(marker);assert.ok(at>=0,`missing ${marker}`);const start=gameSource.indexOf('[',at);let depth=0,quote='',escape=false,lineComment=false,blockComment=false;
  for(let i=start;i<gameSource.length;i++){const c=gameSource[i],next=gameSource[i+1];if(lineComment){if(c==='\n')lineComment=false;continue;}if(blockComment){if(c==='*'&&next==='/'){blockComment=false;i++;}continue;}if(quote){if(escape){escape=false;continue;}if(c==='\\'){escape=true;continue;}if(c===quote)quote='';continue;}if(c==='/'&&next==='/'){lineComment=true;i++;continue;}if(c==='/'&&next==='*'){blockComment=true;i++;continue;}if(c==='"'||c==="'"||c==='`'){quote=c;continue;}if(c==='[')depth++;if(c===']'&&--depth===0)return vm.runInNewContext(`(${gameSource.slice(start,i+1)})`);}
  throw new Error(`unclosed source array: ${marker}`);
}
const buildings=readArray('const cityPOI ='),npcs=readArray('const safeNPCs =');
const world=buildWorldPhysicsWorldV2161({buildings,npcs,landmarks:ETRANOM_WORLD_STRUCTURE_V2138.regions.safeWorld.landmarks.map(x=>({...x}))});

test('V2165 is the loaded Stage-23 build and all Stage-23 systems are integrated in the runtime',()=>{
  const index=readFileSync(resolve(root,'index.html'),'utf8');
  assert.match(index,/game\.js\?v=2166-stage24-world-validation/);
  assert.match(gameSource,/__ETRANOM_GAME_BUILD__\s*=\s*'2166-stage24-world-validation'/);
  for(const marker of ['stepRigidBody3DV2165(','stepSnowStructuralGeometryV2165(','drawSnowRoofGeometryV2165(','drawSnowBranchGeometryV2165(','stepVehicleSuspensionV2165('])assert.ok(gameSource.includes(marker)||readFileSync(resolve(root,'systems/world/vehicle-physics-v2164.js'),'utf8').includes(marker),marker);
  assert.match(gameSource,/changeInteriorFloorV2165\(/);
  assert.match(gameSource,/ETRANOM_STAGE23_FINAL_QUALITY_AUDIT_V2165/);
});

test('all 210 blocking world colliders have pixel occupancy masks: 117 native alpha and 93 geometry-rasterized',()=>{
  const audit=auditContactRasterV2165(world);assert.equal(audit.ok,true,audit.errors.join(','));
  assert.equal(world.colliders.length,210);assert.equal(audit.nativeAlpha,117);assert.equal(audit.rasterized,93);assert.equal(audit.unmapped,0);assert.equal(audit.coverage,1);
  assert.ok(world.colliders.filter(c=>c.contactRaster).every(c=>c.contactRaster.bits instanceof Uint8Array));
  assert.deepEqual(world.counts,{buildings:27,treeTrunks:41,environmentalAndAuthoredProps:88,vehicles:8,waterFeatures:4,bridgeCrossings:2,landmarks:4,npcs:20,understory:11,total:210});
});

test('rasterized building footprint collision keeps closed-door blockers and opens only authored door corridors',()=>{
  const b=buildings[0],collider=world.colliders.find(c=>c.id===`building:${b.id}:shell`);assert.ok(collider?.contactRaster);
  const open={environmentInteractions:{entities:{[`building:${b.id}:door`]:{doorOpen:true}}}};
  const closed={environmentInteractions:{entities:{[`building:${b.id}:door`]:{doorOpen:false}}}};
  assert.equal(isWorldPositionBlockedV2161(world,collider.anchorX,collider.anchorY,{radius:0,gameState:open}),true);
  assert.equal(isWorldPositionBlockedV2161(world,collider.doorway.x,collider.doorway.frontY,{radius:0,gameState:closed}),true);
  assert.equal(isWorldPositionBlockedV2161(world,collider.doorway.x,collider.doorway.frontY,{radius:0,gameState:open}),false);
});

test('the 3D solver resolves sphere and oriented-box contacts on the raised bridge deck',()=>{
  const audit=auditBridgeRigidBody3DV2165();assert.equal(audit.ok,true,audit.errors.join(','));
  assert.deepEqual(audit.bodyShapes,['sphere','oriented-box']);
  const body=createRigidBody3DV2165({shape:'box',position:[0,0,8],halfExtents:[.5,.3,.25],mass:3});
  const before=body.position[2];stepRigidBody3DV2165(body,.05,{supportResolver:()=>({point:[0,0,0],normal:[0,0,1],material:'test-floor'})});
  assert.ok(body.position[2]<before);assert.ok(body.orientation.every(Number.isFinite));
});

test('all 27 interior states are registered and 12 have stair-gated independent upper floors',()=>{
  const audit=auditInteriorLevelsV2165();assert.equal(audit.ok,true,audit.errors.join(','));assert.equal(audit.buildings,27);assert.equal(audit.multilevelBuildings,12);
  const [id]=Object.entries(ETRANOM_INTERIOR_ARCHITECTURE_V2144).find(([,a])=>a.upperFloor&&a.stairs?.present);
  const state=createInteriorLevelsStateV2165(id,{x:0,y:0});
  assert.equal(changeInteriorFloorV2165(state,1).reason,'move-to-stairs');
  setInteriorFloorPlayerV2165(state,state.stairPosition);assert.equal(changeInteriorFloorV2165(state,1).ok,true);
  setInteriorFloorPlayerV2165(state,{x:8,y:6});assert.deepEqual(getInteriorFloorPlayerV2165(state),{x:8,y:6});
  setInteriorFloorPlayerV2165(state,state.stairPosition);assert.equal(changeInteriorFloorV2165(state,0).ok,true);assert.deepEqual(getInteriorFloorPlayerV2165(state),state.stairPosition);
});

test('snow loads bend roof geometry and six branch nodes, then temperature and rain melt the stored load',()=>{
  const buildings=[{id:'roof-check',x:0,y:0,w:220,h:130}],trees=[{id:'tree-check',x:0,y:0,width:100}];
  const state=stepSnowStructuralGeometryV2165(createSnowStructuralStateV2165(),{season:'winter',snow:1,temperatureC:-8},.1,buildings,trees);
  const roof=state.objects['roof:roof-check'],canopy=state.objects['canopy:tree-check'];
  assert.ok(roof.depthM>0&&roof.deflectionM>0&&roof.vertices.length===5);
  assert.ok(canopy.branches.length===6&&canopy.deflectionM>0&&canopy.branches.some(b=>b.deflectionM>0));
  const start=roof.depthM;stepSnowStructuralGeometryV2165(state,{season:'spring',snow:0,rain:1,temperatureC:16},.1,buildings,trees);
  assert.ok(state.objects['roof:roof-check'].depthM<start);assert.equal(auditSnowStructuralGeometryV2165().ok,true);
});

test('the vehicle subsystem applies per-wheel spring/damper and tyre-spin state to every configured land vehicle',()=>{
  const audit=auditVehicleSuspensionV2165(ETRANOM_VEHICLE_SYSTEM_V2149.placements);assert.equal(audit.ok,true,audit.errors.join(','));
  assert.equal(audit.vehicles,8);assert.equal(audit.wheelCount,24);assert.equal(audit.watercraft,1);
  const p=ETRANOM_VEHICLE_SYSTEM_V2149.placements.find(v=>v.terrainClass!=='water');
  const vehicle={id:p.id,x:p.x,y:p.y,z:p.elevation||0,heading:p.rotation||0,speed:0,terrainClass:p.terrainClass};
  const suspension=initializeVehicleSuspensionV2165(vehicle,p);const result=stepVehicleSuspensionV2165(vehicle,p,1/30,{resolveSurface:()=>({supportElevation:p.elevation||0,traction:.8})});
  assert.equal(result.ok,true);assert.ok(suspension.wheels.every(w=>Number.isFinite(w.normalLoadN)&&Number.isFinite(w.rotationRad)));
});

test('the integrated Stage-23 final-quality gate passes against the actual 27-building, 41-tree, 8-vehicle, 210-collider registries',()=>{
  const result=auditStage23FinalQualityV2165({world,buildings,trees:ETRANOM_TREES_VEGETATION_V2148.trees,vehicles:ETRANOM_VEHICLE_SYSTEM_V2149.placements});
  assert.equal(result.ok,true,result.errors.join(','));
  assert.deepEqual(result.qualityGates,{allBlockingCollidersPixelMapped:true,bridgesUse3DRigidBodyContact:true,interiorsHaveStackedLevels:true,snowDeformsStructuralGeometry:true,vehiclesHavePerWheelSuspension:true,performanceGoverned:true});
});
