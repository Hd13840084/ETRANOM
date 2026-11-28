import assert from 'node:assert/strict';
import { ETRANOMWorldPresence } from '../../systems/online/world-presence.js';

const listeners = new Map();
globalThis.window = {
  addEventListener: (name, fn) => listeners.set(name, fn),
  removeEventListener: name => listeners.delete(name)
};
let releaseFriends;
const delayed = new Promise(resolve => { releaseFriends = resolve; });
const supabase = {
  channel() { throw new Error('WorldPresence must reuse the shared channel'); },
  from(table) {
    return { select() {
      const result = table === 'friendships' ? delayed : Promise.resolve({ data: [], error: null });
      const query = { or() { return result; }, then(resolve, reject) { return Promise.resolve(result).then(resolve, reject); } };
      return query;
    } };
  }
};
const world = new ETRANOMWorldPresence({ supabase, user: { id: 'self' } });
const starting = world.start();
await Promise.resolve();
await world.stop();
releaseFriends({ data: [], error: null });
await starting;
assert.equal(world.started, false);
assert.equal(world.status, 'STOPPED');
assert.equal(world.attachTimer, null);
assert.equal(world.refreshTimer, null);
assert.equal(listeners.size, 0, 'cancelled start must not register a listener after stop');
assert.equal(world.channel, null);
console.log('World Presence start/stop race cancellation passed.');
