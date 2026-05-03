'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const COURSE_KEYS = ['pour', 'bite', 'cut', 'finish'] as const

interface GuestRow {
  id: string
  name: string
}

interface PhotoRow {
  id: string
  guest_id: string
  course: string
}

interface Props {
  sessionId: string
}

export default function GuestTracker({ sessionId }: Props) {
  const [guests, setGuests] = useState<GuestRow[]>([])
  const [photos, setPhotos] = useState<PhotoRow[]>([])
  const supabase = createClient()

  useEffect(() => {
    function fetchGuests() {
      supabase.from('guests').select('id, name').eq('session_id', sessionId)
        .then(({ data }) => { if (data) setGuests(data as GuestRow[]) })
    }

    // Fetch initial data
    fetchGuests()

    supabase.from('photos').select('id, guest_id, course').eq('session_id', sessionId)
      .then(({ data }) => { if (data) setPhotos(data as PhotoRow[]) })

    // Subscribe to guest INSERT/UPDATE (new/re-check-in) and DELETE (kitchen reset)
    const guestChannel = supabase
      .channel(`kt-guests-${sessionId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guests', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const g = payload.new as GuestRow
          setGuests((prev) => prev.some((x) => x.id === g.id) ? prev : [...prev, g])
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'guests', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const g = payload.new as GuestRow
          setGuests((prev) =>
            prev.some((x) => x.id === g.id)
              ? prev.map((x) => (x.id === g.id ? g : x))
              : [...prev, g]
          )
        }
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'guests', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const deletedId = (payload.old as { id?: string }).id
          if (deletedId) setGuests((prev) => prev.filter((g) => g.id !== deletedId))
        }
      )
      .subscribe()

    // Subscribe to photo inserts and deletions
    const photoChannel = supabase
      .channel(`kt-photos-${sessionId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos', filter: `session_id=eq.${sessionId}` },
        (payload) => setPhotos((prev) => [...prev, payload.new as PhotoRow])
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'photos', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const deletedId = (payload.old as { id?: string }).id
          if (deletedId) setPhotos((prev) => prev.filter((p) => p.id !== deletedId))
        }
      )
      .subscribe()

    // Polling fallback — covers realtime delivery gaps (e.g. RLS-suppressed
    // DELETE events when REPLICA IDENTITY FULL isn't set on the tables).
    const pollInterval = setInterval(async () => {
      const [{ data: gs }, { data: ps }] = await Promise.all([
        supabase.from('guests').select('id, name').eq('session_id', sessionId),
        supabase.from('photos').select('id, guest_id, course').eq('session_id', sessionId),
      ])
      if (gs) setGuests(gs as GuestRow[])
      if (ps) setPhotos(ps as PhotoRow[])
    }, 8000)

    return () => {
      clearInterval(pollInterval)
      supabase.removeChannel(guestChannel)
      supabase.removeChannel(photoChannel)
    }
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  function hasPhoto(guestId: string, course: string) {
    return photos.some((p) => p.guest_id === guestId && p.course === course)
  }

  return (
    <div>
      <SectionLabel>Guests</SectionLabel>

      {guests.length === 0 ? (
        <p style={emptyStyle}>Waiting for guests to check in…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {guests.map((guest) => (
            <div key={guest.id}>
              <p style={guestNameStyle}>{guest.name}</p>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                {COURSE_KEYS.map((course) => {
                  const done = hasPhoto(guest.id, course)
                  return (
                    <span
                      key={course}
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '9px',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: done ? '#1A1A2E' : '#F5F0E8',
                        backgroundColor: done ? '#D4AF37' : 'transparent',
                        border: `1px solid ${done ? '#D4AF37' : 'rgba(255,255,255,0.15)'}`,
                        padding: '0.15rem 0.4rem',
                        opacity: done ? 1 : 0.35,
                      }}
                    >
                      {course}
                    </span>
                  )
                })}
              </div>
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

const guestNameStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '1rem',
  color: '#F5F0E8',
  margin: 0,
}

const emptyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '12px',
  color: '#F5F0E8',
  opacity: 0.35,
}
