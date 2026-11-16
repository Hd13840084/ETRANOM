export class PartyInvites {

    constructor(api) {
        this.api = api;
    }

    async send(friendId) {
        if (!friendId) throw new Error("دوست انتخاب نشده است.");

        return this.api.invite(friendId);
    }

    async accept(partyId) {
        if (!partyId) throw new Error("دعوت معتبر نیست.");

        return this.api.respondInvite(partyId, true);
    }

    async decline(partyId) {
        if (!partyId) throw new Error("دعوت معتبر نیست.");

        return this.api.respondInvite(partyId, false);
    }

    async cancel(inviteId) {
        if (!inviteId) throw new Error("دعوت مشخص نشده است.");

        return this.api.cancelInvite(inviteId);
    }

    async received() {
        return this.api.getReceivedInvites();
    }

    async sent() {
        return this.api.getSentInvites();
    }

}