'use client'

import { useState } from 'react'
import type { SessionState } from '@/app/kitchen/page'

interface Props {
  sessionState: SessionState | null
  sessionId: string
  accessToken: string
  onReset?: () => void
}

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

export default function SessionHeader({ sessionState, sessionId, accessToken, onReset }: Props) {
  const currentCard = sessionState?.current_card ?? '—'
  const releasedCount = sessionState?.released_cards?.length ?? 0
  const [confirming, setConfirming] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)

  async function handleReset() {
    if (!confirming) { setConfirming(true); return }
    setResetting(true)
    setConfirming(false)
    setResetError(null)
    try {
      const res = await fetch('/api/kitchen/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setResetError((json as { error?: string }).error ?? `Reset failed (${res.status})`)
        return
      }
      onReset?.()
    } catch {
      setResetError('Network error — reset may not have completed')
    } finally {
      setResetting(false)
    }
  }

  return (
    <header style={{
      backgroundColor: '#1A1A2E',
      borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
      padding: '1rem 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: '640px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}>
        {/* Wordmark */}
        <div>
          <p style={wordmarkStyle}>The Cabana</p>
          <p style={sessionStyle}>/ kitchen · {sessionId}</p>
        </div>

        {/* Right side: current card + reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Reset button */}
          {confirming ? (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button onClick={handleReset} style={confirmBtnStyle}>Confirm Reset</button>
              <button onClick={() => setConfirming(false)} style={cancelBtnStyle}>Cancel</button>
            </div>
          ) : (
            <button
              onClick={handleReset}
              disabled={resetting}
              style={resetBtnStyle}
            >
              {resetting ? '…' : 'Reset'}
            </button>
          )}

          {/* Current card */}
          <div style={{ textAlign: 'right' }}>
            <p style={cardLabelStyle}>Live</p>
            <p style={cardValueStyle}>{CARD_LABELS[currentCard] ?? currentCard}</p>
          </div>
        </div>
      </div>

      {/* Reset error */}
      {resetError && (
        <div style={{
          maxWidth: '640px',
          margin: '0.5rem auto 0',
          padding: '0.4rem 0.75rem',
          backgroundColor: 'rgba(168, 197, 218, 0.12)',
          border: '1px solid rgba(168, 197, 218, 0.3)',
        }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '10px',
            letterSpacing: '0.05em',
            color: '#A8C5DA',
            margin: 0,
          }}>
            ⚠ {resetError}
          </p>
        </div>
      )}

      {/* Released cards progress */}
      {sessionState && releasedCount > 0 && (
        <div style={{
          maxWidth: '640px',
          margin: '0.5rem auto 0',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
        }}>
          {sessionState.released_cards.map((card) => (
            <span key={card} style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '9px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#D4AF37',
              opacity: 0.5,
              backgroundColor: 'rgba(212, 175, 55, 0.08)',
              padding: '0.15rem 0.4rem',
            }}>
              {CARD_LABELS[card] ?? card}
            </span>
          ))}
        </div>
      )}
    </header>
  )
}

const wordmarkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '1.1rem',
  color: '#F5F0E8',
  margin: 0,
  lineHeight: 1.2,
}

const sessionStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '10px',
  color: '#F5F0E8',
  opacity: 0.35,
  margin: 0,
  letterSpacing: '0.05em',
}

const cardLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '9px',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: '#D4AF37',
  margin: 0,
  opacity: 0.7,
}

const cardValueStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '1rem',
  color: '#F5F0E8',
  margin: 0,
}

const resetBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '9px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: '#F5F0E8',
  opacity: 0.3,
  background: 'none',
  border: '1px solid rgba(255,255,255,0.15)',
  padding: '0.3rem 0.65rem',
  cursor: 'pointer',
}

const confirmBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '9px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: '#1A1A2E',
  backgroundColor: '#A8C5DA',
  border: 'none',
  padding: '0.3rem 0.65rem',
  cursor: 'pointer',
}

const cancelBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '9px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#F5F0E8',
  opacity: 0.4,
  background: 'none',
  border: '1px solid rgba(255,255,255,0.12)',
  padding: '0.3rem 0.5rem',
  cursor: 'pointer',
}
