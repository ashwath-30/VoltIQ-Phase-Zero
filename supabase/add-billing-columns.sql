-- Adds plan/subscription tracking to profiles. Usage limits themselves
-- (uploads this month, chat messages this month) are NOT stored as
-- separate counters — they're computed on the fly from the real bills
-- and chats tables, so there's nothing that can drift out of sync with
-- what actually happened.

alter table public.profiles
  add column if not exists plan text not null default 'free' check (plan in ('free', 'pro')),
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;
