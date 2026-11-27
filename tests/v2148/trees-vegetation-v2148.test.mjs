import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  ETRANOM_TREES_VEGETATION_V2148,
  auditTreesVegetationV2148,
  drawTreesVegetationV2148,
  drawForegroundTreesVegetationV2148
} from '../../systems/safe-zone/trees-vegetation-v2148.js';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'../..');
const game=readFileSync(resolve(root,'game.js'),'utf8');
const index=readFileSync(resolve(root,'index.html'),'utf8');

test('V2148 provides biome-specific tree and understory placements with all 18 authored sprite variants',()=>{
  const audit=auditTreesVegetationV2148();
  assert.equal(audit.ok,true);
  assert.equal(audit.treeWindAnimation,true);
  assert.equal(audit.biomes,4);
  assert.equal(audit.uniqueAssets,18);
  assert.equal(audit.allEightTreeVariants,true);
  assert.equal(audit.allTenUnderstoryVariants,true);
  assert.equal(ETRANOM_TREES_VEGETATION_V2148.trees.length,41);
  assert.equal(ETRANOM_TREES_VEGETATION_V2148.understory.length,50);
  assert.equal(new Set(ETRANOM_TREES_VEGETATION_V2148.placements.map(p=>p.id)).size,91);
});

test('all referenced tree and vegetation PNGs exist in the project',()=>{
  const files=[...ETRANOM_TREES_VEGETATION_V2148.assetCatalog.trees,...ETRANOM_TREES_VEGETATION_V2148.assetCatalog.understory];
  for(const file of files) assert.equal(existsSync(resolve(root,'assets/safe-zone/props-v2099',file)),true,file);
});

test('placements retain ground anchors, sampled relief, biome and deferred physical collision contracts',()=>{
  for(const p of ETRANOM_TREES_VEGETATION_V2148.placements){
    assert.ok(p.id && p.file && p.biome && p.role);
    assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.width));
    assert.ok(Number.isFinite(p.elevation));
    assert.ok(['flat','gentle','moderate','steep','cliff'].includes(p.slope));
    assert.ok(['stage-19-live-trunk-footprint','stage-19-live-role-based'].includes(p.collision.policy));
    assert.ok(p.depth===p.x+p.y);
  }
});

test('V2148 is integrated in the world render, foreground depth pass and cache key',()=>{
  assert.match(game,/trees-vegetation-v2148\.js\?v=2162/);
  assert.match(game,/drawTreesVegetationV2148\(ctx, camX, camY, p\.x, p\.y, weatherWindV2157, qualityProfileV2164\.vegetationMotion \? t : 0, currentWeatherV2157\.season\)/);
  assert.match(game,/drawForegroundTreesVegetationV2148\(ctx, p\.x, p\.y, camX, camY, weatherWindV2157, qualityProfileV2164\.vegetationMotion \? t : 0, currentWeatherV2157\.season\)/);
  assert.match(game,/environment-audio-v2160\.js\?v=2160/);
  assert.match(game,/drawVehicleSystemV2149/);
  assert.match(index,/game\.js\?v=2166-stage24-world-validation/);
});

test('background and foreground passes split placements by x+y ground-anchor depth and cull by viewport',()=>{
  const oldImage=globalThis.Image;
  globalThis.Image=class { constructor(){this.complete=true;this.naturalWidth=100;this.naturalHeight=120;} set src(v){this._src=v;} };
  let draws=0;
  const noop=()=>{};
  const ctx={save:noop,restore:noop,beginPath:noop,ellipse:noop,fill:noop,drawImage:()=>{draws++;},translate:noop,rotate:noop,set fillStyle(_v){},set globalAlpha(_v){}};
  try{
    const back=drawTreesVegetationV2148(ctx,1900,400,2300,1000);
    const backDraws=draws;
    const front=drawForegroundTreesVegetationV2148(ctx,2300,1000,1900,400);
    const frontDraws=draws-backDraws;
    assert.ok(back.drawn>0);
    assert.ok(front.drawn>0);
    assert.equal(back.drawn,backDraws);
    assert.equal(front.drawn,frontDraws);
    assert.ok(front.drawn<ETRANOM_TREES_VEGETATION_V2148.placements.length);
  } finally { if(oldImage===undefined) delete globalThis.Image; else globalThis.Image=oldImage; }
});


test('tree and understory sprites apply the Stage 17 wind field around their ground anchors',()=>{
  const oldImage=globalThis.Image;
  globalThis.Image=class { constructor(){this.complete=true;this.naturalWidth=100;this.naturalHeight=120;} set src(v){this._src=v;} };
  let rotations=0, translations=0;
  const noop=()=>{};
  const ctx={save:noop,restore:noop,beginPath:noop,ellipse:noop,fill:noop,drawImage:noop,translate:()=>{translations++;},rotate:()=>{rotations++;},set fillStyle(_v){},set globalAlpha(_v){}};
  try{
    const wind={x:.75,y:.2,strength:.8,gust:1};
    const back=drawTreesVegetationV2148(ctx,1900,400,2300,1000,wind,12600);
    const front=drawForegroundTreesVegetationV2148(ctx,2300,1000,1900,400,wind,12600);
    assert.ok(back.drawn>0 && front.drawn>0);
    assert.ok(rotations>0 && translations>=rotations);
  } finally { if(oldImage===undefined) delete globalThis.Image; else globalThis.Image=oldImage; }
});
