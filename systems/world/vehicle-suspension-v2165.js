// ETRANOM V2165 — per-wheel spring/damper suspension, tyre angular velocity and hull buoyancy.
import { sampleTerrainElevationV2146 } from './terrain-topography-v2146.js?v=2146';
import { ETRANOM_WORLD_SCALE_V2164 } from './world-scale-v2164.js?v=2164';
const U=ETRANOM_WORLD_SCALE_V2164.logicalUnitsPerMeter,clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
function makeWheelLayout(placement){
  const count=Math.max(0,Math.round(Number(placement.wheelCount)||0)),halfL=Math.max(.2,(Number(placement.length)||100)/U*.34),halfW=Math.max(.15,(Number(placement.width)||80)/U*.33);
  if(count===2)return [{x:-halfL,y:0,axle:'rear'},{x:halfL,y:0,axle:'front'}];
  if(count>=4)return [{x:-halfL,y:-halfW,axle:'rear',side:'left'},{x:-halfL,y:halfW,axle:'rear',side:'right'},{x:halfL,y:-halfW,axle:'front',side:'left'},{x:halfL,y:halfW,axle:'front',side:'right'}];
  return [];
}
export function initializeVehicleSuspensionV2165(vehicle,placement){
  if(!vehicle||!placement)return null;
  const layout=makeWheelLayout(placement),massKg=clamp(Number(placement.massKg)||({handcart:125,wagon:520,coach:680,'mine-cart':410,'farm-wagon':560,'market-cart':180,'grain-cart':240}[placement.vehicleClass]||420),80,1800);
  vehicle.suspension=vehicle.suspension||{bodyPositionM:.78,verticalVelocityMps:0,roll:0,pitch:0,rollVelocity:0,pitchVelocity:0,wheels:layout.map((w,i)=>({...w,index:i,compressionM:.18,compressionVelocityMps:0,angularVelocityRad:0,rotationRad:0,slipRatio:0,normalLoadN:0,contact:true}))};
  vehicle.suspension.massKg=massKg;vehicle.suspension.wheelCount=layout.length;vehicle.suspension.springRateNpm=layout.length===2?8500:7000;vehicle.suspension.damperNsPm=layout.length===2?950:900;vehicle.suspension.maxTravelM=.28;vehicle.suspension.wheelRadiusM=.22;vehicle.suspension.restLengthM=.26;vehicle.suspension.mountDropM=.48;vehicle.suspension.trackWidthM=Math.max(.25,(Number(placement.width)||80)/U*.66);vehicle.suspension.wheelBaseM=Math.max(.35,(Number(placement.length)||100)/U*.68);vehicle.suspension.bodyHeightM=.78;
  return vehicle.suspension;
}
function wheelWorldPosition(vehicle,wheel){const h=Number(vehicle.heading)||0,c=Math.cos(h),s=Math.sin(h);return {x:vehicle.x+(wheel.x*c-wheel.y*s)*U,y:vehicle.y+(wheel.x*s+wheel.y*c)*U};}
export function stepVehicleSuspensionV2165(vehicle,placement,dt,{resolveSurface=null}={}){
  if(!vehicle||!placement)return Object.freeze({ok:false,reason:'unknown-vehicle'});
  const step=clamp(dt,0,.08);if(step<=0)return Object.freeze({ok:true,wheels:vehicle.suspension?.wheels?.length||0});
  const suspension=initializeVehicleSuspensionV2165(vehicle,placement);
  if(vehicle.terrainClass==='water'||placement.terrainClass==='water'){
    const wave=Number(resolveSurface?.(vehicle.x,vehicle.y,vehicle)?.waveHeightM)||0;
    suspension.bodyPositionM=clamp(suspension.bodyPositionM+(wave-suspension.bodyPositionM*.015)*step*2,.45,1.2);
    suspension.verticalVelocityMps=(suspension.verticalVelocityMps||0)*Math.max(0,1-1.6*step);
    suspension.pitch=clamp((Number(vehicle.speed)||0)/U*.018,-.12,.12);suspension.roll=clamp(Math.sin((Number(vehicle.heading)||0)*2)*.025,-.05,.05);
    suspension.wheels=[];vehicle.bodyLiftM=suspension.bodyPositionM-.78;vehicle.roll=suspension.roll;vehicle.pitch=suspension.pitch;
    return Object.freeze({ok:true,mode:'hull-buoyancy',wheels:0,bodyLiftM:vehicle.bodyLiftM});
  }
  const surfaceAt=(x,y)=>typeof resolveSurface==='function'?resolveSurface(x,y,vehicle):{supportElevation:sampleTerrainElevationV2146(x,y),traction:1};
  const baseGroundM=(Number(vehicle.z)||0)/U,heading=Number(vehicle.heading)||0,forwardSpeed=(Number(vehicle.speed)||0)/U;
  let totalForce=0,frontForce=0,rearForce=0,leftForce=0,rightForce=0;
  for(const wheel of suspension.wheels){
    const pos=wheelWorldPosition(vehicle,wheel),surface=surfaceAt(pos.x,pos.y),groundM=(Number(surface.supportElevation??surface.elevation)||0)/U+(Number(surface.accumulatedSnowMeters)||0),groundDelta=groundM-baseGroundM;
    const pitchOffset=wheel.x*Math.sin(suspension.pitch||0),rollOffset=wheel.y*Math.sin(suspension.roll||0);
    const hubHeight=suspension.bodyPositionM-suspension.mountDropM+pitchOffset+rollOffset-groundDelta;
    const target=clamp(suspension.restLengthM+suspension.wheelRadiusM-hubHeight,0,suspension.maxTravelM);
    const old=Number(wheel.compressionM)||0,compressionVelocity=(target-old)/step;
    const load=Math.max(0,suspension.springRateNpm*target-suspension.damperNsPm*compressionVelocity);
    wheel.compressionM=target;wheel.compressionVelocityMps=compressionVelocity;wheel.normalLoadN=load;wheel.contact=target>0;
    totalForce+=load;if(wheel.axle==='front')frontForce+=load;else rearForce+=load;if(wheel.side==='left')leftForce+=load;else if(wheel.side==='right')rightForce+=load;
    const tireSpeed=wheel.angularVelocityRad*suspension.wheelRadiusM,slip=(tireSpeed-forwardSpeed)/Math.max(.75,Math.abs(forwardSpeed));wheel.slipRatio=clamp(slip,-2,2);
    const targetAngular=forwardSpeed/suspension.wheelRadiusM*(1+clamp(wheel.slipRatio,-.12,.35));wheel.angularVelocityRad+=(targetAngular-wheel.angularVelocityRad)*Math.min(1,step*7*clamp(surface.traction??1,.15,1));
    wheel.rotationRad=(Number(wheel.rotationRad)||0)+wheel.angularVelocityRad*step;
  }
  const verticalAcceleration=(totalForce-suspension.massKg*9.80665)/suspension.massKg;
  suspension.verticalVelocityMps=clamp(suspension.verticalVelocityMps+verticalAcceleration*step,-3,3);
  suspension.bodyPositionM=clamp(suspension.bodyPositionM+suspension.verticalVelocityMps*step,.45,1.25);
  const rollInertia=suspension.massKg*Math.pow(suspension.trackWidthM,2)*.22+1,pitchInertia=suspension.massKg*Math.pow(suspension.wheelBaseM,2)*.2+1;
  const rollTorque=(rightForce-leftForce)*suspension.trackWidthM*.5,pitchTorque=(rearForce-frontForce)*suspension.wheelBaseM*.5;
  suspension.rollVelocity=clamp((suspension.rollVelocity+rollTorque/rollInertia*step)*Math.max(0,1-2.8*step),-.8,.8);
  suspension.pitchVelocity=clamp((suspension.pitchVelocity+pitchTorque/pitchInertia*step)*Math.max(0,1-2.5*step),-.8,.8);
  suspension.roll=clamp(suspension.roll+suspension.rollVelocity*step,-.24,.24);suspension.pitch=clamp(suspension.pitch+suspension.pitchVelocity*step,-.22,.22);
  vehicle.bodyLiftM=suspension.bodyPositionM-suspension.bodyHeightM;vehicle.roll=suspension.roll;vehicle.pitch=suspension.pitch;vehicle.wheelSpin=suspension.wheels.map(w=>w.rotationRad);
  return Object.freeze({ok:true,mode:'four-corner-spring-damper',wheels:suspension.wheels.length,totalNormalLoadN:totalForce,bodyLiftM:vehicle.bodyLiftM,roll:suspension.roll,pitch:suspension.pitch,averageSlipRatio:suspension.wheels.reduce((a,w)=>a+Math.abs(w.slipRatio),0)/Math.max(1,suspension.wheels.length)});
}
export function auditVehicleSuspensionV2165(placements=[]){
  const errors=[];let wheelCount=0,watercraft=0;for(const p of placements){const v={id:p.id,x:p.x,y:p.y,z:p.elevation||0,heading:p.rotation||0,speed:0,terrainClass:p.terrainClass};const s=initializeVehicleSuspensionV2165(v,p);if(p.terrainClass==='water'){watercraft++;continue;}if(!s?.wheels?.length)errors.push(`missing-wheels:${p.id}`);wheelCount+=s?.wheels?.length||0;const result=stepVehicleSuspensionV2165(v,p,1/60);if(!result.ok||s.wheels.some(w=>![w.compressionM,w.normalLoadN,w.angularVelocityRad,w.slipRatio].every(Number.isFinite)))errors.push(`invalid-wheel-dynamics:${p.id}`);}
  return Object.freeze({ok:errors.length===0,version:2165,stage:23,vehicles:placements.length,landVehicles:placements.length-watercraft,wheelCount,watercraft,hullBuoyancy:true,dynamics:['per-wheel-spring','per-wheel-damper','terrain-ray-support','tyre-angular-velocity','longitudinal-slip','body-roll','body-pitch'],errors:Object.freeze(errors)});
}
