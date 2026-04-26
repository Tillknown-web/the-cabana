-- Allow guests to receive realtime DELETE events on their own row.
-- This powers the auto-logout when the kitchen resets the session,
-- which deletes all guest rows. The experience page subscribes to
-- DELETE events on guests (filtered to id = their own guest.id) and
-- shows the check-in form again when their row is removed.
--
-- RLS policy "guests_read_own" (id = auth.uid()) already scopes which
-- events each client receives — guests only see their own changes.
alter publication supabase_realtime add table public.guests;
