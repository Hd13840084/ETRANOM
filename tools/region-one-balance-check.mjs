import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('.');
const game=fs.readFileSync(path.join(root,'game.js'),'utf8');
const required=['power','speed','endurance','vitality','intellect','perception','luck','faith'];
for(const key of required){if(!game.includes(key))throw new Error(`Missing core attribute: ${key}`);}
const runtimeBlock=game.match(/const REGION_ENCOUNTERS=(\[.*?\]);\n  \/\/ کاتالوگ/s);
if(!runtimeBlock)throw new Error('Runtime encounter catalogue missing');
const runtimeEnemies=JSON.parse(runtimeBlock[1]);
if(runtimeEnemies.length!==36)throw new Error(`Expected 36 unique Region 1 encounters, found ${runtimeEnemies.length}`);
const regionCounts=new Map();for(const enemy of runtimeEnemies)regionCounts.set(enemy.regionId,(regionCounts.get(enemy.regionId)||0)+1);
if(regionCounts.size!==6||[...regionCounts.values()].some(n=>n!==6))throw new Error('Each of the six Region 1 subareas must contain six encounter records');
if(!game.includes('recipeLevelMultiplier')||!game.includes('ETRONOM_RECIPE_LEVEL_CAP=10'))throw new Error('10-level recipe progression is missing');
if(!game.includes('dropChance=[35,20,15,8,4,2]'))throw new Error('Recipe rarity drop rates mismatch');
if(!game.includes('Math.random()<0.02'))throw new Error('Mythic boss-only 2% check is missing');
for(const rel of ['content/packs/burnt_forest_v1/monsters/monsters.json','content/packs/region_one_complete_v1/monsters/monsters.json']){
 const rows=JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
 for(const m of rows){for(const key of required){if(!Number.isFinite(m.stats?.[key]))throw new Error(`${rel}/${m.id}: missing ${key}`);}if(!(m.stats.hp>0&&Number.isFinite(m.stats.mp)&&m.stats.mp>=0))throw new Error(`${rel}/${m.id}: invalid HP/MP`);if((m.skills||[]).length>0&&!(m.stats.mp>0))throw new Error(`${rel}/${m.id}: skill monster requires MP`);}
 console.log(`${rel}: ${rows.length} monsters; all 8 attributes and HP/MP present`);
}
console.log('Region 1 attribute/recipe static checks passed.');
