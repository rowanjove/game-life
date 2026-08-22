import type { WheelOption } from './creation'
import type { Flow, RewriteCharacter, RewriteRun } from './model'
import type { ReplayableRng } from './rng'
import { createSeededRng } from './rng'

export type SoulBoneSlot =
  | 'head'
  | 'torso'
  | 'left-arm'
  | 'right-arm'
  | 'left-leg'
  | 'right-leg'
  | 'wing'

export type SoulBoneQuality =
  | 'common'
  | 'refined'
  | 'rare'
  | 'legendary'
  | 'divine'

export type SoulBoneState = {
  id: string
  slot: SoulBoneSlot
  quality: SoulBoneQuality
  name: string
  source: string
}

export type SoulBoneMap = Record<SoulBoneSlot, SoulBoneState | null>

export const SOUL_BONE_SLOTS: SoulBoneSlot[] = [
  'head',
  'torso',
  'left-arm',
  'right-arm',
  'left-leg',
  'right-leg',
  'wing',
]

export const SLOT_LABELS: Record<SoulBoneSlot, string> = {
  head: '头骨',
  torso: '躯干骨',
  'left-arm': '左臂骨',
  'right-arm': '右臂骨',
  'left-leg': '左腿骨',
  'right-leg': '右腿骨',
  wing: '翅骨',
}

export const QUALITY_LABELS: Record<SoulBoneQuality, string> = {
  common: '普通',
  refined: '精良',
  rare: '罕见',
  legendary: '传世',
  divine: '神级',
}

const BONE_NAMES: Record<SoulBoneQuality, string[]> = {
  common: ['青岩骨', '沉铁骨', '雾影骨'],
  refined: ['玄冰骨', '炎阳骨', '雷鸣骨'],
  rare: ['幽冥翼骨', '龙纹骨', '星辉骨'],
  legendary: ['天青神骨', '修罗骨', '天使神骨'],
  divine: ['海神骨', '修罗神骨', '创世骨'],
}

export function emptySoulBones(): SoulBoneMap {
  return {
    head: null,
    torso: null,
    'left-arm': null,
    'right-arm': null,
    'left-leg': null,
    'right-leg': null,
    wing: null,
  }
}

export function normalizeSoulBones(
  value: Partial<SoulBoneMap> | undefined,
): SoulBoneMap {
  const base = emptySoulBones()
  if (!value) return base
  for (const slot of SOUL_BONE_SLOTS) {
    if (value[slot]) base[slot] = value[slot]
  }
  return base
}

export function soulBonePowerBonus(character: RewriteCharacter): number {
  return occupiedBoneCount(character) * 200
}

export function occupiedBoneCount(character: RewriteCharacter): number {
  const bones = normalizeSoulBones(character.soulBones)
  return SOUL_BONE_SLOTS.filter((slot) => bones[slot] !== null).length
}

function boneChanceBonus(talentId: string | null): number {
  return talentId === 'sensitive-smell' ? 15 : 0
}

function createBone(
  slot: SoulBoneSlot,
  quality: SoulBoneQuality,
  source: string,
  rng: ReplayableRng,
): SoulBoneState {
  const names = BONE_NAMES[quality]
  const name = names[rng.integer(0, names.length - 1)]
  return {
    id: `bone-${slot}-${quality}-${rng.integer(1, 9999)}`,
    slot,
    quality,
    name,
    source,
  }
}

function pickEmptySlot(character: RewriteCharacter, rng: ReplayableRng): SoulBoneSlot | null {
  const bones = normalizeSoulBones(character.soulBones)
  const empty = SOUL_BONE_SLOTS.filter((slot) => bones[slot] === null)
  if (empty.length === 0) return null
  return empty[rng.integer(0, empty.length - 1)]
}

function rollChance(percent: number, talentId: string | null, rng: ReplayableRng): boolean {
  const adjusted = Math.min(95, percent + boneChanceBonus(talentId))
  return rng.next() * 100 < adjusted
}

type BoneRollSpec = { quality: SoulBoneQuality; chance: number; source: string }

function parseBoneRollFlag(flag: string): BoneRollSpec | null {
  const match = flag.match(/^roll-(common|refined|rare|legendary|divine)(?:-soul)?-bone-(\d+)$/)
  if (!match) return null
  return {
    quality: match[1] as SoulBoneQuality,
    chance: Number(match[2]),
    source: flag,
  }
}

const SPECIAL_BONE_FLAGS: Record<string, BoneRollSpec> = {
  'rare-bone-auction': { quality: 'rare', chance: 35, source: '灵骨拍卖' },
  'divine-bone-clue': { quality: 'divine', chance: 10, source: '神王古墓' },
  'tiny-bone-chance': { quality: 'rare', chance: 5, source: '灵兽大战' },
}

