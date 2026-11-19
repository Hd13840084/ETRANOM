// ETRANOM Online Presence (Supabase Realtime Presence)
// Advisory UI state only. Never use presence for permissions, ownership, combat or rewards.
export class ETRANOMPresence {
  constructor(supabase, user, onChange = () => {}, options = {}) {
    if (!supabase || typeof supabase.channel !== 'function') throw new Error('Supabase Realtime client is required.');
    if (!user?.id) throw new Error('Authenticated user is required for online presence.');
    this.supabase = supabase;
    this.user = user;
    this.onChange = typeof onChange === 'function' ? onChange : () => {};
    this.heartbeatMs = Math.max(15000, Number(options.heartbeatMs) || 45000);
    this.channel = null;
    this.state = 'STOPPED';
    this.online = new Map();
    this.sessionCount = 0;
    this.started = false;
    this.stopping = false;
    this.startPromise = null;
    this.heartbeatTimer = null;
    this.reconcileTimer = null;
    this.visibilityHandler = null;
    this.pageHideHandler = null;
    this.subscriptionGeneration = 0;
    this.lastTrackAt = 0;
    this.locationMeta = {};
    this.lastLocationTrackAt = 0;
    this.lastPublishedLocation = null;
    this.trackPromise = null;
    this.trackQueued = false;
  }

  emit(extra = {}) {
    try {
      this.onChange({
        status: this.state,
        onlineCount: this.online.size,
        sessionCount: this.sessionCount,
        onlineUserIds: [...this.online.keys()],
        ...extra
      });
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') window.dispatchEvent(new CustomEvent('etranom:presence-state'));
    } catch (error) { console.warn('[ETRANOM Presence] callback failed:', error); }
  }

  isOnline(userId) { return this.online.has(String(userId)); }
  getUser(userId) { return this.online.get(String(userId)) || null; }

  setLocation(meta = {}, force = false) {
    const next = { region_id: String(meta.region_id || ''), x: Number(meta.x), y: Number(meta.y), display_name: String(meta.display_name || 'ماجراجو').slice(0, 24), player_level: Math.max(1, Math.min(999, Number(meta.player_level) || 1)), player_class: String(meta.player_class || '').slice(0, 24) };
    if (!next.region_id || !Number.isFinite(next.x) || !Number.isFinite(next.y)) return false;
    this.locationMeta = next;
    const prev = this.lastPublishedLocation;
    const regionChanged = !!prev && prev.region_id !== next.region_id;
    const moved = !prev || regionChanged || Math.hypot(next.x - prev.x, next.y - prev.y) >= 10;
    // A single shared Presence channel carries positions at a bounded rate.
    // At 100 connected clients this keeps the aggregate update rate near 83/s.
    if (moved && (force || regionChanged || Date.now() - this.lastLocationTrackAt >= 1200)) {
      this.lastLocationTrackAt = Date.now();
      this.lastPublishedLocation = { ...next };
      this.track();
    }
    return true;
  }

  rebuildOnline(extra = {}) {
    const next = new Map();
    let sessions = 0;
    const presenceState = this.channel?.presenceState?.() || {};
    for (const [rawKey, metas] of Object.entries(presenceState)) {
      // Supabase's Presence key is the authoritative account identity. Metadata
      // can be stale or malformed (and must not collapse several accounts into
      // one count), so never prefer meta.user_id over the channel key.
      const id = String(rawKey || '').trim();
      if (!id) continue;
      const entries = Array.isArray(metas) ? metas : (metas && typeof metas === 'object' ? [metas] : []);
      if (!entries.length) continue;
      sessions += entries.length;
      let newest = null;
      for (const meta of entries) {
        if (!newest || String(meta?.last_seen || '') >= String(newest?.last_seen || '')) newest = meta;
      }
      next.set(id, { ...(newest || {}), user_id: id });
    }
    this.online = next;
    this.sessionCount = sessions;
    this.emit(extra);
  }

