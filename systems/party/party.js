import { getPartyRegion } from "./party-config.js";
import { PartyManager } from "./party-manager.js";
import { PartyInvites } from "./party-invites.js";
import { PartySync } from "./party-sync.js";
import { PartyCombat } from "./party-combat.js";
import { PartyUI } from "./party-ui.js?v=184";

export class ETRANOMParty {
  constructor({ supabase, container = null, onUpdate = () => {} } = {}) {
    if (!supabase || typeof supabase.rpc !== "function" || !supabase.auth) throw new Error("Supabase client is required.");
    this.supabase = supabase; this.currentUser = null; this.destroyed = false;
    this.onUpdate = typeof onUpdate === "function" ? onUpdate : () => {};
    this._refreshing = null; this._subscribedPartyId = null; this._battlePollTimer = null; this._battleHeartbeatTimer = null; this._battlePolling = false;
    this.api = this.createAPI();
    this.manager = new PartyManager(this.api);
    this.invites = new PartyInvites(this.api);
    this.combat = new PartyCombat(this.api, this.manager);
    this.sync = new PartySync(supabase, event => {
      if (event?.type === "member_change" || event?.type === "party_change") this.refresh().catch(error => this.reportError(error));
      this.onUpdate(event);
    });
    this.ui = container ? new PartyUI(container, this) : null;
  }

  createAPI() {
    const call = async (name, args = {}) => {
      const { data, error } = await this.supabase.rpc(name, args);
      if (error) { const e = new Error(error.message || `RPC ${name} failed`); e.code = error.code; e.details = error.details; e.hint = error.hint; throw e; }
      return data;
    };
    return {
      getParty: () => call("get_my_party"),
      createParty: region => call("create_party", { p_region_id: region }),
      leaveParty: () => call("leave_party"),
      disbandParty: () => call("disband_party"),
      transferLeadership: userId => call("transfer_party_leadership", { p_target_user_id: userId }),
      kickMember: userId => call("kick_party_member", { p_target_user_id: userId }),
      setReady: ready => call("set_party_ready", { p_ready: Boolean(ready) }),
      invite: userId => call("invite_party_member", { p_target_user_id: userId }),
      respondInvite: async (inviteId, accept) => {
        const result = await call("respond_party_invite", { p_invite_id: inviteId, p_accept: Boolean(accept) });
        if (result?.success === false) {
          const error = new Error(result.expired ? "مهلت این دعوت به پایان رسیده است. از رهبر گروه بخواه دعوت تازه‌ای بفرستد." : (result.message || "پذیرش دعوت انجام نشد."));
          error.code = result.expired ? "INVITATION_EXPIRED" : "INVITATION_NOT_ACCEPTED";
          throw error;
        }
        return result;
      },
      cancelInvite: inviteId => call("cancel_party_invite", { p_invite_id: inviteId }),
      getReceivedInvites: () => call("get_party_invites"),
      getSentInvites: () => call("get_sent_party_invites"),
      selectRegion: region => call("select_party_region", { p_region_id: region }),
      startSession: encounterType => call("start_party_session_v2", { p_encounter_type: encounterType || "normal" }),
      finishSession: (sessionId, result) => call("finish_party_session", { p_session_id: sessionId, p_result: result }),
      getSession: () => call("get_my_party_session"),
      getBattleSnapshot: sessionId => call("etranom_party_battle_snapshot", { p_session_id: sessionId }),
      battleHeartbeat: sessionId => call("etranom_party_battle_heartbeat", { p_session_id: sessionId }),
      battleAction: (sessionId, action, targetIndex = null) => call("etranom_party_battle_act", { p_session_id: sessionId, p_action: action, p_target_index: targetIndex }),
      getBattleRewards: () => call("etranom_party_battle_rewards"),
      getRegion: getPartyRegion
    };
  }

  async initialize() {
    if (this.destroyed) throw new Error("Party system is closed.");
    const { data, error } = await this.supabase.auth.getUser();
    if (error) throw error;
    if (!data?.user) throw new Error("ابتدا وارد حساب کاربری شو.");
    this.currentUser = data.user;
    await this.refresh();
    return this;
  }

