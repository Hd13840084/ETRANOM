import { PARTY_CONFIG } from "./party-config.js";
import { resolvePartyCapacityV2014 } from "../admin/owner-runtime-adapters-v2011.js?v=2014";

export class PartyManager {
  constructor(api) { this.api = api; this.party = null; }
  async refresh() {
    const result = await this.api.getParty();
    const raw = result?.party ?? result;
    if (!raw || !raw.id) { this.party = null; return null; }
    const members = Array.isArray(raw.members) ? raw.members : [];
    this.party = { ...raw, members: members.map(m => ({ ...m, ready: Boolean(m.ready ?? m.is_ready), is_leader: Boolean(m.is_leader || m.role === "leader") })) };
    return this.party;
  }
  async create(regionId) {
    if (this.party) throw new Error("ابتدا از گروه فعلی خارج شو.");
    if (!this.api.getRegion(regionId)) throw new Error("منطقه انتخاب‌شده معتبر نیست.");
    const result = await this.api.createParty(regionId);
    // The database requires select_party_region to move a new party from
    // "forming" to "preparing" before the ready-check/session can begin.
    await this.api.selectRegion(regionId);
    await this.refresh();
    return result;
  }
  async leave() { if (!this.party) throw new Error("عضو گروهی نیستی."); await this.api.leaveParty(); this.party = null; return true; }
  async disband() { if (!this.party) throw new Error("گروهی وجود ندارد."); await this.api.disbandParty(); this.party = null; return true; }
  async transferLeadership(id) { if (!this.party) throw new Error("گروهی وجود ندارد."); if (!id) throw new Error("عضو مقصد مشخص نشده است."); await this.api.transferLeadership(id); return this.refresh(); }
  async kick(id) { if (!this.party) throw new Error("گروهی وجود ندارد."); if (!id) throw new Error("عضو مشخص نشده است."); await this.api.kickMember(id); return this.refresh(); }
  async setReady(value) { if (!this.party) throw new Error("عضو گروهی نیستی."); await this.api.setReady(Boolean(value)); return this.refresh(); }
  isLeader() { return Boolean(this.party?.is_leader || this.party?.role === "leader"); }
  getMembers() { return this.party?.members || []; }
  getMemberCount() { return this.getMembers().length; }
  hasCapacity() { return this.getMemberCount() < Math.min(PARTY_CONFIG.MAX_MEMBERS, resolvePartyCapacityV2014().maxMembers); }
  allReady() { const m = this.getMembers(); return m.length >= PARTY_CONFIG.MIN_MEMBERS_TO_START && m.every(x => Boolean(x.ready ?? x.is_ready)); }
}
