import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../game.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('enemy reaction phase opens a timed guard/dodge choice before enemyTurn',()=>{
  assert.match(game,/combatRef\.phase="enemy_reaction"/);
  assert.match(game,/reactionDeadline=Date\.now\(\)\+2600/);
  assert.match(game,/data-enemy-reaction="guard"/);
  assert.match(game,/data-enemy-reaction="dodge"/);
  assert.match(game,/combatRef\.phase='enemy'/);
});
test('reactive guard mitigates and dodge adds chance instead of guaranteeing evasion',()=>{
  assert.match(game,/if\(c\.guarding\)dmg=Math\.max\(0,Math\.floor\(dmg\*\.40\)\)/);
  assert.match(game,/reactiveEvasionBonus\+\(c\.evading\?20:0\)/);
  assert.doesNotMatch(game,/const evaded=!!c\.evading\|\|/);
});
test('social and guild launchers are map-only and hidden on internal pages',()=>{
  assert.match(html,/body:has\(\.explore-viewport\) #etr-social-launch/);
  assert.match(html,/body:has\(\.player-window-backdrop\) #etr-social-launch/);
});
test('sword ascetic crescent remains 280 percent and keeps stable id',()=>{
  const data=fs.readFileSync(new URL('../systems/classes/sword-ascetic-data.js',import.meta.url),'utf8');
  assert.match(data,/"id":\s*"black_crescent"/);
  assert.match(data,/"powerPct":\s*280/);
});
