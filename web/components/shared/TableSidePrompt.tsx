'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TriggerRow {
  trigger_type: 'butter_pour' | 'dessert_reveal'
  expires_at: string
}

interface Props {
  sessionId: string
  currentCard: string
}

export default function TableSidePrompt({ sessionId, currentCard }: Props) {
  const [trigger, setTrigger] = useState<TriggerRow | null>(null)
  const [visible, setVisible] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`tableside-${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tableside_triggers', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const row = payload.new as TriggerRow
          const expiresAt = new Date(row.expires_at).getTime()
          if (Date.now() < expiresAt) {
            setTrigger(row)
            setVisible(true)
            // Auto-dismiss at expiry
            const ms = expiresAt - Date.now()
            setTimeout(() => {
              setVisible(false)
              setTimeout(() => setTrigger(null), 600)
            }, ms)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!trigger) return null

  const isButterPour = trigger.trigger_type === 'butter_pour'

  return (
    <div
      onClick={() => { setVisible(false); setTimeout(() => setTrigger(null), 600) }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        backgroundColor: '#1A1A2E',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease',
        cursor: 'pointer',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      {isButterPour ? <ButterPourContent /> : <DessertRevealContent />}
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '9px',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: '#F5F0E8',
        opacity: 0.3,
        marginTop: '3rem',
      }}>
        Tap to dismiss
      </p>
    </div>
  )
}

function ButterPourContent() {
  return (
    <>
      <div style={{ fontSize: '4rem', marginBottom: '1.5rem', animation: 'cabana-float 2s ease-in-out infinite' }}>
        🧈
      </div>
      <p style={triggerLabelStyle}>Watch the Chef</p>
      <h2 style={triggerHeadingStyle}>Compound Butter</h2>
      <div style={triggerDividerStyle} />
      <p style={triggerSubStyle}>A moment of craft at your table.</p>
      <style>{`
        @keyframes cabana-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </>
  )
}

function DessertRevealContent() {
  const dessert = 'The Finish'
  const [revealIndex, setRevealIndex] = useState(0)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      setRevealIndex(i)
      if (i >= dessert.length) clearInterval(interval)
    }, 80)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <p style={triggerLabelStyle}>The Dessert</p>
      <h2 style={{ ...triggerHeadingStyle, fontSize: 'clamp(3rem, 14vw, 5.5rem)' }}>
        {dessert.split('').map((char, i) => (
          <span
            key={i}
            style={{
              color: i < revealIndex ? '#D4AF37' : 'rgba(245, 240, 232, 0.1)',
              transition: 'color 0.3s ease',
            }}
          >
            {char}
          </span>
        ))}
      </h2>
      <div style={triggerDividerStyle} />
      <p style={triggerSubStyle}>Enjoy the reveal.</p>
    </>
  )
}

const triggerLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: '#D4AF37',
  marginBottom: '0.75rem',
}

const triggerHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(2.5rem, 12vw, 5rem)',
  fontWeight: 400,
  color: '#F5F0E8',
  margin: 0,
  lineHeight: 1.1,
}

const triggerDividerStyle: React.CSSProperties = {
  width: '40px',
  height: '1px',
  backgroundColor: '#D4AF37',
  opacity: 0.5,
  margin: '1.5rem auto',
}

const triggerSubStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '1rem',
  fontStyle: 'italic',
  color: '#F5F0E8',
  opacity: 0.6,
}
