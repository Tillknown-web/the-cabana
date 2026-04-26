import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase-client.ts'
import { requireKitchenAuth } from '../_shared/kitchen-auth.ts'

// Ordered card sequence. Course cards cannot be skipped.
// Intermissions can be skipped via the separate skip-card function.
const CARD_SEQUENCE = [
  'welcome',
  'pour',
  'intermission-1',
  'bite',
  'intermission-2',
  'cut',
  'intermission-3',
  'finish',
  'gallery',
] as const

type Card = (typeof CARD_SEQUENCE)[number]

const COURSE_CARDS = new Set<Card>(['pour', 'bite', 'cut', 'finish', 'gallery'])
const INTERMISSION_CARDS = new Set<Card>(['intermission-1', 'intermission-2', 'intermission-3'])

/**
 * POST /functions/v1/release-card
 * Auth: Kitchen JWT
 * Body: { sessionId: string, card: Card }
 *
 * Releases a card to all guests in the session.
 * Enforces sequential order — course cards cannot be skipped.
 * Supabase Realtime broadcasts the session_state UPDATE automatically.
 */
Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'POST') return errorResponse('Method not allowed', 405)

  const authError = await requireKitchenAuth(req)
  if (authError) return authError

  let body: { sessionId?: string; card?: string }
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid JSON body', 400)
  }

  const { sessionId, card } = body
  if (!sessionId || !card) return errorResponse('sessionId and card are required', 400)

  if (!CARD_SEQUENCE.includes(card as Card)) {
    return errorResponse(`Unknown card: ${card}`, 400)
  }

  const serviceClient = createServiceClient()

  // Fetch current state
  const { data: state, error: stateError } = await serviceClient
    .from('session_state')
    .select('current_card, released_cards')
    .eq('session_id', sessionId)
    .single()

  if (stateError || !state) return errorResponse('Session not found', 404)

  const currentIndex = CARD_SEQUENCE.indexOf(state.current_card as Card)
  const newIndex = CARD_SEQUENCE.indexOf(card as Card)

  // Must move forward
  if (newIndex <= currentIndex) {
    return errorResponse(`Cannot release "${card}" — it comes before or is the current card`, 400)
  }

  // Cannot skip over course cards (only intermissions can be jumped over)
  for (let i = currentIndex + 1; i < newIndex; i++) {
    const skippedCard = CARD_SEQUENCE[i]
    if (COURSE_CARDS.has(skippedCard)) {
      return errorResponse(`Cannot skip course card "${skippedCard}"`, 400)
    }
  }

  const updatedReleased = [...new Set([...state.released_cards, card])]

  const { error: updateError } = await serviceClient
    .from('session_state')
    .update({
      current_card: card,
      released_cards: updatedReleased,
      updated_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId)

  if (updateError) return errorResponse(updateError.message)

  return jsonResponse({
    ok: true,
    current_card: card,
    released_cards: updatedReleased,
  })
})
