// ETRANOM V2173 — ordered settlement street grid, linked footpaths and central fountain plaza.
// Rendering-only geometry: roads and plaza surfaces remain walkable and do not create colliders.
export const ETRANOM_SETTLEMENT_LAYOUT_V2173 = Object.freeze({
  version: 2173,
  projection: 'orthographic-three-quarter',
  settlements: Object.freeze({ city: 'Ash City', grain: 'Grainfield', rootwood: 'Rootwood', ironhollow: 'Ironhollow' }),
  roads: Object.freeze([
    // Capital: continuous primary streets arranged on a clean rectangular grid.
    { id:'city-north-street', zone:'city', width:34, points:[[820,700],[2380,700]] },
    { id:'city-mid-west', zone:'city', width:32, points:[[820,960],[1310,960]] },
    { id:'city-mid-east', zone:'city', width:32, points:[[1690,960],[2380,960]] },
    { id:'city-south-street', zone:'city', width:34, points:[[820,1250],[2380,1250]] },
    { id:'city-market-lane', zone:'city', width:28, points:[[820,1530],[2380,1530]] },
    { id:'city-west-avenue', zone:'city', width:30, points:[[850,520],[850,1600]] },
    { id:'city-west-inner-lane', zone:'city', width:26, points:[[1230,520],[1230,1600]] },
    { id:'city-east-inner-lane', zone:'city', width:26, points:[[1800,520],[1800,1600]] },
    { id:'city-east-avenue', zone:'city', width:30, points:[[2220,520],[2220,1600]] },
    // Four clear approaches to the fountain square.
    { id:'plaza-north-approach', zone:'city', width:46, points:[[1500,500],[1500,855]] },
    { id:'plaza-south-approach', zone:'city', width:46, points:[[1500,1245],[1500,1640]] },
    { id:'plaza-west-approach', zone:'city', width:46, points:[[820,1050],[1300,1050]] },
    { id:'plaza-east-approach', zone:'city', width:46, points:[[1700,1050],[2380,1050]] },
    // Grain village: short connected lanes around the mill, bakery, farmhouse and fields.
    { id:'grain-main-lane', zone:'grain', width:26, points:[[220,735],[820,735]] },
    { id:'grain-south-lane', zone:'grain', width:22, points:[[260,930],[760,930]] },
    { id:'grain-west-path', zone:'grain', width:20, points:[[300,520],[300,1040]] },
    { id:'grain-east-path', zone:'grain', width:20, points:[[735,520],[735,1060]] },
    { id:'grain-cross-path', zone:'grain', width:20, points:[[500,520],[500,1080]] },
    // Rootwood village: straight woodland tracks and cross-streets.
    { id:'rootwood-north-lane', zone:'rootwood', width:24, points:[[2200,690],[2810,690]] },
    { id:'rootwood-main-lane', zone:'rootwood', width:26, points:[[2200,900],[2810,900]] },
    { id:'rootwood-south-lane', zone:'rootwood', width:22, points:[[2200,1120],[2810,1120]] },
    { id:'rootwood-west-path', zone:'rootwood', width:20, points:[[2290,590],[2290,1200]] },
    { id:'rootwood-center-path', zone:'rootwood', width:20, points:[[2500,590],[2500,1200]] },
    { id:'rootwood-east-path', zone:'rootwood', width:20, points:[[2720,590],[2720,1200]] },
    // Ironhollow: work-yard roads aligned to the mining and smithing quarter.
    { id:'iron-north-lane', zone:'ironhollow', width:26, points:[[1500,1960],[2340,1960]] },
    { id:'iron-main-lane', zone:'ironhollow', width:28, points:[[1500,2160],[2340,2160]] },
    { id:'iron-south-lane', zone:'ironhollow', width:22, points:[[1500,2370],[2340,2370]] },
    { id:'iron-west-path', zone:'ironhollow', width:20, points:[[1600,1900],[1600,2430]] },
    { id:'iron-center-path', zone:'ironhollow', width:20, points:[[1900,1900],[1900,2430]] },
    { id:'iron-east-path', zone:'ironhollow', width:20, points:[[2200,1900],[2200,2430]] }
  ]),
  plaza: Object.freeze({ x:1500, y:1050, gardenRadius:178, stoneRadius:145, waterRadius:48 })
});

