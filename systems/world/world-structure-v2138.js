// ETRANOM V2138 — canonical world structure foundation (Stage 1/24).
// This module centralizes the existing map coordinate contract without changing
// movement, collision, combat, region unlocks, saves, or authored environment art.

const deepFreeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
};

export const ETRANOM_WORLD_STRUCTURE_V2138 = deepFreeze({
  version: 2138,
  stage: 1,
  stageName: 'World Structure',
  worldId: 'starting_world',
  coordinateSystem: {
    kind: 'logical-world-plane',
    axes: { x: 'east-west logical axis', y: 'north-south logical axis' },
    units: 'world-unit',
    metersPerUnit: null,
    metersPerUnitStatus: 'not-calibrated',
    gridStep: 64,
    gridStepPurpose: 'existing ground-detail / placement cadence; not a claim of 64 metres',
    origin: { x: 0, y: 0 },
    note: 'World units are legacy logical coordinates. Do not describe them as metres until the player/building art scale is measured and calibrated.'
  },
  dimensions: {
    width: 9000,
    height: 6900,
    viewport: { width: 720, height: 650 },
    runtimeBounds: { minX: -900, minY: 35, maxX: 8965, maxY: 6865 },
    cameraBounds: { minX: -900, minY: 0, maxX: 8280, maxY: 6250 },
    cameraAnchor: { x: 360, y: 325 },
    playerSpawn: { x: 1500, y: 1050 }
  },
  projection: {
    type: 'orthographic-overhead-three-quarter',
    matrix: { a: 0.96, b: 0, c: 0, d: 0.82 },
    axisXScreenVector: { x: 0.96, y: 0 },
    axisYScreenVector: { x: 0, y: 0.82 },
    fixedProjection: true,
    perspective: false,
    note: 'Stage 29 replaces the diamond projection with a close orthographic three-quarter view: streets run horizontally and vertically while the vertical axis is softly compressed.'
  },
  regions: {
    safeWorld: {
      id: 'starting_region',
      label: 'منطقه امن آغازین',
      settlements: [
        { id: 'city', nodeId: 'settlement_ash_city', name: 'شهر خاکستر', cx: 1500, cy: 1050, rx: 760, ry: 690, theme: 'stone' },
        { id: 'grain', nodeId: 'village_grain', name: 'آبادی کشتزار', cx: 490, cy: 800, rx: 520, ry: 520, theme: 'harvest' },
        { id: 'rootwood', nodeId: 'village_rootwood', name: 'آبادی ریشه‌چوب', cx: 2480, cy: 900, rx: 570, ry: 500, theme: 'woodland' },
        { id: 'ironhollow', nodeId: 'village_ironhollow', name: 'آبادی سنگ‌آهن', cx: 1900, cy: 2140, rx: 560, ry: 470, theme: 'mountain' }
      ],
      perimeterGates: [
        { id: 'gate_nw', name: 'گذرگاه شمال‌غرب', x: 420, y: 70, side: 'north' },
        { id: 'gate_n', name: 'گذرگاه شمالی', x: 1500, y: 70, side: 'north' },
        { id: 'gate_ne', name: 'گذرگاه شمال‌شرق', x: 2580, y: 70, side: 'north' },
        { id: 'gate_e1', name: 'گذرگاه شرقی بالا', x: 2930, y: 520, side: 'east' },
        { id: 'gate_e2', name: 'گذرگاه شرقی پایین', x: 2930, y: 1690, side: 'east' },
        { id: 'gate_se', name: 'گذرگاه جنوب‌شرق', x: 2580, y: 2230, side: 'south' },
        { id: 'gate_s', name: 'گذرگاه جنوبی', x: 1500, y: 2230, side: 'south' },
        { id: 'gate_sw', name: 'گذرگاه جنوب‌غرب', x: 420, y: 2230, side: 'south' },
        { id: 'gate_w2', name: 'گذرگاه غربی پایین', x: 70, y: 1690, side: 'west' },
        { id: 'gate_w1', name: 'گذرگاه غربی بالا', x: 70, y: 520, side: 'west' }
      ],
      landmarks: [
        { id: 'sunbridge', name: 'پل آفتاب', x: 1050, y: 260, kind: 'bridge', note: 'پل سنگی که مسیر شمالی رود را به راه کشتزار پیوند می‌دهد.' },
        { id: 'windrise', name: 'تپه بادآسیاب', x: 820, y: 930, kind: 'windmill', note: 'تپه‌ای آرام با چشم‌انداز دشت‌های طلایی.' },
        { id: 'wayfarer_camp', name: 'پناهگاه رهگذران', x: 1120, y: 1640, kind: 'camp', note: 'ساختمان سنگی قدیمی در کنار مسیر جنوبی شهر.' },
        { id: 'willow_bank', name: 'کناره بیدها', x: 2070, y: 300, kind: 'river', note: 'ساحل کم‌عمق و امن رود با چند درخت بید.' },
        { id: 'old_memorial', name: 'یادمان نگهبانان', x: 2130, y: 1510, kind: 'memorial', note: 'سنگ‌نوشته‌ای برای نگهبانانی که راه‌های آبادی را امن کردند.' },
        { id: 'lookout_hill', name: 'بلندای دیده‌بان', x: 2700, y: 1110, kind: 'lookout', note: 'برآمدگی سنگی با دید باز به جنگل و جاده شرقی.' },
        { id: 'apple_orchard', name: 'باغ سپید', x: 330, y: 1050, kind: 'orchard', note: 'باغی آرام با درختان کهنسال در حاشیه شهر.' },
        { id: 'quiet_circle', name: 'حلقه سنگ‌های خاموش', x: 900, y: 1900, kind: 'stones', note: 'چند سنگ کهن در دشتی بی‌خطر؛ کسی از سازنده آن‌ها خبر ندارد.' }
      ],
      // These footprints intentionally keep the legacy first-match lookup order.
      // Their rectangular influence areas overlap; they are settlement regions,
      // not hard physical walls or mutually-exclusive polygon borders.
      footprintMode: 'ordered-soft-rectangles',
      overlapAllowed: true
    },
    dangerFrontiers: [
      { id: 'southern_plains', name: 'دشت جنوبی', entry: 'گذرگاه علفزار', entryPoint: [-735, 1190], points: [[-920, 1050], [-830, 1038], [-735, 1060], [-645, 1090], [-570, 1148], [-555, 1228], [-610, 1308], [-720, 1342], [-840, 1325], [-910, 1260]] },
      { id: 'thorn_grove', name: 'بیشه خارزار', entry: 'گذرگاه خارهای سیاه', entryPoint: [-735, 1815], points: [[-910, 1660], [-830, 1638], [-730, 1650], [-640, 1690], [-570, 1760], [-555, 1850], [-620, 1935], [-740, 1980], [-850, 1955], [-920, 1875]] },
      { id: 'ash_hills', name: 'تپه‌های خاکستر', entry: 'شیب سنگستر', entryPoint: [-720, 1505], points: [[-900, 1350], [-760, 1350], [-600, 1380], [-550, 1505], [-600, 1630], [-760, 1660], [-900, 1660]] },
      { id: 'vardash_river', name: 'رود ورداش', entry: 'پل چوبی ورداش', entryPoint: [-350, 1505], points: [[-550, 1350], [-400, 1350], [-200, 1350], [-200, 1660], [-400, 1660], [-550, 1630], [-600, 1505]] },
      { id: 'burnt_forest', name: 'جنگل سوخته', entry: 'دروازه خاکسترزار', entryPoint: [-350, 1200], points: [[-550, 1050], [-400, 1050], [-200, 1050], [-200, 1350], [-400, 1350], [-530, 1320], [-550, 1180]] },
      { id: 'rootbound_ruins', name: 'ویرانه‌های ریشه‌پوش', entry: 'دروازه ریشه‌بسته', entryPoint: [-350, 1815], points: [[-550, 1660], [-400, 1660], [-200, 1660], [-200, 1970], [-400, 1970], [-550, 1920], [-580, 1780]] }
    ]
  },
  routeLinks: [
    { id: 'capital_to_farmland', from: 'city', to: 'grain', points: [[1390, 1110], [1190, 1050], [1000, 970], [820, 900], [650, 845], [490, 800]], width: 24, surface: 'packed-earth' },
    { id: 'capital_to_rootwood', from: 'city', to: 'rootwood', points: [[1600, 1030], [1780, 970], [1960, 930], [2150, 910], [2320, 900], [2480, 900]], width: 25, surface: 'forest-track' },
    { id: 'capital_to_ironstone', from: 'city', to: 'ironhollow', points: [[1510, 1250], [1580, 1430], [1660, 1600], [1740, 1770], [1830, 1950], [1900, 2140]], width: 27, surface: 'stone-track' }
  ],
  environmentDomains: [
    'residential-buildings', 'commercial-buildings', 'civic-buildings', 'roads', 'alleys',
    'public-squares', 'parks', 'sidewalks', 'curbs', 'walls', 'fences', 'bridges',
    'stairs', 'ramps', 'parking-areas', 'vegetation', 'vehicles', 'street-furniture',
    'water-channels', 'ruins', 'interior-spaces'
  ],
  worldLayers: [
    'base-terrain', 'terrain-relief', 'water-and-shorelines', 'road-surfaces',
    'curbs-and-path-edges', 'static-structure-masses', 'building-yards-and-fences',
    'background-props', 'ambient-actors', 'local-player', 'foreground-props',
    'foreground-structure-details', 'atmosphere-and-weather'
  ]
});

