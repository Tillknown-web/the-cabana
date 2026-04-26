'use client'

import { useState, useEffect } from 'react'

const MESSAGES = [
  (name: string) => `${name}, your next course is on its way.`,
  () => 'Good things take time.',
  () => 'The kitchen smells incredible right now.',
  () => 'Trust the process.',
  (name: string) => `${name}, something special is coming.`,
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
      }, 400)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // Countdown ring
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

  // Progress for SVG ring (0–1)
  const totalMs = countdown
    ? new Date(countdown.expiresAt).getTime() - (Date.now() - (timeLeft ?? 0)) - Date.now() + (timeLeft ?? 0)
    : 1
  const progress = showCountdown && countdown
    ? timeLeft! / (new Date(countdown.expiresAt).getTime() - (Date.now() - timeLeft!))
    : 0

  const RADIUS = 40
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#2D1B47',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        textAlign: 'center',
        paddingBottom: 72,
      }}
    >
      <p
        className="animate-pulse-soft"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(20px, 5vw, 24px)',
          fontWeight: 300,
          color: '#F5F0E8',
          lineHeight: 1.5,
          maxWidth: 320,
          opacity: fading ? 0 : 1,
          transition: 'opacity 0.4s ease',
        }}
      >
        {MESSAGES[msgIndex](guestName)}
      </p>

      {showCountdown && (
        <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <svg width={100} height={100} style={{ transform: 'rotate(-90deg)' }}>
            {/* Background ring */}
            <circle
              cx={50}
              cy={50}
              r={RADIUS}
              fill="none"
              stroke="rgba(212,175,55,0.15)"
              strokeWidth={2}
            />
            {/* Progress ring */}
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
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: 'rgba(245,240,232,0.5)',
              marginTop: -8,
            }}
          >
            ~{minutesLeft} min
          </p>
        </div>
      )}
    </div>
  )
}
