import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(new URL('../..',import.meta.url).pathname);
test('V2095 settlement map art is connected after biome nature and water',()=>{
 const game=fs.readFileSync(path.join(root,'game.js'),'utf8');
 assert.match(game,/drawSafeZoneSettlementArtV2095\(ctx, t, camX, camY\)/);
 assert.match(game,/settlement-art-v2095\.js\?v=2095/);
});
test('V2095 adds distinct architectural masses for key building families',()=>{
 const game=fs.readFileSync(path.join(root,'game.js'),'utf8');
 assert.match(game,/function drawBuildingMassingV2095/);
 for(const id of ['guild','pvp_hall','fire_temple','guardhouse','grain_mill','iron_mine','rootwood_sawmill']) assert.ok(game.includes(id));
 assert.match(game,/drawBuildingMassingV2095\(o, x, y, w, h, accent\)/);
});
test('V2095 interior receives masonry and architectural wall/floor detailing without new services',()=>{
 const renderer=fs.readFileSync(path.join(root,'systems/safe-zone/interior-renderer-v2036.js'),'utf8');
 assert.match(renderer,/isoStone/);
 assert.match(renderer,/iso-room-architecture/);
 assert.doesNotMatch(renderer,/data-interior-(?:shop|purchase|service-action)/);
});
