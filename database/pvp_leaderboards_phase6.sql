-- ETRANOM Phase 6: server-authoritative PvP challenge records and leaderboard foundation.
-- Run after the existing profile, guild, and game-save migrations.
begin;
create table if not exists public.pvp_challenges (
 id uuid primary key default gen_random_uuid(),
 challenger_id uuid not null references auth.users(id) on delete cascade,
 opponent_id uuid not null references auth.users(id) on delete cascade,
 status text not null default 'pending' check(status in ('pending','accepted','declined','expired','cancelled')),
 created_at timestamptz not null default now(), expires_at timestamptz not null default now()+interval '2 minutes',
 responded_at timestamptz,
 check(challenger_id<>opponent_id)
);
create index if not exists pvp_challenges_inbox_idx on public.pvp_challenges(opponent_id,status,created_at desc);
create index if not exists pvp_challenges_outbox_idx on public.pvp_challenges(challenger_id,status,created_at desc);
create table if not exists public.pvp_matches (
 id uuid primary key default gen_random_uuid(), challenge_id uuid not null unique references public.pvp_challenges(id) on delete restrict,
 player_a uuid not null references auth.users(id) on delete restrict,
 player_b uuid not null references auth.users(id) on delete restrict,
 winner_id uuid references auth.users(id) on delete restrict,
 level_a integer not null, level_b integer not null,
 score_a integer not null default 0, score_b integer not null default 0,
 status text not null default 'completed' check(status in ('completed')),
 created_at timestamptz not null default now(), completed_at timestamptz not null default now(),
 check(player_a<>player_b), check(winner_id is null or winner_id in(player_a,player_b))
);
create index if not exists pvp_matches_a_idx on public.pvp_matches(player_a,completed_at desc);
create index if not exists pvp_matches_b_idx on public.pvp_matches(player_b,completed_at desc);
create table if not exists public.pvp_player_stats (
 user_id uuid primary key references auth.users(id) on delete cascade,
 wins bigint not null default 0 check(wins>=0), losses bigint not null default 0 check(losses>=0), draws bigint not null default 0 check(draws>=0), updated_at timestamptz not null default now()
);
alter table public.pvp_challenges enable row level security;
alter table public.pvp_matches enable row level security;
alter table public.pvp_player_stats enable row level security;
drop policy if exists pvp_challenges_participant_read on public.pvp_challenges;
create policy pvp_challenges_participant_read on public.pvp_challenges for select to authenticated using(auth.uid() in(challenger_id,opponent_id));
drop policy if exists pvp_matches_read on public.pvp_matches;
create policy pvp_matches_read on public.pvp_matches for select to authenticated using(true);
drop policy if exists pvp_stats_read on public.pvp_player_stats;
create policy pvp_stats_read on public.pvp_player_stats for select to authenticated using(true);
revoke all on public.pvp_challenges,public.pvp_matches,public.pvp_player_stats from anon,authenticated;
grant select on public.pvp_challenges,public.pvp_matches,public.pvp_player_stats to authenticated;

create or replace function public.etranom_pvp_snapshot()
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); incoming jsonb; outgoing jsonb; nearby jsonb;
begin
 if uid is null then raise exception 'auth_required'; end if;
 update public.pvp_challenges set status='expired' where status='pending' and expires_at<now() and (challenger_id=uid or opponent_id=uid);
 select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'player_id',c.challenger_id,'name',coalesce(p.display_name,p.username,'بازیکن'),'level',p.player_level,'created_at',c.created_at) order by c.created_at desc),'[]'::jsonb) into incoming from public.pvp_challenges c left join public.player_profiles p on p.user_id=c.challenger_id where c.opponent_id=uid and c.status='pending' and c.expires_at>now();
 select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'player_id',c.opponent_id,'name',coalesce(p.display_name,p.username,'بازیکن'),'status',c.status,'created_at',c.created_at) order by c.created_at desc),'[]'::jsonb) into outgoing from public.pvp_challenges c left join public.player_profiles p on p.user_id=c.opponent_id where c.challenger_id=uid and c.created_at>now()-interval '1 day';
 select coalesce(jsonb_agg(to_jsonb(x) order by x.level desc),'[]'::jsonb) into nearby from (select p.user_id,coalesce(p.display_name,p.username,'بازیکن') name,p.player_level level,p.player_class class from public.player_profiles p where p.user_id<>uid order by p.player_level desc limit 30) x;
 return jsonb_build_object('incoming',incoming,'outgoing',outgoing,'players',nearby);
end $$;

create or replace function public.etranom_pvp_challenge(p_target uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); cid uuid;
begin
 if uid is null then raise exception 'auth_required'; end if;
 if p_target is null or p_target=uid then raise exception 'invalid_target'; end if;
 if not exists(select 1 from public.player_profiles where user_id=uid) or not exists(select 1 from public.player_profiles where user_id=p_target) then raise exception 'profile_missing'; end if;
 if exists(select 1 from public.pvp_challenges where status='pending' and expires_at>now() and ((challenger_id=uid and opponent_id=p_target) or (challenger_id=p_target and opponent_id=uid))) then raise exception 'challenge_exists'; end if;
 insert into public.pvp_challenges(challenger_id,opponent_id) values(uid,p_target) returning id into cid;
 return jsonb_build_object('success',true,'challenge_id',cid);
