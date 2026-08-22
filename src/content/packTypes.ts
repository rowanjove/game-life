import type { Lexicon } from './lexicon'
import type {
  RewriteEndingContent,
  RewriteEventContent,
  RewriteSchoolContent,
  RewriteSpiritContent,
  RewriteTalentContent,
} from '../rewrite/content/adapters'
import type { Race, SpiritCategory } from '../rewrite/engine/model'

export type TimelineEntry = {
  year: number
  age: number
  event: string
}

export type CreationTimelineOption = {
  id: string
  name: string
  weight: number
  year: number
  description?: string
}

export type CreationBirthPlaceOption = {
  id: string
  name: string
  weight: number
  description?: string
}

export type CreationRaceOption = {
  id: string
  race: Race
  raceName: string
  weight: number
  description?: string
}

export type CreationCategoryOption = {
  id: string
  name: string
  description: string
  weight: number
  color: string
  value: SpiritCategory
}

export type CreationSpiritCountOption = {
  id: string
  name: string
  description: string
  weight: number
  color: string
  value: 1 | 2 | 3 | 4
}

export type CreationContent = {
  pastels?: readonly string[]
  looksWeights?: readonly number[]
  looksDescriptionTemplate?: string
  timelines: readonly CreationTimelineOption[]
  birthPlaces: readonly CreationBirthPlaceOption[]
  races: readonly CreationRaceOption[]
  spiritCategories: readonly CreationCategoryOption[]
  spiritCounts: readonly CreationSpiritCountOption[]
  talentNone?: {
    name: string
    description: string
    weight: number
    color?: string
  }
  innatePowerDescription?: string
}

export type HeroPowerBand = {
  /** exclusive upper bound on year; use Infinity for last band */
  untilYear: number
  power: number
}

export type HeroOutcomeCopy = {
  name: string
  description: string
  color: string
}

export type HeroOpportunitySeed = {
  id: string
  name: string
  description: string
  weight: number
  color: string
  value:
    | { kind: 'level'; amount: number }
    | { kind: 'title'; id: string }
    | { kind: 'knowledge'; id: string }
    | { kind: 'reputation'; amount: number }
    | { kind: 'bone'; quality: 'rare' | 'legendary' }
}

export type ContestOutcomeCopy = {
  id: string
  name: string
  description: string
  color: string
}

export type NarrativeContent = {
  hero: {
    powerBands: readonly HeroPowerBand[]
    outcomes: {
      win: HeroOutcomeCopy
      draw: HeroOutcomeCopy
      loss: HeroOutcomeCopy
    }
    opportunities: readonly HeroOpportunitySeed[]
    drawTitle: string
    boneSource: string
  }
  yearAdvance: {
    /** placeholders: {calendar} {year} {age} {growth} {hero} {heroEvent} */
    calendarLine: string
    ageLine: string
    growthLine: string
    heroLine: string
  }
  lateGame: {
    earlyContestYes: { name: string; description: string; weight: number; color: string }
    earlyContestNo: { name: string; description: string; weight: number; color: string }
    ascensionYes: { name: string; description: string; weight: number; color: string }
    ascensionNo: { name: string; description: string; weight: number; color: string }
  }
  contestOutcomes: Record<
    'crush-win' | 'win' | 'narrow-win' | 'draw' | 'narrow-loss' | 'crush-loss',
    ContestOutcomeCopy
  >
}

export type ContentPack = {
  id: string
  name: string
  version: string
  copyrightNotice?: string
  spirits: readonly RewriteSpiritContent[]
  talents: readonly RewriteTalentContent[]
  endings: readonly RewriteEndingContent[]
  schools: {
    primary: readonly RewriteSchoolContent[]
    middle: readonly RewriteSchoolContent[]
    high: readonly RewriteSchoolContent[]
  }
  events: readonly RewriteEventContent[]
  timeline: readonly TimelineEntry[]
  creation?: CreationContent
  narrative?: NarrativeContent
  lexicon?: Partial<Lexicon>
}

export type ContentPackManifest = {
  id: string
  name: string
  version: string
  copyrightNotice?: string
  entry: string
  /** SHA-256 hex of canonical pack.json bytes */
  sha256?: string
  /** HMAC-SHA256 hex of pack.json (optional, signed at build time) */
  hmac?: string
  /** key id used for HMAC, default game-life-v1 */
  keyId?: string
}

export type PackCatalogEntry = {
  id: string
  name: string
  version: string
  description?: string
  /** relative to origin or absolute URL */
  url: string
  sha256?: string
  copyrightNotice?: string
}

export type PackCatalog = {
  version: number
  packs: PackCatalogEntry[]
}
