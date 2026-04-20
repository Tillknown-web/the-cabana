'use client'

import { useState } from 'react'
import { COURSE_DATA } from '@/lib/constants'
import type { Guest } from '@/app/experience/page'
import PhotoUpload from '@/components/experience/PhotoUpload'

interface Props {
  card: string
  guest: Guest
  sessionId: string
}

export default function CourseCard({ card, guest, sessionId }: Props) {
  const [photoUploaded, setPhotoUploaded] = useState(false)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  const course = COURSE_DATA[card]
  if (!course) return null

  const isFinish = card === 'finish'

  function handleUploaded(previewUrl: string) {
    setPhotoPreviewUrl(previewUrl)
    setPhotoUploaded(true)
    setShowUpload(false)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
    }}>
      {/* Course label */}
      <p style={labelStyle}>{course.label}</p>

      {/* Dish name */}
      <h1 style={headingStyle}>
        {isFinish && !photoUploaded ? '???' : course.dish}
      </h1>

      {/* Gold divider */}
      <div style={dividerStyle} />

      {/* Ingredients */}
      {(!isFinish || photoUploaded) && (
        <p style={ingredientsStyle}>{course.ingredients}</p>
      )}

      {isFinish && !photoUploaded && (
        <p style={ingredientsStyle}>revealed at the table</p>
      )}

      {/* Photo section */}
      <div style={{ marginTop: '2.5rem', width: '100%', maxWidth: '280px' }}>
        {photoUploaded && photoPreviewUrl ? (
          <div>
            {/* Photo preview */}
            <div style={{
              width: '100%',
              aspectRatio: '1',
              overflow: 'hidden',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              marginBottom: '1rem',
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreviewUrl}
                alt="Your photo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {/* Retake option */}
            <button
              onClick={() => setShowUpload(true)}
              style={retakeButtonStyle}
            >
              Retake
            </button>
          </div>
        ) : showUpload ? (
          <PhotoUpload
            course={card}
            guestId={guest.id}
            sessionId={sessionId}
            onUploaded={handleUploaded}
            onCancel={() => setShowUpload(false)}
          />
        ) : (
          <button
            onClick={() => setShowUpload(true)}
            style={cameraButtonStyle}
          >
            <span style={{ fontSize: '1.5rem' }}>📷</span>
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginLeft: '0.5rem',
            }}>
              Take Your Photo
            </span>
          </button>
        )}
      </div>
    </div>
  )
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
  fontSize: 'clamp(2rem, 10vw, 3.5rem)',
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

const ingredientsStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '13px',
  fontStyle: 'italic',
  color: '#A8C5DA',
  margin: 0,
}

const cameraButtonStyle: React.CSSProperties = {
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

const retakeButtonStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: '#D4AF37',
  opacity: 0.6,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
}
