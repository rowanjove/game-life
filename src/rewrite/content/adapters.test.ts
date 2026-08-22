import { describe, expect, it } from 'vitest'
import {
  rewriteEndings,
  rewriteEvents,
  rewriteSchools,
  rewriteSpirits,
  rewriteTalents,
} from './adapters'

describe('rewrite content adapters', () => {
  it('preserves every approved content record with unique ids', () => {
    expect(rewriteSpirits).toHaveLength(90)
    expect(new Set(rewriteSpirits.map((item) => item.id)).size).toBe(90)
    expect(rewriteSchools.primary).toHaveLength(16)
    expect(rewriteSchools.middle).toHaveLength(16)
    expect(rewriteSchools.high).toHaveLength(16)
    expect(rewriteEvents).toHaveLength(136)
    expect(new Set(rewriteEvents.map((item) => item.id)).size).toBe(136)
    expect(rewriteTalents.length).toBeGreaterThan(0)
    expect(rewriteEndings).toHaveLength(12)
  })

  it('normalizes content into rewrite-owned values', () => {
    expect(rewriteSpirits.every((spirit) =>
      ['tool', 'beast', 'nature'].includes(spirit.category),
    )).toBe(true)
    expect(rewriteEvents.every((event) => Array.isArray(event.effects))).toBe(true)
    expect(rewriteEvents.every((event) => Array.isArray(event.choices))).toBe(true)
    expect(rewriteSpirits.every((spirit) => spirit.name.length > 0)).toBe(true)
  })

  it('freezes top-level content collections', () => {
    expect(Object.isFrozen(rewriteSpirits)).toBe(true)
    expect(Object.isFrozen(rewriteEvents)).toBe(true)
    expect(Object.isFrozen(rewriteSchools.primary)).toBe(true)
  })
})
