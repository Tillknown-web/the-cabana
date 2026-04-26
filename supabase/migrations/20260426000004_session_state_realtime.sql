-- Fix session_state Realtime delivery
-- The session_state_read_for_guest policy uses is_guest_in_session()
-- which is unreliable in Supabase Realtime's RLS evaluation context
-- (same issue fixed for chef_notes in migration 20260426000002).
-- session_state_read_public_gallery (using (true)) already covers all reads.

drop policy if exists "session_state_read_for_guest" on public.session_state;
