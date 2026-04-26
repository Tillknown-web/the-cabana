'use client'

import { useEffect, useState } from 'react'
import { callEdgeFn } from '@/lib/edge-fn'
import { createClient } from '@/lib/supabase/client'

const VALID_MINUTES = [5, 10, 15, 20] as const

interface CountdownRow {
  target_card: string
  expires_at: string
}

interface Props {
  sessionId: string
  currentCard: string
  accessToken: string
}

export default function CountdownSetter({ sessionId, currentCard, accessToken }: Props) {
  const [activeCountdown, setActiveCountdown] = useState<CountdownRow | null>(null)
  const [selectedMinutes, setSelectedMinutes] = useState<number>(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)

  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('countdowns')
      .select('target_card, expires_at')
      .eq('session_id', sessionId)
      .single()
      .then(({ data }) => { if (data) setActiveCountdown(data as CountdownRow) })

    const channel = supabase
      .channel(`kt-countdown-${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'countdowns', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') { setActiveCountdown(null); setSecondsLeft(null) }
          else setActiveCountdown(payload.new as CountdownRow)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown tick
  useEffect(() => {
    if (!activeCountdown) { setSecondsLeft(null); return }
    function tick() {
      const diff = Math.max(0, Math.floor((new Date(activeCountdown!.expires_at).getTime() - Date.now()) / 1000))
      setSecondsLeft(diff)
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [activeCountdown])

  async function set() {
    if (loading) return
    setLoading(true)
    setError(null)

    // The next card to be released (for targeting)
    const targetCard = getNextCard(currentCard)

    try {
      await callEdgeFn('set-countdown', { sessionId, targetCard, minutes: selectedMinutes }, accessToken)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function cancel() {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      await callEdgeFn('set-countdown', { sessionId, cancel: true }, accessToken)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const mins = secondsLeft !== null ? Math.floor(secondsLeft / 60) : null
  const secs = secondsLeft !== null ? secondsLeft % 60 : null

  return (
    <div>
      <SectionLabel>Countdown ETA</SectionLabel>
      <p style={helpStyle}>Shown on guest waiting screens. Informational only — does not auto-advance.</p>

      {activeCountdown ? (
        <div style={activeBoxStyle}>
          <p style={activeTimerStyle}>
            {mins !== null && secs !== null
              ? `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} remaining`
              : 'Active'}
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: '#F5F0E8', opacity: 0.4, margin: '0.25rem 0 0' }}>
            → {activeCountdown.target_card}
          </p>
          <button onClick={cancel} disabled={loading} style={{ ...cancelBtnStyle, marginTop: '0.75rem' }}>
            {loading ? 'Cancelling…' : 'Cancel Countdown'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {VALID_MINUTES.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMinutes(m)}
              style={{
                padding: '0.45rem 0.85rem',
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                backgroundColor: selectedMinutes === m ? '#D4AF37' : 'transparent',
                color: selectedMinutes === m ? '#1A1A2E' : '#F5F0E8',
                border: `1px solid ${selectedMinutes === m ? '#D4AF37' : 'rgba(255,255,255,0.2)'}`,
                cursor: 'pointer',
                opacity: selectedMinutes === m ? 1 : 0.5,
              }}
            >
              {m}m
            </button>
          ))}
          <button
            onClick={set}
            disabled={loading}
            style={{
              padding: '0.45rem 1.25rem',
              backgroundColor: '#D4AF37',
              color: '#1A1A2E',
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              border: 'none',
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? '…' : 'Set'}
          </button>
        </div>
      )}

      {error && <p style={errorStyle}>{error}</p>}
    </div>
  )
}

function getNextCard(current: string): string {
  const seq = ['welcome', 'pour', 'intermission-1', 'bite', 'intermission-2', 'cut', 'intermission-3', 'finish', 'gallery']
  const i = seq.indexOf(current)
  return i >= 0 && i < seq.length - 1 ? seq[i + 1] : current
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
      marginBottom: '0.5rem',
    }}>
      {children}
    </p>
  )
}

const helpStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  color: '#F5F0E8',
  opacity: 0.35,
  marginBottom: '0.75rem',
}

const activeBoxStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  border: '1px solid rgba(212, 175, 55, 0.3)',
  backgroundColor: 'rgba(212, 175, 55, 0.06)',
}

const activeTimerStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '1.25rem',
  color: '#D4AF37',
  margin: 0,
}

const cancelBtnStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-sans)',
  fontSize: '10px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#F5F0E8',
  opacity: 0.4,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
}

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  color: '#A8C5DA',
  marginTop: '0.5rem',
  opacity: 0.8,
}
