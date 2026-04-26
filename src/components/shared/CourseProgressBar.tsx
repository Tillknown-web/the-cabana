'use client'

import type { CardId } from '@/types'
import { COURSE_CARDS } from '@/types'

interface CourseProgressBarProps {
  currentCard: CardId
  releasedCards: CardId[]
}

export default function CourseProgressBar({ currentCard, releasedCards }: CourseProgressBarProps) {
  const courseIndex = COURSE_CARDS.indexOf(currentCard)

  // Determine state for each dot
  const dots = COURSE_CARDS.map((card, i) => {
    if (releasedCards.includes(card) && card !== currentCard) return 'completed'
    if (card === currentCard) return 'current'
    return 'upcoming'
  })

  // Don't show on check-in, welcome, or gallery
  const hiddenCards: CardId[] = ['checkin', 'welcome', 'gallery']
  if (hiddenCards.includes(currentCard) && courseIndex === -1) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        zIndex: 50,
        paddingTop: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {dots.map((state, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Dot */}
            <div
              style={{
                width: state === 'current' ? 10 : 8,
                height: state === 'current' ? 10 : 8,
                borderRadius: '50%',
                backgroundColor:
                  state === 'completed'
                    ? '#D4AF37'
                    : state === 'current'
                    ? '#D4AF37'
                    : 'transparent',
                border:
                  state === 'upcoming'
                    ? '1.5px solid rgba(212,175,55,0.4)'
                    : state === 'current'
                    ? '2px solid #D4AF37'
                    : 'none',
                boxShadow: state === 'current' ? '0 0 8px rgba(212,175,55,0.6)' : 'none',
                transition: 'all 0.4s ease',
                flexShrink: 0,
              }}
            />
            {/* Connecting line (not after last dot) */}
            {i < dots.length - 1 && (
              <div
                style={{
                  width: 28,
                  height: 1,
                  backgroundColor:
                    state === 'completed' ? '#D4AF37' : 'rgba(212,175,55,0.25)',
                  transition: 'background-color 0.4s ease',
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
