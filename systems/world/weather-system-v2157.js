// ETRANOM V2157 — Stage 17: Weather.
// Deterministic regional and seasonal weather schedule with mobile-friendly Canvas2D effects.
// Weather is visual/environmental only in this stage: it does not alter combat, movement,
// collision, saves, item drops, or region unlock rules.

const WEATHER = Object.freeze({
  clear: Object.freeze({ id: 'clear', label: 'هوای صاف', cloud: 0.08, rain: 0, snow: 0, mist: 0.02, ash: 0, wind: 0.16, wetness: 0, temperature: 'mild' }),
  overcast: Object.freeze({ id: 'overcast', label: 'ابری', cloud: 0.74, rain: 0, snow: 0, mist: 0.08, ash: 0, wind: 0.25, wetness: 0, temperature: 'cool' }),
  rain: Object.freeze({ id: 'rain', label: 'بارانی', cloud: 0.9, rain: 0.56, snow: 0, mist: 0.12, ash: 0, wind: 0.42, wetness: 0.52, temperature: 'cool' }),
  heavy_rain: Object.freeze({ id: 'heavy_rain', label: 'باران شدید', cloud: 0.98, rain: 0.92, snow: 0, mist: 0.18, ash: 0, wind: 0.68, wetness: 0.88, temperature: 'cold' }),
  storm: Object.freeze({ id: 'storm', label: 'توفان و رعدوبرق', cloud: 1, rain: 0.86, snow: 0, mist: 0.22, ash: 0, wind: 0.96, wetness: 0.9, temperature: 'cold', lightning: true }),
  mist: Object.freeze({ id: 'mist', label: 'مه‌آلود', cloud: 0.48, rain: 0, snow: 0, mist: 0.88, ash: 0, wind: 0.12, wetness: 0.18, temperature: 'cool' }),
  snow: Object.freeze({ id: 'snow', label: 'برف', cloud: 0.86, rain: 0, snow: 0.72, mist: 0.14, ash: 0, wind: 0.32, wetness: 0.12, temperature: 'freezing' }),
  blizzard: Object.freeze({ id: 'blizzard', label: 'کولاک', cloud: 1, rain: 0, snow: 1, mist: 0.34, ash: 0, wind: 0.92, wetness: 0.2, temperature: 'freezing' }),
  ashfall: Object.freeze({ id: 'ashfall', label: 'بارش خاکستر', cloud: 0.76, rain: 0, snow: 0, mist: 0.22, ash: 0.82, wind: 0.58, wetness: 0, temperature: 'hot' })
});

const CLIMATES = Object.freeze({
  city: Object.freeze({ clear: 30, overcast: 25, rain: 20, heavy_rain: 6, storm: 7, mist: 12 }),
  grain: Object.freeze({ clear: 27, overcast: 20, rain: 26, heavy_rain: 8, storm: 9, mist: 10 }),
  rootwood: Object.freeze({ clear: 16, overcast: 21, rain: 25, heavy_rain: 9, storm: 9, mist: 20 }),
  ironhollow: Object.freeze({ clear: 23, overcast: 20, rain: 13, heavy_rain: 4, storm: 5, mist: 12, snow: 20, blizzard: 3 }),
  southern_plains: Object.freeze({ clear: 38, overcast: 22, rain: 15, heavy_rain: 4, storm: 7, mist: 8, ashfall: 6 }),
  thorn_grove: Object.freeze({ clear: 14, overcast: 23, rain: 23, heavy_rain: 8, storm: 8, mist: 22, ashfall: 2 }),
  ash_hills: Object.freeze({ clear: 20, overcast: 21, rain: 10, heavy_rain: 3, storm: 8, mist: 8, ashfall: 30 }),
  vardash_river: Object.freeze({ clear: 20, overcast: 20, rain: 19, heavy_rain: 7, storm: 8, mist: 26 }),
  burnt_forest: Object.freeze({ clear: 18, overcast: 22, rain: 11, heavy_rain: 4, storm: 7, mist: 12, ashfall: 26 }),
  rootbound_ruins: Object.freeze({ clear: 12, overcast: 20, rain: 16, heavy_rain: 5, storm: 8, mist: 34, ashfall: 5 }),
  frost_march: Object.freeze({ clear: 12, overcast: 17, rain: 4, heavy_rain: 1, storm: 4, mist: 10, snow: 34, blizzard: 18 }),
  drowned_mire: Object.freeze({ clear: 8, overcast: 19, rain: 22, heavy_rain: 9, storm: 8, mist: 34 }),
  obsidian_wastes: Object.freeze({ clear: 18, overcast: 19, rain: 2, heavy_rain: 0, storm: 9, mist: 7, ashfall: 45 }),
  haunted_highlands: Object.freeze({ clear: 8, overcast: 20, rain: 10, heavy_rain: 3, storm: 12, mist: 42, ashfall: 5 })
});

