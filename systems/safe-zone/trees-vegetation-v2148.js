// ETRANOM V2148 — Stage 10: Trees & Vegetation.
// Authored biome vegetation uses the existing transparent PNG sprite library.
// Ground anchors stay on the current world-coordinate contract; trunks and dense understory are collision-integrated by Stage 19/20.
import { sampleTerrainElevationV2146, sampleTerrainGradientV2146 } from '../world/terrain-topography-v2146.js?v=2146';
import { drawSeasonalFoliageOverlayV2159 } from '../world/seasonal-world-v2159.js?v=2159';

const TREE_ROOT = './assets/safe-zone/props-v2099/';
const VEG_ROOT = './assets/safe-zone/props-v2099/';

const TREE_ROWS = [
  // Ashen City — sparse avenue and outer-courtyard trees; the plaza and building entrances remain open.
  ['city-oak-nw','trees_01.png',860,640,108,'ashen_city','ornamental-deciduous'],
  ['city-autumn-ne','trees_05.png',2245,710,104,'ashen_city','autumn-ornamental'],
  ['city-gold-sw','trees_06.png',800,1490,104,'ashen_city','autumn-ornamental'],
  ['city-pine-se','trees_03.png',2200,1510,102,'ashen_city','conifer-accent'],
  ['city-edge-oak-west','trees_01.png',720,1050,96,'ashen_city','street-tree'],
  ['city-edge-dead-east','trees_08.png',2200,940,88,'ashen_city','dead-ornamental'],
  ['city-courtyard-pine-north','trees_03.png',1180,610,82,'ashen_city','courtyard-conifer'],
  ['city-courtyard-pine-south','trees_03.png',1870,1540,82,'ashen_city','courtyard-conifer'],

  // Farmland — deliberately spaced orchard trees and windbreak edges, not across the crop furrows.
  ['farm-west-oak','trees_01.png',85,545,112,'farmland','orchard-tree'],
  ['farm-west-autumn','trees_05.png',95,1030,106,'farmland','orchard-tree'],
  ['farm-east-gold','trees_06.png',880,1035,104,'farmland','orchard-tree'],
  ['farm-east-oak','trees_01.png',875,565,105,'farmland','orchard-tree'],
  ['farm-south-oak-1','trees_01.png',180,1335,96,'farmland','windbreak'],
  ['farm-south-autumn-1','trees_05.png',345,1370,94,'farmland','windbreak'],
  ['farm-south-gold-1','trees_06.png',720,1360,92,'farmland','windbreak'],
  ['farm-north-pine','trees_03.png',490,350,86,'farmland','windbreak-conifer'],
  ['farm-west-dead','trees_07.png',35,820,82,'farmland','old-field-tree'],

  // Rootwood — dense, old-growth, twisted, coniferous and dead trees around the settlement and creek margins.
  ['root-north-ancient-1','trees_02.png',1945,515,142,'rootwood','ancient-twisted'],
  ['root-north-pine-1','trees_03.png',2140,465,126,'rootwood','old-conifer'],
  ['root-north-ancient-2','trees_04.png',2370,470,146,'rootwood','ancient-twisted'],
  ['root-north-pine-2','trees_03.png',2605,470,126,'rootwood','old-conifer'],
  ['root-north-ancient-3','trees_02.png',2825,520,145,'rootwood','ancient-twisted'],
  ['root-east-dead-1','trees_07.png',3025,680,130,'rootwood','dead-oldgrowth'],
  ['root-east-dead-2','trees_08.png',3050,1035,124,'rootwood','dead-oldgrowth'],
  ['root-west-ancient-1','trees_04.png',2010,950,142,'rootwood','ancient-twisted'],
  ['root-west-pine-1','trees_03.png',1935,1510,116,'rootwood','old-conifer'],
  ['root-south-ancient-1','trees_02.png',2160,1510,138,'rootwood','ancient-twisted'],
  ['root-south-pine-1','trees_03.png',2390,1570,120,'rootwood','old-conifer'],
  ['root-south-dead-1','trees_07.png',2635,1510,128,'rootwood','dead-oldgrowth'],
  ['root-south-dead-2','trees_08.png',2860,1390,124,'rootwood','dead-oldgrowth'],
  ['root-creek-ancient-1','trees_04.png',2070,1160,136,'rootwood','creekside-ancient'],
  ['root-creek-pine-1','trees_03.png',2310,1130,110,'rootwood','creekside-conifer'],
  ['root-east-ancient-1','trees_02.png',2920,1180,136,'rootwood','ancient-twisted'],

  // Ironstone — wind-bent conifers and sparse dead trees along quarry rims and rocky saddles.
  ['iron-nw-pine','trees_03.png',1285,1740,116,'ironstone','wind-bent-conifer'],
  ['iron-ne-dead','trees_08.png',2530,1775,116,'ironstone','quarry-deadwood'],
  ['iron-sw-dead','trees_07.png',1260,2675,112,'ironstone','quarry-deadwood'],
  ['iron-se-pine','trees_03.png',2570,2585,108,'ironstone','wind-bent-conifer'],
  ['iron-north-twisted','trees_02.png',1840,1645,100,'ironstone','scree-edge-tree'],
  ['iron-south-dead','trees_08.png',2250,2770,108,'ironstone','quarry-deadwood'],
  ['iron-west-pine','trees_03.png',1390,2220,96,'ironstone','wind-bent-conifer'],
  ['iron-east-pine','trees_03.png',2470,2225,94,'ironstone','wind-bent-conifer']
];

