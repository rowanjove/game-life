import type { ContestDetailOutcome } from './heroInteraction'
import type { RewriteCharacter } from './model'

export const CONTEST_ROUNDS = [
  'qualifier',
  'group-1',
  'group-2',
  'group-3',
  'quarterfinal',
  'semifinal',
  'final',
] as const

export type ContestRound = (typeof CONTEST_ROUNDS)[number]

export type ContestRank =
  | 'champion'
  | 'runner-up'
  | 'top4'
  | 'top8'
  | 'participant'

const RANK_ORDER: ContestRank[] = [
  'participant',
  'top8',
  'top4',
  'runner-up',
  'champion',
]

export function nextContestStep(round: ContestRound): string {
  const index = CONTEST_ROUNDS.indexOf(round)
  return CONTEST_ROUNDS[index + 1] ?? 'tang-san'
}

export function contestRoundLabel(round: string): string {
  const labels: Record<string, string> = {
    qualifier: '资格赛',
    'group-1': '小组赛第一场',
    'group-2': '小组赛第二场',
    'group-3': '小组赛第三场',
    quarterfinal: '淘汰赛',
    semifinal: '半决赛',
    final: '决赛',
  }
  return labels[round] ?? round
}

export function placementOnElimination(round: ContestRound): ContestRank {
  if (round === 'final') return 'runner-up'
  if (round === 'semifinal') return 'top4'
  if (round === 'quarterfinal') return 'top8'
  return 'participant'
}

export function placementOnFinalAdvance(
  outcome: ContestDetailOutcome,
): ContestRank {
  if (outcome === 'crush-win' || outcome === 'win' || outcome === 'narrow-win') {
    return 'champion'
  }
  return 'runner-up'
}

export function contestRankLabel(rank: ContestRank | null): string {
  if (!rank) return '未参赛'
  const labels: Record<ContestRank, string> = {
    champion: '冠军',
    'runner-up': '亚军',
    top4: '四强',
    top8: '八强',
    participant: '参赛',
  }
  return labels[rank]
}

export function betterContestRank(
  current: ContestRank | null,
  next: ContestRank,
): ContestRank {
  if (!current) return next
  return RANK_ORDER.indexOf(next) > RANK_ORDER.indexOf(current) ? next : current
}

export function contestPlacementLevelBonus(rank: ContestRank): number {
  switch (rank) {
    case 'champion': return 20
    case 'runner-up': return 15
    case 'top4': return 10
    case 'top8': return 5
    case 'participant': return 2
  }
}

export function contestPlacementTitles(rank: ContestRank): string[] {
  switch (rank) {
    case 'champion': return ['全陆冠军']
    case 'runner-up': return ['全陆亚军']
    case 'participant': return ['参赛经历']
    default: return []
  }
}

export function recordContestEntry(
  character: RewriteCharacter,
): RewriteCharacter {
  return {
    ...character,
    contestAppearances: character.contestAppearances + 1,
  }
}

export function applyContestPlacement(
  character: RewriteCharacter,
  rank: ContestRank,
  levelBonus: number,
): RewriteCharacter {
  return {
    ...character,
    contestBestRank: betterContestRank(character.contestBestRank, rank),
    titles: [...new Set([
      ...character.titles,
      ...contestPlacementTitles(rank),
    ])],
    flags: [
      ...new Set([
        ...character.flags,
        `contest-rank-${rank}`,
      ]),
    ],
    level: Math.min(
      character.maxLevel ?? 100,
      Math.round(character.level + levelBonus),
    ),
  }
}