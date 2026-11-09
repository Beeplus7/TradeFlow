-- Phase 5–6 gap close: discipline, eyes boat scans, recoup, billing prefs

create table if not exists public.discipline_states (
  user_id uuid primary key references auth.users (id) on delete cascade,
  score numeric not null default 100,
  lock_kind text check (
    lock_kind is null
    or lock_kind in ('tilt', 'fomo', 'revenge', 'overtrade', 'guardian_ignore')
  ),
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.discipline_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.wallet_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  wallet_hint text,
  score numeric not null default 0,
  scanned_at timestamptz not null default now()
);

create table if not exists public.recoup_plans (
  user_id uuid primary key references auth.users (id) on delete cascade,
  day_index int not null default 1 check (day_index between 1 and 18),
  target_gbp numeric not null default 50,
  recovered_gbp numeric not null default 0,
  status text not null default 'active'
    check (status in ('active', 'complete', 'paused')),
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_prefs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'starter'
    check (plan in ('starter', 'pro', 'elite', 'hybrid')),
  status text not null default 'paper'
    check (status in ('paper', 'active', 'past_due')),
  updated_at timestamptz not null default now()
);

alter table public.discipline_states enable row level security;
alter table public.discipline_events enable row level security;
alter table public.wallet_scans enable row level security;
alter table public.recoup_plans enable row level security;
alter table public.billing_prefs enable row level security;

create policy "discipline_states_own" on public.discipline_states
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "discipline_events_own" on public.discipline_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wallet_scans_own" on public.wallet_scans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "recoup_own" on public.recoup_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "billing_own" on public.billing_prefs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

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
  insert into public.guardian_states (user_id) values (new.id);
  insert into public.exchange_connections (user_id, venue, paper_mode, label)
  values (new.id, 'paper', true, 'Paper desk');
  insert into public.discipline_states (user_id) values (new.id);
  insert into public.recoup_plans (user_id) values (new.id);
  insert into public.billing_prefs (user_id) values (new.id);
  return new;
end;
$$;
