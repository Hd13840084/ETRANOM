import assert from 'node:assert/strict';
import { ETRANOMWorldPresence } from '../../systems/online/world-presence.js';
const listeners = new Map();
globalThis.window = {
  addEventListener: (name, fn) => listeners.set(name, fn),
  removeEventListener: name => listeners.delete(name)
};
let relationQueries = 0;
const supabase = {
  channel() { throw new Error('WorldPresence must not create a duplicate channel'); },
  from(table) {
    return {
      select() {
        const result = { data: [], error: null };
        const query = {
          or() { return Promise.resolve(result); },
          then(resolve, reject) { return Promise.resolve(result).then(resolve, reject); }
        };
        relationQueries++;
        return query;
      }
    };
  }
};
const world = new ETRANOMWorldPresence({ supabase, user: { id: 'self' } });
await world.start();
await world.start();
assert.equal(world.status, 'WAITING_FOR_PRESENCE');
assert.equal(listeners.size, 1, 'start must register one event listener');
const channel = { presenceState: () => ({ other: [{ world_id: 'starting_world', region_id: 'ash_city', x: 4, y: 8, display_name: 'Other' }] }) };
supabase.__etranomPresenceChannel = channel;
listeners.get('etranom:presence-state')();
assert.equal(world.status, 'SHARED_CHANNEL', 'late shared channel must attach after presence starts');
assert.equal(world.getPlayers('starting_world').length, 1);
await world.stop();
assert.equal(listeners.size, 0, 'stop must remove event listener');
assert.equal(world.attachTimer, null);
assert.ok(relationQueries >= 2);
console.log('World presence delayed shared-channel attachment and idempotent lifecycle passed.');
