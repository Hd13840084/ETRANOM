-- ETRANOM PvP Phase 1 / v147
-- Replaces the old instant level/class score result with a persistent live-match lifecycle.
-- This migration deliberately does NOT award wins. A match remains active until the shared
-- battle-engine bridge (next phase) submits a validated final result.
begin;

alter table public.pvp_matches
  drop constraint if exists pvp_matches_status_check;
alter table public.pvp_matches
  alter column status set default 'active',
  alter column completed_at drop not null,
  alter column completed_at drop default;
alter table public.pvp_matches
  add constraint pvp_matches_status_check
  check (status in ('active','completed','abandoned','draw'));

alter table public.pvp_matches add column if not exists combat_state jsonb not null default '{}'::jsonb;
alter table public.pvp_matches add column if not exists turn_player uuid references auth.users(id) on delete restrict;
alter table public.pvp_matches add column if not exists turn_no integer not null default 1 check (turn_no > 0);
alter table public.pvp_matches add column if not exists last_action_at timestamptz;
alter table public.pvp_matches add column if not exists updated_at timestamptz not null default now();
create index if not exists pvp_matches_active_a_idx on public.pvp_matches(player_a,updated_at desc) where status='active';
create index if not exists pvp_matches_active_b_idx on public.pvp_matches(player_b,updated_at desc) where status='active';

create or replace function public.etranom_pvp_respond(p_challenge uuid,p_accept boolean)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
 uid uuid:=auth.uid(); c public.pvp_challenges%rowtype;
 pa public.player_profiles%rowtype; pb public.player_profiles%rowtype;
 sa jsonb; sb jsonb; mid uuid; existing_match uuid;
begin
 if uid is null then raise exception 'auth_required'; end if;
 select * into c from public.pvp_challenges where id=p_challenge for update;
 if not found or c.opponent_id<>uid then raise exception 'challenge_not_found'; end if;
 if c.status<>'pending' or c.expires_at<=now() then raise exception 'challenge_expired'; end if;
 if not p_accept then
   update public.pvp_challenges set status='declined',responded_at=now() where id=c.id;
   return jsonb_build_object('success',true,'status','declined');
 end if;
 select * into pa from public.player_profiles where user_id=c.challenger_id;
 select * into pb from public.player_profiles where user_id=c.opponent_id;
 if pa.user_id is null or pb.user_id is null then raise exception 'profile_missing'; end if;
 select save_data into sa from public.game_saves where user_id=c.challenger_id;
 select save_data into sb from public.game_saves where user_id=c.opponent_id;
 if sa is null or sb is null then raise exception 'game_save_missing'; end if;
 select id into existing_match from public.pvp_matches where challenge_id=c.id;
 if existing_match is not null then
   return jsonb_build_object('success',true,'status','active','match_id',existing_match,'idempotent',true);
 end if;
 update public.pvp_challenges set status='accepted',responded_at=now() where id=c.id;
 insert into public.pvp_matches(
   challenge_id,player_a,player_b,winner_id,level_a,level_b,score_a,score_b,
   status,completed_at,turn_player,turn_no,combat_state,updated_at
 ) values (
   c.id,c.challenger_id,c.opponent_id,null,
   greatest(1,coalesce(pa.player_level,1)),greatest(1,coalesce(pb.player_level,1)),0,0,
   'active',null,c.challenger_id,1,
   jsonb_build_object(
     'schema','etranom-pvp-combat-v1',
     'phase','player_turn',
     'round',1,
     'player_a',jsonb_build_object('user_id',c.challenger_id,'name',coalesce(pa.display_name,pa.username,'بازیکن'),'level',pa.player_level,'class',pa.player_class,'save_snapshot',sa),
     'player_b',jsonb_build_object('user_id',c.opponent_id,'name',coalesce(pb.display_name,pb.username,'بازیکن'),'level',pb.player_level,'class',pb.player_class,'save_snapshot',sb),
     'log',jsonb_build_array(jsonb_build_object('type','system','text','درخواست پذیرفته شد؛ جلسه مبارزه آنلاین ایجاد شد.','at',now()))
   ),now()
 ) returning id into mid;
 return jsonb_build_object('success',true,'status','active','match_id',mid,'turn_player',c.challenger_id,
   'note','جلسه واقعی ایجاد شد؛ نتیجه خودکار بر اساس سطح و کلاس دیگر محاسبه نمی‌شود.');
