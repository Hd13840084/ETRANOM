import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  ETRANOM_WEATHER_V2157,
  auditWeatherSystemV2157,
  normalizeWeatherRegionV2157,
  resolveWeatherSeasonV2157,
  resolveWeatherV2157,
  drawWeatherV2157,
  getWeatherWindVectorV2157
} from '../../systems/world/weather-system-v2157.js';

const root = process.cwd();

function createCanvasMock() {
  const calls = { save: 0, restore: 0, fillRect: 0, stroke: 0, fill: 0, arcs: 0, paths: 0, transforms: 0 };
  const gradient = { addColorStop() {} };
  const ctx = {
    canvas: { width: 720, height: 650 },
    save() { calls.save++; }, restore() { calls.restore++; },
    setTransform() { calls.transforms++; },
    fillRect() { calls.fillRect++; },
    createLinearGradient() { return gradient; }, createRadialGradient() { return gradient; },
    beginPath() { calls.paths++; }, moveTo() {}, lineTo() {}, quadraticCurveTo() {}, closePath() {},
    stroke() { calls.stroke++; }, fill() { calls.fill++; },
    arc() { calls.arcs++; }, ellipse() { calls.arcs++; }
  };
  return { ctx, calls };
}

test('V2157 weather catalog and climate profiles pass the internal audit', () => {
  const audit = auditWeatherSystemV2157();
  assert.equal(audit.ok, true, JSON.stringify(audit.errors));
  assert.equal(audit.weatherTypes, 9);
  assert.equal(audit.climateProfiles, 14);
  assert.equal(ETRANOM_WEATHER_V2157.stage, 17);
  assert.equal(ETRANOM_WEATHER_V2157.schedule.segmentHours, 6);
});

test('regional aliases resolve all four safe settlements and frontier climates', () => {
  assert.equal(normalizeWeatherRegionV2157('settlement_ash_city'), 'city');
  assert.equal(normalizeWeatherRegionV2157('village_grain'), 'grain');
  assert.equal(normalizeWeatherRegionV2157('village_rootwood'), 'rootwood');
  assert.equal(normalizeWeatherRegionV2157('village_ironhollow'), 'ironhollow');
  assert.equal(normalizeWeatherRegionV2157('region_ash_hills'), 'ash_hills');
  assert.equal(normalizeWeatherRegionV2157('region_vardash_west'), 'vardash_river');
  assert.equal(normalizeWeatherRegionV2157('region_rootbound_ruins'), 'rootbound_ruins');
});

test('forecast is deterministic for the same save clock and region', () => {
  const clock = { day: 47, hour: 13, minute: 27, season: 'autumn' };
  const one = resolveWeatherV2157(clock, 'rootwood');
  const two = resolveWeatherV2157(clock, 'rootwood');
  assert.deepEqual(one, two);
  assert.ok(one.type);
  assert.ok(one.label);
  assert.ok(one.transition >= 0 && one.transition <= 1);
  assert.ok(one.cloud >= 0 && one.cloud <= 1);
  assert.ok(one.rain >= 0 && one.rain <= 1);
});

test('six-hour weather slots crossfade from the previous regional forecast', () => {
  const start = resolveWeatherV2157({ day: 1, hour: 12, minute: 0, season: 'spring' }, 'city');
  const mid = resolveWeatherV2157({ day: 1, hour: 12, minute: 22, season: 'spring' }, 'city');
  const settled = resolveWeatherV2157({ day: 1, hour: 12, minute: 50, season: 'spring' }, 'city');
  assert.equal(start.transition, 0);
  assert.ok(mid.transition > 0 && mid.transition < 1);
  assert.equal(settled.transition, 1);
  assert.equal(start.type, start.previousId);
  assert.equal(settled.type, settled.targetId);
});

test('seasonal weather probabilities reflect cold and warm climates', () => {
  const winter = resolveWeatherV2157({ day: 280, hour: 12, minute: 0, season: 'winter' }, 'ironhollow');
  const summer = resolveWeatherV2157({ day: 100, hour: 12, minute: 0, season: 'summer' }, 'ironhollow');
  assert.ok(winter.climateWeights.snow > summer.climateWeights.snow);
  assert.equal(resolveWeatherSeasonV2157(95), 'summer');
  assert.equal(resolveWeatherSeasonV2157(185), 'autumn');
  assert.equal(resolveWeatherSeasonV2157(275), 'winter');
});

