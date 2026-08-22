import type { WheelPendingResult } from '../../engine/model'
import { WingedGem } from '../decor/CelestialDecor'

type CenteredResultDialogProps = {
  result: WheelPendingResult
  onConfirm(): void
}

export function CenteredResultDialog({
  result,
  onConfirm,
}: CenteredResultDialogProps) {
  return (
    <div className="result-overlay">
      <section
        role="dialog"
        aria-modal="true"
        aria-label="命运结果"
        className="result-dialog"
      >
        <WingedGem className="result-dialog__crest" label="命运纹章" />
        <div className="result-dialog__inner" data-testid="result-inner-frame">
          <p className="result-dialog__eyebrow">命运印记</p>
          <h2>{result.title}</h2>
          <div className="result-dialog__illustration" data-testid="result-illustration" aria-hidden="true">
            <span>✦</span>
          </div>
          <p>{result.description}</p>
          {result.effects.length > 0 ? (
            <ul>
              {result.effects.map((effect) => <li key={effect}>{effect}</li>)}
            </ul>
          ) : null}
          <button className="rewrite-primary-action" type="button" onClick={onConfirm}>
            确认，继续命运
          </button>
        </div>
      </section>
    </div>
  )
}
