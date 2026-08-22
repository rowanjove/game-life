import type { WheelOption } from '../../engine/creation'

type WheelDetailDialogProps = {
  option: WheelOption
  onClose(): void
}

export function WheelDetailDialog({ option, onClose }: WheelDetailDialogProps) {
  return (
    <div role="presentation" className="wheel-detail-overlay">
      <section role="dialog" aria-modal="true" aria-label="扇区详情">
        <h2>{option.name}</h2>
        <p>{option.description}</p>
        <p>基础权重：{option.weight}</p>
        <button type="button" onClick={onClose}>关闭详情</button>
      </section>
    </div>
  )
}
