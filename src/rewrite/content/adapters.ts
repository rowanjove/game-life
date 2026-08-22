import { allSpirits } from '../../data/character/spirits'
import { talentsByTier } from '../../data/character/talents'
import { endingDefinitions } from '../../data/endings/endings'
import { adultEvents } from '../../data/events/adult'
import { commonEvents } from '../../data/events/common'
import { highEvents } from '../../data/events/high'
import { middleEvents } from '../../data/events/middle'
import { primaryEvents } from '../../data/events/primary'
import { highSchools } from '../../data/schools/high'
import { middleSchools } from '../../data/schools/middle'
import { primarySchools } from '../../data/schools/primary'
import { heroTimeline } from '../../data/timeline/hero'
import { BASE_CREATION } from '../../data/packDefaults/creation'
import { BASE_NARRATIVE } from '../../data/packDefaults/narrative'
import {
  resetPackModules,
  setCreationContent,
  setNarrativeContent,
} from '../../content/activePack'
import type { ContentPack } from '../../content/packTypes'
import type {
  ContentEventEffect as EventEffect,
  ContentGameEvent as GameEvent,
  ContentSchool as School,
} from './types'
import type { SpiritCategory } from '../engine/model'

export type RewriteSpiritContent = {
  id: string
  name: string
  category: SpiritCategory
  quality: string
  description: string
  weight: number
}

export type RewriteTalentContent = {
  id: string
  name: string
  tier: 'ordinary' | 'good' | 'rare' | 'divine' | 'legendary'
  description: string
}

export type RewriteEndingContent = {
  id: string
  name: string
  title: string
  comment: string
}

export type RewriteSchoolContent = {
  id: string
  name: string
  tier: 'primary' | 'middle' | 'high'
  region: string
  location: string
  feature: string
  annualBonus: number
  tags: string[]
  minimumLevel: number | null
  selectionWeight: number
}

export type RewriteEffect =
  | { type: 'level'; amount: number }
  | { type: 'max-level'; amount: number }
  | { type: 'growth-multiplier'; amount: number }
  | { type: 'title' | 'flag' | 'item' | 'knowledge'; id: string }
  | { type: 'partner'; name: string }
  | { type: 'relationship'; faction: string; amount: number }
  | { type: 'hero-unlock' }
  | { type: 'queue-activity'; activity: unknown }
  | { type: 'composite'; effects: RewriteEffect[] }

export type RewriteEventChoice = {
  id: string
  label: string
  description: string
  effects: RewriteEffect[]
}

export type RewriteEventContent = {
  id: string
  stage: 'primary' | 'middle' | 'high' | 'adult' | 'common'
  name: string
  description: string
  weight: number
  requiredFlags: string[]
  forbiddenFlags: string[]
  choices: RewriteEventChoice[]
  effects: RewriteEffect[]
}

function assertUniqueIds(items: ReadonlyArray<{ id: string }>, label: string) {
  if (new Set(items.map((item) => item.id)).size !== items.length) {
    throw new Error(`${label}存在重复 ID`)
  }
}

function mapSpiritCategory(category: 'tool' | 'animal' | 'nature'): SpiritCategory {
  return category === 'animal' ? 'beast' : category
}

function adaptEffect(effect: EventEffect): RewriteEffect {
  switch (effect.type) {
    case 'soul-power':
      return { type: 'level', amount: effect.amount }
    case 'max-soul-power':
      return { type: 'max-level', amount: effect.amount }
    case 'growth-multiplier':
      return { type: effect.type, amount: effect.amount }
    case 'title':
    case 'flag':
    case 'item':
    case 'knowledge':
      return { type: effect.type, id: effect.id }
    case 'partner':
      return { type: effect.type, name: effect.name }
    case 'relationship':
      return { type: effect.type, faction: effect.faction, amount: effect.amount }
    case 'hero-unlock':
      return { type: effect.type }
    case 'queue-activity':
      return { type: effect.type, activity: structuredClone(effect.activity) }
    case 'composite':
      return { type: effect.type, effects: effect.effects.map(adaptEffect) }
  }
}

