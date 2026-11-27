// ETRANOM V2165 — object-attached snow load, roof-panel deflection and branch sag.
// The same per-object state drives structural stress, walkable support height and visible snow caps.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const DENSITY=180, GRAVITY=9.80665;
export function createSnowStructuralStateV2165(existing=null){
  const s=existing&&typeof existing==='object'?existing:{};s.version=2165;s.objects=s.objects&&typeof s.objects==='object'?s.objects:{};s.lastStep=Number(s.lastStep)||0;return s;
}
function ensureObject(state,id,type,areaM2,capacityPa){
  return state.objects[id]||(state.objects[id]={id,type,areaM2:Math.max(.05,areaM2),capacityPa,depthM:0,loadPa:0,deflectionM:0,stressRatio:0,branches:[],lastUpdated:0});
}
export function stepSnowStructuralGeometryV2165(existing,weather={},dtGameHours=0,buildings=[],trees=[]){
  const state=createSnowStructuralStateV2165(existing),dt=clamp(dtGameHours,0,.1),temperature=Number.isFinite(Number(weather.temperatureC))?Number(weather.temperatureC):(weather.season==='winter'?-3:8),snowfall=clamp(weather.snow,0,1),rain=clamp(weather.rain,0,1);
  const accumulationRate=snowfall*(temperature<=1?.045:.012);
  const meltRate=temperature>1.5?((temperature-1.5)*.0024+rain*.003):0;
  const seen=new Set();
  for(const b of buildings||[]){
    if(!b?.id||!Number.isFinite(Number(b.x))||!Number.isFinite(Number(b.y)))continue;
    const w=Math.max(2,Number(b.w)||170),h=Math.max(2,Number(b.h)||120),surface=ensureObject(state,`roof:${b.id}`,'roof',Math.max(.1,(w/40)*(h/40)),1350);seen.add(surface.id);
    surface.depthM=clamp(surface.depthM+accumulationRate*dt-meltRate*dt,0,.8);
    const load=snowLoadPressure(surface.depthM);surface.loadPa=load;surface.stressRatio=load/surface.capacityPa;
    // A simple elastic roof-panel model: deflection increases with load and panel span squared.
    const span=Math.max(w,h)/40;surface.deflectionM=clamp((load/Math.max(1,surface.capacityPa))*Math.pow(span/5,2)*.018,0,.18);
    surface.vertices=[{x:-w/2,y:-h/2,z:surface.deflectionM*.15},{x:w/2,y:-h/2,z:surface.deflectionM*.15},{x:w/2,y:h/2,z:surface.deflectionM*.15},{x:-w/2,y:h/2,z:surface.deflectionM*.15},{x:0,y:0,z:-surface.deflectionM}];surface.lastUpdated=Date.now();
  }
  for(const tree of trees||[]){
    if(!tree?.id||!Number.isFinite(Number(tree.x))||!Number.isFinite(Number(tree.y)))continue;
    const width=Math.max(20,Number(tree.width||tree.size)||80),branchCount=6,area=Math.max(.08,Math.PI*Math.pow(width/40*.10,2)*branchCount);
    const surface=ensureObject(state,`canopy:${tree.id}`,'canopy',area,850);seen.add(surface.id);
    surface.depthM=clamp(surface.depthM+accumulationRate*dt-meltRate*dt,0,.55);
    const totalLoadKg=surface.depthM*DENSITY*area,perBranchForce=totalLoadKg*GRAVITY/branchCount,stiffness=420+width*2.2;
    surface.branches=Array.from({length:branchCount},(_,i)=>{const lengthM=width/40*(.17+(i%3)*.025),deflection=clamp(perBranchForce*Math.pow(lengthM,2)/(3*stiffness),0,lengthM*.38);return {angle:i*Math.PI*2/branchCount,lengthM,deflectionM:deflection,deflectionUnits:deflection*40};});
    surface.loadPa=surface.depthM*DENSITY*GRAVITY;surface.stressRatio=surface.loadPa/surface.capacityPa;surface.deflectionM=Math.max(0,...surface.branches.map(b=>b.deflectionM));surface.lastUpdated=Date.now();
  }
  // Drop stale records for removed/dynamic scene objects without losing current season state.
  for(const id of Object.keys(state.objects))if(!seen.has(id)&&Date.now()-(state.objects[id].lastUpdated||0)>7*86400000)delete state.objects[id];
  state.lastStep=Date.now();return state;
}
function snowLoadPressure(depth){return depth*DENSITY*GRAVITY;}
export function getSnowStructuralGeometryV2165(state,id){const row=state?.objects?.[id];return row?Object.freeze({...row,vertices:row.vertices?Object.freeze(row.vertices.map(v=>Object.freeze({...v}))):undefined,branches:row.branches?Object.freeze(row.branches.map(v=>Object.freeze({...v}))):undefined}):null;}
export function getSnowStructuralSupportOffsetV2165(state,id){const row=state?.objects?.[id];return row?.type==='roof'?Number(row.deflectionM)||0:row?.type==='canopy'?Number(row.deflectionM)||0:0;}
export function drawSnowRoofGeometryV2165(ctx,camX,camY,state,buildings=[]){
  if(!ctx?.save||!state?.objects)return {drawn:0};let drawn=0;ctx.save();
  for(const b of buildings||[]){const row=state.objects[`roof:${b.id}`];if(!row||row.depthM<.003||b.x<camX-180||b.x>camX+980||b.y<camY-220||b.y>camY+900)continue;
    const w=Math.max(30,Number(b.w)||170)*.46,h=Math.max(20,Number(b.h)||120)*.3,y=Number(b.y)-Math.max(20,Number(b.h)||120)*.76,sag=(row.deflectionM||0)*40;
    ctx.beginPath();ctx.moveTo(b.x,y-h-sag*.1);ctx.lineTo(b.x+w,y-sag*.45);ctx.lineTo(b.x,y+h-sag);ctx.lineTo(b.x-w,y-sag*.45);ctx.closePath();
    ctx.fillStyle=`rgba(231,242,249,${clamp(.18+row.depthM*.9,.18,.72)})`;ctx.fill();ctx.strokeStyle='rgba(248,252,255,.62)';ctx.lineWidth=1.3;ctx.stroke();drawn++;
  }
  ctx.restore();return Object.freeze({drawn});
}
export function drawSnowBranchGeometryV2165(ctx,camX,camY,state,trees=[]){
  if(!ctx?.save||!state?.objects)return {drawn:0};let drawn=0;ctx.save();ctx.strokeStyle='rgba(238,247,252,.78)';ctx.lineCap='round';
  for(const t of trees||[]){const row=state.objects[`canopy:${t.id}`];if(!row||row.depthM<.003||t.x<camX-180||t.x>camX+980||t.y<camY-220||t.y>camY+900)continue;
    const width=Math.max(20,Number(t.width||t.size)||80),canopyY=Number(t.y)-width*.38;
    for(const branch of row.branches||[]){const len=branch.lengthM*40,dx=Math.cos(branch.angle)*len,dy=Math.sin(branch.angle)*len*.55,sag=branch.deflectionUnits||0;ctx.beginPath();ctx.moveTo(t.x,canopyY);ctx.quadraticCurveTo(t.x+dx*.48,canopyY+dy*.48+sag*.2,t.x+dx,canopyY+dy+sag);ctx.lineWidth=clamp(1+row.depthM*3,.8,3.5);ctx.stroke();ctx.beginPath();ctx.ellipse(t.x+dx,canopyY+dy+sag,Math.max(2,width*.045),Math.max(1,width*.018),branch.angle,0,Math.PI*2);ctx.fillStyle=`rgba(239,248,253,${clamp(.12+row.depthM*.9,.12,.7)})`;ctx.fill();}drawn++;
  }
  ctx.restore();return Object.freeze({drawn});
}
export function auditSnowStructuralGeometryV2165(){
  const buildings=[{id:'roof-test',x:0,y:0,w:200,h:120}],trees=[{id:'tree-test',x:0,y:0,width:90}],state=stepSnowStructuralGeometryV2165(null,{season:'winter',snow:1,temperatureC:-5},.08,buildings,trees),roof=state.objects['roof:roof-test'],canopy=state.objects['canopy:tree-test'],errors=[];
  if(!(roof?.depthM>0&&roof.deflectionM>0&&roof.vertices?.length===5))errors.push('roof-not-deformed');
  if(!(canopy?.depthM>0&&canopy.branches?.length===6&&canopy.deflectionM>0))errors.push('branches-not-deformed');
  const initialDepth=roof.depthM;
  const melted=stepSnowStructuralGeometryV2165(state,{season:'spring',snow:0,rain:1,temperatureC:12},.1,buildings,trees);
  if(!(melted.objects['roof:roof-test'].depthM<initialDepth))errors.push('structural-snow-not-melted');
  return Object.freeze({ok:errors.length===0,version:2165,stage:23,roofNodes:roof?.vertices?.length||0,treeBranchNodes:canopy?.branches?.length||0,errors:Object.freeze(errors)});
}
