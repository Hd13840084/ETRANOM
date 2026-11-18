import { PARTY_CONFIG } from './party-config.js';

export class PartyUI {
  constructor(container, partySystem) {
    this.container = container;
    this.partySystem = partySystem;
    this.view = 'party';
  }

  render() {
    this.view = 'party';
    const party = this.partySystem.manager.party;
    this.container.innerHTML = `<section class="etr-party">
      <header class="etr-party-header"><h2>گروه ماجراجویان</h2><span>حداکثر ${PARTY_CONFIG.MAX_MEMBERS} بازیکن</span></header>
      ${party ? this.renderParty(party) : this.renderEmpty()}
      <div class="etr-party-status" id="etr-party-status" role="status"></div>
    </section>`;
    this.bind();
  }

  renderEmpty() {
    return `<p>هنوز عضو گروهی نیستی.</p>
      <label for="etr-party-region">منطقه گروه</label>
      <select id="etr-party-region">${PARTY_CONFIG.REGIONS.map(r => `<option value="${this.escape(r.id)}">${this.escape(r.name)}</option>`).join('')}</select>
      <div class="etr-party-actions"><button data-action="create">ساخت گروه</button><button data-action="invites">دعوت‌نامه‌ها</button></div>`;
  }

  renderBattle(snapshot) {
    if (!snapshot || !this.container.querySelector('.etr-party')) return;
    const old = this.container.querySelector('.etr-party-battle');
    if (old) old.remove();
    const members = (snapshot.members || []).map(m => `<article class="etr-party-member"><strong>${this.escape(m.display_name)}</strong><span>Lv ${Number(m.level)||1} • HP ${Number(m.hp)||0}</span><span>${m.ready ? 'نوبت ثبت شد' : 'در انتظار اقدام'}</span></article>`).join('');
    const panel = document.createElement('section');
    panel.className = 'etr-party-battle';
    panel.innerHTML = `<h3>نبرد گروهی زنده</h3><p><b>${this.escape(snapshot.enemy_name)}</b> • ${this.escape(snapshot.region_id)}</p><div class="etr-party-battle-health"><span>سلامت دشمن: ${Number(snapshot.enemy_hp)||0} / ${Number(snapshot.enemy_max_hp)||0}</span><progress max="${Math.max(1,Number(snapshot.enemy_max_hp)||1)}" value="${Math.max(0,Number(snapshot.enemy_hp)||0)}"></progress></div><p>دور ${Number(snapshot.round)||1} • وضعیت: ${this.escape(snapshot.status)}</p><div class="etr-party-members">${members}</div>${snapshot.status === 'active' ? '<div class="etr-party-actions"><button data-battle-action="attack">⚔ حمله</button><button data-battle-action="guard">🛡 دفاع</button><button data-battle-action="heal">✚ درمان</button></div>' : `<p>${snapshot.status === 'victory' ? 'پیروزی! پاداش در دفتر پاداش ثبت شد.' : 'گروه شکست خورد؛ نبرد پایان یافت.'}</p>`}<div class="etr-party-status" data-battle-status role="status"></div>`;
    this.container.querySelector('.etr-party')?.appendChild(panel);
    panel.querySelectorAll('[data-battle-action]').forEach(button => button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        const next = await this.partySystem.combat.act(button.dataset.battleAction);
        this.renderBattle(next);
        if (next.status !== 'active') await this.partySystem.refresh();
      } catch (error) {
        const status = panel.querySelector('[data-battle-status]');
        if (status) status.textContent = error?.message || 'ثبت اقدام ناموفق بود.';
      } finally { if (button.isConnected) button.disabled = false; }
    }));
  }

  renderParty(party) {
    const members = Array.isArray(party.members) ? party.members : [];
    const leader = this.partySystem.manager.isLeader();
    const region = this.partySystem.api.getRegion(party.region_id);
    const memberCards = members.map(m => `<article class="etr-party-member">
      <strong>${this.escape(m.display_name || m.username || 'مسافر بی‌نام')}</strong>
      <span>سطح ${Number(m.player_level) || 1} • ${this.escape(m.player_class || 'نامشخص')}</span>
      <span>${m.is_leader ? 'رهبر گروه' : 'عضو گروه'} • ${m.ready ? 'آماده' : 'آماده نیست'}</span>
      ${leader && !m.is_leader ? `<div class="etr-party-actions"><button data-action="transfer" data-user-id="${this.escape(m.user_id)}">انتقال رهبری</button><button data-action="kick" data-user-id="${this.escape(m.user_id)}">اخراج</button></div>` : ''}
    </article>`).join('');
    return `<div class="etr-party-summary"><p>منطقه: <b>${this.escape(region?.name || 'انتخاب نشده')}</b></p><p>وضعیت: ${this.escape(party.status || 'نامشخص')} • ${members.length}/${PARTY_CONFIG.MAX_MEMBERS} عضو</p></div>
      <div class="etr-party-members">${memberCards}</div>
      ${leader && party.status !== 'active' ? `<label for="etr-party-region">تغییر منطقه</label><select id="etr-party-region">${PARTY_CONFIG.REGIONS.map(r => `<option value="${this.escape(r.id)}" ${r.id === party.region_id ? 'selected' : ''}>${this.escape(r.name)}</option>`).join('')}</select><button data-action="region">ثبت منطقه</button>` : ''}
      <div class="etr-party-actions"><button data-action="ready">${this.partySystem.currentUserReady() ? 'لغو آمادگی' : 'آماده‌ام'}</button><button data-action="invites">دعوت دوستان / دعوت‌نامه‌ها</button>${leader ? '<button data-action="start">شروع گروهی</button><button data-action="disband">منحل‌کردن گروه</button>' : ''}<button data-action="leave">ترک گروه</button></div>`;
  }

  async renderInvites(data) {
    this.view = 'invites';
    const received = Array.isArray(data?.received) ? data.received : [];
    const sent = Array.isArray(data?.sent) ? data.sent : [];
    const friendRows = await this.getFriends();
    this.container.innerHTML = `<section class="etr-party"><header class="etr-party-header"><h2>دعوت‌های گروه</h2></header>
      <h3>دعوت دوستان</h3><div class="etr-party-members">${friendRows.length ? friendRows.map(f => `<article class="etr-party-member"><strong>${this.escape(f.display_name || f.username || 'بازیکن')}</strong><span>سطح ${Number(f.player_level) || 1}</span><button data-invite-user="${this.escape(f.user_id)}">دعوت به گروه</button></article>`).join('') : '<p>دوست قابل‌دعوتی پیدا نشد. ابتدا بازیکن را به فهرست دوستان اضافه کن.</p>'}</div>
      <h3>دعوت‌های دریافتی</h3>${received.length ? received.map(i => `<article class="etr-party-member"><strong>${this.escape(i.sender_name || i.sender_username || 'بازیکن')}</strong><button data-invite-action="accept" data-invite-id="${this.escape(i.id)}">پذیرش</button><button data-invite-action="decline" data-invite-id="${this.escape(i.id)}">رد</button></article>`).join('') : '<p>دعوت دریافتی نداری.</p>'}
      <h3>دعوت‌های ارسالی</h3>${sent.length ? sent.map(i => `<article class="etr-party-member"><strong>${this.escape(i.receiver_name || 'بازیکن')}</strong><button data-invite-action="cancel" data-invite-id="${this.escape(i.id)}">لغو دعوت</button></article>`).join('') : '<p>دعوت ارسالی نداری.</p>'}
      <button data-action="back">بازگشت به گروه</button><div class="etr-party-status" id="etr-party-status" role="status"></div></section>`;
    this.bind();
    this.container.querySelectorAll('[data-invite-user]').forEach(b => b.addEventListener('click', async () => this.runButton(b, async () => { await this.partySystem.invite(b.dataset.inviteUser); this.status('دعوت ارسال شد.'); await this.partySystem.showInvites(); })));
    this.container.querySelectorAll('[data-invite-action]').forEach(b => b.addEventListener('click', async () => this.runButton(b, async () => {
      const id = b.dataset.inviteId, action = b.dataset.inviteAction;
      if (action === 'accept') {
        await this.partySystem.acceptInvite(id);
        this.status('دعوت با موفقیت پذیرفته شد و به گروه پیوستی.');
        return;
      }
      if (action === 'decline') await this.partySystem.declineInvite(id);
      else await this.partySystem.cancelInvite(id);
      await this.partySystem.showInvites();
    })));
  }

  async getFriends() {
    try {
      const overview = await window.lib?.getSocialOverview?.();
      return (overview?.friends || []).filter(f => f.user_id && f.user_id !== this.partySystem.currentUser?.id);
    } catch (e) { this.status(`دریافت دوستان ناموفق بود: ${e.message}`); return []; }
  }

  bind() {
    this.container.querySelectorAll('[data-action]').forEach(b => b.addEventListener('click', async () => this.runButton(b, () => this.handle(b.dataset.action, b.dataset.userId))));
  }

  async runButton(button, action) {
    button.disabled = true;
    try { await action(); } catch (e) { this.status(e?.message || 'عملیات ناموفق بود.'); }
    finally { if (button.isConnected) button.disabled = false; }
  }

  async handle(action, userId) {
    const s = this.partySystem;
    if (action === 'create') await s.manager.create(this.container.querySelector('#etr-party-region')?.value || PARTY_CONFIG.REGIONS[0].id);
    else if (action === 'ready') await s.manager.setReady(!s.currentUserReady());
    else if (action === 'leave') { if (confirm('از گروه خارج می‌شوی؟')) await s.manager.leave(); }
    else if (action === 'disband') { if (confirm('گروه برای همه اعضا منحل شود؟')) await s.manager.disband(); }
    else if (action === 'transfer') { if (confirm('رهبری گروه به این بازیکن منتقل شود؟')) await s.manager.transferLeadership(userId); }
    else if (action === 'kick') { if (confirm('این بازیکن از گروه اخراج شود؟')) await s.manager.kick(userId); }
    else if (action === 'region') await s.combat.selectRegion(this.container.querySelector('#etr-party-region').value);
    else if (action === 'invites') { await s.showInvites(); return; }
    else if (action === 'back') { await s.refresh(); return; }
    else if (action === 'start') { const session = await s.combat.start(); this.status(`گروه وارد نشست شد. شناسه نشست: ${session?.id || 'ثبت شد'}`); }
    await s.refresh();
  }

  status(message) { const el = this.container.querySelector('#etr-party-status'); if (el) el.textContent = message || ''; }
  escape(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
}
