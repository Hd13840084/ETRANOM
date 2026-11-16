import {
    PARTY_CONFIG,
    getPartyRegion
} from "./party-config.js";

export class PartyCombat {

    constructor(api, manager) {
        this.api = api;
        this.manager = manager;
        this.session = null;
    }

    async selectRegion(regionId) {
        if (!this.manager.isLeader()) {
            throw new Error("فقط رهبر گروه می‌تواند منطقه را انتخاب کند.");
        }

        if (!getPartyRegion(regionId)) {
            throw new Error("منطقه معتبر نیست.");
        }

        return this.api.selectRegion(regionId);
    }

    async prepare() {
        const party = await this.manager.refresh();

        if (!party) throw new Error("گروهی وجود ندارد.");

        if (party.members.length < PARTY_CONFIG.MIN_MEMBERS_TO_START) {
            throw new Error("برای شروع حداقل دو بازیکن لازم است.");
        }

        if (!party.members.every(member => member.ready)) {
            throw new Error("تمام اعضا باید آماده باشند.");
        }

        return true;
    }

    async start() {
        if (!this.manager.isLeader()) {
            throw new Error("فقط رهبر می‌تواند گروه را شروع کند.");
        }

        await this.prepare();

        const result = await this.api.startSession();

        this.session = result;
        return result;
    }

    async finish(result) {
        if (!this.session) {
            throw new Error("نشست فعالی وجود ندارد.");
        }

        const response = await this.api.finishSession(
            this.session.id,
            result
        );

        this.session = null;
        return response;
    }

    async getSession() {
        this.session = await this.api.getSession();
        return this.session;
    }

}