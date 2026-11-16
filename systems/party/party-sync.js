export class PartySync {

    constructor(supabase, onUpdate = () => {}) {
        this.supabase = supabase;
        this.onUpdate = onUpdate;
        this.channel = null;
        this.partyId = null;
    }

    subscribe(partyId) {
        this.unsubscribe();

        if (!partyId) return;

        this.partyId = partyId;

        this.channel = this.supabase
            .channel(`party:${partyId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "party_members",
                    filter: `party_id=eq.${partyId}`
                },
                payload => this.onUpdate({
                    type: "member_change",
                    payload
                })
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "parties",
                    filter: `id=eq.${partyId}`
                },
                payload => this.onUpdate({
                    type: "party_change",
                    payload
                })
            )
            .subscribe(status => {
                this.onUpdate({
                    type: "connection",
                    status
                });
            });

        return this.channel;
    }

    unsubscribe() {
        if (this.channel) {
            this.supabase.removeChannel(this.channel);
            this.channel = null;
        }

        this.partyId = null;
    }

}