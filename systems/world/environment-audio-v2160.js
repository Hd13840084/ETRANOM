// ETRANOM V2160 — Stage 18: procedural environmental soundscape.
// Synthesised locally with Web Audio: no remote media, no save-schema changes, and no autoplay before a game gesture.

const SEASONS = new Set(['spring', 'summer', 'autumn', 'winter']);
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const safeSeason = value => SEASONS.has(String(value || '').toLowerCase()) ? String(value).toLowerCase() : 'summer';
const REGION_ALIASES = Object.freeze({
  vardash_west: 'vardash_river', verdash_river: 'vardash_river', southern_plain: 'southern_plains',
  iron_hollow: 'ironhollow', ironstone: 'ironhollow', ash_city: 'city', farmland: 'grain',
  village_rootwood: 'rootwood', village_ironhollow: 'ironhollow', village_grain: 'grain'
});
const safeRegion = value => { const key = String(value || 'city').toLowerCase().replace(/^region_/, '').replace(/^settlement_/, ''); return REGION_ALIASES[key] || key; };
const clamp01 = value => clamp(value, 0, 1);

const REGION_GROUPS = Object.freeze({
  forest: new Set(['rootwood', 'thorn_grove', 'burnt_forest', 'ash_forest', 'rootbound_ruins', 'haunted_highlands', 'frost_march']),
  water: new Set(['vardash_river', 'verdash_river', 'drowned_mire']),
  ash: new Set(['ash_hills', 'obsidian_wastes', 'burnt_forest', 'ash_forest']),
  settlement: new Set(['city', 'ash_city', 'grain', 'farmland', 'ironhollow', 'iron_hollow', 'ironstone'])
});

/** Resolve sound levels from the same regional weather and four-season clock used by world rendering. */
export function resolveEnvironmentAudioProfileV2160(scene = {}) {
  const weather = scene.weather && typeof scene.weather === 'object' ? scene.weather : scene;
  const season = safeSeason(scene.season || weather.season);
  const region = safeRegion(scene.regionId || scene.region || weather.region);
  const hour = clamp(scene.hour ?? 12, 0, 23.99);
  const daytime = hour >= 6 && hour < 19;
  const night = hour >= 20 || hour < 5;
  const rain = clamp01(weather.rain);
  const snow = clamp01(weather.snow);
  const mist = clamp01(weather.mist);
  const ash = clamp01(weather.ash);
  const wind = clamp01(weather.wind);
  const lightning = !!weather.lightning || String(weather.type || weather.id || '') === 'storm';
  const forest = REGION_GROUPS.forest.has(region);
  const water = REGION_GROUPS.water.has(region);
  const ashland = REGION_GROUPS.ash.has(region);
  const settlement = REGION_GROUPS.settlement.has(region);
  const springNature = season === 'spring' ? 1 : season === 'summer' ? .72 : season === 'autumn' ? .28 : 0;
  const weatherMuffle = 1 - mist * .28 - rain * .16 - (lightning ? .20 : 0);
  const birds = (forest || water || settlement) && daytime
    ? (forest ? .036 : water ? .028 : .016) * springNature * (1 - rain * .72 - snow * .9 - mist * .25)
    : 0;
  const insects = season === 'summer' && (night || hour >= 17) && (forest || water || settlement) ? .020 : 0;
  const foliage = forest ? (season === 'autumn' ? .040 : season === 'spring' ? .018 : season === 'summer' ? .012 : .006) * (.45 + wind * .75) : 0;
  const profile = {
    version: 2160,
    season,
    region,
    weatherType: String(weather.type || weather.id || 'clear'),
    dayPart: daytime ? 'day' : night ? 'night' : 'dusk',
    master: .36,
    wind: clamp(.012 + wind * .092 + (season === 'winter' ? .018 : 0) + (snow > .35 ? .012 : 0), 0, .15) * (lightning ? 1.18 : 1),
    rain: clamp(rain * .112, 0, .12),
    foliage: clamp(foliage * weatherMuffle, 0, .05),
    water: water ? .048 * (1 + rain * .30) : 0,
    fire: ashland ? .006 + Math.max(ash, season === 'summer' ? .12 : 0) * .026 : 0,
    city: settlement ? .008 : 0,
    mist: mist * .014,
    birds: clamp(birds, 0, .04),
    insects,
    thunder: lightning ? .012 : 0,
    snowHush: season === 'winter' ? .008 + snow * .012 : 0,
    windStrength: wind,
    rainStrength: rain,
    snowStrength: snow,
    ashStrength: ash,
    mistStrength: mist,
    lightning,
    daytime,
    night
  };
  return Object.freeze(profile);
}

