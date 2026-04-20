'use client'

const COURSE_STEPS = [
  { card: 'pour', label: 'Pour' },
  { card: 'bite', label: 'Bite' },
  { card: 'cut', label: 'Cut' },
  { card: 'finish', label: 'Finish' },
]

const CARD_TO_STEP_INDEX: Record<string, number> = {
  welcome: -1,
  pour: 0,
  'intermission-1': 0,
  bite: 1,
  'intermission-2': 1,
  cut: 2,
  'intermission-3': 2,
  finish: 3,
  gallery: 4,
}

interface Props {
  currentCard: string
}

export default function ProgressBar({ currentCard }: Props) {
  const currentStep = CARD_TO_STEP_INDEX[currentCard] ?? -1

  // Don't show on welcome
  if (currentCard === 'welcome') return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 40,
      display: 'flex',
      justifyContent: 'center',
      gap: '0.75rem',
      padding: '1rem',
      pointerEvents: 'none',
    }}>
      {COURSE_STEPS.map((step, i) => {
        const isDone = i <= currentStep
        return (
          <div key={step.card} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isDone ? '#D4AF37' : 'rgba(212, 175, 55, 0.25)',
              transition: 'background-color 0.4s ease',
            }} />
          </div>
        )
      })}
    </div>
  )
}
