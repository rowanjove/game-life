import { describe, expect, it } from 'vitest'
import { createRun } from './factory'
import type { RewriteRun } from './model'
import { reduceRewriteRun, type ReducerDependencies } from './reducer'

const NOW = '2026-06-20T00:00:00.000Z'

function deps(): ReducerDependencies {
  let id = 0
  return {
    now: () => NOW,
    nextId: () => `result-${++id}`,
    pickOption: (options) => options.find((option) => option.id === 'year-growth-2')!,
  }
}

function enrolledRun(): RewriteRun {
  const base = createRun(42, NOW, 'run-1')
  return {
    ...base,
    character: {
      ...base.character,
      name: '林云深',
      birthYear: 5,
      currentYear: 11,
      level: 12,
      spiritCount: 1,
      spirits: [{
        id: 'tool-rusty-sword',
        name: '烂铁剑',
        category: 'tool',
        quality: '废',
        evolvedFrom: null,
        fusionIds: [],
      }],
      schoolRecords: [{
        tier: 'primary',
        schoolId: 'primary-holy-light',
        schoolName: '圣光初级学院',
        startYear: 11,
        endYear: null,
      }],
    },
    flow: { phase: 'primary-school', step: 'year-1', status: 'ready' },
  }
}

describe('year wheel narrative', () => {
  it('includes calendar, age and era-hero context in pending effects', () => {
    const animating = reduceRewriteRun(enrolledRun(), { type: 'START_WHEEL' }, deps())
    const pending = reduceRewriteRun(animating, { type: 'ANIMATION_FINISHED' }, deps())

    expect(pending.pending?.kind).toBe('wheel')
    if (pending.pending?.kind !== 'wheel') return
    expect(pending.pending.effects).toEqual(
      expect.arrayContaining([
        '灵元历 12 年',
        '你 7 岁',
        expect.stringMatching(/传奇正在/),
      ]),
    )
  })
})