import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { createServiceClient, createUserClient } from '../_shared/supabase-client.ts'

/**
 * POST /functions/v1/song-request
 * Auth: Guest JWT
 * Body: {
 *   sessionId: string
 *   songText: string
 *   spotifyTrackUri?: string   // e.g. "spotify:track:4iV5W9uYEdYUVa79Axb7Rh"
 *   spotifyTrackName?: string
 *   spotifyArtist?: string
 *   spotifyAlbumArt?: string
 * }
 *
 * Stores the song request in song_requests and, when a Spotify track URI is
 * provided, immediately adds it to the active playback queue.
 * Queue-add failures are non-fatal — the request is still persisted.
 */

async function getSpotifyAccessToken(): Promise<string | null> {
  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID')
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET')
  const refreshToken = Deno.env.get('SPOTIFY_REFRESH_TOKEN')
  if (!clientId || !clientSecret || !refreshToken) return null

  const basic = btoa(`${clientId}:${clientSecret}`)
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.access_token ?? null
}

async function addToQueue(trackUri: string): Promise<void> {
  const accessToken = await getSpotifyAccessToken()
  if (!accessToken) return

  await fetch(
    `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(trackUri)}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )
  // Failure is intentionally swallowed — request is already saved to DB.
}

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

  let body: {
    sessionId?: string
    songText?: string
    spotifyTrackUri?: string
    spotifyTrackName?: string
    spotifyArtist?: string
    spotifyAlbumArt?: string
  }
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid JSON body', 400)
  }

  const { sessionId, songText, spotifyTrackUri, spotifyTrackName, spotifyArtist, spotifyAlbumArt } = body
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
      spotify_track_uri: spotifyTrackUri ?? null,
      spotify_track_name: spotifyTrackName ?? null,
      spotify_artist_name: spotifyArtist ?? null,
      spotify_album_art: spotifyAlbumArt ?? null,
    })
    .select()
    .single()

  if (error) return errorResponse(error.message)

  // Best-effort queue add — fire-and-forget, does not block the response.
  if (spotifyTrackUri) {
    addToQueue(spotifyTrackUri).catch(() => { /* non-fatal */ })
  }

  return jsonResponse({ request })
})
