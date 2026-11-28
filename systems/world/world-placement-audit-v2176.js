// ETRANOM V2176 — Stage 32: world placement and scale audit.
// Checks authored logical-world geometry; it does not silently relocate runtime objects.
const finite = value => Number.isFinite(Number(value));
const inside = (x, y, bounds) => finite(x) && finite(y) &&
  Number(x) >= bounds.minX && Number(x) <= bounds.maxX &&
  Number(y) >= bounds.minY && Number(y) <= bounds.maxY;
const rectOf = b => ({
  left: Number(b.x) - Number(b.w) / 2,
  right: Number(b.x) + Number(b.w) / 2,
  top: Number(b.y) - Number(b.h) / 2,
  bottom: Number(b.y) + Number(b.h) / 2
});
const intersects = (a, b, epsilon = 0.01) =>
  Math.min(a.right, b.right) - Math.max(a.left, b.left) > epsilon &&
  Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > epsilon;

export function auditWorldPlacementV2176({
  buildings = [], npcs = [], trees = [], understory = [], vehicles = [], roads = [],
  yardProps = [], authoredProps = [], environmentalProps = [],
  bounds = { minX: -900, minY: 35, maxX: 8965, maxY: 6865 },
  logicalUnitsPerMeter = 40,
  player = { heightUnits: 72, collisionDiameterUnits: 22 },
  door = { clearWidthUnits: 30, clearHeightUnits: 80 }
} = {}) {
  const errors = [], warnings = [];
  const checkIds = (items, kind) => {
    const seen = new Set();
    for (const item of items) {
      if (!item?.id) errors.push(`${kind}:missing-id`);
      else if (seen.has(item.id)) errors.push(`${kind}:duplicate-id:${item.id}`);
      else seen.add(item.id);
    }
  };
  checkIds(buildings, 'building'); checkIds(npcs, 'npc');
  checkIds(trees, 'tree'); checkIds(vehicles, 'vehicle'); checkIds(roads, 'road');

  for (const b of buildings) {
    if (![b.x, b.y, b.w, b.h].every(finite) || !(Number(b.w) > 0 && Number(b.h) > 0)) {
      errors.push(`building:invalid-footprint:${b.id || 'unknown'}`); continue;
    }
    const r = rectOf(b);
    if (!inside(r.left, r.top, bounds) || !inside(r.right, r.bottom, bounds))
      errors.push(`building:outside-world-bounds:${b.id}`);
  }
  const validBuildings = buildings.filter(b => [b.x,b.y,b.w,b.h].every(finite) && b.w > 0 && b.h > 0);
  const buildingOverlaps = [];
  for (let i = 0; i < validBuildings.length; i++) {
    for (let j = i + 1; j < validBuildings.length; j++) {
      const a = validBuildings[i], b = validBuildings[j];
      const ra = rectOf(a), rb = rectOf(b);
      if (intersects(ra, rb)) {
        const overlapX = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
        const overlapY = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
        buildingOverlaps.push({ first: a.id, second: b.id, overlapUnits: { x: Number(overlapX.toFixed(2)), y: Number(overlapY.toFixed(2)) } });
        errors.push(`building:footprint-overlap:${a.id}:${b.id}`);
      }
    }
  }

  const groundPlacementConflicts = [];
  const checkGroundPlacements = (items, kind) => {
    items.forEach((item, index) => {
      const id = item.id || item.asset || `${kind}-${index + 1}`;
      if (![item.x, item.y, item.width].every(finite) || !(Number(item.width) > 0)) {
        errors.push(`${kind}:invalid-anchor-or-size:${id}`); return;
      }
      if (!inside(item.x, item.y, bounds)) errors.push(`${kind}:outside-world-bounds:${id}`);
      for (const b of validBuildings) {
        const r = rectOf(b);
        if (Number(item.x) > r.left && Number(item.x) < r.right && Number(item.y) > r.top && Number(item.y) < r.bottom) {
          groundPlacementConflicts.push({ kind, item: id, building: b.id });
          errors.push(`${kind}:anchor-inside-building:${id}:${b.id}`);
        }
      }
    });
  };
  checkGroundPlacements(understory, 'understory');
  checkGroundPlacements(yardProps, 'yard-prop');
  checkGroundPlacements(authoredProps, 'authored-prop');
  checkGroundPlacements(environmentalProps, 'environment-prop');

  for (const n of npcs) {
    if (![n.x, n.y].every(finite)) errors.push(`npc:invalid-position:${n.id || 'unknown'}`);
    else if (!inside(n.x, n.y, bounds)) errors.push(`npc:outside-world-bounds:${n.id}`);
    if (!n.zone) warnings.push(`npc:missing-zone:${n.id || 'unknown'}`);
  }

  const treeBuildingConflicts = [];
  for (const t of trees) {
    if (![t.x, t.y, t.width].every(finite) || !(Number(t.width) > 0)) {
      errors.push(`tree:invalid-anchor-or-size:${t.id || 'unknown'}`); continue;
    }
    if (!inside(t.x, t.y, bounds)) errors.push(`tree:outside-world-bounds:${t.id}`);
    for (const b of validBuildings) {
      const r = rectOf(b);
      if (Number(t.x) > r.left && Number(t.x) < r.right && Number(t.y) > r.top && Number(t.y) < r.bottom) {
        treeBuildingConflicts.push({ tree: t.id, building: b.id });
        errors.push(`tree:trunk-anchor-inside-building:${t.id}:${b.id}`);
      }
    }
  }

  const vehicleBuildingConflicts = [];
  for (const v of vehicles) {
    if (![v.x, v.y, v.width, v.length].every(finite) || !(Number(v.width) > 0 && Number(v.length) > 0)) {
      errors.push(`vehicle:invalid-footprint:${v.id || 'unknown'}`); continue;
    }
    if (!inside(v.x, v.y, bounds)) errors.push(`vehicle:outside-world-bounds:${v.id}`);
    const angle = Number(v.rotationRadians) || 0;
    const hx = (Math.abs(Math.cos(angle)) * Number(v.width) + Math.abs(Math.sin(angle)) * Number(v.length)) / 2;
    const hy = (Math.abs(Math.sin(angle)) * Number(v.width) + Math.abs(Math.cos(angle)) * Number(v.length)) / 2;
    const vr = { left: Number(v.x)-hx, right: Number(v.x)+hx, top: Number(v.y)-hy, bottom: Number(v.y)+hy };
    for (const b of validBuildings) {
      if (intersects(vr, rectOf(b))) {
        vehicleBuildingConflicts.push({ vehicle: v.id, building: b.id });
        errors.push(`vehicle:footprint-overlaps-building:${v.id}:${b.id}`);
      }
    }
  }

  let roadPointCount = 0;
  const roadWidths = [];
  for (const r of roads) {
    if (!finite(r.width) || !(Number(r.width) > 0) || !Array.isArray(r.points) || r.points.length < 2) {
      errors.push(`road:invalid-geometry:${r.id || 'unknown'}`); continue;
    }
    roadWidths.push(Number(r.width) / Math.max(1, Number(logicalUnitsPerMeter) || 40));
    if (Number(r.width) < 48 || Number(r.width) > 120) errors.push(`road:implausible-physical-width:${r.id}`);
    for (const p of r.points) {
      if (!Array.isArray(p) || p.length < 2 || !p.every(finite)) errors.push(`road:invalid-point:${r.id}`);
      else { roadPointCount++; if (!inside(p[0], p[1], bounds)) warnings.push(`road:point-outside-world-bounds:${r.id}`); }
    }
  }

  if (!(Number(logicalUnitsPerMeter) > 0)) errors.push('scale:invalid-units-per-meter');
  if (!(Number(door.clearWidthUnits) >= Number(player.collisionDiameterUnits))) errors.push('scale:door-narrower-than-player-collision');
  if (!(Number(door.clearHeightUnits) >= Number(player.heightUnits))) errors.push('scale:door-lower-than-player-reference');

  const widthMeters = validBuildings.map(b => Number(b.w) / logicalUnitsPerMeter);
  const heightMeters = validBuildings.map(b => Number(b.h) / logicalUnitsPerMeter);
  const minMax = values => values.length ? { min: Number(Math.min(...values).toFixed(2)), max: Number(Math.max(...values).toFixed(2)) } : { min: 0, max: 0 };
  return Object.freeze({
    ok: errors.length === 0,
    version: 2176,
    counts: Object.freeze({ buildings: buildings.length, npcs: npcs.length, trees: trees.length, understory: understory.length, yardProps: yardProps.length, authoredProps: authoredProps.length, environmentalProps: environmentalProps.length, vehicles: vehicles.length, roads: roads.length, roadPoints: roadPointCount }),
    scale: Object.freeze({ logicalUnitsPerMeter, playerHeightMeters: Number((player.heightUnits/logicalUnitsPerMeter).toFixed(2)), doorClearWidthMeters: Number((door.clearWidthUnits/logicalUnitsPerMeter).toFixed(2)), doorClearHeightMeters: Number((door.clearHeightUnits/logicalUnitsPerMeter).toFixed(2)), buildingWidthMeters: minMax(widthMeters), buildingHeightMeters: minMax(heightMeters), roadWidthMeters: minMax(roadWidths) }),
    conflicts: Object.freeze({ buildingOverlaps: Object.freeze(buildingOverlaps), treeBuildingAnchors: Object.freeze(treeBuildingConflicts), vehicleBuildingFootprints: Object.freeze(vehicleBuildingConflicts), groundPlacementAnchors: Object.freeze(groundPlacementConflicts) }),
    errors: Object.freeze(errors), warnings: Object.freeze(warnings)
  });
}
