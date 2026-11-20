-- ETRANOM Phase 4: server-authoritative party battle core
-- Apply AFTER party.sql and the existing player_profiles / game_saves migrations.
-- The combat ledger is intentionally separate from client-editable game_saves.
begin;

create table if not exists public.party_battle_state (
  session_id uuid primary key references public.party_sessions(id) on delete cascade,
  party_id uuid not null references public.parties(id) on delete cascade,
  region_id text not null,
  encounter_id text not null,
  encounter_name text not null,
  round_no integer not null default 1 check (round_no > 0),
  monster_hp integer not null,
  monster_max_hp integer not null,
  status text not null default 'active' check (status in ('active','victory','defeat','cancelled')),
  player_hp jsonb not null default '{}'::jsonb,
  player_guard jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.party_battle_actions (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.party_battle_state(session_id) on delete cascade,
  round_no integer not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (action in ('attack','guard','heal')),
  damage integer not null default 0,
  created_at timestamptz not null default now(),
  unique(session_id, round_no, user_id)
);

create table if not exists public.party_battle_reward_ledger (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.party_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  xp integer not null default 0,
  coins integer not null default 0,
  materials jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique(session_id,user_id)
);

alter table public.party_battle_state enable row level security;
alter table public.party_battle_actions enable row level security;
alter table public.party_battle_reward_ledger enable row level security;
revoke all on public.party_battle_state, public.party_battle_actions, public.party_battle_reward_ledger from anon, authenticated;

-- Create a server-owned battle snapshot whenever the existing leader-only start RPC
-- creates an active party session. All encounter values are selected on the server.
create or replace function public.etranom_party_battle_bootstrap()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_hp integer;
  v_name text;
  v_encounter text;
  v_player_hp jsonb := '{}'::jsonb;
  m record;
  v_level integer;
begin
  if new.status <> 'active' then return new; end if;
  case new.region_id
    when 'burnt_forest' then v_hp:=220; v_name:='گرگ خاکستر'; v_encounter:='ash_wolf';
    when 'thornbush_grove' then v_hp:=250; v_name:='گراز خارپوش'; v_encounter:='thorn_boar';
    when 'ash_hills' then v_hp:=280; v_name:='سنگ‌خزنده خاکستر'; v_encounter:='ash_crawler';
    when 'verdash_river' then v_hp:=300; v_name:='مارماهی ورداش'; v_encounter:='verdash_eel';
    when 'southern_plains' then v_hp:=330; v_name:='شکارچی دشت جنوبی'; v_encounter:='southern_stalker';
    else raise exception 'battle_region_invalid';
  end case;
  for m in select pm.user_id, coalesce(pp.player_level,1) as player_level
    from public.party_members pm
    left join public.player_profiles pp on pp.user_id=pm.user_id
    where pm.party_id=new.party_id
  loop
    v_level:=greatest(1,least(999,coalesce(m.player_level,1)));
    v_player_hp:=v_player_hp || jsonb_build_object(m.user_id::text,100+v_level*12);
  end loop;
  insert into public.party_battle_state(session_id,party_id,region_id,encounter_id,encounter_name,monster_hp,monster_max_hp,player_hp)
  values(new.id,new.party_id,new.region_id,v_encounter,v_name,v_hp,v_hp,v_player_hp)
  on conflict(session_id) do nothing;
  return new;
end $$;

drop trigger if exists trg_etranom_party_battle_bootstrap on public.party_sessions;
create trigger trg_etranom_party_battle_bootstrap after insert on public.party_sessions
for each row execute function public.etranom_party_battle_bootstrap();

-- Extend the existing session lookup so members can recover the final result
-- after a victory/defeat and a page reload (terminal snapshots remain visible briefly).
create or replace function public.get_my_party_session()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid:=auth.uid(); v_party uuid; v_result jsonb;
begin
 if uid is null then raise exception 'Authentication required'; end if;
 select party_id into v_party from public.party_members where user_id=uid;
 if v_party is null then return null; end if;
 select jsonb_build_object('id',s.id,'party_id',s.party_id,'region_id',s.region_id,'status',s.status,'started_at',s.started_at)
 into v_result
 from public.party_sessions s
 left join public.party_battle_state b on b.session_id=s.id
 where s.party_id=v_party and (
   s.status in ('preparing','active') or
   (s.status='completed' and b.status in ('victory','defeat') and s.finished_at>now()-interval '10 minutes')
 )
 order by s.created_at desc limit 1;
 return v_result;
end $$;

create or replace function public.etranom_party_battle_snapshot(p_session_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid:=auth.uid(); v_party uuid; v_state public.party_battle_state%rowtype; v_members jsonb;
begin
 if uid is null then raise exception 'auth_required'; end if;
 select s.party_id into v_party from public.party_sessions s
 join public.party_members pm on pm.party_id=s.party_id and pm.user_id=uid
 where s.id=p_session_id;
 if v_party is null then raise exception 'battle_not_available'; end if;
 select * into v_state from public.party_battle_state where session_id=p_session_id;
 select coalesce(jsonb_agg(jsonb_build_object(
   'user_id',pm.user_id,'display_name',coalesce(pp.display_name,pp.username,'ماجراجو'),
   'level',coalesce(pp.player_level,1),'hp',coalesce((v_state.player_hp->>pm.user_id::text)::integer,0),
   'ready',exists(select 1 from public.party_battle_actions a where a.session_id=p_session_id and a.round_no=v_state.round_no and a.user_id=pm.user_id)
 ) order by pm.joined_at),'[]'::jsonb) into v_members
 from public.party_members pm left join public.player_profiles pp on pp.user_id=pm.user_id
 where pm.party_id=v_party;
 return jsonb_build_object('session_id',p_session_id,'party_id',v_party,'region_id',v_state.region_id,
   'encounter_id',v_state.encounter_id,'enemy_name',v_state.encounter_name,'round',v_state.round_no,
   'enemy_hp',v_state.monster_hp,'enemy_max_hp',v_state.monster_max_hp,'status',v_state.status,'members',v_members);
end $$;

create or replace function public.etranom_party_battle_act(p_session_id uuid,p_action text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 uid uuid:=auth.uid(); v_party uuid; v_state public.party_battle_state%rowtype;
 v_count integer; v_done integer; v_level integer; v_damage integer:=0; v_hp integer; v_new_hp integer;
 v_player_hp jsonb; v_guard jsonb; m record; v_rewards jsonb:='[]'::jsonb;
begin
 if uid is null then raise exception 'auth_required'; end if;
 if p_action not in ('attack','guard','heal') then raise exception 'battle_action_invalid'; end if;
 select s.party_id into v_party from public.party_sessions s
 join public.party_members pm on pm.party_id=s.party_id and pm.user_id=uid
 where s.id=p_session_id and s.status='active';
 if v_party is null then raise exception 'battle_not_available'; end if;
 select * into v_state from public.party_battle_state where session_id=p_session_id for update;
 if v_state.status<>'active' then raise exception 'battle_already_finished'; end if;
 if exists(select 1 from public.party_battle_actions where session_id=p_session_id and round_no=v_state.round_no and user_id=uid) then raise exception 'already_acted_this_round'; end if;
 select greatest(1,least(999,coalesce(player_level,1))) into v_level from public.player_profiles where user_id=uid;
 v_level:=coalesce(v_level,1);
 v_player_hp:=v_state.player_hp; v_guard:=v_state.player_guard;
 v_hp:=coalesce((v_player_hp->>uid::text)::integer,0);
 if v_hp<=0 then raise exception 'player_defeated'; end if;
 if p_action='attack' then v_damage:=10+v_level*2; v_state.monster_hp:=greatest(0,v_state.monster_hp-v_damage);
 elsif p_action='guard' then v_guard:=v_guard||jsonb_build_object(uid::text,true);
 else v_new_hp:=least(100+v_level*12,v_hp+25); v_player_hp:=v_player_hp||jsonb_build_object(uid::text,v_new_hp);
 end if;
 insert into public.party_battle_actions(session_id,round_no,user_id,action,damage) values(p_session_id,v_state.round_no,uid,p_action,v_damage);
 select count(*) into v_count from public.party_members where party_id=v_party;
 select count(*) into v_done from public.party_battle_actions where session_id=p_session_id and round_no=v_state.round_no;
 if v_state.monster_hp<=0 then
   v_state.status:='victory'; v_state.completed_at:=now();
   insert into public.party_battle_reward_ledger(session_id,user_id,xp,coins,materials)
   select p_session_id,pm.user_id,40,15,jsonb_build_array(jsonb_build_object('id',v_state.encounter_id||'_hide','qty',1))
   from public.party_members pm where pm.party_id=v_party on conflict(session_id,user_id) do nothing;
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
 update public.party_battle_state set monster_hp=v_state.monster_hp,round_no=v_state.round_no,status=v_state.status,
   player_hp=v_player_hp,player_guard=v_guard,updated_at=now(),completed_at=v_state.completed_at where session_id=p_session_id;
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
 select coalesce(jsonb_agg(jsonb_build_object('session_id',session_id,'xp',xp,'coins',coins,'materials',materials,'created_at',created_at) order by created_at desc),'[]'::jsonb)
 into v_rows from public.party_battle_reward_ledger where user_id=uid;
 return v_rows;
end $$;

revoke all on function public.etranom_party_battle_bootstrap() from public,anon,authenticated;
revoke all on function public.get_my_party_session() from public,anon;
revoke all on function public.etranom_party_battle_snapshot(uuid) from public,anon;
revoke all on function public.etranom_party_battle_act(uuid,text) from public,anon;
revoke all on function public.etranom_party_battle_rewards() from public,anon;
grant execute on function public.get_my_party_session() to authenticated;
grant execute on function public.etranom_party_battle_snapshot(uuid) to authenticated;
grant execute on function public.etranom_party_battle_act(uuid,text) to authenticated;
grant execute on function public.etranom_party_battle_rewards() to authenticated;
commit;
