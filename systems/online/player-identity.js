// ETRANOM canonical player identity helpers.
// player_profiles is the shared identity source for chat, presence, party, PvP and leaderboards.
export function isSystemPlayerName(value) {
  const name = String(value ?? '').trim();
  return !name || /^(?:wanderer-[a-z0-9]+|مسافر(?:-|_)[a-z0-9]+)$/i.test(name) ||
    /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(name);
}

export function getPlayerDisplayName(profile, fallback = 'بازیکن') {
  const candidates = [profile?.display_name, profile?.username, profile?.character_name, profile?.name];
  for (const candidate of candidates) {
    const name = String(candidate ?? '').trim();
    if (name && !isSystemPlayerName(name)) return name.slice(0, 40);
  }
  return fallback;
}

export async function syncPlayerProfile(supabase, userId, character) {
  if (!supabase || !userId) throw new Error('player_profile_auth_required');
  const name = String(character?.name ?? '').trim().slice(0, 40);
  if (!name || isSystemPlayerName(name)) throw new Error('player_name_required');
  const updatedAt = new Date().toISOString();
  const base = {
    user_id: userId,
    display_name: name,
    username: name,
    player_level: Math.max(1, Math.min(999, Number(character?.level) || 1)),
    player_class: String(character?.archetype || character?.class || 'نامشخص').trim().slice(0, 40),
    updated_at: updatedAt
  };
  let { error } = await supabase.from('player_profiles').upsert(base, { onConflict: 'user_id' });
  // A legacy unique-username collision must not prevent the actual display name from being stored.
  if (error?.code === '23505') {
    const fallback = { ...base, username: `etranom_${String(userId).replace(/-/g, '').slice(0, 16)}` };
    ({ error } = await supabase.from('player_profiles').upsert(fallback, { onConflict: 'user_id' }));
  }
  if (error) throw error;
  return { success: true, display_name: name, username: name };
}
