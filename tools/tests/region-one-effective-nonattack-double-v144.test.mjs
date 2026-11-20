import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../../',import.meta.url);
const game=fs.readFileSync(new URL('game.js',root),'utf8');
const presence=fs.readFileSync(new URL('systems/online/world-presence.js',root),'utf8');
test('region-one runtime doubles non-attack enemy stats and leaves attack unchanged',()=>{
 assert.match(game,/const nonAttackScale=2/);
 assert.match(game,/\["hp","maxHp","mp","maxMp","enemyDefense","accuracy","speed"\]/);
 assert.match(game,/if\(\/attack\/i\.test\(k\)\)continue/);
 assert.doesNotMatch(game,/attackScale/);
});
test('world presence resolves UUID or missing display names from player_profiles',()=>{
 assert.match(presence,/isUuidLike\(value\)/);
 assert.match(presence,/from\('player_profiles'\)\.select\('user_id,display_name,username'\)/);
 assert.match(presence,/this\.profileNames\.get\(id\)/);
});
