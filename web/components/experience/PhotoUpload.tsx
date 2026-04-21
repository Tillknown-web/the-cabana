'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  course: string
  sessionId: string
  onUploaded: (previewUrl: string) => void
  onCancel: () => void
}

export default function PhotoUpload({ course, sessionId, onUploaded, onCancel }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

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

      // Route the upload through the upload-photo Edge Function, which uses
      // the service-role (HS256) key to talk to Storage. Uploading directly
      // to Storage with the guest's ES256 user JWT fails with
      // "Unsupported JWT algorithm ES256" (Supabase storage bug #741).
      const form = new FormData()
      form.append('file', resized, `${course}.jpg`)
      form.append('sessionId', sessionId)
      form.append('course', course)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/upload-photo`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: form,
        }
      )

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? body.message ?? `Server error ${res.status}`)
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
    // Reset so the same file can be re-selected after an error
    e.target.value = ''
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Hidden input that opens the rear camera directly */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      {/* Hidden input that opens the photo library / file picker */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => cameraInputRef.current?.click()}
            style={primaryBtnStyle}
          >
            <span style={{ fontSize: '1.3rem' }}>📷</span>
            <span style={btnLabelStyle}>Take Photo</span>
          </button>

          <button
            onClick={() => galleryInputRef.current?.click()}
            style={secondaryBtnStyle}
          >
            <span style={{ fontSize: '1.3rem' }}>🖼️</span>
            <span style={btnLabelStyle}>Choose from Library</span>
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

const btnLabelStyle: React.CSSProperties = {
  marginLeft: '0.5rem',
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
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

const secondaryBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '1rem',
  border: '1px solid rgba(245, 240, 232, 0.15)',
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
