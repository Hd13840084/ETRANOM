import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import {
  buildWorldPhysicsWorldV2161, auditWorldPhysicsV2161, isWorldPositionBlockedV2161,
  resolveWorldMovementV2161, resolveWorldSurfacePhysicsV2161, findPhysicsPathV2161,
  moveInteriorPlayerV2161, ETRANOM_CITY_STREET_PROPS_V2161
} from '../../systems/world/physics-collision-v2161.js';
import { isPointOnBridgeDeckV2162 } from '../../systems/world/visual-physical-consistency-v2162.js';
import { ETRANOM_WORLD_STRUCTURE_V2138 } from '../../systems/world/world-structure-v2138.js';
import { ETRANOM_TREES_VEGETATION_V2148 } from '../../systems/safe-zone/trees-vegetation-v2148.js';
import { ETRANOM_VEHICLE_SYSTEM_V2149 } from '../../systems/world/vehicle-system-v2149.js';
import { ETRANOM_WORLD_GEOMETRY_V2140 } from '../../systems/world/world-geometry-v2140.js';
import { ETRANOM_INTERIOR_ARCHITECTURE_V2144 } from '../../systems/safe-zone/interior-architecture-v2144.js';
import { ETRANOM_ROAD_SYSTEM_V2142 } from '../../systems/world/road-system-v2142.js';
import { ETRANOM_PATH_SYSTEM_V2143 } from '../../systems/world/path-system-v2143.js';

const root = resolve('.');
const rows = [
 ['online_player_market',1450,820,190,132],['pvp_hall',1690,820,190,135],['inn',1120,1080,190,132],['smith',1880,1080,180,132],
 ['guild',1690,1390,190,140],['alchemy',1330,1390,165,126],['enchanter_shop',930,820,150,130],['clinic',2070,1390,165,126],
 ['guardhouse',1690,560,160,120],['fire_temple',930,1390,170,138],['stable',2240,820,178,128],['granary',1120,1390,170,128],
 ['grain_mill',430,610,175,132],['grain_bakery',565,760,155,118],['grain_farmstead',330,850,165,124],['grain_herbgarden',690,570,170,118],['grain_livestock',590,980,180,130],
 ['rootwood_sawmill',2360,760,190,136],['rootwood_carpenter',2580,900,175,128],['rootwood_herbalist',2730,1120,155,118],['rootwood_hunters',2240,1110,175,126],['rootwood_apiary',2660,650,165,118],
 ['iron_mine',1680,2070,190,138],['iron_smelter',1920,2070,180,132],['iron_stonecutter',2110,2220,175,128],['iron_hall',1580,2260,180,132],['iron_cartwright',2250,2020,170,124]
];
const buildings = rows.map(([id,x,y,w,h])=>({id,x,y,w,h}));
const landmarks = ETRANOM_WORLD_STRUCTURE_V2138.regions.safeWorld.landmarks;
const npcs = [
 {id:'captain_arden',x:1690,y:575}, {id:'merchant_ren',x:1450,y:835},
 {id:'grain_miller_omid',x:455,y:610}, {id:'rootwood_sawyer_daran',x:2385,y:760}
];
const world = buildWorldPhysicsWorldV2161({buildings,npcs,landmarks});

test('V2161 builds a live spatial-hash world for every canonical building, tree, vehicle and water feature',()=>{
 const audit=auditWorldPhysicsV2161(world,{buildingCount:27});
 assert.equal(audit.ok,true,audit.errors.join(','));
 assert.equal(world.counts.buildings,27);
 assert.equal(world.counts.treeTrunks,ETRANOM_TREES_VEGETATION_V2148.trees.length);
 assert.equal(world.counts.vehicles,ETRANOM_VEHICLE_SYSTEM_V2149.placements.length);
 assert.equal(world.counts.waterFeatures,ETRANOM_WORLD_GEOMETRY_V2140.waterways.length+ETRANOM_WORLD_GEOMETRY_V2140.waterBasins.length);
 assert.ok(world.counts.total>=180);
 assert.ok(world.colliders.every(c=>c.id&&c.bounds&&Number.isFinite(c.bounds.minX)&&Number.isFinite(c.bounds.maxY)));
 assert.equal(new Set(world.colliders.map(c=>c.id)).size,world.colliders.length);
});

