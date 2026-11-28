// ETRANOM V2152 — Stage 13: Material & Texture System.
// Lightweight deterministic isometric surface texturing designed for mobile Canvas2D.
const MATERIALS=Object.freeze({
 stone:{id:'stone',label:'سنگ تراش‌خورده',base:'#77736c',grain:'#b5aa96',roughness:.82,repeat:34},
 wood:{id:'wood',label:'چوب کهنه',base:'#765338',grain:'#bd8b58',roughness:.91,repeat:28},
 iron:{id:'iron',label:'آهن تیره',base:'#454a50',grain:'#92999c',roughness:.58,repeat:22},
 dirt:{id:'dirt',label:'خاک فشرده',base:'#796047',grain:'#b18b5d',roughness:.96,repeat:25},
 grass:{id:'grass',label:'چمن و خزه',base:'#526047',grain:'#91a06a',roughness:.99,repeat:31},
 fabric:{id:'fabric',label:'پارچه ضخیم',base:'#6d5148',grain:'#a88972',roughness:.88,repeat:18},
 glass:{id:'glass',label:'شیشه',base:'#536a70',grain:'#b5d1d0',roughness:.18,repeat:40},
 water:{id:'water',label:'آب',base:'#344e5b',grain:'#8bb2b6',roughness:.24,repeat:42},
 brick:{id:'brick',label:'آجر',base:'#805346',grain:'#c08a70',roughness:.9,repeat:30}
});
const ZONES=Object.freeze([
 {id:'ashen-city-stone',material:'stone',points:[[850,760],[2240,760],[2500,1500],[1020,1640]],alpha:.16},
 {id:'farmland-earth',material:'dirt',points:[[120,700],[1080,650],[1160,1320],[220,1430]],alpha:.2},
 {id:'rootwood-forest-floor',material:'grass',points:[[1760,700],[2580,760],[2700,1450],[1880,1510]],alpha:.19},
 {id:'ironstone-gravel',material:'iron',points:[[1580,1900],[2480,1900],[2630,2540],[1650,2580]],alpha:.18}
]);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function resolveMaterialV2152(id){return MATERIALS[String(id)]||null;}
function seeded(n){const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);}
function drawZone(ctx,zone,camX,camY,time){
 const m=MATERIALS[zone.material],pts=zone.points;
 ctx.save();ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.clip();
 ctx.globalAlpha=zone.alpha;ctx.fillStyle=m.base;ctx.fill();
 const minX=Math.min(...pts.map(p=>p[0])),maxX=Math.max(...pts.map(p=>p[0]));
 const minY=Math.min(...pts.map(p=>p[1])),maxY=Math.max(...pts.map(p=>p[1]));
 const step=m.repeat;let count=0;
 for(let y=Math.floor(minY/step)*step;y<maxY;y+=step){for(let x=Math.floor(minX/step)*step;x<maxX;x+=step){
  const k=++count+Math.round(x*3+y*7);
  const px=x+seeded(k)*step,py=y+seeded(k+19)*step;
  ctx.globalAlpha=zone.alpha*(.22+seeded(k+41)*.34);ctx.fillStyle=m.grain;
  if(zone.material==='stone'||zone.material==='iron'||zone.material==='brick'){
   ctx.fillRect(px,py,2+seeded(k+5)*5,1+seeded(k+9)*2);
   if(zone.material==='brick'&&seeded(k+11)>.72){ctx.strokeStyle=m.grain;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(px,py+4);ctx.lineTo(px+step*.65,py+4);ctx.stroke();}
  }else if(zone.material==='grass'){
   ctx.strokeStyle=m.grain;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px,py+4);ctx.lineTo(px-2,py-2);ctx.moveTo(px+2,py+4);ctx.lineTo(px+4,py-1);ctx.stroke();
  }else{ctx.fillRect(px,py,1.5+seeded(k+3)*3,1.5+seeded(k+4)*2);}
 }}
 ctx.restore();
}
export function drawMaterialTextureV2152(ctx,camX=0,camY=0,timeMs=0){
 if(!ctx?.save||!ctx?.restore||!ctx?.beginPath)return Object.freeze({ok:false,zones:0});
 for(const z of ZONES){const xs=z.points.map(p=>p[0]),ys=z.points.map(p=>p[1]);if(Math.max(...xs)<camX-100||Math.min(...xs)>camX+1700||Math.max(...ys)<camY-100||Math.min(...ys)>camY+1400)continue;drawZone(ctx,z,camX,camY,timeMs);}
 return Object.freeze({ok:true,zones:ZONES.length,materials:Object.keys(MATERIALS).length});
}
export function auditMaterialTexturesV2152(){
 const ids=Object.keys(MATERIALS),valid=ids.length===9&&ids.every(id=>MATERIALS[id].id===id&&/^#[0-9a-f]{6}$/i.test(MATERIALS[id].base)&&MATERIALS[id].repeat>0)&&ZONES.every(z=>MATERIALS[z.material]&&z.points.length>=4);
 return Object.freeze({ok:valid,version:2152,stage:13,materials:ids.length,authoredSurfaceZones:ZONES.length,materialIds:ids});
}
export const ETRANOM_MATERIAL_TEXTURES_V2152=Object.freeze({version:2152,stage:13,materials:MATERIALS,surfaceZones:ZONES,rendering:'deterministic clipped Canvas2D material grain',limitations:Object.freeze(['current pass textures authored terrain zones; per-sprite material maps can be added as assets are authored','no normal maps or physically based shader pipeline'])});
