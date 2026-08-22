import { describe, expect, it } from 'vitest'
import { buildBasePack } from '../rewrite/content/adapters'
import { validateContentPack } from './validatePack'

describe('validateContentPack', () => {
  it('accepts the base pack', () => {
    const pack = validateContentPack(buildBasePack())
    expect(pack.id).toBe('base')
    expect(pack.spirits.length).toBeGreaterThan(0)
  })

  it('rejects unknown effect types', () => {
    const pack = buildBasePack()
    const broken = {
      ...pack,
      events: [
        {
          ...pack.events[0],
          id: 'evil-event',
          effects: [{ type: 'rm-rf', amount: 1 }],
        },
      ],
    }
    expect(() => validateContentPack(broken)).toThrow(/未知 effect/)
  })

  it('rejects duplicate spirit ids', () => {
    const pack = buildBasePack()
    const spirit = pack.spirits[0]
    const broken = {
      ...pack,
      spirits: [spirit, { ...spirit }],
    }
    expect(() => validateContentPack(broken)).toThrow(/重复/)
  })
})
