-- Seed: create the initial event session
-- Run this before each event, updating session_id and event_date as needed.

insert into public.sessions (session_id, event_date)
values ('2026-july', '2026-07-12')
on conflict (session_id) do nothing;

insert into public.session_state (session_id, current_card, released_cards)
values ('2026-july', 'waiting', '{}')
on conflict (session_id) do nothing;

insert into public.spotify_cache (session_id)
values ('2026-july')
on conflict (session_id) do nothing;
