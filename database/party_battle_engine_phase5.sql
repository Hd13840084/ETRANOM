-- ETRANOM Party Battle Engine Phase 5
-- Multi-monster encounters, solo kill credit, personal 50% material rolls,
-- class-specific recipe rolls, and member-scaled miniboss/boss encounters.
-- Apply after party.sql, etranom_content_pack_v1.sql and phase4 migration.
begin;

alter table public.party_sessions
  add column if not exists encounter_type text not null default 'normal'
  check (encounter_type in ('normal','mini_boss','area_boss'));

alter table public.party_battle_state
  add column if not exists encounter_type text not null default 'normal',
  add column if not exists group_size integer not null default 2,
  add column if not exists monsters jsonb not null default '[]'::jsonb,
  add column if not exists kills_by_user jsonb not null default '{}'::jsonb;

create table if not exists public.party_battle_kill_ledger (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.party_battle_state(session_id) on delete cascade,
  monster_index integer not null,
  monster_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  material_drops jsonb not null default '[]'::jsonb,
  recipe_id text,
  xp integer not null default 0,
  coins integer not null default 0,
  created_at timestamptz not null default now(),
  unique(session_id, monster_index)
);
alter table public.party_battle_kill_ledger enable row level security;
revoke all on public.party_battle_kill_ledger from anon, authenticated;

create or replace function public.etranom_party_battle_bootstrap()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_count integer;
  v_monster_count integer;
  v_monsters jsonb := '[]'::jsonb;
  v_player_hp jsonb := '{}'::jsonb;
  v_scale numeric;
  v_monster record;
  v_member record;
  v_index integer := 0;
  v_kind text;
begin
  if new.status <> 'active' then return new; end if;
  select count(*) into v_count from public.party_members where party_id=new.party_id;
  v_count:=greatest(2,least(4,v_count));
  v_kind:=coalesce(new.encounter_type,'normal');
  v_scale:=1 + 0.65 * (v_count-1);

  if v_kind='normal' then
    v_monster_count:=v_count + floor(random()*(2*v_count+1))::integer;
    for v_index in 1..v_monster_count loop
      select id,name_fa,level,stats,material_ids into v_monster
      from public.etranom_content_monsters
      where region_id=new.region_id and kind='normal'
      order by random() limit 1;
      if v_monster.id is null then raise exception 'party_region_monsters_missing'; end if;
      v_monsters:=v_monsters || jsonb_build_array(jsonb_build_object(
        'id',v_monster.id,'name',v_monster.name_fa,'kind','normal','level',v_monster.level,
        'hp',greatest(1,coalesce((v_monster.stats->>'hp')::integer,100)),
        'max_hp',greatest(1,coalesce((v_monster.stats->>'hp')::integer,100)),
        'attack',greatest(1,coalesce((v_monster.stats->>'attack')::integer,10)),
        'material_ids',to_jsonb(coalesce(v_monster.material_ids,'{}'::text[]))
      ));
    end loop;
  else
    select id,name_fa,level,stats,material_ids,kind into v_monster
    from public.etranom_content_monsters
    where region_id=new.region_id
      and kind=case when v_kind='mini_boss' then 'mini_boss' else 'area_boss' end
    order by random() limit 1;
    if v_monster.id is null then raise exception 'party_elite_encounter_missing'; end if;
    v_monsters:=jsonb_build_array(jsonb_build_object(
      'id',v_monster.id,'name',v_monster.name_fa,'kind',v_kind,'level',v_monster.level,
      'hp',greatest(1,round(coalesce((v_monster.stats->>'hp')::numeric,500)*v_scale)::integer),
      'max_hp',greatest(1,round(coalesce((v_monster.stats->>'hp')::numeric,500)*v_scale)::integer),
      'attack',greatest(1,round(coalesce((v_monster.stats->>'attack')::numeric,25)*v_scale)::integer),
      'material_ids',to_jsonb(coalesce(v_monster.material_ids,'{}'::text[]))
    ));
  end if;

  for v_member in
    select pm.user_id,coalesce(pp.player_level,1) player_level
    from public.party_members pm left join public.player_profiles pp on pp.user_id=pm.user_id
    where pm.party_id=new.party_id
  loop
    v_player_hp:=v_player_hp || jsonb_build_object(v_member.user_id::text,100+greatest(1,least(999,v_member.player_level))*12);
  end loop;

  insert into public.party_battle_state(
    session_id,party_id,region_id,encounter_id,encounter_name,round_no,
    monster_hp,monster_max_hp,player_hp,encounter_type,group_size,monsters,kills_by_user
  ) values (
    new.id,new.party_id,new.region_id,
    coalesce(v_monsters->0->>'id','party_encounter'),
    coalesce(v_monsters->0->>'name','گروه هیولاها'),1,
    (select coalesce(sum((e.value->>'hp')::integer),0) from jsonb_array_elements(v_monsters) as e(value)),
    (select coalesce(sum((e.value->>'max_hp')::integer),0) from jsonb_array_elements(v_monsters) as e(value)),
    v_player_hp,v_kind,v_count,v_monsters,'{}'::jsonb
  ) on conflict(session_id) do nothing;
  return new;
