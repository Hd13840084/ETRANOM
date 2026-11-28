import test from 'node:test';
import assert from 'node:assert/strict';
import { renderIsometricInteriorV2036 } from '../../systems/safe-zone/interior-renderer-v2036.js';
test('V2094 NPCs use layered occupational silhouettes and visible hand tools', () => {
  const html = renderIsometricInteriorV2036({buildingId:'smith',title:'آهنگری',residents:[{id:'smith_bram',name:'برام'}],player:{x:5,y:2}});
  for (const token of ['npc-cloak','npc-working-arm','npc-tool','npc-name','npc-task','npc-work-hammer','stroke-linecap="round"']) assert.ok(html.includes(token), token);
  assert.match(html,/data-interior-npc-talk="smith_bram"/);
});
test('V2094 NPC art remains decorative and adds no service, inventory or item actions', () => {
  const html = renderIsometricInteriorV2036({buildingId:'rootwood_herbalist',title:'گیاه‌شناس',residents:[{id:'vesa',name:'وسا'}],player:{x:5,y:7}});
  assert.doesNotMatch(html,/data-service|data-buy|data-sell|data-item|data-craft|data-inventory/);
  assert.doesNotMatch(html,/data-interior-npc-talk=/);
  assert.match(html,/آسیاب‌کردن گیاهان/);
});
