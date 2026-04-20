import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { createServiceClient, createUserClient } from '../_shared/supabase-client.ts'

/**
 * POST /functions/v1/song-request
 * Auth: Guest JWT
 * Body: { sessionId: string, songText: string }
 *
 * Submits a free-text song request from a guest. Stored in song_requests.
 * Chef sees these in the /kitchen song request queue.
 * Realtime broadcasts the INSERT to the kitchen client.
 */
Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'POST') return errorResponse('Method not allowed', 405)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return errorResponse('Missing authorization header', 401)

  const userClient = createUserClient(authHeader)
  const { data: { user }, error: authError } = await userClient.auth.getUser()
  if (authError || !user) return errorResponse('Invalid token', 401)

  let body: { sessionId?: string; songText?: string }
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid JSON body', 400)
  }

  const { sessionId, songText } = body
  if (!sessionId || !songText?.trim()) {
    return errorResponse('sessionId and songText are required', 400)
  }

  const trimmed = songText.trim()
  if (trimmed.length > 200) return errorResponse('Song text must be 200 characters or fewer', 400)

  const serviceClient = createServiceClient()

  const { data: request, error } = await serviceClient
    .from('song_requests')
    .insert({
      session_id: sessionId,
      guest_id: user.id,
      song_text: trimmed,
      seen: false,
    })
    .select()
    .single()

  if (error) return errorResponse(error.message)

  return jsonResponse({ request })
})
