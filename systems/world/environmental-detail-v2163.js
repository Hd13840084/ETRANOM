// ETRANOM V2163 — Stage 21/24: Environmental Detail.
// Deterministic, viewport-culled micro-detail for authored buildings, roads, paths,
// waterways, vegetation and props. All marks are visual decals: no collision/body,
// navigation, interaction, save-state or world-coordinate changes are introduced.
import { ETRANOM_WORLD_GEOMETRY_V2140, distanceToPolylineV2140 } from './world-geometry-v2140.js?v=2163';
import { ETRANOM_ROAD_SYSTEM_V2142 } from './road-system-v2142.js?v=2163';
import { ETRANOM_PATH_SYSTEM_V2143 } from './path-system-v2143.js?v=2163';
import { ETRANOM_TREES_VEGETATION_V2148 } from '../safe-zone/trees-vegetation-v2148.js?v=2163';
import { ENVIRONMENTAL_PROPS_V2147 } from '../safe-zone/environmental-props-v2147.js?v=2163';
import { ETRANOM_AUTHORED_SAFE_WORLD_PROP_PLACEMENTS_V2137 } from '../safe-zone/authored-props-v2137.js?v=2163';
import { resolveBuildingContactFootprintV2162 } from './visual-physical-consistency-v2162.js?v=2163';
import { resolveTerrainSurfaceV2146 } from './terrain-topography-v2146.js?v=2163';

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const finite = (...v) => v.every(Number.isFinite);
const fract = n => n - Math.floor(n);
function hashUnit(a, b, salt = 0) {
  const v = Math.sin(Number(a) * 127.1 + Number(b) * 311.7 + Number(salt) * 74.7 + 2163.19) * 43758.5453123;
  return fract(v);
}
function distPointSegment(x, y, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], d2 = dx * dx + dy * dy || 1;
  const t = clamp(((x - a[0]) * dx + (y - a[1]) * dy) / d2, 0, 1);
  return Math.hypot(x - a[0] - dx * t, y - a[1] - dy * t);
}
function pushAnchor(rows, id, x, y, kind, scale = 1, meta = {}) {
  if (!finite(Number(x), Number(y), Number(scale)) || scale <= 0) return;
  rows.push(Object.freeze({ id, x: Number(x), y: Number(y), kind, scale, ...meta, collision: 'none-visual-decal-only', interaction: false }));
}
function sampleLine(points, spacing, callback) {
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i], dx = b[0] - a[0], dy = b[1] - a[1];
    const length = Math.hypot(dx, dy);
    const count = Math.max(1, Math.floor(length / spacing));
    const nx = length ? -dy / length : 0, ny = length ? dx / length : 1;
    for (let j = 1; j < count; j++) {
      const t = j / count, x = a[0] + dx * t, y = a[1] + dy * t;
      callback(x, y, nx, ny, i, j);
    }
  }
}

const REGION_BOUNDS = Object.freeze([
  Object.freeze({ id: 'ashen_city', minX: 760, maxX: 2400, minY: 480, maxY: 1690 }),
  Object.freeze({ id: 'farmland', minX: -50, maxX: 1100, minY: 300, maxY: 1510 }),
  Object.freeze({ id: 'rootwood', minX: 1810, maxX: 3140, minY: 380, maxY: 1660 }),
  Object.freeze({ id: 'ironstone', minX: 1190, maxX: 2790, minY: 1580, maxY: 2910 })
]);
function regionAt(x, y) {
  // Prefer the tightest authored settlement box where map areas overlap.
  const matches = REGION_BOUNDS.filter(r => x >= r.minX && x <= r.maxX && y >= r.minY && y <= r.maxY);
  if (matches.length === 1) return matches[0].id;
  if (matches.length > 1) return matches.sort((a, b) => (a.maxX-a.minX)*(a.maxY-a.minY) - (b.maxX-b.minX)*(b.maxY-b.minY))[0].id;
  return 'frontier';
}

