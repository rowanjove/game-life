import { describe, expect, it } from 'vitest'
import type { WheelOption } from '../../engine/creation'
import { buildWheelLayout } from './geometry'

const options: WheelOption[] = [
  { id: 'a', name: '天斗城', description: '帝国首都', weight: 50, color: '#9fd8f7', value: 'a' },
  { id: 'b', name: '星罗城', description: '尚武之城', weight: 30, color: '#f2cfe0', value: 'b' },
  { id: 'c', name: '极北之地', description: '冰雪故乡', weight: 20, color: '#cfc8ef', value: 'c' },
]

describe('rewrite wheel geometry', () => {
  it('centers each horizontal label on its weighted wedge', () => {
    const layout = buildWheelLayout(options, 320)

    expect(layout[0].sweepAngle).toBe(180)
    expect(layout[0].labelAngle).toBe(
      layout[0].startAngle + layout[0].sweepAngle / 2,
    )
    expect(layout.every((slice) => slice.maxLabelWidth > 0)).toBe(true)
  })

  it('creates a unique clipping path for every label', () => {
    const layout = buildWheelLayout(options, 320)

    expect(new Set(layout.map((slice) => slice.clipPathId)).size).toBe(options.length)
    expect(layout.every((slice) => slice.path.startsWith('M 160 160'))).toBe(true)
  })

  it('moves narrow-slice labels outward to keep neighboring text separated', () => {
    const narrowOptions: WheelOption[] = Array.from({ length: 10 }, (_, index) => ({
      id: `narrow-${index}`,
      name: `${index + 1}分`,
      description: '分值',
      weight: 1,
      color: '#cfc8ef',
      value: index + 1,
    }))
    const [first] = buildWheelLayout(narrowOptions, 320)
    const distanceFromCenter = Math.hypot(first.labelX - 160, first.labelY - 160)

    expect(distanceFromCenter).toBeGreaterThan(112)
  })

  it('keeps wide labels complete and abbreviates narrow labels without tiny type', () => {
    const mixedOptions: WheelOption[] = [
      {
        id: 'wide',
        name: '七星学院',
        description: '主要区域。',
        weight: 70,
        color: '#eef5ff',
        value: 'wide',
      },
      {
        id: 'narrow',
        name: '天斗皇家学院',
        description: '较窄区域。',
        weight: 8,
        color: '#f9edf4',
        value: 'narrow',
      },
      {
        id: 'tiny',
        name: '极北冰封森林',
        description: '极窄区域。',
        weight: 1,
        color: '#eeeafd',
        value: 'tiny',
      },
      {
        id: 'remainder',
        name: '星罗城',
        description: '剩余区域。',
        weight: 21,
        color: '#e9f6f8',
        value: 'remainder',
      },
    ]

    const layout = buildWheelLayout(mixedOptions, 360)
    const wide = layout.find((slice) => slice.id === 'wide')
    const narrow = layout.find((slice) => slice.id === 'narrow')
    const tiny = layout.find((slice) => slice.id === 'tiny')

    expect(wide).toMatchObject({
      displayLabel: '七星学院',
      labelMode: 'full',
    })
    expect(narrow?.displayLabel.length).toBeLessThan('天斗皇家学院'.length)
    expect(narrow?.labelMode).toBe('compact')
    expect(tiny?.displayLabel.length).toBeLessThanOrEqual(2)
    expect(tiny?.labelMode).toBe('minimal')
    expect(layout.every((slice) => slice.fontSize >= 9)).toBe(true)
  })
})

