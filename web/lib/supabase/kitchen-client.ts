'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser-only Supabase client scoped to the kitchen.
 * Uses a separate cookie name ('sb-kitchen') so the kitchen sign-in session
 * never overwrites the anonymous guest session that experience guests rely on.
 */
export function createKitchenClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookieOptions: { name: 'sb-kitchen' } }
  )
}
