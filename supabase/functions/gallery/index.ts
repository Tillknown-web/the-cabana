import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase-client.ts'

const COURSE_ORDER = ['guest', 'pour', 'bite', 'cut', 'finish', 'booth'] as const
type Course = (typeof COURSE_ORDER)[number]

const SIGNED_URL_EXPIRY_SECONDS = 3600 // 1 hour

/**
 * GET /functions/v1/gallery?sessionId={id}
 * Auth: None required — anyone with the sessionId can view (public gallery link).
 *
 * Returns all photos for a session grouped by course, with:
 * - 1-hour signed URLs for each photo
 * - Guest name for each photo
 * - Reaction (if any) received on each photo
 *
 * Response shape:
 * {
 *   session: { session_id, event_date },
 *   guests: [{ id, name }],
 *   sections: {
 *     guest: [{ photo, guest, reaction }],
 *     pour: [...],
 *     ...
 *   }
 * }
 */
Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'GET') return errorResponse('Method not allowed', 405)

  const url = new URL(req.url)
  const sessionId = url.searchParams.get('sessionId')
  if (!sessionId) return errorResponse('sessionId query param is required', 400)

  const serviceClient = createServiceClient()

  // Fetch session metadata
  const { data: session, error: sessionError } = await serviceClient
    .from('sessions')
    .select('session_id, event_date')
    .eq('session_id', sessionId)
    .single()

  if (sessionError || !session) return errorResponse('Session not found', 404)

  // Fetch all guests in the session
  const { data: guests, error: guestsError } = await serviceClient
    .from('guests')
    .select('id, name')
    .eq('session_id', sessionId)

  if (guestsError) return errorResponse(guestsError.message)

  // Fetch all photos with their reactions
  const { data: photos, error: photosError } = await serviceClient
    .from('photos')
    .select(`
      id,
      guest_id,
      course,
      storage_path,
      created_at,
      reactions (
        id,
        from_guest_id,
        reaction_type
      )
    `)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (photosError) return errorResponse(photosError.message)

  // Generate signed URLs for all photos in parallel
  const photosWithUrls = await Promise.all(
    (photos ?? []).map(async (photo) => {
      const { data: signedData, error: signError } = await serviceClient.storage
        .from('photos')
        .createSignedUrl(photo.storage_path, SIGNED_URL_EXPIRY_SECONDS)

      const signedUrl = signError ? null : signedData?.signedUrl

      const guest = (guests ?? []).find((g) => g.id === photo.guest_id)

      // A photo gets at most one reaction (from the other guest)
      const reaction = (photo.reactions as { id: string; from_guest_id: string; reaction_type: string }[])?.[0] ?? null

      return {
        id: photo.id,
        course: photo.course as Course,
        storage_path: photo.storage_path,
        signed_url: signedUrl,
        created_at: photo.created_at,
        guest: guest ?? null,
        reaction,
      }
    })
  )

  // Group by course in the defined order
  const sections: Record<string, typeof photosWithUrls> = {}
  for (const course of COURSE_ORDER) {
    const coursePosts = photosWithUrls.filter((p) => p.course === course)
    if (coursePosts.length > 0) {
      sections[course] = coursePosts
    }
  }

  return jsonResponse({
    session,
    guests: guests ?? [],
    sections,
  })
})
