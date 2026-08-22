import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// spin-wheel depends on canvas + matchMedia (jsdom lacks both)
class MockCtx2d {
  canvas = { width: 0, height: 0 }
  clearRect() {}
  save() {}
  restore() {}
  beginPath() {}
  closePath() {}
  moveTo() {}
  lineTo() {}
  arc() {}
  fill() {}
  stroke() {}
  clip() {}
  fillText() {}
  strokeText() {}
  measureText(text: string) {
    return { width: String(text).length * 8 }
  }
  translate() {}
  rotate() {}
  scale() {}
  setTransform() {}
  drawImage() {}
  createLinearGradient() {
    return { addColorStop() {} }
  }
  createRadialGradient() {
    return { addColorStop() {} }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
HTMLCanvasElement.prototype.getContext = function getContext() {
  return new MockCtx2d() as any
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false
    },
  }),
})

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', MockResizeObserver)

// Deterministic, instant spin-wheel for unit tests
vi.mock('spin-wheel', () => {
  class Wheel {
    rotation = 0
    onRest: ((event?: unknown) => void) | null = null
    items: unknown[] = []
    constructor(_container: Element, props: { items?: unknown[] } = {}) {
      this.items = props.items ?? []
    }
    remove() {}
    resize() {}
    spinToItem(
      _index: number,
      duration = 0,
      _spinToCenter?: boolean,
      _revs?: number,
      _dir?: number,
    ) {
      const finish = () => this.onRest?.({ type: 'rest' })
      if (duration <= 0) finish()
      else setTimeout(finish, Math.min(duration, 20))
    }
  }
  return { Wheel }
})
