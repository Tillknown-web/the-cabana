'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SpotifyRow {
  track: string | null
  artist: string | null
}

interface Props {
  sessionId: string
  onSongRequest: () => void
}

export default function NowPlayingBar({ sessionId, onSongRequest }: Props) {
  const [nowPlaying, setNowPlaying] = useState<SpotifyRow | null>(null)

  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    supabase
      .from('spotify_cache')
      .select('track, artist')
      .eq('session_id', sessionId)
      .single()
      .then(({ data }) => { if (data?.track) setNowPlaying(data as SpotifyRow) })

    // Subscribe to updates from the spotify-poll Edge Fn
    const channel = supabase
      .channel(`spotify-${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'spotify_cache', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const row = payload.new as SpotifyRow
          if (row?.track) setNowPlaying(row)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  // If Spotify isn't set up (no SPOTIFY_REFRESH_TOKEN), don't render
  if (!nowPlaying?.track) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 30,
      backgroundColor: 'rgba(26, 26, 46, 0.95)',
      borderTop: '1px solid rgba(212, 175, 55, 0.15)',
      padding: '0.65rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
    }}>
      {/* Track info */}
      <div style={{ overflow: 'hidden', flex: 1 }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          color: '#F5F0E8',
          opacity: 0.9,
          margin: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {nowPlaying.track}
        </p>
        {nowPlaying.artist && (
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '10px',
            color: '#A8C5DA',
            opacity: 0.7,
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {nowPlaying.artist}
          </p>
        )}
      </div>

      {/* Request button */}
      <button
        onClick={onSongRequest}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '9px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#D4AF37',
          background: 'none',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          padding: '0.35rem 0.65rem',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Request
      </button>
    </div>
  )
}
