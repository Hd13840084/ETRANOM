// ETRANOM V2109 — tiny, visual-only exterior threshold dressing for existing buildings.
// Uses already-authored V2099 sprites; does not create POIs, collisions, services or interactions.
const ROOT = './assets/safe-zone/props-v2099/';
const GROUPS = {
  civic: ['gothic_props_01.png','gothic_props_04.png','gothic_props_07.png','gothic_props_09.png'],
  farm: ['farm_props_01.png','farm_props_03.png','farm_props_05.png','farm_props_08.png'],
  wood: ['trees_03.png','vegetation_05.png','gothic_props_10.png','fences_walls_03.png'],
  mine: ['rocks_ore_02.png','mine_props_03.png','mine_props_05.png','fences_walls_07.png'],
  forge: ['mine_props_01.png','gothic_props_05.png','rocks_ore_01.png','fences_walls_02.png'],
  arcane: ['mushrooms_crystals_01.png','mushrooms_crystals_04.png','vegetation_07.png','gothic_props_06.png']
};
const TYPE = {
  online_player_market:'civic',pvp_hall:'civic',inn:'civic',smith:'forge',guild:'civic',alchemy:'arcane',enchanter_shop:'arcane',clinic:'arcane',guardhouse:'civic',fire_temple:'arcane',stable:'farm',granary:'farm',
  grain_mill:'farm',grain_bakery:'farm',grain_farmstead:'farm',grain_herbgarden:'farm',grain_livestock:'farm',
  rootwood_sawmill:'wood',rootwood_carpenter:'wood',rootwood_herbalist:'wood',rootwood_hunters:'wood',rootwood_apiary:'wood',
  iron_mine:'mine',iron_smelter:'forge',iron_stonecutter:'mine',iron_hall:'mine',iron_cartwright:'forge'
};
const CACHE = new Map();
function getImage(file){let img=CACHE.get(file);if(!img&&typeof Image!=='undefined'){img=new Image();img.src=ROOT+file;CACHE.set(file,img);}return img;}
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
export function drawBuildingThresholdSpritesV2109(ctx,o){
  if(!ctx||!o||!o.id||typeof ctx.drawImage!=='function')return;
  const group=TYPE[o.id];if(!group)return;
  const files=GROUPS[group],seed=hash(o.id),x=Number(o.x)||0,y=Number(o.y)||0,w=Number(o.w)||170,h=Number(o.h)||120;
  const ground=y+h*.30;
  // Two small authored details flank the entrance; alternate side/scale per building.
  for(let i=0;i<2;i++){
    const file=files[(seed+i*3)%files.length],img=getImage(file);
    if(!img||!img.complete||!img.naturalWidth)continue;
    const side=i===0?-1:1, width=Math.max(13,Math.min(29,w*.105))*((seed%7)+7)/10;
    const px=x+side*w*(.34+(i*.035)),py=ground+8+(i*2);
    const ih=width*img.naturalHeight/img.naturalWidth;
    ctx.save();ctx.globalAlpha=.92;ctx.drawImage(img,px-width/2,py-ih,width,ih);ctx.restore();
  }
}
export const BUILDING_THRESHOLD_SPRITES_V2109={buildingCount:Object.keys(TYPE).length,groups:Object.keys(GROUPS),visualOnly:true};
