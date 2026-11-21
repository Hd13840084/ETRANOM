import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const game=readFileSync(new URL('../../game.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../../index.html',import.meta.url),'utf8');
test('Sword Ascetic portrait is wired into class and specialization selection',()=>{
 assert.match(game,/const specPortraits=\{[^}]*"زاهد شمشیر":"sword_ascetic_portrait\.webp"/);
 assert.match(game,/const classPortraits=\{[^}]*"جنگجو":"sword_ascetic_portrait\.webp"/);
 assert.match(game,/const specDescriptions=\{[^}]*"زاهد شمشیر"/);
});
test('status and battle player card use the Sword Ascetic portrait helper',()=>{
 assert.match(game,/function playerClassPortrait\(\)\{return isIronBastion\(\)\?'assets\/classes\/iron_bastion_portrait\.webp':isSwordAscetic\(\)\?'assets\/classes\/sword_ascetic_portrait\.webp'/);
 assert.match(game,/alt="پرتره '\+esc\(state\.character\.specialization/);
 assert.match(game,/const c=state\.character,maxHp=warriorMaxHp\(\),portrait=playerClassPortrait\(\)/);
});
test('portrait asset exists and main game script cache is versioned',()=>{
 assert.ok(existsSync(new URL('../../assets/classes/sword_ascetic_portrait.webp',import.meta.url)));
 assert.match(html,/game\.js\?v=1867&nav=1867/);
});
