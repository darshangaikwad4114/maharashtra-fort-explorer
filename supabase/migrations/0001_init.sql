-- Maharashtra Fort Explorer — initial schema
-- Run with: supabase db push   (or paste into the Supabase SQL editor)
-- The initial catalogue is loaded separately by `npm run db:seed`, which uses
-- the service-role key and must never be run from the browser.

create table if not exists public.districts (
  slug text primary key,
  name text not null,
  aka text,
  fort_count integer not null default 0 check (fort_count >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  slug text primary key,
  name_en text not null,
  name_mr text not null,
  sort_order smallint not null default 0
);

create table if not exists public.forts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  name_mr text,
  aliases text[] not null default '{}',
  lat double precision not null check (lat between -90 and 90),
  lon double precision not null check (lon between -180 and 180),
  district_slug text references public.districts (slug) on delete set null,
  district_aka text,
  district_note text,
  district_method text check (district_method in ('inside', 'nearest-boundary', 'unassigned')),
  district_distance_km numeric(6, 2),
  category_slug text references public.categories (slug) on delete set null,
  heritage_class text check (heritage_class in (
    'maratha', 'nizam_shahi', 'yadava', 'shilahara',
    'siddi', 'sultanate', 'portuguese', 'british'
  )),
  elevation_m integer check (elevation_m is null or elevation_m >= 0),
  difficulty text check (difficulty in ('easy', 'moderate', 'hard', 'very_hard')),
  best_season jsonb,
  built text,
  description jsonb,
  accessibility jsonb,
  travel jsonb,
  profile_status text not null default 'catalog' check (profile_status in ('curated', 'catalog')),
  coordinate_status text not null default 'inside' check (coordinate_status in ('inside', 'nearest-boundary', 'flagged')),
  location_warning text,
  flags text[] not null default '{}',
  duplicate_of text[] not null default '{}',
  featured boolean not null default false,
  reviewed_on date,
  source_row integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fort_images (
  id uuid primary key default gen_random_uuid(),
  fort_slug text not null unique references public.forts (slug) on delete cascade,
  src text not null,
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  author text not null,
  license text not null,
  license_url text,
  source_url text not null,
  caption text
);

create table if not exists public.fort_sources (
  id uuid primary key default gen_random_uuid(),
  fort_slug text not null references public.forts (slug) on delete cascade,
  title text not null,
  url text not null,
  publisher text,
  unique (fort_slug, url)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  fort_slug text not null references public.forts (slug) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, fort_slug)
);

create table if not exists public.circuits (
  slug text primary key,
  name text not null,
  name_mr text not null,
  summary text not null,
  summary_mr text not null,
  days text not null,
  difficulty text not null check (difficulty in ('easy', 'moderate', 'hard', 'very_hard')),
  season text not null,
  season_mr text not null,
  note text not null,
  note_mr text not null,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.circuit_forts (
  circuit_slug text not null references public.circuits (slug) on delete cascade,
  fort_slug text not null references public.forts (slug) on delete cascade,
  position smallint not null check (position >= 0),
  primary key (circuit_slug, fort_slug),
  unique (circuit_slug, position)
);

create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  year text not null,
  title text not null,
  title_mr text not null,
  description text not null,
  description_mr text not null,
  source_title text not null,
  source_url text not null,
  source_publisher text,
  position smallint not null default 0,
  unique (year, title)
);

create index if not exists forts_district_slug_idx on public.forts (district_slug);
create index if not exists forts_category_slug_idx on public.forts (category_slug);
create index if not exists forts_profile_status_idx on public.forts (profile_status);
create index if not exists forts_coordinate_status_idx on public.forts (coordinate_status);
create index if not exists forts_lower_name_idx on public.forts (lower(name));
create index if not exists favorites_fort_slug_idx on public.favorites (fort_slug);
create index if not exists fort_sources_fort_slug_idx on public.fort_sources (fort_slug);
create index if not exists circuit_forts_fort_slug_idx on public.circuit_forts (fort_slug);
create index if not exists timeline_events_position_idx on public.timeline_events (position);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists forts_set_updated_at on public.forts;
create trigger forts_set_updated_at
  before update on public.forts
  for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row level security -------------------------------------------------------

alter table public.districts enable row level security;
alter table public.categories enable row level security;
alter table public.forts enable row level security;
alter table public.fort_images enable row level security;
alter table public.fort_sources enable row level security;
alter table public.circuits enable row level security;
alter table public.circuit_forts enable row level security;
alter table public.timeline_events enable row level security;
alter table public.profiles enable row level security;
alter table public.favorites enable row level security;

create policy "Public can read districts"
  on public.districts for select to anon, authenticated using (true);
create policy "Public can read categories"
  on public.categories for select to anon, authenticated using (true);
create policy "Public can read forts"
  on public.forts for select to anon, authenticated using (true);
create policy "Public can read fort images"
  on public.fort_images for select to anon, authenticated using (true);
create policy "Public can read fort sources"
  on public.fort_sources for select to anon, authenticated using (true);
create policy "Public can read circuits"
  on public.circuits for select to anon, authenticated using (true);
create policy "Public can read circuit forts"
  on public.circuit_forts for select to anon, authenticated using (true);
create policy "Public can read timeline"
  on public.timeline_events for select to anon, authenticated using (true);

create policy "Users can read own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can read own favorites"
  on public.favorites for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users can add own favorites"
  on public.favorites for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users can remove own favorites"
  on public.favorites for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Table privileges ---------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select on public.districts, public.categories, public.forts,
  public.fort_images, public.fort_sources, public.circuits,
  public.circuit_forts, public.timeline_events
  to anon, authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert, delete on public.favorites to authenticated;
