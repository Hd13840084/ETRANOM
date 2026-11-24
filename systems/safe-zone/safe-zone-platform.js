/**
 * ETRANOM Safe-Zone Platform — V1962
 * Content is intentionally EMPTY until all 10 classes and all 10 danger regions
 * have approved design baselines. This module provides contracts and extension
 * points only; it does not create items, quests, dialogue, vendors or services.
 */
export const SAFE_ZONE_PLATFORM_VERSION = '1962.1';

export const SAFE_ZONE_MODULE_TYPES = Object.freeze([
  'npc_profiles','dialogue_trees','buildings','services','item_catalogs',
  'material_catalogs','vendor_catalogs','quest_catalogs','recipe_catalogs',
  'crafting_stations','reward_tables','schedules','reputation_rules',
  'travel_routes','interiors','city_events','tutorials'
]);

export const SAFE_ZONE_SHARED_CAPABILITIES = Object.freeze([
  'overview','dialogue','location','services','commerce','quests','inventory',
  'crafting','repair','healing','travel','reputation','rewards','schedule'
]);

const REQUIRED_CLASS_IDS = Object.freeze([
  'warrior','wizard','gunner','assassin','monk','paladin','priest','ranger','shaman','summoner'
]);
const REQUIRED_REGION_IDS = Object.freeze(Array.from({length:10},(_,i)=>`danger_region_${String(i+1).padStart(2,'0')}`));
const VALID_MODULE_TYPES = new Set(SAFE_ZONE_MODULE_TYPES);
const ACTION_CAPABILITY = Object.freeze({
  overview:'overview',talk:'dialogue',ask:'dialogue',services:'services',buy:'commerce',sell:'commerce',
  accept_quest:'quests',turn_in_quest:'quests',open_inventory:'inventory',craft:'crafting',repair:'repair',
  heal:'healing',travel:'travel',reputation:'reputation',claim_reward:'rewards',schedule:'schedule'
});
const ID_RE = /^[a-z][a-z0-9_]{1,63}$/;

function clone(value){return structuredClone(value);}
function unique(values){return new Set(values).size===values.length;}

export function createSafeZoneContentGate(readiness={}){
  const classes=readiness.classes||{};
  const regions=readiness.regions||{};
  const classRows=REQUIRED_CLASS_IDS.map(id=>({id,status:classes[id]?.status||'pending',approved:classes[id]?.approved===true}));
  const regionRows=REQUIRED_REGION_IDS.map(id=>({id,status:regions[id]?.status||'pending',approved:regions[id]?.approved===true}));
  const missingClasses=classRows.filter(x=>!x.approved).map(x=>x.id);
  const missingRegions=regionRows.filter(x=>!x.approved).map(x=>x.id);
  const ready=missingClasses.length===0&&missingRegions.length===0;
  return Object.freeze({
    ready,
    canActivateSafeZoneContent:ready,
    required:{classes:REQUIRED_CLASS_IDS.length,regions:REQUIRED_REGION_IDS.length},
    approved:{classes:classRows.length-missingClasses.length,regions:regionRows.length-missingRegions.length},
    missing:{classes:missingClasses,regions:missingRegions},
    classRows,regionRows,
    reason:ready?'all_world_designs_approved':'safe_zone_content_waits_for_10_classes_and_10_danger_regions'
  });
}