test('actual game runtime registry builds and audits all 210 live colliders',()=>{
 const game=readFileSync(resolve(root,'game.js'),'utf8');
 const readArray=(marker)=>{
   const at=game.indexOf(marker);assert.ok(at>=0,`missing ${marker}`);
   const start=game.indexOf('[',at);let depth=0,quote='',escape=false,lineComment=false,blockComment=false;
   for(let i=start;i<game.length;i++){
     const c=game[i],next=game[i+1];
     if(lineComment){if(c==='\n')lineComment=false;continue;}
     if(blockComment){if(c==='*'&&next==='/'){blockComment=false;i++;}continue;}
     if(quote){if(escape){escape=false;continue;}if(c==='\\'){escape=true;continue;}if(c===quote)quote='';continue;}
     if(c==='/'&&next==='/'){lineComment=true;i++;continue;}
     if(c==='/'&&next==='*'){blockComment=true;i++;continue;}
     if(c==='\''||c==='\"'||c==='`'){quote=c;continue;}
     if(c==='[')depth++;
     if(c===']'&&--depth===0)return vm.runInNewContext(`(${game.slice(start,i+1)})`);
   }
   throw new Error(`unclosed array after ${marker}`);
 };
 const liveBuildings=readArray('const cityPOI =');
 const liveNPCs=readArray('const safeNPCs =');
 const liveLandmarks=ETRANOM_WORLD_STRUCTURE_V2138.regions.safeWorld.landmarks.map(item=>({...item}));
 assert.equal(liveBuildings.length,27);
 assert.equal(liveNPCs.length,20);
 const liveWorld=buildWorldPhysicsWorldV2161({buildings:liveBuildings,npcs:liveNPCs,landmarks:liveLandmarks});
 const liveAudit=auditWorldPhysicsV2161(liveWorld,{buildingCount:liveBuildings.length});
 assert.equal(liveAudit.ok,true,liveAudit.errors.join(','));
 assert.equal(liveWorld.colliders.length,210);
 assert.equal(liveWorld.counts.pixelMaskedColliders,117, '117 placement colliders use native source-pixel alpha masks');
 assert.equal(liveWorld.counts.proxyColliders,93, '93 remaining colliders are authored polygons/proxies for doors, buildings, water, vehicles, NPCs and unmatched objects');
 for(const building of liveBuildings){
   const shell=liveWorld.colliders.find(c=>c.id===`building:${building.id}:shell`);
   const closed={environmentInteractions:{entities:{[`building:${building.id}:door`]:{doorOpen:false}}}};
   const opened={environmentInteractions:{entities:{[`building:${building.id}:door`]:{doorOpen:true}}}};
   assert.equal(isWorldPositionBlockedV2161(liveWorld,shell.doorway.x,shell.doorway.frontY,{gameState:closed}),true,`closed live door ${building.id}`);
   assert.equal(isWorldPositionBlockedV2161(liveWorld,shell.doorway.x,shell.doorway.frontY,{gameState:opened}),false,`open live door ${building.id}`);
 }
 for(const collider of liveWorld.colliders){
   let x=collider.shape==='segment'?(collider.ax+collider.bx)*.5:collider.x;
   let y=collider.shape==='segment'?(collider.ay+collider.by)*.5:collider.y;
   if (collider.shape==='alpha-mask') {
     let found=false;
     for(let iy=0;iy<collider.maskHeight&&!found;iy++) for(let ix=0;ix<collider.maskWidth;ix++) {
       const bit=iy*collider.maskWidth+ix;
       if(collider.maskBytes[bit>>3]&(1<<(7-(bit&7)))) { x=collider.x-collider.imageWidth/2+(ix+.5)*collider.imageWidth/collider.maskWidth; y=collider.y-collider.contactHeight+(iy+.5)*collider.contactHeight/collider.maskHeight; found=true; break; }
     }
   }
   const bridgeDeckWater = collider.kind==='water-channel' && isPointOnBridgeDeckV2162(x,y,collider.waterwayId,0);
   assert.equal(isWorldPositionBlockedV2161(liveWorld,x,y,{radius:0}),!bridgeDeckWater,`collider occupied point must match its physical passage contract: ${collider.id}`);
 }
});

test('all 27 building shells are solid, the main door is stateful and windows remain blocked',()=>{
 for(const b of buildings){
   const c=world.colliders.find(x=>x.id===`building:${b.id}:shell`);assert.ok(c,b.id);assert.equal(c.windowsBlocked,true);assert.ok(c.wallThickness>0);
   const closed={environmentInteractions:{entities:{[`building:${b.id}:door`]:{doorOpen:false}}}};
   const opened={environmentInteractions:{entities:{[`building:${b.id}:door`]:{doorOpen:true}}}};
   assert.equal(isWorldPositionBlockedV2161(world,c.doorway.x,c.doorway.frontY,{gameState:closed}),true,`closed door ${b.id}`);
   assert.equal(isWorldPositionBlockedV2161(world,c.doorway.x,c.doorway.frontY,{gameState:opened}),false,`open door ${b.id}`);
   assert.equal(isWorldPositionBlockedV2161(world,c.x,c.y-c.halfY,{gameState:opened}),true,`wall ${b.id}`);
 }
});

test('tree trunks, rocks/props, parked vehicles and waterways receive independent physical blockers',()=>{
 const tree=ETRANOM_TREES_VEGETATION_V2148.trees.find(t=>t.biome==='ironstone');
 assert.ok(isWorldPositionBlockedV2161(world,tree.x,tree.y));
 const rock=world.colliders.find(c=>c.source==='rock'||c.kind==='environment-prop'&&c.source==='rock');
 assert.ok(world.colliders.some(c=>c.kind==='environment-prop'&&c.source==='rock'));
 const vehicle=ETRANOM_VEHICLE_SYSTEM_V2149.placements.find(v=>v.terrainClass!=='water');
 assert.ok(isWorldPositionBlockedV2161(world,vehicle.x,vehicle.y));
 const creek=ETRANOM_WORLD_GEOMETRY_V2140.waterways.find(w=>w.id==='rootwood_creek');
 assert.ok(isWorldPositionBlockedV2161(world,creek.points[1][0],creek.points[1][1]));
 assert.ok(rock);
});

