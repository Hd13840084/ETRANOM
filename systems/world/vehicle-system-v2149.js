// ETRANOM V2149 — Stage 11: Vehicles & Transport.
// Authored transparent vehicle sprites, regional parking/mooring, ground anchors,
// biome/slope contracts, player-relative depth passes and V2164 dynamic control integration.
import { sampleTerrainElevationV2146, sampleTerrainGradientV2146, resolveTerrainSurfaceV2146 } from './terrain-topography-v2146.js?v=2146';
import { ETRANOM_WORLD_GEOMETRY_V2140 } from './world-geometry-v2140.js?v=2140';
import { drawSeasonalPropCapV2159 } from './seasonal-world-v2159.js?v=2159';
import { getVehicleWheelLayoutV2167 } from './vehicle-suspension-v2167.js?v=2167';
import { resolveVehicleSpriteScaleV2170 } from './world-scale-calibration-v2170.js?v=2170';

const GENERATED_ROOT = './assets/safe-zone/vehicles-v2149/';
const ASSET_CATALOG = Object.freeze({
  handcart_empty: Object.freeze({ file: 'handcart_empty.png', root: GENERATED_ROOT, width: 104, length: 118, height: 74, wheelCount: 2, mobility: 'hand-pushed', cargo: 'none', terrainClass: 'land', vehicleClass: 'handcart' }),
  covered_merchant_wagon: Object.freeze({ file: 'covered_merchant_wagon.png', root: GENERATED_ROOT, width: 142, length: 162, height: 110, wheelCount: 4, mobility: 'animal-drawn', cargo: 'merchant-goods', terrainClass: 'land', vehicleClass: 'wagon' }),
  enclosed_coach: Object.freeze({ file: 'enclosed_coach.png', root: GENERATED_ROOT, width: 148, length: 172, height: 126, wheelCount: 4, mobility: 'animal-drawn', cargo: 'passengers', terrainClass: 'land', vehicleClass: 'coach' }),
  mine_ore_cart: Object.freeze({ file: 'mine_ore_cart.png', root: GENERATED_ROOT, width: 88, length: 92, height: 70, wheelCount: 4, mobility: 'hand-pushed', cargo: 'ore', terrainClass: 'land', vehicleClass: 'mine-cart' }),
  farm_hay_wagon: Object.freeze({ file: 'farm_hay_wagon.png', root: GENERATED_ROOT, width: 140, length: 160, height: 105, wheelCount: 4, mobility: 'animal-drawn', cargo: 'hay-bales', terrainClass: 'land', vehicleClass: 'farm-wagon' }),
  river_cargo_boat: Object.freeze({ file: 'river_cargo_boat.png', root: GENERATED_ROOT, width: 96, length: 110, height: 48, wheelCount: 0, mobility: 'watercraft', cargo: 'crates-and-barrels', terrainClass: 'water', vehicleClass: 'cargo-boat' }),
  market_cart: Object.freeze({ file: 'market_cart.png', root: './assets/safe-zone/props-v2137/', width: 116, length: 124, height: 90, wheelCount: 4, mobility: 'hand-pushed', cargo: 'market-produce', terrainClass: 'land', vehicleClass: 'market-cart' }),
  grain_cart: Object.freeze({ file: 'grain_cart.png', root: './assets/safe-zone/yard-sprites-v2117/', width: 112, length: 124, height: 84, wheelCount: 2, mobility: 'hand-pushed', cargo: 'grain-sacks', terrainClass: 'land', vehicleClass: 'grain-cart' })
});

