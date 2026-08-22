import type { RewriteRun, ValidSnapshot } from '../engine/model'

export function captureStableSnapshot(
  run: RewriteRun,
  now: string,
): RewriteRun {
  if (run.pending !== null) return run
  if (
    run.flow.status === 'animating' ||
    run.flow.status === 'result-pending' ||
    run.flow.status === 'choice-pending'
  ) {
    return run
  }

  const snapshot: ValidSnapshot = {
    createdAt: now,
    character: run.character,
    flow: run.flow,
    stack: run.stack,
    rngCursor: run.rngCursor,
    creation: run.creation,
  }

  return { ...run, snapshot }
}