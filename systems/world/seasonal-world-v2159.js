// ETRANOM V2159 — world-space seasonal surfaces, local foliage coatings and combat scaling.
// Deterministic, camera-culled Canvas2D passes; no save schema changes.
import { getSeasonalMonsterModifiersV2158, resolveSeasonProfileV2158 } from './seasons-system-v2158.js?v=2158';
import { ETRANOM_WORLD_GEOMETRY_V2140 } from './world-geometry-v2140.js?v=2140';

const SEASONS = new Set(['spring', 'summer', 'autumn', 'winter']);
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const seasonOf = value => SEASONS.has(String(value || '').toLowerCase()) ? String(value).toLowerCase() : 'summer';
function temperatureC(weather = {}) {
  const value = weather?.temperature;
  if (Number.isFinite(Number(value)) && String(value).trim() !== '') return Number(value);
  const descriptor = String(value || '').toLowerCase();
  return ({ freezing: -8, icy: -6, cold: 4, cool: 10, mild: 18, warm: 25, hot: 32 })[descriptor] ?? 12;
}
function hash32(value) {
  let h = 2166136261;
  const s = String(value);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function unit(seed, salt = 0) {
  let x = (seed ^ Math.imul((salt + 1) >>> 0, 0x9e3779b1)) >>> 0;
  x ^= x >>> 16; x = Math.imul(x, 0x7feb352d); x ^= x >>> 15; x = Math.imul(x, 0x846ca68b); x ^= x >>> 16;
  return (x >>> 0) / 4294967295;
}

/** Draws season cover in WORLD coordinates after roads/paths and before props/buildings. */
export function drawSeasonalGroundCoverV2159(ctx, camX = 0, camY = 0, playerX = 0, playerY = 0, weather = {}, timeMs = 0) {
  if (!ctx?.save || !ctx?.restore || !ctx?.fillRect || !ctx?.beginPath) return Object.freeze({ ok: false, reason: 'canvas-context-unavailable' });
  const season = seasonOf(weather?.season);
  const profile = resolveSeasonProfileV2158(season);
  const left = Math.floor((Number(camX) - 220) / 64) * 64;
  const top = Math.floor((Number(camY) - 260) / 64) * 64;
  const right = left + 1152;
  const bottom = top + 1152;
  const snow = clamp(weather?.snow, 0, 1);
  const wetness = clamp(weather?.wetness, 0, 1);
  let tiles = 0, details = 0;
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  if (season === 'winter') {
    // A low-opacity continuous blanket makes the entire traversable world read as snow-covered;
    // deterministic drift patches add depth without obscuring roads or ground landmarks.
    const blanketAlpha = 0.30 + snow * 0.20;
    ctx.fillStyle = `rgba(222,234,243,${blanketAlpha})`;
    ctx.fillRect(left, top, right - left, bottom - top);
    for (let y = top; y < bottom; y += 64) {
      for (let x = left; x < right; x += 64) {
        const seed = hash32(`snow|${x}|${y}`);
        const a = 0.10 + unit(seed, 1) * 0.18;
        ctx.fillStyle = `rgba(245,250,254,${a})`;
        ctx.beginPath();
        ctx.moveTo(x + 5, y + 22 + unit(seed, 2) * 10);
        ctx.quadraticCurveTo(x + 24, y + 8 + unit(seed, 3) * 14, x + 42, y + 23 + unit(seed, 4) * 8);
        ctx.quadraticCurveTo(x + 56, y + 35 + unit(seed, 5) * 8, x + 61, y + 50);
        ctx.quadraticCurveTo(x + 30, y + 57, x + 5, y + 22);
        ctx.fill();
        tiles++;
      }
    }
    // Thin ice-blue sheen in wet lowlands; actual movement friction is handled by Stage 19.
    if (wetness > 0.12 || temperature <= 0) {
      ctx.strokeStyle = `rgba(203,229,243,${0.12 + wetness * 0.16})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 18; i++) {
        const seed = hash32(`ice|${i}|${Math.floor(left / 128)}|${Math.floor(top / 128)}`);
        const x = left + unit(seed, 1) * (right - left), y = top + unit(seed, 2) * (bottom - top);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 18 + unit(seed, 3) * 35, y - 2 - unit(seed, 4) * 5); ctx.stroke();
        details++;
      }
    }
  } else if (season === 'spring') {
    ctx.fillStyle = 'rgba(102,151,83,.085)'; ctx.fillRect(left, top, right - left, bottom - top);
    for (let i = 0; i < 72; i++) {
      const seed = hash32(`spring|${i}|${Math.floor(left / 128)}|${Math.floor(top / 128)}`);
      const x = left + unit(seed, 1) * (right - left), y = top + unit(seed, 2) * (bottom - top);
      ctx.fillStyle = i % 3 ? 'rgba(167,190,107,.32)' : 'rgba(221,158,184,.30)';
      ctx.beginPath(); ctx.ellipse(x, y, 2 + unit(seed, 3) * 3, 1.2 + unit(seed, 4) * 2, unit(seed, 5), 0, Math.PI * 2); ctx.fill(); details++;
    }
  } else if (season === 'summer') {
    ctx.fillStyle = `rgba(186,143,68,${0.035 + wetness * 0.035})`; ctx.fillRect(left, top, right - left, bottom - top);
    for (let i = 0; i < 42; i++) {
      const seed = hash32(`summer|${i}|${Math.floor(left / 128)}|${Math.floor(top / 128)}`);
      const x = left + unit(seed, 1) * (right - left), y = top + unit(seed, 2) * (bottom - top);
      ctx.strokeStyle = 'rgba(190,169,99,.22)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 2, y - 4 - unit(seed, 3) * 5); ctx.stroke(); details++;
    }
  } else {
    ctx.fillStyle = 'rgba(160,104,49,.09)'; ctx.fillRect(left, top, right - left, bottom - top);
    const colors = ['rgba(181,104,52,.45)', 'rgba(201,151,69,.43)', 'rgba(133,91,54,.40)', 'rgba(171,128,80,.40)'];
    for (let i = 0; i < 88; i++) {
      const seed = hash32(`autumn|${i}|${Math.floor(left / 128)}|${Math.floor(top / 128)}`);
      const x = left + unit(seed, 1) * (right - left), y = top + unit(seed, 2) * (bottom - top);
      ctx.fillStyle = colors[i % colors.length]; ctx.beginPath(); ctx.ellipse(x, y, 2.2 + unit(seed, 3) * 2.5, 1.3 + unit(seed, 4) * 1.2, unit(seed, 5) * Math.PI, 0, Math.PI * 2); ctx.fill(); details++;
    }
  }
  ctx.restore();
  return Object.freeze({ ok: true, season, tiles, details, snowCoverage: season === 'winter' ? 1 : 0, weatherSnow: snow, bounds: Object.freeze({ left, top, right, bottom }) });
}

/** Paints localized snow/bloom/leaf accents over each actual tree sprite (not screen-space). */
export function drawSeasonalFoliageOverlayV2159(ctx, placement, width, height, season = 'summer') {
  const s = seasonOf(season);
  if (!ctx || !placement || !(width > 0 && height > 0) || s === 'summer') return false;
  const seed = hash32(placement.id || `${placement.x},${placement.y},${placement.file}`);
  const tree = placement.kind === 'tree';
  const x0 = -width * 0.46, canopyY = -height * (tree ? 0.91 : 0.72);
  ctx.save();
  if (s === 'winter') {
    // Pale canopy tint + layered caps make evergreen and deciduous crowns visibly snow-laden.
    ctx.fillStyle = tree ? 'rgba(236,245,251,.19)' : 'rgba(239,247,251,.28)';
    ctx.beginPath(); ctx.ellipse(0, -height * (tree ? .61 : .46), width * .39, height * (tree ? .25 : .22), 0, 0, Math.PI * 2); ctx.fill();
    const caps = tree ? 7 : 3;
    for (let i = 0; i < caps; i++) {
      const px = x0 + unit(seed, i * 3 + 1) * width * .88;
      const py = canopyY + unit(seed, i * 3 + 2) * height * (tree ? .50 : .35);
      const rx = width * (0.055 + unit(seed, i * 3 + 3) * .075);
      const ry = Math.max(2, height * (0.012 + unit(seed, i * 3 + 4) * .018));
      ctx.fillStyle = `rgba(249,252,255,${.58 + unit(seed, i + 23) * .28})`;
      ctx.beginPath(); ctx.ellipse(px, py, rx, ry, -.12 + unit(seed, i + 31) * .24, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(250,253,255,.62)'; ctx.lineWidth = Math.max(1.5, width * .012); ctx.lineCap = 'round';
    for (let i = 0; i < (tree ? 4 : 2); i++) {
      const yy = canopyY + height * (.20 + unit(seed, i + 41) * .32);
      ctx.beginPath(); ctx.moveTo(-width * .29, yy); ctx.quadraticCurveTo(0, yy - height * .045, width * .28, yy + height * .012); ctx.stroke();
    }
  } else if (s === 'spring') {
    for (let i = 0; i < (tree ? 11 : 4); i++) {
      const px = x0 + unit(seed, i * 2 + 1) * width * .9;
      const py = canopyY + unit(seed, i * 2 + 2) * height * (tree ? .64 : .4);
      ctx.fillStyle = i % 2 ? 'rgba(245,197,211,.88)' : 'rgba(246,226,170,.9)';
      ctx.beginPath(); ctx.arc(px, py, Math.max(1.3, width * .012), 0, Math.PI * 2); ctx.fill();
    }
  } else if (s === 'autumn') {
    for (let i = 0; i < (tree ? 10 : 4); i++) {
      const px = x0 + unit(seed, i * 2 + 1) * width * .9;
      const py = canopyY + unit(seed, i * 2 + 2) * height * (tree ? .65 : .35);
      ctx.fillStyle = ['rgba(185,105,54,.72)','rgba(211,154,67,.76)','rgba(139,83,49,.70)'][i % 3];
      ctx.beginPath(); ctx.ellipse(px, py, Math.max(1.5, width * .013), Math.max(1.2, width * .009), unit(seed, i + 52), 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
  return true;
}

/** Snow ridge painted on the authored building sprite; supports both normal and foreground passes. */
export function drawSeasonalBuildingCapV2159(ctx, x, top, width, height, season = 'summer', id = '') {
  if (!ctx?.save || seasonOf(season) !== 'winter' || !(width > 0 && height > 0)) return false;
  const seed = hash32(id || `${x}|${top}|${width}`);
  ctx.save();
  ctx.fillStyle = 'rgba(243,249,253,.86)';
  ctx.strokeStyle = 'rgba(255,255,255,.82)';
  ctx.lineWidth = Math.max(1.4, width * .008);
  // A sloped roof blanket follows an isometric ridge; small irregular edge scallops avoid a flat sticker look.
  ctx.beginPath();
  ctx.moveTo(x - width * .43, top + height * .43);
  ctx.lineTo(x - width * .08, top + height * .24);
  ctx.lineTo(x + width * .03, top + height * .22);
  ctx.lineTo(x + width * .43, top + height * .43);
  ctx.lineTo(x + width * .37, top + height * .46);
  ctx.lineTo(x + width * .14, top + height * .37);
  ctx.lineTo(x - width * .04, top + height * .36);
  ctx.lineTo(x - width * .27, top + height * .47);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const px = x - width * .32 + unit(seed, i + 1) * width * .64;
    const py = top + height * (.39 + unit(seed, i + 5) * .05);
    ctx.beginPath(); ctx.ellipse(px, py, width * (.018 + unit(seed, i + 9) * .018), Math.max(1.5, height * .018), 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  return true;
}

/** Freeze overlay for authored streams and basins; only active below freezing conditions. */
export function drawSeasonalWaterIceV2159(ctx, camX = 0, camY = 0, weather = {}) {
  const season = seasonOf(weather?.season);
  const temperature = temperatureC(weather);
  const freeze = season === 'winter' ? clamp((3 - temperature) / 9, 0, 0.82) : 0;
  if (!ctx?.save || freeze <= 0) return Object.freeze({ ok: true, frozen: 0, freeze });
  let frozen = 0;
  const onScreen = (x, y) => x >= camX - 150 && x <= camX + 900 && y >= camY - 160 && y <= camY + 820;
  ctx.save();
  for (const feature of ETRANOM_WORLD_GEOMETRY_V2140.waterways || []) {
    if (!Array.isArray(feature.points) || !feature.points.some(([x, y]) => onScreen(x, y))) continue;
    ctx.beginPath(); feature.points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.strokeStyle = `rgba(210,235,247,${0.18 + freeze * 0.42})`;
    ctx.lineWidth = Math.max(3, Number(feature.width) * (0.38 + freeze * 0.24));
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); frozen++;
  }
  for (const basin of ETRANOM_WORLD_GEOMETRY_V2140.waterBasins || []) {
    const x = basin.center?.x, y = basin.center?.y, rx = basin.radii?.x, ry = basin.radii?.y;
    if (![x,y,rx,ry].every(Number.isFinite) || !onScreen(x,y)) continue;
    ctx.fillStyle = `rgba(198,226,242,${0.18 + freeze * 0.36})`;
    ctx.beginPath(); ctx.ellipse(x,y,rx*.92,ry*.88,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = `rgba(238,249,255,${0.20 + freeze * 0.34})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x,y,rx*.78,ry*.70,0,0,Math.PI*2); ctx.stroke(); frozen++;
  }
  ctx.restore();
  return Object.freeze({ ok: true, frozen, freeze });
}

/** Snow cap for small environmental props (crates, shrine tops, rocks, carts, lantern hoods). */
export function drawSeasonalPropCapV2159(ctx, x, groundY, width, height, season = 'summer', id = '') {
  if (!ctx?.save || seasonOf(season) !== 'winter' || !(width > 0 && height > 0)) return false;
  const seed = hash32(id || `${x},${groundY},${width}`);
  const top = groundY - height;
  ctx.save();
  ctx.fillStyle = 'rgba(242,249,253,.78)';
  ctx.beginPath();
  ctx.moveTo(x-width*.43, top+height*.22);
  ctx.quadraticCurveTo(x-width*.18, top+height*.10, x, top+height*.15);
  ctx.quadraticCurveTo(x+width*.23, top+height*.05, x+width*.43, top+height*.22);
  ctx.quadraticCurveTo(x+width*.18, top+height*.27, x, top+height*.24);
  ctx.quadraticCurveTo(x-width*.22, top+height*.30, x-width*.43, top+height*.22);
  ctx.fill();
  for(let i=0;i<2;i++){
    const px=x+(unit(seed,i+1)-.5)*width*.7, py=top+height*(.23+unit(seed,i+4)*.045);
    ctx.beginPath();ctx.ellipse(px,py,width*.025,Math.max(1.2,height*.018),0,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
  return true;
}

/** Movement response for the live world controller. Winter snow/ice changes acceleration and deceleration. */
export function resolveSeasonalMovementResponseV2159(season = 'summer', weather = {}) {
  const s = seasonOf(season);
  const snow = clamp(weather?.snow, 0, 1);
  const wetness = clamp(weather?.wetness, 0, 1);
  const temperature = temperatureC(weather);
  if (s === 'winter') {
    const ice = clamp(0.28 + snow * 0.27 + (temperature <= 0 ? 0.16 : 0) + wetness * 0.10, 0.22, 0.78);
    return Object.freeze({ season: s, ice, speedMultiplier: 1 - ice * 0.07, acceleration: 7.5 - ice * 2.1, deceleration: 1.7 - ice * 0.75, surface: ice > 0.62 ? 'ice' : 'snow' });
  }
  if ((s === 'spring' || s === 'autumn') && wetness > 0.55) {
    const mud = clamp((wetness - 0.55) * 0.7, 0, 0.28);
    return Object.freeze({ season: s, ice: 0, mud, speedMultiplier: 1 - mud * 0.08, acceleration: 16, deceleration: 10, surface: 'mud' });
  }
  return Object.freeze({ season: s, ice: 0, mud: 0, speedMultiplier: 1, acceleration: 24, deceleration: 24, surface: 'normal' });
}

/** Apply seasonal multipliers to the live, per-encounter combat object exactly once. */
export function applySeasonalCombatScalingV2159(monster = {}, season = 'summer') {
  const normalizedSeason = seasonOf(season);
  if (monster?.seasonScalingVersion === 2159 && monster?.seasonScaling?.season === normalizedSeason) return monster;
  const previousBase = monster?.seasonBaseStats && typeof monster.seasonBaseStats === 'object' ? monster.seasonBaseStats : null;
  const baseStats = previousBase?.stats || monster.stats || {};
  const base = {
    hp: Math.max(1, Number(previousBase?.hp ?? monster.maxHp ?? monster.hp) || 1),
    maxHp: Math.max(1, Number(previousBase?.maxHp ?? monster.maxHp ?? monster.hp) || 1),
    attack: Math.max(1, Number(previousBase?.attack ?? monster.attack) || 1),
    defense: Math.max(0, Number(previousBase?.defense ?? monster.enemyDefense ?? monster.defense) || 0),
    speed: Math.max(0, Number(previousBase?.speed ?? monster.speed) || 0)
  };
  const modifiers = getSeasonalMonsterModifiersV2158(normalizedSeason);
  const ceilScale = (value, multiplier, minimum = 0) => Math.max(minimum, Math.ceil(value * multiplier));
  const stats = { ...baseStats };
  for (const key of ['power', 'attack']) if (Number.isFinite(Number(stats[key]))) stats[key] = ceilScale(Number(stats[key]), modifiers.attack, 0);
  for (const key of ['endurance', 'defense']) if (Number.isFinite(Number(stats[key]))) stats[key] = ceilScale(Number(stats[key]), modifiers.defense, 0);
  for (const key of ['hp', 'maxHp']) if (Number.isFinite(Number(stats[key]))) stats[key] = ceilScale(Number(stats[key]), modifiers.maxHp, 1);
  if (Number.isFinite(Number(stats.vitality))) stats.vitality = ceilScale(Number(stats.vitality), modifiers.maxHp, 0);
  if (Number.isFinite(Number(stats.speed))) stats.speed = ceilScale(Number(stats.speed), modifiers.speed, 0);
  const result = {
    ...monster,
    hp: ceilScale(base.hp, modifiers.maxHp, 1),
    maxHp: ceilScale(base.maxHp, modifiers.maxHp, 1),
    attack: ceilScale(base.attack, modifiers.attack, 1),
    enemyDefense: ceilScale(base.defense, modifiers.defense, 0),
    defense: ceilScale(base.defense, modifiers.defense, 0),
    speed: ceilScale(base.speed, modifiers.speed, 0),
    stats,
    season: normalizedSeason,
    seasonScalingVersion: 2159,
    seasonBaseStats: Object.freeze({ ...base, stats: Object.freeze({ ...baseStats }) }),
    seasonScaling: Object.freeze({ season: normalizedSeason, attack: modifiers.attack, defense: modifiers.defense, maxHp: modifiers.maxHp, speed: modifiers.speed })
  };
  return result;
}

export function auditSeasonalWorldV2159() {
  const errors = [];
  for (const season of ['spring', 'summer', 'autumn', 'winter']) {
    const profile = resolveSeasonProfileV2158(season);
    if (!profile || !profile.label) errors.push(`missing-season-profile:${season}`);
  }
  const winter = getSeasonalMonsterModifiersV2158('winter');
  const spring = getSeasonalMonsterModifiersV2158('spring');
  const summer = getSeasonalMonsterModifiersV2158('summer');
  if (winter.attack !== 2 || spring.attack !== 1.2 || summer.attack !== 1) errors.push('seasonal-monster-attack-contract');
  const scaled = applySeasonalCombatScalingV2159({ hp: 100, maxHp: 100, attack: 10, enemyDefense: 20, speed: 10 }, 'winter');
  if (scaled.hp !== 135 || scaled.attack !== 20 || scaled.enemyDefense !== 30 || scaled.speed !== 11) errors.push('winter-live-scaling-contract');
  if (applySeasonalCombatScalingV2159(scaled, 'winter').attack !== 20) errors.push('same-season-scaling-stacked');
  return Object.freeze({ ok: errors.length === 0, version: 2159, seasons: 4, errors: Object.freeze(errors) });
}

if (typeof window !== 'undefined') {
  window.ETRANOM_SEASONAL_WORLD_V2159 = Object.freeze({ drawGround: drawSeasonalGroundCoverV2159, drawWaterIce: drawSeasonalWaterIceV2159, audit: auditSeasonalWorldV2159 });
  window.ETRANOM_SEASONAL_WORLD_AUDIT_V2159 = auditSeasonalWorldV2159();
  window.ETRANOM_APPLY_SEASONAL_COMBAT_V2159 = applySeasonalCombatScalingV2159;
}
