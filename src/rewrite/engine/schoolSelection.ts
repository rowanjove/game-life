import { rewriteSchools, type RewriteSchoolContent } from '../content/adapters'
import type { Region } from '../content/types'
import type { RewriteRun } from './model'

type SchoolTier = 'primary' | 'middle' | 'high'

export function birthRegion(birthPlace: string): Region | null {
  if (
    birthPlace.includes('天斗') ||
    birthPlace.includes('圣魂') ||
    birthPlace.includes('圣殿') ||
    birthPlace.includes('极北') ||
    birthPlace.includes('森林')
  ) {
    return 'heaven-dou'
  }
  if (birthPlace.includes('星罗')) return 'star-luo'
  if (birthPlace.includes('月弦')) return 'moon-string'
  if (birthPlace.includes('远东') || birthPlace.includes('海神岛')) return 'far-east'
  return null
}

function schoolTier(run: RewriteRun): SchoolTier {
  if (run.flow.phase === 'primary-school') return 'primary'
  if (run.flow.phase === 'middle-school') return 'middle'
  if (run.flow.phase === 'high-school') return 'high'
  throw new Error('当前不在学校阶段')
}

export function eligibleSchools(run: RewriteRun): RewriteSchoolContent[] {
  const tier = schoolTier(run)
  const pool = rewriteSchools[tier]
  const { level } = run.character
  const eligible = pool.filter((school) =>
    school.minimumLevel === null || level >= school.minimumLevel,
  )
  if (eligible.length > 0) return eligible
  return [...pool].sort((left, right) =>
    (left.minimumLevel ?? 0) - (right.minimumLevel ?? 0),
  )
}

export function schoolSelectionWeight(
  run: RewriteRun,
  school: RewriteSchoolContent,
): number {
  const home = birthRegion(run.character.birthPlace)
  let weight = school.selectionWeight
  if (home && school.region === home) weight *= 1.6
  if (school.id === 'high-shrek' && run.character.level < 50) weight *= 0.05
  if (school.tags.includes('原著') && run.character.level >= 45) weight *= 1.4
  return weight
}

export function schoolWheelCandidates(run: RewriteRun): RewriteSchoolContent[] {
  const eligible = eligibleSchools(run)
  if (eligible.length === 0) {
    throw new Error('当前阶段没有可选择的学院')
  }
  const offset = Math.abs(run.seed + run.character.currentYear) % eligible.length
  const weighted = [...eligible].sort((left, right) =>
    schoolSelectionWeight(run, right) - schoolSelectionWeight(run, left),
  )
  const picks: RewriteSchoolContent[] = []
  for (let index = 0; index < eligible.length && picks.length < 4; index += 1) {
    const school = weighted[(offset + index) % weighted.length]
    if (!picks.some((pick) => pick.id === school.id)) {
      picks.push(school)
    }
  }
  return picks
}

export function currentSchoolAnnualBonus(run: RewriteRun): number {
  const record = run.character.schoolRecords.at(-1)
  if (!record || record.endYear !== null) return 0
  const pools = [
    ...rewriteSchools.primary,
    ...rewriteSchools.middle,
    ...rewriteSchools.high,
  ]
  return pools.find((school) => school.id === record.schoolId)?.annualBonus ?? 0
}

export function bonusEventCount(flags: readonly string[]): number {
  let bonus = 0
  if (flags.includes('extra-events-2')) bonus += 2
  if (flags.includes('extra-event')) bonus += 1
  return bonus
}

const mentorYearStages: ReadonlyArray<readonly [current: string, next: string | null, bonus: number]> = [
  ['teacher-training-3-years', 'teacher-training-2-years', 2],
  ['teacher-training-2-years', 'teacher-training-1-year', 2],
  ['teacher-training-1-year', null, 2],
  ['mentor-three-years', 'mentor-two-years', 2],
  ['mentor-two-years', 'mentor-one-year', 2],
  ['mentor-one-year', null, 2],
]

export function mentorTrainingLabel(flags: readonly string[]): string | null {
  if (flags.includes('teacher-training-3-years') || flags.includes('mentor-three-years')) {
    return '师承三年'
  }
  if (flags.includes('teacher-training-2-years') || flags.includes('mentor-two-years')) {
    return '师承两年'
  }
  if (flags.includes('teacher-training-1-year') || flags.includes('mentor-one-year')) {
    return '师承一年'
  }
  return null
}

export function advanceMentorYearFlags(
  flags: readonly string[],
): { bonus: number; flags: string[] } {
  for (const [current, nextFlag, bonus] of mentorYearStages) {
    if (!flags.includes(current)) continue
    const updated = flags.filter((flag) => flag !== current)
    if (nextFlag) updated.push(nextFlag)
    return { bonus, flags: updated }
  }
  return { bonus: 0, flags: [...flags] }
}