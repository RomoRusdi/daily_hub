-- ============================================================================
-- Hub — Supabase schema (per-user, username + password auth)
--
-- Login pakai username + password (tanpa email sungguhan). Setiap user hanya
-- bisa melihat/mengubah datanya sendiri (RLS via auth.uid()).
--
-- ⚠️  WAJIB: di Dashboard → Authentication → Providers → Email, MATIKAN
--     "Confirm email" supaya pendaftaran tidak mengirim email verifikasi.
--
-- Run once in: Supabase Dashboard → SQL Editor → New query → Run.
-- (This DROPs the tables first — only dummy data is lost.)
-- ============================================================================

drop table if exists public.tasks  cascade;
drop table if exists public.events cascade;
drop table if exists public.notes  cascade;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.tasks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null default '',
  due_date   text,               -- 'YYYY-MM-DD'
  due_time   text default '',    -- 'HH:MM'
  priority   text default 'normal',
  reminder   text default '',
  deadline   boolean default false,
  done       boolean default false,
  created_at timestamptz default now()
);

create table public.events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null default '',
  event_date text,               -- 'YYYY-MM-DD'
  event_time text default '',    -- 'HH:MM'
  duration   text default '',
  location   text default '',
  accent     boolean default false,
  created_at timestamptz default now()
);

create table public.notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text default '',
  body       text default '',
  updated_at timestamptz default now()
);

create index if not exists tasks_user_idx  on public.tasks  (user_id);
create index if not exists events_user_idx on public.events (user_id);
create index if not exists notes_user_idx  on public.notes  (user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — each user only sees their own rows.
-- ---------------------------------------------------------------------------
alter table public.tasks  enable row level security;
alter table public.events enable row level security;
alter table public.notes  enable row level security;

create policy "own tasks" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own events" on public.events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own notes" on public.notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Realtime — lets changes sync live across your devices.
-- (Ignore "already member" errors if you re-run this.)
-- ---------------------------------------------------------------------------
do $$ begin
  alter publication supabase_realtime add table public.tasks;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.events;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.notes;
exception when duplicate_object then null; end $$;
