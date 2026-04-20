import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase-client.ts'
import { requireKitchenAuth } from '../_shared/kitchen-auth.ts'

const VALID_TRIGGERS = ['butter_pour', 'dessert_reveal'] as const
type TriggerType = (typeof VALID_TRIGGERS)[number]

// Which card must be active for each trigger to be valid
const TRIGGER_REQUIRES_CARD: Record<TriggerType, string> = {
  butter_pour: 'cut',
  dessert_reveal: 'finish',
}

/**
 * POST /functions/v1/tableside-trigger
 * Auth: Kitchen JWT
 * Body: { sessionId: string, triggerType: TriggerType }
 *
 * Fires a tableside trigger (butter pour shimmer, dessert gold reveal).
 * Only valid when the associated card is currently live.
 * Expires 60 seconds after firing — clients check expires_at before animating.
 * Supabase Realtime broadcasts the INSERT to guest clients.
 */
Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'POST') return errorResponse('Method not allowed', 405)

  const authError = await requireKitchenAuth(req)
  if (authError) return authError

  let body: { sessionId?: string; triggerType?: string }
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid JSON body', 400)
  }

  const { sessionId, triggerType } = body
  if (!sessionId || !triggerType) return errorResponse('sessionId and triggerType are required', 400)

  if (!VALID_TRIGGERS.includes(triggerType as TriggerType)) {
    return errorResponse(`Invalid triggerType. Must be one of: ${VALID_TRIGGERS.join(', ')}`, 400)
  }

  const serviceClient = createServiceClient()

  // Verify the required card is currently live
  const { data: state, error: stateError } = await serviceClient
    .from('session_state')
    .select('current_card')
    .eq('session_id', sessionId)
    .single()

  if (stateError || !state) return errorResponse('Session not found', 404)

  const requiredCard = TRIGGER_REQUIRES_CARD[triggerType as TriggerType]
  if (state.current_card !== requiredCard) {
    return errorResponse(
      `"${triggerType}" can only be fired when the "${requiredCard}" card is live. Current card: "${state.current_card}"`,
      400
    )
  }

  const firedAt = new Date()
  const expiresAt = new Date(firedAt.getTime() + 60_000)

  const { data: trigger, error: insertError } = await serviceClient
    .from('tableside_triggers')
    .insert({
      session_id: sessionId,
      trigger_type: triggerType,
      fired_at: firedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (insertError) return errorResponse(insertError.message)

  return jsonResponse({ trigger })
})
