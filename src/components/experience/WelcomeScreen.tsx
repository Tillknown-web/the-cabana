'use client'

import { useState, useRef } from 'react'
import GoldButton from '@/components/shared/GoldButton'
import GoldDivider from '@/components/shared/GoldDivider'
import { resizeImage } from '@/lib/utils'
import { CameraIcon } from '@/lib/icons'

const CHEFS = [
  { initial: 'É', name: 'Évoire', photo: '/chef-evoire.png' },
  { initial: 'A', name: 'Aloire', photo: '/chef-aloire.png' },
]

const STEPS = [
  { num: '01', text: 'Each course is revealed on your phone as it arrives.' },
  { num: '02', text: 'Snap a photo of your dish after each course.' },
  { num: '03', text: 'At the end, you vote for your favorite chef.' },
]

const RINGS = [
  { size: 500, duration: '6s', delay: '0s' },
  { size: 360, duration: '8s', delay: '1.5s' },
]

interface WelcomeScreenProps {
  guestName: string
  guestId: string
  sessionId: string
  onComplete: () => void
}

export default function WelcomeScreen({ guestName, guestId, sessionId, onComplete }: WelcomeScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [step, setStep] = useState<'intro' | 'photo' | 'waiting'>('intro')

  function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string)
      setStep('photo')
    }
    reader.readAsDataURL(file)
  }

  async function handleConfirmPhoto() {
    if (!preview) return
    setUploading(true)
    try {
      const res = await fetch(preview)
      const blob = await res.blob()
      const file = new File([blob], 'guest.jpg', { type: 'image/jpeg' })
      const resized = await resizeImage(file)
      const formData = new FormData()
      formData.append('photo', resized, 'guest.jpg')
      formData.append('sessionId', sessionId)
      formData.append('guestId', guestId)
      formData.append('course', 'guest')
      await fetch('/api/photo', { method: 'POST', body: formData })
    } finally {
      setUploading(false)
    }
    setStep('waiting')
    onComplete()
  }

  if (step === 'photo' && preview) {
    return (
      <div
        className="screen-enter"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(160deg, #1A1128 0%, #2D1B47 55%, #221440 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          gap: 24,
        }}
      >
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.35em',
            color: '#D4AF37',
            opacity: 0.8,
          }}
        >
          your guest photo
        </p>

        <img
          src={preview}
          alt="Your guest photo"
          style={{
            maxWidth: '100%',
            maxHeight: '55vh',
            borderRadius: 4,
            border: '1px solid rgba(212,175,55,0.35)',
            objectFit: 'contain',
          }}
        />

        <GoldButton onClick={handleConfirmPhoto} loading={uploading} fullWidth size="lg">
          Looks good
        </GoldButton>

        <button
          onClick={() => {
            setPreview(null)
            setStep('intro')
            setTimeout(() => inputRef.current?.click(), 100)
          }}
          style={{
            color: 'rgba(245,240,232,0.4)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            padding: 8,
            letterSpacing: '0.05em',
          }}
        >
          Retake
        </button>
      </div>
    )
  }

  return (
    <div
      className="screen-enter"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(160deg, #1A1128 0%, #2D1B47 55%, #221440 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflowY: 'auto',
        padding: '64px 28px 100px',
        textAlign: 'center',
        overflow: 'hidden auto',
      }}
    >
      {/* Ambient rings */}
      {RINGS.map((ring, i) => (
        <div
          key={i}
          style={{
            position: 'fixed',
            top: '30%',
            left: '50%',
            width: ring.size,
            height: ring.size,
            marginLeft: -(ring.size / 2),
            marginTop: -(ring.size / 2),
            borderRadius: '50%',
            border: '1px solid #D4AF37',
            animation: `ring-breathe ${ring.duration} ease-in-out infinite`,
            animationDelay: ring.delay,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 360, margin: '0 auto' }}>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 10,
            color: 'rgba(245,240,232,0.5)',
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
          }}
        >
          welcome to
        </p>

        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(40px, 10vw, 52px)',
            fontWeight: 300,
            color: '#F5F0E8',
            lineHeight: 1.05,
            marginBottom: 16,
            letterSpacing: '-0.01em',
          }}
        >
          The Cabana
        </h1>

        <GoldDivider style={{ marginBottom: 20 }} />

        <p
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 20,
            fontStyle: 'italic',
            fontWeight: 300,
            color: 'rgba(245,240,232,0.65)',
            marginBottom: 40,
            lineHeight: 1.4,
          }}
        >
          Good evening, {guestName}.
        </p>

        {/* Chefs */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.25em',
            color: 'rgba(245,240,232,0.4)',
            marginBottom: 16,
          }}
        >
          your chefs tonight
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 44 }}>
          {CHEFS.map((chef) => (
            <div
              key={chef.name}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
            >
              {/* Outer gold ring */}
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  border: '1px solid rgba(212,175,55,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {/* Inner avatar circle */}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    border: '1px solid rgba(212,175,55,0.25)',
                    backgroundColor: 'rgba(61,40,96,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {chef.photo ? (
                    <img
                      src={chef.photo}
                      alt={chef.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                    />
                  ) : (
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: 24,
                        fontWeight: 300,
                        color: '#D4AF37',
                      }}
                    >
                      {chef.initial}
                    </span>
                  )}
                </div>
              </div>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 16,
                  fontWeight: 400,
                  color: '#F5F0E8',
                  letterSpacing: '0.04em',
                }}
              >
                {chef.name}
              </p>
            </div>
          ))}
        </div>

        {/* How tonight works */}
        <div
          style={{
            borderTop: '1px solid rgba(212,175,55,0.15)',
            paddingTop: 32,
            marginBottom: 36,
            textAlign: 'left',
          }}
        >
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              color: 'rgba(245,240,232,0.4)',
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            how tonight works
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {STEPS.map((s) => (
              <div
                key={s.num}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 26,
                    fontWeight: 300,
                    color: '#D4AF37',
                    opacity: 0.6,
                    lineHeight: 1,
                    flexShrink: 0,
                    marginTop: 1,
                    width: 28,
                  }}
                >
                  {s.num}
                </span>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    color: 'rgba(245,240,232,0.65)',
                    lineHeight: 1.65,
                  }}
                >
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Photo CTA */}
        <div
          style={{
            borderTop: '1px solid rgba(212,175,55,0.15)',
            paddingTop: 32,
          }}
        >
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 17,
              fontStyle: 'italic',
              fontWeight: 300,
              color: '#A8C5DA',
              marginBottom: 24,
              lineHeight: 1.55,
            }}
          >
            But first — snap a photo of who you&apos;re with tonight.
          </p>

          <GoldButton
            onClick={() => inputRef.current?.click()}
            size="lg"
            fullWidth
          >
            <CameraIcon size={16} /> Snap your guest
          </GoldButton>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleCapture}
        onClick={(e) => {
          ;(e.target as HTMLInputElement).value = ''
        }}
      />
    </div>
  )
}
