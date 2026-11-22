import {
    PARTY_CONFIG,
    getPartyRegion
} from "./party-config.js";

export const PARTY_WARRIOR_RPC_CONTRACT_VERSION = "1907";

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

    async actSkill(skillId, targetIndex = null, choice = null) {
        const id = String(skillId || '');
        if (!/^[a-z0-9_]{1,48}$/i.test(id)) throw new Error('party_skill_invalid');
        // The existing authoritative RPC owns class/spec, level, mana, cooldown,
        // target and turn validation. Never calculate or submit client-side damage.
        const safeChoice = choice == null ? '' : String(choice);
        if (safeChoice && !/^[a-z_]{1,24}$/.test(safeChoice)) throw new Error('party_skill_choice_invalid');
        return this.act(`skill:${id}${safeChoice ? `|${safeChoice}` : ''}`, targetIndex);
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
                insufficient_stamina: "استقامت کافی برای اجرای این مهارت نداری.",
                party_potion_unavailable: "معجون سلامتی یا مانا در کیف تو وجود ندارد.",
                party_resource_already_full: "منبع مربوطه کامل است؛ معجون مصرف نشد.",
                already_acted_this_round: "اقدام این دور را قبلاً ثبت کرده‌ای؛ منتظر دور بعد بمان.",
                player_defeated: "شخصیت تو در این نبرد از پا افتاده است.",
                party_target_invalid_or_defeated: "این هدف دیگر در نبرد فعال نیست.",
                party_skill_choice_invalid: "گزینه انتخاب‌شده برای این مهارت معتبر نیست.",
                necromancer_no_souls: "برای اجرای این فرمان روح ذخیره‌شده کافی نداری.",
                necromancer_not_enough_souls_for_revive: "برای بازگشت از آستانه مرگ حداقل ۳ روح لازم است.",
                party_player_already_retreated: "قبلاً از این نبرد عقب‌نشینی کرده‌ای و امکان بازگشت به همین نبرد وجود ندارد."
            };
            if (messages[code]) error.message = messages[code];
            throw error;
        }
    }

    async rewards() { return this.api.getBattleRewards(); }

}