import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const game=readFileSync(new URL('../../game.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../../index.html',import.meta.url),'utf8');
const spec=JSON.parse(readFileSync(new URL('../../content/specializations/catalog/warrior_2.json',import.meta.url),'utf8'));
const catalog=JSON.parse(readFileSync(new URL('../../content/specializations/specializations.json',import.meta.url),'utf8'));
test('Iron Bastion portrait is registered for character creation and preview',()=>{
 assert.match(game,/"دژ پولادین":"iron_bastion_portrait\.webp"/);
 assert.match(game,/function isIronBastion\(\)/);
});
test('Iron Bastion status portrait resolves without changing Sword Ascetic',()=>{
 assert.match(game,/function playerClassPortrait\(\)\{return isIronBastion\(\)\?'assets\/classes\/iron_bastion_portrait\.webp':isSwordAscetic\(\)\?/);
 assert.match(game,/assets\/classes\/sword_ascetic_portrait\.webp/);
});
test('party combat card can resolve both Warrior specialization portraits',()=>{
 const ui=readFileSync(new URL('../../systems/party/party-ui.js',import.meta.url),'utf8');
 assert.match(ui,/دژ پولادین.*iron_bastion_portrait\.webp/);
 assert.match(ui,/زاهد شمشیر.*sword_ascetic_portrait\.webp/);
});
test('both specialization catalogs point to the new asset and preserve stable id',()=>{
 assert.equal(spec.id,'warrior_2');
 assert.equal(spec.portrait,'assets/classes/iron_bastion_portrait.webp');
 assert.equal(spec.identity.signature_weapon_fa,'تبر غول‌پیکر دوسر');
 const item=catalog.specializations.find(x=>x.id==='warrior_2');
 assert.equal(item.portrait,'assets/classes/iron_bastion_portrait.webp');
});
test('asset exists and client cache version is bumped',()=>{
 assert.ok(existsSync(new URL('../../assets/classes/iron_bastion_portrait.webp',import.meta.url)));
 assert.match(html,/game\.js\?v=1867&nav=1867/);
});
