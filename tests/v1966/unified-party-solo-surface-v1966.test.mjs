import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createUnifiedBattleDescriptorV1963, renderUnifiedBattleScreenV1963 } from '../../systems/combat/unified-battle-experience-v1963.js';
const player={id:'hero',name:'قهرمان',level:7,hp:70,maxHp:100,mp:25,maxMp:40,stamina:12,maxStamina:20};
test('V1966 party uses the canonical screen with allies, enemy targeting and party actions',()=>{
 const descriptor=createUnifiedBattleDescriptorV1963({mode:'party',encounterType:'party_field',encounterId:'party-1'});
 const html=renderUnifiedBattleScreenV1963({descriptor,player,allies:[{id:'ally',name:'هم‌گروهی',hp:60,maxHp:80,stateLabel:'آنلاین'}],enemies:[{id:'1',name:'گرگ خاکستر',level:2,hp:30,maxHp:50}],selectedTargetId:'1',actionAttribute:'data-battle-action'});
 assert.match(html,/data-unified-battle="party"/); assert.match(html,/هم‌گروهی/); assert.match(html,/آنلاین/); assert.match(html,/data-unified-target="1"/); assert.match(html,/data-battle-action="attack"/);
});
test('V1966 solo, dungeon and tower all share the same canonical presentation contract',()=>{
 for(const encounterType of ['field','dungeon','tower']){
  const descriptor=createUnifiedBattleDescriptorV1963({mode:'solo',encounterType});
  const html=renderUnifiedBattleScreenV1963({descriptor,player,enemies:[{id:'mob',name:'نگهبان',level:5,hp:90,maxHp:90,mp:0,maxMp:0}],actionAttribute:'data-fight'});
  assert.match(html,/class="ubv1963-battle-screen"/); assert.match(html,/نگهبان/); assert.match(html,/data-fight="attack"/);
 }
});
test('V1966 preserves source dungeon and tower structures without editing their content files',()=>{
 const dungeons=JSON.parse(fs.readFileSync(new URL('../../content/packs/region_one_master_v2/dungeons/dungeons.json',import.meta.url),'utf8'));
 const tower=JSON.parse(fs.readFileSync(new URL('../../content/packs/region_one_master_v2/tower/tower.json',import.meta.url),'utf8'));
 assert.ok(dungeons.length>0); assert.ok(dungeons.every(d=>d.normal_waves===5 && d.boss_wave===6 && d.wave_count===6));
 assert.equal(tower.floor_count,20); assert.equal(tower.floors.length,20);
});
