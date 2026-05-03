'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { COURSE_CARDS } from '@/lib/constants'
import CheckIn from '@/components/experience/CheckIn'
import WelcomeCard from '@/components/experience/WelcomeCard'
import CourseCard from '@/components/experience/CourseCard'
import IntermissionCard from '@/components/experience/IntermissionCard'
import GalleryView from '@/components/experience/GalleryView'
import ProgressBar from '@/components/shared/ProgressBar'
import ChefNoteToast from '@/components/shared/ChefNoteToast'
import TableSidePrompt from '@/components/shared/TableSidePrompt'
import NowPlayingBar from '@/components/shared/NowPlayingBar'
import SongRequestModal from '@/components/shared/SongRequestModal'
import PhotoBoothButton from '@/components/shared/PhotoBoothButton'

export type Guest = {
  id: string
  name: string
}

const SESSION_ID = (process.env.NEXT_PUBLIC_SESSION_ID ?? '').trim()

export default function ExperiencePage() {
  const [guest, setGuest] = useState<Guest | null>(null)
  const [currentCard, setCurrentCard] = useState<string>('welcome')
  const [loading, setLoading] = useState(true)
  const [songModalOpen, setSongModalOpen] = useState(false)

  // True when the guest just freshly checked in (vs. restored from localStorage).
  // New guests always start at 'welcome' — we do NOT fetch the global session card
  // for them, because mid-session joiners would otherwise skip straight to whatever
  // course is currently live (e.g. steak) instead of starting from the beginning.
  const isNewCheckInRef = useRef(false)

  const supabase = createClient()

  // Restore guest from localStorage + verify Supabase auth session
  useEffect(() => {
    async function restore() {
      try {
        const stored = localStorage.getItem('cabana:guest')
        if (!stored) { setLoading(false); return }

        const guestData = JSON.parse(stored) as Guest
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          localStorage.removeItem('cabana:guest')
          setLoading(false)
          return
        }

        // If the auth UID no longer matches the stored guest ID (e.g. after a
        // new anonymous session was issued), the storage upload would fail RLS.
        // Clear and force re-check-in rather than silently uploading to the wrong path.
        if (session.user.id !== guestData.id) {
          localStorage.removeItem('cabana:guest')
          setLoading(false)
          return
        }

        // Verify the guest row still exists in the DB. It may have been deleted
        // by a kitchen reset even though the auth session and localStorage are intact.
        const { data: existingGuest } = await supabase
          .from('guests')
          .select('id')
          .eq('id', guestData.id)
          .maybeSingle()

        if (!existingGuest) {
          localStorage.removeItem('cabana:guest')
          setLoading(false)
          return
        }

        // Restored guest — they need to catch up to the current card.
        isNewCheckInRef.current = false
        setGuest(guestData)
      } catch {
        localStorage.removeItem('cabana:guest')
      } finally {
        setLoading(false)
      }
    }
    restore()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to session state + guest deletion once guest is confirmed
  useEffect(() => {
    if (!guest) return

    const isNew = isNewCheckInRef.current
    // Reset the flag so future re-runs (if ever) behave as "restored".
    isNewCheckInRef.current = false

    // Fetch initial state only for returning/restored guests so they catch up
    // to wherever the session currently is. New guests start at 'welcome'.
    if (!isNew) {
      supabase
        .from('session_state')
        .select('current_card')
        .eq('session_id', SESSION_ID)
        .single()
        .then(({ data }) => {
          if (data?.current_card) setCurrentCard(data.current_card)
        })
    }

    // Live session-state updates (advances all connected guests together)
    const stateChannel = supabase
      .channel(`exp-state-${SESSION_ID}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'session_state', filter: `session_id=eq.${SESSION_ID}` },
        (payload) => {
          const newCard = (payload.new as { current_card: string }).current_card
          setCurrentCard(newCard)
          if (COURSE_CARDS.has(newCard)) playChime()
        }
      )
      .subscribe()

    // Detect when the kitchen resets and deletes this guest's row.
    // When that happens, clear local state so the check-in form reappears.
    const guestChannel = supabase
      .channel(`exp-guest-${guest.id}`)
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'guests', filter: `id=eq.${guest.id}` },
        () => {
          localStorage.removeItem('cabana:guest')
          setCurrentCard('welcome')
          setGuest(null)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(stateChannel)
      supabase.removeChannel(guestChannel)
    }
  }, [guest]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCheckedIn = useCallback((g: Guest) => {
    localStorage.setItem('cabana:guest', JSON.stringify(g))
    // Mark as a fresh check-in so the subscribe effect skips the initial
    // session_state fetch and keeps them at 'welcome'.
    isNewCheckInRef.current = true
    setGuest(g)
  }, [])

  function renderCard() {
    if (!guest) return null
    if (currentCard === 'welcome') return <WelcomeCard guest={guest} sessionId={SESSION_ID} />
    if (currentCard === 'gallery') return <GalleryView guest={guest} sessionId={SESSION_ID} />
    if (COURSE_CARDS.has(currentCard)) return <CourseCard card={currentCard} guest={guest} sessionId={SESSION_ID} />
    if (currentCard.startsWith('intermission')) return <IntermissionCard card={currentCard} sessionId={SESSION_ID} />
    return <WelcomeCard guest={guest} sessionId={SESSION_ID} />
  }

  if (loading) return <LoadingScreen />
  if (!guest) return <CheckIn sessionId={SESSION_ID} onCheckedIn={handleCheckedIn} />

  return (
    <main style={{ minHeight: '100dvh', backgroundColor: '#2D1B47', position: 'relative', paddingBottom: '4rem' }}>
      <ProgressBar currentCard={currentCard} />
      {renderCard()}
      <ChefNoteToast sessionId={SESSION_ID} />
      <TableSidePrompt sessionId={SESSION_ID} currentCard={currentCard} />
      <NowPlayingBar sessionId={SESSION_ID} onSongRequest={() => setSongModalOpen(true)} />
      {(COURSE_CARDS.has(currentCard) || currentCard.startsWith('intermission')) && (
        <PhotoBoothButton sessionId={SESSION_ID} />
      )}
      {songModalOpen && (
        <SongRequestModal sessionId={SESSION_ID} onClose={() => setSongModalOpen(false)} />
      )}
    </main>
  )
}

function LoadingScreen() {
  return (
    <main style={{
      minHeight: '100dvh',
      backgroundColor: '#2D1B47',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ width: '1px', height: '48px', backgroundColor: '#D4AF37', opacity: 0.5 }} />
    </main>
  )
}

function playChime() {
  try {
    type AudioContextCtor = typeof AudioContext
    const Ctx: AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext: AudioContextCtor }).webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 528
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 1.8)
  } catch { /* audio not available */ }
}
