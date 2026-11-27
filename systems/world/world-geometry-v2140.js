// ETRANOM V2140 — Stage 3/24: canonical world geometry.
// This is the geometry contract for the existing 2.5D Dark Fantasy world.
// Logical coordinates remain uncalibrated to metres. This module defines map
// footprints and centerlines only; it does NOT create colliders, NavMesh, or Z relief.

import { ETRANOM_WORLD_STRUCTURE_V2138 } from './world-structure-v2138.js?v=2138';

const deepFreeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
};
const round = (n) => Math.round(n * 1000) / 1000;
const boundsOf = (points) => ({
  minX: Math.min(...points.map((p) => p[0])),
  minY: Math.min(...points.map((p) => p[1])),
  maxX: Math.max(...points.map((p) => p[0])),
  maxY: Math.max(...points.map((p) => p[1]))
});
const polylineLength = (points) => points.slice(1).reduce((sum, point, index) => sum + Math.hypot(point[0] - points[index][0], point[1] - points[index][1]), 0);
const centerOfBounds = (bounds) => ({ x: round((bounds.minX + bounds.maxX) / 2), y: round((bounds.minY + bounds.maxY) / 2) });

// The old terrain system used these exact centers, radii, row/column spacing,
// image paths and deterministic variant seed. The new contour simply replaces
// the generic ellipse clip with an authored, gently irregular polygon.
const TERRAIN_DEFINITIONS = [
  {
    id: 'ashen_city', settlementId: 'city', name: 'شهر خاکستر', center: [1500, 1050], radii: [720, 610],
    phase: 0.25, roughness: 0.024, surface: 'weathered-cobblestone-and-ash', biome: 'ashen_citadel',
    palette: 'charcoal-slate / muted iron / old ash / restrained amber',
    files: ['ashen_city_01.png', 'ashen_city_02.png', 'ashen_city_03.png', 'ashen_city_04.png']
  },
  {
    id: 'farmland', settlementId: 'grain', name: 'آبادی کشتزار', center: [490, 800], radii: [480, 465],
    phase: 1.15, roughness: 0.035, surface: 'fallow-loam-and-packed-earth', biome: 'ashen-border-farmland',
    palette: 'dead-gold stubble / dark loam / muted olive / soot-brown',
    files: ['farmland_01.png', 'farmland_02.png', 'farmland_03.png', 'farmland_04.png']
  },
  {
    id: 'rootwood', settlementId: 'rootwood', name: 'آبادی ریشه‌چوب', center: [2480, 900], radii: [520, 455],
    phase: 2.05, roughness: 0.041, surface: 'rootbound-forest-floor', biome: 'haunted-rootwood',
    palette: 'deep moss / black-brown loam / desaturated pine / faint spectral teal',
    files: ['rootwood_01.png', 'rootwood_02.png', 'rootwood_03.png', 'rootwood_04.png']
  },
  {
    id: 'ironstone', settlementId: 'ironhollow', name: 'آبادی سنگ‌آهن', center: [1900, 2140], radii: [510, 430],
    phase: 2.85, roughness: 0.032, surface: 'slate-quarry-and-ore-strewn-ground', biome: 'iron-hollow-highland',
    palette: 'cold slate / iron-grey / mineral brown / subdued ember glow',
    files: ['ironstone_01.png', 'ironstone_02.png', 'ironstone_03.png', 'ironstone_04.png']
  }
];

function makeOrganicFootprint(definition, pointCount = 48) {
  const [cx, cy] = definition.center;
  const [rx, ry] = definition.radii;
  const points = [];
  for (let i = 0; i < pointCount; i++) {
    const angle = (Math.PI * 2 * i) / pointCount;
    const waveA = Math.sin(angle * 3 + definition.phase) * definition.roughness;
    const waveB = Math.cos(angle * 5 - definition.phase * 0.7) * definition.roughness * 0.42;
    const waveC = Math.sin(angle * 7 + definition.phase * 1.3) * definition.roughness * 0.18;
    const radialScale = 1 + waveA + waveB + waveC;
    points.push([
      round(cx + Math.cos(angle) * rx * radialScale),
      round(cy + Math.sin(angle) * ry * radialScale)
    ]);
  }
  return points;
}

