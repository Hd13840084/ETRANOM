import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const js=fs.readFileSync(new URL('../../game.js',import.meta.url),'utf8');
const ids=['burnt_forest','thorn_grove','ash_hills','vardash_river','southern_plains','rootbound_ruins'];
test('six Region 1 subareas have explicit battle routing and persistent selection',()=>{
  for(const id of ids){assert.ok(js.includes('data-region-battle="'+id+'"') || js.includes('id:"'+id+'"'));}
  assert.match(js,/activeDangerRegionId\|\|state\.currentDangerRegion\|\|state\.selectedDangerRegion/);
  assert.match(js,/combatStart\(\{regionId:id\}\)/);
});
test('runtime enemy catalog uses all eight canonical attributes and meaningful MP/HP',()=>{
  assert.match(js,/"power":\d+,"speed":\d+,"endurance":\d+,"vitality":\d+,"intellect":\d+,"perception":\d+,"luck":\d+,"faith":\d+/);
  assert.match(js,/"regionId":"southern_plains","level":5,"hp":\d+,"attack":\d+,"defense":\d+[^}]*"mp":\d+/);
});
