'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { FlameIcon, HeartIcon, StarIcon } from '@/lib/icons'

type ReactionType = 'fire' | 'heart' | 'chefs_kiss'

interface FloatingReaction {
  id: string
  type: ReactionType
  x: number // 0-100 (% from left)
}

interface Props {
  sessionId: string
  selfGuestId: string
}

/**
 * Renders incoming partner reactions as floating gold icons that drift up
 * from the bottom of the screen and fade out (Apple-Messages tap-back style).
 *
 * Subscribes to public.reactions for the active session and ignores events
 * where from_guest_id === selfGuestId so the sender never sees their own emoji.
 */
export default function ReactionOverlay({ sessionId, selfGuestId }: Props) {
  const [floating, setFloating] = useState<FloatingReaction[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    if (!sessionId || !selfGuestId) return
    const supabase = createClient()

    function spawn(type: ReactionType) {
      const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const x = 20 + Math.random() * 60
      setFloating((prev) => [...prev, { id, type, x }])
      const timer = setTimeout(() => {
        setFloating((prev) => prev.filter((f) => f.id !== id))
        timersRef.current.delete(id)
      }, 3200)
      timersRef.current.set(id, timer)
    }

    const channel = supabase
      .channel(`exp-reactions-${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reactions', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const row = (payload.new ?? payload.old) as
            | { from_guest_id?: string; reaction_type?: ReactionType }
            | null
          if (!row) return
          if (row.from_guest_id === selfGuestId) return
          const type = row.reaction_type
          if (type !== 'fire' && type !== 'heart' && type !== 'chefs_kiss') return
          spawn(type)
        }
      )
      .subscribe()

    const timers = timersRef.current
    return () => {
      supabase.removeChannel(channel)
      timers.forEach((t) => clearTimeout(t))
      timers.clear()
    }
  }, [sessionId, selfGuestId])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 90,
      }}
    >
      <AnimatePresence>
        {floating.map((f) => (
          <motion.span
            key={f.id}
            initial={{ y: 0, opacity: 0, scale: 0.6 }}
            animate={{
              y: -360,
              opacity: [0, 1, 1, 0],
              scale: 1.2,
            }}
            transition={{ duration: 3, ease: 'easeOut', times: [0, 0.12, 0.7, 1] }}
            style={{
              position: 'absolute',
              bottom: '14%',
              left: `${f.x}%`,
              transform: 'translateX(-50%)',
              color: '#D4AF37',
              filter: 'drop-shadow(0 2px 6px rgba(212, 175, 55, 0.45))',
              display: 'flex',
            }}
          >
            {iconFor(f.type)}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}

function iconFor(type: ReactionType) {
  if (type === 'fire') return <FlameIcon size={40} />
  if (type === 'heart') return <HeartIcon size={40} />
  return <StarIcon size={40} />
}