export const WORLD_PROJECTION_MATRIX_V2138 = ETRANOM_WORLD_STRUCTURE_V2138.projection.matrix;
export const WORLD_DIMENSIONS_V2138 = ETRANOM_WORLD_STRUCTURE_V2138.dimensions;

export function isWorldPositionInBoundsV2138(x, y, bounds = WORLD_DIMENSIONS_V2138.runtimeBounds) {
  const px = Number(x), py = Number(y);
  return Number.isFinite(px) && Number.isFinite(py) &&
    px >= bounds.minX && py >= bounds.minY && px <= bounds.maxX && py <= bounds.maxY;
}

export function resolveSafeSettlementV2138(x, y) {
  const px = Number(x), py = Number(y);
  if (!Number.isFinite(px) || !Number.isFinite(py)) return null;
  return ETRANOM_WORLD_STRUCTURE_V2138.regions.safeWorld.settlements.find(zone =>
    Math.abs(px - zone.cx) < zone.rx && Math.abs(py - zone.cy) < zone.ry
  ) || null;
}

export function worldToScreenV2138(worldX, worldY, cameraX, cameraY) {
  const { a, b, c, d } = WORLD_PROJECTION_MATRIX_V2138;
  const { x: anchorX, y: anchorY } = WORLD_DIMENSIONS_V2138.cameraAnchor;
  const dx = Number(worldX) - Number(cameraX), dy = Number(worldY) - Number(cameraY);
  return { x: anchorX + a * dx + c * dy, y: anchorY + b * dx + d * dy };
}

