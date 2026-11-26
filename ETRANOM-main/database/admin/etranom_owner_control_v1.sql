-- ETRANOM OWNER CONTROL v1
-- Run once in Supabase SQL Editor. Owner is bootstrapped by immutable auth UUID.
begin;

create table if not exists public.etranom_admin_roles (
  user_id uuid primary key references auth.users(id) on delete restrict,
  role text not null check (role in ('owner','super_admin','game_admin','moderator','support')),
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid,
  constraint etranom_owner_role_guard check (role <> 'owner' or user_id = 'f9531c31-8c9f-495d-baf2-d19575982f78'::uuid)
);

create table if not exists public.etranom_admin_audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid not null,
  action text not null,
  target_type text,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.etranom_player_bans (
  player_id uuid primary key references auth.users(id) on delete cascade,
  reason text not null,
  banned_by uuid not null,
  banned_at timestamptz not null default now(),
  expires_at timestamptz,
  active boolean not null default true
);

create table if not exists public.etranom_admin_content (
  id bigint generated always as identity primary key,
  content_type text not null check (content_type in ('item','monster','material','recipe','npc','quest','region','skill','class','specialization','shop','event','world_setting','text')),
  content_id text not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  version integer not null default 1,
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  unique(content_type,content_id)
);

create table if not exists public.etranom_admin_content_versions (
  id bigint generated always as identity primary key,
  content_type text not null,
  content_id text not null,
  version integer not null,
  payload jsonb not null,
  status text not null,
  changed_by uuid not null,
  changed_at timestamptz not null default now(),
  unique(content_type,content_id,version)
);

alter table public.etranom_admin_roles enable row level security;
alter table public.etranom_admin_audit_logs enable row level security;
alter table public.etranom_player_bans enable row level security;
alter table public.etranom_admin_content enable row level security;
alter table public.etranom_admin_content_versions enable row level security;

-- No direct client writes. All operations go through guarded RPCs.
revoke all on public.etranom_admin_roles, public.etranom_admin_audit_logs,
 public.etranom_player_bans, public.etranom_admin_content,
 public.etranom_admin_content_versions from anon, authenticated;
grant select on public.etranom_admin_roles to authenticated;
grant select on public.etranom_admin_content to authenticated;
grant select on public.etranom_admin_content_versions to authenticated;

create or replace function public.etranom_admin_is_authorized_v1(p_permission text default null)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare r text; perms jsonb;
begin
  if auth.uid() is null then return false; end if;
  select role, permissions into r, perms from public.etranom_admin_roles where user_id=auth.uid();
  if r is null then return false; end if;
  if r in ('owner','super_admin') then return true; end if;
  return p_permission is not null and coalesce((perms->>p_permission)::boolean,false);
end; $$;

create or replace function public.etranom_admin_context_v1()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare r text; p jsonb;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  select role,permissions into r,p from public.etranom_admin_roles where user_id=auth.uid();
  if r is null then return jsonb_build_object('role',null); end if;
  return jsonb_build_object('role',r,'permissions',p);
end; $$;

