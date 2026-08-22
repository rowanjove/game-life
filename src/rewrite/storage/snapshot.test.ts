import { describe, expect, it } from 'vitest'
import { createRun } from '../engine/factory'
import { captureStableSnapshot } from './snapshot'

const NOW = '2026-06-20T00:00:00.000Z'

describe('stable snapshot capture', () => {
  it('stores a recoverable snapshot after a settled run state', () => {
    const run = createRun(42, NOW, 'run-1')
    const settled = {
      ...run,
      character: { ...run.character, name: '林云深', gender: 'male' as const },
      flow: { phase: 'creation' as const, step: 'looks', status: 'ready' as const },
    }

    const captured = captureStableSnapshot(settled, NOW)

    expect(captured.snapshot).toEqual({
      createdAt: NOW,
      character: settled.character,
      flow: settled.flow,
      stack: [],
      rngCursor: 0,
      creation: settled.creation,
    })
  })

  it('keeps the previous snapshot while a wheel result is still pending', () => {
    const run = createRun(42, NOW, 'run-1')
    const previousSnapshot = {
      createdAt: NOW,
      character: run.character,
      flow: run.flow,
      stack: [],
      rngCursor: 0,
      creation: run.creation,
    }
    const pending = {
      ...run,
      snapshot: previousSnapshot,
      flow: { ...run.flow, step: 'looks', status: 'result-pending' as const },
      pending: {
        kind: 'wheel' as const,
        id: 'looks-8',
        optionId: 'looks-8',
        title: '八分容貌',
        description: '结果已经落定。',
        effects: [],
        payload: 8,
      },
    }

    const captured = captureStableSnapshot(pending, NOW)

    expect(captured.snapshot).toBe(previousSnapshot)
  })
})