test('viewport weather renderer draws rain, mist, wetness and preserves canvas state', () => {
  const { ctx, calls } = createCanvasMock();
  const storm = {
    region: 'grain', type: 'storm', day: 6, slot: 2, cloud: 1, rain: 0.92,
    snow: 0, mist: 0.22, ash: 0, wind: 0.96, wetness: 0.9, lightning: true
  };
  const result = drawWeatherV2157(ctx, storm, 15000);
  assert.equal(result.ok, true);
  assert.ok(result.rainParticles > 100);
  assert.equal(result.fogPatches, 13);
  assert.equal(result.puddles, 16);
  assert.ok(calls.fillRect > 0);
  assert.equal(calls.save, calls.restore);
  assert.equal(calls.transforms, 1);
});

test('snow and ashfall use distinct particle systems and wind exposes a bounded vector', () => {
  const { ctx } = createCanvasMock();
  const snow = drawWeatherV2157(ctx, { region: 'ironhollow', type: 'snow', cloud: 0.86, rain: 0, snow: 0.72, mist: 0.14, ash: 0, wind: 0.32, wetness: 0.12, lightning: false }, 9000);
  const ash = drawWeatherV2157(ctx, { region: 'ash_hills', type: 'ashfall', cloud: 0.76, rain: 0, snow: 0, mist: 0.22, ash: 0.82, wind: 0.58, wetness: 0, lightning: false }, 9000);
  assert.ok(snow.snowParticles > 0);
  assert.equal(snow.ashParticles, 0);
  assert.ok(ash.ashParticles > 0);
  assert.equal(ash.snowParticles, 0);
  const wind = getWeatherWindVectorV2157({ wind: 0.8 }, 1200);
  assert.ok(Math.hypot(wind.x, wind.y) <= 1.001);
  assert.equal(wind.strength, 0.8);
});

test('weather system and wind response are connected to the live world render', () => {
  const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const vegetation = fs.readFileSync(path.join(root, 'systems/safe-zone/trees-vegetation-v2148.js'), 'utf8');
  assert.match(game, /weather-system-v2157\.js\?v=2157/);
  assert.match(game, /const weatherRegionId = state\.currentDangerRegion \|\| \(state\.inWesternDanger \? state\.selectedDangerRegion : null\) \|\| resolveSafeSettlementV2138\(p\.x, p\.y\)\?\.id \|\| 'city'/);
  assert.match(game, /resolveWeatherV2157\(state\.worldClock, weatherRegionId\)/);
  assert.match(game, /drawWeatherV2157\(ctx, currentWeatherV2157, t\)/);
  assert.match(game, /getWeatherWindVectorV2157\(currentWeatherV2157, t\)/);
  assert.match(game, /drawTreesVegetationV2148\(ctx, camX, camY, p\.x, p\.y, weatherWindV2157, qualityProfileV2164\.vegetationMotion \? t : 0, currentWeatherV2157\.season\)/);
  assert.match(game, /drawForegroundTreesVegetationV2148\(ctx, p\.x, p\.y, camX, camY, weatherWindV2157, qualityProfileV2164\.vegetationMotion \? t : 0, currentWeatherV2157\.season\)/);
  assert.match(index, /game\.js\?v=2166-stage24-world-validation/);
  assert.match(vegetation, /ctx\.rotate\(sway\)/);
  assert.doesNotMatch(game, /const weatherDay =/);
  assert.doesNotMatch(game, /for \(const d of rainDrops\)/);
});


test('season-boundary forecast blends from the prior calendar season, including year rollover', () => {
  const springToSummer = resolveWeatherV2157({ day: 91, hour: 0, minute: 0, season: 'summer' }, 'ironhollow');
  assert.equal(springToSummer.previousId, resolveWeatherV2157({ day: 90, hour: 18, minute: 0, season: 'spring' }, 'ironhollow').targetId);
  const yearRollover = resolveWeatherV2157({ day: 1, hour: 0, minute: 0, season: 'spring' }, 'ironhollow');
  assert.equal(yearRollover.previousId, resolveWeatherV2157({ day: 360, hour: 18, minute: 0, season: 'winter' }, 'ironhollow').targetId);
});
