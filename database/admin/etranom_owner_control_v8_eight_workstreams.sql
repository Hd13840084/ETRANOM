-- ETRANOM OWNER CONTROL V8 — eight operational workstreams.
-- Requires V1-V7. Apply to staging first; no live data rows are rewritten.
begin;

do $$
declare c record;
begin
  for c in select conname from pg_constraint
    where conrelid='public.etranom_admin_content'::regclass and contype='c'
      and pg_get_constraintdef(oid) ilike '%content_type%'
  loop execute format('alter table public.etranom_admin_content drop constraint %I',c.conname); end loop;
  alter table public.etranom_admin_content add constraint etranom_admin_content_type_v8_check
  check (content_type in (
    'item','monster','material','recipe','npc','quest','region','skill','class','specialization',
    'shop','event','world_setting','text','dungeon','ruin','tower_encounter','reward_table',
    'monster_ai','dialogue','economy_rule','guild_config','party_config','pvp_config',
    'progression_rule','ban_policy','world_event','class_balance'
  ));
end $$;

create or replace function public.etranom_admin_upsert_content_v1(
  p_content_type text,p_content_id text,p_payload jsonb,p_publish boolean default false
) returns jsonb language plpgsql security definer set search_path=''
as $$
declare old public.etranom_admin_content; nv integer; ns text;
begin
  if auth.uid() is null or not public.etranom_admin_is_authorized_v1('content') then raise exception 'ADMIN_FORBIDDEN'; end if;
  if p_content_type not in ('item','monster','material','recipe','npc','quest','region','skill','class','specialization','shop','event','world_setting','text','dungeon','ruin','tower_encounter','reward_table','monster_ai','dialogue','economy_rule','guild_config','party_config','pvp_config','progression_rule','ban_policy','world_event','class_balance') then raise exception 'INVALID_CONTENT_TYPE'; end if;
  if p_content_id is null or length(trim(p_content_id)) not between 1 and 120 or jsonb_typeof(p_payload) is distinct from 'object' or p_payload->>'id' is distinct from p_content_id then raise exception 'INVALID_CONTENT'; end if;
  if octet_length(p_payload::text)>262144 then raise exception 'CONTENT_TOO_LARGE'; end if;
  select * into old from public.etranom_admin_content where content_type=p_content_type and content_id=p_content_id for update;
  nv:=coalesce(old.version,0)+1; ns:=case when p_publish then 'published' else 'draft' end;
  if old.id is not null then
    insert into public.etranom_admin_content_versions(content_type,content_id,version,payload,status,changed_by)
      values(old.content_type,old.content_id,old.version,old.payload,old.status,auth.uid()) on conflict do nothing;
    update public.etranom_admin_content set payload=p_payload,status=ns,version=nv,updated_by=auth.uid(),updated_at=now(),published_at=case when p_publish then now() else null end where id=old.id;
  else
    insert into public.etranom_admin_content(content_type,content_id,payload,status,version,created_by,updated_by,published_at)
      values(p_content_type,p_content_id,p_payload,ns,nv,auth.uid(),auth.uid(),case when p_publish then now() else null end);
  end if;
  insert into public.etranom_admin_audit_logs(actor_id,action,target_type,target_id,details)
    values(auth.uid(),case when p_publish then 'content_publish' else 'content_save_draft' end,p_content_type,p_content_id,jsonb_build_object('version',nv,'workstream','v8'));
  return jsonb_build_object('content_id',p_content_id,'version',nv,'status',ns);
end; $$;

-- Player access status is a server-side query hook. The game must call this before
-- entering protected gameplay; hard auth/session revocation still requires a deployed
-- Edge Function using SUPABASE_SERVICE_ROLE_KEY and is intentionally not faked here.
create or replace function public.etranom_player_access_status_v1()
returns jsonb language plpgsql stable security definer set search_path=''
as $$
declare b public.etranom_player_bans;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into b from public.etranom_player_bans where player_id=auth.uid() and active=true
    and (expires_at is null or expires_at>now()) limit 1;
  return jsonb_build_object('allowed',not found,'banned',found,
    'reason',case when found then b.reason else null end,
    'expires_at',case when found then b.expires_at else null end);
end; $$;

revoke all on function public.etranom_admin_upsert_content_v1(text,text,jsonb,boolean) from public,anon;
revoke all on function public.etranom_player_access_status_v1() from public,anon;
grant execute on function public.etranom_admin_upsert_content_v1(text,text,jsonb,boolean) to authenticated;
grant execute on function public.etranom_player_access_status_v1() to authenticated;
commit;
