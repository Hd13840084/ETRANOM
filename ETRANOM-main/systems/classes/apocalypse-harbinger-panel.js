import DATA from '../../content/classes/warrior_apocalypse_harbinger_v1.json' with { type: 'json' };
import { normalizeApocalypseProgress, unlockApocalypseSkills, upgradeApocalypseSkill, purchaseApocalypseTalent, activateWorldsEnd, selectApocalypseAscension } from '../combat/apocalypse-harbinger-runtime.js?build=2081';
const esc = s => String(s !== null && s !== void 0 ? s : '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export class ApocalypseHarbingerPanel extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }); this._actor = null; this._tab = 'skills'; }
    set actor(value) { this._actor = value || {}; this.render(); }
    get actor() { return this._actor; }
    connectedCallback() { this.render(); }
    notify(message) { this.dispatchEvent(new CustomEvent('apocalypse-message', { detail: { message }, bubbles: true, composed: true })); }
    updateActor(next) { this._actor = next; this.dispatchEvent(new CustomEvent('apocalypse-actor-updated', { detail: { actor: next }, bubbles: true, composed: true })); this.render(); }
    run(action, id) { try {
        let result;
        if (action === 'upgrade')
            result = upgradeApocalypseSkill(this._actor, id);
        else if (action === 'talent')
            result = purchaseApocalypseTalent(this._actor, id);
        else if (action === 'domain')
            result = activateWorldsEnd(this._actor);
        else if (action === 'ascension')
            result = selectApocalypseAscension(this._actor, id);
        if (result === null || result === void 0 ? void 0 : result.actor)
            this.updateActor(result.actor);
        this.notify('انجام شد.');
    }
    catch (e) {
        this.notify(({ insufficient_skill_points: 'امتیاز مهارت کافی نیست.', apocalypse_skill_max_rank: 'مهارت به رتبه نهایی رسیده است.', apocalypse_skill_locked: 'این مهارت هنوز باز نشده است.', apocalypse_talent_already_owned: 'این استعداد قبلاً خریداری شده است.', apocalypse_talent_prerequisite: 'پیش‌نیاز استعداد کامل نشده است.', domain_locked: 'قلمرو هنوز باز نشده است.', domain_used: 'قلمرو در این نبرد قبلاً استفاده شده است.', domain_inactive: 'ابتدا قلمرو را فعال کن.', ascension_already_used: 'در این قلمرو قبلاً یک تعالی استفاده شده است.' })[e.message] || `خطا: ${e.message}`);
    } }
    render() {
        var _a;
        if (!this.shadowRoot)
            return;
        const a = this._actor || { level: 1, skillPoints: 0 };
        const p = normalizeApocalypseProgress(((_a = a.classProgress) === null || _a === void 0 ? void 0 : _a.warrior_apocalypse_harbinger) || a.apocalypseProgress || {});
        const level = Number(a.level) || 1;
        const tabs = [['skills', 'مهارت‌ها'], ['talents', 'استعدادها'], ['ascensions', 'تعالی‌ها'], ['domain', 'قلمرو']];
        let body = '';
        if (this._tab === 'skills')
            body = `<div class="grid">${DATA.skills.map(s => { const unlocked = level >= s.unlockLevel, rank = p.skillRanks[s.id] || 0; return `<article class="card ${unlocked ? '' : 'locked'}"><b>${esc(s.name)}</b><small>بازشدن سطح ${s.unlockLevel} · رتبه ${rank || 'قفل'}/۷</small><p>${esc(s.description || s.effect || '')}</p><span>${esc(s.type)} · استقامت ${s.staminaCost} · بازیابی ${s.cooldownTurns} نوبت</span><button data-action="upgrade" data-id="${esc(s.id)}" ${!unlocked || rank >= 7 ? 'disabled' : ''}>ارتقا به رتبه ${Math.min(7, rank + 1)} · ۱ امتیاز</button></article>`; }).join('')}</div>`;
        if (this._tab === 'talents')
            body = DATA.talentBranches.map(b => `<section><h3>${esc(b.name)}</h3><div class="grid">${b.talents.map(t => { var _a, _b, _c; const owned = p.unlockedTalents.includes(t.id); return `<article class="card"><b>${esc(t.name)}</b><small>${owned ? 'خریداری‌شده' : 'هزینه: ' + Number((_b = (_a = t.pointsRequired) !== null && _a !== void 0 ? _a : t.cost) !== null && _b !== void 0 ? _b : 1) + ' امتیاز'}</small><p>${esc(t.description || ((_c = t.effect) === null || _c === void 0 ? void 0 : _c.description) || '')}</p><button data-action="talent" data-id="${esc(t.id)}" ${owned ? 'disabled' : ''}>${owned ? 'فعال' : 'خرید استعداد'}</button></article>`; }).join('')}</div></section>`).join('');
        if (this._tab === 'ascensions')
            body = `<p>فقط یک تعالی در هر بار فعال‌سازی قلمرو قابل استفاده است.</p><div class="grid">${DATA.ascendedSkills.map(s => `<article class="card"><b>${esc(s.name)}</b><small>تعالی مهارت ${esc(s.baseSkillId)}</small><p>${esc(s.description || '')}</p><button data-action="ascension" data-id="${esc(s.id)}" ${!p.domain.active || p.domain.ascendedUsed ? 'disabled' : ''}>انتخاب تعالی</button></article>`).join('')}</div>`;
        if (this._tab === 'domain')
            body = `<div class="domain"><h2>پایان جهان</h2><p>مدت: ${DATA.domain.durationTurns} نوبت · بازشدن سطح ${DATA.domain.unlockLevel}</p><p>وضعیت: ${p.domain.active ? 'فعال · ' + p.domain.turnsRemaining + ' نوبت باقی‌مانده' : 'غیرفعال'}</p><button data-action="domain" ${level < DATA.domain.unlockLevel || p.domain.usedThisBattle || p.domain.active ? 'disabled' : ''}>فعال‌سازی قلمرو</button>${DATA.domain.stages.map((s, i) => `<article class="card"><b>مرحله ${i + 1}: ${esc(s.name)}</b><p>${esc(s.description || '')}</p></article>`).join('')}</div>`;
        this.shadowRoot.innerHTML = `<style>:host{display:block;color:#eee;font:14px system-ui;direction:rtl}.wrap{background:linear-gradient(145deg,#17101f,#09090d);border:1px solid #633b82;border-radius:16px;padding:14px}.head{display:flex;align-items:center;gap:12px}.head img{width:76px;height:76px;object-fit:cover;border-radius:12px}.tabs{display:flex;gap:6px;overflow:auto;margin:14px 0}.tabs button,button{background:#382047;color:#eee;border:1px solid #80539b;border-radius:9px;padding:10px;min-height:40px}.tabs button[aria-selected=true]{background:#65318a}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:9px}.card{background:#211927;border:1px solid #493151;border-radius:11px;padding:11px;margin:7px 0}.card b{display:block;color:#e4c7ff}.card small,.card span{display:block;color:#bca9c9;margin-top:6px}.card p{line-height:1.6;color:#ddd}.locked{opacity:.48}button:disabled{opacity:.4}.card button{margin-top:10px;width:100%}.domain{background:radial-gradient(ellipse at top,#4a176b,#100c15 70%);padding:12px;border-radius:12px}@media(max-width:420px){.head img{width:58px;height:58px}.grid{grid-template-columns:1fr}}</style><div class="wrap"><div class="head"><img src="../../assets/classes/apocalypse_harbinger_portrait.webp" alt=""><div><h2>آورنده آخرالزمان</h2><small>سطح ${level} · امتیاز مهارت ${Number(a.skillPoints) || 0}</small></div></div><nav class="tabs">${tabs.map(([id, label]) => `<button data-tab="${id}" aria-selected="${this._tab === id}">${label}</button>`).join('')}</nav><div>${body}</div></div>`;
        this.shadowRoot.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { this._tab = b.dataset.tab; this.render(); }));
        this.shadowRoot.querySelectorAll('[data-action]').forEach(b => b.addEventListener('click', () => this.run(b.dataset.action, b.dataset.id)));
    }
}
if (!customElements.get('apocalypse-harbinger-panel'))
    customElements.define('apocalypse-harbinger-panel', ApocalypseHarbingerPanel);
export function createApocalypseHarbingerPanel(actor) { const el = document.createElement('apocalypse-harbinger-panel'); el.actor = actor; return el; }
