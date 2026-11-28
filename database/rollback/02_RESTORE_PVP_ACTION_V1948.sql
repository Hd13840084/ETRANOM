CREATE OR REPLACE FUNCTION public.etranom_pvp_action(p_match uuid, p_action text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  actor_effects jsonb; effect_row record; effect_key text; effect_json jsonb; actor_maxhp numeric; dot_damage integer:=0;
  shield_state jsonb; shield_hp numeric; shield_reduction numeric:=0; absorbed numeric:=0; reflect_pct numeric:=0; reflect_damage integer:=0; attack_reduction numeric:=0; defense_reduction numeric:=0;
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

  -- Advance actor-owned DOT/status/shield/summon timers once at the start of this turn.
  actor_effects := coalesce(actor_battle->'active_skill_effects','{}'::jsonb);
  hp := greatest(0,coalesce((actor_battle->>'hp')::numeric,0));
  actor_maxhp := greatest(1,coalesce((actor_battle->>'max_hp')::numeric,(actor_char->>'maxHp')::numeric,(actor_char->>'max_hp')::numeric,1));
  for effect_row in select key,value from jsonb_each(actor_effects) loop
    effect_key:=effect_row.key; effect_json:=effect_row.value;
    if greatest(0,coalesce((effect_json->>'turns')::integer,0))<=0 then actor_effects:=actor_effects-effect_key;
    else
      if greatest(0,coalesce((effect_json->>'dotPct')::numeric,0))>0 and hp>0 then
        dot_damage:=least(hp,greatest(1,floor(actor_maxhp*least(50,(effect_json->>'dotPct')::numeric)/100)::integer)); hp:=greatest(0,hp-dot_damage);
      end if;
      effect_json:=jsonb_set(effect_json,'{turns}',to_jsonb(greatest(0,(effect_json->>'turns')::integer-1)),true);
      if coalesce((effect_json->>'turns')::integer,0)<=0 then actor_effects:=actor_effects-effect_key; else actor_effects:=jsonb_set(actor_effects,array[effect_key],effect_json,true); end if;
    end if;
  end loop;
  actor_battle:=jsonb_set(actor_battle,'{active_skill_effects}',actor_effects,true);
  actor_battle:=jsonb_set(actor_battle,'{hp}',to_jsonb(hp),true);
  if jsonb_typeof(actor_battle->'shield')='object' then
    shield_state:=actor_battle->'shield';
    shield_state:=jsonb_set(shield_state,'{turns}',to_jsonb(greatest(0,coalesce((shield_state->>'turns')::integer,0)-1)),true);
    actor_battle:=case when coalesce((shield_state->>'turns')::integer,0)<=0 then actor_battle-'shield' else jsonb_set(actor_battle,'{shield}',shield_state,true) end;
  end if;
  if jsonb_typeof(actor_battle->'summons')='array' then
    actor_effects:='[]'::jsonb;
    for effect_row in select value from jsonb_array_elements(actor_battle->'summons') loop
      effect_json:=jsonb_set(effect_row.value,'{turns}',to_jsonb(greatest(0,coalesce((effect_row.value->>'turns')::integer,0)-1)),true);
      if coalesce((effect_json->>'turns')::integer,0)>0 and coalesce((effect_json->>'hp')::integer,0)>0 then actor_effects:=actor_effects||jsonb_build_array(effect_json); end if;
    end loop;
    actor_battle:=jsonb_set(actor_battle,'{summons}',actor_effects,true);
  end if;
  if hp<=0 and coalesce((actor_battle->>'revive_armed')::boolean,false) then
    hp:=greatest(1,ceil(actor_maxhp*greatest(1,least(100,coalesce((actor_battle->>'revive_hp_pct')::numeric,25)))/100));
    actor_battle:=jsonb_set(actor_battle,'{hp}',to_jsonb(hp),true); actor_battle:=jsonb_set(actor_battle,'{revive_armed}','false'::jsonb,true); actor_battle:=jsonb_set(actor_battle,'{revive_consumed}','true'::jsonb,true);
  end if;
  if hp<=0 then
    actor:=jsonb_set(actor,'{battle}',actor_battle,true);
    if actor_key='player_a' then s:=jsonb_set(s,'{player_a}',actor,true); else s:=jsonb_set(s,'{player_b}',actor,true); end if;
    update public.pvp_matches set combat_state=s,status='completed',winner_id=target_id,completed_at=now_at,updated_at=now_at,last_action_at=now_at,turn_no=turn_no+1,turn_player=null where id=p_match;
    insert into public.pvp_player_stats(user_id,wins,losses,draws) values(target_id,1,0,0),(actor_id,0,1,0) on conflict(user_id) do update set wins=public.pvp_player_stats.wins+excluded.wins,losses=public.pvp_player_stats.losses+excluded.losses,updated_at=now_at;
    return jsonb_build_object('success',true,'status','completed','reason','damage_over_time','winner_id',target_id);
  end if;

  if p_action = 'guard' then
    actor_battle := jsonb_set(actor_battle,'{guard_next}','true'::jsonb,true);
    log_text := coalesce(actor->>'name','بازیکن') || ' حالت دفاعی گرفت.';
  else
    guarded := coalesce((target_battle->>'guard_next')::boolean,false);
    select greatest(-60,least(70,coalesce(max((value->>'attackReductionPct')::numeric),0)-coalesce(max((value->'effects'->>'attackPct')::numeric),0))) into attack_reduction from jsonb_each(coalesce(actor_battle->'active_skill_effects','{}'::jsonb));
    select greatest(0,least(80,coalesce(max((value->>'defenseReductionPct')::numeric),0))) into defense_reduction from jsonb_each(coalesce(target_battle->'active_skill_effects','{}'::jsonb));
    raw_damage := greatest(1,coalesce((public.etranom_combat_resolve_damage(
      greatest(1,coalesce((actor_battle->>'attack')::numeric,10)*(1-attack_reduction/100)),
      greatest(0,coalesce((target_battle->>'defense')::numeric,0)*(1-defense_reduction/100)),
      1,0,3,random(),0.35,case when guarded then 0.5 else 1 end,1,
      100,0,0,100,1.5)->>'damage')::integer,0));
    damage := raw_damage;
    if coalesce((target_battle->>'evade_next')::boolean,false) then damage:=0; target_battle:=jsonb_set(target_battle,'{evade_next}','false'::jsonb,true); end if;
    shield_state:=coalesce(target_battle->'shield','{}'::jsonb);
    shield_hp:=greatest(0,coalesce((shield_state->>'hp')::numeric,0));
    shield_reduction:=greatest(0,least(80,coalesce((shield_state->>'reductionPct')::numeric,0)));
    reflect_pct:=greatest(0,least(80,coalesce((shield_state->>'reflectPct')::numeric,0)));
    if damage>0 and shield_hp>0 and coalesce((shield_state->>'turns')::integer,0)>0 then
      damage:=greatest(0,floor(damage*(1-shield_reduction/100))::integer);
      absorbed:=least(shield_hp,damage); shield_hp:=greatest(0,shield_hp-absorbed); damage:=greatest(0,damage-absorbed);
      shield_state:=jsonb_set(shield_state,'{hp}',to_jsonb(shield_hp),true);
      target_battle:=jsonb_set(target_battle,'{shield}',shield_state,true);
      reflect_damage:=greatest(0,floor(absorbed*reflect_pct/100)::integer);
      if reflect_damage>0 then actor_battle:=jsonb_set(actor_battle,'{hp}',to_jsonb(greatest(0,coalesce((actor_battle->>'hp')::numeric,1)-reflect_damage)),true); end if;
    end if;
    target_hp := greatest(0,coalesce((target_battle->>'hp')::numeric,1)-damage);
    target_max_hp:=greatest(1,coalesce((target_battle->>'max_hp')::numeric,1));
    if target_hp<=0 and coalesce((target_battle->>'revive_armed')::boolean,false) then
      target_hp:=greatest(1,ceil(target_max_hp*greatest(1,least(100,coalesce((target_battle->>'revive_hp_pct')::numeric,25)))/100));
      target_battle:=jsonb_set(target_battle,'{revive_armed}','false'::jsonb,true);
      target_battle:=jsonb_set(target_battle,'{revive_consumed}','true'::jsonb,true);
    end if;
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
  s := jsonb_set(s,'{log}',coalesce(s->'log','[]'::jsonb) || jsonb_build_array(jsonb_build_object('type',p_action,'text',log_text,'damage',damage,'reflected',reflect_damage,'at',now_at)),true);
  s := jsonb_set(s,'{round}',to_jsonb(greatest(1,ceil((m.turn_no+1)::numeric/2)::integer)),true);

  if coalesce((actor_battle->>'hp')::numeric,1)<=0 and coalesce((target_battle->>'hp')::numeric,1)>0 then
    winner:=target_id;
    update public.pvp_matches set combat_state=s,status='completed',winner_id=winner,completed_at=now_at,updated_at=now_at,last_action_at=now_at,turn_no=turn_no+1,turn_player=null where id=p_match;
    insert into public.pvp_player_stats(user_id,wins,losses,draws) values(target_id,1,0,0),(actor_id,0,1,0) on conflict(user_id) do update set wins=public.pvp_player_stats.wins+excluded.wins,losses=public.pvp_player_stats.losses+excluded.losses,updated_at=now_at;
    return jsonb_build_object('success',true,'status','completed','winner_id',winner,'reason','reflected_damage','damage',damage,'reflected',reflect_damage);
  end if;
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
$function$;
