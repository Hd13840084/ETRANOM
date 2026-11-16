import { PARTY_CONFIG } from "./party-config.js";

export class PartyManager {

    constructor(api) {
        this.api = api;
        this.party = null;
    }

    async refresh() {
        const result = await this.api.getParty();
        this.party = result?.party || null;
        return this.party;
    }

    async create(regionId) {
        if (this.party) throw new Error("ابتدا از گروه فعلی خارج شو.");
        if (!this.api.getRegion(regionId)) {
            throw new Error("منطقه انتخاب‌شده معتبر نیست.");
        }

        const result = await this.api.createParty(regionId);
        await this.refresh();
        return result;
    }

    async leave() {
        if (!this.party) throw new Error("عضو گروهی نیستی.");

        await this.api.leaveParty();
        this.party = null;
        return true;
    }

    async disband() {
        if (!this.party) throw new Error("گروهی وجود ندارد.");

        await this.api.disbandParty();
        this.party = null;
        return true;
    }

    async transferLeadership(targetUserId) {
        if (!this.party) throw new Error("گروهی وجود ندارد.");
        if (!targetUserId) throw new Error("عضو مقصد مشخص نشده است.");

        await this.api.transferLeadership(targetUserId);
        return this.refresh();
    }

    async kick(targetUserId) {
        if (!this.party) throw new Error("گروهی وجود ندارد.");
        if (!targetUserId) throw new Error("عضو مشخص نشده است.");

        await this.api.kickMember(targetUserId);
        return this.refresh();
    }

    async setReady(ready) {
        if (!this.party) throw new Error("عضو گروهی نیستی.");

        await this.api.setReady(!!ready);
        return this.refresh();
    }

    isLeader() {
        return !!this.party?.is_leader;
    }

    getMembers() {
        return this.party?.members || [];
    }

    getMemberCount() {
        return this.getMembers().length;
    }

    hasCapacity() {
        return this.getMemberCount() < PARTY_CONFIG.MAX_MEMBERS;
    }

    allReady() {
        const members = this.getMembers();

        return members.length >= PARTY_CONFIG.MIN_MEMBERS_TO_START &&
            members.every(member => member.ready === true);
    }

}