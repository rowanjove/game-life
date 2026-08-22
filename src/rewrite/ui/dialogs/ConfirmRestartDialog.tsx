type ConfirmRestartDialogProps = {
  onCancel(): void
  onConfirm(): void
}

export function ConfirmRestartDialog({
  onCancel,
  onConfirm,
}: ConfirmRestartDialogProps) {
  return (
    <div className="rewrite-dialog-overlay">
      <section
        className="rewrite-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-label="确认开始新人生"
      >
        <WingedGem className="rewrite-dialog__crest" label="新生纹章" />
        <h2>开始新人生？</h2>
        <p>当前人生会结束，游玩历史会保留。</p>
        <div className="rewrite-dialog__actions">
          <button className="rewrite-primary-action" type="button" onClick={onConfirm}>确认开始</button>
          <button type="button" onClick={onCancel}>取消</button>
        </div>
      </section>
    </div>
  )
}
import { WingedGem } from '../decor/CelestialDecor'
