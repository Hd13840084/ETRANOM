import fs from 'node:fs';
import { ETRANOM_WORLD_SCALE_CALIBRATION_V2170, auditWorldScaleCalibrationV2170 } from '../systems/world/world-scale-calibration-v2170.js';
import { ETRANOM_VEHICLE_SYSTEM_V2149, auditVehicleSystemV2149 } from '../systems/world/vehicle-system-v2149.js';
import { ETRANOM_TREES_VEGETATION_V2148 } from '../systems/safe-zone/trees-vegetation-v2148.js';
import { ENVIRONMENTAL_PROPS_V2147 } from '../systems/safe-zone/environmental-props-v2147.js';
import { ETRANOM_AUTHORED_SAFE_WORLD_PROP_PLACEMENTS_V2137 } from '../systems/safe-zone/authored-props-v2137.js';
import { ETRANOM_BUILDING_YARD_PLACEMENTS_V2117 } from '../systems/safe-zone/building-yards-v2117.js';
import { OUTDOOR_VILLAGE_LIFE_V2115, OUTDOOR_VILLAGE_LIFE_PLACEMENTS_V2170 } from '../systems/safe-zone/outdoor-village-life-v2115.js';
import { SETTLEMENT_MICRO_LANDSCAPE_PLACEMENTS_V2170 } from '../systems/safe-zone/settlement-micro-landscape-v2110.js';
import { ETRANOM_BUILDING_ARCHITECTURE_V2141, resolveBuildingDimensionsV2141 } from '../systems/safe-zone/building-architecture-v2141.js';
const game=fs.readFileSync('game.js','utf8');
function extractArray(name){
 const start=game.indexOf(`const ${name} = [`); if(start<0)return [];
 const open=game.indexOf('[',start); let depth=0,quote=null,esc=false,end=-1;
 for(let i=open;i<game.length;i++){const c=game[i];if(quote){if(esc)esc=false;else if(c==='\\')esc=true;else if(c===quote)quote=null;continue;}if(c==='"'||c==="'"||c==='`'){quote=c;continue;}if(c==='[')depth++;else if(c===']'&&--depth===0){end=i+1;break;}}
 if(end<0)return [];
 const block=game.slice(open,end);
 return [...block.matchAll(/\{\s*id:\s*"([^"]+)"[\s\S]*?zone:\s*"([^"]+)"[\s\S]*?x:\s*(-?[\d.]+),\s*y:\s*(-?[\d.]+)(?:,\s*w:\s*([\d.]+))?(?:,\s*h:\s*([\d.]+))?/g)].map(m=>({id:m[1],zone:m[2],x:+m[3],y:+m[4],width:m[5]?+m[5]:null,height:m[6]?+m[6]:null}));
}
const poi=extractArray('cityPOI');
const npcs=extractArray('safeNPCs');
const byRegion={};
for(const r of ETRANOM_WORLD_SCALE_CALIBRATION_V2170.settlements){byRegion[r]={buildings:poi.filter(x=>(r==='ashen_city'?'city':r==='farmland'?'grain':r==='rootwood'?'rootwood':'ironhollow')===x.zone).length,vehicles:ETRANOM_VEHICLE_SYSTEM_V2149.placements.filter(x=>x.region===r).length,trees:ETRANOM_TREES_VEGETATION_V2148.trees.filter(x=>x.biome===r).length,understory:ETRANOM_TREES_VEGETATION_V2148.understory.filter(x=>x.biome===r).length,environmentProps:ENVIRONMENTAL_PROPS_V2147.placements.filter(x=>x.region===r).length,ambientWorkers:OUTDOOR_VILLAGE_LIFE_PLACEMENTS_V2170.filter(x=>x.settlement===r).length};}
const normalizeZone=z=>z==='city'?'ashen_city':z==='grain'?'farmland':z==='ironhollow'?'ironstone':z;
const workers=OUTDOOR_VILLAGE_LIFE_V2115;
for(const [zone,x,y,job] of []){} // keeps generated report schema explicit
const buildings=poi.map(p=>{const spec=ETRANOM_BUILDING_ARCHITECTURE_V2141[p.id];const d=resolveBuildingDimensionsV2141({...p,w:p.width,h:p.height});return {...p,settlement:normalizeZone(p.zone),architecture:spec?.archetype||null,floors:spec?.floors||null,footprint:d?{length:d.length,depth:d.depth,wallHeight:d.wallHeight,roofHeight:d.roofHeight,spriteWidth:d.spriteWidth}:null,door:{clearWidthUnits:Math.round((p.width||0)*.16),clearHeightRatio:.62}};});
const report={version:2170,generatedAt:new Date().toISOString(),method:'authored gameplay calibration; 40 logical units per metre; sprite dimensions read from source PNGs; no claim of field survey or in-browser visual QA',calibration:ETRANOM_WORLD_SCALE_CALIBRATION_V2170,audits:{scale:auditWorldScaleCalibrationV2170(),vehicles:auditVehicleSystemV2149()},settlementCounts:byRegion,counts:{buildings:buildings.length,npcs:npcs.length,trees:ETRANOM_TREES_VEGETATION_V2148.trees.length,understory:ETRANOM_TREES_VEGETATION_V2148.understory.length,environmentalProps:ENVIRONMENTAL_PROPS_V2147.placements.length,authoredProps:ETRANOM_AUTHORED_SAFE_WORLD_PROP_PLACEMENTS_V2137.length,buildingYardProps:ETRANOM_BUILDING_YARD_PLACEMENTS_V2117.length,microLandscapeProps:SETTLEMENT_MICRO_LANDSCAPE_PLACEMENTS_V2170.length,vehicles:ETRANOM_VEHICLE_SYSTEM_V2149.placements.length,ambientWorkers:workers.residents},placements:{ambientWorkers:OUTDOOR_VILLAGE_LIFE_PLACEMENTS_V2170.map(x=>({...x})),buildings,npcs,vehicles:ETRANOM_VEHICLE_SYSTEM_V2149.placements.map(v=>({id:v.id,settlement:v.region,asset:v.file,widthUnits:v.width,lengthUnits:v.length,heightUnits:v.height,widthMeters:v.width/40,lengthMeters:v.length/40,heightMeters:v.height/40,footprint:v.footprint})),trees:ETRANOM_TREES_VEGETATION_V2148.trees.map(x=>({...x})),understory:ETRANOM_TREES_VEGETATION_V2148.understory.map(x=>({...x})),environmentalProps:ENVIRONMENTAL_PROPS_V2147.placements.map(x=>({...x})),authoredProps:ETRANOM_AUTHORED_SAFE_WORLD_PROP_PLACEMENTS_V2137.map(x=>({...x})),buildingYardProps:ETRANOM_BUILDING_YARD_PLACEMENTS_V2117.map(x=>({...x})),microLandscapeProps:SETTLEMENT_MICRO_LANDSCAPE_PLACEMENTS_V2170.map(x=>({...x}))}};
fs.writeFileSync('reports/WORLD_SCALE_AUDIT_V2170.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({counts:report.counts,settlementCounts:report.settlementCounts,buildingCount:buildings.length,npcCount:npcs.length},null,2));
