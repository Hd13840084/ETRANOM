// ETRANOM V2150 — Stage 12: Lighting & Shadows.
// V2151 correction: deterministic polygonal shadow casting and light occlusion.
// Uses authored world-space caster footprints; avoids expensive per-pixel shadow maps on mobile.

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

// Footprints and heights are authored in logical world units. Shadow polygons are
// projected from the sun/light direction and clipped to the current viewport.
const CASTERS = Object.freeze([
 {id:'ashen-watchtower',x:1220,y:1010,w:150,d:105,height:185},
 {id:'ashen-inn',x:1840,y:1040,w:132,d:96,height:92},
 {id:'ashen-forge',x:2130,y:1120,w:118,d:88,height:78},
 {id:'farm-barn',x:360,y:1110,w:160,d:112,height:88},
 {id:'farm-mill',x:760,y:760,w:112,d:94,height:115},
 {id:'rootwood-sawmill',x:2380,y:1080,w:168,d:112,height:105},
 {id:'rootwood-hall',x:2060,y:960,w:142,d:98,height:92},
 {id:'ironstone-workshop',x:2140,y:2190,w:156,d:108,height:96},
 {id:'ironstone-mine-portal',x:1800,y:2200,w:104,d:76,height:72}
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
function drawCastShadows(ctx, camX, camY, cycle, timeMs=0) {
  const daylight=cycle.daylight;
  const sunAngle=((cycle.hour-6)/12)*Math.PI; // east-to-west daylight sweep
  const dx=Math.cos(sunAngle),dy=Math.sin(sunAngle);
  ctx.save();ctx.fillStyle='#080a12';ctx.globalCompositeOperation='multiply';
  for(const c of CASTERS){
    if(c.x<camX-420||c.x>camX+1900||c.y<camY-420||c.y>camY+1600)continue;
    const spread=c.height*(.42+daylight*.62),sx=-dx*spread,sy=-dy*spread;
    const hw=c.w/2,hd=c.d/2;
    const base=[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].map(([x,y])=>[c.x+x,c.y+y]);
    const poly=[...base,...base.slice().reverse().map(([x,y])=>[x+sx,y+sy])];
    ctx.globalAlpha=(.12+daylight*.16)*(1-cycle.night*.45);
    ctx.beginPath();poly.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();
    // soft penumbra at the distal edge
    ctx.globalAlpha*=.34;ctx.lineWidth=18;ctx.strokeStyle='#090b13';ctx.stroke();
  }
  ctx.restore();
}
function drawEmitterOcclusion(ctx, emitter, cycle) {
  // A caster between a point light and the receiver creates a projected umbra wedge.
  // This polygonal approximation is stable and substantially cheaper than per-pixel ray tracing.
  ctx.save();ctx.fillStyle='#090a10';ctx.globalCompositeOperation='multiply';
  for(const c of CASTERS){
    const vx=c.x-emitter.x,vy=c.y-emitter.y,dist=Math.hypot(vx,vy);
    if(dist>emitter.radius*1.15||dist<1)continue;
    const ux=vx/dist,uy=vy/dist,perpX=-uy,perpY=ux;
    const half=Math.max(c.w,c.d)*.34;
    const reach=Math.min(emitter.radius*.72,Math.max(50,(emitter.radius-dist)*1.5));
    const a=[c.x+perpX*half,c.y+perpY*half],b=[c.x-perpX*half,c.y-perpY*half];
    const poly=[a,b,[b[0]+ux*reach-perpX*half*.8,b[1]+uy*reach-perpY*half*.8],[a[0]+ux*reach+perpX*half*.8,a[1]+uy*reach+perpY*half*.8]];
    ctx.globalAlpha=clamp(emitter.power*.20*(.35+cycle.night*.65),0,.22);
    ctx.beginPath();poly.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();
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
// V2154 separates ground shadow casting from the final light composite. This keeps
// building/tree shadows beneath scene geometry instead of painting them over actors.
export function drawWorldCastShadowsV2154(ctx,camX=0,camY=0,hour=12,minute=0,timeMs=0){
  if(!ctx?.save||!ctx?.restore||!ctx?.beginPath)return Object.freeze({ok:false,shadowCasters:0,pointOccluders:0});
  const cycle=resolveLightingCycleV2150(hour,minute);
  const x=Number(camX)||0,y=Number(camY)||0,t=Number(timeMs)||0;
  drawCastShadows(ctx,x,y,cycle,t);
  let pointOccluders=0;
  for(const emitter of EMITTERS){
    if(emitter.x<x-emitter.radius||emitter.x>x+1500+emitter.radius||emitter.y<y-emitter.radius||emitter.y>y+1200+emitter.radius)continue;
    drawEmitterOcclusion(ctx,emitter,cycle); pointOccluders++;
  }
  return Object.freeze({ok:true,cycle,shadowCasters:CASTERS.length,pointOccluders});
}
export function drawLightingOverlayV2154(ctx,camX=0,camY=0,hour=12,minute=0,timeMs=0){
  if(!ctx?.save||!ctx?.restore||!ctx?.fillRect)return Object.freeze({ok:false,emitters:0});
  const cycle=resolveLightingCycleV2150(hour,minute);
  drawAmbient(ctx,Number(camX)||0,Number(camY)||0,cycle);
  const emitters=drawEmitters(ctx,Number(camX)||0,Number(camY)||0,cycle,Number(timeMs)||0);
  return Object.freeze({ok:true,cycle,emitters,shadowCasters:CASTERS.length});
}
export function drawLightingShadowV2150(ctx,camX=0,camY=0,hour=12,minute=0,timeMs=0){
  const shadows=drawWorldCastShadowsV2154(ctx,camX,camY,hour,minute,timeMs);
  const lights=drawLightingOverlayV2154(ctx,camX,camY,hour,minute,timeMs);
  return Object.freeze({ok:shadows.ok&&lights.ok,cycle:lights.cycle,emitters:lights.emitters,shadowCasters:shadows.shadowCasters,pointOccluders:shadows.pointOccluders});
}
export function auditLightingShadowV2150(){
  const ids=new Set(EMITTERS.map(e=>e.id));
  const valid=EMITTERS.every(e=>Number.isFinite(e.x)&&Number.isFinite(e.y)&&e.radius>0&&e.power>0&&/^#[0-9a-f]{6}$/i.test(e.color));
  const noon=resolveLightingCycleV2150(12,0),midnight=resolveLightingCycleV2150(0,0);
  return Object.freeze({ok:valid&&ids.size===EMITTERS.length&&noon.ambientAlpha===0&&midnight.ambientAlpha>0,version:2154,stage:12,emitters:EMITTERS.length,shadowCasters:CASTERS.length,regions:4,noon,midnight});
}
export const ETRANOM_LIGHTING_SHADOW_V2150=Object.freeze({version:2154,stage:12,emitters:EMITTERS,shadowCasters:CASTERS,cycle:'worldClock-hour-minute',coordinateContract:'V2138 logical world coordinates; not metre-calibrated',limitations:Object.freeze(['no per-pixel shadow maps (polygonal mobile approximation)' , 'ground shadows are rendered in a dedicated under-object pass; light overlay is composited after scene geometry','polygonal occlusion limited to authored caster catalog','weather and lightning are composited by Stage 17 weather runtime','no physically calibrated photometry'])});
