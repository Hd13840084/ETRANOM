// ETRANOM V2155 — Stage 15: Environmental Interaction Runtime.
// Stateful, save-compatible interactions for authored doors, world props and vehicles.
// Persistent interaction definitions; Stage 22 connects vehicle control to the live physics runtime.
import { ETRANOM_ENTRANCE_SYSTEM_V2145 } from '../safe-zone/entrance-system-v2145.js?v=2145';
import { ENVIRONMENTAL_PROPS_V2147 } from '../safe-zone/environmental-props-v2147.js?v=2147';
import { ETRANOM_VEHICLE_SYSTEM_V2149 } from './vehicle-system-v2149.js?v=2149';

const VERSION = 2155;
const MAX_LOG = 80;
const PROP_NAMES = Object.freeze({
  'notice_board.png': 'تابلوی اعلانات شهر',
  'lantern_post.png': 'فانوس محیطی',
  'wayside_shrine.png': 'زیارتگاه کنارراه',
  'market_cart.png': 'گاری بازار',
  'rain_barrel.png': 'بشکه جمع‌آوری آب باران',
  'stone_water_trough.png': 'آبشخور سنگی',
  'firewood_rack.png': 'قفسه هیزم',
  'root_stump.png': 'کنده درخت',
  'mushrooms_crystals_02.png': 'قارچ‌ها و بلورهای جنگلی',
  'mushrooms_crystals_04.png': 'قارچ‌ها و بلورهای جنگلی',
  'mushrooms_crystals_05.png': 'قارچ‌ها و بلورهای جنگلی',
  'mushrooms_crystals_09.png': 'قارچ‌ها و بلورهای جنگلی'
});
const VEHICLE_NAMES = Object.freeze({
  handcart_empty: 'چرخ‌دستی', covered_merchant_wagon: 'ارابه باربری سرپوشیده',
  enclosed_coach: 'درشکه سرپوشیده', mine_ore_cart: 'واگن سنگ معدن',
  farm_hay_wagon: 'ارابه علوفه', river_cargo_boat: 'قایق باربری رودخانه',
  market_cart: 'گاری بازار', grain_cart: 'گاری غله'
});
const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
};
const finite = value => Number.isFinite(Number(value));
const copy = value => JSON.parse(JSON.stringify(value));

export function buildEnvironmentInteractionCatalogV2155(buildingPOIs = []) {
  const rows = [];
  for (const poi of Array.isArray(buildingPOIs) ? buildingPOIs : []) {
    if (!poi?.id || !ETRANOM_ENTRANCE_SYSTEM_V2145[poi.id] || !finite(poi.x) || !finite(poi.y)) continue;
    rows.push({
      id: `building:${poi.id}:door`, sourceId: poi.id, kind: 'building-door', category: 'building',
      name: poi.name || 'ساختمان', x: Number(poi.x), y: Number(poi.y), width: Number(poi.w) || 160,
      interactRange: 185, actions: ['toggle-door', 'enter'],
      description: 'در ورودی به فضای داخلی همین ساختمان متصل است. پنجره‌ها مسیر عبور نیستند.'
    });
  }
  for (const prop of ENVIRONMENTAL_PROPS_V2147.placements) {
    const id = `prop:${prop.asset}:${prop.x}:${prop.y}`;
    const category = prop.category;
    const actions = category === 'light' ? ['toggle-light', 'inspect']
      : prop.asset === 'notice_board.png' ? ['read', 'inspect']
      : prop.asset === 'wayside_shrine.png' ? ['activate', 'inspect']
      : ['inspect'];
    rows.push({
      id, sourceId: prop.asset, kind: 'environment-prop', category,
      name: PROP_NAMES[prop.asset] || (category === 'landmark' ? 'نشان محیطی' : 'شیء محیطی'),
      x: Number(prop.x), y: Number(prop.y), width: Number(prop.width) || 60,
      interactRange: Math.max(78, Number(prop.width) * .82 || 78), actions,
      region: prop.region, description: describeProp(prop)
    });
  }
  for (const vehicle of ETRANOM_VEHICLE_SYSTEM_V2149.placements) {
    rows.push({
      id: `vehicle:${vehicle.id}`, sourceId: vehicle.id, kind: 'vehicle', category: 'transport',
      name: VEHICLE_NAMES[vehicle.asset] || 'وسیله نقلیه', x: Number(vehicle.x), y: Number(vehicle.y),
      width: Number(vehicle.width) || 90, interactRange: 135, actions: ['inspect'],
      region: vehicle.region, state: vehicle.state, asset: vehicle.asset, description: vehicle.state === 'moored'
        ? 'قایق روی مسیر آبراهه قابل هدایت است؛ بدنه آن با مرز آبراهه و برخوردهای محیطی کنترل می‌شود.'
        : 'وسیله نقلیه قابل هدایت است؛ شتاب، فرمان، ترمز، اصطکاک سطح و برخورد بدنه فعال است.'
    });
  }
  return freeze(rows.map(row => ({ ...row, actions: [...row.actions] })));
}

