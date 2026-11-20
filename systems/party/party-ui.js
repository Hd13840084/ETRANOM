import { PARTY_CONFIG } from './party-config.js';

const PARTY_WIZARD_SKILLS = {
  'آرکین‌میج': [{id:'arcane_bolt',name:'گلوله آرکین',level:1,mana:3},{id:'arcane_shield',name:'سپر آرکین',level:2,mana:8}],
  'آرکین میج': [{id:'arcane_bolt',name:'گلوله آرکین',level:1,mana:3},{id:'arcane_shield',name:'سپر آرکین',level:2,mana:8}],
  'Arcane Mage': [{id:'arcane_bolt',name:'گلوله آرکین',level:1,mana:3},{id:'arcane_shield',name:'سپر آرکین',level:2,mana:8}],
  'المنتالیست': [{id:'ember_bolt',name:'گلوله اخگر',level:1,mana:4},{id:'frozen_armor',name:'زره یخی',level:2,mana:7},{id:'tidal_renewal',name:'موج احیاگر',level:6,mana:10},{id:'radiant_judgment',name:'داوری تابان',level:7,mana:10},{id:'darkness_chains',name:'زنجیرهای تاریکی',level:8,mana:11}],
  'Elementalist': [{id:'ember_bolt',name:'گلوله اخگر',level:1,mana:4},{id:'frozen_armor',name:'زره یخی',level:2,mana:7},{id:'tidal_renewal',name:'موج احیاگر',level:6,mana:10},{id:'radiant_judgment',name:'داوری تابان',level:7,mana:10},{id:'darkness_chains',name:'زنجیرهای تاریکی',level:8,mana:11}],
  'وارلاک': [{id:'forbidden_signature',name:'مُهر ممنوعه',level:1,mana:7}],
  'Warlock': [{id:'forbidden_signature',name:'مُهر ممنوعه',level:1,mana:7}],
  'نکرومنسر': [{id:'death_claw',name:'چنگال مرگ',level:1,mana:7}],
  'Necromancer': [{id:'death_claw',name:'چنگال مرگ',level:1,mana:7}]
};

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
      <select id="etr-party-region">${PARTY_CONFIG.REGIONS.map(r => `<option value="${this.escape(r.id)}" ${r.id === this.partySystem.preferredRegion ? 'selected' : ''}>${this.escape(r.name)}</option>`).join('')}</select>
      <div class="etr-party-actions"><button data-action="create">ساخت گروه</button><button data-action="invites">دعوت‌نامه‌ها</button></div>`;
  }

  renderBattle(snapshot) {
    if (!snapshot) return;
    this.view = 'battle';
    const members = (snapshot.members || []).map((m, i) => {
      const hp = Math.max(0, Number(m.hp) || 0);
      const maxHp = Math.max(1, Number(m.max_hp) || Number(m.maxHp) || hp || 1);
      const pct = Math.max(0, Math.min(100, hp / maxHp * 100));
      const acted = Boolean(m.ready);
      return `<article class="etr-battle-card player etr-party-player-card"><div class="battle-card-top"><span class="battle-role">${i === 0 ? 'رهبر گروه' : 'هم‌گروهی'} • ${m.connected ? '🟢 آنلاین' : '⚫ آفلاین'}</span><div class="battle-identity"><b>${this.escape(m.display_name || 'ماجراجو')}</b><small>سطح ${Number(m.level) || 1} • ${this.escape(m.player_class || 'ماجراجو')} • ${m.connected ? 'آنلاین' : 'قطع ارتباط'} • ${acted ? 'اقدام ثبت شد' : 'در انتظار نوبت'}</small></div><div class="battle-avatar">🛡️</div></div><div class="battle-stat-line"><b dir="ltr">${hp} / ${maxHp}</b><span>سلامتی</span></div><div class="battle-meter hp"><i style="width:${pct}%"></i></div><div class="battle-stat-line"><b dir="ltr">${Math.max(0, Number(m.mp) || 0)} / ${Math.max(1, Number(m.max_mp) || 1)}</b><span>مانا</span></div><div class="battle-meter mp"><i style="width:${Math.max(0, Math.min(100, (Number(m.mp) || 0) / Math.max(1, Number(m.max_mp) || 1) * 100))}%"></i></div><div class="battle-stat-line"><b>${Number(m.kills) || 0}</b><span>کشتار شخصی</span></div></article>`;
    }).join('');
    const aliveTarget = (snapshot.monsters || []).find(m => Number(m.hp) > 0);
    if (!aliveTarget || !(snapshot.monsters || []).some(m => Number(m.index ?? 0) === Number(this.selectedMonsterIndex) && Number(m.hp) > 0)) this.selectedMonsterIndex = Number(aliveTarget?.index || 1);
    const monsters = (snapshot.monsters || []).map((m, i) => {
      const hp = Math.max(0, Number(m.hp) || 0), maxHp = Math.max(1, Number(m.max_hp) || hp || 1);
      const pct = Math.max(0, Math.min(100, hp / maxHp * 100));
      const alive = hp > 0;
      const selected = Number(this.selectedMonsterIndex) === Number(m.index ?? (i + 1));
      return `<button type="button" data-party-target="${Number(m.index ?? (i + 1))}" class="etr-battle-card enemy ${alive ? '' : 'defeated'} ${selected ? 'selected' : ''} etr-party-monster-card" ${alive ? '' : 'disabled'}><div class="enemy-art"><span class="enemy-level-chip">سطح ${Number(m.level) || 1}</span><div class="enemy-resource-bar hp"><i style="width:${pct}%"></i><b dir="ltr">${hp} / ${maxHp}</b></div><b class="enemy-card-name">${this.escape(m.name || m.id || `هیولا ${i + 1}`)}</b><span class="enemy-art-icon">${alive ? '👹' : '☠️'}</span><small class="enemy-target-hint">${alive ? `هیولای ${i + 1}` : 'شکست خورده'}</small></div></button>`;
    }).join('');
    const modeName = snapshot.encounter_type === 'mini_boss' ? 'مینی‌باس' : snapshot.encounter_type === 'area_boss' ? 'باس منطقه' : 'شکار گروهی';
    const aliveMonsters = (snapshot.monsters || []).filter(m => Number(m.hp) > 0).length;
    const panel = document.createElement('section');
    panel.className = 'etr-party-battle etr-battle-screen';
    panel.innerHTML = `<div class="active-danger-zone-name combat-zone-name">⚔ ${this.escape(snapshot.region_name || snapshot.region_id || 'محدوده خطر')} • نبرد گروهی</div><div class="battle-heading"><div class="battle-heading-kicker">ETRANOM • PARTY ENCOUNTER</div><h2>${modeName}</h2><div class="battle-round">دور <span>${Number(snapshot.round) || 1}</span> • ${Number(snapshot.group_size) || (snapshot.members || []).length} بازیکن</div></div><div class="battle-section-title"><b>🛡️ اعضای گروه</b><small>${(snapshot.members || []).filter(m => Number(m.hp) > 0).length} عضو زنده</small></div><div class="battle-side player-side etr-party-members">${members}</div><div class="battle-vs"><i></i><b>⚔ VS ⚔</b><i></i></div><div class="battle-section-title"><b>☠ دشمنان</b><small>${aliveMonsters} دشمن باقی‌مانده از ${(snapshot.monsters || []).length}</small></div><div class="battle-side enemy-side etr-party-monsters">${monsters}</div><div class="combat-target-label">🎯 هر عضو گروه یک اقدام در هر دور ثبت می‌کند.</div><div class="battle-instruction">پاداش هر هیولا فقط به بازیکنی می‌رسد که ضربه نهایی را وارد کند.</div><div class="battle-actions">${snapshot.status === 'active' ? '<button type="button" data-battle-action="attack" class="attack"><span>⚔️</span><b>حمله عادی</b></button><button type="button" data-battle-action="guard" class="defend"><span>🛡️</span><b>دفاع</b></button><button type="button" data-battle-action="heal" class="items"><span>✚</span><b>درمان</b></button><button type="button" data-battle-action="potion" class="items"><span>🧪</span><b>معجون</b></button>' : ''}</div>${snapshot.status === 'active' ? '' : `<div class="battle-finish">${snapshot.status === 'victory' ? '✓ پیروزی گروهی' : 'شکست گروهی'} • نبرد پایان یافت</div>`}${snapshot.status === 'active' ? this.renderSkillPicker(snapshot) : ''}<div class="etr-party-status" data-battle-status role="status"></div>`;
    const shell = document.createElement('section');
    shell.className = 'etr-party';
    shell.appendChild(panel);
    this.container.replaceChildren(shell);
    panel.querySelectorAll('[data-party-target]').forEach(button => button.addEventListener('click', () => { this.selectedMonsterIndex = Number(button.dataset.partyTarget); this.renderBattle(snapshot); }));
    panel.querySelector('[data-party-cast-skill]')?.addEventListener('click', async buttonEvent => {
      const button = buttonEvent.currentTarget, select = panel.querySelector('#party-skill-choice');
      if (!select?.value) return;
      button.disabled = true;
      try { const next = await this.partySystem.combat.act(`skill:${select.value}`, this.selectedMonsterIndex); if (next.status !== 'active') { await this.partySystem.refresh(); this.renderBattle(next); await this.showBattleRewards(next); } else this.renderBattle(next); }
      catch (error) { const status = panel.querySelector('[data-battle-status]'); if (status) status.textContent = this.skillError(error?.message || 'اجرای مهارت ناموفق بود.'); }
      finally { if (button.isConnected) button.disabled = false; }
    });
    panel.querySelectorAll('[data-battle-action]').forEach(button => button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        const next = await this.partySystem.combat.act(button.dataset.battleAction, this.selectedMonsterIndex);
        if (next.status !== 'active') { await this.partySystem.refresh(); this.renderBattle(next); await this.showBattleRewards(next); } else this.renderBattle(next);
      } catch (error) {
        const status = panel.querySelector('[data-battle-status]');
        if (status) status.textContent = error?.message || 'ثبت اقدام ناموفق بود.';
      } finally { if (button.isConnected) button.disabled = false; }
    }));
  }

  async showBattleRewards(snapshot) {
    try {
      const rows = await this.partySystem.combat.rewards();
      const reward = (Array.isArray(rows) ? rows : []).find(row => String(row.session_id) === String(snapshot?.session_id));
      const panel = this.container.querySelector('.etr-party-battle');
      if (!panel || !reward) return;
      const materials = Array.isArray(reward.materials) ? reward.materials : [];
      const recipes = Array.isArray(reward.recipes) ? reward.recipes : [];
      const materialText = materials.length ? materials.map(item => `${this.escape(item.name || item.id || 'ماده')} ×${Number(item.qty) || 1}`).join('، ') : 'ماده‌ای دریافت نشد';
      const recipeText = recipes.length ? recipes.map(id => this.escape(id)).join('، ') : 'دستور ساختی دریافت نشد';
      const box = document.createElement('div');
      box.className = 'etr-party-reward-summary';
      box.innerHTML = `<b>گزارش پاداش شخصی تو</b><div>تجربه: ${Number(reward.xp) || 0} XP</div><div>سکه: ${Number(reward.coins) || 0}</div><div>مواد: ${materialText}</div><div>دستورهای ساخت: ${recipeText}</div><small>پاداش هر هیولا فقط برای بازیکنی ثبت می‌شود که ضربه نهایی را زده است؛ موارد بالا در ذخیره حساب ثبت شده‌اند.</small>`;
      panel.appendChild(box);
    } catch (error) {
      const panel = this.container.querySelector('.etr-party-battle');
      if (panel) { const box = document.createElement('p'); box.className = 'etr-party-reward-summary'; box.textContent = `دریافت گزارش پاداش ناموفق بود: ${error?.message || 'خطای ارتباط'}`; panel.appendChild(box); }
    }
  }

  renderSkillPicker(snapshot) {
    const self = (snapshot.members || []).find(m => String(m.user_id) === String(this.partySystem.currentUser?.id));
    const skills = PARTY_WIZARD_SKILLS[String(self?.specialization || '').trim()] || [];
    if (!skills.length) return '<div class="party-skill-note">مهارت آنلاین این تخصص هنوز به موتور گروهی متصل نشده است؛ حمله، دفاع، درمان و معجون فعال‌اند.</div>';
    const level = Number(self?.level) || 1;
    const options = skills.map(sk => `<option value="${sk.id}" ${level < sk.level ? 'disabled' : ''}>${this.escape(sk.name)} • ${sk.mana}٪ مانا${level < sk.level ? ` • سطح ${sk.level}` : ''}</option>`).join('');
    return `<div class="party-skill-picker"><label for="party-skill-choice">مهارت تخصصی ${this.escape(self?.specialization || '')}</label><div><select id="party-skill-choice">${options}</select><button type="button" data-party-cast-skill>اجرای مهارت ✦</button></div><small>مهارت بر اساس تخصص و سطح شخصیت در سرور بررسی می‌شود؛ هزینه مانا و خنک‌شدن نیز سمت سرور اعمال می‌شود.</small></div>`;
  }

  skillError(code) {
    const messages = { party_skill_specialization_unsupported:'این تخصص هنوز مهارت گروهی متصل‌شده ندارد.', party_skill_not_available:'این مهارت در فهرست مجاز این تخصص نیست.', party_skill_locked:'سطح شخصیت برای این مهارت کافی نیست.', party_skill_cooldown:'این مهارت هنوز در خنک‌شدن است.', party_skill_effect_not_supported_yet:'اثر پیشرفته این مهارت در مرحله بعد به موتور گروهی اضافه می‌شود.', insufficient_mana:'مانای کافی برای این مهارت نداری.' };
    return messages[code] || code;
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
      <div class="etr-party-actions"><button data-action="ready">${this.partySystem.currentUserReady() ? 'لغو آمادگی' : 'آماده‌ام'}</button><button data-action="invites">دعوت دوستان / دعوت‌نامه‌ها</button>${leader ? '<label for="etr-party-encounter">نوع نبرد</label><select id="etr-party-encounter"><option value="normal">شکار گروهی • تعداد دشمنان متناسب با اعضا</option><option value="mini_boss">مینی‌باس • یک دشمن با قدرت مقیاس‌شده</option><option value="area_boss">باس منطقه • یک دشمن با قدرت مقیاس‌شده</option></select><button data-action="start">شروع گروهی</button><button data-action="disband">منحل‌کردن گروه</button>' : ''}<button data-action="leave">ترک گروه</button></div>`;
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
    else if (action === 'start') { const encounterType = this.container.querySelector('#etr-party-encounter')?.value || 'normal'; const session = await s.combat.start(encounterType); this.status(`گروه وارد نشست شد. شناسه نشست: ${session?.id || 'ثبت شد'}`); }
    await s.refresh();
  }

  status(message) { const el = this.container.querySelector('#etr-party-status'); if (el) el.textContent = message || ''; }
  escape(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
}
