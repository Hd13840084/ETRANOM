// ETRANOM V2166 — Stage 24/24: cross-stage world validation.
// Aggregates existing source-of-truth audits; does not overwrite gameplay state.
import { auditWorldStructureV2138 } from './world-structure-v2138.js?v=2138';
import { auditIsometricCameraV2139 } from './isometric-camera-v2139.js?v=2139';
import { auditWorldGeometryV2140 } from './world-geometry-v2140.js?v=2140';
import { auditBuildingArchitectureV2141 } from '../safe-zone/building-architecture-v2141.js?v=2141';
import { ETRANOM_TREES_VEGETATION_V2148 } from '../safe-zone/trees-vegetation-v2148.js?v=2148';
import { ETRANOM_WORLD_ART_KIT_V2166, auditWorldArtKitV2166 } from './world-art-kit-v2166.js?v=2166';
import { auditRoadSystemV2142 } from './road-system-v2142.js?v=2142';
import { auditPathSystemV2143 } from './path-system-v2143.js?v=2143';
import { auditInteriorArchitectureV2144 } from '../safe-zone/interior-architecture-v2144.js?v=2144';
import { auditEntranceSystemV2145 } from '../safe-zone/entrance-system-v2145.js?v=2145';
import { auditTerrainTopographyV2146 } from './terrain-topography-v2146.js?v=2146';
import { auditEnvironmentalPropsV2147 } from '../safe-zone/environmental-props-v2147.js?v=2147';
import { auditTreesVegetationV2148 } from '../safe-zone/trees-vegetation-v2148.js?v=2148';
import { auditVehicleSystemV2149 } from './vehicle-system-v2149.js?v=2149';
import { auditLightingShadowV2150 } from './lighting-shadow-v2151.js?v=2151';
import { auditMaterialTexturesV2152 } from './material-textures-v2152.js?v=2152';
import { auditDepthSortingV2153 } from './depth-sorting-v2153.js?v=2153';
import { auditMasterEnvironmentV2154 } from './master-environment-v2154.js?v=2154';
import { auditEnvironmentInteractionV2155 } from './environment-interaction-v2155.js?v=2155';
import { auditWeatherSystemV2157 } from './weather-system-v2157.js?v=2157';
import { auditSeasonsV2158 } from './seasons-system-v2158.js?v=2158';
import { auditEnvironmentAudioV2160 } from './environment-audio-v2160.js?v=2160';
import { auditWorldPhysicsV2161 } from './physics-collision-v2161.js?v=2161';
import { auditVisualPhysicalConsistencyV2162 } from './visual-physical-consistency-v2162.js?v=2162';
import { auditEnvironmentalDetailV2163 } from './environmental-detail-v2163.js?v=2163';
import { auditWorldScaleV2164 } from './world-scale-v2164.js?v=2164';
import { auditAssetContactMasksV2164 } from './asset-contact-masks-v2164.js?v=2164';
import { auditSeasonalSurfacePhysicsV2164 } from './seasonal-surface-physics-v2164.js?v=2164';
import { auditBridgePhysicsV2164 } from './bridge-physics-v2164.js?v=2164';
import { auditVehiclePhysicsV2164 } from './vehicle-physics-v2164.js?v=2164';
import { auditContactRasterV2165 } from './contact-raster-v2165.js?v=2165';
import { auditBridgeRigidBody3DV2165 } from './bridge-rigidbody-3d-v2165.js?v=2165';
import { auditInteriorLevelsV2165 } from '../safe-zone/interior-levels-v2165.js?v=2165';
import { auditSnowStructuralGeometryV2165 } from './snow-structural-geometry-v2165.js?v=2165';
import { auditVehicleSuspensionV2165 } from './vehicle-suspension-v2165.js?v=2165';
import { auditStage23FinalQualityV2165 } from './stage23-final-quality-v2165.js?v=2165';
import { auditWorldRuntimeOptimizationV2164 } from './world-runtime-optimization-v2164.js?v=2164';
import { buildEnvironmentalDetailRegistryV2163 } from './environmental-detail-v2163.js?v=2163';

const hasErrors = audit => !audit || audit.ok !== true;
const summarizeErrors = audit => (audit?.errors || []).map(error => String(error));

/**
 * Run the complete world-stage audit against the actual game runtime inputs.
 * `world` should be the shared physics world produced by buildWorldPhysicsWorldV2161.
 */
