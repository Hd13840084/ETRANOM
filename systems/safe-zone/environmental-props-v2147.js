// ETRANOM V2147 — Stage 9: Environmental Props.
import { drawSeasonalPropCapV2159 } from '../world/seasonal-world-v2159.js?v=2159';
// Authored regional dressing with semantic gameplay contracts. Sprite ground anchors use world coordinates.
const A='./assets/safe-zone/props-v2099/';
const B='./assets/safe-zone/props-v2137/';
const ITEMS=[
// Ashen City: civic, gothic and utility dressing.
['gothic_props_05.png',1050,610,74,'ashen_city','landmark'],['gothic_props_06.png',1940,610,74,'ashen_city','landmark'],['gothic_props_09.png',1005,865,48,'ashen_city','debris'],['gothic_props_10.png',2070,820,48,'ashen_city','debris'],['lantern_post.png',890,1280,76,'ashen_city','light'],['notice_board.png',2100,1280,92,'ashen_city','interactable'],['wayside_shrine.png',1510,520,88,'ashen_city','landmark'],['rain_barrel.png',1170,1450,62,'ashen_city','utility'],
// Farmland: cultivation, storage and animal/farm infrastructure.
['farm_props_05.png',120,560,76,'farmland','farm'],['farm_props_06.png',850,560,76,'farmland','farm'],['farm_props_07.png',130,990,70,'farmland','farm'],['farm_props_08.png',850,990,70,'farmland','farm'],['farm_props_09.png',470,1180,68,'farmland','storage'],['farm_props_10.png',610,1180,68,'farmland','storage'],['market_cart.png',520,760,100,'farmland','interactable'],['stone_water_trough.png',90,1130,88,'farmland','utility'],
// Rootwood: forest clutter, bioluminescent growth and old shrines.
['trees_05.png',1980,820,142,'rootwood','vegetation'],['trees_06.png',2960,820,142,'rootwood','vegetation'],['mushrooms_crystals_02.png',2240,620,64,'rootwood','flora'],['mushrooms_crystals_04.png',2750,620,64,'rootwood','flora'],['mushrooms_crystals_05.png',2180,1280,68,'rootwood','flora'],['mushrooms_crystals_09.png',2810,1280,68,'rootwood','flora'],['root_stump.png',2440,1450,96,'rootwood','debris'],['wayside_shrine.png',2600,520,82,'rootwood','landmark'],
// Ironstone: mining infrastructure, ore and worker utilities.
['rocks_ore_03.png',1400,1880,112,'ironstone','rock'],['rocks_ore_04.png',2390,1880,112,'ironstone','rock'],['rocks_ore_06.png',1410,2470,108,'ironstone','ore'],['rocks_ore_08.png',2380,2470,108,'ironstone','ore'],['mine_props_03.png',1640,1770,88,'ironstone','mine'],['mine_props_05.png',2180,1770,88,'ironstone','mine'],['mine_props_07.png',1630,2540,92,'ironstone','storage'],['mine_props_08.png',2190,2540,92,'ironstone','storage'],['firewood_rack.png',1810,2620,86,'ironstone','utility'],['lantern_post.png',2050,1940,74,'ironstone','light']
];
const cache=new Map();
function imgFor(file){let i=cache.get(file);if(!i&&typeof Image!=='undefined'){i=new Image();i.src=(file.endsWith('.png')&&['market_cart.png','stone_water_trough.png','root_stump.png','wayside_shrine.png','lantern_post.png','notice_board.png','rain_barrel.png','firewood_rack.png'].includes(file)?B:A)+file;cache.set(file,i);}return i;}
function drawItems(ctx,items,season='summer'){for(const p of items){const im=imgFor(p.file);if(!im||!im.complete||!im.naturalWidth)continue;const h=p.w*im.naturalHeight/im.naturalWidth;ctx.drawImage(im,p.x-p.w/2,p.y-h,p.w,h);drawSeasonalPropCapV2159(ctx,p.x,p.y,p.w,h,season,p.file+':'+p.x+':'+p.y);}}
export function drawEnvironmentalPropsV2147(ctx,camX=0,camY=0,season='summer'){if(!ctx||!ctx.drawImage)return;const list=ITEMS.filter(p=>p[1]>=camX-300&&p[1]<=camX+1100&&p[2]>=camY-260&&p[2]<=camY+1000).sort((a,b)=>(a[1]+a[2])-(b[1]+b[2]));ctx.save();drawItems(ctx,list.map(p=>({file:p[0],x:p[1],y:p[2],w:p[3]})),season);ctx.restore();}
export function drawForegroundEnvironmentalPropsV2147(ctx,px,py,season='summer'){if(!ctx||!ctx.drawImage)return;const list=ITEMS.filter(p=>p[1]+p[2]>Number(px)+Number(py)).sort((a,b)=>(a[1]+a[2])-(b[1]+b[2]));ctx.save();drawItems(ctx,list.map(p=>({file:p[0],x:p[1],y:p[2],w:p[3]})),season);ctx.restore();}
const AUTHORED_PROP_FILES_V2147=new Set(['market_cart.png','stone_water_trough.png','root_stump.png','wayside_shrine.png','lantern_post.png','notice_board.png','rain_barrel.png','firewood_rack.png']);
export const ENVIRONMENTAL_PROPS_V2147=Object.freeze({version:2147,count:ITEMS.length,regions:['ashen_city','farmland','rootwood','ironstone'],categories:[...new Set(ITEMS.map(p=>p[5]))],placements:ITEMS.map(p=>({asset:p[0],assetPath:(AUTHORED_PROP_FILES_V2147.has(p[0])?B:A)+p[0],x:p[1],y:p[2],width:p[3],region:p[4],category:p[5],groundAnchor:'bottom-center',depth:p[1]+p[2],collision:'stage-19-live-v2162-asset-contact-profile',navigation:'deferred-stage-6'}))});
// Asset existence is checked by the package-level V2154 filesystem test. A browser
// module cannot inspect the user's filesystem; do not report a fabricated missing count.
export function auditEnvironmentalPropsV2147(){
 const ids=ENVIRONMENTAL_PROPS_V2147.placements.map(p=>`${p.asset}:${p.x}:${p.y}`);
 const valid=ENVIRONMENTAL_PROPS_V2147.placements.every(p=>p.assetPath.startsWith('./assets/')&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.width>0);
 return {ok:valid&&new Set(ids).size===ids.length,count:ITEMS.length,regions:new Set(ITEMS.map(p=>p[4])).size,assetBindings:ENVIRONMENTAL_PROPS_V2147.placements.length,missingAssets:null,assetExistence:'verified-by-package-validation',uniqueAnchors:new Set(ITEMS.map(p=>p[1]+','+p[2])).size};
}
