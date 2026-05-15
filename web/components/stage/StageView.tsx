'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import StageCard from '@/components/stage/StageCard'
import LivePhotoWall from '@/components/stage/LivePhotoWall'

interface Props {
  sessionId: string
}

export interface StageGuest {
  id: string
  name: string
}

export default function StageView({ sessionId }: Props) {
  const [currentCard, setCurrentCard] = useState<string>('welcome')
  const [dessertRevealed, setDessertRevealed] = useState(false)
  const [guests, setGuests] = useState<StageGuest[]>([])

  const supabase = createClient()

  // Initial session state load + realtime subscription. No auth needed —
  // session_state has a public read policy (using (true)).
  useEffect(() => {
    if (!sessionId) return

    supabase
      .from('session_state')
      .select('current_card')
      .eq('session_id', sessionId)
      .single()
      .then(({ data }) => {
        if (data?.current_card) setCurrentCard(data.current_card)
      })

    const stateChannel = supabase
      .channel(`stage-state-${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'session_state', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const newCard = (payload.new as { current_card: string }).current_card
          setCurrentCard(newCard)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(stateChannel)
    }
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Once finish lands, see whether the dessert has already been revealed so
  // the stage doesn't show '???' if a viewer joins late.
  useEffect(() => {
    if (currentCard !== 'finish' || dessertRevealed) return
    supabase
      .from('tableside_triggers')
      .select('id')
      .eq('session_id', sessionId)
      .eq('trigger_type', 'dessert_reveal')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (data) setDessertRevealed(true) })
  }, [currentCard]) // eslint-disable-line react-hooks/exhaustive-deps

  // Pull the checked-in guest list from the gallery edge function (the only
  // public source for guest names) so the welcome card can show "tonight's
  // table". This is also kept in sync by LivePhotoWall but a small
  // duplicate fetch here is fine — both share the function's response.
  const refreshGuests = useCallback(async () => {
    if (!sessionId) return
    try {
      const url = new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/gallery`)
      url.searchParams.set('sessionId', sessionId)
      const res = await fetch(url.toString(), {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` },
      })
      if (!res.ok) return
      const json = (await res.json()) as { guests: StageGuest[] }
      setGuests(json.guests ?? [])
    } catch {
      /* welcome card just shows the wordmark if guests can't load */
    }
  }, [sessionId])

  useEffect(() => {
    refreshGuests()
  }, [refreshGuests])

  return (
    <main className="stage-root">
      <section className="stage-card-side">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard}
            initial={{ opacity: 0, scale: 0.97, y: 28 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit   ={{ opacity: 0, scale: 1.02, y: -24 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '100%', height: '100%' }}
          >
            <StageCard
              card={currentCard}
              sessionId={sessionId}
              dessertRevealed={dessertRevealed}
              guests={guests}
            />
          </motion.div>
        </AnimatePresence>
      </section>

      <section className="stage-wall-side">
        <LivePhotoWall sessionId={sessionId} onGuestsChange={setGuests} />
      </section>

      <style>{`
        .stage-root {
          min-height: 100dvh;
          width: 100%;
          background-color: #0A0A0F;
          color: #F5F0E8;
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: auto auto;
        }
        .stage-card-side {
          position: relative;
          min-height: 100dvh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stage-wall-side {
          position: relative;
          min-height: 100dvh;
          overflow: hidden;
          border-top: 1px solid rgba(212, 175, 55, 0.1);
        }
        @media (min-width: 1024px) {
          .stage-root {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 100dvh;
          }
          .stage-card-side,
          .stage-wall-side {
            min-height: 0;
            height: 100dvh;
          }
          .stage-wall-side {
            border-top: none;
            border-left: 1px solid rgba(212, 175, 55, 0.1);
          }
        }
      `}</style>
    </main>
  )
}
