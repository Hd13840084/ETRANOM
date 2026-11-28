/* ETRANOM OWNER CONTROL v1 — secure RPC-backed administration UI. */
const OWNER_ID = 'f9531c31-8c9f-495d-baf2-d19575982f78';
const TYPES = [
    ['item', 'آیتم‌ها'], ['monster', 'هیولاها'], ['material', 'مواد اولیه'], ['recipe', 'دستورهای ساخت'],
    ['npc', 'NPC و دیالوگ‌ها'], ['quest', 'مأموریت‌ها'], ['region', 'مناطق و زون‌ها'], ['skill', 'مهارت‌ها'],
    ['dungeon', 'سیاه‌چال‌ها'], ['ruin', 'خرابه‌ها'], ['tower_encounter', 'برج و رویارویی‌ها'], ['reward_table', 'جدول پاداش‌ها'],
    ['class', 'کلاس‌ها'], ['specialization', 'تخصص‌ها'], ['shop', 'فروشگاه‌ها'], ['event', 'رویدادها'],
    ['world_setting', 'تنظیمات جهان'], ['text', 'متن‌ها و پیام‌ها'],
    ['monster_ai', 'هوش مصنوعی هیولاها'], ['dialogue', 'دیالوگ‌ها و شاخه‌های گفتگو'],
    ['economy_rule', 'قوانین اقتصاد و بازار'], ['guild_config', 'تنظیمات انجمن‌ها'],
    ['party_config', 'تنظیمات گروه‌ها'], ['pvp_config', 'تنظیمات PvP'],
    ['progression_rule', 'قوانین پیشرفت و تجربه'], ['ban_policy', 'سیاست‌های دسترسی و محرومیت'],
    ['world_event', 'رویدادهای جهان'], ['class_balance', 'تعادل کلاس‌ها و تخصص‌ها']
];
const esc = s => String(s !== null && s !== void 0 ? s : '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export function mountOwnerControl(supabase) {
    if (document.getElementById('etr-owner-launch'))
        return;
    const style = document.createElement('style');
    style.textContent = `#etr-owner-launch{position:fixed;z-index:100090;left:12px;bottom:calc(14px + env(safe-area-inset-bottom));display:none;border:1px solid #d5b36e;background:linear-gradient(135deg,#49351e,#17111e);color:#ffe5ae;border-radius:10px;padding:11px 14px;font: bold 12px Tahoma;box-shadow:0 5px 22px #000b}#etr-owner-overlay{position:fixed;inset:0;z-index:100100;display:none;background:#08070bf5;color:#eee7dc;font:13px Tahoma,Arial;direction:rtl;padding:10px}#etr-owner-shell{height:100%;max-width:1500px;margin:auto;display:grid;grid-template-rows:auto 1fr;background:#15111b;border:1px solid #80633d;box-shadow:0 15px 60px #000;border-radius:12px;overflow:hidden}#etr-owner-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 15px;background:#211929;border-bottom:1px solid #765b3c}#etr-owner-head h2{margin:0;color:#e3c58e;font-size:17px}#etr-owner-body{display:grid;grid-template-columns:220px 1fr;min-height:0}#etr-owner-nav{overflow:auto;padding:9px;border-left:1px solid #423447;background:#19141f}#etr-owner-nav button,#etr-owner-content button{width:100%;padding:10px;margin:3px 0;border:1px solid #5b4b60;border-radius:7px;background:#282031;color:#f0dfc4;font:12px Tahoma;text-align:right}#etr-owner-nav button.active{border-color:#d2ad6b;background:#49351e}#etr-owner-content{overflow:auto;padding:14px}#etr-owner-content h3{color:#e4c58c;margin:4px 0 12px}#etr-owner-content input,#etr-owner-content textarea,#etr-owner-content select{width:100%;box-sizing:border-box;margin:5px 0 10px;padding:10px;background:#0e0b12;color:#fff;border:1px solid #5c4b61;border-radius:6px;font:12px Tahoma}#etr-owner-content textarea{min-height:220px;direction:ltr;text-align:left;font-family:monospace}#etr-owner-content .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:9px}#etr-owner-content .card{padding:12px;border:1px solid #514253;border-radius:8px;background:#201a27;margin:7px 0}#etr-owner-content .muted{color:#b9aabd;line-height:1.9}#etr-owner-content .danger{border-color:#a94d4d;color:#ffb4a8}#etr-owner-content pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#0c0a10;padding:10px;border-radius:7px;direction:ltr;text-align:left}#etr-owner-close{border:1px solid #98734c;background:#38283b;color:#f4dfbd;padding:9px 13px;border-radius:7px}@media(max-width:650px){#etr-owner-body{grid-template-columns:112px 1fr}#etr-owner-nav button{font-size:10px;padding:9px 5px}#etr-owner-content{padding:9px}#etr-owner-content .grid{grid-template-columns:1fr}}`;
    document.head.append(style);
    const launch = document.createElement('button');
    launch.id = 'etr-owner-launch';
    launch.textContent = '✦ مدیریت ETRANOM';
    document.body.append(launch);
    const overlay = document.createElement('div');
    overlay.id = 'etr-owner-overlay';
    overlay.innerHTML = `<section id="etr-owner-shell"><header id="etr-owner-head"><div><small style="color:#c5a46b">ETRANOM • OWNER CONTROL</small><h2>مرکز فرماندهی بازی</h2></div><button id="etr-owner-close">بستن ✕</button></header><div id="etr-owner-body"><nav id="etr-owner-nav"></nav><main id="etr-owner-content"><p>در حال بررسی دسترسی...</p></main></div></section>`;
    document.body.append(overlay);
    const content = overlay.querySelector('#etr-owner-content'), nav = overlay.querySelector('#etr-owner-nav');
    let role = null;
    async function rpc(name, args = {}) { const { data, error } = await supabase.rpc(name, args); if (error)
        throw error; return data; }
    function message(e) { content.innerHTML = `<div class="card danger">${esc(e.message || e)}</div>`; }
    function show(title, html) { content.innerHTML = `<h3>${title}</h3>${html}`; }
    async function dashboard() { try {
        const d = await rpc('etranom_admin_dashboard_v1');
        show('نمای کلی', `<div class="grid">${Object.entries(d || {}).map(([k, v]) => `<div class="card"><div class="muted">${esc(k)}</div><strong style="font-size:22px;color:#e5c68e">${esc(v)}</strong></div>`).join('')}</div><p class="muted">آمار فقط از داده‌هایی نمایش داده می‌شود که RPC سمت سرور برمی‌گرداند.</p>`);
    }
    catch (e) {
        message(e);
    } }
    async function playerInventory(playerId) {
        var _a, _b;
        try {
            const d = await rpc('etranom_admin_get_player_v1', { p_player_id: playerId });
            const save = (d === null || d === void 0 ? void 0 : d.save_data) || {}, inventory = Array.isArray(save.inventory) ? save.inventory : [], equipment = save.equipmentSlots && typeof save.equipmentSlots === 'object' ? save.equipmentSlots : {};
            const slots = Object.entries(equipment).filter(([, item]) => item && typeof item === 'object' && item.id);
            show('مدیریت موجودی و تجهیزات', `
        <button id="etr-inv-back">بازگشت به بازیکنان</button>
        <div class="card"><b>${esc(((_a = d.profile) === null || _a === void 0 ? void 0 : _a.display_name) || ((_b = d.profile) === null || _b === void 0 ? void 0 : _b.username) || playerId)}</b><div class="muted">${esc(playerId)} • فقط آیتم‌های موجود قابل تغییرند؛ افزودن آیتم دلخواه غیرفعال است.</div></div>
        <h3>کیف (${inventory.length} ردیف)</h3>
        ${inventory.map((item, i) => { var _a; return `<div class="card"><b>${esc(item.name || item.id || `آیتم ${i + 1}`)}</b><div class="muted">شناسه: ${esc(item.id)} • تعداد: ${esc((_a = item.qty) !== null && _a !== void 0 ? _a : 1)} • کیفیت: ${esc(item.rarity || '—')}</div><div class="grid"><button data-inv-qty="${i}">تغییر تعداد</button><button data-inv-remove="${i}" class="danger">حذف از کیف</button></div></div>`; }).join('') || '<p class="muted">کیف خالی است.</p>'}
        <h3>تجهیزات پوشیده‌شده (${slots.length})</h3>
        ${slots.map(([slot, item]) => `<div class="card"><b>${esc(item.name || item.id)}</b><div class="muted">جایگاه: ${esc(slot)} • شناسه: ${esc(item.id)}</div><button data-inv-unequip="${esc(slot)}">بازگرداندن به کیف</button></div>`).join('') || '<p class="muted">تجهیزی پوشیده نشده است.</p>'}
        <p class="muted">هر عملیات از RPC امن V13 استفاده می‌کند و باید در گزارش مدیران ثبت شود. پس از هر تغییر، اطلاعات دوباره از سرور خوانده می‌شود.</p>`);
            content.querySelector('#etr-inv-back').onclick = players;
            content.querySelectorAll('[data-inv-qty]').forEach(btn => btn.onclick = async () => { var _a; try {
                const item = inventory[Number(btn.dataset.invQty)], raw = prompt(`تعداد جدید برای ${item.name || item.id} (۰ تا ۹۹۹۹۹):`, String((_a = item.qty) !== null && _a !== void 0 ? _a : 1));
                if (raw === null)
                    return;
                const qty = Number(raw);
                if (!Number.isInteger(qty) || qty < 0 || qty > 99999)
                    throw new Error('تعداد باید عدد صحیح بین صفر تا ۹۹۹۹۹ باشد.');
                if (!confirm('تعداد این آیتم تغییر کند؟'))
                    return;
                await rpc('etranom_admin_patch_player_inventory_v13', { p_player_id: playerId, p_action: 'set_quantity', p_item_id: String(item.id), p_quantity: qty });
                await playerInventory(playerId);
            }
            catch (e) {
                message(e);
            } });
            content.querySelectorAll('[data-inv-remove]').forEach(btn => btn.onclick = async () => { try {
                const item = inventory[Number(btn.dataset.invRemove)];
                if (!confirm(`آیتم ${item.name || item.id} از کیف حذف شود؟`))
                    return;
                await rpc('etranom_admin_patch_player_inventory_v13', { p_player_id: playerId, p_action: 'remove', p_item_id: String(item.id) });
                await playerInventory(playerId);
            }
            catch (e) {
                message(e);
            } });
            content.querySelectorAll('[data-inv-unequip]').forEach(btn => btn.onclick = async () => { try {
                const slot = btn.dataset.invUnequip;
                if (!confirm(`تجهیز جایگاه ${slot} به کیف بازگردد؟`))
                    return;
                await rpc('etranom_admin_patch_player_inventory_v13', { p_player_id: playerId, p_action: 'unequip', p_slot: slot });
                await playerInventory(playerId);
            }
            catch (e) {
                message(e);
            } });
        }
        catch (e) {
            message(e);
        }
    }
    async function players() { try {
        const rows = await rpc('etranom_admin_list_players_v1', { p_limit: 100, p_offset: 0 });
        show('بازیکنان', `<p class="muted">نمایش حداکثر ۱۰۰ بازیکن در هر صفحه.</p>${(rows || []).map(p => { var _a, _b; return `<div class="card"><b>${esc(p.display_name || p.username || p.user_id)}</b><div class="muted">شناسه: ${esc(p.user_id)} | سطح: ${esc((_a = p.player_level) !== null && _a !== void 0 ? _a : '—')} | کلاس: ${esc((_b = p.player_class) !== null && _b !== void 0 ? _b : '—')}</div><button data-detail="${esc(p.user_id)}">مشاهده پرونده</button><button data-inventory="${esc(p.user_id)}">موجودی و تجهیزات</button><button data-ban="${esc(p.user_id)}">مدیریت بن</button></div>`; }).join('') || 'بازیکنی یافت نشد.'}`);
        content.querySelectorAll('[data-inventory]').forEach(b => b.onclick = () => playerInventory(b.dataset.inventory));
        content.querySelectorAll('[data-detail]').forEach(b => b.onclick = async () => { var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3; try {
            const d = await rpc('etranom_admin_get_player_v1', { p_player_id: b.dataset.detail });
            show('پرونده بازیکن', `<button id="etr-back-players">بازگشت به فهرست</button><div class="card"><b>${esc(((_a = d.profile) === null || _a === void 0 ? void 0 : _a.display_name) || ((_b = d.profile) === null || _b === void 0 ? void 0 : _b.username) || ((_c = d.profile) === null || _c === void 0 ? void 0 : _c.user_id))}</b><div class="muted">شناسه: ${esc((_d = d.profile) === null || _d === void 0 ? void 0 : _d.user_id)} | سطح: ${esc((_f = (_e = d.profile) === null || _e === void 0 ? void 0 : _e.player_level) !== null && _f !== void 0 ? _f : '—')} | کلاس: ${esc((_h = (_g = d.profile) === null || _g === void 0 ? void 0 : _g.player_class) !== null && _h !== void 0 ? _h : '—')}</div><div class="muted">وضعیت بن: ${((_j = d.ban) === null || _j === void 0 ? void 0 : _j.active) ? 'فعال' : 'غیرفعال'}</div></div><h3>ویرایش امن اطلاعات شخصیت</h3><p class="muted">ویرایش به‌صورت فیلدهای محدود و اعتبارسنجی‌شده انجام می‌شود؛ ساختار کامل ذخیره قابل جایگزینی نیست. هر تغییر در گزارش مدیریتی ثبت می‌شود.</p><div class="grid"><label>فیلد<select id="etr-player-field"><option value="gold">طلا</option><option value="level">سطح (۱ تا ۵۰)</option><option value="xp">تجربه</option><option value="hp">سلامتی فعلی</option><option value="mp">مانای فعلی</option><option value="stamina">استقامت فعلی</option></select></label><label>مقدار جدید<input id="etr-player-value" type="number" step="1" inputmode="numeric"></label></div><button id="etr-player-save-commit">ثبت تغییر امن</button><div class="card"><b>مقادیر فعلی</b><div class="muted">طلا: ${esc((_l = (_k = d.save_data) === null || _k === void 0 ? void 0 : _k.gold) !== null && _l !== void 0 ? _l : '—')} | سطح: ${esc((_r = (_p = (_o = (_m = d.save_data) === null || _m === void 0 ? void 0 : _m.character) === null || _o === void 0 ? void 0 : _o.level) !== null && _p !== void 0 ? _p : (_q = d.profile) === null || _q === void 0 ? void 0 : _q.player_level) !== null && _r !== void 0 ? _r : '—')} | XP: ${esc((_u = (_t = (_s = d.save_data) === null || _s === void 0 ? void 0 : _s.character) === null || _t === void 0 ? void 0 : _t.xp) !== null && _u !== void 0 ? _u : '—')}<br>سلامتی: ${esc((_x = (_w = (_v = d.save_data) === null || _v === void 0 ? void 0 : _v.character) === null || _w === void 0 ? void 0 : _w.hp) !== null && _x !== void 0 ? _x : '—')} | مانا: ${esc((_0 = (_z = (_y = d.save_data) === null || _y === void 0 ? void 0 : _y.character) === null || _z === void 0 ? void 0 : _z.mp) !== null && _0 !== void 0 ? _0 : '—')} | استقامت: ${esc((_3 = (_2 = (_1 = d.save_data) === null || _1 === void 0 ? void 0 : _1.character) === null || _2 === void 0 ? void 0 : _2.stamina) !== null && _3 !== void 0 ? _3 : '—')}</div></div>`);
            content.querySelector('#etr-back-players').onclick = players;
            content.querySelector('#etr-player-save-commit').onclick = async () => { var _a, _b, _c, _d, _e, _f, _g, _h, _j; try {
                const field = content.querySelector('#etr-player-field').value, raw = content.querySelector('#etr-player-value').value;
                if (raw.trim() === '')
                    throw new Error('مقدار جدید را وارد کن.');
                const value = Number(raw);
                if (!Number.isSafeInteger(value))
                    throw new Error('مقدار باید عدد صحیح معتبر باشد.');
                if (!confirm('فقط همین فیلد با مقدار جدید ثبت شود؟'))
                    return;
                await rpc('etranom_admin_patch_player_save_v12', { p_player_id: b.dataset.detail, p_field: field, p_value: value });
                alert('تغییر امن ثبت شد.');
                const fresh = await rpc('etranom_admin_get_player_v1', { p_player_id: b.dataset.detail });
                const d2 = fresh;
                show('پرونده بازیکن', `<button id="etr-back-players">بازگشت به فهرست</button><div class="card"><b>${esc(((_a = d2.profile) === null || _a === void 0 ? void 0 : _a.display_name) || ((_b = d2.profile) === null || _b === void 0 ? void 0 : _b.username) || ((_c = d2.profile) === null || _c === void 0 ? void 0 : _c.user_id))}</b><div class="muted">شناسه: ${esc((_d = d2.profile) === null || _d === void 0 ? void 0 : _d.user_id)} | سطح: ${esc((_f = (_e = d2.profile) === null || _e === void 0 ? void 0 : _e.player_level) !== null && _f !== void 0 ? _f : '—')} | کلاس: ${esc((_h = (_g = d2.profile) === null || _g === void 0 ? void 0 : _g.player_class) !== null && _h !== void 0 ? _h : '—')}</div><div class="muted">وضعیت بن: ${((_j = d2.ban) === null || _j === void 0 ? void 0 : _j.active) ? 'فعال' : 'غیرفعال'}</div></div><p class="muted">برای مشاهده مقادیر تازه، پرونده را دوباره باز کن.</p>`);
                content.querySelector('#etr-back-players').onclick = players;
            }
            catch (e) {
                message(e);
            } };
        }
        catch (e) {
            message(e);
        } });
        content.querySelectorAll('[data-ban]').forEach(b => b.onclick = async () => { const id = b.dataset.ban, shouldBan = confirm('برای بن کردن این بازیکن OK را بزن؛ برای رفع بن Cancel را بزن.'); let reason = null; if (shouldBan) {
            reason = prompt('دلیل بن را وارد کن:', '');
            if (reason === null)
                return;
            if (!reason.trim()) {
                alert('برای بن کردن، وارد کردن دلیل الزامی است.');
                return;
            }
        } try {
            let duration_hours = null;
            if (shouldBan) {
                const raw = prompt('مدت بن به ساعت (خالی = دائمی):', '');
                if (raw === null)
                    return;
                if (raw.trim()) {
                    duration_hours = Number(raw);
                    if (!Number.isInteger(duration_hours) || duration_hours < 1 || duration_hours > 87600)
                        throw new Error('مدت باید عدد صحیح بین ۱ تا ۸۷۶۰۰ ساعت باشد.');
                }
            }
            const { data, error } = await supabase.functions.invoke('etranom-admin-user-access', { body: { action: shouldBan ? 'ban' : 'unban', player_id: id, reason, duration_hours } });
            if (error)
                throw error;
            if (data === null || data === void 0 ? void 0 : data.error)
                throw new Error(data.error + (data.detail ? ': ' + data.detail : ''));
            alert(shouldBan ? 'بن Auth و دیتابیس اعمال شد.' : 'دسترسی Auth و رکورد بن رفع شد.');
            await players();
        }
        catch (e) {
            message(e);
        } });
    }
    catch (e) {
        message(e);
    } }
    async function contentManager(type = 'item') {
        try {
            const rows = await rpc('etranom_admin_list_content_v1', { p_content_type: type });
            show('مدیریت محتوا', `<div class="grid"><label>نوع محتوا<select id="etr-ac-type">${TYPES.map(([v, l]) => `<option value="${v}" ${v === type ? 'selected' : ''}>${l}</option>`).join('')}</select></label><label>شناسه<input id="etr-ac-id" placeholder="مثلاً burnt_forest_beast"></label></div><label>محتوا (JSON)<textarea id="etr-ac-json">{
  "name": "نام جدید",
  "description": "توضیحات",
  "stats": {}
}</textarea></label><button id="etr-ac-save">ذخیره پیش‌نویس</button><div class="card"><b>محتوای ثبت‌شده</b>${(rows || []).map(r => `<div class="card"><b>${esc(r.content_id)}</b><div class="muted">وضعیت: ${esc(r.status)} | نسخه: ${esc(r.version)}</div><button data-edit="${esc(r.content_id)}">ویرایش</button><button data-publish="${esc(r.content_id)}">انتشار</button>${r.status === 'published' ? `<button data-archive="${esc(r.content_id)}" class="danger">خروج از بازی</button>` : ''}<button data-history="${esc(r.content_id)}">نسخه‌ها</button><button data-delete-draft="${esc(r.content_id)}" class="danger">حذف پیش‌نویس</button></div>`).join('') || '<p class="muted">هنوز محتوایی ثبت نشده است.</p>'}</div>`);
            content.querySelector('#etr-ac-type').onchange = e => contentManager(e.target.value);
            content.querySelector('#etr-ac-save').onclick = async () => { try {
                const id = content.querySelector('#etr-ac-id').value.trim(), data = JSON.parse(content.querySelector('#etr-ac-json').value);
                if (!id)
                    throw new Error('شناسه محتوا الزامی است.');
                data.id = id;
                await rpc('etranom_admin_upsert_content_v1', { p_content_type: type, p_content_id: id, p_payload: data, p_publish: false });
                await contentManager(type);
            }
            catch (e) {
                message(e);
            } };
            content.querySelectorAll('[data-edit]').forEach(b => b.onclick = async () => { try {
                const row = await rpc('etranom_admin_get_content_v1', { p_content_type: type, p_content_id: b.dataset.edit });
                content.querySelector('#etr-ac-id').value = row.content_id;
                content.querySelector('#etr-ac-json').value = JSON.stringify(row.payload, null, 2);
            }
            catch (e) {
                message(e);
            } });
            content.querySelectorAll('[data-publish]').forEach(b => b.onclick = async () => { try {
                await rpc('etranom_admin_publish_content_v1', { p_content_type: type, p_content_id: b.dataset.publish });
                await contentManager(type);
            }
            catch (e) {
                message(e);
            } });
            content.querySelectorAll('[data-archive]').forEach(b => b.onclick = async () => { try {
                if (!confirm('این محتوا از بارگذاری‌های بعدی بازی خارج شود؟'))
                    return;
                await rpc('etranom_admin_archive_content_v1', { p_content_type: type, p_content_id: b.dataset.archive });
                await contentManager(type);
            }
            catch (e) {
                message(e);
            } });
            content.querySelectorAll('[data-history]').forEach(b => b.onclick = async () => { try {
                const versions = await rpc('etranom_admin_content_versions_list_v1', { p_content_type: type, p_content_id: b.dataset.history });
                const pick = prompt('شماره نسخه برای بازگردانی:\n' + (versions || []).map(v => `v${v.version} • ${v.status} • ${v.changed_at}`).join('\n'));
                if (pick === null)
                    return;
                const version = Number(pick.replace(/^v/i, ''));
                if (!Number.isInteger(version) || version < 1)
                    throw new Error('شماره نسخه معتبر نیست.');
                if (!confirm(`نسخه ${version} به‌صورت پیش‌نویس بازگردانی شود؟`))
                    return;
                await rpc('etranom_admin_content_rollback_v1', { p_content_type: type, p_content_id: b.dataset.history, p_version: version });
                await contentManager(type);
            }
            catch (e) {
                message(e);
            } });
            content.querySelectorAll('[data-delete-draft]').forEach(b => b.onclick = async () => { try {
                if (!confirm('فقط پیش‌نویس حذف می‌شود. ادامه؟'))
                    return;
                await rpc('etranom_admin_delete_draft_v1', { p_content_type: type, p_content_id: b.dataset.deleteDraft });
                await contentManager(type);
            }
            catch (e) {
                message(e);
            } });
        }
        catch (e) {
            message(e);
        }
    }
    async function audit() { try {
        const rows = await rpc('etranom_admin_audit_list_v1', { p_limit: 100 });
        show('گزارش اقدامات مدیران', `<p class="muted">آخرین ۱۰۰ اقدام مدیریتی</p>${(rows || []).map(r => `<div class="card"><b>${esc(r.action)}</b><div class="muted">${esc(r.created_at)} • ${esc(r.actor_id)} • ${esc(r.target_type || '')} ${esc(r.target_id || '')}</div><pre>${esc(JSON.stringify(r.details || {}, null, 2))}</pre></div>`).join('') || 'هنوز گزارشی ثبت نشده است.'}`);
    }
    catch (e) {
        message(e);
    } }
    async function roles() { try {
        const rows = await rpc('etranom_admin_list_roles_v1');
        show('مدیریت مدیران و دسترسی‌ها', `<p class="muted">این بخش فقط برای حساب Owner اصلی فعال است. حساب Owner اصلی قابل حذف یا تنزل رتبه نیست.</p><div class="card"><h3>افزودن / تغییر دسترسی مدیر</h3><label>شناسه کاربر Supabase<input id="etr-role-user" placeholder="UUID حساب کاربر"></label><label>نقش<select id="etr-role-name"><option value="super_admin">مدیر ارشد</option><option value="game_admin">مدیر بازی</option><option value="moderator">ناظر</option><option value="support">پشتیبانی</option></select></label><label>مجوزها (JSON)<textarea id="etr-role-perms">{"dashboard":true,"players":true,"content":true,"audit":true,"economy":false,"world":false,"combat":false,"community":false}</textarea></label><button id="etr-role-save">ثبت دسترسی</button></div><h3>مدیران فعلی</h3>${(rows || []).map(r => `<div class="card"><b>${esc(r.role)}</b><div class="muted">${esc(r.user_id)}</div><pre>${esc(JSON.stringify(r.permissions || {}, null, 2))}</pre></div>`).join('') || 'مدیری ثبت نشده است.'}`);
        content.querySelector('#etr-role-save').onclick = async () => { try {
            const id = content.querySelector('#etr-role-user').value.trim(), roleName = content.querySelector('#etr-role-name').value, perms = JSON.parse(content.querySelector('#etr-role-perms').value);
            if (!id)
                throw new Error('شناسه کاربر الزامی است.');
            await rpc('etranom_admin_set_role_v1', { p_user_id: id, p_role: roleName, p_permissions: perms });
            await roles();
        }
        catch (e) {
            message(e);
        } };
    }
    catch (e) {
        message(e);
    } }
    const LIVE_TABLES = {
        world: [['etranom_content_regions', 'مناطق'], ['etranom_content_monsters', 'هیولاها'], ['etranom_content_materials', 'مواد'], ['etranom_content_recipes', 'دستورهای ساخت']],
        combat: [['etranom_shared_skill_catalog', 'کاتالوگ مهارت‌ها'], ['parties', 'گروه‌ها'], ['party_members', 'اعضای گروه'], ['party_sessions', 'جلسات گروه'], ['party_battle_state', 'وضعیت نبرد گروه'], ['pvp_matches', 'مسابقات PvP'], ['pvp_player_stats', 'آمار PvP']],
        economy: [['market_listings', 'آگهی‌های بازار'], ['market_transactions', 'تراکنش‌های بازار'], ['guilds', 'انجمن‌ها'], ['guild_members', 'اعضای انجمن']],
        community: [['global_messages', 'پیام‌های عمومی'], ['private_messages', 'پیام‌های خصوصی']],
        players: [['player_profiles', 'پروفایل‌ها'], ['game_saves', 'ذخیره بازی‌ها'], ['game_save_history', 'تاریخچه ذخیره‌ها'], ['game_save_conflicts', 'تعارض ذخیره‌ها']]
    };
    async function liveOverview() { try {
        const d = await rpc('etranom_admin_live_overview_v1');
        show('آمار زنده دیتابیس', `<div class="grid">${Object.entries(d || {}).map(([k, v]) => `<div class="card"><div class="muted">${esc(k)}</div><strong style="font-size:20px;color:#e5c68e">${esc(v)}</strong></div>`).join('')}</div><p class="muted">این اعداد مستقیماً از جدول‌های موجود Supabase خوانده شده‌اند؛ مقدار زمان ثبت در captured_at درج شده است.</p>`);
    }
    catch (e) {
        message(e);
    } }
    async function tableViewer(group = 'world', table = null) { var _a; const entries = LIVE_TABLES[group] || []; table = table || ((_a = entries[0]) === null || _a === void 0 ? void 0 : _a[0]); try {
        const rows = await rpc('etranom_admin_table_preview_v1', { p_table: table, p_limit: 50, p_offset: 0 });
        show('مرور داده‌های زنده', `<label>بخش<select id="etr-live-group">${Object.keys(LIVE_TABLES).map(k => `<option value="${k}" ${k === group ? 'selected' : ''}>${({ world: 'جهان و محتوا', combat: 'نبرد و مهارت', economy: 'اقتصاد و انجمن‌ها', community: 'ارتباطات', players: 'داده بازیکنان' })[k]}</option>`).join('')}</select></label><label>جدول<select id="etr-live-table">${entries.map(([v, l]) => `<option value="${v}" ${v === table ? 'selected' : ''}>${l}</option>`).join('')}</select></label><div class="muted">نمایش فقط‌خواندنی، حداکثر ۵۰ ردیف. برای تغییر داده زنده از این بخش استفاده نمی‌شود.</div><pre>${esc(JSON.stringify(rows || [], null, 2))}</pre>`);
        content.querySelector('#etr-live-group').onchange = e => tableViewer(e.target.value);
        content.querySelector('#etr-live-table').onchange = e => tableViewer(group, e.target.value);
    }
    catch (e) {
        message(e);
    } }
    const EDITABLE_TABLES = {
        players: ['player_profiles', 'game_saves', 'pvp_player_stats'],
        world: ['etranom_content_regions', 'etranom_content_monsters', 'etranom_content_materials', 'etranom_content_recipes', 'etranom_recipe_drop_catalog', 'etranom_exploration_rewards'],
        combat: ['etranom_shared_skill_catalog', 'party_battle_skill_catalog', 'wizard_domain_skill_forms_v1929'],
        economy: ['guilds', 'market_listings']
    };
    async function liveEditor(group = 'world', table = null, offset = 0) {
        const tables = EDITABLE_TABLES[group] || [];
        table = table || tables[0];
        try {
            const [schema, rows] = await Promise.all([
                rpc('etranom_admin_table_schema_v1', { p_table: table }),
                rpc('etranom_admin_table_rows_v1', { p_table: table, p_limit: 40, p_offset: offset })
            ]);
            show('ویرایش داده‌های واقعی بازی', `
        <p class="muted">این بخش مستقیماً ردیف‌های جدول اصلی Supabase را ویرایش می‌کند. ستون‌های شناسه، مالکیت و زمان‌های سیستمی محافظت می‌شوند. هر تغییر در گزارش مدیران ثبت می‌شود.</p>
        <div class="grid"><label>گروه<select id="etr-edit-group">${Object.keys(EDITABLE_TABLES).map(k => `<option value="${k}" ${k === group ? 'selected' : ''}>${({ players: 'بازیکنان و آمار', world: 'جهان و محتوا', combat: 'مهارت و نبرد', economy: 'اقتصاد' })[k]}</option>`).join('')}</select></label><label>جدول<select id="etr-edit-table">${tables.map(t => `<option value="${t}" ${t === table ? 'selected' : ''}>${t}</option>`).join('')}</select></label></div>
        <div class="card"><b>ستون‌های جدول</b><div class="muted">${(schema || []).map(c => `${esc(c.column_name)} (${esc(c.data_type)})${c.is_editable ? '' : ' 🔒'}`).join(' • ')}</div></div>
        <div class="card"><b>ایجاد ردیف جدید</b><p class="muted">ایجاد و حذف فقط برای کاتالوگ‌های مجاز جهان و مهارت فعال است.</p>${(['etranom_content_regions', 'etranom_content_monsters', 'etranom_content_materials', 'etranom_content_recipes', 'etranom_recipe_drop_catalog', 'etranom_exploration_rewards', 'etranom_shared_skill_catalog', 'party_battle_skill_catalog', 'wizard_domain_skill_forms_v1929'].includes(table)) ? '<textarea id="etr-edit-new-json" placeholder=&quot;{&quot;id&quot;:&quot;new_record&quot;}&quot;></textarea><button id="etr-edit-create">ایجاد ردیف در جدول اصلی</button>' : '<p class="muted">برای این جدول، ایجاد/حذف عمومی غیرفعال است.</p>'}</div>
        <div class="card"><b>ردیف‌ها (${offset + 1} تا ${offset + (rows || []).length})</b>${(rows || []).map((r, i) => `<div class="card"><div class="muted">${esc(JSON.stringify(r.__pk || {}))}</div><pre>${esc(JSON.stringify(r, null, 2))}</pre><div class="grid"><button data-row-index="${i}">ویرایش این ردیف</button>${(['etranom_content_regions', 'etranom_content_monsters', 'etranom_content_materials', 'etranom_content_recipes', 'etranom_recipe_drop_catalog', 'etranom_exploration_rewards', 'etranom_shared_skill_catalog', 'party_battle_skill_catalog', 'wizard_domain_skill_forms_v1929'].includes(table)) ? `<button data-row-delete="${i}" class="danger">حذف ردیف</button>` : ''}</div></div>`).join('') || 'ردیفی یافت نشد.'}<div class="grid"><button id="etr-edit-prev" ${offset === 0 ? 'disabled' : ''}>صفحه قبل</button><button id="etr-edit-next" ${(rows || []).length < 40 ? 'disabled' : ''}>صفحه بعد</button></div></div>
        <div class="card"><h3>ویرایش JSON ردیف انتخاب‌شده</h3><textarea id="etr-edit-json" placeholder="از فهرست بالا یک ردیف را انتخاب کن"></textarea><button id="etr-edit-save">ذخیره تغییرات در بازی</button><p class="muted">فقط ستون‌های مجاز تغییر می‌کنند. برای تغییر شناسه یا مالکیت باید از عملیات اختصاصی و امن استفاده شود.</p></div>
      `);
            let selected = null;
            content.querySelector('#etr-edit-group').onchange = e => liveEditor(e.target.value);
            content.querySelector('#etr-edit-table').onchange = e => liveEditor(group, e.target.value);
            content.querySelector('#etr-edit-prev').onclick = () => liveEditor(group, table, Math.max(0, offset - 40));
            content.querySelector('#etr-edit-next').onclick = () => liveEditor(group, table, offset + 40);
            content.querySelectorAll('[data-row-index]').forEach(b => b.onclick = () => { selected = rows[Number(b.dataset.rowIndex)]; content.querySelector('#etr-edit-json').value = JSON.stringify(selected, null, 2); });
            content.querySelectorAll('[data-row-delete]').forEach(b => b.onclick = async () => { try {
                const row = rows[Number(b.dataset.rowDelete)];
                if (!confirm(`ردیف ${JSON.stringify(row.__pk)} برای همیشه از جدول ${table} حذف شود؟`))
                    return;
                await rpc('etranom_admin_delete_catalog_row_v1', { p_table: table, p_pk: row.__pk });
                alert('ردیف حذف شد.');
                await liveEditor(group, table, offset);
            }
            catch (e) {
                message(e);
            } });
            if (content.querySelector('#etr-edit-create'))
                content.querySelector('#etr-edit-create').onclick = async () => { try {
                    const payload = JSON.parse(content.querySelector('#etr-edit-new-json').value);
                    if (!payload || typeof payload !== 'object' || Array.isArray(payload))
                        throw new Error('ورودی باید شیء JSON باشد.');
                    await rpc('etranom_admin_insert_catalog_row_v1', { p_table: table, p_payload: payload });
                    alert('ردیف ایجاد شد.');
                    await liveEditor(group, table, offset);
                }
                catch (e) {
                    message(e);
                } };
            content.querySelector('#etr-edit-save').onclick = async () => {
                try {
                    if (!selected)
                        throw new Error('ابتدا یک ردیف را انتخاب کن.');
                    const edited = JSON.parse(content.querySelector('#etr-edit-json').value);
                    if (!edited || typeof edited !== 'object' || Array.isArray(edited))
                        throw new Error('ساختار JSON باید یک شیء باشد.');
                    delete edited.__pk;
                    const patch = Object.fromEntries((schema || []).filter(c => c.is_editable && Object.prototype.hasOwnProperty.call(edited, c.column_name)).map(c => [c.column_name, edited[c.column_name]]));
                    if (!Object.keys(patch).length)
                        throw new Error('هیچ ستون قابل ویرایشی تغییر نکرده است.');
                    await rpc('etranom_admin_update_row_v1', { p_table: table, p_pk: selected.__pk, p_patch: patch });
                    alert('تغییرات ذخیره شد.');
                    await liveEditor(group, table, offset);
                }
                catch (e) {
                    message(e);
                }
            };
        }
        catch (e) {
            message(e);
        }
    }
    const sections = [
        ['dashboard', 'داشبورد مدیریتی', dashboard], ['live', 'آمار زنده دیتابیس', liveOverview], ['roles', 'مدیریت مدیران', roles],
        ['players', '۱. بازیکنان و پرونده‌ها', players], ['playerstats', '۲. آمار و شخصیت', () => liveEditor('players')],
        ['items', '۳. آیتم‌ها و تجهیزات', () => contentManager('item')], ['worldedit', '۴. جهان، مناطق و هیولاها', () => contentManager('monster')],
        ['npcquests', '۵. NPC و مأموریت‌ها', () => contentManager('dialogue')], ['classes', '۶. کلاس‌ها، تخصص‌ها و مهارت‌ها', () => contentManager('class_balance')],
        ['combatadmin', '۷. نبرد، AI و تنظیمات', () => contentManager('monster_ai')], ['economyadmin', '۸. اقتصاد، بازار و انجمن‌ها', () => contentManager('economy_rule')],
        ['opsadmin', '۹. عملیات، انتشار و تاریخچه • رویدادها', () => contentManager('world_event')],
        ['guildconfig', 'تنظیمات انجمن‌ها', () => contentManager('guild_config')], ['partyconfig', 'تنظیمات Party', () => contentManager('party_config')],
        ['pvpconfig', 'تنظیمات PvP', () => contentManager('pvp_config')], ['progressionconfig', 'قوانین پیشرفت و XP', () => contentManager('progression_rule')],
        ['banpolicy', 'سیاست‌های محرومیت', () => contentManager('ban_policy')],
        ['editdata', 'ویرایش داده‌های واقعی', () => liveEditor('world')], ['world', 'مرور جهان', () => tableViewer('world')],
        ['combat', 'مرور نبرد و مهارت‌ها', () => tableViewer('combat')], ['community', 'چت و ارتباطات', () => tableViewer('community')],
        ['playerdata', 'ذخیره‌ها و تعارض‌ها', () => tableViewer('players')], ['audit', 'گزارش اقدامات مدیران', audit]
    ];
    function renderNav() { nav.innerHTML = sections.map(([id, label]) => `<button data-section="${id}">${label}</button>`).join(''); nav.querySelectorAll('button').forEach(b => b.onclick = () => { var _a; nav.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b)); (_a = sections.find(s => s[0] === b.dataset.section)) === null || _a === void 0 ? void 0 : _a[2](); }); nav.querySelector('[data-section="dashboard"]').click(); }
    let ownerPanelOpened = false;
    function openOwnerPanel() {
        launch.style.display = 'none';
        overlay.style.display = 'block';
        if (!ownerPanelOpened) {
            ownerPanelOpened = true;
            renderNav();
        }
    }
    function closeOwnerPanel() {
        // The designated Owner must not be sent back to the public game UI.
        // A close action signs out rather than exposing gameplay under the admin session.
        overlay.style.display = 'none';
        supabase.auth.signOut().catch(e => console.warn('[ETRANOM admin] sign-out failed:', e));
    }
    let verifyInFlight = false;
    let lastVerifyError = null;
    function showOwnerVerificationError(error) {
        const code = (error === null || error === void 0 ? void 0 : error.code) ? ` • ${error.code}` : '';
        const detail = (error === null || error === void 0 ? void 0 : error.message) || String(error || 'خطای نامشخص');
        overlay.style.display = 'block';
        content.innerHTML = `<h3>تأیید پنل مالک ناموفق بود</h3><div class="card danger"><b>حساب مالک شناسایی شد، اما تأیید سمت سرور کامل نشد.</b><p class="muted">${esc(detail)}${esc(code)}</p><p class="muted">بازی را رفرش نکن. ابتدا اتصال و نشست Supabase را دوباره بررسی کن.</p><button id="etr-owner-retry">تلاش دوباره</button><button id="etr-owner-signout">خروج امن</button></div>`;
        content.querySelector('#etr-owner-retry').onclick = () => verify(true);
        content.querySelector('#etr-owner-signout').onclick = () => supabase.auth.signOut().catch(e => console.warn('[ETRANOM admin] sign-out failed:', e));
    }
    async function verify(force = false) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        if (verifyInFlight)
            return;
        verifyInFlight = true;
        try {
            // Step 1: read the local session only to identify whether this is the designated account.
            const initial = await supabase.auth.getSession();
            if (initial === null || initial === void 0 ? void 0 : initial.error)
                throw Object.assign(new Error(initial.error.message || 'خواندن نشست محلی ناموفق بود.'), { stage: 'getSession', cause: initial.error });
            let session = ((_a = initial === null || initial === void 0 ? void 0 : initial.data) === null || _a === void 0 ? void 0 : _a.session) || null;
            if (!session) {
                role = null;
                launch.style.display = 'none';
                overlay.style.display = 'none';
                ownerPanelOpened = false;
                return;
            }
            if (((_b = session.user) === null || _b === void 0 ? void 0 : _b.id) !== OWNER_ID) {
                role = null;
                launch.style.display = 'none';
                overlay.style.display = 'none';
                ownerPanelOpened = false;
                return;
            }
            // Step 2: refresh the JWT so the RPC cannot be evaluated with a stale access token.
            // A refresh failure is reported explicitly; no token is ever rendered or logged.
            const refreshed = await supabase.auth.refreshSession();
            if (refreshed === null || refreshed === void 0 ? void 0 : refreshed.error)
                throw Object.assign(new Error(refreshed.error.message || 'تازه‌سازی نشست ناموفق بود.'), { stage: 'refreshSession', code: refreshed.error.code, cause: refreshed.error });
            session = ((_c = refreshed === null || refreshed === void 0 ? void 0 : refreshed.data) === null || _c === void 0 ? void 0 : _c.session) || null;
            if (!session)
                throw Object.assign(new Error('Supabase نشست تازه‌شده‌ای برنگرداند.'), { stage: 'refreshSession' });
            if (((_d = session.user) === null || _d === void 0 ? void 0 : _d.id) !== OWNER_ID)
                throw Object.assign(new Error(`شناسه نشست پس از تازه‌سازی با Owner مطابقت ندارد: ${((_e = session.user) === null || _e === void 0 ? void 0 : _e.id) || 'خالی'}`), { stage: 'sessionUidMismatch' });
            // Step 3: ask Supabase Auth to validate the access token against the Auth server.
            const verified = await supabase.auth.getUser();
            if (verified === null || verified === void 0 ? void 0 : verified.error)
                throw Object.assign(new Error(verified.error.message || 'اعتبارسنجی کاربر توسط Auth ناموفق بود.'), { stage: 'getUser', code: verified.error.code, cause: verified.error });
            const serverUser = ((_f = verified === null || verified === void 0 ? void 0 : verified.data) === null || _f === void 0 ? void 0 : _f.user) || null;
            if (!serverUser)
                throw Object.assign(new Error('سرور احراز هویت، کاربر معتبری برنگرداند.'), { stage: 'getUser' });
            if (serverUser.id !== OWNER_ID)
                throw Object.assign(new Error(`UID تأییدشده توسط Auth با Owner مطابقت ندارد: ${serverUser.id}`), { stage: 'serverUidMismatch' });
            // Step 4: verify the owner role through the protected database RPC.
            const ctx = await rpc('etranom_admin_context_v1');
            const returnedRole = (_j = (_g = ctx === null || ctx === void 0 ? void 0 : ctx.role) !== null && _g !== void 0 ? _g : (_h = ctx === null || ctx === void 0 ? void 0 : ctx[0]) === null || _h === void 0 ? void 0 : _h.role) !== null && _j !== void 0 ? _j : null;
            if (returnedRole !== 'owner') {
                const safeContext = { role: returnedRole, hasPermissions: !!((ctx === null || ctx === void 0 ? void 0 : ctx.permissions) || ((_k = ctx === null || ctx === void 0 ? void 0 : ctx[0]) === null || _k === void 0 ? void 0 : _k.permissions)), contextType: Array.isArray(ctx) ? 'array' : typeof ctx };
                throw Object.assign(new Error(`Auth کاربر مالک را تأیید کرد، اما RPC نقش owner برنگرداند. پاسخ RPC: ${JSON.stringify(safeContext)}`), { stage: 'ownerContext', rpcRole: returnedRole });
            }
            role = 'owner';
            lastVerifyError = null;
            openOwnerPanel();
        }
        catch (e) {
            role = null;
            lastVerifyError = e;
            console.error('[ETRANOM admin] Owner verification failed:', { stage: (e === null || e === void 0 ? void 0 : e.stage) || 'unknown', code: (e === null || e === void 0 ? void 0 : e.code) || null, message: (e === null || e === void 0 ? void 0 : e.message) || String(e) });
            // Keep the diagnostic visible only after the immutable Owner UID matched locally.
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (((_l = session === null || session === void 0 ? void 0 : session.user) === null || _l === void 0 ? void 0 : _l.id) === OWNER_ID)
                    showOwnerVerificationError(e);
                else {
                    launch.style.display = 'none';
                    overlay.style.display = 'none';
                }
            }
            catch (_) {
                launch.style.display = 'none';
                overlay.style.display = 'none';
            }
        }
        finally {
            verifyInFlight = false;
        }
    }
    launch.onclick = () => { if (role === 'owner')
        openOwnerPanel();
    else if (lastVerifyError)
        showOwnerVerificationError(lastVerifyError); };
    overlay.querySelector('#etr-owner-close').onclick = closeOwnerPanel;
    supabase.auth.onAuthStateChange((event, session) => {
        if (!session) {
            role = null;
            launch.style.display = 'none';
            overlay.style.display = 'none';
            ownerPanelOpened = false;
            lastVerifyError = null;
            return;
        }
        // Defer outside Supabase's auth callback to avoid holding its internal auth lock.
        if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED', 'INITIAL_SESSION'].includes(event))
            setTimeout(() => verify(true), 50);
    });
    // Initial verification runs after the game module has mounted this controller.
    verify(true);
}