const terrainFootprints = TERRAIN_DEFINITIONS.map((definition) => {
  const points = makeOrganicFootprint(definition);
  return {
    id: definition.id,
    settlementId: definition.settlementId,
    name: definition.name,
    geometryType: 'closed-polygon',
    semanticRole: 'visual-terrain-footprint',
    collisionRole: 'none-stage-03-only',
    elevation: { baseZ: 0, relief: 'deferred-to-stage-08' },
    center: { x: definition.center[0], y: definition.center[1] },
    transform: { x: definition.center[0], y: definition.center[1], z: 0, rotationRadians: 0 },
    radii: { x: definition.radii[0], y: definition.radii[1] },
    dimensions: { length: definition.radii[0] * 2, width: definition.radii[1] * 2, height: 0 },
    material: { surface: definition.surface, palette: definition.palette },
    collision: { policy: 'existing-runtime-unchanged', collider: 'deferred-to-stage-19' },
    passability: { policy: 'existing-movement-and-route-rules-unchanged' },
    destructibility: { policy: 'ground-is-not-a-destructible-prop' },
    interaction: { enabled: false },
    points,
    bounds: boundsOf(points),
    pointCount: points.length,
    surface: definition.surface,
    biome: definition.biome,
    palette: definition.palette,
    assetRoot: './assets/safe-zone/terrain-v2096/',
    assetFiles: definition.files,
    tilePlacement: { width: 200, height: 132, stepX: 100, stepY: 66, alternateRowOffsetX: 50, anchor: 'center-bottom' },
    variantSeed: 2097 + TERRAIN_DEFINITIONS.indexOf(definition)
  };
});

const dangerFrontiers = ETRANOM_WORLD_STRUCTURE_V2138.regions.dangerFrontiers.map((frontier) => ({
  id: frontier.id,
  name: frontier.name,
  geometryType: 'closed-polygon',
  semanticRole: 'danger-region-map-boundary',
  collisionRole: 'not-a-physical-wall',
  entry: frontier.entry,
  entryPoint: [...frontier.entryPoint],
  points: frontier.points.map(([x, y]) => [x, y]),
  bounds: boundsOf(frontier.points),
  transform: { ...centerOfBounds(boundsOf(frontier.points)), z: 0, rotationRadians: 0 },
  dimensions: { length: boundsOf(frontier.points).maxX - boundsOf(frontier.points).minX, width: boundsOf(frontier.points).maxY - boundsOf(frontier.points).minY, height: 0 },
  material: { surface: 'biome-boundary-visual-only', biomeId: frontier.id },
  collision: { policy: 'not-a-physical-wall', collider: 'none' },
  passability: { policy: 'existing-region-entry-and-travel-rules-unchanged' },
  destructibility: { policy: 'not-applicable-to-map-boundary' },
  interaction: { enabled: false },
  elevation: { baseZ: 0, relief: 'region-specific-stage-08' }
}));

const routes = ETRANOM_WORLD_STRUCTURE_V2138.routeLinks.map((route) => ({
  id: route.id,
  from: route.from,
  to: route.to,
  geometryType: 'polyline-with-width',
  semanticRole: 'settlement-connector-centerline',
  physicalRoad: 'road-surface-detail-stage-05',
  pathfinding: 'navigation-mesh-stage-06',
  centerline: route.points.map(([x, y]) => [x, y]),
  transform: { x: route.points[0][0], y: route.points[0][1], z: 0, rotationRadians: Math.atan2(route.points[1][1] - route.points[0][1], route.points[1][0] - route.points[0][0]) },
  dimensions: { length: round(polylineLength(route.points)), width: route.width, height: 0 },
  width: route.width,
  surface: route.surface,
  material: { surface: route.surface },
  collision: { policy: 'non-blocking-ground-surface', collider: 'not-created-in-stage-03' },
  passability: { policy: 'existing-route-and-movement-behavior-preserved' },
  destructibility: { policy: 'road-damage-not-implemented-in-stage-03' },
  interaction: { enabled: false },
  elevation: { baseZ: 0, profile: 'grade-profile-stage-08' },
  bounds: boundsOf(route.points)
}));

