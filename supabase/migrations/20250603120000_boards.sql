-- Goobin cloud boards: definitions, play progress, optional geo for discover.

create type public.board_status as enum ('in_progress', 'completed');

create table public.boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  theme_id text not null,
  definition jsonb not null,
  status public.board_status not null default 'in_progress',
  progress jsonb not null default '{"tiles":{}}'::jsonb,
  completed_at timestamptz,
  latitude double precision,
  longitude double precision,
  location_label text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index boards_user_id_idx on public.boards (user_id);
create index boards_discover_idx on public.boards (latitude, longitude)
  where is_public = true and latitude is not null and longitude is not null;

create or replace function public.set_boards_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger boards_updated_at
  before update on public.boards
  for each row
  execute function public.set_boards_updated_at();

alter table public.boards enable row level security;

-- SELECT: own boards + public discover boards with coordinates
create policy "boards_select_own"
  on public.boards
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "boards_select_discover"
  on public.boards
  for select
  to authenticated
  using (
    is_public = true
    and latitude is not null
    and longitude is not null
  );

-- INSERT / UPDATE / DELETE: own boards only (UPDATE requires SELECT above)
create policy "boards_insert_own"
  on public.boards
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "boards_update_own"
  on public.boards
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "boards_delete_own"
  on public.boards
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Storage bucket `tile-photos` (create in Supabase Dashboard or CLI):
--   - Path: {user_id}/{board_id}/{tile_id}.jpg
--   - RLS: authenticated users can INSERT/SELECT/UPDATE/DELETE objects
--     where (storage.foldername(name))[1] = auth.uid()::text
-- Example policies (run after bucket exists):
--
-- create policy "tile_photos_select_own"
--   on storage.objects for select to authenticated
--   using (bucket_id = 'tile-photos' and (storage.foldername(name))[1] = auth.uid()::text);
--
-- create policy "tile_photos_insert_own"
--   on storage.objects for insert to authenticated
--   with check (bucket_id = 'tile-photos' and (storage.foldername(name))[1] = auth.uid()::text);
--
-- create policy "tile_photos_update_own"
--   on storage.objects for update to authenticated
--   using (bucket_id = 'tile-photos' and (storage.foldername(name))[1] = auth.uid()::text);
--
-- create policy "tile_photos_delete_own"
--   on storage.objects for delete to authenticated
--   using (bucket_id = 'tile-photos' and (storage.foldername(name))[1] = auth.uid()::text);
