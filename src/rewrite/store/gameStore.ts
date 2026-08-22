import { createStore } from 'zustand/vanilla'
import { getActiveContent } from '../../content/registry'
import { createRun } from '../engine/factory'
import type {
  HistoryEntry,
  RewriteCommand,
  RewriteRun,
} from '../engine/model'
import type { RewriteRepository } from '../storage/repository'
import { captureStableSnapshot } from '../storage/snapshot'

export type RewriteStoreDependencies = {
  now(): string
  nextId(): string
  nextSeed(): number
  reduce(run: RewriteRun, command: RewriteCommand): RewriteRun
}

export type RewriteStoreState = {
  run: RewriteRun
  history: HistoryEntry[]
  error: string | null
  dispatch(command: RewriteCommand): void
  refresh(): void
  recover(): void
  restart(): void
}

function packMeta() {
  const content = getActiveContent()
  return {
    packId: content.packId,
    packVersion: content.packVersion || '1.0.0',
  }
}

function initializeRun(
  repository: RewriteRepository,
  dependencies: RewriteStoreDependencies,
): RewriteRun {
  const expectedPackId = getActiveContent().packId
  const recovered = repository.loadRecoverableRun({ expectedPackId })
  if (recovered) {
    if (recovered.source === 'snapshot') repository.saveRun(recovered.run)
    return recovered.run
  }
  const run = createRun(
    dependencies.nextSeed(),
    dependencies.now(),
    dependencies.nextId(),
    packMeta(),
  )
  repository.saveRun(run)
  return run
}

export function createRewriteStore(
  repository: RewriteRepository,
  dependencies: RewriteStoreDependencies,
) {
  const initialRun = initializeRun(repository, dependencies)

  return createStore<RewriteStoreState>((set, get) => ({
    run: initialRun,
    history: repository.loadHistory(),
    error: null,
    dispatch(command) {
      const before = get().run
      try {
        const reduced = dependencies.reduce(before, command)
        const updated = captureStableSnapshot(
          {
            ...reduced,
            updatedAt: dependencies.now(),
          },
          dependencies.now(),
        )
        const previousHistoryIds = new Set(before.history.map((entry) => entry.id))
        updated.history
          .filter((entry) => !previousHistoryIds.has(entry.id))
          .forEach((entry) => repository.appendHistory(entry))
        repository.saveRun(updated)
        set({
          run: updated,
          history: repository.loadHistory(),
          error: null,
        })
      } catch (error) {
        set({
          run: before,
          error: error instanceof Error ? error.message : '游戏状态更新失败',
        })
      }
    },
    refresh() {
      const recovered = repository.loadRecoverableRun({
        expectedPackId: getActiveContent().packId,
      })
      if (!recovered) {
        set({
          error: '当前进度无法恢复（内容包不匹配或数据损坏）',
        })
        return
      }
      if (recovered.source === 'snapshot') repository.saveRun(recovered.run)
      set({
        run: recovered.run,
        history: repository.loadHistory(),
        error: null,
      })
    },
    recover() {
      get().refresh()
    },
    restart() {
      const next = createRun(
        dependencies.nextSeed(),
        dependencies.now(),
        dependencies.nextId(),
        packMeta(),
      )
      repository.archiveAndRestart(next)
      set({
        run: next,
        history: repository.loadHistory(),
        error: null,
      })
    },
  }))
}

export type RewriteStore = ReturnType<typeof createRewriteStore>
