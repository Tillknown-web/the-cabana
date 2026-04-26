'use client'

import { useState, useEffect } from 'react'
import GoldDivider from '@/components/shared/GoldDivider'
import PhotoGate from './PhotoGate'

const LABEL = 'the finish'
const DISH_NAME = 'Cheesecake Brownie'
const INGREDIENTS = 'gold leaf · raspberry coulis'
const DESCRIPTION = 'Dense, rich, finished with edible gold.'

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
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div
      className="screen-enter"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#1A1A2E',
        display: 'flex',
        flexDirection: 'column',
        overflowY: phase === 'full' ? 'auto' : 'hidden',
        paddingTop: 56,
        paddingBottom: 72,
        transition: 'background-color 1s ease',
      }}
    >
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
          gap: 0,
        }}
      >
        {/* Gold shimmer label reveal */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            marginBottom: 20,
            opacity: phase !== 'dark' ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        >
          <span className="shimmer-gold">{LABEL}</span>
        </p>

        {/* Dish name */}
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(28px, 7vw, 36px)',
            fontWeight: 400,
            color: '#F5F0E8',
            lineHeight: 1.15,
            marginBottom: 12,
            opacity: phase === 'dish' || phase === 'full' ? 1 : 0,
            transition: 'opacity 0.8s ease',
          }}
        >
          {DISH_NAME}
        </h2>

        {/* Rest of card */}
        {(phase === 'dish' || phase === 'full') && (
          <>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontStyle: 'italic',
                color: '#A8C5DA',
                marginBottom: 24,
              }}
            >
              {INGREDIENTS}
            </p>

            <GoldDivider style={{ marginBottom: 24 }} />

            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: 'rgba(245,240,232,0.8)',
                lineHeight: 1.7,
                marginBottom: dessertRevealed ? 20 : 32,
                maxWidth: 320,
                opacity: phase === 'full' ? 1 : 0,
                transition: 'opacity 0.6s ease 0.2s',
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
                  marginBottom: 28,
                  padding: '14px 20px',
                  border: '1px solid rgba(212,175,55,0.5)',
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
                    marginBottom: 6,
                  }}
                >
                  <span className="shimmer-gold">The reveal</span>
                </p>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 15,
                    fontStyle: 'italic',
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
