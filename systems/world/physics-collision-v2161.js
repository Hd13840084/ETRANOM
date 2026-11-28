// ETRANOM V2161 — Stage 19/24: Runtime physics, collision, surface response and obstacle-aware local routing.
// Coordinate contract: legacy V2138 logical units remain canonical; V2164 authors a gameplay calibration of 40 logical units per metre (not a geodetic survey).
// Collision is additive: it preserves V2138 map bounds, V2140 geometry, V2141 building footprints,
// V2143 route intent, V2146 terrain relief, V2147/V2148 props, V2149 parked vehicles,
// V2155 door state, V2157 weather and V2159 seasonal movement presentation.
import { ETRANOM_WORLD_STRUCTURE_V2138, WORLD_DIMENSIONS_V2138, isWorldPositionInBoundsV2138 } from './world-structure-v2138.js?v=2138';
import { ETRANOM_WORLD_GEOMETRY_V2140 } from './world-geometry-v2140.js?v=2140';
import { ETRANOM_ROAD_SYSTEM_V2142 } from './road-system-v2142.js?v=2142';
import { ETRANOM_PATH_SYSTEM_V2143 } from './path-system-v2143.js?v=2143';
import { resolveBuildingDimensionsV2141, ETRANOM_BUILDING_ARCHITECTURE_V2141 } from '../safe-zone/building-architecture-v2141.js?v=2162';
import { ENVIRONMENTAL_PROPS_V2147 } from '../safe-zone/environmental-props-v2147.js?v=2162';
import { ETRANOM_TREES_VEGETATION_V2148 } from '../safe-zone/trees-vegetation-v2148.js?v=2162';
import { ETRANOM_VEHICLE_SYSTEM_V2149 } from './vehicle-system-v2149.js?v=2162';
import { ETRANOM_INTERIOR_ARCHITECTURE_V2144, getInteriorArchitectureV2144 } from '../safe-zone/interior-architecture-v2144.js?v=2144';
import { interiorObstaclesV2036 } from '../safe-zone/interior-renderer-v2036.js?v=2144';
import { ETRANOM_AUTHORED_SAFE_WORLD_PROP_PLACEMENTS_V2137 } from '../safe-zone/authored-props-v2137.js?v=2162';
import { ETRANOM_BUILDING_YARD_PLACEMENTS_V2117 } from '../safe-zone/building-yards-v2117.js?v=2162';
import { sampleTerrainElevationV2146, sampleTerrainGradientV2146, resolveTerrainSurfaceV2146 } from './terrain-topography-v2146.js?v=2146';
import { resolveBuildingGroundAnchorV2162, resolveBuildingContactFootprintV2162, isPointOnBridgeDeckV2162, ETRANOM_BRIDGE_CROSSINGS_V2162, resolvePropContactProfileV2162 } from './visual-physical-consistency-v2162.js?v=2162';
import { buildPixelContactColliderV2164 } from './asset-contact-masks-v2164.js?v=2164';
import { resolveBridgeDeckSampleV2164 } from './bridge-physics-v2164.js?v=2164';
import { getSeasonalSurfaceAtV2164 } from './seasonal-surface-physics-v2164.js?v=2164';
import { ETRANOM_WORLD_SCALE_V2164, worldUnitsToMetersV2164 } from './world-scale-v2164.js?v=2164';
import { attachContactRasterToWorldV2165, contactRasterPenetrationV2165 } from './contact-raster-v2165.js?v=2165';
import { ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167 } from './world-geometry-extensions-v2167.js?v=2167';

const CELL = 192;
const PLAYER_RADIUS = 11;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const finite = v => Number.isFinite(Number(v));
const key = (x, y) => `${x},${y}`;
const distToSegment = (x, y, ax, ay, bx, by) => {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1;
  const t = clamp(((x - ax) * dx + (y - ay) * dy) / l2, 0, 1);
  return Math.hypot(x - (ax + t * dx), y - (ay + t * dy));
};
const pointInAabb = (x, y, b, r = 0) => x >= b.minX - r && x <= b.maxX + r && y >= b.minY - r && y <= b.maxY + r;

export const ETRANOM_CITY_STREET_PROPS_V2161 = Object.freeze([
  { id:'city-bench-nw',x:1280,y:990,type:'bench',r:-.2,width:50 }, { id:'city-bench-ne',x:1715,y:990,type:'bench',r:.2,width:50 },
  { id:'city-bench-sw',x:1280,y:1140,type:'bench',r:.2,width:50 }, { id:'city-bench-se',x:1715,y:1140,type:'bench',r:-.2,width:50 },
  { id:'city-pot-nw',x:1330,y:900,type:'pot',width:22 }, { id:'city-pot-ne',x:1670,y:900,type:'pot',width:22 },
  { id:'city-pot-sw',x:1330,y:1200,type:'pot',width:22 }, { id:'city-pot-se',x:1670,y:1200,type:'pot',width:22 },
  { id:'city-lamp-west-n',x:1080,y:1010,type:'lamp',width:12 }, { id:'city-lamp-east-n',x:1920,y:1010,type:'lamp',width:12 },
  { id:'city-lamp-west-s',x:1080,y:1250,type:'lamp',width:12 }, { id:'city-lamp-east-s',x:1920,y:1250,type:'lamp',width:12 }
].map(Object.freeze));

