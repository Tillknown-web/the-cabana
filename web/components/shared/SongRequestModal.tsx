'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SpotifyTrack {
  uri: string
  name: string
  artist: string
  albumArt: string | null
}

interface Props {
  sessionId: string
  onClose: () => void
}

export default function SongRequestModal({ sessionId, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SpotifyTrack[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<SpotifyTrack | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const trimmed = query.trim()

    if (selected) {
      // Don't search while a track is selected
      return
    }

    if (trimmed.length < 2) {
      setResults([])
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(trimmed)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.tracks ?? [])
        }
      } finally {
        setSearching(false)
      }
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, selected])

  function selectTrack(track: SpotifyTrack) {
    setSelected(track)
    setResults([])
    setError(null)
  }

  function clearSelection() {
    setSelected(null)
    setQuery('')
    setResults([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const songText = selected ? `${selected.name} — ${selected.artist}` : query.trim()
    if (!songText) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not signed in')

      const body: Record<string, string> = { sessionId, songText }
      if (selected) {
        body.spotifyTrackUri = selected.uri
        body.spotifyTrackName = selected.name
        body.spotifyArtist = selected.artist
        if (selected.albumArt) body.spotifyAlbumArt = selected.albumArt
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/song-request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(body),
        }
      )

      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Request failed')

      setSent(true)
      setTimeout(onClose, 1800)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: 'rgba(26, 26, 46, 0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '340px',
          backgroundColor: '#1A1A2E',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          padding: '2rem',
        }}
      >
        {sent ? (
          <p style={sentStyle}>Added to queue ✓</p>
        ) : (
          <>
            <p style={labelStyle}>Song Request</p>
            <p style={subStyle}>Search for a song to add to the queue.</p>

            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
              {/* Selected track pill */}
              {selected ? (
                <div style={selectedRowStyle}>
                  {selected.albumArt && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selected.albumArt}
                      alt=""
                      width={36}
                      height={36}
                      style={{ objectFit: 'cover', flexShrink: 0 }}
                    />
                  )}
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <p style={trackNameStyle}>{selected.name}</p>
                    <p style={artistStyle}>{selected.artist}</p>
                  </div>
                  <button
                    type="button"
                    onClick={clearSelection}
                    style={clearBtnStyle}
                    aria-label="Clear selection"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search song or artist…"
                    maxLength={100}
                    autoFocus
                    style={inputStyle}
                  />

                  {/* Search results */}
                  {(results.length > 0 || searching) && (
                    <div style={resultsContainerStyle}>
                      {searching && results.length === 0 && (
                        <p style={searchingStyle}>Searching…</p>
                      )}
                      {results.map((track) => (
                        <button
                          key={track.uri}
                          type="button"
                          onClick={() => selectTrack(track)}
                          style={resultRowStyle}
                          onMouseEnter={(e) => {
                            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                              'rgba(212, 175, 55, 0.1)'
                          }}
                          onMouseLeave={(e) => {
                            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                              'transparent'
                          }}
                        >
                          {track.albumArt ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={track.albumArt}
                              alt=""
                              width={32}
                              height={32}
                              style={{ objectFit: 'cover', flexShrink: 0 }}
                            />
                          ) : (
                            <div style={albumPlaceholderStyle} />
                          )}
                          <div style={{ overflow: 'hidden', textAlign: 'left' }}>
                            <p style={trackNameStyle}>{track.name}</p>
                            <p style={artistStyle}>{track.artist}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {error && (
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: '#A8C5DA', marginTop: '0.5rem' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || (!selected && !query.trim())}
                style={{
                  marginTop: '1rem',
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor:
                    loading || (!selected && !query.trim())
                      ? 'rgba(212, 175, 55, 0.3)'
                      : '#D4AF37',
                  color: '#1A1A2E',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: loading || (!selected && !query.trim()) ? 'default' : 'pointer',
                }}
              >
                {loading ? 'Sending…' : selected ? 'Add to Queue' : 'Send Request'}
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  marginTop: '0.75rem',
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  color: '#F5F0E8',
                  opacity: 0.35,
                  cursor: 'pointer',
                  letterSpacing: '0.1em',
                  width: '100%',
                }}
              >
                Cancel
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: '#D4AF37',
  margin: 0,
}

const subStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '0.95rem',
  fontStyle: 'italic',
  color: '#F5F0E8',
  opacity: 0.6,
  marginTop: '0.5rem',
}

const sentStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '1.5rem',
  color: '#D4AF37',
  margin: 0,
  padding: '1rem 0',
  textAlign: 'center',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 0.85rem',
  backgroundColor: 'rgba(245, 240, 232, 0.05)',
  border: '1px solid rgba(212, 175, 55, 0.3)',
  color: '#F5F0E8',
  fontFamily: 'var(--font-sans)',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
}

const resultsContainerStyle: React.CSSProperties = {
  marginTop: '0.25rem',
  border: '1px solid rgba(212, 175, 55, 0.2)',
  backgroundColor: '#12122A',
  maxHeight: '220px',
  overflowY: 'auto',
}

const resultRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  width: '100%',
  padding: '0.5rem 0.65rem',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid rgba(212, 175, 55, 0.08)',
  cursor: 'pointer',
  transition: 'background-color 0.15s',
}

const selectedRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  padding: '0.5rem 0.65rem',
  border: '1px solid rgba(212, 175, 55, 0.3)',
  backgroundColor: 'rgba(212, 175, 55, 0.06)',
}

const trackNameStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '12px',
  color: '#F5F0E8',
  margin: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const artistStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '10px',
  color: '#A8C5DA',
  margin: 0,
  opacity: 0.7,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const searchingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  color: '#F5F0E8',
  opacity: 0.35,
  margin: 0,
  padding: '0.75rem',
  textAlign: 'center',
}

const clearBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#F5F0E8',
  opacity: 0.4,
  cursor: 'pointer',
  fontSize: '12px',
  padding: '0 0.25rem',
  flexShrink: 0,
}

const albumPlaceholderStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  backgroundColor: 'rgba(212, 175, 55, 0.08)',
  flexShrink: 0,
}
