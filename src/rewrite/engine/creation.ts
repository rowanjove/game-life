import {
  rewriteSpirits,
  rewriteTalents,
  type RewriteSpiritContent,
} from '../content/adapters'
import { getCreationContent } from '../../content/activePack'
import { getLexicon } from '../../content/lexicon'
import type {
  Race,
  RewriteRun,
  SpiritCategory,
  SpiritState,
} from './model'

export type WheelOption<T = unknown> = {
  id: string
  name: string
  description: string
  weight: number
  color: string
  value: T
}

function pastels(): readonly string[] {
  return getCreationContent().pastels ?? ['#e8f2ff', '#f8edf4', '#eeeafd', '#f8f9fc', '#eaf5f5']
}

function pastelAt(index: number): string {
  const colors = pastels()
  return colors[index % colors.length]
}

function looksOptions(): WheelOption<number>[] {
  const creation = getCreationContent()
  const weights = creation.looksWeights ?? [2, 5, 12, 18, 22, 18, 12, 6, 4, 1]
  const template = creation.looksDescriptionTemplate ?? '命运赋予你 {value} 分容貌。'
  return Array.from({ length: 10 }, (_, index) => {
    const value = index + 1
    return {
      id: `looks-${value}`,
      name: `${value}分`,
      description: template.replace('{value}', String(value)),
      weight: weights[index] ?? 1,
      color: pastelAt(index),
      value,
    }
  })
}

function timelineOptions(): WheelOption<{ label: string; year: number }>[] {
  return getCreationContent().timelines.map((option, index) => ({
    id: option.id.startsWith('timeline-') ? option.id : `timeline-${option.id}`,
    name: option.name,
    description: option.description ?? `你出生于${option.name}。`,
    weight: option.weight,
    color: pastelAt(index),
    value: { label: option.name, year: option.year },
  }))
}

function birthPlaceOptions(): WheelOption<string>[] {
  return getCreationContent().birthPlaces.map((option, index) => ({
    id: option.id.startsWith('birth-') ? option.id : `birth-${option.id}`,
    name: option.name,
    description: option.description ?? `${option.name}将成为你的故乡。`,
    weight: option.weight,
    color: pastelAt(index),
    value: option.name,
  }))
}

function raceOptions(): WheelOption<{ race: Race; raceName: string }>[] {
  return getCreationContent().races.map((option, index) => ({
    id: option.id.startsWith('race-') ? option.id : `race-${option.id}`,
    name: option.raceName,
    description: option.description ?? `${option.raceName}血脉将影响你的成长道路。`,
    weight: option.weight,
    color: pastelAt(index),
    value: { race: option.race, raceName: option.raceName },
  }))
}

function categoryOptions(): WheelOption<SpiritCategory>[] {
  return getCreationContent().spiritCategories.map((option) => ({
    id: option.id,
    name: option.name,
    description: option.description,
    weight: option.weight,
    color: option.color,
    value: option.value,
  }))
}

export function spiritCountOptions(): WheelOption<1 | 2 | 3 | 4>[] {
  return getCreationContent().spiritCounts.map((option) => ({
    id: option.id,
    name: option.name,
    description: option.description,
    weight: option.weight,
    color: option.color,
    value: option.value,
  }))
}

function toSpiritState(spirit: RewriteSpiritContent): SpiritState {
  return {
    id: spirit.id,
    name: spirit.name,
    category: spirit.category,
    quality: spirit.quality,
    evolvedFrom: null,
    fusionIds: [],
  }
}

export function spiritOptions(
  run: RewriteRun,
  category: SpiritCategory,
): WheelOption<SpiritState>[] {
  const ownedIds = new Set(run.character.spirits.map((spirit) => spirit.id))
  return rewriteSpirits
    .filter((spirit) => spirit.category === category && !ownedIds.has(spirit.id))
    .map((spirit) => ({
      id: spirit.id,
      name: spirit.name,
      description: spirit.description,
      weight: spirit.weight,
      color: category === 'tool' ? '#d9bb78' : category === 'beast' ? '#f2cfe0' : '#9fd8f7',
      value: toSpiritState(spirit),
    }))
}

function innatePowerOptions(run: RewriteRun): WheelOption<number>[] {
  const bonus = Math.max(0, run.character.spiritCount - 1) * 2
  const description = getCreationContent().innatePowerDescription
    ?? '先天灵力决定修炼起点。'
  return Array.from({ length: 40 }, (_, index) => {
    const value = index + 1
    return {
      id: `power-${value}`,
      name: `${value}级`,
      description,
      weight: Math.max(1, 41 - Math.abs(12 + bonus - value) * 2),
      color: value >= 30 ? '#d9bb78' : value >= 20 ? '#cfc8ef' : '#9fd8f7',
      value,
    }
  })
}

function talentOptions(): WheelOption<string | null>[] {
  const none = getCreationContent().talentNone ?? {
    name: '无特殊天赋',
    description: '平凡的起点也能走出传奇。',
    weight: 60,
    color: '#d7e2ec',
  }
  return [
    {
      id: 'talent-none',
      name: none.name,
      description: none.description,
      weight: none.weight,
      color: none.color ?? '#d7e2ec',
      value: null,
    },
    ...rewriteTalents.map((talent) => ({
      id: talent.id,
      name: talent.name,
      description: talent.description,
      weight: talent.tier === 'legendary'
        ? 0.5 / 3
        : talent.tier === 'divine'
          ? 1.5 / 4
          : talent.tier === 'rare'
            ? 6 / 5
            : talent.tier === 'good'
              ? 12 / 5
              : 20 / 5,
      color: talent.tier === 'legendary' ? '#d9bb78' : '#cfc8ef',
      value: talent.id,
    })),
  ]
}

export function creationWheelOptions(run: RewriteRun): WheelOption[] {
  if (run.flow.phase !== 'creation') throw new Error('当前不在角色创建流程')
  const step = run.flow.step
  if (step === 'looks') return looksOptions()
  if (step === 'timeline') return timelineOptions()
  if (step === 'birth-place') return birthPlaceOptions()
  if (step === 'race') return raceOptions()
  if (step === 'spirit-count') return spiritCountOptions()
  if (/^spirit-\d+-category$/.test(step)) return categoryOptions()
  if (/^spirit-\d+$/.test(step)) {
    const index = Number(step.match(/\d+/)?.[0] ?? 1) - 1
    const category = run.creation.spiritCategories[index]
    if (!category) {
      throw new Error(`尚未确定${getLexicon().spiritLabel}类别`)
    }
    return spiritOptions(run, category)
  }
  if (step === 'innate-power') return innatePowerOptions(run)
  if (step === 'talent') return talentOptions()
  throw new Error('当前步骤不是转盘')
}
