// ETRANOM - Party Realtime Sync
// Branch: feature/party-draft
// Requires an initialized Supabase client.

export class PartySync {
    constructor(supabase, onUpdate = () => {}) {
        if (!supabase || typeof supabase.channel !== "function") {
            throw new Error(
                "PartySync requires a valid Supabase client."
            );
        }

        this.supabase = supabase;
        this.onUpdate =
            typeof onUpdate === "function" ? onUpdate : () => {};

        this.channel = null;
        this.partyId = null;
        this.subscriptionToken = 0;
    }

    emit(event) {
        try {
            this.onUpdate(event);
        } catch (error) {
            console.error(
                "[PartySync] onUpdate callback failed:",
                error
            );
        }
    }

    subscribe(partyId) {
        // Invalidate callbacks from previous subscriptions.
        const token = ++this.subscriptionToken;

        // Remove previous channel.
        if (this.channel) {
            const oldChannel = this.channel;
            this.channel = null;

            this.supabase.removeChannel(oldChannel).catch(error => {
                console.warn(
                    "[PartySync] Could not remove previous channel:",
                    error
                );
            });
        }

        this.partyId = partyId || null;

        if (!partyId) {
            this.emit({
                type: "connection",
                status: "CLOSED"
            });

            return null;
        }

        const channel = this.supabase.channel(
            `party:${partyId}`
        );

        // Listen for party member changes.
        channel.on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "party_members",
                filter: `party_id=eq.${partyId}`
            },
            payload => {
                if (token !== this.subscriptionToken) return;

                this.emit({
                    type: "member_change",
                    partyId,
                    payload
                });
            }
        );

        // Listen for party information changes.
        channel.on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "parties",
                filter: `id=eq.${partyId}`
            },
            payload => {
                if (token !== this.subscriptionToken) return;

                this.emit({
                    type: "party_change",
                    partyId,
                    payload
                });
            }
        );

        this.channel = channel;

        // Subscribe to Realtime.
        channel.subscribe(status => {
            if (token !== this.subscriptionToken) return;

            this.emit({
                type: "connection",
                partyId,
                status
            });
        });

        return channel;
    }

    unsubscribe() {
        // Invalidate pending callbacks.
        this.subscriptionToken += 1;

        const channel = this.channel;

        this.channel = null;
        this.partyId = null;

        if (!channel) {
            return Promise.resolve("CLOSED");
        }

        return this.supabase
            .removeChannel(channel)
            .then(status => {
                this.emit({
                    type: "connection",
                    status: "CLOSED"
                });

                return status;
            })
            .catch(error => {
                console.warn(
                    "[PartySync] Channel removal failed:",
                    error
                );

                this.emit({
                    type: "connection",
                    status: "CHANNEL_ERROR",
                    error
                });

                return "CHANNEL_ERROR";
            });
    }
}