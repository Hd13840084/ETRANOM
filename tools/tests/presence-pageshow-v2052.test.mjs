import assert from 'node:assert/strict';
import { ETRANOMPresence } from '../../systems/online/presence.js';
const listeners = new Map();
globalThis.document = { visibilityState: 'visible', addEventListener: (n, f) => listeners.set(`d:${n}`, f), removeEventListener: n => listeners.delete(`d:${n}`) };
globalThis.window = { addEventListener: (n, f) => listeners.set(`w:${n}`, f), removeEventListener: n => listeners.delete(`w:${n}`) };
let tracks = 0;
const channel = {
  on() { return this; },
  subscribe(fn) { queueMicrotask(() => fn('SUBSCRIBED')); return this; },
  async track() { tracks++; return { error: null }; },
  presenceState() { return {}; }
};
const client = { channel: () => channel, async removeChannel() {} };
const presence = new ETRANOMPresence(client, { id: 'self' }, () => {}, { heartbeatMs: 60000 });
await presence.start();
const before = tracks;
listeners.get('w:pagehide')();
assert.equal(presence.state, 'SUBSCRIBED', 'pagehide must not leave the local state stuck in DISCONNECTING');
listeners.get('w:pageshow')();
await new Promise(resolve => setTimeout(resolve, 0));
assert.ok(tracks > before, 'pageshow should refresh presence metadata');
await presence.stop();
assert.equal(listeners.size, 0);
console.log('Presence back-forward-cache restoration lifecycle passed.');
