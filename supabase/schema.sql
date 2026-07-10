-- VoltIQ database schema
-- Run this once in your Supabase project's SQL Editor.
-- Safe to re-run: uses "if not exists" / "or replace" everywhere possible.

-- ============================================================
-- 1. PROFILES (extends Supabase's built-in auth.users table)
-- ============================================================
-- Supabase already has a built-in "auth.users" table that handles
-- login/passwords. We don't touch that table directly — instead we
-- create our own "profiles" table that stores the extra info VoltIQ
-- needs (address, home size, solar ownership, etc.), linked 1-to-1
-- to each auth user by matching ids.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  address text default '',
  utility_provider text default '',
  home_size integer default 0,
  occupants integer default 1,
  has_solar boolean default false,
  has_battery boolean default false,
  has_ev boolean default false,
  preferred_units text default 'imperial' check (preferred_units in ('imperial', 'metric')),
  avatar_url text,
  created_at timestamptz default now()
);

-- Whenever someone signs up (a new row appears in auth.users),
-- automatically create a matching profile row for them.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. BILLS
-- ============================================================
create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  upload_date timestamptz default now(),
  billing_period text not null,
  billing_period_label text not null,
  total_cost numeric not null default 0,
  total_kwh numeric not null default 0,
  peak_usage_kwh numeric default 0,
  off_peak_usage_kwh numeric default 0,
  pdf_name text,
  status text default 'processing' check (status in ('processed', 'processing', 'error')),
  created_at timestamptz default now()
);

-- ============================================================
-- 3. FORECASTS
-- ============================================================
create table if not exists public.forecasts (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references public.bills(id) on delete cascade,
  predicted_cost numeric not null,
  predicted_kwh numeric not null,
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  period text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- 4. RECOMMENDATIONS
-- ============================================================
create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references public.bills(id) on delete cascade,
  title text not null,
  description text not null,
  estimated_savings numeric not null default 0,
  priority text not null check (priority in ('high', 'medium', 'low')),
  category text not null check (category in ('hvac', 'solar', 'battery', 'ev', 'appliance', 'behavior')),
  created_at timestamptz default now()
);

-- ============================================================
-- 5. CHATS
-- ============================================================
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  sources text[],
  "timestamp" timestamptz default now(),
  created_at timestamptz default now()
);

-- ============================================================
-- 6. NOTIFICATIONS
-- ============================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('usage', 'forecast', 'hvac', 'solar', 'ev', 'system')),
  title text not null,
  description text not null,
  "timestamp" timestamptz default now(),
  read boolean default false,
  severity text not null check (severity in ('info', 'warning', 'critical')),
  created_at timestamptz default now()
);

-- ============================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================
-- This is the important safety part: without these rules, ANY
-- logged-in user could read or edit ANY other user's data. These
-- policies lock every table down so people can only ever see
-- and change their own rows.

alter table public.profiles enable row level security;
alter table public.bills enable row level security;
alter table public.forecasts enable row level security;
alter table public.recommendations enable row level security;
alter table public.chats enable row level security;
alter table public.notifications enable row level security;

-- Profiles: a user can only see/edit their own profile
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Bills: a user can only see/edit/insert/delete their own bills
drop policy if exists "Users can manage own bills" on public.bills;
create policy "Users can manage own bills" on public.bills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Forecasts: access is based on owning the related bill
drop policy if exists "Users can manage own forecasts" on public.forecasts;
create policy "Users can manage own forecasts" on public.forecasts
  for all using (
    exists (select 1 from public.bills where bills.id = forecasts.bill_id and bills.user_id = auth.uid())
  );

-- Recommendations: same pattern, based on owning the related bill
drop policy if exists "Users can manage own recommendations" on public.recommendations;
create policy "Users can manage own recommendations" on public.recommendations
  for all using (
    exists (select 1 from public.bills where bills.id = recommendations.bill_id and bills.user_id = auth.uid())
  );

-- Chats: a user can only see/edit their own chat messages
drop policy if exists "Users can manage own chats" on public.chats;
create policy "Users can manage own chats" on public.chats
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Notifications: a user can only see/edit their own notifications
drop policy if exists "Users can manage own notifications" on public.notifications;
create policy "Users can manage own notifications" on public.notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
