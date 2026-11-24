import test from 'node:test';
import assert from 'node:assert/strict';
import { createUnifiedBattleDescriptorV1963, renderUnifiedBattleScreenV1963 } from '../../systems/combat/unified-battle-experience-v1963.js';
const player={id:'p1',name:'قهرمان',level:20,hp:80,maxHp:100,mp:30,maxMp:40,stamina:20,maxStamina:30};
const opponent={id:'p2',name:'حریف',level:21,hp:70,maxHp:100,mp:25,maxMp:40};
test('V1965 PvP renders both combatants through the canonical battle surface',()=>{const descriptor=createUnifiedBattleDescriptorV1963({mode:'pvp',encounterType:'pvp_match',encounterId:'match-1'});const html=renderUnifiedBattleScreenV1963({descriptor,player,opponents:[opponent],actionAttribute:'data-pvp-action'});assert.match(html,/data-unified-battle="pvp"/);assert.match(html,/قهرمان/);assert.match(html,/حریف/);assert.match(html,/data-pvp-action/);assert.match(html,/ubv1963-opponents/);});
test('V1965 keeps solo and party contracts unchanged',()=>{for(const [mode,encounterType] of [['solo','dungeon'],['party','party_field']]){const descriptor=createUnifiedBattleDescriptorV1963({mode,encounterType});const html=renderUnifiedBattleScreenV1963({descriptor,player,enemies:[{id:'e1',name:'دشمن',hp:10,maxHp:10}]});assert.match(html,new RegExp(`data-unified-battle="${mode}"`));assert.match(html,/دشمن/);}});
