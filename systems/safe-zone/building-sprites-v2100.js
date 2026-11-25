// ETRANOM V2100 — authored isometric building sprites for the 27 existing safe-zone POIs.
// Visual-only replacement layer: preserves POI IDs, world anchors, interaction targets and gameplay data.
const ROOT = './assets/safe-zone/buildings-v2100/';
const FILES = {
  online_player_market:'building_06.png', pvp_hall:'building_02.png', inn:'building_09.png', smith:'building_05.png',
  guild:'building_07.png', alchemy:'building_04.png', enchanter_shop:'building_10.png', clinic:'building_08.png',
  guardhouse:'building_12.png', fire_temple:'building_03.png', stable:'building_11.png', granary:'building_01.png',
  grain_mill:'building_15.png', grain_bakery:'building_13.png', grain_farmstead:'building_16.png', grain_herbgarden:'building_17.png', grain_livestock:'building_14.png',
  rootwood_sawmill:'building_18.png', rootwood_carpenter:'building_21.png', rootwood_herbalist:'building_20.png', rootwood_hunters:'building_19.png', rootwood_apiary:'building_22.png',
  iron_mine:'building_23.png', iron_smelter:'building_24.png', iron_stonecutter:'building_27.png', iron_hall:'building_26.png', iron_cartwright:'building_25.png'
};
const CACHE = new Map();
function getImage(file){let img=CACHE.get(file);if(!img&&typeof Image!=='undefined'){img=new Image();img.src=ROOT+file;CACHE.set(file,img);}return img;}
export function drawBuildingSpriteV2100(ctx,o){
 if(!ctx||!o||typeof ctx.drawImage!=='function')return false;
 const file=FILES[o.id];if(!file)return false;
 const img=getImage(file);if(!img||!img.complete||!img.naturalWidth)return false;
 const base=Number(o.w)||170;
 // Keep authored proportions and scale relative to the actual POI footprint.
 const width=Math.max(120,Math.min(340,base*1.18));
 const height=width*(img.naturalHeight/img.naturalWidth);
 const groundY=(Number(o.y)||0)+(Number(o.h)||120)*.30;
 ctx.save();
 ctx.imageSmoothingEnabled=true;
 // Ground contact shadow keeps the authored sprite seated on the existing POI anchor.
 ctx.fillStyle='rgba(5,7,11,.42)';
 ctx.beginPath();
 ctx.ellipse(Number(o.x)||0,groundY,width*.43,Math.max(7,width*.055),0,0,Math.PI*2);
 ctx.fill();
 ctx.drawImage(img,(Number(o.x)||0)-width/2,groundY-height,width,height);
 ctx.restore();
 return true;
}
export const BUILDING_SPRITES_V2100={count:Object.keys(FILES).length,ids:Object.keys(FILES)};
