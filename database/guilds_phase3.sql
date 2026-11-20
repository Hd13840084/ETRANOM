-- ETRANOM Phase 3: Guilds. Idempotent setup; run once in Supabase SQL Editor.
create table if not exists public.guilds (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 tag text not null,
 description text not null default '',
 leader_id uuid not null references auth.users(id) on delete restrict,
 created_at timestamptz not null default now(),
 level integer not null default 1 check(level between 1 and 20),
 member_limit integer not null default 20 check(member_limit between 5 and 100),
 unique(name), unique(tag)
);
create table if not exists public.guild_members (
 guild_id uuid not null references public.guilds(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null default 'member' check(role in ('leader','officer','member')),
 joined_at timestamptz not null default now(),
 primary key(guild_id,user_id), unique(user_id)
);
create table if not exists public.guild_invites (
 id uuid primary key default gen_random_uuid(),
 guild_id uuid not null references public.guilds(id) on delete cascade,
 inviter_id uuid not null references auth.users(id) on delete cascade,
 invitee_id uuid not null references auth.users(id) on delete cascade,
 status text not null default 'pending' check(status in ('pending','accepted','declined','cancelled')),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '7 days',
 unique(guild_id,invitee_id)
);
create index if not exists guild_members_user_idx on public.guild_members(user_id);
create index if not exists guild_invites_inbox_idx on public.guild_invites(invitee_id,status,created_at desc);
alter table public.guilds enable row level security;
alter table public.guild_members enable row level security;
alter table public.guild_invites enable row level security;
drop policy if exists guilds_read_authenticated on public.guilds;
create policy guilds_read_authenticated on public.guilds for select to authenticated using(true);
drop policy if exists guild_members_read_authenticated on public.guild_members;
create policy guild_members_read_authenticated on public.guild_members for select to authenticated using(true);
drop policy if exists guild_invites_read_participants on public.guild_invites;
create policy guild_invites_read_participants on public.guild_invites for select to authenticated using(auth.uid()=invitee_id or auth.uid()=inviter_id);
revoke all on public.guilds,public.guild_members,public.guild_invites from anon,authenticated;
grant select on public.guilds,public.guild_members to authenticated;
grant select on public.guild_invites to authenticated;

create or replace function public.etranom_guild_create(p_name text,p_tag text,p_description text default '')
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); save_row public.game_saves%rowtype; gid uuid; clean_name text:=btrim(p_name); clean_tag text:=upper(regexp_replace(btrim(p_tag),'[^A-Za-z0-9]','','g')); fee integer:=1000; current_gold numeric;
begin
 if uid is null then raise exception 'auth_required'; end if;
 if char_length(clean_name)<3 or char_length(clean_name)>32 then raise exception 'guild_name_length'; end if;
 if char_length(clean_tag)<2 or char_length(clean_tag)>5 then raise exception 'guild_tag_length'; end if;
 if exists(select 1 from public.guild_members where user_id=uid) then raise exception 'already_in_guild'; end if;
 select * into save_row from public.game_saves where user_id=uid for update;
 if not found then raise exception 'game_save_missing'; end if;
 current_gold:=coalesce((save_row.save_data->>'gold')::numeric,0);
 if current_gold<fee then raise exception 'guild_fee_insufficient'; end if;
 update public.game_saves set save_data=jsonb_set(save_data,'{gold}',to_jsonb(current_gold-fee),true),updated_at=now() where user_id=uid;
 insert into public.guilds(name,tag,description,leader_id) values(clean_name,clean_tag,left(coalesce(p_description,''),240),uid) returning id into gid;
 insert into public.guild_members(guild_id,user_id,role) values(gid,uid,'leader');
 return jsonb_build_object('guild_id',gid,'fee_paid',fee,'success',true);
exception when unique_violation then raise exception 'guild_name_or_tag_taken';
end $$;

create or replace function public.etranom_guild_snapshot()
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); gid uuid; g jsonb; members jsonb; invites jsonb;
begin
 if uid is null then raise exception 'auth_required'; end if;
 select guild_id into gid from public.guild_members where user_id=uid limit 1;
 if gid is not null then
  select to_jsonb(x) into g from (select id,name,tag,description,leader_id,level,member_limit,created_at from public.guilds where id=gid) x;
  select coalesce(jsonb_agg(jsonb_build_object('user_id',m.user_id,'role',m.role,'joined_at',m.joined_at,'display_name',coalesce(p.display_name,p.username,'ماجراجوی بی‌نام'),'player_level',coalesce(p.player_level,1),'player_class',coalesce(p.player_class,'نامشخص')) order by case m.role when 'leader' then 0 when 'officer' then 1 else 2 end,m.joined_at),'[]'::jsonb) into members from public.guild_members m left join public.player_profiles p on p.user_id=m.user_id where m.guild_id=gid;
 else g:=null; members:='[]'::jsonb; end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',i.id,'guild_id',i.guild_id,'guild_name',g2.name,'guild_tag',g2.tag,'inviter_id',i.inviter_id,'created_at',i.created_at) order by i.created_at desc),'[]'::jsonb) into invites from public.guild_invites i join public.guilds g2 on g2.id=i.guild_id where i.invitee_id=uid and i.status='pending' and i.expires_at>now();
 return jsonb_build_object('guild',g,'members',members,'invites',invites);