function addCircle(list, id, x, y, radius, kind, source, extra = {}) {
  if (![x, y, radius].every(finite) || radius <= 0) return;
  list.push(Object.freeze({ id:String(id), shape:'circle', x:Number(x), y:Number(y), radius:Number(radius), kind, source, ...extra,
    bounds:Object.freeze({minX:Number(x)-radius,maxX:Number(x)+radius,minY:Number(y)-radius,maxY:Number(y)+radius}) }));
}
function addRect(list, id, x, y, halfX, halfY, kind, source, extra = {}) {
  if (![x, y, halfX, halfY].every(finite) || halfX <= 0 || halfY <= 0) return;
  const rotation=Number(extra.rotation)||0, c=Math.cos(rotation), s=Math.sin(rotation);
  const ex=Math.abs(c)*halfX+Math.abs(s)*halfY, ey=Math.abs(s)*halfX+Math.abs(c)*halfY;
  list.push(Object.freeze({ id:String(id), shape:'rect',x:Number(x),y:Number(y),halfX:Number(halfX),halfY:Number(halfY),rotation,kind,source,...extra,
    bounds:Object.freeze({minX:Number(x)-ex,maxX:Number(x)+ex,minY:Number(y)-ey,maxY:Number(y)+ey}) }));
}
function addCapsule(list,id,a,b,radius,kind,source,extra={}){
  if(!a||!b||![...a,...b,radius].every(finite)||radius<=0)return;
  list.push(Object.freeze({id:String(id),shape:'segment',ax:a[0],ay:a[1],bx:b[0],by:b[1],radius:Number(radius),kind,source,...extra,
    bounds:Object.freeze({minX:Math.min(a[0],b[0])-radius,maxX:Math.max(a[0],b[0])+radius,minY:Math.min(a[1],b[1])-radius,maxY:Math.max(a[1],b[1])+radius})}));
}
function addEllipse(list,id,x,y,rx,ry,kind,source){
  if(![x,y,rx,ry].every(finite)||rx<=0||ry<=0)return;
  list.push(Object.freeze({id,shape:'ellipse',x,y,rx,ry,kind,source,bounds:Object.freeze({minX:x-rx,maxX:x+rx,minY:y-ry,maxY:y+ry})}));
}
function addPolygon(list,id,points,kind,source,extra={}){
  if(!Array.isArray(points)||points.length<3||points.some(p=>!Array.isArray(p)||!p.slice(0,2).every(finite)))return;
  const vertices=Object.freeze(points.map(p=>Object.freeze([Number(p[0]),Number(p[1])])));
  list.push(Object.freeze({id:String(id),shape:'polygon',points:vertices,kind,source,...extra,
    bounds:Object.freeze({minX:Math.min(...vertices.map(p=>p[0])),maxX:Math.max(...vertices.map(p=>p[0])),minY:Math.min(...vertices.map(p=>p[1])),maxY:Math.max(...vertices.map(p=>p[1]))})}));
}

function buildingCollider(list, building) {
  const dims=resolveBuildingDimensionsV2141(building);
  const footprint=resolveBuildingContactFootprintV2162(building);
  const anchor=resolveBuildingGroundAnchorV2162(building);
  if(!dims||!footprint||!anchor)return false;
  const arch=ETRANOM_BUILDING_ARCHITECTURE_V2141[building.id];
  const h=Number(building.h)||120, w=Number(building.w)||170;
  // The four-point collider is now anchored exactly to the same groundY used by
  // the visible V2100 sprite/contact shadow; roof pixels never enlarge the footprint.
  addPolygon(list,`building:${building.id}:shell`,footprint.points,'building-shell','V2141-footprint+V2100-render-anchor',{
    buildingId:building.id,anchorX:anchor.x,anchorY:anchor.y,doorway:Object.freeze({
      x:Number(building.x),y:anchor.y+dims.depth*.24,halfWidth:Math.max(10,dims.length*(arch?.door?.widthRatio||.16)*.5),
      frontY:anchor.y+dims.depth*.16,depth:PLAYER_RADIUS*2.2
    }),wallThickness:dims.wallThickness,wallHeight:dims.wallHeight,roofHeight:dims.roofHeight,
    windowsBlocked:true,doorStateKey:`building:${building.id}:door`,renderAnchor:'y + 0.30h'
  });
  return true;
}

function propShouldBlock(category, asset='') {
  if (['flora','vegetation'].includes(category)) return false;
  if (/wildflower|flowers|flower_patch|mushrooms_crystals/i.test(asset)) return false;
  if (/bridge/i.test(asset)) return false; // a bridge is a walkable surface, not an obstacle.
  return true;
}
function addPropColliders(list, buildings) {
  let count=0;
  for(const p of ENVIRONMENTAL_PROPS_V2147.placements){
    if(!propShouldBlock(p.category,p.asset))continue;
    const id=`prop:${p.asset}:${p.x}:${p.y}`;
    const pixelMask=buildPixelContactColliderV2164({id,asset:p.assetPath||p.asset,x:p.x,y:p.y,width:p.width,kind:'environment-prop',source:p.category,extra:{asset:p.asset,region:p.region}});
    if(pixelMask)list.push(pixelMask);
    else {
      const profile=resolvePropContactProfileV2162(p.asset,p.category,p.width);
      if(profile.shape==='ellipse')addEllipse(list,id,p.x,p.y,profile.rx,profile.ry,'environment-prop',p.category,{asset:p.asset,region:p.region,profileStatus:profile.status});
      else if(profile.shape==='rect')addRect(list,id,p.x,p.y,profile.halfX,profile.halfY,'environment-prop',p.category,{asset:p.asset,region:p.region,profileStatus:profile.status});
      else addCircle(list,id,p.x,p.y,profile.radius,'environment-prop',p.category,{asset:p.asset,region:p.region,profileStatus:profile.status});
    }
    count++;
  }
  for(const p of ETRANOM_AUTHORED_SAFE_WORLD_PROP_PLACEMENTS_V2137){
    if(!propShouldBlock('authored',p.id))continue;
    const id=`authored-prop:${p.id}:${p.x}:${p.y}`;
    const pixelMask=buildPixelContactColliderV2164({id,asset:`props-v2137/${p.id}.png`,x:p.x,y:p.y,width:p.width,kind:'authored-prop',source:'V2137-authored-props',extra:{asset:p.id}});
    if(pixelMask)list.push(pixelMask);
    else { const profile=resolvePropContactProfileV2162(p.id,'authored',p.width);
      if(profile.shape==='ellipse')addEllipse(list,id,p.x,p.y,profile.rx,profile.ry,'authored-prop','V2137-authored-props',{asset:p.id,profileStatus:profile.status});
      else if(profile.shape==='rect')addRect(list,id,p.x,p.y,profile.halfX,profile.halfY,'authored-prop','V2137-authored-props',{asset:p.id,profileStatus:profile.status});
      else addCircle(list,id,p.x,p.y,profile.radius,'authored-prop','V2137-authored-props',{asset:p.id,profileStatus:profile.status}); }
    count++;
  }
  for(const p of ETRANOM_BUILDING_YARD_PLACEMENTS_V2117){
    const yardAsset={market:'market_stall',arena:'weapon_rack',inn:'barrels',smith:'anvil',guild:'guild_banner',alchemy:'alchemy_shelf',arcane:'alchemy_shelf',clinic:'herb_planter',guard:'weapon_rack',temple:'brazier',stable:'hay_trough',granary:'grain_cart',mill:'grain_cart',bakery:'bakery_oven',farm:'crop_bed',herbs:'herb_planter',livestock:'gate_fence',sawmill:'crates_sacks',carpenter:'bench',forestherbs:'herb_planter',hunter:'weapon_rack',apiary:'crop_bed',mine:'crates_sacks',smelter:'forge',stonecut:'anvil',miners:'barrels',cartwright:'grain_cart'}[p.kind];
    const id=p.id, pixelMask=yardAsset?buildPixelContactColliderV2164({id,asset:`yard-sprites-v2117/${yardAsset}.png`,x:p.x,y:p.y,width:p.width,kind:'building-yard-prop',source:'V2117-building-yards',extra:{buildingId:p.buildingId,asset:p.kind}}):null;
    if(pixelMask)list.push(pixelMask);
    else { const profile=resolvePropContactProfileV2162(p.kind,'yard',p.width);
      if(profile.shape==='ellipse')addEllipse(list,p.id,p.x,p.y,profile.rx,profile.ry,'building-yard-prop','V2117-building-yards',{buildingId:p.buildingId,asset:p.kind,profileStatus:profile.status});
      else if(profile.shape==='rect')addRect(list,p.id,p.x,p.y,profile.halfX,profile.halfY,'building-yard-prop','V2117-building-yards',{buildingId:p.buildingId,asset:p.kind,profileStatus:profile.status});
      else addCircle(list,p.id,p.x,p.y,profile.radius,'building-yard-prop','V2117-building-yards',{buildingId:p.buildingId,asset:p.kind,profileStatus:profile.status}); }
    count++;
  }
  // V2039 ground dressing is explicitly authored as visual-only; never fabricate physical blockers for it.
  for(const p of ETRANOM_CITY_STREET_PROPS_V2161){
    const r=p.type==='lamp'?5:p.type==='pot'?8:18;
    if(p.type==='bench')addRect(list,p.id,p.x,p.y,p.width*.5,7,'street-furniture','V2161-city-street-props',{rotation:p.r||0});
    else addCircle(list,p.id,p.x,p.y,r,'street-furniture','V2161-city-street-props',{asset:p.type});count++;
  }
  return count;
}

