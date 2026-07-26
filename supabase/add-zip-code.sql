-- Mission 1, Phase 1: adds a ZIP code field so we can look up
-- location-specific historical weather for the degree-day regression.
alter table public.profiles
  add column if not exists zip_code text;
