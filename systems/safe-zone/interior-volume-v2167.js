// ETRANOM V2167 — volumetric, multi-level interior architecture and collision contract.
// Mesh coordinates are local metres; the current game renderer is affine-isometric 2.5D.
import { ETRANOM_INTERIOR_ARCHITECTURE_V2144, getInteriorArchitectureV2144 } from './interior-architecture-v2144.js?v=2144';
import { getSafeZoneInteriorDesignV2046 } from './interior-designs-v2046.js?v=2081';

const GRID_W=10,GRID_H=8,FLOOR_H=3.25,WALL_H=2.85,WALL_T=.16;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const distanceToSegment=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy||1,t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/l2,0,1);return Math.hypot(p.x-(a.x+dx*t),p.y-(a.y+dy*t));};
const freeze=v=>{if(!v||typeof v!=='object'||Object.isFrozen(v))return v;Object.values(v).forEach(freeze);return Object.freeze(v);};
function tri(vertices,material,kind){return {vertices,material,kind};}
function quad(a,b,c,d,material,kind){return [tri([a,b,c],material,kind),tri([a,c,d],material,kind)];}
function p(x,y,z){return [Number(x),Number(y),Number(z)];}
function addWallFaces(faces,a,b,z0,z1,material='stone',kind='partition'){
  const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,nx=-dy/len*WALL_T,ny=dx/len*WALL_T;
  const a0=p(a[0],a[1],z0),b0=p(b[0],b[1],z0),a1=p(a[0],a[1],z1),b1=p(b[0],b[1],z1);
  const an0=p(a[0]+nx,a[1]+ny,z0),bn0=p(b[0]+nx,b[1]+ny,z0),an1=p(a[0]+nx,a[1]+ny,z1),bn1=p(b[0]+nx,b[1]+ny,z1);
  faces.push(...quad(a0,b0,b1,a1,material,kind),...quad(an0,an1,bn1,bn0,`${material}-shadow`,kind),...quad(a1,b1,bn1,an1,`${material}-cap`,'wall-top'));
}
function addFloor(faces,z,material){
  faces.push(...quad(p(0,0,z),p(GRID_W,0,z),p(GRID_W,GRID_H,z),p(0,GRID_H,z),`${material}-floor`,'floor'));
  const z0=z-.18;faces.push(...quad(p(0,GRID_H,z),p(GRID_W,GRID_H,z),p(GRID_W,GRID_H,z0),p(0,GRID_H,z0),`${material}-slab-edge`,'floor-edge'));
}
function buildBuildingVolume(buildingId,architecture){
  const floorCount=architecture.upperFloor&&architecture.stairs?.present?2:1,faces=[],partitions=[];
  for(let floor=0;floor<floorCount;floor++){
    const z=floor*FLOOR_H;addFloor(faces,z,architecture.floorMaterial||'stone');
    // Perimeter walls have a real south entrance opening, represented as two separate wall runs.
    const entrance=architecture.entrance||{edge:'south',x:5,width:1};
    addWallFaces(faces,[0,0],[GRID_W,0],z,z+WALL_H,'outer-wall','perimeter');
    addWallFaces(faces,[0,0],[0,GRID_H],z,z+WALL_H,'outer-wall','perimeter');
    addWallFaces(faces,[GRID_W,0],[GRID_W,GRID_H],z,z+WALL_H,'outer-wall','perimeter');
    if(entrance.edge==='south'){
      const gap=Math.max(.8,Number(entrance.width)||1),left=clamp(Number(entrance.x||5)-gap/2,0,GRID_W),right=clamp(Number(entrance.x||5)+gap/2,0,GRID_W);
      if(left>0)addWallFaces(faces,[0,GRID_H],[left,GRID_H],z,z+WALL_H,'outer-wall','perimeter');
      if(right<GRID_W)addWallFaces(faces,[right,GRID_H],[GRID_W,GRID_H],z,z+WALL_H,'outer-wall','perimeter');
    }else addWallFaces(faces,[0,GRID_H],[GRID_W,GRID_H],z,z+WALL_H,'outer-wall','perimeter');
    for(let i=0;i<(architecture.partitions||[]).length;i++){
      const w=architecture.partitions[i],a=[Number(w.x1),Number(w.y1)],b=[Number(w.x2),Number(w.y2)],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
      if(![...a,...b].every(Number.isFinite)||len<.2)continue;
      // A defined 14% doorway gap is present in the architecture renderer and collision model.
      const gap=.14,t1=.5-gap/2,t2=.5+gap/2,pointAt=t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
      addWallFaces(faces,a,pointAt(t1),z,z+WALL_H*(Number(w.height)||1),'partition-wall','partition');
      addWallFaces(faces,pointAt(t2),b,z,z+WALL_H*(Number(w.height)||1),'partition-wall','partition');
      partitions.push({floor,index:i,a,b,doorGap:[t1,t2],height:WALL_H*(Number(w.height)||1),thickness:WALL_T});
    }
    // Each floor receives a ceiling volume; the current render hides the active floor ceiling.
    faces.push(...quad(p(0,0,z+WALL_H),p(GRID_W,0,z+WALL_H),p(GRID_W,GRID_H,z+WALL_H),p(0,GRID_H,z+WALL_H),'ceiling','ceiling'));
  }
  const stairs=[];
  if(floorCount>1&&architecture.stairs?.present){
    const sx=clamp(Number(architecture.stairs.position?.x)||9,.5,9.5),sy=clamp(Number(architecture.stairs.position?.y)||7,.5,7.5),count=9;
    for(let i=0;i<count;i++){const t=(i+1)/count,z=t*FLOOR_H;stairs.push({index:i,x:sx-.46,y:sy-.55+i*.12,z,width:.92,depth:.24,height:FLOOR_H/count,stepRise:FLOOR_H/count});}
  }
  return freeze({buildingId,floorCount,floorHeightMeters:FLOOR_H,grid:{width:GRID_W,height:GRID_H},wallHeightMeters:WALL_H,wallThicknessMeters:WALL_T,
    floors:Array.from({length:floorCount},(_,i)=>({index:i,elevationMeters:i*FLOOR_H,material:architecture.floorMaterial||'stone',ceilingHeightMeters:WALL_H})),faces,partitions,stairs,entrance:architecture.entrance||null,meshStats:{triangles:faces.length,partitionWalls:partitions.length,stairs:stairs.length}});
}
const registry=Object.fromEntries(Object.entries(ETRANOM_INTERIOR_ARCHITECTURE_V2144).map(([id,architecture])=>[id,buildBuildingVolume(id,architecture)]));
export const ETRANOM_INTERIOR_VOLUME_V2167=freeze({version:2167,stage:25,coordinateUnit:'metre-local-interior-grid',floorHeightMeters:FLOOR_H,wallHeightMeters:WALL_H,wallThicknessMeters:WALL_T,buildings:registry});
export function getInteriorVolumeV2167(buildingId){return ETRANOM_INTERIOR_VOLUME_V2167.buildings[String(buildingId)]||null;}

