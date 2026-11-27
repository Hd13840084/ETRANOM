// ETRANOM V2164 — persistent per-cell snow accumulation, compaction and ice.
const TILE = 192;
const clamp = (n, a, b) => Math.max(a, Math.min(b, Number(n) || 0));
const tileKey = (x, y) => `${Math.floor(x / TILE)},${Math.floor(y / TILE)}`;

export function createSeasonalSurfaceStateV2164(existing = null) {
  const state = existing && typeof existing === 'object' ? existing : {};
  state.version = 2164;
  state.tileSize = TILE;
  state.tiles = state.tiles && typeof state.tiles === 'object' ? state.tiles : {};
  state.lastTickAt = Number(state.lastTickAt) || 0;
  state.lastCellKey = state.lastCellKey || null;
  return state;
}

/** Advance only the 3x3 cells around the active player; game-time is supplied in hours. */
export function stepSeasonalSurfaceStateV2164(existing, weather = {}, dtGameHours = 0, x = 0, y = 0) {
  const state = createSeasonalSurfaceStateV2164(existing);
  const dt = clamp(dtGameHours, 0, .1);
  if (dt <= 0) return state;
  const temp = Number.isFinite(Number(weather.temperatureC)) ? Number(weather.temperatureC) : (weather.season === 'winter' ? -3 : 8);
  const snowRate = clamp(weather.snow, 0, 1) * (temp <= 1 ? .045 : .012); // metres per game-hour at full storm intensity
  const rain = clamp(weather.rain, 0, 1);
  const wetness = clamp(weather.wetness, 0, 1);
  const cx = Math.floor(x / TILE), cy = Math.floor(y / TILE);
  const snowing = snowRate > .00001 && (weather.season === 'winter' || temp <= 1);
  for (let ty = cy - 1; ty <= cy + 1; ty++) for (let tx = cx - 1; tx <= cx + 1; tx++) {
    const key = `${tx},${ty}`;
    const old = state.tiles[key] || { snowDepthM: 0, iceThicknessM: 0, compaction: 0, lastUpdated: 0 };
    let snow = clamp(old.snowDepthM, 0, .6), ice = clamp(old.iceThicknessM, 0, .25), compact = clamp(old.compaction, 0, 1);
    if (snowing) snow += snowRate * dt;
    if (temp > 1.5) {
      const melt = Math.min(snow, ((temp - 1.5) * .0024 + rain * .003) * dt);
      snow -= melt;
      ice = Math.max(0, ice - (temp * .0014 + rain * .001) * dt);
    }
    if (temp <= 0 && (wetness > .25 || rain > .12) && snow < .025) ice += (wetness * .008 + rain * .012) * dt;
    if (temp <= -2 && snow > .02) ice += Math.min(.0009 * dt, snow * .002);
    // Compaction is localized to walked cells and decays very slowly after new snowfall.
    if (key === tileKey(x, y)) compact = clamp(compact + dt * .035, 0, .88);
    else compact = Math.max(0, compact - dt * .001);
    snow = clamp(snow, 0, .6); ice = clamp(ice, 0, .25);
    if (snow < .0005 && ice < .0005 && compact < .01) delete state.tiles[key];
    else state.tiles[key] = { snowDepthM: snow, iceThicknessM: ice, compaction: compact, lastUpdated: Date.now() };
  }
  state.lastCellKey = tileKey(x, y);
  // Bound persistent save payload: evict oldest/most distant cells beyond 144 entries.
  const keys = Object.keys(state.tiles);
  if (keys.length > 144) {
    keys.sort((a, b) => (Number(state.tiles[a]?.lastUpdated) || 0) - (Number(state.tiles[b]?.lastUpdated) || 0));
    for (const key of keys.slice(0, keys.length - 144)) delete state.tiles[key];
  }
  return state;
}

export function getSeasonalSurfaceAtV2164(state, x, y, weather = {}) {
  const key = tileKey(Number(x) || 0, Number(y) || 0);
  const tile = state?.tiles?.[key] || { snowDepthM: 0, iceThicknessM: 0, compaction: 0 };
  const snowfall = clamp(weather.snow, 0, 1);
  const baselineSnow = weather.season === 'winter' ? snowfall * .012 : 0;
  const snowDepthM = Math.max(Number(tile.snowDepthM) || 0, baselineSnow);
  const iceThicknessM = Math.max(0, Number(tile.iceThicknessM) || 0);
  const snowSeverity = clamp(snowDepthM / .24, 0, 1);
  const iceSeverity = clamp(iceThicknessM / .035, 0, 1);
  return Object.freeze({ tileKey: key, snowDepthM, iceThicknessM, compaction: clamp(tile.compaction, 0, 1),
    speedMultiplier: clamp(1 - snowSeverity * .18 - iceSeverity * .12, .62, 1),
    traction: clamp(1 - snowSeverity * .22 - iceSeverity * .58, .12, 1),
    accelerationMultiplier: clamp(1 - snowSeverity * .15 - iceSeverity * .18, .65, 1),
    surface: iceSeverity > .35 ? 'ice' : snowSeverity > .12 ? 'accumulated-snow' : 'base' });
}

export function drawAccumulatedSnowIceV2164(ctx, cameraX, cameraY, state) {
  if (!ctx?.save || !ctx?.beginPath || !state?.tiles) return { tiles: 0, drawn: 0 };
  const left = cameraX - 180, right = cameraX + 920, top = cameraY - 150, bottom = cameraY + 820;
  let drawn = 0;
  ctx.save();
  for (const [key, tile] of Object.entries(state.tiles)) {
    const [tx, ty] = key.split(',').map(Number), x = tx * TILE + TILE / 2, y = ty * TILE + TILE / 2;
    if (x < left || x > right || y < top || y > bottom) continue;
    const snow = clamp(tile.snowDepthM / .24, 0, .9), ice = clamp(tile.iceThicknessM / .04, 0, .7);
    if (snow < .015 && ice < .015) continue;
    ctx.fillStyle = `rgba(234,244,250,${snow * .18})`;
    ctx.beginPath(); ctx.moveTo(x, y - TILE * .46); ctx.lineTo(x + TILE * .46, y); ctx.lineTo(x, y + TILE * .46); ctx.lineTo(x - TILE * .46, y); ctx.closePath(); ctx.fill();
    if (ice > .04) { ctx.fillStyle = `rgba(181,220,239,${ice * .22})`; ctx.fill(); }
    drawn++;
  }
  ctx.restore();
  return Object.freeze({ tiles: Object.keys(state.tiles).length, drawn });
}

export function auditSeasonalSurfacePhysicsV2164() {
  const state = stepSeasonalSurfaceStateV2164(null, { season: 'winter', snow: 1, wetness: .2, temperatureC: -5 }, .05, 250, 250);
  const sample = getSeasonalSurfaceAtV2164(state, 250, 250, { season: 'winter', snow: 1 });
  const errors = [];
  if (!(sample.snowDepthM > 0)) errors.push('snow-not-accumulated');
  if (!(sample.speedMultiplier < 1 && sample.traction < 1)) errors.push('snow-not-physical');
  if (Object.keys(state.tiles).length > 9) errors.push('unbounded-active-cell-update');
  return Object.freeze({ ok: errors.length === 0, version: 2164, stage: 22, sample, errors: Object.freeze(errors) });
}
