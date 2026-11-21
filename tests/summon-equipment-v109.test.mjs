import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game = fs.readFileSync(new URL('../game.js', import.meta.url), 'utf8');
test('summoned legion attacks each player turn and enemy damage is routed to summoned guard first', () => {
  assert.match(game, /necromancerLegionTurn\(combatRef\)/);
  assert.match(game, /routeDamageToSummonedLegion\(c,dmg,c\.enemy\)/);
  assert.match(game, /routeDamageToSummonedLegion\(live,dmg,e\.enemy\)/);
  assert.match(game, /از این پس دشمنان دوباره قهرمان را هدف می‌گیرند/);
});
test('crafted recipe equipment maps localized slot labels to canonical equipment slots', () => {
  assert.match(game, /ETRANOM_SLOTS\.indexOf\(r\.slot\),canonicalSlot=EQUIPMENT_SLOTS\[recipeSlotIndex\]\?\.\[0\]/);
  assert.match(game, /requiredPlayerLevel:1,rarity:r\.rarity/);
  assert.match(game, /itemLevel:Number\(r\.itemLevel\|\|r\.level\)\|\|1/);
});
test('equip action normalizes legacy localized slot names and supports crafted equipment', () => {
  assert.match(game, /String\(x\.id\|\|\"\"\)\.startsWith\(\"crafted_\"\)/);
  assert.match(game, /const slotIndex=ETRANOM_SLOTS\.indexOf\(item\.slot\)/);
});
