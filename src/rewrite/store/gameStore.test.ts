import { describe, expect, it } from 'vitest'
import { createRun } from '../engine/factory'
import type { RewriteRun } from '../engine/model'
import { reduceRewriteRun } from '../engine/reducer'
import {
  createRewriteRepository,
  type StorageLike,
} from '../storage/repository'
import { createRewriteStore, type RewriteStoreDependencies } from './gameStore'

const NOW = '2026-06-20T00:00:00.000Z'

function memoryStorage(): StorageLike {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
}

function dependencies(): RewriteStoreDependencies {
  let id = 0
  return {
    now: () => NOW,
    nextId: () => `id-${++id}`,
    nextSeed: () => 42,
    reduce: (run) => run,
  }
}

describe('rewrite store', () => {
  it('opens directly into a new identity flow when no run exists', () => {
    const repository = createRewriteRepository(memoryStorage())
    const store = createRewriteStore(repository, dependencies())

    expect(store.getState().run.flow).toEqual({
      phase: 'creation',
      step: 'identity',
      status: 'ready',
    })
    expect(repository.loadRun()?.id).toBe(store.getState().run.id)
  })

  it('automatically resumes an existing pending result', () => {
    const repository = createRewriteRepository(memoryStorage())
    const base = createRun(42, NOW, 'run-1')
    const pending: RewriteRun = {
      ...base,
      flow: { ...base.flow, step: 'looks', status: 'result-pending' },
      pending: {
        kind: 'wheel',
        id: 'fixed-result',
        optionId: 'looks-8',
        title: '八分容貌',
        description: '结果已经落定。',
        effects: ['颜值设为 8'],
        payload: 8,
      },
    }
    repository.saveRun(pending)

    const store = createRewriteStore(repository, dependencies())

    expect(store.getState().run.pending?.id).toBe('fixed-result')
    expect(store.getState().run.flow.status).toBe('result-pending')
  })

  it('keeps history when restarting', () => {
    const repository = createRewriteRepository(memoryStorage())
    const store = createRewriteStore(repository, dependencies())
    const oldRunId = store.getState().run.id

    store.getState().restart()

    expect(store.getState().run.id).not.toBe(oldRunId)
    expect(repository.loadHistory().some((entry) => entry.type === 'run-restart')).toBe(true)
  })

  it('captures a stable snapshot after a successful dispatch', () => {
    const repository = createRewriteRepository(memoryStorage())
    const deps = dependencies()
    let id = 0
    deps.reduce = (run, command) =>
      reduceRewriteRun(run, command, {
        now: () => NOW,
        nextId: () => `id-${++id}`,
      })
    const store = createRewriteStore(repository, deps)

    store.getState().dispatch({
      type: 'CONFIRM_IDENTITY',
      name: '林云深',
      gender: 'male',
    })

    expect(repository.loadRun()?.snapshot).toMatchObject({
      createdAt: NOW,
      flow: { phase: 'creation', step: 'looks', status: 'ready' },
    })
  })

  it('persists a successful injected reducer result', () => {
    const repository = createRewriteRepository(memoryStorage())
    const deps = dependencies()
    deps.reduce = (run) => ({
      ...run,
      flow: { phase: 'creation', step: 'looks', status: 'ready' },
    })
    const store = createRewriteStore(repository, deps)

    store.getState().dispatch({
      type: 'CONFIRM_IDENTITY',
      name: '林云深',
      gender: 'male',
    })

    expect(repository.loadRun()?.flow.step).toBe('looks')
  })

  it('archives a newly completed ending into separate play history', () => {
    const repository = createRewriteRepository(memoryStorage())
    const deps = dependencies()
    deps.reduce = (run) => ({
      ...run,
      character: { ...run.character, endingId: 'ordinary-life' },
      flow: { phase: 'ending', step: 'summary', status: 'completed' },
      history: [
        ...run.history,
        {
          id: 'ending-1',
          runId: run.id,
          at: NOW,
          type: 'ending',
          summary: '抵达结局',
        },
      ],
    })
    const store = createRewriteStore(repository, deps)

    store.getState().dispatch({ type: 'CONTINUE' })

    expect(repository.loadHistory()).toContainEqual(
      expect.objectContaining({ id: 'ending-1', type: 'ending' }),
    )
  })
})
