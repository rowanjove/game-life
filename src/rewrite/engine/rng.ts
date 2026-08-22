export type ReplayableRng = {
  next(): number
  integer(min: number, max: number): number
  cursor(): number
}

function nextState(state: number): number {
  let value = state | 0
  value ^= value << 13
  value ^= value >>> 17
  value ^= value << 5
  return value | 0
}

export function createSeededRng(seed: number, initialCursor: number): ReplayableRng {
  let state = seed | 0
  let currentCursor = 0

  const advance = () => {
    state = nextState(state)
    currentCursor += 1
    return (state >>> 0) / 4_294_967_296
  }

  while (currentCursor < initialCursor) advance()

  return {
    next: advance,
    integer(min, max) {
      if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
        throw new Error('随机整数范围无效')
      }
      return Math.floor(advance() * (max - min + 1)) + min
    },
    cursor: () => currentCursor,
  }
}

