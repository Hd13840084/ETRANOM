import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const sql = fs.readFileSync(path.join(root,'database/admin/etranom_owner_control_v10_server_enforcement_treasury.sql'),'utf8');
test('V2015 party RPCs enforce published policy on server',()=>{
  for (const fn of ['create_party','invite_party_member','respond_party_invite']) assert.match(sql,new RegExp(`function public\\.${fn}\\(`));
  assert.match(sql,/party_enabled/); assert.match(sql,/invites_enabled/); assert.match(sql,/max_members/);
});
test('V2015 PvP challenge and acceptance enforce published policy on server',()=>{
  assert.match(sql,/function public\.etranom_pvp_challenge\(p_target uuid\)/);
  assert.match(sql,/function public\.etranom_pvp_respond\(p_challenge uuid,p_accept boolean\)/);
  assert.match(sql,/pvp_enabled/);
});
test('V2015 treasury ledger is idempotent and transaction-bound',()=>{
  assert.match(sql,/market_transaction_id uuid not null unique/);
  assert.match(sql,/after insert on public\.market_transactions/);
  assert.match(sql,/on conflict\(market_transaction_id\) do nothing/);
  assert.match(sql,/balance=balance\+new\.platform_fee/);
});
test('V2015 restricts direct treasury access and gates snapshot by admin permission',()=>{
  assert.match(sql,/revoke all on public\.etranom_platform_treasury,public\.etranom_platform_treasury_ledger from public,anon,authenticated/);
  assert.match(sql,/etranom_admin_is_authorized_v1\('economy'\)/);
});
