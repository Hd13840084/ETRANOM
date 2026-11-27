// ETRANOM V2142 — Stage 5/24: road-system geometry and surface rendering.
// Uses canonical V2140 route/gate coordinates. Visual surface only: collision and nav remain deferred.
import { ETRANOM_WORLD_GEOMETRY_V2140 } from './world-geometry-v2140.js?v=2140';

const freeze = (v) => { if (!v || typeof v !== 'object' || Object.isFrozen(v)) return v; Object.values(v).forEach(freeze); return Object.freeze(v); };
const ROUTE_STYLE = {
  capital_to_farmland: { class: 'secondary-rural-road', surface: 'packed-earth', edge: '#4b3928', base: '#806544', wear: '#b09161', shoulder: '#514633' },
  capital_to_rootwood: { class: 'forest-road', surface: 'rootbound-dirt', edge: '#302d26', base: '#514737', wear: '#777052', shoulder: '#39392d' },
  capital_to_ironstone: { class: 'stone-road', surface: 'broken-slate', edge: '#343332', base: '#68645b', wear: '#969083', shoulder: '#484641' }
};
const roads = ETRANOM_WORLD_GEOMETRY_V2140.routes.map((r) => ({
  id: r.id, from: r.from, to: r.to, geometryType: 'polyline-with-cross-section',
  roadClass: ROUTE_STYLE[r.id]?.class || 'connector-road', centerline: r.centerline.map(p => [...p]),
  length: r.dimensions.length, carriagewayWidth: r.width, shoulderWidth: Math.max(5, r.width * .22),
  totalWidth: r.width + Math.max(5, r.width * .44),
  crossSection: { carriageway: r.width, leftShoulder: Math.max(5, r.width * .22), rightShoulder: Math.max(5, r.width * .22), curb: 0, sidewalk: 0 },
  material: { ...ROUTE_STYLE[r.id] },
  passability: { category: 'intended-travel-corridor', navigation: 'stage-06', collision: 'stage-19' },
  elevation: { profile: 'stage-08', baseZ: 0 },
  destructibility: { policy: 'surface-wear-visual-only; non-destructible-by-project-scope' },
  source: 'world-geometry-v2140'
}));
const approaches = ETRANOM_WORLD_GEOMETRY_V2140.gateApproaches.map(a => ({
  id: a.id, gateId: a.gateId, geometryType: 'quadratic-road-approach', kind: a.kind,
  start: { ...a.gate }, control: { ...a.control }, end: { ...a.end }, width: a.corridorWidth,
  roadClass: 'gate-access-track', passability: { category: 'visual-approach-only', gateRules: 'preserved', navigation: 'stage-06' },
  collision: 'stage-19', material: `worn-${a.kind}-approach`
}));
export const ETRANOM_ROAD_SYSTEM_V2142 = freeze({
  version: 2142, stage: 5, stageName: 'Road System', coordinateUnit: 'legacy-logical-world-unit-not-metres',
  roadClasses: ['primary-road', 'secondary-rural-road', 'forest-road', 'stone-road', 'gate-access-track', 'alley-deferred-to-authored-local-layout'],
  crossSectionRules: { shoulder: 'visual-ground-transition', curb: 'not-authored-without-local-street-geometry', sidewalk: 'not-invented-where-no-surveyed-footpath-exists', bridges: 'existing-authored-bridge-sprites-retained' },
  roads, gateApproaches: approaches,
  retainedAssets: ['road_straight.png','road_curve.png','road_crossing.png','wood_bridge.png','stone_bridge.png','street_lamp.png'],
  explicitDeferrals: { localAlleys: 'requires surveyed building-to-building layout', sidewalksAndCurbs: 'stage-05 metadata only where source geometry exists; no fabricated urban grid', navmesh: 'stage-06', zGrade: 'stage-08', physicalCollision: 'stage-19', destruction: 'excluded-by-project-owner' }
});
const pathStroke = (ctx, points, width, color) => { ctx.beginPath(); points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y)); ctx.lineCap='round'; ctx.lineJoin='round'; ctx.strokeStyle=color; ctx.lineWidth=width; ctx.stroke(); };
const inView = (p,cx,cy) => p.some(([x,y]) => x >= cx-260 && x <= cx+1120 && y >= cy-220 && y <= cy+1020);
export function drawRoadSystemV2142(ctx, camX=0, camY=0) {
  if (!ctx || typeof ctx.beginPath !== 'function') return;
  for (const road of ETRANOM_ROAD_SYSTEM_V2142.roads) {
    const style=road.material, pts=road.centerline; if(!inView(pts,camX,camY)) continue;
    ctx.save();
    // Ground contact shadow, earthen shoulder, compacted carriageway and worn wheel lanes.
    pathStroke(ctx,pts,road.totalWidth+8,'rgba(12,11,10,.23)');
    pathStroke(ctx,pts,road.totalWidth,style.shoulder);
    pathStroke(ctx,pts,road.carriagewayWidth+2,style.edge);
    pathStroke(ctx,pts,road.carriagewayWidth,style.base);
    pathStroke(ctx,pts,Math.max(2,road.carriagewayWidth*.56),style.wear);
    pathStroke(ctx,pts,Math.max(1,road.carriagewayWidth*.055),'rgba(28,25,21,.34)');
    // Broken, offset wheel ruts; subtle enough not to read as lane markings.
    for(let i=0;i<pts.length-1;i++){
      const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
      for(const side of [-.29,.29]){ctx.strokeStyle='rgba(24,21,18,.26)';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(a[0]+nx*road.carriagewayWidth*side,a[1]+ny*road.carriagewayWidth*side);ctx.lineTo(b[0]+nx*road.carriagewayWidth*side,b[1]+ny*road.carriagewayWidth*side);ctx.stroke();}
    }
    ctx.restore();
  }
  for(const a of ETRANOM_ROAD_SYSTEM_V2142.gateApproaches){
    const pts=[[a.start.x,a.start.y],[a.control.x,a.control.y],[a.end.x,a.end.y]];if(!inView(pts,camX,camY))continue;
    ctx.save();ctx.beginPath();ctx.moveTo(...pts[0]);ctx.quadraticCurveTo(...pts[1],...pts[2]);ctx.lineCap='round';ctx.strokeStyle='rgba(18,16,14,.24)';ctx.lineWidth=a.width+6;ctx.stroke();
    ctx.beginPath();ctx.moveTo(...pts[0]);ctx.quadraticCurveTo(...pts[1],...pts[2]);ctx.strokeStyle=a.kind==='wood'?'#514638':a.kind==='stone'?'#6d685e':a.kind==='ore'?'#625e57':'#776044';ctx.lineWidth=a.width;ctx.stroke();ctx.restore();
  }
}
export function auditRoadSystemV2142(){
 const errors=[],ids=new Set();
 for(const r of ETRANOM_ROAD_SYSTEM_V2142.roads){if(ids.has(r.id))errors.push(`duplicate_road:${r.id}`);ids.add(r.id);if(r.centerline.length<2||r.centerline.some(p=>p.length!==2||!p.every(Number.isFinite)))errors.push(`invalid_centerline:${r.id}`);if(!(r.carriagewayWidth>0&&r.totalWidth>=r.carriagewayWidth))errors.push(`invalid_cross_section:${r.id}`);}
 const gateIds=new Set();for(const a of ETRANOM_ROAD_SYSTEM_V2142.gateApproaches){if(gateIds.has(a.gateId))errors.push(`duplicate_gate_approach:${a.gateId}`);gateIds.add(a.gateId);if(![a.start.x,a.start.y,a.control.x,a.control.y,a.end.x,a.end.y,a.width].every(Number.isFinite)||a.width<=0)errors.push(`invalid_gate_approach:${a.id}`);}
 return Object.freeze({ok:errors.length===0,version:2142,roads:ids.size,gateApproaches:gateIds.size,errors:Object.freeze(errors)});
}
if(typeof window!=='undefined'){window.ETRANOM_ROAD_SYSTEM_V2142=ETRANOM_ROAD_SYSTEM_V2142;window.ETRANOM_ROAD_SYSTEM_AUDIT_V2142=auditRoadSystemV2142();}
