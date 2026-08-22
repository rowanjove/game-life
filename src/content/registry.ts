import type { ContentPack } from './packTypes'
import { getLexicon, resetLexicon, setLexicon } from './lexicon'
import {
  applyAdaptedPack,
  buildBasePack,
  type RewriteEndingContent,
  type RewriteEventContent,
  type RewriteSchoolContent,
  type RewriteSpiritContent,
  type RewriteTalentContent,
} from '../rewrite/content/adapters'
import type { TimelineEntry } from './packTypes'
import { sha256Hex } from './integrity'
import { validateContentPack } from './validatePack'

export type ActiveContent = {
  packId: string
  packName: string
  packVersion: string
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
}

const STORAGE_KEY = 'game-life:active-pack-id'
const PACK_CACHE_KEY = 'game-life:cached-pack'
const PACK_HASH_KEY = 'game-life:cached-pack-sha256'
const LEGACY_STORAGE_KEY = 'game-life:active-pack-id'

let active: ActiveContent = fromPack(buildBasePack())

function fromPack(pack: ContentPack): ActiveContent {
  return {
    packId: pack.id,
    packName: pack.name,
    packVersion: pack.version,
    spirits: pack.spirits,
    talents: pack.talents,
    endings: pack.endings,
    schools: pack.schools,
    events: pack.events,
    timeline: pack.timeline,
  }
}

export function getActiveContent(): ActiveContent {
  return active
}

export function getActivePackId(): string {
  return active.packId
}

export function applyContentPack(
  pack: ContentPack,
  options?: {
    persist?: boolean
    cache?: boolean
    integritySha256?: string
  },
): void {
  // Re-validate even if caller claims it's a pack
  const safe = pack.id === 'base' ? pack : validateContentPack(pack)
  setLexicon(safe.lexicon)
  applyAdaptedPack(safe)
  active = fromPack(safe)

  if (options?.persist !== false && typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, safe.id)
    if (options?.cache !== false && safe.id !== 'base') {
      const text = JSON.stringify(safe)
      localStorage.setItem(PACK_CACHE_KEY, text)
      const hash = options?.integritySha256
      if (hash) {
        localStorage.setItem(PACK_HASH_KEY, hash)
      } else {
        void sha256Hex(text).then((digest) => {
          localStorage.setItem(PACK_HASH_KEY, digest)
        })
      }
    }
    if (safe.id === 'base') {
      localStorage.removeItem(PACK_CACHE_KEY)
      localStorage.removeItem(PACK_HASH_KEY)
    }
  }
}

export function resetToBasePack(): void {
  resetLexicon()
  const base = buildBasePack()
  applyContentPack(base, { cache: false })
}

/**
 * Restore last non-base pack from localStorage.
 * Re-validates schema + optional sha256. On failure, falls back to base.
 * Call this BEFORE creating the game store.
 */
export function restorePackPreference(): void {
  if (typeof localStorage === 'undefined') {
    resetToBasePack()
    return
  }
  const id = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
  if (!id || id === 'base') {
    resetToBasePack()
    return
  }
  const cached = localStorage.getItem(PACK_CACHE_KEY)
  const expectedHash = localStorage.getItem(PACK_HASH_KEY)
  if (!cached) {
    resetToBasePack()
    return
  }
  try {
    const parsed = JSON.parse(cached) as unknown
    const pack = validateContentPack(parsed)
    if (pack.id !== id) {
      resetToBasePack()
      return
    }
    if (expectedHash) {
      // Synchronous path: we cannot await here; hash is verified async on install.
      // For restore, re-hash synchronously via a blocking promise is awkward —
      // use a simple string equality check after deferred validation in apply.
    }
    applyContentPack(pack, {
      persist: false,
      integritySha256: expectedHash ?? undefined,
    })
    // Async integrity re-check; drop pack if tampered
    if (expectedHash) {
      void sha256Hex(cached).then((hash) => {
        if (hash.toLowerCase() !== expectedHash.toLowerCase()) {
          resetToBasePack()
        }
      })
    }
  } catch {
    resetToBasePack()
  }
}

export function currentLexicon() {
  return getLexicon()
}
