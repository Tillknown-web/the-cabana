import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'kitchen') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  const envCheck = {
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    hasRefreshToken: !!refreshToken,
    clientIdPrefix: clientId?.slice(0, 6) ?? null,
    refreshTokenPrefix: refreshToken?.slice(0, 10) ?? null,
  }

  if (!refreshToken || !clientId || !clientSecret) {
    return NextResponse.json({ step: 'env', ok: false, envCheck })
  }

  // Step 1: exchange refresh token for access token
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const tokenRes = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!tokenRes.ok) {
    const body = await tokenRes.text()
    return NextResponse.json({
      step: 'token_exchange',
      ok: false,
      status: tokenRes.status,
      spotifyError: body,
      envCheck,
    })
  }

  const tokenData = await tokenRes.json()
  const accessToken: string = tokenData.access_token
  const scopes: string = tokenData.scope ?? '(no scope returned)'

  // Step 2: call /me/playlists
  const playlistRes = await fetch(`${SPOTIFY_BASE_URL}/me/playlists?limit=5`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!playlistRes.ok) {
    const body = await playlistRes.text()
    return NextResponse.json({
      step: 'playlists_fetch',
      ok: false,
      status: playlistRes.status,
      spotifyError: body,
      scopes,
      envCheck,
    })
  }

  const playlistData = await playlistRes.json()

  return NextResponse.json({
    step: 'done',
    ok: true,
    scopes,
    totalPlaylists: playlistData.total,
    firstFive: (playlistData.items ?? []).map((p: { name: string; id: string }) => ({ name: p.name, id: p.id })),
    envCheck,
  })
}