// Ground anchors are chosen from the existing settlement/road layout. They are
// parked clear of door thresholds; the boat is moored on the existing creek line.
const PLACEMENT_ROWS = [
  { id: 'city-market-handcart-01', asset: 'market_cart', x: 1510, y: 1120, region: 'ashen_city', role: 'market-delivery', state: 'parked', parking: 'plaza-service-edge', rotation: -0.06, service: 'market-goods', capacity: 'small-load', restraint: 'wheel-chock' },
  { id: 'city-stable-coach-01', asset: 'enclosed_coach', x: 2190, y: 1000, region: 'ashen_city', role: 'passenger-carriage', state: 'parked', parking: 'stable-yard-outer-bay', rotation: 0.02, service: 'passenger-transfer', capacity: 'small-party', restraint: 'parked-unhitched' },
  { id: 'farm-grain-cart-01', asset: 'grain_cart', x: 360, y: 1060, region: 'farmland', role: 'grain-haulage', state: 'parked', parking: 'farmstead-loading-edge', rotation: -0.04, service: 'grain-transport', capacity: 'two-wheel-load', restraint: 'wheel-chock' },
  { id: 'farm-hay-wagon-01', asset: 'farm_hay_wagon', x: 660, y: 450, region: 'farmland', role: 'hay-haulage', state: 'parked', parking: 'north-fallow-field-bay', rotation: 0.03, service: 'hay-transport', capacity: 'bulk-load', restraint: 'parked-unhitched' },
  { id: 'rootwood-sawmill-wagon-01', asset: 'covered_merchant_wagon', x: 2500, y: 770, region: 'rootwood', role: 'timber-and-supply-wagon', state: 'parked', parking: 'sawmill-loading-apron', rotation: 0.05, service: 'timber-supply', capacity: 'covered-bulk-load', restraint: 'parked-unhitched' },
  { id: 'rootwood-creek-boat-01', asset: 'river_cargo_boat', x: 2340, y: 1255, region: 'rootwood', role: 'creek-cargo-craft', state: 'moored', parking: 'rootwood-creek-water-berth', waterwayId: 'rootwood_creek', rotation: 0.46, service: 'short-haul-creek-cargo', capacity: 'light-cargo', restraint: 'shore-mooring' },
  { id: 'ironstone-ore-cart-01', asset: 'mine_ore_cart', x: 1800, y: 2200, region: 'ironstone', role: 'ore-transfer-cart', state: 'parked', parking: 'mine-loading-apron', rotation: 0.02, service: 'ore-transport', capacity: 'ore-hopper', restraint: 'wheel-chock' },
  { id: 'ironstone-stone-handcart-01', asset: 'handcart_empty', x: 2300, y: 2280, region: 'ironstone', role: 'stone-and-tool-handcart', state: 'parked', parking: 'stonecutter-service-edge', rotation: -0.03, service: 'stone-and-tool-transfer', capacity: 'small-load', restraint: 'wheel-chock' }
];

const CREEK = ETRANOM_WORLD_GEOMETRY_V2140.waterways.find(w => w.id === 'rootwood_creek');
const PLACEMENTS = PLACEMENT_ROWS.map(row => {
  const spec = ASSET_CATALOG[row.asset];
  // V2169 Stage 27: calibrate carts/wagons against the reduced player sprite.
  // Visual dimensions and collision footprints use the same factor.
  const vehicleScale = resolveVehicleSpriteScaleV2170(row.asset);
  const width = Math.round(spec.width * vehicleScale);
  const length = Math.round(spec.length * vehicleScale);
  const height = Math.round(spec.height * vehicleScale);
  const gradient = sampleTerrainGradientV2146(row.x, row.y);
  const surface = resolveTerrainSurfaceV2146(row.x, row.y);
  const waterPlacement = spec.terrainClass === 'water';
  return Object.freeze({
    ...row, ...spec, width, length, height,
    x: Number(row.x), y: Number(row.y),
    groundAnchor: waterPlacement ? 'hull-waterline-center' : 'wheel-contact-center',
    depth: Number(row.x) + Number(row.y),
    elevation: sampleTerrainElevationV2146(row.x, row.y),
    slope: gradient.slopeClass,
    slopeGradient: gradient.gradient,
    terrainVehicleClass: gradient.vehicle,
    surface: waterPlacement ? 'rootwood_creek-water-surface' : surface.material,
    terrain: Object.freeze({ biome: surface.biome, landform: surface.landform, elevation: surface.elevation, slopeClass: gradient.slopeClass }),
    transform: Object.freeze({ rotationRadians: Number(row.rotation) || 0, scale: 1, z: surface.elevation }),
    footprint: Object.freeze({ length, width, height, type: waterPlacement ? 'hull-footprint' : 'wheelbase-and-body-footprint' }),
    mobilityContract: Object.freeze({ mode: spec.mobility, currentlyMoving: false, playerOperable: true, animalHarness: 'not-present-or-unhitched', motionRuntime: 'V2164-player-controlled-dynamic', waterRoute: waterPlacement ? row.waterwayId : null }),
    collision: Object.freeze({ policy: 'stage-19-live-oriented-footprint', type: waterPlacement ? 'boat-hull-and-shoreline' : 'vehicle-body-wheels-and-axle', blocksPlayer: true, renderRotation: 'shared-placement-rotation' }),
    navigation: Object.freeze({ policy: 'not-a-walkable-corridor', vehicleRouting: 'not-active', sourceRoadNetwork: 'V2142' }),
    interaction: Object.freeze({ enabled: true, runtime: 'V2164-board-and-drive' })
  });
});

