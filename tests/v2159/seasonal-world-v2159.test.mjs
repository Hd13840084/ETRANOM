import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  drawSeasonalGroundCoverV2159,
  drawSeasonalFoliageOverlayV2159,
  drawSeasonalBuildingCapV2159,
  drawSeasonalPropCapV2159,
  drawSeasonalWaterIceV2159,
  resolveSeasonalMovementResponseV2159,
  applySeasonalCombatScalingV2159,
  auditSeasonalWorldV2159
} from '../../systems/world/seasonal-world-v2159.js';

function makeContext() {
  const calls = { fills: 0, strokes: 0, rectangles: 0, paths: 0 };
  const ctx = {
    calls, save(){}, restore(){}, fillRect(){calls.rectangles++;}, beginPath(){calls.paths++;},
    moveTo(){}, lineTo(){}, quadraticCurveTo(){}, ellipse(){}, arc(){}, closePath(){}, fill(){calls.fills++;},
    stroke(){calls.strokes++;}, set globalCompositeOperation(v){}, get globalCompositeOperation(){return 'source-over';},
    set fillStyle(v){}, set strokeStyle(v){}, set lineWidth(v){}, set lineCap(v){}
  };
  return ctx;
}

test('four seasonal ground passes resolve deterministic world-space covers', () => {
  for (const season of ['spring','summer','autumn','winter']) {
    const a = makeContext(), b = makeContext();
    const r1 = drawSeasonalGroundCoverV2159(a, 100, 200, 0, 0, { season, snow: 0.7, wetness: 0.8, temperature: -4 }, 500);
    const r2 = drawSeasonalGroundCoverV2159(b, 100, 200, 0, 0, { season, snow: 0.7, wetness: 0.8, temperature: -4 }, 500);
    assert.equal(r1.ok, true);
    assert.equal(r1.season, season);
    assert.equal(r1.details, r2.details);
    assert.equal(r1.tiles, r2.tiles);
    assert.equal(r1.snowCoverage, season === 'winter' ? 1 : 0);
  }
});

test('winter foliage and building passes draw local snow coatings', () => {
  const ctx = makeContext();
  assert.equal(drawSeasonalFoliageOverlayV2159(ctx, {id:'tree-test',kind:'tree'}, 120, 180, 'winter'), true);
  assert.equal(ctx.calls.fills > 0, true);
  assert.equal(drawSeasonalBuildingCapV2159(ctx, 100, 30, 200, 140, 'winter', 'inn'), true);
  assert.equal(drawSeasonalBuildingCapV2159(ctx, 100, 30, 200, 140, 'summer', 'inn'), false);
  assert.equal(drawSeasonalPropCapV2159(ctx, 100, 200, 60, 80, 'winter', 'crate-1'), true);
  const ice = drawSeasonalWaterIceV2159(ctx, 0, 0, {season:'winter',temperature:'freezing'});
  assert.equal(ice.ok, true);
  assert.ok(ice.freeze > 0, 'weather temperature descriptors must activate freezing');
  assert.ok(ice.frozen >= 1);
});

test('winter terrain response has lower acceleration and slower deceleration than normal ground', () => {
  const winter = resolveSeasonalMovementResponseV2159('winter', {snow:0.8,wetness:0.6,temperature:'freezing'});
  const summer = resolveSeasonalMovementResponseV2159('summer', {snow:0,wetness:0,temperature:25});
  assert.equal(winter.surface === 'ice' || winter.surface === 'snow', true);
  assert.ok(winter.acceleration < summer.acceleration);
  assert.ok(winter.deceleration < summer.deceleration);
  assert.ok(winter.speedMultiplier < 1);
  assert.equal(winter.surface, 'ice', 'freezing weather descriptor should produce an icy movement surface');
});

test('seasonal monster scaling changes live combat stats exactly once', () => {
  const base = {hp:100,maxHp:100,attack:10,enemyDefense:20,speed:10,stats:{power:10,attack:10,endurance:20,defense:20,vitality:100,hp:100,maxHp:100,speed:10}};
  const winter = applySeasonalCombatScalingV2159(base, 'winter');
  assert.equal(winter.attack, 20);
  assert.equal(winter.enemyDefense, 30);
  assert.equal(winter.maxHp, 135);
  assert.equal(winter.hp, 135);
  assert.equal(winter.speed, 11);
  assert.equal(applySeasonalCombatScalingV2159(winter, 'winter').attack, 20);
  assert.equal(winter.stats.hp, 135);
  assert.equal(winter.stats.defense, 30);
  const resetToSummer = applySeasonalCombatScalingV2159(winter, 'summer');
  assert.equal(resetToSummer.attack, 10, 'season changes must recompute from base stats, not stack');
  assert.equal(resetToSummer.maxHp, 100);
  assert.equal(base.attack, 10);
  const spring = applySeasonalCombatScalingV2159(base, 'spring');
  assert.equal(spring.attack, 12);
  assert.equal(spring.enemyDefense, 22);
  assert.equal(spring.maxHp, 105);
  assert.equal(applySeasonalCombatScalingV2159(base, 'summer').attack, 10);
  const autumn = applySeasonalCombatScalingV2159(base, 'autumn');
  assert.equal(autumn.attack, 11);
  assert.equal(autumn.enemyDefense, 21);
});

