// ETRANOM V2165 — universal pixel-grid contact masks for every blocking collider.
// Authored PNG alpha masks remain native-resolution; non-image geometry is rasterized
// from its authored primitive at a bounded logical-pixel resolution.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pointSegmentDistance=(x,y,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy||1,t=clamp(((x-ax)*dx+(y-ay)*dy)/l2,0,1);return Math.hypot(x-ax-dx*t,y-ay-dy*t);};
function pointInPolygon(x,y,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [xi,yi]=points[i],[xj,yj]=points[j];if(((yi>y)!==(yj>y))&&x<((xj-xi)*(y-yi))/((yj-yi)||1e-12)+xi)inside=!inside;}return inside;}
function contains(c,x,y){
  if(c.shape==='circle')return Math.hypot(x-c.x,y-c.y)<=c.radius;
  if(c.shape==='ellipse'){const nx=(x-c.x)/c.rx,ny=(y-c.y)/c.ry;return nx*nx+ny*ny<=1;}
  if(c.shape==='segment')return pointSegmentDistance(x,y,c.ax,c.ay,c.bx,c.by)<=c.radius;
  if(c.shape==='polygon')return pointInPolygon(x,y,c.points);
  if(c.shape==='rect'){const a=c.rotation||0,dx=x-c.x,dy=y-c.y,rx=Math.cos(a)*dx+Math.sin(a)*dy,ry=-Math.sin(a)*dx+Math.cos(a)*dy;return Math.abs(rx)<=c.halfX&&Math.abs(ry)<=c.halfY;}
  return false;
}
export function buildContactRasterV2165(collider,{pixelSize=1,maxPixels=1_500_000}={}){
  if(!collider?.bounds||collider.shape==='alpha-mask')return null;
  const b=collider.bounds;
  if(![b.minX,b.minY,b.maxX,b.maxY].every(Number.isFinite))return null;
  let step=Math.max(.5,Number(pixelSize)||1),width=0,height=0;
  for(let i=0;i<8;i++){width=Math.max(1,Math.ceil((b.maxX-b.minX)/step)+1);height=Math.max(1,Math.ceil((b.maxY-b.minY)/step)+1);if(width*height<=maxPixels)break;step*=2;}
  if(width*height>maxPixels)return null;
  const originX=Math.floor(b.minX/step)*step,originY=Math.floor(b.minY/step)*step;
  const bits=new Uint8Array(Math.ceil(width*height/8));let occupied=0;
  for(let py=0;py<height;py++)for(let px=0;px<width;px++){
    if(!contains(collider,originX+(px+.5)*step,originY+(py+.5)*step))continue;
    const index=py*width+px;bits[index>>3]|=1<<(7-(index&7));occupied++;
  }
  if(!occupied)return null;
  return Object.freeze({version:2165,originX,originY,pixelSize:step,width,height,bits,occupiedPixels:occupied,
    resolution:step===1?'1-logical-unit-pixel':`${step}-logical-unit-pixel`,source:'rasterized-authored-collider-geometry'});
}
export function attachContactRasterToWorldV2165(world,options={}){
  if(!world?.colliders)return Object.freeze({world:null,stats:{total:0,rasterized:0,nativeAlpha:0,unmapped:0}});
  let rasterized=0,nativeAlpha=0,unmapped=0,totalOccupied=0;
  const colliders=world.colliders.map(c=>{
    if(c.shape==='alpha-mask'){nativeAlpha++;return c;}
    const raster=buildContactRasterV2165(c,options);
    if(!raster){unmapped++;return c;}
    rasterized++;totalOccupied+=raster.occupiedPixels;
    return Object.freeze({...c,contactRaster:raster,contactRasterStatus:'pixel-grid-rasterized-from-authored-geometry'});
  });
  const next=Object.freeze({...world,colliders:Object.freeze(colliders)});
  return Object.freeze({world:next,stats:Object.freeze({total:colliders.length,rasterized,nativeAlpha,unmapped,totalOccupiedPixels:totalOccupied,pixelSize:options.pixelSize||1})});
}
export function contactRasterPenetrationV2165(c,x,y,radius=0){
  const m=c?.contactRaster;if(!m)return null;
  const ix=Math.floor((x-m.originX)/m.pixelSize),iy=Math.floor((y-m.originY)/m.pixelSize);
  const inBounds=ix>=0&&iy>=0&&ix<m.width&&iy<m.height;
  const isSet=(px,py)=>{if(px<0||py<0||px>=m.width||py>=m.height)return false;const i=py*m.width+px;return !!(m.bits[i>>3]&(1<<(7-(i&7))));};
  const inside=inBounds&&isSet(ix,iy),maxRing=Math.max(2,Math.ceil((Math.max(0,radius)+m.pixelSize*2)/m.pixelSize));
  let best=Infinity;
  for(let ring=0;ring<=maxRing;ring++){
    const minX=ix-ring,maxX=ix+ring,minY=iy-ring,maxY=iy+ring;
    for(let py=minY;py<=maxY;py++)for(let px=minX;px<=maxX;px++){
      if(ring>0&&Math.abs(px-ix)!==ring&&Math.abs(py-iy)!==ring)continue;
      const set=isSet(px,py);if(set===inside)continue;
      const d=Math.hypot((px+.5-(x-m.originX)/m.pixelSize)*m.pixelSize,(py+.5-(y-m.originY)/m.pixelSize)*m.pixelSize);
      if(d<best)best=d;
    }
    if(best<Infinity&&best<=(ring+1.5)*m.pixelSize)break;
  }
  const halfCell=m.pixelSize*.70710678;
  if(best===Infinity)return inside?Math.max(radius,m.pixelSize):-(radius+m.pixelSize);
  const signed=Math.max(0,best-halfCell);
  return inside?radius+signed:radius-signed;
}
export function auditContactRasterV2165(world){
  const errors=[],colliders=world?.colliders||[];let nativeAlpha=0,rasterized=0,unmapped=0;
  for(const c of colliders){if(c.shape==='alpha-mask'){nativeAlpha++;continue;}if(c.contactRaster?.bits?.length){rasterized++;if(!(c.contactRaster.occupiedPixels>0))errors.push(`empty-raster:${c.id}`);}else{unmapped++;errors.push(`unmapped-collider:${c.id}`);}}
  return Object.freeze({ok:errors.length===0,version:2165,stage:23,total:colliders.length,nativeAlpha,rasterized,unmapped,covered:nativeAlpha+rasterized,coverage:colliders.length?(nativeAlpha+rasterized)/colliders.length:1,errors:Object.freeze(errors)});
}
