-- ETRANOM OWNER CONTROL V5: content version history, rollback and safe draft removal.
-- Apply only after V1-V4, on a backed-up staging database first.
begin;

create or replace function public.etranom_admin_content_versions_list_v1(
  p_content_type text, p_content_id text
) returns setof jsonb
language plpgsql stable security definer set search_path=''
as $$
begin
  if not public.etranom_admin_is_authorized_v1('content') then raise exception 'ADMIN_FORBIDDEN'; end if;
  return query
    select jsonb_build_object('version',v.version,'status',v.status,'changed_at',v.changed_at,
      'changed_by',v.changed_by,'payload',v.payload)
    from public.etranom_admin_content_versions v
    where v.content_type=p_content_type and v.content_id=p_content_id
    order by v.version desc, v.changed_at desc;
end; $$;

create or replace function public.etranom_admin_content_rollback_v1(
  p_content_type text, p_content_id text, p_version integer
) returns jsonb
language plpgsql security definer set search_path=''
as $$
declare v public.etranom_admin_content_versions; c public.etranom_admin_content; nv integer;
begin
  if not public.etranom_admin_is_authorized_v1('content') then raise exception 'ADMIN_FORBIDDEN'; end if;
  if p_content_type not in ('item','monster','material','recipe','npc','quest','region','skill','class','specialization','shop','event','world_setting','text') then raise exception 'INVALID_CONTENT_TYPE'; end if;
  select * into v from public.etranom_admin_content_versions
    where content_type=p_content_type and content_id=p_content_id and version=p_version
    order by changed_at desc limit 1;
  if not found then raise exception 'VERSION_NOT_FOUND'; end if;
  select * into c from public.etranom_admin_content
    where content_type=p_content_type and content_id=p_content_id for update;
  if not found then raise exception 'CONTENT_NOT_FOUND'; end if;
  insert into public.etranom_admin_content_versions(content_type,content_id,version,payload,status,changed_by)
    values(c.content_type,c.content_id,c.version,c.payload,c.status,auth.uid()) on conflict do nothing;
  nv:=c.version+1;
  update public.etranom_admin_content set payload=v.payload,status='draft',version=nv,
    updated_by=auth.uid(),updated_at=now(),published_at=null
    where id=c.id;
  insert into public.etranom_admin_audit_logs(actor_id,action,target_type,target_id,details)
    values(auth.uid(),'content_rollback',p_content_type,p_content_id,
      jsonb_build_object('restored_version',p_version,'new_version',nv,'status','draft'));
  return jsonb_build_object('ok',true,'content_id',p_content_id,'restored_from',p_version,'new_version',nv,'status','draft');
end; $$;

create or replace function public.etranom_admin_delete_draft_v1(
  p_content_type text, p_content_id text
) returns jsonb
language plpgsql security definer set search_path=''
as $$
declare c public.etranom_admin_content;
begin
  if not public.etranom_admin_is_authorized_v1('content') then raise exception 'ADMIN_FORBIDDEN'; end if;
  select * into c from public.etranom_admin_content
    where content_type=p_content_type and content_id=p_content_id for update;
  if not found then raise exception 'CONTENT_NOT_FOUND'; end if;
  if c.status <> 'draft' then raise exception 'ONLY_DRAFT_CAN_BE_DELETED'; end if;
  delete from public.etranom_admin_content where id=c.id;
  insert into public.etranom_admin_audit_logs(actor_id,action,target_type,target_id,details)
    values(auth.uid(),'content_draft_delete',p_content_type,p_content_id,
      jsonb_build_object('deleted_version',c.version,'payload',c.payload));
  return jsonb_build_object('ok',true,'deleted',p_content_id);
end; $$;

revoke all on function public.etranom_admin_content_versions_list_v1(text,text) from public,anon;
revoke all on function public.etranom_admin_content_rollback_v1(text,text,integer) from public,anon;
revoke all on function public.etranom_admin_delete_draft_v1(text,text) from public,anon;
grant execute on function public.etranom_admin_content_versions_list_v1(text,text) to authenticated;
grant execute on function public.etranom_admin_content_rollback_v1(text,text,integer) to authenticated;
grant execute on function public.etranom_admin_delete_draft_v1(text,text) to authenticated;
commit;