function describeProp(prop) {
  if (prop.asset === 'notice_board.png') return 'اعلان‌های محلی و خبرهای ثبت‌شده در شهر را بخوان.';
  if (prop.asset === 'lantern_post.png') return 'چراغ را روشن یا خاموش کن؛ نور آن در نمای جهان بازتاب داده می‌شود.';
  if (prop.asset === 'wayside_shrine.png') return 'زیارتگاه را فعال کن تا بازدید تو در وضعیت محیط ثبت شود؛ پاداش یا اثر مبارزه‌ای ندارد.';
  if (prop.asset === 'market_cart.png') return 'گاری باربری را بررسی کن؛ برای وسایل نقلیه کنترل‌پذیر از تعامل وسیله استفاده کن.';
  if (prop.category === 'utility') return 'این وسیله بخشی از زیرساخت روزمره آبادی است و فعلاً برای مشاهده و بررسی در دسترس است.';
  if (prop.category === 'landmark') return 'این نشان، یکی از نقاط شاخص محیط است.';
  return `شیء محیطی در محدوده ${prop.region}؛ بررسی جزئیات آن ثبت می‌شود.`;
}

function ensureRuntimeState(gameState) {
  if (!gameState || typeof gameState !== 'object') throw new TypeError('A mutable game state object is required.');
  let state = gameState.environmentInteractions;
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    state = { schemaVersion: 1, revision: 0, entities: {}, log: [] };
    gameState.environmentInteractions = state;
  }
  if (!state.entities || typeof state.entities !== 'object' || Array.isArray(state.entities)) state.entities = {};
  if (!Array.isArray(state.log)) state.log = [];
  state.schemaVersion = 1;
  state.revision = Math.max(0, Number(state.revision) || 0);
  return state;
}

function entityState(runtime, definition) {
  const initial = definition.kind === 'building-door' ? { doorOpen: false, interactionCount: 0 }
    : definition.category === 'light' ? { lit: true, interactionCount: 0 }
    : definition.sourceId === 'wayside_shrine.png' ? { activated: false, activationCount: 0, interactionCount: 0 }
    : { interactionCount: 0 };
  const current = runtime.entities[definition.id];
  if (!current || typeof current !== 'object' || Array.isArray(current)) runtime.entities[definition.id] = { ...initial };
  else runtime.entities[definition.id] = { ...initial, ...current };
  return runtime.entities[definition.id];
}

export function getEnvironmentEntityStateV2155(gameState, entityId) {
  const runtime = ensureRuntimeState(gameState);
  let definition = ETRANOM_ENVIRONMENT_INTERACTION_BY_ID_V2155.get(String(entityId));
  if (!definition) {
    const match = /^building:([^:]+):door$/.exec(String(entityId));
    if (match && ETRANOM_ENTRANCE_SYSTEM_V2145[match[1]]) definition = { id: String(entityId), kind: 'building-door', name: match[1] };
  }
  if (!definition) return null;
  return copy(entityState(runtime, definition));
}

