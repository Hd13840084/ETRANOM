import test from 'node:test';
import assert from 'node:assert/strict';
import { ETRANOMWorldPresence } from '../../systems/online/world-presence.js';

test('world presence exposes validated specialization and motion metadata for live avatars', async () => {
  const presence = {
    'other-player': [{ user_id:'other-player', world_id:'starting_world', region_id:'starting_region', x:120, y:240,
      display_name:'بازیکن آزمایشی', player_level:12, player_class:'جادوگر', specialization_id:'wizard_necromancer',
      direction:'north-west', animation:'run', state:'online' }]
  };
  const channel = { on(){return this;}, subscribe(fn){queueMicrotask(()=>fn('SUBSCRIBED'));return this;}, presenceState(){return presence;} };
  const supabase = { channel(){return channel;}, __etranomPresenceChannel:channel, from(){return {select(){const result={data:[],error:null};return {or:async()=>result,then:(a,b)=>Promise.resolve(result).then(a,b)};}};}, async removeChannel(){} };
  const world = new ETRANOMWorldPresence({supabase,user:{id:'self'}});
  await world.start();
  const player = world.getPlayers('starting_world')[0];
  assert.equal(player.specialization_id,'wizard_necromancer');
  assert.equal(player.direction,'north-west');
  assert.equal(player.animation,'run');
  await world.stop();
});

test('invalid remote specialization and motion metadata safely fall back', async () => {
  const presence = {'other-player':[{world_id:'starting_world',region_id:'starting_region',x:1,y:2,display_name:'بازیکن دوم',specialization_id:'../bad.svg',direction:'diagonal',animation:'teleport'}]};
  const channel={on(){return this;},subscribe(fn){queueMicrotask(()=>fn('SUBSCRIBED'));return this;},presenceState(){return presence;}};
  const supabase={channel(){return channel;},__etranomPresenceChannel:channel,from(){return {select(){const r={data:[],error:null};return {or:async()=>r,then:(a,b)=>Promise.resolve(r).then(a,b)};}};},async removeChannel(){}};
  const world=new ETRANOMWorldPresence({supabase,user:{id:'self'}});await world.start();
  const player=world.getPlayers('starting_world')[0];
  assert.equal(player.specialization_id,'');assert.equal(player.direction,'south');assert.equal(player.animation,'idle');
  await world.stop();
});

test('runtime renders remote specialization sprites and publishes own specialization and facing', async()=>{
  const {readFile}=await import('node:fs/promises');
  const game=await readFile(new URL('../../game.js',import.meta.url),'utf8');
  const presence=await readFile(new URL('../../systems/online/presence.js',import.meta.url),'utf8');
  assert.match(game,/loadCharacterSprite\(other\.specialization_id\)/);
  assert.match(game,/specialization_id:cp\.specializationId/);
  assert.match(game,/direction:playerFacing/);
  assert.match(game,/etranom-map-avatar-sprite/);
  assert.match(presence,/specialization_id:/);
  assert.match(presence,/directions\.includes\(meta\.direction\)/);
});
