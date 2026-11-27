// ETRANOM V2143 — Stage 6/24: authored pedestrian corridors and route graph.
// Navigation guidance only. Does not override legacy movement, gate unlocks or physics.
import { ETRANOM_WORLD_STRUCTURE_V2138 } from './world-structure-v2138.js?v=2138';
import { ETRANOM_WORLD_GEOMETRY_V2140 } from './world-geometry-v2140.js?v=2140';
import { ETRANOM_ROAD_SYSTEM_V2142 } from './road-system-v2142.js?v=2142';
import { ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167 } from './world-geometry-extensions-v2167.js?v=2167';

const deepFreeze = (v) => { if (!v || typeof v !== 'object' || Object.isFrozen(v)) return v; Object.values(v).forEach(deepFreeze); return Object.freeze(v); };
const dist = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
const point = (x,y) => ({x:Number(x),y:Number(y)});
const lineLength = (pts) => pts.slice(1).reduce((s,p,i)=>s+Math.hypot(p[0]-pts[i][0],p[1]-pts[i][1]),0);
const corridors = [];
const nodes = [];
const edges = [];
const addNode = (id,p,kind,meta={}) => { if(!nodes.some(n=>n.id===id)) nodes.push({id,x:p.x,y:p.y,kind,...meta}); };
const addEdge = (id,from,to,points,width,kind,meta={}) => {
  const a=point(...points[0]), b=point(...points[points.length-1]);
  addNode(from,a,kind); addNode(to,b,kind);
  const edge={id,from,to,points:points.map(([x,y])=>[x,y]),width,kind,length:lineLength(points),...meta};
  edges.push(edge); corridors.push(edge);
};

// Primary road centerlines are the authoritative long-distance walking corridors.
for(const road of ETRANOM_ROAD_SYSTEM_V2142.roads){
  addEdge(`walk_${road.id}`,`settlement_${road.from}`,`settlement_${road.to}`,road.centerline,Math.max(road.carriagewayWidth*.72,12),'road',{sourceRoadId:road.id,mode:'walk'});
}
// The ten approaches end at sealed perimeter gates: the corridor is walkable up to
// the gate threshold only; it never changes the gate's quest/lock state.
for(const a of ETRANOM_ROAD_SYSTEM_V2142.gateApproaches){
  const pts=[[a.end.x,a.end.y],[a.control.x,a.control.y],[a.start.x,a.start.y]];
  addEdge(`walk_${a.id}`,`approach_outer_${a.gateId}`,`gate_threshold_${a.gateId}`,pts,Math.max(8,a.width*.68),'gate-approach',{gateId:a.gateId,terminal:'sealed-gate-threshold',gateState:'preserve-existing-rules'});
}
// Authored footpaths connect known landmarks to their own settlement hubs. These
// are pedestrian-only links, deliberately not new roads or building entrances.
for(const landmark of ETRANOM_WORLD_STRUCTURE_V2138.regions.safeWorld.landmarks){
  const settlement=ETRANOM_WORLD_STRUCTURE_V2138.regions.safeWorld.settlements
    .filter(s=>Math.abs(landmark.x-s.cx)<s.rx && Math.abs(landmark.y-s.cy)<s.ry)
    .sort((a,b)=>Math.hypot(landmark.x-a.cx,landmark.y-a.cy)-Math.hypot(landmark.x-b.cx,landmark.y-b.cy))[0];
  if(!settlement) continue;
  const dx=landmark.x-settlement.cx,dy=landmark.y-settlement.cy;
  const bend=((landmark.x+landmark.y)%2?1:-1)*Math.min(26,Math.hypot(dx,dy)*.045);
  const len=Math.hypot(dx,dy)||1, nx=-dy/len,ny=dx/len;
  const pts=[[settlement.cx,settlement.cy],[settlement.cx+dx*.5+nx*bend,settlement.cy+dy*.5+ny*bend],[landmark.x,landmark.y]];
  addEdge(`footpath_${landmark.id}`,`settlement_${settlement.id}`,`landmark_${landmark.id}`,pts,10,'landmark-footpath',{landmarkId:landmark.id,surface:'worn-earth-and-scattered-stone',authoredFrom:'canonical-landmark-and-settlement-coordinates'});
}


