import test from 'node:test';
import assert from 'node:assert/strict';
import {getFullBodyCharacterArtV2063,auditFullBodyCharacterArtV2063} from '../../systems/characters/fullbody-character-art-v2063.mjs';
import {CHARACTER_IDENTITY_ROSTER_V2047} from '../../systems/characters/character-identity-roster-v2047.js';
test('32 non-portrait specializations have full-body art',()=>{const a=auditFullBodyCharacterArtV2063();assert.equal(a.complete,true);assert.equal(a.count,32);for(const id of a.ids)assert.match(getFullBodyCharacterArtV2063(id),/^\.\/assets\/characters\/v2063-fullbody\/.+\.webp$/);});
test('only eight warrior and wizard specializations retain portraits',()=>{const keep=new Set(['warrior_sword_ascetic','warrior_iron_bastion','warrior_chaos','warrior_apocalypse_harbinger','wizard_arcane_mage','wizard_elementalist','wizard_warlock','wizard_necromancer']);assert.equal(CHARACTER_IDENTITY_ROSTER_V2047.length,40);assert.equal([...keep].length,8);for(const id of keep)assert.equal(getFullBodyCharacterArtV2063(id),null);});
test('unknown specialization safely returns no art',()=>assert.equal(getFullBodyCharacterArtV2063('unknown'),null));