create or replace function public.etranom_admin_log_v1(p_action text,p_target_type text default null,p_target_id text default null,p_details jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = '' as $$
begin
 if not public.etranom_admin_is_authorized_v1('audit') then raise exception 'ADMIN_FORBIDDEN'; end if;
 insert into public.etranom_admin_audit_logs(actor_id,action,target_type,target_id,details)
 values(auth.uid(),left(p_action,100),left(p_target_type,80),left(p_target_id,180),coalesce(p_details,'{}'::jsonb));
end; $$;

create or replace function public.etranom_admin_list_content_v1(p_content_type text)
returns setof jsonb language plpgsql stable security definer set search_path = '' as $$
begin
 if not public.etranom_admin_is_authorized_v1('content') then raise exception 'ADMIN_FORBIDDEN'; end if;
 return query select jsonb_build_object('content_id',content_id,'status',status,'version',version,'updated_at',updated_at)
 from public.etranom_admin_content where content_type=p_content_type order by updated_at desc;
end; $$;

create or replace function public.etranom_admin_get_content_v1(p_content_type text,p_content_id text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare x public.etranom_admin_content;
begin
 if not public.etranom_admin_is_authorized_v1('content') then raise exception 'ADMIN_FORBIDDEN'; end if;
 select * into x from public.etranom_admin_content where content_type=p_content_type and content_id=p_content_id;
 if not found then raise exception 'CONTENT_NOT_FOUND'; end if;
 return jsonb_build_object('content_id',x.content_id,'payload',x.payload,'status',x.status,'version',x.version);
end; $$;

create or replace function public.etranom_admin_upsert_content_v1(p_content_type text,p_content_id text,p_payload jsonb,p_publish boolean default false)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare old public.etranom_admin_content; new_version integer; new_status text;
begin
 if not public.etranom_admin_is_authorized_v1('content') then raise exception 'ADMIN_FORBIDDEN'; end if;
 if p_content_type not in ('item','monster','material','recipe','npc','quest','region','skill','class','specialization','shop','event','world_setting','text') then raise exception 'INVALID_CONTENT_TYPE'; end if;
 if p_content_id is null or length(trim(p_content_id)) not between 1 and 120 or jsonb_typeof(p_payload)<>'object' then raise exception 'INVALID_CONTENT'; end if;
 select * into old from public.etranom_admin_content where content_type=p_content_type and content_id=p_content_id for update;
 new_version:=coalesce(old.version,0)+1; new_status:=case when p_publish then 'published' else 'draft' end;
 if old.id is not null then
   insert into public.etranom_admin_content_versions(content_type,content_id,version,payload,status,changed_by)
   values(old.content_type,old.content_id,old.version,old.payload,old.status,auth.uid());
   update public.etranom_admin_content set payload=p_payload,status=new_status,version=new_version,updated_by=auth.uid(),updated_at=now(),published_at=case when p_publish then now() else published_at end
   where id=old.id;
 else
   insert into public.etranom_admin_content(content_type,content_id,payload,status,version,created_by,updated_by,published_at)
   values(p_content_type,p_content_id,p_payload,new_status,new_version,auth.uid(),auth.uid(),case when p_publish then now() else null end);
 end if;
 insert into public.etranom_admin_audit_logs(actor_id,action,target_type,target_id,details)
 values(auth.uid(),case when p_publish then 'content_publish' else 'content_save_draft' end,p_content_type,p_content_id,jsonb_build_object('version',new_version));
 return jsonb_build_object('content_id',p_content_id,'version',new_version,'status',new_status);
end; $$;

create or replace function public.etranom_admin_publish_content_v1(p_content_type text,p_content_id text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare x public.etranom_admin_content;
begin
 if not public.etranom_admin_is_authorized_v1('content') then raise exception 'ADMIN_FORBIDDEN'; end if;
 update public.etranom_admin_content set status='published',published_at=now(),updated_at=now(),updated_by=auth.uid()
 where content_type=p_content_type and content_id=p_content_id returning * into x;
 if not found then raise exception 'CONTENT_NOT_FOUND'; end if;
 insert into public.etranom_admin_content_versions(content_type,content_id,version,payload,status,changed_by)
 values(x.content_type,x.content_id,x.version,x.payload,'published',auth.uid()) on conflict do nothing;
 insert into public.etranom_admin_audit_logs(actor_id,action,target_type,target_id) values(auth.uid(),'content_publish',p_content_type,p_content_id);
 return jsonb_build_object('content_id',x.content_id,'version',x.version,'status',x.status);
end; $$;

create or replace function public.etranom_admin_list_players_v1(p_limit integer default 50,p_offset integer default 0)
returns setof jsonb language plpgsql stable security definer set search_path = '' as $$
begin
 if not public.etranom_admin_is_authorized_v1('players') then raise exception 'ADMIN_FORBIDDEN'; end if;
 if to_regclass('public.player_profiles') is null then return; end if;
 return query execute 'select to_jsonb(p) from public.player_profiles p order by 1 limit $1 offset $2' using least(greatest(p_limit,1),100),greatest(p_offset,0);
end; $$;

create or replace function public.etranom_admin_set_ban_v1(p_player_id uuid,p_reason text default null,p_until timestamptz default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
 if not public.etranom_admin_is_authorized_v1('players') then raise exception 'ADMIN_FORBIDDEN'; end if;
 if p_player_id='f9531c31-8c9f-495d-baf2-d19575982f78'::uuid then raise exception 'OWNER_PROTECTED'; end if;
 if p_reason is null or length(trim(p_reason))=0 then
   update public.etranom_player_bans set active=false where player_id=p_player_id;
   insert into public.etranom_admin_audit_logs(actor_id,action,target_type,target_id) values(auth.uid(),'player_unban','player',p_player_id::text);
   return jsonb_build_object('player_id',p_player_id,'banned',false);
 end if;
 insert into public.etranom_player_bans(player_id,reason,banned_by,expires_at,active)
 values(p_player_id,left(p_reason,1000),auth.uid(),p_until,true)
 on conflict(player_id) do update set reason=excluded.reason,banned_by=excluded.banned_by,banned_at=now(),expires_at=excluded.expires_at,active=true;
 insert into public.etranom_admin_audit_logs(actor_id,action,target_type,target_id,details)
 values(auth.uid(),'player_ban','player',p_player_id::text,jsonb_build_object('reason',left(p_reason,300),'expires_at',p_until));
 return jsonb_build_object('player_id',p_player_id,'banned',true,'expires_at',p_until);
end; $$;

create or replace function public.etranom_admin_audit_list_v1(p_limit integer default 50)
returns setof jsonb language plpgsql stable security definer set search_path = '' as $$
begin
 if not public.etranom_admin_is_authorized_v1('audit') then raise exception 'ADMIN_FORBIDDEN'; end if;
 return query select to_jsonb(a) from public.etranom_admin_audit_logs a order by a.created_at desc limit least(greatest(p_limit,1),100);
end; $$;

create or replace function public.etranom_admin_dashboard_v1()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
 if not public.etranom_admin_is_authorized_v1('dashboard') then raise exception 'ADMIN_FORBIDDEN'; end if;
 select jsonb_build_object(
   'محتوای مدیریتی', (select count(*) from public.etranom_admin_content),
   'محتوای منتشرشده', (select count(*) from public.etranom_admin_content where status='published'),
   'پیش‌نویس‌ها', (select count(*) from public.etranom_admin_content where status='draft'),
   'اقدامات ثبت‌شده', (select count(*) from public.etranom_admin_audit_logs),
   'بن‌های فعال', (select count(*) from public.etranom_player_bans where active and (expires_at is null or expires_at>now()))
 ) into result;
 return result;
end; $$;

-- Seed only the explicitly designated Owner. Re-running is safe and never downgrades another account.
insert into public.etranom_admin_roles(user_id,role,permissions,created_by)
values('f9531c31-8c9f-495d-baf2-d19575982f78'::uuid,'owner','{"dashboard":true,"players":true,"content":true,"audit":true,"roles":true,"economy":true,"world":true,"combat":true}'::jsonb,'f9531c31-8c9f-495d-baf2-d19575982f78'::uuid)
on conflict(user_id) do update set role='owner',permissions=excluded.permissions;

revoke all on function public.etranom_admin_is_authorized_v1(text) from public, anon;
revoke all on function public.etranom_admin_context_v1() from public, anon;
revoke all on function public.etranom_admin_log_v1(text,text,text,jsonb) from public, anon;
revoke all on function public.etranom_admin_list_content_v1(text) from public, anon;
revoke all on function public.etranom_admin_get_content_v1(text,text) from public, anon;
revoke all on function public.etranom_admin_upsert_content_v1(text,text,jsonb,boolean) from public, anon;
revoke all on function public.etranom_admin_publish_content_v1(text,text) from public, anon;
revoke all on function public.etranom_admin_list_players_v1(integer,integer) from public, anon;
revoke all on function public.etranom_admin_set_ban_v1(uuid,text,timestamptz) from public, anon;
revoke all on function public.etranom_admin_audit_list_v1(integer) from public, anon;
revoke all on function public.etranom_admin_dashboard_v1() from public, anon;
grant execute on function public.etranom_admin_context_v1() to authenticated;
grant execute on function public.etranom_admin_list_content_v1(text) to authenticated;
grant execute on function public.etranom_admin_get_content_v1(text,text) to authenticated;
grant execute on function public.etranom_admin_upsert_content_v1(text,text,jsonb,boolean) to authenticated;
grant execute on function public.etranom_admin_publish_content_v1(text,text) to authenticated;
grant execute on function public.etranom_admin_list_players_v1(integer,integer) to authenticated;
grant execute on function public.etranom_admin_set_ban_v1(uuid,text,timestamptz) to authenticated;
grant execute on function public.etranom_admin_audit_list_v1(integer) to authenticated;
grant execute on function public.etranom_admin_dashboard_v1() to authenticated;

commit;
