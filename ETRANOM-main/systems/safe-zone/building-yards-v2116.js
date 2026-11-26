// ETRANOM V2116 — bespoke decorative yards for all 27 safe-zone buildings.
// Canvas-only dressing. Does not register collision, interaction, NPC, service or gameplay entities.
const YARDS = [
 ['online_player_market',1450,820,190,'market'],['pvp_hall',1690,820,190,'arena'],['inn',1120,1080,190,'inn'],['smith',1880,1080,180,'smith'],
 ['guild',1690,1390,190,'guild'],['alchemy',1330,1390,165,'alchemy'],['enchanter_shop',930,820,150,'arcane'],['clinic',2070,1390,165,'clinic'],
 ['guardhouse',1690,560,160,'guard'],['fire_temple',930,1390,170,'temple'],['stable',2240,820,178,'stable'],['granary',1120,1390,170,'granary'],
 ['grain_mill',430,610,175,'mill'],['grain_bakery',565,760,155,'bakery'],['grain_farmstead',330,850,165,'farm'],['grain_herbgarden',690,570,170,'herbs'],['grain_livestock',590,980,180,'livestock'],
 ['rootwood_sawmill',2360,760,190,'sawmill'],['rootwood_carpenter',2580,900,175,'carpenter'],['rootwood_herbalist',2730,1120,155,'forestherbs'],['rootwood_hunters',2240,1110,175,'hunter'],['rootwood_apiary',2660,650,165,'apiary'],
 ['iron_mine',1680,2070,190,'mine'],['iron_smelter',1920,2070,180,'smelter'],['iron_stonecutter',2110,2220,175,'stonecut'],['iron_hall',1580,2260,180,'miners'],['iron_cartwright',2250,2020,170,'cartwright']
];
const PALETTE={wood:'#79543a',wood2:'#b18a58',stone:'#77766e',dark:'#393b3b',cloth:'#9a6848',leaf:'#65794a',leaf2:'#9aa66a',metal:'#6e7478',gold:'#c6a15e',soil:'#806348',water:'#668d91'};
function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
function crate(c,x,y,s=13){c.fillStyle=PALETTE.wood;c.fillRect(x-s/2,y-s/2,s,s*.72);c.strokeStyle=PALETTE.wood2;c.lineWidth=1.5;c.strokeRect(x-s/2,y-s/2,s,s*.72);c.beginPath();c.moveTo(x-s/2,y-s/2);c.lineTo(x+s/2,y+s*.22);c.moveTo(x+s/2,y-s/2);c.lineTo(x-s/2,y+s*.22);c.stroke();}
function barrel(c,x,y){ellipse(c,x,y+4,6,3,PALETTE.dark);c.fillStyle=PALETTE.wood;c.fillRect(x-6,y-7,12,11);c.strokeStyle=PALETTE.gold;c.lineWidth=1;c.strokeRect(x-6,y-7,12,11);ellipse(c,x,y-7,6,2,PALETTE.wood2);}
function fence(c,x1,y1,x2,y2){c.strokeStyle='#745b3e';c.lineWidth=3;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();for(let x=x1;x<=x2;x+=12){c.strokeStyle='#9a7950';c.lineWidth=2;c.beginPath();c.moveTo(x,y1-4);c.lineTo(x,y1+5);c.stroke();}}
function plant(c,x,y,flower=false){ellipse(c,x,y,5,2.5,'#4c4934');c.strokeStyle=PALETTE.leaf;c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.lineTo(x-2,y-9);c.moveTo(x,y);c.lineTo(x+4,y-7);c.stroke();if(flower){c.fillStyle='#d7b779';c.beginPath();c.arc(x+1,y-9,2.5,0,Math.PI*2);c.fill();}}
function tool(c,x,y,type){c.strokeStyle=PALETTE.wood2;c.lineWidth=2.5;c.beginPath();c.moveTo(x-3,y+4);c.lineTo(x+4,y-8);c.stroke();c.strokeStyle=PALETTE.metal;c.lineWidth=3;c.beginPath();if(type==='pick'){c.moveTo(x-3,y-8);c.lineTo(x+7,y-8);}else if(type==='saw'){c.moveTo(x-4,y-6);c.lineTo(x+6,y-6);}else{c.moveTo(x+1,y-9);c.lineTo(x+8,y-9);}c.stroke();}
function drawYard(c,row,t){const [id,x,y,w,kind]=row;const side=(YARDS.indexOf(row)%2?1:-1), ox=side*(w*.62), oy=24; c.save();
 // Small compact ground pad and varied work-yard perimeter; leave a clear approach in front.
 ellipse(c,x+ox,y+oy,w*.34,17,'rgba(28,24,19,.20)');
 const left=x+ox-w*.27,right=x+ox+w*.27,back=y+oy-15;
 if(!['temple','arcane','arena'].includes(kind)){fence(c,left,back,right,back);fence(c,left,back,left,back+18);fence(c,right,back,right,back+18);}
 switch(kind){
 case'market':crate(c,x+ox-12,y+oy,16);crate(c,x+ox+10,y+oy+4,13);c.strokeStyle='#a75e48';c.lineWidth=2;c.beginPath();c.moveTo(x+ox-20,y+oy-9);c.lineTo(x+ox+20,y+oy-9);c.stroke();break;
 case'arena':for(let i=0;i<3;i++){c.strokeStyle='#8e8a7b';c.lineWidth=2;c.beginPath();c.moveTo(x+ox-22+i*20,y+oy+8);c.lineTo(x+ox-18+i*20,y+oy-4);c.stroke();}break;
 case'inn':barrel(c,x+ox-15,y+oy);crate(c,x+ox+12,y+oy+3);ellipse(c,x+ox+2,y+oy+7,12,3,'#765a3d');break;
 case'smith':ellipse(c,x+ox-8,y+oy+3,10,5,'#393536');c.fillStyle='#c76c36';ellipse(c,x+ox-8,y+oy+1,5,2,'#e7a34d');tool(c,x+ox+13,y+oy,'hammer');break;
 case'guild':crate(c,x+ox-12,y+oy,15);c.strokeStyle=PALETTE.gold;c.lineWidth=2;c.beginPath();c.moveTo(x+ox+12,y+oy+7);c.lineTo(x+ox+12,y+oy-15);c.stroke();c.fillStyle='#a64f42';c.beginPath();c.moveTo(x+ox+12,y+oy-15);c.lineTo(x+ox+25,y+oy-11);c.lineTo(x+ox+12,y+oy-7);c.fill();break;
 case'alchemy':case'arcane':for(let i=0;i<3;i++){ellipse(c,x+ox-13+i*13,y+oy+3,4,5,['#6b9b91','#8c719e','#b58d58'][i]);}plant(c,x+ox+20,y+oy+6,true);break;
 case'clinic':for(let i=0;i<4;i++)plant(c,x+ox-18+i*12,y+oy+6,true);break;
 case'guard':tool(c,x+ox-8,y+oy,'spear');tool(c,x+ox+8,y+oy,'spear');break;
 case'temple':ellipse(c,x+ox,y+oy+2,12,5,'#55504a');ellipse(c,x+ox,y+oy,7,3,'#d58a45');break;
 case'stable':fence(c,left,back+7,right,back+7);crate(c,x+ox-13,y+oy,15);barrel(c,x+ox+13,y+oy);break;
 case'granary':for(let i=0;i<3;i++){ellipse(c,x+ox-17+i*17,y+oy+4,7,5,'#b59a5e');}crate(c,x+ox+18,y+oy-5,13);break;
 case'mill':crate(c,x+ox-12,y+oy,15);ellipse(c,x+ox+13,y+oy+3,9,3,'#9c875c');break;
 case'bakery':ellipse(c,x+ox-8,y+oy+2,10,5,'#51423a');ellipse(c,x+ox-8,y+oy,6,3,'#d17b42');crate(c,x+ox+14,y+oy+4,14);break;
 case'farm':for(let i=0;i<4;i++)plant(c,x+ox-20+i*13,y+oy+4,true);barrel(c,x+ox+22,y+oy);break;
 case'herbs':case'forestherbs':for(let i=0;i<5;i++)plant(c,x+ox-24+i*12,y+oy+4,true);break;
 case'livestock':fence(c,left,back+5,right,back+5);crate(c,x+ox-13,y+oy,15);ellipse(c,x+ox+13,y+oy+5,8,4,'#8a7657');break;
 case'sawmill':case'carpenter':case'cartwright':for(let i=0;i<3;i++){c.strokeStyle='#9b754a';c.lineWidth=5;c.beginPath();c.moveTo(x+ox-22+i*4,y+oy+8+i*2);c.lineTo(x+ox+3+i*4,y+oy+3+i*2);c.stroke();}tool(c,x+ox+20,y+oy,kind==='sawmill'?'saw':'hammer');break;
 case'hunter':tool(c,x+ox-8,y+oy,'spear');crate(c,x+ox+12,y+oy,14);break;
 case'apiary':for(let i=0;i<3;i++){c.fillStyle='#c6a65d';c.fillRect(x+ox-19+i*17,y+oy-3,11,10);c.strokeStyle='#554b35';c.strokeRect(x+ox-19+i*17,y+oy-3,11,10);plant(c,x+ox-18+i*17,y+oy+9,true);}break;
 case'mine':tool(c,x+ox-8,y+oy,'pick');for(let i=0;i<3;i++)ellipse(c,x+ox+8+(i%2)*8,y+oy+3+Math.floor(i/2)*4,5,4,'#77766e');break;
 case'smelter':ellipse(c,x+ox-8,y+oy+3,10,5,'#383433');ellipse(c,x+ox-8,y+oy+1,5,2,'#e18a3d');crate(c,x+ox+15,y+oy+3,13);break;
 case'stonecut':for(let i=0;i<3;i++){c.fillStyle='#89877e';c.fillRect(x+ox-22+i*17,y+oy-1,13,11);c.strokeStyle='#555';c.strokeRect(x+ox-22+i*17,y+oy-1,13,11);}tool(c,x+ox+24,y+oy,'hammer');break;
 case'miners':barrel(c,x+ox-12,y+oy);crate(c,x+ox+12,y+oy,14);break;
 }
 // Tiny settlement-appropriate finishing details.
 if(kind==='farm'||kind==='herbs'||kind==='forestherbs'||kind==='apiary'){plant(c,x+ox-w*.22,y+oy+13,true);}
 c.restore();}
export function drawBuildingYardsV2116(ctx,camX=0,camY=0){if(!ctx||!ctx.beginPath)return;const l=camX-120,r=camX+980,top=camY-100,b=camY+850;ctx.save();YARDS.filter(p=>p[1]>l&&p[1]<r&&p[2]>top&&p[2]<b).sort((a,b)=>a[2]-b[2]).forEach(p=>drawYard(ctx,p,0));ctx.restore();}
export const BUILDING_YARDS_V2116=Object.freeze({count:YARDS.length,buildingIds:Object.freeze(YARDS.map(x=>x[0])),visualOnly:true,collisionChanges:0});
