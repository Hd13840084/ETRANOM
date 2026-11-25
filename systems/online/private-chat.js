import { getPlayerDisplayName } from './player-identity.js?build=2081';
// ETRANOM private friend chat. Access control is enforced by database RLS.
const esc = value => String(value !== null && value !== void 0 ? value : '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export class ETRANOMPrivateChat {
    constructor({ supabase, user, profile = null, container, friends = [], onStatus = () => { } }) {
        if (!supabase || !(user === null || user === void 0 ? void 0 : user.id) || !container)
            throw new Error('Supabase, authenticated user and container are required.');
        this.supabase = supabase;
        this.user = user;
        this.profile = profile;
        this.container = container;
        this.friends = Array.isArray(friends) ? friends : [];
        this.onStatus = onStatus;
        this.activeFriend = null;
        this.messages = [];
        this.channels = [];
        this.loading = false;
        this.destroyed = false;
    }
    async mount() {
        this.renderFriends();
        if (!this.friends.length)
            this.status('برای گفت‌وگوی خصوصی ابتدا باید دو بازیکن دوست یکدیگر باشند.');
        return this;
    }
    status(message) { this.onStatus(message); }
    renderFriends() {
        this.container.innerHTML = `<section class="etr-chat"><h3>گفت‌وگوی خصوصی</h3><p class="etr-chat-hint">پیام‌رسانی فقط بین دوستان تأییدشده فعال است.</p><div class="etr-chat-friends">${this.friends.length ? this.friends.map(f => `<button type="button" data-chat-friend="${esc(f.user_id)}">${esc(getPlayerDisplayName(f, 'بازیکن'))} <small>سطح ${Number(f.player_level) || 1}</small></button>`).join('') : '<p>هنوز دوستی نداری. ابتدا از بخش جست‌وجوی بازیکن درخواست دوستی بفرست.</p>'}</div><div class="etr-chat-thread" aria-live="polite"><p>برای شروع، یکی از دوستان را انتخاب کن.</p></div></section>`;
        this.container.querySelectorAll('[data-chat-friend]').forEach(button => button.addEventListener('click', () => {
            const friend = this.friends.find(item => item.user_id === button.dataset.chatFriend);
            if (friend)
                this.openConversation(friend);
        }));
    }
    async openConversation(friend) {
        if (this.destroyed)
            return;
        await this.clearChannels();
        this.activeFriend = friend;
        this.messages = [];
        const thread = this.container.querySelector('.etr-chat-thread');
        if (!thread)
            return;
        thread.innerHTML = `<header><b>${esc(getPlayerDisplayName(friend, 'بازیکن'))}</b><button type="button" data-chat-back>بازگشت</button></header><div class="etr-chat-messages"><p>در حال دریافت پیام‌ها...</p></div><form class="etr-chat-compose"><input name="message" maxlength="2000" autocomplete="off" placeholder="پیامت را بنویس..." required><button type="submit">ارسال</button></form>`;
        thread.querySelector('[data-chat-back]').addEventListener('click', async () => { await this.clearChannels(); this.activeFriend = null; this.renderFriends(); });
        thread.querySelector('form').addEventListener('submit', event => { event.preventDefault(); this.sendMessage(event.currentTarget); });
        await this.loadMessages();
        this.subscribeConversation();
    }
    async loadMessages() {
        var _a;
        const friendId = (_a = this.activeFriend) === null || _a === void 0 ? void 0 : _a.user_id;
        if (!friendId)
            return;
        const { data, error } = await this.supabase.from('private_messages').select('id,sender_id,receiver_id,body,created_at').or(`and(sender_id.eq.${this.user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${this.user.id})`).order('created_at', { ascending: true }).limit(100);
        if (error) {
            this.status(`دریافت پیام‌ها ناموفق بود: ${error.message}`);
            return;
        }
        this.messages = data || [];
        this.renderMessages();
    }
    subscribeConversation() {
        var _a;
        const friendId = (_a = this.activeFriend) === null || _a === void 0 ? void 0 : _a.user_id;
        if (!friendId)
            return;
        const add = payload => {
            if (this.destroyed || !this.activeFriend || this.activeFriend.user_id !== friendId)
                return;
            const row = payload.new;
            if (!row)
                return;
            const isThisPair = (row.sender_id === this.user.id && row.receiver_id === friendId) || (row.sender_id === friendId && row.receiver_id === this.user.id);
            if (!isThisPair || this.messages.some(message => message.id === row.id))
                return;
            this.messages.push(row);
            this.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            this.renderMessages();
        };
        const base = `etr-chat:${[this.user.id, friendId].sort().join(':')}`;
        const outgoing = this.supabase.channel(`${base}:out`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'private_messages', filter: `sender_id=eq.${this.user.id}` }, add).subscribe();
        const incoming = this.supabase.channel(`${base}:in`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'private_messages', filter: `sender_id=eq.${friendId}` }, add).subscribe();
        this.channels.push(outgoing, incoming);
    }
    renderMessages() {
        const box = this.container.querySelector('.etr-chat-messages');
        if (!box)
            return;
        box.innerHTML = this.messages.length ? this.messages.map(message => { const mine = message.sender_id === this.user.id; const senderName = mine ? getPlayerDisplayName(this.profile, 'تو') : getPlayerDisplayName(this.activeFriend, 'بازیکن'); return `<article class="etr-chat-message ${mine ? 'mine' : 'theirs'}"><b class="etr-chat-sender-name">${esc(senderName)}</b><p>${esc(message.body)}</p><time>${new Date(message.created_at).toLocaleString('fa-IR')}</time></article>`; }).join('') : '<p>هنوز پیامی ردوبدل نشده است. اولین پیام را بفرست.</p>';
        box.scrollTop = box.scrollHeight;
    }
    async sendMessage(form) {
        var _a;
        const input = form.elements.message;
        const body = String(input.value || '').trim();
        const friendId = (_a = this.activeFriend) === null || _a === void 0 ? void 0 : _a.user_id;
        if (!body || !friendId || body.length > 2000)
            return;
        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        try {
            const { error } = await this.supabase.from('private_messages').insert({ sender_id: this.user.id, receiver_id: friendId, body });
            if (error)
                throw error;
            input.value = '';
            // Realtime normally delivers the inserted row; refresh protects against missed events.
            await this.loadMessages();
        }
        catch (error) {
            this.status(`ارسال پیام ناموفق بود: ${error.message}`);
        }
        finally {
            button.disabled = false;
            input.focus();
        }
    }
    async clearChannels() {
        const channels = this.channels.splice(0);
        await Promise.all(channels.map(channel => this.supabase.removeChannel(channel).catch(() => null)));
    }
    async destroy() { this.destroyed = true; await this.clearChannels(); this.activeFriend = null; }
}
