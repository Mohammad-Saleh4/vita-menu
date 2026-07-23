-- Run once in the Supabase SQL editor to enable menu item photo uploads.

insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

create policy "Public can view menu images"
on storage.objects for select
to public
using (bucket_id = 'menu-images');

create policy "Owners can upload menu images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'menu-images'
  and (storage.foldername(name))[1] in (
    select id::text from "Restaurant" where "userId" = auth.uid()::text
  )
);

create policy "Owners can update menu images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'menu-images'
  and (storage.foldername(name))[1] in (
    select id::text from "Restaurant" where "userId" = auth.uid()::text
  )
);

create policy "Owners can delete menu images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'menu-images'
  and (storage.foldername(name))[1] in (
    select id::text from "Restaurant" where "userId" = auth.uid()::text
  )
);
