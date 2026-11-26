import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const adapter=fs.readFileSync(path.join(root,'systems/admin/owner-runtime-adapters-v2011.js'),'utf8');
const runtime=fs.readFileSync(path.join(root,'systems/content/region-one-runtime.js'),'utf8');
const ui=fs.readFileSync(path.join(root,'systems/admin/owner-control-v1.js'),'utf8');
const sql=fs.readFileSync(path.join(root,'database/admin/etranom_owner_control_v8_eight_workstreams.sql'),'utf8');
test('eight workstream content types are present in owner UI and SQL',()=>{ for(const t of ['class_balance','monster_ai','economy_rule','guild_config','party_config','pvp_config','progression_rule','ban_policy','dialogue','world_event']) { assert.match(ui,new RegExp(`\\['${t}'`)); assert.ok(sql.includes(`'${t}'`)); }});
test('runtime bridge consumes published rows and exposes typed adapter config',()=>{assert.match(runtime,/applyOwnerRuntimeAdapters\(pack, adminRows\)/);assert.match(runtime,/publishOwnerRuntimeConfig/);assert.match(runtime,/ownerRuntimeConfig:/);});
test('AI and class balance attach by stable ids only',()=>{assert.match(adapter,/monster_id \|\| x.target_id \|\| x.id/);assert.match(adapter,/class_id \|\| x.target_id \|\| x.id/);});
test('ban status RPC requires authenticated identity and is not public',()=>{assert.match(sql,/auth\.uid\(\) is null then raise exception 'AUTH_REQUIRED'/);assert.match(sql,/revoke all on function public\.etranom_player_access_status_v1\(\) from public,anon/);});
test('published AI and class balance records are applied to matching runtime entities', async()=>{
  const source=fs.readFileSync(path.join(root,'systems/admin/owner-runtime-adapters-v2011.js'),'utf8');
  const mod=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  const pack={monsters:[{id:'m1',name:'Mob'}],classes:[{id:'warrior',name:'Warrior'}]};
  const result=mod.applyOwnerRuntimeAdapters(pack,[
    {content_type:'monster_ai',content_id:'ai_m1',version:2,payload:{id:'ai_m1',monster_id:'m1',skill_chance:0.2}},
    {content_type:'class_balance',content_id:'balance_warrior',version:3,payload:{id:'balance_warrior',class_id:'warrior',hp_scale:1.1}},
    {content_type:'guild_config',content_id:'guild_main',version:1,payload:{id:'guild_main',max_members:40}}
  ]);
  assert.equal(pack.monsters[0].ai.skill_chance,0.2);
  assert.equal(pack.classes[0].admin_balance.hp_scale,1.1);
  assert.equal(result.catalog.guild_config[0].max_members,40);
});
