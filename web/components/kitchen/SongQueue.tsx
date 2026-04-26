'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { callEdgeFn } from '@/lib/edge-fn'

interface SongRequest {
  id: string
  song_text: string
  seen: boolean
  created_at: string
  guest_id: string
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

  const supabase = createClient()

  useEffect(() => {
    supabase.from('song_requests').select('*').eq('session_id', sessionId).eq('seen', false).order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setRequests(data as SongRequest[]) })

    supabase.from('guests').select('id, name').eq('session_id', sessionId)
      .then(({ data }) => { if (data) setGuests(data as GuestRow[]) })

    const channel = supabase
      .channel(`kt-songs-${sessionId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'song_requests', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const req = payload.new as SongRequest
          if (!req.seen) setRequests((prev) => [...prev, req])
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'song_requests', filter: `session_id=eq.${sessionId}` },
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
          {requests.map((req) => (
            <div
              key={req.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '0.65rem 0.85rem',
                border: '1px solid rgba(212, 175, 55, 0.15)',
                backgroundColor: 'rgba(212, 175, 55, 0.04)',
              }}
            >
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#F5F0E8', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {req.song_text}
                </p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: '#A8C5DA', opacity: 0.6, margin: 0 }}>
                  {guestName(req.guest_id)}
                </p>
              </div>
              <button
                onClick={() => dismiss(req.id)}
                disabled={dismissing === req.id}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '9px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#D4AF37',
                  opacity: dismissing === req.id ? 0.3 : 0.7,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {dismissing === req.id ? '…' : 'Dismiss'}
              </button>
            </div>
          ))}
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