// V2167: split the trunk road at each exact junction control vertex. Merely adding
// a junction node beside an unsplit trunk creates a visually correct but disconnected
// branch, so the graph itself must terminate and restart at the junction node.
for(const junction of ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167.junctions){
  addNode(junction.id,{x:junction.x,y:junction.y},'road-junction',{junctionKind:junction.kind,roadId:junction.roadId});
  const trunk=edges.find(edge=>edge.sourceRoadId===junction.roadId);
  if(!trunk) continue;
  let splitIndex=-1,splitError=Infinity;
  for(let i=1;i<trunk.points.length-1;i++){
    const d=Math.hypot(trunk.points[i][0]-junction.x,trunk.points[i][1]-junction.y);
    if(d<splitError){splitError=d;splitIndex=i;}
  }
  if(splitIndex<1||splitError>1) continue;
  const left=trunk.points.slice(0,splitIndex+1),right=trunk.points.slice(splitIndex);
  const edgeIndex=edges.indexOf(trunk),corridorIndex=corridors.indexOf(trunk);
  if(edgeIndex>=0) edges.splice(edgeIndex,1);
  if(corridorIndex>=0) corridors.splice(corridorIndex,1);
  addEdge(`${trunk.id}__to__${junction.id}`,trunk.from,junction.id,left,trunk.width,trunk.kind,{sourceRoadId:junction.roadId,mode:trunk.mode,splitFrom:trunk.id});
  addEdge(`${junction.id}__to__${trunk.to}`,junction.id,trunk.to,right,trunk.width,trunk.kind,{sourceRoadId:junction.roadId,mode:trunk.mode,splitFrom:trunk.id});
}
for(const road of ETRANOM_WORLD_GEOMETRY_EXTENSIONS_V2167.roads){
  const first=road.points[0],last=road.points.at(-1);
  addEdge(road.id,road.from,road.to,road.points,road.width,'road-branch',{source:road.source,surface:road.surface,mode:'walk-and-vehicle'});
}

const frozenNetwork=deepFreeze({version:2143,stage:6,coordinateUnit:'V2138-logical-world-unit',nodes,edges,corridors,
  policy:{routing:'A-star-on-authored-corridor-graph',offCorridor:'not-certified-walkable',water:'blocked-unless-explicit-bridge-link-exists',sealedGates:'terminal-only-no-unlock',buildingEntrances:'stage-07',physicalCollision:'stage-19',legacyMovement:'not-overridden'},
  coverage:{roadLinks:ETRANOM_ROAD_SYSTEM_V2142.roads.length,gateApproaches:ETRANOM_ROAD_SYSTEM_V2142.gateApproaches.length,landmarkFootpaths:edges.filter(e=>e.kind==='landmark-footpath').length,stage25Branches:edges.filter(e=>e.kind==='road-branch').length}});
export const ETRANOM_PATH_SYSTEM_V2143=frozenNetwork;

