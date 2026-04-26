import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const photo = formData.get('photo') as File | null
    const sessionId = formData.get('sessionId') as string
    const guestId = formData.get('guestId') as string
    const course = formData.get('course') as string

    if (!photo || !sessionId || !guestId || !course) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Build storage path
    const timestamp = Date.now()
    const storagePath = course === 'booth'
      ? `session/${sessionId}/photos/${guestId}/booth_${timestamp}.jpg`
      : `session/${sessionId}/photos/${guestId}/${course}.jpg`

    // Upload to Supabase Storage
    const arrayBuffer = await photo.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('cabana-photos')
      .upload(storagePath, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Save metadata to DB
    const { data: photoRecord, error: dbError } = await supabase
      .from('photos')
      .insert({
        id: crypto.randomUUID(),
        session_id: sessionId,
        guest_id: guestId,
        course,
        storage_path: storagePath,
      })
      .select('id')
      .single()

    if (dbError) {
      return NextResponse.json({ error: 'DB insert failed' }, { status: 500 })
    }

    return NextResponse.json({ photoId: photoRecord.id, storagePath })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
