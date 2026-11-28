/* ETRANOM V2046 — individually authored room plans for all 27 safe-zone buildings. */
const plans = {
 online_player_market:[[1,1],[9,1],[1,3],[9,3],[1,6],[9,6]],
 pvp_hall:[[1,1],[9,1],[9,3],[5,3],[0,5],[10,5]],
 inn:[[1,1],[9,1],[7,1],[7,6],[5,6],[10,5]],
 smith:[[1,1],[1,3],[1,6],[7,1],[7,6],[10,5]],
 guild:[[1,1],[1,3],[7,3],[3,6],[10,2],[10,5]],
 alchemy:[[1,1],[9,3],[3,1],[7,6],[5,3],[5,6]],
 enchanter_shop:[[1,1],[1,6],[3,1],[7,6],[5,3],[0,5]],
 clinic:[[1,1],[9,6],[3,3],[7,6],[5,6],[0,5]],
 guardhouse:[[1,1],[7,1],[3,6],[0,2],[10,2],[0,5]],
 fire_temple:[[9,1],[1,3],[1,6],[9,6],[7,1],[7,3]],
 stable:[[9,1],[1,3],[7,1],[5,3],[5,6],[0,5]],
 granary:[[9,1],[9,3],[3,1],[7,1],[3,3],[0,2]],
 grain_mill:[[9,1],[1,6],[3,1],[7,1],[3,3],[10,5]],
 grain_bakery:[[9,1],[9,6],[7,1],[7,3],[10,2],[0,5]],
 grain_farmstead:[[9,1],[7,1],[3,3],[5,1],[5,6],[0,5]],
 grain_herbgarden:[[1,3],[9,3],[1,6],[3,6],[0,2],[10,5]],
 grain_livestock:[[1,3],[9,3],[7,6],[5,1],[10,2],[10,5]],
 rootwood_sawmill:[[1,3],[1,6],[7,6],[5,3],[5,6],[10,2]],
 rootwood_carpenter:[[1,3],[3,1],[3,3],[7,6],[5,3],[5,6]],
 rootwood_herbalist:[[1,3],[7,6],[5,1],[5,3],[10,2],[10,5]],
 rootwood_hunters:[[9,3],[1,6],[7,6],[5,6],[0,2],[10,2]],
 rootwood_apiary:[[9,3],[3,1],[3,3],[7,6],[0,2],[10,2]],
 iron_mine:[[9,3],[7,6],[5,1],[0,2],[10,2],[10,5]],
 iron_smelter:[[1,6],[3,1],[3,3],[5,1],[5,3],[5,6]],
 iron_stonecutter:[[1,6],[7,6],[5,3],[5,6],[10,2],[0,5]],
 iron_hall:[[9,6],[3,3],[7,6],[5,1],[5,6],[10,2]],
 iron_cartwright:[[3,1],[3,6],[7,6],[5,3],[10,2],[0,5]]
};
const accents={online_player_market:'market',pvp_hall:'arena',inn:'hearth',smith:'forge',guild:'guild',alchemy:'alchemy',enchanter_shop:'arcane',clinic:'healing',guardhouse:'guard',fire_temple:'shrine',stable:'stable',granary:'grain',grain_mill:'mill',grain_bakery:'bakery',grain_farmstead:'home',grain_herbgarden:'garden',grain_livestock:'barn',rootwood_sawmill:'sawmill',rootwood_carpenter:'carpentry',rootwood_herbalist:'herbal',rootwood_hunters:'hunter',rootwood_apiary:'apiary',iron_mine:'mine',iron_smelter:'smelter',iron_stonecutter:'stonework',iron_hall:'hall',iron_cartwright:'cartwright'};
export const SAFE_ZONE_INTERIOR_DESIGNS_V2046=Object.freeze(Object.fromEntries(Object.entries(plans).map(([id,spots])=>[id,Object.freeze({accent:accents[id],spots:Object.freeze(spots.map(([x,y])=>Object.freeze({x,y}))),rug:spots.length%2?'diamond':'runner',wallFeature:accents[id]})])));
export function getSafeZoneInteriorDesignV2046(id){return SAFE_ZONE_INTERIOR_DESIGNS_V2046[id]||null;}