function buildSpatialHash(colliders,cellSize=CELL){
  const cells=new Map();
  for(const c of colliders){
    const minX=Math.floor(c.bounds.minX/cellSize),maxX=Math.floor(c.bounds.maxX/cellSize),minY=Math.floor(c.bounds.minY/cellSize),maxY=Math.floor(c.bounds.maxY/cellSize);
    for(let gx=minX;gx<=maxX;gx++)for(let gy=minY;gy<=maxY;gy++){const k=key(gx,gy);if(!cells.has(k))cells.set(k,[]);cells.get(k).push(c);}
  }
  return cells;
}
function queryColliders(world,x,y,radius=PLAYER_RADIUS){
  const minX=Math.floor((x-radius)/world.cellSize),maxX=Math.floor((x+radius)/world.cellSize),minY=Math.floor((y-radius)/world.cellSize),maxY=Math.floor((y+radius)/world.cellSize),seen=new Set(),out=[];
  for(let gx=minX;gx<=maxX;gx++)for(let gy=minY;gy<=maxY;gy++)for(const c of world.cells.get(key(gx,gy))||[]){if(!seen.has(c.id)){seen.add(c.id);out.push(c);}}
  return out;
}
function getDoorOpen(c,gameState){return !!gameState?.environmentInteractions?.entities?.[c.doorStateKey]?.doorOpen;}
function isDoorwayPassage(c,x,y,radius,gameState){
  const d=c.doorway;if(!d||!getDoorOpen(c,gameState))return false;
  return Math.abs(x-d.x)<=d.halfWidth+radius*.42 && y>=d.frontY-radius*.85 && y<=d.frontY+d.depth+radius*.35;
}
function alphaMaskContains(c, px, py) {
  const localX=(px-(c.x-c.imageWidth*.5))/c.imageWidth;
  const localY=(py-(c.y-c.contactHeight))/c.contactHeight;
  if(localX<0||localX>=1||localY<0||localY>=1)return false;
  const ix=Math.min(c.maskWidth-1,Math.max(0,Math.floor(localX*c.maskWidth)));
  const iy=Math.min(c.maskHeight-1,Math.max(0,Math.floor(localY*c.maskHeight)));
  const bit=iy*c.maskWidth+ix, bytes=c.maskBytes;
  return !!bytes && !!(bytes[bit>>3] & (1 << (7-(bit&7))));
}
function alphaMaskPenetration(c,x,y,radius){
  const r=Math.max(0,Number(radius)||0), left=c.x-c.imageWidth*.5, top=c.y-c.contactHeight;
  const pxW=c.imageWidth/c.maskWidth, pxH=c.contactHeight/c.maskHeight;
  const cx=(x-left)/pxW, cy=(y-top)/pxH, ix=Math.floor(cx), iy=Math.floor(cy);
  const insideBounds=ix>=0&&iy>=0&&ix<c.maskWidth&&iy<c.maskHeight;
  if(insideBounds&&c.maskDistanceField){
    const bit=iy*c.maskWidth+ix, occupied=!!(c.maskBytes[bit>>3]&(1<<(7-(bit&7))));
    const distancePixels=c.maskDistanceField[bit]*(c.maskDistanceUnit||1/3);
    const distanceWorld=distancePixels*Math.min(pxW,pxH);
    return occupied ? r+distanceWorld : r-distanceWorld;
  }
  // Very near image edges the actor center may be outside the raster. Keep a bounded
  // fallback search so edge-overlap remains correct without penalizing normal frames.
  const fallbackBit=iy*c.maskWidth+ix;
  const centerInside=!!(insideBounds&&c.maskBytes&&(c.maskBytes[fallbackBit>>3]&(1<<(7-(fallbackBit&7)))));
  const worldPerPixel=Math.min(pxW,pxH), maxRadius=Math.ceil(r/worldPerPixel)+3;
  let best=Infinity;
  for(let ring=0;ring<=maxRadius;ring++){
    const minY=Math.max(0,iy-ring),maxY=Math.min(c.maskHeight-1,iy+ring),minX=Math.max(0,ix-ring),maxX=Math.min(c.maskWidth-1,ix+ring);
    for(let py=minY;py<=maxY;py++)for(let px=minX;px<=maxX;px++){
      if(ring>0&&Math.abs(px-ix)!==ring&&Math.abs(py-iy)!==ring)continue;
      const bit=py*c.maskWidth+px,occupied=!!(c.maskBytes[bit>>3]&(1<<(7-(bit&7))));
      if(occupied===centerInside)continue;
      const dx=(px+.5-cx)*pxW,dy=(py+.5-cy)*pxH,d=Math.hypot(dx,dy);
      if(d<best)best=d;
    }
    if(best<Infinity&&best<=((ring+1)*worldPerPixel*1.5))break;
  }
  if(best===Infinity)return centerInside?r+maxRadius*worldPerPixel:-Infinity;
  return centerInside ? r+best : r-best;
}
function alphaMaskOverlap(c,x,y,radius){return alphaMaskPenetration(c,x,y,radius)>0.001;}
function dynamicVehicleCollider(vehicle,placement){
  const halfX=Math.max(6,Number(placement.length||120)*.42),halfY=Math.max(6,Number(placement.width||100)*.42),a=Number(vehicle.heading)||0,c=Math.cos(a),s=Math.sin(a),ex=Math.abs(c)*halfX+Math.abs(s)*halfY,ey=Math.abs(s)*halfX+Math.abs(c)*halfY;
  return {shape:'rect',x:vehicle.x,y:vehicle.y,halfX,halfY,rotation:a,bounds:{minX:vehicle.x-ex,maxX:vehicle.x+ex,minY:vehicle.y-ey,maxY:vehicle.y+ey}};
}
function shouldSkipStaticVehicle(c,gameState,ignoreVehicleId){return !!c.vehicleId&&(c.vehicleId===ignoreVehicleId||!!gameState?.vehicleRuntime?.vehicles?.[c.vehicleId]);}
function colliderPenetration(c,x,y,radius,gameState){
  if((c.shape==='rect'||c.shape==='polygon')&&isDoorwayPassage(c,x,y,radius,gameState))return -Infinity;
  if(c.shape==='alpha-mask')return alphaMaskPenetration(c,x,y,radius);
  if(c.contactRaster){const rasterHit=contactRasterPenetrationV2165(c,x,y,radius);if(rasterHit!==null)return rasterHit;}
  if(c.shape==='circle')return c.radius+radius-Math.hypot(x-c.x,y-c.y);
  if(c.shape==='rect'){
    const a=c.rotation||0,dx=x-c.x,dy=y-c.y,rx=Math.cos(a)*dx+Math.sin(a)*dy,ry=-Math.sin(a)*dx+Math.cos(a)*dy;
    const px=c.halfX+radius-Math.abs(rx),py=c.halfY+radius-Math.abs(ry);
    return px>0&&py>0?Math.min(px,py):-Math.min(Math.max(-px,0),Math.max(-py,0));
  }
  if(c.shape==='segment')return c.radius+radius-distToSegment(x,y,c.ax,c.ay,c.bx,c.by);
  if(c.shape==='ellipse'){
    const nx=(x-c.x)/(c.rx+radius),ny=(y-c.y)/(c.ry+radius);
    return 1-Math.hypot(nx,ny);
  }
  if(c.shape==='polygon'){
    const pts=c.points;let inside=false,minDistance=Infinity;
    for(let i=0,j=pts.length-1;i<pts.length;j=i++){
      const [xi,yi]=pts[i],[xj,yj]=pts[j];
      if(((yi>y)!==(yj>y))&&(x<((xj-xi)*(y-yi))/((yj-yi)||1e-12)+xi))inside=!inside;
      minDistance=Math.min(minDistance,distToSegment(x,y,xj,yj,xi,yi));
    }
    return inside ? radius+minDistance : radius-minDistance;
  }
  return -Infinity;
}
function terrainBlocked(x,y){
  const grade=sampleTerrainGradientV2146(x,y);
  return grade.walkable===false||grade.slopeClass==='cliff';
}

