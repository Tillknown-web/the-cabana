import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const guestId = req.nextUrl.searchParams.get('guestId')

  const supabase = createServiceClient()

  const { data: session, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  // Get latest chef note
  const { data: noteRow } = await supabase
    .from('chef_notes')
    .select('message, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Get guest's current card if guestId provided
  let guestCurrentCard = session.current_card
  if (guestId) {
    const { data: guest } = await supabase
      .from('guests')
      .select('current_card')
      .eq('id', guestId)
      .single()
    if (guest) guestCurrentCard = guest.current_card
  }

  return NextResponse.json({
    currentCard: guestCurrentCard,
    releasedCards: session.released_cards ?? [],
    countdown: session.countdown_card && session.countdown_expires_at
      ? { card: session.countdown_card, expiresAt: session.countdown_expires_at }
      : null,
    chefNote: noteRow
      ? { message: noteRow.message, sentAt: noteRow.created_at }
      : null,
  })
}
