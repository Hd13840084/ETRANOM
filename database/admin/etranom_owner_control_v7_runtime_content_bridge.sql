-- ETRANOM OWNER CONTROL V7: published admin content -> game runtime bridge.
-- Requires V1-V6. Apply on staging after a database backup.
begin;

-- Extend the content taxonomy without removing existing types.
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid='public.etranom_admin_content'::regclass
      and contype='c' and pg_get_constraintdef(oid) ilike '%content_type%'
  loop
    execute format('alter table public.etranom_admin_content drop constraint %I',c.conname);
  end loop;
  alter table public.etranom_admin_content
    add constraint etranom_admin_content_type_v7_check
    check (content_type in (
      'item','monster','material','recipe','npc','quest','region','skill','class','specialization',
      'shop','event','world_setting','text','dungeon','ruin','tower_encounter','reward_table'
    ));
end $$;

-- Keep the content editor RPC taxonomy aligned with the extended database constraint.
create or replace function public.etranom_admin_upsert_content_v1(
  p_content_type text,p_content_id text,p_payload jsonb,p_publish boolean default false
) returns jsonb language plpgsql security definer set search_path=''
as $$
declare old public.etranom_admin_content; new_version integer; new_status text;
begin
  if auth.uid() is null or not public.etranom_admin_is_authorized_v1('content') then raise exception 'ADMIN_FORBIDDEN'; end if;
  if p_content_type not in ('item','monster','material','recipe','npc','quest','region','skill','class','specialization','shop','event','world_setting','text','dungeon','ruin','tower_encounter','reward_table') then raise exception 'INVALID_CONTENT_TYPE'; end if;
  if p_content_id is null or length(trim(p_content_id)) not between 1 and 120 or p_payload is null or jsonb_typeof(p_payload) is distinct from 'object' or not (p_payload ? 'id') then raise exception 'INVALID_CONTENT'; end if;
  if coalesce(p_payload->>'id','') <> p_content_id then raise exception 'CONTENT_ID_MISMATCH'; end if;
  select * into old from public.etranom_admin_content where content_type=p_content_type and content_id=p_content_id for update;
  new_version:=coalesce(old.version,0)+1; new_status:=case when p_publish then 'published' else 'draft' end;
  if old.id is not null then
    insert into public.etranom_admin_content_versions(content_type,content_id,version,payload,status,changed_by)
      values(old.content_type,old.content_id,old.version,old.payload,old.status,auth.uid()) on conflict do nothing;
    update public.etranom_admin_content set payload=p_payload,status=new_status,version=new_version,updated_by=auth.uid(),updated_at=now(),published_at=case when p_publish then now() else null end where id=old.id;
  else
    insert into public.etranom_admin_content(content_type,content_id,payload,status,version,created_by,updated_by,published_at)
      values(p_content_type,p_content_id,p_payload,new_status,new_version,auth.uid(),auth.uid(),case when p_publish then now() else null end);
  end if;
  insert into public.etranom_admin_audit_logs(actor_id,action,target_type,target_id,details)
    values(auth.uid(),case when p_publish then 'content_publish' else 'content_save_draft' end,p_content_type,p_content_id,jsonb_build_object('version',new_version));
  return jsonb_build_object('content_id',p_content_id,'version',new_version,'status',new_status);
end; $$;

create or replace function public.etranom_admin_content_rollback_v1(
  p_content_type text,p_content_id text,p_version integer
) returns jsonb language plpgsql security definer set search_path=''
as $$
declare v public.etranom_admin_content_versions; c public.etranom_admin_content; nv integer;
begin
  if auth.uid() is null or not public.etranom_admin_is_authorized_v1('content') then raise exception 'ADMIN_FORBIDDEN'; end if;
  if p_content_type not in ('item','monster','material','recipe','npc','quest','region','skill','class','specialization','shop','event','world_setting','text','dungeon','ruin','tower_encounter','reward_table') then raise exception 'INVALID_CONTENT_TYPE'; end if;
  select * into v from public.etranom_admin_content_versions where content_type=p_content_type and content_id=p_content_id and version=p_version order by changed_at desc limit 1;
  if not found then raise exception 'VERSION_NOT_FOUND'; end if;
  select * into c from public.etranom_admin_content where content_type=p_content_type and content_id=p_content_id for update;
  if not found then raise exception 'CONTENT_NOT_FOUND'; end if;
  insert into public.etranom_admin_content_versions(content_type,content_id,version,payload,status,changed_by)
    values(c.content_type,c.content_id,c.version,c.payload,c.status,auth.uid()) on conflict do nothing;
  nv:=c.version+1;
  update public.etranom_admin_content set payload=v.payload,status='draft',version=nv,updated_by=auth.uid(),updated_at=now(),published_at=null where id=c.id;
  insert into public.etranom_admin_audit_logs(actor_id,action,target_type,target_id,details)
    values(auth.uid(),'content_rollback',p_content_type,p_content_id,jsonb_build_object('restored_version',p_version,'new_version',nv,'status','draft'));
  return jsonb_build_object('ok',true,'content_id',p_content_id,'restored_from',p_version,'new_version',nv,'status','draft');
end; $$;

-- Authenticated game clients can read published payloads only. Drafts and archived content remain private.
create or replace function public.etranom_runtime_published_content_v1()
returns setof jsonb
language plpgsql stable security definer set search_path=''
as $$
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  return query
    select jsonb_build_object(
      'content_type',c.content_type,
      'content_id',c.content_id,
      'payload',c.payload,
      'version',c.version,
      'published_at',c.published_at
    )
    from public.etranom_admin_content c
    where c.status='published'
    order by c.content_type,c.content_id;
end; $$;

-- Owner/Admin can archive a published record to remove it from future runtime loads.
create or replace function public.etranom_admin_archive_content_v1(p_content_type text,p_content_id text)
returns jsonb
language plpgsql security definer set search_path=''
as $$
declare c public.etranom_admin_content;
begin
  if auth.uid() is null or not public.etranom_admin_is_authorized_v1('content') then raise exception 'ADMIN_FORBIDDEN'; end if;
  select * into c from public.etranom_admin_content
    where content_type=p_content_type and content_id=p_content_id for update;
  if not found then raise exception 'CONTENT_NOT_FOUND'; end if;
  update public.etranom_admin_content set status='archived',updated_at=now(),updated_by=auth.uid(),published_at=null
    where id=c.id;
  insert into public.etranom_admin_content_versions(content_type,content_id,version,payload,status,changed_by)
    values(c.content_type,c.content_id,c.version,c.payload,'archived',auth.uid()) on conflict do nothing;
  insert into public.etranom_admin_audit_logs(actor_id,action,target_type,target_id,details)
    values(auth.uid(),'content_archive',p_content_type,p_content_id,jsonb_build_object('previous_status',c.status,'version',c.version));
  return jsonb_build_object('ok',true,'content_id',p_content_id,'status','archived');
end; $$;

revoke all on function public.etranom_admin_upsert_content_v1(text,text,jsonb,boolean) from public,anon;
revoke all on function public.etranom_admin_content_rollback_v1(text,text,integer) from public,anon;
grant execute on function public.etranom_admin_upsert_content_v1(text,text,jsonb,boolean) to authenticated;
grant execute on function public.etranom_admin_content_rollback_v1(text,text,integer) to authenticated;
revoke all on function public.etranom_runtime_published_content_v1() from public,anon;
revoke all on function public.etranom_admin_archive_content_v1(text,text) from public,anon;
grant execute on function public.etranom_runtime_published_content_v1() to authenticated;
grant execute on function public.etranom_admin_archive_content_v1(text,text) to authenticated;
commit;