function setParam(param, value, now, seconds = .9) {
  if (!param) return;
  const target = Number(value);
  if (!Number.isFinite(target)) return;
  try {
    if (typeof param.cancelScheduledValues === 'function') param.cancelScheduledValues(now);
    if (typeof param.setTargetAtTime === 'function') param.setTargetAtTime(target, now, seconds);
    else param.value = target;
  } catch (_) { try { param.value = target; } catch (_) {} }
}

function makeNoiseBuffer(context, seconds = 2.5) {
  const rate = context.sampleRate || 44100;
  const buffer = context.createBuffer(1, Math.max(1, Math.floor(rate * seconds)), rate);
  const channel = buffer.getChannelData(0);
  let brown = 0;
  for (let i = 0; i < channel.length; i++) {
    const white = Math.random() * 2 - 1;
    brown = (brown + .035 * white) / 1.035;
    channel[i] = brown * 3.2;
  }
  return buffer;
}

function makeNoiseLayer(context, buffer, master, { type = 'lowpass', frequency = 900, q = .55 } = {}) {
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  source.loop = true;
  filter.type = type;
  filter.frequency.value = frequency;
  filter.Q.value = q;
  gain.gain.value = 0;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  source.start(0);
  return { source, filter, gain };
}

/** Browser-safe controller. Audio graph is created only after a trusted interaction in the game root. */
export class EnvironmentAudioControllerV2160 {
  constructor(options = {}) {
    this.audioContextFactory = options.audioContextFactory || null;
    this.context = null;
    this.graph = null;
    this.root = null;
    this.document = options.document || (typeof document !== 'undefined' ? document : null);
    this.enabled = true;
    this.volume = .36;
    this.unlocked = false;
    this.supported = true;
    this.lastProfile = resolveEnvironmentAudioProfileV2160({});
    this.lastUpdateMs = -Infinity;
    this.nextBirdAt = 0;
    this.nextInsectAt = 0;
    this.nextLeafAt = 0;
    this.nextThunderAt = 0;
    this.wasStorm = false;
    this.disposed = false;
    this.controls = null;
    this.rootObserver = null;
    this.boundRootState = () => {
      if (!this.context || !this.unlocked || this.context.state === 'closed') return;
      const ready = !!this.root?.classList?.contains?.('etr-game-ready');
      if (!ready) this.context.suspend?.().catch?.(() => {});
      else if (this.enabled) this.context.resume?.().catch?.(() => {});
    };
    this.boundGesture = event => {
      if (!this.enabled || this.disposed) return;
      if (event?.target?.closest?.('.etr-env-audio-controls-v2160')) return;
      this.unlock();
    };
    this.boundVisibility = () => {
      if (!this.context || !this.unlocked) return;
      if (this.document?.hidden) this.context.suspend?.().catch?.(() => {});
      else if (this.enabled) this.context.resume?.().catch?.(() => {});
    };
  }

