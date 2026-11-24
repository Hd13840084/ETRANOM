import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(new URL('..',import.meta.url).pathname);
globalThis.window=globalThis;
globalThis.fetch=async input=>{
  const file=path.resolve(root,String(input).replace(/^\.\//,''));
  try{return new Response(await fs.readFile(file),{status:200,headers:{'content-type':'application/json'}})}
  catch{return new Response('not found',{status:404});}
};
const {loadRegionOneRuntime}=await import('../systems/content/region-one-runtime.js');
const id='burnt_ash_wolf';
const result=await loadRegionOneRuntime({supabase:{rpc:async name=>{
  assert.equal(name,'etranom_runtime_published_content_v1');
  return {data:[{content_type:'monster',content_id:id,version:2,payload:{id,name:'هیولای آزمایشی Owner',description_fa:'override runtime'}}],error:null};
}}});
assert.equal(result.monsters.find(x=>x.id===id)?.name,'هیولای آزمایشی Owner');
assert.equal(result.adminPublishedCount,1);
console.log('PASS admin runtime overlay: published monster override consumed by region-one runtime.');
