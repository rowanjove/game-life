import { describe, expect, it } from 'vitest'
import { createResilientStorage, createRuntimeId } from './runtime'

describe('runtime adapters', () => {
  it('keeps the game playable when persistent storage throws', () => {
    const unavailable = {
      getItem() { throw new Error('blocked') },
      setItem() { throw new Error('quota') },
      removeItem() { throw new Error('blocked') },
    }
    const storage = createResilientStorage(unavailable)
    storage.setItem('runtime-test', 'saved')
    expect(storage.getItem('runtime-test')).toBe('saved')
    storage.removeItem('runtime-test')
    expect(storage.getItem('runtime-test')).toBeNull()
  })

  it('creates a non-empty id even without randomUUID', () => {
    expect(createRuntimeId()).toMatch(/\S+/)
  })
})
