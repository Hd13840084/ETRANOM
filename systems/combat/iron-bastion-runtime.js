/** Iron Bastion authoritative mechanics. Shared by solo/party/PvP adapters. */
import IRON_BASTION from '../../content/classes/warrior_iron_bastion_v1.json' with { type: 'json' };
import { resolveCombatSkill } from './shared-skill-runtime.js?v=1841';

const clone = v => JSON.parse(JSON.stringify(v ?? {}));
const n = (v,d=0) => Number.isFinite(Number(v)) ? Number(v) : d;
const clamp = (v,a,b) => Math.max(a,Math.min(b,n(v)));
const SKILLS = new Map(IRON_BASTION.skills.map(x=>[x.id,x]));
const ASC = new Map(IRON_BASTION.ascendedSkills.map(x=>[x.id,x]));
const TALENTS = IRON_BASTION.talentBranches.flatMap(x=>x.talents);
const TALENT_BY_ID = new Map(TALENTS.map(x=>[x.id,x]));
export const IRON_BASTION_DATA = IRON_BASTION;
export const IRON_BASTION_RUNTIME_VERSION = '1.0.1';

export function createIronBastionProgress(){return {skillRanks:{},unlockedTalents:[],talentRanks:{},domain:{active:false,stage:0,usedThisBattle:false,ascendedUsed:false,ascendedSkillId:null,turnsRemaining:0},domainQuest:{started:false,guardianDefeats:0,complete:false},skillCooldowns:{},buffs:{},statuses:{}};}
export function normalizeIronBastionProgress(raw={}){
 const p={...createIronBastionProgress(),...clone(raw)};
 p.skillRanks={...(p.skillRanks||{})};
 const legacySkillMap={warrior_2_strike:'ironcleave',warrior_2_guard:'unyielding_wall',warrior_2_wave:'quake_of_iron',warrior_2_stance:'colossus_rage',warrior_2_ultimate:'last_bastion'};for(const [oldId,newId] of Object.entries(legacySkillMap)){if(p.skillRanks[oldId]!=null&&p.skillRanks[newId]==null)p.skillRanks[newId]=clamp(Math.floor(n(p.skillRanks[oldId],1)),1,6);}p.talentRanks={...(p.talentRanks||{})};p.unlockedTalents=[...new Set(Array.isArray(p.unlockedTalents)?p.unlockedTalents:[])];
 p.domain={...createIronBastionProgress().domain,...(p.domain||{})};p.domainQuest={...createIronBastionProgress().domainQuest,...(p.domainQuest||{})};p.skillCooldowns={...(p.skillCooldowns||{})};p.buffs={...(p.buffs||{})};p.statuses={...(p.statuses||{})};return p;
}
function getProgress(actor){return normalizeIronBastionProgress(actor.classProgress?.warrior_iron_bastion||actor.ironBastionProgress||{});}
function putProgress(actor,p){actor.classProgress={...(actor.classProgress||{}),warrior_iron_bastion:p};actor.ironBastionProgress=p;return actor;}
function removeAppliedDomainEffects(current={},applied={}){const out={...current};for(const [key,value] of Object.entries(applied||{})){if(typeof value!=='number')continue;const next=n(out[key])-value;if(Math.abs(next)<1e-9)delete out[key];else out[key]=next;}return out;}

