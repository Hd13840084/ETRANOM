import { renderCombatPlayerCard, renderCombatActionBar } from '../combat/shared-combat-ui.js';
import { isCombatActionSupported } from '../combat/combat-contract.js';
// Shared renderer emits battle-meter hp and battle-meter mp bars (plus stamina) used by solo combat as well.
import { getPlayerDisplayName } from '../online/player-identity.js';
import { PARTY_CONFIG } from './party-config.js';

import { ARCANE_MAGE } from '../classes/arcane-mage.js';
import { ELEMENTALIST } from '../classes/elementalist.js';
import { WARLOCK } from '../classes/warlock.js';
import { NECROMANCER } from '../classes/necromancer.js';

const PARTY_WIZARD_SKILLS = Object.freeze({
  'آرکین‌میج': ARCANE_MAGE.skills, 'آرکین میج': ARCANE_MAGE.skills, 'Arcane Mage': ARCANE_MAGE.skills,
  'المنتالیست': ELEMENTALIST.skills, 'Elementalist': ELEMENTALIST.skills,
  'وارلاک': WARLOCK.skills, 'Warlock': WARLOCK.skills,
  'نکرومنسر': NECROMANCER.skills, 'Necromancer': NECROMANCER.skills
});
const PARTY_WIZARD_CORE_SKILLS = Object.freeze([
  {id:'wizard_basic_strike',name:'ضربه پایه جادوگر',unlockLevel:1,manaPct:0,type:'single_damage'},
  {id:'wizard_class_guard',name:'دفاع پایه جادوگر',unlockLevel:5,manaCost:5,type:'shield'},
  {id:'wizard_class_finisher',name:'فن نهایی جادوگر',unlockLevel:15,manaCost:12,type:'single_damage'}
]);

