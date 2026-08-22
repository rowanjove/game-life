import type { WheelOption } from '../../engine/creation'

export type WheelSliceLayout = {
  id: string
  path: string
  startAngle: number
  sweepAngle: number
  labelAngle: number
  labelX: number
  labelY: number
  maxLabelWidth: number
  displayLabel: string
  labelMode: 'full' | 'compact' | 'minimal'
  fontSize: number
  clipPathId: string
}

export const WHEEL_VIEWBOX_SIZE = 360

function pointAt(
  center: number,
  radius: number,
  angle: number,
): { x: number; y: number } {
  const radians = angle * Math.PI / 180
  return {
    x: center + Math.cos(radians) * radius,
    y: center + Math.sin(radians) * radius,
  }
}

function wedgePath(
  center: number,
  radius: number,
  startAngle: number,
  sweepAngle: number,
): string {
  const start = pointAt(center, radius, startAngle)
  const end = pointAt(center, radius, startAngle + sweepAngle)
  const largeArc = sweepAngle > 180 ? 1 : 0
  return [
    `M ${center} ${center}`,
    `L ${start.x.toFixed(3)} ${start.y.toFixed(3)}`,
    `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x.toFixed(3)} ${end.y.toFixed(3)}`,
    'Z',
  ].join(' ')
}

function labelForSlice(
  name: string,
  sweepAngle: number,
  maxLabelWidth: number,
): Pick<WheelSliceLayout, 'displayLabel' | 'labelMode' | 'fontSize'> {
  const characters = Array.from(name.trim())
  const preferredFontSize = sweepAngle >= 52 ? 14 : sweepAngle >= 24 ? 12 : 10
  const fullCapacity = Math.max(1, Math.floor(maxLabelWidth / (preferredFontSize * 1.02)))

  if (sweepAngle >= 10 && characters.length <= fullCapacity) {
    return {
      displayLabel: name,
      labelMode: 'full',
      fontSize: preferredFontSize,
    }
  }

  if (sweepAngle >= 8 && maxLabelWidth >= 24) {
    const compactCapacity = Math.max(1, Math.min(5, Math.floor(maxLabelWidth / 10.2) - 1))
    return {
      displayLabel: characters.length > compactCapacity
        ? `${characters.slice(0, compactCapacity).join('')}…`
        : name,
      labelMode: 'compact',
      fontSize: sweepAngle >= 24 ? 11 : 9,
    }
  }

  return {
    displayLabel: '·',
    labelMode: 'minimal',
    fontSize: 9,
  }
}

export function buildWheelLayout(
  options: readonly WheelOption[],
  size: number,
): WheelSliceLayout[] {
  if (options.length === 0) return []
  const totalWeight = options.reduce((sum, option) => sum + option.weight, 0)
  if (totalWeight <= 0) throw new Error('转盘总权重必须大于零')

  const center = size / 2
  const radius = size / 2 - 4
  let angle = -90

  return options.map((option) => {
    const sweepAngle = option.weight / totalWeight * 360
    const labelAngle = angle + sweepAngle / 2
    const baseLabelRadius = radius * (sweepAngle < 45 ? 0.76 : 0.62)
    const arcLength = baseLabelRadius * sweepAngle * Math.PI / 180
    const maxLabelWidth = Math.max(14, Math.min(size * 0.34, arcLength * 0.62))
    const label = labelForSlice(option.name, sweepAngle, maxLabelWidth)
    const labelRadius = label.labelMode === 'minimal'
      ? radius * 0.68
      : label.labelMode === 'compact'
        ? radius * 0.73
        : baseLabelRadius
    const labelPoint = pointAt(center, labelRadius, labelAngle)
    const slice = {
      id: option.id,
      path: wedgePath(center, radius, angle, sweepAngle),
      startAngle: angle,
      sweepAngle,
      labelAngle,
      labelX: labelPoint.x,
      labelY: labelPoint.y,
      maxLabelWidth,
      ...label,
      clipPathId: `wheel-clip-${option.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
    }
    angle += sweepAngle
    return slice
  })
}

