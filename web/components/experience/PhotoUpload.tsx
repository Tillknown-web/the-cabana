'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  course: string
  guestId: string
  sessionId: string
  onUploaded: (previewUrl: string) => void
  onCancel: () => void
}

export default function PhotoUpload({ course, guestId, sessionId, onUploaded, onCancel }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    setError(null)

    try {
      // Resize the image client-side to keep uploads fast
      const resized = await resizeImage(file, 1200)
      const previewUrl = URL.createObjectURL(resized)

      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      // Storage path must match: {sessionId}/{guestId}/{course}.jpg
      const storagePath = `${sessionId}/${guestId}/${course}.jpg`

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(storagePath, resized, {
          contentType: 'image/jpeg',
          upsert: true,
        })

      if (uploadError) throw new Error(uploadError.message)

      // Record the metadata in the photos table
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/record-photo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ sessionId, course, storagePath }),
        }
      )

      if (!res.ok) {
        const { error: e } = await res.json()
        throw new Error(e ?? 'Failed to record photo')
      }

      onUploaded(previewUrl)
    } catch (err) {
      setError((err as Error).message)
      setUploading(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      {uploading ? (
        <div>
          <p style={statusStyle}>Uploading…</p>
          <div style={{ marginTop: '1rem' }}>
            <UploadingDots />
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => inputRef.current?.click()}
            style={primaryBtnStyle}
          >
            <span style={{ fontSize: '1.5rem' }}>📷</span>
            <span style={{ marginLeft: '0.5rem', fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' as const }}>
              Open Camera
            </span>
          </button>

          {error && (
            <p style={errorStyle}>{error}</p>
          )}

          <button onClick={onCancel} style={cancelStyle}>Cancel</button>
        </div>
      )}
    </div>
  )
}

function resizeImage(file: File, maxWidth: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas not available')); return }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          if (blob) resolve(blob)
          else reject(new Error('Canvas export failed'))
        },
        'image/jpeg',
        0.85
      )
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = url
  })
}

function UploadingDots() {
  return (
    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: '#D4AF37',
            animation: `cabana-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes cabana-dot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}

const statusStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: '#D4AF37',
  opacity: 0.8,
}

const primaryBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '1rem',
  border: '1px solid rgba(212, 175, 55, 0.4)',
  backgroundColor: 'transparent',
  color: '#F5F0E8',
  cursor: 'pointer',
}

const cancelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: '#F5F0E8',
  opacity: 0.35,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  marginTop: '1rem',
  display: 'block',
  width: '100%',
}

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  color: '#A8C5DA',
  marginTop: '0.75rem',
  opacity: 0.8,
}