/** Static detail anchors derived from the exact Stage 4/9/10/11/5/6 placements. */
export function buildEnvironmentalDetailRegistryV2163({ buildings = [] } = {}) {
  const foundation = [], roots = [], propBases = [], routeMarks = [], bankMarks = [];
  for (const building of buildings) {
    const footprint = resolveBuildingContactFootprintV2162(building);
    if (!footprint) continue;
    footprint.points.forEach(([x, y], index) => {
      const dx = x - footprint.anchor.x, dy = y - footprint.anchor.y, len = Math.hypot(dx, dy) || 1;
      // Small worn stones sit just outside the footprint. The structure sprite itself remains untouched.
      for (let k = 0; k < 2; k++) {
        const offset = 5 + k * 5;
        pushAnchor(foundation, `${building.id}:foundation:${index}:${k}`, x + dx / len * offset, y + dy / len * offset,
          'foundation-chip', 0.75 + k * 0.18, { buildingId: building.id, edge: index });
      }
    });
  }
  for (const tree of ETRANOM_TREES_VEGETATION_V2148.trees) {
    const rootCount = 2 + Math.floor(hashUnit(tree.x, tree.y, 1) * 2);
    for (let i = 0; i < rootCount; i++) {
      const angle = hashUnit(tree.x, tree.y, i + 10) * Math.PI * 2;
      const radius = Math.max(8, Number(tree.width || 80) * (0.10 + hashUnit(tree.x, tree.y, i + 30) * 0.08));
      pushAnchor(roots, `${tree.id}:root:${i}`, tree.x + Math.cos(angle) * radius, tree.y + Math.sin(angle) * radius * 0.48,
        'root-moss', Math.max(.55, Number(tree.width || 80) / 100), { treeId: tree.id, biome: tree.biome });
    }
  }
  for (const prop of ENVIRONMENTAL_PROPS_V2147.placements) {
    pushAnchor(propBases, `environment:${prop.asset}:${prop.x}:${prop.y}`, prop.x, prop.y, 'prop-ground-wear', clamp(prop.width / 100, .5, 1.5), { asset: prop.asset, category: prop.category, region: prop.region });
  }
  for (const prop of ETRANOM_AUTHORED_SAFE_WORLD_PROP_PLACEMENTS_V2137) {
    pushAnchor(propBases, `authored:${prop.id}:${prop.x}:${prop.y}`, prop.x, prop.y, 'prop-ground-wear', clamp(prop.width / 110, .5, 1.5), { asset: `${prop.id}.png`, region: regionAt(prop.x, prop.y) });
  }
  for (const road of ETRANOM_ROAD_SYSTEM_V2142.roads) {
    sampleLine(road.centerline, 64, (x, y, nx, ny, seg, index) => {
      for (const side of [-1, 1]) pushAnchor(routeMarks, `${road.id}:shoulder:${seg}:${index}:${side}`, x + nx * (road.carriagewayWidth * .52 + 4), y + ny * (road.carriagewayWidth * .52 + 4), 'road-shoulder-grit', .8, { routeId: road.id, side });
    });
  }
  for (const corridor of ETRANOM_PATH_SYSTEM_V2143.corridors.filter(c => c.kind === 'landmark-footpath' || c.kind === 'gate-approach')) {
    sampleLine(corridor.points, 58, (x, y, nx, ny, seg, index) => {
      const offset = corridor.width * .5 + 2;
      pushAnchor(routeMarks, `${corridor.id}:edge:${seg}:${index}`, x + nx * offset, y + ny * offset, 'path-edge-pebble', .7, { corridorId: corridor.id });
    });
  }
  for (const waterway of ETRANOM_WORLD_GEOMETRY_V2140.waterways) {
    sampleLine(waterway.points, 24, (x, y, nx, ny, seg, index) => {
      const bank = waterway.width * .5 + 12;
      for (const side of [-1, 1]) pushAnchor(bankMarks, `${waterway.id}:bank:${seg}:${index}:${side}`, x + nx * bank * side, y + ny * bank * side,
        'waterbank-pebble', .65 + hashUnit(x, y, side) * .45, { waterwayId: waterway.id, side });
    });
  }
  const groups = Object.freeze({ foundation, roots, propBases, routeMarks, bankMarks });
  const all = Object.freeze(Object.values(groups).flat());
  const uniqueIds = new Set(all.map(row => row.id));
  const valid = uniqueIds.size === all.length && all.every(row => finite(row.x, row.y, row.scale) && row.scale > 0 && row.collision === 'none-visual-decal-only' && row.interaction === false);
  return Object.freeze({ version: 2163, stage: 21, groups, anchors: all, counts: Object.freeze(Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length]))), total: all.length, valid });
}