const gateApproachDefinitions = [
  { gateId: 'gate_nw', inward: [0.62, 0.78], kind: 'field' },
  { gateId: 'gate_n', inward: [0, 1], kind: 'road' },
  { gateId: 'gate_ne', inward: [-0.62, 0.78], kind: 'wood' },
  { gateId: 'gate_e1', inward: [-1, 0.35], kind: 'wet' },
  { gateId: 'gate_e2', inward: [-1, -0.35], kind: 'stone' },
  { gateId: 'gate_se', inward: [-0.62, -0.78], kind: 'ore' },
  { gateId: 'gate_s', inward: [0, -1], kind: 'causeway' },
  { gateId: 'gate_sw', inward: [0.62, -0.78], kind: 'meadow' },
  { gateId: 'gate_w2', inward: [1, -0.35], kind: 'roots' },
  { gateId: 'gate_w1', inward: [1, 0.35], kind: 'ash' }
];
const gateById = new Map(ETRANOM_WORLD_STRUCTURE_V2138.regions.safeWorld.perimeterGates.map((gate) => [gate.id, gate]));
const gateApproaches = gateApproachDefinitions.map((definition, index) => {
  const gate = gateById.get(definition.gateId);
  const [dx, dy] = definition.inward;
  const bend = ((index % 3) - 1) * 24;
  const control = [round(gate.x + dx * 105 - dy * bend * 0.4), round(gate.y + dy * 105 + dx * bend * 0.4)];
  const end = [round(gate.x + dx * 245 - dy * bend), round(gate.y + dy * 245 + dx * bend)];
  return {
    id: `approach_${definition.gateId}`,
    gateId: definition.gateId,
    kind: definition.kind,
    geometryType: 'quadratic-centerline',
    semanticRole: 'sealed-gate-safe-side-approach',
    gate: { x: gate.x, y: gate.y },
    transform: { x: gate.x, y: gate.y, z: 0, rotationRadians: Math.atan2(dy, dx) },
    dimensions: { length: 245, width: 19, height: 0 },
    material: { surface: `worn-${definition.kind}-approach` },
    collision: { policy: 'visual-approach-only-gate-remains-sealed', collider: 'unchanged' },
    passability: { policy: 'current-sealed-gate-access-rules-preserved' },
    destructibility: { policy: 'approach-ground-not-a-destructible-prop' },
    interaction: { enabled: false },
    inward: { x: dx, y: dy },
    control: { x: control[0], y: control[1] },
    end: { x: end[0], y: end[1] },
    length: 245,
    corridorWidth: 19,
    collisionRole: 'visual-approach-only-gate-remains-sealed'
  };
});

