'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MusicNoteIcon, CheckIcon } from '@/lib/icons'

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
  const [selected, setSelected] = useState<SpotifyTrack | null>(null)
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced Spotify search
  useEffect(() => {
    if (selected) return // don't re-search once a track is chosen
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const trimmed = query.trim()
    if (trimmed.length < 2) { setResults([]); return }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(trimmed)}`)
        if (!res.ok) { setResults([]); return }
        const data = await res.json()
        setResults(data.tracks ?? [])
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 450)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, selected])

  function pickTrack(track: SpotifyTrack) {
    setSelected(track)
    setQuery(track.name)
    setResults([])
  }

  function clearSelection() {
    setSelected(null)
    setQuery('')
    setResults([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not signed in')

      const body: Record<string, string> = { sessionId, songText: trimmed }
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
        backgroundColor: 'rgba(10, 10, 15, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
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
          backgroundColor: '#16161F',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          padding: '2rem',
        }}
      >
        {sent ? (
          <p style={{ ...sentStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            {selected
              ? <><MusicNoteIcon size={12} /><span>Added to queue</span></>
              : <><span>Sent</span><CheckIcon size={10} /></>
            }
          </p>
        ) : (
          <>
            <p style={labelStyle}>Song Request</p>
            <p style={subStyle}>Search for a song to add to the queue.</p>

            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
              {/* Search input or selected track */}
              {selected ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.6rem 0.75rem',
                  border: '1px solid rgba(212, 175, 55, 0.5)',
                  backgroundColor: 'rgba(212, 175, 55, 0.06)',
                  marginBottom: '0.75rem',
                }}>
                  {selected.albumArt && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selected.albumArt} alt="" style={{ width: 36, height: 36, objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#F5F0E8', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {selected.name}
                    </p>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: '#A8C5DA', margin: 0, opacity: 0.7 }}>
                      {selected.artist}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearSelection}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(245,240,232,0.3)',
                      cursor: 'pointer',
                      fontSize: '16px',
                      lineHeight: 1,
                      flexShrink: 0,
                      padding: '0 2px',
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div style={{ position: 'relative', marginBottom: results.length > 0 ? 0 : '0.75rem' }}>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search song or artist…"
                    maxLength={200}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.85rem',
                      backgroundColor: 'rgba(245, 240, 232, 0.05)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: '#F5F0E8',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {searching && (
                    <span style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '10px',
                      color: 'rgba(212,175,55,0.5)',
                    }}>
                      …
                    </span>
                  )}
                </div>
              )}

              {/* Search results */}
              {results.length > 0 && (
                <div style={{
                  border: '1px solid rgba(212, 175, 55, 0.15)',
                  borderTop: 'none',
                  marginBottom: '0.75rem',
                  maxHeight: '220px',
                  overflowY: 'auto',
                }}>
                  {results.map((track) => (
                    <button
                      key={track.uri}
                      type="button"
                      onClick={() => pickTrack(track)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.55rem 0.75rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: '1px solid rgba(212,175,55,0.08)',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {track.albumArt ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={track.albumArt} alt="" style={{ width: 32, height: 32, objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 32, height: 32, backgroundColor: 'rgba(212,175,55,0.1)', flexShrink: 0 }} />
                      )}
                      <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#F5F0E8', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {track.name}
                        </p>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: '#A8C5DA', opacity: 0.6, margin: 0 }}>
                          {track.artist}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {error && (
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: '#A8C5DA', marginBottom: '0.5rem' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !query.trim()}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: loading || !query.trim() ? 'rgba(212, 175, 55, 0.3)' : '#D4AF37',
                  color: '#0A0A0F',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: loading || !query.trim() ? 'default' : 'pointer',
                }}
              >
                {loading ? 'Sending…' : selected ? 'Add to Queue' : 'Send Request'}
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  marginTop: '0.75rem',
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  color: '#F5F0E8',
                  opacity: 0.35,
                  cursor: 'pointer',
                  letterSpacing: '0.1em',
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
  fontSize: '1.4rem',
  color: '#D4AF37',
  margin: 0,
  padding: '1rem 0',
  textAlign: 'center',
}
