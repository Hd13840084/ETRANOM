/** ETRANOM V1971 — extensible monster reward resolver.
 * Supports independent material/item/recipe/key drops, weighted reward tables,
 * multiple currencies, authored quantities and externally calculated XP/gold.
 * No reward is granted here; callers apply the returned bundle exactly once.
 */
const obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const num = (v, d=0) => Number.isFinite(Number(v)) ? Number(v) : d;
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const int = (v,d=1) => Math.max(0,Math.floor(num(v,d)));

/** Exact legacy Solo gold formula, now owned by the reward domain. */
export function calculateMonsterGoldRewardV1971(def={}) {
  const level=Math.max(1,Math.min(100,Math.floor(num(def.level ?? def.enemyLevel,1)))),stats=obj(def.stats),power=Math.max(0,num(stats.power ?? def.power,0)),attack=Math.max(0,num(def.attack ?? stats.attack,0)),defense=Math.max(0,num(def.defense ?? stats.defense,0)),kind=String(def.kind||'normal'),quality=String(def.quality||'').toLowerCase();
  const strengthIndex=Math.max(0,Math.min(79,Math.round((level-1)*.8+(power-9)/18+(attack-13)/90+(defense-24)/180)));
  const base=8+strengthIndex;
  const qualityMultiplier=/اسطوره|mythic/.test(quality)?2.0:/افسانه|legendary/.test(quality)?1.7:/نخبه|elite|کمیاب|rare/.test(quality)?1.45:/مهارت|تقویت|enhanced/.test(quality)||((def.skills||[]).length>0)?1.2:1;
  const kindMultiplier=(kind==='area_boss'||kind==='boss')?10:(kind==='miniboss'||kind==='mini_boss')?4:1;
  const durabilityBonus=Math.min(1.5,Math.max(0,Math.log10(Math.max(1,num(def.hp ?? def.maxHp,1))/600))*.18);
  return Math.max(base,Math.round(base*qualityMultiplier*kindMultiplier*(1+durabilityBonus)*1.2));
}

