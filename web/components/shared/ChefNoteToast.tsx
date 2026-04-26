'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  sessionId: string
}

export default function ChefNoteToast({ sessionId }: Props) {
  const [message, setMessage] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`chef-notes-${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chef_notes', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const note = payload.new as { message: string }
          showToast(note.message)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  function showToast(msg: string) {
    setMessage(msg)
    setVisible(true)
    setTimeout(() => {
      setVisible(false)
      setTimeout(() => setMessage(null), 500)
    }, 8000)
  }

  if (!message) return null

  return (
    <div style={{
      position: 'fixed',
      top: '3rem',
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '-1rem'})`,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.4s ease, transform 0.4s ease',
      zIndex: 100,
      maxWidth: '280px',
      width: '90vw',
    }}>
      <div style={{
        backgroundColor: 'rgba(26, 26, 46, 0.97)',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        padding: '0.85rem 1.25rem',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '9px',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: '#D4AF37',
          marginBottom: '0.4rem',
        }}>
          From the Chef
        </p>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '0.95rem',
          fontStyle: 'italic',
          color: '#F5F0E8',
          margin: 0,
        }}>
          {message}
        </p>
      </div>
    </div>
  )
}
