import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SAFE_ZONE_INTERIOR_CATALOG_V2035, SAFE_ZONE_INTERIOR_IDS_V2035 } from '../../systems/safe-zone/interior-catalog-v2035.js';
const game=fs.readFileSync(new URL('../../game.js',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('../../index.html',import.meta.url),'utf8');
test('all 27 live safe-zone POIs have one unique authored interior',()=>{
  const ids=[...game.matchAll(/\{id:"([a-z_]+)",name:"[^"]+",kind:"[^"]+",zone:"(?:city|grain|rootwood|ironhollow)"/g)].map(m=>m[1]);
  assert.equal(ids.length,27);
  assert.equal(new Set(ids).size,27);
  assert.deepEqual(new Set(ids),new Set(SAFE_ZONE_INTERIOR_IDS_V2035));
  for(const id of ids) assert.ok(SAFE_ZONE_INTERIOR_CATALOG_V2035[id],`missing ${id}`);
});
test('each interior has room identity, atmosphere and at least four props',()=>{
  for(const [id,d] of Object.entries(SAFE_ZONE_INTERIOR_CATALOG_V2035)){
    assert.ok(d.title,id); assert.ok(d.room,id); assert.ok(d.floor,id); assert.ok(d.trim,id); assert.ok(d.light,id); assert.ok(d.ambience,id); assert.ok(d.props.length>=4,id);
  }
});
test('game renders explorable room controls and retains NPC dialogue actions',()=>{
  assert.match(game,/data-interior-step/);
  assert.match(game,/data-interior-npc-talk/);
  assert.match(game,/SAFE_ZONE_INTERIOR_CATALOG_V2035\[building.id\]/);
  assert.match(index,/game\.js\?v=2046&nav=2038/);
});
