import { drawSeasonalPropCapV2159 } from '../world/seasonal-world-v2159.js?v=2159';
// V2099: individually cropped authored environment sprites, rendered as a decorative-only layer.
// Anchors are world-space ground points; no collision, navigation, POI, encounter or save data is touched.
const ROOT = './assets/safe-zone/props-v2099/';
const SPRITES = {
  trees: Array.from({length:8},(_,i)=>`trees_${String(i+1).padStart(2,'0')}.png`),
  vegetation: Array.from({length:10},(_,i)=>`vegetation_${String(i+1).padStart(2,'0')}.png`),
  rocks_ore: Array.from({length:10},(_,i)=>`rocks_ore_${String(i+1).padStart(2,'0')}.png`),
  mushrooms_crystals: Array.from({length:10},(_,i)=>`mushrooms_crystals_${String(i+1).padStart(2,'0')}.png`),
  gothic_props: Array.from({length:10},(_,i)=>`gothic_props_${String(i+1).padStart(2,'0')}.png`),
  farm_props: Array.from({length:10},(_,i)=>`farm_props_${String(i+1).padStart(2,'0')}.png`),
  mine_props: Array.from({length:10},(_,i)=>`mine_props_${String(i+1).padStart(2,'0')}.png`),
  fences_walls: Array.from({length:10},(_,i)=>`fences_walls_${String(i+1).padStart(2,'0')}.png`)
};
const CACHE = new Map();
function imageFor(file){let img=CACHE.get(file);if(!img&&typeof Image!=='undefined'){img=new Image();img.src=ROOT+file;CACHE.set(file,img);}return img;}
const P = (group,index,x,y,w,scale=1)=>({file:SPRITES[group][index-1],x,y,w,scale});
const SETTLEMENTS = [
 {id:'ashen_city',cx:1500,cy:1050,rx:720,ry:610,items:[
  P('gothic_props',1,1000,720,52,.72),P('gothic_props',2,1990,740,55,.72),P('gothic_props',3,1030,1370,52,.72),P('gothic_props',4,1980,1370,54,.72),P('gothic_props',5,1170,590,66,.70),P('gothic_props',6,1810,590,66,.70),P('gothic_props',7,1180,1510,62,.68),P('gothic_props',8,1820,1510,62,.68),P('trees',4,900,1080,110,.62),P('trees',7,2100,1080,108,.62)]},
 {id:'farmland',cx:490,cy:800,rx:480,ry:465,items:[
  P('trees',1,150,470,104,.58),P('trees',3,820,470,102,.58),P('vegetation',1,220,1080,70,.66),P('vegetation',4,730,1080,70,.66),P('farm_props',1,350,420,78,.72),P('farm_props',2,640,430,66,.72),P('farm_props',3,170,930,78,.72),P('farm_props',4,800,930,78,.72),P('fences_walls',1,300,1180,100,.72),P('fences_walls',5,690,1180,100,.72)]},
 {id:'rootwood',cx:2480,cy:900,rx:520,ry:455,items:[
  P('trees',5,2040,600,126,.66),P('trees',6,2890,610,126,.66),P('trees',8,2050,1190,112,.62),P('vegetation',5,2260,500,72,.68),P('vegetation',7,2700,500,72,.68),P('vegetation',8,2220,1240,70,.68),P('mushrooms_crystals',1,2390,520,66,.70),P('mushrooms_crystals',3,2580,520,70,.70),P('mushrooms_crystals',6,2390,1260,72,.68),P('mushrooms_crystals',8,2700,1210,72,.68)]},
 {id:'ironstone',cx:1900,cy:2140,rx:510,ry:430,items:[
  P('rocks_ore',1,1480,1840,92,.70),P('rocks_ore',2,2300,1840,92,.70),P('rocks_ore',5,1510,2440,88,.70),P('rocks_ore',7,2280,2440,88,.70),P('mine_props',1,1700,1770,90,.70),P('mine_props',2,2100,1770,110,.70),P('mine_props',4,1700,2500,90,.70),P('mine_props',6,2110,2500,108,.70),P('fences_walls',2,1500,2160,100,.68),P('fences_walls',7,2310,2160,100,.68)]}
 ];