function adaptSchool(school: School): RewriteSchoolContent {
  return {
    id: school.id,
    name: school.name,
    tier: school.tier,
    region: school.region,
    location: school.location,
    feature: school.feature,
    annualBonus: school.annualBonus,
    tags: [...school.tags],
    minimumLevel: school.minimumSoulPower ?? null,
    selectionWeight: school.selectionWeight ?? 1,
  }
}

function adaptEvent(event: GameEvent): RewriteEventContent {
  return {
    id: event.id,
    stage: event.stage,
    name: event.name,
    description: event.description,
    weight: event.weight,
    requiredFlags: [...(event.requiredFlags ?? [])],
    forbiddenFlags: [...(event.forbiddenFlags ?? [])],
    effects: (event.effects ?? []).map(adaptEffect),
    choices: (event.choices ?? []).map((choice) => ({
      id: choice.id,
      label: choice.label,
      description: '',
      effects: choice.effects.map(adaptEffect),
    })),
  }
}

function buildSpirits(): RewriteSpiritContent[] {
  return allSpirits.map((option) => ({
    id: option.id,
    name: option.name,
    category: mapSpiritCategory(option.value.category),
    quality: option.value.quality,
    description: option.description,
    weight: option.weight,
  }))
}

function buildTalents(): RewriteTalentContent[] {
  return Object.values(talentsByTier).flat().map((talent) => ({ ...talent }))
}

function buildEndings(): RewriteEndingContent[] {
  return endingDefinitions.map((ending) => ({ ...ending }))
}

function buildSchools() {
  return {
    primary: Object.freeze(primarySchools.map(adaptSchool)),
    middle: Object.freeze(middleSchools.map(adaptSchool)),
    high: Object.freeze(highSchools.map(adaptSchool)),
  }
}

function buildEvents(): RewriteEventContent[] {
  return [
    ...primaryEvents,
    ...middleEvents,
    ...highEvents,
    ...adultEvents,
    ...commonEvents,
  ].map(adaptEvent)
}

export function buildBasePack(): ContentPack {
  return {
    id: 'base',
    name: '灵元人生',
    version: '1.1.0',
    spirits: buildSpirits(),
    talents: buildTalents(),
    endings: buildEndings(),
    schools: buildSchools(),
    events: buildEvents(),
    timeline: heroTimeline,
    creation: BASE_CREATION,
    narrative: BASE_NARRATIVE,
  }
}

export let rewriteSpirits: ReadonlyArray<RewriteSpiritContent> = Object.freeze(buildSpirits())
export let rewriteTalents: ReadonlyArray<RewriteTalentContent> = Object.freeze(buildTalents())
export let rewriteEndings: ReadonlyArray<RewriteEndingContent> = Object.freeze(buildEndings())
export let rewriteSchools = Object.freeze(buildSchools())
export let rewriteEvents: ReadonlyArray<RewriteEventContent> = Object.freeze(buildEvents())
export let rewriteTimeline = Object.freeze([...heroTimeline])

function validatePackContent(label: string): void {
  assertUniqueIds(rewriteSpirits, `${label}·命器`)
  assertUniqueIds(rewriteTalents, `${label}·天赋`)
  assertUniqueIds(rewriteEndings, `${label}·结局`)
  assertUniqueIds(
    [...rewriteSchools.primary, ...rewriteSchools.middle, ...rewriteSchools.high],
    `${label}·学校`,
  )
  assertUniqueIds(rewriteEvents, `${label}·事件`)
}

validatePackContent('基础包')

export function applyAdaptedPack(pack: ContentPack): void {
  rewriteSpirits = Object.freeze([...pack.spirits])
  rewriteTalents = Object.freeze([...pack.talents])
  rewriteEndings = Object.freeze([...pack.endings])
  rewriteSchools = Object.freeze({
    primary: Object.freeze([...pack.schools.primary]),
    middle: Object.freeze([...pack.schools.middle]),
    high: Object.freeze([...pack.schools.high]),
  })
  rewriteEvents = Object.freeze([...pack.events])
  rewriteTimeline = Object.freeze([...pack.timeline])
  if (pack.id === 'base' && !pack.creation && !pack.narrative) {
    resetPackModules()
  } else {
    setCreationContent(pack.creation ?? BASE_CREATION)
    setNarrativeContent(pack.narrative ?? BASE_NARRATIVE)
  }
  validatePackContent(pack.name)
}
