'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { callEdgeFn } from '@/lib/edge-fn'
import { MusicNoteIcon, CheckIcon } from '@/lib/icons'

interface SongRequest {
  id: string
  song_text: string
  seen: boolean
  created_at: string
  guest_id: string
  spotify_track_name: string | null
  spotify_artist_name: string | null
  spotify_album_art: string | null
  spotify_track_uri: string | null
}

interface GuestRow {
  id: string
  name: string
}

interface Props {
  sessionId: string
  accessToken: string
}

export default function SongQueue({ sessionId, accessToken }: Props) {
  const [requests, setRequests] = useState<SongRequest[]>([])
  const [guests, setGuests] = useState<GuestRow[]>([])
  const [dismissing, setDismissing] = useState<string | null>(null)
  const [queuing, setQueuing] = useState<string | null>(null)
  const [queuedIds, setQueuedIds] = useState<Set<string>>(new Set())

  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('song_requests')
      .select('*')
      .eq('session_id', sessionId)
      .eq('seen', false)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setRequests(data as SongRequest[]) })

    supabase.from('guests').select('id, name').eq('session_id', sessionId)
      .then(({ data }) => { if (data) setGuests(data as GuestRow[]) })

    const channel = supabase
      .channel(`kt-songs-${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'song_requests', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const req = payload.new as SongRequest
          if (!req.seen) setRequests((prev) => [...prev, req])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'song_requests', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const updated = payload.new as SongRequest
          if (updated.seen) {
            setRequests((prev) => prev.filter((r) => r.id !== updated.id))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function dismiss(id: string) {
    setDismissing(id)
    try {
      await callEdgeFn('dismiss-request', { sessionId, requestId: id }, accessToken)
      setRequests((prev) => prev.filter((r) => r.id !== id))
    } catch { /* silent */ } finally {
      setDismissing(null)
    }
  }

  async function queueTrack(req: SongRequest) {
    setQueuing(req.id)
    try {
      const body = req.spotify_track_uri
        ? { trackUri: req.spotify_track_uri }
        : { songText: req.song_text }

      const res = await fetch('/api/kitchen/spotify/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setQueuedIds((prev) => new Set([...prev, req.id]))
      }
    } catch { /* silent */ } finally {
      setQueuing(null)
    }
  }

  function guestName(guestId: string) {
    return guests.find((g) => g.id === guestId)?.name ?? 'Guest'
  }

  return (
    <div>
      <SectionLabel>Song Requests {requests.length > 0 ? `(${requests.length})` : ''}</SectionLabel>

      {requests.length === 0 ? (
        <p style={emptyStyle}>No pending requests.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {requests.map((req) => {
            const title = req.spotify_track_name ?? req.song_text
            const subtitle = req.spotify_artist_name ?? null

            return (
              <div
                key={req.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid rgba(212, 175, 55, 0.15)',
                  backgroundColor: req.spotify_track_uri
                    ? 'rgba(212, 175, 55, 0.07)'
                    : 'rgba(212, 175, 55, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden', flex: 1 }}>
                  {req.spotify_album_art ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={req.spotify_album_art}
                      alt=""
                      width={36}
                      height={36}
                      style={{ objectFit: 'cover', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: 36,
                      height: 36,
                      backgroundColor: 'rgba(212, 175, 55, 0.08)',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <MusicNoteIcon size={14} />
                    </div>
                  )}
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      color: '#F5F0E8',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {title}
                    </p>
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
                      {subtitle ? `${subtitle} · ${guestName(req.guest_id)}` : guestName(req.guest_id)}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flexShrink: 0, alignItems: 'flex-end' }}>
                  <button
                    onClick={() => queueTrack(req)}
                    disabled={queuing === req.id || queuedIds.has(req.id)}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '9px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: queuedIds.has(req.id) ? 'rgba(212,175,55,0.4)' : '#D4AF37',
                      background: 'none',
                      border: `1px solid ${queuedIds.has(req.id) ? 'rgba(212,175,55,0.15)' : 'rgba(212,175,55,0.4)'}`,
                      padding: '0.25rem 0.5rem',
                      cursor: queuing === req.id || queuedIds.has(req.id) ? 'default' : 'pointer',
                      opacity: queuing === req.id ? 0.4 : 1,
                    }}
                  >
                    {queuing === req.id ? '…' : queuedIds.has(req.id) ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>Queued <CheckIcon size={9} /></span> : 'Queue'}
                  </button>
                  <button
                    onClick={() => dismiss(req.id)}
                    disabled={dismissing === req.id}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '9px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#F5F0E8',
                      opacity: dismissing === req.id ? 0.2 : 0.3,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {dismissing === req.id ? '…' : 'Dismiss'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-sans)',
      fontSize: '10px',
      letterSpacing: '0.25em',
      textTransform: 'uppercase',
      color: '#D4AF37',
      opacity: 0.7,
      marginBottom: '0.75rem',
    }}>
      {children}
    </p>
  )
}

const emptyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '12px',
  color: '#F5F0E8',
  opacity: 0.35,
}