export function getBuildingDoorVisualStateV2155(gameState, buildingId, now = Date.now()) {
  const id = `building:${buildingId}:door`;
  const door = getEnvironmentEntityStateV2155(gameState, id);
  if (!door) return Object.freeze({ open: false, angleRadians: 0 });
  const transition = door.transition;
  let angle = door.doorOpen ? 1.02 : 0;
  if (transition && finite(transition.startedAt) && finite(transition.from) && finite(transition.to)) {
    const progress = Math.max(0, Math.min(1, (Number(now) - Number(transition.startedAt)) / Math.max(1, Number(transition.durationMs) || 320)));
    const eased = progress * progress * (3 - 2 * progress);
    angle = Number(transition.from) + (Number(transition.to) - Number(transition.from)) * eased;
    if (progress >= 1) angle = Number(transition.to);
  }
  return Object.freeze({ open: !!door.doorOpen, angleRadians: angle });
}

export function executeEnvironmentInteractionV2155(gameState, catalog, entityId, action, options = {}) {
  const id = String(entityId || ''), command = String(action || '');
  const definition = (Array.isArray(catalog) ? catalog : ETRANOM_ENVIRONMENT_INTERACTION_CATALOG_V2155).find(item => item.id === id);
  if (!definition) return Object.freeze({ ok: false, changed: false, code: 'unknown-entity', message: 'این هدف تعاملی در فهرست محیط ثبت نشده است.' });
  if (!definition.actions.includes(command)) return Object.freeze({ ok: false, changed: false, code: 'action-not-supported', message: 'این عمل برای این شیء تعریف نشده است.' });
  const runtime = ensureRuntimeState(gameState);
  const current = entityState(runtime, definition);
  const now = finite(options.now) ? Number(options.now) : Date.now();
  let changed = false, enterBuilding = false, message = '';

  if (definition.kind === 'building-door') {
    if (command === 'enter') {
      if (!current.doorOpen) {
        const from = current.transition?.to ?? (current.doorOpen ? 1.02 : 0);
        current.doorOpen = true;
        current.transition = { from, to: 1.02, startedAt: now, durationMs: 320 };
        changed = true;
      }
      current.lastEnteredAt = now;
      enterBuilding = true;
      message = `درِ ${definition.name} باز شد؛ وارد فضای داخلی شدی.`;
    } else {
      const nextOpen = !current.doorOpen;
      const from = current.transition?.to ?? (current.doorOpen ? 1.02 : 0);
      current.doorOpen = nextOpen;
      current.transition = { from, to: nextOpen ? 1.02 : 0, startedAt: now, durationMs: 320 };
      changed = true;
      message = nextOpen ? `درِ ${definition.name} باز شد.` : `درِ ${definition.name} بسته شد.`;
    }
  } else if (definition.category === 'light' && command === 'toggle-light') {
    current.lit = !current.lit;
    changed = true;
    message = current.lit ? `${definition.name} روشن شد.` : `${definition.name} خاموش شد.`;
  } else if (definition.sourceId === 'notice_board.png' && command === 'read') {
    current.readCount = Math.max(0, Number(current.readCount) || 0) + 1;
    current.lastReadAt = now;
    changed = true;
    message = 'تابلوی اعلانات: «مسافران، مسیرهای اصلی را پیش از تاریکی بررسی کنید. فانوس‌های کنارراه برای راهنمایی روشن نگه داشته شده‌اند. در آبادی‌های ریشه‌چوب و سنگ‌آهن، ابزارهای کارگاه را بدون اجازه جابه‌جا نکنید.»';
  } else if (definition.sourceId === 'wayside_shrine.png' && command === 'activate') {
    current.activated = true;
    current.activationCount = Math.max(0, Number(current.activationCount) || 0) + 1;
    changed = true;
    message = 'زیارتگاه را با احترام فعال کردی؛ بازدید در سابقه محیط ثبت شد. این عمل پاداش یا اثر مبارزه‌ای ایجاد نمی‌کند.';
  } else {
    message = definition.description;
  }

  current.interactionCount = Math.max(0, Number(current.interactionCount) || 0) + 1;
  current.lastInteractedAt = now;
  runtime.revision += 1;
  runtime.log.push({ id, action: command, at: now, changed });
  if (runtime.log.length > MAX_LOG) runtime.log.splice(0, runtime.log.length - MAX_LOG);
  return Object.freeze({ ok: true, changed, enterBuilding, entityId: id, message, revision: runtime.revision, entityState: copy(current) });
}