const REGION_ALIASES = Object.freeze({
  ashen_city: 'city', ash_city: 'city', settlement_ash_city: 'city', city: 'city',
  farmland: 'grain', grain: 'grain', village_grain: 'grain',
  rootwood: 'rootwood', village_rootwood: 'rootwood',
  ironstone: 'ironhollow', iron_hollow: 'ironhollow', ironhollow: 'ironhollow', village_ironhollow: 'ironhollow',
  southern_plain: 'southern_plains', southern_plains: 'southern_plains', region_southern_plain: 'southern_plains',
  thorn_grove: 'thorn_grove', region_thorn_grove: 'thorn_grove',
  ash_hills: 'ash_hills', region_ash_hills: 'ash_hills',
  vardash_river: 'vardash_river', verdash_river: 'vardash_river', region_vardash_west: 'vardash_river',
  burnt_forest: 'burnt_forest', ash_forest: 'burnt_forest', region_burnt_forest: 'burnt_forest',
  rootbound_ruins: 'rootbound_ruins', region_rootbound_ruins: 'rootbound_ruins',
  frost_march: 'frost_march', drowned_mire: 'drowned_mire', obsidian_wastes: 'obsidian_wastes', haunted_highlands: 'haunted_highlands'
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const finite = value => Number.isFinite(Number(value));
const hash32 = text => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};
const unitHash = text => hash32(text) / 0xffffffff;
const smoothstep = value => { const x = clamp(value, 0, 1); return x * x * (3 - 2 * x); };
const mod = (value, size) => ((value % size) + size) % size;

export function normalizeWeatherRegionV2157(regionId = 'city') {
  const key = String(regionId || 'city').toLowerCase().replace(/^region_/, '');
  return REGION_ALIASES[key] || REGION_ALIASES[String(regionId || '').toLowerCase()] || (CLIMATES[key] ? key : 'city');
}

export function resolveWeatherSeasonV2157(day = 1, explicitSeason = null) {
  const known = ['spring', 'summer', 'autumn', 'winter'];
  const supplied = String(explicitSeason || '').toLowerCase();
  if (known.includes(supplied)) return supplied;
  const d = Math.max(1, Math.floor(Number(day) || 1));
  return known[Math.floor(((d - 1) % 360) / 90)];
}

function seasonalWeights(region, season) {
  const source = CLIMATES[region] || CLIMATES.city;
  const weights = { ...source };
  const add = (key, amount) => { weights[key] = Math.max(0, (weights[key] || 0) + amount); };
  if (season === 'winter') {
    add('snow', region === 'ironhollow' || region === 'frost_march' ? 18 : 7);
    add('blizzard', region === 'frost_march' ? 9 : region === 'ironhollow' ? 3 : 0);
    add('rain', -8); add('heavy_rain', -4); add('mist', 4);
  } else if (season === 'summer') {
    add('clear', 12); add('mist', -5); add('snow', -35); add('blizzard', -20);
    if (['grain', 'rootwood', 'southern_plains'].includes(region)) add('storm', 3);
  } else if (season === 'autumn') {
    add('mist', 6); add('rain', 4); add('clear', -5);
  } else {
    add('rain', 3); add('mist', 2);
  }
  for (const key of Object.keys(weights)) weights[key] = Math.max(0, Number(weights[key]) || 0);
  return weights;
}

function chooseWeather(region, season, day, slot) {
  const weights = seasonalWeights(region, season);
  const rows = Object.entries(weights).filter(([id, weight]) => WEATHER[id] && weight > 0);
  const total = rows.reduce((sum, row) => sum + row[1], 0);
  if (!total) return 'clear';
  let cursor = unitHash(`${region}|${season}|${day}|${slot}|ETRANOM-WEATHER-2157`) * total;
  for (const [id, weight] of rows) {
    cursor -= weight;
    if (cursor <= 0) return id;
  }
  return rows.at(-1)[0];
}

function weatherBlend(fromId, toId, blend) {
  const from = WEATHER[fromId] || WEATHER.clear;
  const to = WEATHER[toId] || WEATHER.clear;
  const keys = ['cloud', 'rain', 'snow', 'mist', 'ash', 'wind', 'wetness'];
  const dominant = blend < 0.5 ? from : to;
  const result = { id: dominant.id, label: dominant.label, from: from.id, to: to.id, transition: blend, temperature: blend < 0.5 ? from.temperature : to.temperature };
  for (const key of keys) result[key] = from[key] + (to[key] - from[key]) * blend;
  result.lightning = !!((to.lightning && blend > 0.2) || (from.lightning && blend < 0.8));
  return Object.freeze(result);
}

/**
 * Resolve the deterministic 6-hour regional forecast slot from the saved world clock.
 * The first 45 in-game minutes of a slot crossfade from the previous weather type.
 */
export function resolveWeatherV2157(worldClock = {}, regionId = 'city') {
  const day = Math.max(1, Math.floor(Number(worldClock?.day) || 1));
  const hour = mod(Number(worldClock?.hour) || 0, 24);
  const minute = clamp(Number(worldClock?.minute) || 0, 0, 59.999);
  const region = normalizeWeatherRegionV2157(regionId);
  const season = resolveWeatherSeasonV2157(day, worldClock?.season);
  const minuteOfDay = hour * 60 + minute;
  const slot = Math.floor(minuteOfDay / 360);
  const minuteInSlot = minuteOfDay - slot * 360;
  const currentId = chooseWeather(region, season, day, slot);
  const previousAbsoluteSlot = (day - 1) * 4 + slot - 1;
  const previousDay = previousAbsoluteSlot < 0 ? 360 : Math.floor(previousAbsoluteSlot / 4) + 1;
  const previousSlot = mod(previousAbsoluteSlot, 4);
  // Keep the previous segment in its actual season when the calendar crosses a 90-day boundary.
  const crossedSeasonBoundary = day === 1 || ((day - 1) % 90 === 0 && slot === 0);
  const previousSeason = crossedSeasonBoundary ? resolveWeatherSeasonV2157(previousDay) : season;
  const previousId = chooseWeather(region, previousSeason, previousDay, previousSlot);
  const transition = smoothstep(minuteInSlot / 45);
  const current = weatherBlend(previousId, currentId, transition);
  const segmentStartMinute = (day - 1) * 1440 + slot * 360;
  return Object.freeze({
    version: 2157, stage: 17, region, season, day, hour, minute, slot,
    segmentStartMinute, segmentLengthMinutes: 360, transition,
    previousId, targetId: currentId, type: current.id, label: current.label,
    cloud: current.cloud, rain: current.rain, snow: current.snow, mist: current.mist,
    ash: current.ash, wind: current.wind, wetness: current.wetness,
    lightning: current.lightning, temperature: current.temperature,
    profile: current,
    climateWeights: Object.freeze(seasonalWeights(region, season))
  });
}

const PARTICLES = Object.freeze(Array.from({ length: 240 }, (_, index) => Object.freeze({
  x: unitHash(`weather-x-${index}`), y: unitHash(`weather-y-${index}`),
  speed: 0.62 + unitHash(`weather-speed-${index}`) * 0.9,
  size: 0.55 + unitHash(`weather-size-${index}`) * 1.2,
  phase: unitHash(`weather-phase-${index}`) * Math.PI * 2,
  length: 7 + unitHash(`weather-length-${index}`) * 11
})));
const FOG_PATCHES = Object.freeze(Array.from({ length: 13 }, (_, index) => Object.freeze({
  x: unitHash(`fog-x-${index}`), y: unitHash(`fog-y-${index}`),
  width: 95 + unitHash(`fog-w-${index}`) * 175,
  height: 24 + unitHash(`fog-h-${index}`) * 48,
  speed: 2 + unitHash(`fog-speed-${index}`) * 8,
  phase: unitHash(`fog-phase-${index}`) * Math.PI * 2
})));

function drawCloudCover(ctx, width, height, cloud, timeMs) {
  if (cloud <= 0.08) return;
  const alpha = clamp((cloud - 0.08) * 0.18, 0, 0.17);
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, `rgba(22,31,43,${alpha.toFixed(3)})`);
  gradient.addColorStop(0.55, `rgba(31,42,55,${(alpha * 0.55).toFixed(3)})`);
  gradient.addColorStop(1, 'rgba(26,36,47,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < 4; i++) {
    const x = mod(i * width * 0.31 + timeMs * (0.002 + i * 0.0003), width + 260) - 130;
    const y = 48 + i * 42;
    const radius = 105 + i * 22;
    const cloudGlow = ctx.createRadialGradient(x, y, 4, x, y, radius);
    cloudGlow.addColorStop(0, `rgba(111,126,142,${(alpha * 0.22).toFixed(3)})`);
    cloudGlow.addColorStop(1, 'rgba(111,126,142,0)');
    ctx.fillStyle = cloudGlow;
    ctx.fillRect(x - radius, y - radius * 0.42, radius * 2, radius * 0.84);
  }
}

