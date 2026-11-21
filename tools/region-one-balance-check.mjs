import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('.');
const game=fs.readFileSync(path.join(root,'game.js'),'utf8');
const required=['power','speed','endurance','vitality','intellect','perception','luck','faith'];
for(const key of required)if(!game.includes(key))throw new Error(`Missing core attribute: ${key}`);
const pack=path.join(root,'content/packs/region_one_master_v2');
const read=name=>JSON.parse(fs.readFileSync(path.join(pack,name),'utf8'));
const runtimeEnemies=read('monsters/monsters.json'),regions=read('regions/regions.json'),recipes=read('recipes/recipes.json');
if(runtimeEnemies.length!==36)throw new Error(`Expected 36 unique Region 1 encounters, found ${runtimeEnemies.length}`);
const regionCounts=new Map();for(const enemy of runtimeEnemies)regionCounts.set(enemy.region_id,(regionCounts.get(enemy.region_id)||0)+1);
if(regionCounts.size!==6||[...regionCounts.values()].some(n=>n!==6))throw new Error('Each of the six Region 1 subareas must contain six encounter records');
for(const enemy of runtimeEnemies){for(const key of required)if(!Number.isFinite(enemy.stats?.[key]))throw new Error(`${enemy.id}: missing ${key}`);if(!(enemy.stats.hp>0&&Number.isFinite(enemy.stats.mp)&&enemy.stats.mp>=0))throw new Error(`${enemy.id}: invalid HP/MP`);if((enemy.skills||[]).length>0&&!(enemy.stats.mp>0))throw new Error(`${enemy.id}: skill monster requires MP`);}
if(!recipes.every(r=>r.recipe_level===1&&r.max_recipe_level===10&&r.item_level===1))throw new Error('Region 1 recipe level rules mismatch');
const rarityChance=read('manifest.json').rules.rarity_drop_chances_percent;
for(const [rarity,expected] of Object.entries({normal:35,uncommon:20,rare:15,epic:8,legendary:4,mythic:2}))if(rarityChance[rarity]!==expected)throw new Error(`Rarity chance mismatch for ${rarity}`);
if(!game.includes('window.ETRANOM_RUNTIME_CONTENT?.monsters'))throw new Error('Runtime monster pack is not connected to game.js');
if(!game.includes('Math.random()<0.02'))throw new Error('Mythic boss-only 2% check is missing');
console.log(`Region 1 balance data checks passed: ${regions.length} zones, ${runtimeEnemies.length} encounters, ${recipes.length} recipes; all eight stats and HP/MP are valid.`);