end $$;

create or replace function public.etranom_pvp_match_snapshot(p_match uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); m public.pvp_matches%rowtype;
begin
 if uid is null then raise exception 'auth_required'; end if;
 select * into m from public.pvp_matches where id=p_match and auth.uid() in(player_a,player_b);
 if not found then raise exception 'match_not_found'; end if;
 return jsonb_build_object('id',m.id,'status',m.status,'player_a',m.player_a,'player_b',m.player_b,
   'winner_id',m.winner_id,'turn_player',m.turn_player,'turn_no',m.turn_no,
   'combat_state',m.combat_state,'created_at',m.created_at,'updated_at',m.updated_at,'completed_at',m.completed_at);
end $$;

create or replace function public.etranom_pvp_snapshot()
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); incoming jsonb; outgoing jsonb; nearby jsonb; active_matches jsonb;
begin
 if uid is null then raise exception 'auth_required'; end if;
 update public.pvp_challenges set status='expired' where status='pending' and expires_at<now() and (challenger_id=uid or opponent_id=uid);
 select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'player_id',c.challenger_id,'name',coalesce(p.display_name,p.username,'بازیکن'),'level',p.player_level,'created_at',c.created_at) order by c.created_at desc),'[]'::jsonb) into incoming from public.pvp_challenges c left join public.player_profiles p on p.user_id=c.challenger_id where c.opponent_id=uid and c.status='pending' and c.expires_at>now();
 select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'player_id',c.opponent_id,'name',coalesce(p.display_name,p.username,'بازیکن'),'status',c.status,'created_at',c.created_at) order by c.created_at desc),'[]'::jsonb) into outgoing from public.pvp_challenges c left join public.player_profiles p on p.user_id=c.opponent_id where c.challenger_id=uid and c.created_at>now()-interval '1 day';
 select coalesce(jsonb_agg(to_jsonb(x) order by x.level desc),'[]'::jsonb) into nearby from (select p.user_id,coalesce(p.display_name,p.username,'بازیکن') name,p.player_level level,p.player_class class from public.player_profiles p where p.user_id<>uid order by p.player_level desc limit 30) x;
 select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'status',m.status,'turn_player',m.turn_player,'turn_no',m.turn_no,'updated_at',m.updated_at,
   'opponent_name',case when m.player_a=uid then coalesce(pb.display_name,pb.username,'بازیکن') else coalesce(pa.display_name,pa.username,'بازیکن') end,
   'opponent_level',case when m.player_a=uid then pb.player_level else pa.player_level end)
   order by m.updated_at desc),'[]'::jsonb) into active_matches
 from public.pvp_matches m left join public.player_profiles pa on pa.user_id=m.player_a left join public.player_profiles pb on pb.user_id=m.player_b
 where uid in(m.player_a,m.player_b) and m.status='active';
 return jsonb_build_object('incoming',incoming,'outgoing',outgoing,'players',nearby,'active_matches',active_matches);
end $$;

revoke all on function public.etranom_pvp_snapshot(),public.etranom_pvp_respond(uuid,boolean),public.etranom_pvp_match_snapshot(uuid) from public,anon;
grant execute on function public.etranom_pvp_snapshot(),public.etranom_pvp_respond(uuid,boolean),public.etranom_pvp_match_snapshot(uuid) to authenticated;

do $$ begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime')
 and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='pvp_matches') then
   alter publication supabase_realtime add table public.pvp_matches;
 end if;
end $$;
commit;
