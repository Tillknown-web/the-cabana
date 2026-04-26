'use client'

import { useState, useRef } from 'react'
import GoldButton from '@/components/shared/GoldButton'
import GoldDivider from '@/components/shared/GoldDivider'
import { resizeImage } from '@/lib/utils'

const CHEFS = [
  { initial: 'K', name: 'King' },
  { initial: 'A', name: 'Aloire' },
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
          backgroundColor: '#2D1B47',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          gap: 24,
        }}
      >
        <img
          src={preview}
          alt="Your guest photo"
          style={{
            maxWidth: '100%',
            maxHeight: '60vh',
            borderRadius: 4,
            border: '1px solid rgba(212,175,55,0.4)',
            objectFit: 'contain',
          }}
        />
        <GoldButton onClick={handleConfirmPhoto} loading={uploading} fullWidth size="lg">
          Looks good ✓
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
        backgroundColor: '#2D1B47',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflowY: 'auto',
        padding: '60px 28px 100px',
        gap: 0,
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 11,
          color: 'rgba(245,240,232,0.6)',
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
        }}
      >
        welcome to
      </p>
      <h1
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(40px, 10vw, 52px)',
          fontWeight: 400,
          color: '#F5F0E8',
          lineHeight: 1.1,
          marginBottom: 20,
        }}
      >
        The Cabana
      </h1>

      <GoldDivider style={{ marginBottom: 28 }} />

      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 14,
          color: 'rgba(245,240,232,0.75)',
          lineHeight: 1.7,
          maxWidth: 320,
          marginBottom: 28,
        }}
      >
        Tonight is a 3-course journey served poolside. Each course will be revealed on your phone as it&apos;s served.
      </p>

      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          color: 'rgba(245,240,232,0.5)',
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        Your chefs tonight:
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 36 }}>
        {CHEFS.map((chef) => (
          <div key={chef.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: '1.5px solid #D4AF37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 20,
                color: '#D4AF37',
              }}
            >
              {chef.initial}
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#F5F0E8' }}>{chef.name}</p>
          </div>
        ))}
      </div>

      {/* How it works card */}
      <div
        style={{
          border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: 6,
          padding: '20px 24px',
          maxWidth: 340,
          marginBottom: 32,
          textAlign: 'left',
        }}
      >
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, marginBottom: 12, color: '#D4AF37', fontWeight: 600 }}>
          📷 how tonight works
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'rgba(245,240,232,0.7)', lineHeight: 1.6 }}>
          After each course, you&apos;ll be asked to snap a photo of your dish. At the end of the night, everyone&apos;s photos come together in a shared gallery — same plates, different eyes.
        </p>
      </div>

      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 14,
          fontStyle: 'italic',
          color: '#A8C5DA',
          marginBottom: 28,
          maxWidth: 280,
        }}
      >
        But first — snap a photo of who you&apos;re with tonight.
      </p>

      <GoldButton
        onClick={() => inputRef.current?.click()}
        size="lg"
        fullWidth
        style={{ maxWidth: 320 }}
      >
        📷 Snap your guest
      </GoldButton>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleCapture}
        onClick={(e) => { (e.target as HTMLInputElement).value = '' }}
      />
    </div>
  )
}
