-- ============================================================================
-- Hub — Supabase schema v3 (PER-USER + RLS ketat + Web Push reminder)
--
-- Baru di v3: kolom reminder terjadwal di `tasks` (reminder_minutes,
-- remind_at, reminder_sent) + tabel `push_subscriptions` untuk Web Push.
--
-- Model keamanan: setiap baris dimiliki satu user (kolom user_id, default
-- auth.uid()). Policy hanya untuk role `authenticated` — role `anon` TIDAK
-- punya akses sama sekali, jadi anon key tanpa login tidak bisa membaca atau
-- menulis apa pun.
--
-- Login di app memakai username + password (username dipetakan ke email
-- internal `username@hub.local`; tidak ada email sungguhan yang dikirim).
--
-- ⚠️  WAJIB setelah edit file ini:
--     1. Run ulang seluruh file di Dashboard → SQL Editor. Script men-DROP
--        tabel lama → semua data di tabel hilang (data dummy akan di-seed
--        ulang otomatis oleh app saat login).
--     2. Authentication → Providers → Email: pastikan provider Email aktif
--        dan "Confirm email" DIMATIKAN (agar daftar username langsung jadi).
--
-- Safe re-run: file ini idempotent (drop lalu create).
-- ============================================================================

drop table if exists public.tasks  cascade;
drop table if exists public.events cascade;
drop table if exists public.notes  cascade;
drop table if exists public.push_subscriptions cascade;

-- ---------------------------------------------------------------------------
-- Tables — user_id default auth.uid(): insert dari client yang login otomatis
-- memiliki pemilik yang benar, meskipun client lupa mengirim user_id.
-- ---------------------------------------------------------------------------
create table public.tasks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title      text not null default '',
  due_date   text,               -- 'YYYY-MM-DD'
  due_time   text default '',    -- 'HH:MM'
  priority   text default 'normal',
  -- Reminder: offset menit sebelum due (null = tanpa reminder), waktu pasti
  -- notifikasi (dihitung client dari due_date+due_time − offset), dan penanda
  -- agar Edge Function `send-reminders` tidak mengirim dua kali.
  reminder_minutes integer,
  remind_at        timestamptz,
  reminder_sent    boolean not null default false,
  deadline   boolean default false,
  done       boolean default false,
  created_at timestamptz default now()
);

create table public.events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
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
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title      text default '',
  body       text default '',
  updated_at timestamptz default now()
);

-- Langganan Web Push per device. Satu user bisa punya beberapa (iPhone,
-- laptop, …); `endpoint` unik jadi subscribe ulang = upsert, bukan duplikat.
create table public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  endpoint     text not null unique,
  subscription jsonb not null,   -- objek PushSubscription utuh (keys p256dh/auth)
  created_at   timestamptz default now()
);

create index if not exists tasks_user_idx  on public.tasks  (user_id);
create index if not exists events_user_idx on public.events (user_id);
create index if not exists notes_user_idx  on public.notes  (user_id);
create index if not exists push_subs_user_idx on public.push_subscriptions (user_id);

-- Query jatuh-tempo Edge Function: hanya baris yang belum terkirim.
create index if not exists tasks_remind_due_idx
  on public.tasks (remind_at) where reminder_sent = false;

-- ---------------------------------------------------------------------------
-- Row Level Security — HANYA role `authenticated`, dan hanya baris miliknya.
-- Tidak ada policy untuk `anon` → anon key tanpa sesi login ditolak total.
-- ---------------------------------------------------------------------------
alter table public.tasks  enable row level security;
alter table public.events enable row level security;
alter table public.notes  enable row level security;
alter table public.push_subscriptions enable row level security;

create policy "own tasks" on public.tasks
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own events" on public.events
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own notes" on public.notes
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Edge Function membaca tabel ini lewat service role (bypass RLS); client
-- hanya bisa mengelola langganan miliknya sendiri.
create policy "own push subscriptions" on public.push_subscriptions
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Realtime — sync live antar-device. postgres_changes menghormati RLS, jadi
-- user hanya menerima perubahan barisnya sendiri.
-- (Abaikan error "already member" bila di-run ulang.)
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