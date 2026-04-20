import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase-client.ts'
import { requireKitchenAuth } from '../_shared/kitchen-auth.ts'

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

const INTERMISSION_CARDS = new Set<Card>(['intermission-1', 'intermission-2', 'intermission-3'])

/**
 * POST /functions/v1/skip-card
 * Auth: Kitchen JWT
 * Body: { sessionId: string }
 *
 * Skips the next card in sequence IF it is an intermission.
 * The next non-intermission card becomes current.
 * Used when chef wants to bypass an intermission slot.
 */
Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'POST') return errorResponse('Method not allowed', 405)

  const authError = await requireKitchenAuth(req)
  if (authError) return authError

  let body: { sessionId?: string }
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid JSON body', 400)
  }

  const { sessionId } = body
  if (!sessionId) return errorResponse('sessionId is required', 400)

  const serviceClient = createServiceClient()

  const { data: state, error: stateError } = await serviceClient
    .from('session_state')
    .select('current_card, released_cards')
    .eq('session_id', sessionId)
    .single()

  if (stateError || !state) return errorResponse('Session not found', 404)

  const currentIndex = CARD_SEQUENCE.indexOf(state.current_card as Card)
  if (currentIndex === -1 || currentIndex >= CARD_SEQUENCE.length - 1) {
    return errorResponse('No next card to skip', 400)
  }

  const nextCard = CARD_SEQUENCE[currentIndex + 1]

  if (!INTERMISSION_CARDS.has(nextCard)) {
    return errorResponse(`Next card "${nextCard}" is not an intermission and cannot be skipped`, 400)
  }

  // Find the card after the intermission
  const cardAfterIntermission = CARD_SEQUENCE[currentIndex + 2]
  if (!cardAfterIntermission) {
    return errorResponse('No card after the intermission', 400)
  }

  const updatedReleased = [...new Set([...state.released_cards, nextCard, cardAfterIntermission])]

  const { error: updateError } = await serviceClient
    .from('session_state')
    .update({
      current_card: cardAfterIntermission,
      released_cards: updatedReleased,
      updated_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId)

  if (updateError) return errorResponse(updateError.message)

  return jsonResponse({
    ok: true,
    skipped: nextCard,
    current_card: cardAfterIntermission,
    released_cards: updatedReleased,
  })
})