export function auditWorldValidationV2166({
  world = null, buildings = [], npcs = [], landmarks = [], vehicles = [],
  environmentalDetailRegistry = null, stage23Audit = null, trees = ETRANOM_TREES_VEGETATION_V2148.trees
} = {}) {
  const buildingIds = buildings.map(building => building?.id).filter(Boolean);
  const detailRegistry = environmentalDetailRegistry || buildEnvironmentalDetailRegistryV2163({ buildings });
  const audits = {
    stage01_worldStructure: auditWorldStructureV2138(),
    stage02_isometricCamera: auditIsometricCameraV2139(),
    stage03_worldGeometry: auditWorldGeometryV2140(),
    stage04_buildingArchitecture: auditBuildingArchitectureV2141(buildingIds.length ? buildingIds : undefined),
    stage05_roadSystem: auditRoadSystemV2142(),
    stage06_pathSystem: auditPathSystemV2143(),
    stage07a_entrances: auditEntranceSystemV2145(),
    stage07b_interiors: auditInteriorArchitectureV2144(),
    stage08_terrain: auditTerrainTopographyV2146(),
    stage09_environmentProps: auditEnvironmentalPropsV2147(),
    stage10_trees: auditTreesVegetationV2148(),
    stage11_vehicles: auditVehicleSystemV2149(),
    stage12_lighting: auditLightingShadowV2150(),
    stage13_materials: auditMaterialTexturesV2152(),
    stage14_depthSorting: auditDepthSortingV2153(),
    stage15_interaction: auditEnvironmentInteractionV2155(),
    stage17_weather: auditWeatherSystemV2157(),
    stage17_seasons: auditSeasonsV2158(),
    stage18_audio: auditEnvironmentAudioV2160(),
    stage19_physics: world ? auditWorldPhysicsV2161(world, { buildingCount: buildings.length || 27 }) : { ok: false, errors: ['runtime-physics-world-missing'] },
    stage20_visualPhysical: auditVisualPhysicalConsistencyV2162({ buildings, physicsWorld: world }),
    stage21_environmentalDetail: auditEnvironmentalDetailV2163({ buildings, registry: detailRegistry }),
    stage22_worldScale: auditWorldScaleV2164(),
    stage22_contactMasks: auditAssetContactMasksV2164(),
    stage22_seasonalSurface: auditSeasonalSurfacePhysicsV2164(),
    stage22_bridgeSupport: auditBridgePhysicsV2164(),
    stage22_vehiclePhysics: auditVehiclePhysicsV2164(vehicles),
    stage22_optimization: auditWorldRuntimeOptimizationV2164(),
    stage23_contactRaster: auditContactRasterV2165(world),
    stage23_bridgeRigidBody: auditBridgeRigidBody3DV2165(),
    stage23_interiorLevels: auditInteriorLevelsV2165(),
    stage23_snowStructure: auditSnowStructuralGeometryV2165(),
    stage23_vehicleSuspension: auditVehicleSuspensionV2165(vehicles),
    stage23_finalQuality: stage23Audit || auditStage23FinalQualityV2165({ world, buildings, trees, vehicles }),
    stage24_artKit: auditWorldArtKitV2166()
  };
  // Re-run Stage 23 with the global tree count supplied by its dedicated audit if caller omitted it.
  // This entry is authoritative only when game.js provides its full Stage-23 gate result.
  const errors = [];
  for (const [name, audit] of Object.entries(audits)) {
    if (hasErrors(audit)) {
      const detail = summarizeErrors(audit);
      errors.push(`${name}:${detail.length ? detail.join('|') : 'audit-failed'}`);
    }
  }
  if (buildings.length !== 27) errors.push(`runtime-building-count:${buildings.length}`);
  if (!world?.colliders || world.colliders.length !== 212) errors.push(`runtime-collider-count:${world?.colliders?.length || 0}`);
  if (!Array.isArray(npcs)) errors.push('runtime-npc-registry-invalid');
  if (landmarks.length < 8) errors.push(`runtime-landmark-count:${landmarks.length}`);
  if (vehicles.length !== 8) errors.push(`runtime-vehicle-count:${vehicles.length}`);
  if (trees.length !== 41) errors.push(`runtime-tree-count:${trees.length}`);

  const stageCoverage = Object.freeze([
    '01:world-structure', '02:isometric-camera', '03:world-geometry', '04:buildings', '05:roads', '06:paths',
    '07A:doors-windows-entrances', '07B:interior-architecture', '08:terrain-topography', '09:environmental-props',
    '10:trees-vegetation', '11:vehicles', '12:lighting-shadows', '13:materials-textures', '14:depth-sorting',
    '15:environmental-interaction', '16:excluded-by-project-scope', '17:weather-seasons', '18:environmental-audio',
    '19:physics-collision', '20:visual-physical-consistency', '21:environmental-detail', '22:optimization', '23:final-quality',
    '24:world-validation-and-art-recovery'
  ]);
  const failedAudits = Object.entries(audits).filter(([, audit]) => hasErrors(audit)).map(([name]) => name);
  return Object.freeze({
    ok: errors.length === 0, version: 2166, stage: 24, name: 'World Validation',
    stagesAudited: stageCoverage, stage16Policy: 'excluded-by-project-owner; no destructible-environment runtime re-enabled',
    metrics: Object.freeze({ buildings: buildings.length, npcs: npcs.length, landmarks: landmarks.length,
      vehicles: vehicles.length, colliders: world?.colliders?.length || 0,
      contactRaster: Object.freeze({ total: world?.contactRasterAudit?.total ?? 0, nativeAlphaMasks: world?.contactRasterAudit?.nativeAlpha ?? 0,
        geometryRasterMasks: world?.contactRasterAudit?.rasterized ?? 0, unmappedMasks: world?.contactRasterAudit?.unmapped ?? 0,
        pixelSize: world?.contactRasterAudit?.pixelSize ?? null }),
      artAssets: ETRANOM_WORLD_ART_KIT_V2166.assets.length,
      roads: ETRANOM_WORLD_ART_KIT_V2166.roadBindings.length,
      footpaths: ETRANOM_WORLD_ART_KIT_V2166.footpathBindings.length,
      gates: ETRANOM_WORLD_ART_KIT_V2166.gateBindings.length }),
    auditCount: Object.keys(audits).length, failedAudits: Object.freeze(failedAudits),
    audits: Object.freeze(audits), errors: Object.freeze(errors)
  });
}

if (typeof window !== 'undefined') {
  window.ETRANOM_AUDIT_WORLD_VALIDATION_V2166 = auditWorldValidationV2166;
}
