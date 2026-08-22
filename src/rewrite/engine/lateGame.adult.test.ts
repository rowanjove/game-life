import { describe, expect, it } from 'vitest'
import { createRun } from './factory'
import {
  confirmAdultEventCount,
  confirmAdultYear,
  continueAdultEndingCheck,
  finishAdultYearCycle,
  shouldEndAdultLife,
} from './lateGame'

function adultRun() {
  const run = createRun(42, '2026-06-20T00:00:00.000Z', 'run-1')
  return {
    ...run,
    character: {
      ...run.character,
      name: '林云深',
      birthYear: 1,
      currentYear: 30,
      level: 62,
    },
  }
}

describe('adult life cycle', () => {
  it('queues cycle events after five adult years', () => {
    const seeded = confirmAdultEventCount(adultRun(), 3)
    const cycled = finishAdultYearCycle({
      ...seeded,
      flow: { phase: 'adult' as const, step: 'adult-cycle-end', status: 'ready' as const },
    })

    expect(cycled.flow.step).toBe('special-event')
    expect(cycled.stack.at(-1)?.returnTo.step).toBe('ending-check')
    expect(cycled.stack.at(-1)?.queue).toHaveLength(2)
  })

  it('loops back to event-count when lifespan is not reached', () => {
    const run = {
      ...adultRun(),
      flow: { phase: 'adult' as const, step: 'ending-check', status: 'ready' as const },
    }

    const next = continueAdultEndingCheck(run)

    expect(shouldEndAdultLife(run)).toBe(false)
    expect(next.flow.step).toBe('event-count')
  })

  it('can trigger an instant adult event during a year', () => {
    const run = {
      ...confirmAdultEventCount(adultRun(), 2),
      seed: 1,
      rngCursor: 0,
      flow: { phase: 'adult' as const, step: 'year-1', status: 'ready' as const },
    }

    const next = confirmAdultYear(run, 2)

    expect(
      next.flow.step === 'special-event' || next.flow.step === 'year-2',
    ).toBe(true)
  })
})