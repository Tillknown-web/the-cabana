-- ============================================================
-- Enable Row Level Security on all tables
-- ============================================================
alter table public.sessions enable row level security;
alter table public.session_state enable row level security;
alter table public.guests enable row level security;
alter table public.photos enable row level security;
alter table public.reactions enable row level security;
alter table public.song_requests enable row level security;
alter table public.chef_notes enable row level security;
alter table public.countdowns enable row level security;
alter table public.tableside_triggers enable row level security;
alter table public.spotify_cache enable row level security;

-- ============================================================
-- Helper: check if the calling user is a guest in a given session
-- Used across multiple policies to avoid repeating the join.
-- ============================================================
create or replace function public.is_guest_in_session(p_session_id text)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.guests
    where id = auth.uid()
    and session_id = p_session_id
  );
$$;

-- ============================================================
-- sessions
-- Guests and public can read sessions (needed for the landing page
-- live seat count and the public gallery). Only service role writes.
-- ============================================================
create policy "sessions_read_all"
  on public.sessions for select
  using (true);

-- ============================================================
-- session_state
-- Guests can read the state for their session.
-- Only service role (Edge Functions) can write.
-- ============================================================
create policy "session_state_read_for_guest"
  on public.session_state for select
  using (public.is_guest_in_session(session_id));

create policy "session_state_read_public_gallery"
  on public.session_state for select
  using (true);

-- ============================================================
-- guests
-- A guest can read and update only their own row.
-- Insert is allowed for any authenticated user (anonymous) —
-- the checkin Edge Function writes the row with id = auth.uid().
-- ============================================================
create policy "guests_insert_own"
  on public.guests for insert
  with check (id = auth.uid());

create policy "guests_read_own"
  on public.guests for select
  using (id = auth.uid());

create policy "guests_update_own"
  on public.guests for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Kitchen/service role needs to read all guests in a session
-- (handled via service role bypass — no extra policy needed).

-- ============================================================
-- photos
-- A guest can insert their own photos (guest_id = auth.uid()).
-- Any guest in the same session can read all photos in that
-- session (needed for the cross-guest reaction and gallery screens).
-- Public can read photos if they have the session_id (gallery link).
-- ============================================================
create policy "photos_insert_own"
  on public.photos for insert
  with check (guest_id = auth.uid());

create policy "photos_read_in_session"
  on public.photos for select
  using (public.is_guest_in_session(session_id));

create policy "photos_read_public_gallery"
  on public.photos for select
  using (true);

-- ============================================================
-- reactions
-- A guest can insert one reaction per photo (unique enforced at DB).
-- Any guest in the session can read reactions (shown on gallery).
-- Public can read reactions for the shared gallery link.
-- ============================================================
create policy "reactions_insert_own"
  on public.reactions for insert
  with check (from_guest_id = auth.uid());

create policy "reactions_read_in_session"
  on public.reactions for select
  using (public.is_guest_in_session(session_id));

create policy "reactions_read_public_gallery"
  on public.reactions for select
  using (true);

-- ============================================================
-- song_requests
-- A guest can insert their own requests.
-- A guest can read their own requests.
-- Kitchen reads all (via service role — no policy needed).
-- ============================================================
create policy "song_requests_insert_own"
  on public.song_requests for insert
  with check (guest_id = auth.uid());

create policy "song_requests_read_own"
  on public.song_requests for select
  using (guest_id = auth.uid());

-- ============================================================
-- chef_notes
-- Guests in the session can read notes (for Realtime + initial load).
-- Only service role inserts.
-- ============================================================
create policy "chef_notes_read_for_guest"
  on public.chef_notes for select
  using (public.is_guest_in_session(session_id));

-- ============================================================
-- countdowns
-- Guests in the session can read their session's countdown.
-- Only service role writes.
-- ============================================================
create policy "countdowns_read_for_guest"
  on public.countdowns for select
  using (public.is_guest_in_session(session_id));

-- ============================================================
-- tableside_triggers
-- Guests in the session can read active triggers.
-- Only service role writes.
-- ============================================================
create policy "tableside_triggers_read_for_guest"
  on public.tableside_triggers for select
  using (public.is_guest_in_session(session_id));

-- ============================================================
-- spotify_cache
-- Any guest (or public for the landing page now-playing widget)
-- can read. Only service role writes.
-- ============================================================
create policy "spotify_cache_read_all"
  on public.spotify_cache for select
  using (true);

-- ============================================================
-- Enable Realtime for tables that need live push to clients
-- ============================================================
alter publication supabase_realtime add table public.session_state;
alter publication supabase_realtime add table public.chef_notes;
alter publication supabase_realtime add table public.tableside_triggers;
alter publication supabase_realtime add table public.photos;
alter publication supabase_realtime add table public.reactions;
alter publication supabase_realtime add table public.countdowns;
alter publication supabase_realtime add table public.song_requests;