function nearestNode(pos){let best=null,score=Infinity;for(const n of nodes){const d=dist(pos,n);if(d<score){score=d;best=n;}}return best;}
function heuristic(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
export function findPathV2143(start,end,options={}){
  const s=point(start?.x,start?.y),t=point(end?.x,end?.y);
  if(!Number.isFinite(s.x)||!Number.isFinite(s.y)||!Number.isFinite(t.x)||!Number.isFinite(t.y))return {ok:false,reason:'invalid-coordinate',path:[],distance:0};
  const maxSnap=Number.isFinite(options.maxSnapDistance)?options.maxSnapDistance:180;
  const sn=nearestNode(s),en=nearestNode(t);
  if(!sn||!en||dist(s,sn)>maxSnap||dist(t,en)>maxSnap)return {ok:false,reason:'outside-authored-network',path:[],distance:0};
  const adjacency=new Map(nodes.map(n=>[n.id,[]]));
  for(const e of edges){const cost=e.length;adjacency.get(e.from)?.push({to:e.to,edge:e,cost});adjacency.get(e.to)?.push({to:e.from,edge:e,cost});}
  const open=new Set([sn.id]),came=new Map(),g=new Map([[sn.id,0]]),f=new Map([[sn.id,heuristic(sn,en)]]);
  while(open.size){let current=null,best=Infinity;for(const id of open){const v=f.get(id)??Infinity;if(v<best){best=v;current=id;}}
    if(current===en.id){const chain=[];let id=current;while(id!==sn.id){const rec=came.get(id);if(!rec)break;chain.unshift(rec.edge);id=rec.previous;}const coords=[[s.x,s.y]];for(const e of chain){const forward=e.from=== (coords._lastNode||sn.id);const seq=forward?e.points:[...e.points].reverse();for(const p of seq){const last=coords[coords.length-1];if(Math.hypot(last[0]-p[0],last[1]-p[1])>0.5)coords.push([...p]);}coords._lastNode=forward?e.to:e.from;}coords.push([t.x,t.y]);return {ok:true,reason:null,path:coords,distance:g.get(en.id)+dist(s,sn)+dist(t,en),edgeIds:chain.map(e=>e.id),startNode:sn.id,endNode:en.id};}
    open.delete(current);for(const n of adjacency.get(current)||[]){const tentative=(g.get(current)??Infinity)+n.cost;if(tentative<(g.get(n.to)??Infinity)){came.set(n.to,{previous:current,edge:n.edge});g.set(n.to,tentative);f.set(n.to,tentative+heuristic(nodes.find(x=>x.id===n.to),en));open.add(n.to);}}
  }
  return {ok:false,reason:'no-connected-route',path:[],distance:0};
}

function distanceToSegment(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy||1;const t=Math.max(0,Math.min(1,((p.x-a[0])*dx+(p.y-a[1])*dy)/l2));return Math.hypot(p.x-(a[0]+t*dx),p.y-(a[1]+t*dy));}
export function isOnWalkableCorridorV2143(x,y,options={}){
  const p=point(x,y);if(!Number.isFinite(p.x)||!Number.isFinite(p.y))return false;
  const margin=Number.isFinite(options.margin)?options.margin:0;
  return corridors.some(c=>c.points.slice(1).some((b,i)=>distanceToSegment(p,c.points[i],b)<=c.width/2+margin));
}
export function auditPathSystemV2143(){
 const errors=[],nodeIds=new Set(),edgeIds=new Set();
 for(const n of nodes){if(nodeIds.has(n.id))errors.push(`duplicate-node:${n.id}`);nodeIds.add(n.id);if(![n.x,n.y].every(Number.isFinite))errors.push(`invalid-node:${n.id}`);}
 for(const e of edges){if(edgeIds.has(e.id))errors.push(`duplicate-edge:${e.id}`);edgeIds.add(e.id);if(!nodeIds.has(e.from)||!nodeIds.has(e.to))errors.push(`dangling-edge:${e.id}`);if(e.points.length<2||e.points.some(p=>!p.every(Number.isFinite))||!(e.width>0&&e.length>0))errors.push(`invalid-edge:${e.id}`);}
 const sample=findPathV2143({x:1500,y:1050},{x:490,y:800});if(!sample.ok)errors.push('capital-to-farmland-route-unreachable');
 return Object.freeze({ok:errors.length===0,version:2143,nodes:nodes.length,edges:edges.length,roadLinks:frozenNetwork.coverage.roadLinks,gateApproaches:frozenNetwork.coverage.gateApproaches,landmarkFootpaths:frozenNetwork.coverage.landmarkFootpaths,sampleRoute:sample.ok,errors:Object.freeze(errors)});
}
if(typeof window!=='undefined'){window.ETRANOM_PATH_SYSTEM_V2143=ETRANOM_PATH_SYSTEM_V2143;window.ETRANOM_PATH_SYSTEM_AUDIT_V2143=auditPathSystemV2143();window.ETRANOM_FIND_PATH_V2143=findPathV2143;window.ETRANOM_IS_WALKABLE_CORRIDOR_V2143=isOnWalkableCorridorV2143;}

export function drawPathSystemV2143(ctx,camX=0,camY=0){
 if(!ctx||typeof ctx.beginPath!=='function')return;
 for(const e of edges){if(e.kind!=='landmark-footpath')continue;
  const pts=e.points;if(!pts.some(([x,y])=>x>=camX-260&&x<=camX+1120&&y>=camY-220&&y<=camY+1020))continue;
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle='rgba(14,13,12,.24)';ctx.lineWidth=e.width+3;ctx.stroke();
  ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle='rgba(91,72,48,.78)';ctx.lineWidth=e.width;ctx.stroke();
  ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle='rgba(150,125,82,.42)';ctx.lineWidth=Math.max(2,e.width*.28);ctx.stroke();
  // Irregular worn stepping marks: procedural vector detail, no missing sprite dependency.
  for(let i=1;i<pts.length;i++){const [x1,y1]=pts[i-1],[x2,y2]=pts[i],len=Math.hypot(x2-x1,y2-y1);const count=Math.max(1,Math.floor(len/34));for(let k=1;k<count;k++){const t=k/count,x=x1+(x2-x1)*t,y=y1+(y2-y1)*t;ctx.fillStyle='rgba(35,31,25,.34)';ctx.beginPath();ctx.ellipse(x,y,2.2,1.25,Math.atan2(y2-y1,x2-x1),0,Math.PI*2);ctx.fill();}}
  ctx.restore();
 }
}