function path(ctx, points) {
  ctx.beginPath();
  points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
}
function drawRoad(ctx, road, camX, camY) {
  const pts=road.points;
  const minX=Math.min(...pts.map(p=>p[0])), maxX=Math.max(...pts.map(p=>p[0]));
  const minY=Math.min(...pts.map(p=>p[1])), maxY=Math.max(...pts.map(p=>p[1]));
  if(maxX<camX-220||minX>camX+940||maxY<camY-220||minY>camY+900)return;
  const w=road.width;
  ctx.save(); ctx.lineCap='square'; ctx.lineJoin='miter';
  path(ctx,pts); ctx.strokeStyle='rgba(12,15,15,.35)'; ctx.lineWidth=w+14; ctx.stroke();
  path(ctx,pts); ctx.strokeStyle='#605b51'; ctx.lineWidth=w+7; ctx.stroke();
  path(ctx,pts); ctx.strokeStyle=road.zone==='grain'?'#9a855f':road.zone==='rootwood'?'#77715b':road.zone==='ironhollow'?'#89857d':'#aaa18d'; ctx.lineWidth=w; ctx.stroke();
  path(ctx,pts); ctx.strokeStyle='rgba(226,214,187,.32)'; ctx.lineWidth=1.5; ctx.setLineDash([5,9]); ctx.stroke(); ctx.setLineDash([]);
  // Repeated rectangular pavers make the road surface read as a connected tile system.
  for(let s=1;s<pts.length;s++){
    const [ax,ay]=pts[s-1],[bx,by]=pts[s],len=Math.hypot(bx-ax,by-ay),step=28;
    for(let d=step;d<len;d+=step){const t=d/len,x=ax+(bx-ax)*t,y=ay+(by-ay)*t;ctx.strokeStyle='rgba(35,34,31,.23)';ctx.lineWidth=1;ctx.beginPath();if(Math.abs(bx-ax)>=Math.abs(by-ay)){ctx.moveTo(x,y-w*.48);ctx.lineTo(x,y+w*.48);}else{ctx.moveTo(x-w*.48,y);ctx.lineTo(x+w*.48,y);}ctx.stroke();}
  }
  ctx.restore();
}
function drawPlaza(ctx, time=0) {
  const {x,y,gardenRadius,stoneRadius,waterRadius}=ETRANOM_SETTLEMENT_LAYOUT_V2173.plaza;
  ctx.save();
  // Symmetric planted ring, stone walk ring and central fountain.
  ctx.fillStyle='rgba(15,22,17,.28)'; ctx.beginPath();ctx.arc(x,y+10,gardenRadius+8,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#496746';ctx.beginPath();ctx.arc(x,y,gardenRadius,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#b6a078';ctx.lineWidth=8;ctx.beginPath();ctx.arc(x,y,stoneRadius+8,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#aaa18e';ctx.beginPath();ctx.arc(x,y,stoneRadius,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(70,62,50,.35)';ctx.lineWidth=1.5;
  for(let a=0;a<24;a++){const ang=a*Math.PI/12;const r1=stoneRadius-15,r2=stoneRadius-4;ctx.beginPath();ctx.moveTo(x+Math.cos(ang)*r1,y+Math.sin(ang)*r1);ctx.lineTo(x+Math.cos(ang)*r2,y+Math.sin(ang)*r2);ctx.stroke();}
  // Radial garden dividers and flower/hedge clusters.
  for(let a=0;a<8;a++){const ang=a*Math.PI/4;ctx.strokeStyle='#c6b68d';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+Math.cos(ang)*waterRadius*1.35,y+Math.sin(ang)*waterRadius*1.35);ctx.lineTo(x+Math.cos(ang)*(gardenRadius-15),y+Math.sin(ang)*(gardenRadius-15));ctx.stroke();}
  for(let a=0;a<16;a++){const ang=a*Math.PI/8,r=160+(a%2)*5,cx=x+Math.cos(ang)*r,cy=y+Math.sin(ang)*r;ctx.fillStyle=a%3?'#6e8c54':'#829b5c';ctx.beginPath();ctx.arc(cx,cy,8+(a%3),0,Math.PI*2);ctx.fill();ctx.fillStyle=a%2?'#d7b6c3':'#e3d18d';ctx.beginPath();ctx.arc(cx+2,cy-2,2.2,0,Math.PI*2);ctx.fill();}
  // Fountain plinth and water basin.
  ctx.fillStyle='#675d50';ctx.beginPath();ctx.arc(x,y+3,waterRadius+11,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#e0c99b';ctx.lineWidth=5;ctx.stroke();
  ctx.fillStyle='#397d83';ctx.beginPath();ctx.arc(x,y,waterRadius,0,Math.PI*2);ctx.fill();
  const pulse=(Math.sin(time/620)+1)/2;ctx.strokeStyle=`rgba(198,237,224,${.3+pulse*.45})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,waterRadius*.42+pulse*8,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#c1aa7d';ctx.beginPath();ctx.arc(x,y-9,15,0,Math.PI*2);ctx.fill();ctx.fillRect(x-5,y-38,10,30);ctx.beginPath();ctx.arc(x,y-42,9,0,Math.PI*2);ctx.fill();
  // Four lampposts and benches at the cardinal approaches.
  for(const [dx,dy] of [[0,-205],[205,0],[0,205],[-205,0]]){
    const lx=x+dx,ly=y+dy;ctx.fillStyle='#493c30';ctx.fillRect(lx-3,ly-20,6,24);ctx.fillStyle='#f2cf82';ctx.shadowColor='#f2bf66';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(lx,ly-24,5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  }
  for(const [dx,dy] of [[-105,-165],[105,-165],[-105,165],[105,165]]){const bx=x+dx,by=y+dy;ctx.fillStyle='#66482f';ctx.fillRect(bx-20,by-5,40,7);ctx.fillRect(bx-15,by+2,4,8);ctx.fillRect(bx+11,by+2,4,8);ctx.strokeStyle='#c29b64';ctx.strokeRect(bx-20,by-5,40,7);}
  ctx.restore();
}
export function drawSettlementLayoutV2173(ctx,camX=0,camY=0,time=0){
  if(!ctx||typeof ctx.beginPath!=='function')return Object.freeze({drawn:false,version:2173});
  let drawn=0;
  for(const road of ETRANOM_SETTLEMENT_LAYOUT_V2173.roads){drawRoad(ctx,road,camX,camY);drawn++;}
  drawPlaza(ctx,time);
  return Object.freeze({drawn:true,version:2173,roadCount:drawn,plaza:'central-fountain-square'});
}
export function auditSettlementLayoutV2173(){
  const issues=[],ids=new Set();
  for(const road of ETRANOM_SETTLEMENT_LAYOUT_V2173.roads){if(ids.has(road.id))issues.push(`duplicate_road:${road.id}`);ids.add(road.id);if(!['city','grain','rootwood','ironhollow'].includes(road.zone))issues.push(`unknown_zone:${road.id}`);if(!(road.width>=16&&road.width<=60))issues.push(`road_width:${road.id}`);if(road.points.length<2||road.points.some(p=>p.length!==2||p.some(n=>!Number.isFinite(n))))issues.push(`invalid_geometry:${road.id}`);}
  return Object.freeze({ok:issues.length===0,version:2173,roadCount:ids.size,zones:['city','grain','rootwood','ironhollow'],plaza:ETRANOM_SETTLEMENT_LAYOUT_V2173.plaza,issues:Object.freeze(issues)});
}
if(typeof window!=='undefined'){window.ETRANOM_SETTLEMENT_LAYOUT_V2173=ETRANOM_SETTLEMENT_LAYOUT_V2173;window.ETRANOM_SETTLEMENT_LAYOUT_AUDIT_V2173=auditSettlementLayoutV2173();}
