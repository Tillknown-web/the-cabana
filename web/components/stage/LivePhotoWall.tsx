'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { COURSE_COURSE_LABELS } from '@/lib/constants'
import type { StageGuest } from '@/components/stage/StageView'

interface ApiPhoto {
  id: string
  course: string
  signed_url: string | null
  created_at: string
  guest: StageGuest | null
}

interface ApiResponse {
  guests: StageGuest[]
  sections: Record<string, ApiPhoto[]>
}

interface Props {
  sessionId: string
  onGuestsChange?: (guests: StageGuest[]) => void
}

export default function LivePhotoWall({ sessionId, onGuestsChange }: Props) {
  const [photos, setPhotos] = useState<ApiPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [pulseLive, setPulseLive] = useState(false)
  const lastSeenIdsRef = useRef<Set<string>>(new Set())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchWall = useCallback(async () => {
    if (!sessionId) return
    try {
      const url = new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/gallery`)
      url.searchParams.set('sessionId', sessionId)
      const res = await fetch(url.toString(), {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` },
      })
      if (!res.ok) throw new Error(`gallery ${res.status}`)
      const json = (await res.json()) as ApiResponse

      // Flatten all sections into a single list, newest first.
      const flat: ApiPhoto[] = Object.values(json.sections ?? {})
        .flat()
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))

      // Detect newly-arrived photos so we can briefly pulse the "live" pill.
      const seen = lastSeenIdsRef.current
      const isInitial = seen.size === 0
      const fresh = flat.filter((p) => !seen.has(p.id))
      flat.forEach((p) => seen.add(p.id))
      if (!isInitial && fresh.length > 0) {
        setPulseLive(true)
        setTimeout(() => setPulseLive(false), 5000)
      }

      setPhotos(flat)
      onGuestsChange?.(json.guests ?? [])
    } catch {
      /* fail soft — wall just keeps showing what it had */
    } finally {
      setLoading(false)
    }
  }, [sessionId, onGuestsChange])

  useEffect(() => {
    fetchWall()
  }, [fetchWall])

  // Realtime: any photo or reaction change triggers a debounced refetch so a
  // burst of inserts only re-renders once. Same shape as GalleryView.
  useEffect(() => {
    if (!sessionId) return
    const supabase = createClient()

    function scheduleRefetch() {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null
        void fetchWall()
      }, 400)
    }

    const channel = supabase
      .channel(`stage-wall-${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'photos', filter: `session_id=eq.${sessionId}` },
        scheduleRefetch
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'photos', filter: `session_id=eq.${sessionId}` },
        scheduleRefetch
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reactions', filter: `session_id=eq.${sessionId}` },
        scheduleRefetch
      )
      .subscribe()

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
      supabase.removeChannel(channel)
    }
  }, [sessionId, fetchWall])

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <p style={headerLabelStyle}>The Evening · Live</p>
        <LiveIndicator active={pulseLive} />
      </div>

      {loading && photos.length === 0 ? (
        <div style={emptyStyle}>
          <div style={{ width: '1px', height: '40px', backgroundColor: '#D4AF37', opacity: 0.4 }} />
        </div>
      ) : photos.length === 0 ? (
        <div style={emptyStyle}>
          <p style={emptyTextStyle}>
            photos will appear here as the evening unfolds
          </p>
        </div>
      ) : (
        <div style={gridStyle}>
          <AnimatePresence>
            {photos.map((photo) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                style={tileStyle}
              >
                {photo.signed_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={photo.signed_url}
                    alt={`${photo.guest?.name ?? 'Guest'} — ${photo.course}`}
                    style={imgStyle}
                  />
                ) : (
                  <div style={{ ...imgStyle, backgroundColor: 'rgba(255,255,255,0.04)' }} />
                )}

                <div style={captionBarStyle}>
                  <span style={captionGuestStyle}>
                    {photo.guest?.name ?? 'Guest'}
                  </span>
                  <span style={captionCourseStyle}>
                    {COURSE_COURSE_LABELS[photo.course] ?? photo.course}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function LiveIndicator({ active }: { active: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: active ? '#4DD9C0' : '#D4AF37',
        boxShadow: active ? '0 0 12px #4DD9C0' : 'none',
        animation: active ? 'cabana-pulse 1.5s ease-in-out infinite' : 'none',
        transition: 'background-color 0.3s, box-shadow 0.3s',
      }} />
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '10px',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: active ? '#4DD9C0' : 'rgba(212,175,55,0.6)',
        transition: 'color 0.3s',
      }}>
        {active ? 'New' : 'Live'}
      </span>
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  minHeight: '100dvh',
  display: 'flex',
  flexDirection: 'column',
  padding: 'clamp(1rem, 2vmin, 2rem)',
  boxSizing: 'border-box',
  overflow: 'hidden',
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.5rem 0.75rem 1rem',
  borderBottom: '1px solid rgba(212,175,55,0.1)',
  marginBottom: '1rem',
  flexShrink: 0,
}

const headerLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'clamp(11px, 1.2vmin, 16px)',
  letterSpacing: '0.35em',
  textTransform: 'uppercase',
  color: '#D4AF37',
  margin: 0,
  opacity: 0.85,
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '8px',
  overflowY: 'auto',
  paddingBottom: '1rem',
  alignContent: 'start',
  flex: 1,
}

const tileStyle: React.CSSProperties = {
  position: 'relative',
  aspectRatio: '1',
  overflow: 'hidden',
  border: '1px solid rgba(212,175,55,0.15)',
  backgroundColor: 'rgba(255,255,255,0.02)',
}

const imgStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
}

const captionBarStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '6px 8px',
  background: 'linear-gradient(to top, rgba(10,10,15,0.85) 0%, rgba(10,10,15,0) 100%)',
  pointerEvents: 'none',
}

const captionGuestStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '10px',
  letterSpacing: '0.1em',
  color: '#F5F0E8',
  opacity: 0.85,
}

const captionCourseStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '9px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#D4AF37',
  opacity: 0.8,
}

const emptyStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '2rem',
}

const emptyTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontStyle: 'italic',
  fontSize: 'clamp(0.9rem, 1.6vmin, 1.25rem)',
  color: 'rgba(245,240,232,0.35)',
  maxWidth: '320px',
  margin: 0,
}
