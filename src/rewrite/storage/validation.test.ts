import { describe, expect, it } from 'vitest'
import { createRun } from '../engine/factory'
import { validateRun } from './validation'

const NOW = '2026-06-20T00:00:00.000Z'

describe('rewrite run validation', () => {
  it('accepts a fresh run', () => {
    expect(validateRun(createRun(42, NOW, 'run-1')).ok).toBe(true)
  })

  it('rejects fractional levels and mismatched spirit counts', () => {
    const run = createRun(42, NOW, 'run-1')
    expect(validateRun({
      ...run,
      character: { ...run.character, level: 10.5 },
    }).ok).toBe(false)
    expect(validateRun({
      ...run,
      character: { ...run.character, spiritCount: 2, spirits: [] },
    }).ok).toBe(false)
  })

  it('normalizes legacy character fields on load', () => {
    const run = createRun(42, NOW, 'run-1')
    const legacy = {
      ...run,
      character: {
        ...run.character,
        relationships: undefined,
        flags: undefined,
        titles: undefined,
        schoolRecords: undefined,
        growthMultiplier: undefined,
      },
    }
    const result = validateRun(legacy)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.run.character.relationships.reputation).toBe(0)
    expect(result.run.character.flags).toEqual([])
    expect(result.run.character.schoolRecords).toEqual([])
    expect(result.run.character.growthMultiplier).toBe(1)
  })

  it('rejects non-increasing rings and pending statuses without results', () => {
    const run = createRun(42, NOW, 'run-1')
    expect(validateRun({
      ...run,
      character: {
        ...run.character,
        soulRings: [
          {
            id: 'ring-1',
            index: 1,
            years: 500,
            quality: 'yellow',
            skillName: '第一魂技',
            description: '',
          },
          {
            id: 'ring-2',
            index: 2,
            years: 400,
            quality: 'yellow',
            skillName: '第二魂技',
            description: '',
          },
        ],
      },
    }).ok).toBe(false)
    expect(validateRun({
      ...run,
      flow: { ...run.flow, status: 'result-pending' },
    }).ok).toBe(false)
  })
})

it('allows spirits to be filled progressively only during creation', () => {
  const creating = createRun(42, NOW, 'run-1')
  creating.character.spiritCount = 4
  creating.flow = { phase: 'creation', step: 'spirit-1-category', status: 'ready' }

  expect(validateRun(creating).ok).toBe(true)

  const escaped = {
    ...creating,
    flow: { phase: 'primary-school' as const, step: 'school-selection', status: 'ready' as const },
  }
  expect(validateRun(escaped).ok).toBe(false)
})
