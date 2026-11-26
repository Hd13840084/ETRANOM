import test from 'node:test';
import assert from 'node:assert/strict';
import {
  publishOwnerRuntimeConfig,
  resolveProgressionPolicyV2013,
  resolveEconomyPolicyV2013,
  resolveGuildPolicyV2013,
  resolvePartyCapacityV2014,
  resolvePvpAvailabilityV2014,
  resolveClassBalancePolicyV2013
} from '../systems/admin/owner-runtime-adapters-v2011.js';
import { grantCharacterXpV1979, applyDeathPenaltyV1979 } from '../systems/progression/character-progression-v1979.js';

test('V2014 published progression policies affect actual XP grant and death penalty',()=>{
  publishOwnerRuntimeConfig({progression_rule:[{id:'default',xp_multiplier:2,death_xp_loss_pct:10,death_gold_loss_pct:5}]});
  assert.equal(resolveProgressionPolicyV2013().xpMultiplier,2);
  const grant=grantCharacterXpV1979({level:1,xp:0,gold:100},50);
  assert.equal(grant.grantedXp,100);
  const death=applyDeathPenaltyV1979({level:1,xp:100,gold:100});
  assert.equal(death.xpLost,10); assert.equal(death.goldLost,5);
});

test('V2014 bounded policy resolvers preserve safe defaults and clamp values',()=>{
  publishOwnerRuntimeConfig({economy_rule:[{id:'default',market_fee_pct:99,trading_enabled:false}],guild_config:[{id:'default',creation_cost:1200}],party_config:[{id:'default',max_members:8,invites_enabled:false}],pvp_config:[{id:'default',pvp_enabled:false}],class_balance:[{id:'warrior',class_id:'warrior',hp_scale:3,mp_scale:0.8}]});
  assert.equal(resolveEconomyPolicyV2013().marketFeePct,25);
  assert.equal(resolveEconomyPolicyV2013().tradingEnabled,false);
  assert.equal(resolveGuildPolicyV2013().creationCost,1200);
  assert.equal(resolvePartyCapacityV2014().maxMembers,8);
  assert.equal(resolvePartyCapacityV2014().invitesEnabled,false);
  assert.equal(resolvePvpAvailabilityV2014().enabled,false);
  assert.equal(resolveClassBalancePolicyV2013('warrior').hpScale,2);
  assert.equal(resolveClassBalancePolicyV2013('warrior').mpScale,0.8);
});

test('V2014 no published policy preserves the established defaults',()=>{
  publishOwnerRuntimeConfig({});
  assert.deepEqual({...resolveProgressionPolicyV2013()},{xpMultiplier:1,deathXpLossPct:3,deathGoldLossPct:1});
  assert.equal(resolveEconomyPolicyV2013().marketFeePct,0);
  assert.equal(resolveGuildPolicyV2013().creationCost,1000);
  assert.equal(resolvePartyCapacityV2014().maxMembers,4);
  assert.equal(resolvePvpAvailabilityV2014().enabled,true);
});
