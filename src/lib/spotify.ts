const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing'

export async function getSpotifyAccessToken(): Promise<string | null> {
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!refreshToken || !clientId || !clientSecret) return null

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch(SPOTIFY_TOKEN_URL, {
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

  if (!res.ok) return null
  const data = await res.json()
  return data.access_token ?? null
}

export async function getNowPlaying() {
  const accessToken = await getSpotifyAccessToken()
  if (!accessToken) return null

  const res = await fetch(SPOTIFY_NOW_PLAYING_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (res.status === 204 || !res.ok) return null

  const data = await res.json()
  if (!data.item) return null

  return {
    track: data.item.name as string,
    artist: (data.item.artists as { name: string }[]).map((a) => a.name).join(', '),
    album_art: (data.item.album?.images?.[0]?.url as string) ?? null,
    updated_at: new Date().toISOString(),
  }
}
