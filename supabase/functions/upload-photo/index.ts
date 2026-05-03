import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { createServiceClient, createUserClient } from '../_shared/supabase-client.ts'

const VALID_COURSES = ['guest', 'pour', 'bite', 'cut', 'finish', 'booth'] as const
type Course = (typeof VALID_COURSES)[number]

const BUCKET = 'photos'
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB — matches the bucket's file_size_limit
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/webp'])

/**
 * POST /functions/v1/upload-photo
 * Auth: Guest JWT (ES256 or HS256)
 * Body: multipart/form-data
 *   - file: binary image (image/jpeg or image/webp, ≤ 5MB)
 *   - sessionId: string
 *   - course: 'guest' | 'pour' | 'bite' | 'cut' | 'finish' | 'booth'
 *   - upsert: 'true' | 'false' (optional, default 'true')
 *   - filename: optional override for the final path segment
 *     (e.g. "booth_1713561234567.jpg"). If omitted, "{course}.jpg" is used.
 *
 * Why this exists:
 * Supabase Storage currently rejects ES256-signed user JWTs
 * ("Unsupported JWT algorithm ES256"). Uploading via the service role
 * client (HS256) sidesteps that, while we still authenticate the guest
 * via auth.getUser(token) and enforce path ownership server-side.
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

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return errorResponse('Expected multipart/form-data body', 400)
  }

  const file = form.get('file')
  const sessionId = (form.get('sessionId') ?? '').toString().trim()
  const course = (form.get('course') ?? '').toString().trim()
  const upsert = (form.get('upsert') ?? 'true').toString() !== 'false'
  const filenameOverride = (form.get('filename') ?? '').toString().trim()

  if (!(file instanceof File) && !(file instanceof Blob)) {
    return errorResponse('Missing "file" in form data', 400)
  }
  if (!sessionId || !course) {
    return errorResponse('sessionId and course are required', 400)
  }
  if (!VALID_COURSES.includes(course as Course)) {
    return errorResponse(`Invalid course. Must be one of: ${VALID_COURSES.join(', ')}`, 400)
  }

  const contentType = file.type || 'image/jpeg'
  if (!ALLOWED_TYPES.has(contentType)) {
    return errorResponse(`Unsupported content type: ${contentType}`, 415)
  }
  if (file.size > MAX_BYTES) {
    return errorResponse('File exceeds 5 MB limit', 413)
  }

  // Validate filename override — prevent path traversal / bucket escape.
  if (filenameOverride && !/^[A-Za-z0-9._-]+$/.test(filenameOverride)) {
    return errorResponse('Invalid filename', 400)
  }

  const finalName = filenameOverride || `${course}.jpg`
  const storagePath = `${sessionId}/${user.id}/${finalName}`

  const serviceClient = createServiceClient()

  const { error: uploadError } = await serviceClient
    .storage
    .from(BUCKET)
    .upload(storagePath, file, {
      contentType,
      upsert,
    })
  if (uploadError) {
    return errorResponse(`Storage upload failed: ${uploadError.message}`, 500)
  }

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

  if (insertError) {
    // FK violation means the guest row was deleted (e.g. after a session reset).
    // Return a clear message so the client can prompt re-check-in.
    if (insertError.code === '23503') {
      return errorResponse('Guest session expired. Please refresh and check in again.', 409)
    }
    return errorResponse(insertError.message)
  }

  // Advance the guest's current_card when they complete a course photo.
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

  return jsonResponse({ photo, storagePath })
})
