// ETRANOM live map avatars. Realtime Presence is visual/social metadata only.
// It is deliberately NOT used for battle authority, permissions, or rewards.
export class ETRANOMWorldPresence {
  constructor({ supabase, user, onChange = () => {} } = {}) {
    if (!supabase?.channel || !user?.id) throw new Error('Authenticated Supabase session required.');
    this.supabase = supabase; this.user = user; this.onChange = onChange;
    this.channel = null; this.players = new Map(); this.friendIds = new Set(); this.guildIds = new Set();
    this.status = 'STOPPED'; this.refreshTimer = null; this.stopped = false; this.relationError = null;
    this.presenceEventHandler = null;
    this.positionCache = new Map();
    this.profileNames = new Map();
    this.nameLookupPending = new Set();
    this.interpolationMs = 1200;
  }
  async loadRelations() {
    // Relationship lookups are optional decoration. A missing table, RLS denial,
    // or transient network error must never prevent the live map channel starting.
    const safeQuery = async (build) => {
      try { return await build(); }
      catch (error) { return { data: null, error }; }
    };
    const [friends, guilds] = await Promise.all([
      safeQuery(() => this.supabase.from('friendships').select('user_low,user_high')
        .or(`user_low.eq.${this.user.id},user_high.eq.${this.user.id}`)),
      safeQuery(() => this.supabase.from('guild_members').select('user_id,guild_id'))
    ]);
    const errors = [friends?.error, guilds?.error].filter(Boolean);
    this.relationError = errors.length ? errors.map(error => error.message || String(error)).join('; ') : null;
    if (!friends?.error) {
      this.friendIds.clear();
      for (const row of friends?.data || []) {
        const other = String(row.user_low) === String(this.user.id) ? row.user_high : row.user_low;
        if (other) this.friendIds.add(String(other));
      }
    }
    if (!guilds?.error) {
      this.guildIds.clear();
      const mine = (guilds?.data || []).find(row => String(row.user_id) === String(this.user.id));
      if (mine) for (const row of guilds?.data || [])
        if (String(row.guild_id) === String(mine.guild_id)) this.guildIds.add(String(row.user_id));
    }
    if (this.relationError) console.warn('[ETRANOM World Presence] relationship lookup incomplete; map presence remains active:', this.relationError);
    this.rebuild();
    return !this.relationError;
  }
  isUuidLike(value) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || '').trim()); }
  validPlayerName(value) {
    const name = String(value || '').trim();
    if (!name || this.isUuidLike(name) || name.length > 24) return '';
    return name;
  }
  async resolveProfileNames(ids) {
    const missing = [...new Set(ids.map(String))].filter(id => id && !this.profileNames.has(id) && !this.nameLookupPending.has(id));
    if (!missing.length) return;
    missing.forEach(id => this.nameLookupPending.add(id));
    try {
      const { data, error } = await this.supabase.from('player_profiles').select('user_id,display_name,username').in('user_id', missing);
      if (error) throw error;
      for (const row of data || []) {
        const name = this.validPlayerName(row.display_name) || this.validPlayerName(row.username);
        this.profileNames.set(String(row.user_id), name || null);
      }
      for (const id of missing) if (!this.profileNames.has(id)) this.profileNames.set(id, null);
    } catch (error) {
      console.warn('[ETRANOM World Presence] profile-name lookup failed:', error?.message || error);
    } finally {
      missing.forEach(id => this.nameLookupPending.delete(id));
    }
  }
  rebuild() {
    const state = this.channel?.presenceState?.() || {}, next = new Map();
    for (const [key, metas] of Object.entries(state)) for (const meta of (Array.isArray(metas) ? metas : [])) {
      const id = String(key || meta?.user_id || '');
      if (!id || id === String(this.user.id) || !meta?.region_id || !Number.isFinite(Number(meta.x)) || !Number.isFinite(Number(meta.y))) continue;
      const friend = this.friendIds.has(id), guild = this.guildIds.has(id);
      const relation = friend ? 'friend' : guild ? 'guild' : 'normal';
      const metaName = this.validPlayerName(meta.display_name); const target = { user_id:id, world_id:String(meta.world_id || 'starting_world'), x:Number(meta.x), y:Number(meta.y), region_id:String(meta.region_id), name:metaName || this.profileNames.get(id) || 'ماجراجو', level:Math.max(1,Number(meta.player_level)||1), player_class:String(meta.player_class||''), relation, color:relation==='friend'?'#55dc91':relation==='guild'?'#e4bd58':'#d9dce3', state:meta.state==='away'?'away':'online' };
      const old = this.positionCache.get(id);
      const now = Date.now();
      const from = old ? this.interpolateOne(old, now) : target;
      this.positionCache.set(id, { ...target, fromX:from.x, fromY:from.y, updatedAt:now });
      next.set(id, target);
    }
    this.players = next;
    for (const id of this.positionCache.keys()) if (!next.has(id)) this.positionCache.delete(id);
    try { this.onChange([...next.values()]); } catch {}
    const unresolved = [...next.values()].filter(player => player.name === 'ماجراجو').map(player => player.user_id);
    if (unresolved.length) this.resolveProfileNames(unresolved).then(() => { if (!this.stopped) this.rebuild(); });
  }
  async start() {
    // Share the single global Presence channel owned by ETRANOMPresence.
    // Creating a second channel with the same topic/key caused competing
    // sessions and unreliable presence state when two clients logged in.
    await this.loadRelations().catch(error => { this.relationError = error?.message || String(error); console.warn('[ETRANOM World Presence] relation preload failed:', error); });
    this.channel = this.supabase.__etranomPresenceChannel || null;
    if (!this.channel) {
      // The app bootstrap sets this reference after the core Presence starts.
      // Fail visibly rather than opening a duplicate topic.
      this.status = 'WAITING_FOR_PRESENCE';
      console.warn('[ETRANOM World Presence] shared presence channel is not ready.');
      return this;
    }
    this.presenceEventHandler = () => this.rebuild();
    if (typeof window !== 'undefined') window.addEventListener('etranom:presence-state', this.presenceEventHandler);
    this.status = 'SHARED_CHANNEL';
    this.rebuild();
    this.refreshTimer=setInterval(()=>this.loadRelations().catch(error=>{this.relationError=error?.message||String(error);}),30000);
    return this;
  }
  updateLocation({ world_id = 'starting_world', region_id, x, y, name, level, player_class }) {
    if (!window.etranomPresence) return false;
    return window.etranomPresence.setLocation({ world_id, region_id, x, y, display_name:name, player_level:level, player_class });
  }
  interpolateOne(player, now = Date.now()) {
    const duration = Math.max(1, this.interpolationMs);
    const t = Math.max(0, Math.min(1, (now - (player.updatedAt || now)) / duration));
    return { ...player, x:(Number(player.fromX ?? player.x) * (1-t)) + (Number(player.x) * t), y:(Number(player.fromY ?? player.y) * (1-t)) + (Number(player.y) * t) };
  }
  getPlayers(worldOrRegionId = 'starting_world') {
    const now = Date.now();
    const rows = [...this.players.values()];
    // Backward compatibility: legacy callers may still pass a region_id.
    // New world-map callers pass the shared world_id to see players across zones.
    const isWorldId = worldOrRegionId === 'starting_world' || rows.some(p => p.world_id === worldOrRegionId);
    return rows.filter(p => !worldOrRegionId || (isWorldId ? p.world_id === worldOrRegionId : p.region_id === worldOrRegionId))
      .map(p=>this.interpolateOne(this.positionCache.get(p.user_id) || p, now));
  }
  async stop() { this.stopped=true; if(this.refreshTimer)clearInterval(this.refreshTimer); this.refreshTimer=null; if(this.presenceEventHandler && typeof window!=='undefined') window.removeEventListener('etranom:presence-state',this.presenceEventHandler); this.presenceEventHandler=null; this.channel=null; this.players.clear(); this.positionCache.clear(); this.profileNames.clear(); this.nameLookupPending.clear(); }
}
