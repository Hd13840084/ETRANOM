/** ETRANOM V1986 — combined companion bestiary. */
import { NECROMANCER_COMMON_COMPANIONS, NECROMANCER_COMPANION_ATTRIBUTE_KEYS, resolveNecromancerCompanionLevel, chooseNecromancerCompanionIntent as chooseBaseIntent } from './necromancer-common-companions-v1995.js';
import { NECROMANCER_UNCOMMON_COMPANIONS } from './necromancer-uncommon-companions-v1985.js';
import { NECROMANCER_RARE_COMPANIONS, chooseRareCompanionIntent } from './necromancer-rare-companions-v1986.js';
export { NECROMANCER_COMPANION_ATTRIBUTE_KEYS, resolveNecromancerCompanionLevel };
export const NECROMANCER_ALL_COMPANIONS = Object.freeze([...NECROMANCER_COMMON_COMPANIONS,...NECROMANCER_UNCOMMON_COMPANIONS,...NECROMANCER_RARE_COMPANIONS]);
export function chooseNecromancerCompanionIntent(companionOrId, context={}) {
 const id=typeof companionOrId==='string'?companionOrId:companionOrId?.id;
 if (NECROMANCER_RARE_COMPANIONS.some(x=>x.id===id)) return chooseRareCompanionIntent(companionOrId,context);
 const source=typeof companionOrId==='string'?NECROMANCER_ALL_COMPANIONS.find(x=>x.id===id):companionOrId;
 if (!source) return null;
 const enemies=(context.enemies||[]).filter(x=>Number(x.hp??1)>0), allies=(context.allies||[]).filter(x=>Number(x.hp??1)>0);
 const lowest=[...allies].sort((a,b)=>Number(a.hp)/Math.max(1,Number(a.maxHp)||1)-Number(b.hp)/Math.max(1,Number(b.maxHp)||1))[0];
 const weakest=[...enemies].sort((a,b)=>Number(a.hp)/Math.max(1,Number(a.maxHp)||1)-Number(b.hp)/Math.max(1,Number(b.maxHp)||1))[0];
 const ready=(source.skills||[]).filter(s=>Number(context.cooldowns?.[s.id]||0)<=0 && (context.canUseSkill?context.canUseSkill(s)!==false:true));
 const rules=source.combatAI?.rules||[]; let selected=null;
 if (lowest && Number(lowest.hp)/Math.max(1,Number(lowest.maxHp)||1)<=.65 && rules.some(x=>/protect|support|heal/.test(x))) selected=ready.find(s=>['heal','shield','guard'].includes(s.type)||s.target==='lowest_hp_ally');
 if (!selected && enemies.length>=2 && rules.some(x=>/multi|area|aoe|control|illusion/.test(x))) selected=ready.find(s=>['magic_aoe','physical_multi','control','debuff','dot'].includes(s.type));
 if (!selected && Number(context.selfHpPct??100)<=70 && rules.some(x=>/guard|counter|frontline|protect/.test(x))) selected=ready.find(s=>['guard','shield'].includes(s.type));
 if (!selected && rules.some(x=>/buff|support/.test(x))) selected=ready.find(s=>['buff','heal','shield'].includes(s.type));
 if (!selected && weakest) selected=ready.find(s=>['physical','magic','counter','physical_debuff','physical_leech','magic_aoe','physical_multi','dot'].includes(s.type));
 if (!selected) return chooseBaseIntent(source,context);
 const targetId=selected.target==='self'?(context.selfId??null):selected.target==='lowest_hp_ally'?(lowest?.id??context.selfId??null):['all_enemies','two_enemies','all_allies'].includes(selected.target)?null:(weakest?.id??null);
 return {action:'use_skill',skillId:selected.id,targetId,targetMode:selected.target,reason:'species_authored_priority',skill:JSON.parse(JSON.stringify(selected))};
}
