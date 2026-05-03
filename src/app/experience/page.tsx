'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import type { CardId } from '@/types'
import { CARD_SEQUENCE, COURSE_CARDS } from '@/types'
import { playCardChime } from '@/lib/sounds'

import CheckInScreen from '@/components/experience/CheckInScreen'
import WelcomeScreen from '@/components/experience/WelcomeScreen'
import WaitingScreen from '@/components/experience/WaitingScreen'
import CourseCard from '@/components/experience/CourseCard'
import FinishCard from '@/components/experience/FinishCard'
import GalleryScreen from '@/components/experience/GalleryScreen'
import CourseProgressBar from '@/components/shared/CourseProgressBar'
import NowPlayingBar from '@/components/shared/NowPlayingBar'
import ChefNoteToast from '@/components/shared/ChefNoteToast'
import SongRequestModal from '@/components/shared/SongRequestModal'
import PhotoBoothButton from '@/components/shared/PhotoBoothButton'

const SESSION_ID = process.env.NEXT_PUBLIC_ACTIVE_SESSION_ID ?? ''

type GuestPhoto = { id: string; signedUrl: string; guestName: string }

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

const CARD_BG: Record<string, string> = {
  pour: '#3D2860',
  bite: '#2D2048',
  cut: '#2D1B47',
  finish: '#1A1A2E',
}

const COURSE_CARDS_DATA = {
  pour: {
    courseLabel: 'the pour',
    dishName: 'Sunset Spritz',
    ingredients: 'mango · pineapple · tajín',
    description: 'A frozen escape — sweet, smoky, with a kiss of heat at the rim.',
    backstoryTitle: 'Behind the pour',
    backstory: 'Born from a late-night blender session and too many tajín rims. The mango does the heavy lifting, but the tajín stays for the finish.',
    course: 'pour' as const,
  },
  bite: {
    courseLabel: 'the bite',
    dishName: 'Slider Trio',
    ingredients: 'three sauces · slaw · brioche',
    description: 'Three sliders, three personalities. Pick your sauce.',
    backstoryTitle: 'Behind the bite',
    backstory: 'Every sauce was tested at least four times. The truffle mayo almost didn\'t make it.',
    sauceCards: [
      { name: 'Honey BBQ', description: 'Sweet heat, tangy smoke' },
      { name: 'Honey Mustard', description: 'Sharp, creamy, bright' },
      { name: 'Truffle Mayo', description: 'Earthy, rich, decadent' },
    ],
    course: 'bite' as const,
  },
  cut: {
    courseLabel: 'the cut',
    dishName: 'Ribeye, tableside',
    ingredients: 'garlic herb butter · truffle fries · flaky salt',
    description: 'Sliced at the table. Butter poured hot.',
    backstoryTitle: 'Behind the cut',
    backstory: 'The ribeye rests for 10 minutes before slicing. The compound butter is made fresh that morning.',
    course: 'cut' as const,
  },
}

