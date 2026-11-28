import { ETRANOM_WORLD_SCALE_CALIBRATION_V2170 } from '../world/world-scale-calibration-v2170.js?v=2170';
// ETRANOM V2115 — ambient outdoor settlement workers and residents.
// Purely decorative canvas actors: no collision, interaction, service, economy, quest or network logic.
const PEOPLE = [
  // Ash City: market, guard, inn, smith, clinic, temple, stable and granary surroundings.
  ['city',1260,835,'market','#8c5545','#d5b17b','carry'],['city',1390,965,'market','#456b72','#d4b27a','inspect'],
  ['city',1770,720,'guard','#4e5964','#c5a66f','patrol'],['city',1950,1010,'smith','#8a4d39','#d6a45d','hammer'],
  ['city',1180,1260,'inn','#66506f','#d5b17b','sweep'],['city',1450,1280,'healer','#56765c','#d8c49b','tend'],
  ['city',1810,1510,'guild','#5c6682','#c9ad7a','read'],['city',2180,960,'stable','#80603f','#d5bd8b','carry'],
  // Farmland: tending crops, bakery, mill and livestock.
  ['grain',390,700,'farmer','#647747','#d8bd82','tend'],['grain',500,900,'farmer','#8b6840','#d7b77c','carry'],
  ['grain',635,820,'baker','#8c4e3d','#e0c99a','knead'],['grain',740,710,'herbalist','#547a59','#d9c98e','tend'],
  ['grain',700,1060,'herder','#796044','#d9bd8a','carry'],
  // Rootwood: lumber, carpentry, herbs, hunting and apiary.
  ['rootwood',2290,850,'lumber','#6e503b','#c6a36e','saw'],['rootwood',2640,1010,'carpenter','#8a6749','#d4b27c','hammer'],
  ['rootwood',2780,1190,'herbalist','#557c59','#d8c995','tend'],['rootwood',2180,1190,'hunter','#4f6656','#c5a878','look'],
  ['rootwood',2710,720,'beekeeper','#987342','#e0c57f','inspect'],
  // Ironstone: mine carts, smelting, stonecutting and transport.
  ['ironhollow',1640,2180,'miner','#5d6264','#c7a779','carry'],['ironhollow',1990,2220,'smelter','#814b3c','#e0a45e','hammer'],
  ['ironhollow',2160,2320,'stonecutter','#77736a','#d2b88a','hammer'],['ironhollow',1510,2340,'miner','#555d64','#c8a979','inspect'],
  ['ironhollow',2310,2110,'cartwright','#78583e','#d6b47a','saw']
];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function drawPerson(ctx,p,t,index){
 const [zone,x,y,job,coat,trim,task]=p, phase=t/1000+index*1.73;
 const bob=Math.sin(phase*2.1)*1.25, sway=Math.sin(phase*1.4)*.13;
 const arm=task==='hammer'||task==='saw'?Math.sin(phase*3.2)*.65:task==='carry'?Math.sin(phase*2)*.22:Math.sin(phase*1.6)*.18;
 ctx.save();ctx.translate(x,y+bob);ctx.scale(ETRANOM_WORLD_SCALE_CALIBRATION_V2170.npc.ambientWorkerScale,ETRANOM_WORLD_SCALE_CALIBRATION_V2170.npc.ambientWorkerScale);ctx.rotate(sway);
 // soft ground shadow
 ctx.fillStyle='rgba(10,9,8,.28)';ctx.beginPath();ctx.ellipse(0,3,9,3.3,0,0,Math.PI*2);ctx.fill();
 // legs and boots
 ctx.strokeStyle='#302a27';ctx.lineWidth=3.2;ctx.lineCap='round';
 ctx.beginPath();ctx.moveTo(-2,-8);ctx.lineTo(-3+Math.sin(phase*2)*1.2,0);ctx.moveTo(2,-8);ctx.lineTo(3-Math.sin(phase*2)*1.2,0);ctx.stroke();
 ctx.fillStyle='#3c3028';ctx.fillRect(-6,-1,5,3);ctx.fillRect(1,-1,5,3);
 // body, belt and shoulder
 ctx.fillStyle=coat;ctx.beginPath();ctx.moveTo(-6,-23);ctx.quadraticCurveTo(0,-27,6,-23);ctx.lineTo(7,-9);ctx.quadraticCurveTo(0,-6,-7,-9);ctx.closePath();ctx.fill();
 ctx.strokeStyle=trim;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-5,-12);ctx.lineTo(5,-12);ctx.stroke();
 // working arms
 ctx.strokeStyle=coat;ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(-5,-21);ctx.lineTo(-8-arm*4,-15);ctx.moveTo(5,-21);ctx.lineTo(8+arm*5,-15-(task==='hammer'?Math.max(0,arm)*5:0));ctx.stroke();
 ctx.strokeStyle='#c99a72';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(8+arm*5,-15-(task==='hammer'?Math.max(0,arm)*5:0));ctx.lineTo(10+arm*5,-12);ctx.stroke();
 // head, hair and simple role cap
 ctx.fillStyle='#c99570';ctx.beginPath();ctx.arc(0,-29,5.2,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=job==='guard'||job==='miner'?'#4b4843':'#47372f';ctx.beginPath();ctx.arc(0,-31,5.3,Math.PI,Math.PI*2);ctx.fill();
 if(job==='beekeeper'){ctx.fillStyle='#d9bf78';ctx.beginPath();ctx.arc(0,-29,5.7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#47372f';ctx.fillRect(-6,-34,12,3);}
 // task prop glyphs, kept compact and above the hand
 ctx.font='10px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
 const glyph={carry:'▰',inspect:'⌕',patrol:'⚑',hammer:'⚒',sweep:'⌁',tend:'✿',read:'▤',knead:'✿',saw:'⌁',look:'⌖'}[task]||'✦';
 ctx.fillStyle=trim;ctx.fillText(glyph,12+arm*5,-20-(task==='hammer'?Math.max(0,arm)*5:0));
 // tiny ambient task particles for active trades
 if(task==='hammer'&&Math.sin(phase*3.2)>.88){ctx.fillStyle='#f4bd69';ctx.fillRect(17,-27,2,2);ctx.fillRect(19,-23,1.5,1.5);}
 if(task==='tend'&&index%2===0){ctx.fillStyle='rgba(168,196,119,.75)';ctx.beginPath();ctx.arc(10,-34+Math.sin(phase)*2,1.2,0,Math.PI*2);ctx.fill();}
 ctx.restore();
}
export function drawOutdoorVillageLifeV2115(ctx,t=0,camX=0,camY=0){
 if(!ctx||typeof ctx.beginPath!=='function')return;
 const left=camX-80,right=camX+850,top=camY-80,bottom=camY+760;
 ctx.save();
 PEOPLE.forEach((p,i)=>{if(p[1]<left||p[1]>right||p[2]<top||p[2]>bottom)return;drawPerson(ctx,p,t,i);});
 ctx.restore();
}
export const OUTDOOR_VILLAGE_LIFE_V2115=Object.freeze({residents:PEOPLE.length,settlements:['شهر خاکستر','کشتزار','ریشه‌چوب','سنگ‌آهن'],visualOnly:true,interactions:false});

export const OUTDOOR_VILLAGE_LIFE_PLACEMENTS_V2170=Object.freeze(PEOPLE.map(([zone,x,y,job,coat,trim,task],index)=>Object.freeze({id:`ambient-worker-${index+1}`,settlement:zone==='city'?'ashen_city':zone==='grain'?'farmland':zone==='rootwood'?'rootwood':'ironstone',x,y,job,task,renderScale:1.5,groundAnchor:'feet'})));
