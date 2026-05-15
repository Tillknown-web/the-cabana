'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { COURSE_COURSE_LABELS } from '@/lib/constants'

export interface PartnerPhoto {
  id: string
  url: string
  course: string
  guestName: string
  createdAt: string
}

interface GalleryResponse {
  session: { session_id: string; event_date: string }
  guests: { id: string; name: string }[]
  sections: Record<
    string,
    Array<{
      id: string
      course: string
      signed_url: string | null
      created_at: string
      guest: { id: string; name: string } | null
    }>
  >
}

interface UsePartnerPhotosResult {
  partnerPhotos: Record<string, PartnerPhoto>
  latestArrival: PartnerPhoto | null
}

/**
 * Watches public.photos for partner uploads in the active session and exposes:
 *   - partnerPhotos: latest partner photo per course (keyed by `course`)
 *   - latestArrival: the most recently received partner photo (for toast animation)
 *
 * Signed URLs are resolved via the `gallery` Edge Function (service role) since
 * storage RLS only permits guests to read their own folder. On each realtime
 * INSERT/UPDATE from the partner, the gallery is refetched so URLs stay valid.
 */
export function usePartnerPhotos(
  sessionId: string,
  selfGuestId: string | undefined
): UsePartnerPhotosResult {
  const [partnerPhotos, setPartnerPhotos] = useState<Record<string, PartnerPhoto>>({})
  const [latestArrival, setLatestArrival] = useState<PartnerPhoto | null>(null)
  const lastSeenCreatedAtRef = useRef<string>('')

  const refresh = useCallback(
    async (opts?: { announceNew?: boolean }) => {
      if (!sessionId || !selfGuestId) return
      try {
        const url = new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/gallery`)
        url.searchParams.set('sessionId', sessionId)
        const res = await fetch(url.toString(), {
          cache: 'no-store',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        })
        if (!res.ok) return
        const data = (await res.json()) as GalleryResponse

        const nextMap: Record<string, PartnerPhoto> = {}
        let newest: PartnerPhoto | null = null

        for (const sectionKey of Object.keys(data.sections)) {
          const rows = data.sections[sectionKey] ?? []
          for (const row of rows) {
            if (!row.guest || row.guest.id === selfGuestId) continue
            if (!row.signed_url) continue
            const entry: PartnerPhoto = {
              id: row.id,
              url: row.signed_url,
              course: row.course,
              guestName: row.guest.name,
              createdAt: row.created_at,
            }
            const existing = nextMap[row.course]
            if (!existing || existing.createdAt < entry.createdAt) {
              nextMap[row.course] = entry
            }
            if (!newest || newest.createdAt < entry.createdAt) {
              newest = entry
            }
          }
        }

        setPartnerPhotos(nextMap)

        if (
          opts?.announceNew &&
          newest &&
          newest.createdAt > lastSeenCreatedAtRef.current
        ) {
          setLatestArrival(newest)
        }
        if (newest && newest.createdAt > lastSeenCreatedAtRef.current) {
          lastSeenCreatedAtRef.current = newest.createdAt
        }
      } catch {
        /* silent — keep last known good state */
      }
    },
    [sessionId, selfGuestId]
  )

  useEffect(() => {
    if (!sessionId || !selfGuestId) return
    let cancelled = false
    // Initial fetch — do NOT announce arrivals already on disk before mount,
    // otherwise the toast would fire for old photos on every page load.
    ;(async () => {
      await refresh({ announceNew: false })
      if (cancelled) return
    })()

    const supabase = createClient()
    const channel = supabase
      .channel(`exp-partner-photos-${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'photos', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const row = payload.new as { guest_id?: string } | null
          if (!row || row.guest_id === selfGuestId) return
          void refresh({ announceNew: true })
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'photos', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const row = payload.new as { guest_id?: string } | null
          if (!row || row.guest_id === selfGuestId) return
          // Retake — refresh URLs but don't fire the toast a second time.
          void refresh({ announceNew: false })
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [sessionId, selfGuestId, refresh])

  return { partnerPhotos, latestArrival }
}

/** Pretty course label for use in toasts / captions. Falls back to the raw key. */
export function courseLabel(course: string): string {
  return COURSE_COURSE_LABELS[course] ?? course
}
