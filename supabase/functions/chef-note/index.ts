import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase-client.ts'
import { requireKitchenAuth } from '../_shared/kitchen-auth.ts'

/**
 * POST /functions/v1/chef-note
 * Auth: Kitchen JWT
 * Body: { sessionId: string, message: string }
 *
 * Inserts a chef note into the chef_notes table. Supabase Realtime
 * broadcasts the INSERT to all subscribed guest clients, which display
 * it as a slide-down toast for 8 seconds.
 */
Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'POST') return errorResponse('Method not allowed', 405)

  const authError = await requireKitchenAuth(req)
  if (authError) return authError

  let body: { sessionId?: string; message?: string }
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid JSON body', 400)
  }

  const { sessionId, message } = body
  if (!sessionId || !message?.trim()) return errorResponse('sessionId and message are required', 400)

  const trimmed = message.trim()
  if (trimmed.length > 100) return errorResponse('Message must be 100 characters or fewer', 400)

  const serviceClient = createServiceClient()

  const { data: note, error } = await serviceClient
    .from('chef_notes')
    .insert({ session_id: sessionId, message: trimmed })
    .select()
    .single()

  if (error) return errorResponse(error.message)

  return jsonResponse({ note })
})
