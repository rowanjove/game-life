import { useState } from 'react'
import { ConfirmRestartDialog } from '../dialogs/ConfirmRestartDialog'

type RecoveryBoundaryProps = {
  error: Error
  onRecover(): void
  onReload(): void
  onRestart(): void
}

export function RecoveryBoundary({
  error,
  onRecover,
  onReload,
  onRestart,
}: RecoveryBoundaryProps) {
  const [confirming, setConfirming] = useState(false)
  return (
    <main className="rewrite-recovery">
      <h1>命运暂时停住了</h1>
      <p>{error.message}</p>
      <div className="rewrite-recovery__actions">
        <button type="button" onClick={onRecover}>恢复最近进度</button>
        <button type="button" onClick={onReload}>重新加载</button>
        <button type="button" onClick={() => setConfirming(true)}>开始新人生</button>
      </div>
      {confirming ? (
        <ConfirmRestartDialog
          onCancel={() => setConfirming(false)}
          onConfirm={onRestart}
        />
      ) : null}
    </main>
  )
}
