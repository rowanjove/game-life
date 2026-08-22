import type { StorageLike } from '../storage/repository'

const memoryStorage = new Map<string, string>()

export function createRuntimeId(): string {
  const runtimeCrypto = globalThis.crypto
  if (typeof runtimeCrypto?.randomUUID === 'function') {
    return runtimeCrypto.randomUUID()
  }
  const random = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36)
  return `life-${Date.now().toString(36)}-${random}`
}

export function createResilientStorage(storage?: StorageLike | null): StorageLike {
  return {
    getItem(key) {
      try {
        return storage?.getItem(key) ?? memoryStorage.get(key) ?? null
      } catch {
        return memoryStorage.get(key) ?? null
      }
    },
    setItem(key, value) {
      memoryStorage.set(key, value)
      try {
        storage?.setItem(key, value)
      } catch {
        // Private browsing, quota pressure and embedded webviews can reject writes.
      }
    },
    removeItem(key) {
      memoryStorage.delete(key)
      try {
        storage?.removeItem(key)
      } catch {
        // The in-memory copy still keeps the current session playable.
      }
    },
  }
}
