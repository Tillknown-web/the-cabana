'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { COURSE_DATA } from '@/lib/constants'
import type { Guest } from '@/app/experience/page'
import PhotoUpload from '@/components/experience/PhotoUpload'
import { CameraIcon } from '@/lib/icons'

interface Props {
  card: string
  guest: Guest
  sessionId: string
}

// Staggered child animation helper
const item = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] as const },
})

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
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient background glow matching the card */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60vw',
        height: '60vw',
        borderRadius: '50%',
        background: isFinish
          ? 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 65%)'
          : 'radial-gradient(circle, rgba(77,217,192,0.05) 0%, transparent 65%)',
        pointerEvents: 'none',
        animation: 'blob-drift-a 20s ease-in-out infinite',
      }} />

      {/* Course label */}
      <motion.p {...item(0)} style={labelStyle}>{course.label}</motion.p>

      {/* Dish name */}
      <motion.h1 {...item(0.08)} style={headingStyle}>
        {isFinish && !photoUploaded ? '???' : course.dish}
      </motion.h1>

      {/* Gold divider with shimmer */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        style={{ ...dividerStyle, transformOrigin: 'center', position: 'relative', overflow: 'hidden' }}
      >
        {/* shimmer sweep across the divider */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)',
          animation: 'cabana-scan 2s ease-out forwards',
        }} />
      </motion.div>

      {/* Ingredients */}
      {(!isFinish || photoUploaded) && (
        <motion.p {...item(0.26)} style={ingredientsStyle}>{course.ingredients}</motion.p>
      )}
      {isFinish && !photoUploaded && (
        <motion.p {...item(0.26)} style={ingredientsStyle}>revealed at the table</motion.p>
      )}

      {/* Photo section */}
      <motion.div
        {...item(0.38)}
        style={{ marginTop: '2.5rem', width: '100%', maxWidth: '280px' }}
      >
        {photoUploaded && photoPreviewUrl ? (
          <div>
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
            <button onClick={() => setShowUpload(true)} style={retakeButtonStyle}>
              Retake
            </button>
          </div>
        ) : showUpload ? (
          <PhotoUpload
            course={card}
            sessionId={sessionId}
            onUploaded={handleUploaded}
            onCancel={() => setShowUpload(false)}
          />
        ) : (
          <motion.button
            onClick={() => setShowUpload(true)}
            style={cameraButtonStyle}
            whileHover={{ borderColor: 'rgba(212,175,55,0.7)', backgroundColor: 'rgba(212,175,55,0.06)' }}
            transition={{ duration: 0.2 }}
          >
            <CameraIcon size={22} />
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginLeft: '0.5rem',
            }}>
              Take Your Photo
            </span>
          </motion.button>
        )}
      </motion.div>
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
  transition: 'border-color 0.2s, background-color 0.2s',
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
