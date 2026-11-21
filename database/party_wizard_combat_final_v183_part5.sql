-- ETRANOM v183 Party RPC fragment; run in listed order.
begin;
create table if not exists public.etranom_v183_rpc_staging(part integer primary key,fragment text not null);
alter table public.etranom_v183_rpc_staging enable row level security;
revoke all on public.etranom_v183_rpc_staging from public,anon,authenticated;
insert into public.etranom_v183_rpc_staging(part,fragment) values (5,$v183_5$     kills:=jsonb_set(kills,array[uid::text],to_jsonb(coalesce((kills->>uid::text)::integer,0)+1),true);
      for drop_item in select value from jsonb_array_elements(coalesce(monster->'material_ids','[]'::jsonb)) loop
        if random()<0.5 then material_drops:=material_drops||jsonb_build_array(jsonb_build_object('id',drop_item#>>'{}','qty',1)); end if;
      end loop;
      monster_level:=greatest(1,least(5,coalesce((monster->>'level')::integer,1)));
      case monster_level when 1 then min_coins:=10;max_coins:=15; when 2 then min_coins:=100;max_coins:=200;
        when 3 then min_coins:=400;max_coins:=600; when 4 then min_coins:=1000;max_coins:=1800; else min_coins:=3000;max_coins:=5000; end case;
      q:=greatest(0,least(1,(coalesce((monster->>'max_hp')::numeric,100)+4*coalesce((monster->>'attack')::numeric,10))/greatest(1,monster_level*500)::numeric));
      coins:=round((min_coins+floor((max_coins-min_coins+1)*least(.999999,random()*.65+.35*q))::integer)*1.20)::integer;
      v_class:=coalesce(nullif(profile->>'class',''),'جنگجو'); -- retained for backward-compatible profile parsing; recipe access is public.
      v_recipe:=null; v_recipe_rarity:=null; v_recipe_chance:=null;
      select r.id,d.rarity,case when d.rarity='اسطوره‌ای' then 2 else d.drop_chance end
        into v_recipe,v_recipe_rarity,v_recipe_chance
        from public.etranom_content_recipes r
        join public.etranom_recipe_drop_catalog d on d.recipe_id=r.id
       where d.region_id=st.region_id
         and d.source_id=coalesce(monster->>'id','')
         and d.source_type in ('monster','dungeon_boss','tower_boss')
         and (d.rarity<>'اسطوره‌ای' or d.source_id='rootbound_region_boss')
       order by random() limit 1;
      if v_recipe is not null and random()*100 >= coalesce(v_recipe_chance,0) then v_recipe:=null; end if;
      select gs.save_data into v_save_data from public.game_saves gs where gs.user_id=uid for update;
      if v_save_data is null then raise exception 'player_save_missing_for_party_reward'; end if;
      inventory:=case when jsonb_typeof(v_save_data->'inventory')='array' then v_save_data->'inventory' else '[]'::jsonb end;
      for drop_item in select value from jsonb_array_elements(material_drops) loop
        found_potion:=false; next_inventory:='[]'::jsonb;
        for item in select value from jsonb_array_elements(inventory) loop
          if item->>'id'=drop_item->>'id' and not found_potion then
            next_inventory:=next_inventory||jsonb_set(item,'{qty}',to_jsonb(coalesce(nullif(item->>'qty','')::integer,1)+coalesce((drop_item->>'qty')::integer,1)),true); found_potion:=true;
          else next_inventory:=next_inventory||jsonb_build_array(item); end if;
        end loop;
        if not found_potion then next_inventory:=next_inventory||jsonb_build_array(jsonb_build_object('id',drop_item->>'id','name',drop_item->>'id','qty',1,'category','material')); end if;
        inventory:=next_inventory;
      end loop;
      -- XP is taken from the encounter record when present; 15 remains the
      -- compatibility fallback for older encounter payloads.
      xp_gain:=public.etranom_monster_xp_from_hp(monster);
      -- Insert the unique kill row BEFORE mutating the persistent save. The
      -- transaction and unique key together make all rewards idempotent.
      insert into public.party_battle_kill_ledger(session_id,monster_index,monster_id,user_id,material_drops,recipe_id,xp,coins)
        values(p_session_id,idx,coalesce(monster->>'id','monster'),uid,material_drops,v_recipe,xp_gain,coins)
        on conflict(session_id,monster_index) do nothing;
      get diagnostics v_ledger_rows = row_count;
      if v_ledger_rows = 1 then
        v_save_data:=jsonb_set(jsonb_set(v_save_data,'{gold}',to_jsonb(coalesce(nullif(v_save_data->>'gold','')::bigint,0)+coins),true),'{inventory}',inventory,true);
        v_save_data:=jsonb_set(v_save_data,'{character,xp}',to_jsonb(coalesce(nullif(v_save_data#>>'{character,xp}','')::bigint,0)+xp_gain),true);
        if v_recipe is not null then
          if jsonb_typeof(v_save_data->'knownRecipes')<>'array' or v_save_data->'knownRecipes' is null then
            v_save_data:=jsonb_set(v_save_data,'{knownRecipes}','[]'::jsonb,true);
          end if;
          if not (v_save_data->'knownRecipes' @> jsonb_build_array(v_recipe)) then
            v_save_data:=jsonb_set(v_save_data,'{knownRecipes}',(v_save_data->'knownRecipes')||jsonb_build_array(v_recipe),true);
          end if;
        end if;
        update public.game_saves gs set save_data=jsonb_set(v_save_data,'{updatedAt}',to_jsonb(now()::text),true),updated_at=now() where gs.user_id=uid;
        insert into public.party_battle_reward_ledger(session_id,user_id,xp,coins,materials)
          values(p_session_id,uid,xp_gain,coins,material_drops)
          on conflict(session_id,user_id) do update set xp=public.party_battle_reward_ledger.xp+excluded.xp,
            coins=public.party_battle_reward_ledger.coins+excluded.coins,materials=public.party_battle_reward_ledger.materials||excluded.materials;
      end if;
    end loop;
  elsif action_name='guard' then
    guards:=guards||jsonb_build_object(uid::text,true);
  elsif action_name='heal' then
    newhp:=least(maxhp,hp+greatest(20,floor(maxhp*.20)::integer)); hpmap:=hpmap||jsonb_build_object(uid::text,newhp);
  elsif action_name='potion' then
    select gs.save_data into v_save_data from public.game_saves gs where gs.user_id=uid for update;
    if v_save_data is null then raise exception 'player_save_missing'; end if;
    inventory:=case when jsonb_typeof(v_save_data->'inventory')='array' then v_save_data->'inventory' else '[]'::jsonb end;
    next_inventory:='[]'::jsonb;
    for item in select value from jsonb_array_elements(inventory) loop
      if not found_potion and coalesce((item->>'qty')::integer,0)>0 and coalesce(item->>'effect','') in ('hp','mp','regen') then
        potion_effect:=item->>'effect'; potion_power:=greatest(1,coalesce((item->>'power')::integer,50));
        if (potion_effect='mp' and mp>=maxmp) or (potion_effect<>'mp' and hp>=maxhp) then raise exception 'party_resource_already_full'; end if;
        found_potion:=true;
        if potion_effect='mp' then mp:=least(maxmp,mp+potion_power); else hpmap:=hpmap||jsonb_build_object(uid::text,least(maxhp,hp+case when potion_effect='regen' then potion_power*3 else potion_power end)); end if;
        if coalesce((item->>'qty')::integer,1)>1 then next_inventory:=next_inventory||jsonb_build_array(jsonb_set(item,'{qty}',to_jsonb((item->>'qty')::integer-1),true)); end if;
      else next_inventory:=next_inventory||jsonb_build_array(item); end if;
    end loop;
    if not found_potion then raise exception 'party_potion_unavailable'; end if;
    update public.game_saves gs set save_data=jsonb_set(v_save_data,'{inventory}',next_inventory,true),updated_at=now() where gs.user_id=uid;
  elsif action_name='retreat' then
    insert into public.party_battle_retreats(session_id,user_id)
      values(p_session_id,uid) on conflict(session_id,user_id) do nothing;
    update public.party_battle_presence
      set last_seen_at=now()-interval '2 days'
      where session_id=p_session_id and user_id=uid;
  end if;

  if v_wizard_progress_loaded or (v_skill_id is not null and v_spec_key is not null) then
    profile:=jsonb_set(profile,'{party_wizard_progress}',v_wizard_progress,true);
    select gs.save_data into v_save_data from public.game_saves gs where gs.user_id=uid for update;
    if v_save_data is not null then v_save_data:=jsonb_set(v_save_data,array['classProgress',v_spec_key],v_wizard_progress,true); update public.game_saves gs set save_data=jsonb_set(v_save_data,'{updatedAt}',to_jsonb(now()::text),true),updated_at=now() where gs.user_id=uid; end if;
  end if;
  profile:=jsonb_set(profile,'{mp}',to_jsonb(mp),true);
  profiles:=profiles||jsonb_build_object(uid::text,profile);
  insert into public.party_battle_actions(session_id,round_no,user_id,action,damage)
    values(p_session_id,st.round_no,uid,coalesce(v_action_label,action_name),damage)
    on conflict(session_id,round_no,user_id) do update set action=excluded.action,damage=0;
  -- Only current party members participate in the turn barrier. A member who
  -- leaves or disconnects cannot keep the remaining group waiting forever.
  select count(*) into alive_count
    from public.party_members pm
    where pm.party_id=v_party
      and coalesce((hpmap->>pm.user_id::text)::integer,0)>0
      and not exists(select 1 from public.party_battle_retreats r where r.session_id=p_session_id and r.user_id=pm.user_id)
      and exists(select 1 from public.party_battle_presence bp where bp.session_id=p_session_id and bp.user_id=pm.user_id and bp.last_seen_at>now()-interval '45 seconds');
  select count(*) into done_count
    from public.party_battle_actions a
    where a.session_id=p_session_id and a.round_no=st.round_no
      and exists(select 1 from public.party_members pm
        where pm.party_id=v_party and pm.user_id=a.user_id)
      and coalesce((hpmap->>a.user_id::text)::integer,0)>0
      and not exists(select 1 from public.party_battle_retreats r where r.session_id=p_session_id and r.user_id=a.user_id)
      and exists(select 1 from public.party_battle_presence bp where bp.session_id=p_session_id and bp.user_id=a.user_id and bp.last_seen_at>now()-interval '45 seconds');

  if not exists(select 1 from jsonb_array_elements(monsters) e(value) where coalesce((e.value->>'hp')::integer,0)>0) then
    st.status:='victory'; st.completed_at:=now();
  elsif alive_count=0 then
    st.status:='defeat'; st.completed_at:=now();
  elsif done_count>=alive_count then
    -- Tick monster DOT/debuffs once per completed group round; persisted on the battle state.
    for target_row in select q.x,q.ord::integer as ord from jsonb_array_elements(monsters) with ordinality q(x,ord) where coalesce((q.x->>'hp')::integer,0)>0 loop
      v_statuses:=coalesce(target_row.x->'statuses','{}'::jsonb);
      for status_row in select key,value from jsonb_each(v_statuses) loop
        v_status_data:=status_row.value;
        if coalesce((v_status_data->>'turns')::integer,0)>0 and coalesce((v_status_data->>'dotPct')::numeric,0)>0 then
          v_dot_damage:=greatest(1,floor(coalesce((target_row.x->>'max_hp')::numeric,(target_row.x->>'hp')::numeric,1)*least(50,(v_status_data->>'dotPct')::numeric)/100)::integer);
          target_row.x:=jsonb_set(target_row.x,'{hp}',to_jsonb(greatest(0,coalesce((target_row.x->>'hp')::integer,0)-v_dot_damage)),true);
        end if;
        v_status_data:=jsonb_set(v_status_data,'{turns}',to_jsonb(greatest(0,coalesce((v_status_data->>'turns')::integer,0)-1)),true);
        if coalesce((v_status_data->>'turns')::integer,0)<=0 then v_statuses:=v_statuses-status_row.key; else v_statuses:=jsonb_set(v_statuses,array[status_row.key],v_status_data,true); end if;
      end loop;
      target_row.x:=jsonb_set(target_row.x,'{statuses}',v_statuses,true);
      monsters:=js$v183_5$) on conflict(part) do update set fragment=excluded.fragment;
commit;