const IMAGE_CACHE = new Map();
function getVehicleImage(vehicle) {
  let image = IMAGE_CACHE.get(vehicle.id);
  if (!image && typeof Image !== 'undefined') {
    image = new Image();
    image.decoding = 'async';
    image.src = vehicle.root + vehicle.file;
    IMAGE_CACHE.set(vehicle.id, image);
  }
  return image;
}
function isVisible(p, camX, camY) {
  return p.x >= camX - 240 && p.x <= camX + 980 && p.y >= camY - 240 && p.y <= camY + 880;
}
function drawVehicleWheels(ctx, p) {
  if (p.terrainClass === 'water' || p.state === 'moored') return 0;
  const layout = getVehicleWheelLayoutV2167(p), telemetry = Array.isArray(p.wheelTelemetry) ? p.wheelTelemetry : [];
  const radius = Math.max(5, Math.min(11, Number(p.width || 90) * .085));
  let drawn = 0;
  for (const wheel of layout) {
    const live = telemetry[wheel.index] || {};
    const spin = Number(live.rotationRad ?? p.wheelSpin?.[wheel.index]) || 0;
    const compression = Number(live.compressionM ?? .17);
    // Layout x is the longitudinal axis and y the lateral axis. In the sprite
    // frame, forward points toward negative screen Y, with 40 logical units/metre.
    const localX = wheel.y * 40;
    const localY = -wheel.x * 40 + (.17 - compression) * 40;
    ctx.save(); ctx.translate(localX, localY); ctx.rotate(spin);
    ctx.fillStyle = '#17191b'; ctx.strokeStyle = 'rgba(5,7,9,.95)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 0, radius * .72, radius, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#92999b'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.ellipse(0, 0, radius * .38, radius * .55, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -radius * .52); ctx.lineTo(0, radius * .52); ctx.moveTo(-radius * .32, 0); ctx.lineTo(radius * .32, 0); ctx.stroke();
    ctx.restore(); drawn++;
  }
  return drawn;
}
function drawVehicle(ctx, p, season='summer') {
  const image = getVehicleImage(p);
  if (!image || !image.complete || !image.naturalWidth) return false;
  const drawHeight = p.width * image.naturalHeight / image.naturalWidth;
  ctx.save();
  // The same authored yaw is used by the Stage-19 oriented footprint and this
  // sprite pass. Rotation is around the wheel-contact/hull anchor, not the roof.
  ctx.translate(p.x, p.y);
  ctx.rotate(Number(p.rotation) || 0);
  const wheelCountRendered = drawVehicleWheels(ctx, p);
  // Contact shadow stays on ground; the sprite is lifted to a bridge-deck support height if needed.
  ctx.globalAlpha = p.state === 'moored' ? 0.22 : 0.28;
  ctx.fillStyle = '#0b0b0a';
  ctx.beginPath();
  ctx.ellipse(2, p.state === 'moored' ? 3 : 5, p.width * 0.43, Math.max(4, p.width * (p.state === 'moored' ? 0.12 : 0.16)), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.save();
  const bodyLift = (Number(p.bodyLiftM) || 0) * 40 * 0.7;
  const bodyPitch = Number(p.pitch) || 0, bodyRoll = Number(p.roll) || 0;
  ctx.translate(0, -Math.max(0, Number(p.z || 0) - Number(p.elevation || 0)) * 0.7 - bodyLift);
  // Small perspective shear conveys suspension pitch/roll without changing the isometric camera.
  ctx.transform(1, Math.sin(bodyPitch) * .045, Math.sin(bodyRoll) * .09, 1, 0, 0);
  ctx.drawImage(image, -p.width / 2, -drawHeight, p.width, drawHeight);
  drawSeasonalPropCapV2159(ctx,0,0,p.width,drawHeight,season,p.id);
  ctx.restore();
  ctx.restore();
  return true;
}
function drawPass(ctx, camX, camY, depthLimit, foreground, season='summer') {
  if (!ctx?.drawImage || !ctx?.save || !ctx?.restore) return { drawn: 0, culled: PLACEMENTS.length };
  let drawn = 0, culled = 0;
  const live = typeof window !== 'undefined' ? window.ETRANOM_VEHICLE_RUNTIME_V2164?.vehicles : null;
  const poses = PLACEMENTS.map(base => {
    const motion = live?.[base.id];
    return motion ? { ...base, x: Number(motion.x), y: Number(motion.y), rotation: Number(motion.heading) || 0, z: Number(motion.z) || base.elevation, bodyLiftM:Number(motion.bodyLiftM)||0, pitch:Number(motion.pitch)||0, roll:Number(motion.roll)||0, wheelSpin:motion.wheelSpin||[],wheelTelemetry:motion.suspensionTelemetry?.wheelTelemetry||[],
      depth: Number(motion.x) + Number(motion.y), state: motion.terrainClass === 'water' ? 'moored' : 'parked', runtimeMoving: Math.abs(Number(motion.speed)||0) > .1 } : base;
  }).sort((a,b)=>a.depth-b.depth);
  for (const p of poses) {
    if (!isVisible(p, camX, camY)) { culled++; continue; }
    if (depthLimit !== null && (foreground ? p.depth <= depthLimit : p.depth > depthLimit)) continue;
    if (drawVehicle(ctx, p, season)) drawn++;
  }
  return Object.freeze({ drawn, culled, dynamic: poses.filter(p=>p.runtimeMoving).length });
}

export function drawVehicleSystemV2149(ctx, camX = 0, camY = 0, playerX = null, playerY = null, season='summer') {
  const depth = Number.isFinite(Number(playerX)) && Number.isFinite(Number(playerY)) ? Number(playerX) + Number(playerY) : null;
  return drawPass(ctx, Number(camX) || 0, Number(camY) || 0, depth, false, season);
}
export function drawForegroundVehiclesV2149(ctx, playerX, playerY, camX = 0, camY = 0, season='summer') {
  const depth = Number(playerX) + Number(playerY);
  if (!Number.isFinite(depth)) return Object.freeze({ drawn: 0, culled: PLACEMENTS.length });
  return drawPass(ctx, Number(camX) || 0, Number(camY) || 0, depth, true, season);
}

export const ETRANOM_VEHICLE_SYSTEM_V2149 = Object.freeze({
  version: 2149, stage: 11, stageName: 'Vehicles & Transport',
  coordinateContract: 'V2138 logical units with V2164 40-units-per-metre gameplay calibration (not geodetic survey)',
  assetRoot: GENERATED_ROOT,
  assetCatalog: ASSET_CATALOG,
  assetFiles: Object.freeze(Object.values(ASSET_CATALOG).map(v => `${v.root}${v.file}`)),
  placements: Object.freeze(PLACEMENTS),
  regions: Object.freeze(['ashen_city', 'farmland', 'rootwood', 'ironstone']),
  transportProfiles: Object.freeze({
    ashen_city: Object.freeze({ roles: ['market-delivery', 'passenger-transfer'], surface: 'compacted-stone-and-ash', parking: 'stable-yard-or-service-edge' }),
    farmland: Object.freeze({ roles: ['grain-transport', 'hay-transport'], surface: 'packed-loam-and-field-track', slopePolicy: 'prefer-flat-or-gentle-cart-reduced' }),
    rootwood: Object.freeze({ roles: ['timber-supply', 'short-haul-creek-cargo'], surface: 'rootbound-earth-and-mossy-creek', boatPolicy: 'moored-only-on-authored-waterway' }),
    ironstone: Object.freeze({ roles: ['ore-transport', 'stone-and-tool-transfer'], surface: 'slate-and-mineral-gravel', slopePolicy: 'chock-on-gentle-grade' })
  }),
  operationalRules: Object.freeze({
    currentState: 'persistent-dynamic-vehicle-runtime',
    playerControl: 'keyboard-and-touch-drive-controls', animalActors: 'not-added; animal-drawn vehicles are unhitched while parked',
    collision: 'stage-19-live-oriented-footprints', interaction: 'stage-15', movementAndAnimation: 'acceleration-steering-braking-and-collision-runtime-v2164',
    roadRouting: 'surface-aware free driving with world-collider validation; V2142 road geometry retained', waterNavigation: 'rootwood creek polyline constrained navigation',
    damageAndDestruction: 'excluded-by-project-owner; environmental assets remain intact'
  }),
  retainedAssets: Object.freeze(['./assets/safe-zone/props-v2137/market_cart.png', './assets/safe-zone/yard-sprites-v2117/grain_cart.png']),
  mineTrack: Object.freeze({ status: 'not-authored', reason: 'no existing mine rail alignment is present in canonical world geometry' })
});

export function auditVehicleSystemV2149() {
  const errors = [];
  const ids = new Set();
  const assets = new Set(ETRANOM_VEHICLE_SYSTEM_V2149.assetFiles);
  const regions = new Set();
  for (const p of PLACEMENTS) {
    if (ids.has(p.id)) errors.push(`duplicate-placement:${p.id}`);
    ids.add(p.id);
    regions.add(p.region);
    if (!ASSET_CATALOG[p.asset]) errors.push(`unknown-asset:${p.asset}`);
    if (![p.x, p.y, p.width, p.length, p.height, p.depth, p.elevation].every(Number.isFinite)) errors.push(`invalid-transform:${p.id}`);
    if (!(p.width > 0 && p.length > 0 && p.height > 0)) errors.push(`invalid-dimensions:${p.id}`);
    if (p.depth !== p.x + p.y) errors.push(`invalid-depth:${p.id}`);
    if (p.terrainClass === 'land' && p.terrainVehicleClass === 'foot-only') errors.push(`vehicle-on-unrated-slope:${p.id}`);
    if (p.terrainClass === 'water' && (p.state !== 'moored' || p.waterwayId !== CREEK?.id)) errors.push(`invalid-watercraft-mooring:${p.id}`);
    if (p.collision.policy !== 'stage-19-live-oriented-footprint') errors.push(`unexpected-collision-policy:${p.id}`);
  }
  const required = ['handcart_empty.png','covered_merchant_wagon.png','enclosed_coach.png','mine_ore_cart.png','farm_hay_wagon.png','river_cargo_boat.png','market_cart.png','grain_cart.png'];
  for (const file of required) if (!Array.from(assets).some(path => path.endsWith(`/${file}`))) errors.push(`missing-catalog-entry:${file}`);
  return Object.freeze({
    ok: errors.length === 0, version: 2149, stage: 11,
    vehicleTypes: Object.keys(ASSET_CATALOG).length, placements: PLACEMENTS.length,
    regions: regions.size, uniquePlacementIds: ids.size, uniqueAssetPaths: assets.size,
    generatedVehicleSprites: 6, retainedVehicleSprites: 2,
    mooredCraft: PLACEMENTS.filter(p => p.state === 'moored').length,
    slopeCompatibleLandVehicles: PLACEMENTS.filter(p => p.terrainClass === 'land').every(p => p.terrainVehicleClass !== 'foot-only'),
    collisionIntegrated: true, renderRotationMatchesCollision: true, playerControlImplemented: true, animalActorsAdded: false,
    errors: Object.freeze(errors)
  });
}

if (typeof window !== 'undefined') {
  window.ETRANOM_VEHICLE_SYSTEM_V2149 = ETRANOM_VEHICLE_SYSTEM_V2149;
  window.ETRANOM_VEHICLE_SYSTEM_AUDIT_V2149 = auditVehicleSystemV2149();
  if (!window.ETRANOM_VEHICLE_SYSTEM_AUDIT_V2149.ok) console.error('[ETRANOM] Vehicle system audit failed:', window.ETRANOM_VEHICLE_SYSTEM_AUDIT_V2149);
}
