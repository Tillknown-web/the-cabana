'use client'

import { useState, useEffect } from 'react'
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

const LA_FMT = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

function getLATime() {
  return LA_FMT.format(new Date())
}

export default function SessionHeader({ sessionState, sessionId, accessToken, onReset }: Props) {
  const currentCard = sessionState?.current_card ?? '—'
  const releasedCount = sessionState?.released_cards?.length ?? 0
  const [confirming, setConfirming] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [laTime, setLaTime] = useState(getLATime)

  useEffect(() => {
    const id = setInterval(() => setLaTime(getLATime()), 1000)
    return () => clearInterval(id)
  }, [])

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

  // Split HH:MM:SS into parts so we can style the colons separately
  const [hh, mm, ss] = laTime.split(':')

  return (
    <header style={{
      backgroundColor: '#0D0D14',
      borderBottom: '1px solid rgba(212, 175, 55, 0.18)',
      padding: '0.75rem 1.5rem 0.6rem',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: '1rem',
      }}>
        {/* Left: Wordmark */}
        <div>
          <p style={wordmarkStyle}>The Cabana</p>
          <p style={sessionStyle}>/ kitchen · {sessionId}</p>
        </div>

        {/* Centre: BIG LA Clock */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 400,
            color: '#D4AF37',
            lineHeight: 1,
            letterSpacing: '0.04em',
            animation: 'glow-pulse 3s ease-in-out infinite',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
          }}>
            <span>{hh}</span>
            <ColonSep />
            <span>{mm}</span>
            <ColonSep />
            <span>{ss}</span>
          </div>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '8px',
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: '#D4AF37',
            opacity: 0.45,
            marginTop: '0.3rem',
          }}>
            Los Angeles
          </p>
        </div>

        {/* Right: current card + reset */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
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
          maxWidth: '900px',
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
          maxWidth: '900px',
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

// Pulsing colon separator component
function ColonSep() {
  return (
    <span style={{
      display: 'inline-block',
      width: '0.55em',
      textAlign: 'center',
      animation: 'glow-pulse 1s ease-in-out infinite',
      opacity: 0.7,
    }}>
      :
    </span>
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
  color: '#0D0D14',
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
