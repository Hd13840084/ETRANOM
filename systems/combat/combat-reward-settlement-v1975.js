/**
 * ETRANOM V1975 — cross-mode reward settlement boundary.
 * Pure planning + atomic adapter contract. This module never trusts client
 * reward bundles and never mutates player saves outside the supplied tx.
 */
const obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const arr = v => Array.isArray(v) ? v : [];
const n = (v,d=0) => Number.isFinite(Number(v)) ? Number(v) : d;
const positiveInt = v => Math.max(0, Math.floor(n(v,0)));
const clone = v => structuredClone(v);

const COLLECTIONS = ['currencies','materials','items','recipes','keys','extras'];
function normalizeBundle(bundle={}) {
  const out={xp:positiveInt(bundle.xp)};
  for (const key of COLLECTIONS) {
    out[key]=arr(bundle[key]).map(x=>({
      id:String(x?.id||''), quantity:positiveInt(x?.quantity),
      ...(x?.name?{name:String(x.name)}:{}), ...(x?.category?{category:String(x.category)}:{}),
      ...(x?.metadata&&typeof x.metadata==='object'?{metadata:clone(x.metadata)}:{})
    })).filter(x=>x.id&&x.quantity>0);
  }
  return out;
}
function addBundles(bundles) {
  const out={xp:0,currencies:[],materials:[],items:[],recipes:[],keys:[],extras:[]};
  for(const raw of bundles){const b=normalizeBundle(raw);out.xp+=b.xp;
    for(const key of COLLECTIONS) for(const item of b[key]){
      const found=out[key].find(x=>x.id===item.id);
      if(found)found.quantity+=item.quantity;else out[key].push({...item});
    }
  }
  return out;
}
function assertBundle(bundle) {
  if(!bundle||typeof bundle!=='object'||Array.isArray(bundle))throw new Error('trusted_reward_bundle_required');
  if(!Number.isSafeInteger(positiveInt(bundle.xp)))throw new Error('invalid_reward_xp');
  for(const key of COLLECTIONS) for(const item of arr(bundle[key])) {
    if(!item?.id||!Number.isSafeInteger(positiveInt(item.quantity)))throw new Error('invalid_reward_entry');
  }
}

/**
 * Plan mode policies:
 * - solo: one recipient receives the trusted resolved bundle.
 * - party: each eligible member receives an independently resolved personal bundle.
 * - pvp: only an explicitly configured match-completion bundle is granted to winner;
 *   monster loot is categorically rejected in ordinary PvP.
 */
export async function planCombatRewardsV1975(input={}, deps={}) {
  const mode=String(input.mode||'');
  if(!['solo','party','pvp'].includes(mode))throw new Error('unsupported_reward_mode');
  if(input.status!=='completed'&&input.status!=='victory')throw new Error('combat_not_reward_eligible');
  const combatId=String(input.combatId||'');
  const settlementId=String(input.settlementId||'');
  if(!combatId||!settlementId)throw new Error('reward_settlement_identity_required');
  const participants=arr(input.participants).map(p=>({id:String(p?.id||''),eligible:p?.eligible!==false,contribution:n(p?.contribution,0)})).filter(p=>p.id&&p.eligible);
  if(mode==='solo'&&participants.length!==1)throw new Error('solo_requires_exactly_one_recipient');
  if(mode==='party'&&participants.length<1)throw new Error('party_requires_eligible_recipients');
  if(mode==='pvp'){
    if(input.rewardKind==='monster_loot'||input.monster||input.monsterId)throw new Error('monster_loot_forbidden_in_pvp');
    const winnerId=String(input.winnerId||'');
    if(!winnerId||!participants.some(p=>p.id===winnerId))throw new Error('pvp_winner_not_eligible');
    if(typeof deps.resolvePvpReward!=='function')throw new Error('trusted_pvp_reward_resolver_required');
    const bundle=normalizeBundle(await deps.resolvePvpReward({combatId,settlementId,winnerId,participants:clone(participants),context:obj(input.context)}));
    assertBundle(bundle);
    return Object.freeze({version:'1975.0.0',mode,combatId,settlementId,recipients:[{userId:winnerId,bundle}],losers:participants.filter(p=>p.id!==winnerId).map(p=>p.id)});
  }
  if(typeof deps.resolveMonsterReward!=='function')throw new Error('trusted_monster_reward_resolver_required');
  const recipients=[];
  // Per-player independent rolls preserve the established Party personal-loot model.
  for(const participant of participants){
    const bundle=normalizeBundle(await deps.resolveMonsterReward({
      mode,combatId,settlementId,userId:participant.id,monster:clone(obj(input.monster)),
      combatEnemy:clone(obj(input.combatEnemy)),player:clone(obj(input.playerById?.[participant.id])),
      context:clone(obj(input.context))
    }));
    assertBundle(bundle);
    recipients.push({userId:participant.id,bundle});
  }
  return Object.freeze({version:'1975.0.0',mode,combatId,settlementId,recipients,aggregate:addBundles(recipients.map(x=>x.bundle))});
}

/** Atomic adapter requires tx.getReceipt, tx.setReceipt and tx.grantRewards. */
export function createCombatRewardSettlementServiceV1975({store,resolveMonsterReward,resolvePvpReward}={}) {
  if(!store||typeof store.transact!=='function')throw new Error('serializable_reward_store_required');
  const deps={resolveMonsterReward,resolvePvpReward};
  return Object.freeze({
    version:'1975.0.0',
    plan:(input)=>planCombatRewardsV1975(input,deps),
    async settle(input={}){
      const combatId=String(input.combatId||''),settlementId=String(input.settlementId||'');
      if(!combatId||!settlementId)throw new Error('reward_settlement_identity_required');
      return store.transact(combatId,async tx=>{
        const prior=await tx.getReceipt(settlementId);
        if(prior)return {...clone(prior),duplicate:true};
        const plan=await planCombatRewardsV1975(input,deps);
        for(const recipient of plan.recipients) await tx.grantRewards(recipient.userId,clone(recipient.bundle));
        const receipt={version:plan.version,mode:plan.mode,combatId:plan.combatId,settlementId:plan.settlementId,
          recipients:plan.recipients.map(x=>x.userId),aggregate:plan.aggregate?clone(plan.aggregate):null,settled:true};
        await tx.setReceipt(settlementId,clone(receipt));
        return {...receipt,duplicate:false};
      });
    }
  });
}

export function createInMemoryRewardStoreV1975(){
  const receipts=new Map(),balances=new Map(),locks=new Map();
  return {
    receipts,balances,
    async transact(combatId,fn){
      const previous=locks.get(combatId)||Promise.resolve();let release;
      const current=new Promise(resolve=>{release=resolve;});
      const queued=previous.then(()=>current);locks.set(combatId,queued);
      await previous;
      try{return await fn({
        getReceipt:async id=>receipts.get(`${combatId}:${id}`)||null,
        setReceipt:async(id,value)=>{receipts.set(`${combatId}:${id}`,clone(value));},
        grantRewards:async(userId,bundle)=>{const key=String(userId),prior=balances.get(key)||{xp:0,currencies:{},materials:{},items:{},recipes:{},keys:{},extras:{}};prior.xp+=positiveInt(bundle.xp);for(const collection of COLLECTIONS)for(const item of arr(bundle[collection]))prior[collection][item.id]=(prior[collection][item.id]||0)+positiveInt(item.quantity);balances.set(key,prior);}
      });}finally{release();if(locks.get(combatId)===queued)locks.delete(combatId);}
    }
  };
}
