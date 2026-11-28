// ETRANOM V2165 — 3D rigid-body contact solver for the raised bridge decks and terrain.
// Supports sphere and oriented box bodies, quaternion orientation, gravity, contact impulses,
// angular response and Coulomb friction. Coordinates are metres; world samplers are adapted.
import { ETRANOM_BRIDGE_CROSSINGS_V2162 } from './visual-physical-consistency-v2162.js?v=2162';
import { resolveBridgeDeckSampleV2164 } from './bridge-physics-v2164.js?v=2164';
import { sampleTerrainElevationV2146 } from './terrain-topography-v2146.js?v=2146';
import { sampleBridgeMeshV2167 } from './bridge-mesh-physics-v2167.js?v=2167';

const G=9.80665, UNITS=40, FIXED=1/120;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const scale=(a,s)=>[a[0]*s,a[1]*s,a[2]*s];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>{const l=Math.hypot(...a)||1;return scale(a,1/l);};
const norm4=q=>{const l=Math.hypot(...q)||1;return q.map(v=>v/l);};
function rotateVector(q,v){const [x,y,z,w]=q,u=[x,y,z],t=scale(cross(u,v),2);return add(v,add(scale(t,w),cross(u,t)));}
function inverseRotateVector(q,v){return rotateVector([-q[0],-q[1],-q[2],q[3]],v);}
function integrateQuaternion(q,w,dt){
  const [x,y,z,s]=q,[wx,wy,wz]=w,h=.5*dt;
  return norm4([x+h*(s*wx+wy*z-wz*y),y+h*(s*wy+wz*x-wx*z),z+h*(s*wz+wx*y-wy*x),s-h*(wx*x+wy*y+wz*z)]);
}
function bridgePlaneAt(xM,yM){
  const meshSample=sampleBridgeMeshV2167(xM,yM);if(meshSample)return {point:meshSample.point,normal:meshSample.normal,material:meshSample.material,bridgeId:meshSample.bridgeId,triangle:true};
  const sample=resolveBridgeDeckSampleV2164(xM*UNITS,yM*UNITS,0);if(!sample)return null;
  const bridge=ETRANOM_BRIDGE_CROSSINGS_V2162.find(b=>b.id===sample.bridgeId),frame=bridge?.crossingFrame;if(!frame)return null;
  const slope=sample.longitudinalSlope||0,n=frame.normal;
  return {point:[xM,yM,sample.deckElevation/UNITS],normal:norm([-slope*n.x,-slope*n.y,1]),material:'bridge-deck-fallback',bridgeId:sample.bridgeId};
}
function inverseInertiaFor(shape,mass,radius,halfExtents){
  if(shape==='box'){
    const [x,y,z]=halfExtents;return [12/(mass*(y*y+z*z)),12/(mass*(x*x+z*z)),12/(mass*(x*x+y*y))];
  }
  const i=.4*mass*radius*radius;return [1/i,1/i,1/i];
}
function inertiaAlong(body,axis){
  const local=inverseRotateVector(body.orientation,axis),inv=body.inverseInertia;
  return local[0]*local[0]*inv[0]+local[1]*local[1]*inv[1]+local[2]*local[2]*inv[2];
}
function supportPointOffset(body,normal){
  if(body.shape==='box'){
    const dir=inverseRotateVector(body.orientation,scale(normal,-1)),e=body.halfExtents,axis=Math.abs(dir[0])>Math.abs(dir[1])?(Math.abs(dir[0])>Math.abs(dir[2])?0:2):(Math.abs(dir[1])>Math.abs(dir[2])?1:2);
    const local=[0,0,0];local[axis]=Math.sign(dir[axis]||1)*e[axis];return rotateVector(body.orientation,local);
  }
  return scale(normal,-body.radius);
}
function supportDistance(body,normal){
  if(body.shape==='box'){
    const dir=inverseRotateVector(body.orientation,normal),e=body.halfExtents;
    return Math.abs(dir[0])*e[0]+Math.abs(dir[1])*e[1]+Math.abs(dir[2])*e[2];
  }
  return body.radius;
}
export function createRigidBody3DV2165({id='body',shape='sphere',position=[0,0,0],velocity=[0,0,0],mass=1,radius=.35,halfExtents=[.5,.5,.5],orientation=[0,0,0,1],angularVelocity=[0,0,0],restitution=.04,friction=.72,kinematic=false}={}){
  const m=Math.max(.001,Number(mass)||1),r=Math.max(.02,Number(radius)||.35),shapeType=shape==='box'?'box':'sphere';
  const ext=halfExtents.slice(0,3).map(v=>Math.max(.02,Number(v)||.5)),inverse=kinematic?[0,0,0]:inverseInertiaFor(shapeType,m,r,ext);
  return {version:2165,id,shape:shapeType,position:position.slice(0,3).map(Number),velocity:velocity.slice(0,3).map(Number),orientation:norm4(orientation.slice(0,4)),angularVelocity:angularVelocity.slice(0,3).map(Number),force:[0,0,0],torque:[0,0,0],mass:m,inverseMass:kinematic?0:1/m,radius:r,halfExtents:ext,inverseInertia:inverse,restitution:clamp(restitution,0,1),friction:clamp(friction,0,2),kinematic:!!kinematic,onGround:false,contact:null,substeps:0};
}
function resolveSupport(x,y,options){
  const bridge=options.bridgeSupport===false?null:bridgePlaneAt(x,y);if(bridge)return bridge;
  if(typeof options.supportResolver==='function')return options.supportResolver(x,y)||null;
  return {point:[x,y,sampleTerrainElevationV2146(x*UNITS,y*UNITS)/UNITS],normal:[0,0,1],material:'terrain'};
}
function applyContactAtArm(body,surface,arm,penetration){
  const n=norm(surface.normal);if(penetration>=0)return false;
  body.position=add(body.position,scale(n,-penetration));
  const contactVelocity=add(body.velocity,cross(body.angularVelocity,arm)),vn=dot(contactVelocity,n);let normalImpulse=0;
  if(vn<0&&body.inverseMass>0){
    const raN=cross(arm,n),denom=body.inverseMass+inertiaAlong(body,raN)*dot(raN,raN);
    normalImpulse=denom>1e-9?-(1+body.restitution)*vn/denom:0;
    const impulse=scale(n,normalImpulse);body.velocity=add(body.velocity,scale(impulse,body.inverseMass));
    const angular=cross(arm,impulse),localTorque=inverseRotateVector(body.orientation,angular);
    body.angularVelocity=add(body.angularVelocity,rotateVector(body.orientation,[localTorque[0]*body.inverseInertia[0],localTorque[1]*body.inverseInertia[1],localTorque[2]*body.inverseInertia[2]]));
    const postVelocity=add(body.velocity,cross(body.angularVelocity,arm)),normalVelocity=scale(n,dot(postVelocity,n)),tangent=add(postVelocity,scale(normalVelocity,-1)),speed=Math.hypot(...tangent);
    if(speed>1e-7){const t=scale(tangent,1/speed),raT=cross(arm,t),tDenom=body.inverseMass+inertiaAlong(body,raT)*dot(raT,raT),jt=Math.min(speed/Math.max(1e-9,tDenom),body.friction*normalImpulse),frictionImpulse=scale(t,-jt);body.velocity=add(body.velocity,scale(frictionImpulse,body.inverseMass));const frictionTorque=inverseRotateVector(body.orientation,cross(arm,frictionImpulse));body.angularVelocity=add(body.angularVelocity,rotateVector(body.orientation,[frictionTorque[0]*body.inverseInertia[0],frictionTorque[1]*body.inverseInertia[1],frictionTorque[2]*body.inverseInertia[2]]));}
  }
  body.onGround=n[2]>.35;return {material:surface.material||'solid',normal:n,bridgeId:surface.bridgeId||null,penetration:-penetration,normalImpulse};
}
function applyContact(body,surface){
  if(!surface?.point||!surface?.normal)return false;
  const n=norm(surface.normal),penetration=dot([body.position[0]-surface.point[0],body.position[1]-surface.point[1],body.position[2]-surface.point[2]],n)-supportDistance(body,n);
  if(penetration>=0)return false;
  const arm=supportPointOffset(body,n),contact=applyContactAtArm(body,surface,arm,penetration);
  body.contact=contact;return true;
}
function applyBoxMultiPointContacts(body,options){
  const [hx,hy,hz]=body.halfExtents,locals=[[-hx,-hy,-hz],[hx,-hy,-hz],[-hx,hy,-hz],[hx,hy,-hz],[0,0,-hz]],contacts=[];
  // Two sequential contact passes converge corner contacts on a curved/graded deck.
  for(let pass=0;pass<2;pass++)for(const local of locals){
    const arm=rotateVector(body.orientation,local),worldPoint=add(body.position,arm),surface=resolveSupport(worldPoint[0],worldPoint[1],options);if(!surface?.point||!surface?.normal)continue;
    const n=norm(surface.normal),penetration=dot([worldPoint[0]-surface.point[0],worldPoint[1]-surface.point[1],worldPoint[2]-surface.point[2]],n);
    if(penetration>=-.0005)continue;
    // Keep positional correction bounded per point; sequential contacts settle the complete underside.
    const contact=applyContactAtArm(body,surface,arm,Math.max(-.08,penetration)*.72);
    if(contact){contacts.push(contact);if(contacts.length>=10)break;}
  }
  if(contacts.length){body.onGround=contacts.some(c=>c.normal[2]>.35);const bridgeContact=contacts.find(c=>c.bridgeId);body.contact={...(bridgeContact||contacts[0]),contactPoints:contacts.length,manifold:'five-point-box-underside'};return true;}
  return false;
}
function integrateBody(body,dt,options){
  if(!body.kinematic){
    const acceleration=add([0,0,-G],scale(body.force,body.inverseMass));body.velocity=add(body.velocity,scale(acceleration,dt));
    body.position=add(body.position,scale(body.velocity,dt));
    const localTorque=inverseRotateVector(body.orientation,body.torque);
    body.angularVelocity=add(body.angularVelocity,rotateVector(body.orientation,[localTorque[0]*body.inverseInertia[0]*dt,localTorque[1]*body.inverseInertia[1]*dt,localTorque[2]*body.inverseInertia[2]*dt]));
    body.orientation=integrateQuaternion(body.orientation,body.angularVelocity,dt);
  }
  body.onGround=false;body.contact=null;if(body.shape==='box')applyBoxMultiPointContacts(body,options);else{const support=resolveSupport(body.position[0],body.position[1],options);if(support)applyContact(body,support);}
  body.force=[0,0,0];body.torque=[0,0,0];
}
export function stepRigidBody3DV2165(body,dt,options={}){
  if(!body||!Array.isArray(body.position)||!Array.isArray(body.velocity))return Object.freeze({ok:false,reason:'invalid-body'});
  const elapsed=clamp(dt,0,.1),steps=Math.max(1,Math.min(12,Math.ceil(elapsed/FIXED))),step=elapsed/steps;
  for(let i=0;i<steps;i++)integrateBody(body,step,options);
  body.substeps=steps;
  const snapshot={...body,position:Object.freeze(body.position.slice()),velocity:Object.freeze(body.velocity.slice()),orientation:Object.freeze(body.orientation.slice()),angularVelocity:Object.freeze(body.angularVelocity.slice()),inverseInertia:Object.freeze(body.inverseInertia.slice()),halfExtents:Object.freeze(body.halfExtents.slice()),contact:body.contact?Object.freeze({...body.contact,normal:Object.freeze(body.contact.normal.slice())}):null};
  return Object.freeze({ok:true,body:Object.freeze(snapshot),substeps:steps,onGround:body.onGround,contact:body.contact});
}
export function auditBridgeRigidBody3DV2165(){
  const errors=[],bridge=ETRANOM_BRIDGE_CROSSINGS_V2162[0],x=bridge.x/UNITS,y=bridge.y/UNITS,plane=bridgePlaneAt(x,y);
  const sphere=createRigidBody3DV2165({id:'bridge-test-sphere',position:[x,y,plane.point[2]+.1],radius:.2});
  for(let i=0;i<60;i++)stepRigidBody3DV2165(sphere,FIXED);
  if(!sphere.onGround||!sphere.contact?.bridgeId)errors.push('3d-sphere-bridge-contact-missing');
  if(Math.abs((sphere.position[2]-sphere.radius)-plane.point[2])>.025)errors.push('sphere-contact-height-error');
  const box=createRigidBody3DV2165({id:'bridge-test-box',shape:'box',position:[x,y,plane.point[2]+.3],halfExtents:[.35,.22,.28],mass:2,orientation:[0,0,.15,.9887]});
  for(let i=0;i<60;i++)stepRigidBody3DV2165(box,FIXED);
  if(!box.onGround||!box.contact?.bridgeId)errors.push('3d-oriented-box-bridge-contact-missing');
  const falling=createRigidBody3DV2165({position:[x,y,plane.point[2]+1.1],radius:.2});stepRigidBody3DV2165(falling,.08);
  if(!(falling.position[2]<plane.point[2]+1.1))errors.push('gravity-integration-missing');
  const slopeNormal=plane.normal;if(!(Math.hypot(...slopeNormal)>.999))errors.push('bridge-plane-normal-invalid');
  return Object.freeze({ok:errors.length===0,version:2167,stage:25,solver:'fixed-step-3d-triangulated-bridge-mesh-and-five-point-box-contact-impulse',bridgeCount:ETRANOM_BRIDGE_CROSSINGS_V2162.length,bodyShapes:['sphere','oriented-box-with-five-point-underside-manifold'],gravityMps2:G,fixedStepSeconds:FIXED,angularResponse:true,coulombFriction:true,errors:Object.freeze(errors)});
}
export const ETRANOM_BRIDGE_RIGID_BODY_3D_V2165=Object.freeze({version:2167,stage:25,coordinateUnit:'metre',solver:'fixed-step-3D-rigid-body-contact-on-triangulated-bridge-mesh',shapes:['sphere','oriented-box'],features:['gravity','quaternion-orientation','normal-impulse','angular-impulse','Coulomb-friction','triangulated-bridge-mesh','barycentric-height-and-normal-sampling','five-point-box-underside-contact','terrain-support'],limitations:['no-general-dynamic-mesh-to-mesh-contact-manifold','no-multibody-joint-constraint-solver']});
