-- ETRANOM v164.3: optimistic concurrency + durable save history + conflict quarantine.
-- Run once after game_saves exists. Existing saves are not overwritten or deleted.
begin;

do $$
begin
  if to_regclass('public.game_saves') is null then
    raise exception 'ETRANOM prerequisite missing: public.game_saves';
  end if;
end $$;

create table if not exists public.game_save_history (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  save_data jsonb not null,
  save_updated_at timestamptz,
  archived_at timestamptz not null default clock_timestamp(),
  archive_reason text not null default 'update'
);
create index if not exists game_save_history_user_archived_idx
  on public.game_save_history(user_id, archived_at desc, id desc);
alter table public.game_save_history enable row level security;
drop policy if exists "Players can read own save history" on public.game_save_history;
create policy "Players can read own save history" on public.game_save_history
  for select to authenticated using (auth.uid() = user_id);
grant select on public.game_save_history to authenticated;

create table if not exists public.game_save_conflicts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  base_updated_at timestamptz,
  server_updated_at timestamptz,
  client_save_data jsonb not null,
  server_save_data jsonb,
  received_at timestamptz not null default clock_timestamp(),
  status text not null default 'preserved' check (status in ('preserved','reviewed','recovered'))
);
create index if not exists game_save_conflicts_user_received_idx
  on public.game_save_conflicts(user_id, received_at desc);
alter table public.game_save_conflicts enable row level security;
drop policy if exists "Players can read own save conflicts" on public.game_save_conflicts;
create policy "Players can read own save conflicts" on public.game_save_conflicts
  for select to authenticated using (auth.uid() = user_id);
grant select on public.game_save_conflicts to authenticated;

create or replace function public.etranom_archive_game_save_v1643()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    -- Explicit character deletion stays a deletion; do not block auth-user cascades.
    return old;
  end if;
  if old.save_data is distinct from new.save_data then
    insert into public.game_save_history(user_id,save_data,save_updated_at,archive_reason)
    values(old.user_id,old.save_data,old.updated_at,'update');
    -- Keep the most recent 100 snapshots per account to bound storage growth.
    delete from public.game_save_history h
    where h.user_id=new.user_id
      and h.id not in (
        select id from public.game_save_history
        where user_id=new.user_id
        order by archived_at desc,id desc limit 100
      );
  end if;
  return new;
end;
$$;

drop trigger if exists etranom_archive_game_save_v1643 on public.game_saves;
create trigger etranom_archive_game_save_v1643
before update on public.game_saves
for each row execute function public.etranom_archive_game_save_v1643();

create or replace function public.etranom_save_game_state_v1643(
  p_save_data jsonb,
  p_expected_updated_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_current public.game_saves%rowtype;
  v_next_updated_at timestamptz;
begin
  if v_uid is null then raise exception 'auth_required'; end if;
  if p_save_data is null or jsonb_typeof(p_save_data) <> 'object'
     or jsonb_typeof(p_save_data->'character') <> 'object' then
    raise exception 'invalid_save_payload';
  end if;

  select * into v_current from public.game_saves
  where user_id=v_uid for update;

  if not found then
    if p_expected_updated_at is not null then
      insert into public.game_save_conflicts(user_id,base_updated_at,server_updated_at,client_save_data,server_save_data)
      values(v_uid,p_expected_updated_at,null,p_save_data,null);
      return jsonb_build_object('success',false,'conflict',true,'server_state',null,'server_updated_at',null);
    end if;
    v_next_updated_at:=clock_timestamp();
    begin
      insert into public.game_saves(user_id,save_data,updated_at)
      values(v_uid,p_save_data,v_next_updated_at);
    exception when unique_violation then
      -- Another first-save request created the row after our initial read.
      select * into v_current from public.game_saves where user_id=v_uid for update;
      insert into public.game_save_conflicts(user_id,base_updated_at,server_updated_at,client_save_data,server_save_data)
      values(v_uid,null,v_current.updated_at,p_save_data,v_current.save_data);
      return jsonb_build_object('success',false,'conflict',true,
        'server_state',v_current.save_data,'server_updated_at',v_current.updated_at);
    end;
    return jsonb_build_object('success',true,'conflict',false,'updated_at',v_next_updated_at);
  end if;

  if p_expected_updated_at is null or v_current.updated_at is distinct from p_expected_updated_at then
    insert into public.game_save_conflicts(user_id,base_updated_at,server_updated_at,client_save_data,server_save_data)
    values(v_uid,p_expected_updated_at,v_current.updated_at,p_save_data,v_current.save_data);
    return jsonb_build_object('success',false,'conflict',true,
      'server_state',v_current.save_data,'server_updated_at',v_current.updated_at);
  end if;

  v_next_updated_at:=clock_timestamp();
  update public.game_saves set save_data=p_save_data,updated_at=v_next_updated_at
  where user_id=v_uid;
  return jsonb_build_object('success',true,'conflict',false,'updated_at',v_next_updated_at);
end;
$$;

revoke all on function public.etranom_save_game_state_v1643(jsonb,timestamptz) from public,anon;
grant execute on function public.etranom_save_game_state_v1643(jsonb,timestamptz) to authenticated;

-- Block old/cached browser builds from bypassing the version check with direct upsert.
-- Existing SECURITY DEFINER game RPCs continue to update game_saves server-side.
revoke insert, update on public.game_saves from authenticated;
grant select, delete on public.game_saves to authenticated;

commit;
