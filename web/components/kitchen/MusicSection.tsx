'use client'

import { useEffect, useState } from 'react'
import type { SpotifyContext, SpotifyPlaylist } from '@/lib/spotify-server'

interface Props {
  accessToken: string
}

export default function MusicSection({ accessToken }: Props) {
  const [context, setContext] = useState<SpotifyContext | null>(null)
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([])
  const [showPlaylists, setShowPlaylists] = useState(false)
  const [switchingId, setSwitchingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchContext() {
      try {
        const res = await fetch('/api/spotify/context')
        if (!res.ok) return
        const data = await res.json()
        setContext(data)
      } catch {
        // ignore
      }
    }
    fetchContext()
    const interval = setInterval(fetchContext, 15000)
    return () => clearInterval(interval)
  }, [])

  async function fetchPlaylists() {
    try {
      const res = await fetch('/api/kitchen/spotify/playlists', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) return
      const data = await res.json()
      setPlaylists(data.playlists ?? [])
    } catch {
      // ignore
    }
  }

  async function handleSwitch(playlistId: string) {
    setSwitchingId(playlistId)
    try {
      await fetch('/api/kitchen/spotify/switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ playlistId }),
      })
      setTimeout(() => {
        fetch('/api/spotify/context').then(r => r.json()).then(setContext).catch(() => null)
      }, 1500)
    } finally {
      setSwitchingId(null)
    }
  }

  const label: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: '9px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    color: 'rgba(212,175,55,0.5)',
    marginBottom: '1rem',
  }

  return (
    <div>
      <p style={label}>Music</p>

      {/* Current playlist + queue */}
      {context?.playlist ? (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            {context.playlist.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={context.playlist.image}
                alt=""
                style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }}
              />
            )}
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#F5F0E8', margin: 0 }}>
                {context.playlist.name}
              </p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'rgba(245,240,232,0.4)', margin: 0 }}>
                now playing
              </p>
            </div>
          </div>

          {context.queue.length > 0 && (
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.25)', marginBottom: '0.5rem' }}>
                Up next
              </p>
              {context.queue.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'rgba(245,240,232,0.2)', width: 12, flexShrink: 0, textAlign: 'right' }}>{i + 1}</span>
                  {item.album_art && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.album_art} alt="" style={{ width: 24, height: 24, borderRadius: 3, objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: '#F5F0E8', opacity: 0.7, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.track}
                    </p>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: '#A8C5DA', opacity: 0.5, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.artist}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'rgba(245,240,232,0.3)', marginBottom: '1rem' }}>
          No playlist context detected.
        </p>
      )}

      {/* Playlist browser */}
      <button
        onClick={() => {
          if (!showPlaylists) fetchPlaylists()
          setShowPlaylists(v => !v)
        }}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '9px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#D4AF37',
          background: 'none',
          border: '1px solid rgba(212,175,55,0.25)',
          padding: '0.35rem 0.75rem',
          cursor: 'pointer',
          marginBottom: showPlaylists ? '0.75rem' : 0,
        }}
      >
        {showPlaylists ? 'Hide playlists' : 'Browse playlists'}
      </button>

      {showPlaylists && (
        <div style={{ marginTop: '0.5rem' }}>
          {playlists.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'rgba(245,240,232,0.3)' }}>
              No playlists found — check token scopes.
            </p>
          ) : (
            playlists.map((pl) => {
              const isCurrent = context?.playlist?.id === pl.id
              return (
                <div
                  key={pl.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid rgba(212,175,55,0.08)',
                  }}
                >
                  {pl.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pl.image} alt="" style={{ width: 28, height: 28, borderRadius: 3, objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#F5F0E8', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', margin: 0, opacity: isCurrent ? 1 : 0.7 }}>
                    {pl.name}
                  </p>
                  <button
                    onClick={() => handleSwitch(pl.id)}
                    disabled={isCurrent || switchingId === pl.id}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '9px',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      padding: '0.3rem 0.65rem',
                      border: isCurrent ? '1px solid rgba(212,175,55,0.2)' : '1px solid rgba(212,175,55,0.5)',
                      background: isCurrent ? 'transparent' : 'rgba(212,175,55,0.1)',
                      color: isCurrent ? 'rgba(212,175,55,0.4)' : '#D4AF37',
                      cursor: isCurrent ? 'default' : 'pointer',
                      flexShrink: 0,
                      opacity: switchingId === pl.id ? 0.4 : 1,
                    }}
                  >
                    {isCurrent ? 'playing' : switchingId === pl.id ? '…' : 'Play'}
                  </button>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
