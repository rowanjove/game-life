export type HeroTimelineEntry = {
  year: number
  age: number
  event: string
}

/** Generic "era hero" timeline — no licensed IP. */
export const heroTimeline: HeroTimelineEntry[] = [
  { year: 1, age: 0, event: '时代传奇降生，命运的齿轮开始转动。' },
  { year: 6, age: 6, event: '时代传奇发现双命器，人生轨迹从此改变。' },
  { year: 13, age: 13, event: '时代传奇进入七星学院，与伙伴相遇。' },
  { year: 15, age: 15, event: '时代传奇参加大灵修联赛。' },
  { year: 18, age: 18, event: '七星战队成形，踏上全陆大赛。' },
  { year: 21, age: 21, event: '七星战队夺得全陆大赛冠军。' },
  { year: 24, age: 24, event: '挚友牺牲，时代传奇封闭自身。' },
  { year: 28, age: 28, event: '神位觉醒，时代传奇踏上封神之路。' },
  { year: 35, age: 35, event: '时代传奇迈向神王之路。' },
  { year: 42, age: 42, event: '时代传奇飞升天境。' },
]

export function heroEventAt(year: number): string {
  let current = '时代传奇尚未出生，大陆维持着旧日秩序。'
  for (const entry of heroTimeline) {
    if (year < entry.year) break
    current = entry.event
  }
  return current
}

/** @deprecated use heroEventAt — kept for engine call sites during migration */
export function tangSanEventAt(year: number): string {
  return heroEventAt(year)
}

export const tangSanTimeline = heroTimeline
