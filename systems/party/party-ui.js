export class PartyUI {

    constructor(container, partySystem) {
        this.container = container;
        this.partySystem = partySystem;
    }

    render() {
        const party = this.partySystem.manager.party;

        this.container.innerHTML = `
            <section class="etr-party">

                <header class="etr-party-header">
                    <h2>گروه ماجراجویان</h2>
                    <span>حداکثر ۴ بازیکن</span>
                </header>

                ${
                    party
                    ? this.renderParty(party)
                    : this.renderEmpty()
                }

                <div class="etr-party-status"
                     id="etr-party-status"></div>

            </section>
        `;

        this.bind();
    }

    renderEmpty() {
        return `
            <p>هنوز عضو گروهی نیستی.</p>
            <button data-action="create">
                ساخت گروه
            </button>
            <button data-action="invites">
                دعوت‌نامه‌ها
            </button>
        `;
    }

    renderParty(party) {
        const members = party.members || [];

        return `
            <div class="etr-party-members">

                ${members.map(member => `
                    <article class="etr-party-member">

                        <strong>
                            ${this.escape(member.display_name)}
                        </strong>

                        <span>
                            سطح ${Number(member.player_level) || 1}
                        </span>

                        <span>
                            ${this.escape(member.player_class || "نامشخص")}
                        </span>

                        <span>
                            ${member.is_leader ? "رهبر" : "عضو"}
                        </span>

                        <span>
                            ${member.ready ? "آماده" : "آماده نیست"}
                        </span>

                    </article>
                `).join("")}

            </div>

            <div class="etr-party-actions">

                <button data-action="ready">
                    تغییر وضعیت آمادگی
                </button>

                <button data-action="invites">
                    دعوت دوستان
                </button>

                ${
                    party.is_leader
                    ? `<button data-action="start">شروع گروهی</button>`
                    : ""
                }

                <button data-action="leave">
                    ترک گروه
                </button>

            </div>
        `;
    }

    bind() {
        this.container
            .querySelectorAll("[data-action]")
            .forEach(button => {

                button.addEventListener("click", async () => {

                    const action = button.dataset.action;

                    try {
                        await this.handle(action);
                    } catch (error) {
                        this.status(error.message);
                    }

                });

            });
    }

    async handle(action) {

        const system = this.partySystem;

        switch (action) {

            case "create":
                await system.manager.create("burnt_forest");
                break;

            case "ready":
                await system.manager.setReady(
                    !system.currentUserReady()
                );
                break;

            case "leave":
                if (confirm("از گروه خارج می‌شوی؟")) {
                    await system.manager.leave();
                }
                break;

            case "invites":
                await system.showInvites();
                return;

            case "start":
                await system.combat.start();
                break;

        }

        this.render();
    }

    status(message) {
        const element = this.container.querySelector(
            "#etr-party-status"
        );

        if (element) element.textContent = message;
    }

    escape(value) {
        return String(value || "مسافر بی‌نام")
            .replace(/[&<>"']/g, char => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            })[char]);
    }

}