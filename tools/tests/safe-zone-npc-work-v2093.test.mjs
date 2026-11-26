import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderIsometricInteriorV2036 } from '../../systems/safe-zone/interior-renderer-v2036.js';
const game = fs.readFileSync(new URL('../../game.js', import.meta.url), 'utf8');
test('building interiors render real resident records, not pre-rendered HTML strings', () => {
  assert.match(game, /residentList\s*=\s*v\.residents\s*\|\|\s*\[\]/);
  assert.match(game, /residents:\s*residentList/);
});
test('NPCs have building-specific work loops and remain proximity-interactable', () => {
  const smith = renderIsometricInteriorV2036({ buildingId: 'smith', title: 'آهنگری', props: ['سندان'], residents: [{ id: 'smith_bram', name: 'برام' }], player: { x: 5, y: 2 } });
  assert.match(smith, /npc-work-hammer/);
  assert.match(smith, /کوبیدن آهن روی سندان/);
  assert.match(smith, /data-interior-npc-talk="smith_bram"/);
  const herb = renderIsometricInteriorV2036({ buildingId: 'rootwood_herbalist', title: 'گیاه‌شناس', residents: [{ id: 'rootwood_herbalist_vesa', name: 'وسا' }], player: { x: 5, y: 7 } });
  assert.match(herb, /npc-work-stir/);
  assert.match(herb, /آسیاب‌کردن گیاهان/);
  assert.doesNotMatch(herb, /data-interior-npc-talk=/);
});
test('NPC work visuals do not introduce service or item actions', () => {
  const html = renderIsometricInteriorV2036({ buildingId: 'smith', title: 'آهنگری', residents: [{ id: 'smith_bram', name: 'برام' }], player: { x: 5, y: 2 } });
  assert.doesNotMatch(html, /data-service|data-buy|data-sell|data-item|data-craft/);
  assert.match(game, /npcDialogueFor\(npc, 'talk'\)/);
});
