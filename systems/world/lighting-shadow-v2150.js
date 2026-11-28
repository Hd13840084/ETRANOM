// ETRANOM V2150 — Stage 12: Lighting & Shadows.
// Deterministic 2D/isometric lighting pass; all emitters are world-space anchored.
// Dynamic shadow geometry is intentionally limited to authored cast-shadow silhouettes;
// full per-object occlusion/shadow maps remain a later rendering upgrade.

const EMITTERS = Object.freeze([
  // Ashen City: gates, market, inn quarter, forge and civic square.
  { id:'ashen-gate-torch-a', x:1120, y:920, radius:190, power:0.78, color:'#ffb45e', type:'torch' },
  { id:'ashen-gate-torch-b', x:1320, y:920, radius:190, power:0.78, color:'#ffb45e', type:'torch' },
  { id:'ashen-market-lantern-a', x:1510, y:1120, radius:170, power:0.64, color:'#ffd18a', type:'lantern' },
  { id:'ashen-market-lantern-b', x:1650, y:1180, radius:150, power:0.58, color:'#ffd18a', type:'lantern' },
  { id:'ashen-inn-window', x:1840, y:980, radius:210, power:0.52, color:'#ffbf70', type:'window' },
  { id:'ashen-forge-fire', x:2130, y:1120, radius:240, power:0.92, color:'#ff7b36', type:'forge' },
  { id:'ashen-square-lamp', x:1720, y:1350, radius:220, power:0.7, color:'#f7c77d', type:'streetlamp' },
  // Farmland: farmstead, mill and road-side lamps.
  { id:'farmstead-window', x:360, y:1060, radius:190, power:0.54, color:'#ffd08a', type:'window' },
  { id:'farmstead-lantern', x:470, y:1120, radius:155, power:0.62, color:'#ffbd68', type:'lantern' },
  { id:'farm-mill-lamp', x:760, y:760, radius:190, power:0.66, color:'#ffd08a', type:'lantern' },
  { id:'farm-road-lamp', x:1040, y:980, radius:150, power:0.5, color:'#ffc879', type:'streetlamp' },
  // Rootwood: warm settlement lights against cool forest ambience.
  { id:'rootwood-sawmill-fire', x:2380, y:1020, radius:220, power:0.78, color:'#ff9b4b', type:'workfire' },
  { id:'rootwood-creek-lamp', x:2295, y:1235, radius:155, power:0.58, color:'#ffd08a', type:'lantern' },
  { id:'rootwood-hall-window', x:2060, y:930, radius:205, power:0.5, color:'#ffbf70', type:'window' },
  { id:'rootwood-path-lamp', x:1900, y:1180, radius:145, power:0.46, color:'#ffc879', type:'streetlamp' },
  // Ironstone: cold moonlight plus concentrated amber work lights.
  { id:'ironstone-mine-lamp-a', x:1800, y:2200, radius:210, power:0.8, color:'#ffad55', type:'mine-lamp' },
  { id:'ironstone-mine-lamp-b', x:1940, y:2280, radius:180, power:0.72, color:'#ffb967', type:'mine-lamp' },
  { id:'ironstone-smith-fire', x:2140, y:2130, radius:235, power:0.88, color:'#ff7938', type:'forge' },
  { id:'ironstone-yard-lantern', x:2300, y:2280, radius:150, power:0.56, color:'#ffd08a', type:'lantern' }
]);

const SHADOWS = Object.freeze([
  { id:'ashen-watchtower-shadow', x:1220, y:1010, points:[[0,0],[180,28],[270,92],[65,72]], alpha:.19 },
  { id:'ashen-inn-shadow', x:1840, y:1040, points:[[0,0],[150,18],[225,75],[48,58]], alpha:.16 },
  { id:'farm-barn-shadow', x:360, y:1110, points:[[0,0],[160,20],[230,78],[45,62]], alpha:.17 },
  { id:'rootwood-sawmill-shadow', x:2380, y:1080, points:[[0,0],[175,25],[250,88],[50,68]], alpha:.2 },
  { id:'ironstone-workshop-shadow', x:2140, y:2190, points:[[0,0],[170,22],[245,82],[48,64]], alpha:.2 }
]);

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function resolveLightingCycleV2150(hour=12, minute=0) {
  const h=((Number(hour)||0)+(Number(minute)||0)/60+24)%24;
  const night = h>=21 || h<4.5 ? 1 : h>=19 ? (h-19)/2 : h>=4.5&&h<7 ? (7-h)/2.5 : h>=17.5 ? (h-17.5)/1.5 : 0;
  const dusk = h>=17&&h<21 ? clamp((h-17)/2,0,1) : h>=4.5&&h<7 ? clamp((7-h)/2.5,0,1) : 0;
  const daylight = clamp(1-night*.96-dusk*.34,0.08,1);
  return Object.freeze({ hour:h, night:clamp(night,0,1), dusk, daylight, ambientAlpha:clamp(night*.43+dusk*.17,0,.48), moonCool:clamp(night*.16,0,.16) });
}

