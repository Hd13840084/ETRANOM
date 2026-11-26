/** ETRANOM V2039 — visual-only ground dressing around safe-zone buildings. */
const entries = {
  online_player_market:['stall','crate'], pvp_hall:['banner','training'], inn:['bench','barrel'], smith:['anvil','coal'], guild:['notice','banner'], alchemy:['planter','vial'], enchanter_shop:['rune','crystal'], clinic:['herbs','bench'], guardhouse:['rack','lantern'], fire_temple:['brazier','stone'], stable:['trough','hay'], granary:['sack','cart'],
  grain_mill:['sack','fence'], grain_bakery:['oven','basket'], grain_farmstead:['well','planter'], grain_herbgarden:['bed','water'], grain_livestock:['fence','hay'],
  rootwood_sawmill:['logs','sawhorse'], rootwood_carpenter:['workbench','planks'], rootwood_herbalist:['mushroom','planter'], rootwood_hunters:['stump','rack'], rootwood_apiary:['hive','flowers'],
  iron_mine:['ore','cart'], iron_smelter:['coal','ingot'], iron_stonecutter:['blocks','tool'], iron_hall:['lantern','bench'], iron_cartwright:['wheel','planks']
};
export const SAFE_ZONE_GROUND_DRESSING_V2039 = Object.freeze(Object.fromEntries(Object.entries(entries).map(([id,props])=>[id,Object.freeze(props)])));
export const SAFE_ZONE_GROUND_DRESSING_IDS_V2039 = Object.freeze(Object.keys(entries));
