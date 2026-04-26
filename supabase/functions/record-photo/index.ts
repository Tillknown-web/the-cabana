import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { createServiceClient, createUserClient } from '../_shared/supabase-client.ts'

const VALID_COURSES = ['guest', 'pour', 'bite', 'cut', 'finish', 'booth'] as const
type Course = (typeof VALID_COURSES)[number]

/**
 * POST /functions/v1/record-photo
 * Auth: Guest JWT
 * Body: { sessionId: string, course: Course, storagePath: string }
 *
 * Records photo metadata in the photos table after the client has already
 * uploaded the file directly to Supabase Storage via the JS SDK.
 * The storagePath is the Storage object key (e.g. "2026-july/{guestId}/pour.jpg").
 *
 * Note: Photo upload to Storage is handled client-side:
 *   supabase.storage.from('photos').upload(path, file)
 * This function just records the metadata so the gallery can retrieve it.
 */
Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'POST') return errorResponse('Method not allowed', 405)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return errorResponse('Missing authorization header', 401)

  const token = authHeader.replace(/^Bearer\s+/i, '')
  const userClient = createUserClient(authHeader)
  // Pass the token explicitly so supabase-js validates it server-side via
  // /auth/v1/user rather than attempting a local JWT decode (which fails on
  // ES256-signed tokens with older jose versions bundled in the runtime).
  const { data: { user }, error: authError } = await userClient.auth.getUser(token)
  if (authError || !user) return errorResponse('Invalid token', 401)

  let body: { sessionId?: string; course?: string; storagePath?: string }
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid JSON body', 400)
  }

  const sessionId = body.sessionId?.trim()
  const course = body.course?.trim()
  const storagePath = body.storagePath?.trim()
  if (!sessionId || !course || !storagePath) {
    return errorResponse('sessionId, course, and storagePath are required', 400)
  }

  if (!VALID_COURSES.includes(course as Course)) {
    return errorResponse(`Invalid course. Must be one of: ${VALID_COURSES.join(', ')}`, 400)
  }

  // Verify the storage path belongs to this user (security check)
  // Path format: {sessionId}/{guestId}/{course}.jpg
  const pathParts = storagePath.split('/')
  if (pathParts.length < 3 || pathParts[1] !== user.id) {
    return errorResponse('Storage path does not match authenticated user', 403)
  }

  const serviceClient = createServiceClient()

  // Upsert — allows retake (replacing existing photo for same guest+course)
  const { data: photo, error: insertError } = await serviceClient
    .from('photos')
    .upsert(
      {
        session_id: sessionId,
        guest_id: user.id,
        course: course as Course,
        storage_path: storagePath,
      },
      { onConflict: 'guest_id,course,storage_path' }
    )
    .select()
    .single()

  if (insertError) return errorResponse(insertError.message)

  // Update the guest's current_card to reflect they've completed this course photo
  // (only update if it would advance them, not regress)
  const CARD_FOR_COURSE: Record<string, string> = {
    guest: 'welcome',
    pour: 'pour',
    bite: 'bite',
    cut: 'cut',
    finish: 'finish',
  }

  if (course !== 'booth' && CARD_FOR_COURSE[course]) {
    await serviceClient
      .from('guests')
      .update({ current_card: CARD_FOR_COURSE[course] })
      .eq('id', user.id)
      .eq('current_card', CARD_FOR_COURSE[course])
  }

  return jsonResponse({ photo })
})
