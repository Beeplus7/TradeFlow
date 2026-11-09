-- TradFlow core schema (Phase 1)
-- Isolated tables for the OS journey. Auth users live in auth.users.

create extension if not exists "pgcrypto";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  risk_profile text check (risk_profile in ('conservative', 'balanced', 'aggressive')),
  risk_pct numeric check (risk_pct in (8, 15, 25)),
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Mon–Fri FlowChain (THE HEART)
create table if not exists public.journeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date not null,
  mon_done boolean not null default false,
  tue_done boolean not null default false,
  wed_done boolean not null default false,
  thu_done boolean not null default false,
  fri_done boolean not null default false,
  go_score numeric,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null check (mode in ('sim', 'live')),
  venue text check (venue in ('binance', 'bybit', 'paper')),
  symbol text not null,
  side text not null check (side in ('buy', 'sell')),
  notional_gbp numeric not null,
  pnl_gbp numeric default 0,
  traded_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.elites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  wallet_address text,
  score numeric default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.simulations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stake_gbp numeric not null default 5,
  result_gbp numeric,
  discipline_proof boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.nudges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.legacy_vaults (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  reinvest_gbp numeric not null default 0,
  smile_gbp numeric not null default 0,
  hmrc_gbp numeric not null default 0,
  vault_gbp numeric not null default 0,
  vault_unlock_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.timeline (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_key text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Finance dish balances
create table if not exists public.finance_dishes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  fake_gbp numeric not null default 5,
  live_gbp numeric not null default 35,
  safety_gbp numeric not null default 10,
  day_spent_gbp numeric not null default 0,
  day_cap_gbp numeric not null default 7,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.journeys enable row level security;
alter table public.trades enable row level security;
alter table public.elites enable row level security;
alter table public.simulations enable row level security;
alter table public.nudges enable row level security;
alter table public.legacy_vaults enable row level security;
alter table public.timeline enable row level security;
alter table public.finance_dishes enable row level security;

create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "journeys_own" on public.journeys
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "trades_own" on public.trades
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "elites_own" on public.elites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "simulations_own" on public.simulations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "nudges_own" on public.nudges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "legacy_own" on public.legacy_vaults
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "timeline_own" on public.timeline
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "finance_own" on public.finance_dishes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  insert into public.finance_dishes (user_id) values (new.id);
  insert into public.legacy_vaults (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