export function buildWorldPhysicsWorldV2161({buildings=[],npcs=[],landmarks=[]}={}){
  const colliders=[];let buildingCount=0,treeCount=0,vehicleCount=0,waterCount=0,landmarkCount=0,barrierSegmentCount=0;
  for(const b of buildings)if(buildingCollider(colliders,b))buildingCount++;
  for(const tree of ETRANOM_TREES_VEGETATION_V2148.trees){
    const id=`tree-trunk:${tree.id}`;
    const pixelMask=buildPixelContactColliderV2164({id,asset:`props-v2099/${tree.file}`,x:tree.x,y:tree.y,width:tree.width,kind:'tree-trunk',source:'V2148-tree-placement',extra:{asset:tree.file,biome:tree.biome,role:tree.role,contactSlice:'native-alpha-lower-30-percent-root-zone'}});
    if(pixelMask)colliders.push(pixelMask);
    else addCircle(colliders,id,tree.x,tree.y,Math.max(7,Number(tree.width||tree.size||80)*.085),'tree-trunk','V2148-tree-placement',{asset:tree.file,biome:tree.biome,role:tree.role,profileStatus:'trunk-circle-fallback'});
    treeCount++;
  }
  for(const under of ETRANOM_TREES_VEGETATION_V2148.understory){
    const role=String(under.role||'');
    if(!/(hedge|deep-forest-shrub|field-hedge|shrub|windbreak-understory|creekside-shrub)/i.test(role))continue;
    addCircle(colliders,`understory:${under.id}`,under.x,under.y,Math.max(8,Number(under.width||under.size||44)*.22),'dense-understory','V2148-understory',{role,biome:under.biome});
  }
  addPropColliders(colliders,buildings);
  for(const v of ETRANOM_VEHICLE_SYSTEM_V2149.placements){
    if(v.terrainClass==='water'||v.vehicleClass==='cargo-boat'){
      // A moored boat blocks its hull and immediate berth; the creek itself is independently blocked.
      addRect(colliders,`vehicle:${v.id}`,v.x,v.y,Number(v.length||150)*.5,Number(v.width||120)*.5,'parked-vehicle','V2149-vehicle-footprint',{rotation:Number(v.rotation)||0,asset:v.asset,state:v.state,watercraft:true,vehicleId:v.id});
    }else{
      addRect(colliders,`vehicle:${v.id}`,v.x,v.y,Number(v.length||120)*.5,Number(v.width||100)*.5,'parked-vehicle','V2149-vehicle-footprint',{rotation:Number(v.rotation)||0,asset:v.asset,state:v.state,watercraft:false,vehicleId:v.id});
    }
    vehicleCount++;
  }
  for(const w of ETRANOM_WORLD_GEOMETRY_V2140.waterways){
    for(let i=1;i<w.points.length;i++)addCapsule(colliders,`waterway:${w.id}:${i-1}`,w.points[i-1],w.points[i],w.width*.5+2,'water-channel','V2140-waterway',{waterwayId:w.id});
    waterCount++;
  }
  for(const basin of ETRANOM_WORLD_GEOMETRY_V2140.waterBasins){
    addEllipse(colliders,`water-basin:${basin.id}`,basin.center.x,basin.center.y,basin.radii.x,basin.radii.y,'water-basin','V2140-water-basin');waterCount++;
  }
  // V2167 authored walls/fences have finite capsule colliders aligned with their rendered runs.
  for(const barrier of ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167.barriers){
    for(let i=1;i<barrier.points.length;i++){
      addCapsule(colliders,`barrier:${barrier.id}:${i-1}`,barrier.points[i-1],barrier.points[i],Math.max(5,barrier.thickness*20),'world-barrier','V2167-authored-world-geometry',{barrierId:barrier.id,barrierKind:barrier.kind,height:barrier.height,segmentIndex:i-1});
      barrierSegmentCount++;
    }
  }
  for(const lm of landmarks){
    if(lm.kind==='bridge'||lm.kind==='river'||lm.kind==='orchard'||lm.kind==='lookout')continue; // lookout hill is terrain, not a point obstacle.
    let r=lm.kind==='stones'?30:lm.kind==='lookout'?20:lm.kind==='windmill'?17:12;
    addCircle(colliders,`landmark:${lm.id}`,lm.x,lm.y,r,'landmark-obstacle','V2138-landmark',{landmarkKind:lm.kind});landmarkCount++;
  }
  // NPCs are soft-body world actors. Avoid duplicate blockers inside authored building shells.
  for(const npc of npcs){
    const insideBuilding=buildings.some(b=>{const d=resolveBuildingDimensionsV2141(b);if(!d)return false;return Math.abs(npc.x-b.x)<d.length*.5&&Math.abs(npc.y-(b.y-(Number(b.h)||120)*.5))<d.depth*.5;});
    if(!insideBuilding)addCircle(colliders,`npc:${npc.id}`,npc.x,npc.y,7.5,'resident-actor','V2161-live-safe-npcs',{npcId:npc.id});
  }
  const baseWorld={version:2167,cellSize:CELL,playerRadius:PLAYER_RADIUS,colliders:Object.freeze(colliders),bridgeCrossings:ETRANOM_BRIDGE_CROSSINGS_V2162,
    counts:Object.freeze({buildings:buildingCount,treeTrunks:treeCount,environmentalAndAuthoredProps:colliders.filter(c=>/prop|dressing|furniture|yard/.test(c.kind)).length,vehicles:vehicleCount,waterFeatures:waterCount,bridgeCrossings:ETRANOM_BRIDGE_CROSSINGS_V2162.length,landmarks:landmarkCount,barrierSegments:barrierSegmentCount,npcs:colliders.filter(c=>c.kind==='resident-actor').length,understory:colliders.filter(c=>c.kind==='dense-understory').length,total:colliders.length}),
    sourceVersions:Object.freeze([2138,2139,2140,2141,2142,2143,2144,2145,2146,2147,2148,2149,2150,2152,2153,2154,2155,2157,2158,2159,2160,2162,2164,2167])};
  const rasterized=attachContactRasterToWorldV2165(baseWorld,{pixelSize:1});
  const completedColliders=rasterized.world.colliders;
  const cells=buildSpatialHash(completedColliders);
  const world={...rasterized.world,cells,contactRasterAudit:rasterized.stats,
    };
  return Object.freeze(world);
}

