'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import type { CardId, SpotifyNowPlayingFull, SpotifyPlaylist } from '@/types'
import { CARD_SEQUENCE, CARD_LABELS, INTERMISSION_CARDS, COURSE_CARDS } from '@/types'
import { formatTime, formatElapsed, formatDuration } from '@/lib/utils'

const SESSION_ID = process.env.NEXT_PUBLIC_ACTIVE_SESSION_ID ?? ''

interface Guest {
  id: string
  name: string
  current_card: string
  checked_in_at: string
  submittedCourses: string[]
}

interface Session {
  id: string
  current_card: CardId
  released_cards: CardId[]
  countdown_card: string | null
  countdown_expires_at: string | null
  created_at: string
}

interface SongRequest {
  id: string
  song_text: string
  seen: boolean
  created_at: string
  guests: { name: string }
}

interface ChefNote {
  id: string
  message: string
  created_at: string
}

export default function KitchenPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [notes, setNotes] = useState<ChefNote[]>([])
  const [songRequests, setSongRequests] = useState<SongRequest[]>([])
  const [noteText, setNoteText] = useState('')
  const [noteSending, setNoteSending] = useState(false)
  const [releaseConfirm, setReleaseConfirm] = useState<CardId | null>(null)
  const [tablesideConfirm, setTablesideConfirm] = useState<string | null>(null)
  const [nowPlaying, setNowPlaying] = useState<SpotifyNowPlayingFull | null>(null)
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([])
  const [showPlaylists, setShowPlaylists] = useState(false)
  const [switchingPlaylist, setSwitchingPlaylist] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    const res = await fetch(`/api/kitchen/dashboard?sessionId=${SESSION_ID}`)
    if (!res.ok) return
    const data = await res.json()
    setSession(data.session)
    setGuests(data.guests ?? [])
    setNotes(data.notes ?? [])
    setSongRequests(data.songRequests ?? [])
  }, [])

  useEffect(() => {
    fetchDashboard()
    const interval = setInterval(fetchDashboard, 5000)
    return () => clearInterval(interval)
  }, [fetchDashboard])

  useEffect(() => {
    async function fetchNowPlaying() {
      try {
        const res = await fetch(`/api/spotify/${SESSION_ID}`)
        if (!res.ok) return
        const data = await res.json()
        setNowPlaying(data)
      } catch {
        // ignore
      }
    }
    fetchNowPlaying()
    const interval = setInterval(fetchNowPlaying, 15000)
    return () => clearInterval(interval)
  }, [])

  async function fetchPlaylists() {
    try {
      const res = await fetch('/api/kitchen/spotify/playlists')
      if (!res.ok) return
      const data = await res.json()
      setPlaylists(data.playlists ?? [])
    } catch {
      // ignore
    }
  }

  async function handleSwitchPlaylist(playlistId: string) {
    setSwitchingPlaylist(playlistId)
    try {
      await fetch('/api/kitchen/spotify/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId }),
      })
    } finally {
      setSwitchingPlaylist(null)
    }
  }

  async function handleRelease(cardId: CardId) {
    setReleaseConfirm(null)
    const res = await fetch('/api/kitchen/release-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESSION_ID, cardId }),
    })
    if (res.ok) fetchDashboard()
  }

  async function handleTablesideTrigger(trigger: string) {
    setTablesideConfirm(null)
    await fetch('/api/kitchen/tableside-trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESSION_ID, trigger }),
    })
  }

  async function handleSendNote(e: React.FormEvent) {
    e.preventDefault()
    if (!noteText.trim()) return
    setNoteSending(true)
    await fetch('/api/kitchen/chef-note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESSION_ID, message: noteText.trim() }),
    })
    setNoteText('')
    setNoteSending(false)
    fetchDashboard()
  }

  async function handleSetCountdown(cardId: CardId, minutes: number | null) {
    await fetch('/api/kitchen/set-countdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: SESSION_ID,
        cardId: minutes ? cardId : null,
        minutes,
      }),
    })
    fetchDashboard()
  }

  async function handleDismissRequest(requestId: string) {
    await fetch('/api/kitchen/dismiss-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    })
    fetchDashboard()
  }

  if (!session) {
    return (
      <div className="kitchen-body" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888' }}>Loading session…</p>
      </div>
    )
  }
  

  const releasedCards = session.released_cards ?? []
  const sessionAgeMs = Date.now() - new Date(session.created_at).getTime()
  const upcomingCards = CARD_SEQUENCE.filter((c) => !releasedCards.includes(c) && c !== 'checkin')
  const nextCard = upcomingCards[0] as CardId | undefined
  const lastReleasedAt = releasedCards.length > 0 ? null : null // We'd need DB timestamps for this

  // Tableside triggers available
  const cutIsLive = session.current_card === 'cut'
  const finishIsLive = session.current_card === 'finish'

  return (
    <div className="kitchen-body" style={{ minHeight: '100vh', paddingBottom: 60 }}>
      {/* Confirmation modals */}
      {releaseConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div style={{ backgroundColor: '#1a1a24', border: '1px solid #333', borderRadius: 8, padding: 28, maxWidth: 340, width: '100%', textAlign: 'center' }}>
            <p style={{ fontSize: 15, marginBottom: 8 }}>Release <strong>{CARD_LABELS[releaseConfirm]}</strong> to all guests?</p>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 24 }}>This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setReleaseConfirm(null)} style={{ padding: '10px 20px', backgroundColor: '#333', border: 'none', borderRadius: 4, color: '#ccc', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleRelease(releaseConfirm)} style={{ padding: '10px 20px', backgroundColor: '#D4AF37', border: 'none', borderRadius: 4, color: '#0f0f14', fontWeight: 600, cursor: 'pointer' }}>Release</button>
            </div>
          </div>
        </div>
      )}

      {tablesideConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ backgroundColor: '#1a1a24', border: '1px solid #333', borderRadius: 8, padding: 28, maxWidth: 340, width: '100%', textAlign: 'center' }}>
            <p style={{ fontSize: 15, marginBottom: 20 }}>
              Fire <strong>{tablesideConfirm === 'butter_pour' ? '🔥 Butter pour reveal' : '✨ Dessert gold reveal'}</strong>?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setTablesideConfirm(null)} style={{ padding: '10px 20px', backgroundColor: '#333', border: 'none', borderRadius: 4, color: '#ccc', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleTablesideTrigger(tablesideConfirm)} style={{ padding: '10px 20px', backgroundColor: '#D4AF37', border: 'none', borderRadius: 4, color: '#0f0f14', fontWeight: 600, cursor: 'pointer' }}>Fire it</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sticky status header ── */}
      <div style={{ position: 'sticky', top: 0, backgroundColor: '#0f0f14', borderBottom: '1px solid #222', padding: '12px 20px', zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#D4AF37' }}>
              THE CABANA KITCHEN
            </span>
            <span style={{ fontSize: 12, color: '#555', marginLeft: 12 }}>
              {guests.length} guest{guests.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#aaa' }}>
              Current: <strong style={{ color: '#e0e0e0' }}>{CARD_LABELS[session.current_card]}</strong>
            </div>
            <div style={{ fontSize: 11, color: '#555' }}>
              Session: {formatDuration(sessionAgeMs)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>

        {/* ── Guest tracker ── */}
        <Section title="Guests">
          {guests.length === 0 ? (
            <p style={{ fontSize: 13, color: '#555' }}>No guests checked in yet.</p>
          ) : (
            guests.map((g) => {
              const pendingCourses = COURSE_CARDS.filter(
                (c) => releasedCards.includes(c) && !g.submittedCourses.includes(c)
              )
              return (
                <div key={g.id} style={{ border: '1px solid #222', borderRadius: 6, padding: '14px 16px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e0', marginBottom: 4 }}>{g.name}</p>
                      <p style={{ fontSize: 12, color: '#888' }}>on: {CARD_LABELS[g.current_card as CardId] ?? g.current_card}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 11, color: '#555' }}>{formatElapsed(g.checked_in_at)}</p>
                      {pendingCourses.length > 0 ? (
                        <p style={{ fontSize: 12, color: '#f97316' }}>📷 {pendingCourses.length} pending</p>
                      ) : (
                        <p style={{ fontSize: 12, color: '#4ade80' }}>📷 up to date</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </Section>

        {/* ── Card controls ── */}
        <Section title="Card controls">
          {CARD_SEQUENCE.filter((c) => c !== 'checkin').map((cardId) => {
            const released = releasedCards.includes(cardId)
            const isCurrent = session.current_card === cardId
            const isIntermission = INTERMISSION_CARDS.includes(cardId)

            let statusColor = '#555'
            let statusLabel = 'locked'
            if (released && isCurrent) { statusColor = '#f59e0b'; statusLabel = 'LIVE NOW' }
            else if (released) { statusColor = '#4ade80'; statusLabel = 'completed' }

            return (
              <div
                key={cardId}
                style={{
                  border: `1px solid ${isCurrent ? '#f59e0b40' : '#1e1e2e'}`,
                  borderRadius: 6,
                  padding: '14px 16px',
                  marginBottom: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: isCurrent ? '#1a1508' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14, color: statusColor }}>
                    {released && !isCurrent ? '✓' : isCurrent ? '▶' : ' '}
                  </span>
                  <span style={{ fontSize: 14, color: released ? '#aaa' : '#666' }}>{CARD_LABELS[cardId]}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: statusColor }}>{statusLabel}</span>
                  {!released && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      {isIntermission && (
                        <button
                          onClick={() => handleRelease(cardId)}
                          style={{ padding: '6px 12px', backgroundColor: '#333', border: 'none', borderRadius: 4, color: '#aaa', fontSize: 12, cursor: 'pointer' }}
                        >
                          Skip
                        </button>
                      )}
                      <button
                        onClick={() => setReleaseConfirm(cardId)}
                        style={{ padding: '6px 12px', backgroundColor: '#D4AF37', border: 'none', borderRadius: 4, color: '#0f0f14', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Release
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </Section>

        {/* ── Tableside triggers ── */}
        <Section title="Tableside triggers">
          <KitchenButton
            disabled={!cutIsLive}
            onClick={() => setTablesideConfirm('butter_pour')}
            label="🔥 Butter pour reveal"
            subLabel={cutIsLive ? undefined : 'only active when the cut is live'}
          />
          <KitchenButton
            disabled={!finishIsLive}
            onClick={() => setTablesideConfirm('dessert_reveal')}
            label="✨ Dessert gold reveal"
            subLabel={finishIsLive ? undefined : 'only active when the finish is live'}
            style={{ marginTop: 8 }}
          />
        </Section>

        {/* ── Music ── */}
        <Section title="Music">
          {nowPlaying ? (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                {nowPlaying.album_art && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={nowPlaying.album_art}
                    alt="album art"
                    style={{ width: 40, height: 40, borderRadius: 4, flexShrink: 0, objectFit: 'cover' }}
                  />
                )}
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {nowPlaying.track}
                  </p>
                  <p style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {nowPlaying.artist}
                  </p>
                  {nowPlaying.playlist && (
                    <p style={{ fontSize: 11, color: '#D4AF3799', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {nowPlaying.playlist.name}
                    </p>
                  )}
                </div>
              </div>

              {nowPlaying.queue.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>Up next</p>
                  {nowPlaying.queue.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: '#444', width: 14, flexShrink: 0, textAlign: 'right' }}>{i + 1}</span>
                      {item.album_art && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.album_art}
                          alt=""
                          style={{ width: 28, height: 28, borderRadius: 3, flexShrink: 0, objectFit: 'cover' }}
                        />
                      )}
                      <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontSize: 12, color: '#ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.track}
                        </p>
                        <p style={{ fontSize: 11, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.artist}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>Nothing playing right now.</p>
          )}

          <button
            onClick={() => {
              if (!showPlaylists) fetchPlaylists()
              setShowPlaylists((v) => !v)
            }}
            style={{
              background: 'none',
              border: '1px solid #333',
              borderRadius: 4,
              color: '#888',
              fontSize: 12,
              padding: '6px 12px',
              cursor: 'pointer',
              marginBottom: showPlaylists ? 12 : 0,
            }}
          >
            {showPlaylists ? 'Hide playlists' : 'Browse playlists'}
          </button>

          {showPlaylists && (
            <div>
              {playlists.length === 0 ? (
                <p style={{ fontSize: 12, color: '#555' }}>No playlists found (check token scopes).</p>
              ) : (
                playlists.map((pl) => (
                  <div
                    key={pl.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 0',
                      borderBottom: '1px solid #1e1e2e',
                    }}
                  >
                    {pl.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pl.image}
                        alt=""
                        style={{ width: 32, height: 32, borderRadius: 3, flexShrink: 0, objectFit: 'cover' }}
                      />
                    )}
                    <p style={{ fontSize: 13, color: '#ccc', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {pl.name}
                    </p>
                    <button
                      onClick={() => handleSwitchPlaylist(pl.id)}
                      disabled={switchingPlaylist === pl.id}
                      style={{
                        padding: '5px 12px',
                        backgroundColor: nowPlaying?.playlist?.id === pl.id ? '#1e1e2e' : '#D4AF37',
                        border: 'none',
                        borderRadius: 4,
                        color: nowPlaying?.playlist?.id === pl.id ? '#555' : '#0f0f14',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: switchingPlaylist === pl.id ? 'not-allowed' : 'pointer',
                        flexShrink: 0,
                        opacity: switchingPlaylist === pl.id ? 0.5 : 1,
                      }}
                    >
                      {nowPlaying?.playlist?.id === pl.id ? 'playing' : switchingPlaylist === pl.id ? '…' : 'Play'}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </Section>

        {/* ── Countdown ETA ── */}
        {nextCard && (
          <Section title="Countdown ETA">
            <p style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>
              Set ETA for: <strong style={{ color: '#e0e0e0' }}>{CARD_LABELS[nextCard]}</strong>
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[5, 10, 15, 20].map((m) => (
                <button
                  key={m}
                  onClick={() => handleSetCountdown(nextCard, m)}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#1e1e2e',
                    border: `1px solid ${session.countdown_card === nextCard ? '#D4AF37' : '#333'}`,
                    borderRadius: 4,
                    color: '#e0e0e0',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {m} min
                </button>
              ))}
              {session.countdown_card && (
                <button
                  onClick={() => handleSetCountdown(nextCard, null)}
                  style={{ padding: '10px 16px', backgroundColor: 'transparent', border: '1px solid #444', borderRadius: 4, color: '#888', fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              )}
            </div>
            {session.countdown_card && session.countdown_expires_at && (
              <p style={{ fontSize: 12, color: '#f59e0b', marginTop: 10 }}>
                Active: {Math.max(0, Math.ceil((new Date(session.countdown_expires_at).getTime() - Date.now()) / 60000))} min remaining
              </p>
            )}
          </Section>
        )}

        {/* ── Chef's live notes ── */}
        <Section title="Live notes">
          <form onSubmit={handleSendNote} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value.slice(0, 100))}
              placeholder="Type a note to guests..."
              maxLength={100}
              style={{
                flex: 1,
                backgroundColor: '#1a1a24',
                border: '1px solid #333',
                borderRadius: 4,
                padding: '12px 14px',
                color: '#e0e0e0',
                fontSize: 14,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={noteSending || !noteText.trim()}
              style={{ padding: '12px 18px', backgroundColor: '#D4AF37', border: 'none', borderRadius: 4, color: '#0f0f14', fontWeight: 600, cursor: 'pointer', opacity: noteSending || !noteText.trim() ? 0.5 : 1 }}
            >
              Send
            </button>
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notes.filter((n) => !n.message.startsWith('__tableside:')).slice(0, 10).map((n) => (
              <div key={n.id} style={{ fontSize: 12, color: '#666', display: 'flex', gap: 8 }}>
                <span style={{ color: '#444', flexShrink: 0 }}>{formatTime(n.created_at)}</span>
                <span style={{ color: '#999' }}>&ldquo;{n.message}&rdquo;</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Song request queue ── */}
        <Section title="Song requests">
          {songRequests.length === 0 ? (
            <p style={{ fontSize: 13, color: '#555' }}>No requests yet.</p>
          ) : (
            songRequests.map((r) => (
              <div
                key={r.id}
                style={{
                  border: `1px solid ${r.seen ? '#1e1e2e' : '#333'}`,
                  borderRadius: 6,
                  padding: '12px 16px',
                  marginBottom: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: r.seen ? 0.4 : 1,
                }}
              >
                <div>
                  <p style={{ fontSize: 13, color: '#e0e0e0', marginBottom: 2 }}>
                    <strong>{r.guests?.name}:</strong> &ldquo;{r.song_text}&rdquo;
                  </p>
                  <p style={{ fontSize: 11, color: '#555' }}>{formatTime(r.created_at)}</p>
                </div>
                {!r.seen && (
                  <button
                    onClick={() => handleDismissRequest(r.id)}
                    style={{ padding: '6px 12px', backgroundColor: '#1e1e2e', border: '1px solid #333', borderRadius: 4, color: '#888', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}
                  >
                    ✓ seen
                  </button>
                )}
              </div>
            ))
          )}
        </Section>

      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 28 }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#555', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #1e1e2e' }}>
        {title}
      </p>
      {children}
    </div>
  )
}

function KitchenButton({
  disabled,
  onClick,
  label,
  subLabel,
  style: extraStyle,
}: {
  disabled: boolean
  onClick: () => void
  label: string
  subLabel?: string
  style?: React.CSSProperties
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        width: '100%',
        border: `1px solid ${disabled ? '#1e1e2e' : '#D4AF3740'}`,
        borderRadius: 6,
        padding: '16px',
        textAlign: 'left',
        backgroundColor: disabled ? 'transparent' : '#0f0f14',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        ...extraStyle,
      }}
    >
      <p style={{ fontSize: 14, color: '#e0e0e0', marginBottom: subLabel ? 4 : 0 }}>{label}</p>
      {subLabel && <p style={{ fontSize: 12, color: '#555', fontStyle: 'italic' }}>{subLabel}</p>}
    </button>
  )
}
