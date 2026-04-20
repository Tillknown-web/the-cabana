-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- sessions
-- One row per event night. session_id is a short human-readable
-- slug (e.g. "2026-july") used in URLs and KV keys.
-- ============================================================
create table public.sessions (
  session_id text primary key,
  event_date date not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- session_state
-- Single row per session. Tracks which card is live and which
-- have been released. Written only by Edge Functions (service role).
-- ============================================================
create table public.session_state (
  session_id text primary key references public.sessions(session_id) on delete cascade,
  current_card text not null default 'waiting',
  released_cards text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- ============================================================
-- guests
-- One row per checked-in guest. id = auth.uid() of their
-- anonymous Supabase Auth session so RLS can scope by user.
-- ============================================================
create table public.guests (
  id uuid primary key,
  session_id text not null references public.sessions(session_id) on delete cascade,
  name text not null,
  current_card text not null default 'welcome',
  checked_in_at timestamptz not null default now()
);

-- ============================================================
-- photos
-- One row per uploaded photo. storage_path is the R2/Storage
-- object key: {sessionId}/{guestId}/{course}.jpg
-- course values: guest | pour | bite | cut | finish | booth
-- ============================================================
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.sessions(session_id) on delete cascade,
  guest_id uuid not null references public.guests(id) on delete cascade,
  course text not null check (course in ('guest', 'pour', 'bite', 'cut', 'finish', 'booth')),
  storage_path text not null,
  created_at timestamptz not null default now(),
  unique (guest_id, course, storage_path)
);

-- ============================================================
-- reactions
-- Guest-to-guest emoji reactions on photos.
-- reaction_type: fire | heart | chefs_kiss
-- One reaction per (from_guest, photo) pair — enforce with unique.
-- ============================================================
create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.sessions(session_id) on delete cascade,
  from_guest_id uuid not null references public.guests(id) on delete cascade,
  to_photo_id uuid not null references public.photos(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('fire', 'heart', 'chefs_kiss')),
  created_at timestamptz not null default now(),
  unique (from_guest_id, to_photo_id)
);

-- ============================================================
-- song_requests
-- Free-text song requests from guests. Chef sees these in /kitchen.
-- seen flips to true when chef dismisses the request.
-- ============================================================
create table public.song_requests (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.sessions(session_id) on delete cascade,
  guest_id uuid not null references public.guests(id) on delete cascade,
  song_text text not null,
  seen boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- chef_notes
-- Live notes sent from /kitchen that appear as toasts on guest
-- screens. Realtime broadcasts on insert.
-- ============================================================
create table public.chef_notes (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.sessions(session_id) on delete cascade,
  message text not null check (char_length(message) <= 100),
  created_at timestamptz not null default now()
);

-- ============================================================
-- countdowns
-- Optional ETA countdown set by the chef. One active countdown
-- per session at a time (session_id is pk). Deleted or overwritten
-- when cancelled or a new one is set.
-- ============================================================
create table public.countdowns (
  session_id text primary key references public.sessions(session_id) on delete cascade,
  target_card text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- tableside_triggers
-- Short-lived events fired by the chef at the table (butter pour,
-- dessert reveal). expires_at = fired_at + 60 seconds. Clients
-- check expires_at before showing the animation.
-- trigger_type: butter_pour | dessert_reveal
-- ============================================================
create table public.tableside_triggers (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.sessions(session_id) on delete cascade,
  trigger_type text not null check (trigger_type in ('butter_pour', 'dessert_reveal')),
  fired_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '60 seconds')
);

-- ============================================================
-- spotify_cache
-- One row per session. Overwritten every ~10-15s by the scheduled
-- spotify-poll Edge Function. Guests read this; never call Spotify
-- directly.
-- ============================================================
create table public.spotify_cache (
  session_id text primary key references public.sessions(session_id) on delete cascade,
  track text,
  artist text,
  album_art_url text,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Indexes for common query patterns
-- ============================================================
create index on public.guests (session_id);
create index on public.photos (session_id, course);
create index on public.photos (guest_id);
create index on public.reactions (to_photo_id);
create index on public.song_requests (session_id, seen);
create index on public.chef_notes (session_id, created_at desc);
create index on public.tableside_triggers (session_id, expires_at);
