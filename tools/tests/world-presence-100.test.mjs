import assert from 'node:assert/strict';
import { ETRANOMWorldPresence } from '../../systems/online/world-presence.js';
const handlers = {};
const presence = {};
for (let i = 0; i < 100; i++) {
  const id = `player-${i}`;
  presence[id] = [{ user_id:id, region_id:'starting_region', x:100+i*3, y:200+i*2, display_name:`بازیکن ${i}`, player_level:1+i%20, player_class:'جنگجو' }];
}
const channel = { on(_type, filter, fn) { handlers[filter.event] = fn; return this; }, subscribe(fn) { queueMicrotask(() => fn('SUBSCRIBED')); return this; }, presenceState() { return presence; } };
const supabase = { channel(){return channel;}, __etranomPresenceChannel:channel, from(table) { return { select() { const data = table==='friendships' ? [] : []; const b={ then(resolve,reject){return Promise.resolve({data,error:null}).then(resolve,reject);}, or(){return Promise.resolve({data,error:null});} }; return b; } }; }, async removeChannel() {} };
const world = new ETRANOMWorldPresence({supabase,user:{id:'self'},onChange:()=>{}});
await world.start();
assert.equal(world.getPlayers('starting_region').length,100);
assert.equal(world.getPlayers('region_vardash_west').length,0);
const first = world.getPlayers('starting_region')[0];
assert.equal(first.name,'بازیکن 0');
assert.ok(Number.isFinite(first.x) && Number.isFinite(first.y));
await world.stop();
console.log('100-player presence aggregation and map filtering passed (simulation only).');
