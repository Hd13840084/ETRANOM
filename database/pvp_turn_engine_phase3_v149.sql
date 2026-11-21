-- ETRANOM PvP Phase 3 / v149
-- Server-authoritative alternating turn loop. Clients submit an intent only;
-- damage, guard mitigation, turn ownership and match completion are calculated here.
begin;

create table if not exists public.pvp_player_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  wins bigint not null default 0 check (wins >= 0),
  losses bigint not null default 0 check (losses >= 0),
  draws bigint not null default 0 check (draws >= 0),
  updated_at timestamptz not null default now()
);

create or replace function public.etranom_pvp_action(p_match uuid, p_action text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  m public.pvp_matches%rowtype;
  s jsonb;
  a jsonb;
  b jsonb;
  actor jsonb;
  target jsonb;
  actor_key text;
  target_key text;
  actor_id uuid;
  target_id uuid;
  actor_battle jsonb;
  target_battle jsonb;
  actor_char jsonb;
  target_char jsonb;
  hp numeric;
  max_hp numeric;
  mp numeric;
  max_mp numeric;
  atk numeric;
  def numeric;
  target_hp numeric;
  target_max_hp numeric;
  target_mp numeric;
  target_max_mp numeric;
  target_atk numeric;
  target_def numeric;
  damage integer := 0;
  raw_damage integer := 0;
  guarded boolean := false;
  winner uuid;
  next_player uuid;
  log_text text;
  now_at timestamptz := now();
begin
  if uid is null then raise exception 'auth_required'; end if;
  if p_action not in ('attack','guard') then raise exception 'invalid_action'; end if;

  select * into m from public.pvp_matches
   where id = p_match and uid in (player_a,player_b)
   for update;
  if not found then raise exception 'match_not_found'; end if;
  if m.status <> 'active' then raise exception 'match_not_active'; end if;
  if m.turn_player <> uid then raise exception 'not_your_turn'; end if;

  s := coalesce(m.combat_state,'{}'::jsonb);
  a := coalesce(s->'player_a','{}'::jsonb);
  b := coalesce(s->'player_b','{}'::jsonb);
  if m.player_a = uid then
    actor_key := 'player_a'; target_key := 'player_b'; actor_id := m.player_a; target_id := m.player_b;
    actor := a; target := b;
  else
    actor_key := 'player_b'; target_key := 'player_a'; actor_id := m.player_b; target_id := m.player_a;
    actor := b; target := a;
  end if;

  -- Initialize combat-only values once from the private snapshots. The save itself is
  -- never accepted from the client and remains inaccessible through the public API.
  actor_char := coalesce(actor->'save_snapshot'->'character','{}'::jsonb);
  target_char := coalesce(target->'save_snapshot'->'character','{}'::jsonb);
  if actor_char='{}'::jsonb or target_char='{}'::jsonb then raise exception 'combat_character_data_missing'; end if;
  actor_battle := coalesce(actor->'battle','{}'::jsonb);
  target_battle := coalesce(target->'battle','{}'::jsonb);

  if actor_battle = '{}'::jsonb or target_battle = '{}'::jsonb then
    max_hp := greatest(1,coalesce(nullif(actor_char->>'maxHp','')::numeric,nullif(actor_char->>'max_hp','')::numeric,nullif(actor_char#>>'{stats,maxHp}','')::numeric,nullif(actor_char->>'hp','')::numeric));
    hp := greatest(0,least(max_hp,coalesce(nullif(actor_char->>'hp','')::numeric,max_hp)));
    max_mp := greatest(0,coalesce(nullif(actor_char->>'maxMp','')::numeric,nullif(actor_char->>'max_mp','')::numeric,nullif(actor_char#>>'{stats,maxMp}','')::numeric,nullif(actor_char->>'mp','')::numeric,0));
    mp := greatest(0,least(max_mp,coalesce(nullif(actor_char->>'mp','')::numeric,max_mp)));
    atk := greatest(1,coalesce(nullif(actor_char->>'attack','')::numeric,nullif(actor_char#>>'{stats,attack}','')::numeric,nullif(actor_char->>'strength','')::numeric,nullif(actor_char#>>'{attributes,strength}','')::numeric,10));
    def := greatest(0,coalesce(nullif(actor_char->>'defense','')::numeric,nullif(actor_char#>>'{stats,defense}','')::numeric,nullif(actor_char->>'endurance','')::numeric,nullif(actor_char#>>'{attributes,endurance}','')::numeric,0));
    actor_battle := jsonb_build_object('hp',hp,'max_hp',max_hp,'mp',mp,'max_mp',max_mp,'attack',atk,'defense',def,'guard_next',false);

    max_hp := greatest(1,coalesce(nullif(target_char->>'maxHp','')::numeric,nullif(target_char->>'max_hp','')::numeric,nullif(target_char#>>'{stats,maxHp}','')::numeric,nullif(target_char->>'hp','')::numeric));
    target_hp := greatest(0,least(max_hp,coalesce(nullif(target_char->>'hp','')::numeric,max_hp)));
    max_mp := greatest(0,coalesce(nullif(target_char->>'maxMp','')::numeric,nullif(target_char->>'max_mp','')::numeric,nullif(target_char#>>'{stats,maxMp}','')::numeric,nullif(target_char->>'mp','')::numeric,0));
    target_mp := greatest(0,least(max_mp,coalesce(nullif(target_char->>'mp','')::numeric,max_mp)));
    target_atk := greatest(1,coalesce(nullif(target_char->>'attack','')::numeric,nullif(target_char#>>'{stats,attack}','')::numeric,nullif(target_char->>'strength','')::numeric,nullif(target_char#>>'{attributes,strength}','')::numeric,10));
    target_def := greatest(0,coalesce(nullif(target_char->>'defense','')::numeric,nullif(target_char#>>'{stats,defense}','')::numeric,nullif(target_char->>'endurance','')::numeric,nullif(target_char#>>'{attributes,endurance}','')::numeric,0));
    target_battle := jsonb_build_object('hp',target_hp,'max_hp',max_hp,'mp',target_mp,'max_mp',max_mp,'attack',target_atk,'defense',target_def,'guard_next',false);
  end if;

  if p_action = 'guard' then
    actor_battle := jsonb_set(actor_battle,'{guard_next}','true'::jsonb,true);
    log_text := coalesce(actor->>'name','بازیکن') || ' حالت دفاعی گرفت.';
  else
    guarded := coalesce((target_battle->>'guard_next')::boolean,false);
    raw_damage := greatest(1,round((coalesce((actor_battle->>'attack')::numeric,10) + floor(random()*4)) - coalesce((target_battle->>'defense')::numeric,0)*0.35)::integer);
    damage := greatest(1,case when guarded then ceil(raw_damage*0.5)::integer else raw_damage end);
    target_hp := greatest(0,coalesce((target_battle->>'hp')::numeric,1)-damage);
    target_battle := jsonb_set(target_battle,'{hp}',to_jsonb(target_hp),true);
    target_battle := jsonb_set(target_battle,'{guard_next}','false'::jsonb,true);
    log_text := coalesce(actor->>'name','بازیکن') || ' حمله کرد و ' || damage || ' آسیب وارد کرد.' || case when guarded then ' دفاع حریف نیمی از آسیب را گرفت.' else '' end;
    if actor_key='player_a' then update public.pvp_matches set score_a=score_a+damage where id=p_match;
    else update public.pvp_matches set score_b=score_b+damage where id=p_match; end if;
  end if;

  actor := jsonb_set(actor,'{battle}',actor_battle,true);
  target := jsonb_set(target,'{battle}',target_battle,true);
  if actor_key='player_a' then a:=actor; b:=target; else b:=actor; a:=target; end if;
  s := jsonb_set(s,'{player_a}',a,true);
  s := jsonb_set(s,'{player_b}',b,true);
  s := jsonb_set(s,'{log}',coalesce(s->'log','[]'::jsonb) || jsonb_build_array(jsonb_build_object('type',p_action,'text',log_text,'damage',damage,'at',now_at)),true);
  s := jsonb_set(s,'{round}',to_jsonb(greatest(1,ceil((m.turn_no+1)::numeric/2)::integer)),true);

  if p_action='attack' and coalesce((target_battle->>'hp')::numeric,1)<=0 then
    winner := uid;
    update public.pvp_matches set combat_state=s,status='completed',winner_id=winner,
      completed_at=now_at,updated_at=now_at,last_action_at=now_at,turn_no=turn_no+1,turn_player=null
      where id=p_match;
    insert into public.pvp_player_stats(user_id,wins,losses,draws)
      values(actor_id,1,0,0),(target_id,0,1,0)
      on conflict(user_id) do update set wins=public.pvp_player_stats.wins+excluded.wins,
        losses=public.pvp_player_stats.losses+excluded.losses,updated_at=now_at;
    return jsonb_build_object('success',true,'status','completed','winner_id',winner,'damage',damage,'turn_no',m.turn_no+1);
  end if;

  next_player := target_id;
  update public.pvp_matches set combat_state=s,turn_player=next_player,turn_no=turn_no+1,
    updated_at=now_at,last_action_at=now_at where id=p_match;
  return jsonb_build_object('success',true,'status','active','damage',damage,'turn_player',next_player,'turn_no',m.turn_no+1);
end;
$$;

revoke all on function public.etranom_pvp_action(uuid,text) from public,anon;
grant execute on function public.etranom_pvp_action(uuid,text) to authenticated;

commit;
