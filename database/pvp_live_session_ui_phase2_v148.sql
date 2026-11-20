-- ETRANOM PvP Phase 2 / v148
-- Live match monitor + privacy hardening for participant-only reads.
begin;

-- Match rows must never be visible to unrelated authenticated players.
drop policy if exists pvp_matches_read on public.pvp_matches;
drop policy if exists pvp_matches_participant_read on public.pvp_matches;
create policy pvp_matches_participant_read on public.pvp_matches
  for select to authenticated
  using (auth.uid() in (player_a, player_b));
revoke all on public.pvp_matches from anon;
grant select on public.pvp_matches to authenticated;

-- Return only combat-relevant save fields. Never expose quests, gold, journals,
-- private flags, location history, or unrelated save data to the opponent.
create or replace function public.etranom_pvp_match_snapshot(p_match uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  uid uuid := auth.uid();
  m public.pvp_matches%rowtype;
  state jsonb;
  sa jsonb;
  sb jsonb;
begin
  if uid is null then raise exception 'auth_required'; end if;
  select * into m from public.pvp_matches
    where id=p_match and auth.uid() in(player_a,player_b);
  if not found then raise exception 'match_not_found'; end if;

  sa := coalesce(m.combat_state->'player_a'->'save_snapshot','{}'::jsonb);
  sb := coalesce(m.combat_state->'player_b'->'save_snapshot','{}'::jsonb);
  state := coalesce(m.combat_state,'{}'::jsonb);
  state := jsonb_set(state,'{player_a}',
    (coalesce(state->'player_a','{}'::jsonb) - 'save_snapshot') ||
    jsonb_build_object('save_snapshot',jsonb_build_object(
      'character',sa->'character','equipment',sa->'equipment',
      'inventory',sa->'inventory','classProgress',sa->'classProgress')),
    true);
  state := jsonb_set(state,'{player_b}',
    (coalesce(state->'player_b','{}'::jsonb) - 'save_snapshot') ||
    jsonb_build_object('save_snapshot',jsonb_build_object(
      'character',sb->'character','equipment',sb->'equipment',
      'inventory',sb->'inventory','classProgress',sb->'classProgress')),
    true);

  return jsonb_build_object('id',m.id,'status',m.status,
    'player_a',m.player_a,'player_b',m.player_b,'winner_id',m.winner_id,
    'turn_player',m.turn_player,'turn_no',m.turn_no,'combat_state',state,
    'created_at',m.created_at,'updated_at',m.updated_at,'completed_at',m.completed_at);
end $$;

revoke all on function public.etranom_pvp_match_snapshot(uuid) from public,anon;
grant execute on function public.etranom_pvp_match_snapshot(uuid) to authenticated;

commit;
