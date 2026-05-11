'use client'

import { useState, useEffect } from 'react'
import type { CardId, CourseId } from '@/types'
import GoldDivider from '@/components/shared/GoldDivider'
import PhotoGate from './PhotoGate'

interface SauceCard {
  name: string
  description: string
}

interface CourseCardProps {
  cardId: CardId
  courseLabel: string
  dishName: string
  ingredients: string
  description: string
  backstoryTitle?: string
  backstory?: string
  sauceCards?: SauceCard[]
  tablesideTrigger?: boolean
  tablesidePrompt?: string
  tablesideHighlight?: string
  revealLabel?: string
  revealBody?: string
  course: CourseId
  sessionId: string
  guestId: string
  backgroundColor: string
  onComplete: () => void
  otherGuestPhoto?: { id: string; signedUrl: string; guestName: string } | null
}

export default function CourseCard({
  cardId,
  courseLabel,
  dishName,
  ingredients,
  description,
  backstoryTitle,
  backstory,
  sauceCards,
  tablesideTrigger,
  tablesidePrompt,
  tablesideHighlight,
  revealLabel,
  revealBody,
  course,
  sessionId,
  guestId,
  backgroundColor,
  onComplete,
  otherGuestPhoto,
}: CourseCardProps) {
  const [backstoryOpen, setBackstoryOpen] = useState(false)
  const [photoPhase, setPhotoPhase] = useState(false)
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
        backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        overflowY: phase === 'full' ? 'auto' : 'hidden',
        paddingTop: 56,
        paddingBottom: 72,
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
          gap: 0,
          maxWidth: 480,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Course label — shimmer-gold reveal */}
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
          <span className="shimmer-gold">{courseLabel}</span>
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
          {dishName}
        </h2>

        {/* Auto-reveal banner — fires at dish phase, stays through full */}
        {revealLabel && revealBody && (phase === 'dish' || phase === 'full') && (
          <div
            className="animate-fade-in"
            style={{
              width: '100%',
              maxWidth: 320,
              marginTop: 20,
              marginBottom: phase === 'full' ? 0 : 0,
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
              <span className="shimmer-gold">{revealLabel}</span>
            </p>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 15,
                fontStyle: 'italic',
                color: 'rgba(245,240,232,0.75)',
              }}
            >
              {revealBody}
            </p>
          </div>
        )}

        {/* Rest of card — revealed in 'full' phase */}
        {(phase === 'dish' || phase === 'full') && (
          <>
            {/* Ingredients */}
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontStyle: 'italic',
                color: '#A8C5DA',
                marginBottom: 24,
                lineHeight: 1.5,
                opacity: phase === 'full' ? 1 : 0,
                transition: 'opacity 0.6s ease 0.1s',
              }}
            >
              {ingredients}
            </p>

            <GoldDivider style={{ marginBottom: 24, opacity: phase === 'full' ? 1 : 0, transition: 'opacity 0.6s ease 0.15s' }} />

            {/* Description */}
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: 'rgba(245,240,232,0.8)',
                lineHeight: 1.7,
                marginBottom: 24,
                maxWidth: 340,
                opacity: phase === 'full' ? 1 : 0,
                transition: 'opacity 0.6s ease 0.2s',
              }}
            >
              {description}
            </p>

            {/* Sauce cards (for the bite) */}
            {sauceCards && sauceCards.length > 0 && phase === 'full' && (
              <div
                className="animate-fade-in"
                style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}
              >
                {sauceCards.map((s) => (
                  <div
                    key={s.name}
                    style={{
                      border: '1px solid rgba(212,175,55,0.2)',
                      borderRadius: 4,
                      padding: '14px 16px',
                      textAlign: 'left',
                    }}
                  >
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: '#F5F0E8', marginBottom: 4 }}>
                      {s.name}
                    </p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#A8C5DA', fontStyle: 'italic' }}>
                      {s.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Tableside trigger prompt */}
            {tablesideTrigger && tablesidePrompt && phase === 'full' && (
              <div
                className="animate-fade-in"
                style={{
                  width: '100%',
                  border: '1px solid rgba(212,175,55,0.35)',
                  borderRadius: 4,
                  padding: '16px 20px',
                  marginBottom: 24,
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: '#F5F0E8', marginBottom: 4 }}>
                  👀 {tablesidePrompt}
                </p>
                {tablesideHighlight && (
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: 16,
                      fontStyle: 'italic',
                      color: '#D4AF37',
                    }}
                  >
                    {tablesideHighlight}
                  </p>
                )}
              </div>
            )}

            {/* Behind the [course] accordion */}
            {backstory && phase === 'full' && (
              <div
                className="animate-fade-in"
                style={{ width: '100%', marginBottom: 28 }}
              >
                <button
                  onClick={() => setBackstoryOpen((o) => !o)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px 0',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: '#D4AF37',
                      transition: 'transform 0.2s',
                      transform: backstoryOpen ? 'rotate(90deg)' : 'none',
                      display: 'inline-block',
                    }}
                  >
                    ▸
                  </span>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      color: '#D4AF37',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {backstoryTitle || `Behind the ${courseLabel}`}
                  </span>
                </button>

                {backstoryOpen && (
                  <div
                    style={{
                      padding: '12px 0 4px',
                      borderTop: '1px solid rgba(212,175,55,0.15)',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        color: 'rgba(245,240,232,0.65)',
                        lineHeight: 1.7,
                      }}
                    >
                      {backstory}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Photo gate */}
            {phase === 'full' && (
              <div
                className="animate-fade-in"
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <PhotoGate
                  course={course}
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
