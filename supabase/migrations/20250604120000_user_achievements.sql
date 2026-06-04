-- User achievements and free-space unlock flag.

create table public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  free_space_unlocked boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.user_achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id text not null,
  earned_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create index user_achievements_user_id_idx on public.user_achievements (user_id);

alter table public.user_profiles enable row level security;
alter table public.user_achievements enable row level security;

create policy "Users read own profile"
  on public.user_profiles for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert own profile"
  on public.user_profiles for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update own profile"
  on public.user_profiles for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users read own achievements"
  on public.user_achievements for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert own achievements"
  on public.user_achievements for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update own achievements"
  on public.user_achievements for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
