import { createServiceClient } from '../_shared/supabase-client.ts'

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing'

/**
 * Scheduled Edge Function — runs every ~10-15 seconds via Supabase cron
 * (configured in supabase/config.toml or via the dashboard).
 *
 * Also callable manually: GET /functions/v1/spotify-poll
 *
 * Flow:
 * 1. Use the stored refresh token to get a fresh access token from Spotify
 * 2. Call the Spotify "currently playing" endpoint
 * 3. Update spotify_cache for all active sessions
 *
 * Required env vars (set via `supabase secrets set`):
 *   SPOTIFY_CLIENT_ID
 *   SPOTIFY_CLIENT_SECRET
 *   SPOTIFY_REFRESH_TOKEN
 *   ACTIVE_SESSION_ID (the current event session, e.g. "2026-july")
 */
Deno.serve(async (_req) => {
  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID')
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET')
  const refreshToken = Deno.env.get('SPOTIFY_REFRESH_TOKEN')
  const sessionId = Deno.env.get('ACTIVE_SESSION_ID')

  if (!clientId || !clientSecret || !refreshToken || !sessionId) {
    console.error('Missing Spotify env vars — skipping poll')
    return new Response(JSON.stringify({ error: 'Missing Spotify configuration' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // Step 1: Refresh the access token
    const credentials = btoa(`${clientId}:${clientSecret}`)
    const tokenRes = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      console.error('Spotify token refresh failed:', err)
      return new Response(JSON.stringify({ error: 'Token refresh failed' }), { status: 502 })
    }

    const { access_token } = await tokenRes.json()

    // Step 2: Fetch currently playing
    const nowPlayingRes = await fetch(SPOTIFY_NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    // 204 = nothing playing, 200 = track data available
    if (nowPlayingRes.status === 204) {
      // Nothing playing — clear the cache but keep the row
      const serviceClient = createServiceClient()
      await serviceClient
        .from('spotify_cache')
        .update({ track: null, artist: null, album_art_url: null, updated_at: new Date().toISOString() })
        .eq('session_id', sessionId)

      return new Response(JSON.stringify({ ok: true, playing: false }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!nowPlayingRes.ok) {
      console.error('Spotify now-playing fetch failed:', nowPlayingRes.status)
      return new Response(JSON.stringify({ error: 'Now-playing fetch failed' }), { status: 502 })
    }

    const data = await nowPlayingRes.json()

    const track = data.item?.name ?? null
    const artist = data.item?.artists?.map((a: { name: string }) => a.name).join(', ') ?? null
    const albumArtUrl = data.item?.album?.images?.[1]?.url ?? data.item?.album?.images?.[0]?.url ?? null

    // Step 3: Update the cache
    const serviceClient = createServiceClient()
    await serviceClient
      .from('spotify_cache')
      .upsert(
        { session_id: sessionId, track, artist, album_art_url: albumArtUrl, updated_at: new Date().toISOString() },
        { onConflict: 'session_id' }
      )

    return new Response(JSON.stringify({ ok: true, playing: true, track, artist }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('spotify-poll error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