  async track() {
    if (!this.channel || this.stopping || this.state !== 'SUBSCRIBED') return false;
    if (this.trackPromise) { this.trackQueued = true; return this.trackPromise; }
    this.trackPromise = (async () => {
      try {
        const { error } = await this.channel.track({
          user_id: this.user.id,
          state: document.visibilityState === 'hidden' ? 'away' : 'online',
          last_seen: new Date().toISOString(),
          ...this.locationMeta
        });
        if (error) throw error;
        this.lastTrackAt = Date.now();
        return true;
      } catch (error) {
        console.warn('[ETRANOM Presence] track failed:', error);
        this.emit({ warning: error?.message || String(error) });
        return false;
      } finally {
        this.trackPromise = null;
        if (this.trackQueued && !this.stopping && this.state === 'SUBSCRIBED') {
          this.trackQueued = false;
          queueMicrotask(() => this.track());
        }
      }
    })();
    return this.trackPromise;
  }

  async start() {
    if (this.started && this.startPromise) return this.startPromise;
    if (this.started) return this;
    this.started = true;
    this.stopping = false;
    const generation = ++this.subscriptionGeneration;
    this.state = 'CONNECTING';
    this.emit();
    this.channel = this.supabase.channel('etranom:global-presence', {
      config: { presence: { key: String(this.user.id) } }
    });
    // Expose the one authoritative channel to the world-avatar layer.
    this.supabase.__etranomPresenceChannel = this.channel;
    this.channel
      .on('presence', { event: 'sync' }, () => { if (!this.stopping && generation === this.subscriptionGeneration) this.rebuildOnline(); })
      .on('presence', { event: 'join' }, event => { if (!this.stopping && generation === this.subscriptionGeneration) this.rebuildOnline({ event: 'join', joined: event.key }); })
      .on('presence', { event: 'leave' }, event => { if (!this.stopping && generation === this.subscriptionGeneration) this.rebuildOnline({ event: 'leave', left: event.key }); });

    this.startPromise = new Promise(resolve => {
      let settled = false;
      const finish = () => { if (!settled) { settled = true; resolve(this); } };
      this.channel.subscribe(async status => {
        if (this.stopping || generation !== this.subscriptionGeneration) return;
        this.state = status;
        this.emit();
        if (status === 'SUBSCRIBED') {
          await this.track();
          this.rebuildOnline();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          this.emit({ warning: `Realtime ${status.toLowerCase()}` });
        }
        finish();
      });
      // Do not leave callers hanging if the network never returns a status callback.
      setTimeout(finish, 8000);
    });

    this.heartbeatTimer = setInterval(() => {
      if (this.state === 'SUBSCRIBED') this.track();
    }, this.heartbeatMs);
    // Presence sync/join/leave events are the fast path. Periodic reconciliation
    // also recovers the displayed count if a mobile browser drops an event while
    // suspended or reconnecting. It reads the existing channel; no extra channel.
    this.reconcileTimer = setInterval(() => {
      if (this.state === 'SUBSCRIBED' && !this.stopping) this.rebuildOnline({ reconciliation: true });
    }, 5000);
    this.visibilityHandler = () => { if (this.state === 'SUBSCRIBED') this.track(); };
    this.pageHideHandler = () => { this.state = 'DISCONNECTING'; this.emit(); };
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', this.visibilityHandler);
    if (typeof window !== 'undefined') window.addEventListener('pagehide', this.pageHideHandler);
    return this.startPromise;
  }

  async stop() {
    if (this.stopping) return;
    this.stopping = true;
    this.subscriptionGeneration += 1;
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.reconcileTimer) clearInterval(this.reconcileTimer);
    this.heartbeatTimer = null;
    this.reconcileTimer = null;
    if (this.visibilityHandler && typeof document !== 'undefined') document.removeEventListener('visibilitychange', this.visibilityHandler);
    if (this.pageHideHandler && typeof window !== 'undefined') window.removeEventListener('pagehide', this.pageHideHandler);
    this.visibilityHandler = null;
    this.pageHideHandler = null;
    const channel = this.channel;
    this.channel = null;
    if (this.supabase.__etranomPresenceChannel) delete this.supabase.__etranomPresenceChannel;
    this.online.clear();
    this.sessionCount = 0;
    this.state = 'STOPPED';
    this.started = false;
    this.startPromise = null;
    if (channel) {
      try { await this.supabase.removeChannel(channel); }
      catch (error) { console.warn('[ETRANOM Presence] channel cleanup failed:', error); }
    }
    this.emit();
  }
}