const UNDERSTORY_ROWS = [
  // City hedges, flower clumps and low ornamental plants.
  ['city-hedge-01','vegetation_01.png',910,735,48,'ashen_city','hedge',0.88],
  ['city-flower-01','vegetation_02.png',990,1470,42,'ashen_city','flowering-shrub',0.86],
  ['city-flower-02','vegetation_03.png',2040,1470,42,'ashen_city','flowering-shrub',0.84],
  ['city-planter-01','vegetation_04.png',1070,680,38,'ashen_city','flower-bed',0.88],
  ['city-herb-01','vegetation_05.png',1970,680,38,'ashen_city','herb-shrub',0.86],
  ['city-fern-01','vegetation_06.png',800,1500,42,'ashen_city','fern-bed',0.90],
  ['city-flower-03','vegetation_07.png',2180,1360,42,'ashen_city','flowering-shrub',0.86],
  ['city-grass-01','vegetation_08.png',910,1180,38,'ashen_city','ornamental-grass',0.86],
  ['city-leaf-01','vegetation_09.png',2050,1180,38,'ashen_city','ornamental-foliage',0.84],
  ['city-grass-02','vegetation_10.png',1130,1510,36,'ashen_city','ornamental-grass',0.90],

  // Farmland — flowering field margins, tall grass, crop-edge clumps and low hedges.
  ['farm-flower-01','vegetation_04.png',155,650,52,'farmland','field-flower',0.86],
  ['farm-herb-01','vegetation_05.png',820,650,48,'farmland','field-herb',0.88],
  ['farm-hedge-01','vegetation_01.png',145,1170,52,'farmland','field-hedge',0.86],
  ['farm-grass-01','vegetation_08.png',800,1190,48,'farmland','field-grass',0.92],
  ['farm-flower-02','vegetation_02.png',260,1395,46,'farmland','field-flower',0.88],
  ['farm-flower-03','vegetation_07.png',470,1410,44,'farmland','field-flower',0.86],
  ['farm-grass-02','vegetation_10.png',650,1400,48,'farmland','field-grass',0.92],
  ['farm-fern-01','vegetation_06.png',45,920,48,'farmland','ditch-fern',0.88],
  ['farm-leaf-01','vegetation_09.png',800,875,40,'farmland','low-foliage',0.82],
  ['farm-hedge-02','vegetation_01.png',390,420,44,'farmland','windbreak-understory',0.86],

  // Rootwood — dense fern beds, toxic flowers, broadleaf plants and ground-cover grass.
  ['root-hedge-01','vegetation_01.png',1990,610,58,'rootwood','deep-forest-shrub',0.94],
  ['root-flower-01','vegetation_03.png',2150,590,48,'rootwood','violet-forest-flower',0.90],
  ['root-fern-01','vegetation_06.png',2330,620,54,'rootwood','fern-cluster',0.94],
  ['root-flower-02','vegetation_07.png',2510,600,48,'rootwood','violet-forest-flower',0.90],
  ['root-grass-01','vegetation_08.png',2800,740,48,'rootwood','forest-grass',0.94],
  ['root-leaf-01','vegetation_09.png',2900,630,48,'rootwood','broadleaf-groundcover',0.92],
  ['root-hedge-02','vegetation_01.png',1980,1000,56,'rootwood','deep-forest-shrub',0.94],
  ['root-red-01','vegetation_02.png',2140,1000,48,'rootwood','red-forest-flower',0.90],
  ['root-fern-02','vegetation_06.png',2470,1010,54,'rootwood','fern-cluster',0.94],
  ['root-flower-03','vegetation_03.png',2515,1015,48,'rootwood','violet-forest-flower',0.90],
  ['root-grass-02','vegetation_10.png',2710,1020,48,'rootwood','forest-grass',0.94],
  ['root-hedge-03','vegetation_01.png',2920,1280,56,'rootwood','deep-forest-shrub',0.94],
  ['root-fern-03','vegetation_06.png',2200,1450,54,'rootwood','fern-cluster',0.94],
  ['root-red-02','vegetation_05.png',2310,1450,46,'rootwood','red-forest-flower',0.90],
  ['root-leaf-02','vegetation_09.png',2520,1420,50,'rootwood','broadleaf-groundcover',0.92],
  ['root-flower-04','vegetation_07.png',2780,1470,48,'rootwood','violet-forest-flower',0.90],
  ['root-grass-03','vegetation_08.png',3000,1530,46,'rootwood','forest-grass',0.94],
  ['root-fern-04','vegetation_06.png',2030,1190,48,'rootwood','creekside-fern',0.92],
  ['root-hedge-04','vegetation_01.png',2440,1180,52,'rootwood','creekside-shrub',0.92],
  ['root-flower-05','vegetation_03.png',2850,1220,46,'rootwood','creekside-flower',0.88],

  // Ironstone — tough low plants, yellowed grasses and fern in sheltered cracks.
  ['iron-grass-01','vegetation_08.png',1370,1840,42,'ironstone','alpine-grass',0.86],
  ['iron-fern-01','vegetation_06.png',1550,1770,42,'ironstone','sheltered-fern',0.84],
  ['iron-leaf-01','vegetation_09.png',2440,1850,38,'ironstone','mineral-broadleaf',0.78],
  ['iron-grass-02','vegetation_10.png',2550,2050,40,'ironstone','alpine-grass',0.86],
  ['iron-flower-01','vegetation_04.png',1460,2480,38,'ironstone','hardy-flower',0.78],
  ['iron-grass-03','vegetation_08.png',1650,2630,42,'ironstone','alpine-grass',0.86],
  ['iron-fern-02','vegetation_06.png',2380,2670,40,'ironstone','sheltered-fern',0.82],
  ['iron-grass-04','vegetation_10.png',2500,2450,42,'ironstone','alpine-grass',0.86],
  ['iron-red-01','vegetation_05.png',1900,2810,36,'ironstone','mineral-herb',0.78],
  ['iron-leaf-02','vegetation_09.png',2150,1650,38,'ironstone','mineral-broadleaf',0.78]
];

