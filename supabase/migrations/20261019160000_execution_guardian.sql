-- Phase 4 — Execution + Guardian (paper-first)

create table if not exists public.exchange_connections (
  user_id uuid primary key references auth.users (id) on delete cascade,
  venue text not null check (venue in ('binance', 'bybit', 'paper')),
  paper_mode boolean not null default true,
  label text,
  key_hint text,
  updated_at timestamptz not null default now()
);

create table if not exists public.guardian_states (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null default 'protected'
    check (status in ('protected', 'triggered')),
  risk_pct numeric not null default 15 check (risk_pct in (8, 15, 25)),
  peak_equity_gbp numeric not null default 35,
  equity_gbp numeric not null default 35,
  drawdown_pct numeric not null default 0,
  vault_gbp numeric not null default 10,
  locked_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.exchange_connections enable row level security;
alter table public.guardian_states enable row level security;

create policy "exchange_own" on public.exchange_connections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "guardian_own" on public.guardian_states
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-seed guardian + paper connection with new profiles
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
  return new;
end;
$$;