export default function ExperiencePage() {
  const [guestId, setGuestId] = useState<string | null>(null)
  const [guestName, setGuestName] = useState<string | null>(null)
  const [currentCard, setCurrentCard] = useState<CardId>('checkin')
  const [releasedCards, setReleasedCards] = useState<CardId[]>([])
  const [countdown, setCountdown] = useState<{ card: CardId; expiresAt: string } | null>(null)
  const [chefNote, setChefNote] = useState<{ message: string; sentAt: string } | null>(null)
  const [tablesideTrigger, setTablesideTrigger] = useState<{ trigger: string; firedAt: string } | null>(null)
  const [showSongRequest, setShowSongRequest] = useState(false)
  const [otherGuestPhotos, setOtherGuestPhotos] = useState<Record<string, GuestPhoto | null>>({})
  const [waitingForCard, setWaitingForCard] = useState(false)
  const prevCardRef = useRef<CardId>('checkin')
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createClient()
    return supabaseRef.current
  }

  // Restore session from cookie
  useEffect(() => {
    const id = getCookie('cabana_guest_id')
    const name = getCookie('cabana_guest_name')
    if (id && name) {
      setGuestId(id)
      setGuestName(name)
    }
  }, [])

  // Restore guest's current card from server
  useEffect(() => {
    if (!guestId) return
    async function restoreState() {
      const res = await fetch(`/api/state/${SESSION_ID}?guestId=${guestId}`)
      if (!res.ok) return
      const data = await res.json()
      setCurrentCard(data.currentCard ?? 'welcome')
      setReleasedCards(data.releasedCards ?? [])
      if (data.countdown) setCountdown(data.countdown)
      if (data.chefNote) setChefNote(data.chefNote)
    }
    restoreState()
  }, [guestId])

  // Supabase Realtime subscription
  useEffect(() => {
    if (!guestId) return

    const supabase = getSupabase()
    const channel = supabase
      .channel(`session:${SESSION_ID}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${SESSION_ID}` },
        (payload) => {
          const newData = payload.new as {
            current_card: CardId
            released_cards: CardId[]
            countdown_card: CardId | null
            countdown_expires_at: string | null
          }
          const newCard = newData.current_card as CardId
          if (newCard !== prevCardRef.current) {
            playCardChime(newCard)
            prevCardRef.current = newCard
            setWaitingForCard(false)
          }
          setCurrentCard(newCard)
          setReleasedCards(newData.released_cards ?? [])
          if (newData.countdown_card && newData.countdown_expires_at) {
            setCountdown({ card: newData.countdown_card, expiresAt: newData.countdown_expires_at })
          } else {
            setCountdown(null)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chef_notes', filter: `session_id=eq.${SESSION_ID}` },
        (payload) => {
          const note = payload.new as { message: string; created_at: string }
          if (note.message.startsWith('__tableside:')) {
            const trigger = note.message.replace('__tableside:', '')
            setTablesideTrigger({ trigger, firedAt: note.created_at })
          } else {
            setChefNote({ message: note.message, sentAt: note.created_at })
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'photos', filter: `session_id=eq.${SESSION_ID}` },
        (payload) => {
          const photo = payload.new as { guest_id: string; course: string; id: string }
          if (photo.guest_id !== guestId) {
            // Other guest uploaded a photo — fetch signed URL for reaction
            fetchOtherGuestPhoto(photo.course, photo.id)
          }
        }
      )
      .subscribe()

    return () => {
      getSupabase().removeChannel(channel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guestId])

  async function fetchOtherGuestPhoto(course: string, photoId: string) {
    const res = await fetch(`/api/gallery/${SESSION_ID}?course=${course}`)
    if (!res.ok) return
    const data = await res.json()
    const photos = data.photos as Array<{ id: string; signed_url: string; guest_name: string; guest_id: string }>
    const other = photos.find((p) => p.id === photoId && p.guest_id !== guestId)
    if (other) {
      setOtherGuestPhotos((prev) => ({
        ...prev,
        [course]: { id: other.id, signedUrl: other.signed_url, guestName: other.guest_name },
      }))
    }
  }

  const handleCheckedIn = useCallback((id: string, name: string) => {
    setGuestId(id)
    setGuestName(name)
    setCurrentCard('welcome')
  }, [])

  const handleWelcomeComplete = useCallback(() => {
    setWaitingForCard(true)
  }, [])

  const handleCourseComplete = useCallback(() => {
    setWaitingForCard(true)
  }, [])

  // Persist guest's current card to DB so page refreshes restore the correct position
  useEffect(() => {
    if (!guestId || currentCard === 'checkin') return
    fetch('/api/guest/advance-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestId, cardId: currentCard }),
    })
  }, [guestId, currentCard])

  // Advance to the next released card when the kitchen releases it while guest is waiting
  useEffect(() => {
    if (currentCard === 'welcome' || waitingForCard) {
      const nextIndex = CARD_SEQUENCE.indexOf(currentCard) + 1
      const nextCard = CARD_SEQUENCE[nextIndex]
      if (nextCard && releasedCards.includes(nextCard)) {
        setWaitingForCard(false)
        setCurrentCard(nextCard)
      }
    }
  }, [currentCard, waitingForCard, releasedCards])

  // Determine what to render
  function renderScreen() {
    if (!guestId || !guestName) {
      return <CheckInScreen sessionId={SESSION_ID} onCheckedIn={handleCheckedIn} />
    }

    if (currentCard === 'checkin') {
      return <CheckInScreen sessionId={SESSION_ID} onCheckedIn={handleCheckedIn} />
    }

    if (currentCard === 'welcome') {
      return (
        <WelcomeScreen
          guestName={guestName}
          guestId={guestId}
          sessionId={SESSION_ID}
          onComplete={handleWelcomeComplete}
        />
      )
    }

    if (waitingForCard || !releasedCards.includes(currentCard)) {
      return <WaitingScreen guestName={guestName} countdown={countdown} />
    }

    if (currentCard === 'pour') {
      const d = COURSE_CARDS_DATA.pour
      return (
        <CourseCard
          {...d}
          cardId="pour"
          backgroundColor={CARD_BG.pour}
          sessionId={SESSION_ID}
          guestId={guestId}
          onComplete={handleCourseComplete}
          otherGuestPhoto={otherGuestPhotos['pour'] ?? null}
        />
      )
    }

    if (currentCard === 'intermission1' || currentCard === 'intermission2' || currentCard === 'intermission3') {
      // Intermissions auto-advance after a moment (content TBD)
      return (
        <div
          className="screen-enter"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#352256',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 16,
            textAlign: 'center',
            padding: 40,
            paddingBottom: 72,
          }}
        >
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 24,
              color: 'rgba(245,240,232,0.7)',
              fontStyle: 'italic',
            }}
          >
            A moment between courses.
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'rgba(245,240,232,0.35)', fontStyle: 'italic' }}>
            Your next course is on its way.
          </p>
        </div>
      )
    }

    if (currentCard === 'bite') {
      const d = COURSE_CARDS_DATA.bite
      return (
        <CourseCard
          {...d}
          cardId="bite"
          backgroundColor={CARD_BG.bite}
          sessionId={SESSION_ID}
          guestId={guestId}
          onComplete={handleCourseComplete}
          otherGuestPhoto={otherGuestPhotos['bite'] ?? null}
        />
      )
    }

    if (currentCard === 'cut') {
      const d = COURSE_CARDS_DATA.cut
      return (
        <CourseCard
          {...d}
          cardId="cut"
          backgroundColor={CARD_BG.cut}
          sessionId={SESSION_ID}
          guestId={guestId}
          onComplete={handleCourseComplete}
          otherGuestPhoto={otherGuestPhotos['cut'] ?? null}
          tablesideTrigger={!!tablesideTrigger && tablesideTrigger.trigger === 'butter_pour'}
          tablesidePrompt="Watch the chef"
          tablesideHighlight="Butter poured hot."
        />
      )
    }

    if (currentCard === 'finish') {
      return (
        <FinishCard
          sessionId={SESSION_ID}
          guestId={guestId}
          onComplete={handleCourseComplete}
          otherGuestPhoto={otherGuestPhotos['finish'] ?? null}
          dessertRevealed={!!tablesideTrigger && tablesideTrigger.trigger === 'dessert_reveal'}
        />
      )
    }

    if (currentCard === 'gallery') {
      return <GalleryScreen sessionId={SESSION_ID} guestId={guestId} guestName={guestName} />
    }

    return <WaitingScreen guestName={guestName} countdown={countdown} />
  }

  const showProgressBar = COURSE_CARDS.includes(currentCard) || 
    ['intermission1', 'intermission2', 'intermission3'].includes(currentCard)
  const showNowPlaying = currentCard !== 'checkin'
  const showBooth = guestId && currentCard !== 'checkin' && currentCard !== 'gallery'

  return (
    <>
      {renderScreen()}

      {showProgressBar && (
        <CourseProgressBar currentCard={currentCard} releasedCards={releasedCards} />
      )}

      {chefNote && !chefNote.message.startsWith('__') && (
        <ChefNoteToast message={chefNote.message} sentAt={chefNote.sentAt} />
      )}

      {showNowPlaying && (
        <NowPlayingBar sessionId={SESSION_ID} onRequestSong={() => setShowSongRequest(true)} />
      )}

      {showBooth && guestId && guestName && (
        <PhotoBoothButton sessionId={SESSION_ID} guestId={guestId} />
      )}

      {showSongRequest && guestId && (
        <SongRequestModal
          sessionId={SESSION_ID}
          guestId={guestId}
          onClose={() => setShowSongRequest(false)}
        />
      )}
    </>
  )
}