test('seasonal world audit is valid', () => {
  assert.equal(auditSeasonalWorldV2159().ok, true);
});


test('V2159 is connected to world rendering, props, building/trees, movement and the live monster combat start', () => {
  const game = fs.readFileSync(path.resolve('game.js'), 'utf8');
  const index = fs.readFileSync(path.resolve('index.html'), 'utf8');
  const trees = fs.readFileSync(path.resolve('systems/safe-zone/trees-vegetation-v2148.js'), 'utf8');
  const buildings = fs.readFileSync(path.resolve('systems/safe-zone/building-sprites-v2100.js'), 'utf8');
  const props = fs.readFileSync(path.resolve('systems/safe-zone/environmental-props-v2147.js'), 'utf8');
  const legacyProps = fs.readFileSync(path.resolve('systems/safe-zone/environment-props-v2099.js'), 'utf8');
  const authoredProps = fs.readFileSync(path.resolve('systems/safe-zone/authored-props-v2137.js'), 'utf8');
  const vehicles = fs.readFileSync(path.resolve('systems/world/vehicle-system-v2149.js'), 'utf8');
  const spriteGround = fs.readFileSync(path.resolve('systems/safe-zone/sprite-conversion-v2118.js'), 'utf8');
  const nature = fs.readFileSync(path.resolve('systems/safe-zone/nature-v2040.js'), 'utf8');
  assert.match(game, /drawSeasonalGroundCoverV2159\(ctx, camX, camY, p\.x, p\.y, currentWeatherV2157, t\)/);
  assert.ok(game.indexOf("drawSafeZoneSpriteGroundV2118(ctx, t, camX, camY, currentWeatherV2157.season, 'ground')") < game.indexOf('drawSeasonalGroundCoverV2159(ctx, camX, camY'));
  assert.ok(game.indexOf('drawSeasonalGroundCoverV2159(ctx, camX, camY') < game.indexOf('drawEnvironmentalPropsV2147(ctx, camX, camY'));
  assert.match(game, /resolveSeasonalMovementResponseV2159\(movementWeather\.season, movementWeather\)/);
  assert.match(game, /applySeasonalCombatScalingV2159\(e, combatSeason\)/);
  assert.match(game, /drawSeasonalWaterIceV2159\(ctx, camX, camY, currentWeatherV2157\)/);
  assert.match(trees, /drawSeasonalFoliageOverlayV2159/);
  assert.match(buildings, /drawSeasonalBuildingCapV2159/);
  assert.match(props, /drawSeasonalPropCapV2159/);
  assert.match(legacyProps, /drawSeasonalPropCapV2159/);
  assert.match(authoredProps, /drawSeasonalPropCapV2159/);
  assert.match(vehicles, /drawSeasonalPropCapV2159/);
  assert.match(game, /drawForegroundEnvironmentPropsV2127\(ctx, p\.x, p\.y, currentWeatherV2157\.season\)/);
  assert.match(game, /drawForegroundAuthoredSafeWorldPropsV2137\(ctx, p\.x, p\.y, currentWeatherV2157\.season\)/);
  assert.match(spriteGround, /drawSeasonalPropCapV2159/);
  assert.match(nature, /drawSeasonalFoliageOverlayV2159/);
  assert.match(nature, /drawSeasonalPropCapV2159/);
  assert.match(game, /drawSafeZoneNatureV2040\(ctx, t, camX, camY, currentWeatherV2157\.season\)/);
  assert.match(game, /drawSafeZoneSpriteGroundV2118\(ctx, t, camX, camY, currentWeatherV2157\.season, 'ground'\)/);
  assert.match(game, /drawVehicleSystemV2149\(ctx, camX, camY, p\.x, p\.y, currentWeatherV2157\.season\)/);
  assert.match(game, /drawEnvironmentPropsV2099\(ctx, camX, camY, currentWeatherV2157\.season\)/);
  assert.match(game, /drawAuthoredSafeWorldPropsV2137\(ctx, camX, camY, currentWeatherV2157\.season\)/);
  assert.match(index, /game\.js\?v=2166-stage24-world-validation/);
  assert.doesNotMatch(game, /drawSeasonalWorldV2158\(ctx/);
});
