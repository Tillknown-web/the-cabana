'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const INTERMISSION_MESSAGES = [
  'A moment between courses.',
  'The kitchen is at work.',
  'Good things take time.',
  'Enjoy the music.',
  'Something is on its way.',
  'The chef is preparing.',
]

const INTERMISSION_LABELS: Record<string, string> = {
  'intermission-1': 'Between the pour & the bite',
  'intermission-2': 'Between the bite & the cut',
  'intermission-3': 'Before the finish',
}

interface CountdownRow {
  target_card: string
  expires_at: string
}

interface Props {
  card: string
  sessionId: string
}

export default function IntermissionCard({ card, sessionId }: Props) {
  const [msgIndex, setMsgIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [countdown, setCountdown] = useState<CountdownRow | null>(null)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)

  const supabase = createClient()

  // Rotate messages
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % INTERMISSION_MESSAGES.length)
        setVisible(true)
      }, 400)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Fetch + subscribe to countdown
  useEffect(() => {
    supabase
      .from('countdowns')
      .select('target_card, expires_at')
      .eq('session_id', sessionId)
      .single()
      .then(({ data }) => { if (data) setCountdown(data as CountdownRow) })

    const channel = supabase
      .channel(`intermission-countdown-${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'countdowns', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setCountdown(null)
            setSecondsLeft(null)
          } else {
            setCountdown(payload.new as CountdownRow)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Tick countdown
  useEffect(() => {
    if (!countdown) { setSecondsLeft(null); return }

    function tick() {
      const diff = Math.max(0, Math.floor((new Date(countdown!.expires_at).getTime() - Date.now()) / 1000))
      setSecondsLeft(diff)
    }

    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [countdown])

  const showCountdown = secondsLeft !== null && secondsLeft > 0
  const mins = showCountdown ? Math.floor(secondsLeft! / 60) : 0
  const secs = showCountdown ? secondsLeft! % 60 : 0

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
    }}>
      {/* Label */}
      <p style={labelStyle}>{INTERMISSION_LABELS[card] ?? 'Intermission'}</p>

      {/* Countdown or animated message */}
      {showCountdown ? (
        <div>
          <div style={timerStyle}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
          <p style={{ ...messageStyle, opacity: 0.5, marginTop: '1rem' }}>
            estimated wait
          </p>
        </div>
      ) : (
        <div>
          <div style={dividerStyle} />
          <p style={{
            ...messageStyle,
            opacity: visible ? 0.6 : 0,
            transition: 'opacity 0.4s ease',
          }}>
            {INTERMISSION_MESSAGES[msgIndex]}
          </p>
        </div>
      )}

      {/* Animated line */}
      <div style={{ marginTop: '3rem' }}>
        <AnimatedLine />
      </div>
    </div>
  )
}

function AnimatedLine() {
  return (
    <div style={{ width: '40px', overflow: 'hidden' }}>
      <div style={{
        width: '100%',
        height: '1px',
        backgroundColor: '#D4AF37',
        opacity: 0.4,
        animation: 'cabana-scan 2s ease-in-out infinite',
      }} />
      <style>{`
        @keyframes cabana-scan {
          0%, 100% { opacity: 0.2; transform: scaleX(0.3); }
          50% { opacity: 0.6; transform: scaleX(1); }
        }
      `}</style>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: '#D4AF37',
  marginBottom: '1.5rem',
}

const dividerStyle: React.CSSProperties = {
  width: '40px',
  height: '1px',
  backgroundColor: '#D4AF37',
  opacity: 0.4,
  margin: '0 auto 1.5rem',
}

const timerStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(3rem, 14vw, 5rem)',
  fontWeight: 400,
  color: '#F5F0E8',
  letterSpacing: '0.05em',
}

const messageStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '1rem',
  fontStyle: 'italic',
  color: '#F5F0E8',
  maxWidth: '240px',
  margin: '0 auto',
}
