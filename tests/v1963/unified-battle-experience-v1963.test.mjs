import test from 'node:test';
import assert from 'node:assert/strict';
import { createUnifiedBattleDescriptorV1963, renderUnifiedBattleScreenV1963, getUnifiedBattleCapabilitiesV1963, UNIFIED_BATTLE_EXPERIENCE_VERSION_V1963 } from '../../systems/combat/unified-battle-experience-v1963.js';

const player = {id:'p1',name:'قهرمان',class:'Warrior',level:10,hp:80,maxHp:100,mp:30,maxMp:50,stamina:40,maxStamina:60};
const enemy = {id:'e1',name:'نگهبان خاکستر',level:10,hp:70,maxHp:100,mp:10,maxMp:20,portrait:'assets/monsters/ash_hills_monster_1.webp'};

test('V1963 exposes a versioned shared battle experience',()=>assert.equal(UNIFIED_BATTLE_EXPERIENCE_VERSION_V1963,'1963.0.0'));
test('solo field, dungeon and tower use the same canonical screen contract',()=>{
  for (const encounterType of ['field','dungeon','tower','ruin_battle','event_battle','future_encounter']) {
    const descriptor=createUnifiedBattleDescriptorV1963({mode:'solo',encounterType,title:'آزمون'});
    const html=renderUnifiedBattleScreenV1963({descriptor,player,enemies:[enemy]});
    assert.match(html,/class="ubv1963-battle-screen"/); assert.match(html,/data-unified-battle="solo"/); assert.match(html,/data-unified-target="e1"/);
  }
});
test('party dungeon and tower use same renderer with ally cards',()=>{
  for (const encounterType of ['party_field','dungeon','tower','event_battle','future_encounter']) {
    const descriptor=createUnifiedBattleDescriptorV1963({mode:'party',encounterType});
    const html=renderUnifiedBattleScreenV1963({descriptor,player,allies:[{...player,id:'p2',name:'همراه'}],enemies:[enemy]});
    assert.match(html,/data-unified-battle="party"/); assert.match(html,/همراه/);
  }
});
test('PvP uses the same renderer but remains a separate authoritative mode',()=>{
  const descriptor=createUnifiedBattleDescriptorV1963({mode:'pvp',encounterType:'pvp_match'});
  const html=renderUnifiedBattleScreenV1963({descriptor,player,enemies:[{...enemy,name:'حریف'}]});
  assert.match(html,/data-encounter-type="pvp_match"/); assert.match(html,/حریف/);
  assert.deepEqual(getUnifiedBattleCapabilitiesV1963('pvp').map(x=>x.id),['attack','guard']);
});
test('rejects invalid mode/encounter combinations',()=>{
  assert.throws(()=>createUnifiedBattleDescriptorV1963({mode:'raid',encounterType:'tower'}),/unsupported_unified_battle_mode/);
  assert.throws(()=>createUnifiedBattleDescriptorV1963({mode:'pvp',encounterType:'tower'}),/pvp_requires_pvp_match_encounter/);
  assert.throws(()=>createUnifiedBattleDescriptorV1963({mode:'solo',encounterType:'party_field'}),/invalid_solo_encounter_type/);
});
test('escapes user-controlled text and blocks unsafe portrait protocols',()=>{
  const descriptor=createUnifiedBattleDescriptorV1963({mode:'solo',encounterType:'field',title:'<script>x</script>'});
  const html=renderUnifiedBattleScreenV1963({descriptor,player:{...player,name:'<img>'},enemies:[{...enemy,portrait:'javascript:alert(1)',name:'<b>bad</b>'}]});
  assert.doesNotMatch(html,/<script>|<img>|javascript:/); assert.match(html,/&lt;script&gt;/); assert.match(html,/&lt;b&gt;bad&lt;\/b&gt;/);
});