export function awardSoulBone(
  character: RewriteCharacter,
  quality: SoulBoneQuality,
  source: string,
  rng: ReplayableRng,
): { character: RewriteCharacter; candidate: SoulBoneState | null; slot: SoulBoneSlot | null } {
  const slot = pickEmptySlot(character, rng)
  if (!slot) return { character, candidate: null, slot: null }
  const candidate = createBone(slot, quality, source, rng)
  const bones = normalizeSoulBones(character.soulBones)
  return {
    character: { ...character, soulBones: { ...bones, [slot]: candidate } },
    candidate,
    slot,
  }
}

export function replaceSoulBone(
  character: RewriteCharacter,
  slot: SoulBoneSlot,
  candidate: SoulBoneState,
): RewriteCharacter {
  const bones = normalizeSoulBones(character.soulBones)
  return { ...character, soulBones: { ...bones, [slot]: candidate } }
}

export function queueSoulBoneChoice(
  run: RewriteRun,
  slot: SoulBoneSlot,
  candidate: SoulBoneState,
  returnTo: Flow,
): RewriteRun {
  return {
    ...run,
    flow: { phase: run.flow.phase, step: 'soul-bone-choice', status: 'ready' },
    stack: [
      ...run.stack,
      {
        returnTo,
        queue: [],
        context: {
          boneSlot: slot,
          boneId: candidate.id,
          boneQuality: candidate.quality,
          boneName: candidate.name,
          boneSource: candidate.source,
        },
      },
    ],
    pending: null,
  }
}

export function soulBoneChoiceOptions(
  run: RewriteRun,
): WheelOption<'keep' | 'replace'>[] {
  const frame = run.stack.at(-1)
  const slot = frame?.context.boneSlot as SoulBoneSlot | undefined
  const candidateName = String(frame?.context.boneName ?? '新灵骨')
  const current = slot ? normalizeSoulBones(run.character.soulBones)[slot] : null
  return [
    {
      id: 'bone-keep',
      name: '保留旧骨',
      description: current
        ? `继续携带${current.name}。`
        : '维持当前状态。',
      weight: 50,
      color: '#cfc8ef',
      value: 'keep',
    },
    {
      id: 'bone-replace',
      name: '替换灵骨',
      description: `以${candidateName}替换该部位灵骨。`,
      weight: 50,
      color: '#b9dff5',
      value: 'replace',
    },
  ]
}

export function confirmSoulBoneChoice(
  run: RewriteRun,
  choice: 'keep' | 'replace',
): RewriteRun {
  const frame = run.stack.at(-1)
  if (!frame || run.flow.step !== 'soul-bone-choice') {
    throw new Error('当前不在灵骨抉择')
  }
  const slot = frame.context.boneSlot as SoulBoneSlot
  let character = run.character
  if (choice === 'replace') {
    character = replaceSoulBone(character, slot, {
      id: String(frame.context.boneId),
      slot,
      quality: frame.context.boneQuality as SoulBoneQuality,
      name: String(frame.context.boneName),
      source: String(frame.context.boneSource),
    })
  }
  return {
    ...run,
    character,
    flow: frame.returnTo,
    stack: run.stack.slice(0, -1),
    pending: null,
  }
}

export function tryRollSoulBone(
  run: RewriteRun,
  spec: BoneRollSpec,
): RewriteRun {
  const rng = createSeededRng(run.seed, run.rngCursor)
  if (!rollChance(spec.chance, run.character.talentId, rng)) {
    return { ...run, rngCursor: rng.cursor() }
  }

  const slot = pickEmptySlot(run.character, rng)
  const candidate = slot
    ? createBone(slot, spec.quality, spec.source, rng)
    : null
  const cursor = rng.cursor()

  if (!slot || !candidate) {
    const bones = normalizeSoulBones(run.character.soulBones)
    const occupied = SOUL_BONE_SLOTS.filter((entry) => bones[entry] !== null)
    if (occupied.length === 0) {
      return { ...run, rngCursor: cursor }
    }
    const conflictSlot = occupied[rng.integer(0, occupied.length - 1)]
    const conflictCandidate = createBone(conflictSlot, spec.quality, spec.source, rng)
    return queueSoulBoneChoice(
      { ...run, rngCursor: cursor },
      conflictSlot,
      conflictCandidate,
      run.flow,
    )
  }

  const character = replaceSoulBone(run.character, slot, candidate)
  return {
    ...run,
    rngCursor: cursor,
    character: {
      ...character,
      flags: [...new Set([...character.flags, `gained-bone-${spec.quality}`])],
    },
  }
}

export function resolveBoneRollFlags(run: RewriteRun): RewriteRun {
  const processed = new Set<string>()
  let next = run
  for (const flag of run.character.flags) {
    if (processed.has(flag)) continue
    const spec = parseBoneRollFlag(flag) ?? SPECIAL_BONE_FLAGS[flag]
    if (!spec) continue
    processed.add(flag)
    next = tryRollSoulBone(next, spec)
    next = {
      ...next,
      character: {
        ...next.character,
        flags: next.character.flags.filter((entry) => entry !== flag),
      },
    }
  }
  return next
}