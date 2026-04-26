-- The Cabana — Supabase Schema
-- Run this in the Supabase SQL editor to set up all tables

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  current_card TEXT NOT NULL DEFAULT 'checkin',
  released_cards TEXT[] NOT NULL DEFAULT '{}',
  countdown_card TEXT,
  countdown_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- GUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS guests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  current_card TEXT NOT NULL DEFAULT 'welcome',
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS guests_session_id_idx ON guests(session_id);

-- ============================================================
-- PHOTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  guest_id TEXT NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  course TEXT NOT NULL,  -- guest | pour | bite | cut | finish | booth
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS photos_session_course_idx ON photos(session_id, course);
CREATE INDEX IF NOT EXISTS photos_guest_id_idx ON photos(guest_id);

-- ============================================================
-- REACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS reactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  from_guest_id TEXT NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  to_photo_id TEXT NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,  -- fire | heart | chefs_kiss
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(from_guest_id, to_photo_id)
);

-- ============================================================
-- SONG REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS song_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  guest_id TEXT NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  song_text TEXT NOT NULL,
  seen BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS song_requests_session_idx ON song_requests(session_id);

-- ============================================================
-- CHEF NOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS chef_notes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chef_notes_session_idx ON chef_notes(session_id);

-- ============================================================
-- REALTIME — enable for key tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE chef_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE photos;
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE song_requests;

-- ============================================================
-- STORAGE — create photos bucket (run separately if needed)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('cabana-photos', 'cabana-photos', false);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- Sessions: anyone can read, only service role can write
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions_read" ON sessions FOR SELECT USING (true);
CREATE POLICY "sessions_write" ON sessions FOR ALL USING (auth.role() = 'service_role');

-- Guests: anyone can read (by session), only service role inserts
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "guests_read" ON guests FOR SELECT USING (true);
CREATE POLICY "guests_write" ON guests FOR ALL USING (auth.role() = 'service_role');

-- Photos: readable by session participants; write via service role
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "photos_read" ON photos FOR SELECT USING (true);
CREATE POLICY "photos_write" ON photos FOR ALL USING (auth.role() = 'service_role');

-- Reactions: same
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reactions_read" ON reactions FOR SELECT USING (true);
CREATE POLICY "reactions_write" ON reactions FOR ALL USING (auth.role() = 'service_role');

-- Song requests: read/write via service role
ALTER TABLE song_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "song_requests_read" ON song_requests FOR SELECT USING (true);
CREATE POLICY "song_requests_write" ON song_requests FOR ALL USING (auth.role() = 'service_role');

-- Chef notes: public read (guests need them), service role writes
ALTER TABLE chef_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chef_notes_read" ON chef_notes FOR SELECT USING (true);
CREATE POLICY "chef_notes_write" ON chef_notes FOR ALL USING (auth.role() = 'service_role');
