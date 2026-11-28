// ETRANOM V2167 — Stage 25 integration gate for authored geometry and previously
// incomplete physical/visual subsystems. These audits are intentionally read-only.
import { auditWorldGeometryExtensionsV2167 } from './world-geometry-extensions-v2167.js?v=2167';
import { auditWorldArtKitV2167 } from './world-art-kit-v2167.js?v=2167';
import { auditPathSystemV2143 } from './path-system-v2143.js?v=2143';
import { buildWorldPhysicsWorldV2161 } from './physics-collision-v2161.js?v=2167';
import { auditInteriorVolumeV2167 } from '../safe-zone/interior-volume-v2167.js?v=2167';
import { auditBridgeMeshesV2167 } from './bridge-mesh-physics-v2167.js?v=2167';
import { auditBridgeRigidBody3DV2165 } from './bridge-rigidbody-3d-v2165.js?v=2167';
import { auditSnowStructuralGeometryV2167 } from './snow-structural-geometry-v2167.js?v=2167';
import { auditVehicleSuspensionV2167 } from './vehicle-suspension-v2167.js?v=2167';
import { ETRANOM_VEHICLE_SYSTEM_V2149 } from './vehicle-system-v2149.js?v=2149';

export function auditStage25ComprehensiveRepairV2167({world=null,buildings=[],vehicles=ETRANOM_VEHICLE_SYSTEM_V2149.placements}={}){
  const geometry=auditWorldGeometryExtensionsV2167();
  const art=auditWorldArtKitV2167();
  const path=auditPathSystemV2143();
  const collisionWorld=world||buildWorldPhysicsWorldV2161({buildings});
  const barriers=collisionWorld.colliders.filter(c=>c.kind==='world-barrier');
  const physics=Object.freeze({ok:barriers.length===2&&collisionWorld.counts.barrierSegments===2,version:2167,worldVersion:collisionWorld.version,
    barrierColliders:barriers.length,barrierSegments:collisionWorld.counts.barrierSegments,totalColliders:collisionWorld.colliders.length,
    contactRaster:collisionWorld.contactRasterAudit||null,errors:Object.freeze(barriers.length===2?[]:['authored-barrier-colliders-missing'])});
  const interiors=auditInteriorVolumeV2167();
  const bridgeMesh=auditBridgeMeshesV2167();
  const bridgeBodies=auditBridgeRigidBody3DV2165();
  const snow=auditSnowStructuralGeometryV2167();
  const suspension=auditVehicleSuspensionV2167(vehicles);
  const audits={geometry,art,path,physics,interiors,bridgeMesh,bridgeBodies,snow,suspension};
  const errors=[];
  for(const [name,audit] of Object.entries(audits))if(!audit?.ok)errors.push(`${name}:${(audit?.errors||[]).join(',')||'audit-failed'}`);
  return Object.freeze({ok:errors.length===0,version:2167,stage:25,sourceVersion:2166,audits:Object.freeze(audits),errors:Object.freeze(errors),
    completed:{recoveredArtAssets:5,authoredRoadBranches:2,junctions:2,barrierRuns:2,interiorBuildings:interiors.buildings,interiorFloors:interiors.floors,
      bridgeMeshes:bridgeMesh.meshes,bridgeTriangles:bridgeMesh.triangles,snowRoofNodes:snow.roofNodes,snowTreeBranches:snow.treeBranches,vehicleWheels:suspension.wheelCount}});
}
if(typeof window!=='undefined')window.ETRANOM_STAGE25_AUDIT_V2167=auditStage25ComprehensiveRepairV2167();
