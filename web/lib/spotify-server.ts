const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1'

export interface SpotifyPlaylist {
  id: string
  name: string
  image: string | null
  url: string
}

export interface SpotifyQueueTrack {
  track: string
  artist: string
  album_art: string | null
}

export interface SpotifyContext {
  playlist: SpotifyPlaylist | null
  queue: SpotifyQueueTrack[]
}

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

async function getPlaylist(playlistId: string, accessToken: string): Promise<SpotifyPlaylist | null> {
  const res = await fetch(
    `${SPOTIFY_BASE_URL}/playlists/${playlistId}?fields=id,name,images,external_urls`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) return null
  const data = await res.json()
  return {
    id: data.id,
    name: data.name,
    image: (data.images?.[0]?.url as string) ?? null,
    url: data.external_urls?.spotify ?? `https://open.spotify.com/playlist/${data.id}`,
  }
}

async function getPlayerQueue(accessToken: string): Promise<SpotifyQueueTrack[]> {
  const res = await fetch(`${SPOTIFY_BASE_URL}/me/player/queue`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return []
  const data = await res.json()
  const items = (data.queue as { name: string; artists: { name: string }[]; album: { images: { url: string }[] } }[]) ?? []
  return items.slice(0, 5).map((item) => ({
    track: item.name,
    artist: item.artists.map((a) => a.name).join(', '),
    album_art: item.album?.images?.[0]?.url ?? null,
  }))
}

export async function getNowPlayingContext(): Promise<SpotifyContext | null> {
  const accessToken = await getSpotifyAccessToken()
  if (!accessToken) return null

  const res = await fetch(`${SPOTIFY_BASE_URL}/me/player/currently-playing`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (res.status === 204 || !res.ok) return null
  const data = await res.json()
  if (!data.item) return null

  const playlistId =
    data.context?.type === 'playlist'
      ? (data.context.uri as string).split(':').pop() ?? null
      : null

  const [playlist, queue] = await Promise.all([
    playlistId ? getPlaylist(playlistId, accessToken) : Promise.resolve(null),
    getPlayerQueue(accessToken),
  ])

  return { playlist, queue }
}

export async function getUserPlaylists(): Promise<SpotifyPlaylist[]> {
  const accessToken = await getSpotifyAccessToken()
  if (!accessToken) return []

  const res = await fetch(`${SPOTIFY_BASE_URL}/me/playlists?limit=20`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return []
  const data = await res.json()
  const items = (data.items as { id: string; name: string; images: { url: string }[]; external_urls: { spotify: string } }[]) ?? []
  return items.map((p) => ({
    id: p.id,
    name: p.name,
    image: p.images?.[0]?.url ?? null,
    url: p.external_urls?.spotify ?? `https://open.spotify.com/playlist/${p.id}`,
  }))
}

export async function switchPlaylist(playlistId: string): Promise<boolean> {
  const accessToken = await getSpotifyAccessToken()
  if (!accessToken) return false

  const res = await fetch(`${SPOTIFY_BASE_URL}/me/player/play`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ context_uri: `spotify:playlist:${playlistId}` }),
  })

  return res.ok || res.status === 204
}