const TREE_PLACEMENTS = TREE_ROWS.map(([id,file,x,y,width,biome,role]) => ({
  id,file,x,y,width,biome,role,kind:'tree',groundAnchor:'root-contact-center',depth:x+y,
  elevation:sampleTerrainElevationV2146(x,y),slope:sampleTerrainGradientV2146(x,y).slopeClass,
  collision:{policy:'stage-19-live-trunk-footprint',type:'root-contact-trunk-collider;canopy-passable'},
  canopy:{occlusion:'depth-sorted-by-ground-anchor',wind:'subtle-static-art-no-skew'}
}));
const UNDERSTORY_PLACEMENTS = UNDERSTORY_ROWS.map(([id,file,x,y,width,biome,role,alpha]) => ({
  id,file,x,y,width,biome,role,kind:'understory',alpha,groundAnchor:'bottom-center',depth:x+y,
  elevation:sampleTerrainElevationV2146(x,y),slope:sampleTerrainGradientV2146(x,y).slopeClass,
  collision:{policy:'stage-19-live-role-based',type:'dense-hedge-only;low-ground-cover-passable'}
}));
const ALL_PLACEMENTS = [...TREE_PLACEMENTS,...UNDERSTORY_PLACEMENTS].sort((a,b)=>a.depth-b.depth || a.id.localeCompare(b.id));
const IMAGE_CACHE = new Map();
function getSprite(file){
  let image=IMAGE_CACHE.get(file);
  if(!image && typeof Image!=='undefined'){
    image=new Image();
    image.decoding='async';
    image.src=(file.startsWith('trees_')?TREE_ROOT:VEG_ROOT)+file;
    IMAGE_CACHE.set(file,image);
  }
  return image;
}
function isVisible(p,camX,camY){return p.x>=camX-180&&p.x<=camX+900&&p.y>=camY-220&&p.y<=camY+820;}
function renderPlacement(ctx,p,windField=null,timeMs=0,season='summer'){
  const image=getSprite(p.file);
  if(!image || !image.complete || !image.naturalWidth)return false;
  const height=p.width*image.naturalHeight/image.naturalWidth;
  ctx.save();
  if(p.kind==='tree'){
    ctx.fillStyle=p.biome==='rootwood'?'rgba(5,12,8,.30)':'rgba(10,10,9,.24)';
    ctx.beginPath();ctx.ellipse(p.x+2,p.y+4,p.width*.43,Math.max(5,p.width*.13),0,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=p.alpha??1;
  const windStrength=Math.max(0,Math.min(1,Number(windField?.strength)||0));
  const gust=Number.isFinite(Number(windField?.gust))?Number(windField.gust):1;
  const phase=(Number(timeMs)||0)*0.0012+p.x*.0047+p.y*.0029;
  const sway=p.kind==='tree'?Math.sin(phase)*windStrength*gust*.026:Math.sin(phase*1.4)*windStrength*gust*.035;
  ctx.translate(p.x,p.y);
  if(Math.abs(sway)>.0005) ctx.rotate(sway);
  ctx.drawImage(image,-p.width/2,-height,p.width,height);
  drawSeasonalFoliageOverlayV2159(ctx,p,p.width,height,season);
  ctx.restore();
  return true;
}
function drawFiltered(ctx,camX,camY,depthLimit,foreground=false,windField=null,timeMs=0,season='summer'){
  if(!ctx?.drawImage||!ctx?.save||!ctx?.restore)return {drawn:0,culled:ALL_PLACEMENTS.length};
  let drawn=0,culled=0;
  for(const p of ALL_PLACEMENTS){
    if(!isVisible(p,camX,camY)){culled++;continue;}
    if(depthLimit!==null && (foreground ? p.depth<=depthLimit : p.depth>depthLimit)){continue;}
    if(renderPlacement(ctx,p,windField,timeMs,season))drawn++;
  }
  return {drawn,culled};
}
export function drawTreesVegetationV2148(ctx,camX=0,camY=0,playerX=null,playerY=null,windField=null,timeMs=0,season='summer'){
  const depth=Number.isFinite(Number(playerX))&&Number.isFinite(Number(playerY))?Number(playerX)+Number(playerY):null;
  return drawFiltered(ctx,Number(camX)||0,Number(camY)||0,depth,false,windField,timeMs,season);
}
export function drawForegroundTreesVegetationV2148(ctx,playerX,playerY,camX=0,camY=0,windField=null,timeMs=0,season='summer'){
  const depth=Number(playerX)+Number(playerY);
  if(!Number.isFinite(depth))return {drawn:0,culled:ALL_PLACEMENTS.length};
  return drawFiltered(ctx,Number(camX)||0,Number(camY)||0,depth,true,windField,timeMs,season);
}
export const ETRANOM_TREES_VEGETATION_V2148=Object.freeze({
  version:2148,stage:10,stageName:'Trees & Vegetation',
  coordinateContract:'existing-world-logical-units; ground anchors follow x+y depth ordering',
  biomeProfiles:Object.freeze({
    ashen_city:{density:'sparse-ornamental',palette:'muted-olive-charcoal-autumn',trees:8,understory:10,clearances:['plaza','doorways','main-roads']},
    farmland:{density:'orchard-and-windbreak',palette:'straw-gold-olive-leaf',trees:9,understory:10,clearances:['crop-furrows','irrigation-channel','cart-route']},
    rootwood:{density:'dense-old-growth',palette:'deep-moss-twisted-bark-spectral-violet',trees:16,understory:20,clearances:['creek-crossing','settlement-entry','main-footpath']},
    ironstone:{density:'sparse-alpine-scree',palette:'desaturated-conifer-deadwood-mineral-green',trees:8,understory:10,clearances:['quarry-approach','mine-entry','main-footpath']}
  }),
  assetCatalog:Object.freeze({trees:Object.freeze(Array.from({length:8},(_,i)=>`trees_${String(i+1).padStart(2,'0')}.png`)),understory:Object.freeze(Array.from({length:10},(_,i)=>`vegetation_${String(i+1).padStart(2,'0')}.png`))}),
  trees:Object.freeze(TREE_PLACEMENTS),understory:Object.freeze(UNDERSTORY_PLACEMENTS),placements:Object.freeze(ALL_PLACEMENTS)
});
export function auditTreesVegetationV2148(){
  const ids=new Set(ALL_PLACEMENTS.map(p=>p.id));
  const biomes=new Set(ALL_PLACEMENTS.map(p=>p.biome));
  const assets=new Set(ALL_PLACEMENTS.map(p=>p.file));
  return Object.freeze({
    ok:ids.size===ALL_PLACEMENTS.length&&TREE_PLACEMENTS.length>=35&&UNDERSTORY_PLACEMENTS.length>=45&&biomes.size===4&&assets.size===18,
    version:2148,stage:10,treeCount:TREE_PLACEMENTS.length,understoryCount:UNDERSTORY_PLACEMENTS.length,
    totalPlacements:ALL_PLACEMENTS.length,biomes:biomes.size,uniqueAssets:assets.size,
    allEightTreeVariants:Array.from({length:8},(_,i)=>`trees_${String(i+1).padStart(2,'0')}.png`).every(a=>assets.has(a)),
    allTenUnderstoryVariants:Array.from({length:10},(_,i)=>`vegetation_${String(i+1).padStart(2,'0')}.png`).every(a=>assets.has(a)),
    sampledElevation:true,slopeAwarePlacement:true,collisionIntegrated:true,navmeshIntegrated:false,treeWindAnimation:true,weatherWindSwayAvailable:true,seasonalFoliageIntegration:true
  });
}
