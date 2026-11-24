import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const party = read('database/reference/etranom_party_battle_act_live_snapshot_v1921.sql');
const partyWarrior = read('database/party_warrior_rpc_integration_v1907.sql');
const pvp = read('database/ETRANOM_V1921_WIZARD_PVP_LIVE_BRIDGE.sql');
const pvpSkill = pvp.slice(pvp.indexOf('create or replace function public.etranom_pvp_skill_action'), pvp.indexOf('-- Preserve attack/guard compatibility'));

function has(source, pattern) { return pattern.test(source); }

export function runV1944ServerContractAudit() {
  const checks = [
    { id: 'party-membership', area: 'Party', pass: has(party, /join public\.party_members pm[\s\S]{0,180}pm\.user_id=uid/) },
    { id: 'party-row-lock', area: 'Party', pass: has(party, /from public\.party_battle_state where session_id=p_session_id for update/i) },
    { id: 'party-round-replay-guard', area: 'Party', pass: has(party, /already_acted_this_round/) },
    { id: 'party-atomic-action-ledger', area: 'Party', pass: has(party, /insert into public\.party_battle_actions\(session_id,round_no,user_id,action,damage\)/i) },
    { id: 'party-warrior-specialization-routing', area: 'Party', pass: ['warrior_sword_ascetic','warrior_iron_bastion','warrior_chaos_warrior','warrior_apocalypse_harbinger'].every(x => partyWarrior.includes(x)) },
    { id: 'party-warrior-stamina-cost', area: 'Party', pass: has(partyWarrior, /if v_is_warrior then if v_stamina<v_stamina_cost then raise exception 'insufficient_stamina'/) },
    { id: 'party-warrior-physical-scaling', area: 'Party', pass: has(partyWarrior, /if v_is_warrior then v_skill_power:=greatest\(1,attack_power\)/) },
    { id: 'pvp-membership-and-row-lock', area: 'PvP', pass: has(pvpSkill, /where id=p_match and uid in \(player_a,player_b\) for update/i) },
    { id: 'pvp-turn-ownership', area: 'PvP', pass: has(pvpSkill, /if m\.turn_player<>uid then raise exception 'not_your_turn'/) },
    { id: 'pvp-private-snapshot', area: 'PvP', pass: has(pvpSkill, /actor->'save_snapshot'->'character'/) },
    { id: 'pvp-trusted-skill-catalog', area: 'PvP', pass: has(pvpSkill, /from public\.party_battle_skill_catalog where specialization_key=spec_key and skill_id=p_skill_id and enabled/) },
    { id: 'pvp-warrior-specialization-routing', area: 'PvP', pass: ['warrior_sword_ascetic','warrior_iron_bastion','warrior_chaos_warrior','warrior_apocalypse_harbinger'].every(x => pvpSkill.includes(x)) },
    { id: 'pvp-warrior-class-allowance', area: 'PvP', pass: has(pvpSkill, /not in \('wizard','جادوگر','warrior','جنگجو'\)/) },
    { id: 'pvp-warrior-stamina-accounting', area: 'PvP', pass: has(pvpSkill, /staminaCost/) },
  ];
  const partyChecks = checks.filter(x => x.area === 'Party');
  const pvpChecks = checks.filter(x => x.area === 'PvP');
  return {
    version: '1944.0.0', checks,
    party: { passed: partyChecks.filter(x => x.pass).length, total: partyChecks.length },
    pvp: { passed: pvpChecks.filter(x => x.pass).length, total: pvpChecks.length },
    warriorPvpSupported: pvpChecks.filter(x => x.id.startsWith('pvp-warrior')).every(x => x.pass),
    transactionGuards: {
      partyRowLock: checks.find(x => x.id === 'party-row-lock').pass,
      partyDuplicateActionGuard: checks.find(x => x.id === 'party-round-replay-guard').pass,
      pvpRowLock: checks.find(x => x.id === 'pvp-membership-and-row-lock').pass,
      pvpTurnGuard: checks.find(x => x.id === 'pvp-turn-ownership').pass
    }
  };
}