end $$;

create or replace function public.etranom_guild_invite(p_target uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); gid uuid; role_name text; cnt integer; lim integer;
begin
 select guild_id,role into gid,role_name from public.guild_members where user_id=uid;
 if gid is null or role_name not in ('leader','officer') then raise exception 'guild_permission_denied'; end if;
 if p_target=uid or exists(select 1 from public.guild_members where user_id=p_target) then raise exception 'target_unavailable'; end if;
 select count(*) into cnt from public.guild_members where guild_id=gid;
 select member_limit into lim from public.guilds where id=gid;
 if cnt>=lim then raise exception 'guild_full'; end if;
 insert into public.guild_invites(guild_id,inviter_id,invitee_id) values(gid,uid,p_target) on conflict(guild_id,invitee_id) do update set inviter_id=excluded.inviter_id,status='pending',created_at=now(),expires_at=now()+interval '7 days';
 return jsonb_build_object('success',true);
end $$;

create or replace function public.etranom_guild_respond_invite(p_invite uuid,p_accept boolean)
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); inv public.guild_invites%rowtype; cnt integer; lim integer;
begin
 select * into inv from public.guild_invites where id=p_invite and invitee_id=uid and status='pending' and expires_at>now() for update;
 if not found then raise exception 'invite_not_found'; end if;
 if exists(select 1 from public.guild_members where user_id=uid) then raise exception 'already_in_guild'; end if;
 if p_accept then
  select count(*) into cnt from public.guild_members where guild_id=inv.guild_id;
  select member_limit into lim from public.guilds where id=inv.guild_id;
  if cnt>=lim then raise exception 'guild_full'; end if;
  insert into public.guild_members(guild_id,user_id,role) values(inv.guild_id,uid,'member');
  update public.guild_invites set status='accepted' where id=inv.id;
 else update public.guild_invites set status='declined' where id=inv.id; end if;
 return jsonb_build_object('success',true,'accepted',p_accept);
end $$;

create or replace function public.etranom_guild_leave()
returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); gid uuid; r text; successor uuid;
begin
 select guild_id,role into gid,r from public.guild_members where user_id=uid for update;
 if gid is null then raise exception 'not_in_guild'; end if;
 if r='leader' then
  select user_id into successor from public.guild_members where guild_id=gid and user_id<>uid order by case role when 'officer' then 0 else 1 end,joined_at limit 1;
  if successor is null then delete from public.guilds where id=gid; return jsonb_build_object('success',true,'disbanded',true); end if;
  update public.guild_members set role='leader' where guild_id=gid and user_id=successor;
  update public.guilds set leader_id=successor where id=gid;
 end if;
 delete from public.guild_members where guild_id=gid and user_id=uid;
 return jsonb_build_object('success',true,'disbanded',false);
end $$;
revoke all on function public.etranom_guild_create(text,text,text),public.etranom_guild_snapshot(),public.etranom_guild_invite(uuid),public.etranom_guild_respond_invite(uuid,boolean),public.etranom_guild_leave() from public,anon;
grant execute on function public.etranom_guild_create(text,text,text),public.etranom_guild_snapshot(),public.etranom_guild_invite(uuid),public.etranom_guild_respond_invite(uuid,boolean),public.etranom_guild_leave() to authenticated;


-- Guild-only chat: readable and writable only by current guild members.
create table if not exists public.guild_messages (
 id uuid primary key default gen_random_uuid(),
 guild_id uuid not null references public.guilds(id) on delete cascade,
 sender_id uuid not null references auth.users(id) on delete cascade,
 body text not null check (char_length(btrim(body)) between 1 and 1000),
 created_at timestamptz not null default now()
);
create index if not exists guild_messages_timeline_idx on public.guild_messages(guild_id, created_at desc);
alter table public.guild_messages enable row level security;
drop policy if exists guild_messages_member_read on public.guild_messages;
create policy guild_messages_member_read on public.guild_messages for select to authenticated
 using (exists(select 1 from public.guild_members gm where gm.guild_id=guild_messages.guild_id and gm.user_id=auth.uid()));
drop policy if exists guild_messages_member_send on public.guild_messages;
create policy guild_messages_member_send on public.guild_messages for insert to authenticated
 with check (sender_id=auth.uid() and exists(select 1 from public.guild_members gm where gm.guild_id=guild_messages.guild_id and gm.user_id=auth.uid()));
revoke all on public.guild_messages from anon,authenticated;
grant select,insert on public.guild_messages to authenticated;
do $$ begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='guild_messages') then
  alter publication supabase_realtime add table public.guild_messages;
 end if;
exception when undefined_object then null; end $$;
