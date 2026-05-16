'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { COURSE_DATA } from '@/lib/constants'
import type { Guest } from '@/app/experience/page'
import PhotoUpload from '@/components/experience/PhotoUpload'
import { PourAmbience, BiteAmbience, CleanseAmbience, AguaAmbience } from '@/components/experience/ambience'
import { CameraIcon } from '@/lib/icons'

interface Props {
  card: string
  guest: Guest
  sessionId: string
  dessertRevealed?: boolean
  partnerPhoto?: { url: string; guestName: string } | null
  eventDate?: string
}

// Staggered child animation helper
const item = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] as const },
})

export default function CourseCard({ card, guest, sessionId, dessertRevealed = false, partnerPhoto = null, eventDate }: Props) {
  const [photoUploaded, setPhotoUploaded] = useState(false)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  const course = COURSE_DATA[card]
  if (!course) return null

  const isPour    = card === 'pour'
  const isBite    = card === 'bite'
  const isCleanse = card === 'cleanse'
  const isAgua    = card === 'agua'
  const isFinish  = card === 'finish'

  function handleUploaded(previewUrl: string) {
    setPhotoPreviewUrl(previewUrl)
    setPhotoUploaded(true)
    setShowUpload(false)
  }

  // "The Bite" heading uses a spring punch instead of the soft fade-up
  const headingAnim = isBite
    ? {
        initial: { opacity: 0, scale: 0.82 },
        animate: { opacity: 1, scale: 1 },
        transition: { type: 'spring' as const, stiffness: 380, damping: 20, delay: 0.08 },
      }
    : item(0.08)

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
      {/* Per-card signature ambience */}
      {isPour    && <PourAmbience />}
      {isBite    && <BiteAmbience />}
      {isCleanse && <CleanseAmbience />}
      {isAgua    && <AguaAmbience />}

      {/* Fallback ambient glow for cut / finish */}
      {!isPour && !isBite && !isCleanse && !isAgua && (
        <div aria-hidden="true" style={{
          position: 'absolute',
          top: '30%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60vw', height: '60vw', borderRadius: '50%',
          background: isFinish
            ? 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 65%)'
            : 'radial-gradient(circle, rgba(77,217,192,0.05) 0%, transparent 65%)',
          pointerEvents: 'none',
          animation: 'blob-drift-a 20s ease-in-out infinite',
        }} />
      )}

      {/* Dish name */}
      <motion.h1 {...headingAnim} style={headingStyle}>
        {isFinish && !dessertRevealed ? '???' : course.dish}
      </motion.h1>

      {/* Course label */}
      <motion.p {...item(0)} style={labelStyle}>{course.label}</motion.p>

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
      {(!isFinish || dessertRevealed) && (
        <motion.p {...item(0.26)} style={ingredientsStyle}>{course.ingredients}</motion.p>
      )}
      {isFinish && !dessertRevealed && (
        <motion.p {...item(0.26)} style={ingredientsStyle}>revealed at the table</motion.p>
      )}

      {/* Photo section */}
      <motion.div
        {...item(0.38)}
        style={{ marginTop: '2.5rem', width: '100%', maxWidth: '280px' }}
      >
        {photoUploaded && photoPreviewUrl ? (
          <div>
            <p style={partnerCaptionStyle}>Your photo</p>
            <div style={photoFrameStyle}>
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
            eventDate={eventDate}
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

        {/* Partner photo — appears below your own (or above the upload CTA if
            you haven't taken one yet). Re-animates when a new partner upload
            for this course arrives. */}
        {partnerPhoto && (
          <motion.div
            key={partnerPhoto.url}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginTop: '1.5rem' }}
          >
            <p style={partnerCaptionStyle}>
              {partnerPhoto.guestName}&apos;s {course.label.toLowerCase()}
            </p>
            <div style={partnerFrameStyle}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={partnerPhoto.url}
                alt={`${partnerPhoto.guestName}'s photo`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </motion.div>
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

const photoFrameStyle: React.CSSProperties = {
  width: '100%',
  aspectRatio: '1',
  overflow: 'hidden',
  border: '1px solid rgba(212, 175, 55, 0.3)',
  marginBottom: '1rem',
}

const partnerFrameStyle: React.CSSProperties = {
  width: '100%',
  aspectRatio: '1',
  overflow: 'hidden',
  border: '1px solid rgba(168, 197, 218, 0.35)',
}

const partnerCaptionStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '9px',
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: '#D4AF37',
  opacity: 0.7,
  margin: '0 0 0.5rem',
  textAlign: 'center',
}
