import test from 'node:test';
import assert from 'node:assert/strict';
import { createCombatRewardSettlementServiceV1975, createInMemoryRewardStoreV1975, planCombatRewardsV1975 } from '../../systems/combat/combat-reward-settlement-v1975.js';

const monster={id:'ash_wolf',kind:'normal'};
const bundleFor=userId=>({xp:10,currencies:[{id:'gold',quantity:5}],materials:[{id:`pelt_${userId}`,quantity:1}]});

test('Solo plan grants the complete trusted bundle to exactly one player',async()=>{
 const p=await planCombatRewardsV1975({mode:'solo',status:'victory',combatId:'c1',settlementId:'s1',participants:[{id:'u1'}],monster},{resolveMonsterReward:({userId})=>bundleFor(userId)});
 assert.equal(p.recipients.length,1);assert.equal(p.recipients[0].bundle.xp,10);assert.equal(p.aggregate.currencies[0].quantity,5);
});
test('Party personal loot resolves an independent reward bundle per eligible member',async()=>{
 const p=await planCombatRewardsV1975({mode:'party',status:'completed',combatId:'c2',settlementId:'s2',participants:[{id:'u1'},{id:'u2'},{id:'u3',eligible:false}],monster},{resolveMonsterReward:({userId})=>bundleFor(userId)});
 assert.deepEqual(p.recipients.map(x=>x.userId),['u1','u2']);assert.equal(p.aggregate.xp,20);assert.equal(p.aggregate.materials.length,2);
});
test('Party recipients each receive their own material and currency results',async()=>{
 const store=createInMemoryRewardStoreV1975();const service=createCombatRewardSettlementServiceV1975({store,resolveMonsterReward:({userId})=>bundleFor(userId)});
 await service.settle({mode:'party',status:'victory',combatId:'c3',settlementId:'s3',participants:[{id:'a'},{id:'b'}],monster});
 assert.equal(store.balances.get('a').materials.pelt_a,1);assert.equal(store.balances.get('b').materials.pelt_b,1);
});
test('PvP only awards the winner from a trusted match reward resolver',async()=>{
 const p=await planCombatRewardsV1975({mode:'pvp',status:'completed',combatId:'p1',settlementId:'p-reward',participants:[{id:'a'},{id:'b'}],winnerId:'a',rewardKind:'match_completion'},{resolvePvpReward:()=>({xp:20,currencies:[{id:'arena_token',quantity:2}]})});
 assert.deepEqual(p.recipients.map(x=>x.userId),['a']);assert.deepEqual(p.losers,['b']);
});
test('ordinary PvP rejects monster loot',async()=>{
 await assert.rejects(()=>planCombatRewardsV1975({mode:'pvp',status:'completed',combatId:'p2',settlementId:'p2s',participants:[{id:'a'}],winnerId:'a',monster},{resolvePvpReward:()=>({})}),/monster_loot_forbidden_in_pvp/);
});
test('no rewards are issued for defeat, retreat or nonterminal encounters',async()=>{
 for(const status of ['active','defeat','retreat','aborted'])await assert.rejects(()=>planCombatRewardsV1975({mode:'solo',status,combatId:'c',settlementId:status,participants:[{id:'u'}],monster},{resolveMonsterReward:()=>({})}),/combat_not_reward_eligible/);
});
test('missing participants and malformed identities are rejected',async()=>{
 await assert.rejects(()=>planCombatRewardsV1975({mode:'solo',status:'victory',combatId:'c',settlementId:'s',participants:[]},{resolveMonsterReward:()=>({})}),/solo_requires_exactly_one_recipient/);
 await assert.rejects(()=>planCombatRewardsV1975({mode:'party',status:'victory',combatId:'c',settlementId:'',participants:[{id:'u'}]},{resolveMonsterReward:()=>({})}),/reward_settlement_identity_required/);
});
test('settlement receipt prevents duplicate payouts',async()=>{
 const store=createInMemoryRewardStoreV1975();const service=createCombatRewardSettlementServiceV1975({store,resolveMonsterReward:({userId})=>bundleFor(userId)});
 const input={mode:'solo',status:'victory',combatId:'c4',settlementId:'s4',participants:[{id:'u'}],monster};
 const first=await service.settle(input),second=await service.settle(input);
 assert.equal(first.duplicate,false);assert.equal(second.duplicate,true);assert.equal(store.balances.get('u').xp,10);
});
test('concurrent duplicate settlements are serialized atomically',async()=>{
 const store=createInMemoryRewardStoreV1975();const service=createCombatRewardSettlementServiceV1975({store,resolveMonsterReward:({userId})=>bundleFor(userId)});
 const input={mode:'solo',status:'victory',combatId:'c5',settlementId:'s5',participants:[{id:'u'}],monster};
 const results=await Promise.all([service.settle(input),service.settle(input)]);
 assert.equal(results.filter(x=>x.duplicate).length,1);assert.equal(store.balances.get('u').xp,10);
});
test('client-supplied reward bundle is ignored; trusted resolver is mandatory',async()=>{
 await assert.rejects(()=>planCombatRewardsV1975({mode:'solo',status:'victory',combatId:'c6',settlementId:'s6',participants:[{id:'u'}],monster,rewardBundle:{xp:999999}}),/trusted_monster_reward_resolver_required/);
});
test('invalid reward identifiers and quantities are normalized safely',async()=>{
 const p=await planCombatRewardsV1975({mode:'solo',status:'victory',combatId:'c7',settlementId:'s7',participants:[{id:'u'}],monster},{resolveMonsterReward:()=>({xp:-5,items:[{id:'',quantity:4},{id:'potion',quantity:2.8}]})});
 assert.equal(p.recipients[0].bundle.xp,0);assert.equal(p.recipients[0].bundle.items[0].quantity,2);
});
test('factory requires an atomic transaction store',()=>assert.throws(()=>createCombatRewardSettlementServiceV1975({}),/serializable_reward_store_required/));
