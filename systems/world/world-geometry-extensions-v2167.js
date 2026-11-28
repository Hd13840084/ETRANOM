// ETRANOM V2167 — authored geometric meshes for the five recovered world-kit assets.
// All XY coordinates are in the canonical V2138 logical-world plane. Z is stored in
// the same logical-unit scale (40 units per gameplay metre), so rendered and physics
// geometry can share one coordinate contract without pretending the whole game is 3D.
import { ETRANOM_WORLD_STRUCTURE_V2138 } from './world-structure-v2138.js?v=2138';
import { ETRANOM_WORLD_GEOMETRY_V2140 } from './world-geometry-v2140.js?v=2140';
import { ETRANOM_ROAD_SYSTEM_V2142 } from './road-system-v2142.js?v=2142';
import { ETRANOM_BUILDING_YARD_PLACEMENTS_V2117 } from '../safe-zone/building-yards-v2117.js?v=2162';

const U=40;
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const freeze=value=>{if(!value||typeof value!=='object'||Object.isFrozen(value))return value;Object.values(value).forEach(freeze);return Object.freeze(value);};
const normalize=v=>{const n=Math.hypot(v[0],v[1])||1;return [v[0]/n,v[1]/n];};
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]];
const scale=(a,s)=>[a[0]*s,a[1]*s];
const bezier=(p0,p1,p2,p3,t)=>{const u=1-t;return [u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0],u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]];};
const sampleBezier=(p0,p1,p2,p3,count=18)=>Array.from({length:count+1},(_,i)=>bezier(p0,p1,p2,p3,i/count));
const distanceToSegment=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy||1,t=clamp(((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l2,0,1);return dist(p,[a[0]+dx*t,a[1]+dy*t]);};
const distanceToPolyline=(p,points)=>Math.min(...points.slice(1).map((b,i)=>distanceToSegment(p,points[i],b)));

// Each centerline becomes a two-sided triangulated ribbon, not merely a painted line.
function makeRibbonMesh(points,width,elevationUnits=.08){
  const half=width*.5,vertices=[],triangles=[];
  for(let i=0;i<points.length;i++){
    const previous=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)];
    const tangent=normalize([next[0]-previous[0],next[1]-previous[1]]),normal=[-tangent[1],tangent[0]];
    const miterScale=1/Math.max(.45,Math.abs(normal[0]*(-tangent[1])+normal[1]*tangent[0]));
    const offset=scale(normal,Math.min(half*1.8,half*miterScale));
    const left=add(points[i],offset),right=[points[i][0]-offset[0],points[i][1]-offset[1]];
    vertices.push([left[0],left[1],elevationUnits],[right[0],right[1],elevationUnits]);
  }
  for(let i=0;i<points.length-1;i++){const a=i*2,b=a+1,c=a+2,d=a+3;triangles.push([a,b,c],[b,d,c]);}
  return freeze({kind:'triangulated-road-ribbon',width,vertices,triangles,triangleCount:triangles.length});
}
function makeJunctionSurface(anchor,road,branch,width){
  const roadIndex=road.centerline.findIndex(p=>dist(p,anchor)<1);
  const before=road.centerline[Math.max(0,roadIndex-1)],after=road.centerline[Math.min(road.centerline.length-1,roadIndex+1)];
  const directions=[normalize([before[0]-anchor[0],before[1]-anchor[1]]),normalize([after[0]-anchor[0],after[1]-anchor[1]]),normalize([branch[1][0]-anchor[0],branch[1][1]-anchor[1]])];
  const armLength=Math.max(72,width*1.35),armMeshes=directions.map(direction=>makeRibbonMesh([anchor,add(anchor,scale(direction,armLength))],width,.12));
  const radius=width*.62,center=Object.freeze([anchor[0],anchor[1],.14]),ring=Array.from({length:24},(_,i)=>[anchor[0]+Math.cos(i*Math.PI/12)*radius,anchor[1]+Math.sin(i*Math.PI/12)*radius,.14]);
  const vertices=[center,...ring],triangles=[];for(let i=1;i<=ring.length;i++)triangles.push([0,i,i===ring.length?1:i+1]);
  return freeze({kind:'three-arm-junction-surface',arms:armMeshes,hub:{vertices,triangles},directions,radius,triangleCount:armMeshes.reduce((n,m)=>n+m.triangles.length,0)+triangles.length});
}
function makeBarrierMesh(barrier){
  const halfT=barrier.thickness*U*.5,height=barrier.height*U,vertices=[],triangles=[],postCentres=[];
  for(let i=1;i<barrier.points.length;i++){
    const a=barrier.points[i-1],b=barrier.points[i],tangent=normalize([b[0]-a[0],b[1]-a[1]]),normal=[-tangent[1],tangent[0]],offset=scale(normal,halfT);
    const base=vertices.length;
    for(const p of [add(a,offset),[a[0]-offset[0],a[1]-offset[1]],add(b,offset),[b[0]-offset[0],b[1]-offset[1]]])vertices.push([p[0],p[1],0]);
    for(const p of [add(a,offset),[a[0]-offset[0],a[1]-offset[1]],add(b,offset),[b[0]-offset[0],b[1]-offset[1]]])vertices.push([p[0],p[1],height]);
    // front, rear and cap faces form a closed rectangular wall/fence segment shell.
    triangles.push([base,base+2,base+4],[base+2,base+6,base+4],[base+1,base+5,base+3],[base+3,base+5,base+7],[base+4,base+6,base+5],[base+5,base+6,base+7]);
  }
  const [a,b]=barrier.points,length=dist(a,b),pieces=Math.max(1,Math.ceil(length/barrier.spacing));
  for(let i=0;i<=pieces;i++){const t=i/pieces;postCentres.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,height*.5]);}
  return freeze({kind:'closed-vertical-barrier-shell',coordinateUnit:'logical-unit',vertices,triangles,postCentres,heightUnits:height,thicknessUnits:barrier.thickness*U,triangleCount:triangles.length});
}

