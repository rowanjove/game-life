import type { RewriteCharacter } from './model'
import { contestRankLabel } from './contest'
import { rankTitleForLevel } from '../../content/lexicon'

export function selectAge(character: RewriteCharacter): number {
  return Math.max(0, character.currentYear - character.birthYear)
}

export function soulMasterTitle(level: number): string {
  return rankTitleForLevel(level)
}

export function contestRecordLabel(character: RewriteCharacter): string {
  if (character.contestAppearances <= 0) return '尚未参赛'
  return `参赛 ${character.contestAppearances} 次 · 最佳 ${contestRankLabel(character.contestBestRank)}`
}
