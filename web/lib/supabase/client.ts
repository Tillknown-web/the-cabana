'use client'

import { createBrowserClient } from '@supabase/ssr'

let cachedTabId: string | null = null

/**
 * Per-tab auth cookie name. All tabs of the same browser profile (including
 * every incognito tab in the same incognito session) share cookies, so the
 * default `sb-...` cookie name causes the second guest's `signInAnonymously()`
 * to clobber the first guest's auth token. The result is that both tabs end
 * up uploading photos as the same `auth.uid()` and only one row per course
 * lands in `public.photos`.
 *
 * `sessionStorage` is genuinely isolated per tab — even between incognito
 * tabs of the same incognito session — so we use it to mint a stable per-tab
 * id that suffixes the cookie name. Each tab then reads/writes its own
 * Supabase auth cookie and the two guests stay distinct.
 */
function getTabAuthCookieName(): string {
  if (typeof window === 'undefined') return 'sb-cabana'
  if (!cachedTabId) {
    const KEY = 'cabana:tab-id'
    cachedTabId = window.sessionStorage.getItem(KEY)
    if (!cachedTabId) {
      cachedTabId = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)).replace(/-/g, '')
      window.sessionStorage.setItem(KEY, cachedTabId)
    }
  }
  return `sb-cabana-${cachedTabId}`
}

/** Browser-only Supabase client. Use in Client Components. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookieOptions: { name: getTabAuthCookieName() } }
  )
}
