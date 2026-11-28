/**
 * ETRANOM V2154 — Master Environment Conformance Pass (Stages 1–14).
 *
 * Unifies existing authored world systems without changing world IDs, legacy
 * coordinates, movement/save/network/combat contracts, or the source artwork.
 * Spatial collision proxies produced here are authored data for Stage 19; they
 * are deliberately not advertised as an active physics solver.
 */
import { ETRANOM_WORLD_STRUCTURE_V2138, auditWorldStructureV2138, isWorldPositionInBoundsV2138 } from './world-structure-v2138.js?v=2138';
import { ISOMETRIC_CAMERA_V2139, auditIsometricCameraV2139 } from './isometric-camera-v2139.js?v=2139';
import { ETRANOM_WORLD_GEOMETRY_V2140, auditWorldGeometryV2140, isSimplePolygonV2140 } from './world-geometry-v2140.js?v=2140';
import { ETRANOM_BUILDING_ARCHITECTURE_V2141, auditBuildingArchitectureV2141, resolveBuildingDimensionsV2141 } from '../safe-zone/building-architecture-v2141.js?v=2141';
import { ETRANOM_ROAD_SYSTEM_V2142, auditRoadSystemV2142 } from './road-system-v2142.js?v=2142';
import { ETRANOM_PATH_SYSTEM_V2143, auditPathSystemV2143, findPathV2143 } from './path-system-v2143.js?v=2143';
import { ETRANOM_INTERIOR_ARCHITECTURE_V2144, auditInteriorArchitectureV2144 } from '../safe-zone/interior-architecture-v2144.js?v=2144';
import { ETRANOM_ENTRANCE_SYSTEM_V2145, auditEntranceSystemV2145 } from '../safe-zone/entrance-system-v2145.js?v=2145';
import { ETRANOM_TERRAIN_TOPOGRAPHY_V2146, auditTerrainTopographyV2146, sampleTerrainElevationV2146, sampleTerrainGradientV2146 } from './terrain-topography-v2146.js?v=2146';
import { ENVIRONMENTAL_PROPS_V2147, auditEnvironmentalPropsV2147 } from '../safe-zone/environmental-props-v2147.js?v=2147';
import { ETRANOM_TREES_VEGETATION_V2148, auditTreesVegetationV2148 } from '../safe-zone/trees-vegetation-v2148.js?v=2148';
import { ETRANOM_VEHICLE_SYSTEM_V2149, auditVehicleSystemV2149 } from './vehicle-system-v2149.js?v=2149';
import { ETRANOM_LIGHTING_SHADOW_V2150, auditLightingShadowV2150 } from './lighting-shadow-v2151.js?v=2151';
import { ETRANOM_MATERIAL_TEXTURES_V2152, auditMaterialTexturesV2152 } from './material-textures-v2152.js?v=2152';
import { ETRANOM_DEPTH_SORTING_V2153, auditDepthSortingV2153 } from './depth-sorting-v2153.js?v=2153';

const finite = v => Number.isFinite(Number(v));
const positive = v => finite(v) && Number(v) > 0;
const unique = rows => new Set(rows.map(x => x.id)).size === rows.length;
const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
};

