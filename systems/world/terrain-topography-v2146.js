// ETRANOM V2146 — Stage 8/24: authored terrain relief and topographic surface model.
// Coordinates remain in the existing logical world plane; elevations are world-height units,
// not metres. This module adds deterministic relief sampling, biome landforms, grade profiles,
// contour visualization and an audit contract without changing legacy movement/collision.
import { ETRANOM_WORLD_GEOMETRY_V2140 } from './world-geometry-v2140.js?v=2140';

const freeze = (v) => { if (!v || typeof v !== 'object' || Object.isFrozen(v)) return v; Object.values(v).forEach(freeze); return Object.freeze(v); };
const round = (v) => Math.round(v * 1000) / 1000;
const LAND_FORMS = [
 { id:'ashen_city_ridge', biome:'ashen_citadel', center:[1775,760], radii:[245,170], peak:34, falloff:1.65, type:'weathered-ridge', material:'basalt-and-ash', roughness:0.08 },
 { id:'ashen_city_basin', biome:'ashen_citadel', center:[1430,1390], radii:[300,205], peak:-8, falloff:1.35, type:'settlement-basin', material:'compacted-ash-loam', roughness:0.025 },
 { id:'farmland_low_hill_west', biome:'ashen-border-farmland', center:[285,560], radii:[220,180], peak:22, falloff:1.7, type:'rounded-fallow-hill', material:'dry-loam-and-stubble', roughness:0.045 },
 { id:'farmland_drainage', biome:'ashen-border-farmland', center:[650,990], radii:[270,110], peak:-13, falloff:1.2, type:'shallow-drainage-swale', material:'dark-wet-loam', roughness:0.02 },
 { id:'rootwood_rootmound_north', biome:'haunted-rootwood', center:[2450,575], radii:[250,185], peak:28, falloff:1.55, type:'rootbound-mound', material:'root-laced-moss', roughness:0.12 },
 { id:'rootwood_creek_gorge', biome:'haunted-rootwood', center:[2180,1190], radii:[330,115], peak:-18, falloff:1.1, type:'shallow-creek-gorge', material:'wet-stone-and-moss', roughness:0.06 },
 { id:'ironstone_quarry_rim', biome:'iron-hollow-highland', center:[2100,1900], radii:[270,220], peak:46, falloff:1.8, type:'broken-quarry-rim', material:'stratified-slate', roughness:0.16 },
 { id:'ironstone_saddle', biome:'iron-hollow-highland', center:[1660,2310], radii:[260,140], peak:17, falloff:1.45, type:'rocky-saddle', material:'ironstone-gravel', roughness:0.09 }
];
const WATER_LEVELS = [
 { id:'keshtezar_irrigation', level:-7, bankRise:5, bankWidth:18 },
 { id:'rootwood_creek', level:-14, bankRise:8, bankWidth:28 },
 { id:'ashen_city_reflecting_pool', level:-5, bankRise:3, bankWidth:12 },
 { id:'sang_ahan_spring', level:-11, bankRise:6, bankWidth:16 }
];
const SLOPE_CLASSES = Object.freeze([
 {id:'flat',maxGradient:0.035,walkable:true,vehicle:'all'},
 {id:'gentle',maxGradient:0.085,walkable:true,vehicle:'cart-reduced'},
 {id:'moderate',maxGradient:0.16,walkable:true,vehicle:'foot-only'},
 {id:'steep',maxGradient:0.29,walkable:'conditional',vehicle:'blocked'},
 {id:'cliff',maxGradient:1,walkable:false,vehicle:'blocked'}
]);
function gaussian(form,x,y){const dx=(x-form.center[0])/form.radii[0],dy=(y-form.center[1])/form.radii[1];const q=dx*dx+dy*dy; if(q>8)return 0; const base=form.peak*Math.exp(-q*form.falloff); const ripple=1+form.roughness*(Math.sin(x*.031+form.center[0])*.55+Math.cos(y*.027-form.center[1])*.45);return base*ripple;}
export function sampleTerrainElevationV2146(x,y){let z=0;for(const f of LAND_FORMS)z+=gaussian(f,x,y);return round(z);}
export function sampleTerrainGradientV2146(x,y,step=4){const dx=(sampleTerrainElevationV2146(x+step,y)-sampleTerrainElevationV2146(x-step,y))/(2*step);const dy=(sampleTerrainElevationV2146(x,y+step)-sampleTerrainElevationV2146(x,y-step))/(2*step);const magnitude=Math.hypot(dx,dy);const slope=SLOPE_CLASSES.find(s=>magnitude<=s.maxGradient)||SLOPE_CLASSES.at(-1);return Object.freeze({dx:round(dx),dy:round(dy),gradient:round(magnitude),slopeClass:slope.id,walkable:slope.walkable,vehicle:slope.vehicle});}
export function resolveTerrainSurfaceV2146(x,y){const z=sampleTerrainElevationV2146(x,y);const form=LAND_FORMS.map(f=>({f,v:Math.abs(gaussian(f,x,y))})).sort((a,b)=>b.v-a.v)[0];const gradient=sampleTerrainGradientV2146(x,y);return Object.freeze({x,y,elevation:z,biome:form?.f.biome||'transition',landform:form?.f.type||'rolling-transition',material:form?.f.material||'mixed-weathered-earth',...gradient});}
export const ETRANOM_TERRAIN_TOPOGRAPHY_V2146=freeze({version:2146,stage:8,stageName:'Terrain & Topography',coordinateContract:'existing-world-logical-units; elevation is relative world-height, not metres',landforms:LAND_FORMS.map(f=>({...f,center:{x:f.center[0],y:f.center[1]},dimensions:{length:f.radii[0]*2,width:f.radii[1]*2,peakHeight:f.peak}})),waterLevels:WATER_LEVELS,slopeClasses:SLOPE_CLASSES,roadGradePolicy:{maxPreferredGradient:.085,maxAbsoluteGradient:.16,cutFill:'blend-terrain-into-roadbed',retainingWalls:'required-when-cut-or-fill-exceeds-18-world-height',switchbacks:'required-for-long-steep-access'},cliffPolicy:{visual:'exposed-rock-face-with-strata',walkability:false,edgeTreatment:'broken-rock-lip-and-debris-apron'},shorePolicy:{bank:'graded-transition',waterSurface:'below-adjacent-bank',crossing:'bridge-or-authored-shallow-crossing-only'},legacyGeometryPreserved:true});
function contourPath(ctx,cx,cy,rx,ry,phase){ctx.beginPath();for(let i=0;i<=64;i++){const a=i/64*Math.PI*2;const wobble=1+Math.sin(a*5+phase)*.025+Math.cos(a*3-phase)*.018;const x=cx+Math.cos(a)*rx*wobble,y=cy+Math.sin(a)*ry*wobble;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();}
export function drawTerrainTopographyV2146(ctx,camX=0,camY=0){if(!ctx?.save||!ctx?.stroke)return{contours:0};let contours=0;const view={l:camX-180,r:camX+900,t:camY-140,b:camY+800};for(const f of LAND_FORMS){const [x,y]=f.center,[rx,ry]=f.radii;if(x+rx<view.l||x-rx>view.r||y+ry<view.t||y-ry>view.b)continue;ctx.save();ctx.lineWidth=1;ctx.strokeStyle=f.peak<0?'rgba(25,35,34,.16)':'rgba(12,15,18,.19)';for(let i=1;i<=5;i++){const scale=.22+i*.145;contourPath(ctx,x,y,rx*scale,ry*scale,f.center[0]*.001);ctx.stroke();contours++;}ctx.restore();}return{contours,landforms:LAND_FORMS.length};}
export function auditTerrainTopographyV2146(){const geometry=ETRANOM_WORLD_GEOMETRY_V2140;const ids=new Set(LAND_FORMS.map(f=>f.id));return Object.freeze({ok:LAND_FORMS.length===8&&ids.size===8&&WATER_LEVELS.length===4&&geometry.terrainFootprints.length===4&&SLOPE_CLASSES.length===5,version:2146,stage:8,landforms:LAND_FORMS.length,waterFeatures:WATER_LEVELS.length,slopeClasses:SLOPE_CLASSES.length,legacySettlementFootprints:geometry.terrainFootprints.length,metreCalibration:false,physicalColliders:false,navmeshIntegration:false});}
