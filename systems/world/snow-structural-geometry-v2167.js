// ETRANOM V2167 — deformable snow-loaded roof and tree-branch meshes.
// The visible renderer consumes the same deformed vertices used by the structural state;
// mesh/collider descriptions are exported for physics and validation consumers.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0)),DENSITY=180,GRAVITY=9.80665,UNIT=40;
const freeze=v=>{if(!v||typeof v!=='object'||Object.isFrozen(v))return v;Object.values(v).forEach(freeze);return Object.freeze(v);};
export function createSnowStructuralStateV2167(existing=null){const s=existing&&typeof existing==='object'?existing:{};s.version=2167;s.objects=s.objects&&typeof s.objects==='object'?s.objects:{};s.lastStep=Number(s.lastStep)||0;return s;}
function ensureObject(state,id,type,areaM2,capacityPa){return state.objects[id]||(state.objects[id]={id,type,areaM2:Math.max(.05,areaM2),capacityPa,depthM:0,loadPa:0,deflectionM:0,stressRatio:0,vertices:[],triangles:[],branches:[],lastUpdated:0});}
function roofMesh(b,deflection){
 const w=Math.max(30,Number(b.w)||170)*.46,h=Math.max(20,Number(b.h)||120)*.30;
 const baseVertices=[{x:-w,y:0,z:0},{x:0,y:-h,z:0},{x:w,y:0,z:0},{x:0,y:h,z:0},{x:0,y:0,z:0}];
 const vertices=baseVertices.map(v=>({...v}));vertices[1].z=-deflection*.08;vertices[3].z=-deflection*.08;vertices[4].z=-deflection;
 return {vertices,triangles:[[0,1,4],[1,2,4],[2,3,4],[3,0,4]],baseVertices};
}
function treeBranchMesh(tree,width,depth){
 const branchCount=8,area=Math.max(.08,Math.PI*Math.pow(width/UNIT*.1,2)*branchCount),mass=depth*DENSITY*area,force=mass*GRAVITY/branchCount,stiffness=420+width*2.2;
 const branches=Array.from({length:branchCount},(_,i)=>{
  const angle=i*Math.PI*2/branchCount,lengthM=width/UNIT*(.17+(i%3)*.025),deflection=clamp(force*Math.pow(lengthM,2)/(3*stiffness),0,lengthM*.38),lengthU=lengthM*UNIT;
  const dx=Math.cos(angle)*lengthU,dy=Math.sin(angle)*lengthU*.55,root={x:0,y:0,z:0},end={x:dx,y:dy,z:-deflection*UNIT},control={x:dx*.48,y:dy*.48,z:-deflection*UNIT*.3};
  const radius=Math.max(.8,width*.012),vertices=[{x:root.x-radius,y:root.y,z:root.z},{x:root.x+radius,y:root.y,z:root.z},{x:control.x-radius*.55,y:control.y,z:control.z},{x:control.x+radius*.55,y:control.y,z:control.z},{x:end.x-radius*.18,y:end.y,z:end.z},{x:end.x+radius*.18,y:end.y,z:end.z}];
  return {angle,lengthM,deflectionM:deflection,deflectionUnits:deflection*UNIT,root,control,end,radius,vertices,triangles:[[0,1,2],[1,3,2],[2,3,4],[3,5,4]]};
 });
 return {branches,areaM2:area};
}
export function stepSnowStructuralGeometryV2167(existing,weather={},dtGameHours=0,buildings=[],trees=[]){
 const state=createSnowStructuralStateV2167(existing),dt=clamp(dtGameHours,0,.1),temp=Number.isFinite(Number(weather.temperatureC))?Number(weather.temperatureC):(weather.season==='winter'?-3:8),snow=clamp(weather.snow,0,1),rain=clamp(weather.rain,0,1),accumulation=snow*(temp<=1?.045:.012),melt=temp>1.5?((temp-1.5)*.0024+rain*.003):0,seen=new Set();
 for(const b of buildings||[]){if(!b?.id||!Number.isFinite(Number(b.x))||!Number.isFinite(Number(b.y)))continue;const w=Math.max(2,Number(b.w)||170),h=Math.max(2,Number(b.h)||120),id=`roof:${b.id}`,surface=ensureObject(state,id,'roof',Math.max(.1,(w/UNIT)*(h/UNIT)),1350);seen.add(id);surface.depthM=clamp(surface.depthM+accumulation*dt-melt*dt,0,.8);surface.loadPa=surface.depthM*DENSITY*GRAVITY;surface.stressRatio=surface.loadPa/surface.capacityPa;
  const span=Math.max(w,h)/UNIT;surface.deflectionM=clamp((surface.loadPa/Math.max(1,surface.capacityPa))*Math.pow(span/5,2)*.018,0,.18);const mesh=roofMesh(b,surface.deflectionM);surface.baseVertices=mesh.baseVertices;surface.vertices=mesh.vertices;surface.triangles=mesh.triangles;surface.mesh={type:'deformable-roof-panel',coordinateUnit:'logical-x-y/metre-z',vertices:surface.vertices,triangles:surface.triangles,deflectionM:surface.deflectionM};surface.collisionMesh={vertices:surface.vertices.map(v=>[v.x,v.y,v.z]),triangles:surface.triangles.map(t=>t.slice()),contactMode:'triangle-surface'};surface.lastUpdated=Date.now();
 }
 for(const tree of trees||[]){if(!tree?.id||!Number.isFinite(Number(tree.x))||!Number.isFinite(Number(tree.y)))continue;const width=Math.max(20,Number(tree.width||tree.size)||80),id=`canopy:${tree.id}`,surface=ensureObject(state,id,'canopy',Math.max(.08,Math.PI*Math.pow(width/UNIT*.1,2)*8),850);seen.add(id);surface.depthM=clamp(surface.depthM+accumulation*dt-melt*dt,0,.55);const mesh=treeBranchMesh(tree,width,surface.depthM);surface.branches=mesh.branches;surface.areaM2=mesh.areaM2;surface.loadPa=surface.depthM*DENSITY*GRAVITY;surface.stressRatio=surface.loadPa/surface.capacityPa;surface.deflectionM=Math.max(0,...surface.branches.map(b=>b.deflectionM));surface.mesh={type:'deformable-branch-canopy',coordinateUnit:'logical-x-y/metre-z',branches:surface.branches};surface.collisionMesh={branches:surface.branches.map(b=>({vertices:b.vertices.map(v=>[v.x,v.y,v.z]),triangles:b.triangles.map(t=>t.slice())})),contactMode:'branch-triangle-strips'};surface.lastUpdated=Date.now();
 }
 for(const id of Object.keys(state.objects))if(!seen.has(id)&&Date.now()-(state.objects[id].lastUpdated||0)>7*86400000)delete state.objects[id];state.lastStep=Date.now();return state;
}
export function getSnowStructuralGeometryV2167(state,id){const row=state?.objects?.[id];return row?structuredCloneSafe(row):null;}
function structuredCloneSafe(value){if(Array.isArray(value))return value.map(structuredCloneSafe);if(value&&typeof value==='object'){const out={};for(const [k,v] of Object.entries(value))out[k]=structuredCloneSafe(v);return out;}return value;}
export function getSnowStructuralSupportOffsetV2167(state,id){const row=state?.objects?.[id];return row?.type==='roof'||row?.type==='canopy'?Number(row.deflectionM)||0:0;}
export function getSnowStructuralCollisionMeshV2167(state,id){const row=state?.objects?.[id];return row?.collisionMesh?structuredCloneSafe(row.collisionMesh):null;}
export function drawSnowRoofGeometryV2167(ctx,camX,camY,state,buildings=[]){if(!ctx?.save||!state?.objects)return Object.freeze({drawn:0,triangles:0});let drawn=0,triangles=0;ctx.save();
 for(const b of buildings||[]){const row=state.objects[`roof:${b.id}`];if(!row||row.depthM<.003||b.x<camX-180||b.x>camX+980||b.y<camY-220||b.y>camY+900)continue;const originX=Number(b.x),originY=Number(b.y)-Math.max(20,Number(b.h)||120)*.76,verts=row.vertices||[];
  for(const indices of row.triangles||[]){const points=indices.map(i=>verts[i]);if(points.length!==3)continue;ctx.beginPath();points.forEach((v,i)=>{const x=originX+v.x,y=originY+v.y-v.z*UNIT;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();ctx.fillStyle=`rgba(231,242,249,${clamp(.16+row.depthM*.75,.16,.72)})`;ctx.fill();ctx.strokeStyle='rgba(248,252,255,.68)';ctx.lineWidth=1.25;ctx.stroke();triangles++;}drawn++;
 }
 ctx.restore();return Object.freeze({drawn,triangles});}
export function drawSnowBranchGeometryV2167(ctx,camX,camY,state,trees=[]){if(!ctx?.save||!state?.objects)return Object.freeze({drawn:0,branches:0,triangles:0});let drawn=0,branches=0,triangles=0;ctx.save();ctx.strokeStyle='rgba(238,247,252,.8)';ctx.lineCap='round';
 for(const tree of trees||[]){const row=state.objects[`canopy:${tree.id}`];if(!row||row.depthM<.003||tree.x<camX-180||tree.x>camX+980||tree.y<camY-220||tree.y>camY+900)continue;const width=Math.max(20,Number(tree.width||tree.size)||80),originX=Number(tree.x),originY=Number(tree.y)-width*.38;
  for(const branch of row.branches||[]){const root=branch.root,control=branch.control,end=branch.end,pts=[root,control,end];ctx.beginPath();ctx.moveTo(originX+root.x,originY+root.y-root.z*UNIT);ctx.quadraticCurveTo(originX+control.x,originY+control.y-control.z*UNIT,originX+end.x,originY+end.y-end.z*UNIT);ctx.lineWidth=clamp(1+row.depthM*3,.8,3.5);ctx.stroke();ctx.beginPath();ctx.ellipse(originX+end.x,originY+end.y-end.z*UNIT,Math.max(2,width*.045),Math.max(1,width*.018),branch.angle,0,Math.PI*2);ctx.fillStyle=`rgba(239,248,253,${clamp(.12+row.depthM*.9,.12,.7)})`;ctx.fill();branches+=1;triangles+=branch.triangles.length;}
  drawn++;
 }
 ctx.restore();return Object.freeze({drawn,branches,triangles});}
export function auditSnowStructuralGeometryV2167(){const buildings=[{id:'roof-test',x:0,y:0,w:200,h:120}],trees=[{id:'tree-test',x:0,y:0,width:90}],state=stepSnowStructuralGeometryV2167(null,{season:'winter',snow:1,temperatureC:-5},.08,buildings,trees),roof=state.objects['roof:roof-test'],canopy=state.objects['canopy:tree-test'],errors=[];if(!(roof?.depthM>0&&roof.deflectionM>0&&roof.vertices?.length===5&&roof.triangles?.length===4&&roof.collisionMesh?.triangles?.length===4))errors.push('roof-mesh-not-deformed');if(!(canopy?.depthM>0&&canopy.branches?.length===8&&canopy.branches.every(b=>b.vertices.length===6&&b.end.z<0)&&canopy.collisionMesh?.branches?.length===8))errors.push('branch-mesh-not-deformed');const base=roof.baseVertices[4].z,def=roof.vertices[4].z,initialDepth=roof.depthM;if(!(def<base))errors.push('roof-vertex-not-displaced');const melted=stepSnowStructuralGeometryV2167(state,{season:'spring',snow:0,rain:1,temperatureC:20},.1,buildings,trees);if(!(melted.objects['roof:roof-test'].depthM<initialDepth))errors.push('structural-snow-not-melted');return Object.freeze({ok:errors.length===0,version:2167,stage:25,roofNodes:roof?.vertices?.length||0,roofTriangles:roof?.triangles?.length||0,treeBranches:canopy?.branches?.length||0,branchTriangles:canopy?.branches?.reduce((n,b)=>n+b.triangles.length,0)||0,errors:Object.freeze(errors)});}
