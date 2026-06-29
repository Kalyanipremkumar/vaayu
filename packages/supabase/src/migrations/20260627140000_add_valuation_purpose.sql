-- Which value the valuation represents: fair_market | insurance | auction.
alter table public.valuations
  add column if not exists purpose text not null default 'fair_market';
