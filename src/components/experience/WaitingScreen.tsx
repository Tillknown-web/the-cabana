'use client'

import { useState, useEffect } from 'react'

const MESSAGES = [
  (name: string) => `${name}, your next course is on its way.`,
  () => 'Good things take time.',
  () => 'The kitchen smells incredible right now.',
  () => 'Trust the process.',
  (name: string) => `${name}, something special is coming.`,
]

const ORBS = [
  { size: 320, top: '20%', left: '15%', duration: '9s', delay: '0s' },
  { size: 260, top: '55%', left: '65%', duration: '11s', delay: '3s' },
]

interface WaitingScreenProps {
  guestName: string
  countdown: { card: string; expiresAt: string } | null
}

export default function WaitingScreen({ guestName, countdown }: WaitingScreenProps) {
  const [msgIndex, setMsgIndex] = useState(0)
  const [fading, setFading] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  // Rotate messages
  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % MESSAGES.length)
        setFading(false)
      }, 500)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // Countdown timer
  useEffect(() => {
    if (!countdown) {
      setTimeLeft(null)
      return
    }
    function tick() {
      const diff = new Date(countdown!.expiresAt).getTime() - Date.now()
      setTimeLeft(Math.max(0, diff))
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [countdown])

  const minutesLeft = timeLeft !== null ? Math.ceil(timeLeft / 60000) : null
  const showCountdown = timeLeft !== null && timeLeft > 0
  const progress =
    showCountdown && countdown
      ? timeLeft! / (new Date(countdown.expiresAt).getTime() - (Date.now() - timeLeft!))
      : 0

  const RADIUS = 40
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(160deg, #1A1128 0%, #2D1B47 55%, #221440 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        textAlign: 'center',
        paddingBottom: 72,
        overflow: 'hidden',
      }}
    >
      {/* Ambient orbs */}
      {ORBS.map((orb, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: orb.top,
            left: orb.left,
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(61,40,96,0.55) 0%, rgba(26,17,40,0) 70%)',
            animation: `orb-drift ${orb.duration} ease-in-out infinite`,
            animationDelay: orb.delay,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Message block */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          maxWidth: 320,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Decorative top line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            width: '100%',
            justifyContent: 'center',
          }}
        >
          <div style={{ height: 1, width: 40, backgroundColor: '#D4AF37', opacity: 0.25 }} />
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: '#D4AF37',
              opacity: 0.5,
            }}
          />
          <div style={{ height: 1, width: 40, backgroundColor: '#D4AF37', opacity: 0.25 }} />
        </div>

        <p
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(22px, 6vw, 28px)',
            fontWeight: 300,
            fontStyle: 'italic',
            color: '#F5F0E8',
            lineHeight: 1.55,
            opacity: fading ? 0 : 1,
            transition: 'opacity 0.5s ease',
          }}
        >
          {MESSAGES[msgIndex](guestName)}
        </p>

        {/* Decorative bottom line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            width: '100%',
            justifyContent: 'center',
          }}
        >
          <div style={{ height: 1, width: 40, backgroundColor: '#D4AF37', opacity: 0.25 }} />
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: '#D4AF37',
              opacity: 0.5,
            }}
          />
          <div style={{ height: 1, width: 40, backgroundColor: '#D4AF37', opacity: 0.25 }} />
        </div>
      </div>

      {/* Countdown ring */}
      {showCountdown && (
        <div
          style={{
            marginTop: 52,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ position: 'relative', width: 100, height: 100 }}>
            <svg
              width={100}
              height={100}
              style={{ transform: 'rotate(-90deg)' }}
            >
              <circle
                cx={50}
                cy={50}
                r={RADIUS}
                fill="none"
                stroke="rgba(212,175,55,0.12)"
                strokeWidth={2}
              />
              <circle
                cx={50}
                cy={50}
                r={RADIUS}
                fill="none"
                stroke="#D4AF37"
                strokeWidth={2}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            {/* Minutes label inside the ring */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 22,
                  fontWeight: 300,
                  color: '#F5F0E8',
                  lineHeight: 1,
                }}
              >
                {minutesLeft}
              </span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 9,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: 'rgba(245,240,232,0.4)',
                  marginTop: 2,
                }}
              >
                min
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
