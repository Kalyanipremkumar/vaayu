-- Payment ledger for audit/reconciliation (written by the server only).
create table if not exists public.payments (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references auth.users (id) on delete set null,
  provider             text not null default 'razorpay',
  provider_order_id    text,
  provider_payment_id  text unique,
  amount               integer,
  currency             text,
  status               text not null default 'created',
  created_at           timestamptz not null default now()
);

create index if not exists payments_user_id_idx on public.payments (user_id);

alter table public.payments enable row level security;

drop policy if exists "Payments: select own" on public.payments;
create policy "Payments: select own"
  on public.payments for select
  using ((select auth.uid()) = user_id);