function detailPalette(season, region) {
  const palettes = {
    spring: { ground: '#8a956d', accent: '#c5b77d', leaf: '#c9a1a7', stone: '#aaa18f', snow: '#e7edf0' },
    summer: { ground: '#80765a', accent: '#b39a65', leaf: '#8d875b', stone: '#aaa08b', snow: '#e7edf0' },
    autumn: { ground: '#78634d', accent: '#b78955', leaf: '#bb7742', stone: '#a79a87', snow: '#e7edf0' },
    winter: { ground: '#59636a', accent: '#aab8c1', leaf: '#d7e1e8', stone: '#b3c0c7', snow: '#f4f8fb' }
  };
  const p = palettes[season] || palettes.summer;
  if (region === 'rootwood') return { ...p, ground: season === 'winter' ? '#58636a' : '#4f5b45', accent: season === 'winter' ? '#c4d1d8' : '#77845a' };
  if (region === 'ironstone') return { ...p, ground: season === 'winter' ? '#68727b' : '#615f58', accent: season === 'winter' ? '#d1dce5' : '#9a8d77' };
  if (region === 'farmland') return { ...p, ground: season === 'winter' ? '#727c7d' : '#76694c', accent: season === 'winter' ? '#e2e9eb' : '#b0a16b' };
  return p;
}

/** Build a bounded, repeatable micro-detail sample set for one camera window. */
export function buildGroundDetailSamplesV2163({ left = 0, top = 0, right = 900, bottom = 760, season = 'summer', weather = {}, step = 54, maxSamples = 560 } = {}) {
  const bounds = [left, top, right, bottom].map(Number);
  if (!finite(...bounds) || right <= left || bottom <= top) return Object.freeze([]);
  const cell = clamp(Number(step) || 54, 30, 100), max = Math.floor(clamp(Number(maxSamples) || 560, 1, 900));
  const x0 = Math.floor(left / cell), x1 = Math.ceil(right / cell), y0 = Math.floor(top / cell), y1 = Math.ceil(bottom / cell);
  const wetness = clamp(Number(weather?.wetness) || 0, 0, 1), rain = clamp(Number(weather?.rain) || 0, 0, 1), snow = clamp(Number(weather?.snow) || 0, 0, 1), ash = clamp(Number(weather?.ash) || 0, 0, 1);
  const rows = [];
  for (let gy = y0; gy <= y1 && rows.length < max; gy++) for (let gx = x0; gx <= x1 && rows.length < max; gx++) {
    const seed = hashUnit(gx, gy, 2163), x = gx * cell + 8 + hashUnit(gx, gy, 2164) * (cell - 16), y = gy * cell + 8 + hashUnit(gx, gy, 2165) * (cell - 16);
    if (x < left || x > right || y < top || y > bottom || seed < .18) continue;
    const region = regionAt(x, y), surface = resolveTerrainSurfaceV2146(x, y);
    let kind = region === 'ashen_city' ? (seed > .77 ? 'paver-wear' : 'masonry-grit')
      : region === 'farmland' ? (seed > .7 ? 'stubble' : 'soil-clod')
      : region === 'rootwood' ? (seed > .68 ? 'root-fleck' : 'moss-patch')
      : region === 'ironstone' ? (seed > .73 ? 'ore-glint' : 'slate-chip')
      : (surface.biome.includes('forest') ? 'moss-patch' : surface.biome.includes('highland') ? 'slate-chip' : 'earth-grain');
    if (snow > .25 || season === 'winter') kind = seed > .7 ? 'frost-crystal' : 'snow-driftlet';
    else if (ash > .35 && seed > .48) kind = 'ash-deposit';
    else if (season === 'autumn' && seed > .53) kind = 'fallen-leaf';
    else if (season === 'spring' && seed > .79) kind = 'spring-sprout';
    else if (wetness > .46 && seed > .66) kind = 'shallow-puddle';
    rows.push(Object.freeze({ id: `ground:${gx}:${gy}`, x, y, kind, region, material: surface.material, elevation: surface.elevation, scale: .5 + hashUnit(gx, gy, 2166) * 1.2, wetness, rain, snow, ash, seed }));
  }
  return Object.freeze(rows);
}

