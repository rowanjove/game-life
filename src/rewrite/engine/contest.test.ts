import { describe, expect, it } from 'vitest'
import { createRun } from './factory'
import {
  applyContestPlacement,
  contestPlacementLevelBonus,
  contestRankLabel,
  nextContestStep,
  placementOnElimination,
  recordContestEntry,
} from './contest'
import { confirmContestRound, startContest } from './lateGame'

describe('contest flow', () => {
  it('walks through qualifier and three group rounds', () => {
    expect(nextContestStep('qualifier')).toBe('group-1')
    expect(nextContestStep('group-1')).toBe('group-2')
    expect(nextContestStep('group-2')).toBe('group-3')
    expect(nextContestStep('group-3')).toBe('quarterfinal')
  })

  it('records placement rewards when a contest ends early', () => {
    const run = createRun(7, '2026-06-20T00:00:00.000Z', 'run-1')
    const entered = startContest({
      ...run,
      character: { ...run.character, level: 45 },
    })
    const lost = confirmContestRound(entered, 'crush-loss')

    expect(lost.character.contestBestRank).toBe('participant')
    expect(lost.character.titles).toContain('参赛经历')
    expect(lost.character.level).toBe(
      entered.character.level
        - 5
        + contestPlacementLevelBonus('participant'),
    )
  })

  it('labels contest ranks for the status panel', () => {
    const character = applyContestPlacement(
      recordContestEntry(createRun(1, '2026-06-20T00:00:00.000Z', 'run-1').character),
      placementOnElimination('semifinal'),
      contestPlacementLevelBonus('top4'),
    )
    expect(contestRankLabel(character.contestBestRank)).toBe('四强')
  })
})