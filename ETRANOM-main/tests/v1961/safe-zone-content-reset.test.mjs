import test from 'node:test';
import assert from 'node:assert/strict';
import {createSafeZoneEngine,resetLegacySafeZoneProgress} from '../../systems/safe-zone/safe-zone-engine.js';

test('all safe-zone entity types share the same three-section neutral contract',()=>{
 const e=createSafeZoneEngine(),a=e.registerWorld({npcs:[{id:'npc_a',name:'A'}],buildings:[{id:'inn',name:'Inn'}],landmarks:[{id:'hill',name:'Hill',kind:'landmark'}]});
 assert.equal(a.ok,true);assert.deepEqual(a.sectionIds,['overview','dialogue','location']);assert.deepEqual(a.counts,{npcs:1,buildings:1,landmarks:1,total:3});
 for(const x of [e.get('npc','npc_a'),e.get('building','inn'),e.get('landmark','hill')])for(const k of ['commerce','quests','inventory','crafting','gathering','services'])assert.equal(x.capabilities[k],false);
});
test('legacy safe-zone quest, activity, relationship and item state is purged but danger-region inventory is preserved',()=>{
 const save={quest:{accepted:true},personalQuests:{x:{}},dailyRequest:{status:'active'},regionQuest:{stage:1},lanternQuest:{stage:1},oreLedgerQuest:{stage:1},landmarkDiscoveries:{},safeActivityDays:{},safeRegionRewardClaimed:true,resourceGathered:{},guardPatrols:{},mountUntilDay:3,interiorDiscoveries:{},safeClues:['x'],safeClueReward:true,flags:{guardKnown:true,ruinsSeen:true},npcRelations:{npc_a:5},npcMemory:{captain_arden:[{kind:'conversation'},{kind:'gift_received'}],region_npc:[{kind:'conversation'}]},inventory:[{id:'bread',qty:2},{id:'iron_ore',qty:1},{id:'scroll_fireball',qty:1},{id:'thorn_hide',qty:3},{id:'crafted_potion_healing_normal',qty:1}],gold:88,journal:['پیمان چهار آبادی کامل شد','هیولای جنگل سوخته شکست خورد']};
 const r=resetLegacySafeZoneProgress(save);assert.equal(r.changed,true);
 for(const k of ['quest','personalQuests','dailyRequest','regionQuest','lanternQuest','oreLedgerQuest','landmarkDiscoveries','safeActivityDays','safeRegionRewardClaimed','resourceGathered','guardPatrols','mountUntilDay','interiorDiscoveries','safeClues','safeClueReward','flags'])assert.equal(k in save,false);
 assert.deepEqual(save.inventory,[{id:'thorn_hide',qty:3},{id:'crafted_potion_healing_normal',qty:1}]);assert.equal(save.gold,88);assert.deepEqual(save.npcRelations,{});assert.equal('captain_arden' in save.npcMemory,false);assert.deepEqual(save.npcMemory.region_npc.map(x=>x.kind),['conversation']);assert.deepEqual(save.journal,['هیولای جنگل سوخته شکست خورد']);assert.equal(resetLegacySafeZoneProgress(save).changed,false);
});
test('shared building panel only exposes talk and ask',()=>{const e=createSafeZoneEngine();e.registerWorld({npcs:[{id:'innkeeper_ella',name:'Ella'}],buildings:[{id:'inn',name:'Inn'}]});const html=e.renderSharedPanel({id:'inn',kind:'inn',name:'Inn'});assert.match(html,/data-hub-common-action="talk"/);assert.match(html,/data-hub-common-action="ask"/);assert.doesNotMatch(html,/data-hub-common-action="(buy|sell|quests|inventory)"/);});
