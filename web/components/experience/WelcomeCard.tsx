'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Guest } from '@/app/experience/page'
import PhotoUpload from '@/components/experience/PhotoUpload'

const WAITING_MESSAGES = [
  'The chef is preparing something special.',
  'A moment before the evening begins.',
  'Good things are on their way.',
  'The kitchen is alive tonight.',
  'Sit back. Let the evening unfold.',
]

interface Props {
  guest: Guest
  sessionId: string
}

export default function WelcomeCard({ guest, sessionId }: Props) {
  // null = still checking, false = no photo yet, true = photo exists
  const [hasPhoto, setHasPhoto] = useState<boolean | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [msgIndex, setMsgIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  const supabase = createClient()

  // Check if guest photo already exists
  useEffect(() => {
    supabase
      .from('photos')
      .select('id')
      .eq('guest_id', guest.id)
      .eq('course', 'guest')
      .single()
      .then(({ data }) => setHasPhoto(!!data))
  }, [guest.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Rotate waiting messages (Phase B only)
  useEffect(() => {
    if (!hasPhoto) return
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % WAITING_MESSAGES.length)
        setVisible(true)
      }, 400)
    }, 4000)
    return () => clearInterval(interval)
  }, [hasPhoto])

  // Still checking — blank screen briefly
  if (hasPhoto === null) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '1px', height: '40px', backgroundColor: '#D4AF37', opacity: 0.3 }} />
      </div>
    )
  }

  // Phase B — waiting for chef
  if (hasPhoto) {
    return (
      <div style={centeredLayout}>
        <p style={labelStyle}>welcome</p>
        <h1 style={headingStyle}>{guest.name}</h1>
        <div style={dividerStyle} />
        <p style={{
          ...messageStyle,
          opacity: visible ? 0.6 : 0,
          transition: 'opacity 0.4s ease',
        }}>
          {WAITING_MESSAGES[msgIndex]}
        </p>
        <div style={{ marginTop: '3rem' }}>
          <PulseDot />
        </div>
      </div>
    )
  }

  // Phase A — no guest photo yet
  return (
    <div style={{ ...centeredLayout, justifyContent: 'flex-start', paddingTop: '5rem' }}>
      <p style={labelStyle}>welcome</p>
      <h1 style={headingStyle}>The Cabana</h1>
      <div style={dividerStyle} />

      {/* How tonight works callout */}
      <div style={{
        border: '1px solid rgba(212, 175, 55, 0.35)',
        padding: '1.25rem 1.5rem',
        maxWidth: '300px',
        marginBottom: '2rem',
        textAlign: 'left',
      }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '9px',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: '#D4AF37',
          marginBottom: '0.6rem',
        }}>
          How tonight works
        </p>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '12px',
          color: '#A8C5DA',
          lineHeight: 1.6,
          margin: 0,
        }}>
          After each course, you&apos;ll be asked to snap a photo of your dish.
          At the end of the night, everyone&apos;s photos come together in a
          shared gallery — same plates, different eyes.
        </p>
      </div>

      {/* Prompt */}
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '12px',
        fontStyle: 'italic',
        color: '#A8C5DA',
        opacity: 0.8,
        marginBottom: '1.5rem',
        maxWidth: '260px',
        textAlign: 'center',
      }}>
        But first — snap a photo of who you&apos;re with tonight.
      </p>

      {/* Photo upload */}
      <div style={{ width: '100%', maxWidth: '280px' }}>
        {showUpload ? (
          <PhotoUpload
            course="guest"
            guestId={guest.id}
            sessionId={sessionId}
            onUploaded={() => setHasPhoto(true)}
            onCancel={() => setShowUpload(false)}
          />
        ) : (
          <button
            onClick={() => setShowUpload(true)}
            style={snapBtnStyle}
          >
            <span style={{ fontSize: '1.25rem' }}>📷</span>
            <span style={{ marginLeft: '0.5rem', fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' as const }}>
              Snap your guest
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

function PulseDot() {
  return (
    <div style={{ position: 'relative', width: '8px', height: '8px', margin: '0 auto' }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#D4AF37',
        opacity: 0.7,
        animation: 'cabana-pulse 2s ease-in-out infinite',
      }} />
      <style>{`
        @keyframes cabana-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.4); }
        }
      `}</style>
    </div>
  )
}

const centeredLayout: React.CSSProperties = {
  minHeight: '100dvh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  textAlign: 'center',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: '#D4AF37',
  marginBottom: '1.25rem',
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(2.5rem, 10vw, 4.5rem)',
  fontWeight: 400,
  color: '#F5F0E8',
  margin: 0,
  lineHeight: 1.1,
}

const dividerStyle: React.CSSProperties = {
  width: '40px',
  height: '1px',
  backgroundColor: '#D4AF37',
  opacity: 0.5,
  margin: '1.5rem 0',
}

const messageStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '1rem',
  fontStyle: 'italic',
  color: '#F5F0E8',
  maxWidth: '260px',
}

const snapBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '1rem',
  backgroundColor: '#D4AF37',
  color: '#2D1B47',
  border: 'none',
  cursor: 'pointer',
}
