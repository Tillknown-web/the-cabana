import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase-client.ts'
import { requireKitchenAuth } from '../_shared/kitchen-auth.ts'

/**
 * POST /functions/v1/dismiss-request
 * Auth: Kitchen JWT
 * Body: { requestId: string }
 *
 * Marks a song request as seen (seen = true).
 * Removes it from the "new" queue in the kitchen panel.
 */
Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'POST') return errorResponse('Method not allowed', 405)

  const authError = await requireKitchenAuth(req)
  if (authError) return authError

  let body: { requestId?: string }
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid JSON body', 400)
  }

  const { requestId } = body
  if (!requestId) return errorResponse('requestId is required', 400)

  const serviceClient = createServiceClient()

  const { error } = await serviceClient
    .from('song_requests')
    .update({ seen: true })
    .eq('id', requestId)

  if (error) return errorResponse(error.message)

  return jsonResponse({ ok: true })
})
