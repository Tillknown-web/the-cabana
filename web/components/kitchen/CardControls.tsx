'use client'

import { useState } from 'react'
import { callEdgeFn } from '@/lib/edge-fn'
import type { SessionState } from '@/app/kitchen/page'

const CARD_SEQUENCE = [
  'welcome',
  'pour',
  'intermission-1',
  'bite',
  'intermission-2',
  'cut',
  'intermission-3',
  'finish',
  'gallery',
] as const

type Card = (typeof CARD_SEQUENCE)[number]

const COURSE_CARDS = new Set<string>(['pour', 'bite', 'cut', 'finish', 'gallery'])

const CARD_LABELS: Record<string, string> = {
  welcome: 'Welcome',
  pour: 'The Pour',
  'intermission-1': 'Intermission I',
  bite: 'The Bite',
  'intermission-2': 'Intermission II',
  cut: 'The Cut',
  'intermission-3': 'Intermission III',
  finish: 'The Finish',
  gallery: 'Gallery',
}

interface Props {
  sessionState: SessionState | null
  sessionId: string
  accessToken: string
  onStateChange: (state: SessionState) => void
}

export default function CardControls({ sessionState, sessionId, accessToken, onStateChange }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<string | null>(null)

  if (!sessionState) {
    return (
      <div>
        <SectionLabel>Card Release</SectionLabel>
        <p style={emptyStyle}>Loading session…</p>
      </div>
    )
  }

  const currentIndex = CARD_SEQUENCE.indexOf(sessionState.current_card as Card)
  const nextCard = CARD_SEQUENCE[currentIndex + 1] as Card | undefined

  async function release(card: string) {
    if (loading) return
    setLoading(card)
    setError(null)
    setConfirm(null)

    try {
      const result = await callEdgeFn('release-card', { sessionId, card }, accessToken) as SessionState
      onStateChange(result as unknown as SessionState)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(null)
    }
  }

  async function skip() {
    if (!nextCard || loading) return
    setLoading('skip')
    setError(null)
    setConfirm(null)

    try {
      const result = await callEdgeFn('skip-card', { sessionId, card: nextCard }, accessToken)
      onStateChange(result as unknown as SessionState)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(null)
    }
  }

  const isCourseCard = nextCard ? COURSE_CARDS.has(nextCard) : false

  return (
    <div>
      <SectionLabel>Card Release</SectionLabel>

      {/* Current status */}
      <p style={statusStyle}>
        Current: <span style={{ color: '#D4AF37' }}>{CARD_LABELS[sessionState.current_card] ?? sessionState.current_card}</span>
      </p>

      {/* Next card action */}
      {nextCard ? (
        <div style={{ marginTop: '1rem' }}>
          {confirm === nextCard ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => release(nextCard)}
                disabled={!!loading}
                style={{ ...primaryBtnStyle, flex: 1 }}
              >
                {loading === nextCard ? 'Releasing…' : `Confirm: ${CARD_LABELS[nextCard]}`}
              </button>
              <button onClick={() => setConfirm(null)} style={cancelBtnStyle}>
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => isCourseCard ? setConfirm(nextCard) : release(nextCard)}
              disabled={!!loading}
              style={{ ...primaryBtnStyle, width: '100%' }}
            >
              Release → {CARD_LABELS[nextCard]}
            </button>
          )}

          {/* Skip intermission — only available if next card is an intermission */}
          {nextCard.startsWith('intermission') && (
            <button
              onClick={skip}
              disabled={!!loading}
              style={{ ...ghostBtnStyle, marginTop: '0.5rem', width: '100%' }}
            >
              {loading === 'skip' ? 'Skipping…' : 'Skip Intermission'}
            </button>
          )}
        </div>
      ) : (
        <p style={emptyStyle}>All cards have been released.</p>
      )}

      {error && <p style={errorStyle}>{error}</p>}

      {/* Full sequence overview */}
      <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {CARD_SEQUENCE.map((card, i) => {
          const isDone = i <= currentIndex
          const isCurrent = card === sessionState.current_card
          return (
            <span
              key={card}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '9px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: isCurrent ? '#1A1A2E' : isDone ? '#D4AF37' : '#F5F0E8',
                opacity: isDone || isCurrent ? 1 : 0.25,
                backgroundColor: isCurrent ? '#D4AF37' : isDone ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                border: `1px solid ${isDone || isCurrent ? 'rgba(212, 175, 55, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                padding: '0.2rem 0.5rem',
              }}
            >
              {CARD_LABELS[card] ?? card}
            </span>
          )
        })}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-sans)',
      fontSize: '10px',
      letterSpacing: '0.25em',
      textTransform: 'uppercase',
      color: '#D4AF37',
      opacity: 0.7,
      marginBottom: '0.75rem',
    }}>
      {children}
    </p>
  )
}

const statusStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '13px',
  color: '#F5F0E8',
  opacity: 0.7,
}

const primaryBtnStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  backgroundColor: '#D4AF37',
  color: '#1A1A2E',
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  border: 'none',
  cursor: 'pointer',
}

const ghostBtnStyle: React.CSSProperties = {
  padding: '0.65rem 1rem',
  backgroundColor: 'transparent',
  color: '#F5F0E8',
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  border: '1px solid rgba(255,255,255,0.15)',
  cursor: 'pointer',
  opacity: 0.7,
}

const cancelBtnStyle: React.CSSProperties = {
  padding: '0.65rem 1rem',
  backgroundColor: 'transparent',
  color: '#F5F0E8',
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  border: '1px solid rgba(255,255,255,0.15)',
  cursor: 'pointer',
  opacity: 0.5,
}

const emptyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '12px',
  color: '#F5F0E8',
  opacity: 0.35,
}

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  color: '#A8C5DA',
  marginTop: '0.5rem',
  opacity: 0.8,
}