export function auditEnvironmentInteractionV2155(catalog = ETRANOM_ENVIRONMENT_INTERACTION_CATALOG_V2155) {
  const errors = [], ids = new Set();
  for (const row of catalog) {
    if (ids.has(row.id)) errors.push(`duplicate-interaction-id:${row.id}`);
    ids.add(row.id);
    if (![row.x, row.y, row.width, row.interactRange].every(finite) || !(row.width > 0 && row.interactRange > 0)) errors.push(`invalid-interaction-transform:${row.id}`);
    if (!Array.isArray(row.actions) || !row.actions.length) errors.push(`missing-actions:${row.id}`);
  }
  return Object.freeze({ ok: errors.length === 0, version: VERSION, entities: catalog.length,
    buildingDoors: catalog.filter(x => x.kind === 'building-door').length,
    environmentProps: catalog.filter(x => x.kind === 'environment-prop').length,
    vehicles: catalog.filter(x => x.kind === 'vehicle').length,
    lightControls: catalog.filter(x => x.actions.includes('toggle-light')).length,
    noticeBoards: catalog.filter(x => x.actions.includes('read')).length,
    errors: Object.freeze(errors) });
}

export function drawInteractionLightingV2155(ctx, gameState, catalog, camX = 0, camY = 0, hour = 12, minute = 0, time = 0) {
  if (!ctx?.save || !ctx?.restore || !ctx?.createRadialGradient || !ctx?.fillRect) return Object.freeze({ ok: false, lit: 0 });
  const runtime = ensureRuntimeState(gameState);
  const h = Number(hour || 0) + Number(minute || 0) / 60;
  const night = h >= 20 || h < 5 ? 1 : h >= 18 ? (h - 18) / 2 : h >= 5 && h < 7 ? (7 - h) / 2 : 0;
  if (night <= 0) return Object.freeze({ ok: true, lit: 0 });
  let lit = 0;
  ctx.save();
  for (const row of catalog.filter(item => item.actions.includes('toggle-light'))) {
    const state = entityState(runtime, row);
    if (!state.lit || row.x < camX - 60 || row.x > camX + 780 || row.y < camY - 60 || row.y > camY + 710) continue;
    const pulse = .94 + .06 * Math.sin(Number(time) / 410 + row.x * .013);
    const radius = 50 + 4 * pulse;
    const glow = ctx.createRadialGradient(row.x, row.y - 12, 1, row.x, row.y - 12, radius);
    glow.addColorStop(0, `rgba(255,190,105,${(.18 * night * pulse).toFixed(3)})`);
    glow.addColorStop(.38, `rgba(255,164,82,${(.08 * night * pulse).toFixed(3)})`);
    glow.addColorStop(1, 'rgba(255,145,65,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(row.x - radius, row.y - radius - 12, radius * 2, radius * 2);
    lit++;
  }
  ctx.restore();
  return Object.freeze({ ok: true, lit });
}

export const ETRANOM_ENVIRONMENT_INTERACTION_CATALOG_V2155 = buildEnvironmentInteractionCatalogV2155([]);
export const ETRANOM_ENVIRONMENT_INTERACTION_VERSION_V2155 = VERSION;
export const ETRANOM_ENVIRONMENT_INTERACTION_BY_ID_V2155 = new Map(ETRANOM_ENVIRONMENT_INTERACTION_CATALOG_V2155.map(row => [row.id, row]));

if (typeof window !== 'undefined') {
  window.ETRANOM_ENVIRONMENT_INTERACTION_VERSION_V2155 = VERSION;
  window.ETRANOM_EXECUTE_ENVIRONMENT_INTERACTION_V2155 = executeEnvironmentInteractionV2155;
  window.ETRANOM_AUDIT_ENVIRONMENT_INTERACTION_V2155 = auditEnvironmentInteractionV2155;
}
