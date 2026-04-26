import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { createServiceClient, createUserClient } from '../_shared/supabase-client.ts'

const VALID_REACTIONS = ['fire', 'heart', 'chefs_kiss'] as const
type ReactionType = (typeof VALID_REACTIONS)[number]

/**
 * POST /functions/v1/reaction
 * Auth: Guest JWT
 * Body: { sessionId: string, toPhotoId: string, reactionType: ReactionType }
 *
 * Records a guest-to-guest photo reaction. One reaction per (guest, photo) pair
 * enforced at DB level. A second call will upsert (update the reaction type).
 * Realtime broadcasts the INSERT/UPDATE to both guests.
 */
Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'POST') return errorResponse('Method not allowed', 405)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return errorResponse('Missing authorization header', 401)

  const token = authHeader.replace(/^Bearer\s+/i, '')
  const userClient = createUserClient(authHeader)
  const { data: { user }, error: authError } = await userClient.auth.getUser(token)
  if (authError || !user) return errorResponse('Invalid token', 401)

  let body: { sessionId?: string; toPhotoId?: string; reactionType?: string }
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid JSON body', 400)
  }

  const { sessionId, toPhotoId, reactionType } = body
  if (!sessionId || !toPhotoId || !reactionType) {
    return errorResponse('sessionId, toPhotoId, and reactionType are required', 400)
  }

  if (!VALID_REACTIONS.includes(reactionType as ReactionType)) {
    return errorResponse(`Invalid reactionType. Must be one of: ${VALID_REACTIONS.join(', ')}`, 400)
  }

  const serviceClient = createServiceClient()

  // Verify the photo belongs to this session (prevent cross-session reactions)
  const { data: photo, error: photoError } = await serviceClient
    .from('photos')
    .select('id, guest_id')
    .eq('id', toPhotoId)
    .eq('session_id', sessionId)
    .single()

  if (photoError || !photo) return errorResponse('Photo not found in this session', 404)

  // Can't react to your own photo
  if (photo.guest_id === user.id) return errorResponse('Cannot react to your own photo', 400)

  const { data: reaction, error: upsertError } = await serviceClient
    .from('reactions')
    .upsert(
      {
        session_id: sessionId,
        from_guest_id: user.id,
        to_photo_id: toPhotoId,
        reaction_type: reactionType as ReactionType,
      },
      { onConflict: 'from_guest_id,to_photo_id' }
    )
    .select()
    .single()

  if (upsertError) return errorResponse(upsertError.message)

  return jsonResponse({ reaction })
})