export function collectIronBastionTalentEffects(progress={}){
 const p=normalizeIronBastionProgress(progress),out={};
 for(const id of p.unlockedTalents){const t=TALENT_BY_ID.get(id);if(!t)continue;for(const [k,v] of Object.entries(t.effect||t.effects||{}))if(typeof v==='number')out[k]=n(out[k])+v;}
 return Object.freeze(out);
}
export function purchaseIronBastionTalent(actor,talentId){
 const a=clone(actor),p=getProgress(a),t=TALENT_BY_ID.get(String(talentId));if(!t)throw new Error('iron_bastion_talent_not_found');
 if(p.unlockedTalents.includes(t.id))throw new Error('iron_bastion_talent_already_unlocked');
 const cost=Math.max(1,n(t.cost,1)),points=n(a.skillPoints??a.skill_points??p.skillPoints);
 if(points<cost)throw new Error('insufficient_skill_points');
 a.skillPoints=Math.max(0,points-cost);p.unlockedTalents.push(t.id);p.talentRanks[t.id]=1;putProgress(a,p);
 return Object.freeze({actor:a,progress:p,talent:t,spent:cost});
}
export function upgradeIronBastionSkill(actor,skillId){
 const a=clone(actor),p=getProgress(a),s=SKILLS.get(String(skillId));if(!s)throw new Error('iron_bastion_skill_not_found');
 if(n(a.level,1)<n(s.unlockLevel,1))throw new Error('iron_bastion_skill_locked');
 const rank=clamp(Math.floor(n(p.skillRanks[s.id],1)),1,6);if(rank>=6)throw new Error('iron_bastion_skill_max_rank');
 const cost=n(s.upgrades?.[rank-1]?.pointsRequired,1),points=n(a.skillPoints??a.skill_points??p.skillPoints);
 if(points<cost)throw new Error('insufficient_skill_points');a.skillPoints=Math.max(0,points-cost);p.skillRanks[s.id]=rank+1;putProgress(a,p);
 return Object.freeze({actor:a,progress:p,skillId:s.id,rank:rank+1,spent:cost});
}
export function listIronBastionSkills({level=1,progress={}}={}){const p=normalizeIronBastionProgress(progress);return IRON_BASTION.skills.filter(s=>n(s.unlockLevel)<=n(level)).map(s=>({...s,rank:clamp(n(p.skillRanks[s.id],1),1,6),classId:'warrior',specializationId:'warrior_iron_bastion'}));}
function domainStage(level,progress={}){return [...IRON_BASTION.domain.stages].reverse().find(s=>n(level)>=n(s.unlockLevel)&&(!s.requiresQuest||Boolean(progress.domainQuest?.complete)))||null;}
export function activateIronBastionDomain(actor,{level=actor.level,mode='solo'}={}){
 const a=clone(actor),p=getProgress(a),stage=domainStage(level,p);if(!stage)throw new Error(n(level)>=50?'iron_bastion_domain_trial_required':'iron_bastion_domain_locked');
 if(p.domain.usedThisBattle)throw new Error('iron_bastion_domain_already_used');
 const domainAppliedEffects=Object.fromEntries(Object.entries([{defensePct:10,controlResistPct:8},{defensePct:15,controlResistPct:12},{defensePct:18,attackPct:15},{defensePct:22,attackPct:20,controlResistPct:15}][stage.stage-1]||{}));p.domain={active:true,domainAppliedEffects,stage:stage.stage,stageId:stage.id,turnsRemaining:n(stage.durationPlayerTurns,5),duration:n(stage.durationPlayerTurns,5),usedThisBattle:true,ascendedUsed:false,ascendedSkillId:null,selectedBaseSkillId:null,mode};const stageFx=[{defensePct:10,controlResistPct:8},{defensePct:15,controlResistPct:12},{defensePct:18,attackPct:15},{defensePct:22,attackPct:20,controlResistPct:15}][stage.stage-1]||{};a.combatEffects={...(a.combatEffects||{}),...Object.fromEntries(Object.entries(stageFx).map(([k,v])=>[k,n(a.combatEffects?.[k])+v]))};putProgress(a,p);
 return Object.freeze({actor:a,progress:p,domain:clone(p.domain),stage,log:[{type:'iron_bastion_domain_activated',stage:stage.stage,turns:p.domain.turnsRemaining}]});
}
export function listIronBastionAscensions(actor){const p=getProgress(actor);return p.domain.active&&!p.domain.ascendedUsed?IRON_BASTION.ascendedSkills:[];}
export function selectIronBastionAscension(actor,ascendedSkillId){
 const a=clone(actor),p=getProgress(a),asc=ASC.get(String(ascendedSkillId));if(!p.domain.active)throw new Error('iron_bastion_ascension_requires_domain');if(p.domain.ascendedUsed||p.domain.ascendedSkillId)throw new Error('iron_bastion_only_one_ascension_per_domain');if(!asc)throw new Error('iron_bastion_ascension_not_found');
 p.domain.ascendedSkillId=asc.id;p.domain.selectedBaseSkillId=asc.skillId;putProgress(a,p);return Object.freeze({actor:a,progress:p,ascension:asc});
}
export function endIronBastionDomain(actor,reason='ended'){
 const a=clone(actor),p=getProgress(a);if(p.domain.active){a.combatEffects=removeAppliedDomainEffects(a.combatEffects||{},p.domain.domainAppliedEffects||{});p.domain.active=false;p.domain.turnsRemaining=0;p.domain.ascendedSkillId=null;p.domain.selectedBaseSkillId=null;p.domain.ascendedUsed=false;p.domain.endReason=String(reason);}putProgress(a,p);return Object.freeze({actor:a,progress:p,log:[{type:'iron_bastion_domain_ended',reason}]});
}
export function tickIronBastionDomain(actor,targets=[]){
 const a=clone(actor),p=getProgress(a),d=p.domain,ts=clone(targets),log=[];if(!d.active)return Object.freeze({actor:a,targets:ts,log});
 d.turnsRemaining=Math.max(0,n(d.turnsRemaining)-1);
 if(d.turnsRemaining<=0){a.combatEffects=removeAppliedDomainEffects(a.combatEffects||{},d.domainAppliedEffects||{});if(d.stage>=4){for(const t of ts.filter(x=>n(x.hp)>0)){const boss=t.isBoss||t.isMiniboss||/boss/i.test(String(t.rank||t.type||''));const amount=Math.max(1,Math.floor(n(a.attack)* (boss?0.8:1.2)));t.hp=Math.max(0,n(t.hp)-amount);log.push({type:'iron_bastion_domain_final_wave',target:t.id,amount,bossLimited:!!boss});}}d.active=false;d.ascendedSkillId=null;d.selectedBaseSkillId=null;d.ascendedUsed=false;log.push({type:'iron_bastion_domain_ended'});}
 putProgress(a,p);return Object.freeze({actor:a,targets:ts,log});
}
function rankSkill(skill,rank){const out=clone(skill);for(let i=0;i<rank-1;i++){const mod=skill.upgrades?.[i]?.modifier||{};for(const [k,v] of Object.entries(mod)){if(k==='damagePct')out.powerPct=n(out.powerPct)+n(v);else if(k==='staminaCostPct')out.staminaCost=Math.max(0,n(out.staminaCost)*(1-n(v)/100));else if(k==='effects'&&v&&typeof v==='object')out.effects={...(out.effects||{}),...v};else out[k]=n(out[k])+n(v);}}return out;}
function isBoss(t){return !!(t?.isBoss||t?.isMiniboss||/boss/i.test(String(t?.rank||t?.type||t?.category||'')));}
function coreType(skill){return ({single_damage_debuff:'single_damage',multi_target_damage:'multi_target_damage',ultimate_aoe:'ultimate_all_damage',self_guard:'shield',team_guard:'shield',counter:'self_buff'})[skill.type]||skill.type;}
function applySpecialEffects(result,skill,asc,actor,progress,payload){
 const a=result.actor,targets=result.targets,logs=result.log||[],fx=skill.effects||{},rank=n(progress.skillRanks[skill.id],1);const domain=progress.domain;
 if(skill.id==='ironcleave'&&targets.length){const t=targets.find(x=>String(x.id)===String(payload.targetId))||targets.find(x=>n(x.hp)>0);if(t&&(n(fx.armorPenPct)>0||n(collectIronBastionTalentEffects(progress).armorPenPct)>0))t.statuses={...(t.statuses||{}),iron_bastion_armor_break:{turns:1,defenseReductionPct:clamp(n(fx.armorPenPct)+n(collectIronBastionTalentEffects(progress).armorPenPct),0,60),hardControl:false}};}
 if(skill.id==='breaker_slam'){const t=targets.find(x=>String(x.id)===String(payload.targetId))||targets.find(x=>n(x.hp)>0);if(t&&t.hp>=0&&(t.isArmored||t.armored||t.shield)) {const base=logs.filter(x=>x.type==='damage'&&String(x.target)===String(t.id)).reduce((v,x)=>v+n(x.amount),0),bonus=Math.floor(base*n(fx.bonusVsArmoredPct)/100);t.hp=Math.max(0,n(t.hp)-bonus);if(bonus)logs.push({type:'iron_bastion_armored_bonus',target:t.id,amount:bonus});}}
 if(skill.id==='quake_of_iron'){for(const t of targets.filter(x=>n(x.hp)>0))t.statuses={...(t.statuses||{}),iron_quake_slow:{turns:n(fx.durationTurns,1),speedPct:-n(fx.slowPct),hardControl:false}};}
 if(skill.id==='unyielding_wall'){a.shield={hp:Math.floor(n(a.maxHp,100)* (asc?0.35:0.22)),turns:n(fx.durationTurns,2),reductionPct:asc?35:22};}
 if(skill.id==='iron_reprisal'){a.ironBastionStates={...(a.ironBastionStates||{}),reflectPct:asc?40:n(fx.reflectPct,30),reflectTurns:n(fx.durationTurns,1),reflectCapPerHit:isBoss(payload.targets?.[0])?18:100};}
 if(skill.id==='marching_bastion'&&Array.isArray(a.partyMembers)){a.partyMembers=a.partyMembers.map(m=>({...m,shield:{hp:Math.floor(n(m.maxHp,100)*0.1),turns:n(fx.durationTurns,2),reductionPct:n(fx.allyDamageReductionPct,14)}}));}
 if(skill.id==='shatterguard'){for(const t of targets.filter(x=>n(x.hp)>0)){const boss=isBoss(t),reduction=asc?(boss?10:25):n(fx.defenseBreakPct,18);t.statuses={...(t.statuses||{}),iron_bastion_shatter:{turns:n(fx.durationTurns,2),defenseReductionPct:reduction,hardControl:false}};}}
 if(skill.id==='last_bastion'){const hitCount=logs.filter(x=>x.type==='damage').length;const shieldPct=asc?10:n(fx.shieldPerTargetPct,8);a.shield={hp:Math.min(Math.floor(n(a.maxHp,100)*0.30),Math.floor(n(a.maxHp,100)*shieldPct*hitCount/100)),turns:2,reductionPct:0};}
 if(skill.id==='fortress_stance'||skill.id==='colossus_rage'){a.combatEffects={...(a.combatEffects||{}),...(skill.id==='fortress_stance'?{defensePct:asc?35:n(fx.defensePct),speedPct:n(fx.speedPct),controlResistPct:asc?30:n(fx.controlResistPct)}:{attackPct:asc?35:n(fx.attackPct),defensePct:n(fx.defensePct),speedPct:n(fx.speedPct)})};a.buffs={...(a.buffs||{}),[skill.id]:{turns:n(fx.durationTurns,3),effects:clone(a.combatEffects)}};}
 if(asc){progress.domain.ascendedUsed=true;progress.domain.ascendedSkillId=asc.id;logs.push({type:'iron_bastion_ascended_skill_used',ascendedSkillId:asc.id,baseSkillId:skill.id,newName:asc.name});}
 putProgress(a,progress);return Object.freeze({...result,actor:a,targets,log:logs,displaySkillName:asc?.name||skill.name,ascended:!!asc});
}
export function resolveIronBastionSkill(skillId,payload={}){
 const actor=clone(payload.actor||{}),p=getProgress(actor),asc=ASC.get(String(skillId));let skill=asc?SKILLS.get(asc.skillId):SKILLS.get(String(skillId));if(!skill)throw new Error('iron_bastion_skill_not_found');
 if(n(actor.level,1)<n(skill.unlockLevel,1))throw new Error('iron_bastion_skill_locked');if(asc&&!p.domain.active)throw new Error('iron_bastion_ascension_requires_domain');
 if(asc&&p.domain.ascendedUsed)throw new Error('iron_bastion_only_one_ascension_per_domain');
 if(asc&&p.domain.ascendedSkillId!==asc.id)throw new Error('iron_bastion_ascension_not_selected');
 const rank=clamp(n(p.skillRanks[skill.id],1),1,6),ranked=rankSkill(skill,rank),talentFx=collectIronBastionTalentEffects(p),cooldowns={...(actor.skillCooldowns||{})};if(n(cooldowns[skill.id])>0)throw new Error('skill_on_cooldown');const cost=Math.max(0,Math.ceil(n(skill.staminaCost)*(1-clamp(n(talentFx.guardCostReductionPct),0,50)/100)));
 if(n(actor.stamina,n(actor.maxStamina,100))<cost)throw new Error('insufficient_stamina');actor.stamina=Math.max(0,n(actor.stamina,n(actor.maxStamina,100))-cost);if(n(skill.cooldownTurns)>0)cooldowns[skill.id]=n(skill.cooldownTurns);
 const type=coreType(ranked),effects={...(payload.effects||{})};let talentDamage=n(talentFx.axeDamagePct)+n(talentFx.heavyAttackPct)+(ranked.type==='multi_target_damage'||ranked.type==='ultimate_aoe'?n(talentFx.aoeDamagePct):0)+(skill.id==='ironcleave'?n(talentFx.ironcleavePct):0);let normalized={...ranked,type,scalingStat:'attack',damagePct:Math.floor(n(ranked.powerPct)*(1+talentDamage/100)),manaCost:0,staminaCost:0};
 if(['self_guard','team_guard'].includes(ranked.type)){normalized.type='shield';normalized.shieldPct=(ranked.type==='team_guard'?n(ranked.effects?.allyDamageReductionPct,14):22)*(1+n(talentFx.shieldPct)/100);normalized.durationTurns=n(ranked.effects?.durationTurns,2);normalized.damageReductionPct=n(ranked.effects?.damageReductionPct,22);normalized.target='self';}
 if(ranked.type==='counter')normalized.type='self_buff';
 if(ranked.type==='self_buff'||ranked.type==='counter'){normalized.effects={attackPct:n(ranked.effects?.attackPct),defensePct:n(ranked.effects?.defensePct),speedPct:n(ranked.effects?.speedPct)};normalized.durationTurns=n(ranked.effects?.durationTurns,1);}
 if(asc){normalized.name=asc.name;normalized.damagePct=({ironcleave:300,quake_of_iron:190,breaker_slam:330,shatterguard:260,last_bastion:520}[skill.id]||0);if(skill.id==='unyielding_wall')normalized.type='shield';if(skill.id==='fortress_stance'||skill.id==='colossus_rage'||skill.id==='iron_reprisal'||skill.id==='marching_bastion')normalized.type='self_buff';}
 const core=resolveCombatSkill({...payload,actor,skill:normalized,effects:{...(payload.effects||{}),...(actor.combatEffects||{})},targets:clone(payload.targets||[]),mode:payload.mode||'solo'});
 const out=applySpecialEffects({...core,log:[...(core.log||[])]},ranked,asc,core.actor,p,payload);
 out.actor.skillCooldowns={...(out.actor.skillCooldowns||{}),[skill.id]:Math.max(0,n(skill.cooldownTurns))};
 return Object.freeze({...out,skillId:skill.id,baseSkillId:skill.id,rank,staminaSpent:cost});
}
export function applyIronBastionTurnRecovery(actor={},baseRecovery=0){const a=clone(actor),p=getProgress(a),fx=collectIronBastionTalentEffects(p),bonus=Math.floor(n(a.maxStamina,100)*clamp(n(fx.staminaRegenPct),0,30)/100),before=n(a.stamina),max=n(a.maxStamina,100);a.stamina=Math.min(max,before+Math.max(0,n(baseRecovery))+bonus);return Object.freeze({actor:a,recovered:a.stamina-before,bonus});}
export function resolveIronBastionControlDuration(actor={},duration=1){const fx=collectIronBastionTalentEffects(getProgress(actor));return Math.max(0,Math.ceil(Math.max(0,n(duration))*(1-clamp(n(fx.controlResistPct),0,80)/100)));}
export function resolveIronBastionIncomingHit(actor={},attacker={},incoming=0,{mode='solo'}={}){
 const a=clone(actor),state=a.ironBastionStates||{},raw=Math.max(0,Math.floor(n(incoming)));if(raw<=0||n(state.reflectTurns)<=0||n(state.reflectPct)<=0)return Object.freeze({actor:a,attacker:clone(attacker),reflected:0,log:[]});
 const boss=isBoss(attacker),cap=boss?18:100,reflected=Math.min(Math.floor(raw*clamp(state.reflectPct,0,cap)/100),Math.floor(n(attacker.hp)));
 const target=clone(attacker);target.hp=Math.max(0,n(target.hp)-reflected);a.ironBastionStates={...state,reflectTurns:Math.max(0,n(state.reflectTurns)-1)};return Object.freeze({actor:a,attacker:target,reflected,damageReductionPct:clamp(n(collectIronBastionTalentEffects(getProgress(a)).damageReductionPct),0,60),log:reflected?[{type:'iron_bastion_reflect',amount:reflected,bossLimited:boss,mode}]:[]});
}
export function findIronBastionSkill(id){return SKILLS.get(String(id))||null;}
