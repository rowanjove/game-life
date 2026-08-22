import { describe, expect, it } from 'vitest'
import { createRun } from './factory'
import { createSeededRng } from './rng'

describe('rewrite foundation', () => {
  it('replays the same random sequence from the same seed and cursor', () => {
    const first = createSeededRng(42, 0)
    const second = createSeededRng(42, 0)

    expect([first.next(), first.next(), first.next()])
      .toEqual([second.next(), second.next(), second.next()])
  })

  it('resumes a random sequence from its saved cursor', () => {
    const original = createSeededRng(42, 0)
    original.next()
    original.next()
    const resumed = createSeededRng(42, original.cursor())

    expect(resumed.next()).toBe(original.next())
  })

  it('creates a run directly at identity without a save slot', () => {
    const run = createRun(42, '2026-06-20T00:00:00.000Z')

    expect(run.flow).toEqual({
      phase: 'creation',
      step: 'identity',
      status: 'ready',
    })
    expect(run.pending).toBeNull()
    expect(run.character.level).toBe(0)
    expect(run.character.spiritCount).toBe(0)
  })
})
