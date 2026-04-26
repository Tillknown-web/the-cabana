'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import SessionHeader from '@/components/kitchen/SessionHeader'
import CardControls from '@/components/kitchen/CardControls'
import GuestTracker from '@/components/kitchen/GuestTracker'
import ChefNoteComposer from '@/components/kitchen/ChefNoteComposer'
import CountdownSetter from '@/components/kitchen/CountdownSetter'
import TableSideTriggers from '@/components/kitchen/TableSideTriggers'
import SongQueue from '@/components/kitchen/SongQueue'

const SESSION_ID = process.env.NEXT_PUBLIC_SESSION_ID!

// Kitchen credentials — auto sign-in, no login form needed
const KITCHEN_EMAIL = 'kitchen@thecabana.com'
const KITCHEN_PASSWORD = 'Cabana2026!'

export type KitchenUser = {
  id: string
  email: string
  accessToken: string
}

export type SessionState = {
  current_card: string
  released_cards: string[]
}

export default function KitchenPage() {
  const [kitchenUser, setKitchenUser] = useState<KitchenUser | null>(null)
  const [sessionState, setSessionState] = useState<SessionState | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function signIn() {
      // Restore existing session first
      const { data: { session: existing } } = await supabase.auth.getSession()
      if (existing?.user?.user_metadata?.role === 'kitchen') {
        setKitchenUser({ id: existing.user.id, email: existing.user.email!, accessToken: existing.access_token })
        setLoading(false)
        return
      }

      // Auto sign-in with kitchen credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: KITCHEN_EMAIL,
        password: KITCHEN_PASSWORD,
      })

      if (error || !data.session) {
        setAuthError(error?.message ?? 'Sign-in failed')
      } else {
        setKitchenUser({ id: data.user.id, email: data.user.email!, accessToken: data.session.access_token })
      }
      setLoading(false)
    }
    signIn()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to session state once authed
  useEffect(() => {
    if (!kitchenUser) return

    supabase
      .from('session_state')
      .select('current_card, released_cards')
      .eq('session_id', SESSION_ID)
      .single()
      .then(({ data }) => { if (data) setSessionState(data as SessionState) })

    const channel = supabase
      .channel(`kitchen-state-${SESSION_ID}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'session_state', filter: `session_id=eq.${SESSION_ID}` },
        (payload) => setSessionState(payload.new as SessionState)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [kitchenUser]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <KitchenLoading />
  if (authError) return <KitchenError message={authError} />
  if (!kitchenUser) return <KitchenLoading />

  return (
    <main style={{ minHeight: '100dvh', backgroundColor: '#1A1A2E', color: '#F5F0E8', paddingBottom: '4rem' }}>
      <SessionHeader
        sessionState={sessionState}
        sessionId={SESSION_ID}
        onReset={() => setSessionState({ current_card: 'welcome', released_cards: [] })}
      />

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '1.5rem' }}>
        <CardControls
          sessionState={sessionState}
          sessionId={SESSION_ID}
          accessToken={kitchenUser.accessToken}
          onStateChange={setSessionState}
        />

        <SectionDivider />

        <GuestTracker sessionId={SESSION_ID} />

        <SectionDivider />

        <ChefNoteComposer sessionId={SESSION_ID} accessToken={kitchenUser.accessToken} />

        <SectionDivider />

        <TableSideTriggers
          sessionId={SESSION_ID}
          currentCard={sessionState?.current_card ?? ''}
          accessToken={kitchenUser.accessToken}
        />

        <SectionDivider />

        <CountdownSetter
          sessionId={SESSION_ID}
          currentCard={sessionState?.current_card ?? ''}
          accessToken={kitchenUser.accessToken}
        />

        <SectionDivider />

        <SongQueue sessionId={SESSION_ID} accessToken={kitchenUser.accessToken} />
      </div>
    </main>
  )
}

function SectionDivider() {
  return (
    <div style={{
      width: '100%',
      height: '1px',
      backgroundColor: 'rgba(212, 175, 55, 0.12)',
      margin: '2rem 0',
    }} />
  )
}

function KitchenLoading() {
  return (
    <main style={{ minHeight: '100dvh', backgroundColor: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '1px', height: '48px', backgroundColor: '#D4AF37', opacity: 0.4 }} />
    </main>
  )
}

function KitchenError({ message }: { message: string }) {
  return (
    <main style={{ minHeight: '100dvh', backgroundColor: '#1A1A2E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '0.75rem' }}>Kitchen</p>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: '#F5F0E8', opacity: 0.5 }}>{message}</p>
    </main>
  )
}
