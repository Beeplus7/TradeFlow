-- Adopt onboarding-os: experience level + ClearID fields
alter table public.profiles
  add column if not exists experience_level text
    check (experience_level in ('beginner', 'rebuild', 'active')),
  add column if not exists clear_id text,
  add column if not exists exchange_mode text
    check (exchange_mode in ('connected', 'simulator', null));