export function createSafeZonePlatform({readiness={},onEvent=()=>{}}={}){
  const gate=createSafeZoneContentGate(readiness);
  const modules=new Map();
  const actionHandlers=new Map();
  const auditErrors=[];

  function registerModule(raw){
    if(!raw||typeof raw!=='object')return {ok:false,error:'invalid_module'};
    const type=String(raw.type||'');
    if(!VALID_MODULE_TYPES.has(type))return {ok:false,error:'unsupported_module_type',type};
    if(!ID_RE.test(String(raw.id||'')))return {ok:false,error:'invalid_module_id'};
    if(modules.has(`${type}:${raw.id}`))return {ok:false,error:'duplicate_module'};
    if(!gate.canActivateSafeZoneContent && Array.isArray(raw.entries) && raw.entries.length>0){
      return {ok:false,error:'content_gate_locked',gate:gate.reason};
    }
    const entries=Array.isArray(raw.entries)?raw.entries:[];
    const ids=entries.map(x=>String(x?.id||''));
    if(entries.some(x=>!x||!ID_RE.test(String(x.id||'')))||!unique(ids))return {ok:false,error:'invalid_or_duplicate_entry_id'};
    const module=Object.freeze({
      id:raw.id,type,version:String(raw.version||'1.0.0'),
      title:String(raw.title||raw.id),requires:Object.freeze([...(raw.requires||[])]),
      entries:Object.freeze(entries.map(x=>Object.freeze(clone(x)))),
      enabled:gate.canActivateSafeZoneContent&&raw.enabled===true,
      schemaVersion:1
    });
    modules.set(`${type}:${raw.id}`,module);
    onEvent({type:'safe_zone:module_registered',moduleId:module.id,moduleType:type,entryCount:entries.length,enabled:module.enabled});
    return {ok:true,module};
  }

  function activateModule(type,id){
    const key=`${type}:${id}`,module=modules.get(key);
    if(!module)return {ok:false,error:'module_not_found'};
    if(!gate.canActivateSafeZoneContent)return {ok:false,error:'content_gate_locked',gate:gate.reason};
    if(module.requires.some(dep=>!modules.has(dep)))return {ok:false,error:'missing_dependencies'};
    const active=Object.freeze({...module,enabled:true});modules.set(key,active);
    onEvent({type:'safe_zone:module_activated',moduleId:id,moduleType:type});
    return {ok:true,module:active};
  }

  function getModule(type,id){return modules.get(`${type}:${id}`)||null;}
  function listModules(type=null){return [...modules.values()].filter(x=>!type||x.type===type);}

  function registerActionHandler(action,handler){
    if(!Object.prototype.hasOwnProperty.call(ACTION_CAPABILITY,action)||typeof handler!=='function')return {ok:false,error:'invalid_action_handler'};
    if(actionHandlers.has(action))return {ok:false,error:'duplicate_action_handler'};
    actionHandlers.set(action,handler);return {ok:true,action};
  }

  async function dispatch(entity,action,payload={},context={}){
    const validation=validateEntity(entity);
    if(!validation.ok)return {ok:false,error:'invalid_entity_contract',details:validation.errors};
    const capability=ACTION_CAPABILITY[action];
    if(!capability)return {ok:false,error:'unsupported_action'};
    if(!entity.capabilities.includes(capability))return {ok:false,error:'capability_not_available',capability};
    const handler=actionHandlers.get(action);
    if(!handler)return {ok:false,error:'shared_action_handler_not_installed',action};
    try{
      const result=await handler({entity:clone(entity),action,payload:clone(payload),context:clone(context)});
      if(!result||typeof result!=='object'||typeof result.ok!=='boolean')return {ok:false,error:'invalid_handler_result'};
      onEvent({type:'safe_zone:action_dispatched',entityId:entity.id,entityType:entity.entityType,action,ok:result.ok});
      return result;
    }catch(error){return {ok:false,error:'action_handler_failed',message:String(error?.message||error)};}
  }

  function validateEntity(entity){
    const errors=[];
    if(!entity||!ID_RE.test(String(entity.id||'')))errors.push('invalid_entity_id');
    if(!['npc','building','landmark'].includes(entity?.entityType))errors.push('invalid_entity_type');
    if(!Array.isArray(entity?.capabilities))errors.push('capabilities_must_be_array');
    else {
      if(!unique(entity.capabilities))errors.push('duplicate_capability');
      for(const cap of entity.capabilities)if(!SAFE_ZONE_SHARED_CAPABILITIES.includes(cap))errors.push(`unknown_capability:${cap}`);
    }
    if(entity?.entityType==='building'&&!entity?.stewardId)errors.push('building_requires_steward');
    if(entity?.entityType==='npc'&&entity?.stewardId)errors.push('npc_cannot_have_steward');
    return {ok:errors.length===0,errors};
  }

  function createEntity(raw){
    const entity={...raw,capabilities:[...(raw?.capabilities||['overview','dialogue'])]};
    const result=validateEntity(entity);
    return result.ok?{ok:true,entity:Object.freeze(clone(entity))}:{ok:false,error:'invalid_entity_contract',details:result.errors};
  }

  function audit(){
    const rows=[...modules.values()];
    const types=Object.fromEntries(SAFE_ZONE_MODULE_TYPES.map(type=>[type,rows.filter(x=>x.type===type).length]));
    return {
      ok:auditErrors.length===0,
      version:SAFE_ZONE_PLATFORM_VERSION,
      contentGate:gate,
      moduleCount:rows.length,
      entryCount:rows.reduce((n,x)=>n+x.entries.length,0),
      enabledModuleCount:rows.filter(x=>x.enabled).length,
      moduleTypes:types,
      activeContentCount:rows.reduce((n,x)=>n+(x.enabled?x.entries.length:0),0),
      errors:[...auditErrors]
    };
  }

  return Object.freeze({gate,registerModule,activateModule,getModule,listModules,registerActionHandler,dispatch,validateEntity,createEntity,audit,moduleTypes:SAFE_ZONE_MODULE_TYPES,capabilities:SAFE_ZONE_SHARED_CAPABILITIES,actionCapabilities:ACTION_CAPABILITY});
}

export const ETRANOM_SAFE_ZONE_READINESS = Object.freeze({
  schemaVersion:1,
  phase:'deferred_until_all_classes_and_danger_regions_are_designed',
  classes:Object.freeze(Object.fromEntries(REQUIRED_CLASS_IDS.map(id=>[id,{status:'pending',approved:false}]))),
  regions:Object.freeze(Object.fromEntries(REQUIRED_REGION_IDS.map(id=>[id,{status:'pending',approved:false}]))),
  note_fa:'محتوای NPC، ساختمان، گفتگو، آیتم، ماده، فروشگاه، مأموریت و خدمات شهر تا پایان طراحی و تأیید هر ۱۰ کلاس و هر ۱۰ منطقه خطر ساخته یا فعال نمی‌شود.'
});

export const ETRANOM_SAFE_ZONE_PLATFORM=createSafeZonePlatform({readiness:ETRANOM_SAFE_ZONE_READINESS});
if(typeof window!=='undefined'){
  window.ETRANOM_SAFE_ZONE_PLATFORM=ETRANOM_SAFE_ZONE_PLATFORM;
  window.ETRANOM_SAFE_ZONE_READINESS=ETRANOM_SAFE_ZONE_READINESS;
}