end $$;

drop trigger if exists trg_etranom_party_battle_bootstrap on public.party_sessions;
create trigger trg_etranom_party_battle_bootstrap after insert on public.party_sessions
for each row execute function public.etranom_party_battle_bootstrap();

create or replace function public.start_party_session_v2(p_encounter_type text default 'normal')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid:=auth.uid(); v_party uuid; v_region text; v_count integer; v_ready integer; v_session uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if p_encounter_type not in ('normal','mini_boss','area_boss') then raise exception 'party_encounter_type_invalid'; end if;
  select id,region_id into v_party,v_region from public.parties
    where leader_id=v_user and status='preparing' for update;
  if v_party is null or v_region is null then raise exception 'Party is not ready to start'; end if;
  select count(*),count(*) filter(where is_ready) into v_count,v_ready
    from public.party_members where party_id=v_party;
  if v_count<2 or v_count>4 then raise exception 'party_member_count_invalid'; end if;
  if v_ready<>v_count then raise exception 'All members must be ready'; end if;
  if p_encounter_type='area_boss' and v_region<>'rootbound_ruins' then
    if not exists(select 1 from public.etranom_content_monsters where region_id=v_region and kind='area_boss') then
      raise exception 'party_area_boss_unavailable';
    end if;
  end if;
  insert into public.party_sessions(party_id,region_id,status,started_at,encounter_type)
    values(v_party,v_region,'active',now(),p_encounter_type) returning id into v_session;
  update public.parties set status='active',updated_at=now() where id=v_party;
  return jsonb_build_object('success',true,'session_id',v_session,'region_id',v_region,'encounter_type',p_encounter_type,'member_count',v_count);
end $$;

create or replace function public.etranom_party_battle_snapshot(p_session_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid:=auth.uid(); v_party uuid; v_state public.party_battle_state%rowtype; v_members jsonb; v_monsters jsonb;
begin
  if uid is null then raise exception 'auth_required'; end if;
  select s.party_id into v_party from public.party_sessions s
    join public.party_members pm on pm.party_id=s.party_id and pm.user_id=uid where s.id=p_session_id;
  if v_party is null then raise exception 'battle_not_available'; end if;
  select * into v_state from public.party_battle_state where session_id=p_session_id;
  select coalesce(jsonb_agg(jsonb_build_object(
    'user_id',pm.user_id,'display_name',coalesce(pp.display_name,pp.username,'ماجراجو'),
    'level',coalesce(pp.player_level,1),'hp',coalesce((v_state.player_hp->>pm.user_id::text)::integer,0),
    'kills',coalesce((v_state.kills_by_user->>pm.user_id::text)::integer,0),
    'ready',exists(select 1 from public.party_battle_actions a where a.session_id=p_session_id and a.round_no=v_state.round_no and a.user_id=pm.user_id)
  ) order by pm.joined_at),'[]'::jsonb) into v_members
  from public.party_members pm left join public.player_profiles pp on pp.user_id=pm.user_id where pm.party_id=v_party;
  select coalesce(jsonb_agg(x || jsonb_build_object('index',ord)), '[]'::jsonb) into v_monsters
    from jsonb_array_elements(v_state.monsters) with ordinality as t(x,ord);
  return jsonb_build_object(
    'session_id',p_session_id,'party_id',v_party,'region_id',v_state.region_id,
    'encounter_type',v_state.encounter_type,'group_size',v_state.group_size,
    'enemy_name',v_state.encounter_name,'round',v_state.round_no,
    'enemy_hp',v_state.monster_hp,'enemy_max_hp',v_state.monster_max_hp,
    'monsters',v_monsters,'members',v_members,'status',v_state.status
  );
end $$;

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

create or replace function public.etranom_party_battle_rewards()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid:=auth.uid(); v_rows jsonb;
begin
 if uid is null then raise exception 'auth_required'; end if;
 select coalesce(jsonb_agg(jsonb_build_object(
   'session_id',r.session_id,'xp',r.xp,'coins',r.coins,'materials',r.materials,
   'recipes',coalesce((select jsonb_agg(k.recipe_id) from public.party_battle_kill_ledger k where k.session_id=r.session_id and k.user_id=uid and k.recipe_id is not null),'[]'::jsonb),
   'created_at',r.created_at) order by r.created_at desc),'[]'::jsonb)
 into v_rows from public.party_battle_reward_ledger r where r.user_id=uid;
 return v_rows;
end $$;

revoke all on function public.start_party_session_v2(text) from public,anon;
revoke all on function public.etranom_party_battle_bootstrap() from public,anon,authenticated;
grant execute on function public.start_party_session_v2(text) to authenticated;
grant execute on function public.etranom_party_battle_snapshot(uuid) to authenticated;
grant execute on function public.etranom_party_battle_act(uuid,text) to authenticated;
grant execute on function public.etranom_party_battle_rewards() to authenticated;
commit;
