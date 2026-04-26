import { Metadata } from 'next'
import GalleryView from './GalleryView'

export const metadata: Metadata = {
  title: 'The Cabana — Gallery',
  description: 'poolside, after dark',
}

export default async function GalleryPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  return <GalleryView sessionId={sessionId} />
}