function isColliderBypassedByBridge(c,world,x,y,radius){
  return c?.kind==='water-channel' && !!resolveBridgeDeckSampleV2164(x,y,radius);
}
function isInsideAnyOpenDoorCorridor(world,x,y,radius,gameState){
  return world.colliders.some(c=>{
    const d=c.doorway;
    return c.kind==='building-shell' && d && getDoorOpen(c,gameState) &&
      Math.abs(x-d.x)<=d.halfWidth+radius*.42 && y>=d.frontY-radius*.85 && y<=d.frontY+d.depth+radius*.35;
  });
}

export function isWorldPositionBlockedV2161(world,x,y,{radius=PLAYER_RADIUS,gameState=null,includeTerrain=true,ignoreVehicleId=null,ignoreWaterways=false}={}){
  const px=Number(x),py=Number(y),r=Math.max(0,Number(radius)||0);
  if(!world||!isWorldPositionInBoundsV2138(px,py))return true;
  const b=WORLD_DIMENSIONS_V2138.runtimeBounds;
  if(px-r<b.minX||px+r>b.maxX||py-r<b.minY||py+r>b.maxY)return true;
  const bridgeSupport=resolveBridgeDeckSampleV2164(px,py,r);
  if(includeTerrain&&terrainBlocked(px,py)&&!bridgeSupport)return true;
  const openDoorCorridor=isInsideAnyOpenDoorCorridor(world,px,py,r,gameState);
  const staticHit=queryColliders(world,px,py,r).some(c=>!(ignoreWaterways&&c.kind==='water-channel')&&!shouldSkipStaticVehicle(c,gameState,ignoreVehicleId)&&!isColliderBypassedByBridge(c,world,px,py,r)&&!(openDoorCorridor&&c.kind!=='building-shell')&&colliderPenetration(c,px,py,r,gameState)>0.001);
  if(staticHit)return true;
  const activeId=gameState?.activeVehicleId||null;
  for(const [id,v] of Object.entries(gameState?.vehicleRuntime?.vehicles||{})){
    if(id===ignoreVehicleId||id===activeId||!Number.isFinite(Number(v.x))||!Number.isFinite(Number(v.y)))continue;
    const placement=ETRANOM_VEHICLE_SYSTEM_V2149.placements.find(p=>p.id===id);if(!placement)continue;
    const collider=dynamicVehicleCollider(v,placement);
    if(colliderPenetration(collider,px,py,r,gameState)>0.001)return true;
  }
  return false;
}
function canMoveFrom(world,from,to,radius,gameState,ignoreVehicleId=null){
  if(isWorldPositionBlockedV2161(world,to.x,to.y,{radius,gameState,ignoreVehicleId})){
    const b=WORLD_DIMENSIONS_V2138.runtimeBounds;
    if(to.x-radius<b.minX||to.x+radius>b.maxX||to.y-radius<b.minY||to.y+radius>b.maxY||terrainBlocked(to.x,to.y))return false;
    for(const c of queryColliders(world,to.x,to.y,radius)){
      if(shouldSkipStaticVehicle(c,gameState,ignoreVehicleId))continue;
      if(isColliderBypassedByBridge(c,world,to.x,to.y,radius))continue;
      const next=colliderPenetration(c,to.x,to.y,radius,gameState);
      if(next<=0.001)continue;
      const prev=colliderPenetration(c,from.x,from.y,radius,gameState);
      // Let a character who loads inside/overlapping a newly registered prop move out, never deeper in.
      if(!(prev>0.001&&next<prev-0.03))return false;
    }
  }
  return true;
}
export function resolveWorldMovementV2161(world,player,{dx=0,dy=0,radius=PLAYER_RADIUS,gameState=null,maxStep=6,ignoreVehicleId=null}={}){
  const start={x:Number(player?.x),y:Number(player?.y)};
  if(!finite(start.x)||!finite(start.y)||!finite(dx)||!finite(dy))return Object.freeze({x:start.x||0,y:start.y||0,moved:false,blockedX:true,blockedY:true,steps:0,reason:'invalid-input'});
  const vx=Number(dx),vy=Number(dy),n=Math.max(1,Math.ceil(Math.max(Math.abs(vx),Math.abs(vy))/Math.max(1,Number(maxStep)||6)));
  const sx=vx/n,sy=vy/n;let x=start.x,y=start.y,blockedX=false,blockedY=false,steps=0;
  for(let i=0;i<n;i++){
    const tx=x+sx,ty=y+sy;
    if(canMoveFrom(world,{x,y},{x:tx,y},radius,gameState,ignoreVehicleId))x=tx;else blockedX ||= Math.abs(sx)>0;
    if(canMoveFrom(world,{x,y},{x,y:ty},radius,gameState,ignoreVehicleId))y=ty;else blockedY ||= Math.abs(sy)>0;
    steps++;
  }
  const bridge=resolveBridgeDeckSampleV2164(x,y,radius);
  return Object.freeze({x,y,deltaX:x-start.x,deltaY:y-start.y,moved:Math.hypot(x-start.x,y-start.y)>.001,blockedX,blockedY,steps,groundElevation:sampleTerrainElevationV2146(x,y),supportElevation:bridge?.deckElevation??sampleTerrainElevationV2146(x,y),bridge:bridge||null,slope:sampleTerrainGradientV2146(x,y).slopeClass,metersMoved:worldUnitsToMetersV2164(Math.hypot(x-start.x,y-start.y))});
}

