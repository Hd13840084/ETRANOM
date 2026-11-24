import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createSafeZoneEngine} from '../../systems/safe-zone/safe-zone-engine.js';
const stewardByBuilding=createSafeZoneEngine().stewardByBuilding;
const game=readFileSync(new URL('../../game.js',import.meta.url),'utf8');
const panel=game.slice(game.indexOf('function renderInteractionPanel(){'),game.indexOf('function renderHubTabs(){'));
test('safe-zone interaction UI has no item, shop, service or quest controls',()=>{assert.doesNotMatch(panel,/data-interact-action="(buy|sell|craft|rest|harvest|fishing|quest)|data-hub-common-action="(buy|sell|quests|inventory)/);assert.match(panel,/فروشگاه‌ها، خریدوفروش، آیتم‌ها، مواد/);});
test('old safe-zone personal quest catalogs and freeform story actions are removed',()=>{for(const token of ['const personalQuestPools=','const personalQuestNpcPools=','function personalQuestSpec(','function dailyRequestFor(','async function freeAction(text){','function choice(id){','data-free-send'])assert.equal(game.includes(token),false,token);});
test('safe-zone menu hides local services and only exposes global market/transfer in danger zones',()=>{assert.doesNotMatch(game,/data-menu-action=\"craft\"/);assert.match(game,/state\.inWesternDanger\?'<button data-menu-action=\"quests\"/);assert.match(game,/allowed\.push\('quests','gifts','online_market'\)/);});

test('safe-zone live registry keeps the intended world shell and one steward per building',()=>{
 const npcStart=game.indexOf('const safeNPCs=['),npcEnd=game.indexOf('];',npcStart);
 const buildingStart=game.indexOf('const cityPOI=['),buildingEnd=game.indexOf('];',buildingStart);
 const landmarkStart=game.indexOf('const safeLandmarks=['),landmarkEnd=game.indexOf('];',landmarkStart);
 const npc=game.slice(npcStart,npcEnd),buildings=game.slice(buildingStart,buildingEnd),landmarks=game.slice(landmarkStart,landmarkEnd);
 assert.equal((npc.match(/\{id:/g)||[]).length,10);
 assert.equal((buildings.match(/\{id:/g)||[]).length,9);
 assert.equal((landmarks.match(/\{id:/g)||[]).length,8);
 for(const id of ['online_player_market','pvp_hall','inn','smith','guild','alchemy','enchanter_shop','clinic','guardhouse'])assert.ok(stewardByBuilding[id],`missing steward mapping for ${id}`);
 assert.match(game,/const EQUIPMENT_EFFECTS = \{/,'shared equipment stat catalog must remain intact');
 assert.match(game,/state\.inWesternDanger\?'<button type=\"button\" data-world-action=\"attack\"/);
});

test('safe-zone item catalogs and local crafting renderers are removed without deleting global equipment stats',()=>{for(const token of ['const SELLER_SLOTS = {','function amonScrollShop(','function potionRecipePanel(){','function smithyCraftingPanel()'])assert.equal(game.includes(token),false,token);assert.match(game,/const ITEM_SELL_PRICES=\{\};/);assert.match(game,/const AMON_SCROLLS=\[/);assert.match(game,/const CONSUMABLE_ITEMS=\{\};/);assert.match(game,/function equipmentCatalogFor/);assert.match(game,/function isAtBlacksmith\(\)\{return !!state&&state.scene==="smithy"&&state.inWesternDanger===true;\}/);});
