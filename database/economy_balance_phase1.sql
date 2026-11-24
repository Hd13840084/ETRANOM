-- ETRANOM Economy Balance Phase 1
-- Scales personal party-battle coin rewards to the same level-based inn cost curve.
-- Run after party_battle_engine_phase5.sql.
begin;

create or replace function public.etranom_party_battle_act(p_session_id uuid,p_action text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid:=auth.uid(); v_party uuid; v_state public.party_battle_state%rowtype;
  v_count integer; v_done integer; v_level integer; v_damage integer:=0; v_hp integer; v_new_hp integer;
  v_player_hp jsonb; v_guard jsonb; v_monsters jsonb; v_item jsonb; v_monster jsonb;
  v_idx integer; v_ord integer; v_kills jsonb; v_materials jsonb; v_recipe text; v_class text;
  v_xp integer; v_coins integer; v_reward_level integer; v_rest_cost numeric; v_coin_share numeric; m record;
begin
  if uid is null then raise exception 'auth_required'; end if;
  if p_action not in ('attack','guard','heal') then raise exception 'battle_action_invalid'; end if;
  select s.party_id into v_party from public.party_sessions s join public.party_members pm on pm.party_id=s.party_id and pm.user_id=uid
    where s.id=p_session_id and s.status='active';
  if v_party is null then raise exception 'battle_not_available'; end if;
  select * into v_state from public.party_battle_state where session_id=p_session_id for update;
  if v_state.status<>'active' then raise exception 'battle_already_finished'; end if;
  if exists(select 1 from public.party_battle_actions where session_id=p_session_id and round_no=v_state.round_no and user_id=uid) then raise exception 'already_acted_this_round'; end if;
  select greatest(1,least(999,coalesce(player_level,1))) into v_level from public.player_profiles where user_id=uid;
  v_level:=coalesce(v_level,1); v_player_hp:=v_state.player_hp; v_guard:=v_state.player_guard; v_monsters:=v_state.monsters; v_kills:=v_state.kills_by_user;
  v_hp:=coalesce((v_player_hp->>uid::text)::integer,0); if v_hp<=0 then raise exception 'player_defeated'; end if;
  if p_action='attack' then
    v_damage:=10+v_level*2;
    v_idx:=null;
    for v_item,v_ord in select x,ord::integer from jsonb_array_elements(v_monsters) with ordinality as q(x,ord) loop
      if coalesce((v_item->>'hp')::integer,0)>0 then v_idx:=v_ord; v_monster:=v_item; exit; end if;
    end loop;
    if v_idx is null then raise exception 'all_party_monsters_defeated'; end if;
    v_new_hp:=greatest(0,(v_monster->>'hp')::integer-v_damage);
    v_monster:=jsonb_set(v_monster,'{hp}',to_jsonb(v_new_hp),true);
    v_monsters:=jsonb_set(v_monsters,array[(v_idx-1)::text],v_monster,true);
    if v_new_hp=0 then
      v_kills:=jsonb_set(v_kills,array[uid::text],to_jsonb(coalesce((v_kills->>uid::text)::integer,0)+1),true);
      v_materials:='[]'::jsonb;
      for v_item in select value from jsonb_array_elements(coalesce(v_monster->'material_ids','[]'::jsonb)) loop
        if random()<0.5 then v_materials:=v_materials||jsonb_build_array(jsonb_build_object('id',v_item#>>'{}','qty',1)); end if;
      end loop;
      v_class:=coalesce((select coalesce(to_jsonb(pp)->>'player_class',to_jsonb(pp)->>'archetype') from public.player_profiles pp where pp.user_id=uid),'جنگجو');
      v_recipe:=null;
      select r.id into v_recipe from public.etranom_content_recipes r
       where r.region_id=v_state.region_id and r.class_name=v_class
       order by random() limit 1;
      if v_recipe is not null and random()*100 >= coalesce((select drop_chance from public.etranom_content_recipes where id=v_recipe),0) then v_recipe:=null; end if;
      v_xp:=case when v_monster->>'kind'='normal' then 20 else 100 end;
      v_reward_level:=greatest(1,least(100,v_level));
      v_rest_cost:=5*power(3::numeric,v_reward_level-1);
      v_coin_share:=case when v_monster->>'kind' in ('area_boss','boss') then 2.5
                         when v_monster->>'kind' in ('mini_boss','miniboss') then 0.8 else 0.2 end;
      v_coins:=greatest(1,least(2147483647,round(v_rest_cost*v_coin_share)::bigint)::integer);
      insert into public.party_battle_kill_ledger(session_id,monster_index,monster_id,user_id,material_drops,recipe_id,xp,coins)
       values(p_session_id,v_idx,v_monster->>'id',uid,v_materials,v_recipe,v_xp,v_coins)
       on conflict(session_id,monster_index) do nothing;
      insert into public.party_battle_reward_ledger(session_id,user_id,xp,coins,materials)
       values(p_session_id,uid,v_xp,v_coins,v_materials)
       on conflict(session_id,user_id) do update set xp=public.party_battle_reward_ledger.xp+excluded.xp,
        coins=public.party_battle_reward_ledger.coins+excluded.coins,
        materials=public.party_battle_reward_ledger.materials||excluded.materials;
    end if;
  elsif p_action='guard' then v_guard:=v_guard||jsonb_build_object(uid::text,true);
  else v_new_hp:=least(100+v_level*12,v_hp+25); v_player_hp:=v_player_hp||jsonb_build_object(uid::text,v_new_hp);
  end if;
  insert into public.party_battle_actions(session_id,round_no,user_id,action,damage) values(p_session_id,v_state.round_no,uid,p_action,v_damage);
  select count(*) into v_count from jsonb_each_text(v_player_hp) e where e.value::integer>0;
  select count(*) into v_done from public.party_battle_actions a where a.session_id=p_session_id and a.round_no=v_state.round_no
    and coalesce((v_player_hp->>a.user_id::text)::integer,0)>0;
  if not exists(select 1 from jsonb_array_elements(v_monsters) as e(value) where coalesce((e.value->>'hp')::integer,0)>0) then
    v_state.status:='victory'; v_state.completed_at:=now();
  elsif v_done>=v_count then
    for m in select pm.user_id from public.party_members pm where pm.party_id=v_party loop
      v_hp:=coalesce((v_player_hp->>m.user_id::text)::integer,0);
      if v_hp>0 then
        if coalesce((v_guard->>m.user_id::text)::boolean,false) then v_new_hp:=greatest(0,v_hp-(8+v_state.round_no));
        else v_new_hp:=greatest(0,v_hp-(16+v_state.round_no*2)); end if;
        v_player_hp:=v_player_hp||jsonb_build_object(m.user_id::text,v_new_hp);
      end if;
    end loop;
    if not exists(select 1 from jsonb_each_text(v_player_hp) e where e.value::integer>0) then v_state.status:='defeat'; v_state.completed_at:=now();
    else v_state.round_no:=v_state.round_no+1; v_guard:='{}'::jsonb; end if;
  end if;
  update public.party_battle_state set monsters=v_monsters,kills_by_user=v_kills,
    monster_hp=(select coalesce(sum((e.value->>'hp')::integer),0) from jsonb_array_elements(v_monsters) as e(value)),
    round_no=v_state.round_no,status=v_state.status,player_hp=v_player_hp,player_guard=v_guard,
    updated_at=now(),completed_at=v_state.completed_at where session_id=p_session_id;
  if v_state.status in ('victory','defeat') then
    update public.party_sessions set status='completed',finished_at=now() where id=p_session_id and status='active';
    update public.parties set status='forming',region_id=null,updated_at=now() where id=v_party;
    update public.party_members set is_ready=false where party_id=v_party;
  end if;
  return public.etranom_party_battle_snapshot(p_session_id);
end $$;


 grant execute on function public.etranom_party_battle_act(uuid,text) to authenticated;
commit;
