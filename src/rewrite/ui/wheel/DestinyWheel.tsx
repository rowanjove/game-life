import { useEffect, useMemo, useRef, useState } from 'react'
import { Wheel } from 'spin-wheel'
import type { WheelOption } from '../../engine/creation'
import type { ActivityStatus } from '../../engine/model'
import { WheelDetailDialog } from './WheelDetailDialog'

/** High-contrast slice palette — avoids washed-out pastels on canvas. */
const SLICE_COLORS = [
  '#385f73',
  '#9b5f5c',
  '#58715c',
  '#ad7d35',
  '#6b617b',
  '#3f7773',
  '#a15f3f',
  '#547389',
  '#8d5874',
  '#6a7d4e',
  '#99712c',
  '#76658a',
] as const

function DiceIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="8" cy="8" r="1.35" fill="currentColor" />
      <circle cx="16" cy="8" r="1.35" fill="currentColor" />
      <circle cx="12" cy="12" r="1.35" fill="currentColor" />
      <circle cx="8" cy="16" r="1.35" fill="currentColor" />
      <circle cx="16" cy="16" r="1.35" fill="currentColor" />
    </svg>
  )
}

function truncateLabel(name: string, optionCount: number): string {
  const chars = Array.from(name.trim())
  if (chars.length === 0) return ''
  if (optionCount <= 6) return chars.slice(0, 8).join('')
  if (optionCount <= 10) return chars.slice(0, 5).join('')
  if (optionCount <= 16) return chars.slice(0, 3).join('')
  if (optionCount <= 24) return chars.slice(0, 2).join('')
  return chars[0] ?? ''
}

function sliceColor(index: number, fallback: string): string {
  // Prefer curated palette; fall back only if option color is already strong.
  const curated = SLICE_COLORS[index % SLICE_COLORS.length]
  if (!fallback || fallback.startsWith('#e') || fallback.startsWith('#f') || fallback.startsWith('#d7') || fallback.startsWith('#cfc')) {
    return curated
  }
  return fallback
}

function labelColorForBg(bg: string): string {
  const hex = bg.replace('#', '')
  if (hex.length !== 6) return '#ffffff'
  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.62 ? '#1a2433' : '#ffffff'
}

type DestinyWheelProps = {
  options: readonly WheelOption[]
  status: ActivityStatus
  onSpin(): void
  targetOptionId?: string | null
  rotationDurationMs?: number
  onRotationEnd?(): void
  rotation?: number
}

function optionFingerprint(options: readonly WheelOption[]): string {
  return options.map((o) => `${o.id}:${o.weight}:${o.color}:${o.name}`).join('|')
}