const waterways = [
  {
    id: 'keshtezar_irrigation', name: 'جوی آبیاری کشتزار', geometryType: 'polyline-with-width',
    points: [[675, 735], [720, 750], [760, 744], [805, 765], [850, 758]],
    width: 7, transform: { x: 675, y: 735, z: 0, rotationRadians: Math.atan2(750 - 735, 720 - 675) },
    dimensions: { length: round(polylineLength([[675, 735], [720, 750], [760, 744], [805, 765], [850, 758]])), width: 7, height: 0 },
    bankStyle: 'farm-runnel', surface: 'dark-water-with-muted-teal-glints', material: { surface: 'dark-water-with-muted-teal-glints' },
    collision: { policy: 'existing-water-crossing-behavior-unchanged', collider: 'not-created-in-stage-03' },
    passability: { policy: 'water-crossing-rules-deferred-to-navigation-stage-06' },
    destructibility: { policy: 'not-applicable-to-water' }, interaction: { enabled: false }, elevation: { baseZ: 0 }
  },
  {
    id: 'rootwood_creek', name: 'جوی جنگلی ریشه‌چوب', geometryType: 'polyline-with-width',
    points: [[2070, 1180], [2110, 1200], [2160, 1190], [2205, 1220], [2260, 1210], [2310, 1235]],
    width: 128, transform: { x: 2070, y: 1180, z: 0, rotationRadians: Math.atan2(1200 - 1180, 2110 - 2070) },
    dimensions: { length: round(polylineLength([[2070, 1180], [2110, 1200], [2160, 1190], [2205, 1220], [2260, 1210], [2310, 1235]])), width: 128, height: 0 },
    bankStyle: 'mossy-creek', surface: 'shadowed-water-with-cold-reflections', material: { surface: 'shadowed-water-with-cold-reflections' },
    collision: { policy: 'existing-water-crossing-behavior-unchanged', collider: 'not-created-in-stage-03' },
    passability: { policy: 'water-crossing-rules-deferred-to-navigation-stage-06' },
    destructibility: { policy: 'not-applicable-to-water' }, interaction: { enabled: false }, elevation: { baseZ: 0 }
  }
];

const waterBasins = [
  { id: 'ashen_city_reflecting_pool', center: { x: 1500, y: 1510 }, radii: { x: 48, y: 22 }, geometryType: 'ellipse', transform: { x: 1500, y: 1510, z: 0, rotationRadians: 0 }, dimensions: { length: 96, width: 44, height: 0 }, surface: 'carved-reflecting-pool', material: { surface: 'carved-reflecting-pool' }, collision: { policy: 'existing-water-basin-behavior-unchanged', collider: 'not-created-in-stage-03' }, passability: { policy: 'water-surface-rules-deferred-to-stage-06' }, destructibility: { policy: 'not-applicable-to-water' }, interaction: { enabled: false }, elevation: { baseZ: 0 } },
  { id: 'sang_ahan_spring', center: { x: 1770, y: 2150 }, radii: { x: 27, y: 17 }, geometryType: 'ellipse', transform: { x: 1770, y: 2150, z: 0, rotationRadians: 0 }, dimensions: { length: 54, width: 34, height: 0 }, surface: 'mineral-spring', material: { surface: 'mineral-spring' }, collision: { policy: 'existing-water-basin-behavior-unchanged', collider: 'not-created-in-stage-03' }, passability: { policy: 'water-surface-rules-deferred-to-stage-06' }, destructibility: { policy: 'not-applicable-to-water' }, interaction: { enabled: false }, elevation: { baseZ: 0 } }
];

