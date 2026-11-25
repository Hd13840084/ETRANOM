/** ETRANOM V2042 — combined final ambience, lighting and settlement-detail pass.
 * Render-only decoration. No collision, pathing, interaction, NPC, save or network changes.
 */
export const SAFE_ZONE_FINISH_V2042 = Object.freeze({
  zones: Object.freeze(['Ash City','Keshtezar','Rootwood','Sang-Ahan']),
  features: Object.freeze(['warm lantern pools','cool moonlit accents','stone path edging','flower beds','timber fences','rest benches','district markers','ambient ground shadows'])
});
const visible=(x,y,cx,cy)=>x>=cx-110&&x<=cx+850&&y>=cy-110&&y<=cy+770;
function glow(ctx,x,y,r,alpha,color){
  const g=ctx.createRadialGradient(x,y,1,x,y,r);
  g.addColorStop(0,`rgba(${color},${alpha})`);g.addColorStop(1,`rgba(${color},0)`);
  ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
}
function lantern(ctx,x,y,t,night){
  if(night<=0||!visible(x,y,ctx.__cx||0,ctx.__cy||0))return;
  ctx.save();glow(ctx,x,y,34,.17*night,'255,177,91');
  ctx.fillStyle='#51402d';ctx.fillRect(x-2,y-10,4,13);
  ctx.fillStyle='#d8b878';ctx.fillRect(x-5,y-13,10,7);
  ctx.fillStyle=`rgba(255,220,151,${.55+.18*Math.sin(t/260+x)})`;
  ctx.beginPath();ctx.arc(x,y-10,2.5,0,Math.PI*2);ctx.fill();ctx.restore();
}
function bench(ctx,x,y,angle=0){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle='rgba(19,23,19,.2)';ctx.beginPath();ctx.ellipse(2,8,20,6,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#76583b';ctx.fillRect(-18,-5,36,8);ctx.fillStyle='#a17a50';ctx.fillRect(-18,-10,36,5);ctx.fillStyle='#51402d';ctx.fillRect(-14,3,3,7);ctx.fillRect(11,3,3,7);ctx.restore();}
function flowerBed(ctx,x,y,seed=0){ctx.save();ctx.fillStyle='#75654a';ctx.fillRect(x-13,y-5,26,10);for(let i=0;i<5;i++){const px=x-9+i*4.5,py=y-5-(i%2)*2;ctx.strokeStyle='#56734a';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(px,py+4);ctx.lineTo(px,py-3);ctx.stroke();ctx.fillStyle=['#d7a66f','#c98e91','#e2c978'][(i+seed)%3];ctx.beginPath();ctx.arc(px,py-4,2.2,0,Math.PI*2);ctx.fill();}ctx.restore();}
function fence(ctx,x,y,len=52,vertical=false){ctx.save();ctx.strokeStyle='#755638';ctx.lineWidth=4;ctx.beginPath();if(vertical){ctx.moveTo(x,y-len/2);ctx.lineTo(x,y+len/2);}else{ctx.moveTo(x-len/2,y);ctx.lineTo(x+len/2,y);}ctx.stroke();for(let p=-len/2;p<=len/2;p+=13){ctx.fillStyle='#98734c';if(vertical)ctx.fillRect(x-3,y+p-3,6,6);else ctx.fillRect(x+p-3,y-3,6,6);}ctx.restore();}
export function drawSafeZoneFinishV2042(ctx,t,cx=0,cy=0,night=.25){
  const clamp=Math.max(0,Math.min(1,night));
  // Subtle cool ambient shade and warm points of light; never covers the whole viewport.
  const lamps=[[1020,930],[1940,930],[1020,1300],[1940,1300],[690,790],[850,650],[2110,1090],[2290,900],[1580,2070],[1840,2200]];
  ctx.save();ctx.__cx=cx;ctx.__cy=cy;
  for(let i=0;i<lamps.length;i++){const [x,y]=lamps[i];if(!visible(x,y,cx,cy))continue;glow(ctx,x,y,46,.055+clamp*.10,'255,190,121');}
  // Ash City: planted street corners, resting places and understated district lights.
  [[1090,970,0],[1870,970,.08],[1090,1260,0],[1870,1260,-.08]].forEach(([x,y,a])=>{if(visible(x,y,cx,cy))bench(ctx,x,y,a);});
  [[1160,950],[1800,950],[1160,1280],[1800,1280]].forEach(([x,y],i)=>{if(visible(x,y,cx,cy))flowerBed(ctx,x,y,i);});
  [[1000,1000,0],[1980,1000,0],[1000,1240,0],[1980,1240,0]].forEach(([x,y])=>{if(visible(x,y,cx,cy))lantern(ctx,x,y,t,clamp);});
  // Keshtezar: orchard-edge fences, field flowers and a shaded resting spot.
  fence(ctx,470,790,78,false);fence(ctx,470,790,62,true);
  [[540,780],[580,790],[620,780],[660,790]].forEach(([x,y],i)=>{if(visible(x,y,cx,cy))flowerBed(ctx,x,y,i+1);});
  if(visible(390,830,cx,cy))bench(ctx,390,830,-.12);
  if(visible(850,690,cx,cy))lantern(ctx,850,690,t,clamp*.8);
  // Rootwood: mossy resting stones, trail markers and warm low lanterns.
  [[2140,1110],[2240,1080],[2340,1130]].forEach(([x,y],i)=>{if(!visible(x,y,cx,cy))return;ctx.fillStyle='rgba(16,26,18,.24)';ctx.beginPath();ctx.ellipse(x+2,y+7,16,6,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=i%2?'#777c68':'#687660';ctx.beginPath();ctx.ellipse(x,y,13,7,-.15,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(170,190,139,.35)';ctx.stroke();});
  [[2070,1150],[2320,1050]].forEach(([x,y])=>{if(visible(x,y,cx,cy))lantern(ctx,x,y,t,clamp*.9);});
  // Sang-Ahan: stone trail edging, ore-coloured markers and a sheltered bench.
  for(let i=0;i<6;i++){const x=1510+i*26,y=2250+(i%2)*7;if(!visible(x,y,cx,cy))continue;ctx.fillStyle=i%2?'#77766b':'#918879';ctx.beginPath();ctx.ellipse(x,y,7,4,-.2,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(211,197,164,.35)';ctx.stroke();}
  if(visible(1770,2255,cx,cy))bench(ctx,1770,2255,.18);
  if(visible(1850,2140,cx,cy))lantern(ctx,1850,2140,t,clamp);
  // Cool moonlit glints on selected stonework become visible as warm light fades.
  const moon=.18*(1-clamp);
  [[1500,1510],[1770,2150],[2190,1210]].forEach(([x,y])=>{if(!visible(x,y,cx,cy))return;glow(ctx,x,y,25,moon,'154,203,211');});
  ctx.restore();
}
