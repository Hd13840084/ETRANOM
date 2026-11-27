import { drawSeasonalPropCapV2159 } from '../world/seasonal-world-v2159.js?v=2159';
// ETRANOM V2137 — additional individually authored isometric safe-world props.
// Decorative-only layer. Ground anchors follow the existing 2:1 isometric world depth axis.
const ROOT = './assets/safe-zone/props-v2137/';
const PLACEMENTS = [
  // Ash City: civic plaza, street lighting, water and wayfinding.
  ['lantern_post',1280,1090,82], ['lantern_post',1740,1100,82],
  ['roofed_well',1510,900,118], ['direction_sign',1390,1190,74],
  ['notice_board',1660,970,94], ['wayside_shrine',1870,1290,92],
  // Farmland: irrigation, produce trade and farm work.
  ['market_cart',430,870,128], ['stone_bridge',520,960,150],
  ['stone_water_trough',650,1040,122], ['firewood_rack',300,1050,90],
  ['wildflower_patch',720,650,100], ['rain_barrel',780,880,84],
  // Rootwood: old forest edge, woodcraft and forest paths.
  ['root_stump',2370,1190,130], ['wildflower_patch',2260,1050,110],
  ['wayside_shrine',2630,760,88], ['direction_sign',2180,940,72],
  ['firewood_rack',2790,1100,94], ['lantern_post',2480,1320,78],
  // Ironstone: mine road services and workers' stores.
  ['firewood_rack',1760,2350,104], ['rain_barrel',2070,2290,90],
  ['stone_water_trough',1510,2290,110], ['lantern_post',1900,1970,76],
  ['notice_board',2150,2050,92], ['direction_sign',1830,2110,70]
];
const CACHE = new Map();
function imageFor(id) {
  let img = CACHE.get(id);
  if (!img && typeof Image !== 'undefined') {
    img = new Image(); img.src = ROOT + id + '.png'; CACHE.set(id, img);
  }
  return img;
}
function visible(x,y,cx,cy) { return x >= cx-280 && x <= cx+1040 && y >= cy-240 && y <= cy+920; }
function draw(ctx, items, season='summer') {
  for (const p of items) {
    const img = imageFor(p.id); if (!img || !img.complete || !img.naturalWidth) continue;
    const w=p.w, h=img.naturalHeight/img.naturalWidth*w;
    ctx.drawImage(img,p.x-w/2,p.y-h,w,h);
    drawSeasonalPropCapV2159(ctx,p.x,p.y,w,h,season,p.id+':'+p.x+':'+p.y);
  }
}
export function drawAuthoredSafeWorldPropsV2137(ctx,camX=0,camY=0,season='summer') {
  if(!ctx||typeof ctx.drawImage!=='function') return;
  const items=PLACEMENTS.filter(p=>visible(p[1],p[2],camX,camY)).map(([id,x,y,w])=>({id,x,y,w}));
  items.sort((a,b)=>(a.x+a.y)-(b.x+b.y)); ctx.save(); draw(ctx,items,season); ctx.restore();
}
export function drawForegroundAuthoredSafeWorldPropsV2137(ctx,playerX,playerY,season='summer') {
  if(!ctx||typeof ctx.drawImage!=='function') return;
  const depth=Number(playerX)+Number(playerY);
  const items=PLACEMENTS.filter(p=>p[1]+p[2]>depth).map(([id,x,y,w])=>({id,x,y,w}));
  items.sort((a,b)=>(a.x+a.y)-(b.x+b.y)); ctx.save(); draw(ctx,items,season); ctx.restore();
}
export const ETRANOM_AUTHORED_SAFE_WORLD_PROP_PLACEMENTS_V2137=Object.freeze(PLACEMENTS.map(([id,x,y,width])=>Object.freeze({id,x,y,width,groundAnchor:'bottom-center'})));
export const AUTHORED_SAFE_WORLD_PROPS_V2137=Object.freeze({spriteCount:12,placements:PLACEMENTS.length,settlements:['ashen_city','farmland','rootwood','ironstone'],visualOnly:false,collisionPolicy:'stage-19-live-asset-contact-profile'});
