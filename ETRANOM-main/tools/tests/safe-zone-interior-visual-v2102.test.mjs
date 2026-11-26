import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const renderer = fs.readFileSync(path.join(root,'systems/safe-zone/interior-renderer-v2036.js'),'utf8');
const css = fs.readFileSync(path.join(root,'systems/ui/dark-fantasy-pages.css'),'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root,'assets/safe-zone/interiors-v2101/manifest.json'),'utf8'));
test('authored NPC sprites receive job-specific visual animation classes',()=>{
  for (const action of ['hammer','saw','stir','knead','ledger','map','guard','care','tend','turn']) assert.ok(renderer.includes(`npc-sprite-action-${'${action}'}`) || renderer.includes('npc-sprite-action-${action}'));
  assert.match(css,/npc-work-hammer-v2102/); assert.match(css,/npc-work-saw-v2102/); assert.match(css,/npc-work-stir-v2102/);
});
test('interiors receive layered wall dressing without changing movement contracts',()=>{
  assert.match(renderer,/interior-wall-sconces/); assert.match(renderer,/interior-wall-banners/); assert.match(renderer,/interior-floor-details/);
  assert.match(renderer,/function moveInteriorPlayerV2036/); assert.match(renderer,/interiorObstaclesV2036\(buildingId\)/);
});
test('reduced-motion support and visual-only manifest are present',()=>{
  assert.match(css,/prefers-reduced-motion:reduce/); assert.equal(manifest.version,'V2103'); assert.equal(manifest.visualEnhancements.gameplayChanges,false);
});
