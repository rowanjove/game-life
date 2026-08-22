import { describe, expect, it } from 'vitest'
import { createRun } from './factory'
import type { RewriteRun } from './model'
import {
  creationWheelOptions,
  spiritCountOptions,
  spiritOptions,
} from './creation'
import { reduceRewriteRun, type ReducerDependencies } from './reducer'

const NOW = '2026-06-20T00:00:00.000Z'

function dependencies(optionId?: string): ReducerDependencies {
  return {
    now: () => NOW,
    nextId: () => 'result-1',
    pickOption: (options) =>
      options.find((option) => option.id === optionId) ?? options[0],
  }
}

function confirmWheel(
  run: RewriteRun,
  optionId: string,
): RewriteRun {
  const animating = reduceRewriteRun(run, { type: 'START_WHEEL' }, dependencies(optionId))
  const stopped = reduceRewriteRun(animating, { type: 'ANIMATION_FINISHED' }, dependencies())
  return reduceRewriteRun(stopped, { type: 'CONFIRM_RESULT' }, dependencies())
}

describe('rewrite character creation', () => {
  it('uses a restrained mixed pastel palette for non-semantic creation wheels', () => {
    const run = createRun(42, NOW, 'run-1')
    run.flow = { phase: 'creation', step: 'looks', status: 'ready' }

    const colors = new Set(creationWheelOptions(run).map((option) => option.color))

    expect(colors.size).toBeGreaterThanOrEqual(4)
  })

  it('supports one through four spirits with decreasing weights', () => {
    expect(spiritCountOptions()).toEqual([
      expect.objectContaining({ value: 1, weight: 68 }),
      expect.objectContaining({ value: 2, weight: 25 }),
      expect.objectContaining({ value: 3, weight: 6 }),
      expect.objectContaining({ value: 4, weight: 1 }),
    ])
  })

  it('never returns a concrete spirit already owned by the current life', () => {
    const base = createRun(42, NOW, 'run-1')
    const owned = spiritOptions(base, 'tool')[0].value
    const run: RewriteRun = {
      ...base,
      character: {
        ...base.character,
        spiritCount: 2,
        spirits: [owned],
      },
    }

    expect(spiritOptions(run, 'tool').some((option) => option.id === owned.id)).toBe(false)
  })

  it('moves from identity into the first wheel using only male or female', () => {
    const run = reduceRewriteRun(
      createRun(42, NOW, 'run-1'),
      { type: 'CONFIRM_IDENTITY', name: '林云深', gender: 'male' },
      dependencies(),
    )

    expect(run.character).toMatchObject({ name: '林云深', gender: 'male' })
    expect(run.flow).toEqual({ phase: 'creation', step: 'looks', status: 'ready' })
  })

  it('builds four unique spirits through repeated category and spirit wheels', () => {
    let run = reduceRewriteRun(
      createRun(42, NOW, 'run-1'),
      { type: 'CONFIRM_IDENTITY', name: '林云深', gender: 'male' },
      dependencies(),
    )
    run = confirmWheel(run, 'looks-8')
    run = confirmWheel(run, 'timeline-childhood')
    run = confirmWheel(run, 'birth-heaven-city')
    run = confirmWheel(run, 'race-human')
    run = confirmWheel(run, 'spirit-count-4')

    for (let index = 0; index < 4; index += 1) {
      run = confirmWheel(run, 'category-tool')
      const available = creationWheelOptions(run)
      const option = available.find((candidate) =>
        !run.character.spirits.some((spirit) => spirit.id === candidate.id),
      )!
      run = confirmWheel(run, option.id)
    }

    expect(run.character.spirits).toHaveLength(4)
    expect(new Set(run.character.spirits.map((spirit) => spirit.id)).size).toBe(4)
    expect(run.flow.step).toBe('innate-power')
  })
})

