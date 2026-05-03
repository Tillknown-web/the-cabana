export type CardId =
  | 'checkin'
  | 'welcome'
  | 'pour'
  | 'intermission1'
  | 'bite'
  | 'intermission2'
  | 'cut'
  | 'intermission3'
  | 'finish'
  | 'gallery'

export type CardStatus = 'locked' | 'live' | 'completed' | 'skipped'

export type ReactionType = 'fire' | 'heart' | 'chefs_kiss'

export type CourseId = 'guest' | 'pour' | 'bite' | 'cut' | 'finish' | 'booth'

export interface Guest {
  id: string
  session_id: string
  name: string
  current_card: CardId
  checked_in_at: string
}

export interface Session {
  id: string
  current_card: CardId
  released_cards: CardId[]
  countdown_card: CardId | null
  countdown_expires_at: string | null
  created_at: string
}

export interface Photo {
  id: string
  session_id: string
  guest_id: string
  course: CourseId
  storage_path: string
  created_at: string
  guest_name?: string
  signed_url?: string
}

export interface Reaction {
  id: string
  session_id: string
  from_guest_id: string
  to_photo_id: string
  reaction_type: ReactionType
  created_at: string
}

export interface SongRequest {
  id: string
  session_id: string
  guest_id: string
  song_text: string
  seen: boolean
  created_at: string
  guest_name?: string
}

export interface ChefNote {
  id: string
  session_id: string
  message: string
  created_at: string
}

export interface SpotifyTrack {
  track: string
  artist: string
  album_art: string | null
  updated_at: string
}

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

export interface SpotifyNowPlayingFull extends SpotifyTrack {
  playlist: SpotifyPlaylist | null
  queue: SpotifyQueueTrack[]
}

export interface SessionState {
  currentCard: CardId
  releasedCards: CardId[]
  countdown: {
    card: CardId
    expiresAt: string
  } | null
  tableside: {
    trigger: string
    firedAt: string
  } | null
  chefNote: {
    message: string
    sentAt: string
  } | null
}

export interface GuestState {
  guest: Guest
  session: Session
  photos: Record<CourseId, boolean>
}

// Ordered card sequence
export const CARD_SEQUENCE: CardId[] = [
  'checkin',
  'welcome',
  'pour',
  'intermission1',
  'bite',
  'intermission2',
  'cut',
  'intermission3',
  'finish',
  'gallery',
]

export const COURSE_CARDS: CardId[] = ['pour', 'bite', 'cut', 'finish']

export const INTERMISSION_CARDS: CardId[] = ['intermission1', 'intermission2', 'intermission3']

export const CARD_LABELS: Record<CardId, string> = {
  checkin: 'Check-in',
  welcome: 'Welcome',
  pour: 'The Pour',
  intermission1: 'Intermission 1',
  bite: 'The Bite',
  intermission2: 'Intermission 2',
  cut: 'The Cut',
  intermission3: 'Intermission 3',
  finish: 'The Finish',
  gallery: 'Gallery',
}

export const COURSE_TO_LABEL: Record<CourseId, string> = {
  guest: 'the guests',
  pour: 'the pour',
  bite: 'the bite',
  cut: 'the cut',
  finish: 'the finish',
  booth: 'the booth',
}
