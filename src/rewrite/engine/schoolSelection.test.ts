import { describe, expect, it } from 'vitest'
import { rewriteSchools } from '../content/adapters'
import { createRun } from './factory'
import type { RewriteRun } from './model'
import { reduceRewriteRun, type ReducerDependencies } from './reducer'
import {
  advanceMentorYearFlags,
  birthRegion,
  bonusEventCount,
  eligibleSchools,
  schoolSelectionWeight,
  schoolWheelCandidates,
} from './schoolSelection'

const NOW = '2026-06-20T00:00:00.000Z'

function schoolRun(tier: 'primary' | 'middle' | 'high', level: number, birthPlace = '圣魂村'): RewriteRun {
  const run = createRun(42, NOW, 'run-1')
  return {
    ...run,
    character: {
      ...run.character,
      level,
      birthPlace,
      currentYear: 12,
    },
    flow: {
      phase: tier === 'primary'
        ? 'primary-school'
        : tier === 'middle'
          ? 'middle-school'
          : 'high-school',
      step: 'school-selection',
      status: 'ready',
    },
  }
}

describe('school selection', () => {
  it('maps birth places to home regions', () => {
    expect(birthRegion('圣魂村')).toBe('heaven-dou')
    expect(birthRegion('星罗城')).toBe('star-luo')
    expect(birthRegion('月弦谷')).toBe('moon-string')
    expect(birthRegion('海神岛')).toBe('far-east')
  })

  it('filters schools that exceed current soul power', () => {
    const eligible = eligibleSchools(schoolRun('high', 35))
    expect(eligible.every((school) =>
      school.minimumLevel === null || school.minimumLevel <= 35,
    )).toBe(true)
    expect(eligible.some((school) => school.id === 'high-shrek')).toBe(false)
  })

  it('boosts hometown schools and dampens low-level shrek picks', () => {
    const home = schoolRun('primary', 10, '圣魂村')
    const away = schoolRun('primary', 10, '星罗城')
    const holyLight = eligibleSchools(home).find((school) => school.id === 'primary-holy-light')
    expect(holyLight).toBeDefined()
    const homeWeight = schoolSelectionWeight(home, holyLight!)
    const awayWeight = schoolSelectionWeight(away, holyLight!)
    expect(homeWeight).toBeGreaterThan(awayWeight)

    const shrek = rewriteSchools.high.find((school) => school.id === 'high-shrek')
    expect(shrek).toBeDefined()
    const lowShrekWeight = schoolSelectionWeight(schoolRun('high', 48), shrek!)
    const readyShrekWeight = schoolSelectionWeight(schoolRun('high', 55), shrek!)
    expect(lowShrekWeight).toBeLessThan(readyShrekWeight * 0.2)
  })

  it('always returns four distinct school candidates', () => {
    const picks = schoolWheelCandidates(schoolRun('middle', 25))
    expect(picks).toHaveLength(4)
    expect(new Set(picks.map((school) => school.id)).size).toBe(4)
  })

  it('counts bonus graduation events from flags', () => {
    expect(bonusEventCount(['extra-events-2', 'extra-event'])).toBe(3)
    expect(bonusEventCount([])).toBe(0)
  })

  it('advances mentor year flags and grants annual bonus', () => {
    expect(advanceMentorYearFlags(['teacher-training-3-years'])).toEqual({
      bonus: 2,
      flags: ['teacher-training-2-years'],
    })
    expect(advanceMentorYearFlags(['mentor-one-year'])).toEqual({
      bonus: 2,
      flags: [],
    })
  })

  it('applies mentor bonus during school year confirmation', () => {
    const deps = (): ReducerDependencies => {
      let id = 0
      return {
        now: () => NOW,
        nextId: () => `result-${++id}`,
        pickOption: (options) => options.find((option) => option.id === 'year-growth-1')!,
      }
    }
    const run: RewriteRun = {
      ...schoolRun('primary', 12),
      character: {
        ...schoolRun('primary', 12).character,
        flags: ['teacher-training-1-year'],
        schoolRecords: [{
          tier: 'primary',
          schoolId: 'primary-holy-light',
          schoolName: '圣光初级学院',
          startYear: 12,
          endYear: null,
        }],
      },
      flow: { phase: 'primary-school', step: 'year-1', status: 'ready' },
    }

    const animating = reduceRewriteRun(run, { type: 'START_WHEEL' }, deps())
    const stopped = reduceRewriteRun(animating, { type: 'ANIMATION_FINISHED' }, deps())
    const next = reduceRewriteRun(stopped, { type: 'CONFIRM_RESULT' }, deps())

    expect(next.character.flags).not.toContain('teacher-training-1-year')
    expect(next.character.level).toBeGreaterThan(12)
  })
})