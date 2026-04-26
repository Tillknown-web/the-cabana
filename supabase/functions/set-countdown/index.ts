import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase-client.ts'
import { requireKitchenAuth } from '../_shared/kitchen-auth.ts'

const VALID_MINUTES = [5, 10, 15, 20] as const
type ValidMinutes = (typeof VALID_MINUTES)[number]

/**
 * POST /functions/v1/set-countdown
 * Auth: Kitchen JWT
 * Body (set):    { sessionId: string, targetCard: string, minutes: 5 | 10 | 15 | 20 }
 * Body (cancel): { sessionId: string, cancel: true }
 *
 * Sets or cancels the optional countdown ETA shown on guest waiting screens.
 * Does NOT auto-release the card — purely informational.
 * If the countdown expires before the chef releases the card, the client
 * quietly removes it and reverts to rotating messages.
 */
Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'POST') return errorResponse('Method not allowed', 405)

  const authError = await requireKitchenAuth(req)
  if (authError) return authError

  let body: { sessionId?: string; targetCard?: string; minutes?: number; cancel?: boolean }
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid JSON body', 400)
  }

  const { sessionId, cancel } = body
  if (!sessionId) return errorResponse('sessionId is required', 400)

  const serviceClient = createServiceClient()

  // Cancel mode — delete the active countdown
  if (cancel) {
    const { error } = await serviceClient
      .from('countdowns')
      .delete()
      .eq('session_id', sessionId)

    if (error) return errorResponse(error.message)
    return jsonResponse({ ok: true, cancelled: true })
  }

  // Set mode
  const { targetCard, minutes } = body
  if (!targetCard || !minutes) return errorResponse('targetCard and minutes are required', 400)

  if (!VALID_MINUTES.includes(minutes as ValidMinutes)) {
    return errorResponse(`minutes must be one of: ${VALID_MINUTES.join(', ')}`, 400)
  }

  const expiresAt = new Date(Date.now() + minutes * 60_000)

  const { data: countdown, error: upsertError } = await serviceClient
    .from('countdowns')
    .upsert(
      {
        session_id: sessionId,
        target_card: targetCard,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      },
      { onConflict: 'session_id' }
    )
    .select()
    .single()

  if (upsertError) return errorResponse(upsertError.message)

  return jsonResponse({ countdown })
})
