import { drawSeasonalPropCapV2159 } from '../world/seasonal-world-v2159.js?v=2159';
import { ETRANOM_BRIDGE_CROSSINGS_V2162 } from '../world/visual-physical-consistency-v2162.js?v=2162';
// ETRANOM V2118 — image-backed replacements for previously hand-drawn safe-zone elements.
// Decorative only; no collision, navigation, interaction, persistence or network behavior.
const ROOT = new URL('../../assets/safe-zone/sprite-conversion-v2118/', import.meta.url).href;
const FILES = ['road_straight','road_curve','road_crossing','central_plaza','wood_bridge','stone_bridge','stone_gate','wood_gate','stone_wall','watchtower','wayfinding_sign','street_lamp','market_stall','villager_woman','villager_worker','armored_guard'];
const images = Object.create(null);
for (const name of FILES) { const img = new Image(); img.src = `${ROOT}${name}.png`; images[name] = img; }
const PEOPLE = [
 ['villager_woman',1260,835,26,44],['villager_worker',1390,965,28,46],['armored_guard',1770,720,30,48],['villager_worker',1950,1010,28,46],
 ['villager_woman',390,700,26,44],['villager_worker',500,900,28,46],['villager_woman',635,820,26,44],['villager_worker',740,710,28,46],
 ['villager_worker',2290,850,28,46],['villager_woman',2640,1010,26,44],['villager_worker',2780,1190,28,46],['armored_guard',2180,1190,30,48],
 ['villager_worker',1640,2180,28,46],['villager_worker',1990,2220,28,46],['villager_worker',2160,2320,28,46],['armored_guard',1510,2340,30,48]
];
function sprite(ctx,name,x,y,w,h,angle=0){const im=images[name];if(!im||!im.complete||!im.naturalWidth)return;ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.drawImage(im,-w/2,-h/2,w,h);ctx.restore();}
function roadSegment(ctx,a,b,width=78){const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),ang=Math.atan2(dy,dx);sprite(ctx,'road_straight',(a[0]+b[0])/2,(a[1]+b[1])/2,len+24,width,ang);}
export function drawSafeZoneSpriteGroundV2118(ctx,t=0,cx=0,cy=0,season='summer',mode='all'){
 if(!ctx)return;ctx.save();ctx.translate(-cx,-cy);
 // Roads from the capital to the three settlements, as image tiles rather than stroked paths.
 const routes=[[[1390,1110],[1190,1050],[1000,970],[820,900],[650,845],[490,800]],[[1600,1030],[1780,970],[1960,930],[2150,910],[2320,900],[2480,900]],[[1510,1250],[1580,1430],[1660,1600],[1740,1770],[1830,1950],[1900,2140]]];
 if(mode!=='structures'){
  for(const route of routes)for(let i=0;i<route.length-1;i++)roadSegment(ctx,route[i],route[i+1],76);
  sprite(ctx,'central_plaza',1500,1050,330,280);
 }
 if(mode!=='ground'){
  // Bridges and perimeter gates are structures; render them after the seasonal ground blanket.
  const woodBridge = ETRANOM_BRIDGE_CROSSINGS_V2162.find(bridge => bridge.asset === 'wood_bridge.png');
  const stoneBridge = ETRANOM_BRIDGE_CROSSINGS_V2162.find(bridge => bridge.asset === 'stone_bridge.png');
  const useV2166WorldArt = typeof window !== 'undefined' && !!window.ETRANOM_WORLD_ART_KIT_V2166;
  if (woodBridge && !useV2166WorldArt) { sprite(ctx,'wood_bridge',woodBridge.x,woodBridge.y,150,92,woodBridge.renderRotation); drawSeasonalPropCapV2159(ctx,woodBridge.x,woodBridge.y+46,150,92,season,'wood-bridge'); }
  if (stoneBridge) { sprite(ctx,'stone_bridge',stoneBridge.x,stoneBridge.y,155,100,stoneBridge.renderRotation); drawSeasonalPropCapV2159(ctx,stoneBridge.x,stoneBridge.y+50,155,100,season,'stone-bridge'); }
  const gates=[[420,70,'stone_gate'],[1500,70,'stone_gate'],[2580,70,'stone_gate'],[2930,520,'stone_gate'],[2930,1690,'stone_gate'],[2580,2230,'stone_gate'],[1500,2230,'stone_gate'],[420,2230,'stone_gate'],[70,1690,'stone_gate'],[70,520,'stone_gate']];
  if(!useV2166WorldArt) for(const [x,y,n] of gates){sprite(ctx,n,x,y,116,106);drawSeasonalPropCapV2159(ctx,x,y+53,116,106,season,'gate:'+x+':'+y);}
 }
 ctx.restore();
}
export function drawSafeZoneSpriteActorsV2118(ctx,t=0,cx=0,cy=0){
 if(!ctx)return;ctx.save();ctx.translate(-cx,-cy);
 for(const [n,x,y,w,h] of PEOPLE){if(x<cx-100||x>cx+950||y<cy-100||y>cy+850)continue;sprite(ctx,n,x,y-18,w,h);}
 ctx.restore();
}

// V2127: draw only sprite residents in front of the player, with overlap culling.
export function drawForegroundSafeZoneSpriteActorsV2127(ctx,t=0,cx=0,cy=0,playerX=0,playerY=0){
 if(!ctx)return;const playerDepth=Number(playerX)+Number(playerY);
 ctx.save();
 const front=[...PEOPLE].filter(([n,x,y,w,h])=>{
  if(x+y<=playerDepth||x<cx-100||x>cx+950||y<cy-100||y>cy+850)return false;
  const dx=Number(playerX)-x,dy=Number(playerY)-(y-18-h/2),sx=.72*(dx-dy),sy=.36*(dx+dy);
  return Math.abs(sx)<w*.5+24&&Math.abs(sy)<h*.5+36;
 }).sort((a,b)=>(a[1]+a[2])-(b[1]+b[2]));
 for(const [n,x,y,w,h] of front)sprite(ctx,n,x,y-18,w,h);
 ctx.restore();
}

export const SAFE_ZONE_SPRITE_CONVERSION_V2118=Object.freeze({assets:FILES.length,roadRoutes:3,bridges:2,perimeterGates:10,ambientResidents:PEOPLE.length,visualOnly:true});
