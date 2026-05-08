'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Tiny client component — the only data-fetching piece on the landing page.
 * Shows "X of 2 seats filled" or "2 of 2 — house full".
 * Reads from Supabase and subscribes to live updates.
 */
export default function SeatCount({ sessionId }: { sessionId: string }) {
  const [count, setCount] = useState<number | null>(null)
  const MAX_SEATS = 2

  useEffect(() => {
    const supabase = createClient()

    supabase
      .from('guests')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .then(({ count }) => setCount(count ?? 0))

    const channel = supabase
      .channel(`seat-count-${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'guests', filter: `session_id=eq.${sessionId}` },
        () => {
          supabase
            .from('guests')
            .select('id', { count: 'exact', head: true })
            .eq('session_id', sessionId)
            .then(({ count }) => setCount(count ?? 0))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [sessionId])

  if (count === null) return null

  const isFull = count >= MAX_SEATS

  return (
    <p style={{
      fontFamily: 'var(--font-sans)',
      fontSize: '11px',
      letterSpacing: '0.12em',
      color: isFull ? 'rgba(224,96,126,0.75)' : 'rgba(255,255,255,0.3)',
      marginBottom: '0.75rem',
    }}>
      {isFull
        ? `${MAX_SEATS} of ${MAX_SEATS} — house full`
        : `${count} of ${MAX_SEATS} seats filled`}
    </p>
  )
}
