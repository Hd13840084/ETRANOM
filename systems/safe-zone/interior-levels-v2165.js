// ETRANOM V2165 — independently navigable stacked interior floors with stair-gated transitions.
import { getInteriorArchitectureV2144, ETRANOM_INTERIOR_ARCHITECTURE_V2144 } from './interior-architecture-v2144.js?v=2144';
export const ETRANOM_INTERIOR_LEVELS_V2165=Object.freeze({version:2165,grid:{width:11,height:9},floorHeightMeters:3.25,floorHeightLogical:130});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
export function createInteriorLevelsStateV2165(buildingId,player={x:5,y:7}){
  const a=getInteriorArchitectureV2144(buildingId);if(!a)return null;
  const count=a.upperFloor&&a.stairs?.present?2:1;
  const start={x:clamp(player.x,0,10),y:clamp(player.y,0,8)},stairs=count>1?{x:Number(a.stairs.position.x),y:Number(a.stairs.position.y)}:null;
  return {version:2165,buildingId,floorCount:count,currentFloor:0,floorHeightMeters:ETRANOM_INTERIOR_LEVELS_V2165.floorHeightMeters,
    floors:Array.from({length:count},(_,index)=>({index,elevationMeters:index*ETRANOM_INTERIOR_LEVELS_V2165.floorHeightMeters,player:{...(index===0?start:stairs)}})),
    stairPosition:stairs};
}
export function getInteriorFloorPlayerV2165(state){return state?.floors?.[state.currentFloor]?.player||{x:5,y:7};}
export function setInteriorFloorPlayerV2165(state,player){const row=state?.floors?.[state.currentFloor];if(!row||!player)return false;row.player={x:clamp(player.x,0,10),y:clamp(player.y,0,8)};return true;}
export function changeInteriorFloorV2165(state,targetFloor,{stairTolerance=.95}={}){
  if(!state||!Number.isInteger(targetFloor)||targetFloor<0||targetFloor>=state.floorCount)return Object.freeze({ok:false,reason:'floor-not-available'});
  if(targetFloor===state.currentFloor)return Object.freeze({ok:true,changed:false,reason:null,state});
  const current=getInteriorFloorPlayerV2165(state),stairs=state.stairPosition;
  if(!stairs||Math.hypot(current.x-stairs.x,current.y-stairs.y)>Math.max(.35,Number(stairTolerance)||.95))return Object.freeze({ok:false,changed:false,reason:'move-to-stairs',distance:stairs?Math.hypot(current.x-stairs.x,current.y-stairs.y):Infinity});
  state.currentFloor=targetFloor;
  return Object.freeze({ok:true,changed:true,reason:null,state,floor:targetFloor,elevationMeters:state.floors[targetFloor].elevationMeters,player:getInteriorFloorPlayerV2165(state)});
}
export function auditInteriorLevelsV2165(){
  const errors=[];let multilevel=0;
  for(const [id,a] of Object.entries(ETRANOM_INTERIOR_ARCHITECTURE_V2144)) {
    const s=createInteriorLevelsStateV2165(id);if(!s){errors.push(`missing-level-state:${id}`);continue;}
    if(s.floorCount===2){multilevel++;const p=s.floors[0].player;s.floors[0].player={...s.stairPosition};const up=changeInteriorFloorV2165(s,1);if(!up.ok||s.currentFloor!==1)errors.push(`stair-up:${id}`);const down=changeInteriorFloorV2165(s,0);if(!down.ok||s.currentFloor!==0)errors.push(`stair-down:${id}`);s.floors[0].player=p;}
  }
  return Object.freeze({ok:errors.length===0,version:2165,stage:23,buildings:Object.keys(ETRANOM_INTERIOR_ARCHITECTURE_V2144).length,multilevelBuildings:multilevel,floorHeightMeters:ETRANOM_INTERIOR_LEVELS_V2165.floorHeightMeters,errors:Object.freeze(errors)});
}
