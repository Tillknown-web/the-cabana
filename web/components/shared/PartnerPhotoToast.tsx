'use client'

import { useEffect, useState } from 'react'
import type { PartnerPhoto } from '@/lib/hooks/usePartnerPhotos'
import { courseLabel } from '@/lib/hooks/usePartnerPhotos'

interface Props {
  arrival: PartnerPhoto | null
}

/**
 * Brief toast announcing a partner's new photo upload. Mirrors the
 * ChefNoteToast fade/translate pattern, with a 48px thumbnail on the
 * left and two-line text on the right.
 *
 * Animates whenever `arrival` changes to a new photo id; auto-dismisses
 * after ~5s. Tap currently does nothing (intentional — avoid yanking the
 * guest away from the current course).
 */
export default function PartnerPhotoToast({ arrival }: Props) {
  const [shown, setShown] = useState<PartnerPhoto | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!arrival) return
    setShown(arrival)
    setVisible(true)
    const hide = setTimeout(() => setVisible(false), 5000)
    const clear = setTimeout(() => setShown(null), 5500)
    return () => {
      clearTimeout(hide)
      clearTimeout(clear)
    }
  }, [arrival?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!shown) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: '3rem',
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? '0' : '-1rem'})`,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        zIndex: 100,
        maxWidth: '320px',
        width: '92vw',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(10, 10, 15, 0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            flexShrink: 0,
            overflow: 'hidden',
            border: '1px solid rgba(212, 175, 55, 0.4)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shown.url}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '9px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#D4AF37',
              margin: '0 0 0.25rem',
            }}
          >
            From {shown.guestName}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '0.92rem',
              fontStyle: 'italic',
              color: '#F5F0E8',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Just shared a {courseLabel(shown.course).toLowerCase()} photo
          </p>
        </div>
      </div>
    </div>
  )
}
