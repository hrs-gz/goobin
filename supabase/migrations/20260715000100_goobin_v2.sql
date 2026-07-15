-- Goobin v2: serverside boards addressed by 6-digit join code, no serverside
-- play progress (photos/progress are client-only per spec), publish flag,
-- board_events hook, and anon-facing RPCs.
--
-- Pre-launch: destructive changes are acceptable.

-- ---------------------------------------------------------------------------
-- boards: reshape to spec v2
-- ---------------------------------------------------------------------------

-- Progress + status are client-only now.
alter table public.boards drop column if exists progress;
alter table public.boards drop column if exists status;
alter table public.boards drop column if exists completed_at;
drop type if exists public.board_status;

-- Grid size (3x3 or 5x5).
alter table public.boards
  add column if not exists grid_size smallint not null default 5;
alter table public.boards
  drop constraint if exists boards_grid_size_check;
alter table public.boards
  add constraint boards_grid_size_check check (grid_size in (3, 5));

-- Publish timestamp (is_public already exists from v1).
alter table public.boards
  add column if not exists published_at timestamptz;

-- Constrain theme_id to the four spec themes.
-- (Pre-launch: any legacy rows with off-spec themes are cleared.)
delete from public.boards
  where theme_id not in ('park', 'museum', 'zoo', 'city');
alter table public.boards
  drop constraint if exists boards_theme_id_check;
alter table public.boards
  add constraint boards_theme_id_check
  check (theme_id in ('park', 'museum', 'zoo', 'city'));

-- ---------------------------------------------------------------------------
-- Join codes: unique 6-digit numeric string, leading zeros preserved.
-- ---------------------------------------------------------------------------

alter table public.boards
  add column if not exists join_code text;

create or replace function public.generate_join_code()
returns text
language plpgsql
as $$
declare
  candidate text;
begin
  loop
    candidate := lpad(floor(random() * 1000000)::int::text, 6, '0');
    exit when not exists (
      select 1 from public.boards where join_code = candidate
    );
  end loop;
  return candidate;
end;
$$;

create or replace function public.set_board_join_code()
returns trigger
language plpgsql
as $$
begin
  if new.join_code is null then
    new.join_code := public.generate_join_code();
  end if;
  return new;
end;
$$;

-- Backfill any existing rows before enforcing NOT NULL / UNIQUE.
update public.boards
  set join_code = public.generate_join_code()
  where join_code is null;

alter table public.boards alter column join_code set not null;
alter table public.boards
  drop constraint if exists boards_join_code_key;
alter table public.boards
  add constraint boards_join_code_key unique (join_code);

drop trigger if exists boards_join_code on public.boards;
create trigger boards_join_code
  before insert on public.boards
  for each row
  execute function public.set_board_join_code();

-- ---------------------------------------------------------------------------
-- board_events: analytics hook (opens now; exports/completions later).
-- RLS on, no policies -> reachable only via SECURITY DEFINER RPCs.
-- ---------------------------------------------------------------------------

create table if not exists public.board_events (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  event_type text not null check (event_type in ('open')),
  created_at timestamptz not null default now()
);

create index if not exists board_events_board_id_idx
  on public.board_events (board_id);

alter table public.board_events enable row level security;

-- ---------------------------------------------------------------------------
-- RLS on boards: keep own-row policies, drop anon discover select
-- (all anon reads go through RPCs below).
-- ---------------------------------------------------------------------------

drop policy if exists "boards_select_discover" on public.boards;

-- ---------------------------------------------------------------------------
-- RPCs (SECURITY DEFINER, empty search_path, granted to anon + authenticated)
-- ---------------------------------------------------------------------------

-- Fetch a board by its join code. The code is the capability, so this returns
-- unpublished boards too, and never exposes user_id.
create or replace function public.get_board_by_code(p_code text)
returns table (
  id uuid,
  title text,
  theme_id text,
  grid_size smallint,
  definition jsonb,
  latitude double precision,
  longitude double precision,
  location_label text,
  join_code text
)
language sql
security definer
set search_path = ''
as $$
  select b.id, b.title, b.theme_id, b.grid_size, b.definition,
         b.latitude, b.longitude, b.location_label, b.join_code
  from public.boards b
  where b.join_code = p_code;
$$;

-- Record that a board was opened (client guards once per session).
create or replace function public.record_board_open(p_code text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.board_events (board_id, event_type)
  select id, 'open' from public.boards where join_code = p_code;
end;
$$;

-- Public boards within a radius (default 0.5 mi = 804.67 m), nearest first.
create or replace function public.boards_nearby(
  p_lat double precision,
  p_lng double precision,
  p_radius_m double precision default 804.67
)
returns table (
  id uuid,
  title text,
  theme_id text,
  grid_size smallint,
  join_code text,
  latitude double precision,
  longitude double precision,
  location_label text,
  distance_m double precision
)
language sql
security definer
set search_path = ''
as $$
  select b.id, b.title, b.theme_id, b.grid_size, b.join_code,
         b.latitude, b.longitude, b.location_label,
         (6371000 * 2 * asin(sqrt(
           power(sin(radians(b.latitude - p_lat) / 2), 2) +
           cos(radians(p_lat)) * cos(radians(b.latitude)) *
           power(sin(radians(b.longitude - p_lng) / 2), 2)
         ))) as distance_m
  from public.boards b
  where b.is_public = true
    and b.latitude is not null
    and b.longitude is not null
    and (6371000 * 2 * asin(sqrt(
          power(sin(radians(b.latitude - p_lat) / 2), 2) +
          cos(radians(p_lat)) * cos(radians(b.latitude)) *
          power(sin(radians(b.longitude - p_lng) / 2), 2)
        ))) <= p_radius_m
  order by distance_m asc
  limit 50;
$$;

-- Open counts for the caller's own boards (My Boards page).
create or replace function public.get_my_board_open_counts()
returns table (board_id uuid, open_count bigint)
language sql
security definer
set search_path = ''
as $$
  select b.id, count(e.id)
  from public.boards b
  left join public.board_events e
    on e.board_id = b.id and e.event_type = 'open'
  where b.user_id = (select auth.uid())
  group by b.id;
$$;

revoke all on function public.get_board_by_code(text) from public;
revoke all on function public.record_board_open(text) from public;
revoke all on function public.boards_nearby(double precision, double precision, double precision) from public;
revoke all on function public.get_my_board_open_counts() from public;

grant execute on function public.get_board_by_code(text) to anon, authenticated;
grant execute on function public.record_board_open(text) to anon, authenticated;
grant execute on function public.boards_nearby(double precision, double precision, double precision) to anon, authenticated;
grant execute on function public.get_my_board_open_counts() to authenticated;
