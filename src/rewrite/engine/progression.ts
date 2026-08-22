import type { RewriteCharacter } from './model'
import { adjustLevelDelta, growthAmount } from './talents'

export const DEFAULT_MAX_LEVEL = 100
export const ABSOLUTE_MAX_LEVEL = 150

export function normalizeLevel(
  value: number,
  max: number = DEFAULT_MAX_LEVEL,
): number {
  return Math.max(0, Math.min(max, Math.round(value)))
}

export function applyLevelChange(
  character: RewriteCharacter,
  delta: number,
  source: 'default' | 'hero' | 'contest' = 'default',
): RewriteCharacter {
  const maxLevel = character.maxLevel ?? DEFAULT_MAX_LEVEL
  const change = delta > 0 && source === 'default'
    ? growthAmount(character, delta)
    : adjustLevelDelta(character, delta, source)
  return {
    ...character,
    maxLevel,
    level: normalizeLevel(character.level + change, maxLevel),
  }
}