const MATERIALS={stone:'#7b6a57','stone-shadow':'#4e453e','stone-cap':'#a28a6b',oak:'#89613e','oak-shadow':'#573a29','oak-cap':'#bb8c57',basalt:'#46474a','basalt-shadow':'#292c30','basalt-cap':'#70747a', 'outer-wall':'#786654','outer-wall-shadow':'#463d38','outer-wall-cap':'#b79a72','partition-wall':'#8d7960','partition-wall-shadow':'#53483f','partition-wall-cap':'#c6aa7c',ceiling:'#38343a'};
const PROJECT=(v)=>{const [x,y,z]=v;return [360+(x-y)*27,82+(x+y)*14-z*31];};
function svgTriangle(face){const pts=face.vertices.map(PROJECT).map(p=>p.join(',')).join(' '),color=MATERIALS[face.material]||({floor:'#73624f','floor-edge':'#403931'}[face.kind]||'#74604b');const opacity=face.kind==='floor'?.22:face.kind==='ceiling'?.18:face.kind==='floor-edge'?.62:.78;return `<polygon points="${pts}" fill="${color}" fill-opacity="${opacity}" stroke="#1d1a1a" stroke-opacity=".3" stroke-width=".6" data-volume-face="${face.kind}"/>`;}
export function renderInteriorVolumeMarkupV2167(buildingId,floorIndex=0){
  const volume=getInteriorVolumeV2167(buildingId);if(!volume)return '';
  const floor=clamp(Math.round(Number(floorIndex)||0),0,volume.floorCount-1),z0=floor*FLOOR_H,z1=z0+WALL_H;
  const faces=volume.faces.filter(face=>{
    const z=face.vertices.reduce((sum,v)=>sum+v[2],0)/face.vertices.length;
    // Render the active level's floor, walls and ceiling; hide other levels, preserving real 3D level offsets in the mesh.
    return (z>=z0-.2&&z<=z1+.02) || (face.kind==='ceiling'&&Math.abs(z-(z0+WALL_H))<.02);
  });
  const triangles=faces.map(svgTriangle).join('');
  const stairMarkup=volume.stairs.map(step=>{const center=PROJECT([step.x,step.y,step.z]);return `<polygon points="${PROJECT([step.x,step.y,step.z]).join(',')} ${PROJECT([step.x+step.width,step.y,step.z]).join(',')} ${PROJECT([step.x+step.width,step.y+step.depth,step.z]).join(',')} ${PROJECT([step.x,step.y+step.depth,step.z]).join(',')}" fill="#96714d" stroke="#d0b17d" stroke-width=".7" data-stair-step="${step.index}"/>`;}).join('');
  return `<g class="interior-volume-v2167" data-building-volume="${buildingId}" data-floor="${floor}" data-triangles="${faces.length}">${triangles}${floor===0?stairMarkup:''}</g>`;
}

