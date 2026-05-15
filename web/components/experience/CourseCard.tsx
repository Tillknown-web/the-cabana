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
  dessertRevealed?: boolean
}

// Staggered child animation helper
const item = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] as const },
})

// "The Pour" — falling liquid stream, landing ripple, rising bubbles
function PourAmbience() {
  const bubbles = [
    { left: '47%', delay: '1.7s', size: 5 },
    { left: '51%', delay: '1.9s', size: 4 },
    { left: '44%', delay: '2.1s', size: 6 },
    { left: '53%', delay: '2.0s', size: 3 },
    { left: '49%', delay: '2.3s', size: 4 },
    { left: '55%', delay: '2.15s', size: 5 },
  ]
  return (
    <>
      <style>{`
        @keyframes pour-stream {
          0%   { height: 0;    opacity: 0; }
          8%   { opacity: 0.7; }
          65%  { height: 38vh; opacity: 0.55; }
          100% { height: 38vh; opacity: 0; }
        }
        @keyframes pour-spread {
          0%   { transform: translateX(-50%) scaleX(0); opacity: 0; }
          30%  { opacity: 0.55; }
          100% { transform: translateX(-50%) scaleX(1); opacity: 0; }
        }
        @keyframes bubble-float {
          0%   { transform: translateY(0) scale(1); opacity: 0; }
          12%  { opacity: 1; }
          75%  { opacity: 0.5; }
          100% { transform: translateY(-48vh) scale(0.3); opacity: 0; }
        }
      `}</style>

      {/* Warm amber ambient glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60vw', height: '60vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, rgba(255,165,40,0.04) 45%, transparent 70%)',
        pointerEvents: 'none',
        animation: 'blob-drift-a 20s ease-in-out infinite',
      }} />

      {/* Liquid stream falling from the top */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '1.5px',
        background: 'linear-gradient(to bottom, transparent 0%, rgba(212,175,55,0.55) 30%, rgba(212,175,55,0.25) 100%)',
        animation: 'pour-stream 1.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards',
        height: 0, pointerEvents: 'none',
      }} />

      {/* Spread ripple at impact */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '38vh', left: '50%',
        width: '72px', height: '1.5px', borderRadius: '50%',
        background: 'rgba(212,175,55,0.4)',
        transform: 'translateX(-50%) scaleX(0)',
        animation: 'pour-spread 0.9s ease-out 1.65s forwards',
        pointerEvents: 'none',
      }} />

      {/* Bubbles rising from impact point */}
      {bubbles.map((b, i) => (
        <div key={i} aria-hidden="true" style={{
          position: 'absolute', top: '38vh', left: b.left,
          width: `${b.size}px`, height: `${b.size}px`,
          borderRadius: '50%',
          border: '1px solid rgba(212,175,55,0.45)',
          background: 'rgba(212,175,55,0.06)',
          animation: `bubble-float ${1.9 + i * 0.22}s ease-out ${b.delay} forwards`,
          opacity: 0, pointerEvents: 'none',
        }} />
      ))}
    </>
  )
}

