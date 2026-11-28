import { getBuildingArchitectureV2141, resolveBuildingDimensionsV2141 } from './building-architecture-v2141.js?v=2170';
import { drawSeasonalBuildingCapV2159 } from '../world/seasonal-world-v2159.js?v=2159';
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
export function drawBuildingSpriteV2100(ctx,o,season='summer'){
 if(!ctx||!o||typeof ctx.drawImage!=='function')return false;
 const file=FILES[o.id];if(!file)return false;
 const img=getImage(file);if(!img||!img.complete||!img.naturalWidth)return false;
 const base=Number(o.w)||170;
 const architecture=getBuildingArchitectureV2141(o.id);
 const dimensions=resolveBuildingDimensionsV2141(o);
 // Authored art keeps its native aspect ratio; architecture metadata controls its footprint-relative scale.
 const width=Math.max(120,Math.min(360,dimensions?.spriteWidth || base*1.18));
 const height=width*(img.naturalHeight/img.naturalWidth);
 const groundY=(Number(o.y)||0)+(Number(o.h)||120)*.30;
 ctx.save();
 ctx.imageSmoothingEnabled=true;
 // Low-contrast contact shadow follows the declared building footprint, not a generic sprite-sized oval.
 const footprintLength=dimensions?.length || base*.82;
 const footprintDepth=dimensions?.depth || (Number(o.h)||120)*.64;
 ctx.fillStyle='rgba(3,5,9,.38)';
 ctx.beginPath();
 ctx.moveTo((Number(o.x)||0)-footprintLength*.5,groundY);
 ctx.lineTo(Number(o.x)||0,groundY-footprintDepth*.5);
 ctx.lineTo((Number(o.x)||0)+footprintLength*.5,groundY);
 ctx.lineTo(Number(o.x)||0,groundY+footprintDepth*.5);
 ctx.closePath();ctx.fill();
 // Existing PNG already contains the authored plinth, walls, openings and roof; do not redraw over it.
 ctx.drawImage(img,(Number(o.x)||0)-width/2,groundY-height,width,height);
 drawSeasonalBuildingCapV2159(ctx,Number(o.x)||0,groundY-height,width,height,season,o.id);
 ctx.restore();
 return true;
}

// V2127: draw the near-side facade after actors when its footprint occludes them.
// This is a second visual pass only; the POI record and interaction point are unchanged.
export function drawForegroundBuildingSpritesV2127(ctx,buildings,playerX,playerY,season='summer'){
 if(!ctx||!Array.isArray(buildings))return;
 const playerDepth=Number(playerX)+Number(playerY),front=[];
 for(const o of buildings){
  const x=Number(o.x)||0,y=Number(o.y)||0,w=Number(o.w)||170,h=Number(o.h)||120;
  const groundY=y+h*.30,depth=x+groundY;
  if(depth<=playerDepth)continue;
  const dimensions=resolveBuildingDimensionsV2141(o);
  const baseWidth=Math.max(120,Math.min(360,dimensions?.spriteWidth || w*1.18));
  const image= getImage(FILES[o.id]);
  if(!image||!image.complete||!image.naturalWidth)continue;
  const imageHeight=baseWidth*(image.naturalHeight/image.naturalWidth);
  const dx=Number(playerX)-x,dy=Number(playerY)-(groundY-imageHeight/2);
  const screenX=.72*(dx-dy),screenY=.36*(dx+dy);
  if(Math.abs(screenX)>baseWidth*.5+30||Math.abs(screenY)>imageHeight*.5+52)continue;
  front.push(o);
 }
 front.sort((a,b)=>((Number(a.x)||0)+(Number(a.y)||0))-((Number(b.x)||0)+(Number(b.y)||0)));
 for(const o of front)drawBuildingSpriteV2100(ctx,o,season);
}

export const BUILDING_SPRITES_V2100={count:Object.keys(FILES).length,ids:Object.keys(FILES)};
