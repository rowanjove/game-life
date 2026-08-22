import { describe, expect, it } from 'vitest'
import { createRun } from '../engine/factory'
import type { HistoryEntry, RewriteRun } from '../engine/model'
import {
  CURRENT_RUN_KEY,
  MAX_PLAY_HISTORY_ENTRIES,
  PLAY_HISTORY_KEY,
  createRewriteRepository,
  type StorageLike,
} from './repository'

const NOW = '2026-06-20T00:00:00.000Z'

function memoryStorage(): StorageLike {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
    removeItem: (key) => {
      values.delete(key)
    },
  }
}

function historyEntry(runId: string): HistoryEntry {
  return {
    id: 'history-1',
    runId,
    at: NOW,
    type: 'run-start',
    summary: '开始人生',
  }
}

describe('rewrite repository', () => {
  it('stores exactly one current run and a separate immutable history', () => {
    const storage = memoryStorage()
    const repository = createRewriteRepository(storage)
    const run = createRun(42, NOW, 'run-1')

    repository.saveRun(run)
    repository.appendHistory(historyEntry(run.id))

    expect(repository.loadRun()?.id).toBe(run.id)
    expect(repository.loadHistory()).toEqual([historyEntry(run.id)])
    expect(storage.getItem(CURRENT_RUN_KEY)).not.toBeNull()
    expect(storage.getItem(PLAY_HISTORY_KEY)).not.toBeNull()
  })

  it('recovers the last valid snapshot when the current state is invalid', () => {
    const storage = memoryStorage()
    const repository = createRewriteRepository(storage)
    const base = createRun(42, NOW, 'run-1')
    const withSnapshot: RewriteRun = {
      ...base,
      snapshot: {
        createdAt: NOW,
        character: base.character,
        flow: base.flow,
        stack: [],
        rngCursor: 0,
        creation: base.creation,
      },
      character: {
        ...base.character,
        level: 2.5,
      },
    }
    storage.setItem(CURRENT_RUN_KEY, JSON.stringify(withSnapshot))

    const recovered = repository.loadRecoverableRun()

    expect(recovered?.source).toBe('snapshot')
    expect(recovered?.run.flow.step).toBe('identity')
    expect(recovered?.run.character.level).toBe(0)
  })

  it('trims play history to the newest entries once the cap is exceeded', () => {
    const storage = memoryStorage()
    const repository = createRewriteRepository(storage)

    for (let index = 0; index < MAX_PLAY_HISTORY_ENTRIES + 5; index += 1) {
      repository.appendHistory({
        id: `history-${index}`,
        runId: 'run-1',
        at: NOW,
        type: 'run-start',
        summary: `记录 ${index}`,
      })
    }

    const history = repository.loadHistory()
    expect(history).toHaveLength(MAX_PLAY_HISTORY_ENTRIES)
    expect(history[0]?.id).toBe('history-5')
    expect(history.at(-1)?.id).toBe(`history-${MAX_PLAY_HISTORY_ENTRIES + 4}`)
  })

  it('archives the current run before restarting and keeps older history', () => {
    const storage = memoryStorage()
    const repository = createRewriteRepository(storage)
    const oldRun = createRun(42, NOW, 'old-run')
    repository.saveRun(oldRun)
    repository.appendHistory(historyEntry(oldRun.id))

    const next = createRun(84, '2026-06-21T00:00:00.000Z', 'new-run')
    repository.archiveAndRestart(next)

    expect(repository.loadRun()?.id).toBe('new-run')
    expect(repository.loadHistory().map((entry) => entry.type)).toEqual([
      'run-start',
      'run-restart',
    ])
  })
})
