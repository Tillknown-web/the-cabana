import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { CARD_SEQUENCE } from '@/types'
import type { CardId } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { sessionId, cardId } = await req.json()
    if (!sessionId || !cardId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Fetch current session state
    const { data: session, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const released = (session.released_cards ?? []) as CardId[]

    // Validate sequential order (intermissions can be skipped, not course cards)
    const cardIndex = CARD_SEQUENCE.indexOf(cardId as CardId)
    if (cardIndex === -1) {
      return NextResponse.json({ error: 'Invalid card' }, { status: 400 })
    }

    if (!released.includes(cardId as CardId)) {
      released.push(cardId as CardId)
    }

    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        current_card: cardId,
        released_cards: released,
      })
      .eq('id', sessionId)

    if (updateError) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, cardId, releasedCards: released })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
