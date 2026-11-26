import { getSafeZoneInteriorDesignV2046 } from './interior-designs-v2046.js?build=2081';
/* ETRANOM V2036 — walkable isometric safe-zone interiors. */
export const INTERIOR_GRID_V2036 = Object.freeze({ cols: 11, rows: 9, start: Object.freeze({ x: 5, y: 7 }) });
const BASE_BLOCKS = [[2, 2], [8, 2], [2, 4], [8, 4], [3, 6]];
const NPC_SPOTS = [[5, 2], [3, 4], [7, 4], [5, 5]];
const PROP_ICONS = ['▤', '⚒', '♜', '✧', '▥', '♨', '⌂', '⚙'];
// NPC work loops are visual-only: no stock, service, reward, quest or item logic is added.
const NPC_WORK_V2093 = Object.freeze({
  online_player_market:['بررسی دفتر معاملات','ledger'], pvp_hall:['مرتب‌کردن دفتر داوری','ledger'], inn:['پاک‌کردن پیشخوان','wipe'], smith:['کوبیدن آهن روی سندان','hammer'], guild:['بررسی نقشه‌ها','map'], alchemy:['هم‌زدن محلول آزمایش','stir'], enchanter_shop:['حکاکی نشانه‌های جادویی','scribe'], clinic:['مرتب‌کردن ابزار درمان','care'], guardhouse:['دیده‌بانی و بررسی نقشه','guard'], fire_temple:['مراقبت از آتشدان','tend'], stable:['رسیدگی به اصطبل','care'], granary:['بررسی کیسه‌های غله','ledger'], grain_mill:['چرخاندن سنگ آسیاب','turn'], grain_bakery:['آماده‌کردن خمیر','knead'], grain_farmstead:['ثبت وضعیت کشتزار','scribe'], grain_herbgarden:['رسیدگی به گیاهان','care'], grain_livestock:['رسیدگی به آخور','care'], rootwood_sawmill:['اندازه‌گیری الوار','saw'], rootwood_carpenter:['رنده‌کردن چوب','saw'], rootwood_herbalist:['آسیاب‌کردن گیاهان','stir'], rootwood_hunters:['بررسی نقشه شکار','map'], rootwood_apiary:['بازرسی کندوها','care'], iron_mine:['بررسی ریل معدن','hammer'], iron_smelter:['کنترل کوره ذوب','tend'], iron_stonecutter:['تراشیدن سنگ','hammer'], iron_hall:['ثبت نوبت‌کاری معدن','ledger'], iron_cartwright:['تعمیر چرخ گاری','hammer']
});
const NPC_WORK_GLYPHS_V2093 = Object.freeze({ledger:'▤',wipe:'⌁',hammer:'⚒',map:'⌖',stir:'✧',scribe:'✎',care:'✦',guard:'♜',tend:'♨',turn:'◉',knead:'✿',saw:'⌁'});
// V2101 authored interior art: deterministic room/NPC sprite assignment; visual-only.
const INTERIOR_ROOM_V2101 = Object.freeze({online_player_market:1,pvp_hall:2,inn:3,smith:4,guild:5,alchemy:6,enchanter_shop:7,clinic:8,guardhouse:9,fire_temple:10,stable:11,granary:12,grain_mill:13,grain_bakery:14,grain_farmstead:15,grain_herbgarden:16,grain_livestock:11,rootwood_sawmill:13,rootwood_carpenter:4,rootwood_herbalist:6,rootwood_hunters:5,rootwood_apiary:15,iron_mine:9,iron_smelter:4,iron_stonecutter:13,iron_hall:2,iron_cartwright:14});
// V2103: denser, role-specific authored SVG furnishing silhouettes; visual-only.
function interiorDressingV2108(buildingId, xy, escape) {
    let seed = 2166136261; for (const ch of String(buildingId || 'room')) seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619) >>> 0;
    const kind = /smith|smelter|stonecutter|cartwright/.test(buildingId) ? 'forge'
      : /alchemy|enchanter|herbalist|herbgarden|clinic/.test(buildingId) ? 'arcane'
      : /grain|farm|bakery|mill|apiary|stable|livestock/.test(buildingId) ? 'harvest'
      : /mine|hall/.test(buildingId) ? 'mine'
      : /guild|market|pvp|guard|inn/.test(buildingId) ? 'civic' : 'wood';
    const names = {
      forge:['anvil','tool-rack','coal-brazier','metal-crate','hanging-chain','tongs'],
      arcane:['potion-shelf','crystal-lamp','herb-planter','rune-desk','scroll-rack','crystal-stand'],
      harvest:['produce-basket','oil-lamp','herb-pot','grain-sack','farm-tools','storage-barrel'],
      mine:['miner-helmets','mine-lantern','ore-sample','rail-tools','mineral-crate','rope-pulley'],
      civic:['document-shelf','wall-lamp','guild-banner','registry-desk','lockbox','wall-map'],
      wood:['bookcase','wall-sconce','stone-planter','hunting-map','wood-chest','woven-basket']
    };
    const labels = names[kind];
    // Keep furnishing on the room perimeter: the central walking lane and four worker stations stay clear.
    const positions = [[1,1],[5,0],[9,1],[0,4],[10,4],[1,7],[9,7],[3,0],[7,0],[0,6],[10,6],[5,8]];
    return positions.map(([gx,gy],i)=>({gx,gy,i})).sort((a,b)=>(a.gx+a.gy)-(b.gx+b.gy) || a.gx-b.gx).map(({gx,gy,i})=>{
      const [x,y]=xy(gx,gy), index=(i+(seed>>>3))%labels.length, name=labels[index];
      const src=`./assets/safe-zone/interiors-v2101/props/${kind}_${String(index+1).padStart(2,'0')}_${name}.svg`;
      const scale = [0.78,0.86,0.72,0.9,0.76,0.82][(seed+i)%6];
      const w=64*scale,h=64*scale;
      return { depth: gx+gy, markup:`<g class="v2108-interior-prop interior-prop-${kind}" data-interior-sprite="${kind}/${name}" data-room-detail="${i}" data-room-detail-v="2108" data-grid-x="${gx}" data-grid-y="${gy}"><image href="${src}" x="${x-w/2}" y="${y-h+9}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/><title>${escape(name.replaceAll('-',' '))}</title></g>`};
    }).sort((a,b)=>a.depth-b.depth).map(item=>item.markup).join('');
}
function npcSpriteIndexV2101(buildingId,i){let h=0;for(const ch of String(buildingId||''))h=(h*31+ch.charCodeAt(0))>>>0;return (h+i*7)%22+1;}
export function interiorObstaclesV2036(buildingId = '') {
    const design = getSafeZoneInteriorDesignV2046(buildingId);
    return ((design === null || design === void 0 ? void 0 : design.spots) || BASE_BLOCKS.map(([x, y]) => ({ x, y }))).map(p => ({ x: p.x, y: p.y }));
}
export function moveInteriorPlayerV2036(player, direction, buildingId = '') {
    var _a, _b;
    const p = { x: Number((_a = player === null || player === void 0 ? void 0 : player.x) !== null && _a !== void 0 ? _a : 5), y: Number((_b = player === null || player === void 0 ? void 0 : player.y) !== null && _b !== void 0 ? _b : 7) };
    const delta = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[direction];
    if (!delta)
        return { player: p, moved: false, reason: 'invalid_direction' };
    const next = { x: p.x + delta[0], y: p.y + delta[1] };
    if (next.x < 0 || next.x >= INTERIOR_GRID_V2036.cols || next.y < 0 || next.y >= INTERIOR_GRID_V2036.rows)
        return { player: p, moved: false, reason: 'wall' };
    if (interiorObstaclesV2036(buildingId).some(o => o.x === next.x && o.y === next.y))
        return { player: p, moved: false, reason: 'obstacle' };
    return { player: next, moved: true, reason: null };
}
export function interiorNpcNearV2036(player, index = 0) { const spot = NPC_SPOTS[index % NPC_SPOTS.length]; return Math.abs(player.x - spot[0]) + Math.abs(player.y - spot[1]) <= 2; }
export function renderIsometricInteriorV2036({ buildingId, title, room, ambience, light = 'warm', props = [], residents = [], player = { x: 5, y: 7 }, escape = s => String(s !== null && s !== void 0 ? s : '') }) {
    var _a, _b;
    const px = Number((_a = player.x) !== null && _a !== void 0 ? _a : 5), py = Number((_b = player.y) !== null && _b !== void 0 ? _b : 7), xy = (x, y) => [360 + (x - y) * 27, 82 + (x + y) * 14];
    const floor = [[0, 0], [10, 0], [10, 8], [0, 8]].map(([x, y]) => xy(x, y).join(',')).join(' ');
    const design = getSafeZoneInteriorDesignV2046(buildingId), spots = interiorObstaclesV2036(buildingId);
    const blocks = spots.slice(0, Math.min(spots.length, Math.max(5, props.length))).map((o, i) => { const [x, y] = xy(o.x, o.y), label = String(props[i] || 'وسیله محیط'), kind = ((design === null || design === void 0 ? void 0 : design.accent) || 'room'); const icon = PROP_ICONS[(i + Object.keys({ market: 0, arena: 1, hearth: 2, forge: 3, guild: 4, alchemy: 5, arcane: 6, healing: 7, guard: 0, shrine: 1, stable: 2, grain: 3, mill: 4, bakery: 5, home: 6, garden: 7, barn: 0, sawmill: 1, carpentry: 2, herbal: 3, hunter: 4, apiary: 5, mine: 6, smelter: 7, stonework: 0, hall: 1, cartwright: 2 })[kind] || 0) % PROP_ICONS.length]; const detail = kind === 'forge' || kind === 'smelter' ? `<path d="M${x-12} ${y-8}h24v13h-24z" fill="#34272a" stroke="#d18a48" stroke-width="2"/><path d="M${x-7} ${y+2}q7-15 14 0" fill="#ff9c42" opacity=".9"/><path d="M${x-15} ${y-13}h30" stroke="#b8a18a" stroke-width="3"/>` : kind === 'alchemy' || kind === 'healing' || kind === 'herbal' ? `<path d="M${x-8} ${y-15}h16l-2 8 7 12q-1 6-18 0l7-12z" fill="#5d9b77" stroke="#c6dfae" stroke-width="1.5"/><path d="M${x-4} ${y-3}h8" stroke="#e9d68e" stroke-width="2"/>` : kind === 'market' || kind === 'bakery' ? `<path d="M${x-17} ${y-13}h34l-5-9h-24z" fill="#9c493d" stroke="#e3bd80" stroke-width="1.5"/><path d="M${x-12} ${y-13}v7m12-7v7m12-7v7" stroke="#f1d49b" stroke-width="2"/>` : `<path d="M${x-13} ${y-13}h26v10h-26z" fill="#b18a54" stroke="#ead1a3" stroke-width="1.5"/><path d="M${x-9} ${y-10}h18m-18 4h18" stroke="#60452e" stroke-width="1.5"/>`; return `<g class="iso-prop prop-${i} prop-${kind}" data-furniture-index="${i}"><ellipse class="prop-shadow" cx="${x}" cy="${y + 15}" rx="25" ry="9"/><polygon class="prop-top" points="${x},${y - 21} ${x + 22},${y - 10} ${x},${y + 2} ${x - 22},${y - 10}"/><polygon class="prop-left" points="${x - 22},${y - 10} ${x},${y + 2} ${x},${y + 22} ${x - 22},${y + 10}"/><polygon class="prop-right" points="${x},${y + 2} ${x + 22},${y - 10} ${x + 22},${y + 10} ${x},${y + 22}"/>${detail}<path d="M${x-17} ${y+9}l17 9 17-9" fill="none" stroke="#e5c18a" stroke-width="1.2" opacity=".75"/><text x="${x}" y="${y + 6}">${icon}</text><text class="iso-prop-label" x="${x}" y="${y + 36}">${escape(label.slice(0, 15))}</text><title>${escape(label)} — ${escape(kind)}</title></g>`; }).join('');
    const work = NPC_WORK_V2093[buildingId] || ['انجام کارهای روزمره','ledger'];
    const npcs = residents.map((n, i) => {
        const [x, y] = xy(...NPC_SPOTS[i % NPC_SPOTS.length]);
        const near = interiorNpcNearV2036(player, i);
        const palette = [
            { robe: '#58404a', trim: '#c69b63', cloth: '#302b38', hair: '#30252a', belt: '#a87943' },
            { robe: '#40534d', trim: '#c6b17c', cloth: '#28363a', hair: '#4a3025', belt: '#8d6841' },
            { robe: '#51466a', trim: '#b89bd0', cloth: '#29263d', hair: '#26232a', belt: '#9a784e' },
            { robe: '#66513a', trim: '#d0b078', cloth: '#3d3028', hair: '#443026', belt: '#a16d3d' }
        ][i % 4];
        const activity = work[0], action = work[1], glyph = NPC_WORK_GLYPHS_V2093[action] || '✦';
        const toolX = x + (i % 2 ? 17 : -17), toolY = y - 1;
        const apron = ['hammer','knead','saw','stir','tend'].includes(action)
            ? `<path d="M${x-7} ${y+5}l14 0 3 13-10 5-10-5z" fill="${palette.cloth}" stroke="${palette.trim}" stroke-width="1.1"/><path d="M${x-5} ${y+9}h10" stroke="${palette.trim}" stroke-width=".8"/>` : '';
        const headwear = action === 'guard' ? `<path d="M${x-9} ${y-12}l9-7 9 7-2 3h-14z" fill="#777d82" stroke="${palette.trim}" stroke-width="1.2"/><path d="M${x} ${y-18}v7" stroke="${palette.trim}" stroke-width="1.5"/>`
            : ['hammer','saw','knead'].includes(action) ? `<path d="M${x-9} ${y-12}q9-9 18 0l-2 3h-14z" fill="#40302b" stroke="${palette.trim}" stroke-width="1"/>` : '';
        const tool = action === 'hammer' ? `<path d="M${toolX-4} ${toolY-8}l8 11m-12-13h13l-1 5h-12z" stroke="#c8b69a" stroke-width="2.4" fill="#777d82" stroke-linejoin="round"/>`
            : action === 'saw' ? `<path d="M${toolX-7} ${toolY-5}l14 0-2 4-2-2-2 2-2-2-2 2z" fill="#aeb6b8" stroke="#443b36" stroke-width="1"/>`
            : action === 'stir' || action === 'tend' ? `<path d="M${toolX} ${toolY-11}v15m-4-2q4 4 8 0" stroke="#d7c49b" stroke-width="1.8" fill="none"/>`
            : action === 'map' || action === 'ledger' ? `<path d="M${toolX-7} ${toolY-8}l7-3 7 3v12l-7-3-7 3z" fill="#8d704d" stroke="#e0c58f" stroke-width="1"/><path d="M${toolX} ${toolY-10}v12" stroke="#e0c58f" stroke-width=".8"/>`
            : `<path d="M${toolX-5} ${toolY-5}q5-8 10 0v8h-10z" fill="#b18b56" stroke="#e2c38c" stroke-width="1"/>`;
        return `<g class="iso-npc npc-work-${action} ${near ? 'is-near' : ''}" data-interior-npc-marker="${escape(n.id)}" data-interior-npc-talk="${escape(n.id)}">
            <ellipse class="npc-shadow" cx="${x}" cy="${y+18}" rx="14" ry="5"/>
            <path class="npc-cloak" d="M${x-8} ${y-1}q-5 7-8 20l7 5 9-3 9 3 7-5q-3-13-8-20z" fill="${palette.robe}" stroke="${palette.trim}" stroke-width="1.35"/>
            <path d="M${x-5} ${y+2}l5 8 5-8m-5 8v11" fill="none" stroke="${palette.trim}" stroke-width="1.25"/>
            ${apron}
            <path d="M${x-7} ${y+17}l-3 7m13-7 3 7" stroke="#302b2a" stroke-width="3.2" stroke-linecap="round"/>
            <path d="M${x-10} ${y+24}h6m4 0h7" stroke="#b49a78" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M${x-7} ${y-11}q7-8 14 0l-1 10q-6 6-12 0z" fill="#c58e67" stroke="#392a29" stroke-width="1.2"/>
            <path d="M${x-6} ${y-6}q2-2 4 0m4 0q2-2 4 0" fill="none" stroke="#35231f" stroke-width="1.1"/>
            <path d="M${x-7} ${y-10}q7-10 14 0l-2 2h-10z" fill="${palette.hair}"/>
            ${headwear}
            <path d="M${x-7} ${y+1}q-8 2-10 8" fill="none" stroke="${palette.robe}" stroke-width="5" stroke-linecap="round"/>
            <g class="npc-working-arm"><path d="M${x+6} ${y+2}q8 2 10 8" fill="none" stroke="#c58e67" stroke-width="3.6" stroke-linecap="round"/><path d="M${x+5} ${y+2}q8 2 10 8" fill="none" stroke="${palette.robe}" stroke-width="5.2" stroke-linecap="round"/></g>
            <g class="npc-tool">${tool}</g>
            <path d="M${x-8} ${y+2}l-3 5m19-5 3 5" stroke="${palette.trim}" stroke-width="1" opacity=".9"/>
            <text class="npc-name" x="${x}" y="${y-27}">${escape(n.name)}</text>
            <text class="npc-task" x="${x}" y="${y+37}">${escape(activity)}</text><image class="npc-authored-sprite npc-sprite-work-${action} npc-sprite-action-${action}" href="./assets/safe-zone/interiors-v2101/npcs/npc_${String(npcSpriteIndexV2101(buildingId,i)).padStart(2, '0')}.png" x="${x-22}" y="${y-32}" width="44" height="62" preserveAspectRatio="xMidYMax meet"/>
        </g>`;
    }).join('');
    const [x, y] = xy(px, py);
    return `<div class="iso-interior-wrap iso-interior-detail-v2070 theme-${escape(light)}"><div class="iso-interior-heading"><b>${escape(title || 'فضای داخلی')}</b><small>${escape(room || 'اتاق')}</small></div><svg class="iso-interior" viewBox="0 0 720 360" role="img" aria-label="نمای داخلی تزئینی ${escape(title)}"><defs><pattern id="isoTiles" width="54" height="28" patternUnits="userSpaceOnUse"><path d="M27 0L54 14L27 28L0 14Z" fill="none" stroke="#8d7658" stroke-width=".8" opacity=".5"/><path d="M0 14h54M27 0v28" stroke="#c1a77c" stroke-width=".35" opacity=".28"/></pattern><pattern id="isoStone" width="36" height="24" patternUnits="userSpaceOnUse"><path d="M0 1h36M0 12h18m8 0h10M8 1v11m20 0v12" stroke="#c0a27b" stroke-width="1" opacity=".25" fill="none"/></pattern><linearGradient id="isoWall" x2="0" y2="1"><stop stop-color="#65564a"/><stop offset="1" stop-color="#29252a"/></linearGradient></defs><polygon class="iso-wall-back" points="90,58 360,8 630,58 360,108"/><polygon points="90,58 360,8 630,58 360,108" fill="url(#isoStone)" opacity=".8"/><path d="M105 60L360 13L615 60M110 92L360 137L610 92" stroke="#b99b70" stroke-width="2" opacity=".35" fill="none"/><g class="iso-windows"><path d="M180 49L214 34L248 49L214 64Z M472 49L506 34L540 49L506 64Z"/><path d="M214 34V64 M506 34V64"/></g><polygon class="iso-wall-left" points="90,58 360,108 360,155 90,105"/><polygon points="90,58 360,108 360,155 90,105" fill="url(#isoStone)" opacity=".55"/><polygon class="iso-wall-right" points="360,108 630,58 630,105 360,155"/><polygon points="360,108 630,58 630,105 360,155" fill="url(#isoStone)" opacity=".55"/><path d="M90 105L360 155L630 105" stroke="#d0b184" stroke-width="3" opacity=".35" fill="none"/><polygon class="iso-floor" points="${floor}"/><polygon points="${floor}" fill="url(#isoTiles)"/><image class="iso-interior-authored-room" href="./assets/safe-zone/interiors-v2114/rooms/${escape(buildingId)}.svg" x="118" y="78" width="484" height="214" preserveAspectRatio="xMidYMid meet" opacity=".78"/><path d="M90 170L360 310L630 170" stroke="#d0b184" stroke-width="2" opacity=".18" fill="none"/><polygon class="iso-room-rug rug-${escape((design === null || design === void 0 ? void 0 : design.rug) || 'runner')}" points="${xy(3, 3).join(',')} ${xy(7, 3).join(',')} ${xy(7, 5).join(',')} ${xy(3, 5).join(',')}"/><g class="iso-wall-emblem emblem-${escape((design === null || design === void 0 ? void 0 : design.wallFeature) || 'room')}"><circle cx="360" cy="52" r="17"/><text x="360" y="58">${escape(((design === null || design === void 0 ? void 0 : design.accent) || '✦').slice(0, 1).toUpperCase())}</text></g><g class="interior-wall-sconces"><path d="M150 74v18m-7-17h14m-7-7q-8 7 0 12q8-5 0-12M570 74v18m-7-17h14m-7-7q-8 7 0 12q8-5 0-12" stroke="#b99560" stroke-width="2" fill="#ffb84e"/><circle cx="150" cy="80" r="13" fill="#ffad45" opacity=".12"/><circle cx="570" cy="80" r="13" fill="#ffad45" opacity=".12"/></g><g class="interior-wall-banners"><path d="M270 25v34l12 8 12-8V25zM426 25v34l12 8 12-8V25z" fill="#713d45" stroke="#d0ad70" stroke-width="1.6"/><path d="M282 32l0 17m156-17v17" stroke="#e4c58a" stroke-width="2"/></g><g class="interior-floor-details"><path d="M180 230l36 18m-28-28 36 18M505 230l-36 18m28-28-36 18" stroke="#b99b70" stroke-width="1.4" opacity=".28"/><circle cx="360" cy="260" r="22" fill="none" stroke="#b99b70" stroke-width="1.2" opacity=".25"/><circle cx="360" cy="260" r="15" fill="none" stroke="#b99b70" stroke-width=".8" opacity=".2"/></g><g class="iso-room-architecture"><path d="M112 73L142 79L142 119L112 113ZM578 79L608 73L608 113L578 119Z" fill="#25232a" stroke="#a88b60" stroke-width="2"/><path d="M120 78l14 3v25l-14-3zm466 3 14-3v25l-14 3z" fill="#8fb0ad" opacity=".48"/><path d="M155 91L360 128L565 91" stroke="#d1b17c" stroke-width="2" opacity=".28" fill="none"/><path d="M105 145L360 193L615 145" stroke="#d1b17c" stroke-width="2" opacity=".22" fill="none"/></g><g class="v2108-room-sprite-layer interior-sprite-dressing">${interiorDressingV2108(buildingId,xy,escape)}</g><g class="iso-furniture">${blocks}</g><g class="iso-interior-residents" data-resident-count="${residents.length}">${npcs}</g><g class="iso-door"><path d="M330 175L360 160L390 175V221L360 238L330 221Z"/><path d="M340 178L360 168L380 178V216L360 228L340 216Z"/><circle cx="376" cy="201" r="2"/></g><text class="iso-ambience" x="360" y="282">${escape(ambience || '')}</text></svg></div>`;
}
