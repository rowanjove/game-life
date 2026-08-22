import { describe, expect, it } from 'vitest'
import { createRun } from './factory'
import {
  emptySoulBones,
  resolveBoneRollFlags,
  soulBonePowerBonus,
  tryRollSoulBone,
} from './soulBones'

describe('soul bones', () => {
  it('awards a bone when roll flags succeed', () => {
    const run = createRun(99, '2026-06-20T00:00:00.000Z', 'run-1')
    const rolled = tryRollSoulBone(
      {
        ...run,
        character: {
          ...run.character,
          flags: ['roll-common-soul-bone-30'],
        },
      },
      { quality: 'common', chance: 100, source: '测试' },
    )

    expect(rolled.character.soulBones).not.toEqual(emptySoulBones())
    expect(soulBonePowerBonus(rolled.character)).toBe(200)
  })

  it('resolves event bone flags after special events', () => {
    const run = createRun(7, '2026-06-20T00:00:00.000Z', 'run-1')
    const resolved = resolveBoneRollFlags({
      ...run,
      character: {
        ...run.character,
        flags: ['roll-refined-bone-50'],
      },
    })

    expect(resolved.character.flags).not.toContain('roll-refined-bone-50')
  })
})