function segmentBlockedByWall(point,wall,radius){
  const dx=wall.b.x-wall.a.x,dy=wall.b.y-wall.a.y,l2=dx*dx+dy*dy||1,t=clamp(((point.x-wall.a.x)*dx+(point.y-wall.a.y)*dy)/l2,0,1);
  return Math.hypot(point.x-(wall.a.x+dx*t),point.y-(wall.a.y+dy*t))<radius+WALL_T*.5;
}
function partitionContainsGap(point,wall){
  const dx=wall.b.x-wall.a.x,dy=wall.b.y-wall.a.y,l2=dx*dx+dy*dy||1,t=((point.x-wall.a.x)*dx+(point.y-wall.a.y)*dy)/l2;
  return t>=wall.doorGap[0]&&t<=wall.doorGap[1];
}
export function moveInteriorPlayerOnVolumeV2167(player,dx,dy,buildingId,floorIndex=0,{radius=.18}={}){
  const volume=getInteriorVolumeV2167(buildingId);if(!volume)return Object.freeze({player:{...player},moved:false,reason:'unknown-building'});
  const floor=clamp(Math.round(Number(floorIndex)||0),0,volume.floorCount-1),current={x:clamp(Number(player?.x??5),0,10),y:clamp(Number(player?.y??7),0,8)};
  const next={x:current.x+clamp(dx,-.5,.5),y:current.y+clamp(dy,-.5,.5)};
  if(next.x<radius||next.x>GRID_W-radius||next.y<radius||next.y>GRID_H-radius)return Object.freeze({player:current,moved:false,reason:'perimeter-wall'});
  const arch=getInteriorArchitectureV2144(buildingId),entrance=arch?.entrance||{edge:'south',x:5,width:1};
  if(entrance.edge==='south'&&next.y>GRID_H-radius*1.6&&Math.abs(next.x-(Number(entrance.x)||5))>(Number(entrance.width)||1)*.5+radius)return Object.freeze({player:current,moved:false,reason:'entrance-wall'});
  const design=getSafeZoneInteriorDesignV2046(buildingId),obstacles=design?.spots||[];
  for(const o of obstacles){if(Math.hypot(next.x-o.x,next.y-o.y)<radius+.28)return Object.freeze({player:current,moved:false,reason:'furniture'});}
  const walls=volume.partitions.filter(w=>w.floor===floor);
  for(const wall of walls){if(partitionContainsGap(next,wall))continue;if(segmentBlockedByWall(next,{a:{x:wall.a[0],y:wall.a[1]},b:{x:wall.b[0],y:wall.b[1]}},radius))return Object.freeze({player:current,moved:false,reason:'partition-wall'});}
  return Object.freeze({player:Object.freeze(next),moved:Math.hypot(next.x-current.x,next.y-current.y)>1e-7,reason:null,floor,elevationMeters:floor*FLOOR_H});
}
export function auditInteriorVolumeV2167(){
  const errors=[];let buildings=0,floors=0,triangles=0,stairs=0;
  for(const [id,v] of Object.entries(registry)){buildings++;floors+=v.floorCount;triangles+=v.faces.length;stairs+=v.stairs.length;
    if(!v.faces.length)errors.push(`missing-mesh:${id}`);if(v.meshStats.triangles!==v.faces.length)errors.push(`triangle-count:${id}`);
    if(v.floorCount!== (ETRANOM_INTERIOR_ARCHITECTURE_V2144[id].upperFloor&&ETRANOM_INTERIOR_ARCHITECTURE_V2144[id].stairs?.present?2:1))errors.push(`floor-count:${id}`);
    if(v.faces.some(f=>f.vertices.some(p=>p.length!==3||!p.every(Number.isFinite))))errors.push(`invalid-vertex:${id}`);
  }
  return Object.freeze({ok:errors.length===0,version:2167,stage:25,buildings,floors,triangles,stairs,meshes:'extruded-floor-wall-partition-ceiling-stair-volume',errors:Object.freeze(errors)});
}
