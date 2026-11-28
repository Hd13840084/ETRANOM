// ETRANOM V2141 — Stage 4/24: authored building architecture contracts.
// Existing 27 authored PNGs remain the visual source. Logical dimensions are
// game units (not metres); physical colliders remain deliberately deferred to stage 19.

const deepFreeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
};

const COMMON = {
  coordinateSpace: 'V2138-logical-world-units',
  construction: 'dark-fantasy-medieval-masonry-and-timber',
  wallThicknessRatio: 0.075,
  floorHeightRatio: 0.92,
  foundation: 'raised-weathered-stone-plinth',
  roofMaterial: 'weathered-slate-or-treated-timber',
  door: { widthRatio: 0.20, heightRatio: 0.62, threshold: 'stone', interaction: 'existing-poi-interaction-preserved' },
  windows: { defaultCount: 2, glazing: 'smoked-glass-or-leaded-stained-glass', passable: false },
  collision: { policy: 'runtime-structural-footprint', collider: 'stage-19-live-polygon-aligned-to-v2100-ground-anchor', wallThickness: 'V2141-declared-wall-thickness' },
  navigation: 'existing-path-rules-unchanged-stage-06',
  interior: { supportedByExistingInteriorCatalog: true, roomGeometry: 'existing-interior-design-catalog' }
};

const DEFINITIONS = {
  online_player_market: ['market-hall', 2, 'steep-gabled-slate', 'dark-stone-and-aged-oak', 'stained-glass', 1.12, 1.05, 3],
  pvp_hall: ['fortified-arena-hall', 2, 'battlemented-gothic', 'reinforced-basalt', 'iron-leaded-glass', 1.18, 1.12, 4],
  inn: ['wayside-inn', 2, 'cross-gabled-slate', 'oak-timber-and-rubble-stone', 'warm-smoked-glass', 1.14, 1.08, 3],
  smith: ['forge-workshop', 1, 'chimney-gabled', 'blackened-stone-and-forged-iron', 'small-amber-slits', 1.18, 1.12, 2],
  guild: ['adventurers-guild', 2, 'twin-tower-gothic', 'dark-cut-stone', 'leaded-stained-glass', 1.2, 1.14, 5],
  alchemy: ['arcane-workshop', 2, 'steep-arcane-roof', 'basalt-and-aged-timber', 'violet-stained-glass', 1.12, 1.08, 3],
  enchanter_shop: ['enchanted-shop', 2, 'tall-gable', 'dark-timber-and-stone', 'violet-smoked-glass', 1.12, 1.08, 3],
  clinic: ['healers-hall', 2, 'gothic-chapel-roof', 'pale-weathered-stone', 'muted-teal-stained-glass', 1.16, 1.12, 4],
  guardhouse: ['watchtower', 3, 'towered-slate', 'fortress-stone-and-iron', 'narrow-watch-slits', 1.12, 1.08, 2],
  fire_temple: ['ancient-fire-shrine', 2, 'gothic-sanctum', 'soot-stained-stone', 'ember-stained-glass', 1.16, 1.1, 4],
  stable: ['stable-and-stalls', 1, 'long-low-gable', 'oak-timber-and-stone-footing', 'small-lantern-windows', 1.18, 1.14, 2],
  granary: ['granary', 2, 'vented-gable', 'aged-timber-and-stone', 'narrow-vent-slits', 1.14, 1.08, 2],
  grain_mill: ['windmill', 2, 'mill-cap-and-sails', 'weathered-timber-and-fieldstone', 'small-clear-glass', 1.2, 1.12, 3],
  grain_bakery: ['village-bakery', 1, 'thatch-and-slate-gable', 'timber-and-warm-stone', 'amber-window-glass', 1.14, 1.08, 2],
  grain_farmstead: ['farmstead', 1, 'thatched-gable', 'aged-oak-and-fieldstone', 'small-clear-glass', 1.16, 1.1, 2],
  grain_herbgarden: ['herbalist-glasshouse', 1, 'glasshouse-gable', 'timber-frame-and-weathered-glass', 'muted-green-glass', 1.18, 1.12, 2],
  grain_livestock: ['livestock-barn', 1, 'long-barn-gable', 'dark-timber-and-fieldstone', 'small-vent-windows', 1.2, 1.14, 2],
  rootwood_sawmill: ['forest-sawmill', 1, 'open-workshop-gable', 'rootbound-timber-and-stone', 'small-amber-glass', 1.2, 1.12, 2],
  rootwood_carpenter: ['carpenter-lodge', 2, 'crooked-forest-gable', 'ancient-oak-and-mossed-stone', 'warm-smoked-glass', 1.18, 1.12, 3],
  rootwood_herbalist: ['root-cottage', 1, 'organic-root-canopy', 'living-roots-and-dark-timber', 'faint-spectral-green-glass', 1.16, 1.1, 2],
  rootwood_hunters: ['hunters-lodge', 1, 'steep-forest-gable', 'rough-timber-and-mossed-stone', 'narrow-amber-glass', 1.16, 1.1, 2],
  rootwood_apiary: ['ancient-apiary', 1, 'mushroom-canopy', 'rootwood-and-organic-stone', 'soft-amber-glass', 1.18, 1.12, 2],
  iron_mine: ['mine-entrance', 1, 'reinforced-rock-portal', 'ironstone-and-forged-supports', 'lantern-lit-opening', 1.2, 1.14, 1],
  iron_smelter: ['smelting-foundry', 1, 'industrial-chimney-roof', 'blackened-stone-and-iron', 'ember-lit-furnace-slits', 1.2, 1.14, 2],
  iron_stonecutter: ['stonecutters-yard', 1, 'open-crane-workshop', 'quarried-stone-and-iron', 'minimal-openings', 1.18, 1.12, 1],
  iron_hall: ['miners-hall', 2, 'fortified-gable', 'ironstone-and-dark-oak', 'small-amber-glass', 1.18, 1.12, 3],
  iron_cartwright: ['cartwright-workshop', 1, 'broad-workshop-gable', 'weathered-oak-and-ironstone', 'small-clear-glass', 1.18, 1.12, 2]
};

