-- Extends the handle_new_user() trigger from Step 1 (which already
-- auto-creates a profile row with name/email whenever someone signs up)
-- to ALSO create a welcome notification nudging them to fill in the rest
-- of their profile (home size, occupants, solar/battery/EV). The trigger
-- itself doesn't need to change — just the function it calls.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''));

  insert into public.notifications (user_id, type, title, description, severity, read, "timestamp")
  values (
    new.id,
    'system',
    'Welcome to VoltIQ — complete your profile',
    'Add your home size, occupants, and equipment details (solar, battery, EV) so your forecasts, Energy Health Score, and comparisons to similar homes are accurate from the start.',
    'info',
    false,
    now()
  );

  return new;
end;
$$ language plpgsql security definer;

-- The trigger itself already exists from Step 1 and doesn't need to be
-- recreated — it already calls handle_new_user(), which now does more.