function drawFog(ctx, width, height, amount, timeMs) {
  if (amount <= 0.015 || typeof ctx.createRadialGradient !== 'function') return 0;
  let drawn = 0;
  const seconds = timeMs / 1000;
  for (const patch of FOG_PATCHES) {
    const x = mod(patch.x * width + seconds * patch.speed * (0.5 + amount), width + patch.width * 2) - patch.width;
    const y = patch.y * height + Math.sin(seconds * 0.17 + patch.phase) * 18;
    const radius = patch.width * (0.55 + amount * 0.65);
    const gradient = ctx.createRadialGradient(x, y, 2, x, y, radius);
    gradient.addColorStop(0, `rgba(181,197,194,${(0.035 + amount * 0.075).toFixed(3)})`);
    gradient.addColorStop(0.55, `rgba(164,181,181,${(0.018 + amount * 0.04).toFixed(3)})`);
    gradient.addColorStop(1, 'rgba(164,181,181,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - patch.height, radius * 2, patch.height * 2);
    drawn++;
  }
  return drawn;
}

function drawRain(ctx, width, height, amount, wind, timeMs) {
  if (amount <= 0.01) return 0;
  const count = Math.round(24 + amount * 176);
  const seconds = timeMs / 1000;
  const slant = 0.13 + wind * 0.22;
  ctx.save();
  ctx.strokeStyle = `rgba(177,208,226,${(0.2 + amount * 0.26).toFixed(3)})`;
  ctx.lineWidth = amount > 0.72 ? 1.35 : 1;
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const p = PARTICLES[i];
    const x = mod(p.x * width + seconds * (54 + p.speed * 72) * (0.25 + wind) + p.phase * 9, width + 24) - 12;
    const y = mod(p.y * height + seconds * (170 + p.speed * 190) * (0.35 + amount), height + 28) - 14;
    const len = p.length * (0.55 + amount * 0.7);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - len * slant, y + len);
    ctx.stroke();
  }
  ctx.restore();
  return count;
}