export const ETRANOM_WORLD_GEOMETRY_V2140 = deepFreeze({
  version: 2140,
  stage: 3,
  stageName: 'World Geometry',
  genreContract: {
    genre: 'dark-fantasy-mmorpg',
    visualPrinciples: ['gothic-medieval-silhouettes', 'weathered-stone', 'ash-and-soot', 'haunted-rootwood', 'cold-slate-and-ore', 'restrained-arcane-light'],
    geometryPrinciples: ['readable-isometric-footprints', 'continuous-logical-coordinate-plane', 'consistent-world-unit-scale', 'separate-art-from-geometry', 'future-height-data-is-explicit']
  },
  spatialEntityContract: {
    requiredFields: ['id', 'geometryType', 'transform.x', 'transform.y', 'transform.z', 'transform.rotationRadians', 'dimensions.length', 'dimensions.width', 'dimensions.height', 'material.surface', 'collision.policy', 'passability.policy', 'destructibility.policy', 'interaction.enabled'],
    axes: { x: 'east-west', y: 'north-south', z: 'vertical-elevation' },
    dimensionsUnit: 'logical-world-unit-not-metres',
    unknownOrDeferredValues: 'must-be-labelled-deferred; never represented as already implemented',
    artAndPhysicsAreSeparate: true
  },
  coordinateContract: {
    sourceVersion: 2138,
    kind: 'legacy-logical-world-plane',
    units: 'world-unit-not-metres',
    metersPerUnit: null,
    worldDimensions: { ...ETRANOM_WORLD_STRUCTURE_V2138.dimensions },
    runtimeBounds: { ...ETRANOM_WORLD_STRUCTURE_V2138.dimensions.runtimeBounds },
    projection: { ...ETRANOM_WORLD_STRUCTURE_V2138.projection },
    preserveLegacyCoordinateBehavior: true
  },
  placementGrid: {
    unit: 'logical-world-unit',
    legacyDetailStep: 64,
    placementStep: { x: 100, y: 66 },
    isometricTerrainTile: { width: 200, height: 132, rowOffsetX: 50 },
    note: 'The tile lattice reproduces the existing V2097 placement cadence; none of these values claim metric dimensions.'
  },
  terrainFootprints,
  dangerFrontiers,
  routes,
  gateApproaches,
  waterways,
  waterBasins,
  assetBindings: {
    terrain: { manifest: './assets/safe-zone/terrain-v2096/manifest.json', spriteCount: 16, files: terrainFootprints.flatMap((region) => region.assetFiles) },
    environmentProps: { manifest: './assets/safe-zone/props-v2099/manifest.json', spriteCount: 78, status: 'existing-runtime-catalog-retained' },
    buildings: { manifest: './assets/safe-zone/buildings-v2100/manifest.json', spriteCount: 27, status: 'existing-runtime-catalog-retained' },
    authoredProps: { manifest: './assets/safe-zone/props-v2137/manifest.json', spriteCount: 12, status: 'existing-runtime-catalog-retained' }
  },
  explicitStageBoundaries: {
    zRelief: 'stage-08',
    roadCrossSectionsAndSurfaces: 'stage-05',
    buildingFootprintsAndStructuralVolumes: 'stage-04',
    collisionGeometry: 'stage-19',
    pathfindingAndNavigation: 'stage-06',
    entranceAndDoorThresholds: 'stage-07'
  }
});

export function isSimplePolygonV2140(points, epsilon = 1e-9) {
  if (!Array.isArray(points) || points.length < 3 || !points.every((point) => Array.isArray(point) && point.length >= 2 && Number.isFinite(point[0]) && Number.isFinite(point[1]))) return false;
  const n = points.length;
  const orient = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const onSegment = (a, b, p) => p[0] >= Math.min(a[0], b[0]) - epsilon && p[0] <= Math.max(a[0], b[0]) + epsilon && p[1] >= Math.min(a[1], b[1]) - epsilon && p[1] <= Math.max(a[1], b[1]) + epsilon;
  const intersects = (a, b, c, d) => {
    const o1 = orient(a, b, c), o2 = orient(a, b, d), o3 = orient(c, d, a), o4 = orient(c, d, b);
    if (((o1 > epsilon && o2 < -epsilon) || (o1 < -epsilon && o2 > epsilon)) && ((o3 > epsilon && o4 < -epsilon) || (o3 < -epsilon && o4 > epsilon))) return true;
    return (Math.abs(o1) <= epsilon && onSegment(a, b, c)) || (Math.abs(o2) <= epsilon && onSegment(a, b, d)) || (Math.abs(o3) <= epsilon && onSegment(c, d, a)) || (Math.abs(o4) <= epsilon && onSegment(c, d, b));
  };
  for (let i = 0; i < n; i++) {
    const a = points[i], b = points[(i + 1) % n];
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) <= epsilon) return false;
    for (let j = i + 1; j < n; j++) {
      // Adjacent edges share a vertex by design, including the closing pair.
      if (j === i || j === i + 1 || (i === 0 && j === n - 1)) continue;
      const c = points[j], d = points[(j + 1) % n];
      if (intersects(a, b, c, d)) return false;
    }
  }
  return true;
}

