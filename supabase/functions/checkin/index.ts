import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { createServiceClient, createUserClient } from '../_shared/supabase-client.ts'

/**
 * POST /functions/v1/checkin
 * Body: { name: string, sessionId: string }
 * Auth: Bearer token from anonymous sign-in (client calls supabase.auth.signInAnonymously() first)
 *
 * Creates a guest row with id = auth.uid(). Safe to call multiple times — upserts.
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

  let body: { name?: string; sessionId?: string }
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid JSON body', 400)
  }

  const name = body.name?.trim()
  const sessionId = body.sessionId?.trim()
  if (!name || !sessionId) return errorResponse('name and sessionId are required', 400)

  const serviceClient = createServiceClient()

  // Verify the session exists
  const { data: session, error: sessionError } = await serviceClient
    .from('sessions')
    .select('session_id')
    .eq('session_id', sessionId)
    .single()

  if (sessionError || !session) return errorResponse('Session not found', 404)

  // Upsert guest (safe to call again if guest refreshes and re-checks-in)
  const { data: guest, error: insertError } = await serviceClient
    .from('guests')
    .upsert(
      { id: user.id, session_id: sessionId, name, current_card: 'welcome' },
      { onConflict: 'id', ignoreDuplicates: false }
    )
    .select()
    .single()

  if (insertError) return errorResponse(insertError.message)

  return jsonResponse({ guest })
})