function drawSnow(ctx, width, height, amount, wind, timeMs) {
  if (amount <= 0.01) return 0;
  const count = Math.round(22 + amount * 118);
  const seconds = timeMs / 1000;
  ctx.save();
  for (let i = 0; i < count; i++) {
    const p = PARTICLES[i];
    const x = mod(p.x * width + Math.sin(seconds * 0.65 + p.phase) * (8 + wind * 24) + seconds * wind * 9, width + 12) - 6;
    const y = mod(p.y * height + seconds * (17 + p.speed * 24) * (0.5 + amount), height + 12) - 6;
    ctx.globalAlpha = 0.32 + p.size * 0.28;
    ctx.fillStyle = '#e5edf0';
    ctx.beginPath();
    ctx.arc(x, y, p.size * (0.5 + amount * 0.45), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  return count;
}

function drawAsh(ctx, width, height, amount, wind, timeMs) {
  if (amount <= 0.01) return 0;
  const count = Math.round(18 + amount * 102);
  const seconds = timeMs / 1000;
  ctx.save();
  for (let i = 0; i < count; i++) {
    const p = PARTICLES[i];
    const x = mod(p.x * width + seconds * (12 + wind * 28) + Math.sin(seconds * 0.4 + p.phase) * 10, width + 10) - 5;
    const y = mod(p.y * height + seconds * (14 + p.speed * 18), height + 10) - 5;
    ctx.globalAlpha = 0.16 + amount * 0.28;
    ctx.fillStyle = i % 9 === 0 ? '#c17b50' : '#a6a19a';
    ctx.fillRect(x, y, 1.2 + p.size * 0.45, 1.2 + p.size * 0.45);
  }
  ctx.restore();
  return count;
}

function drawWindDrift(ctx, width, height, wind, timeMs, region) {
  if (wind <= 0.38) return 0;
  const count = Math.round(8 + wind * 24);
  const seconds = timeMs / 1000;
  const isWoodland = region === 'rootwood' || region === 'thorn_grove' || region === 'burnt_forest';
  ctx.save();
  for (let i = 0; i < count; i++) {
    const p = PARTICLES[i + 40];
    const x = mod(p.x * width + seconds * (23 + wind * 68) + Math.sin(seconds * 0.8 + p.phase) * 15, width + 18) - 9;
    const y = mod(p.y * height + Math.cos(seconds * 0.55 + p.phase) * (8 + wind * 13), height + 10) - 5;
    ctx.globalAlpha = 0.18 + wind * 0.32;
    ctx.strokeStyle = isWoodland ? (i % 3 === 0 ? '#a4a66e' : '#8a7958') : '#b6a27b';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(x - 3, y);
    ctx.quadraticCurveTo(x, y - 2.5, x + 4, y + 1);
    ctx.stroke();
  }
  ctx.restore();
  return count;
}

function drawWetSurface(ctx, width, height, wetness, timeMs) {
  if (wetness <= 0.02) return 0;
  const alpha = clamp(wetness * 0.095, 0, 0.09);
  ctx.fillStyle = `rgba(18,35,49,${alpha.toFixed(3)})`;
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  ctx.globalAlpha = wetness * 0.12;
  ctx.strokeStyle = '#b6d0d6';
  ctx.lineWidth = 1;
  for (let i = 0; i < 16; i++) {
    const x = mod(i * 67 + 23, width);
    const y = mod(i * 43 + 19, height);
    const pulse = 0.55 + 0.45 * Math.sin(timeMs / 520 + i * 1.7);
    ctx.beginPath();
    ctx.ellipse(x, y, 7 + pulse * 8, 1.2 + pulse * 1.1, -0.16, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  return 16;
}

function drawLightning(ctx, width, height, weather, timeMs, day, slot) {
  if (!weather.lightning || weather.rain < 0.45) return 0;
  const seconds = timeMs / 1000;
  const phase = mod(seconds + unitHash(`${day}|${slot}|storm-flash`) * 31, 31);
  const first = Math.exp(-Math.pow((phase - 8.2) / 0.075, 2)) * 0.42;
  const second = Math.exp(-Math.pow((phase - 8.48) / 0.11, 2)) * 0.23;
  const flash = Math.max(first, second);
  if (flash < 0.012) return 0;
  ctx.fillStyle = `rgba(190,215,255,${flash.toFixed(3)})`;
  ctx.fillRect(0, 0, width, height);
  const seed = unitHash(`${day}|${slot}|storm-bolt`);
  const startX = 50 + seed * (width - 100);
  ctx.save();
  ctx.strokeStyle = `rgba(211,231,255,${(flash * 2.1).toFixed(3)})`;
  ctx.lineWidth = 2.4;
  ctx.shadowColor = '#c4ddff';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.moveTo(startX, 0);
  ctx.lineTo(startX - 17, height * 0.16);
  ctx.lineTo(startX + 8, height * 0.27);
  ctx.lineTo(startX - 23, height * 0.42);
  ctx.lineTo(startX - 8, height * 0.55);
  ctx.stroke();
  ctx.restore();
  return 1;
}

/** Render all weather layers in viewport/screen space, independent of the isometric world transform. */
export function drawWeatherV2157(ctx, weather, timeMs = 0, options = {}) {
  if (!ctx?.save || !ctx?.restore || !ctx?.fillRect || !weather) return Object.freeze({ ok: false, particles: 0, fogPatches: 0 });
  const width = Math.max(1, Number(options.width) || Number(ctx.canvas?.width) || 720);
  const height = Math.max(1, Number(options.height) || Number(ctx.canvas?.height) || 650);
  const t = Math.max(0, Number(timeMs) || 0);
  const cloud = clamp(Number(weather.cloud) || 0, 0, 1);
  const rain = clamp(Number(weather.rain) || 0, 0, 1);
  const snow = clamp(Number(weather.snow) || 0, 0, 1);
  const mist = clamp(Number(weather.mist) || 0, 0, 1);
  const ash = clamp(Number(weather.ash) || 0, 0, 1);
  const wind = clamp(Number(weather.wind) || 0, 0, 1);
  const wetness = clamp(Number(weather.wetness) || 0, 0, 1);
  ctx.save();
  if (typeof ctx.setTransform === 'function') ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (typeof ctx.globalCompositeOperation === 'string') ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  drawCloudCover(ctx, width, height, cloud, t);
  const fogPatches = drawFog(ctx, width, height, mist, t);
  const rainParticles = drawRain(ctx, width, height, rain, wind, t);
  const snowParticles = drawSnow(ctx, width, height, snow, wind, t);
  const ashParticles = drawAsh(ctx, width, height, ash, wind, t);
  const windDebris = drawWindDrift(ctx, width, height, wind, t, weather.region);
  const puddles = drawWetSurface(ctx, width, height, wetness, t);
  const lightning = drawLightning(ctx, width, height, weather, t, Number(weather.day) || 1, Number(weather.slot) || 0);
  ctx.restore();
  return Object.freeze({ ok: true, region: weather.region, type: weather.type, cloud, rainParticles, snowParticles, ashParticles, fogPatches, windDebris, puddles, lightning });
}

export function getWeatherWindVectorV2157(weather, timeMs = 0) {
  const strength = clamp(Number(weather?.wind) || 0, 0, 1);
  const angle = -0.18 + Math.sin((Number(timeMs) || 0) / 7000) * 0.12 + strength * 0.16;
  return Object.freeze({ x: Math.cos(angle) * strength, y: Math.sin(angle) * strength, strength, gust: 0.72 + 0.28 * Math.sin((Number(timeMs) || 0) / 1900) });
}

export function auditWeatherSystemV2157() {
  const errors = [];
  for (const [id, row] of Object.entries(WEATHER)) {
    if (row.id !== id || !row.label) errors.push(`invalid-weather-definition:${id}`);
    for (const key of ['cloud', 'rain', 'snow', 'mist', 'ash', 'wind', 'wetness']) {
      if (!finite(row[key]) || row[key] < 0 || row[key] > 1) errors.push(`invalid-weather-factor:${id}:${key}`);
    }
  }
  for (const [region, weights] of Object.entries(CLIMATES)) {
    if (!Object.keys(weights).length || Object.entries(weights).some(([id, value]) => !WEATHER[id] || !finite(value) || value < 0)) errors.push(`invalid-climate-profile:${region}`);
  }
  const samples = ['city', 'grain', 'rootwood', 'ironhollow', 'frost_march', 'drowned_mire', 'obsidian_wastes'];
  const sampleForecasts = samples.map(region => resolveWeatherV2157({ day: 1, hour: 12, minute: 0, season: 'spring' }, region));
  if (sampleForecasts.some(row => !WEATHER[row.type] || row.stage !== 17)) errors.push('invalid-sample-forecast');
  return Object.freeze({ ok: errors.length === 0, version: 2157, stage: 17, weatherTypes: Object.keys(WEATHER).length, climateProfiles: Object.keys(CLIMATES).length, deterministicParticles: PARTICLES.length, fogPatches: FOG_PATCHES.length, sampleForecasts: Object.freeze(sampleForecasts.map(row => ({ region: row.region, type: row.type }))), errors: Object.freeze(errors) });
}

export const ETRANOM_WEATHER_V2157 = Object.freeze({
  version: 2157, stage: 17, stageName: 'Weather',
  schedule: Object.freeze({ segmentHours: 6, transitionMinutes: 45, deterministicFrom: ['worldClock.day', 'worldClock.hour', 'worldClock.minute', 'worldClock.season', 'regionId'] }),
  weatherTypes: WEATHER, climateProfiles: CLIMATES,
  rendering: Object.freeze(['cloud-cover tint', 'regional fog', 'rain', 'heavy rain', 'lightning', 'snow', 'blizzard', 'ashfall', 'wet-surface tint and puddle glints', 'wind field']),
  regions: Object.freeze(Object.keys(CLIMATES)),
  gameplayEffects: 'visual-only; no combat, movement, collision, save schema, drop, or unlock changes',
  audio: 'integrated-by-stage-18-environment-audio-v2160',
  limitations: Object.freeze(['precipitation is a viewport Canvas2D overlay rather than individual world-space droplets', 'no liquid accumulation, snow deformation, crop simulation, or physics response'])
});

if (typeof window !== 'undefined') {
  window.ETRANOM_WEATHER_V2157 = ETRANOM_WEATHER_V2157;
  window.ETRANOM_AUDIT_WEATHER_V2157 = auditWeatherSystemV2157();
  window.ETRANOM_RESOLVE_WEATHER_V2157 = resolveWeatherV2157;
}
