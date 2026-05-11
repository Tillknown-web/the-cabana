'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TriggerRow {
  trigger_type: 'butter_pour' | 'dessert_reveal' | 'pour_moment' | 'bite_moment'
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

  if (trigger.trigger_type === 'pour_moment')   return <PourMomentOverlay   visible={visible} onDismiss={dismiss} />
  if (trigger.trigger_type === 'bite_moment')   return <BiteMomentOverlay   visible={visible} onDismiss={dismiss} />
  if (trigger.trigger_type === 'butter_pour')   return <ButterPourOverlay   visible={visible} onDismiss={dismiss} />

  // dessert_reveal
  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        backgroundColor: '#0A0A0F',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease',
        cursor: 'pointer',
        padding: '2rem',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      <DessertUnboxingContent />
      <p style={{ ...tapToDismissStyle, animation: 'dr-content-rise 400ms ease 1800ms both' }}>Tap to dismiss</p>
    </div>
  )
}

// ─── Pour Moment Overlay ──────────────────────────────────────────────────────
//
// Timing:
//   0 – 200 ms   : warm amber radial tint blooms from center
//   200 – 950 ms  : liquid stream SVG pours from upper-right into center pool
//   950 – 1400 ms : 6 champagne bubbles rise from the pool, staggered
//   1400 ms+      : "The Pour / Sunset Spritz" content rises into view