function drawAmbient(ctx, camX, camY, cycle) {
  if (cycle.ambientAlpha<=0.001) return;
  const w=Number(ctx.canvas?.width)||1280, h=Number(ctx.canvas?.height)||900;
  ctx.save();
  ctx.globalCompositeOperation='source-over';
  ctx.globalAlpha=1;
  ctx.fillStyle=`rgba(12,17,37,${cycle.ambientAlpha})`;
  ctx.fillRect(camX,camY,w,h);
  if(cycle.moonCool>0){
    const g=ctx.createLinearGradient(camX,camY,camX+w,camY+h);
    g.addColorStop(0,`rgba(72,105,160,${cycle.moonCool})`);
    g.addColorStop(.55,'rgba(30,48,82,0)');
    g.addColorStop(1,`rgba(20,29,52,${cycle.moonCool*.45})`);
    ctx.fillStyle=g;ctx.fillRect(camX,camY,w,h);
  }
  ctx.restore();
}
function drawCastShadows(ctx, camX, camY, night) {
  ctx.save();ctx.fillStyle='#090a10';
  for(const s of SHADOWS){
    if(s.x<camX-260||s.x>camX+1500||s.y<camY-260||s.y>camY+1200)continue;
    ctx.globalAlpha=s.alpha*(1-night*.42);ctx.beginPath();
    s.points.forEach((p,i)=>i?ctx.lineTo(s.x+p[0],s.y+p[1]):ctx.moveTo(s.x+p[0],s.y+p[1]));
    ctx.closePath();ctx.fill();
  }
  ctx.restore();
}
function drawEmitters(ctx, camX, camY, cycle, timeMs=0) {
  let visible=0;
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const e of EMITTERS){
    if(e.x<camX-e.radius||e.x>camX+1500+e.radius||e.y<camY-e.radius||e.y>camY+1200+e.radius)continue;
    const flicker=e.type==='forge'||e.type==='torch'||e.type==='workfire'?(.94+.06*Math.sin(timeMs/137+e.x*.013)):1;
    const strength=e.power*(.16+cycle.night*.84+cycle.dusk*.34)*flicker;
    if(strength<.06)continue;
    const r=e.radius*(.72+cycle.night*.28);
    const g=ctx.createRadialGradient(e.x,e.y,2,e.x,e.y,r);
    g.addColorStop(0,`${e.color}${Math.round(clamp(strength*.42,0,.42)*255).toString(16).padStart(2,'0')}`);
    g.addColorStop(.22,`${e.color}${Math.round(clamp(strength*.2,0,.2)*255).toString(16).padStart(2,'0')}`);
    g.addColorStop(1,`${e.color}00`);
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(e.x,e.y,r,0,Math.PI*2);ctx.fill();visible++;
    // Small emissive core for a readable lamp/torch source.
    if(cycle.night>.12){ctx.globalAlpha=clamp(strength*.72,0,.72);ctx.fillStyle=e.color;ctx.beginPath();ctx.arc(e.x,e.y,e.type==='forge'?5:3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
  }
  ctx.restore();return visible;
}
export function drawLightingShadowV2150(ctx,camX=0,camY=0,hour=12,minute=0,timeMs=0){
  if(!ctx?.save||!ctx?.restore||!ctx?.fillRect)return Object.freeze({ok:false,emitters:0});
  const cycle=resolveLightingCycleV2150(hour,minute);
  drawCastShadows(ctx,Number(camX)||0,Number(camY)||0,cycle.night);
  drawAmbient(ctx,Number(camX)||0,Number(camY)||0,cycle);
  const emitters=drawEmitters(ctx,Number(camX)||0,Number(camY)||0,cycle,Number(timeMs)||0);
  return Object.freeze({ok:true,cycle,emitters,shadowCasters:SHADOWS.length});
}
export function auditLightingShadowV2150(){
  const ids=new Set(EMITTERS.map(e=>e.id));
  const valid=EMITTERS.every(e=>Number.isFinite(e.x)&&Number.isFinite(e.y)&&e.radius>0&&e.power>0&&/^#[0-9a-f]{6}$/i.test(e.color));
  const noon=resolveLightingCycleV2150(12,0),midnight=resolveLightingCycleV2150(0,0);
  return Object.freeze({ok:valid&&ids.size===EMITTERS.length&&noon.ambientAlpha===0&&midnight.ambientAlpha>0,version:2150,stage:12,emitters:EMITTERS.length,shadowCasters:SHADOWS.length,regions:4,noon,midnight});
}
export const ETRANOM_LIGHTING_SHADOW_V2150=Object.freeze({version:2150,stage:12,emitters:EMITTERS,shadowCasters:SHADOWS,cycle:'worldClock-hour-minute',coordinateContract:'V2138 logical world coordinates; not metre-calibrated',limitations:Object.freeze(['no per-pixel shadow maps','no full geometry occlusion','no weather/lightning response until Stage 17','no physically calibrated photometry'])});