/** XP remains HP-based; region one grants full XP through its new level-10 cap. */
export function calculateMonsterXpRewardV1971(def={}, combatEnemy={}, {playerLevel=1,isRegionOneEnemy=false}={}) {
  const rawHp=num(combatEnemy.maxHp,0)||num(combatEnemy.hp,0)||num(def.maxHp,0)||num(def.hp,0)||num(def.stats?.hp,15);
  const baseXp=Math.max(1,Math.floor(Math.max(1,rawHp)/15));
  if(isRegionOneEnemy&&num(playerLevel,1)>=10)return Math.max(1,Math.floor(baseXp*.02));
  return baseXp;
}
function quantityOf(entry, random) {
  const q=obj(entry.quantity);
  if (typeof entry.quantity === 'object') {
    const min=int(q.min,1), max=Math.max(min,int(q.max,min));
    return min + Math.floor(random()*(max-min+1));
  }
  const min=int(entry.min_quantity, int(entry.quantity,1));
  const max=Math.max(min,int(entry.max_quantity,min));
  return min + Math.floor(random()*(max-min+1));
}
function pushReward(out, type, id, quantity, metadata={}) {
  if (!id || quantity <= 0) return;
  const key = type === 'currency' ? 'currencies' : type === 'material' ? 'materials' : type === 'item' ? 'items' : type === 'recipe' ? 'recipes' : type === 'key' ? 'keys' : 'extras';
  const list=out[key], found=list.find(x=>x.id===String(id));
  if(found) found.quantity += quantity; else list.push({id:String(id),quantity,...metadata});
}
function rollEntry(entry, out, random, context) {
  const type=String(entry.type || (entry.material_id ? 'material' : 'item'));
  const id=entry.id || entry.material_id || entry.item_id || entry.recipe_id || entry.key_id || entry.currency_id;
  const chance=clamp(num(entry.chance,1),0,1);
  if(!id || random()>=chance) return;
  const quantity=quantityOf(entry,random);
  pushReward(out,type,id,quantity,{name:entry.name || context.names?.[id] || String(id),category:entry.category || null,metadata:obj(entry.metadata)});
}
function rollTable(table, out, random, context) {
  const entries=Array.isArray(table?.entries)?table.entries:[];
  const mode=table?.selection || 'independent';
  if(mode==='weighted') {
    const eligible=entries.filter(x=>num(x.weight,0)>0);
    const total=eligible.reduce((s,x)=>s+num(x.weight,0),0);
    if(total<=0) return;
    let r=random()*total;
    for(const entry of eligible){r-=num(entry.weight,0);if(r<0){rollEntry({...entry,chance:1},out,random,context);break;}}
    return;
  }
  for(const entry of entries) rollEntry(entry,out,random,context);
}
export function validateMonsterRewardLinksV1971(monsters=[], rewardTables=[], catalogs={}) {
  const tables=new Set(rewardTables.map(x=>String(x.id||'')));
  const errors=[];
  for(const table of rewardTables){
    for(const entry of table.entries||[]){
      const type=String(entry.type||(entry.material_id?'material':'item')),id=entry.id||entry.material_id||entry.item_id||entry.recipe_id||entry.key_id||entry.currency_id;
      if(!id) errors.push({tableId:table.id,reason:'reward_entry_id_missing'});
      else if(type==='material'&&!catalogs.materials?.has(String(id))) errors.push({tableId:table.id,id:String(id),reason:'material_missing'});
      else if(type==='item'&&!catalogs.items?.has(String(id))) errors.push({tableId:table.id,id:String(id),reason:'item_missing'});
      else if(type==='recipe'&&catalogs.recipes&&!catalogs.recipes.has(String(id))) errors.push({tableId:table.id,id:String(id),reason:'recipe_missing'});
    }
  }
  for(const monster of monsters){
    const materialIds=[...(monster.drops||[]),...(monster.reward_entries||monster.rewards?.entries||[])].filter(x=>String(x.type||(x.material_id?'material':'item'))==='material').map(x=>x.material_id||x.id).filter(Boolean);
    const kind=String(monster.kind||'normal'),limit=(kind==='mini_boss'||kind==='miniboss')?2:(kind==='area_boss'||kind==='boss')?3:1;
    if(new Set(materialIds.map(String)).size>limit) errors.push({monsterId:monster.id,reason:'material_type_limit_exceeded',limit});
    for(const tableId of monster.reward_table_ids||[]) if(!tables.has(String(tableId))) errors.push({monsterId:monster.id,tableId:String(tableId),reason:'missing_reward_table'});
    for(const drop of monster.drops||[]){
      const type=String(drop.type||(drop.material_id?'material':'item'));
      const id=drop.id||drop.material_id||drop.item_id||drop.recipe_id||drop.key_id;
      if(!id) errors.push({monsterId:monster.id,reason:'drop_id_missing'});
      else if(type==='material'&&!catalogs.materials?.has(String(id))) errors.push({monsterId:monster.id,id:String(id),reason:'material_missing'});
      else if(type==='item'&&!catalogs.items?.has(String(id))) errors.push({monsterId:monster.id,id:String(id),reason:'item_missing'});
      else if(type==='recipe'&&catalogs.recipes&&!catalogs.recipes.has(String(id))) errors.push({monsterId:monster.id,id:String(id),reason:'recipe_missing'});
    }
    for(const entry of monster.reward_entries||[]){
      const type=String(entry.type||'item'),id=entry.id||entry.material_id||entry.item_id||entry.recipe_id||entry.key_id||entry.currency_id;
      if(!id) errors.push({monsterId:monster.id,reason:'reward_entry_id_missing'});
      else if(type==='material'&&!catalogs.materials?.has(String(id))) errors.push({monsterId:monster.id,id:String(id),reason:'material_missing'});
      else if(type==='item'&&!catalogs.items?.has(String(id))) errors.push({monsterId:monster.id,id:String(id),reason:'item_missing'});
      else if(type==='recipe'&&catalogs.recipes&&!catalogs.recipes.has(String(id))) errors.push({monsterId:monster.id,id:String(id),reason:'recipe_missing'});
    }
  }
  return {valid:errors.length===0,errors};
}
export function resolveMonsterRewardsV1971(monster={}, options={}) {
  const random=typeof options.random==='function'?options.random:Math.random;
  const tables=options.rewardTables instanceof Map?options.rewardTables:new Map((options.rewardTables||[]).map(x=>[String(x.id),x]));
  const out={monsterId:String(monster.id||''),xp:int(options.xp ?? calculateMonsterXpRewardV1971(monster,options.combatEnemy||{},options),0),currencies:[],materials:[],items:[],recipes:[],keys:[],extras:[]};
  const gold=num(options.gold ?? calculateMonsterGoldRewardV1971(monster),0);
  if(gold>0) pushReward(out,'currency','gold',Math.floor(gold),{name:'سکه'});
  for(const drop of monster.drops||[]) rollEntry(drop,out,random,options);
  for(const entry of monster.reward_entries||monster.rewards?.entries||[]) rollEntry(entry,out,random,options);
  for(const id of monster.reward_table_ids||[]) { const table=tables.get(String(id)); if(table) rollTable(table,out,random,options); }
  for(const currency of monster.rewards?.currencies||[]) rollEntry({...currency,type:'currency'},out,random,options);
  return out;
}
export function createMonsterRewardEngineV1971({rewardTables=[],names={}}={}) {
  const map=new Map(rewardTables.map(x=>[String(x.id),x]));
  return Object.freeze({version:'1971.0.0',validate:(monsters,catalogs)=>validateMonsterRewardLinksV1971(monsters,rewardTables,catalogs),resolve:(monster,options={})=>resolveMonsterRewardsV1971(monster,{...options,rewardTables:map,names:{...names,...obj(options.names)}})});
}
