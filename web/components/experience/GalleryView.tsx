'use client'

import { useEffect, useState } from 'react'
import type { Guest } from '@/app/experience/page'
import ReactionPicker from '@/components/experience/ReactionPicker'
import { COURSE_COURSE_LABELS } from '@/lib/constants'

interface PhotoEntry {
  id: string
  course: string
  signed_url: string | null
  guest: { id: string; name: string } | null
  reaction: { id: string; from_guest_id: string; reaction_type: string } | null
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

const SECTION_ORDER = ['guest', 'pour', 'bite', 'cut', 'finish', 'booth']

export default function GalleryView({ guest, sessionId }: Props) {
  const [data, setData] = useState<GalleryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGallery() {
      try {
        const url = new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/gallery`)
        url.searchParams.set('sessionId', sessionId)
        const res = await fetch(url.toString())
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Failed to load gallery')
        setData(json as GalleryData)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    fetchGallery()
  }, [sessionId])

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
              const myReaction = isMyPhoto ? null : (photo.reaction?.from_guest_id === guest.id ? photo.reaction.reaction_type : null)

              return (
                <div key={photo.id}>
                  {photo.signed_url ? (
                    <div style={{ position: 'relative' }}>
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

                      {/* Reaction: only show picker on other guest's photos */}
                      {!isMyPhoto && (
                        <ReactionPicker
                          photoId={photo.id}
                          sessionId={sessionId}
                          existingReaction={myReaction as 'fire' | 'heart' | 'chefs_kiss' | null}
                        />
                      )}

                      {/* Show reaction received on my photo */}
                      {isMyPhoto && photo.reaction && (
                        <p style={{ textAlign: 'center', fontSize: '1.25rem', marginTop: '0.25rem' }}>
                          {photo.reaction.reaction_type === 'fire' ? '🔥'
                            : photo.reaction.reaction_type === 'heart' ? '❤️'
                            : '🤌'}
                        </p>
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
        <p style={{ ...subStyle, opacity: 0.35 }}>The Cabana · {new Date(data.session.event_date).getFullYear()}</p>
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