  async refresh() {
    if (this.destroyed) return null;
    if (this._refreshing) return this._refreshing;
    this._refreshing = (async () => {
      const party = await this.manager.refresh();
      const id = party?.id || null;
      if (id !== this._subscribedPartyId) {
        if (this._subscribedPartyId) await this.sync.unsubscribe();
        this._subscribedPartyId = id;
        if (id) this.sync.subscribe(id);
      }
      const session = await this.api.getSession();
      if (this.ui && !session?.id) this.ui.render();
      if (session?.id) {
        this.combat.session = session;
        if (session.status === "active") {
          await this.api.battleHeartbeat(session.id);
          if (!this._battleHeartbeatTimer) this._battleHeartbeatTimer = setInterval(() => {
            if (!this.destroyed && this.combat.session?.id) this.api.battleHeartbeat(this.combat.session.id).catch(error => this.reportError(error));
          }, 10000);
        }
        const snapshot = await this.api.getBattleSnapshot(session.id);
        if (this.ui) this.ui.renderBattle(snapshot);
        if (snapshot?.status === "active") {
          if (!this._battlePollTimer) this._battlePollTimer = setInterval(() => this.refreshBattleSnapshot().catch(error => this.reportError(error)), 2500);
        } else {
          if (this._battlePollTimer) { clearInterval(this._battlePollTimer); this._battlePollTimer = null; }
          if (this._battleHeartbeatTimer) { clearInterval(this._battleHeartbeatTimer); this._battleHeartbeatTimer = null; }
        }
      } else {
        if (this._battlePollTimer) { clearInterval(this._battlePollTimer); this._battlePollTimer = null; }
        if (this._battleHeartbeatTimer) { clearInterval(this._battleHeartbeatTimer); this._battleHeartbeatTimer = null; }
      }
      return party;
    })();
    try { return await this._refreshing; } finally { this._refreshing = null; }
  }

  async refreshBattleSnapshot() {
    if (this._battlePolling || this.destroyed) return null;
    this._battlePolling = true;
    try {
      const session = await this.api.getSession();
      if (!session?.id) return null;
      this.combat.session = session;
      if (session.status === "active" && !this._battleHeartbeatTimer) {
        await this.api.battleHeartbeat(session.id);
        this._battleHeartbeatTimer = setInterval(() => {
          if (!this.destroyed && this.combat.session?.id) this.api.battleHeartbeat(this.combat.session.id).catch(error => this.reportError(error));
        }, 10000);
      }
      const snapshot = await this.api.getBattleSnapshot(session.id);
      if (this.ui) this.ui.renderBattle(snapshot);
      if (snapshot?.status !== "active") {
        if (this._battlePollTimer) { clearInterval(this._battlePollTimer); this._battlePollTimer = null; }
        if (this._battleHeartbeatTimer) { clearInterval(this._battleHeartbeatTimer); this._battleHeartbeatTimer = null; }
      }
      return snapshot;
    } finally { this._battlePolling = false; }
  }

  currentUserReady() {
    const member = this.manager.getMembers().find(m => m.user_id === this.currentUser?.id);
    return Boolean(member?.ready ?? member?.is_ready);
  }

  async showInvites() {
    const [received, sent] = await Promise.all([this.invites.received(), this.invites.sent()]);
    const result = { received: Array.isArray(received) ? received : [], sent: Array.isArray(sent) ? sent : [] };
    if (this.ui) await this.ui.renderInvites(result);
    return result;
  }

  async invite(userId) { const result = await this.invites.send(userId); await this.refresh(); return result; }
  async acceptInvite(id) { const result = await this.invites.accept(id); await this.refresh(); return result; }
  async declineInvite(id) { const result = await this.invites.decline(id); await this.refresh(); return result; }
  async cancelInvite(id) { const result = await this.invites.cancel(id); await this.refresh(); return result; }
  reportError(error) { console.error("[ETRANOM Party]", error); if (this.ui) this.ui.status(error?.message || "خطا در سیستم گروه."); }
  destroy() { if (this.destroyed) return; this.destroyed = true; if (this._battlePollTimer) clearInterval(this._battlePollTimer); if (this._battleHeartbeatTimer) clearInterval(this._battleHeartbeatTimer); this._battlePollTimer = null; this._battleHeartbeatTimer = null; this.sync.unsubscribe(); this._subscribedPartyId = null; this.currentUser = null; }
}
