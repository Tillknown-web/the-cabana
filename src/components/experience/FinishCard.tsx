'use client'

import { useState, useEffect } from 'react'
import GoldDivider from '@/components/shared/GoldDivider'
import PhotoGate from './PhotoGate'

const LABEL = 'the finish'
const DISH_NAME = 'Cheesecake Brownie'
const INGREDIENTS = 'gold leaf · raspberry coulis'
const DESCRIPTION = 'Dense, rich, finished with edible gold.'

const RINGS = [
  { size: 480, duration: '6s', delay: '0s' },
  { size: 320, duration: '8s', delay: '1.5s' },
]

interface FinishCardProps {
  sessionId: string
  guestId: string
  onComplete: () => void
  otherGuestPhoto?: { id: string; signedUrl: string; guestName: string } | null
  dessertRevealed?: boolean
}

export default function FinishCard({ sessionId, guestId, onComplete, otherGuestPhoto, dessertRevealed }: FinishCardProps) {
  const [phase, setPhase] = useState<'dark' | 'label' | 'dish' | 'full'>('dark')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('label'), 800)
    const t2 = setTimeout(() => setPhase('dish'), 2200)
    const t3 = setTimeout(() => setPhase('full'), 3400)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <div
      className="screen-enter"
      style={{
        position: 'fixed',
        inset: 0,
        background: phase === 'dark'
          ? '#0D0D1A'
          : 'linear-gradient(160deg, #0D0D1A 0%, #1A1A2E 55%, #120D28 100%)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: phase === 'full' ? 'auto' : 'hidden',
        paddingTop: 56,
        paddingBottom: 72,
        transition: 'background 1.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* Ambient rings — only visible in later phases */}
      {phase !== 'dark' && RINGS.map((ring, i) => (
        <div
          key={i}
          style={{
            position: 'fixed',
            top: '42%',
            left: '50%',
            width: ring.size,
            height: ring.size,
            marginLeft: -(ring.size / 2),
            marginTop: -(ring.size / 2),
            borderRadius: '50%',
            border: '1px solid #D4AF37',
            animation: `ring-breathe ${ring.duration} ease-in-out infinite`,
            animationDelay: ring.delay,
            pointerEvents: 'none',
            opacity: phase === 'label' ? 0.5 : 1,
            transition: 'opacity 1s ease',
          }}
        />
      ))}

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: phase === 'full' ? 'flex-start' : 'center',
          padding: '40px 28px 32px',
          textAlign: 'center',
          maxWidth: 480,
          margin: '0 auto',
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Gold shimmer label reveal */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.35em',
            marginBottom: 20,
            opacity: phase !== 'dark' ? 1 : 0,
            transition: 'opacity 0.8s ease',
          }}
        >
          <span className="shimmer-gold">{LABEL}</span>
        </p>

        {/* Dish name */}
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(30px, 8vw, 44px)',
            fontWeight: 400,
            color: '#F5F0E8',
            lineHeight: 1.1,
            marginBottom: 14,
            letterSpacing: '-0.01em',
            opacity: phase === 'dish' || phase === 'full' ? 1 : 0,
            transition: 'opacity 0.9s ease',
          }}
        >
          {DISH_NAME}
        </h2>

        {(phase === 'dish' || phase === 'full') && (
          <>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 15,
                fontStyle: 'italic',
                fontWeight: 300,
                color: '#A8C5DA',
                marginBottom: 28,
                letterSpacing: '0.03em',
              }}
            >
              {INGREDIENTS}
            </p>

            <GoldDivider width={48} style={{ marginBottom: 28 }} />

            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: 'rgba(245,240,232,0.78)',
                lineHeight: 1.75,
                marginBottom: dessertRevealed ? 20 : 36,
                maxWidth: 300,
                opacity: phase === 'full' ? 1 : 0,
                transition: 'opacity 0.7s ease 0.2s',
              }}
            >
              {DESCRIPTION}
            </p>

            {/* Tableside dessert reveal banner */}
            {dessertRevealed && phase === 'full' && (
              <div
                className="animate-fade-in"
                style={{
                  width: '100%',
                  maxWidth: 320,
                  marginBottom: 32,
                  padding: '16px 20px',
                  border: '1px solid rgba(212,175,55,0.45)',
                  borderRadius: 4,
                  textAlign: 'center',
                  background: 'rgba(212,175,55,0.07)',
                }}
              >
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3em',
                    marginBottom: 8,
                  }}
                >
                  <span className="shimmer-gold">The reveal</span>
                </p>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 16,
                    fontStyle: 'italic',
                    fontWeight: 300,
                    color: 'rgba(245,240,232,0.75)',
                  }}
                >
                  Gold leaf applied. Watch your plate.
                </p>
              </div>
            )}

            {phase === 'full' && (
              <div
                className="animate-fade-in"
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <PhotoGate
                  course="finish"
                  sessionId={sessionId}
                  guestId={guestId}
                  onComplete={onComplete}
                  otherGuestPhoto={otherGuestPhoto}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
