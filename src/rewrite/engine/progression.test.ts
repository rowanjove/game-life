import { describe, expect, it } from 'vitest'
import { createRun } from './factory'
import { applyLevelChange, normalizeLevel } from './progression'
import { selectAge } from './selectors'

describe('integer progression', () => {
  it('rounds every level change to an integer and clamps it', () => {
    const base = createRun(42, '2026-06-20T00:00:00.000Z', 'run-1').character
    const character = { ...base, level: 25, birthYear: 2630, currentYear: 2642 }

    expect(applyLevelChange(character, 10.7).level).toBe(36)
    expect(normalizeLevel(-3)).toBe(0)
    expect(normalizeLevel(120)).toBe(100)
    expect(normalizeLevel(120, 130)).toBe(120)
    expect(
      applyLevelChange({ ...character, maxLevel: 110 }, 10).level,
    ).toBe(35)
    expect(selectAge(character)).toBe(12)
  })
})

