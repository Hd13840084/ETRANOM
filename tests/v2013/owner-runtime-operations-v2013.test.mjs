import test from 'node:test';
import assert from 'node:assert/strict';
import { grantCharacterXpV1979, applyDeathPenaltyV1979 } from '../../systems/progression/character-progression-v1979.js';
import { publishOwnerRuntimeConfig, resolveProgressionPolicyV2013, resolveClassBalancePolicyV2013, resolveEconomyPolicyV2013, resolveGuildPolicyV2013, resolvePartyPolicyV2013, resolvePvpPolicyV2013 } from '../../systems/admin/owner-runtime-adapters-v2011.js';

test('V2013 progression policy changes XP grant and death loss while preserving defaults',()=>{
  const input={level:1,xp:0,gold:1000};
  assert.equal(grantCharacterXpV1979(input,100).grantedXp,100);
  publishOwnerRuntimeConfig({progression_rule:[{id:'default',xp_multiplier:2,death_xp_loss_pct:10,death_gold_loss_pct:5}]});
  assert.equal(grantCharacterXpV1979(input,100).grantedXp,200);
  const death=applyDeathPenaltyV1979({...input,xp:50});
  assert.equal(death.xpLost,5); assert.equal(death.goldLost,50);
  publishOwnerRuntimeConfig({});
  assert.equal(grantCharacterXpV1979(input,100).grantedXp,100);
});
test('V2013 clamps all numeric policies to safe operational ranges',()=>{
  publishOwnerRuntimeConfig({
    progression_rule:[{id:'default',xp_multiplier:999,death_xp_loss_pct:-1}],
    class_balance:[{id:'warrior-balance',class_id:'warrior',hp_scale:99,attack_scale:0}],
    economy_rule:[{id:'default',market_fee_pct:99}],
    guild_config:[{id:'default',max_members:9999,creation_cost:-4}],
    party_config:[{id:'default',max_members:0}],
    pvp_config:[{id:'default',entry_cost:-20}]
  });
  assert.equal(resolveProgressionPolicyV2013().xpMultiplier,5);
  assert.equal(resolveProgressionPolicyV2013().deathXpLossPct,0);
  assert.equal(resolveClassBalancePolicyV2013('warrior').hpScale,2);
  assert.equal(resolveClassBalancePolicyV2013('warrior').attackScale,.5);
  assert.equal(resolveEconomyPolicyV2013().marketFeePct,25);
  assert.equal(resolveGuildPolicyV2013().maxMembers,500);
  assert.equal(resolveGuildPolicyV2013().creationCost,0);
  assert.equal(resolvePartyPolicyV2013().maxMembers,2);
  assert.equal(resolvePvpPolicyV2013().entryCost,0);
  publishOwnerRuntimeConfig({});
});
test('V2013 uses explicit policy injection without depending on browser globals',()=>{
  const result=grantCharacterXpV1979({level:1,xp:0},100,{policy:{xp_multiplier:1.5}});
  assert.equal(result.grantedXp,150);
});
