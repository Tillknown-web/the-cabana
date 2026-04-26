'use client'

import { useEffect, useState } from 'react'
import type { CourseId, ReactionType } from '@/types'
import { COURSE_TO_LABEL } from '@/types'
import GoldDivider from '@/components/shared/GoldDivider'

const COURSES: CourseId[] = ['guest', 'pour', 'bite', 'cut', 'finish', 'booth']

const REACTION_EMOJI: Record<ReactionType, string> = {
  fire: '🔥',
  heart: '❤️',
  chefs_kiss: '🤌',
}

interface GalleryPhoto {
  id: string
  guest_id: string
  guest_name: string
  course: CourseId
  signed_url: string
  reactions: ReactionType[]
}

export default function GalleryView({ sessionId }: { sessionId: string }) {
  const [photos, setPhotos] = useState<Record<CourseId, GalleryPhoto[]>>({} as Record<CourseId, GalleryPhoto[]>)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<GalleryPhoto | null>(null)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/gallery/${sessionId}`)
      if (!res.ok) return
      const data = await res.json()
      const grouped: Record<string, GalleryPhoto[]> = {}
      for (const p of data.photos as GalleryPhoto[]) {
        if (!grouped[p.course]) grouped[p.course] = []
        grouped[p.course].push(p)
      }
      setPhotos(grouped as Record<CourseId, GalleryPhoto[]>)
      setLoading(false)
    }
    load()
  }, [sessionId])

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#2D1B47', padding: '60px 20px 80px', textAlign: 'center' }}>

      {expanded && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(26,26,46,0.96)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setExpanded(null)}
        >
          <img src={expanded.signed_url} alt="" style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: 4, objectFit: 'contain' }} />
        </div>
      )}

      {/* Header */}
      <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(32px, 8vw, 48px)', fontWeight: 400, color: '#F5F0E8', marginBottom: 8 }}>
        The Cabana
      </p>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#D4AF37', marginBottom: 8 }}>
        poolside · after dark
      </p>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'rgba(245,240,232,0.4)', marginBottom: 40 }}>
        July 12, 2026
      </p>

      <GoldDivider style={{ marginBottom: 48 }} />

      {loading ? (
        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, color: 'rgba(245,240,232,0.4)', fontStyle: 'italic' }}>
          Loading the night…
        </p>
      ) : (
        <>
          {COURSES.map((course) => {
            const coursePhotos = photos[course] || []
            if (coursePhotos.length === 0) return null
            return (
              <section key={course} style={{ marginBottom: 48, textAlign: 'left' }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#D4AF37', marginBottom: 20 }}>
                  — {COURSE_TO_LABEL[course]}
                </p>
                <div
                  style={{
                    display: course === 'booth' ? 'flex' : 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 12,
                    overflowX: course === 'booth' ? 'auto' : undefined,
                    flexDirection: course === 'booth' ? 'row' : undefined,
                  }}
                >
                  {coursePhotos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => setExpanded(photo)}
                      style={{ cursor: 'pointer', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(212,175,55,0.2)', flexShrink: course === 'booth' ? 0 : undefined, width: course === 'booth' ? 160 : undefined }}
                    >
                      <img src={photo.signed_url} alt={photo.guest_name} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                      <div style={{ padding: '8px 10px', backgroundColor: 'rgba(0,0,0,0.25)' }}>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'rgba(245,240,232,0.55)' }}>{photo.guest_name}</p>
                        {photo.reactions?.length > 0 && (
                          <p style={{ fontSize: 13, marginTop: 3 }}>{photo.reactions.map((r) => REACTION_EMOJI[r]).join(' ')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}

          <GoldDivider style={{ margin: '40px auto' }} />

          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 18, fontStyle: 'italic', color: 'rgba(245,240,232,0.45)', marginTop: 40 }}>
            Thank you for dining at The Cabana.
          </p>
        </>
      )}
    </main>
  )
}
