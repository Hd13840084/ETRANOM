/** ETRANOM V1991 — combined 80-species companion bestiary. */
import { NECROMANCER_COMMON_COMPANIONS, NECROMANCER_COMPANION_ATTRIBUTE_KEYS, resolveNecromancerCompanionLevel, chooseNecromancerCompanionIntent as chooseBaseIntent } from './necromancer-common-companions-v1995.js';
import { NECROMANCER_UNCOMMON_COMPANIONS } from './necromancer-uncommon-companions-v1985.js';
import { NECROMANCER_RARE_COMPANIONS, chooseRareCompanionIntent } from './necromancer-rare-companions-v1986.js';
import { NECROMANCER_EPIC_COMPANIONS, chooseEpicCompanionIntent } from './necromancer-epic-companions-v1987.js';
import { NECROMANCER_LEGENDARY_COMPANIONS, chooseLegendaryCompanionIntent } from './necromancer-legendary-companions-v1991.js';
export { NECROMANCER_COMPANION_ATTRIBUTE_KEYS, resolveNecromancerCompanionLevel };
export const NECROMANCER_ALL_COMPANIONS=Object.freeze([...NECROMANCER_COMMON_COMPANIONS,...NECROMANCER_UNCOMMON_COMPANIONS,...NECROMANCER_RARE_COMPANIONS,...NECROMANCER_EPIC_COMPANIONS,...NECROMANCER_LEGENDARY_COMPANIONS]);
export function chooseNecromancerCompanionIntent(companionOrId,context={}) {
 const id=typeof companionOrId==='string'?companionOrId:companionOrId?.id;
 if(NECROMANCER_LEGENDARY_COMPANIONS.some(x=>x.id===id)) return chooseLegendaryCompanionIntent(companionOrId,context);
 if(NECROMANCER_EPIC_COMPANIONS.some(x=>x.id===id)) return chooseEpicCompanionIntent(companionOrId,context);
 if(NECROMANCER_RARE_COMPANIONS.some(x=>x.id===id)) return chooseRareCompanionIntent(companionOrId,context);
 const source=typeof companionOrId==='string'?NECROMANCER_ALL_COMPANIONS.find(x=>x.id===id):companionOrId;
 if(!source) return null;
 return chooseBaseIntent(source,context);
}