export const ETRANOM_BUILDING_ARCHITECTURE_V2141 = deepFreeze(Object.fromEntries(
  Object.entries(DEFINITIONS).map(([id, [archetype, floors, roof, facade, glazing, spriteScale, footprintScale, windows]]) => [id, {
    id, ...COMMON,
    archetype, floors, roof,
    facadeMaterial: facade,
    roofMaterial: roof.includes('thatch') ? 'weathered-thatch-and-wood' : roof.includes('timber') ? 'aged-timber-shingles' : 'weathered-slate-and-dark-iron',
    glazing, spriteScale, footprintScale,
    windowLayout: { count: windows, placement: 'facade-authored-by-existing-sprite', sillHeightRatio: 0.48 },
    openings: { primaryDoor: true, windows, secondaryServiceDoor: ['stable','forge-workshop','forest-sawmill','smelting-foundry','stonecutters-yard','cartwright-workshop'].includes(archetype), windowPassability: 'blocked' },
    wall: { thicknessRatio: COMMON.wallThicknessRatio, material: facade, structuralRole: 'exterior-load-bearing-visual-contract' },
    roofStructure: { type: roof, overhangRatio: 0.08, walkable: false, occlusion: 'roof-fade-system-deferred-to-camera-visibility-pass' },
    interior: { ...COMMON.interior, type: floors > 1 ? 'multi-room-multi-floor' : 'single-floor-room-plan', floors },
    destruction: { default: 'non-destructible-structural-building', specialDamage: 'future-building-specific-gameplay-rule' },
    footprint: { lengthFromPoiWidth: footprintScale, depthFromPoiHeight: footprintScale * 0.78, shape: ['watchtower','windmill','mine-entrance'].includes(archetype) ? 'faceted' : 'isometric-rectangular', anchor: 'ground-contact-center' },
    elevation: { baseZ: 0, wallHeightInFloorRatios: floors * 1.0, roofHeightInFloorRatios: 0.55, calibration: 'logical-units-only-until-world-metric-calibration' }
  }])
));

export function getBuildingArchitectureV2141(id) {
  return ETRANOM_BUILDING_ARCHITECTURE_V2141[id] || null;
}

export function resolveBuildingDimensionsV2141(poi) {
  if (!poi || !Number.isFinite(Number(poi.w)) || !Number.isFinite(Number(poi.h)) || Number(poi.w) <= 0 || Number(poi.h) <= 0) return null;
  const spec = getBuildingArchitectureV2141(poi.id);
  if (!spec) return null;
  const width = Math.max(1, Number(poi.w));
  const height = Math.max(1, Number(poi.h));
  return Object.freeze({
    length: Math.round(width * spec.footprint.lengthFromPoiWidth * 100) / 100,
    depth: Math.round(height * spec.footprint.depthFromPoiHeight * 100) / 100,
    wallThickness: Math.round(Math.min(width, height) * spec.wall.thicknessRatio * 100) / 100,
    wallHeight: Math.round(height * spec.elevation.wallHeightInFloorRatios * 100) / 100,
    roofHeight: Math.round(height * spec.elevation.roofHeightInFloorRatios * 100) / 100,
    floors: spec.floors,
    spriteWidth: Math.round(width * spec.spriteScale * 100) / 100
  });
}

export function auditBuildingArchitectureV2141(buildingIds = Object.keys(ETRANOM_BUILDING_ARCHITECTURE_V2141)) {
  const errors = [];
  const ids = new Set();
  for (const id of buildingIds) {
    if (ids.has(id)) errors.push(`duplicate:${id}`);
    ids.add(id);
    const spec = getBuildingArchitectureV2141(id);
    if (!spec) { errors.push(`missing:${id}`); continue; }
    if (!(spec.floors >= 1 && spec.floors <= 5)) errors.push(`invalid_floors:${id}`);
    if (!(spec.wall.thicknessRatio > 0 && spec.wall.thicknessRatio < 0.2)) errors.push(`invalid_wall_thickness:${id}`);
    if (!(spec.spriteScale >= 0.8 && spec.spriteScale <= 1.5)) errors.push(`invalid_sprite_scale:${id}`);
    if (!spec.roof || !spec.facadeMaterial || !spec.foundation || !spec.openings.primaryDoor) errors.push(`incomplete_architecture:${id}`);
    if (spec.collision.collider !== 'stage-19-live-polygon-aligned-to-v2100-ground-anchor') errors.push(`collision_scope_changed:${id}`);
  }
  return Object.freeze({ ok: errors.length === 0 && buildingIds.length === 27, version: 2141, stage: 4, count: buildingIds.length, errors: Object.freeze(errors), collisionImplementation: 'stage-19-live-polygon-aligned-to-render-ground-anchor', navigationImplementation: 'deferred-stage-06' });
}

if (typeof window !== 'undefined') {
  window.ETRANOM_BUILDING_ARCHITECTURE_V2141 = ETRANOM_BUILDING_ARCHITECTURE_V2141;
  window.ETRANOM_BUILDING_ARCHITECTURE_AUDIT_V2141 = auditBuildingArchitectureV2141();
}
