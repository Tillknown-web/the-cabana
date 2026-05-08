alter table public.song_requests
  add column if not exists spotify_track_uri  text,
  add column if not exists spotify_track_name text,
  add column if not exists spotify_artist_name text,
  add column if not exists spotify_album_art  text;
