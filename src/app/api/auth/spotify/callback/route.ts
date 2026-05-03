import { NextRequest, NextResponse } from 'next/server'

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!
const REDIRECT_URI = 'https://the-cabana-henna.vercel.app/api/auth/spotify/callback'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return new NextResponse(
      `<html><body style="font-family:monospace;padding:40px;background:#0f0f14;color:#e0e0e0">
        <h2 style="color:#f87171">Auth error: ${error ?? 'no code returned'}</h2>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }

  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }),
  })

  if (!tokenRes.ok) {
    const text = await tokenRes.text()
    return new NextResponse(
      `<html><body style="font-family:monospace;padding:40px;background:#0f0f14;color:#e0e0e0">
        <h2 style="color:#f87171">Token exchange failed</h2>
        <pre>${text}</pre>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }

  const data = await tokenRes.json()
  const refreshToken = data.refresh_token

  return new NextResponse(
    `<html><body style="font-family:monospace;padding:40px;background:#0f0f14;color:#e0e0e0;max-width:700px;margin:0 auto">
      <h2 style="color:#D4AF37">Your Spotify Refresh Token</h2>
      <p style="color:#888;margin-bottom:8px">Copy this and set it as <code style="color:#A8C5DA">SPOTIFY_REFRESH_TOKEN</code> in your Vercel environment variables and local <code style="color:#A8C5DA">.env.local</code>.</p>
      <div style="background:#1a1a24;border:1px solid #333;border-radius:6px;padding:16px;word-break:break-all;color:#4ade80;font-size:14px;margin-bottom:24px">${refreshToken}</div>
      <p style="color:#555;font-size:12px">You can remove the <code>/api/auth/spotify/callback</code> route from your app after saving the token.</p>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
