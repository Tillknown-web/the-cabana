'use client'

import { motion } from 'framer-motion'
import { COURSE_DATA, COURSE_CARDS, INTERMISSION_CARDS } from '@/lib/constants'
import { PourAmbience, BiteAmbience, CleanseAmbience, AguaAmbience } from '@/components/experience/ambience'
import IntermissionCard from '@/components/experience/IntermissionCard'
import type { StageGuest } from '@/components/stage/StageView'

interface Props {
  card: string
  sessionId: string
  dessertRevealed?: boolean
  guests: StageGuest[]
}

const item = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] as const },
})

export default function StageCard({ card, sessionId, dessertRevealed = false, guests }: Props) {
  if (card === 'welcome') return <WelcomeStage guests={guests} />
  if (card === 'gallery') return <GalleryStage guests={guests} />
  if (INTERMISSION_CARDS.has(card)) {
    // Intermission card already has no input affordances and reads countdowns
    // from the public RLS policy, so we can drop it in unmodified. Wrap in a
    // scaling container so type reads from a TV.
    return (
      <div style={{ width: '100%', transform: 'scale(1.4)', transformOrigin: 'center' }}>
        <IntermissionCard card={card} sessionId={sessionId} />
      </div>
    )
  }
  if (COURSE_CARDS.has(card)) return <CourseStage card={card} dessertRevealed={dessertRevealed} />
  return <WelcomeStage guests={guests} />
}

function CourseStage({ card, dessertRevealed }: { card: string; dessertRevealed: boolean }) {
  const course = COURSE_DATA[card]
  if (!course) return null

  const isPour    = card === 'pour'
  const isBite    = card === 'bite'
  const isCleanse = card === 'cleanse'
  const isAgua    = card === 'agua'
  const isFinish  = card === 'finish'

  const headingAnim = isBite
    ? {
        initial: { opacity: 0, scale: 0.82 },
        animate: { opacity: 1, scale: 1 },
        transition: { type: 'spring' as const, stiffness: 380, damping: 20, delay: 0.08 },
      }
    : item(0.08)

  return (
    <div style={layoutStyle}>
      {isPour    && <PourAmbience />}
      {isBite    && <BiteAmbience />}
      {isCleanse && <CleanseAmbience />}
      {isAgua    && <AguaAmbience />}

      {!isPour && !isBite && !isCleanse && !isAgua && (
        <div aria-hidden="true" style={{
          position: 'absolute',
          top: '40%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60vmin', height: '60vmin', borderRadius: '50%',
          background: isFinish
            ? 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 65%)'
            : 'radial-gradient(circle, rgba(77,217,192,0.06) 0%, transparent 65%)',
          pointerEvents: 'none',
          animation: 'blob-drift-a 20s ease-in-out infinite',
        }} />
      )}

      <motion.h1 {...headingAnim} style={stageHeadingStyle}>
        {isFinish && !dessertRevealed ? '???' : course.dish}
      </motion.h1>

      <motion.p {...item(0)} style={stageLabelStyle}>{course.label}</motion.p>

      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        style={{ ...stageDividerStyle, transformOrigin: 'center', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)',
          animation: 'cabana-scan 2s ease-out forwards',
        }} />
      </motion.div>

      {(!isFinish || dessertRevealed) && (
        <motion.p {...item(0.26)} style={stageIngredientsStyle}>{course.ingredients}</motion.p>
      )}
      {isFinish && !dessertRevealed && (
        <motion.p {...item(0.26)} style={stageIngredientsStyle}>revealed at the table</motion.p>
      )}
    </div>
  )
}

function WelcomeStage({ guests }: { guests: StageGuest[] }) {
  return (
    <div style={layoutStyle}>
      <div aria-hidden="true" style={{
        position: 'absolute', top: '40%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '70vmin', height: '70vmin', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
        animation: 'blob-drift-a 22s ease-in-out infinite',
      }} />

      <motion.p {...item(0.05)} style={stageLabelStyle}>tonight&apos;s table</motion.p>

      <motion.img
        src="/logo-main.png"
        alt="The Cabana"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: 'clamp(280px, 36vmin, 560px)',
          height: 'auto',
          display: 'block',
          margin: '1rem 0 1.5rem',
        }}
      />

      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ ...stageDividerStyle, transformOrigin: 'center' }}
      />

      {guests.length > 0 ? (
        <motion.p {...item(0.55)} style={{
          ...stageIngredientsStyle,
          fontStyle: 'normal',
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(1.5rem, 3vmin, 2.5rem)',
          color: '#F5F0E8',
          opacity: 0.8,
        }}>
          {guests.map((g) => g.name).join(' · ')}
        </motion.p>
      ) : (
        <motion.p {...item(0.55)} style={stageIngredientsStyle}>
          the evening is about to begin
        </motion.p>
      )}
    </div>
  )
}

function GalleryStage({ guests }: { guests: StageGuest[] }) {
  return (
    <div style={layoutStyle}>
      <div aria-hidden="true" style={{
        position: 'absolute', top: '40%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '70vmin', height: '70vmin', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 65%)',
        pointerEvents: 'none',
        animation: 'blob-drift-a 24s ease-in-out infinite',
      }} />

      <motion.p {...item(0)} style={stageLabelStyle}>the evening</motion.p>
      <motion.h1 {...item(0.1)} style={stageHeadingStyle}>The Gallery</motion.h1>

      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{ ...stageDividerStyle, transformOrigin: 'center' }}
      />

      <motion.p {...item(0.45)} style={{
        ...stageIngredientsStyle,
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
        fontSize: 'clamp(1.25rem, 2.4vmin, 1.85rem)',
      }}>
        {guests.length > 0 ? guests.map((g) => g.name).join(' & ') : 'every plate, every eye'}
      </motion.p>
    </div>
  )
}

const layoutStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  minHeight: '100dvh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'clamp(2rem, 4vmin, 4rem)',
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
}

const stageLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'clamp(12px, 1.4vmin, 18px)',
  letterSpacing: '0.4em',
  textTransform: 'uppercase',
  color: '#D4AF37',
  marginBottom: '1.25rem',
  opacity: 0.85,
  position: 'relative',
  zIndex: 2,
}

const stageHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(3rem, 9vmin, 8rem)',
  fontWeight: 400,
  color: '#F5F0E8',
  margin: 0,
  lineHeight: 1.05,
  letterSpacing: '0.01em',
  position: 'relative',
  zIndex: 2,
}

const stageDividerStyle: React.CSSProperties = {
  width: 'clamp(60px, 8vmin, 120px)',
  height: '1px',
  backgroundColor: '#D4AF37',
  opacity: 0.55,
  margin: '2rem 0',
  position: 'relative',
  zIndex: 2,
}

const stageIngredientsStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'clamp(15px, 2vmin, 24px)',
  fontStyle: 'italic',
  color: '#A8C5DA',
  margin: 0,
  maxWidth: '80%',
  position: 'relative',
  zIndex: 2,
}