export class PartyUI {
  constructor(container, partySystem) {
    this.container = container;
    this.partySystem = partySystem;
    this.view = 'party';
    this._actionPending = false;
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
    const allMembers = Array.isArray(snapshot.members) ? snapshot.members : [];
    const selfId = String(this.partySystem.currentUser?.id || '');
    const self = allMembers.find(m => String(m.user_id) === selfId) || allMembers[0] || {};
    const allies = allMembers.filter(m => String(m.user_id) !== String(self.user_id));
    const hpOf = m => Math.max(0, Number(m.hp) || 0);
    const maxHpOf = m => Math.max(1, Number(m.max_hp) || 1);
    const mpOf = m => Math.max(0, Number(m.mp) || 0);
    const maxMpOf = m => Math.max(1, Number(m.max_mp) || 1);
    const pct = (v, max) => Math.max(0, Math.min(100, v / Math.max(1, max) * 100));
    const selfHp = hpOf(self), selfMaxHp = maxHpOf(self), selfMp = mpOf(self), selfMaxMp = maxMpOf(self);
    const selfReady = Boolean(self.ready);
    const selfAlive = selfHp > 0;
    const selfRetreated = Boolean(self.retreated);
    const selfStamina = Math.max(0, Number(self.stamina) || 0), selfMaxStamina = Math.max(1, Number(self.max_stamina) || 100);
    const portraitBySpec = {'آرکین‌میج':'assets/classes/arcane_mage_portrait.webp','آرکین میج':'assets/classes/arcane_mage_portrait.webp','المنتالیست':'assets/classes/elementalist_portrait.webp','وارلاک':'assets/classes/warlock_portrait.webp','نکرومنسر':'assets/classes/necromancer_portrait.webp','زاهد شمشیر':'assets/classes/sword_ascetic_portrait.webp','دژ پولادین':'assets/classes/iron_bastion_portrait.webp','جنگجوی آشوب':'assets/classes/chaos_warrior_portrait.webp','Chaos Warrior':'assets/classes/chaos_warrior_portrait.webp','آورنده آخرالزمان':'assets/classes/apocalypse_harbinger_portrait.webp','Harbinger of the Apocalypse':'assets/classes/apocalypse_harbinger_portrait.webp'};
    const selfPortrait = self.portrait || portraitBySpec[self.specialization] || '';
    const playerCard = renderCombatPlayerCard(self, {
      role: self.user_id === allMembers[0]?.user_id ? 'رهبر گروه' : 'قهرمان تو',
      className: 'etr-battle-card player etr-party-self-card',
      portrait: selfPortrait,
      stateLabel: selfRetreated ? '↩ عقب‌نشینی تاکتیکی کرده' : !selfAlive ? 'از پا افتاده' : selfReady ? '✓ اقدام این دور ثبت شده' : 'آماده اقدام'
    });
    const allyCards = allies.map((m, i) => {
      const hp = hpOf(m), maxHp = maxHpOf(m), mp = mpOf(m), maxMp = maxMpOf(m);
      return `<article class="etr-party-ally-card ${hp <= 0 ? 'is-fallen' : m.retreated ? 'is-retreated' : ''}">
        <div class="etr-party-ally-head"><b>${this.escape(getPlayerDisplayName(m, `هم‌گروهی ${i + 1}`))}</b><small>${m.retreated ? '↩ عقب‌نشینی کرده' : m.connected ? '🟢 آنلاین' : '⚫ آفلاین'} • ${m.retreated ? 'خارج از نبرد' : m.ready ? 'اقدام ثبت شد' : 'در انتظار نوبت'}</small></div>
        <small>سطح ${Number(m.level) || 1} • ${this.escape(m.player_class || 'ماجراجو')}</small>
        <div class="etr-party-ally-meter hp"><i style="width:${pct(hp,maxHp)}%"></i></div><div class="etr-party-ally-numbers">سلامتی <b dir="ltr">${hp}/${maxHp}</b></div>
        <div class="etr-party-ally-meter mp"><i style="width:${pct(mp,maxMp)}%"></i></div><div class="etr-party-ally-numbers">مانا <b dir="ltr">${mp}/${maxMp}</b></div>
      </article>`;
    }).join('');

    const monstersList = Array.isArray(snapshot.monsters) ? snapshot.monsters : [];
    const aliveTarget = monstersList.find(m => Number(m.hp) > 0);
    if (!aliveTarget || !monstersList.some((m, i) => Number(m.index ?? (i + 1)) === Number(this.selectedMonsterIndex) && Number(m.hp) > 0)) {
      this.selectedMonsterIndex = Number(aliveTarget?.index || 1);
    }
    const runtimePortraits = window.ETRANOM_RUNTIME_CONTENT?.monsterPortraits || {};
    const monsters = monstersList.map((m, i) => {
      const hp = Math.max(0, Number(m.hp) || 0), maxHp = Math.max(1, Number(m.max_hp) || hp || 1);
      const alive = hp > 0, index = Number(m.index ?? (i + 1));
      const selected = Number(this.selectedMonsterIndex) === index;
      const id = String(m.id || '');
      const portrait = runtimePortraits[id] || `assets/monsters/${id}.webp`;
      const safePortrait = portrait && !/^(?:javascript:|data:)/i.test(String(portrait)) ? String(portrait) : '';
      return `<button type="button" data-party-target="${index}" class="etr-battle-card enemy ${alive ? '' : 'defeated'} ${selected ? 'selected' : ''}" ${alive ? '' : 'disabled'} aria-pressed="${selected ? 'true' : 'false'}">
        <div class="enemy-art" ${safePortrait ? `style="background-image:linear-gradient(180deg,#09071108,#09071166),url('${this.escape(safePortrait)}')"` : ''}>
          <span class="enemy-level-chip">سطح ${Number(m.level) || 1}</span>
          <div class="enemy-overlay-stats"><div class="enemy-resource-bar hp"><i style="width:${pct(hp,maxHp)}%"></i><b dir="ltr">${hp} / ${maxHp}</b></div></div>
          <b class="enemy-card-name">${this.escape(m.name || id || `هیولا ${i + 1}`)}</b>
          ${!safePortrait ? `<span class="enemy-art-icon">${alive ? '👹' : '☠️'}</span>` : ''}
          <small class="enemy-target-hint">${alive ? (selected ? '✓ هدف انتخاب‌شده' : 'برای انتخاب هدف لمس کن') : 'شکست خورده'}</small>
        </div></button>`;
    }).join('');
    const modeName = snapshot.encounter_type === 'mini_boss' ? 'مینی‌باس گروهی' : snapshot.encounter_type === 'area_boss' ? 'باس منطقه گروهی' : 'شکار گروهی';
    const aliveMonsters = monstersList.filter(m => Number(m.hp) > 0).length;
    const selectedMonster = monstersList.find((m, i) => Number(m.index ?? (i + 1)) === Number(this.selectedMonsterIndex));
    const canAct = snapshot.status === 'active' && selfAlive && !selfRetreated && !selfReady && !this._actionPending;
    const canRetreat = snapshot.status === 'active' && selfAlive && !selfRetreated && !this._actionPending;
    const itemsOpen = Boolean(this.itemsPanelOpen);
    const skillsOpen = Boolean(this.skillPanelOpen);
    const panel = document.createElement('section');
    panel.className = 'etr-party-battle etr-battle-screen';
    panel.innerHTML = `<div class="active-danger-zone-name combat-zone-name">⚔ ${this.escape(snapshot.region_name || snapshot.region_id || 'محدوده خطر')} • نبرد گروهی</div>
      <div class="battle-player-wrap">${playerCard}</div>
      <div class="battle-vs"><i></i><b>⚔ VS ⚔</b><i></i></div>
      <div class="battle-section-title"><b>☠ دشمنان</b><small>${aliveMonsters} دشمن باقی‌مانده از ${monstersList.length}</small></div>
      <div class="battle-side enemy-side">${monsters}</div>
      <div class="combat-target-label">🎯 هدف انتخاب‌شده: ${this.escape(selectedMonster?.name || 'انتخاب نشده')} • دور ${Number(snapshot.round) || 1}</div>
      <div class="battle-instruction">هر عضو گروه یک اقدام در هر دور دارد؛ پاداش هر هیولا به بازیکنی می‌رسد که ضربه نهایی را وارد کند.</div>
      ${renderCombatActionBar({ attribute: 'data-battle-action', disabled: { attack: !(canAct && isCombatActionSupported('party','attack')), skill: !(canAct && isCombatActionSupported('party','skill')), items: !(canAct && isCombatActionSupported('party','item')), guard: !(canAct && isCombatActionSupported('party','guard')) } })}
      ${canRetreat ? `<div class="etr-party-retreat-actions"><button type="button" data-party-retreat>↩ عقب‌نشینی تاکتیکی</button><small>فقط شخصیت تو از نبرد خارج می‌شود؛ اعضای دیگر می‌توانند ادامه دهند. پاداش‌هایی که قبلاً گرفته‌ای حفظ می‌شوند.</small></div>` : ''}
      ${skillsOpen && canAct ? this.renderSkillPicker(snapshot) : ''}
      ${itemsOpen && canAct ? `<div class="etr-party-item-panel"><b>آیتم‌ها و بازیابی</b><div><button type="button" data-battle-action="heal">✚ درمان گروهی</button><button type="button" data-battle-action="potion">🧪 مصرف معجون</button></div></div>` : ''}
      ${allies.length ? `<div class="etr-party-allies-strip"><div class="battle-section-title"><b>🤝 وضعیت هم‌گروهی‌ها</b><small>${allMembers.filter(m => hpOf(m) > 0).length} عضو زنده از ${allMembers.length}</small></div><div class="etr-party-allies-grid">${allyCards}</div></div>` : ''}
      ${snapshot.status === 'active' ? `<div class="etr-party-round-status">${selfRetreated ? '↩ عقب‌نشینی تاکتیکی انجام شد؛ دیگر در این نبرد هدف حمله قرار نمی‌گیری و اعضای گروه می‌توانند ادامه دهند.' : this._actionPending ? '⏳ اقدام در حال ثبت و پردازش است؛ تا پایان مکث کوتاه دکمه‌ای نزن.' : selfReady ? '✓ اقدام تو برای این دور ثبت شده؛ منتظر اقدام هم‌گروهی‌ها هستیم.' : !selfAlive ? 'شخصیت تو از پا افتاده است؛ اعضای باقی‌مانده می‌توانند نبرد را ادامه دهند.' : 'نوبت اقدام توست؛ یک گزینه از چهار دکمه نبرد انتخاب کن.'}</div>` : `<div class="battle-finish">${selfRetreated ? '↩ عقب‌نشینی تاکتیکی' : snapshot.status === 'victory' ? '✓ پیروزی گروهی' : 'شکست گروهی'} • نبرد پایان یافت</div>`}
      <div class="etr-party-status" data-battle-status role="status"></div>`;
    const shell = document.createElement('section');
    shell.className = 'etr-party etr-party-battle-host';
    shell.appendChild(panel);
    this.container.replaceChildren(shell);
    panel.querySelectorAll('[data-party-target]').forEach(button => button.addEventListener('click', () => {
      this.selectedMonsterIndex = Number(button.dataset.partyTarget);
      this.renderBattle(snapshot);
    }));
    panel.querySelector('[data-party-retreat]')?.addEventListener('click', async () => {
      if (this._actionPending) return;
      const confirmed = window.confirm('عقب‌نشینی تاکتیکی انجام شود؟ فقط شخصیت تو از نبرد خارج می‌شود. پاداش‌هایی که قبلاً دریافت کرده‌ای حفظ می‌شوند و پس از عقب‌نشینی نمی‌توانی به همین نبرد برگردی.');
      if (!confirmed) return;
      await this.submitBattleAction('retreat', null);
    });
    panel.querySelector('[data-party-cast-skill]')?.addEventListener('click', async event => {
      const select = panel.querySelector('#party-skill-choice');
      if (!select?.value || this._actionPending) return;
      const skillId = select.value;
      const choiceSets = {
        court_of_nameless: { title: 'حکم دادگاه بی‌نامان', values: [['silence','سکوت حکم'],['refund','بازپرداخت'],['confiscation','مصادره']] },
        true_name_shatter: { title: 'بند نام حقیقی', values: [['body','جسم'],['will','اراده'],['magic','جادو'],['bond','پیوند']] },
        final_covenant: { title: 'تجلی پیمان نهایی', values: [['annihilation','نابودی'],['dominion','سلطه'],['void','خلأ']] },
        assembly_of_souls: { title: 'فرمان مجلس ارواح', values: [['hunt','شکار'],['protect','محافظت'],['feed','تغذیه']] },
        death_memory: { title: 'خاطره مرگ', values: [['war','جنگ'],['survival','بقا'],['magic','جادو']] },
        soul_domination: { title: 'فرمان سلطه روح', values: [['dominate','تسخیر اراده'],['chain','زنجیر ارواح'],['silence','خاموشی روح']] }
      };
      const choiceSet = choiceSets[skillId];
      let choice = '';
      if (choiceSet) {
        const menu = choiceSet.values.map((v,i)=>`${i+1}. ${v[1]}`).join('\n');
        const answer = window.prompt(`${choiceSet.title}\n${menu}\nشماره گزینه را وارد کن:`, '1');
        if (answer === null) return;
        const selected = choiceSet.values[Math.max(0,Math.min(choiceSet.values.length-1,Number(answer)-1))];
        if (!selected || !Number.isInteger(Number(answer)) || Number(answer)<1 || Number(answer)>choiceSet.values.length) return;
        choice = selected[0];
      }
      await this.submitBattleAction(`skill:${skillId}${choice ? `|${choice}` : ''}`, this.selectedMonsterIndex);
    });
    panel.querySelectorAll('[data-battle-action]').forEach(button => button.addEventListener('click', async () => {
      const action = button.dataset.battleAction;
      if (action === 'skill') { if (this._actionPending) return; this.skillPanelOpen = !this.skillPanelOpen; this.itemsPanelOpen = false; this.renderBattle(snapshot); return; }
      if (action === 'items') { if (this._actionPending) return; this.itemsPanelOpen = !this.itemsPanelOpen; this.skillPanelOpen = false; this.renderBattle(snapshot); return; }
      if (this._actionPending) return;
      await this.submitBattleAction(action, this.selectedMonsterIndex);
    }));
  }

