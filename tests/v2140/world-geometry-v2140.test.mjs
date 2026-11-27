import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ETRANOM_WORLD_GEOMETRY_V2140,
  auditWorldGeometryV2140,
  pointInPolygonV2140,
  isSimplePolygonV2140,
  distanceToPolylineV2140,
  resolveTerrainFootprintV2140
} from '../../systems/world/world-geometry-v2140.js';
import { auditTerrainSpriteCatalogV2140, drawTerrainSpritesV2140 } from '../../systems/safe-zone/terrain-sprites-v2140.js';
import { drawSafeZoneWaterV2041 } from '../../systems/safe-zone/water-v2041.js';
import { drawWorldApproachesV2111 } from '../../systems/safe-zone/world-approaches-v2111.js';
import { drawPerimeterLandscapeV2112 } from '../../systems/safe-zone/perimeter-landscape-v2112.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('V2140 canonical geometry validates and retains prior world feature counts', () => {
  const audit = auditWorldGeometryV2140();
  assert.equal(audit.ok, true, audit.errors.join(', '));
  assert.deepEqual(audit.counts, {
    terrainFootprints: 4,
    dangerFrontiers: 6,
    routes: 3,
    gateApproaches: 10,
    waterways: 2,
    waterBasins: 2,
    terrainAssets: 16
  });
  assert.equal(ETRANOM_WORLD_GEOMETRY_V2140.coordinateContract.metersPerUnit, null);
  assert.equal(ETRANOM_WORLD_GEOMETRY_V2140.genreContract.genre, 'dark-fantasy-mmorpg');
});

test('settlement terrain polygons use stable, finite contours with expected anchors', () => {
  for (const region of ETRANOM_WORLD_GEOMETRY_V2140.terrainFootprints) {
    assert.equal(region.points.length, 48);
    assert.equal(isSimplePolygonV2140(region.points), true);
    assert.ok(region.points.every((point) => point.length === 2 && point.every(Number.isFinite)));
    assert.ok(region.bounds.minX < region.center.x && region.bounds.maxX > region.center.x);
    assert.ok(region.bounds.minY < region.center.y && region.bounds.maxY > region.center.y);
    assert.equal(region.collisionRole, 'none-stage-03-only');
  }
  assert.equal(resolveTerrainFootprintV2140(1500, 1050)?.id, 'ashen_city');
  assert.equal(resolveTerrainFootprintV2140(490, 800)?.id, 'farmland');
  assert.equal(resolveTerrainFootprintV2140(2480, 900)?.id, 'rootwood');
  assert.equal(resolveTerrainFootprintV2140(1900, 2140)?.id, 'ironstone');
  assert.equal(resolveTerrainFootprintV2140(8000, 6000), null);
});

test('polygon and polyline spatial helpers handle interior, exterior, simple contours and route distance', () => {
  const square = [[0,0],[10,0],[10,10],[0,10]];
  assert.equal(isSimplePolygonV2140(square), true);
  assert.equal(isSimplePolygonV2140([[0,0],[10,10],[0,10],[10,0]]), false);
  assert.equal(isSimplePolygonV2140([[0,0],[10,0],[10,0],[0,10]]), false);
  assert.equal(pointInPolygonV2140(5, 5, square), true);
  assert.equal(pointInPolygonV2140(15, 5, square), false);
  assert.ok(Math.abs(distanceToPolylineV2140(5, 3, [[0,0],[10,0]]) - 3) < 1e-9);
  assert.equal(distanceToPolylineV2140(NaN, 3, [[0,0],[10,0]]), Infinity);
});

test('all referenced existing Dark Fantasy art files are present in the source package', () => {
  const terrainManifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/safe-zone/terrain-v2096/manifest.json'), 'utf8'));
  const propManifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/safe-zone/props-v2099/manifest.json'), 'utf8'));
  const buildingManifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/safe-zone/buildings-v2100/manifest.json'), 'utf8'));
  const authoredManifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/safe-zone/props-v2137/manifest.json'), 'utf8'));
  const terrainFiles = ETRANOM_WORLD_GEOMETRY_V2140.terrainFootprints.flatMap((region) => region.assetFiles);
  assert.equal(terrainFiles.length, 16);
  for (const file of terrainFiles) assert.ok(fs.existsSync(path.join(root, 'assets/safe-zone/terrain-v2096', file)), `missing terrain tile ${file}`);
  assert.equal(Object.values(propManifest.groups).flat().length, 78);
  for (const group of Object.values(propManifest.groups)) for (const entry of group) assert.ok(fs.existsSync(path.join(root, 'assets/safe-zone/props-v2099', entry.file)), `missing prop ${entry.file}`);
  assert.equal(buildingManifest.buildings.length, 27);
  for (const entry of buildingManifest.buildings) assert.ok(fs.existsSync(path.join(root, 'assets/safe-zone/buildings-v2100', entry.file)), `missing building ${entry.file}`);
  assert.equal(authoredManifest.sprites.length, 12);
  for (const file of authoredManifest.sprites) assert.ok(fs.existsSync(path.join(root, 'assets/safe-zone/props-v2137', file)), `missing authored prop ${file}`);
  assert.equal(terrainManifest.integration.regionsConnected, 4);
});

test('terrain sprite catalog draws existing assets through the new polygon footprints', () => {
  const catalog = auditTerrainSpriteCatalogV2140();
  assert.equal(catalog.ok, true);
  assert.equal(catalog.tileVariants, 16);
  const priorImage = globalThis.Image;
  globalThis.Image = class {
    constructor() { this.complete = true; this.naturalWidth = 200; this.naturalHeight = 132; }
    set src(value) { this._src = value; }
    get src() { return this._src; }
  };
  const ctx = {
    draws: 0,
    save() {}, restore() {}, beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, clip() {},
    drawImage() { this.draws++; }
  };
  try {
    const result = drawTerrainSpritesV2140(ctx, 1500, 1050);
    assert.ok(result.drawn > 0);
    assert.ok(result.regions > 0);
    assert.equal(ctx.draws, result.drawn);
  } finally {
    if (priorImage === undefined) delete globalThis.Image;
    else globalThis.Image = priorImage;
  }
});


test('route, gate-approach and water renderers consume canonical V2140 geometry without runtime errors', () => {
  const calls = [];
  const ctx = new Proxy({}, {
    get(_target, key) {
      if (key === 'measureText') return () => ({ width: 10 });
      if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => ({ addColorStop() {} });
      if (typeof key === 'symbol') return undefined;
      return (...args) => { calls.push(String(key)); return undefined; };
    },
    set() { return true; }
  });
  assert.doesNotThrow(() => drawWorldApproachesV2111(ctx, 1500, 1050));
  assert.doesNotThrow(() => drawPerimeterLandscapeV2112(ctx, 0, 0));
  assert.doesNotThrow(() => drawSafeZoneWaterV2041(ctx, 1900, 1500, 1050));
  assert.ok(calls.includes('quadraticCurveTo') || calls.includes('lineTo'));
});

test('game entry point retains V2140 geometry under the V2154 master conformance build', () => {
  const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(game.includes("drawTerrainSpritesV2140(ctx, camX, camY)"));
  assert.ok(game.includes("window.__ETRANOM_GAME_BUILD__ = '2166-stage24-world-validation'"));
  assert.ok(game.includes('auditWorldGeometryV2140()'));
  assert.ok(index.includes('game.js?v=2166-stage24-world-validation&build=20261127'));
});