function nearestPolylineDistance(x,y,points){let best=Infinity;for(let i=1;i<points.length;i++)best=Math.min(best,distToSegment(x,y,points[i-1][0],points[i-1][1],points[i][0],points[i][1]));return best;}
export function resolveWorldSurfacePhysicsV2161(x,y,{weather=null,season='summer',accumulation=null}={}){
  const surface=resolveTerrainSurfaceV2146(Number(x),Number(y));
  const grade=surface.gradient||0;
  const road=ETRANOM_ROAD_SYSTEM_V2142.roads.find(r=>nearestPolylineDistance(x,y,r.centerline)<=r.totalWidth*.5);
  const path=road?null:ETRANOM_PATH_SYSTEM_V2143.corridors.find(c=>nearestPolylineDistance(x,y,c.points)<=c.width*.5);
  const travelSurface=road?.material?.surface||path?.surface||surface.material;
  let speed=1,traction=1,acceleration=1;
  const material=String(travelSurface||'');
  if(/wet|moss|root/i.test(material)){speed*=.93;traction*=.86;}
  if(/gravel|slate|rock|ironstone/i.test(material)){speed*=.96;traction*=.92;}
  if(/packed-earth/i.test(material)){speed*=1.015;traction*=.98;}
  if(/broken-slate/i.test(material)){speed*=.98;traction*=.9;}
  if(/forest-track|rootbound-dirt/i.test(material)){speed*=.95;traction*=.88;}
  const wet=clamp(Number(weather?.wetness)||0,0,1),snow=clamp(Number(weather?.snow)||0,0,1),rain=clamp(Number(weather?.rain)||0,0,1);
  speed*=1-.12*wet-.08*rain-.13*snow;traction*=1-.24*wet-.28*snow;acceleration*=1-.15*wet-.22*snow;
  if(season==='winter'&&snow<.15){speed*=.93;traction*=.84;}
  if(grade>.085){const gradePenalty=clamp((grade-.085)*.9,0,.24);speed*=1-gradePenalty;acceleration*=1-gradePenalty*.8;}
  if(grade>.29){speed=0;traction=0;}
  const accumulated=accumulation||getSeasonalSurfaceAtV2164(null,x,y,weather||{});
  speed*=accumulated.speedMultiplier??1; traction*=accumulated.traction??1; acceleration*=accumulated.accelerationMultiplier??1;
  const bridge=resolveBridgeDeckSampleV2164(x,y,0);
  if(bridge){speed*=.96;traction*=.94;acceleration*=.98;}
  return Object.freeze({material:bridge?'bridge-deck':surface.material,travelSurface,roadId:road?.id||null,pathId:path?.id||null,biome:surface.biome,elevation:surface.elevation,supportElevation:bridge?.deckElevation??surface.elevation,bridgeId:bridge?.bridgeId||null,gradient:grade,slopeClass:surface.slopeClass,walkable:surface.walkable,
    speedMultiplier:Math.round(clamp(speed,0,1)*1000)/1000,traction:Math.round(clamp(traction,0,1)*1000)/1000,accelerationMultiplier:Math.round(clamp(acceleration,0,1)*1000)/1000,
    weatherWetness:wet,weatherSnow:snow,season,accumulatedSnowMeters:accumulated.snowDepthM||0,iceThicknessMeters:accumulated.iceThicknessM||0,accumulatedSurface:accumulated.surface||'base',bridge:bridge||null,coordinateUnit:'logical-world-unit-calibrated-v2164',metersPerLogicalUnit:ETRANOM_WORLD_SCALE_V2164.metersPerLogicalUnit});
}