end $$;

create or replace function public.etranom_pvp_respond(p_challenge uuid,p_accept boolean)
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); c public.pvp_challenges%rowtype; pa public.player_profiles%rowtype; pb public.player_profiles%rowtype; mid uuid; winner uuid; sa integer; sb integer;
begin
 if uid is null then raise exception 'auth_required'; end if;
 select * into c from public.pvp_challenges where id=p_challenge for update;
 if not found or c.opponent_id<>uid then raise exception 'challenge_not_found'; end if;
 if c.status<>'pending' or c.expires_at<=now() then raise exception 'challenge_expired'; end if;
 if not p_accept then update public.pvp_challenges set status='declined',responded_at=now() where id=c.id; return jsonb_build_object('success',true,'status','declined'); end if;
 select * into pa from public.player_profiles where user_id=c.challenger_id;
 select * into pb from public.player_profiles where user_id=c.opponent_id;
 if pa.user_id is null or pb.user_id is null then raise exception 'profile_missing'; end if;
 -- Phase 6 MVP resolution: server-side level/class score only; no client-supplied damage or rewards.
 sa:=greatest(1,coalesce(pa.player_level,1))*10 + (ascii(left(coalesce(pa.player_class,'?'),1))%7);
 sb:=greatest(1,coalesce(pb.player_level,1))*10 + (ascii(left(coalesce(pb.player_class,'?'),1))%7);
 winner:=case when sa>sb then c.challenger_id when sb>sa then c.opponent_id else null end;
 update public.pvp_challenges set status='accepted',responded_at=now() where id=c.id;
 insert into public.pvp_matches(challenge_id,player_a,player_b,winner_id,level_a,level_b,score_a,score_b) values(c.id,c.challenger_id,c.opponent_id,winner,pa.player_level,pb.player_level,sa,sb) returning id into mid;
 insert into public.pvp_player_stats(user_id,wins,losses,draws) values(c.challenger_id,case when winner=c.challenger_id then 1 else 0 end,case when winner=c.opponent_id then 1 else 0 end,case when winner is null then 1 else 0 end),(c.opponent_id,case when winner=c.opponent_id then 1 else 0 end,case when winner=c.challenger_id then 1 else 0 end,case when winner is null then 1 else 0 end)
 on conflict(user_id) do update set wins=pvp_player_stats.wins+excluded.wins,losses=pvp_player_stats.losses+excluded.losses,draws=pvp_player_stats.draws+excluded.draws,updated_at=now();
 return jsonb_build_object('success',true,'match_id',mid,'winner_id',winner,'score_a',sa,'score_b',sb,'note','نتیجه نسخه اولیه بر اساس سطح و کلاس و سمت سرور محاسبه شد؛ این هنوز نبرد نوبتی با مهارت‌ها و تجهیزات نیست.');
end $$;

create or replace function public.etranom_leaderboards(p_board integer default 1)
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); rows jsonb;
begin
 if uid is null then raise exception 'auth_required'; end if;
 if p_board=1 then select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) into rows from (select coalesce(display_name,username,'بازیکن') name,player_level value,player_class detail from public.player_profiles order by player_level desc nulls last,created_at asc limit 50)x;
 elsif p_board in(4,5) then select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) into rows from (select coalesce(p.display_name,p.username,'بازیکن') name,case when p_board=4 then s.wins else round(100.0*s.wins/greatest(1,s.wins+s.losses),1) end value, (s.wins+s.losses+s.draws) games from public.pvp_player_stats s join public.player_profiles p on p.user_id=s.user_id where s.wins+s.losses+s.draws>0 and (p_board<>5 or s.wins+s.losses>=5) order by value desc,games desc limit 50)x;
 elsif p_board=10 then select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) into rows from (select g.name||' ['||g.tag||']' name,count(m.user_id)::bigint value,'تعداد اعضا' detail from public.guilds g left join public.guild_members m on m.guild_id=g.id group by g.id order by value desc,g.created_at asc limit 50)x;
 else rows:='[]'::jsonb; end if;
 return jsonb_build_object('board',p_board,'available',p_board in(1,4,5,10),'rows',rows,'reason',case when p_board in(1,4,5,10) then null else 'این آمار هنوز منبع معتبر سمت سرور ندارد و عمداً نمایش داده نمی‌شود.' end);
end $$;
revoke all on function public.etranom_pvp_snapshot(),public.etranom_pvp_challenge(uuid),public.etranom_pvp_respond(uuid,boolean),public.etranom_leaderboards(integer) from public,anon;
grant execute on function public.etranom_pvp_snapshot(),public.etranom_pvp_challenge(uuid),public.etranom_pvp_respond(uuid,boolean),public.etranom_leaderboards(integer) to authenticated;
commit;