export function DestinyWheel({
  options,
  status,
  onSpin,
  targetOptionId = null,
  rotationDurationMs = 4000,
  onRotationEnd,
}: DestinyWheelProps) {
  const [detail, setDetail] = useState<WheelOption | null>(null)
  const [listOpen, setListOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const wheelRef = useRef<InstanceType<typeof Wheel> | null>(null)
  const onRestRef = useRef(onRotationEnd)
  const statusRef = useRef(status)
  const spunForPending = useRef<string | null>(null)
  const fingerprint = useMemo(() => optionFingerprint(options), [options])
  const interactive = status === 'ready'
  const count = options.length

  useEffect(() => {
    onRestRef.current = onRotationEnd
  }, [onRotationEnd])

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    wheelRef.current?.remove()
    el.replaceChildren()

    const items = options.map((option, index) => {
      const backgroundColor = sliceColor(index, option.color)
      return {
        label: truncateLabel(option.name, count),
        backgroundColor,
        labelColor: labelColorForBg(backgroundColor),
        weight: Math.max(0.001, option.weight),
        value: option.id,
      }
    })

    const dense = count > 14
    const wheel = new Wheel(el, {
      items,
      borderWidth: 0,
      borderColor: 'transparent',
      lineWidth: dense ? 0 : 1,
      lineColor: 'rgba(255,255,255,.55)',
      itemLabelFont: 'Microsoft YaHei, PingFang SC, Noto Sans SC, sans-serif',
      itemLabelFontSizeMax: dense ? 11 : count > 8 ? 13 : 16,
      itemLabelRadius: dense ? 0.72 : 0.78,
      itemLabelRadiusMax: dense ? 0.18 : 0.24,
      itemLabelAlign: 'right',
      itemLabelRotation: 0,
      itemLabelColors: items.map((item) => item.labelColor),
      radius: 0.96,
      isInteractive: false,
      rotationResistance: -100,
      pointerAngle: 0,
      pixelRatio: Math.min(2, globalThis.devicePixelRatio || 1),
    })

    wheel.onRest = () => {
      if (statusRef.current === 'animating') {
        onRestRef.current?.()
      }
    }

    wheelRef.current = wheel
    spunForPending.current = null

    const safeResize = () => {
      if (typeof wheel.resize === 'function') wheel.resize()
    }
    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => safeResize())
      : null
    ro?.observe(el)
    requestAnimationFrame(safeResize)

    return () => {
      ro?.disconnect()
      wheel.remove()
      wheelRef.current = null
    }
  }, [fingerprint, options, count])

  useEffect(() => {
    const wheel = wheelRef.current
    if (!wheel || options.length === 0) return

    const index = targetOptionId
      ? options.findIndex((option) => option.id === targetOptionId)
      : -1

    if (status === 'ready') {
      spunForPending.current = null
      wheel.rotation = 0
      return
    }

    if (index < 0) return

    if (status === 'animating') {
      const key = targetOptionId ?? ''
      if (spunForPending.current === key) return
      spunForPending.current = key
      const duration = Math.max(200, rotationDurationMs)
      const revolutions = duration >= 2000 ? 4 : 1
      wheel.spinToItem(index, duration, true, revolutions, 1)
      return
    }

    if (status === 'result-pending') {
      if (spunForPending.current !== targetOptionId) {
        spunForPending.current = targetOptionId
        wheel.spinToItem(index, 0, true, 0, 1)
      }
    }
  }, [status, targetOptionId, options, rotationDurationMs])

  return (
    <>
      <div
        className={`destiny-wheel${status === 'animating' ? ' destiny-wheel--animating' : ''}`}
        data-testid="destiny-wheel"
        aria-busy={status === 'animating'}
      >
        <div className="destiny-wheel__ring" data-testid="wheel-outer-frame" aria-hidden="true" />
        <div className="destiny-wheel__pointer" data-testid="wheel-pointer" aria-hidden="true" />
        <div
          ref={containerRef}
          className="destiny-wheel__canvas-host"
          data-testid="wheel-rotor"
          aria-label="命运转盘"
        />
        <div className="destiny-wheel__hub" data-testid="wheel-gem-center">
          <button
            type="button"
            aria-label={status === 'animating' ? '正在旋转' : '开始旋转'}
            disabled={!interactive}
            onClick={onSpin}
          >
            <DiceIcon />
            <span>{status === 'animating' ? '旋转中' : '旋转'}</span>
          </button>
        </div>
      </div>

      <div className="wheel-option-panel">
        <button
          type="button"
          className="wheel-option-panel__toggle"
          aria-expanded={listOpen}
          onClick={() => setListOpen((value) => !value)}
        >
          {listOpen ? '收起选项' : `查看全部选项（${count}）`}
        </button>
        {listOpen ? (
          <ul className="wheel-option-panel__list">
            {options.map((option, index) => (
              <li key={option.id}>
                <button
                  type="button"
                  className="wheel-option-panel__item"
                  disabled={!interactive}
                  aria-label={`查看 ${option.name} 详情`}
                  onClick={() => setDetail(option)}
                >
                  <span
                    className="wheel-option-panel__swatch"
                    style={{ background: sliceColor(index, option.color) }}
                    aria-hidden="true"
                  />
                  <span className="wheel-option-panel__name">{option.name}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {detail ? <WheelDetailDialog option={detail} onClose={() => setDetail(null)} /> : null}
    </>
  )
}
