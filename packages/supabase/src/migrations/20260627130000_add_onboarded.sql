-- Track whether a user has completed onboarding (role selection + tour).
alter table public.user_profiles
  add column if not exists onboarded boolean not null default false;