export function pointInPolygonV2140(x, y, points) {
  const px = Number(x), py = Number(y);
  if (!Number.isFinite(px) || !Number.isFinite(py) || !Array.isArray(points) || points.length < 3) return false;
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i], [xj, yj] = points[j];
    const crosses = ((yi > py) !== (yj > py)) && (px < ((xj - xi) * (py - yi)) / ((yj - yi) || 1e-12) + xi);
    if (crosses) inside = !inside;
  }
  return inside;
}

export function distanceToPolylineV2140(x, y, points) {
  const px = Number(x), py = Number(y);
  if (!Number.isFinite(px) || !Number.isFinite(py) || !Array.isArray(points) || points.length < 2) return Infinity;
  let best = Infinity;
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1], [bx, by] = points[i];
    const dx = bx - ax, dy = by - ay;
    const lengthSquared = dx * dx + dy * dy;
    const t = lengthSquared > 0 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared)) : 0;
    best = Math.min(best, Math.hypot(px - (ax + dx * t), py - (ay + dy * t)));
  }
  return best;
}

export function resolveTerrainFootprintV2140(x, y) {
  return ETRANOM_WORLD_GEOMETRY_V2140.terrainFootprints.find((region) => pointInPolygonV2140(x, y, region.points)) || null;
}

