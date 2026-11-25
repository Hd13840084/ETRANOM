/** ETRANOM V2041 — safe-zone watercourses, crossings and subtle ambient motion.
 * Decorative canvas layer only. It deliberately adds no collision, navigation,
 * interaction, persistence, NPC, combat or networking behavior.
 */
export const SAFE_ZONE_WATER_V2041 = Object.freeze({
  features: Object.freeze(['Keshtezar irrigation stream','Rootwood woodland creek','Ash City reflecting pool','Sang-Ahan spring','stone and timber footbridges','water glints','leaf and grass motion'])
});
const onScreen=(x,y,cx,cy)=>x>=cx-120&&x<=cx+860&&y>=cy-120&&y<=cy+780;
function drawWaterway(ctx,t,points,width=14){
  ctx.save(); ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.beginPath(); points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
  ctx.strokeStyle='rgba(35,76,79,.42)'; ctx.lineWidth=width+7; ctx.stroke();
  ctx.strokeStyle='#527f83'; ctx.lineWidth=width; ctx.stroke();
  ctx.strokeStyle='rgba(151,202,194,.58)'; ctx.lineWidth=Math.max(2,width*.22); ctx.stroke();
  for(let i=0;i<7;i++){
    const p=(t/2600+i/7)%1, seg=Math.min(points.length-2,Math.floor(p*(points.length-1))), f=p*(points.length-1)-seg;
    const a=points[seg],b=points[seg+1],x=a[0]+(b[0]-a[0])*f,y=a[1]+(b[1]-a[1])*f;
    ctx.fillStyle='rgba(218,239,218,.62)';ctx.beginPath();ctx.ellipse(x,y,3.5,1.4,0,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}
function bridge(ctx,x,y,angle=0,kind='wood'){
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  const wood=kind==='wood';ctx.fillStyle=wood?'#765638':'#77766d';ctx.fillRect(-30,-8,60,16);
  ctx.fillStyle=wood?'#a47a4d':'#aaa697';for(let i=-24;i<=24;i+=8)ctx.fillRect(i,-7,3,14);
  ctx.strokeStyle=wood?'#513d2a':'#56564f';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-29,-11);ctx.lineTo(29,-11);ctx.moveTo(-29,11);ctx.lineTo(29,11);ctx.stroke();
  // V2075: individually shaded deck boards, end grain and small iron fasteners.
  for(let i=-24;i<=24;i+=8){ctx.fillStyle=wood?'rgba(226,184,119,.26)':'rgba(235,231,214,.22)';ctx.fillRect(i,-6,1,12);ctx.fillStyle='#393a35';ctx.beginPath();ctx.arc(i+2,-9,1.15,0,Math.PI*2);ctx.arc(i+2,9,1.15,0,Math.PI*2);ctx.fill();}
  for(const ex of [-27,27]){ctx.fillStyle=wood?'#8b6845':'#8c897e';ctx.fillRect(ex-2,-13,4,26);ctx.fillStyle='rgba(238,215,170,.32)';ctx.fillRect(ex-1,-12,1,24);}
  ctx.restore();
}
function bankStone(ctx,x,y,r=4,tone=0){
  ctx.save();ctx.fillStyle=['#77776d','#918c7d','#625f57'][tone%3];ctx.beginPath();ctx.ellipse(x,y,r*1.35,r*.72,-.18,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(225,218,195,.32)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-r*.5,y-r*.18);ctx.lineTo(x+r*.2,y-r*.42);ctx.stroke();ctx.restore();
}
function reedClump(ctx,x,y,seed=0){
  ctx.save();for(let k=0;k<5;k++){const dx=(k-2)*3.2,h=9+(k%3)*3;ctx.strokeStyle=k%2?'#637b4e':'#82905a';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x+dx,y+4);ctx.quadraticCurveTo(x+dx-3,y-h*.45,x+dx+Math.sin(seed+k)*3,y-h);ctx.stroke();if(k===2){ctx.fillStyle='#9a8350';ctx.beginPath();ctx.ellipse(x+dx+Math.sin(seed+k)*3,y-h,1.8,3,-.2,0,Math.PI*2);ctx.fill();}}ctx.restore();
}
function waterRipple(ctx,x,y,phase=0,scale=1){
  const pulse=.7+.3*Math.sin(phase);ctx.save();ctx.strokeStyle=`rgba(221,241,225,${.26*pulse})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y,5*scale,1.6*scale,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(x-3*scale,y+2*scale);ctx.lineTo(x+2*scale,y+2*scale);ctx.stroke();ctx.restore();
}
export function drawSafeZoneWaterV2041(ctx,t,cx=0,cy=0){
  // Keshtezar: narrow irrigation runnels and a timber crossing.
  drawWaterway(ctx,t,[[675,735],[720,750],[760,744],[805,765],[850,758]],7);
  // V2118: bridge deck is rendered from a standalone image sprite.
  // Rootwood: shaded creek winding between the trees, with a small stone crossing.
  drawWaterway(ctx,t,[[2070,1180],[2110,1200],[2160,1190],[2205,1220],[2260,1210],[2310,1235]],12);
  // V2118: bridge deck is rendered from a standalone image sprite.
  // Ash City: compact reflecting pool in a courtyard, away from the main plaza.
  if(onScreen(1500,1510,cx,cy)){
    ctx.save();ctx.fillStyle='#6d8580';ctx.beginPath();ctx.ellipse(1500,1510,48,22,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(133,190,180,.78)';ctx.beginPath();ctx.ellipse(1500,1507,42,16,0,0,Math.PI*2);ctx.fill();
    for(let i=0;i<3;i++){const r=7+((t/500+i*9)%26);ctx.strokeStyle=`rgba(224,239,214,${.34-i*.07})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(1500,1507,r*1.7,r*.48,0,0,Math.PI*2);ctx.stroke();}
    ctx.restore();
  }
  // Sang-Ahan: a small spring basin with a gentle shimmer.
  if(onScreen(1770,2150,cx,cy)){
    ctx.save();ctx.fillStyle='#777d72';ctx.beginPath();ctx.ellipse(1770,2150,27,17,-.2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#648b8b';ctx.beginPath();ctx.ellipse(1770,2147,21,11,-.2,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(220,237,220,.55)';ctx.beginPath();ctx.moveTo(1762,2145);ctx.quadraticCurveTo(1770,2141,1778,2145);ctx.stroke();ctx.restore();
  }
  // V2075 — handcrafted banks and waterline dressing for all four settlements.
  // These marks sit beside existing water only; they do not create new waterways.
  const bank=(points,offset=1)=>{for(let i=0;i<points.length;i++){const [x,y]=points[i];if(!onScreen(x,y,cx,cy))continue;if(i%1===0)bankStone(ctx,x+offset*(i%2?8:-8),y+5+(i%3)*2,3+(i%3),i);if(i%2===0)reedClump(ctx,x+offset*(i%2?13:-13),y-2,i);}};
  bank([[675,735],[720,750],[760,744],[805,765],[850,758]],1);
  bank([[2070,1180],[2110,1200],[2160,1190],[2205,1220],[2260,1210],[2310,1235]],-1);
  // Keshtezar: little sluice stones, damp bank marks and ripples at the crossing.
  for(let i=0;i<8;i++){const x=688+i*22,y=738+Math.sin(i*.9)*8;if(!onScreen(x,y,cx,cy))continue;bankStone(ctx,x,y+10,2.5+i%2,i);if(i%2===0)waterRipple(ctx,x+4,y-3,t/500+i,1);}
  if(onScreen(760,750,cx,cy)){ctx.save();ctx.strokeStyle='rgba(207,191,151,.45)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(727,763);ctx.quadraticCurveTo(760,771,793,757);ctx.stroke();ctx.restore();}
  // Rootwood: mossy creek stones, fern-like banks and leaf reflections.
  for(let i=0;i<14;i++){const x=2078+i*17,y=1187+Math.sin(i*.8)*18;if(!onScreen(x,y,cx,cy))continue;if(i%2===0)bankStone(ctx,x-9,y+8,3+i%3,i);if(i%3===0)waterRipple(ctx,x,y-2,t/700+i,1.2);if(i%4===0)reedClump(ctx,x+11,y+4,i+3);}
  // Ash City reflecting pool: a carved coping ring, corner stones and subtle surface glints.
  if(onScreen(1500,1510,cx,cy)){ctx.save();ctx.strokeStyle='#aaa18a';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(1500,1510,51,24,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='rgba(235,224,193,.45)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(1500,1509,46,20,0,0,Math.PI*2);ctx.stroke();ctx.restore();for(let i=0;i<7;i++)waterRipple(ctx,1480+i*6,1503+Math.sin(i*1.4)*5,t/450+i,.7);for(let i=0;i<8;i++){const a=i*Math.PI/4;bankStone(ctx,1500+Math.cos(a)*53,1510+Math.sin(a)*25,3,i);}}
  // Sang-Ahan spring: mineral lip, tiny runoff trickle and pale quartz fragments.
  if(onScreen(1770,2150,cx,cy)){ctx.save();ctx.strokeStyle='rgba(190,190,171,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(1770,2150,30,19,-.2,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='rgba(159,205,194,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(1790,2153);ctx.quadraticCurveTo(1804,2162,1814,2158);ctx.stroke();ctx.restore();for(let i=0;i<6;i++){const a=i*Math.PI/3;bankStone(ctx,1770+Math.cos(a)*31,2150+Math.sin(a)*18,2.5,i);}}

  // Ambient motion: a few drifting leaves and grass tufts, kept subtle.
  for(let i=0;i<16;i++){
    const x=360+(i*137)%2100,y=590+(i*191)%1650;
    if(!onScreen(x,y,cx,cy))continue;
    const sway=Math.sin(t/420+i*1.7)*3.2;
    ctx.save();ctx.translate(x,y);ctx.strokeStyle='rgba(116,145,82,.78)';ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(0,4);ctx.quadraticCurveTo(sway,-3, sway*1.4,-10);ctx.stroke();ctx.restore();
  }
  for(let i=0;i<5;i++){
    const p=(t/6500+i*.2)%1,x=900+p*1150,y=620+Math.sin(p*Math.PI*2+i)*85;
    if(!onScreen(x,y,cx,cy))continue;
    ctx.save();ctx.translate(x,y);ctx.rotate(t/1700+i);ctx.fillStyle='rgba(176,145,82,.72)';ctx.beginPath();ctx.ellipse(0,0,4,2,0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
}