  _getAudioContextConstructor() {
    if (this.audioContextFactory) return null;
    return typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext || null) : null;
  }

  _buildGraph() {
    if (this.graph || !this.context) return;
    const context = this.context;
    const master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);
    const noise = makeNoiseBuffer(context);
    const layers = {
      wind: makeNoiseLayer(context, noise, master, { type: 'lowpass', frequency: 720, q: .7 }),
      rain: makeNoiseLayer(context, noise, master, { type: 'bandpass', frequency: 2200, q: .55 }),
      foliage: makeNoiseLayer(context, noise, master, { type: 'bandpass', frequency: 1250, q: .7 }),
      water: makeNoiseLayer(context, noise, master, { type: 'lowpass', frequency: 1750, q: .45 }),
      fire: makeNoiseLayer(context, noise, master, { type: 'bandpass', frequency: 2450, q: .9 }),
      city: makeNoiseLayer(context, noise, master, { type: 'lowpass', frequency: 430, q: .65 }),
      mist: makeNoiseLayer(context, noise, master, { type: 'lowpass', frequency: 380, q: .4 }),
      snowHush: makeNoiseLayer(context, noise, master, { type: 'lowpass', frequency: 1100, q: .5 })
    };
    this.graph = { master, layers, noise };
    this._applyProfile(this.lastProfile, true);
  }

  async unlock() {
    if (this.disposed || !this.enabled) return false;
    if (!this.context) {
      try {
        if (this.audioContextFactory) this.context = this.audioContextFactory();
        else {
          const AudioContextConstructor = this._getAudioContextConstructor();
          if (!AudioContextConstructor) { this.supported = false; this._renderControls(); return false; }
          this.context = new AudioContextConstructor();
        }
        this._buildGraph();
      } catch (error) {
        this.supported = false;
        this.lastError = String(error?.message || error || 'audio-context-unavailable');
        this._renderControls();
        return false;
      }
    }
    try {
      if (this.context.state !== 'running' && this.context.state !== 'closed') await this.context.resume();
      this.unlocked = this.context.state !== 'closed';
      if (this.graph) this._applyProfile(this.lastProfile, true);
      this._renderControls();
      return this.unlocked;
    } catch (error) {
      this.lastError = String(error?.message || error || 'audio-resume-failed');
      this._renderControls();
      return false;
    }
  }


  _playTone({ frequency = 1800, endFrequency = 1300, duration = .25, peak = .045, type = 'sine', pan = 0 } = {}) {
    if (!this.context || !this.graph || !this.enabled || this.context.state !== 'running') return;
    const context = this.context;
    try {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, context.currentTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFrequency), context.currentTime + duration);
      gain.gain.setValueAtTime(.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(.0002, peak), context.currentTime + Math.min(.04, duration * .25));
      gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + duration);
      osc.connect(gain);
      if (typeof context.createStereoPanner === 'function') {
        const panner = context.createStereoPanner(); panner.pan.value = clamp(pan, -1, 1); gain.connect(panner); panner.connect(this.graph.master);
      } else gain.connect(this.graph.master);
      osc.start(context.currentTime);
      osc.stop(context.currentTime + duration + .03);
    } catch (_) { /* Optional one-shot detail; the continuous ambience remains available. */ }
  }

  _playThunder() {
    if (!this.context || !this.graph || !this.enabled || this.context.state !== 'running') return;
    const context = this.context;
    try {
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      source.buffer = this.graph.noise;
      source.loop = true;
      filter.type = 'lowpass'; filter.frequency.value = 190; filter.Q.value = .7;
      const now = context.currentTime;
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.12, now + .32);
      gain.gain.exponentialRampToValueAtTime(.0001, now + 4.8);
      source.connect(filter); filter.connect(gain); gain.connect(this.graph.master);
      source.start(now); source.stop(now + 4.9);
      this._playTone({ frequency: 58, endFrequency: 34, duration: 2.6, peak: .026, type: 'sine' });
    } catch (_) { /* Thunder is an optional embellishment. */ }
  }

  _applyProfile(profile, immediate = false) {
    if (!this.graph || !this.context) return;
    const now = this.context.currentTime || 0;
    const tau = immediate ? .02 : 1.35;
    for (const [name, layer] of Object.entries(this.graph.layers)) {
      const target = this.enabled ? clamp(profile[name], 0, .15) : 0;
      setParam(layer.gain.gain, target, now, tau);
    }
    setParam(this.graph.layers.wind.filter.frequency, 520 + profile.windStrength * 1050, now, tau);
    setParam(this.graph.layers.rain.filter.frequency, 1500 + profile.rainStrength * 2500, now, tau);
    setParam(this.graph.layers.water.filter.frequency, 850 + profile.rainStrength * 700, now, tau);
    setParam(this.graph.master.gain, this.enabled ? this.volume : 0, now, immediate ? .03 : .65);
  }

  update(scene = {}, nowMs = (typeof performance !== 'undefined' ? performance.now() : Date.now())) {
    if (this.disposed) return Object.freeze({ ok: false, reason: 'disposed' });
    this.lastProfile = resolveEnvironmentAudioProfileV2160(scene);
    if (Number.isFinite(Number(nowMs)) && Number(nowMs) - this.lastUpdateMs < 850) return Object.freeze({ ok: true, throttled: true, profile: this.lastProfile });
    this.lastUpdateMs = Number(nowMs) || 0;
    if (this.graph) this._applyProfile(this.lastProfile);
    const now = Number(nowMs) || 0;
    const p = this.lastProfile;
    const stormStarted = p.lightning && !this.wasStorm;
    if (stormStarted) this.nextThunderAt = now + 14000 + Math.random() * 12000;
    if (p.lightning && now >= this.nextThunderAt) {
      this._playThunder();
      this.nextThunderAt = now + 23000 + Math.random() * 23000;
    }
    if (!p.lightning) this.nextThunderAt = 0;
    this.wasStorm = p.lightning;

    if (p.birds > .004 && now >= this.nextBirdAt) {
      this._playTone({ frequency: 1850 + Math.random() * 900, endFrequency: 2300 + Math.random() * 1000, duration: .16 + Math.random() * .22, peak: .013, type: 'sine', pan: Math.random() * 1.4 - .7 });
      this.nextBirdAt = now + 7200 + Math.random() * 10500;
    }
    if (p.insects > .004 && now >= this.nextInsectAt) {
      this._playTone({ frequency: 3900 + Math.random() * 650, endFrequency: 3600 + Math.random() * 700, duration: .045 + Math.random() * .035, peak: .0045, type: 'sine', pan: Math.random() * 1.6 - .8 });
      this.nextInsectAt = now + 520 + Math.random() * 850;
    }
    if (p.foliage > .018 && now >= this.nextLeafAt) {
      this.nextLeafAt = now + 9000 + Math.random() * 10000;
      this._playTone({ frequency: 760 + Math.random() * 260, endFrequency: 520, duration: .18, peak: .0025, type: 'triangle', pan: Math.random() * 1.6 - .8 });
    }
    return Object.freeze({ ok: true, throttled: false, profile: this.lastProfile, active: this.enabled && this.unlocked });
  }

  setVolume(value) {
    this.volume = clamp(value, 0, 1);
    if (this.graph && this.context) setParam(this.graph.master.gain, this.enabled ? this.volume : 0, this.context.currentTime || 0, .12);
    this._renderControls();
    return this.volume;
  }

  async setEnabled(enabled) {
    this.enabled = !!enabled;
    if (this.enabled) await this.unlock();
    else if (this.graph && this.context) setParam(this.graph.master.gain, 0, this.context.currentTime || 0, .08);
    this._renderControls();
    return this.enabled;
  }

  async toggle() { return this.setEnabled(!this.enabled); }

  mount(root = this.document?.getElementById?.('etr-game-root')) {
    if (!root || this.disposed) return false;
    if (this.root === root && this.controls?.isConnected) return true;
    this.root = root;
    root.addEventListener?.('pointerdown', this.boundGesture, { capture: true, passive: true });
    root.addEventListener?.('keydown', this.boundGesture, { capture: true });
    this.document?.addEventListener?.('visibilitychange', this.boundVisibility);
    if (typeof MutationObserver !== 'undefined' && !this.rootObserver) {
      this.rootObserver = new MutationObserver(this.boundRootState);
      this.rootObserver.observe(root, { attributes: true, attributeFilter: ['class', 'style'] });
    }
    if (this.document && !this.document.getElementById('etr-env-audio-style-v2160')) {
      const style = this.document.createElement('style');
      style.id = 'etr-env-audio-style-v2160';
      style.textContent = '.etr-env-audio-controls-v2160{position:fixed;z-index:1200;top:calc(env(safe-area-inset-top,0px) + 8px);right:8px;display:flex;align-items:center;gap:6px;padding:5px 7px;border:1px solid rgba(195,164,112,.55);border-radius:10px;background:rgba(17,13,22,.88);color:#f1e8d7;font:12px Tahoma,Arial,sans-serif;backdrop-filter:blur(7px);direction:rtl}.etr-env-audio-controls-v2160 button{min-height:34px;padding:6px 9px;border:1px solid #806643;border-radius:8px;background:#241c2b;color:#f3e9d7;font:inherit}.etr-env-audio-controls-v2160 input{width:72px;max-width:19vw;accent-color:#c7a46a}.etr-env-audio-controls-v2160 label{display:flex;align-items:center;gap:5px;color:#cfc2b2}.etr-env-audio-controls-v2160 button:focus-visible,.etr-env-audio-controls-v2160 input:focus-visible{outline:2px solid #e2bf7c;outline-offset:2px}@media(max-width:420px){.etr-env-audio-controls-v2160{top:calc(env(safe-area-inset-top,0px) + 5px);right:5px;gap:4px;padding:3px 5px}.etr-env-audio-controls-v2160 button{min-height:32px;padding:5px 7px}.etr-env-audio-controls-v2160 input{width:56px}}';
      (this.document.head || this.document.body).appendChild(style);
    }
    if (this.document && !this.document.getElementById('etr-env-audio-controls-v2160')) {
      const panel = this.document.createElement('div');
      panel.id = 'etr-env-audio-controls-v2160';
      panel.className = 'etr-env-audio-controls-v2160';
      panel.innerHTML = '<button type="button" data-audio-toggle aria-pressed="true" aria-label="خاموش یا روشن کردن صدای محیط">🔊 صدای محیط</button><label><span>صدا</span><input data-audio-volume type="range" min="0" max="100" step="1" value="36" aria-label="بلندی صدای محیط"></label>';
      root.appendChild(panel);
      this.controls = panel;
      panel.querySelector('[data-audio-toggle]')?.addEventListener('click', () => { this.toggle(); });
      panel.querySelector('[data-audio-volume]')?.addEventListener('input', event => this.setVolume(Number(event.target.value) / 100));
    } else this.controls = this.document?.getElementById?.('etr-env-audio-controls-v2160') || null;
    this._renderControls();
    return true;
  }

  _renderControls() {
    if (!this.controls) return;
    const button = this.controls.querySelector('[data-audio-toggle]');
    const slider = this.controls.querySelector('[data-audio-volume]');
    if (button) {
      button.textContent = this.supported ? (this.enabled ? '🔊 صدای محیط' : '🔇 صدای محیط') : 'صدا پشتیبانی نمی‌شود';
      button.disabled = !this.supported;
      button.setAttribute('aria-pressed', String(this.enabled));
      button.title = this.enabled ? 'خاموش کردن صدای محیط' : 'روشن کردن صدای محیط';
    }
    if (slider) { slider.value = String(Math.round(this.volume * 100)); slider.disabled = !this.supported; }
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.root?.removeEventListener?.('pointerdown', this.boundGesture, true);
    this.root?.removeEventListener?.('keydown', this.boundGesture, true);
    this.document?.removeEventListener?.('visibilitychange', this.boundVisibility);
    this.rootObserver?.disconnect?.();
    this.rootObserver = null;
    if (this.graph) {
      for (const layer of Object.values(this.graph.layers)) {
        try { layer.source.stop(); } catch (_) {}
        try { layer.source.disconnect(); layer.filter.disconnect(); layer.gain.disconnect(); } catch (_) {}
      }
      try { this.graph.master.disconnect(); } catch (_) {}
    }
    try { this.context?.close?.(); } catch (_) {}
    this.controls?.remove?.();
    this.graph = null;
    this.context = null;
  }
}

