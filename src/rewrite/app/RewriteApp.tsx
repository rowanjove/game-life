import { useMemo, useState } from 'react'
import { useStore } from 'zustand'
import type { RewriteRun } from '../engine/model'
import { reduceRewriteRun } from '../engine/reducer'
import {
  createRewriteRepository,
  type RewriteRepository,
} from '../storage/repository'
import {
  createRewriteStore,
  type RewriteStoreDependencies,
} from '../store/gameStore'
import '../styles/tokens.css'
import '../styles/layout.css'
import '../styles/wheel.css'
import '../styles/dialogs.css'
import { GameShell } from '../ui/shell/GameShell'
import { RecoveryBoundary } from '../ui/shell/RecoveryBoundary'
import { createResilientStorage, createRuntimeId } from '../platform/runtime'
import { RewriteRouter } from './RewriteRouter'

type RewriteAppProps = {
  repository?: RewriteRepository
  dependencies?: RewriteStoreDependencies
}

function defaultDependencies(): RewriteStoreDependencies {
  const dependencies = {
    now: () => new Date().toISOString(),
    nextId: createRuntimeId,
    nextSeed: () => Math.floor(Math.random() * 2_147_483_647) + 1,
  }
  return {
    ...dependencies,
    reduce: (run: RewriteRun, command) =>
      reduceRewriteRun(run, command, dependencies),
  }
}

export function RewriteApp({
  repository,
  dependencies,
}: RewriteAppProps = {}) {
  const [packEpoch, setPackEpoch] = useState(0)

  const activeRepository = useMemo(
    () => repository ?? createRewriteRepository(createResilientStorage(globalThis.localStorage)),
    [repository],
  )
  const activeDependencies = useMemo(
    () => dependencies ?? defaultDependencies(),
    [dependencies],
  )
  // Recreate store when pack changes so initializeRun re-binds packId.
  const store = useMemo(
    () => createRewriteStore(activeRepository, activeDependencies),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- packEpoch intentionally invalidates
    [activeDependencies, activeRepository, packEpoch],
  )
  const run = useStore(store, (state) => state.run)
  const history = useStore(store, (state) => state.history)
  const error = useStore(store, (state) => state.error)

  return (
    <GameShell
      character={run.character}
      history={history}
      onRefresh={() => store.getState().refresh()}
      showStatus={run.flow.step !== 'identity'}
      onPackChanged={() => {
        store.getState().restart()
        setPackEpoch((value) => value + 1)
      }}
    >
      <span hidden data-testid="pack-epoch">{packEpoch}</span>
      {error ? (
        <RecoveryBoundary
          error={new Error(error)}
          onRecover={() => store.getState().recover()}
          onReload={() => globalThis.location.reload()}
          onRestart={() => store.getState().restart()}
        />
      ) : (
        <RewriteRouter
          run={run}
          dispatch={(command) => store.getState().dispatch(command)}
          onRestart={() => store.getState().restart()}
        />
      )}
    </GameShell>
  )
}
