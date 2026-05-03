-- ============================================================
-- Make chef_notes publicly readable for Realtime delivery
--
-- The previous policy (chef_notes_read_for_guest) used
-- is_guest_in_session() which calls auth.uid() inside Supabase
-- Realtime's RLS evaluation context. This is unreliable and causes
-- INSERT events to be silently dropped before reaching guest clients.
--
-- Chef notes are broadcast messages from the chef to all guests —
-- they are not sensitive. The same pattern used by session_state
-- (using (true)) is appropriate here and matches how the
-- session_state realtime updates work correctly.
-- ============================================================

drop policy if exists "chef_notes_read_for_guest" on public.chef_notes;

create policy "chef_notes_read_all"
  on public.chef_notes for select
  using (true);

-- countdowns and tableside_triggers have the same problem —
-- their read policies also use is_guest_in_session() and are
-- delivered via Realtime. Make them public too.
drop policy if exists "countdowns_read_for_guest" on public.countdowns;

create policy "countdowns_read_all"
  on public.countdowns for select
  using (true);

drop policy if exists "tableside_triggers_read_for_guest" on public.tableside_triggers;

create policy "tableside_triggers_read_all"
  on public.tableside_triggers for select
  using (true);