export function auditEnvironmentAudioV2160() {
  const errors = [];
  const spring = resolveEnvironmentAudioProfileV2160({ season: 'spring', region: 'rootwood', hour: 10, weather: { rain: 0, wind: .2, mist: 0 } });
  const summerNight = resolveEnvironmentAudioProfileV2160({ season: 'summer', region: 'rootwood', hour: 22, weather: { rain: 0, wind: .1 } });
  const winterStorm = resolveEnvironmentAudioProfileV2160({ season: 'winter', region: 'frost_march', hour: 2, weather: { snow: 1, wind: 1, lightning: true, type: 'storm' } });
  const river = resolveEnvironmentAudioProfileV2160({ season: 'autumn', region: 'vardash_river', hour: 14, weather: { rain: .2, wind: .3 } });
  if (!(spring.birds > 0)) errors.push('spring-day-birds-missing');
  if (!(summerNight.insects > 0)) errors.push('summer-night-insects-missing');
  if (!(winterStorm.wind > spring.wind && winterStorm.lightning)) errors.push('winter-storm-wind-profile-invalid');
  if (!(river.water > 0)) errors.push('river-water-ambience-missing');
  if (![spring, summerNight, winterStorm, river].every(p => Object.values(p).filter(v => typeof v === 'number').every(Number.isFinite))) errors.push('non-finite-audio-level');
  return Object.freeze({ ok: errors.length === 0, version: 2160, stage: 18, profilesChecked: 4, errors: Object.freeze(errors) });
}

export const ETRANOM_ENVIRONMENT_AUDIO_V2160 = new EnvironmentAudioControllerV2160();
if (typeof window !== 'undefined') {
  window.ETRANOM_ENVIRONMENT_AUDIO_V2160 = ETRANOM_ENVIRONMENT_AUDIO_V2160;
  window.ETRANOM_ENVIRONMENT_AUDIO_AUDIT_V2160 = auditEnvironmentAudioV2160();
}
