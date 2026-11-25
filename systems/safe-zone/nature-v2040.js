/** ETRANOM V2040 — biome-specific safe-zone landscape dressing. Visual-only; no collision or interaction. */
export const SAFE_ZONE_NATURE_V2040 = Object.freeze({
  city: Object.freeze({name:'شهر خاکستر',palette:'courtyard',features:['garden beds','stone planters','small ornamental trees','courtyard fountain']}),
  grain: Object.freeze({name:'کشتزار',palette:'golden-fields',features:['wheat rows','irrigation channels','orchards','field flowers']}),
  rootwood: Object.freeze({name:'ریشه‌چوب',palette:'deep-forest',features:['old-growth trees','fern clusters','mossy stones','forest mushrooms']}),
  iron: Object.freeze({name:'سنگ‌آهن',palette:'rocky-highlands',features:['rock outcrops','scree','mountain shrubs','ore-stained stones']})
});
const visible=(x,y,cx,cy)=>x>=cx-100&&x<=cx+840&&y>=cy-100&&y<=cy+760;
export function drawSafeZoneNatureV2040(ctx,t,cx=0,cy=0){
  const tree=(x,y,r,phase=0,forest=false)=>{if(!visible(x,y,cx,cy))return;ctx.save();ctx.translate(x,y);ctx.fillStyle='rgba(12,17,13,.28)';ctx.beginPath();ctx.ellipse(2,8,r*1.15,r*.42,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=forest?'#493b2c':'#60472f';ctx.fillRect(-r*.13,-r*.2,r*.26,r*.9);for(let k=0;k<3;k++){const sway=Math.sin(t/950+phase+k)*1.8;ctx.fillStyle=forest?['#294b37','#355d40','#426a48'][k]:['#547447','#67894e','#78975a'][k];ctx.beginPath();ctx.arc(sway+(k-1)*r*.28,-r*.55-k*r*.18,r*(.62-k*.07),0,Math.PI*2);ctx.fill();}ctx.restore();};
  const rock=(x,y,s,shade=0)=>{if(!visible(x,y,cx,cy))return;ctx.save();ctx.translate(x,y);ctx.fillStyle=shade?'#69675f':'#817d70';ctx.beginPath();ctx.moveTo(-s,-s*.15);ctx.lineTo(-s*.45,-s*.72);ctx.lineTo(s*.35,-s*.85);ctx.lineTo(s,-s*.12);ctx.lineTo(s*.62,s*.45);ctx.lineTo(-s*.72,s*.42);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(211,198,168,.28)';ctx.lineWidth=2;ctx.stroke();ctx.restore();};
  // City: planted courtyards and clipped ornamental trees, kept clear of the plaza.
  [[1030,850],[1960,850],[1030,1370],[1960,1370]].forEach(([x,y],i)=>tree(x,y,17,i,false));
  [[1120,900],[1880,900],[1120,1320],[1880,1320]].forEach(([x,y])=>{if(!visible(x,y,cx,cy))return;ctx.fillStyle='#66523a';ctx.fillRect(x-12,y-5,24,10);ctx.fillStyle='#65834e';for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(x-7+k*7,y-9,5,0,Math.PI*2);ctx.fill();}});
  // Grainfields: repeated crop rows and irrigation glints.
  for(let row=0;row<9;row++){const x=245+row*25;ctx.save();ctx.strokeStyle='rgba(190,160,72,.65)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,540);ctx.quadraticCurveTo(x+Math.sin(t/1200+row)*4,650,x+3,760);ctx.stroke();for(let n=0;n<8;n++){const y=555+n*25;if(!visible(x,y,cx,cy))continue;ctx.strokeStyle=n%2?'#c5a64e':'#d6bd69';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-5,y-7);ctx.moveTo(x,y);ctx.lineTo(x+5,y-8);ctx.stroke();}ctx.restore();}
  [[520,690],[560,730],[600,690],[640,730]].forEach(([x,y],i)=>tree(x,y,13,i,false));
  ctx.save();if(visible(700,735,cx,cy)){ctx.strokeStyle='rgba(91,157,163,.62)';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(680,735);ctx.quadraticCurveTo(720,748,760,735);ctx.stroke();for(let i=0;i<3;i++){const p=(t/900+i*.33)%1;ctx.fillStyle='rgba(196,229,211,.45)';ctx.beginPath();ctx.arc(680+p*80,735+Math.sin(p*Math.PI)*7,1.8,0,Math.PI*2);ctx.fill();}}ctx.restore();
  // Rootwood: dense layered canopy beyond the village workshops.
  for(let i=0;i<22;i++){const x=2130+(i%6)*105+(Math.floor(i/6)%2)*35,y=650+Math.floor(i/6)*105;tree(x,y,25+(i%3)*4,i*.7,true);}
  for(let i=0;i<14;i++){const x=2080+(i%7)*115,y=1040+Math.floor(i/7)*55;if(!visible(x,y,cx,cy))continue;ctx.fillStyle=i%2?'#52744b':'#668354';ctx.beginPath();ctx.ellipse(x,y,10,5,-.3,0,Math.PI*2);ctx.fill();if(i%3===0){ctx.fillStyle='#b77d79';ctx.beginPath();ctx.arc(x+4,y-4,4,Math.PI,Math.PI*2);ctx.fill();}}
  // V2071 — dense settlement dressing. Decorative only: no collision, hitbox or interaction changes.
  const flowerBed=(x,y,seed=0)=>{if(!visible(x,y,cx,cy))return;ctx.save();ctx.translate(x,y);ctx.fillStyle='rgba(28,22,16,.22)';ctx.beginPath();ctx.ellipse(0,4,19,7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#6b5035';ctx.fillRect(-18,-2,36,7);for(let i=0;i<7;i++){const px=-14+i*4.5,py=-5-Math.sin(i*1.7+seed)*3;ctx.strokeStyle='#496b3e';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(px,1);ctx.lineTo(px,py);ctx.stroke();ctx.fillStyle=['#d58a91','#e3c36d','#b9a0d7','#e7e0c6'][(i+seed)%4|0];ctx.beginPath();ctx.arc(px,py,2.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f3d99a';ctx.beginPath();ctx.arc(px,py,0.8,0,Math.PI*2);ctx.fill();}ctx.restore();};
  const barrel=(x,y)=>{if(!visible(x,y,cx,cy))return;ctx.save();ctx.fillStyle='rgba(18,16,12,.22)';ctx.beginPath();ctx.ellipse(x+2,y+4,11,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#805632';ctx.fillRect(x-8,y-13,16,16);ctx.fillStyle='#b58a55';ctx.fillRect(x-9,y-11,18,2);ctx.fillRect(x-9,y-1,18,2);ctx.fillStyle='#59402b';ctx.fillRect(x-7,y-9,2,12);ctx.restore();};
  const bench=(x,y)=>{if(!visible(x,y,cx,cy))return;ctx.save();ctx.fillStyle='rgba(20,18,14,.2)';ctx.beginPath();ctx.ellipse(x,y+5,19,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#795536';ctx.fillRect(x-16,y-8,32,5);ctx.fillRect(x-14,y-2,28,3);ctx.fillStyle='#4d3827';ctx.fillRect(x-12,y+1,3,7);ctx.fillRect(x+9,y+1,3,7);ctx.restore();};
  const lamp=(x,y)=>{if(!visible(x,y,cx,cy))return;ctx.save();ctx.strokeStyle='#44382b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y+5);ctx.lineTo(x,y-25);ctx.stroke();ctx.fillStyle='#342e27';ctx.fillRect(x-6,y-30,12,9);ctx.fillStyle='#f5c879';ctx.fillRect(x-3,y-27,6,5);ctx.fillStyle='rgba(255,190,92,.13)';ctx.beginPath();ctx.arc(x,y-25,15,0,Math.PI*2);ctx.fill();ctx.restore();};
  const crate=(x,y)=>{if(!visible(x,y,cx,cy))return;ctx.save();ctx.fillStyle='#9a7145';ctx.fillRect(x-9,y-10,18,15);ctx.strokeStyle='#5c432c';ctx.lineWidth=1.5;ctx.strokeRect(x-9,y-10,18,15);ctx.beginPath();ctx.moveTo(x-8,y-9);ctx.lineTo(x+8,y+4);ctx.moveTo(x+8,y-9);ctx.lineTo(x-8,y+4);ctx.stroke();ctx.restore();};
  // Courtyard: small readable props are placed around, not over, the central walking lanes.
  [[970,970],[2020,970],[970,1250],[2020,1250],[1240,790],[1750,1450]].forEach(([x,y],i)=>flowerBed(x,y,i));
  [[1080,980],[1910,1240],[1180,1450],[1810,790]].forEach(([x,y])=>barrel(x,y));
  [[1220,820],[1780,1410],[930,1120]].forEach(([x,y])=>bench(x,y));
  [[1160,780],[1840,780],[1160,1450],[1840,1450]].forEach(([x,y])=>lamp(x,y));
  [[1010,1050],[1980,1110],[1320,1510],[1710,760]].forEach(([x,y])=>crate(x,y));
  // Village edges: orchard flowers, work-yard barrels and path-side lamps.
  for(let i=0;i<12;i++){const x=390+i*48,y=805+(i%3)*17;flowerBed(x,y,i+3);}
  for(let i=0;i<9;i++){const x=2170+(i%3)*95,y=1180+Math.floor(i/3)*70;flowerBed(x,y,i+9);}
  [[770,780],[845,830],[2240,970],[2320,1030],[1600,1890],[1780,2140]].forEach(([x,y])=>lamp(x,y));
  [[850,900],[920,930],[2250,1120],[2340,1150],[1480,2080],[1840,2240]].forEach(([x,y])=>crate(x,y));
  // Iron highlands: layered rock shelves and sparse alpine shrubs.
  for(let i=0;i<18;i++){const x=1550+(i%6)*75,y=2020+Math.floor(i/6)*82+(i%2)*14;rock(x,y,15+(i%4)*4,i%2);}
  for(let i=0;i<9;i++){const x=1510+i*82,y=1935+(i%3)*28;if(!visible(x,y,cx,cy))continue;ctx.strokeStyle='#75845a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-5,y-12);ctx.moveTo(x,y);ctx.lineTo(x+6,y-15);ctx.stroke();}
  // V2072 — high-density settlement art pass. All additions are decorative canvas paint:
  // no world coordinates, collision geometry, triggers, NPCs, or navigation are modified.
  const pebble=(x,y,r=3,tone=0)=>{if(!visible(x,y,cx,cy))return;ctx.save();ctx.fillStyle=['#817d70','#9a927f','#5e5a52'][tone%3];ctx.beginPath();ctx.ellipse(x,y,r*1.35,r*.72,-.25,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(225,213,185,.22)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-r*.5,y-r*.25);ctx.lineTo(x+r*.25,y-r*.42);ctx.stroke();ctx.restore();};
  const shrub=(x,y,r=9,forest=false)=>{if(!visible(x,y,cx,cy))return;ctx.save();ctx.fillStyle='rgba(20,20,14,.2)';ctx.beginPath();ctx.ellipse(x+2,y+3,r*1.2,r*.42,0,0,Math.PI*2);ctx.fill();for(let k=0;k<4;k++){ctx.fillStyle=(forest?['#284632','#35583c','#426747','#56764b']:['#526b3c','#668448','#789451','#8b9e5d'])[k];ctx.beginPath();ctx.arc(x+(k%2?1:-5)+Math.sin(k*3)*2,y-(k>>1)*5,r*(.48+(k%2)*.08),0,Math.PI*2);ctx.fill();}ctx.restore();};
  const log=(x,y,len=26)=>{if(!visible(x,y,cx,cy))return;ctx.save();ctx.strokeStyle='#523b29';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(x-len/2,y);ctx.lineTo(x+len/2,y-2);ctx.stroke();ctx.strokeStyle='#b18a5a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x+len/2,y-2,3,0,Math.PI*2);ctx.stroke();ctx.restore();};
  const mushroom=(x,y,scale=1)=>{if(!visible(x,y,cx,cy))return;ctx.save();ctx.fillStyle='#d8c8a4';ctx.fillRect(x-1.5*scale,y-5*scale,3*scale,6*scale);ctx.fillStyle='#a65d55';ctx.beginPath();ctx.ellipse(x,y-5*scale,5*scale,3*scale,0,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='#f1dfbd';ctx.beginPath();ctx.arc(x-2*scale,y-6*scale,1*scale,0,Math.PI*2);ctx.arc(x+2*scale,y-5*scale,1*scale,0,Math.PI*2);ctx.fill();ctx.restore();};
  const flowerPatch=(x,y,seed=0)=>{if(!visible(x,y,cx,cy))return;for(let j=0;j<5;j++){const px=x+(j-2)*6,py=y+Math.sin(j*2+seed)*4;ctx.strokeStyle='#4d7142';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(px,py+5);ctx.lineTo(px,py);ctx.stroke();ctx.fillStyle=['#d78b91','#e4c46e','#bca4d4','#f0e5c9'][(j+seed)%4];ctx.beginPath();ctx.arc(px,py,2.4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f7dfa0';ctx.beginPath();ctx.arc(px,py,0.7,0,Math.PI*2);ctx.fill();}};
  const fence=(x,y,n=4,vertical=false)=>{if(!visible(x,y,cx,cy))return;ctx.save();ctx.strokeStyle='#684a30';ctx.lineWidth=3;ctx.beginPath();for(let j=0;j<n;j++){const a=j*12;if(vertical){ctx.moveTo(x-5,y+a);ctx.lineTo(x+5,y+a);}else{ctx.moveTo(x+a,y-5);ctx.lineTo(x+a,y+5);}}if(vertical){ctx.moveTo(x,y);ctx.lineTo(x,y+(n-1)*12);}else{ctx.moveTo(x,y);ctx.lineTo(x+(n-1)*12,y);}ctx.stroke();ctx.restore();};
  // Ashen city: stone edging, flower clusters, market clutter, banners and courtyard planters.
  for(let i=0;i<46;i++){const x=900+(i%12)*92,y=755+Math.floor(i/12)*205+(i%2)*9;pebble(x,y,2+(i%3),i%3);}
  for(let i=0;i<22;i++){const x=980+(i%8)*135,y=895+Math.floor(i/8)*175;shrub(x,y,7+(i%3));if(i%2===0)flowerPatch(x+12,y-5,i);}
  for(let i=0;i<12;i++){const x=1050+(i%4)*245,y=845+Math.floor(i/4)*245;ctx.save();if(visible(x,y,cx,cy)){ctx.fillStyle='#79634a';ctx.fillRect(x-13,y-4,26,8);ctx.fillStyle='#a4a078';ctx.fillRect(x-10,y-7,20,3);ctx.fillStyle='#496a43';ctx.beginPath();ctx.arc(x-5,y-10,5,0,Math.PI*2);ctx.arc(x+3,y-11,6,0,Math.PI*2);ctx.fill();}ctx.restore();}
  // Grain hamlet: orchard rows, crop bundles, fences, stepping stones and irrigation banks.
  for(let row=0;row<7;row++){const x=330+row*68;for(let j=0;j<12;j++){const y=820+j*27+(row%2)*8;if(!visible(x,y,cx,cy))continue;ctx.strokeStyle=j%2?'#b99a4d':'#d2b85f';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y+5);ctx.lineTo(x-4,y-3);ctx.moveTo(x,y+5);ctx.lineTo(x+5,y-5);ctx.stroke();if(j%3===0)pebble(x+12,y+7,2,j%3);}}
  for(let i=0;i<15;i++){const x=430+(i%5)*82,y=1010+Math.floor(i/5)*78;tree(x,y,12,i*.4,false);flowerPatch(x+17,y+10,i);}
  [[370,960],[405,970],[740,1000],[780,1012],[820,1090],[350,1160],[870,1175]].forEach(([x,y],i)=>{pebble(x,y,4,i);pebble(x+8,y+3,2,i+1);});
  [[300,875],[335,875],[370,875],[405,875],[840,920],[875,920],[910,920]].forEach(([x,y],i)=>fence(x,y,4,i%2===0));
  for(let i=0;i<8;i++){const x=300+i*74,y=1250+(i%2)*18;shrub(x,y,8);if(i%2===0)mushroom(x+10,y-4,.8);}
  // Rootwood: layered undergrowth, fallen timber, mushrooms, moss and dense forest margins.
  for(let i=0;i<54;i++){const x=2050+(i%9)*72+(Math.floor(i/9)%2)*18,y=620+Math.floor(i/9)*88;shrub(x,y,8+(i%4)*2,true);if(i%3===0)mushroom(x+17,y+5,.7+(i%2)*.2);if(i%4===0)pebble(x-13,y+8,3,i);}
  for(let i=0;i<13;i++){const x=2110+(i%5)*150,y=1150+Math.floor(i/5)*90;log(x,y,22+(i%3)*7);shrub(x+18,y-5,7,true);}
  for(let i=0;i<18;i++){const x=2180+(i%6)*96,y=1450+Math.floor(i/6)*55;flowerPatch(x,y,i+2);}
  // Iron hamlet: broken scree, ore fragments, timber braces and hardy alpine plants.
  for(let i=0;i<62;i++){const x=1430+(i%10)*72+(Math.floor(i/10)%2)*13,y=1870+Math.floor(i/10)*68;pebble(x,y,3+(i%4),i%3);if(i%5===0)rock(x+11,y-5,8+(i%3)*3,i%2);if(i%4===0)shrub(x-9,y+8,6,false);}
  for(let i=0;i<9;i++){const x=1510+i*88,y=2290+(i%2)*16;log(x,y,30);pebble(x+20,y+4,4,i);}
  for(let i=0;i<16;i++){const x=1450+(i%8)*105,y=1810+Math.floor(i/8)*360;shrub(x,y,6+(i%3),false);}
  // A final scattering of small path-edge details makes the settlements feel inhabited,
  // while the central lanes remain visually open.
  for(let i=0;i<48;i++){const x=760+(i%12)*112,y=1480+Math.floor(i/12)*34+(i%2)*7;pebble(x,y,2+(i%2),i);if(i%4===0)flowerPatch(x+7,y-5,i);}

  // V2073 — settlement micro-detail pass. These are deterministic, decorative
  // canvas marks only; no world entities, walkable areas, hitboxes or save data change.
  const steppingStone=(x,y,w=9)=>{if(!visible(x,y,cx,cy))return;ctx.save();ctx.fillStyle='rgba(25,22,17,.18)';ctx.beginPath();ctx.ellipse(x+1,y+2,w+2,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#aaa18c';ctx.beginPath();ctx.moveTo(x-w,y);ctx.lineTo(x-w*.55,y-4);ctx.lineTo(x+w*.55,y-4);ctx.lineTo(x+w,y);ctx.lineTo(x+w*.6,y+3);ctx.lineTo(x-w*.7,y+3);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(235,224,196,.35)';ctx.lineWidth=1;ctx.stroke();ctx.restore();};
  const reed=(x,y,seed=0)=>{if(!visible(x,y,cx,cy))return;ctx.save();ctx.strokeStyle='#657d4d';ctx.lineWidth=1.7;for(let k=0;k<3;k++){const dx=(k-1)*4;ctx.beginPath();ctx.moveTo(x,y+5);ctx.quadraticCurveTo(x+dx-3,y-3,x+dx+Math.sin(seed+k)*3,y-12-k%2*3);ctx.stroke();ctx.fillStyle='#b59a58';ctx.beginPath();ctx.ellipse(x+dx+Math.sin(seed+k)*3,y-12-k%2*3,2,4,-.35,0,Math.PI*2);ctx.fill();}ctx.restore();};
  const crystal=(x,y,s=7,tone=0)=>{if(!visible(x,y,cx,cy))return;ctx.save();ctx.fillStyle=['#718d91','#9a8060','#78836d'][tone%3];ctx.beginPath();ctx.moveTo(x-s*.65,y);ctx.lineTo(x-s*.3,y-s*1.5);ctx.lineTo(x+s*.15,y-s*1.9);ctx.lineTo(x+s*.7,y-s*.2);ctx.lineTo(x+s*.35,y+s*.35);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(225,220,196,.45)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+s*.15,y-s*1.9);ctx.lineTo(x+s*.05,y);ctx.stroke();ctx.restore();};
  const leafLitter=(x,y,seed=0)=>{if(!visible(x,y,cx,cy))return;ctx.save();for(let k=0;k<4;k++){ctx.fillStyle=['#806342','#9b7547','#687345','#b18a55'][(k+seed)%4];ctx.beginPath();ctx.ellipse(x+(k-1.5)*4,y+Math.sin(seed+k)*2,4,1.8,(k-1)*.25,0,Math.PI*2);ctx.fill();}ctx.restore();};
  const tuft=(x,y,seed=0)=>{if(!visible(x,y,cx,cy))return;ctx.save();ctx.strokeStyle=['#71864d','#8a9857','#5d7548'][seed%3];ctx.lineWidth=1.6;for(let k=-2;k<=2;k++){ctx.beginPath();ctx.moveTo(x,y+3);ctx.quadraticCurveTo(x+k*2,y-3,x+k*3,y-9-Math.abs(k));ctx.stroke();}ctx.restore();};
  // Ash City: patterned paving, carved edging, planter highlights and small market clutter.
  for(let i=0;i<96;i++){const x=935+(i%16)*63,y=735+Math.floor(i/16)*42+(i%2)*3;steppingStone(x,y,5+(i%3));if(i%5===0)leafLitter(x+8,y-3,i);}
  for(let i=0;i<36;i++){const x=990+(i%9)*116,y=820+Math.floor(i/9)*138;tuft(x,y,i);if(i%3===0)crystal(x+8,y-2,4,i);}
  // Keshtezar: denser crop rows, irrigation reeds, field markers and orchard floor texture.
  for(let row=0;row<10;row++){for(let j=0;j<15;j++){const x=285+row*57+(j%2)*4,y=790+j*24+(row%2)*5;if(!visible(x,y,cx,cy))continue;tuft(x,y,row+j);if(j%4===0)steppingStone(x+11,y+7,4);if(j%5===0)reed(x-8,y+4,row);}}
  for(let i=0;i<28;i++){const x=360+(i%7)*73,y=1190+Math.floor(i/7)*26;leafLitter(x,y,i);if(i%2===0)flowerPatch(x+9,y-4,i+5);}
  // Rootwood: forest-floor layers, root ridges, fern-like tufts and varied fungi.
  for(let i=0;i<110;i++){const x=2025+(i%11)*66+(Math.floor(i/11)%2)*13,y=600+Math.floor(i/11)*73;leafLitter(x,y,i);if(i%2===0)tuft(x+9,y-2,i);if(i%7===0)mushroom(x-7,y-3,.65+(i%3)*.12);if(i%9===0)crystal(x+15,y+2,5,2);}
  for(let i=0;i<24;i++){const x=2070+(i%6)*116,y=1530+Math.floor(i/6)*42;log(x,y,18+(i%4)*5);leafLitter(x+14,y+4,i);}
  // Sang-Ahan: mineral fragments and hardy grass around the rocky settlement margins.
  for(let i=0;i<120;i++){const x=1390+(i%12)*67+(Math.floor(i/12)%2)*11,y=1780+Math.floor(i/12)*57;pebble(x,y,2+(i%4),i);if(i%4===0)crystal(x+7,y-3,5+(i%3),i);if(i%3===0)tuft(x-7,y+4,i);if(i%8===0)flowerPatch(x+12,y-3,i);}
  for(let i=0;i<18;i++){const x=1460+(i%6)*126,y=2440+Math.floor(i/6)*24;steppingStone(x,y,6);leafLitter(x+12,y+3,i);}

  // V2074 — high-density regional world dressing. Deterministic, viewport-culled,
  // strictly decorative: no gameplay entities, navigation, collision or save data.
  const pebbleLine=(x,y,n,dx,dy,seed=0)=>{for(let q=0;q<n;q++){const px=x+q*dx,py=y+q*dy+Math.sin(q*1.7+seed)*3;pebble(px,py,1.7+(q%3),q+seed);}};
  const grassClump=(x,y,seed=0)=>{if(!visible(x,y,cx,cy))return;ctx.save();ctx.strokeStyle=['#617b45','#829052','#9a9a5b'][seed%3];ctx.lineWidth=1.4;for(let q=0;q<7;q++){const a=(q-3)*.24;ctx.beginPath();ctx.moveTo(x,y+3);ctx.quadraticCurveTo(x+Math.sin(a)*5,y-3,x+Math.sin(a)*11,y-8-(q%3)*2);ctx.stroke();}ctx.restore();};
  const pavingChip=(x,y,seed=0)=>{if(!visible(x,y,cx,cy))return;ctx.save();ctx.fillStyle=['#827b6d','#918876','#6e6a60'][seed%3];ctx.beginPath();ctx.moveTo(x-5,y-1);ctx.lineTo(x-2,y-4);ctx.lineTo(x+4,y-3);ctx.lineTo(x+6,y);ctx.lineTo(x+2,y+3);ctx.lineTo(x-4,y+2);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(225,213,189,.24)';ctx.lineWidth=.8;ctx.stroke();ctx.restore();};
  const rootRidge=(x,y,seed=0)=>{if(!visible(x,y,cx,cy))return;ctx.save();ctx.strokeStyle='#493a2b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-13,y+3);ctx.quadraticCurveTo(x-2,y-7+seed%4,x+4,y+1);ctx.quadraticCurveTo(x+10,y+6,x+17,y-3);ctx.stroke();ctx.strokeStyle='rgba(160,128,83,.48)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-10,y+2);ctx.quadraticCurveTo(x,y-4,x+5,y+2);ctx.stroke();ctx.restore();};
  const oreShard=(x,y,seed=0)=>{if(!visible(x,y,cx,cy))return;ctx.save();ctx.fillStyle=['#657c7c','#8b7654','#6f7181'][seed%3];ctx.beginPath();ctx.moveTo(x-5,y+2);ctx.lineTo(x-2,y-8);ctx.lineTo(x+2,y-12);ctx.lineTo(x+6,y-2);ctx.lineTo(x+3,y+4);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(226,219,194,.55)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+2,y-12);ctx.lineTo(x+1,y+2);ctx.stroke();ctx.restore();};
  const cropBundle=(x,y,seed=0)=>{if(!visible(x,y,cx,cy))return;ctx.save();ctx.strokeStyle='#b89a4d';ctx.lineWidth=2;for(let q=-2;q<=2;q++){ctx.beginPath();ctx.moveTo(x+q*2,y+3);ctx.lineTo(x+q*3,y-9-Math.abs(q));ctx.stroke();}ctx.strokeStyle='#7a6337';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-6,y-1);ctx.lineTo(x+6,y+1);ctx.stroke();ctx.restore();};
  // Ash City — worn paving seams, drain grates, chipped curb stones and courtyard herbs.
  for(let row=0;row<8;row++){for(let col=0;col<17;col++){const x=885+col*69+(row%2)*7,y=690+row*34;pavingChip(x,y,row+col);if((row*17+col)%4===0)grassClump(x+13,y-2,row+col);if((row*17+col)%7===0)leafLitter(x-9,y+4,row+col);}}
  for(let i=0;i<18;i++){const x=1030+(i%6)*176,y=1015+Math.floor(i/6)*92;if(visible(x,y,cx,cy)){ctx.save();ctx.strokeStyle='#4c4940';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-8,y-3);ctx.lineTo(x+8,y-3);ctx.lineTo(x+8,y+3);ctx.lineTo(x-8,y+3);ctx.closePath();for(let q=-5;q<=5;q+=5){ctx.moveTo(x+q,y-2);ctx.lineTo(x+q,y+2);}ctx.stroke();ctx.restore();}}
  for(let i=0;i<24;i++){const x=940+(i%8)*142,y=1390+Math.floor(i/8)*31;flowerPatch(x,y,i+11);if(i%3===0)pebbleLine(x-8,y+7,4,5,1,i);}
  // Keshtezar — furrows, harvested sheaves, irrigation-bank reeds and orchard litter.
  for(let row=0;row<12;row++){const x=250+row*51;for(let j=0;j<17;j++){const y=760+j*27+(row%2)*4;if(!visible(x,y,cx,cy))continue;if(j%3===0)grassClump(x+5,y,row+j);if(j%6===0)cropBundle(x-7,y+3,row);if(j%5===0)pebbleLine(x+12,y+5,3,4,1,row+j);}}
  for(let i=0;i<22;i++){const x=320+(i%11)*54,y=1280+Math.floor(i/11)*47;reed(x,y,i);if(i%2===0)flowerPatch(x+10,y+4,i+3);}
  for(let i=0;i<16;i++){const x=395+(i%8)*68,y=1430+Math.floor(i/8)*38;cropBundle(x,y,i);leafLitter(x+12,y+4,i);}
  // Rootwood — layered roots, fern clusters, bark scars, leaf piles and forest fungi.
  for(let i=0;i<72;i++){const x=2010+(i%12)*63+(Math.floor(i/12)%2)*12,y=1640+Math.floor(i/12)*48;rootRidge(x,y,i);if(i%2===0)grassClump(x+14,y-2,i);if(i%4===0)mushroom(x-9,y+4,.55+(i%3)*.12);if(i%5===0)leafLitter(x+5,y+8,i);}
  for(let i=0;i<28;i++){const x=2110+(i%7)*98,y=1850+Math.floor(i/7)*56;log(x,y,20+(i%4)*5);rootRidge(x+13,y+2,i);if(i%2===0)flowerPatch(x-9,y-7,i+6);}
  // Sang-Ahan — fractured shale, exposed mineral seams, scree fans and hardy alpine grass.
  for(let row=0;row<10;row++){for(let col=0;col<13;col++){const x=1340+col*63+(row%2)*9,y=2380+row*43;pebble(x,y,2+(col%3),row+col);if((row*13+col)%4===0)oreShard(x+8,y-3,row+col);if((row*13+col)%3===0)grassClump(x-7,y+4,row+col);}}
  for(let i=0;i<25;i++){const x=1440+(i%5)*132,y=2860+Math.floor(i/5)*34;rock(x,y,8+(i%4)*3,i%2);oreShard(x+12,y-3,i);pebbleLine(x-14,y+6,5,6,1,i);}

}
