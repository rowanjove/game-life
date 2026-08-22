/**
 * Content pack integrity helpers.
 *
 * IMPORTANT (open-source / client-side limits):
 * - SHA-256 detects accidental corruption.
 * - HMAC-SHA256 in the browser is NOT a trust root: any secret shipped to the
 *   client can be extracted and used to forge signatures.
 * - Treat signatures as optional “tamper-evident for honest users”, never as
 *   authorization for untrusted third-party packs.
 *
 * Override demo key via window.__GAME_LIFE_PACK_HMAC_KEY__ or VITE_PACK_HMAC_KEY
 * only if you understand the above limitation.
 */

const DEFAULT_KEY_ID = 'game-life-v1'
/** Public demo key for local catalog packs only — not a security boundary. */
const DEFAULT_HMAC_KEY = 'game-life-pack-signing-demo-key-v1'

export type IntegrityReport = {
  ok: boolean
  sha256: string
  expectedSha256?: string
  hmacOk?: boolean
  warnings: string[]
  errors: string[]
}

function getHmacKeyMaterial(): string {
  if (typeof globalThis !== 'undefined') {
    const w = globalThis as { __GAME_LIFE_PACK_HMAC_KEY__?: string }
    if (w.__GAME_LIFE_PACK_HMAC_KEY__) return w.__GAME_LIFE_PACK_HMAC_KEY__
  }
  try {
    const env = (import.meta as { env?: Record<string, string> }).env
    if (env?.VITE_PACK_HMAC_KEY) return env.VITE_PACK_HMAC_KEY
  } catch {
    /* ignore */
  }
  return DEFAULT_HMAC_KEY
}

export async function sha256Hex(bytes: ArrayBuffer | Uint8Array | string): Promise<string> {
  const data = typeof bytes === 'string'
    ? new TextEncoder().encode(bytes)
    : bytes instanceof Uint8Array
      ? bytes
      : new Uint8Array(bytes)
  const digest = await crypto.subtle.digest('SHA-256', data as BufferSource)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function hmacSha256Hex(
  message: string | Uint8Array,
  keyMaterial: string = getHmacKeyMaterial(),
): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(keyMaterial),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const data = typeof message === 'string' ? new TextEncoder().encode(message) : message
  const sig = await crypto.subtle.sign('HMAC', key, data as BufferSource)
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export type ManifestIntegrity = {
  sha256?: string
  hmac?: string
  keyId?: string
}

/**
 * Canonicalize pack JSON for hashing: stable stringify of parsed object.
 * Prefer hashing the raw file text when available (build script uses raw bytes).
 */
export async function verifyPackIntegrity(
  packText: string,
  manifest: ManifestIntegrity | null,
  options?: { requireSignature?: boolean; expectedSha256?: string },
): Promise<IntegrityReport> {
  const warnings: string[] = []
  const errors: string[] = []
  const sha256 = await sha256Hex(packText)
  const expectedSha256 = options?.expectedSha256 ?? manifest?.sha256

  if (expectedSha256 && expectedSha256.toLowerCase() !== sha256) {
    errors.push(`内容摘要不匹配（期望 ${expectedSha256.slice(0, 12)}…，实际 ${sha256.slice(0, 12)}…）`)
  } else if (!expectedSha256) {
    warnings.push('扩展包未提供 SHA-256，已跳过完整性对照')
  }

  let hmacOk: boolean | undefined
  if (manifest?.hmac) {
    const keyId = manifest.keyId || DEFAULT_KEY_ID
    if (keyId !== DEFAULT_KEY_ID) {
      warnings.push(`未知签名密钥 ${keyId}，仍用默认密钥尝试校验`)
    }
    const expected = await hmacSha256Hex(packText)
    hmacOk = expected.toLowerCase() === manifest.hmac.toLowerCase()
    if (!hmacOk) {
      errors.push('HMAC 签名校验失败，扩展包可能被篡改')
    }
  } else if (options?.requireSignature) {
    errors.push('需要签名的扩展包缺少 hmac 字段')
  } else {
    warnings.push('扩展包未签名（HMAC），仅作摘要校验或跳过')
  }

  return {
    ok: errors.length === 0,
    sha256,
    expectedSha256,
    hmacOk,
    warnings,
    errors,
  }
}

export { DEFAULT_KEY_ID, DEFAULT_HMAC_KEY }