export function screenDeltaToWorldV2138(screenDX, screenDY) {
  const { a, b, c, d } = WORLD_PROJECTION_MATRIX_V2138;
  const det = a * d - b * c;
  if (!Number.isFinite(det) || Math.abs(det) < 1e-9) return { x: 0, y: 0 };
  const sx = Number(screenDX), sy = Number(screenDY);
  return { x: (d * sx - c * sy) / det, y: (-b * sx + a * sy) / det };
}

export function auditWorldStructureV2138() {
  const world = ETRANOM_WORLD_STRUCTURE_V2138;
  const errors = [];
  const ids = (rows, label) => {
    const seen = new Set();
    for (const row of rows) {
      if (!row?.id) errors.push(`${label}:missing_id`);
      else if (seen.has(row.id)) errors.push(`${label}:duplicate:${row.id}`);
      else seen.add(row.id);
    }
  };
  if (!(world.dimensions.width > 0 && world.dimensions.height > 0)) errors.push('invalid_world_dimensions');
  if (!(world.dimensions.viewport.width > 0 && world.dimensions.viewport.height > 0)) errors.push('invalid_viewport');
  if (!(world.coordinateSystem.gridStep > 0)) errors.push('invalid_grid_step');
  const settlements = world.regions.safeWorld.settlements;
  ids(settlements, 'settlement');
  ids(world.regions.safeWorld.perimeterGates, 'perimeter_gate');
  ids(world.regions.safeWorld.landmarks, 'landmark');
  ids(world.regions.dangerFrontiers, 'danger_frontier');
  ids(world.routeLinks, 'route');
  for (const zone of settlements) {
    if (![zone.cx, zone.cy, zone.rx, zone.ry].every(Number.isFinite) || zone.rx <= 0 || zone.ry <= 0) errors.push(`invalid_settlement_geometry:${zone.id}`);
  }
  for (const route of world.routeLinks) {
    if (!Array.isArray(route.points) || route.points.length < 2 || route.points.some(p => !Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite))) errors.push(`invalid_route_geometry:${route.id}`);
  }
  for (const frontier of world.regions.dangerFrontiers) {
    if (!Array.isArray(frontier.points) || frontier.points.length < 3 || frontier.points.some(p => !Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite))) errors.push(`invalid_frontier_polygon:${frontier.id}`);
    if (!Array.isArray(frontier.entryPoint) || frontier.entryPoint.length !== 2 || !frontier.entryPoint.every(Number.isFinite)) errors.push(`invalid_frontier_entry:${frontier.id}`);
  }
  return Object.freeze({
    ok: errors.length === 0,
    version: world.version,
    worldId: world.worldId,
    settlements: settlements.length,
    perimeterGates: world.regions.safeWorld.perimeterGates.length,
    landmarks: world.regions.safeWorld.landmarks.length,
    dangerFrontiers: world.regions.dangerFrontiers.length,
    routeLinks: world.routeLinks.length,
    environmentDomains: world.environmentDomains.length,
    worldLayers: world.worldLayers.length,
    errors: Object.freeze(errors)
  });
}

if (typeof window !== 'undefined') {
  window.ETRANOM_WORLD_STRUCTURE_V2138 = ETRANOM_WORLD_STRUCTURE_V2138;
  window.ETRANOM_WORLD_STRUCTURE_AUDIT_V2138 = auditWorldStructureV2138();
}
