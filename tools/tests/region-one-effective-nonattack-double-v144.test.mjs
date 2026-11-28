import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../../',import.meta.url);
const game=fs.readFileSync(new URL('game.js',root),'utf8');
const presence=fs.readFileSync(new URL('systems/online/world-presence.js',root),'utf8');
test('v146 uses content-pack enemy stats without hidden regional or combat scaling',()=>{
 assert.match(game,/const REGION_COMBAT_MULTIPLIER = _regionId => 1/);
 assert.match(game,/const nonAttackScale=1/);
 assert.doesNotMatch(game,/const REGION_COMBAT_MULTIPLIER = regionId => regionId === \"burnt_forest\" \? 3/);
});
test('world presence resolves UUID or missing display names from player_profiles',()=>{
 assert.match(presence,/isUuidLike\(value\)/);
 assert.match(presence,/from\('player_profiles'\)\.select\('user_id,display_name,username'\)/);
 assert.match(presence,/this\.profileNames\.get\(id\)/);
});