const yAnchor=[1580,1430]; // exact V2138 capital_to_ironstone control vertex
const tAnchor=[2150,910];  // exact V2138 capital_to_rootwood control vertex
const ySpur=sampleBezier(yAnchor,[1695,1437],[1905,1484],[2130,1510],20);
const tSpur=sampleBezier(tAnchor,[2190,790],[2075,520],[2070,300],22);
const curveSpur=sampleBezier([2190,790],[2240,715],[2145,655],[2075,520],16);
const mainRoads=ETRANOM_ROAD_SYSTEM_V2142.roads;
const roads=[
  freeze({id:'v2167_y_spur_old_memorial',from:'junction_y_ironstone',to:'landmark_old_memorial',kind:'authored-road-branch',width:22,surface:'packed-earth',points:ySpur,source:'anchored-to-capital_to_ironstone-and-old_memorial',surfaceMesh:makeRibbonMesh(ySpur,22)}),
  freeze({id:'v2167_t_spur_willow_bank',from:'junction_t_rootwood',to:'landmark_willow_bank',kind:'riverside-access-road',width:18,surface:'packed-earth',points:tSpur,source:'anchored-to-capital_to_rootwood-and-willow_bank',surfaceMesh:makeRibbonMesh(tSpur,18)})
];
const barriers=[
  freeze({id:'v2167_grain_field_timber_fence',kind:'timber-fence',asset:'timber_fence_segment',height:1.25,thickness:.24,spacing:122,points:[[155,1305],[515,1305]],source:'authored-grain-field-boundary',surfaceMesh:makeBarrierMesh({height:1.25,thickness:.24,spacing:122,points:[[155,1305],[515,1305]]})}),
  freeze({id:'v2167_eastern_old_track_stone_wall',kind:'mossy-stone-wall',asset:'mossy_stone_wall_segment',height:1.8,thickness:.42,spacing:132,points:[[2370,1610],[2730,1610]],source:'authored-rootwood-south-boundary',surfaceMesh:makeBarrierMesh({height:1.8,thickness:.42,spacing:132,points:[[2370,1610],[2730,1610]]})})
];
const junctions=[
  freeze({id:'junction_y_ironstone',kind:'Y',x:yAnchor[0],y:yAnchor[1],roadId:'capital_to_ironstone',branchId:roads[0].id,rotation:0,asset:'dirt_road_y_junction',surface:makeJunctionSurface(yAnchor,mainRoads.find(r=>r.id==='capital_to_ironstone'),ySpur,22)}),
  freeze({id:'junction_t_rootwood',kind:'T',x:tAnchor[0],y:tAnchor[1],roadId:'capital_to_rootwood',branchId:roads[1].id,rotation:.12,asset:'dirt_road_t_junction',surface:makeJunctionSurface(tAnchor,mainRoads.find(r=>r.id==='capital_to_rootwood'),tSpur,22)})
];
const curves=[freeze({id:'v2167_willow_bank_curve',points:curveSpur,width:18,source:'authored-t-branch-bezier',surfaceMesh:makeRibbonMesh(curveSpur,18,.1)})];
const assetBindings=freeze([
  {asset:'dirt_road_curve',role:'curved-road-surface',points:curveSpur,anchor:curveSpur[Math.floor(curveSpur.length/2)],rotation:-.35,width:178,height:132,geometryId:curves[0].id},
  {asset:'dirt_road_y_junction',role:'three-way-road-junction',anchor:yAnchor,rotation:0,width:192,height:150,geometryId:junctions[0].id},
  {asset:'dirt_road_t_junction',role:'three-way-road-junction',anchor:tAnchor,rotation:.12,width:190,height:154,geometryId:junctions[1].id},
  ...barriers.map(b=>({asset:b.asset,role:b.kind,barrierId:b.id,points:b.points,height:b.height,thickness:b.thickness,spacing:b.spacing,geometryId:b.id}))
]);
function validateBarrier(barrier){
  const errors=[];
  for(let i=1;i<barrier.points.length;i++){
    const a=barrier.points[i-1],b=barrier.points[i];
    if(dist(a,b)<24)errors.push(`short-barrier-segment:${barrier.id}:${i-1}`);
    for(const road of mainRoads)for(let j=1;j<road.centerline.length;j++){
      const clearance=distanceToSegment([(a[0]+b[0])/2,(a[1]+b[1])/2],road.centerline[j-1],road.centerline[j]);
      if(clearance<road.totalWidth*.5+barrier.thickness*20+18)errors.push(`barrier-road-clearance:${barrier.id}:${road.id}`);
    }
    for(const building of ETRANOM_BUILDING_YARD_PLACEMENTS_V2117){const clearance=distanceToSegment([building.x,building.y],a,b),exclusion=Math.max(Number(building.width)||160,Number(building.length)||160)*.52+barrier.thickness*20+24;if(clearance<exclusion)errors.push(`barrier-building-clearance:${barrier.id}:${building.id}`);}
    for(const waterway of ETRANOM_WORLD_GEOMETRY_V2140.waterways){const clearance=distanceToPolyline([(a[0]+b[0])/2,(a[1]+b[1])/2],waterway.points);if(clearance<waterway.width*.5+barrier.thickness*20+24)errors.push(`barrier-water-clearance:${barrier.id}:${waterway.id}`);}
  }
  if(barrier.surfaceMesh?.triangles?.length<6||barrier.surfaceMesh.vertices.some(v=>v.length!==3||!v.every(Number.isFinite)))errors.push(`invalid-barrier-mesh:${barrier.id}`);
  return errors;
}
export const ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167=freeze({version:2167,stage:25,coordinateUnit:'V2138-logical-world-unit',zUnit:'logical-unit; 40 units per metre',junctions,roads,curves,barriers,assetBindings});
export function auditWorldGeometryExtensionsV2167(){
  const errors=[],junctionIds=new Set(),roadIds=new Set(),barrierIds=new Set();
  for(const j of junctions){if(junctionIds.has(j.id))errors.push(`duplicate-junction:${j.id}`);junctionIds.add(j.id);const road=mainRoads.find(r=>r.id===j.roadId);if(!road||distanceToPolyline([j.x,j.y],road.centerline)>1)errors.push(`junction-not-on-canonical-road:${j.id}`);if(![j.x,j.y,j.rotation].every(Number.isFinite))errors.push(`invalid-junction:${j.id}`);if(j.surface?.arms?.length!==3||j.surface.triangleCount<20)errors.push(`junction-surface-missing:${j.id}`);}
  for(const r of roads){if(roadIds.has(r.id))errors.push(`duplicate-road:${r.id}`);roadIds.add(r.id);if(r.points.length<3||r.points.some(p=>p.length!==2||!p.every(Number.isFinite)))errors.push(`invalid-road:${r.id}`);if(!r.surfaceMesh?.triangles?.length||r.surfaceMesh.vertices.some(v=>v.length!==3||!v.every(Number.isFinite)))errors.push(`road-surface-mesh:${r.id}`);}
  for(const c of curves)if(!c.surfaceMesh?.triangles?.length||c.surfaceMesh.vertices.some(v=>v.length!==3||!v.every(Number.isFinite)))errors.push(`curve-surface-mesh:${c.id}`);
  for(const b of barriers){if(barrierIds.has(b.id))errors.push(`duplicate-barrier:${b.id}`);barrierIds.add(b.id);errors.push(...validateBarrier(b));}
  return Object.freeze({ok:errors.length===0,version:2167,stage:25,junctions:junctionIds.size,roadBranches:roads.length,roadTriangles:roads.reduce((n,r)=>n+r.surfaceMesh.triangles.length,0),curveSegments:curves.reduce((n,c)=>n+c.surfaceMesh.triangles.length,0),junctionTriangles:junctions.reduce((n,j)=>n+j.surface.triangleCount,0),barriers:barrierIds.size,barrierTriangles:barriers.reduce((n,b)=>n+b.surfaceMesh.triangles.length,0),assetBindings:assetBindings.length,totalSurfaceTriangles:roads.reduce((n,r)=>n+r.surfaceMesh.triangles.length,0)+curves.reduce((n,c)=>n+c.surfaceMesh.triangles.length,0)+junctions.reduce((n,j)=>n+j.surface.triangleCount,0)+barriers.reduce((n,b)=>n+b.surfaceMesh.triangles.length,0),errors:Object.freeze(errors)});
}
