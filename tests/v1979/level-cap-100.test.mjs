import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVEL_CAP_V1979, xpRequiredForNextLevelV1979, normalizeProgressionStateV1979, grantCharacterXpV1979 } from '../../systems/progression/character-progression-v1979.js';

test('V1979 cap is 100 and clamps legacy/oversized levels',()=>{
 assert.equal(LEVEL_CAP_V1979,100);
 assert.equal(normalizeProgressionStateV1979({level:50}).level,50);
 assert.equal(normalizeProgressionStateV1979({level:150}).level,100);
});
test('XP thresholds continue through level 99 and stop at 100',()=>{
 assert.ok(xpRequiredForNextLevelV1979(50)>0);
 assert.ok(xpRequiredForNextLevelV1979(99)>xpRequiredForNextLevelV1979(98));
 assert.equal(xpRequiredForNextLevelV1979(100),0);
});
test('character can progress beyond 50 and receives normal per-level rewards',()=>{
 const xpTo50=Array.from({length:49},(_,i)=>xpRequiredForNextLevelV1979(i+1)).reduce((a,b)=>a+b,0);
 const before={level:50,xp:xpTo50,skillPoints:0,attributePoints:0,maxHp:100,maxMp:50,maxStamina:100,hp:50,mp:20,stamina:40};
 const result=grantCharacterXpV1979(before,xpRequiredForNextLevelV1979(50));
 assert.equal(result.state.level,51);
 assert.equal(result.levelsGained,1);
 assert.equal(result.state.skillPoints,2);
 assert.equal(result.state.attributePoints,5);
});
