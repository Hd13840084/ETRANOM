import test from 'node:test';
import assert from 'node:assert/strict';
import { activateIsometricSpritePlaneV2127 } from '../../systems/safe-zone/isometric-sprite-plane-v2127.js';

class MockContext {
  constructor() { this.m = {a:1,b:0,c:0,d:1,e:0,f:0}; this.stack=[]; this.calls=[]; }
  save() { this.stack.push({...this.m}); }
  restore() { this.m=this.stack.pop(); }
  transform(a,b,c,d,e,f) {
    const m=this.m;
    this.m={a:m.a*a+m.c*b,b:m.b*a+m.d*b,c:m.a*c+m.c*d,d:m.b*c+m.d*d,e:m.a*e+m.c*f+m.e,f:m.b*e+m.d*f+m.f};
  }
  translate(x,y) { this.transform(1,0,0,1,x,y); }
  rotate(r) { this.transform(Math.cos(r),Math.sin(r),-Math.sin(r),Math.cos(r),0,0); }
  getTransform() { return {...this.m}; }
  drawImage(...args) { this.calls.push({args,m:{...this.m}}); }
}
const apply=(m,x,y)=>({x:m.a*x+m.c*y+m.e,y:m.b*x+m.d*y+m.f});

test('removes the 2:1 world skew from a PNG while preserving its projected anchor',()=>{
  const ctx=new MockContext();
  ctx.translate(360,325);ctx.transform(.72,.36,-.72,.36,0,0);ctx.translate(-750,-1244);
  const before=ctx.getTransform(), center={x:150,y:250}, expected=apply(before,center.x,center.y);
  const stop=activateIsometricSpritePlaneV2127(ctx);
  ctx.drawImage({width:100,height:100},100,200,100,100);
  const after=ctx.calls[0].m, projected=apply(after,center.x,center.y);
  assert.ok(Math.abs(after.a-1)<1e-8 && Math.abs(after.b)<1e-8 && Math.abs(after.c)<1e-8 && Math.abs(after.d-1)<1e-8);
  assert.ok(Math.abs(projected.x-expected.x)<1e-8 && Math.abs(projected.y-expected.y)<1e-8);
  stop();
});

test('preserves local rotation and restores normal drawImage behavior after release',()=>{
  const ctx=new MockContext();
  ctx.translate(360,325);ctx.transform(.72,.36,-.72,.36,0,0);ctx.translate(-750,-1244);
  ctx.save();ctx.translate(120,180);ctx.rotate(.31);
  const stop=activateIsometricSpritePlaneV2127(ctx);
  ctx.drawImage({width:20,height:30},-10,-15,20,30);
  const m=ctx.calls[0].m;
  assert.ok(Math.abs(m.a-Math.cos(.31))<1e-8);
  assert.ok(Math.abs(m.b-Math.sin(.31))<1e-8);
  assert.ok(Math.abs(m.c+Math.sin(.31))<1e-8);
  assert.ok(Math.abs(m.d-Math.cos(.31))<1e-8);
  stop();ctx.restore();ctx.drawImage({width:4,height:4},1,2,4,4);
  assert.equal(ctx.calls.length,2);
  assert.ok(Math.abs(ctx.calls[1].m.a-.72)<1e-8);
});
