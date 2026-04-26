import { createClient } from '@/lib/supabase/client'

export interface NowPlaying {
  track: string | null
  artist: string | null
  album_art_url: string | null
  updated_at: string
}

/** Read the current track from the spotify_cache table (populated by the spotify-poll Edge Fn). */
export async function getNowPlaying(sessionId: string): Promise<NowPlaying | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('spotify_cache')
    .select('track, artist, album_art_url, updated_at')
    .eq('session_id', sessionId)
    .single()

  if (error || !data) return null
  return data as NowPlaying
}
