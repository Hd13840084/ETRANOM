// ETRANOM V2113 — final decorative pass for the safe-world landscape.
// Completes the four-settlement connective countryside and the ten-gate inner perimeter.
// No travel, collision, encounter, combat, economy, NPC, quest, save or network logic.
const GATES=[
 {id:'nw',x:420,y:70,dx:.62,dy:.78,biome:'field'},
 {id:'n',x:1500,y:70,dx:0,dy:1,biome:'road'},
 {id:'ne',x:2580,y:70,dx:-.62,dy:.78,biome:'wood'},
 {id:'e1',x:2930,y:520,dx:-1,dy:.35,biome:'wet'},
 {id:'e2',x:2930,y:1690,dx:-1,dy:-.35,biome:'stone'},
 {id:'se',x:2580,y:2230,dx:-.62,dy:-.78,biome:'ore'},
 {id:'s',x:1500,y:2230,dx:0,dy:-1,biome:'causeway'},
 {id:'sw',x:420,y:2230,dx:.62,dy:-.78,biome:'meadow'},
 {id:'w2',x:70,y:1690,dx:1,dy:-.35,biome:'root'},
 {id:'w1',x:70,y:520,dx:1,dy:.35,biome:'ash'}
];
const HASH=(a,b,c=0)=>{const n=Math.sin(a*127.1+b*311.7+c*74.7+2113)*43758.5453;return n-Math.floor(n);};
const visible=(x,y,cx,cy)=>x>cx-150&&x<cx+900&&y>cy-130&&y<cy+800;
function stone(ctx,x,y,r,tone=0){const colors=['#69675f','#817b6d','#99917f','#575951'];ctx.fillStyle=colors[tone%4];ctx.beginPath();ctx.moveTo(x-r,y);ctx.lineTo(x-r*.55,y-r*.72);ctx.lineTo(x+r*.25,y-r*.9);ctx.lineTo(x+r,y-r*.15);ctx.lineTo(x+r*.72,y+r*.55);ctx.lineTo(x-r*.55,y+r*.62);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(225,211,183,.2)';ctx.lineWidth=.8;ctx.stroke();}
function tuft(ctx,x,y,kind,scale=1){ctx.save();ctx.lineCap='round';if(kind==='field'||kind==='meadow'){ctx.strokeStyle='#a69a5e';ctx.lineWidth=1.7*scale;for(let k=-1;k<=1;k++){ctx.beginPath();ctx.moveTo(x+k*2,y+4*scale);ctx.quadraticCurveTo(x+k*4,y-2*scale,x+k*5,y-7*scale);ctx.stroke();}}else if(kind==='wood'||kind==='root'){ctx.fillStyle='#4c6748';ctx.beginPath();ctx.ellipse(x,y,5*scale,2.8*scale,-.3,0,Math.PI*2);ctx.ellipse(x+4*scale,y-3*scale,4*scale,2.4*scale,.3,0,Math.PI*2);ctx.fill();}else if(kind==='wet'){ctx.strokeStyle='rgba(117,164,157,.65)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,y+4);ctx.lineTo(x-1,y-9*scale);ctx.moveTo(x+3,y+4);ctx.lineTo(x+5,y-7*scale);ctx.stroke();}else{ctx.strokeStyle='#777064';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x,y+4);ctx.lineTo(x-2,y-6*scale);ctx.lineTo(x+3,y-10*scale);ctx.stroke();}ctx.restore();}
function shrub(ctx,x,y,kind,r){ctx.save();ctx.fillStyle=kind==='wood'||kind==='root'?'#435b40':kind==='wet'?'#58786e':kind==='ash'?'#665f53':'#69734a';ctx.beginPath();ctx.ellipse(x,y,r*1.4,r*.55,-.15,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(183,179,128,.22)';ctx.beginPath();ctx.ellipse(x-r*.25,y-r*.15,r*.55,r*.2,-.15,0,Math.PI*2);ctx.fill();ctx.restore();}
function drawApproach(ctx,g,cx,cy,index){const {x,y,dx,dy,biome}=g,nx=-dy,ny=dx;const bend=(index%3-1)*27,len=340;const ex=x+dx*len-dy*bend,ey=y+dy*len+dx*bend;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+dx*150-dy*bend*.45,y+dy*150+dx*bend*.45,ex,ey);ctx.strokeStyle='rgba(13,15,14,.27)';ctx.lineWidth=47;ctx.stroke();ctx.strokeStyle=biome==='stone'||biome==='ore'?'#494943':'#453d32';ctx.lineWidth=39;ctx.stroke();ctx.strokeStyle=biome==='wet'?'#758b82':biome==='wood'||biome==='root'?'#6d6d4e':biome==='ash'?'#74695b':biome==='stone'||biome==='ore'?'#888174':'#a18a5d';ctx.lineWidth=30;ctx.stroke();ctx.strokeStyle='rgba(224,207,166,.3)';ctx.lineWidth=1.4;ctx.setLineDash([8,15]);ctx.stroke();ctx.setLineDash([]);
 for(let i=0;i<44;i++){const f=.08+HASH(i,index,1)*.98,side=(HASH(i,index,2)-.5)*132;const px=x+dx*len*f-dy*(bend*f+side),py=y+dy*len*f+dx*(bend*f+side);if(!visible(px,py,cx,cy))continue;const dist=Math.abs(side);if(dist<27)continue;if(biome==='stone'||biome==='ore'||biome==='causeway'){if(i%2===0)stone(ctx,px,py,2+HASH(i,index,3)*5,i);}else if(i%3===0)shrub(ctx,px,py,biome,3+HASH(i,index,4)*4);else tuft(ctx,px,py,biome,.7+HASH(i,index,5)*.7);}
 // Two weathered boundary posts and a low cairn identify the approach without activating it.
 for(const side of [-1,1]){const px=x+dx*52+nx*side*39,py=y+dy*52+ny*side*39;if(!visible(px,py,cx,cy))continue;ctx.fillStyle='rgba(10,12,11,.28)';ctx.beginPath();ctx.ellipse(px,py+7,10,4,0,0,Math.PI*2);ctx.fill();stone(ctx,px,py-1,8,index+side+2);ctx.strokeStyle='rgba(222,204,165,.42)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px-3,py-5);ctx.lineTo(px+3,py-5);ctx.stroke();}
 ctx.restore();}
function drawPerimeterHabitat(ctx,cx,cy){
 // Continuous but broken natural belt inside the safe world's outer edge.
 const clusters=[
  [160,250,270,210,'ash'],[820,125,260,110,'field'],[1500,210,310,100,'road'],[2240,140,290,125,'wood'],[2860,900,100,310,'wet'],
  [2810,1850,130,260,'stone'],[2220,2180,280,100,'ore'],[1500,2150,340,90,'causeway'],[760,2180,300,100,'meadow'],[130,1550,100,300,'root']
 ];
 for(let c=0;c<clusters.length;c++){const [ox,oy,rx,ry,kind]=clusters[c];if(!visible(ox,oy,cx,cy)&&!visible(ox-rx,oy-ry,cx,cy)&&!visible(ox+rx,oy+ry,cx,cy))continue;for(let i=0;i<54;i++){const a=i*2.399963,rad=.22+.78*HASH(i,c,7),x=ox+Math.cos(a)*rx*rad,y=oy+Math.sin(a)*ry*rad;if(!visible(x,y,cx,cy))continue;const r=2+HASH(i,c,8)*5;if(kind==='stone'||kind==='ore')stone(ctx,x,y,r,i+c);else if(i%4===0)shrub(ctx,x,y,kind,r+2);else tuft(ctx,x,y,kind,.65+HASH(i,c,9)*.7);}}
 // Sparse broken fence/hedgerow segments mark the safe countryside, never a collision wall.
 const fences=[[[250,360],[520,330]],[[680,310],[910,350]],[[2100,300],[2370,340]],[[2650,1250],[2680,1510]],[[2310,2040],[2500,1990]],[[760,1980],[980,2010]],[[250,1230],[280,1450]]];
 for(const [[ax,ay],[bx,by]] of fences){const dx=bx-ax,dy=by-ay,n=Math.ceil(Math.hypot(dx,dy)/28);for(let i=0;i<=n;i++){const x=ax+dx*i/n,y=ay+dy*i/n;if(!visible(x,y,cx,cy))continue;ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(dy,dx));ctx.fillStyle='#5e5140';ctx.fillRect(-2,-2,4,15);ctx.fillStyle='#8b7656';ctx.fillRect(-12,1,24,3);ctx.restore();}}
}
function drawLandmarkAccents(ctx,cx,cy){
 // Small authored details reinforce the three inter-settlement corridors.
 const props=[
  [1040,260,'bridge'],[1050,285,'water'],[900,900,'field'],[770,990,'hay'],[2210,900,'wood'],[2310,1010,'wood'],[1680,1690,'stone'],[1790,1850,'ore'],[1130,1650,'camp'],[2060,300,'willow']
 ];
 for(let i=0;i<props.length;i++){const [x,y,k]=props[i];if(!visible(x,y,cx,cy))continue;ctx.save();if(k==='bridge'){ctx.fillStyle='#62594b';ctx.fillRect(x-34,y-7,68,14);ctx.strokeStyle='#b4a17e';ctx.lineWidth=2;ctx.strokeRect(x-34,y-7,68,14);for(let p=-24;p<=24;p+=12){ctx.beginPath();ctx.moveTo(x+p,y-7);ctx.lineTo(x+p,y+7);ctx.stroke();}}else if(k==='water'){ctx.strokeStyle='rgba(124,177,181,.5)';ctx.lineWidth=2;for(let p=0;p<3;p++){ctx.beginPath();ctx.moveTo(x-22,y+p*5);ctx.quadraticCurveTo(x,y-4+p*5,x+24,y+p*5);ctx.stroke();}}else if(k==='hay'){ctx.fillStyle='#aa8950';ctx.beginPath();ctx.ellipse(x,y,13,8,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d2b777';ctx.stroke();}else if(k==='camp'){ctx.fillStyle='#5e4735';ctx.beginPath();ctx.moveTo(x-18,y+9);ctx.lineTo(x,y-16);ctx.lineTo(x+18,y+9);ctx.closePath();ctx.fill();ctx.strokeStyle='#b48a58';ctx.stroke();}else if(k==='willow'){ctx.strokeStyle='#62533c';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,y+12);ctx.lineTo(x,y-15);ctx.stroke();ctx.fillStyle='rgba(85,112,75,.7)';ctx.beginPath();ctx.ellipse(x-10,y-12,12,6,-.5,0,Math.PI*2);ctx.ellipse(x+10,y-9,12,6,.5,0,Math.PI*2);ctx.fill();}else if(k==='wood'){shrub(ctx,x,y,'wood',8);}else{stone(ctx,x,y,k==='ore'?7:5,i); }ctx.restore();}
}
export function drawSafeWorldFinishV2113(ctx,camX=0,camY=0){if(!ctx||typeof ctx.beginPath!=='function')return;ctx.save();drawPerimeterHabitat(ctx,camX,camY);drawLandmarkAccents(ctx,camX,camY);GATES.forEach((g,i)=>{if(visible(g.x,g.y,camX,camY))drawApproach(ctx,g,camX,camY,i);});ctx.restore();}
export const SAFE_WORLD_FINISH_V2113=Object.freeze({settlementRoutes:3,settlements:4,perimeterApproaches:GATES.length,perimeterHabitatClusters:10,visualOnly:true,gatesRemainSealed:true});
