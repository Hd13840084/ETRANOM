/* ETRANOM V2028 — visual-only isometric Dark Fantasy world palette registry.
 * No combat, progression, NPC data, drops, travel permissions, or database behavior is defined here.
 */
(function(){
  'use strict';
  const profiles={
    safe:{floorA:'#4a4940',floorB:'#555247',veil:'rgba(45,35,42,.12)',biome:'medieval_settlement',fog:'low',magic:'warm_ward',fire:'lantern'},
    ash_forest:{floorA:'#292d2b',floorB:'#343633',veil:'rgba(54,31,27,.20)',embers:true,biome:'cursed_burnt_forest',fog:'heavy',magic:'violet_wisps',fire:'embers'},
    thorn_grove:{floorA:'#34372d',floorB:'#414333',veil:'rgba(37,48,29,.20)',biome:'thornwood',fog:'heavy',magic:'toxic_green',fire:'rare'},
    ash_hills:{floorA:'#4a4338',floorB:'#554b3e',veil:'rgba(73,59,42,.18)',biome:'volcanic_highlands',fog:'dust',magic:'ember_red',fire:'fissures'},
    verdash_river:{floorA:'#354345',floorB:'#3c4c4b',veil:'rgba(31,75,82,.22)',biome:'dark_riverlands',fog:'river_mist',magic:'water_cyan',fire:'watchfires'},
    southern_plain:{floorA:'#57503d',floorB:'#635940',veil:'rgba(105,78,42,.18)',biome:'windswept_plain',fog:'dust',magic:'sunset_amber',fire:'campfires'},
    rootbound_ruins:{floorA:'#3b3535',floorB:'#49403e',veil:'rgba(67,39,53,.24)',biome:'ancient_root_ruins',fog:'grave_mist',magic:'spectral_violet',fire:'soulflame'},
    frost_march:{floorA:'#485258',floorB:'#566169',veil:'rgba(133,169,183,.20)',biome:'frozen_mountains',fog:'snow',magic:'ice_blue',fire:'blue_flame'},
    drowned_mire:{floorA:'#303d3a',floorB:'#394943',veil:'rgba(29,80,68,.24)',biome:'drowned_swamp',fog:'thick_marsh',magic:'will_o_wisp',fire:'swamp_gas'},
    obsidian_wastes:{floorA:'#343238',floorB:'#403c42',veil:'rgba(82,43,54,.24)',embers:true,biome:'obsidian_badlands',fog:'ash',magic:'crimson_rift',fire:'lava_glow'},
    haunted_highlands:{floorA:'#3b3c48',floorB:'#474756',veil:'rgba(74,68,111,.24)',biome:'haunted_highlands',fog:'spectral',magic:'ghostlight',fire:'cold_willfire' }
  };
  const aliases={
    burnt_forest:'ash_forest',region_burnt_forest:'ash_forest',ash_forest:'ash_forest',
    thorn_grove:'thorn_grove',region_thorn_grove:'thorn_grove',
    ash_hills:'ash_hills',region_ash_hills:'ash_hills',
    verdash_river:'verdash_river',vardash_river:'verdash_river',region_vardash_west:'verdash_river',
    southern_plain:'southern_plain',southern_plains:'southern_plain',region_southern_plain:'southern_plain',
    rootbound_ruins:'rootbound_ruins',region_rootbound_ruins:'rootbound_ruins',
    frost_march:'frost_march',drowned_mire:'drowned_mire',obsidian_wastes:'obsidian_wastes',haunted_highlands:'haunted_highlands'
  };
  window.ETRANOM_ISO_WORLD={
    version:'V2033-ISO-DARK-FANTASY-EXPANDED-1',
    camera:'isometric-2-to-1',
    mode:'visual-only',
    profiles,
    paletteFor(id,inDanger){const key=aliases[String(id||'').toLowerCase()]|| (inDanger?'ash_forest':'safe');return profiles[key]||profiles.safe;}
  };
})();
