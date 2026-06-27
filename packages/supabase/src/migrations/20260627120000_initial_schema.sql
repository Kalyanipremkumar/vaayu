-- =============================================================================
-- Vaayu — initial schema (Phase 1)
-- Tables, enums, Row Level Security, the on_auth_user_created trigger, and the
-- valuation-uploads storage bucket.
--
-- Conventions:
--   * RLS is ENABLED on every table with explicit policies.
--   * Every auth.uid() is wrapped as (SELECT auth.uid()) for performance.
--   * Regular users never UPDATE/DELETE valuations or write subscriptions —
--     those paths are service_role only (service_role bypasses RLS).
--
-- Safe to run once on an empty project. Idempotent guards are used where simple.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('individual', 'artist', 'gallery', 'enterprise');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.artwork_condition as enum ('excellent', 'good', 'fair', 'poor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.subscription_tier as enum ('free', 'starter', 'pro', 'enterprise');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.subscription_status as enum ('active', 'cancelled', 'past_due');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- user_profiles
-- ----------------------------------------------------------------------------
create table if not exists public.user_profiles (
  id                   uuid primary key references auth.users (id) on delete cascade,
  email                text not null,
  full_name            text,
  role                 public.user_role not null default 'individual',
  free_valuations_used integer not null default 0 check (free_valuations_used >= 0),
  created_at           timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

drop policy if exists "Profiles: select own" on public.user_profiles;
create policy "Profiles: select own"
  on public.user_profiles for select
  using ((select auth.uid()) = id);

drop policy if exists "Profiles: update own" on public.user_profiles;
create policy "Profiles: update own"
  on public.user_profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Profiles: insert own" on public.user_profiles;
create policy "Profiles: insert own"
  on public.user_profiles for insert
  with check ((select auth.uid()) = id);

-- ----------------------------------------------------------------------------
-- valuations
-- ----------------------------------------------------------------------------
create table if not exists public.valuations (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users (id) on delete cascade,
  artwork_image_url     text not null check (length(trim(artwork_image_url)) > 0),
  artist_name           text,
  artist_known          boolean not null default false,
  tradition             text,
  medium                text,
  dimensions_height_cm  numeric(8, 2),
  dimensions_width_cm   numeric(8, 2),
  year_created          integer check (year_created is null or year_created between 0 and 2100),
  condition             public.artwork_condition,
  provenance_notes      text,
  estimated_low_inr     integer check (estimated_low_inr is null or estimated_low_inr >= 0),
  estimated_mid_inr     integer check (estimated_mid_inr is null or estimated_mid_inr >= 0),
  estimated_high_inr    integer check (estimated_high_inr is null or estimated_high_inr >= 0),
  confidence_score      numeric(5, 2) check (confidence_score is null or confidence_score between 0 and 100),
  ai_reasoning          jsonb,
  full_report           text,
  was_paid              boolean not null default false,
  payment_id            text,
  created_at            timestamptz not null default now()
);

create index if not exists valuations_user_id_created_at_idx
  on public.valuations (user_id, created_at desc);

create index if not exists valuations_tradition_idx
  on public.valuations (tradition);

alter table public.valuations enable row level security;

drop policy if exists "Valuations: select own" on public.valuations;
create policy "Valuations: select own"
  on public.valuations for select
  using ((select auth.uid()) = user_id);

drop policy if exists "Valuations: insert own with image" on public.valuations;
create policy "Valuations: insert own with image"
  on public.valuations for insert
  with check (
    (select auth.uid()) = user_id
    and length(trim(artwork_image_url)) > 0
  );

-- NOTE: deliberately NO update/delete policies. With RLS enabled and no
-- permissive policy, regular users cannot UPDATE or DELETE. The server uses the
-- service_role key (which bypasses RLS) to fill in AI results and payment data.

-- ----------------------------------------------------------------------------
-- subscriptions (designed now, only 'free' tier used initially)
-- ----------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users (id) on delete cascade,
  tier                 public.subscription_tier not null default 'free',
  status               public.subscription_status not null default 'active',
  valuations_per_month integer not null default 0 check (valuations_per_month >= 0),
  price_inr            integer not null default 0 check (price_inr >= 0),
  started_at           timestamptz not null default now(),
  expires_at           timestamptz
);

create index if not exists subscriptions_user_id_idx
  on public.subscriptions (user_id);

alter table public.subscriptions enable row level security;

drop policy if exists "Subscriptions: select own" on public.subscriptions;
create policy "Subscriptions: select own"
  on public.subscriptions for select
  using ((select auth.uid()) = user_id);

-- NOTE: no client INSERT/UPDATE/DELETE policies — subscriptions are written
-- only by the payment webhook handler using the service_role key.

-- ----------------------------------------------------------------------------
-- Trigger: create a user_profile automatically on signup
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    'individual'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Storage: private bucket for uploaded artwork images
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'valuation-uploads',
  'valuation-uploads',
  false,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Users may only touch objects under a folder named after their own uid:
--   valuation-uploads/<uid>/<file>
drop policy if exists "Uploads: insert own folder" on storage.objects;
create policy "Uploads: insert own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'valuation-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Uploads: select own folder" on storage.objects;
create policy "Uploads: select own folder"
  on storage.objects for select
  using (
    bucket_id = 'valuation-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Uploads: delete own folder" on storage.objects;
create policy "Uploads: delete own folder"
  on storage.objects for delete
  using (
    bucket_id = 'valuation-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
