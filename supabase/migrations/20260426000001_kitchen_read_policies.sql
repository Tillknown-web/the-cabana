-- ============================================================
-- Kitchen user read policies
--
-- The kitchen page authenticates as a regular email/password user
-- (kitchen@thecabana.com) with user_metadata.role = 'kitchen'.
-- The browser Supabase client uses the anon key so RLS applies —
-- the existing "read own" policies block it from seeing any guests
-- or photos. These policies grant kitchen users read access to all
-- rows in any session.
-- ============================================================

create policy "guests_read_kitchen"
  on public.guests for select
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'kitchen'
  );

create policy "photos_read_kitchen"
  on public.photos for select
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'kitchen'
  );

create policy "reactions_read_kitchen"
  on public.reactions for select
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'kitchen'
  );

create policy "song_requests_read_kitchen"
  on public.song_requests for select
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'kitchen'
  );
