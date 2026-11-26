// ETRANOM V2111 — connective landscape between the capital and its three satellite settlements.
// Purely decorative canvas pass: no collision, travel, POI, encounter, save or network changes.
const ROUTES = [
  { id:'capital_to_farmland', points:[[1390,1110],[1190,1050],[1000,970],[820,900],[650,845],[490,800]], width:24, edge:'#463b2e', fill:'#98784c', accent:'#c3a16a' },
  { id:'capital_to_rootwood', points:[[1600,1030],[1780,970],[1960,930],[2150,910],[2320,900],[2480,900]], width:25, edge:'#302d28', fill:'#655743', accent:'#89916a' },
  { id:'capital_to_ironstone', points:[[1510,1250],[1580,1430],[1660,1600],[1740,1770],[1830,1950],[1900,2140]], width:27, edge:'#343538', fill:'#77746b', accent:'#b2a58b' }
];
const TRANSITIONS = [
  {id:'farmland_fringe',cx:850,cy:900,rx:235,ry:175,kind:'field'},
  {id:'rootwood_fringe',cx:2150,cy:910,rx:245,ry:210,kind:'forest'},
  {id:'ironstone_fringe',cx:1690,cy:1710,rx:220,ry:255,kind:'highland'}
];
const inView=(x,y,cx,cy)=>x>=cx-180&&x<=cx+1040&&y>=cy-160&&y<=cy+940;
function path(ctx,points,width,color){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function hash(a,b,s){const v=Math.sin(a*127.1+b*311.7+s*74.7)*43758.5453;return v-Math.floor(v);}
function pebble(ctx,x,y,r,tone){ctx.fillStyle=['#716b5d','#8b806d','#5d5b55'][tone%3];ctx.beginPath();ctx.ellipse(x,y,r*1.35,r*.7,-.25,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(225,207,170,.22)';ctx.lineWidth=.8;ctx.stroke();}
export function drawWorldApproachesV2111(ctx,camX=0,camY=0){
 if(!ctx||typeof ctx.beginPath!=='function')return;
 // Three continuous roads establish readable travel corridors between the capital and villages.
 for(const r of ROUTES){
  const visible=r.points.some(([x,y])=>inView(x,y,camX,camY));if(!visible)continue;
  ctx.save();path(ctx,r.points,r.width+11,'rgba(24,22,20,.28)');path(ctx,r.points,r.width+7,r.edge);path(ctx,r.points,r.width,r.fill);
  ctx.setLineDash([15,13]);path(ctx,r.points,1.4,'rgba(235,211,166,.36)');ctx.setLineDash([]);
  // Worn twin cart tracks, broken rather than mechanically continuous.
  for(let i=0;i<r.points.length-1;i++){const a=r.points[i],b=r.points[i+1],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
   for(const side of [-.27,.27]){const ox=nx*r.width*side,oy=ny*r.width*side;ctx.strokeStyle='rgba(45,35,26,.22)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a[0]+ox,a[1]+oy);ctx.lineTo(b[0]+ox,b[1]+oy);ctx.stroke();}
  }
  ctx.restore();
 }
 // Biome transition fringes: scattered deterministic ground dressing, deliberately clear of road centers.
 for(let z=0;z<TRANSITIONS.length;z++){
  const t=TRANSITIONS[z];if(!inView(t.cx,t.cy,camX,camY))continue;
  for(let i=0;i<46;i++){
   const angle=i*2.399963,rad=.28+.68*hash(i,z,2111),x=t.cx+Math.cos(angle)*t.rx*rad,y=t.cy+Math.sin(angle)*t.ry*rad;
   if(!inView(x,y,camX,camY))continue;
   // Keep the immediate roadway shoulder open for legibility.
   const clear=t.kind==='field'?Math.abs(y-(900-(x-850)*.36)):t.kind==='forest'?Math.abs(y-(910-(x-2150)*.08)):Math.abs(y-(1710+(x-1690)*1.85));
   if(clear<38)continue;
   ctx.save();
   if(t.kind==='field'){
    ctx.strokeStyle=i%3?'rgba(183,151,75,.62)':'rgba(113,128,66,.62)';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(x-5,y+4);ctx.lineTo(x-2,y-4);ctx.lineTo(x+2,y-7);ctx.moveTo(x,y+4);ctx.lineTo(x+5,y-3);ctx.stroke();
   }else if(t.kind==='forest'){
    ctx.fillStyle='rgba(39,66,43,.58)';ctx.beginPath();ctx.ellipse(x,y,5+hash(i,z,2)*4,2.5,-.3,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(105,130,77,.7)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-3,y+2);ctx.lineTo(x+2,y-4);ctx.stroke();
   }else{pebble(ctx,x,y,2+hash(i,z,4)*3,i);if(i%4===0){ctx.strokeStyle='rgba(156,145,119,.55)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x-4,y+2);ctx.lineTo(x+3,y-3);ctx.stroke();}}
   ctx.restore();
  }
 }
 // Small route-side cairns at the three settlement approaches.
 const cairns=[[650,845,'field'],[2320,900,'forest'],[1830,1950,'highland']];
 for(const [x,y,kind] of cairns){if(!inView(x,y,camX,camY))continue;ctx.save();ctx.fillStyle='rgba(18,17,15,.24)';ctx.beginPath();ctx.ellipse(x,y+5,13,5,0,0,Math.PI*2);ctx.fill();for(let k=0;k<3;k++){ctx.fillStyle=kind==='forest'?['#5a6347','#727b58','#89906b'][k]:kind==='highland'?['#5e5d59','#77766f','#989184'][k]:['#746044','#987b50','#b09460'][k];ctx.beginPath();ctx.ellipse(x,y-k*5,10-k*2,3.5,-.08,0,Math.PI*2);ctx.fill();}ctx.restore();}
}
export const WORLD_APPROACHES_V2111=Object.freeze({routes:ROUTES.map(r=>r.id),settlementTransitions:TRANSITIONS.map(t=>t.id),visualOnly:true});
