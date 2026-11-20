import assert from 'node:assert/strict';
import { ETRANOMWorldPresence } from '../../systems/online/world-presence.js';

const handlers = {};
const presence = {
  'friend-1': [{ user_id:'friend-1', region_id:'starting_region', x:10, y:20, display_name:'دوست', player_level:4 }],
  'guild-1': [{ user_id:'guild-1', region_id:'starting_region', x:30, y:40, display_name:'هم‌انجمنی', player_level:5 }],
  'normal-1': [{ user_id:'normal-1', region_id:'starting_region', x:50, y:60, display_name:'عادی', player_level:2 }],
  'self': [{ user_id:'self', region_id:'starting_region', x:0, y:0 }]
};
const channel = {
  on(_type, filter, fn) { handlers[filter.event] = fn; return this; },
  subscribe(fn) { queueMicrotask(() => fn('SUBSCRIBED')); return this; },
  presenceState() { return presence; }
};
const supabase = {
  __etranomPresenceChannel: channel,
  from(table) {
    return { select() { return { or: async () => ({ data:[{user_low:'self',user_high:'friend-1'}], error:null }), then: undefined }; } };
  },
  channel() { return channel; },
  async removeChannel() {}
};
// Make table-specific query chains matching the Supabase API used by the class.
supabase.from = table => ({
  select() {
    const q = { or: async () => ({ data:[{user_low:'self',user_high:'friend-1'}], error:null }) };
    if (table === 'guild_members') q.then = undefined;
    return table === 'guild_members' ? { select:undefined, then:undefined, ...q, /* awaitable query */ } : q;
  }
});
// Use a small thenable builder for both select queries.
supabase.from = table => ({ select() {
  const result = table === 'friendships'
    ? { data:[{user_low:'self',user_high:'friend-1'}], error:null }
    : { data:[{user_id:'self',guild_id:'g1'},{user_id:'guild-1',guild_id:'g1'}], error:null };
  const builder = { or: async () => result, then: (resolve,reject) => Promise.resolve(result).then(resolve,reject) };
  return builder;
}});

const changes=[];
const world = new ETRANOMWorldPresence({ supabase, user:{id:'self'}, onChange: rows => changes.push(rows) });
await world.start();
const rows = world.getPlayers('starting_region');
assert.equal(rows.length,3);
assert.equal(rows.find(x=>x.user_id==='friend-1').relation,'friend');
assert.equal(rows.find(x=>x.user_id==='friend-1').color,'#55dc91');
assert.equal(rows.find(x=>x.user_id==='guild-1').relation,'guild');
assert.equal(rows.find(x=>x.user_id==='guild-1').color,'#e4bd58');
assert.equal(rows.find(x=>x.user_id==='normal-1').relation,'normal');
assert.equal(rows.find(x=>x.user_id==='normal-1').color,'#d9dce3');
assert.equal(world.getPlayers('other-region').length,0);
assert.ok(changes.length >= 1);
await world.stop();
console.log('World map relationship colors and region filtering passed.');
