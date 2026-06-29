-- Artist Mode pricing history. Each row is one run of the artist pricing
-- calculator, saved client-side (RLS-restricted to the owner). Free/unmetered
-- in Phase 1 — no payment columns. The full ArtistPricingResult is stored in
-- `result` (jsonb); the scalar columns drive the dashboard list cheaply.

create table if not exists public.artist_pricings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  artwork_image_url text,
  tradition text,
  medium text,
  dimensions_height_cm numeric,
  dimensions_width_cm numeric,
  career_stage text,
  posture text,
  ask_inr integer not null,
  floor_inr integer not null,
  ceiling_inr integer not null,
  per_sqft_inr integer,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists artist_pricings_user_created_idx
  on public.artist_pricings (user_id, created_at desc);

alter table public.artist_pricings enable row level security;

-- Owner-only access. auth.uid() is wrapped in a subselect so Postgres caches it
-- once per statement rather than re-evaluating per row.
create policy "Users can read own artist pricings"
  on public.artist_pricings for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert own artist pricings"
  on public.artist_pricings for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own artist pricings"
  on public.artist_pricings for delete
  using ((select auth.uid()) = user_id);
