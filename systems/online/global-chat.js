import { getPlayerDisplayName } from './player-identity.js';
// ETRANOM global world chat. Database RLS and trigger enforce identity and basic anti-spam.
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export class ETRANOMGlobalChat {
  constructor({ supabase, user, container, onStatus = () => {} }) {
    if (!supabase || !user?.id || !container) throw new Error('Supabase, authenticated user and container are required.');
    this.supabase = supabase;
    this.user = user;
    this.container = container;
    this.onStatus = onStatus;
    this.messages = [];
    this.profileNames = new Map();
    this.channel = null;
    this.destroyed = false;
    this.sending = false;
  }

  async mount() {
    this.container.innerHTML = `<section class="etr-global-chat"><header><h3>چت جهانی ETRANOM</h3><p>گفت‌وگوی زنده تمام بازیکنان در یک کانال مشترک</p></header><div class="etr-global-chat-notice">قوانین: احترام به بازیکنان، ممنوعیت اسپم و انتشار اطلاعات شخصی. پیام‌ها برای همه بازیکنان واردشده قابل مشاهده‌اند.</div><div class="etr-global-chat-messages" aria-live="polite"><p>در حال دریافت گفت‌وگو...</p></div><form class="etr-global-chat-compose"><input name="message" maxlength="1000" autocomplete="off" placeholder="پیامت را برای همه بازیکنان بنویس..." required><button type="submit">ارسال</button></form></section>`;
    this.container.querySelector('form').addEventListener('submit', e => { e.preventDefault(); this.sendMessage(e.currentTarget); });
    await this.loadMessages();
    this.subscribe();
    return this;
  }

  async loadMessages() {
    const { data, error } = await this.supabase.from('global_messages').select('id,sender_id,display_name,body,created_at').order('created_at', { ascending: true }).limit(100);
    if (error) { this.onStatus(`دریافت چت جهانی ناموفق بود: ${error.message}`); return; }
    this.messages = data || [];
    await this.resolvePlayerNames(this.messages);
    this.render();
  }

  subscribe() {
    this.channel = this.supabase.channel('etranom:global-world-chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_messages' }, async payload => {
        const row = payload.new;
        if (this.destroyed || !row || this.messages.some(m => m.id === row.id)) return;
        await this.resolvePlayerNames([row]);
        if (this.destroyed) return;
        this.messages.push(row);
        this.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        this.messages = this.messages.slice(-100);
        this.render();
      }).subscribe(status => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') this.onStatus('اتصال زنده چت جهانی ناپایدار است؛ پیام‌ها را دوباره بارگذاری کن.');
      });
  }

  async resolvePlayerNames(rows) {
    const ids = [...new Set((rows || []).map(row => row.sender_id).filter(id => id && !this.profileNames.has(id)))];
    if (!ids.length) return;
    const { data, error } = await this.supabase.from('player_profiles').select('user_id,display_name,username').in('user_id', ids);
    if (error) return;
    for (const profile of data || []) {
      this.profileNames.set(profile.user_id, getPlayerDisplayName(profile, 'بازیکن'));
    }
    for (const id of ids) if (!this.profileNames.has(id)) this.profileNames.set(id, 'بازیکن');
  }

  displayName(message) {
    return getPlayerDisplayName({ display_name: this.profileNames.get(message.sender_id), username: message.display_name }, 'بازیکن');
  }

  render() {
    const box = this.container.querySelector('.etr-global-chat-messages');
    if (!box) return;
    box.innerHTML = this.messages.length ? this.messages.map(m => `<article class="etr-global-chat-message ${m.sender_id === this.user.id ? 'mine' : ''}"><header><b>${esc(this.displayName(m))}</b><time>${new Date(m.created_at).toLocaleString('fa-IR')}</time></header><p>${esc(m.body)}</p></article>`).join('') : '<p>هنوز پیامی در چت جهانی ثبت نشده است. اولین پیام را بفرست!</p>';
    box.scrollTop = box.scrollHeight;
  }

  async sendMessage(form) {
    if (this.sending || this.destroyed) return;
    const input = form.elements.message;
    const body = String(input.value || '').trim();
    if (!body || body.length > 1000) return;
    this.sending = true;
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      const { error } = await this.supabase.from('global_messages').insert({ sender_id: this.user.id, body });
      if (error) throw error;
      input.value = '';
    } catch (error) {
      this.onStatus(error.message?.includes('global_chat_rate_limit') ? 'برای جلوگیری از اسپم، بین پیام‌ها کمی فاصله بگذار.' : `ارسال پیام ناموفق بود: ${error.message}`);
    } finally {
      this.sending = false;
      button.disabled = false;
      input.focus();
    }
  }

  async destroy() {
    this.destroyed = true;
    if (this.channel) await this.supabase.removeChannel(this.channel).catch(() => null);
    this.channel = null;
  }
}