// V2106: dense authored micro-dressing. Existing settlement art is preserved;
// these additional independent sprites enrich paths, thresholds and quiet corners.
const MICRO_DRESSING_V2106 = {
  ashen_city: [
    ['gothic_props',9,1110,880,34,.54],['gothic_props',10,1880,900,36,.52],
    ['vegetation',2,930,930,30,.48],['vegetation',6,2070,930,32,.48],
    ['fences_walls',3,1240,680,62,.48],['fences_walls',4,1760,680,62,.48],
    ['gothic_props',1,1330,1180,32,.46],['gothic_props',2,1660,1180,32,.46],
    ['vegetation',3,1110,1240,28,.44],['vegetation',9,1900,1240,28,.44],
    ['gothic_props',7,1370,1450,34,.48],['gothic_props',8,1620,1450,34,.48],
    ['fences_walls',6,990,1110,52,.42],['fences_walls',8,2010,1110,52,.42],
    ['vegetation',5,1460,720,26,.42],['vegetation',7,1540,720,26,.42]
  ],
  farmland: [
    ['farm_props',5,260,600,48,.56],['farm_props',6,720,600,48,.56],
    ['farm_props',7,250,760,44,.52],['farm_props',8,720,760,44,.52],
    ['farm_props',9,420,1080,48,.52],['farm_props',10,570,1080,48,.52],
    ['vegetation',2,120,650,34,.52],['vegetation',3,850,650,34,.52],
    ['vegetation',6,130,850,32,.50],['vegetation',9,850,850,32,.50],
    ['fences_walls',3,230,510,66,.50],['fences_walls',4,760,510,66,.50],
    ['fences_walls',6,230,1010,62,.48],['fences_walls',8,760,1010,62,.48],
    ['trees',2,410,390,70,.42],['trees',4,570,390,70,.42]
  ],
  rootwood: [
    ['trees',1,2160,760,78,.48],['trees',2,2780,760,78,.48],
    ['vegetation',1,2140,930,34,.52],['vegetation',2,2800,930,34,.52],
    ['vegetation',3,2180,1100,32,.50],['vegetation',9,2760,1100,32,.50],
    ['mushrooms_crystals',2,2310,680,38,.50],['mushrooms_crystals',4,2660,680,38,.50],
    ['mushrooms_crystals',5,2300,1160,40,.50],['mushrooms_crystals',9,2660,1160,40,.50],
    ['fences_walls',3,2220,850,62,.46],['fences_walls',4,2720,850,62,.46],
    ['gothic_props',9,2400,1020,34,.46],['gothic_props',10,2540,1020,34,.46],
    ['trees',3,2380,1370,64,.42],['trees',7,2580,1370,64,.42]
  ],
  ironstone: [
    ['rocks_ore',3,1600,1960,50,.54],['rocks_ore',4,2180,1960,50,.54],
    ['rocks_ore',6,1600,2320,48,.52],['rocks_ore',8,2180,2320,48,.52],
    ['rocks_ore',9,1810,1810,44,.48],['rocks_ore',10,1980,1810,44,.48],
    ['mine_props',3,1580,2110,54,.52],['mine_props',5,2200,2110,54,.52],
    ['mine_props',7,1680,2380,52,.50],['mine_props',8,2100,2380,52,.50],
    ['fences_walls',3,1740,1900,62,.46],['fences_walls',4,2040,1900,62,.46],
    ['gothic_props',9,1810,2540,34,.46],['gothic_props',10,1970,2540,34,.46],
    ['vegetation',2,1510,2250,28,.42],['vegetation',8,2270,2250,28,.42]
  ]
};
for (const region of SETTLEMENTS) {
  const extras = MICRO_DRESSING_V2106[region.id] || [];
  for (const [group,index,x,y,w,scale] of extras) region.items.push(P(group,index,x,y,w,scale));
}
export function drawEnvironmentPropsV2099(ctx,camX,camY,season='summer'){
 if(!ctx||typeof ctx.drawImage!=='function')return;
 const left=camX-260,right=camX+980,top=camY-220,bottom=camY+900;
 const visible=[];
 for(const region of SETTLEMENTS) for(const p of region.items){
  if(p.x<left-180||p.x>right+180||p.y<top-220||p.y>bottom+220)continue;
  visible.push(p);
 }
 // Painter's order: objects farther north first; nearer ground anchors are painted last.
 visible.sort((a,b)=>(a.x+a.y)-(b.x+b.y) || a.y-b.y || a.x-b.x);
 for(const p of visible){
  const img=imageFor(p.file);if(!img||!img.complete||!img.naturalWidth)continue;
  const w=p.w*p.scale, h=(img.naturalHeight/img.naturalWidth)*w;
  ctx.drawImage(img,p.x-w/2,p.y-h,w,h);
  drawSeasonalPropCapV2159(ctx,p.x,p.y,w,h,season,p.file+':'+p.x+':'+p.y);
 }
}

// V2127: foreground half of the same sprite catalogue. Only objects that are
// nearer on the 2:1 isometric depth axis (x+y) and overlap the player are drawn
// again after actors, so trunks, rocks, fences and clutter can correctly occlude.
export function drawForegroundEnvironmentPropsV2127(ctx,playerX,playerY,season='summer'){
 if(!ctx||typeof ctx.drawImage!=='function')return;
 const playerDepth=Number(playerX)+Number(playerY), visible=[];
 for(const region of SETTLEMENTS)for(const p of region.items){
  const depth=Number(p.x)+Number(p.y);
  if(depth<=playerDepth)continue;
  const img=imageFor(p.file);if(!img||!img.complete||!img.naturalWidth)continue;
  const w=p.w*p.scale,h=(img.naturalHeight/img.naturalWidth)*w;
  const dx=Number(playerX)-p.x,dy=Number(playerY)-(p.y-h/2);
  const screenX=.72*(dx-dy),screenY=.36*(dx+dy);
  if(Math.abs(screenX)>w*.5+24||Math.abs(screenY)>h*.5+36)continue;
  visible.push({p,img,w,h,depth});
 }
 visible.sort((a,b)=>a.depth-b.depth);
 for(const item of visible){const {p,img,w,h}=item;ctx.drawImage(img,p.x-w/2,p.y-h,w,h);drawSeasonalPropCapV2159(ctx,p.x,p.y,w,h,season,p.file+':'+p.x+':'+p.y);}
}

export const ENVIRONMENT_PROPS_V2099={regions:SETTLEMENTS.map(r=>({id:r.id,spriteCount:r.items.length})),spriteGroups:Object.keys(SPRITES)};
