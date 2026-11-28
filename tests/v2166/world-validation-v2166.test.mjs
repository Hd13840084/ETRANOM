import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const assetDir = path.join(ROOT, 'assets/safe-zone/world-kit-v2166');

function extractRuntimeArray(source, name) {
  const declaration = `const ${name} = [`;
  const start = source.indexOf(declaration);
  assert.notEqual(start, -1, `Missing runtime source array ${name}`);
  const open = source.indexOf('[', start);
  const end = source.indexOf('\n    ];', open);
  assert.ok(end > open, `Could not locate end of runtime source array ${name}`);
  return new Function(`return (${source.slice(open, end + 6)})`)();
}

class TestImage {
  constructor() { this.complete = true; this.naturalWidth = 32; this.naturalHeight = 32; this.decoding = 'async'; }
  set src(value) { this._src = value; }
  get src() { return this._src; }
}

test('V2166: all 12 extracted world-kit PNG assets exist and preserve transparent RGBA source files', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(assetDir, 'manifest.json'), 'utf8'));
  assert.equal(manifest.version, 2166);
  assert.equal(manifest.stage, 24);
  assert.equal(manifest.assets.length, 12);
  for (const row of manifest.assets) {
    const file = path.join(assetDir, row.file);
    assert.ok(fs.existsSync(file), `missing ${row.file}`);
    const bytes = fs.readFileSync(file);
    assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.ok(bytes.length > 100_000, `unexpectedly small cropped sprite: ${row.file}`);
    assert.equal(bytes.readUInt32BE(16), row.dimensions_px[0]);
    assert.equal(bytes.readUInt32BE(20), row.dimensions_px[1]);
    assert.equal(bytes[25], 6, `${row.file} must be RGBA PNG`);
    assert.ok(row.source_alpha_component_area > 20_000, `weak alpha component: ${row.file}`);
  }
});

test('V2166: world art kit placements are bound to canonical roads, paths, bridges and gates', async () => {
  globalThis.Image = TestImage;
  const { ETRANOM_WORLD_ART_KIT_V2166, auditWorldArtKitV2166, drawWorldArtKitGroundV2166, drawWorldArtKitStructuresV2166 } =
    await import('../../systems/world/world-art-kit-v2166.js?v=2166-tests');
  const audit = auditWorldArtKitV2166();
  assert.equal(audit.ok, true, audit.errors.join(', '));
  assert.equal(ETRANOM_WORLD_ART_KIT_V2166.assets.length, 12);
  assert.equal(ETRANOM_WORLD_ART_KIT_V2166.roadBindings.length, 3);
  assert.equal(ETRANOM_WORLD_ART_KIT_V2166.footpathBindings.length, 5);
  assert.equal(ETRANOM_WORLD_ART_KIT_V2166.gateBindings.length, 10);
  assert.equal(ETRANOM_WORLD_ART_KIT_V2166.bridgeBindings.length, 1);
  assert.equal(ETRANOM_WORLD_ART_KIT_V2166.intentionallyUnplaced.length, 5);

  const calls = [];
  const ctx = {
    save() {}, restore() {}, translate() {}, rotate() {},
    drawImage(image, ...args) { calls.push({ src: image.src, args }); }
  };
  const ground = drawWorldArtKitGroundV2166(ctx, 0, 0);
  const structures = drawWorldArtKitStructuresV2166(ctx, 0, 0, 'summer');
  assert.ok(ground.roads > 0, 'road sprites did not render');
  assert.ok(ground.footpaths > 0, 'footpath sprites did not render');
  assert.ok(structures.gates > 0, 'visible gate sprites did not render');
  assert.ok(structures.bridges > 0, 'wood bridge sprite did not render');
  assert.ok(calls.length >= ground.roads + ground.footpaths + structures.gates + structures.bridges);
});

test('V2166: production runtime world passes the complete cross-stage audit through Stage 23', async () => {
  globalThis.Image = TestImage;
  const source = fs.readFileSync(path.join(ROOT, 'game.js'), 'utf8');
  const buildings = extractRuntimeArray(source, 'cityPOI');
  const npcs = extractRuntimeArray(source, 'safeNPCs');
  const { ETRANOM_WORLD_STRUCTURE_V2138 } = await import('../../systems/world/world-structure-v2138.js');
  const { ETRANOM_VEHICLE_SYSTEM_V2149 } = await import('../../systems/world/vehicle-system-v2149.js');
  const { ETRANOM_TREES_VEGETATION_V2148 } = await import('../../systems/safe-zone/trees-vegetation-v2148.js');
  const { buildWorldPhysicsWorldV2161 } = await import('../../systems/world/physics-collision-v2161.js');
  const { auditStage23FinalQualityV2165 } = await import('../../systems/world/stage23-final-quality-v2165.js');
  const { auditWorldValidationV2166 } = await import('../../systems/world/world-validation-v2166.js');

  const landmarks = ETRANOM_WORLD_STRUCTURE_V2138.regions.safeWorld.landmarks;
  const vehicles = ETRANOM_VEHICLE_SYSTEM_V2149.placements;
  const trees = ETRANOM_TREES_VEGETATION_V2148.trees;
  const world = buildWorldPhysicsWorldV2161({ buildings, npcs, landmarks });
  const stage23 = auditStage23FinalQualityV2165({ world, buildings, trees, vehicles });
  const report = auditWorldValidationV2166({ world, buildings, npcs, landmarks, vehicles, trees, stage23Audit: stage23 });

  assert.equal(buildings.length, 27);
  assert.equal(npcs.length, 20);
  assert.equal(landmarks.length, 8);
  assert.equal(vehicles.length, 8);
  assert.equal(world.colliders.length, 212);
  assert.equal(stage23.ok, true, stage23.errors.join(', '));
  assert.equal(report.ok, true, report.errors.join('\n'));
  assert.equal(report.auditCount, 35);
  assert.equal(report.metrics.artAssets, 12);
  assert.ok(report.stagesAudited.some(stage => stage.startsWith('16:excluded-by-project-scope')));
});

test('V2166: game entry wires the new visual kit and Stage 24 audit into the live runtime', () => {
  const game = fs.readFileSync(path.join(ROOT, 'game.js'), 'utf8');
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const sprite = fs.readFileSync(path.join(ROOT, 'systems/safe-zone/sprite-conversion-v2118.js'), 'utf8');
  const harbingerPanel = fs.readFileSync(path.join(ROOT, 'systems/classes/apocalypse-harbinger-panel.js'), 'utf8');
  const chaosData = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/classes/warrior_chaos_warrior_v1.json'), 'utf8'));
  assert.match(game, /world-art-kit-v2167\.js\?v=2167/);
  assert.match(game, /world-validation-v2166\.js\?v=2166/);
  assert.match(game, /drawWorldArtKitGroundV2167\(ctx, camX, camY\)/);
  assert.match(game, /drawWorldArtKitStructuresV2167\(ctx, camX, camY/);
  assert.match(game, /ETRANOM_WORLD_VALIDATION_AUDIT_V2166/);
  assert.match(game, /2176-stage32-complete-world-audit-map/);
  assert.match(html, /game\.js\?v=2176-stage32-complete-world-audit-map/);
  assert.match(sprite, /useV2166WorldArt/);
  assert.match(harbingerPanel, /src="\.\/assets\/classes\/apocalypse_harbinger_portrait\.webp"/);
  assert.doesNotMatch(harbingerPanel, /src="\.\.\/\.\.\/assets\//);
  assert.ok(JSON.stringify(chaosData).includes('chaos_warrior_portrait.webp'));
});
