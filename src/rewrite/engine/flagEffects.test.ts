import { describe, expect, it } from 'vitest'
import { createRun } from './factory'
import { resolveDeferredFlags } from './flagEffects'

describe('deferred flag effects', () => {
  it('applies spirit evolution and removes the pending flag', () => {
    const run = createRun(3, '2026-06-20T00:00:00.000Z', 'run-1')
    const next = resolveDeferredFlags({
      ...run,
      character: {
        ...run.character,
        level: 40,
        flags: ['spirit-evolution-check'],
      },
    })

    expect(next.character.flags).not.toContain('spirit-evolution-check')
    expect(next.character.level).toBeGreaterThan(40)
    expect(next.character.titles).toContain('命器蜕变')
  })

  it('turns ascension preparation into an ascension choice', () => {
    const run = createRun(4, '2026-06-20T00:00:00.000Z', 'run-1')
    const next = resolveDeferredFlags({
      ...run,
      character: {
        ...run.character,
        flags: ['ascension-preparation'],
      },
    })

    expect(next.character.flags).toContain('ascension-choice')
    expect(next.character.flags).not.toContain('ascension-preparation')
  })
})