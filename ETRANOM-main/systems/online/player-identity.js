// ETRANOM canonical player identity helpers.
// player_profiles is the shared identity source for chat, presence, party, PvP and leaderboards.
export function isSystemPlayerName(value) {
    const name = String(value !== null && value !== void 0 ? value : '').trim();
    return !name || /^(?:wanderer-[a-z0-9]+|مسافر(?:-|_)[a-z0-9]+)$/i.test(name) ||
        /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(name);
}
export function getPlayerDisplayName(profile, fallback = 'بازیکن') {
    const candidates = [profile === null || profile === void 0 ? void 0 : profile.display_name, profile === null || profile === void 0 ? void 0 : profile.username, profile === null || profile === void 0 ? void 0 : profile.character_name, profile === null || profile === void 0 ? void 0 : profile.name];
    for (const candidate of candidates) {
        const name = String(candidate !== null && candidate !== void 0 ? candidate : '').trim();
        if (name && !isSystemPlayerName(name))
            return name.slice(0, 40);
    }
    return fallback;
}
export async function syncPlayerProfile(supabase, userId, character) {
    var _a;
    if (!supabase || !userId)
        throw new Error('player_profile_auth_required');
    const name = String((_a = character === null || character === void 0 ? void 0 : character.name) !== null && _a !== void 0 ? _a : '').trim().slice(0, 40);
    if (!name || isSystemPlayerName(name))
        throw new Error('player_name_required');
    const updatedAt = new Date().toISOString();
    const base = {
        user_id: userId,
        display_name: name,
        username: name,
        player_level: Math.max(1, Math.min(999, Number(character === null || character === void 0 ? void 0 : character.level) || 1)),
        player_class: String((character === null || character === void 0 ? void 0 : character.archetype) || (character === null || character === void 0 ? void 0 : character.class) || 'نامشخص').trim().slice(0, 40),
        updated_at: updatedAt
    };
    let { error } = await supabase.from('player_profiles').upsert(base, { onConflict: 'user_id' });
    // A legacy unique-username collision must not prevent the actual display name from being stored.
    if ((error === null || error === void 0 ? void 0 : error.code) === '23505') {
        const fallback = { ...base, username: `etranom_${String(userId).replace(/-/g, '').slice(0, 16)}` };
        ({ error } = await supabase.from('player_profiles').upsert(fallback, { onConflict: 'user_id' }));
    }
    if (error)
        throw error;
    return { success: true, display_name: name, username: name };
}
