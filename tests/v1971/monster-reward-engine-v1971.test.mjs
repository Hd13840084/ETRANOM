import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { calculateMonsterGoldRewardV1971, calculateMonsterXpRewardV1971, createMonsterRewardEngineV1971, resolveMonsterRewardsV1971, validateMonsterRewardLinksV1971 } from '../../systems/combat/monster-reward-engine-v1971.js';

const root = new URL('../../content/packs/region_one_master_v2/', import.meta.url);
const monsters = JSON.parse(await readFile(new URL('monsters/monsters.json', root), 'utf8'));
const materials = JSON.parse(await readFile(new URL('materials/materials.json', root), 'utf8'));
const items = JSON.parse(await readFile(new URL('items/items.json', root), 'utf8'));
const tables = JSON.parse(await readFile(new URL('rewards/reward_tables.json', root), 'utf8'));
const recipes = JSON.parse(await readFile(new URL('recipes/recipes.json', root), 'utf8'));
const catalogs = { materials: new Set(materials.map(x=>x.id)), items: new Set(items.map(x=>x.id)), recipes: new Set(recipes.map(x=>x.id)) };

test('legacy authored material drops retain their exact 30 percent chance and quantity', () => {
  const m = monsters.find(x=>x.drops?.length);
  const fail = resolveMonsterRewardsV1971(m,{random:()=>.99,gold:0,xp:0});
  const pass = resolveMonsterRewardsV1971(m,{random:()=>0,gold:0,xp:0});
  assert.equal(fail.materials.length,0);
  assert.equal(pass.materials[0].quantity,Number(m.drops[0].quantity));
});

test('normal, miniboss and boss content preserve one/two/three unique material types', () => {
  const counts = {normal:1,mini_boss:2,area_boss:3};
  for (const [kind,limit] of Object.entries(counts)) {
    const m=monsters.find(x=>x.kind===kind);
    assert.ok(m);
    assert.ok(new Set(m.drops.map(x=>x.material_id)).size<=limit);
  }
});

test('gold and XP formulas are centralized with Region 1 soft-cap at level 10', () => {
  const normal={id:'n',kind:'normal',level:1,hp:250,attack:20,defense:4,stats:{power:8}};
  const boss={...normal,kind:'area_boss',quality:'معمولی'};
  assert.ok(calculateMonsterGoldRewardV1971(boss)>calculateMonsterGoldRewardV1971(normal));
  assert.equal(calculateMonsterXpRewardV1971({regionId:'burnt_forest',hp:150,maxHp:150},{maxHp:150},{playerLevel:10,isRegionOneEnemy:true}),1);
  assert.equal(calculateMonsterXpRewardV1971({regionId:'burnt_forest',hp:150,maxHp:150},{maxHp:150},{playerLevel:4,isRegionOneEnemy:true}),10);
});

test('reward bundle supports XP, gold and independent additional currencies', () => {
  const result=resolveMonsterRewardsV1971({id:'x',rewards:{currencies:[{currency_id:'arena_token',quantity:{min:2,max:4},chance:1}]}},{xp:17,gold:23,random:()=>0});
  assert.equal(result.xp,17);
  assert.deepEqual(result.currencies.map(x=>[x.id,x.quantity]),[['gold',23],['arena_token',2]]);
});

test('reward tables support weighted item/material/currency entries', () => {
  const rewardTables=[{id:'bonus',selection:'weighted',entries:[{type:'item',id:'rare_item',weight:1,chance:1,quantity:2},{type:'currency',currency_id:'silver',weight:3,chance:1,quantity:{min:4,max:4}}]}];
  const result=resolveMonsterRewardsV1971({id:'x',reward_table_ids:['bonus']},{rewardTables,random:()=>0,gold:0,xp:0});
  assert.equal(result.items[0].id,'rare_item');
  assert.equal(result.items[0].quantity,2);
});

test('recipe and key reward entries are returned in separate typed collections', () => {
  const result=resolveMonsterRewardsV1971({id:'x',reward_entries:[{type:'recipe',recipe_id:'recipe_a',chance:1},{type:'key',key_id:'key_a',chance:1}]},{random:()=>0,gold:0,xp:0});
  assert.equal(result.recipes[0].id,'recipe_a');
  assert.equal(result.keys[0].id,'key_a');
});

test('region-one reward links and table references validate', () => {
  assert.deepEqual(validateMonsterRewardLinksV1971(monsters,tables,catalogs),{valid:true,errors:[]});
});

test('validation rejects material type overflow and dangling recipe references', () => {
  const overflow={id:'overflow',kind:'normal',drops:[{material_id:'m1'},{material_id:'m2'}]};
  const badRecipe={id:'bad_recipe',reward_entries:[{type:'recipe',recipe_id:'missing_recipe'}]};
  const result=validateMonsterRewardLinksV1971([overflow,badRecipe],[],catalogs);
  assert.ok(result.errors.some(x=>x.reason==='material_type_limit_exceeded'));
  assert.ok(result.errors.some(x=>x.reason==='recipe_missing'));
});

test('factory exposes versioned validation and deterministic resolution', () => {
  const engine=createMonsterRewardEngineV1971({rewardTables:tables});
  assert.equal(engine.version,'1971.0.0');
  assert.equal(engine.validate(monsters,catalogs).valid,true);
  assert.ok(engine.resolve(monsters[0],{random:()=>0,gold:0,xp:0}).materials.length>=1);
});

test('content loader and Solo victory path use the shared reward engine', async()=>{
  const loader=await readFile(new URL('../../systems/content/region-one-runtime.js',import.meta.url),'utf8');
  const game=await readFile(new URL('../../game.js',import.meta.url),'utf8');
  assert.match(loader,/createMonsterRewardEngineV1971/);
  assert.match(loader,/rewardTables: pack\.rewards/);
  assert.match(game,/rewardEngine\?\.resolve/);
  assert.match(game,/playerLevel:state\.character\.level/);
  assert.match(game,/monsterRewardDropEntries/);
});
