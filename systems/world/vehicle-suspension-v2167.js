// ETRANOM V2167 — per-wheel suspension, sprung mass, wheel spin, combined-slip tyres and buoyancy.
// Units: metre, kilogram, second, newton. This is a deterministic game-physics vehicle model,
// not a licensed automotive solver or a claim of tire-model fidelity beyond its authored parameters.
import { sampleTerrainElevationV2146 } from './terrain-topography-v2146.js?v=2146';
import { ETRANOM_WORLD_SCALE_V2164 } from './world-scale-v2164.js?v=2164';
const U=ETRANOM_WORLD_SCALE_V2164.logicalUnitsPerMeter,G=9.80665;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const MASS={handcart:125,wagon:520,coach:680,'mine-cart':410,'farm-wagon':560,'market-cart':180,'grain-cart':240};
function makeWheelLayout(placement){
 const count=Math.max(0,Math.round(Number(placement.wheelCount)||0));if(!count)return [];
 const halfL=Math.max(.2,(Number(placement.length)||100)/U*.34),halfW=Math.max(.15,(Number(placement.width)||80)/U*.33);
 if(count===2)return [{x:0,y:-halfW,axle:'single',side:'left',steerable:false,driven:true},{x:0,y:halfW,axle:'single',side:'right',steerable:false,driven:true}];
 const pairCount=Math.floor(count/2),rows=Array.from({length:pairCount},(_,i)=>pairCount===1?0:-halfL+2*halfL*i/(pairCount-1)),layout=[];
 for(let i=0;i<pairCount;i++)for(const side of [-1,1])layout.push({x:rows[i],y:halfW*side,axle:i===0?'rear':i===pairCount-1?'front':`middle-${i}`,side:side<0?'left':'right',steerable:i===pairCount-1,driven:true});
 if(count%2)layout.push({x:0,y:0,axle:'center',side:'center',steerable:false,driven:true});
 return layout.slice(0,count);
}
export function getVehicleWheelLayoutV2167(placement) {
 if (!placement) return Object.freeze([]);
 return Object.freeze(makeWheelLayout(placement).map((wheel,index)=>Object.freeze({...wheel,index})));
}
function wheelWorldPosition(vehicle,wheel){const h=Number(vehicle.heading)||0,c=Math.cos(h),s=Math.sin(h);return {x:vehicle.x+(wheel.x*c-wheel.y*s)*U,y:vehicle.y+(wheel.x*s+wheel.y*c)*U};}
function materialGrip(surface){
 const base=clamp(surface?.traction??1,.12,1.35),name=String(surface?.surface||surface?.material||'').toLowerCase();
 const modifier=/ice|frozen/.test(name)?.22:/snow/.test(name)?.48:/mud|marsh/.test(name)?.55:/wet|rain/.test(name)?.72:/stone|asphalt/.test(name)?.98:1;
 return clamp(base*modifier,.12,1.35);
}
export function initializeVehicleSuspensionV2167(vehicle,placement){
 if(!vehicle||!placement)return null;const layout=makeWheelLayout(placement),massKg=clamp(Number(placement.massKg)||MASS[placement.vehicleClass]||420,80,5000),old=vehicle.suspension;
 if(!old||old.layoutKey!==`${placement.vehicleClass}:${placement.wheelCount}:${placement.length}:${placement.width}`){vehicle.suspension={bodyPositionM:.78,verticalVelocityMps:0,roll:0,pitch:0,rollVelocity:0,pitchVelocity:0,wheels:layout.map((w,i)=>({...w,index:i,compressionM:.17,compressionVelocityMps:0,angularVelocityRad:0,rotationRad:0,slipRatio:0,lateralSlipRad:0,normalLoadN:0,longitudinalForceN:0,lateralForceN:0,grip:1,contact:true})),layoutKey:`${placement.vehicleClass}:${placement.wheelCount}:${placement.length}:${placement.width}`};}
 const s=vehicle.suspension;s.massKg=massKg;s.wheelCount=layout.length;s.springRateNpm=clamp(massKg*G/Math.max(.10,.18*layout.length)*1.15,1800,18000);s.damperNsPm=clamp(2*Math.sqrt(s.springRateNpm*(massKg/layout.length))*.72,350,3200);s.maxTravelM=.30;s.wheelRadiusM=clamp((Number(placement.width)||80)/U*.16,.13,.42);s.restLengthM=.26;s.mountDropM=.48;s.trackWidthM=Math.max(.25,(Number(placement.width)||80)/U*.66);s.wheelBaseM=Math.max(.35,(Number(placement.length)||100)/U*.68);s.bodyHeightM=.78;s.wheelInertiaKgM2=.62;s.corneringStiffnessNPerRad=clamp(massKg*8/layout.length,450,4200);s.longitudinalStiffnessN=clamp(massKg*11/layout.length,700,5200);s.staticLoadPerWheelN=massKg*G/Math.max(1,layout.length);return s;
}
export function stepVehicleSuspensionV2167(vehicle,placement,dt,{resolveSurface=null,input={}}={}){
 if(!vehicle||!placement)return Object.freeze({ok:false,reason:'unknown-vehicle'});const step=clamp(dt,0,.08);if(step<=0)return Object.freeze({ok:true,wheels:vehicle.suspension?.wheels?.length||0});
 const suspension=initializeVehicleSuspensionV2167(vehicle,placement),throttle=clamp(input.throttle,-1,1),brake=clamp(input.brake,0,1),steer=clamp(input.steer,-1,1);
 if(vehicle.terrainClass==='water'||placement.terrainClass==='water'){
  const wave=Number(resolveSurface?.(vehicle.x,vehicle.y,vehicle)?.waveHeightM)||0,buoyancyTarget=clamp(.78+wave,.48,1.4),error=buoyancyTarget-suspension.bodyPositionM;
  const buoyancyAccel=clamp(error*8-suspension.verticalVelocityMps*3.4,-5,5);suspension.verticalVelocityMps=clamp(suspension.verticalVelocityMps+buoyancyAccel*step,-1.8,1.8);suspension.bodyPositionM=clamp(suspension.bodyPositionM+suspension.verticalVelocityMps*step,.45,1.45);
  suspension.pitch=clamp((Number(vehicle.speed)||0)/U*.022,-.18,.18);suspension.roll=clamp(Math.sin((Number(vehicle.heading)||0)*2)*.04,-.08,.08);suspension.wheels=[];vehicle.bodyLiftM=suspension.bodyPositionM-.78;vehicle.roll=suspension.roll;vehicle.pitch=suspension.pitch;
  return Object.freeze({ok:true,mode:'six-dof-hull-buoyancy-proxy',wheels:0,bodyLiftM:vehicle.bodyLiftM,buoyancyAccelerationMps2:buoyancyAccel});
 }
 const surfaceAt=(x,y)=>typeof resolveSurface==='function'?resolveSurface(x,y,vehicle):{supportElevation:sampleTerrainElevationV2146(x,y),traction:1,surface:'terrain'},baseGroundM=(Number(vehicle.z)||0)/U,forwardSpeed=(Number(vehicle.speed)||0)/U,lateralSpeed=Number(vehicle.lateralVelocityMps)||clamp(steer*Math.abs(forwardSpeed)*.07,-1.5,1.5),heading=Number(vehicle.heading)||0;
 let totalForce=0,frontForce=0,rearForce=0,leftForce=0,rightForce=0,gripSum=0,forceX=0,forceY=0;
 for(const wheel of suspension.wheels){
  const pos=wheelWorldPosition(vehicle,wheel),surface=surfaceAt(pos.x,pos.y),grip=materialGrip(surface),groundM=(Number(surface.supportElevation??surface.elevation)||0)/U+(Number(surface.accumulatedSnowMeters)||0),groundDelta=groundM-baseGroundM;
  const pitchOffset=wheel.x*Math.sin(suspension.pitch||0),rollOffset=wheel.y*Math.sin(suspension.roll||0),hubHeight=suspension.bodyPositionM-suspension.mountDropM+pitchOffset+rollOffset-groundDelta,target=clamp(suspension.restLengthM+suspension.wheelRadiusM-hubHeight,0,suspension.maxTravelM),old=Number(wheel.compressionM)||0,compressionVelocity=(target-old)/step;
  const load=Math.max(0,suspension.springRateNpm*target-suspension.damperNsPm*compressionVelocity);wheel.compressionM=target;wheel.compressionVelocityMps=compressionVelocity;wheel.normalLoadN=load;wheel.contact=target>0;wheel.grip=grip;
  totalForce+=load;if(wheel.axle==='front')frontForce+=load;else rearForce+=load;if(wheel.side==='left')leftForce+=load;else if(wheel.side==='right')rightForce+=load;
  const speedAtWheel=forwardSpeed+wheel.x*suspension.wheelBaseM*.12*Number(vehicle.angularVelocity||0),sideAtWheel=lateralSpeed+wheel.x*.0,omega=Number(wheel.angularVelocityRad)||0,tireSpeed=omega*suspension.wheelRadiusM;
  const slip=clamp((tireSpeed-speedAtWheel)/Math.max(.75,Math.abs(speedAtWheel)), -3,3),slipAngle=clamp(Math.atan2(sideAtWheel,Math.abs(speedAtWheel)+.35)+(wheel.steerable?steer*.12:0),-.8,.8),maxForce=grip*load;
  const driveTorque=wheel.driven?throttle*(placement.mobility==='hand-pushed'?42:95)/Math.max(1,suspension.wheels.length/2):0,brakeTorque=brake*85*Math.sign(omega||speedAtWheel||1),rollingTorque=Math.sign(omega||speedAtWheel)*1.8;
  // The tire force is constrained both by the friction ellipse and by the torque
  // available at the hub; this avoids generating more longitudinal force than the
  // driven wheel can physically transmit through its radius.
  const longitudinalTorqueLimit=(Math.abs(driveTorque)+Math.abs(brakeTorque)+Math.abs(rollingTorque))/Math.max(.05,suspension.wheelRadiusM);
  const longitudinalLimit=Math.min(maxForce,longitudinalTorqueLimit);
  let fx=clamp(slip*suspension.longitudinalStiffnessN,-longitudinalLimit,longitudinalLimit),fy=clamp(-slipAngle*suspension.corneringStiffnessNPerRad,-maxForce,maxForce);const ellipse=Math.hypot(fx,fy),limit=maxForce*.98;if(ellipse>limit&&ellipse>0){fx*=limit/ellipse;fy*=limit/ellipse;}
  const angularAccel=(driveTorque-fx*suspension.wheelRadiusM-brakeTorque-rollingTorque)/suspension.wheelInertiaKgM2;
  wheel.angularVelocityRad=clamp(omega+angularAccel*step,-95,95);if(Math.abs(speedAtWheel)<.03&&Math.abs(throttle)<.04)wheel.angularVelocityRad*=Math.max(0,1-3*step);wheel.rotationRad=(Number(wheel.rotationRad)||0)+wheel.angularVelocityRad*step;wheel.slipRatio=slip;wheel.lateralSlipRad=slipAngle;wheel.longitudinalForceN=fx;wheel.lateralForceN=fy;
  forceX+=fx;forceY+=fy;gripSum+=grip;
 }
 const verticalAcceleration=(totalForce-suspension.massKg*G)/suspension.massKg;suspension.verticalVelocityMps=clamp(suspension.verticalVelocityMps+verticalAcceleration*step,-3.5,3.5);suspension.bodyPositionM=clamp(suspension.bodyPositionM+suspension.verticalVelocityMps*step,.42,1.35);
 const rollInertia=suspension.massKg*Math.pow(suspension.trackWidthM,2)*.25+1,pitchInertia=suspension.massKg*Math.pow(suspension.wheelBaseM,2)*.22+1;
 const rollTorque=(rightForce-leftForce)*suspension.trackWidthM*.5,pitchTorque=(rearForce-frontForce)*suspension.wheelBaseM*.5;
 suspension.rollVelocity=clamp((suspension.rollVelocity+rollTorque/rollInertia*step)*Math.max(0,1-2.6*step),-.85,.85);suspension.pitchVelocity=clamp((suspension.pitchVelocity+pitchTorque/pitchInertia*step)*Math.max(0,1-2.4*step),-.85,.85);
 suspension.roll=clamp(suspension.roll+suspension.rollVelocity*step,-.28,.28);suspension.pitch=clamp(suspension.pitch+suspension.pitchVelocity*step,-.24,.24);
 const averageGrip=gripSum/Math.max(1,suspension.wheels.length),averageSlip=suspension.wheels.reduce((a,w)=>a+Math.abs(w.slipRatio),0)/Math.max(1,suspension.wheels.length);
 vehicle.bodyLiftM=suspension.bodyPositionM-suspension.bodyHeightM;vehicle.roll=suspension.roll;vehicle.pitch=suspension.pitch;vehicle.wheelSpin=suspension.wheels.map(w=>w.rotationRad);vehicle.tyreForcesN={longitudinal:forceX,lateral:forceY};vehicle.lateralVelocityMps=lateralSpeed*.92;
 return Object.freeze({ok:true,mode:'multi-wheel-spring-damper-combined-slip-tyre',wheels:suspension.wheels.length,totalNormalLoadN:totalForce,bodyLiftM:vehicle.bodyLiftM,roll:suspension.roll,pitch:suspension.pitch,averageSlipRatio:averageSlip,averageTireGrip:averageGrip,tyreForces:Object.freeze({longitudinalN:forceX,lateralN:forceY}),wheelTelemetry:suspension.wheels.map(w=>Object.freeze({index:w.index,x:w.x,y:w.y,side:w.side,axle:w.axle,steerable:w.steerable,compressionM:w.compressionM,rotationRad:w.rotationRad,normalLoadN:w.normalLoadN,slipRatio:w.slipRatio,lateralSlipRad:w.lateralSlipRad,angularVelocityRad:w.angularVelocityRad,grip:w.grip}))});
}
export function auditVehicleSuspensionV2167(placements=[]){const errors=[];let wheelCount=0,watercraft=0,maxWheels=0;for(const p of placements){const v={id:p.id,x:p.x,y:p.y,z:p.elevation||0,heading:p.rotation||0,speed:0,terrainClass:p.terrainClass},s=initializeVehicleSuspensionV2167(v,p);if(p.terrainClass==='water'){watercraft++;const r=stepVehicleSuspensionV2167(v,p,1/60);if(!r.ok||r.mode!=='six-dof-hull-buoyancy-proxy')errors.push(`water-buoyancy:${p.id}`);continue;}if(!s?.wheels?.length)errors.push(`missing-wheels:${p.id}`);if(s.wheels.length!==p.wheelCount)errors.push(`wheel-count-mismatch:${p.id}`);wheelCount+=s.wheels.length;maxWheels=Math.max(maxWheels,s.wheels.length);const r=stepVehicleSuspensionV2167(v,p,1/60,{input:{throttle:.5,steer:.1}});if(!r.ok||s.wheels.some(w=>![w.compressionM,w.normalLoadN,w.angularVelocityRad,w.slipRatio,w.lateralSlipRad,w.longitudinalForceN,w.lateralForceN].every(Number.isFinite)))errors.push(`invalid-wheel-dynamics:${p.id}`);if(!r.wheelTelemetry?.length)errors.push(`missing-tyre-telemetry:${p.id}`);}return Object.freeze({ok:errors.length===0,version:2167,stage:25,vehicles:placements.length,landVehicles:placements.length-watercraft,wheelCount,maxWheels,watercraft,dynamics:['per-wheel-spring','per-wheel-damper','wheel-spin-torque','longitudinal-slip','lateral-slip-angle','combined-friction-ellipse','normal-load-transfer','body-roll','body-pitch','hull-buoyancy'],errors:Object.freeze(errors)});}
