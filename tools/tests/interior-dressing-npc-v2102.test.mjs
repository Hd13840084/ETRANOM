import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderIsometricInteriorV2036 } from '../../systems/safe-zone/interior-renderer-v2036.js';

test('V2108 renders twelve deterministic, role-specific interior micro-sprites', () => {
  const args = { buildingId: 'smith', title: 'آهنگری', room: 'کارگاه', residents: [], props: ['سندان','کوره','قفسه','صندوق','ابزار'], player: {x:5,y:7} };
  const a = renderIsometricInteriorV2036(args);
  const b = renderIsometricInteriorV2036(args);
  assert.equal((a.match(/data-room-detail-v=\"2108\"/g) || []).length, 12);
  assert.equal(a, b);
});

test('V2102 keeps authored NPC sprites, task-specific animation classes and interaction markers', () => {
  const html = renderIsometricInteriorV2036({ buildingId:'smith', title:'آهنگری', residents:[{id:'npc-smith',name:'آهنگر'}], player:{x:5,y:3} });
  assert.match(html, /npc-authored-sprite npc-sprite-work-hammer/);
  assert.match(html, /data-interior-npc-marker="npc-smith"/);
  assert.match(html, /data-interior-npc-talk="npc-smith"/);
  assert.match(fs.readFileSync(new URL('../../game.js', import.meta.url), 'utf8'), /@keyframes npcSpriteWorkV2102/);
});
