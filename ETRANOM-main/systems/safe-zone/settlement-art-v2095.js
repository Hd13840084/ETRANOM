/** ETRANOM V2095 — settlement-scale map art. Decorative only; no collision, navigation or world entities. */
const visible=(x,y,cx,cy)=>x>=cx-120&&x<=cx+900&&y>=cy-120&&y<=cy+820;
export function drawSafeZoneSettlementArtV2095(ctx,t,cx=0,cy=0){
 const path=(pts,width,edge,fill)=>{ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=edge;ctx.lineWidth=width+8;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.strokeStyle=fill;ctx.lineWidth=width;ctx.stroke();ctx.setLineDash([13,9]);ctx.strokeStyle='rgba(220,196,145,.22)';ctx.lineWidth=1.2;ctx.stroke();ctx.restore();};
 const gate=(x,y,kind)=>{if(!visible(x,y,cx,cy))return;ctx.save();ctx.fillStyle='rgba(8,10,13,.25)';ctx.beginPath();ctx.ellipse(x,y+10,36,10,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle=kind==='root'?'#617a54':kind==='ore'?'#8a9699':'#9b8058';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(x-27,y+8);ctx.lineTo(x-27,y-30);ctx.quadraticCurveTo(x,y-62,x+27,y-30);ctx.lineTo(x+27,y+8);ctx.stroke();ctx.strokeStyle='#28272a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-17,y+5);ctx.lineTo(x-17,y-26);ctx.quadraticCurveTo(x,y-47,x+17,y-26);ctx.lineTo(x+17,y+5);ctx.stroke();ctx.restore();};
 // City of Ash: paved radial streets link the civic quarter and the four approaches.
 path([[1030,1110],[1210,1090],[1400,1100],[1580,1090],[1790,1110]],30,'#403b38','#71675a');
 path([[1410,860],[1400,1030],[1400,1210],[1390,1400]],24,'#403b38','#776a59');
 gate(1400,835,'city');gate(1400,1430,'city');
 // Keshtezar: packed-earth lanes and narrow irrigation cuts between crop blocks.
 path([[330,970],[520,960],[700,980],[850,1010]],22,'#4c4030','#8a7045');
 path([[520,820],[520,970],[540,1160],[560,1330]],13,'#35494a','#668e83');
 for(let i=0;i<7;i++){const x=360+i*62,y=1110+(i%2)*8;if(visible(x,y,cx,cy)){ctx.strokeStyle='#8c713f';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y-13);ctx.lineTo(x+17,y+13);ctx.stroke();}}
 gate(315,960,'field');
 // Rootwood: winding forest track, root arches and a mossy clearing threshold.
 path([[2050,820],[2160,930],[2220,1080],[2170,1230],[2280,1370]],27,'#332f29','#5b503d');
 for(let i=0;i<6;i++){const x=2070+i*54,y=1370+(i%2)*22;if(visible(x,y,cx,cy)){ctx.strokeStyle='#51402f';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-13,y+8);ctx.quadraticCurveTo(x,y-18,x+19,y-4);ctx.stroke();ctx.strokeStyle='rgba(130,157,103,.45)';ctx.lineWidth=1.5;ctx.stroke();}}
 gate(2050,810,'root');
 // Ironhollow: switchback mine road, rail spur and ore-stained retaining walls.
 path([[1460,1910],[1580,1990],[1710,2040],[1830,2150],[1940,2260]],28,'#34383b','#6c6c65');
 path([[1550,2025],[1660,1980],[1780,1995]],8,'#27292d','#8d8879');
 for(let i=0;i<8;i++){const x=1570+i*25,y=2020-i*5;if(visible(x,y,cx,cy)){ctx.strokeStyle='#9a8b72';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-3,y-9);ctx.lineTo(x+3,y+9);ctx.stroke();}}
 gate(1450,1900,'ore');
}
