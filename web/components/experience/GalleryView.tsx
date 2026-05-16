'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Guest } from '@/app/experience/page'
import ReactionPicker from '@/components/experience/ReactionPicker'
import { COURSE_COURSE_LABELS } from '@/lib/constants'
import { FlameIcon, HeartIcon, StarIcon } from '@/lib/icons'
import { createClient } from '@/lib/supabase/client'

interface ReactionRow {
  id: string
  from_guest_id: string
  reaction_type: string
}

interface PhotoEntry {
  id: string
  course: string
  signed_url: string | null
  guest: { id: string; name: string } | null
  reactions: ReactionRow[]
}

interface GalleryData {
  session: { session_id: string; event_date: string }
  guests: { id: string; name: string }[]
  sections: Record<string, PhotoEntry[]>
}

interface Props {
  guest: Guest
  sessionId: string
}

const SECTION_ORDER = ['guest', 'pour', 'bite', 'cleanse', 'agua', 'cut', 'finish', 'booth']

export default function GalleryView({ guest, sessionId }: Props) {
  const [data, setData] = useState<GalleryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchGallery = useCallback(async () => {
    try {
      const url = new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/gallery`)
      url.searchParams.set('sessionId', sessionId)
      const res = await fetch(url.toString(), {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to load gallery')
      setData(json as GalleryData)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchGallery()
  }, [fetchGallery])

  // Keep the gallery in sync with realtime photo uploads and reaction
  // inserts/updates. Both event streams trigger a debounced refetch so a
  // burst of changes only re-renders once.
  useEffect(() => {
    if (!sessionId) return
    const supabase = createClient()

    function scheduleRefetch() {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null
        void fetchGallery()
      }, 400)
    }

    const channel = supabase
      .channel(`exp-gallery-${sessionId}`)
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
  }, [sessionId, fetchGallery])

  if (loading) {
    return (
      <div style={centeredStyle}>
        <p style={labelStyle}>Loading gallery…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={centeredStyle}>
        <p style={{ ...labelStyle, color: '#A8C5DA' }}>{error ?? 'Gallery not available.'}</p>
      </div>
    )
  }

  const sections = SECTION_ORDER.filter((s) => data.sections[s]?.length)

  return (
    <div style={{ padding: '3rem 1.5rem 6rem', maxWidth: '480px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        {/* Brand wordmark */}
        <img
          src="/logo-main.png"
          alt="The Cabana"
          style={{ width: 'clamp(200px, 65vw, 340px)', height: 'auto', margin: '0 auto 1.5rem', display: 'block' }}
        />
        <p style={labelStyle}>The Evening</p>
        <h1 style={headingStyle}>Your Gallery</h1>
        <div style={dividerStyle} />
        <p style={subStyle}>
          {data.guests.map((g) => g.name).join(' & ')}
        </p>
        <p style={{ ...subStyle, opacity: 0.4, fontSize: '11px', marginTop: '0.25rem' }}>
          {new Date(data.session.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Course sections */}
      {sections.map((sectionKey) => (
        <div key={sectionKey} style={{ marginBottom: '3rem' }}>
          {/* Section label */}
          <p style={{ ...labelStyle, marginBottom: '1rem' }}>
            {COURSE_COURSE_LABELS[sectionKey] ?? sectionKey}
          </p>

          {/* Photos grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {data.sections[sectionKey].map((photo) => {
              const isMyPhoto = photo.guest?.id === guest.id
              const myExistingReaction = photo.reactions.find((r) => r.from_guest_id === guest.id)?.reaction_type ?? null
              const reactionsToShow = isMyPhoto
                ? photo.reactions
                : photo.reactions.filter((r) => r.from_guest_id !== guest.id)

              return (
                <div key={photo.id}>
                  {photo.signed_url ? (
                    <div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.signed_url}
                        alt={`${photo.guest?.name ?? 'Photo'} — ${sectionKey}`}
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          objectFit: 'cover',
                          display: 'block',
                          border: isMyPhoto ? '1px solid rgba(212, 175, 55, 0.25)' : '1px solid transparent',
                        }}
                      />

                      {/* Guest name */}
                      <p style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '10px',
                        letterSpacing: '0.1em',
                        color: '#F5F0E8',
                        opacity: 0.5,
                        marginTop: '0.35rem',
                        textAlign: 'center',
                      }}>
                        {photo.guest?.name ?? 'Guest'}
                      </p>

                      {/* Reaction picker: only on other guest's photos */}
                      {!isMyPhoto && (
                        <ReactionPicker
                          photoId={photo.id}
                          sessionId={sessionId}
                          existingReaction={myExistingReaction as 'fire' | 'heart' | 'chefs_kiss' | null}
                        />
                      )}

                      {/* All reactions on this photo (excluding self's reaction on
                          partner photos, which the picker already represents). */}
                      {reactionsToShow.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '0.25rem', color: '#D4AF37' }}>
                          {reactionsToShow.map((r) => (
                            <span key={r.id} title={`from ${data.guests.find((g) => g.id === r.from_guest_id)?.name ?? 'guest'}`} style={{ display: 'flex' }}>
                              {r.reaction_type === 'fire' ? <FlameIcon size={20} />
                                : r.reaction_type === 'heart' ? <HeartIcon size={20} />
                                : <StarIcon size={20} />}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      width: '100%',
                      aspectRatio: '1',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(212, 175, 55, 0.1)',
                    }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <div style={dividerStyle} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', opacity: 0.35 }}>
          <img src="/logo-main.png" alt="The Cabana" style={{ height: '28px', width: 'auto' }} />
          · {new Date(data.session.event_date).getFullYear()}
        </span>
      </div>
    </div>
  )
}

const centeredStyle: React.CSSProperties = {
  minHeight: '100dvh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: '#D4AF37',
  margin: 0,
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(2.5rem, 10vw, 4rem)',
  fontWeight: 400,
  color: '#F5F0E8',
  margin: '0.75rem 0 0',
}

const dividerStyle: React.CSSProperties = {
  width: '40px',
  height: '1px',
  backgroundColor: '#D4AF37',
  opacity: 0.4,
  margin: '1.25rem auto',
}

const subStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '1rem',
  fontStyle: 'italic',
  color: '#F5F0E8',
  opacity: 0.6,
  margin: 0,
}
