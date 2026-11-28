import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ETRANOM_VEHICLE_SYSTEM_V2149,
  auditVehicleSystemV2149,
  drawVehicleSystemV2149,
  drawForegroundVehiclesV2149
} from '../../systems/world/vehicle-system-v2149.js';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'../..');
const game=readFileSync(resolve(root,'game.js'),'utf8');
const index=readFileSync(resolve(root,'index.html'),'utf8');

test('V2149 vehicle catalog and eight placements pass the runtime audit across all four settlements',()=>{
  const audit=auditVehicleSystemV2149();
  assert.equal(audit.ok,true,JSON.stringify(audit.errors));
  assert.equal(audit.vehicleTypes,8);
  assert.equal(audit.placements,8);
  assert.equal(audit.regions,4);
  assert.equal(audit.generatedVehicleSprites,6);
  assert.equal(audit.retainedVehicleSprites,2);
  assert.equal(audit.mooredCraft,1);
});

test('all generated and retained transport sprites exist and are non-empty PNG files',()=>{
  for(const path of ETRANOM_VEHICLE_SYSTEM_V2149.assetFiles){
    const file=resolve(root,path.replace(/^\.\//,''));
    assert.equal(existsSync(file),true,path);
    assert.ok(statSync(file).size>1000,path);
    const signature=readFileSync(file).subarray(0,8);
    assert.deepEqual([...signature],[137,80,78,71,13,10,26,10],path);
  }
});

test('vehicle placements preserve terrain compatibility, wheel/hull anchors and explicit future physics boundaries',()=>{
  const ids=new Set();
  for(const p of ETRANOM_VEHICLE_SYSTEM_V2149.placements){
    assert.equal(ids.has(p.id),false,p.id);ids.add(p.id);
    assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.depth));
    assert.equal(p.depth,p.x+p.y);
    assert.ok(p.footprint.length>0&&p.footprint.width>0&&p.footprint.height>0);
    assert.equal(p.collision.policy,'stage-19-live-oriented-footprint');
    if(p.terrainClass==='land') assert.notEqual(p.terrainVehicleClass,'foot-only',p.id);
    if(p.terrainClass==='water'){
      assert.equal(p.state,'moored');
      assert.equal(p.waterwayId,'rootwood_creek');
      assert.equal(p.groundAnchor,'hull-waterline-center');
    } else assert.equal(p.groundAnchor,'wheel-contact-center');
  }
});

test('background and foreground vehicle passes split correctly at player x+y depth',()=>{
  const oldImage=globalThis.Image;
  globalThis.Image=class{constructor(){this.complete=true;this.naturalWidth=100;this.naturalHeight=90;}set src(v){this._src=v;}};
  let draws=0;
  const noop=()=>{};
  const ctx={save:noop,restore:noop,beginPath:noop,ellipse:noop,fill:noop,stroke:noop,moveTo:noop,lineTo:noop,drawImage:()=>draws++,translate:noop,rotate:noop,transform:noop,set fillStyle(_v){},set globalAlpha(_v){}};
  try{
    const back=drawVehicleSystemV2149(ctx,0,400,650,650);
    const backDraws=draws;
    const front=drawForegroundVehiclesV2149(ctx,650,650,0,400);
    const frontDraws=draws-backDraws;
    assert.ok(back.drawn>0);
    assert.ok(front.drawn>0);
    assert.equal(back.drawn,backDraws);
    assert.equal(front.drawn,frontDraws);
    const visibleCount=ETRANOM_VEHICLE_SYSTEM_V2149.placements.filter(v=>v.x>=-240&&v.x<=980&&v.y>=160&&v.y<=1280).length;
    assert.equal(back.drawn+front.drawn,visibleCount);
  } finally {if(oldImage===undefined)delete globalThis.Image;else globalThis.Image=oldImage;}
});

test('game entry integrates V2149 audits, painter passes and cache-busted runtime',()=>{
  assert.match(game,/vehicle-system-v2149\.js\?v=2170/);
  assert.match(game,/drawVehicleSystemV2149\(ctx, camX, camY, p\.x, p\.y, currentWeatherV2157\.season\)/);
  assert.match(game,/drawForegroundVehiclesV2149\(ctx, p\.x, p\.y, camX, camY, currentWeatherV2157\.season\)/);
  assert.match(game,/environment-audio-v2160\.js\?v=2160/);
  assert.match(game,/lighting-shadow-v2151\.js\?v=2154/);
  assert.match(index,/game\.js\?v=2176-stage32-complete-world-audit-map&build=20261128-v2176-r2/);
});
