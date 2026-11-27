// ETRANOM V2110 — settlement-specific perimeter and path micro-landscape.
// Decorative-only: reuses authored V2099 sprites; no collision, navigation or gameplay data.
const ROOT='./assets/safe-zone/props-v2099/';
const SPRITES={
 ashen_city:[['gothic_props_03.png',820,820,34],['gothic_props_08.png',2180,820,36],['fences_walls_05.png',850,1450,64],['fences_walls_09.png',2150,1450,64],['vegetation_04.png',1120,520,30],['vegetation_10.png',1880,520,30],['gothic_props_10.png',1120,1580,32],['gothic_props_02.png',1880,1580,32]],
 farmland:[['farm_props_04.png',80,520,48],['farm_props_09.png',900,520,48],['farm_props_10.png',100,1110,48],['farm_props_06.png',880,1110,48],['fences_walls_02.png',90,720,68],['fences_walls_10.png',890,720,68],['vegetation_05.png',300,1260,32],['vegetation_08.png',700,1260,32]],
 rootwood:[['trees_04.png',1960,760,84],['trees_07.png',3000,760,84],['vegetation_04.png',1980,1080,34],['vegetation_10.png',2980,1080,34],['mushrooms_crystals_07.png',2180,1370,38],['mushrooms_crystals_10.png',2800,1370,38],['fences_walls_05.png',2110,560,64],['fences_walls_09.png',2870,560,64]],
 ironstone:[['rocks_ore_03.png',1390,1900,54],['rocks_ore_08.png',2400,1900,54],['rocks_ore_09.png',1390,2400,52],['rocks_ore_10.png',2400,2400,52],['mine_props_08.png',1580,1740,58],['mine_props_09.png',2220,1740,58],['fences_walls_05.png',1580,2580,66],['fences_walls_09.png',2220,2580,66]]
};
const CACHE=new Map();
function getImage(file){let img=CACHE.get(file);if(!img&&typeof Image!=='undefined'){img=new Image();img.src=ROOT+file;CACHE.set(file,img);}return img;}
export function drawSettlementMicroLandscapeV2110(ctx,camX=0,camY=0){
 if(!ctx||typeof ctx.drawImage!=='function')return;
 const left=camX-280,right=camX+1020,top=camY-240,bottom=camY+940,items=[];
 for(const [settlement,entries] of Object.entries(SPRITES))for(const [file,x,y,w] of entries){if(x<left-150||x>right+150||y<top-180||y>bottom+180)continue;items.push({file,x,y,w,settlement});}
 items.sort((a,b)=>a.y-b.y||a.x-b.x);
 for(const p of items){const img=getImage(p.file);if(!img||!img.complete||!img.naturalWidth)continue;const h=p.w*img.naturalHeight/img.naturalWidth;ctx.drawImage(img,p.x-p.w/2,p.y-h,p.w,h);}
}
export const SETTLEMENT_MICRO_LANDSCAPE_V2110={settlements:Object.keys(SPRITES),placements:Object.values(SPRITES).reduce((n,a)=>n+a.length,0),visualOnly:true};
