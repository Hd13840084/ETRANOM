import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('assets/safe-zone/buildings-v2100');
test('V2100 ships 27 individually cropped building sprites with manifest',()=>{
 const m=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
 assert.equal(m.count,27); assert.equal(m.buildings.length,27);
 for(const item of m.buildings){const p=path.join(root,item.file);assert.ok(fs.existsSync(p),item.file);assert.ok(fs.statSync(p).size>1000,item.file);}
});
test('V2100 renderer maps all existing 27 POI IDs and uses lazy image loading',()=>{
 const src=fs.readFileSync('systems/safe-zone/building-sprites-v2100.js','utf8');
 const ids=[...src.matchAll(/([a-z0-9_]+):'building_\d+\.png'/g)].map(x=>x[1]);
 assert.equal(ids.length,27);assert.equal(new Set(ids).size,27);
 assert.match(src,/new Image\(\)/);assert.match(src,/ctx\.drawImage\(img/);
 const game=fs.readFileSync('game.js','utf8');assert.match(game,/drawBuildingSpriteV2100\(ctx, o\)/);
});
