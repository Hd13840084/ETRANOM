import { PARTY_CONFIG, getPartyRegion } from "./party-config.js";

import { PartyManager } from "./party-manager.js";
import { PartyInvites } from "./party-invites.js";
import { PartySync } from "./party-sync.js";
import { PartyCombat } from "./party-combat.js";
import { PartyUI } from "./party-ui.js";

export class ETRANOMParty {

    constructor({
        supabase,
        container = null,
        onUpdate = () => {}
    }) {

        if (!supabase) {
            throw new Error("Supabase client is required.");
        }

        this.supabase = supabase;

        this.api = this.createAPI();

        this.manager = new PartyManager(this.api);

        this.invites = new PartyInvites(this.api);

        this.sync = new PartySync(
            supabase,
            async event => {
                await this.manager.refresh();
                onUpdate(event);

                if (this.ui) this.ui.render();
            }
        );

        this.combat = new PartyCombat(
            this.api,
            this.manager
        );

        this.ui = container
            ? new PartyUI(container, this)
            : null;

        this.currentUser = null;

    }

    createAPI() {

        const call = async (name, args = {}) => {

            const { data, error } =
                await this.supabase.rpc(name, args);

            if (error) throw error;

            return data;

        };

        return {

            getParty: () => call("get_my_party"),

            createParty: region =>
                call("create_party", {
                    p_region_key: region
                }),

            leaveParty: () =>
                call("leave_party"),

            disbandParty: () =>
                call("disband_party"),

            transferLeadership: userId =>
                call("transfer_party_leadership", {
                    p_target_user_id: userId
                }),

            kickMember: userId =>
                call("kick_party_member", {
                    p_target_user_id: userId
                }),

            setReady: ready =>
                call("set_party_ready", {
                    p_ready: ready
                }),

            invite: userId =>
                call("invite_party_member", {
                    p_target_user_id: userId
                }),

            respondInvite: (partyId, accept) =>
                call("respond_party_invite", {
                    p_party_id: partyId,
                    p_accept: accept
                }),

            cancelInvite: inviteId =>
                call("cancel_party_invite", {
                    p_invite_id: inviteId
                }),

            getReceivedInvites: () =>
                call("get_party_invites"),

            getSentInvites: () =>
                call("get_sent_party_invites"),

            selectRegion: region =>
                call("select_party_region", {
                    p_region_key: region
                }),

            startSession: () =>
                call("start_party_session"),

            finishSession: (sessionId, result) =>
                call("finish_party_session", {
                    p_session_id: sessionId,
                    p_result: result
                }),

            getSession: () =>
                call("get_my_party_session"),

            getRegion: getPartyRegion

        };

    }

    async initialize() {

        const { data, error } =
            await this.supabase.auth.getUser();

        if (error) throw error;

        if (!data.user) {
            throw new Error("ابتدا وارد حساب کاربری شو.");
        }

        this.currentUser = data.user;

        await this.manager.refresh();

        if (this.manager.party) {
            this.sync.subscribe(this.manager.party.id);
        }

        if (this.ui) this.ui.render();

        return this;

    }

    async refresh() {

        await this.manager.refresh();

        if (this.manager.party) {
            this.sync.subscribe(this.manager.party.id);
        } else {
            this.sync.unsubscribe();
        }

        if (this.ui) this.ui.render();

        return this.manager.party;

    }

    currentUserReady() {

        const member = this.manager
            .getMembers()
            .find(item => item.user_id === this.currentUser?.id);

        return !!member?.ready;

    }

    async showInvites() {

        const invites = await this.invites.received();

        if (this.ui) {
            this.ui.status(
                `${invites.length} دعوت‌نامه دریافت شده است.`
            );
        }

        return invites;

    }

    destroy() {

        this.sync.unsubscribe();

        this.manager.party = null;

    }

}