export const ETRANOM_MASTER_ENVIRONMENT_V2154 = freeze({
  version: 2154,
  name: 'Master Environment Conformance — Stages 1–14',
  sourceStages: Object.freeze([
    '01-world-structure','02-isometric-camera','03-world-geometry','04-buildings',
    '05-road-system','06-path-system','07a-doors-windows-entrances','07b-interior-architecture',
    '08-terrain-topography','09-environmental-props','10-trees-vegetation','11-vehicles',
    '12-lighting-shadows','13-materials-textures','14-depth-layering-sorting'
  ]),
  coordinateContract: Object.freeze({ units: 'legacy-logical-world-unit', metersPerUnit: null, calibratedToMetres: false, origin: { x: 0, y: 0 }, axes: { x: 'east-west', y: 'north-south', z: 'vertical-elevation' } }),
  cameraContract: Object.freeze({ mode: ISOMETRIC_CAMERA_V2139.mode, zoom: ISOMETRIC_CAMERA_V2139.zoom, rotationRadians: ISOMETRIC_CAMERA_V2139.rotationRadians, projection: 'V2138 affine 2.5D; authored sprites must not be skewed twice' }),
  entityContract: Object.freeze({
    required: ['id','kind','x','y','z','rotationRadians','length','width','height','surface','collisionProxy','passability','interaction'],
    artAndPhysicsSeparate: true,
    missingValues: 'must be explicitly deferred; never silently treated as implemented',
    physicalCollisionRuntime: 'stage-19',
    pathRuntime: 'stage-06-corridor-graph; legacy free movement unchanged'
  }),
  stageCoverage: Object.freeze({
    worldStructure: true, camera: true, geometry: true, buildings: true, roads: true, paths: true,
    doorsAndWindows: true, interiors: true, terrain: true, props: true, vegetation: true,
    vehicles: true, lightingAndShadows: true, materialsAndTextures: true, depthSorting: true
  }),
  explicitOutstanding: Object.freeze([
    'full-physics-collision-solver-and-player-movement-blocking-stage-19',
    'obstacle-aware-navmesh-and-repathing-after-obstacle-changes',
    'metric-calibration-of-logical-world-units',
    'complete-pixel-shadow-maps-or-3d-shadow-maps',
    'full-world-per-sprite-material-maps-and-pbr',
    'mobile-browser-visual-and-performance-qa-not-run'
  ])
});

function buildingPolygon(poi, dims, shape) {
  const cx = Number(poi.x), cy = Number(poi.y), rx = dims.length / 2, ry = dims.depth / 2;
  const angle = Number(poi.rotationRadians ?? poi.rotation ?? 0) || 0;
  const local = shape === 'faceted'
    ? [[-.72,-1], [.72,-1], [1,-.62], [1,.62], [.72,1], [-.72,1], [-1,.62], [-1,-.62]]
    : [[-1,-1],[1,-1],[1,1],[-1,1]];
  return local.map(([x,y]) => {
    const lx=x*rx, ly=y*ry;
    return [cx+lx*Math.cos(angle)-ly*Math.sin(angle), cy+lx*Math.sin(angle)+ly*Math.cos(angle)];
  });
}

