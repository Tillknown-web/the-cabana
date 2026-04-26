'use client'

import { useEffect, useState } from 'react'

interface ChefNoteToastProps {
  message: string | null
  sentAt: string | null
}

export default function ChefNoteToast({ message, sentAt }: ChefNoteToastProps) {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [displayedNote, setDisplayedNote] = useState<{ message: string; sentAt: string } | null>(null)

  useEffect(() => {
    if (!message || !sentAt) return

    // New note arrived
    setDisplayedNote({ message, sentAt })
    setVisible(true)
    setExiting(false)

    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(() => {
        setVisible(false)
        setExiting(false)
      }, 300)
    }, 8000)

    return () => clearTimeout(timer)
  }, [message, sentAt])

  if (!visible || !displayedNote) return null

  return (
    <div
      className={exiting ? 'toast-exit' : 'toast-enter'}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        padding: '16px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(45, 27, 71, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: 4,
          padding: '12px 20px',
          maxWidth: 380,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ fontSize: 16, flexShrink: 0 }}>🔥</span>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            color: '#D4AF37',
            lineHeight: 1.4,
          }}
        >
          {displayedNote.message}
        </p>
      </div>
    </div>
  )
}
