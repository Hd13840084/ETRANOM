// ETRANOM V2112 — visual landscape between the four safe settlements and ten sealed perimeter gates.
// Decorative canvas pass only. The ten gates remain sealed; no danger-region content or travel logic is created.
const SECTORS = [
  { id:'northwest', gate:[420,70], inward:[.62,.78], color:'#9a8154', edge:'#514536', ground:'#a18b5c', kind:'field' },
  { id:'north', gate:[1500,70], inward:[0,1], color:'#a18a62', edge:'#4a4135', ground:'#8c795b', kind:'road' },
  { id:'northeast', gate:[2580,70], inward:[-.62,.78], color:'#71845d', edge:'#344536', ground:'#6e8159', kind:'wood' },
  { id:'east_upper', gate:[2930,520], inward:[-1,.35], color:'#6d8a82', edge:'#354b48', ground:'#6d8a82', kind:'wet' },
  { id:'east_lower', gate:[2930,1690], inward:[-1,-.35], color:'#8d8878', edge:'#454541', ground:'#8d8878', kind:'stone' },
  { id:'southeast', gate:[2580,2230], inward:[-.62,-.78], color:'#8c7962', edge:'#494039', ground:'#8c7962', kind:'ore' },
  { id:'south', gate:[1500,2230], inward:[0,-1], color:'#9b845e', edge:'#4b4030', ground:'#9b845e', kind:'causeway' },
  { id:'southwest', gate:[420,2230], inward:[.62,-.78], color:'#9b895c', edge:'#4b4534', ground:'#9b895c', kind:'meadow' },
  { id:'west_lower', gate:[70,1690], inward:[1,-.35], color:'#687a55', edge:'#354333', ground:'#687a55', kind:'roots' },
  { id:'west_upper', gate:[70,520], inward:[1,.35], color:'#82735f', edge:'#403a34', ground:'#82735f', kind:'ash' }
];
const hash=(a,b)=>{const n=Math.sin(a*127.1+b*311.7+2112)*43758.5453;return n-Math.floor(n);};
function visible(x,y,cx,cy){return x>=cx-180&&x<=cx+920&&y>=cy-150&&y<=cy+820;}
function drawPebble(ctx,x,y,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,r*1.35,r*.72,-.2,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(226,211,180,.22)';ctx.lineWidth=.8;ctx.stroke();}
function drawPlant(ctx,x,y,kind,i){
  ctx.save();ctx.lineCap='round';
  if(kind==='field'||kind==='meadow'){
    ctx.strokeStyle=i%2?'rgba(174,148,76,.78)':'rgba(110,126,66,.78)';ctx.lineWidth=2;
    for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(x+(k-1)*3,y+5);ctx.quadraticCurveTo(x+(k-1)*5-2,y-2,x+(k-1)*6,y-8-(k%2)*3);ctx.stroke();}
  }else if(kind==='wood'||kind==='roots'){
    ctx.strokeStyle='#4b6848';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x,y+5);ctx.quadraticCurveTo(x-5,y-2,x-3,y-9);ctx.moveTo(x,y+3);ctx.quadraticCurveTo(x+5,y-4,x+5,y-10);ctx.stroke();
    ctx.fillStyle='#81946a';ctx.beginPath();ctx.ellipse(x-3,y-8,4,2.5,-.4,0,Math.PI*2);ctx.ellipse(x+5,y-9,4,2.5,.4,0,Math.PI*2);ctx.fill();
  }else if(kind==='wet'){
    ctx.strokeStyle='#729b91';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y+5);ctx.lineTo(x-1,y-12);ctx.moveTo(x+3,y+5);ctx.lineTo(x+6,y-8);ctx.stroke();
  }else if(kind==='ash'){
    ctx.strokeStyle='#746c61';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y+4);ctx.lineTo(x-2,y-7);ctx.lineTo(x+3,y-11);ctx.moveTo(x,y-2);ctx.lineTo(x-5,y-6);ctx.stroke();
  }
  ctx.restore();
}
export function drawPerimeterLandscapeV2112(ctx,camX=0,camY=0){
  if(!ctx||typeof ctx.beginPath!=='function')return;
  for(let s=0;s<SECTORS.length;s++){
    const q=SECTORS[s],[gx,gy]=q.gate,[dx,dy]=q.inward;
    if(!visible(gx,gy,camX,camY))continue;
    // A short, worn approach remains entirely on the safe side of each sealed gate.
    const bend=((s%3)-1)*24, ex=gx+dx*245-dy*bend, ey=gy+dy*245+dx*bend;
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    ctx.beginPath();ctx.moveTo(gx,gy);ctx.quadraticCurveTo(gx+dx*105-dy*bend*.4,gy+dy*105+dx*bend*.4,ex,ey);
    ctx.strokeStyle='rgba(16,18,17,.34)';ctx.lineWidth=34;ctx.stroke();
    ctx.strokeStyle=q.edge;ctx.lineWidth=27;ctx.stroke();ctx.strokeStyle=q.color;ctx.lineWidth=19;ctx.stroke();
    ctx.strokeStyle='rgba(232,213,171,.36)';ctx.lineWidth=1.5;ctx.setLineDash([10,12]);ctx.stroke();ctx.setLineDash([]);
    // Shoulder stones and biome-specific low vegetation; deterministic so nothing flickers.
    for(let i=0;i<30;i++){
      const f=.12+hash(i,s)*.94,side=(hash(i+31,s)-.5)*104;
      const x=gx+dx*245*f-dy*(bend*f+side),y=gy+dy*245*f+dx*(bend*f+side);
      if(!visible(x,y,camX,camY))continue;
      if(q.kind==='stone'||q.kind==='ore'||q.kind==='causeway'){
        drawPebble(ctx,x,y,2+hash(i+7,s)*4,q.kind==='ore'?'#69665d':'#827c6e');
        if(q.kind==='ore'&&i%7===0){ctx.fillStyle='rgba(173,151,112,.7)';ctx.fillRect(x-2,y-3,4,2);}
      }else if(q.kind==='wet'){
        ctx.strokeStyle='rgba(112,157,151,.48)';ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(x,y,7,2,0,0,Math.PI*2);ctx.stroke();
      }else drawPlant(ctx,x,y,q.kind,i);
    }
    // Small paired boundary markers distinguish the ten approaches without naming future regions.
    for(const side of [-1,1]){
      const x=gx+dx*38-dy*side*29,y=gy+dy*38+dx*side*29;
      ctx.fillStyle='rgba(14,16,15,.32)';ctx.beginPath();ctx.ellipse(x,y+7,10,4,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=q.kind==='wood'||q.kind==='roots'?'#647353':q.kind==='wet'?'#708e88':q.kind==='ash'?'#756c62':'#8a806c';
      ctx.strokeStyle='rgba(27,25,22,.85)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x-7,y+5);ctx.lineTo(x-5,y-7);ctx.lineTo(x+1,y-12);ctx.lineTo(x+7,y-6);ctx.lineTo(x+7,y+5);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.strokeStyle='rgba(218,195,150,.45)';ctx.beginPath();ctx.moveTo(x-4,y-5);ctx.lineTo(x+4,y-5);ctx.stroke();
    }
    ctx.restore();
  }
}
export const PERIMETER_LANDSCAPE_V2112=Object.freeze({sectorCount:SECTORS.length,gateIds:['gate_nw','gate_n','gate_ne','gate_e1','gate_e2','gate_se','gate_s','gate_sw','gate_w2','gate_w1'],visualOnly:true,sealedGates:true});
