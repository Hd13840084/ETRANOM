// ETRANOM V2165 — Stage 23 final-quality gate. Stage 24 remains the separate full-world validation pass.
import { auditContactRasterV2165 } from './contact-raster-v2165.js?v=2165';
import { auditBridgeRigidBody3DV2165 } from './bridge-rigidbody-3d-v2165.js?v=2165';
import { auditInteriorLevelsV2165 } from '../safe-zone/interior-levels-v2165.js?v=2165';
import { auditSnowStructuralGeometryV2165 } from './snow-structural-geometry-v2165.js?v=2165';
import { auditVehicleSuspensionV2165 } from './vehicle-suspension-v2165.js?v=2165';
import { auditWorldRuntimeOptimizationV2164 } from './world-runtime-optimization-v2164.js?v=2164';

export function auditStage23FinalQualityV2165({world=null,buildings=[],trees=[],vehicles=[]}={}){
  const raster=auditContactRasterV2165(world),bridge3D=auditBridgeRigidBody3DV2165(),interiors=auditInteriorLevelsV2165(),snow=auditSnowStructuralGeometryV2165(),suspension=auditVehicleSuspensionV2165(vehicles),optimization=auditWorldRuntimeOptimizationV2164();
  const errors=[];
  for(const [name,audit] of Object.entries({raster,bridge3D,interiors,snow,suspension,optimization}))if(!audit?.ok)errors.push(`${name}:${(audit?.errors||[]).join('|')||'audit-failed'}`);
  if(buildings.length!==27)errors.push(`building-coverage:${buildings.length}`);
  if(trees.length<1)errors.push('tree-registry-empty');
  if(world?.colliders?.length!==210)errors.push(`collider-registry:${world?.colliders?.length||0}`);
  return Object.freeze({ok:errors.length===0,version:2165,stage:23,name:'Final Quality Requirements',
    qualityGates:Object.freeze({allBlockingCollidersPixelMapped:raster.ok,bridgesUse3DRigidBodyContact:bridge3D.ok,interiorsHaveStackedLevels:interiors.ok,snowDeformsStructuralGeometry:snow.ok,vehiclesHavePerWheelSuspension:suspension.ok,performanceGoverned:optimization.ok}),
    metrics:Object.freeze({buildings:buildings.length,trees:trees.length,colliders:world?.colliders?.length||0,pixelCollisionCoverage:raster.coverage??0,nativeAlphaMasks:raster.nativeAlpha||0,rasterizedGeometryMasks:raster.rasterized||0,interiorBuildings:interiors.buildings,multilevelBuildings:interiors.multilevelBuildings,vehicleCount:suspension.vehicles,wheelCount:suspension.wheelCount,bridgeCount:bridge3D.bridgeCount}),
    audits:Object.freeze({raster,bridge3D,interiors,snow,suspension,optimization}),errors:Object.freeze(errors)});
}
export const ETRANOM_STAGE23_FINAL_QUALITY_V2165=Object.freeze({version:2165,stage:23,acceptance:['complete-contact-raster-coverage','fixed-step-3d-bridge-rigid-body-contact','separate-multilevel-interior-floors','roof-and-branch-snow-load-deformation','four-corner-wheel-suspension-and-tyre-slip','runtime-optimization-and-regression-gates'],nextStage:24});
