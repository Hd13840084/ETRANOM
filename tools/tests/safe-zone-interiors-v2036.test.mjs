import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SAFE_ZONE_INTERIOR_IDS_V2035} from '../../systems/safe-zone/interior-catalog-v2035.js';
import {moveInteriorPlayerV2036,interiorObstaclesV2036,renderIsometricInteriorV2036,interiorNpcNearV2036} from '../../systems/safe-zone/interior-renderer-v2036.js';
const game=fs.readFileSync(new URL('../../game.js',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('../../index.html',import.meta.url),'utf8');
test('all 27 safe-zone rooms use the new isometric renderer',()=>{
 assert.equal(SAFE_ZONE_INTERIOR_IDS_V2035.length,27);
 assert.match(game,/renderIsometricInteriorV2036/);
 assert.match(game,/moveInteriorPlayerV2036/);
 assert.match(index,/game\.js\?v=2046/);
});
test('movement stays inside room boundaries',()=>{
 const r=moveInteriorPlayerV2036({x:0,y:4},'left','smith');
 assert.equal(r.moved,false); assert.equal(r.reason,'wall'); assert.deepEqual(r.player,{x:0,y:4});
});
test('furniture blocks movement and valid paths remain traversable',()=>{
 const id='smith',block=interiorObstaclesV2036(id)[0];
 const from={x:block.x-1,y:block.y};
 const blocked=moveInteriorPlayerV2036(from,'right',id);
 assert.equal(blocked.moved,false); assert.equal(blocked.reason,'obstacle');
 const free=moveInteriorPlayerV2036({x:5,y:7},'left',id);
 assert.equal(free.moved,true);
});
test('NPC interaction prompt is proximity-gated',()=>{
 assert.equal(interiorNpcNearV2036({x:5,y:2},0),true);
 assert.equal(interiorNpcNearV2036({x:0,y:8},0),false);
});
test('renderer emits iso floor, furniture, player and NPC markers',()=>{
 const html=renderIsometricInteriorV2036({buildingId:'smith',title:'آهنگری',room:'آهنگری',props:['سندان'],residents:[{id:'smith_bram',name:'برام'}],player:{x:5,y:2}});
 for(const token of ['<svg','iso-floor','iso-prop','iso-player','iso-npc','data-interior-npc-talk'])assert.ok(html.includes(token),token);
});
test('each authored interior has a traversable path from entrance to each resident',()=>{
 for(const id of SAFE_ZONE_INTERIOR_IDS_V2035){
  const blocked=new Set(interiorObstaclesV2036(id).map(p=>`${p.x},${p.y}`));
  const queue=[{x:5,y:7}],seen=new Set(['5,7']);
  while(queue.length){const p=queue.shift();for(const [dx,dy] of [[0,-1],[0,1],[-1,0],[1,0]]){const x=p.x+dx,y=p.y+dy,k=`${x},${y}`;if(x<0||x>=11||y<0||y>=9||blocked.has(k)||seen.has(k))continue;seen.add(k);queue.push({x,y});}}
  for(const spot of [[5,2],[3,4],[7,4],[5,5]])assert.ok(seen.has(`${spot[0]},${spot[1]}`),`${id} cannot reach NPC spot ${spot}`);
 }
});