/** Creates documented, dimensioned collision candidates for the later Physics stage. */
export function buildWorldCollisionProxiesV2154(buildingPOIs = []) {
  const records = [];
  const poiById = new Map((Array.isArray(buildingPOIs) ? buildingPOIs : []).map(p => [p?.id, p]));
  for (const [id, spec] of Object.entries(ETRANOM_BUILDING_ARCHITECTURE_V2141)) {
    const poi = poiById.get(id);
    if (!poi) continue;
    const dims = resolveBuildingDimensionsV2141(poi);
    if (!dims) continue;
    const z = sampleTerrainElevationV2146(poi.x, poi.y);
    records.push({
      id: `building:${id}`, sourceId: id, kind: 'building',
      transform: { x: Number(poi.x), y: Number(poi.y), z, rotationRadians: Number(poi.rotationRadians ?? poi.rotation ?? 0) || 0 },
      dimensions: { length: dims.length, width: dims.depth, height: dims.wallHeight + dims.roofHeight, wallThickness: dims.wallThickness, floors: dims.floors },
      footprint: { shape: spec.footprint.shape, points: buildingPolygon(poi, dims, spec.footprint.shape), anchor: 'ground-contact-center' },
      surface: spec.facadeMaterial,
      collisionProxy: { shape: 'polygon', blocksPlayer: true, status: 'authored-proxy-awaiting-stage-19-runtime', doors: 'preserve-authored-threshold-gap', windows: 'blocked' },
      passability: { exterior: 'blocked', entry: 'main-door-only', roof: 'non-walkable' },
      interaction: { enabled: true, kind: 'building-entry', runtime: 'existing-building-interaction' },
      precision: 'logical-footprint-derived-from-building-POI'
    });
  }
  for (const item of ENVIRONMENTAL_PROPS_V2147.placements) {
    const solid = !['vegetation','flora'].includes(item.category);
    const radius = Math.max(3, Number(item.width) * (item.category === 'debris' ? .10 : .19));
    records.push({
      id: `prop:${item.asset}:${item.x}:${item.y}`, sourceId: item.asset, kind: 'environment-prop',
      transform: { x: item.x, y: item.y, z: sampleTerrainElevationV2146(item.x, item.y), rotationRadians: 0 },
      dimensions: { length: radius * 2, width: radius * 2, height: Number(item.width) * .7 },
      footprint: { shape: 'circle', radius, anchor: item.groundAnchor || 'bottom-center' },
      surface: item.category, collisionProxy: { shape: solid ? 'circle' : 'none', blocksPlayer: solid, status: 'approximate-proxy-awaiting-stage-19-runtime' },
      passability: { policy: solid ? 'candidate-obstacle' : 'decorative-nonblocking' },
      interaction: { enabled: item.category === 'interactable', runtime: item.category === 'interactable' ? 'stage-15' : 'none' },
      precision: 'sprite-size-estimate-not-surveyed-geometry'
    });
  }
  for (const tree of ETRANOM_TREES_VEGETATION_V2148.trees) {
    const radius = Math.max(4, tree.width * .085);
    records.push({
      id: `tree:${tree.id}`, sourceId: tree.id, kind: 'tree-trunk',
      transform: { x: tree.x, y: tree.y, z: tree.elevation, rotationRadians: 0 },
      dimensions: { length: radius * 2, width: radius * 2, height: tree.width * 1.7 },
      footprint: { shape: 'circle', radius, anchor: 'root-contact-center' },
      surface: 'wood-bark', collisionProxy: { shape: 'circle', blocksPlayer: true, canopyBlocksPlayer: false, status: 'estimated-trunk-proxy-awaiting-stage-19-runtime' },
      passability: { trunk: 'blocked', canopy: 'overhead-occlusion-only' }, interaction: { enabled: false },
      precision: 'trunk-diameter-estimate-from-tree-sprite-width'
    });
  }
  for (const vehicle of ETRANOM_VEHICLE_SYSTEM_V2149.placements) {
    records.push({
      id: `vehicle:${vehicle.id}`, sourceId: vehicle.asset, kind: 'vehicle',
      transform: { x: vehicle.x, y: vehicle.y, z: vehicle.elevation, rotationRadians: vehicle.transform.rotationRadians },
      dimensions: { length: vehicle.length, width: vehicle.width, height: vehicle.height },
      footprint: { shape: 'oriented-rectangle', length: vehicle.length, width: vehicle.width, anchor: vehicle.groundAnchor },
      surface: vehicle.surface, collisionProxy: { shape: 'oriented-rectangle', blocksPlayer: true, status: 'authored-proxy-awaiting-stage-19-runtime' },
      passability: { policy: 'vehicle-body-blocked; hull-requires-waterway' }, interaction: { enabled: false, futureStage: 15 },
      precision: 'vehicle-asset-catalog-dimensions-in-logical-units'
    });
  }
  return freeze(records);
}

