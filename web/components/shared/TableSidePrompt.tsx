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

export default function TableSidePrompt({ sessionId, currentCard: _currentCard }: Props) {
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

  const dismiss = () => {
    setVisible(false)
    setTimeout(() => setTrigger(null), 600)
  }

  if (trigger.trigger_type === 'butter_pour') {
    return <ButterPourOverlay visible={visible} onDismiss={dismiss} />
  }

  return (
    <div
      onClick={dismiss}
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
      <DessertRevealContent />
      <p style={tapToDismissStyle}>Tap to dismiss</p>
    </div>
  )
}

// ─── Butter Pour Overlay ─────────────────────────────────────────────────────
//
// Timing (all relative to trigger mount):
//   0 – 150 ms   : anticipation — dark veil fades in, page feels like it inhales
//   150 – 950 ms  : butter descends from top with an organic wavy leading edge
//   950 – 1100 ms : settle — the wave at the bottom ripples twice, like liquid finishing
//   1100 – 1450 ms: butter layer fades out, content fades up from beneath
//   1450 ms+      : compound-butter page is fully visible; tap to dismiss

function ButterPourOverlay({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        cursor: 'pointer',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }}
    >
      {/* ── Back layer: the content page, revealed as butter fades ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#1A1A2E',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ animation: 'cbp-content-rise 500ms ease 1200ms both' }}>
          <p style={triggerLabelStyle}>Watch the Chef</p>
          <h2 style={triggerHeadingStyle}>Compound Butter</h2>
          <div style={triggerDividerStyle} />
          <p style={triggerSubStyle}>A moment of craft at your table.</p>
        </div>
        <p style={{ ...tapToDismissStyle, animation: 'cbp-content-rise 400ms ease 1500ms both' }}>
          Tap to dismiss
        </p>
      </div>

      {/* ── Front layer: butter animation — covers, settles, then fades ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          animation: 'cbp-overlay-exit 350ms ease 1100ms forwards',
        }}
      >
        {/* Phase 1 — dark anticipation veil (0–150 ms) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(6, 4, 2, 0.5)',
            animation: 'cbp-anticipate 150ms ease both',
          }}
        />

        {/* Phase 2–4 — liquid butter SVG with organic wavy leading edge */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          <defs>
            <linearGradient id="cbp-butter-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#FFD54F" />
              <stop offset="40%"  stopColor="#EAB830" />
              <stop offset="100%" stopColor="#C89B2B" />
            </linearGradient>
          </defs>
          {/*
            No initial `d` attribute — animation-fill-mode:both (via "both") applies
            the 0% keyframe from the very start, keeping the sliver invisible during
            the 150 ms anticipation delay.
          */}
          <path
            fill="url(#cbp-butter-grad)"
            style={{ animation: 'cbp-pour 1100ms cubic-bezier(0.42, 0, 0.28, 1) 150ms both' }}
          />
        </svg>

        {/* Light-reflection highlight streak */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '-32%',
            width: '32%',
            height: '100%',
            background:
              'linear-gradient(108deg, transparent 20%, rgba(255, 255, 235, 0.22) 50%, transparent 80%)',
            pointerEvents: 'none',
            animation: 'cbp-highlight 800ms ease 560ms both',
          }}
        />
      </div>

      <style>{`
        /* ── Phase 1: anticipation dark veil ── */
        @keyframes cbp-anticipate {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /*
         * ── Phase 2–4: butter pour + settle ──
         *
         * All keyframes share the same 6-command path structure:
         *   M → C → C → L → L → Z
         * so the browser can interpolate smoothly between every frame.
         *
         * 0 – 72 %  →  descent (wavy leading edge falls from top)
         * 72 – 100% →  settle  (bottom edge ripples twice, like liquid finishing)
         */
        @keyframes cbp-pour {
          0%   { d: path("M 0 1.5  C 18 4,    36 -1,   50 1.5  C 66 4,    82 0,    100 1.5  L 100 0 L 0 0 Z"); }
          8%   { d: path("M 0 10   C 20 14,   40 6,    52 11   C 65 16,   83 8,    100 12   L 100 0 L 0 0 Z"); }
          20%  { d: path("M 0 27   C 20 32,   42 22,   55 29   C 68 36,   84 24,   100 30   L 100 0 L 0 0 Z"); }
          38%  { d: path("M 0 53   C 22 58,   44 47,   56 54   C 70 61,   85 50,   100 56   L 100 0 L 0 0 Z"); }
          56%  { d: path("M 0 76   C 24 81,   46 71,   58 78   C 72 85,   87 74,   100 79   L 100 0 L 0 0 Z"); }
          65%  { d: path("M 0 92   C 22 96,   46 88,   60 93   C 76 98,   88 90,   100 94   L 100 0 L 0 0 Z"); }
          72%  { d: path("M 0 100  C 20 100,  42 100,  56 100  C 72 100,  87 100,  100 100  L 100 0 L 0 0 Z"); }
          80%  { d: path("M 0 99.2 C 22 101,  45 97.5, 60 99.5 C 76 102,  89 98,   100 99.2 L 100 0 L 0 0 Z"); }
          88%  { d: path("M 0 100  C 24 99,   48 101,  60 100  C 76 99,   90 101,  100 100  L 100 0 L 0 0 Z"); }
          94%  { d: path("M 0 99.5 C 22 101,  46 98,   62 99.5 C 78 101,  90 98,   100 99.5 L 100 0 L 0 0 Z"); }
          100% { d: path("M 0 100  C 20 100,  42 100,  56 100  C 72 100,  87 100,  100 100  L 100 0 L 0 0 Z"); }
        }

        /* ── Light streak ── */
        @keyframes cbp-highlight {
          0%   { transform: translateX(0);    opacity: 0; }
          10%  { opacity: 1; }
          88%  { opacity: 0.85; }
          100% { transform: translateX(410%); opacity: 0; }
        }

        /* ── Phase 5: butter layer fades, revealing content ── */
        @keyframes cbp-overlay-exit {
          from { opacity: 1; }
          to   { opacity: 0; }
        }

        /* ── Phase 6: content rises into view ── */
        @keyframes cbp-content-rise {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ─── Dessert Reveal ───────────────────────────────────────────────────────────

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

const tapToDismissStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '9px',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: '#F5F0E8',
  opacity: 0.3,
  marginTop: '3rem',
}