function drawGroundSample(ctx, item, season, timeMs) {
  const region = item.region, p = detailPalette(season, region), s = item.scale, pulse = .85 + .15 * Math.sin(timeMs / 900 + item.seed * 10);
  ctx.save();
  if (item.kind === 'snow-driftlet') {
    ctx.fillStyle = `rgba(242,248,252,${.28 + item.snow * .28})`; ctx.beginPath(); ctx.ellipse(item.x, item.y, 4.8 * s, 2.1 * s, -.16, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.24)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(item.x - 3 * s, item.y); ctx.quadraticCurveTo(item.x, item.y - 2.2 * s, item.x + 4 * s, item.y - .3 * s); ctx.stroke();
  } else if (item.kind === 'frost-crystal') {
    ctx.strokeStyle = `rgba(226,242,250,${.35 + item.snow * .38})`; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(item.x - 3 * s, item.y + 1); ctx.lineTo(item.x + 3 * s, item.y - 1); ctx.moveTo(item.x, item.y - 3 * s); ctx.lineTo(item.x, item.y + 3 * s); ctx.stroke();
  } else if (item.kind === 'fallen-leaf') {
    ctx.fillStyle = ['#b77944', '#c29a52', '#845a3e'][Math.floor(item.seed * 17) % 3]; ctx.globalAlpha = .48; ctx.beginPath(); ctx.ellipse(item.x, item.y, 3.1 * s, 1.65 * s, item.seed * Math.PI, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(58,42,30,.24)'; ctx.lineWidth = .55; ctx.beginPath(); ctx.moveTo(item.x - 2 * s, item.y); ctx.lineTo(item.x + 2 * s, item.y); ctx.stroke();
  } else if (item.kind === 'spring-sprout' || item.kind === 'stubble') {
    ctx.strokeStyle = item.kind === 'spring-sprout' ? 'rgba(146,180,104,.56)' : 'rgba(174,150,92,.42)'; ctx.lineWidth = 1.05 * s; ctx.beginPath(); ctx.moveTo(item.x, item.y + 3 * s); ctx.quadraticCurveTo(item.x - 2 * s, item.y, item.x - 2.7 * s, item.y - 4 * s); ctx.moveTo(item.x, item.y + 3 * s); ctx.quadraticCurveTo(item.x + 2 * s, item.y, item.x + 3 * s, item.y - 3 * s); ctx.stroke();
    if (item.kind === 'spring-sprout') { ctx.fillStyle = 'rgba(227,179,185,.58)'; ctx.beginPath(); ctx.arc(item.x, item.y - 4 * s, 1.3 * s, 0, Math.PI * 2); ctx.fill(); }
  } else if (item.kind === 'shallow-puddle') {
    ctx.fillStyle = `rgba(84,132,144,${.10 + item.wetness * .15})`; ctx.beginPath(); ctx.ellipse(item.x, item.y, 5.3 * s, 2.4 * s, -.1, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(191,222,224,${.13 + pulse * .13})`; ctx.lineWidth = .7; ctx.beginPath(); ctx.ellipse(item.x, item.y, 3.3 * s, 1.1 * s, -.1, 0, Math.PI * 2); ctx.stroke();
  } else if (item.kind === 'ash-deposit') {
    ctx.fillStyle = 'rgba(155,151,143,.27)'; ctx.beginPath(); ctx.ellipse(item.x, item.y, 3.2 * s, 1.8 * s, item.seed, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(214,207,191,.28)'; ctx.fillRect(item.x + s, item.y - s, 1.2 * s, 1.2 * s);
  } else if (item.kind === 'root-fleck' || item.kind === 'moss-patch') {
    ctx.strokeStyle = item.kind === 'root-fleck' ? 'rgba(105,75,48,.34)' : 'rgba(114,143,83,.35)'; ctx.lineWidth = 1.15 * s; ctx.beginPath(); ctx.moveTo(item.x - 4 * s, item.y + 1.6 * s); ctx.quadraticCurveTo(item.x, item.y - 2.8 * s, item.x + 4.8 * s, item.y - 1 * s); ctx.stroke();
    if (item.kind === 'moss-patch') { ctx.fillStyle = 'rgba(113,148,84,.18)'; ctx.beginPath(); ctx.ellipse(item.x, item.y, 4.2 * s, 2 * s, 0, 0, Math.PI * 2); ctx.fill(); }
  } else if (item.kind === 'slate-chip' || item.kind === 'ore-glint' || item.kind === 'masonry-grit' || item.kind === 'paver-wear' || item.kind === 'soil-clod' || item.kind === 'earth-grain') {
    const color = item.kind === 'ore-glint' ? 'rgba(174,160,126,.54)' : item.kind === 'slate-chip' ? 'rgba(157,160,158,.42)' : item.kind === 'masonry-grit' ? 'rgba(170,157,133,.36)' : item.kind === 'paver-wear' ? 'rgba(190,175,148,.28)' : item.kind === 'soil-clod' ? 'rgba(111,86,56,.34)' : 'rgba(148,131,96,.27)';
    ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(item.x, item.y, 2.2 * s, .95 * s, item.seed * 2, 0, Math.PI * 2); ctx.fill();
    if (item.kind === 'ore-glint') { ctx.strokeStyle = `rgba(221,205,167,${.22 + pulse * .18})`; ctx.lineWidth = .65; ctx.beginPath(); ctx.moveTo(item.x - 2 * s, item.y); ctx.lineTo(item.x + 2 * s, item.y - 1.2 * s); ctx.stroke(); }
  }
  ctx.restore();
}

function drawAnchor(ctx, row, season, weather, timeMs) {
  const s = row.scale, wet = clamp(Number(weather?.wetness) || 0, 0, 1), snow = clamp(Number(weather?.snow) || 0, 0, 1), seed = hashUnit(row.x, row.y, row.id.length + 2163);
  ctx.save();
  if (row.kind === 'foundation-chip') {
    ctx.fillStyle = season === 'winter' ? 'rgba(214,226,233,.38)' : 'rgba(89,76,61,.28)';
    ctx.beginPath(); ctx.ellipse(row.x, row.y, 2.5 * s, 1.25 * s, seed * .4, 0, Math.PI * 2); ctx.fill();
    if (season === 'winter') { ctx.fillStyle = 'rgba(247,251,253,.62)'; ctx.fillRect(row.x - 1.7 * s, row.y - 1.5 * s, 3.4 * s, .9 * s); }
  } else if (row.kind === 'root-moss') {
    ctx.strokeStyle = season === 'winter' ? 'rgba(212,225,233,.42)' : 'rgba(107,123,74,.34)'; ctx.lineWidth = 1.3 * s;
    ctx.beginPath(); ctx.moveTo(row.x - 5 * s, row.y + 2 * s); ctx.quadraticCurveTo(row.x, row.y - 2 * s, row.x + 5 * s, row.y); ctx.stroke();
    if (season === 'spring') { ctx.fillStyle = 'rgba(203,169,181,.52)'; ctx.beginPath(); ctx.arc(row.x, row.y - 2 * s, 1.3 * s, 0, Math.PI * 2); ctx.fill(); }
    if (season === 'winter') { ctx.fillStyle = 'rgba(248,251,253,.68)'; ctx.beginPath(); ctx.ellipse(row.x, row.y - 1.5 * s, 4 * s, 1.3 * s, 0, 0, Math.PI * 2); ctx.fill(); }
  } else if (row.kind === 'prop-ground-wear') {
    ctx.fillStyle = `rgba(12,12,11,${.11 + wet * .09})`; ctx.beginPath(); ctx.ellipse(row.x, row.y - 1, 7 * s, 2.8 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = season === 'winter' ? 'rgba(231,240,246,.42)' : 'rgba(147,125,91,.28)';
    ctx.beginPath(); ctx.ellipse(row.x - 5 * s, row.y + 1, 1.8 * s, .8 * s, seed, 0, Math.PI * 2); ctx.fill();
  } else if (row.kind === 'road-shoulder-grit' || row.kind === 'path-edge-pebble' || row.kind === 'waterbank-pebble') {
    const alpha = row.kind === 'waterbank-pebble' ? .46 : .32;
    ctx.fillStyle = season === 'winter' ? `rgba(225,237,244,${alpha})` : `rgba(151,137,116,${alpha})`;
    ctx.beginPath(); ctx.ellipse(row.x, row.y, (row.kind === 'road-shoulder-grit' ? 2.4 : 3.1) * s, 1.35 * s, seed * Math.PI, 0, Math.PI * 2); ctx.fill();
    if (row.kind === 'waterbank-pebble' && season !== 'winter') { ctx.strokeStyle = 'rgba(93,130,119,.25)'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(row.x - 2 * s, row.y + 2 * s); ctx.lineTo(row.x + 2 * s, row.y + 1 * s); ctx.stroke(); }
    if (snow > .2 || season === 'winter') { ctx.fillStyle = 'rgba(248,251,253,.72)'; ctx.beginPath(); ctx.ellipse(row.x, row.y - 1 * s, 2.4 * s, .8 * s, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
}

function isVisible(row, left, top, right, bottom, margin = 18) {
  return row.x >= left - margin && row.x <= right + margin && row.y >= top - margin && row.y <= bottom + margin;
}

export function drawEnvironmentalGroundDetailV2163(ctx, camX = 0, camY = 0, weather = {}, timeMs = 0) {
  if (!ctx?.save || !ctx?.restore || !ctx?.beginPath) return Object.freeze({ ok: false, reason: 'invalid-canvas', details: 0 });
  const season = ['spring', 'summer', 'autumn', 'winter'].includes(weather?.season) ? weather.season : 'summer';
  const left = Number(camX) - 220, top = Number(camY) - 180, right = Number(camX) + 960, bottom = Number(camY) + 880;
  const samples = buildGroundDetailSamplesV2163({ left, top, right, bottom, season, weather, step: 55, maxSamples: 440 });
  for (const item of samples) drawGroundSample(ctx, item, season, Number(timeMs) || 0);
  return Object.freeze({ ok: true, stage: 21, season, details: samples.length, bounds: Object.freeze({ left, top, right, bottom }), visualOnly: true });
}

export function drawEnvironmentalAnchorDetailV2163(ctx, registry, camX = 0, camY = 0, weather = {}, timeMs = 0) {
  if (!ctx?.save || !registry?.valid) return Object.freeze({ ok: false, reason: 'invalid-registry', details: 0 });
  const season = ['spring', 'summer', 'autumn', 'winter'].includes(weather?.season) ? weather.season : 'summer';
  const bounds = { left: Number(camX) - 240, top: Number(camY) - 190, right: Number(camX) + 980, bottom: Number(camY) + 900 };
  let drawn = 0;
  for (const row of registry.anchors) if (isVisible(row, bounds.left, bounds.top, bounds.right, bounds.bottom)) { drawAnchor(ctx, row, season, weather, Number(timeMs) || 0); drawn++; }
  return Object.freeze({ ok: true, stage: 21, details: drawn, candidates: registry.total, visualOnly: true });
}

export function auditEnvironmentalDetailV2163({ buildings = [], registry = null } = {}) {
  const errors = [];
  const expectedTreeRoots = ETRANOM_TREES_VEGETATION_V2148.trees.length;
  if (!registry || registry.version !== 2163 || registry.stage !== 21 || !registry.valid) errors.push('detail-registry-invalid');
  if (buildings.length !== 27) errors.push(`building-input-count:${buildings.length}`);
  if (registry && registry.counts.foundation !== buildings.length * 8) errors.push(`foundation-count:${registry.counts.foundation}`);
  if (registry && registry.counts.roots < expectedTreeRoots * 2) errors.push(`root-detail-coverage:${registry.counts.roots}`);
  if (registry && registry.counts.propBases !== ENVIRONMENTAL_PROPS_V2147.placements.length + ETRANOM_AUTHORED_SAFE_WORLD_PROP_PLACEMENTS_V2137.length) errors.push('prop-grounding-coverage');
  if (registry && registry.counts.bankMarks === 0) errors.push('waterbank-detail-missing');
  if (registry && registry.anchors.some(a => a.collision !== 'none-visual-decal-only' || a.interaction !== false)) errors.push('visual-detail-must-not-change-physics-or-interaction');
  return Object.freeze({ ok: errors.length === 0, version: 2163, stage: 21, buildings: buildings.length,
    treeRoots: registry?.counts.roots || 0, propBases: registry?.counts.propBases || 0, roadAndPathMarks: registry?.counts.routeMarks || 0,
    waterbankMarks: registry?.counts.bankMarks || 0, foundationMarks: registry?.counts.foundation || 0,
    totalAnchors: registry?.total || 0, errors: Object.freeze(errors) });
}

export const ETRANOM_ENVIRONMENTAL_DETAIL_V2163 = Object.freeze({
  version: 2163, stage: 21, name: 'Environmental Detail',
  sources: Object.freeze([4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 17, 19, 20]),
  detailLayers: Object.freeze(['region-aware ground microtexture', 'building foundation wear', 'tree-root and moss transitions', 'prop contact-ground wear', 'road shoulder grit', 'footpath edge pebbles', 'waterbank gravel', 'seasonal ground micro-details', 'rain puddle and frost micro-accents', 'ashfall deposits']),
  settlements: Object.freeze(REGION_BOUNDS.map(r => r.id)),
  rendering: Object.freeze({ engine: 'Canvas2D deterministic procedural detail', coordinateUnit: 'legacy-logical-world-unit', viewportCulled: true, boundedGroundSamplesPerFrame: 440, noExternalAssets: true }),
  physicsPolicy: 'all stage-21 details are nonblocking visual decals; physical bodies remain owned by stage 19',
  excludedStages: Object.freeze([16])
});

if (typeof window !== 'undefined') {
  window.ETRANOM_ENVIRONMENTAL_DETAIL_V2163 = ETRANOM_ENVIRONMENTAL_DETAIL_V2163;
  window.ETRANOM_ENVIRONMENTAL_DETAIL_AUDIT_V2163 = null;
}
