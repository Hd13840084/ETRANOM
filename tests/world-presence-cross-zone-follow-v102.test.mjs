import assert from 'node:assert/strict';
import { ETRANOMWorldPresence } from '../systems/online/world-presence.js';

const handlers = {};
const presenceState = {
  'player-a': [{ user_id:'player-a', world_id:'starting_world', region_id:'burnt_forest', x:-700, y:1800, display_name:'بازیکن جنگل', player_level:3 }],
  'player-b': [{ user_id:'player-b', world_id:'starting_world', region_id:'southern_plains', x:-1750, y:1200, display_name:'بازیکن دشت', player_level:5 }],
  'other-world': [{ user_id:'other-world', world_id:'other_world', region_id:'starting_region', x:20, y:30, display_name:'جهان دیگر' }],
  'self': [{ user_id:'self', world_id:'starting_world', region_id:'starting_region', x:0, y:0 }]
};
const channel = {
  on(_type, filter, fn) { handlers[filter.event] = fn; return this; },
  subscribe(fn) { queueMicrotask(() => fn('SUBSCRIBED')); return this; },
  presenceState() { return presenceState; }
};
const supabase = {
  __etranomPresenceChannel: channel,
  from(table) { return { select() { const result = table === 'friendships' ? {data:[],error:null} : {data:[],error:null}; return {or:async()=>result,then:(resolve,reject)=>Promise.resolve(result).then(resolve,reject)}; } }; },
  channel() { return channel; }, async removeChannel() {}
};
globalThis.window = new EventTarget();
const world = new ETRANOMWorldPresence({supabase,user:{id:'self'}});
await world.start();
assert.equal(world.getPlayers('starting_world').length,2, 'same-world players must be visible across different zone IDs');
assert.equal(world.getPlayers('burnt_forest').length,1, 'legacy region-only lookup remains supported');
assert.equal(world.getPlayers('other_world').length,1, 'players from another world are excluded from this world');
world.interpolationMs=100;
presenceState['player-a'][0].x=-600;
window.dispatchEvent(new Event('etranom:presence-state'));
const immediate=world.getPlayers('starting_world').find(p=>p.user_id==='player-a').x;
await new Promise(resolve=>setTimeout(resolve,50));
const midway=world.getPlayers('starting_world').find(p=>p.user_id==='player-a').x;
assert.ok(midway>immediate && midway<-600, 'remote avatar position must interpolate smoothly toward its latest position');
await world.stop();
console.log('PASS cross-zone visibility and smooth remote movement interpolation');
