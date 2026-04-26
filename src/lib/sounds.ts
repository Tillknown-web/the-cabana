import type { CardId } from '@/types'

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return audioCtx
}

interface ChimeConfig {
  frequencies: number[]
  duration: number
  gain: number
}

const CHIME_CONFIGS: Partial<Record<CardId, ChimeConfig>> = {
  pour: {
    frequencies: [880, 1108, 1320],
    duration: 1.2,
    gain: 0.15,
  },
  bite: {
    frequencies: [660, 880, 1046],
    duration: 1.4,
    gain: 0.15,
  },
  cut: {
    frequencies: [440, 554, 659],
    duration: 1.6,
    gain: 0.18,
  },
  finish: {
    frequencies: [330, 415, 494, 622],
    duration: 2.0,
    gain: 0.2,
  },
  intermission1: {
    frequencies: [740, 880],
    duration: 0.8,
    gain: 0.1,
  },
  intermission2: {
    frequencies: [740, 880],
    duration: 0.8,
    gain: 0.1,
  },
  intermission3: {
    frequencies: [740, 880],
    duration: 0.8,
    gain: 0.1,
  },
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  peakGain: number,
  type: OscillatorType = 'sine'
): void {
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startTime)

  gainNode.gain.setValueAtTime(0, startTime)
  gainNode.gain.linearRampToValueAtTime(peakGain, startTime + 0.02)
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

  oscillator.start(startTime)
  oscillator.stop(startTime + duration)
}

export async function playCardChime(cardId: CardId): Promise<void> {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    const config = CHIME_CONFIGS[cardId]
    if (!config) return

    const now = ctx.currentTime
    config.frequencies.forEach((freq, i) => {
      playTone(ctx, freq, now + i * 0.12, config.duration, config.gain)
    })
  } catch {
    // Audio permissions denied or not supported — fail silently
  }
}

export async function playReactionSound(): Promise<void> {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') await ctx.resume()
    const now = ctx.currentTime
    playTone(ctx, 880, now, 0.3, 0.08)
    playTone(ctx, 1108, now + 0.06, 0.3, 0.06)
  } catch {
    // fail silently
  }
}

/** Call once on first user interaction to unlock audio context */
export function unlockAudio(): void {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') ctx.resume()
  } catch {
    // ignore
  }
}