export function auditMasterEnvironmentV2154({ buildingPOIs = null } = {}) {
  const errors = [], warnings = [];
  const checks = {
    stage01: auditWorldStructureV2138(),
    stage02: auditIsometricCameraV2139(),
    stage03: auditWorldGeometryV2140(),
    stage04: auditBuildingArchitectureV2141(),
    stage05: auditRoadSystemV2142(),
    stage06: auditPathSystemV2143(),
    stage07b: auditInteriorArchitectureV2144(),
    stage07a: auditEntranceSystemV2145(),
    stage08: auditTerrainTopographyV2146(),
    stage09: auditEnvironmentalPropsV2147(),
    stage10: auditTreesVegetationV2148(),
    stage11: auditVehicleSystemV2149(),
    stage12: auditLightingShadowV2150(),
    stage13: auditMaterialTexturesV2152(),
    stage14: auditDepthSortingV2153()
  };
  for (const [stage, result] of Object.entries(checks)) if (result?.ok === false) errors.push(`${stage}:audit-failed`);
  const buildingIds = Object.keys(ETRANOM_BUILDING_ARCHITECTURE_V2141);
  if (buildingIds.length !== 27 || !unique(buildingIds.map(id => ({ id })))) errors.push('building-catalog-identity-count-or-uniqueness');
  if (Object.keys(ETRANOM_INTERIOR_ARCHITECTURE_V2144).length !== buildingIds.length) errors.push('interior-building-count-mismatch');
  if (Object.keys(ETRANOM_ENTRANCE_SYSTEM_V2145).length !== buildingIds.length) errors.push('entrance-building-count-mismatch');
  for (const id of buildingIds) {
    if (!ETRANOM_INTERIOR_ARCHITECTURE_V2144[id]) errors.push(`missing-interior:${id}`);
    if (ETRANOM_ENTRANCE_SYSTEM_V2145[id]?.interiorLink !== id) errors.push(`broken-interior-link:${id}`);
    if (ETRANOM_ENTRANCE_SYSTEM_V2145[id]?.windowsPassable !== false) errors.push(`window-passability-invalid:${id}`);
  }
  const routeIds = new Set(ETRANOM_ROAD_SYSTEM_V2142.roads.map(r => r.id));
  for (const edge of ETRANOM_PATH_SYSTEM_V2143.edges.filter(e => e.sourceRoadId)) if (!routeIds.has(edge.sourceRoadId)) errors.push(`path-road-link-missing:${edge.id}`);
  for (const road of ETRANOM_ROAD_SYSTEM_V2142.roads) if (!ETRANOM_PATH_SYSTEM_V2143.edges.some(e => e.sourceRoadId === road.id)) errors.push(`road-has-no-walk-link:${road.id}`);
  for (const tree of ETRANOM_TREES_VEGETATION_V2148.trees) {
    if (!finite(tree.elevation) || !['flat','gentle','moderate','steep','cliff'].includes(tree.slope)) errors.push(`tree-terrain-sample-invalid:${tree.id}`);
  }
  for (const vehicle of ETRANOM_VEHICLE_SYSTEM_V2149.placements) {
    if (!finite(vehicle.elevation) || !positive(vehicle.length) || !positive(vehicle.width) || !positive(vehicle.height)) errors.push(`vehicle-spatial-contract-invalid:${vehicle.id}`);
    if (vehicle.terrainClass === 'water' && vehicle.waterwayId !== 'rootwood_creek') errors.push(`vehicle-waterway-link-invalid:${vehicle.id}`);
  }
  for (const zone of ETRANOM_MATERIAL_TEXTURES_V2152.surfaceZones) {
    if (!isSimplePolygonV2140(zone.points) || !ETRANOM_MATERIAL_TEXTURES_V2152.materials[zone.material]) errors.push(`invalid-material-zone:${zone.id}`);
  }
  const centers = ETRANOM_WORLD_STRUCTURE_V2138.regions.safeWorld.settlements;
  for (const settlement of centers) {
    if (!isWorldPositionInBoundsV2138(settlement.cx, settlement.cy)) errors.push(`settlement-out-of-bounds:${settlement.id}`);
    if (!finite(sampleTerrainElevationV2146(settlement.cx, settlement.cy)) || !finite(sampleTerrainGradientV2146(settlement.cx, settlement.cy).gradient)) errors.push(`settlement-relief-invalid:${settlement.id}`);
  }
  const poiIds = buildingPOIs ? buildingPOIs.map(p => p?.id).filter(id => buildingIds.includes(id)) : null;
  if (buildingPOIs) {
    if (poiIds.length !== buildingIds.length || new Set(poiIds).size !== buildingIds.length) errors.push('runtime-building-poi-catalog-mismatch');
    for (const poi of buildingPOIs.filter(p => buildingIds.includes(p?.id))) {
      if (![poi.x,poi.y,poi.w,poi.h].every(finite) || !positive(poi.w) || !positive(poi.h)) errors.push(`invalid-building-poi-transform:${poi.id}`);
      if (!resolveBuildingDimensionsV2141(poi)) errors.push(`building-dimensions-unresolved:${poi.id}`);
    }
  }
  const proxies = buildWorldCollisionProxiesV2154(buildingPOIs || []);
  if (buildingPOIs && proxies.filter(p => p.kind === 'building').length !== buildingIds.length) errors.push('building-collision-proxy-coverage-incomplete');
  if (!buildingPOIs) warnings.push('runtime-building-POIs-not-supplied; building collision proxies will be generated by the live runtime audit');
  warnings.push('full physical collision solver and movement blocking are reserved for Stage 19; this pass creates and validates spatial proxy contracts only');
  warnings.push('logical world units are not calibrated to metres');
  warnings.push('navigation remains an authored corridor A* graph, not an obstacle-aware NavMesh');
  warnings.push('lighting uses authored polygonal shadows and Canvas2D illumination, not hardware shadow maps');
  warnings.push('material coverage currently targets four authored regional surfaces, not every sprite surface');
  warnings.push('browser and Android visual/performance validation has not been run');
  return freeze({
    ok: errors.length === 0, version: 2154, stages: '01–14',
    stageChecks: checks,
    counts: {
      settlements: ETRANOM_WORLD_STRUCTURE_V2138.regions.safeWorld.settlements.length,
      gates: ETRANOM_WORLD_STRUCTURE_V2138.regions.safeWorld.perimeterGates.length,
      roads: ETRANOM_ROAD_SYSTEM_V2142.roads.length,
      gateApproaches: ETRANOM_ROAD_SYSTEM_V2142.gateApproaches.length,
      pathNodes: ETRANOM_PATH_SYSTEM_V2143.nodes.length,
      pathEdges: ETRANOM_PATH_SYSTEM_V2143.edges.length,
      buildings: buildingIds.length,
      interiorPlans: Object.keys(ETRANOM_INTERIOR_ARCHITECTURE_V2144).length,
      doorContracts: Object.keys(ETRANOM_ENTRANCE_SYSTEM_V2145).length,
      props: ENVIRONMENTAL_PROPS_V2147.count,
      trees: ETRANOM_TREES_VEGETATION_V2148.trees.length,
      understory: ETRANOM_TREES_VEGETATION_V2148.understory.length,
      vehicles: ETRANOM_VEHICLE_SYSTEM_V2149.placements.length,
      lightEmitters: ETRANOM_LIGHTING_SHADOW_V2150.emitters.length,
      shadowCasters: ETRANOM_LIGHTING_SHADOW_V2150.shadowCasters.length,
      materials: Object.keys(ETRANOM_MATERIAL_TEXTURES_V2152.materials).length,
      materialZones: ETRANOM_MATERIAL_TEXTURES_V2152.surfaceZones.length,
      collisionProxies: proxies.length
    },
    collisionProxies: proxies,
    runtimePOIsValidated: !!buildingPOIs,
    errors, warnings
  });
}

if (typeof window !== 'undefined') {
  window.ETRANOM_MASTER_ENVIRONMENT_V2154 = ETRANOM_MASTER_ENVIRONMENT_V2154;
  window.ETRANOM_AUDIT_MASTER_ENVIRONMENT_V2154 = () => auditMasterEnvironmentV2154();
}