// "The Cleanse" — sherbet-orange glow with drifting ice-crystal dots
function CleanseAmbience() {
  const crystals = [
    { left: '42%', delay: '0.4s', size: 4 },
    { left: '50%', delay: '0.8s', size: 5 },
    { left: '57%', delay: '0.6s', size: 3 },
    { left: '45%', delay: '1.1s', size: 4 },
    { left: '54%', delay: '0.9s', size: 3 },
    { left: '48%', delay: '1.3s', size: 5 },
  ]
  return (
    <>
      <style>{`
        @keyframes crystal-drift {
          0%   { transform: translateY(0) scale(1); opacity: 0; }
          15%  { opacity: 0.85; }
          80%  { opacity: 0.3; }
          100% { transform: translateY(-52vh) scale(0.4); opacity: 0; }
        }
      `}</style>

      {/* Soft sherbet-orange radial glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60vw', height: '60vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,160,60,0.09) 0%, rgba(255,200,100,0.04) 45%, transparent 70%)',
        pointerEvents: 'none',
        animation: 'blob-drift-a 22s ease-in-out infinite',
      }} />

      {/* Ice crystal dots rising from center */}
      {crystals.map((c, i) => (
        <div key={i} aria-hidden="true" style={{
          position: 'absolute', top: '55%', left: c.left,
          width: `${c.size}px`, height: `${c.size}px`,
          borderRadius: '1px',
          border: '1px solid rgba(255,200,120,0.55)',
          background: 'rgba(255,220,160,0.12)',
          animation: `crystal-drift ${2.2 + i * 0.3}s ease-out ${c.delay} infinite`,
          opacity: 0, pointerEvents: 'none',
          transform: 'rotate(45deg)',
        }} />
      ))}
    </>
  )
}

// "The Refresh" — watermelon-green glow with soft horizontal ripple lines
function AguaAmbience() {
  const ripples = [
    { width: '44%', delay: 0.3,  yPos: '52%' },
    { width: '32%', delay: 0.55, yPos: '56%' },
    { width: '38%', delay: 0.8,  yPos: '60%' },
  ]
  return (
    <>
      <style>{`
        @keyframes agua-ripple {
          0%   { transform: translateX(-50%) scaleX(0); opacity: 0; }
          25%  { opacity: 0.5; }
          100% { transform: translateX(-50%) scaleX(1); opacity: 0; }
        }
      `}</style>

      {/* Soft watermelon-green ambient glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60vw', height: '60vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(80,200,120,0.08) 0%, rgba(100,210,150,0.03) 45%, transparent 70%)',
        pointerEvents: 'none',
        animation: 'blob-drift-b 24s ease-in-out infinite',
      }} />

      {/* Horizontal ripple lines expanding outward */}
      {ripples.map((r, i) => (
        <div key={i} aria-hidden="true" style={{
          position: 'absolute', top: r.yPos, left: '50%',
          width: r.width, height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(100,210,150,0.45), transparent)',
          transform: 'translateX(-50%) scaleX(0)',
          animation: `agua-ripple ${1.4 + i * 0.3}s ease-out ${r.delay}s infinite`,
          pointerEvents: 'none',
        }} />
      ))}
    </>
  )
}

// "The Bite" — three slider-layer bars building in from alternating sides
function BiteAmbience() {
  const layers = [
    { width: '52%', delay: 0.52, origin: 'left center'  as const },
    { width: '40%', delay: 0.69, origin: 'right center' as const },
    { width: '46%', delay: 0.86, origin: 'left center'  as const },
  ]
  return (
    <>
      {/* Warm deep-amber glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60vw', height: '60vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,118,58,0.08) 0%, rgba(212,175,55,0.04) 45%, transparent 70%)',
        pointerEvents: 'none',
        animation: 'blob-drift-a 20s ease-in-out infinite',
      }} />

      {/* Three horizontal layer bars — the "slider trio" build */}
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: '14%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px',
        pointerEvents: 'none',
      }}>
        {layers.map((l, i) => (
          <motion.div
            key={i}
            aria-hidden="true"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.42, delay: l.delay, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: l.width, height: '1.5px',
              background: i === 1
                ? 'linear-gradient(90deg, transparent, rgba(212,175,55,0.55), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(212,175,55,0.28), transparent)',
              transformOrigin: l.origin,
            }}
          />
        ))}
      </div>
    </>
  )
}

export default function CourseCard({ card, guest, sessionId, dessertRevealed = false }: Props) {
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

      {/* Course label */}
      <motion.p {...item(0)} style={labelStyle}>{course.label}</motion.p>

      {/* Dish name */}
      <motion.h1 {...headingAnim} style={headingStyle}>
        {isFinish && !dessertRevealed ? '???' : course.dish}
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
