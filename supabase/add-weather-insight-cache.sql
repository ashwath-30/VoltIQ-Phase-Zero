-- Caches the full weather-vs-baseline usage breakdown, so the Analytics
-- page can display it instantly instead of re-running the multi-API
-- regression (geocoding + NOAA lookups per billing month) on every page
-- load. Refreshed whenever checkWeatherInsightForUser runs — daily via
-- the cron job, or on-demand via /api/weather-insights.
alter table public.profiles
  add column if not exists weather_insight_cache jsonb;
