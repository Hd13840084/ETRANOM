// ETRANOM V2164 — dynamic vehicle physics: acceleration, steering, traction, collision and creek-following craft.
import { ETRANOM_WORLD_GEOMETRY_V2140 } from './world-geometry-v2140.js?v=2140';
import { ETRANOM_WORLD_SCALE_V2164 } from './world-scale-v2164.js?v=2164';
import { stepVehicleSuspensionV2167 } from './vehicle-suspension-v2167.js?v=2167';

const clamp = (v, a, b) => Math.max(a, Math.min(b, Number(v) || 0));
const angleWrap = a => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
const roadlessSpeed = v => clamp(v, -4.5, 8.5) * ETRANOM_WORLD_SCALE_V2164.logicalUnitsPerMeter;
function nearestOnPolyline(x, y, points) {
  let best = null, cumulative = 0;
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1], [bx, by] = points[i], dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
    const t = clamp(((x - ax) * dx + (y - ay) * dy) / (len * len), 0, 1);
    const px = ax + dx * t, py = ay + dy * t, d = Math.hypot(x - px, y - py);
    if (!best || d < best.distance) best = { distance: d, x: px, y: py, segment: i - 1, t, progress: cumulative + len * t, tangent: { x: dx / len, y: dy / len } };
    cumulative += len;
  }
  return best;
}
function pointAtProgress(points, progress) {
  let remain = Math.max(0, progress);
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1], [bx, by] = points[i], len = Math.hypot(bx - ax, by - ay);
    if (remain <= len || i === points.length - 1) { const t = len > 0 ? clamp(remain / len, 0, 1) : 0; return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t, heading: Math.atan2(by - ay, bx - ax) }; }
    remain -= len;
  }
  const [x, y] = points.at(-1); return { x, y, heading: 0 };
}
export function createVehiclePhysicsStateV2164(placements = []) {
  const vehicles = {};
  for (const p of placements) {
    const points = p.terrainClass === 'water' ? ETRANOM_WORLD_GEOMETRY_V2140.waterways.find(w => w.id === p.waterwayId)?.points : null;
    const nearest = points ? nearestOnPolyline(p.x, p.y, points) : null;
    vehicles[p.id] = { id: p.id, x: p.x, y: p.y, z: Number(p.elevation) || 0, heading: Number(p.rotation) || 0,
      speed: 0, angularVelocity: 0, wheelAngle: 0, terrainClass: p.terrainClass, waterwayId: p.waterwayId || null,
      routeProgress: nearest?.progress || 0, routeDistance: nearest?.distance || 0, active: false, collision: false,
      originalX: p.x, originalY: p.y, lastUpdate: 0 };
  }
  return { version: 2164, vehicles, activeVehicleId: null, physics: { units: 'metres-per-second', accelerationMps2: 1.8, brakingMps2: 3.8, rollingResistance: .65, steeringRate: 1.45 } };
}
function boxSamples(vehicle, x, y, heading) {
  const halfL = Math.max(8, Number(vehicle.length) * .42), halfW = Math.max(6, Number(vehicle.width) * .42), c = Math.cos(heading), s = Math.sin(heading);
  const local = [[0,0],[halfL,halfW],[halfL,-halfW],[-halfL,halfW],[-halfL,-halfW],[halfL,0],[-halfL,0],[0,halfW],[0,-halfW]];
  return local.map(([lx,ly]) => ({ x: x + lx * c - ly * s, y: y + lx * s + ly * c }));
}
function canOccupy(vehicle, x, y, heading, world, blocked) {
  const samples = boxSamples(vehicle, x, y, heading);
  if (typeof blocked === 'function') return samples.every(p => !blocked(vehicle, p.x, p.y, heading));
  if (!world) return true;
  return samples.every(p => !world.isBlocked || !world.isBlocked(p.x, p.y, vehicle.id));
}
export function stepVehiclePhysicsV2164(runtime, id, input = {}, dt = 0, options = {}) {
  const vehicle = runtime?.vehicles?.[id], placement = options.placements?.find(p => p.id === id);
  if (!vehicle || !placement) return Object.freeze({ ok: false, reason: 'unknown-vehicle' });
  const step = clamp(dt, 0, .08), throttle = clamp(input.throttle, -1, 1), steer = clamp(input.steer, -1, 1), braking = clamp(input.brake, 0, 1);
  if (step <= 0) return Object.freeze({ ok: true, vehicle: { ...vehicle }, moved: false });
  const surface = typeof options.resolveSurface === 'function' ? options.resolveSurface(vehicle.x, vehicle.y, vehicle) : { traction: 1, speedMultiplier: 1, accelerationMultiplier: 1 };
  const suspensionResult = stepVehicleSuspensionV2167(vehicle, placement, step, { resolveSurface: options.resolveSurface, input });
  vehicle.suspensionTelemetry = suspensionResult.ok ? { mode:suspensionResult.mode,wheels:suspensionResult.wheels,roll:suspensionResult.roll||0,pitch:suspensionResult.pitch||0,averageTireGrip:suspensionResult.averageTireGrip||1,averageSlipRatio:suspensionResult.averageSlipRatio||0,wheelTelemetry:suspensionResult.wheelTelemetry||[] } : null;
  const tyreGrip=clamp(vehicle.suspensionTelemetry?.averageTireGrip??1,.35,1.25);
  const traction = clamp((surface.traction ?? 1)*tyreGrip, .12, 1), speedMultiplier = clamp(surface.speedMultiplier ?? 1, .5, 1.1);
  let moved = false, collision = false;
  if (vehicle.terrainClass === 'water') {
    const waterway = ETRANOM_WORLD_GEOMETRY_V2140.waterways.find(w => w.id === vehicle.waterwayId);
    if (!waterway) return Object.freeze({ ok: false, reason: 'missing-waterway' });
    const nearest = nearestOnPolyline(vehicle.x, vehicle.y, waterway.points);
    if (!nearest || nearest.distance > Math.max(0, waterway.width * .5 - Number(placement.width || 90) * .42)) return Object.freeze({ ok: false, reason: 'craft-outside-waterway' });
    const accel = throttle > 0 ? 1.15 : throttle < 0 ? -.85 : 0;
    vehicle.speed = clamp(vehicle.speed + accel * ETRANOM_WORLD_SCALE_V2164.logicalUnitsPerMeter * step, -roadlessSpeed(2.2), roadlessSpeed(5.5));
    if (Math.abs(throttle) < .05 || braking > .01) vehicle.speed *= Math.max(0, 1 - (1.2 + braking * 2.5) * step);
    vehicle.routeProgress = clamp(nearest.progress + vehicle.speed * step, 0, waterway.points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-waterway.points[i][0],p[1]-waterway.points[i][1]),0));
    const next = pointAtProgress(waterway.points, vehicle.routeProgress);
    if (typeof options.isBlocked === 'function' && boxSamples(placement,next.x,next.y,next.heading).some(point=>options.isBlocked(vehicle,point.x,point.y,next.heading))) { vehicle.speed=0; collision=true; }
    else { vehicle.x = next.x; vehicle.y = next.y; vehicle.heading = next.heading; vehicle.z = Number(surface.supportElevation ?? surface.elevation) || vehicle.z; moved = Math.abs(vehicle.speed) > .1; }
  } else {
    const sprungMassKg = Math.max(80, Number(vehicle.suspension?.massKg) || 420);
    const longitudinalTyreForceN = Number(vehicle.tyreForcesN?.longitudinal) || 0;
    // Longitudinal acceleration now comes from the per-wheel tire contact forces,
    // rather than an independent arcade-only engine acceleration value.
    const tyreAccelerationMps2 = longitudinalTyreForceN / sprungMassKg;
    vehicle.speed += tyreAccelerationMps2 * ETRANOM_WORLD_SCALE_V2164.logicalUnitsPerMeter * step * traction;
    if (braking > 0) vehicle.speed *= Math.max(0, 1 - braking * 3.8 * step);
    if (Math.abs(throttle) < .04) vehicle.speed *= Math.max(0, 1 - .65 * step);
    const max = (throttle < 0 ? 3.2 : 8.5) * ETRANOM_WORLD_SCALE_V2164.logicalUnitsPerMeter * speedMultiplier;
    vehicle.speed = clamp(vehicle.speed, -max * .45, max);
    const speedRatio = clamp(Math.abs(vehicle.speed) / 80, 0, 1);
    vehicle.angularVelocity = steer * 1.45 * (0.18 + speedRatio * .82) * (vehicle.speed < 0 ? -1 : 1) * traction;
    vehicle.heading = angleWrap(vehicle.heading + vehicle.angularVelocity * step);
    const distance = vehicle.speed * step;
    const maxSubstep = 3, n = Math.max(1, Math.ceil(Math.abs(distance) / maxSubstep));
    for (let i = 0; i < n; i++) {
      const nx = vehicle.x + Math.cos(vehicle.heading) * distance / n, ny = vehicle.y + Math.sin(vehicle.heading) * distance / n;
      if (!canOccupy(placement, nx, ny, vehicle.heading, options.world, options.isBlocked)) { collision = true; vehicle.speed = 0; break; }
      vehicle.x = nx; vehicle.y = ny; moved = true;
    }
    const finalSurface = typeof options.resolveSurface === 'function' ? options.resolveSurface(vehicle.x, vehicle.y, vehicle) : surface;
    vehicle.z = Number(finalSurface.supportElevation ?? finalSurface.elevation) || vehicle.z;
  }
  vehicle.collision = collision; vehicle.active = true; vehicle.lastUpdate = Date.now();
  return Object.freeze({ ok: true, moved, collision, vehicle: Object.freeze({ ...vehicle }), speedMps: vehicle.speed / ETRANOM_WORLD_SCALE_V2164.logicalUnitsPerMeter,
    surface: surface.surface || 'base', traction, tyreGrip, speedMultiplier, tyreAccelerationMps2: vehicle.terrainClass === 'water' ? 0 : (Number(vehicle.tyreForcesN?.longitudinal)||0)/Math.max(80,Number(vehicle.suspension?.massKg)||420) });
}
export function stopVehiclePhysicsV2164(runtime, id) {
  const v = runtime?.vehicles?.[id]; if (!v) return false; v.speed = 0; v.angularVelocity = 0; v.active = false; runtime.activeVehicleId = null; return true;
}
export function auditVehiclePhysicsV2164(placements = []) {
  const runtime = createVehiclePhysicsStateV2164(placements), errors = [];
  if (Object.keys(runtime.vehicles).length !== placements.length) errors.push('vehicle-state-count');
  for (const p of placements) if (!runtime.vehicles[p.id] || !Number.isFinite(runtime.vehicles[p.id].routeProgress)) errors.push(`invalid-state:${p.id}`);
  return Object.freeze({ ok: errors.length === 0, version: 2164, stage: 22, vehicles: Object.keys(runtime.vehicles).length,
    landVehicles: placements.filter(p => p.terrainClass !== 'water').length, watercraft: placements.filter(p => p.terrainClass === 'water').length,
    dynamics: ['mass-proxy','acceleration','braking','rolling-resistance','steering','traction','oriented-footprint-collision','waterway-constrained-hull-motion'], errors: Object.freeze(errors) });
}