export function auditWorldGeometryV2140() {
  const geometry = ETRANOM_WORLD_GEOMETRY_V2140;
  const errors = [];
  const unique = (rows, label) => {
    const ids = new Set();
    for (const row of rows) {
      if (!row?.id) errors.push(`${label}:missing_id`);
      else if (ids.has(row.id)) errors.push(`${label}:duplicate:${row.id}`);
      ids.add(row.id);
    }
  };
  const validPoint = (p) => Array.isArray(p) && p.length >= 2 && p.slice(0, 2).every(Number.isFinite);
  const validPolygon = (shape, label) => {
    if (!Array.isArray(shape.points) || shape.points.length < 3) { errors.push(`${label}:too_few_points`); return; }
    if (!shape.points.every(validPoint)) errors.push(`${label}:non_finite_point`);
    else if (!isSimplePolygonV2140(shape.points)) errors.push(`${label}:self_intersection_or_degenerate_edge`);
    let twiceArea = 0;
    for (let i = 0; i < shape.points.length; i++) {
      const a = shape.points[i], b = shape.points[(i + 1) % shape.points.length];
      twiceArea += a[0] * b[1] - b[0] * a[1];
    }
    if (Math.abs(twiceArea) < 1) errors.push(`${label}:zero_area`);
  };
  unique(geometry.terrainFootprints, 'terrain_footprint');
  unique(geometry.dangerFrontiers, 'danger_frontier');
  unique(geometry.routes, 'route');
  unique(geometry.gateApproaches, 'gate_approach');
  unique(geometry.waterways, 'waterway');
  unique(geometry.waterBasins, 'water_basin');
  geometry.terrainFootprints.forEach((shape) => validPolygon(shape, `terrain:${shape.id}`));
  geometry.dangerFrontiers.forEach((shape) => validPolygon(shape, `frontier:${shape.id}`));
  const hasSpatialMetadata = (entity, label) => {
    if (![entity?.transform?.x, entity?.transform?.y, entity?.transform?.z, entity?.transform?.rotationRadians].every(Number.isFinite)) errors.push(`${label}:invalid_transform`);
    if (![entity?.dimensions?.length, entity?.dimensions?.width, entity?.dimensions?.height].every((value) => Number.isFinite(value) && value >= 0)) errors.push(`${label}:invalid_dimensions`);
    if (!entity?.material?.surface || !entity?.collision?.policy || !entity?.passability?.policy || !entity?.destructibility?.policy || typeof entity?.interaction?.enabled !== 'boolean') errors.push(`${label}:incomplete_spatial_contract`);
  };
  geometry.terrainFootprints.forEach((entity) => hasSpatialMetadata(entity, `terrain:${entity.id}`));
  geometry.dangerFrontiers.forEach((entity) => hasSpatialMetadata(entity, `frontier:${entity.id}`));
  for (const route of geometry.routes) {
    if (route.centerline.length < 2 || !route.centerline.every(validPoint)) errors.push(`route:${route.id}:invalid_centerline`);
    if (!(route.width > 0)) errors.push(`route:${route.id}:invalid_width`);
    hasSpatialMetadata(route, `route:${route.id}`);
  }
  for (const approach of geometry.gateApproaches) {
    if (![approach.gate, approach.inward, approach.control, approach.end].every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))) errors.push(`approach:${approach.id}:invalid_control_points`);
    if (!(approach.length > 0 && approach.corridorWidth > 0)) errors.push(`approach:${approach.id}:invalid_dimensions`);
    hasSpatialMetadata(approach, `approach:${approach.id}`);
  }
  for (const waterway of geometry.waterways) {
    if (waterway.points.length < 2 || !waterway.points.every(validPoint)) errors.push(`waterway:${waterway.id}:invalid_points`);
    if (!(waterway.width > 0)) errors.push(`waterway:${waterway.id}:invalid_width`);
    hasSpatialMetadata(waterway, `waterway:${waterway.id}`);
  }
  geometry.waterBasins.forEach((entity) => hasSpatialMetadata(entity, `basin:${entity.id}`));
  if (geometry.terrainFootprints.length !== 4) errors.push('expected_four_terrain_footprints');
  if (geometry.dangerFrontiers.length !== 6) errors.push('expected_six_danger_frontiers');
  if (geometry.routes.length !== 3) errors.push('expected_three_connector_routes');
  if (geometry.gateApproaches.length !== 10) errors.push('expected_ten_gate_approaches');
  if (geometry.waterways.length !== 2 || geometry.waterBasins.length !== 2) errors.push('water_geometry_count_mismatch');
  if (geometry.coordinateContract.metersPerUnit !== null) errors.push('legacy_units_must_remain_uncalibrated');
  if (geometry.placementGrid.isometricTerrainTile.width !== 200 || geometry.placementGrid.isometricTerrainTile.height !== 132) errors.push('terrain_tile_scale_drift');
  if (geometry.terrainFootprints.some((shape) => shape.semanticRole !== 'visual-terrain-footprint' || shape.collisionRole !== 'none-stage-03-only')) errors.push('terrain_footprint_collision_scope_drift');
  return Object.freeze({
    ok: errors.length === 0,
    version: 2140,
    stage: 3,
    errors: Object.freeze(errors),
    counts: Object.freeze({ terrainFootprints: geometry.terrainFootprints.length, dangerFrontiers: geometry.dangerFrontiers.length, routes: geometry.routes.length, gateApproaches: geometry.gateApproaches.length, waterways: geometry.waterways.length, waterBasins: geometry.waterBasins.length, terrainAssets: geometry.assetBindings.terrain.spriteCount })
  });
}

export function tracePolygonPathV2140(ctx, points) {
  if (!ctx || typeof ctx.beginPath !== 'function' || !Array.isArray(points) || points.length < 3) return false;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  return true;
}

if (typeof window !== 'undefined') {
  window.ETRANOM_WORLD_GEOMETRY_V2140 = ETRANOM_WORLD_GEOMETRY_V2140;
  window.ETRANOM_WORLD_GEOMETRY_AUDIT_V2140 = auditWorldGeometryV2140();
}
