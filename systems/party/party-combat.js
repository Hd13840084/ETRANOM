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
        await this.manager.refresh();
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

        if (!party.members.every(member => Boolean(member.ready ?? member.is_ready))) {
            throw new Error("تمام اعضا باید آماده باشند.");
        }

        return true;
    }

    async start(encounterType = "normal") {
        if (!this.manager.isLeader()) {
            throw new Error("فقط رهبر می‌تواند گروه را شروع کند.");
        }

        await this.prepare();

        const result = await this.api.startSession(encounterType);

        this.session = result?.session_id
            ? { ...result, id: result.session_id }
            : result;
        return this.session;
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

    async snapshot() {
        const session = this.session || await this.getSession();
        if (!session?.id) return null;
        return this.api.getBattleSnapshot(session.id);
    }

    async act(action, targetIndex = null) {
        const session = this.session || await this.getSession();
        if (!session?.id) throw new Error("نشست نبرد فعالی پیدا نشد.");
        try {
            const result = await this.api.battleAction(session.id, action, targetIndex);
            if (["victory", "defeat"].includes(result?.status)) this.session = null;
            return result;
        } catch (error) {
            const code = String(error?.message || "");
            const messages = {
                insufficient_mana: "مانای کافی برای اجرای مهارت نداری.",
                party_potion_unavailable: "معجون سلامتی یا مانا در کیف تو وجود ندارد.",
                party_resource_already_full: "منبع مربوطه کامل است؛ معجون مصرف نشد.",
                already_acted_this_round: "اقدام این دور را قبلاً ثبت کرده‌ای؛ منتظر دور بعد بمان.",
                player_defeated: "شخصیت تو در این نبرد از پا افتاده است.",
                party_target_invalid_or_defeated: "این هدف دیگر در نبرد فعال نیست.",
                party_player_already_retreated: "قبلاً از این نبرد عقب‌نشینی کرده‌ای و امکان بازگشت به همین نبرد وجود ندارد."
            };
            if (messages[code]) error.message = messages[code];
            throw error;
        }
    }

    async rewards() { return this.api.getBattleRewards(); }

}