-- ETRANOM: safe player save table setup (idempotent)
-- Run in Supabase SQL Editor. Does not delete or overwrite existing player saves.
create table if not exists public.game_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  save_data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.game_saves enable row level security;

drop policy if exists "Players can read own game save" on public.game_saves;
create policy "Players can read own game save"
  on public.game_saves for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Players can insert own game save" on public.game_saves;
create policy "Players can insert own game save"
  on public.game_saves for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Players can update own game save" on public.game_saves;
create policy "Players can update own game save"
  on public.game_saves for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Players can delete own game save" on public.game_saves;
create policy "Players can delete own game save"
  on public.game_saves for delete
  to authenticated
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.game_saves to authenticated;