test('movement uses bounded substeps, slides along walls and cannot tunnel through a prop',()=>{
 const move=resolveWorldMovementV2161(world,{x:1200,y:820},{dx:160,dy:0,radius:11,maxStep:6});
 assert.ok(move.moved);
 assert.equal(move.blockedX,true);
 assert.ok(move.x<1480,'movement must stop at the first native-alpha yard fixture before reaching the market building');
 assert.ok(move.steps>=20,'large movement delta must be subdivided');
 const escape=resolveWorldMovementV2161(world,{x:1500,y:920},{dx:-18,dy:0});
 assert.ok(escape.moved,'legacy start position keeps a non-blocked escape direction');
});

test('obstacle-aware local A* returns a traversable route around nearby collision footprints',()=>{
 const route=findPhysicsPathV2161(world,{x:1400,y:900},{x:1320,y:1000},{searchMargin:350,maxNodes:2000});
 assert.equal(route.ok,true,route.reason);
 assert.ok(route.path.length>=2);
 for(const p of route.path.slice(1,-1))assert.equal(isWorldPositionBlockedV2161(world,p.x,p.y),false);
});

test('all authored road surfaces and exclusive landmark footpaths feed physical surface response',()=>{
 for(const road of ETRANOM_ROAD_SYSTEM_V2142.roads){
   const [x,y]=road.centerline[0];
   const sample=resolveWorldSurfacePhysicsV2161(x,y,{season:'summer'});
   assert.equal(sample.roadId,road.id,road.id);
   assert.equal(sample.travelSurface,road.material.surface,road.id);
 }
 const landmarkPaths=ETRANOM_PATH_SYSTEM_V2143.corridors.filter(path=>path.kind==='landmark-footpath');
 assert.equal(landmarkPaths.length,5);
 for(const path of landmarkPaths){
   let found=false;
   for(let i=1;i<path.points.length&&!found;i++){
     const [x1,y1]=path.points[i-1], [x2,y2]=path.points[i];
     const dx=x2-x1,dy=y2-y1,length=Math.hypot(dx,dy)||1;
     for(let t=.05;t<.96&&!found;t+=.05){
       for(const offset of [-4,-2,0,2,4]){
         const x=x1+dx*t-dy/length*offset, y=y1+dy*t+dx/length*offset;
         const sample=resolveWorldSurfacePhysicsV2161(x,y,{season:'summer'});
         if(sample.pathId===path.id){
           assert.equal(sample.travelSurface,path.surface,path.id);
           found=true;break;
         }
       }
     }
   }
   assert.equal(found,true,`no exclusive physical sample for ${path.id}`);
 }
});

test('terrain slope, rain and winter snow affect traction and movement speed',()=>{
 const clear=resolveWorldSurfacePhysicsV2161(500,500,{season:'summer',weather:{wetness:0,snow:0,rain:0}});
 const winter=resolveWorldSurfacePhysicsV2161(500,500,{season:'winter',weather:{wetness:.2,snow:1,rain:0}});
 assert.ok(winter.speedMultiplier<clear.speedMultiplier);
 assert.ok(winter.traction<clear.traction);
 assert.ok(winter.accelerationMultiplier<clear.accelerationMultiplier);
 assert.ok(['flat','gentle','moderate','steep','cliff'].includes(clear.slopeClass));
});

test('interior movement respects authored partitions, furniture and room bounds for all 27 plans',()=>{
 assert.equal(Object.keys(ETRANOM_INTERIOR_ARCHITECTURE_V2144).length,27);
 for(const id of Object.keys(ETRANOM_INTERIOR_ARCHITECTURE_V2144)){
   const invalid=moveInteriorPlayerV2161({x:0,y:0},'left',id);
   assert.equal(invalid.moved,false,id);
 }
 const inn=moveInteriorPlayerV2161({x:3,y:2},'left','inn');
 assert.equal(inn.moved,false);
 assert.equal(inn.reason,'partition-wall');
 const furniture=moveInteriorPlayerV2161({x:5,y:7},'up','inn');
 assert.equal(furniture.moved,false);
 assert.equal(furniture.reason,'furniture');
});

test('street furniture collision registry is the same 12-object set rendered in the world',()=>{
 assert.equal(ETRANOM_CITY_STREET_PROPS_V2161.length,12);
 const game=readFileSync(resolve(root,'game.js'),'utf8');
 assert.match(game,/const cityStreetProps = ETRANOM_CITY_STREET_PROPS_V2161/);
 assert.match(game,/resolveWorldMovementV2161\(worldPhysicsV2161/);
 assert.match(game,/resolveWorldSurfacePhysicsV2161\(/);
 assert.match(game,/window\.ETRANOM_WORLD_PHYSICS_AUDIT_V2161/);
});
