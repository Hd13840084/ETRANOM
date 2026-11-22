import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const sql = read('database/party_group_battle_tactical_retreat_v1644.sql');
const ui = read('systems/party/party-ui.js');
const combat = read('systems/party/party-combat.js');

test('retreat records are durable, unique per player and protected by RLS', () => {
  assert.match(sql, /create table if not exists public\.party_battle_retreats/i);
  assert.match(sql, /primary key\(session_id,user_id\)/i);
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /revoke all on public\.party_battle_retreats from public,anon,authenticated/i);
});

test('snapshot exposes retreat status and never marks a retreated player connected', () => {
  assert.match(sql, /'retreated',exists\(select 1 from public\.party_battle_retreats/i);
  assert.match(sql, /'connected',not exists\(select 1 from public\.party_battle_retreats/i);
});

test('heartbeat cannot reactivate a retreated player', () => {
  assert.match(sql, /if exists\(select 1 from public\.party_battle_retreats r where r\.session_id=p_session_id and r\.user_id=uid\) then\s+return jsonb_build_object\('ok',false,'retreated',true\)/i);
});

test('retreat is accepted even after the player already acted this round', () => {
  assert.match(sql, /action_name not in \('attack','skill','guard','heal','potion','retreat'\)/i);
  assert.match(sql, /action_name<>'retreat' and exists\(select 1 from public\.party_battle_actions/i);
  assert.match(sql, /on conflict\(session_id,round_no,user_id\) do update set action=excluded\.action,damage=0/i);
});

test('retreated members are excluded from turn barriers and enemy damage', () => {
  assert.ok((sql.match(/not exists\(select 1 from public\.party_battle_retreats r where r\.session_id=p_session_id/g) || []).length >= 5);
  assert.match(sql, /elsif alive_count=0 then\s+st\.status:='defeat'/i);
});

test('retreat persists the current player HP and MP without resetting inventory or gold', () => {
  assert.match(sql, /if action_name='retreat' then\s+select gs\.save_data into v_save_data/i);
  assert.match(sql, /'\{character,hp\}'/);
  assert.match(sql, /'\{character,mp\}'/);
});

test('battle UI displays an individual tactical retreat control outside the four main actions', () => {
  assert.match(ui, /data-party-retreat/);
  assert.match(ui, /عقب‌نشینی تاکتیکی/);
  assert.match(ui, /selfRetreated/);
  assert.match(ui, /submitBattleAction\('retreat', null\)/);
});

test('retreat confirmation warns that the player cannot rejoin the same battle', () => {
  assert.match(ui, /پس از عقب‌نشینی نمی‌توانی به همین نبرد برگردی/);
});

test('combat layer provides a readable error for a repeated retreat', () => {
  assert.match(combat, /party_player_already_retreated/);
  assert.match(combat, /امکان بازگشت به همین نبرد وجود ندارد/);
});
