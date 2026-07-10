-- Run this in the SQL Editor AFTER creating a Storage bucket named "bills"
-- (see README for the dashboard steps to create the bucket itself — buckets
-- can't be created from SQL in the free tier the same way tables can).
--
-- These policies make sure each user can only upload, view, or delete
-- files inside their OWN folder within the bucket (files are stored at
-- a path like "user-id/filename.pdf").

drop policy if exists "Users can upload own bills" on storage.objects;
create policy "Users can upload own bills"
on storage.objects for insert
with check (bucket_id = 'bills' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can view own bills" on storage.objects;
create policy "Users can view own bills"
on storage.objects for select
using (bucket_id = 'bills' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete own bills" on storage.objects;
create policy "Users can delete own bills"
on storage.objects for delete
using (bucket_id = 'bills' and (storage.foldername(name))[1] = auth.uid()::text);
