declare module 'spin-wheel' {
  export type WheelItemProps = {
    label?: string
    backgroundColor?: string | null
    labelColor?: string | null
    weight?: number
    value?: unknown
    image?: HTMLImageElement | null
  }

  export type WheelProps = {
    items?: WheelItemProps[]
    borderColor?: string
    borderWidth?: number
    lineColor?: string
    lineWidth?: number
    itemLabelFont?: string
    itemLabelFontSizeMax?: number
    itemLabelRadius?: number
    itemLabelRadiusMax?: number
    itemLabelAlign?: 'left' | 'center' | 'right'
    itemLabelRotation?: number
    itemLabelColors?: string[]
    radius?: number
    isInteractive?: boolean
    rotationResistance?: number
    pointerAngle?: number
    rotation?: number
    /** 0 = device pixel ratio; otherwise a multiplier. */
    pixelRatio?: number
    onRest?: ((event: { type: string; currentIndex?: number }) => void) | null
    onSpin?: ((event: unknown) => void) | null
    onCurrentIndexChange?: ((event: unknown) => void) | null
  }

  export class Wheel {
    constructor(container: Element, props?: WheelProps | null)
    init(props?: WheelProps | null): void
    remove(): void
    resize(): void
    spin(rotationSpeed?: number): void
    spinTo(rotation?: number, duration?: number, easingFunction?: ((n: number) => number) | null): void
    spinToItem(
      itemIndex?: number,
      duration?: number,
      spinToCenter?: boolean,
      numberOfRevolutions?: number,
      direction?: number,
      easingFunction?: ((n: number) => number) | null,
    ): void
    stop(): void
    getCurrentIndex(): number
    rotation: number
    onRest: ((event: { type: string; currentIndex?: number }) => void) | null
    onSpin: ((event: unknown) => void) | null
    items: WheelItemProps[]
  }
}
