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
  const [playlistName, setPlaylistName] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    function fetchTrack() {
      supabase
        .from('spotify_cache')
        .select('track, artist')
        .eq('session_id', sessionId)
        .single()
        .then(({ data }) => { setNowPlaying(data?.track ? (data as SpotifyRow) : null) })
    }

    fetchTrack()
    const interval = setInterval(fetchTrack, 15000)

    // Realtime subscription for instant updates when spotify_cache is in the publication
    const channel = supabase
      .channel(`spotify-${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'spotify_cache', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const row = payload.new as SpotifyRow
          setNowPlaying(row?.track ? row : null)
        }
      )
      .subscribe()

    return () => { clearInterval(interval); supabase.removeChannel(channel) }
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function fetchContext() {
      try {
        const res = await fetch('/api/spotify/context')
        if (!res.ok) return
        const data = await res.json()
        setPlaylistName(data.playlist?.name ?? null)
      } catch {
        // ignore
      }
    }
    fetchContext()
    const interval = setInterval(fetchContext, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 30,
      backgroundColor: 'rgba(10, 10, 15, 0.9)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      padding: '0.65rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: nowPlaying?.track ? 'space-between' : 'flex-end',
      gap: '1rem',
    }}>
      {/* Track info — only shown when Spotify is playing */}
      {nowPlaying?.track && (
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
          {playlistName && (
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '9px',
              color: '#D4AF37',
              opacity: 0.5,
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {playlistName}
            </p>
          )}
        </div>
      )}

      {/* Request button — always visible for checked-in guests */}
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
        Request a Song
      </button>
    </div>
  )
}
