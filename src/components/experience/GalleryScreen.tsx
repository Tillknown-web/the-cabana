'use client'

import { useEffect, useState, useRef } from 'react'
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

interface GalleryScreenProps {
  sessionId: string
  guestId: string
  guestName: string
}

export default function GalleryScreen({ sessionId, guestId, guestName }: GalleryScreenProps) {
  const [photos, setPhotos] = useState<Record<CourseId, GalleryPhoto[]>>({} as Record<CourseId, GalleryPhoto[]>)
  const [loading, setLoading] = useState(true)
  const [expandedPhoto, setExpandedPhoto] = useState<GalleryPhoto | null>(null)
  const receiptCanvasRef = useRef<HTMLCanvasElement>(null)

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

  async function drawReceipt(): Promise<HTMLCanvasElement | null> {
    const canvas = receiptCanvasRef.current
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const W = 400
    const lineHeight = 28
    const courses: CourseId[] = ['pour', 'bite', 'cut', 'finish']
    const H = 320 + courses.length * 80
    canvas.width = W
    canvas.height = H

    ctx.fillStyle = '#1A1A2E'
    ctx.fillRect(0, 0, W, H)

    let y = 40

    ctx.fillStyle = '#F5F0E8'
    ctx.font = 'italic 500 22px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText('The Cabana', W / 2, y)
    y += 28

    ctx.fillStyle = '#D4AF37'
    ctx.font = '500 10px Inter, sans-serif'
    ctx.fillText('POOLSIDE · AFTER DARK', W / 2, y)
    y += 28

    ctx.fillStyle = 'rgba(245,240,232,0.5)'
    ctx.font = '10px Inter, sans-serif'
    ctx.fillText('July 12, 2026', W / 2, y)
    y += 28

    ctx.strokeStyle = 'rgba(212,175,55,0.4)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(W / 2 - 20, y)
    ctx.lineTo(W / 2 + 20, y)
    ctx.stroke()
    y += 24

    ctx.fillStyle = '#F5F0E8'
    ctx.font = '12px Inter, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`Guest: ${guestName}`, 40, y)
    y += 32

    const dishNames: Record<CourseId, string> = {
      guest: '',
      pour: 'Sunset Spritz',
      bite: 'Slider Trio',
      cut: 'Ribeye, tableside',
      finish: 'Cheesecake Brownie',
      booth: '',
    }

    for (const course of courses) {
      ctx.fillStyle = '#D4AF37'
      ctx.font = '500 10px Inter, sans-serif'
      ctx.fillText(COURSE_TO_LABEL[course].toUpperCase(), 40, y)
      y += 18

      ctx.fillStyle = '#F5F0E8'
      ctx.font = '13px Georgia, serif'
      ctx.fillText(dishNames[course], 40, y)
      y += lineHeight

      const myPhoto = (photos[course] || []).find((p) => p.guest_id === guestId)
      if (myPhoto?.signed_url) {
        try {
          const img = await loadImage(myPhoto.signed_url)
          const thumbH = 60
          const thumbW = (img.width / img.height) * thumbH
          ctx.drawImage(img, 40, y, thumbW, thumbH)
          y += thumbH + 16
        } catch {
          y += 16
        }
      } else {
        y += 16
      }
    }

    y += 8
    ctx.strokeStyle = 'rgba(212,175,55,0.4)'
    ctx.beginPath()
    ctx.moveTo(40, y)
    ctx.lineTo(W - 40, y)
    ctx.stroke()
    y += 20

    ctx.fillStyle = 'rgba(245,240,232,0.5)'
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('4 courses served', W / 2, y)
    y += 18
    ctx.fillText('Thank you for dining at The Cabana.', W / 2, y)

    return canvas
  }

  async function downloadReceipt() {
    const canvas = await drawReceipt()
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cabana-receipt-${guestName.toLowerCase().replace(/\s/g, '-')}.png`
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  async function shareReceipt() {
    const canvas = await drawReceipt()
    if (!canvas) return
    canvas.toBlob(async (blob) => {
      if (!blob) return
      const file = new File([blob], 'cabana-receipt.png', { type: 'image/png' })
      try {
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: 'The Cabana', text: 'poolside, after dark' })
        } else {
          await downloadReceipt()
        }
      } catch {
        await downloadReceipt()
      }
    }, 'image/png')
  }

  const galleryUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/gallery/${sessionId}`

  function copyGalleryLink() {
    navigator.clipboard.writeText(galleryUrl).catch(() => {})
  }

  if (loading) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#2D1B47',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p
          className="animate-pulse-soft"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, color: 'rgba(245,240,232,0.5)' }}
        >
          Loading your night…
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#2D1B47',
        padding: '60px 20px 120px',
        textAlign: 'center',
      }}
    >
      <canvas ref={receiptCanvasRef} style={{ display: 'none' }} />

      {/* Expanded photo overlay */}
      {expandedPhoto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(26,26,46,0.95)',
            zIndex: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={() => setExpandedPhoto(null)}
        >
          <img
            src={expandedPhoto.signed_url}
            alt=""
            style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 4, objectFit: 'contain' }}
          />
        </div>
      )}

      {/* Header */}
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'rgba(245,240,232,0.5)', marginBottom: 8 }}>
        Thank you for dining
      </p>
      <h1
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(32px, 8vw, 44px)',
          fontWeight: 400,
          color: '#F5F0E8',
          marginBottom: 20,
        }}
      >
        at The Cabana.
      </h1>

      <GoldDivider style={{ marginBottom: 48 }} />

      {/* Photo sections */}
      {COURSES.map((course) => {
        const coursePhotos = photos[course] || []
        if (coursePhotos.length === 0) return null
        return (
          <section key={course} style={{ marginBottom: 48 }}>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: '#D4AF37',
                marginBottom: 20,
                textAlign: 'left',
              }}
            >
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
                  onClick={() => setExpandedPhoto(photo)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: '1px solid rgba(212,175,55,0.2)',
                    flexShrink: course === 'booth' ? 0 : undefined,
                    width: course === 'booth' ? 160 : undefined,
                  }}
                >
                  <img
                    src={photo.signed_url}
                    alt={photo.guest_name}
                    style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ padding: '8px 10px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'rgba(245,240,232,0.6)' }}>
                      {photo.guest_name}
                    </p>
                    {photo.reactions?.length > 0 && (
                      <p style={{ fontSize: 14, marginTop: 4 }}>
                        {photo.reactions.map((r) => REACTION_EMOJI[r]).join(' ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })}

      <GoldDivider style={{ margin: '40px auto' }} />

      {/* Receipt */}
      <div
        style={{
          border: '1px solid rgba(212,175,55,0.25)',
          borderRadius: 6,
          padding: '32px 24px',
          maxWidth: 380,
          margin: '0 auto 32px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: '#D4AF37',
            marginBottom: 20,
          }}
        >
          Digital Keepsake Receipt
        </p>

        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 24,
            color: '#F5F0E8',
            marginBottom: 4,
          }}
        >
          The Cabana
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: '#D4AF37', marginBottom: 16 }}>
          poolside, after dark
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'rgba(245,240,232,0.5)', marginBottom: 20 }}>
          July 12, 2026
        </p>

        <GoldDivider style={{ marginBottom: 20 }} />

        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#F5F0E8', marginBottom: 24 }}>
          Guest: {guestName}
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={downloadReceipt}
            style={{
              padding: '12px 20px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(212,175,55,0.5)',
              borderRadius: 2,
              color: '#D4AF37',
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            📥 Download
          </button>
          <button
            onClick={shareReceipt}
            style={{
              padding: '12px 20px',
              backgroundColor: '#D4AF37',
              border: 'none',
              borderRadius: 2,
              color: '#2D1B47',
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            📤 Share
          </button>
        </div>
      </div>

      {/* Share gallery link */}
      <div
        style={{
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: 6,
          padding: '24px',
          maxWidth: 380,
          margin: '0 auto 48px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            color: '#D4AF37',
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          🔗 Share the gallery
        </p>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            color: 'rgba(245,240,232,0.4)',
            marginBottom: 16,
            wordBreak: 'break-all',
          }}
        >
          {galleryUrl}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={copyGalleryLink}
            style={{
              padding: '10px 18px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(212,175,55,0.4)',
              borderRadius: 2,
              color: '#D4AF37',
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            Copy link
          </button>
          <button
            onClick={async () => {
              try {
                await navigator.share({ title: 'The Cabana Gallery', url: galleryUrl })
              } catch {
                copyGalleryLink()
              }
            }}
            style={{
              padding: '10px 18px',
              backgroundColor: '#D4AF37',
              border: 'none',
              borderRadius: 2,
              color: '#2D1B47',
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            Share
          </button>
        </div>
      </div>

      <p
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 18,
          fontStyle: 'italic',
          color: 'rgba(245,240,232,0.5)',
          textAlign: 'center',
        }}
      >
        See you at judging.
      </p>
    </div>
  )
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
