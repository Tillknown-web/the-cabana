export const CARD_SEQUENCE = [
  'welcome',
  'pour',
  'intermission-1',
  'bite',
  'intermission-2',
  'cleanse',
  'agua',
  'intermission-3',
  'cut',
  'intermission-4',
  'finish',
  'gallery',
] as const

export type Card = (typeof CARD_SEQUENCE)[number]

export const COURSE_CARDS = new Set<string>(['pour', 'bite', 'cleanse', 'agua', 'cut', 'finish'])
export const INTERMISSION_CARDS = new Set<string>(['intermission-1', 'intermission-2', 'intermission-3', 'intermission-4'])

export const COURSE_DATA: Record<string, { label: string; dish: string; ingredients: string }> = {
  pour:    { label: 'The Opening Pour', dish: 'Elixir Vert',        ingredients: 'lemon · fresh mint · sparkling water · citrus zest' },
  bite:    { label: 'The First Bite',   dish: 'The Gathering',      ingredients: 'crispy chicken bites · mac & cheese gratin · honey bbq · honey mustard' },
  cleanse: { label: 'The Cleanse',      dish: "Sorbetto d'Arancia", ingredients: 'orange sherbet · citrus zest' },
  agua:    { label: 'The Refresh',      dish: 'Melon Meridian',     ingredients: 'fresh watermelon · citrus · house agua fresca' },
  cut:     { label: 'The Cut',          dish: 'Le Grand Festin',    ingredients: 'prime steak · tableside compound butter · truffle frites · cheese sauce' },
  finish:  { label: 'The Finish',       dish: "L'Or Fondu",         ingredients: 'caramel brownie · vanilla ice cream · edible gold' },
}

export const COURSE_COURSE_LABELS: Record<string, string> = {
  guest:   'Arrival',
  pour:    'The Opening Pour',
  bite:    'The First Bite',
  cleanse: 'The Cleanse',
  agua:    'The Refresh',
  cut:     'The Cut',
  finish:  'The Finish',
  booth:   'Photo Booth',
}

// Brand colors
export const C = {
  aubergine: '#2D1B47',
  gold: '#D4AF37',
  cream: '#F5F0E8',
  poolBlue: '#A8C5DA',
  nearBlack: '#1A1A2E',
} as const
