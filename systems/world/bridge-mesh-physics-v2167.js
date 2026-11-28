// ETRANOM V2167 — triangulated 3D bridge decks, barycentric height/normal sampling.
// Static bridge geometry is a real triangle mesh in world metres; rigid body dynamics
// consume its interpolated plane rather than a single analytic ramp approximation.
import { ETRANOM_BRIDGE_CROSSINGS_V2162 } from './visual-physical-consistency-v2162.js?v=2162';
import { resolveBridgeDeckSampleV2164 } from './bridge-physics-v2164.js?v=2164';
const U=40,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=v=>{const l=Math.hypot(...v)||1;return v.map(x=>x/l);};
function barycentric2D(p,a,b,c){const v0=[b[0]-a[0],b[1]-a[1]],v1=[c[0]-a[0],c[1]-a[1]],v2=[p[0]-a[0],p[1]-a[1]],d00=v0[0]*v0[0]+v0[1]*v0[1],d01=v0[0]*v1[0]+v0[1]*v1[1],d11=v1[0]*v1[0]+v1[1]*v1[1],d20=v2[0]*v0[0]+v2[1]*v0[1],d21=v2[0]*v1[0]+v2[1]*v1[1],den=d00*d11-d01*d01;if(Math.abs(den)<1e-10)return null;const v=(d11*d20-d01*d21)/den,w=(d00*d21-d01*d20)/den,u=1-v-w;return [u,v,w];}
function makeMesh(bridge){
 const frame=bridge.crossingFrame;if(!frame)return null;const rows=18,cols=6,vertices=[];
 for(let r=0;r<=rows;r++){const along=-bridge.length*.5+bridge.length*r/rows;for(let c=0;c<=cols;c++){const across=-bridge.deckWidth*.5+bridge.deckWidth*c/cols,x=bridge.x+frame.normal.x*along+frame.tangent.x*across,y=bridge.y+frame.normal.y*along+frame.tangent.y*across,sample=resolveBridgeDeckSampleV2164(x,y,0);vertices.push([x/U,y/U,(Number(sample?.deckElevation)||0)/U]);}}
 const index=(r,c)=>r*(cols+1)+c,triangles=[];
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const a=vertices[index(r,c)],b=vertices[index(r,c+1)],d=vertices[index(r+1,c)],e=vertices[index(r+1,c+1)];for(const points of [[a,b,e],[a,e,d]]){let normal=norm(cross(sub(points[1],points[0]),sub(points[2],points[0])));if(normal[2]<0)normal=normal.map(v=>-v);triangles.push({vertices:points,normal});}}
 return Object.freeze({bridgeId:bridge.id,waterwayId:bridge.waterwayId,rows,columns:cols,vertices:Object.freeze(vertices.map(Object.freeze)),triangles:Object.freeze(triangles.map(t=>Object.freeze({vertices:Object.freeze(t.vertices.map(Object.freeze)),normal:Object.freeze(t.normal)}))),bounds:Object.freeze({length:bridge.length/U,width:bridge.deckWidth/U}),material:'wood-deck'});
}
export const ETRANOM_BRIDGE_MESHES_V2167=Object.freeze(ETRANOM_BRIDGE_CROSSINGS_V2162.map(makeMesh).filter(Boolean));
export function sampleBridgeMeshV2167(xM,yM){
 const x=Number(xM),y=Number(yM);if(!Number.isFinite(x)||!Number.isFinite(y))return null;
 for(const mesh of ETRANOM_BRIDGE_MESHES_V2167){
  for(const triangle of mesh.triangles){const [a,b,c]=triangle.vertices,w=barycentric2D([x,y],a,b,c);if(!w||w.some(v=>v<-.0001||v>1.0001))continue;const z=w[0]*a[2]+w[1]*b[2]+w[2]*c[2];return Object.freeze({point:Object.freeze([x,y,z]),normal:triangle.normal,material:mesh.material,bridgeId:mesh.bridgeId,triangle:true});}
 }
 return null;
}
export function auditBridgeMeshesV2167(){const errors=[];for(const mesh of ETRANOM_BRIDGE_MESHES_V2167){if(mesh.triangles.length!==18*6*2)errors.push(`triangle-count:${mesh.bridgeId}`);if(mesh.vertices.some(v=>v.length!==3||!v.every(Number.isFinite)))errors.push(`invalid-vertex:${mesh.bridgeId}`);const sample=sampleBridgeMeshV2167(mesh.vertices[Math.floor(mesh.vertices.length/2)][0],mesh.vertices[Math.floor(mesh.vertices.length/2)][1]);if(!sample||sample.bridgeId!==mesh.bridgeId)errors.push(`mesh-sample:${mesh.bridgeId}`);if(mesh.triangles.some(t=>Math.abs(Math.hypot(...t.normal)-1)>.001))errors.push(`normal:${mesh.bridgeId}`);}
 return Object.freeze({ok:errors.length===0,version:2167,stage:25,meshes:ETRANOM_BRIDGE_MESHES_V2167.length,vertices:ETRANOM_BRIDGE_MESHES_V2167.reduce((n,m)=>n+m.vertices.length,0),triangles:ETRANOM_BRIDGE_MESHES_V2167.reduce((n,m)=>n+m.triangles.length,0),contactSampling:'barycentric-triangle-mesh',errors:Object.freeze(errors)});}