  async submitBattleAction(action, targetIndex = null) {
    if (this._actionPending) return;
    this._actionPending = true;
    const panel = this.container.querySelector('.etr-party-battle');
    panel?.setAttribute('aria-busy', 'true');
    panel?.querySelectorAll('[data-battle-action],[data-party-cast-skill],[data-party-retreat]').forEach(button => { button.disabled = true; });
    const status = panel?.querySelector('[data-battle-status]');
    if (status) status.textContent = 'اقدام ثبت می‌شود؛ لطفاً تا دریافت پاسخ سرور صبر کن…';
    let next = null, errorText = '';
    try {
      if (action.startsWith('skill:')) {
        const [skillId, choice] = action.slice(6).split('|', 2);
        next = await this.partySystem.combat.actSkill(skillId, targetIndex, choice || null);
      } else next = await this.partySystem.combat.act(action, targetIndex);
      // A short presentation pause prevents the server response and enemy reaction
      // from appearing as two instantaneous consecutive turns on mobile.
      await new Promise(resolve => setTimeout(resolve, 550));
    } catch (error) {
      errorText = this.skillError(error?.message || 'ثبت اقدام ناموفق بود.');
    } finally {
      this._actionPending = false;
    }
    if (next) {
      this.itemsPanelOpen = false;
      this.skillPanelOpen = false;
      if (next.status !== 'active') {
        await this.partySystem.refresh();
        this.renderBattle(next);
        await this.showBattleRewards(next);
      } else this.renderBattle(next);
      return;
    }
    // Re-read the authoritative snapshot after a rejected request so the UI does
    // not remain locked if the server already advanced the round elsewhere.
    try {
      const latest = await this.partySystem.combat.snapshot();
      if (latest) this.renderBattle(latest);
    } catch (_) {
      const current = this.container.querySelector('[data-battle-status]');
      if (current) current.textContent = errorText || 'ارتباط نبرد ناموفق بود؛ دوباره تلاش کن.';
    }
    const currentStatus = this.container.querySelector('[data-battle-status]');
    if (currentStatus && errorText) currentStatus.textContent = errorText;
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
    const specializationSkills = PARTY_WIZARD_SKILLS[String(self?.specialization || '').trim()] || [];
    if (!specializationSkills.length) return '<div class="party-skill-note">فقط چهار تخصص طراحی‌شده جادوگر در این مرحله مهارت آنلاین دارند؛ این تخصص هنوز یکی از آن چهار مورد نیست.</div>';
    const level = Number(self?.level) || 1;
    const skills = [...PARTY_WIZARD_CORE_SKILLS, ...specializationSkills];
    const available = skills.filter(sk => level >= Number(sk.unlockLevel || sk.level || 1));
    const options = available.map(sk => { const pct = sk.manaPct ?? sk.manaCostPercent ?? sk.manaCostPct; const manaLabel = pct !== undefined ? `${pct}٪ مانا` : `${Number(sk.manaCost)||0} مانا`; return `<option value="${sk.id}">${this.escape(sk.name)} • ${manaLabel}</option>`; }).join('');
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
      <strong>${this.escape(getPlayerDisplayName(m, 'هم‌گروهی'))}</strong>
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
      <h3>دعوت دوستان</h3><div class="etr-party-members">${friendRows.length ? friendRows.map(f => `<article class="etr-party-member"><strong>${this.escape(getPlayerDisplayName(f, 'بازیکن'))}</strong><span>سطح ${Number(f.player_level) || 1}</span><button data-invite-user="${this.escape(f.user_id)}">دعوت به گروه</button></article>`).join('') : '<p>دوست قابل‌دعوتی پیدا نشد. ابتدا بازیکن را به فهرست دوستان اضافه کن.</p>'}</div>
      <h3>دعوت‌های دریافتی</h3>${received.length ? received.map(i => `<article class="etr-party-member"><strong>${this.escape(getPlayerDisplayName({display_name:i.sender_name,username:i.sender_username}, 'بازیکن'))}</strong><button data-invite-action="accept" data-invite-id="${this.escape(i.id)}">پذیرش</button><button data-invite-action="decline" data-invite-id="${this.escape(i.id)}">رد</button></article>`).join('') : '<p>دعوت دریافتی نداری.</p>'}
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
