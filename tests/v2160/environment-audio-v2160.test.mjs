import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  EnvironmentAudioControllerV2160,
  resolveEnvironmentAudioProfileV2160,
  auditEnvironmentAudioV2160
} from '../../systems/world/environment-audio-v2160.js';

function audioParam(initial = 0) {
  return {
    value: initial,
    setTargetAtTime(value) { this.value = value; },
    setValueAtTime(value) { this.value = value; },
    exponentialRampToValueAtTime(value) { this.value = value; },
    cancelScheduledValues() {}
  };
}
class FakeNode {
  constructor() {
    this.gain = audioParam(0);
    this.frequency = audioParam(440);
    this.Q = audioParam(1);
    this.pan = audioParam(0);
    this.loop = false;
    this.type = 'sine';
  }
  connect() { return this; }
  disconnect() {}
  start() {}
  stop() {}
}
class FakeAudioContext {
  constructor() { this.sampleRate = 8000; this.currentTime = 0; this.state = 'running'; this.destination = new FakeNode(); }
  createGain() { return new FakeNode(); }
  createBiquadFilter() { return new FakeNode(); }
  createBufferSource() { return new FakeNode(); }
  createOscillator() { return new FakeNode(); }
  createStereoPanner() { return new FakeNode(); }
  createBuffer(_channels, length) { const data = new Float32Array(length); return { getChannelData: () => data }; }
  resume() { this.state = 'running'; return Promise.resolve(); }
  suspend() { this.state = 'suspended'; return Promise.resolve(); }
  close() { this.state = 'closed'; return Promise.resolve(); }
}

test('season, region, and weather select distinct finite soundscape profiles', () => {
  const spring = resolveEnvironmentAudioProfileV2160({ season: 'spring', region: 'rootwood', hour: 10, weather: { rain: 0, wind: .2 } });
  const winterStorm = resolveEnvironmentAudioProfileV2160({ season: 'winter', region: 'frost_march', hour: 2, weather: { snow: 1, wind: 1, lightning: true, type: 'storm' } });
  const river = resolveEnvironmentAudioProfileV2160({ season: 'autumn', region: 'vardash_river', hour: 14, weather: { rain: .2, wind: .3 } });
  const summerNight = resolveEnvironmentAudioProfileV2160({ season: 'summer', region: 'rootwood', hour: 22, weather: { rain: 0, wind: .1 } });
  assert.ok(spring.birds > 0);
  assert.ok(winterStorm.wind > spring.wind);
  assert.equal(winterStorm.lightning, true);
  assert.ok(river.water > 0);
  assert.ok(summerNight.insects > 0);
  for (const profile of [spring, winterStorm, river, summerNight]) {
    for (const value of Object.values(profile)) if (typeof value === 'number') assert.ok(Number.isFinite(value));
  }
});

test('environmental sound profile clamps extreme inputs and accepts region aliases', () => {
  const profile = resolveEnvironmentAudioProfileV2160({ regionId: 'region_vardash_west', season: 'invalid', hour: 999, weather: { rain: 9, wind: -4, snow: 3, ash: -1 } });
  assert.equal(profile.region, 'vardash_river');
  assert.equal(profile.season, 'summer');
  assert.equal(profile.rain, .112);
  assert.equal(profile.windStrength, 0);
  assert.equal(profile.snowStrength, 1);
});

test('controller throttles frame updates but always retains the latest resolved scene', () => {
  const controller = new EnvironmentAudioControllerV2160();
  const first = controller.update({ season: 'spring', region: 'rootwood', weather: { wind: .2 } }, 1000);
  const throttled = controller.update({ season: 'winter', region: 'frost_march', weather: { wind: 1, snow: 1 } }, 1200);
  const applied = controller.update({ season: 'winter', region: 'frost_march', weather: { wind: 1, snow: 1 } }, 2000);
  assert.equal(first.throttled, false);
  assert.equal(throttled.throttled, true);
  assert.equal(throttled.profile.season, 'winter', 'the latest world season is retained even while audio envelopes are throttled');
  assert.equal(applied.profile.season, 'winter');
  controller.dispose();
});

test('audio graph is gesture-unlockable, smoothly controlled, and disposable', async () => {
  const fake = new FakeAudioContext();
  const controller = new EnvironmentAudioControllerV2160({ audioContextFactory: () => fake });
  controller.update({ season: 'spring', region: 'rootwood', hour: 10, weather: { wind: .4 } }, 1000);
  assert.equal(controller.context, null, 'no audio context is created before the explicit gesture/unlock step');
  assert.equal(controller.graph, null);
  assert.equal(await controller.unlock(), true);
  assert.equal(controller.unlocked, true);
  assert.equal(Object.keys(controller.graph.layers).length, 8);
  assert.equal(controller.setVolume(1.7), 1);
  await controller.setEnabled(false);
  assert.equal(controller.enabled, false);
  assert.equal(controller.graph.master.gain.value, 0);
  await controller.setEnabled(true);
  assert.equal(controller.enabled, true);
  assert.equal(controller.graph.master.gain.value, 1);
  controller.dispose();
  assert.equal(controller.disposed, true);
  assert.equal(controller.context, null);
});

test('stage 18 audit passes four representative soundscape states', () => {
  const audit = auditEnvironmentAudioV2160();
  assert.equal(audit.ok, true, JSON.stringify(audit.errors));
  assert.equal(audit.stage, 18);
  assert.equal(audit.profilesChecked, 4);
});

test('Stage 18 is wired into the production world loop and cache-busted game entry', () => {
  const root = process.cwd();
  const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const weather = fs.readFileSync(path.join(root, 'systems/world/weather-system-v2157.js'), 'utf8');
  assert.match(game, /environment-audio-v2160\.js\?v=2160/);
  assert.match(game, /ETRANOM_ENVIRONMENT_AUDIO_V2160\.mount\(document\.getElementById\('etr-game-root'\)\)/);
  assert.match(game, /ETRANOM_ENVIRONMENT_AUDIO_V2160\.update\(\{ regionId: weatherRegionId, season: currentWeatherV2157\.season/);
  assert.match(index, /game\.js\?v=2166-stage24-world-validation/);
  assert.match(weather, /integrated-by-stage-18-environment-audio-v2160/);
});