// Obstacle-aware local A*: a compact temporary grid is generated around the endpoints;
// this supplements (does not rewrite) V2143's authored strategic path graph.
export function findPhysicsPathV2161(world,start,end,{cellSize=56,searchMargin=640,maxNodes=5000,radius=PLAYER_RADIUS,gameState=null}={}){
  const step=clamp(Number(cellSize)||56,24,128),margin=clamp(Number(searchMargin)||640,160,1600);
  if(!start||!end||![start.x,start.y,end.x,end.y].every(finite))return {ok:false,reason:'invalid-coordinates',path:[],visited:0};
  const minX=Math.floor((Math.min(start.x,end.x)-margin)/step)*step,minY=Math.floor((Math.min(start.y,end.y)-margin)/step)*step;
  const maxX=Math.ceil((Math.max(start.x,end.x)+margin)/step)*step,maxY=Math.ceil((Math.max(start.y,end.y)+margin)/step)*step;
  const toCell=(p)=>({x:Math.round((p.x-minX)/step),y:Math.round((p.y-minY)/step)});
  const toWorld=(c)=>({x:minX+c.x*step,y:minY+c.y*step});
  const s=toCell(start),g=toCell(end),id=c=>`${c.x},${c.y}`;
  const valid=c=>{const p=toWorld(c);return c.x>=0&&c.y>=0&&p.x<=maxX&&p.y<=maxY&&!isWorldPositionBlockedV2161(world,p.x,p.y,{radius,gameState});};
  const nearest=(c)=>{if(valid(c))return c;for(let r=1;r<=7;r++){for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){if(Math.max(Math.abs(x),Math.abs(y))!==r)continue;const q={x:c.x+x,y:c.y+y};if(valid(q))return q;}}return null;};
  const sc=nearest(s),gc=nearest(g);if(!sc||!gc)return {ok:false,reason:'no-nearby-walkable-cell',path:[],visited:0};
  const open=[sc],came=new Map(),gScore=new Map([[id(sc),0]]),fScore=new Map([[id(sc),Math.hypot(gc.x-sc.x,gc.y-sc.y)]]),closed=new Set();let visited=0;
  const dirs=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
  while(open.length&&visited<maxNodes){
    open.sort((a,b)=>(fScore.get(id(a))??Infinity)-(fScore.get(id(b))??Infinity));const cur=open.shift(),ck=id(cur);if(closed.has(ck))continue;closed.add(ck);visited++;
    if(ck===id(gc)){const cells=[cur];let k=ck;while(came.has(k)){const prev=came.get(k);cells.unshift(prev);k=id(prev);}const startPoint=isWorldPositionBlockedV2161(world,Number(start.x),Number(start.y),{radius,gameState})?toWorld(sc):{x:Number(start.x),y:Number(start.y)};const endPoint=isWorldPositionBlockedV2161(world,Number(end.x),Number(end.y),{radius,gameState})?toWorld(gc):{x:Number(end.x),y:Number(end.y)};const path=[startPoint,...cells.slice(1,-1).map(toWorld),endPoint];return {ok:true,reason:null,path,distance:path.slice(1).reduce((s,p,i)=>s+Math.hypot(p.x-path[i].x,p.y-path[i].y),0),visited,cellSize:step};}
    for(const [dx,dy] of dirs){const next={x:cur.x+dx,y:cur.y+dy},nk=id(next);if(closed.has(nk)||!valid(next))continue;
      if(dx&&dy&&(!valid({x:cur.x+dx,y:cur.y})||!valid({x:cur.x,y:cur.y+dy})))continue;
      const cost=(gScore.get(ck)??Infinity)+(dx&&dy?Math.SQRT2:1);if(cost<(gScore.get(nk)??Infinity)){came.set(nk,cur);gScore.set(nk,cost);fScore.set(nk,cost+Math.hypot(gc.x-next.x,gc.y-next.y));if(!open.some(p=>id(p)===nk))open.push(next);}
    }
  }
  return {ok:false,reason:visited>=maxNodes?'search-limit':'no-obstacle-free-route',path:[],visited};
}

