import { dispatchRemoteCombatActionV1972 } from "../combat/central-combat-runtime-v1972.js?v=1972&build=2081";
import { PARTY_CONFIG, getPartyRegion } from "./party-config.js?build=2081";
export const PARTY_WARRIOR_RPC_CONTRACT_VERSION = "1907";
const createRequestId = () => { var _a, _b; return ((_b = (_a = globalThis.crypto) === null || _a === void 0 ? void 0 : _a.randomUUID) === null || _b === void 0 ? void 0 : _b.call(_a)) || "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 3 | 8)).toString(16); }); };
export class PartyCombat {
    constructor(api, manager) {
        this.api = api;
        this.manager = manager;
        this.session = null;
        this.pendingAction = null;
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
        if (!party)
            throw new Error("گروهی وجود ندارد.");
        if (party.members.length < PARTY_CONFIG.MIN_MEMBERS_TO_START) {
            throw new Error("برای شروع حداقل دو بازیکن لازم است.");
        }
        if (!party.members.every(member => { var _a; return Boolean((_a = member.ready) !== null && _a !== void 0 ? _a : member.is_ready); })) {
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
        this.session = (result === null || result === void 0 ? void 0 : result.session_id)
            ? { ...result, id: result.session_id }
            : result;
        return this.session;
    }
    async finish(result) {
        if (!this.session) {
            throw new Error("نشست فعالی وجود ندارد.");
        }
        const response = await this.api.finishSession(this.session.id, result);
        this.session = null;
        return response;
    }
    async getSession() {
        this.session = await this.api.getSession();
        return this.session;
    }
    async snapshot() {
        const session = this.session || await this.getSession();
        if (!(session === null || session === void 0 ? void 0 : session.id))
            return null;
        return this.api.getBattleSnapshot(session.id);
    }
    async actSkill(skillId, targetIndex = null, choice = null) {
        const id = String(skillId || '');
        if (!/^[a-z0-9_]{1,48}$/i.test(id))
            throw new Error('party_skill_invalid');
        // The existing authoritative RPC owns class/spec, level, mana, cooldown,
        // target and turn validation. Never calculate or submit client-side damage.
        const safeChoice = choice == null ? '' : String(choice);
        if (safeChoice && !/^[a-z_]{1,24}$/.test(safeChoice))
            throw new Error('party_skill_choice_invalid');
        return this.act(`skill:${id}${safeChoice ? `|${safeChoice}` : ''}`, targetIndex);
    }
    async act(action, targetIndex = null) {
        const session = this.session || await this.getSession();
        if (!(session === null || session === void 0 ? void 0 : session.id))
            throw new Error("نشست نبرد فعالی پیدا نشد.");
        const intentKey = JSON.stringify([session.id, action, targetIndex]);
        if (!this.pendingAction || this.pendingAction.intentKey !== intentKey) {
            this.pendingAction = { intentKey, requestId: createRequestId() };
        }
        const requestId = this.pendingAction.requestId;
        try {
            const result = await dispatchRemoteCombatActionV1972({
                mode: "party",
                intent: { action, targetId: targetIndex == null ? null : String(targetIndex) },
                requestId,
                context: { sessionId: session.id, targetIndex },
                execute: () => this.api.battleAction(session.id, action, targetIndex, requestId)
            });
            this.pendingAction = null;
            if (["victory", "defeat"].includes(result === null || result === void 0 ? void 0 : result.status))
                this.session = null;
            return result;
        }
        catch (error) {
            const code = String((error === null || error === void 0 ? void 0 : error.message) || "");
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
            if (messages[code])
                error.message = messages[code];
            // Keep the same request UUID after ambiguous transport failures so a retry
            // replays the committed result instead of spending another turn.
            if ((error === null || error === void 0 ? void 0 : error.code) || messages[code] || /already_acted|not_your_turn|battle_already_finished|player_defeated/.test(code))
                this.pendingAction = null;
            throw error;
        }
    }
    async rewards() { return this.api.getBattleRewards(); }
}
