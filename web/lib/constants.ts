export const CARD_SEQUENCE = [
  'welcome',
  'pour',
  'intermission-1',
  'bite',
  'intermission-2',
  'cut',
  'intermission-3',
  'finish',
  'gallery',
] as const

export type Card = (typeof CARD_SEQUENCE)[number]

export const COURSE_CARDS = new Set<string>(['pour', 'bite', 'cut', 'finish'])
export const INTERMISSION_CARDS = new Set<string>(['intermission-1', 'intermission-2', 'intermission-3'])

export const COURSE_DATA: Record<string, { label: string; dish: string; ingredients: string }> = {
  pour: { label: 'The Pour', dish: 'Sunset Spritz', ingredients: 'mango · pineapple · tajín' },
  bite: { label: 'The Bite', dish: 'Slider Trio', ingredients: 'three sauces · slaw · brioche' },
  cut: { label: 'The Cut', dish: 'Steak, tableside', ingredients: 'compound butter · truffle fries' },
  finish: { label: 'The Finish', dish: '???', ingredients: 'something sweet' },
}

export const COURSE_COURSE_LABELS: Record<string, string> = {
  guest: 'Arrival',
  pour: 'The Pour',
  bite: 'The Bite',
  cut: 'The Cut',
  finish: 'The Finish',
  booth: 'Photo Booth',
}

// Brand colors
export const C = {
  aubergine: '#2D1B47',
  gold: '#D4AF37',
  cream: '#F5F0E8',
  poolBlue: '#A8C5DA',
  nearBlack: '#1A1A2E',
} as const
