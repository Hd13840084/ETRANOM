import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import {
  ETRANOM_ENVIRONMENTAL_DETAIL_V2163,
  buildEnvironmentalDetailRegistryV2163,
  buildGroundDetailSamplesV2163,
  drawEnvironmentalGroundDetailV2163,
  drawEnvironmentalAnchorDetailV2163,
  auditEnvironmentalDetailV2163
} from '../../systems/world/environmental-detail-v2163.js';

const root = resolve('.');
const gameSource = readFileSync(resolve(root, 'game.js'), 'utf8');
const indexSource = readFileSync(resolve(root, 'index.html'), 'utf8');
function readArray(marker) {
  const at = gameSource.indexOf(marker);
  assert.ok(at >= 0, `missing ${marker}`);
  const start = gameSource.indexOf('[', at);
  let depth = 0, quote = '', escape = false, lineComment = false, blockComment = false;
  for (let i = start; i < gameSource.length; i++) {
    const c = gameSource[i], next = gameSource[i + 1];
    if (lineComment) { if (c === '\n') lineComment = false; continue; }
    if (blockComment) { if (c === '*' && next === '/') { blockComment = false; i++; } continue; }
    if (quote) { if (escape) { escape = false; continue; } if (c === '\\') { escape = true; continue; } if (c === quote) quote = ''; continue; }
    if (c === '/' && next === '/') { lineComment = true; i++; continue; }
    if (c === '/' && next === '*') { blockComment = true; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '[') depth++;
    if (c === ']' && --depth === 0) return vm.runInNewContext(`(${gameSource.slice(start, i + 1)})`);
  }
  throw new Error(`unclosed source array: ${marker}`);
}
const buildings = readArray('const cityPOI =');
const registry = buildEnvironmentalDetailRegistryV2163({ buildings });

function makeCanvas() {
  const calls = { fill: 0, stroke: 0, path: 0, save: 0, restore: 0 };
  const ctx = {
    calls,
    save() { calls.save++; }, restore() { calls.restore++; }, beginPath() { calls.path++; },
    moveTo() {}, lineTo() {}, quadraticCurveTo() {}, ellipse() {}, arc() {}, fillRect() {}, strokeRect() {},
    fill() { calls.fill++; }, stroke() { calls.stroke++; }, closePath() {},
    set fillStyle(v) {}, set strokeStyle(v) {}, set lineWidth(v) {}, set globalAlpha(v) {}, set lineCap(v) {}, set lineJoin(v) {}
  };
  return ctx;
}

test('V2163 is explicitly Stage 21, preserves authored stage contracts and excludes owner-rejected Stage 16', () => {
  assert.equal(ETRANOM_ENVIRONMENTAL_DETAIL_V2163.version, 2163);
  assert.equal(ETRANOM_ENVIRONMENTAL_DETAIL_V2163.stage, 21);
  assert.equal(ETRANOM_ENVIRONMENTAL_DETAIL_V2163.excludedStages.includes(16), true);
  assert.equal(ETRANOM_ENVIRONMENTAL_DETAIL_V2163.sources.includes(19), true);
  assert.equal(ETRANOM_ENVIRONMENTAL_DETAIL_V2163.rendering.viewportCulled, true);
});

test('detail registry covers all 27 building foundations, tree roots, all environmental and authored props, roads, paths and waterways', () => {
  assert.equal(buildings.length, 27);
  assert.equal(registry.valid, true);
  assert.equal(registry.counts.foundation, 27 * 8);
  assert.ok(registry.counts.roots >= 41 * 2);
  assert.equal(registry.counts.propBases, 34 + 24);
  assert.ok(registry.counts.routeMarks > 0);
  assert.ok(registry.counts.bankMarks > 0);
  assert.equal(new Set(registry.anchors.map(a => a.id)).size, registry.total);
  assert.ok(registry.anchors.every(a => a.collision === 'none-visual-decal-only' && a.interaction === false));
  const audit = auditEnvironmentalDetailV2163({ buildings, registry });
  assert.equal(audit.ok, true, audit.errors.join(','));
  assert.equal(audit.buildings, 27);
});

test('ground detail samples are deterministic, bounded and season/weather responsive', () => {
  const options = { left: 800, top: 500, right: 1450, bottom: 1180, season: 'winter', weather: { season: 'winter', snow: .9, wetness: .2 }, maxSamples: 200 };
  const first = buildGroundDetailSamplesV2163(options);
  const second = buildGroundDetailSamplesV2163(options);
  assert.deepEqual(first, second);
  assert.ok(first.length <= 200 && first.length > 50);
  assert.ok(first.every(d => d.x >= 800 && d.x <= 1450 && d.y >= 500 && d.y <= 1180));
  assert.ok(first.some(d => d.kind === 'snow-driftlet' || d.kind === 'frost-crystal'));
  const autumn = buildGroundDetailSamplesV2163({ ...options, season: 'autumn', weather: { season: 'autumn' } });
  assert.ok(autumn.some(d => d.kind === 'fallen-leaf'));
  const spring = buildGroundDetailSamplesV2163({ ...options, season: 'spring', weather: { season: 'spring' } });
  assert.ok(spring.some(d => d.kind === 'spring-sprout'));
  const wet = buildGroundDetailSamplesV2163({ ...options, season: 'summer', weather: { season: 'summer', wetness: 1 } });
  assert.ok(wet.some(d => d.kind === 'shallow-puddle'));
});

test('Canvas2D ground and anchor passes render safely and enforce the per-frame sample budget', () => {
  const ctx = makeCanvas();
  const ground = drawEnvironmentalGroundDetailV2163(ctx, 1100, 900, { season: 'winter', snow: .9, wetness: .2 }, 1000);
  const anchors = drawEnvironmentalAnchorDetailV2163(ctx, registry, 1100, 900, { season: 'winter', snow: .9 }, 1000);
  assert.equal(ground.ok, true);
  assert.ok(ground.details <= 440);
  assert.equal(ground.season, 'winter');
  assert.equal(anchors.ok, true);
  assert.ok(anchors.details > 0);
  assert.ok(anchors.details <= registry.total);
  assert.ok(ctx.calls.fill > 0 && ctx.calls.stroke > 0);
  assert.equal(ctx.calls.save, ctx.calls.restore);
});

test('Stage 21 is bound to the real game startup and live world render loop, with refreshed cache key', () => {
  assert.match(gameSource, /__ETRANOM_GAME_BUILD__\s*=\s*'2166-stage24-world-validation'/);
  assert.match(gameSource, /buildEnvironmentalDetailRegistryV2163\(\{\s*buildings:\s*cityPOI\s*\}\)/);
  assert.match(gameSource, /drawEnvironmentalGroundDetailV2163\(ctx,\s*camX,\s*camY,\s*currentWeatherV2157,\s*t\)/);
  assert.match(gameSource, /drawEnvironmentalAnchorDetailV2163\(ctx,\s*environmentalDetailRegistryV2163,\s*camX,\s*camY,\s*currentWeatherV2157,\s*t\)/);
  assert.match(indexSource, /game\.js\?v=2166-stage24-world-validation&build=20261127/);
});