// Grid-native indoor movement for the 27 existing interior plans. The current UI renders
// interiors as a preview panel, so this API is exposed and tested but not falsely called live-walkable.
function segmentHitsInteriorWall(ax,ay,bx,by,w){
  const vx=w.x2-w.x1,vy=w.y2-w.y1,den=(bx-ax)*vy-(by-ay)*vx;if(Math.abs(den)<1e-9)return false;
  const t=((w.x1-ax)*vy-(w.y1-ay)*vx)/den,u=((w.x1-ax)*(by-ay)-(w.y1-ay)*(bx-ax))/den;
  return t>=0&&t<=1&&u>=0&&u<=1;
}
export function moveInteriorPlayerV2161(player,direction,buildingId){
  const delta={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[direction];
  const p={x:Number(player?.x??5),y:Number(player?.y??7)};const architecture=getInteriorArchitectureV2144(buildingId);
  if(!delta||!architecture)return Object.freeze({player:p,moved:false,reason:!delta?'invalid-direction':'unknown-building'});
  const next={x:p.x+delta[0],y:p.y+delta[1]};
  if(next.x<0||next.x>10||next.y<0||next.y>8)return Object.freeze({player:p,moved:false,reason:'exterior-wall'});
  if(interiorObstaclesV2036(buildingId).some(o=>o.x===next.x&&o.y===next.y))return Object.freeze({player:p,moved:false,reason:'furniture'});
  if(architecture.partitions.some(w=>segmentHitsInteriorWall(p.x,p.y,next.x,next.y,w)))return Object.freeze({player:p,moved:false,reason:'partition-wall'});
  return Object.freeze({player:next,moved:true,reason:null});
}

// Continuous indoor foot-contact movement in the same 0..10 by 0..8 authored
// floor coordinates. Partition doors keep their rendered 14% center opening.
function pointSegmentDistanceV2164(px,py,ax,ay,bx,by){
  const dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy||1,t=clamp(((px-ax)*dx+(py-ay)*dy)/l2,0,1);
  return Math.hypot(px-(ax+dx*t),py-(ay+dy*t));
}
function segmentDistanceV2164(ax,ay,bx,by,cx,cy,dx,dy){
  if(segmentHitsInteriorWall(ax,ay,bx,by,{x1:cx,y1:cy,x2:dx,y2:dy}))return 0;
  return Math.min(pointSegmentDistanceV2164(ax,ay,cx,cy,dx,dy),pointSegmentDistanceV2164(bx,by,cx,cy,dx,dy),
    pointSegmentDistanceV2164(cx,cy,ax,ay,bx,by),pointSegmentDistanceV2164(dx,dy,ax,ay,bx,by));
}
function interiorStepBlockedV2164(ax,ay,bx,by,buildingId,radius){
  const architecture=getInteriorArchitectureV2144(buildingId);
  if(bx<radius||bx>10-radius||by<radius||by>8-radius)return 'exterior-wall';
  const stair=architecture?.stairs?.present?architecture.stairs.position:null;
  for(const obstacle of interiorObstaclesV2036(buildingId)){
    const stairClearance=stair&&Math.hypot(bx-stair.x,by-stair.y)<=.72;
    const obstacleRadius=.38+radius;
    if(!stairClearance&&Math.hypot(bx-obstacle.x,by-obstacle.y)<obstacleRadius)return 'furniture';
  }
  for(const wall of architecture.partitions){
    const vx=wall.x2-wall.x1,vy=wall.y2-wall.y1;
    const parts=[[0,.43],[.57,1]];
    for(const [a,b] of parts){
      const x1=wall.x1+vx*a,y1=wall.y1+vy*a,x2=wall.x1+vx*b,y2=wall.y1+vy*b;
      if(segmentDistanceV2164(ax,ay,bx,by,x1,y1,x2,y2)<radius+.045)return 'partition-wall';
    }
  }
  return null;
}
export function moveInteriorPlayerContinuousV2164(player,dx,dy,buildingId,options={}){
  const p={x:Number(player?.x??5),y:Number(player?.y??7)},vx=Number(dx),vy=Number(dy);
  if(!getInteriorArchitectureV2144(buildingId)||![vx,vy,p.x,p.y].every(Number.isFinite))return Object.freeze({player:p,moved:false,reason:'invalid-interior-or-vector',steps:0});
  const radius=clamp(Number(options.radius)||.22,.12,.38),distance=Math.hypot(vx,vy);
  if(distance<1e-6)return Object.freeze({player:p,moved:false,reason:null,steps:0});
  const steps=Math.max(1,Math.ceil(distance/.08)),sx=vx/steps,sy=vy/steps;
  let x=p.x,y=p.y,moved=false,blocked=null;
  for(let i=0;i<steps;i++){
    const nx=x+sx,ny=y+sy,reason=interiorStepBlockedV2164(x,y,nx,ny,buildingId,radius);
    if(!reason){x=nx;y=ny;moved=true;continue;}
    blocked=reason;
    // Axis slide preserves movement parallel to the obstacle without allowing tunnelling.
    const tryX=interiorStepBlockedV2164(x,y,nx,y,buildingId,radius);
    if(!tryX){x=nx;moved=true;}
    const tryY=interiorStepBlockedV2164(x,y,x,ny,buildingId,radius);
    if(!tryY){y=ny;moved=true;}
  }
  return Object.freeze({player:Object.freeze({x,y}),moved,reason:blocked&&!moved?blocked:null,blockedReason:blocked,steps});
}

export function auditWorldPhysicsV2161(world,{buildingCount=27}={}){
  const errors=[];if(!world||![2164,2165,2167].includes(world.version))errors.push('missing-world');
  if(world?.counts?.buildings!==buildingCount)errors.push(`building-count:${world?.counts?.buildings}`);
  if(world?.counts?.treeTrunks!==ETRANOM_TREES_VEGETATION_V2148.trees.length)errors.push('tree-trunk-coverage');
  if(world?.counts?.vehicles!==ETRANOM_VEHICLE_SYSTEM_V2149.placements.length)errors.push('vehicle-coverage');
  if(world?.counts?.waterFeatures!==ETRANOM_WORLD_GEOMETRY_V2140.waterways.length+ETRANOM_WORLD_GEOMETRY_V2140.waterBasins.length)errors.push('water-coverage');
  if(world?.colliders?.some(c=>!c.id||!c.bounds||![c.bounds.minX,c.bounds.minY,c.bounds.maxX,c.bounds.maxY].every(Number.isFinite)))errors.push('invalid-collider-record');
  // The authored start point sits close to the roofed well; it may touch its proxy, but must retain a clear escape direction.
  const spawnEscape=resolveWorldMovementV2161(world,{x:1500,y:920},{dx:-18,dy:0,radius:PLAYER_RADIUS});if(!spawnEscape.moved)errors.push('spawn-egress-blocked');
  const openDoorState={environmentInteractions:{entities:{'building:online_player_market:door':{doorOpen:true}}}};
  const b=world?.colliders?.find(c=>c.id==='building:online_player_market:shell');
  if(b&&!isDoorwayPassage(b,b.doorway.x,b.doorway.frontY,PLAYER_RADIUS,openDoorState))errors.push('doorway-open-state-not-respected');
  if(b&&b.shape!=='polygon')errors.push('building-footprint-not-polygon');
  const bridgeChecks=ETRANOM_BRIDGE_CROSSINGS_V2162.map(c=>isWorldPositionBlockedV2161(world,c.x,c.y,{radius:0,includeTerrain:false}));
  if(bridgeChecks.some(Boolean))errors.push('bridge-deck-water-bypass-failed');
  const closedDoorState={environmentInteractions:{entities:{'building:online_player_market:door':{doorOpen:false}}}};
  if(b&&isDoorwayPassage(b,b.doorway.x,b.doorway.frontY,PLAYER_RADIUS,closedDoorState))errors.push('closed-door-incorrectly-passable');
  return Object.freeze({ok:errors.length===0,version:2164,stage:19,colliders:world?.colliders?.length||0,counts:world?.counts||null,
    sourceStages:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,18],interiorDesigns:Object.keys(ETRANOM_INTERIOR_ARCHITECTURE_V2144).length,
    worldUnitsCalibratedToMetres:true,destructibility:'excluded-by-project-owner',errors:Object.freeze(errors)});
}

export const ETRANOM_WORLD_PHYSICS_V2161=Object.freeze({version:2164,stage:19,stageName:'Physics & Collision',coordinateUnit:'40-logical-units-per-metre-gameplay-calibration',playerFootCollider:{shape:'circle',radius:PLAYER_RADIUS,anchor:'character-foot-contact'},collisionRules:Object.freeze({buildings:'solid-shell-with-stateful-primary-door; windows-blocked',trees:'trunk-only-collider; canopy-passable',vegetation:'low-plants-passable; authored-hedges-block',roadsAndPaths:'walkable-surfaces-not-obstacles',water:'blocked-except-registered-keshtezar-and-rootwood-bridge-decks',vehicles:'parked-body-and-wheelbase-solid',props:'native-resolution PNG alpha contact masks for catalogued sprites; authored proxies for structures and unmatched assets',walls:'four-point rendered-ground-diamond building shells + authored fence props; no fabricated perimeter-walls',slopes:'steep-conditional; cliffs-blocked',sweptMovement:'<=6 logical units per substep; axis slide',interior:'27 grid-floor interiors with partition and furniture collision; runtime modal movement controls',destruction:'disabled'}),surfaceMaterials:['compacted-ash-loam','wet-loam','root-laced-moss','ironstone-gravel','slate','seasonal-snow','rain-wet-ground'],spatialHashCellSize:CELL});

if(typeof window!=='undefined'){
  window.ETRANOM_WORLD_PHYSICS_V2161=ETRANOM_WORLD_PHYSICS_V2161;
  window.ETRANOM_BUILD_WORLD_PHYSICS_V2161=buildWorldPhysicsWorldV2161;
  window.ETRANOM_IS_WORLD_BLOCKED_V2161=isWorldPositionBlockedV2161;
  window.ETRANOM_RESOLVE_WORLD_MOVEMENT_V2161=resolveWorldMovementV2161;
  window.ETRANOM_FIND_PHYSICS_PATH_V2161=findPhysicsPathV2161;
  window.ETRANOM_MOVE_INTERIOR_PLAYER_V2161=moveInteriorPlayerV2161;
  window.ETRANOM_MOVE_INTERIOR_PLAYER_CONTINUOUS_V2164=moveInteriorPlayerContinuousV2164;
}