function PourMomentOverlay({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
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
        overflow: 'hidden',
      }}
    >
      {/* Background with warm amber bloom */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#0A0A0F',
          background: 'radial-gradient(ellipse 70% 60% at 50% 55%, rgba(234,130,20,0.12) 0%, #0A0A0F 70%)',
          animation: 'pm-bloom 800ms ease 100ms both',
        }}
      />

      {/* Content layer — revealed after pour */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ animation: 'pm-content-rise 500ms ease 1400ms both' }}>
          <p style={triggerLabelStyle}>The Pour</p>
          <h2 style={triggerHeadingStyle}>Sunset Spritz</h2>
          <div style={triggerDividerStyle} />
          <p style={triggerSubStyle}>mango · pineapple · tajín</p>
        </div>
        <p style={{ ...tapToDismissStyle, animation: 'pm-content-rise 400ms ease 1700ms both' }}>
          Tap to dismiss
        </p>
      </div>

      {/* Pour stream SVG — amber liquid arc falling into a pool */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          animation: 'pm-stream-exit 300ms ease 1200ms forwards',
        }}
      >
        <defs>
          <linearGradient id="pm-pour-grad" x1="0.8" y1="0" x2="0.3" y2="1">
            <stop offset="0%"   stopColor="#F5E6B0" />
            <stop offset="35%"  stopColor="#EAB830" />
            <stop offset="70%"  stopColor="#E07B20" />
            <stop offset="100%" stopColor="#C86010" />
          </linearGradient>
          <filter id="pm-blur">
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
        </defs>
        {/* Stream: narrow at top, widens as it approaches pool at center-bottom */}
        <path
          fill="url(#pm-pour-grad)"
          filter="url(#pm-blur)"
          style={{ animation: 'pm-stream 750ms cubic-bezier(0.42,0,0.28,1) 200ms both' }}
        />
        {/* Light streak on the stream */}
        <path
          fill="rgba(255,245,200,0.4)"
          style={{ animation: 'pm-stream-highlight 750ms cubic-bezier(0.42,0,0.28,1) 250ms both' }}
        />
      </svg>

      {/* Pool ripple at the bottom of the pour */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '58%',
          transform: 'translate(-50%, -50%)',
          width: '80px',
          height: '20px',
          borderRadius: '50%',
          border: '1px solid rgba(234,184,48,0.5)',
          pointerEvents: 'none',
          animation: 'pm-ripple 600ms ease 900ms both',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '58%',
          transform: 'translate(-50%, -50%)',
          width: '40px',
          height: '10px',
          borderRadius: '50%',
          border: '1px solid rgba(234,184,48,0.3)',
          pointerEvents: 'none',
          animation: 'pm-ripple 600ms ease 1000ms both',
        }}
      />

      {/* Bubbles rising from pool */}
      {[
        { left: '45%', delay: 950,  size: 5 },
        { left: '52%', delay: 1020, size: 4 },
        { left: '48%', delay: 1080, size: 6 },
        { left: '55%', delay: 1130, size: 3 },
        { left: '43%', delay: 1190, size: 4 },
        { left: '58%', delay: 1250, size: 5 },
      ].map(({ left, delay, size }, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left,
            top: '58%',
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            backgroundColor: 'rgba(245,230,176,0.55)',
            pointerEvents: 'none',
            animation: `pm-bubble 700ms ease ${delay}ms both`,
          }}
        />
      ))}

      <style>{`
        @keyframes pm-bloom {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* Stream pours in from upper area, widens into a pool at center */
        @keyframes pm-stream {
          0%   { d: path("M 58 0  L 60 0  L 60 0  L 58 0  Z"); }
          15%  { d: path("M 56 0  L 62 0  L 62 8  C 60 10, 58 10, 56 8  Z"); }
          35%  { d: path("M 54 0  L 64 0  L 65 22 C 60 28, 55 28, 52 22 Z"); }
          55%  { d: path("M 52 0  L 66 0  L 68 40 C 62 48, 54 48, 48 40 Z"); }
          72%  { d: path("M 50 0  L 68 0  L 72 56 C 64 66, 52 66, 44 56 Z"); }
          88%  { d: path("M 48 0  L 70 0  L 76 68 C 66 80, 50 80, 40 68 Z"); }
          100% { d: path("M 46 0  L 72 0  L 80 76 C 68 90, 48 90, 36 76 Z"); }
        }

        @keyframes pm-stream-highlight {
          0%   { d: path("M 58.5 0  L 59.5 0  L 59.5 0  L 58.5 0  Z"); }
          15%  { d: path("M 57 0   L 60 0   L 60 6   C 59 8,  57.5 8, 57 6  Z"); }
          55%  { d: path("M 54 0   L 62 0   L 64 38  C 61 44, 56 44, 52 38 Z"); }
          100% { d: path("M 52 0   L 64 0   L 68 70  C 64 82, 56 82, 50 70 Z"); }
        }

        @keyframes pm-stream-exit {
          from { opacity: 1; }
          to   { opacity: 0; }
        }

        @keyframes pm-ripple {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
          40%  { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.8); }
        }

        @keyframes pm-bubble {
          0%   { opacity: 0;   transform: translateY(0)    scale(0.5); }
          20%  { opacity: 0.8; transform: translateY(-8px) scale(1);   }
          100% { opacity: 0;   transform: translateY(-55px) scale(0.6); }
        }

        @keyframes pm-content-rise {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ─── Bite Moment Overlay ──────────────────────────────────────────────────────
//
// Timing:
//   0 – 300 ms   : cloche SVG materialises (dome + plate base), opacity 0→1
//   300 – 650 ms  : dome arc shoots upward off screen with spring bounce
//   450 – 900 ms  : 3 steam wisps rise from the plate
//   750 ms+       : "The Bite / Slider Trio" content rises from the plate area

function BiteMomentOverlay({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        backgroundColor: '#0A0A0F',
        cursor: 'pointer',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Cloche SVG */}
      <svg
        viewBox="0 0 200 140"
        style={{
          position: 'absolute',
          width: 'min(70vw, 340px)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          overflow: 'visible',
        }}
      >
        {/* Plate base — stays throughout */}
        <rect
          x="20" y="108" width="160" height="10" rx="5"
          fill="none"
          stroke="rgba(212,175,55,0.6)"
          strokeWidth="1.5"
          style={{ animation: 'bm-plate-appear 300ms ease both' }}
        />
        <ellipse
          cx="100" cy="108" rx="80" ry="5"
          fill="rgba(212,175,55,0.06)"
          style={{ animation: 'bm-plate-appear 300ms ease both' }}
        />

        {/* Dome — lifts off */}
        <g style={{ animation: 'bm-dome-lift 350ms cubic-bezier(0.34,1.56,0.64,1) 300ms both' }}>
          <path
            d="M 20 108 A 80 75 0 0 1 180 108"
            fill="rgba(212,175,55,0.04)"
            stroke="rgba(212,175,55,0.55)"
            strokeWidth="1.5"
          />
          {/* Dome handle/knob */}
          <ellipse cx="100" cy="33" rx="7" ry="4" fill="none" stroke="rgba(212,175,55,0.55)" strokeWidth="1.5" />
          <line x1="100" y1="37" x2="100" y2="44" stroke="rgba(212,175,55,0.4)" strokeWidth="1.5" />
          {/* Subtle sheen line on dome */}
          <path
            d="M 38 85 A 65 60 0 0 1 85 36"
            fill="none"
            stroke="rgba(255,245,220,0.12)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>

      {/* Steam wisps */}
      {[
        { left: 'calc(50% - 18px)', delay: 450 },
        { left: 'calc(50%)',        delay: 560 },
        { left: 'calc(50% + 18px)', delay: 670 },
      ].map(({ left, delay }, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left,
            top: 'calc(50% - 10px)',
            width: '2px',
            height: '32px',
            borderRadius: '2px',
            background: 'linear-gradient(to top, rgba(255,255,255,0.18), transparent)',
            pointerEvents: 'none',
            transformOrigin: 'bottom center',
            animation: `bm-steam 900ms ease ${delay}ms both`,
          }}
        />
      ))}

      {/* Content */}
      <div
        style={{
          position: 'relative',
          textAlign: 'center',
          animation: 'bm-content-rise 500ms cubic-bezier(0.34,1.56,0.64,1) 750ms both',
        }}
      >
        <p style={triggerLabelStyle}>The Bite</p>
        <h2 style={triggerHeadingStyle}>Slider Trio</h2>
        <div style={triggerDividerStyle} />
        <p style={triggerSubStyle}>three sauces · slaw · brioche</p>
      </div>

      <p
        style={{
          ...tapToDismissStyle,
          position: 'absolute',
          bottom: '2rem',
          animation: 'bm-content-rise 400ms ease 1100ms both',
        }}
      >
        Tap to dismiss
      </p>

      <style>{`
        @keyframes bm-plate-appear {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes bm-dome-lift {
          from { transform: translateY(0);      opacity: 1; }
          60%  { transform: translateY(-55vh);  opacity: 1; }
          to   { transform: translateY(-110vh); opacity: 0; }
        }

        @keyframes bm-steam {
          0%   { opacity: 0; transform: translateY(0)    scaleX(1)   ; }
          20%  { opacity: 1;                                          }
          60%  { opacity: 0.5; transform: translateY(-40px) scaleX(1.4); }
          100% { opacity: 0; transform: translateY(-70px) scaleX(0.6); }
        }

        @keyframes bm-content-rise {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ─── Butter Pour Overlay ──────────────────────────────────────────────────────
//
// Timing (all relative to trigger mount):
//   0 – 150 ms   : anticipation — dark veil fades in
//   150 – 950 ms  : butter descends with organic wavy leading edge
//   950 – 1100 ms : settle — wave at bottom ripples like liquid finishing
//   950 – 1050 ms : sizzle sparks appear at butter-settles point
//   1100 – 1450 ms: butter layer fades out, content rises with warm gold glow
//   1450 ms+      : compound-butter page fully visible; tap to dismiss

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
      {/* Back layer: content revealed as butter fades */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#0A0A0F',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        {/* Warm gold radial glow behind content */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,175,55,0.08), transparent)',
            animation: 'cbp-content-rise 500ms ease 1200ms both',
          }}
        />
        <div style={{ position: 'relative', animation: 'cbp-content-rise 500ms ease 1200ms both' }}>
          <p style={triggerLabelStyle}>Watch the Chef</p>
          <h2 style={triggerHeadingStyle}>Compound Butter</h2>
          <div style={triggerDividerStyle} />
          <p style={triggerSubStyle}>A moment of craft at your table.</p>
        </div>
        <p style={{ ...tapToDismissStyle, animation: 'cbp-content-rise 400ms ease 1500ms both' }}>
          Tap to dismiss
        </p>
      </div>

      {/* Front layer: butter animation — covers, settles, then fades */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          animation: 'cbp-overlay-exit 350ms ease 1100ms forwards',
        }}
      >
        {/* Phase 1 — dark anticipation veil */}
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
              <stop offset="80%"  stopColor="#C89B2B" />
              <stop offset="100%" stopColor="#B8860B" />
            </linearGradient>
          </defs>
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

        {/* Sizzle sparks at settle point — tiny white circles */}
        {[
          { left: '22%', delay: 950 },
          { left: '36%', delay: 960 },
          { left: '50%', delay: 975 },
          { left: '64%', delay: 958 },
          { left: '78%', delay: 968 },
        ].map(({ left, delay }, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              bottom: '2%',
              left,
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 252, 230, 0.9)',
              animation: `cbp-sizzle 180ms ease ${delay}ms both`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes cbp-anticipate {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

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

        @keyframes cbp-highlight {
          0%   { transform: translateX(0);    opacity: 0; }
          10%  { opacity: 1; }
          88%  { opacity: 0.85; }
          100% { transform: translateX(410%); opacity: 0; }
        }

        @keyframes cbp-sizzle {
          0%   { opacity: 0; transform: translateY(0)   scale(0.5); }
          40%  { opacity: 1; transform: translateY(-4px) scale(1.2); }
          100% { opacity: 0; transform: translateY(-8px) scale(0.3); }
        }

        @keyframes cbp-overlay-exit {
          from { opacity: 1; }
          to   { opacity: 0; }
        }

        @keyframes cbp-content-rise {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ─── Dessert Reveal — Present Unboxing ────────────────────────────────────────
//
// Timing:
//   0 – 400 ms   : gift box (base + lid + ribbon + bow) scales in from 0, spring easing
//   400 – 700 ms  : lid + bow shoots upward off screen, spring easing
//   500 – 950 ms  : 8 sparkle stars radiate outward in all compass directions
//   700 ms+       : confetti rains down (10 pieces, staggered)
//   800 – 1400 ms : "The Finish" title rises with spring bounce from inside box
//   1200 ms+      : gold radial glow pulses behind title

const SPARKLE_DIRS = [
  [  0, -1  ],   // N
  [  0.7, -0.7], // NE
  [  1,  0  ],   // E
  [  0.7,  0.7], // SE
  [  0,  1  ],   // S
  [ -0.7,  0.7], // SW
  [ -1,  0  ],   // W
  [ -0.7, -0.7], // NW
]

const CONFETTI_PIECES = [
  { x: '15%', color: '#D4AF37', rot: 20,  delay: 0   },
  { x: '28%', color: '#F5F0E8', rot: -15, delay: 60  },
  { x: '40%', color: '#A8C5DA', rot: 35,  delay: 120 },
  { x: '55%', color: '#D4AF37', rot: -30, delay: 40  },
  { x: '63%', color: '#F5F0E8', rot: 50,  delay: 180 },
  { x: '75%', color: '#A8C5DA', rot: -10, delay: 80  },
  { x: '85%', color: '#D4AF37', rot: 25,  delay: 200 },
  { x: '22%', color: '#A8C5DA', rot: -40, delay: 150 },
  { x: '48%', color: '#F5F0E8', rot: 15,  delay: 240 },
  { x: '70%', color: '#D4AF37', rot: -20, delay: 100 },
]

function DessertUnboxingContent() {
  return (
    <>
      {/* Gold radial glow — pulses behind everything */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(212,175,55,0.13), transparent)',
          animation: 'dr-glow-pulse 1.8s ease 1200ms infinite alternate',
        }}
      />

      {/* Gift box SVG */}
      <svg
        viewBox="0 0 120 110"
        style={{
          position: 'absolute',
          width: 'min(55vw, 260px)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          overflow: 'visible',
          animation: 'dr-box-appear 400ms cubic-bezier(0.34,1.56,0.64,1) both',
          pointerEvents: 'none',
        }}
      >
        {/* Box base */}
        <rect x="10" y="50" width="100" height="55" rx="3"
          fill="rgba(212,175,55,0.06)"
          stroke="rgba(212,175,55,0.65)"
          strokeWidth="1.5"
        />
        {/* Vertical ribbon on base */}
        <line x1="60" y1="50" x2="60" y2="105" stroke="rgba(212,175,55,0.5)" strokeWidth="2" />
        {/* Horizontal ribbon on base */}
        <line x1="10" y1="77" x2="110" y2="77" stroke="rgba(212,175,55,0.5)" strokeWidth="2" />

        {/* Lid group — shoots up */}
        <g style={{ animation: 'dr-lid-launch 350ms cubic-bezier(0.34,1.56,0.64,1) 400ms both' }}>
          <rect x="6" y="38" width="108" height="18" rx="3"
            fill="rgba(212,175,55,0.1)"
            stroke="rgba(212,175,55,0.75)"
            strokeWidth="1.5"
          />
          {/* Vertical ribbon on lid */}
          <line x1="60" y1="38" x2="60" y2="56" stroke="rgba(212,175,55,0.6)" strokeWidth="2" />
          {/* Horizontal ribbon on lid */}
          <line x1="6" y1="47" x2="114" y2="47" stroke="rgba(212,175,55,0.6)" strokeWidth="2" />
          {/* Bow left loop */}
          <path d="M 60 38 C 50 28, 38 26, 44 34 C 48 38, 58 36, 60 38"
            fill="rgba(212,175,55,0.2)"
            stroke="rgba(212,175,55,0.75)"
            strokeWidth="1.2"
          />
          {/* Bow right loop */}
          <path d="M 60 38 C 70 28, 82 26, 76 34 C 72 38, 62 36, 60 38"
            fill="rgba(212,175,55,0.2)"
            stroke="rgba(212,175,55,0.75)"
            strokeWidth="1.2"
          />
          {/* Bow knot */}
          <ellipse cx="60" cy="38" rx="4" ry="3"
            fill="rgba(212,175,55,0.4)"
            stroke="rgba(212,175,55,0.9)"
            strokeWidth="1"
          />
        </g>
      </svg>

      {/* Sparkle burst — 8 directions, each with its own translate keyframe */}
      {SPARKLE_DIRS.map(([dx, dy], i) => (
        <div
          key={`s-${i}`}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '8px',
            height: '8px',
            marginTop: '-4px',
            marginLeft: '-4px',
            pointerEvents: 'none',
            animationDuration: '550ms',
            animationTimingFunction: 'ease',
            animationDelay: `${500 + i * 30}ms`,
            animationFillMode: 'both',
            animationName: `dr-sparkle-${i}`,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: i % 3 === 0 ? '#D4AF37' : i % 3 === 1 ? '#F5F0E8' : '#A8C5DA',
              transform: 'rotate(45deg)',
            }}
          />
        </div>
      ))}

      {/* Falling confetti */}
      {CONFETTI_PIECES.map(({ x, color, rot, delay }, i) => (
        <div
          key={`c-${i}`}
          style={{
            position: 'absolute',
            left: x,
            top: '-20px',
            width: '6px',
            height: '10px',
            backgroundColor: color,
            borderRadius: '1px',
            transform: `rotate(${rot}deg)`,
            opacity: 0.85,
            pointerEvents: 'none',
            animation: `dr-confetti-fall 1200ms ease ${700 + delay}ms both`,
          }}
        />
      ))}

      {/* Title content */}
      <div
        style={{
          position: 'relative',
          textAlign: 'center',
          animation: 'dr-title-rise 600ms cubic-bezier(0.34,1.56,0.64,1) 800ms both',
          marginTop: '0',
        }}
      >
        <p style={triggerLabelStyle}>The Dessert</p>
        <h2 style={{ ...triggerHeadingStyle, fontSize: 'clamp(3rem, 14vw, 5.5rem)' }}>
          The Finish
        </h2>
        <div style={triggerDividerStyle} />
        <p style={triggerSubStyle}>something sweet awaits.</p>
      </div>

      <style>{`
        @keyframes dr-box-appear {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1);   }
        }

        @keyframes dr-lid-launch {
          from { transform: translateY(0);      opacity: 1; }
          60%  { transform: translateY(-55vh);  opacity: 1; }
          to   { transform: translateY(-110vh); opacity: 0; }
        }

        ${SPARKLE_DIRS.map(([dx, dy], i) => `
          @keyframes dr-sparkle-${i} {
            0%   { opacity: 0; transform: translate(0, 0) scale(0); }
            30%  { opacity: 1; }
            100% { opacity: 0; transform: translate(${dx * 80}px, ${dy * 80}px) scale(0.3); }
          }
        `).join('')}

        @keyframes dr-confetti-fall {
          from { transform: translateY(0)    rotate(0deg);   opacity: 0.9; }
          20%  {                                              opacity: 1;   }
          to   { transform: translateY(115vh) rotate(480deg); opacity: 0;  }
        }

        @keyframes dr-title-rise {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes dr-glow-pulse {
          from { opacity: 0.6; }
          to   { opacity: 1.0; }
        }

        @keyframes dr-content-rise {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}

// ─── Shared styles ────────────────────────────────────────────────────────────

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
