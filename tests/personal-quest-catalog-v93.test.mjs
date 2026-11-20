import fs from 'node:fs';
import assert from 'node:assert/strict';
const game=fs.readFileSync(new URL('../game.js',import.meta.url),'utf8');
const sectionStart=game.indexOf('const personalQuestNpcPools={');
assert.notEqual(sectionStart,-1,'personal quest NPC catalog missing');
const section=game.slice(sectionStart,game.indexOf('function personalQuestSpec',sectionStart));
const ids=['captain_arden','guard_mira','elder_sena','merchant_ren','alchemist_liora','smith_bram','innkeeper_ella','guildmaster_toren','healer_nara','priest_amon'];
for(const id of ids){
  const start=section.indexOf(id+':[');
  assert.notEqual(start,-1,`missing personal quest pool: ${id}`);
  const next=section.indexOf('\n    ',start);
  const chunk=section.slice(start,next<0?section.length:next);
  const count=(chunk.match(/\['[a-z0-9_]+','/g)||[]).length;
  assert.equal(count,10,`${id} should have 10 quests`);
}
const prices=game.match(/const ITEM_SELL_PRICES=\{([^}]+)\}/)?.[1]||'';
for(const id of ['bread','healing_herb','water','wood_resin','stone','flour','honey','leather','iron_ore','wooden_plank','grain','timber','game_meat','beeswax','coal','cut_stone','iron_ingot','river_fish','white_apple']) {
  assert.match(prices,new RegExp('(?:^|,)'+id+':'),`missing game item ${id}`);
}
assert.match(game,/id:'focus_stone'/,'focus_stone must exist in the in-game purchase catalog');
console.log('personal quest catalog v93: 10 NPCs × 10 quests; item IDs validated');
