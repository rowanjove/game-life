import JSZip from 'jszip'
import type {
  ContentPack,
  ContentPackManifest,
  PackCatalog,
  PackCatalogEntry,
} from './packTypes'
import { applyContentPack } from './registry'
import { verifyPackIntegrity, type IntegrityReport } from './integrity'
import { validateContentPack } from './validatePack'

/** Max compressed zip size accepted for install (8 MiB). */
export const MAX_PACK_ZIP_BYTES = 8 * 1024 * 1024

export type LoadedPackResult = {
  pack: ContentPack
  integrity: IntegrityReport
  manifest: ContentPackManifest | null
}

export type LoadPackOptions = {
  requireSignature?: boolean
  expectedSha256?: string
  /** if true, integrity failure throws (default true) */
  strict?: boolean
  /** allow remote absolute URLs outside same-origin (default false) */
  allowExternalUrl?: boolean
}

function normalizeZipPath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\.?\//, '')
}

async function readExactZipText(zip: JSZip, exactName: string): Promise<string | null> {
  const direct = zip.file(exactName)
  if (direct) return direct.async('string')

  // Allow a single top-level folder prefix: foo/pack.json
  const candidates = Object.keys(zip.files).filter((name) => {
    if (zip.files[name].dir) return false
    const normalized = normalizeZipPath(name)
    return (
      normalized === exactName ||
      (normalized.endsWith(`/${exactName}`) && normalized.split('/').length === 2)
    )
  })
  if (candidates.length !== 1) return null
  const file = zip.file(candidates[0])
  return file ? file.async('string') : null
}

function assertZipSize(byteLength: number): void {
  if (byteLength > MAX_PACK_ZIP_BYTES) {
    throw new Error(`扩展包过大（>${MAX_PACK_ZIP_BYTES / 1024 / 1024}MB），已拒绝加载`)
  }
}

function assertSafeRemoteUrl(url: string, allowExternal: boolean): void {
  let parsed: URL
  try {
    parsed = new URL(url, globalThis.location?.origin ?? 'http://127.0.0.1')
  } catch {
    throw new Error('扩展 URL 无效')
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('仅允许 http(s) 扩展地址')
  }
  if (!allowExternal && globalThis.location?.origin) {
    if (parsed.origin !== globalThis.location.origin) {
      throw new Error('默认禁止跨域扩展 URL（可在本地开发时显式允许）')
    }
  }
}

/** Load a content pack from a .zip ArrayBuffer. */
export async function loadContentPackFromZip(
  buffer: ArrayBuffer,
  options: LoadPackOptions = {},
): Promise<LoadedPackResult> {
  assertZipSize(buffer.byteLength)
  const zip = await JSZip.loadAsync(buffer)

  const manifestText = await readExactZipText(zip, 'manifest.json')
  let manifest: ContentPackManifest | null = null
  if (manifestText) {
    manifest = JSON.parse(manifestText) as ContentPackManifest
  }

  let entryName = 'pack.json'
  if (manifest?.entry) {
    const raw = normalizeZipPath(manifest.entry)
    if (
      raw.includes('..') ||
      raw.startsWith('/') ||
      raw.includes('\\') ||
      raw.split('/').length > 2
    ) {
      throw new Error('manifest.entry 路径非法')
    }
    entryName = raw
  }

  const packText = await readExactZipText(zip, entryName)
  if (!packText) {
    throw new Error(`扩展包中找不到 ${entryName}`)
  }

  const integrity = await verifyPackIntegrity(packText, manifest, {
    requireSignature: options.requireSignature,
    expectedSha256: options.expectedSha256 ?? manifest?.sha256,
  })

  if (options.strict !== false && !integrity.ok) {
    throw new Error(integrity.errors.join('；') || '扩展包完整性校验失败')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(packText)
  } catch {
    throw new Error('pack.json 不是合法 JSON')
  }

  const pack = validateContentPack(parsed)
  return { pack, integrity, manifest }
}

export async function installContentPackFromZip(
  buffer: ArrayBuffer,
  options?: LoadPackOptions,
): Promise<LoadedPackResult> {
  const loaded = await loadContentPackFromZip(buffer, options)
  applyContentPack(loaded.pack, {
    integritySha256: loaded.integrity.sha256,
  })
  return loaded
}

export async function installContentPackFromFile(
  file: File,
  options?: LoadPackOptions,
): Promise<LoadedPackResult> {
  if (file.size > MAX_PACK_ZIP_BYTES) {
    throw new Error(`扩展包过大（>${MAX_PACK_ZIP_BYTES / 1024 / 1024}MB）`)
  }
  const buffer = await file.arrayBuffer()
  return installContentPackFromZip(buffer, options)
}

export async function installContentPackFromUrl(
  url: string,
  options?: LoadPackOptions,
): Promise<LoadedPackResult> {
  assertSafeRemoteUrl(url, options?.allowExternalUrl === true)
  const controller = new AbortController()
  const timer = globalThis.setTimeout(() => controller.abort(), 30_000)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(`远程扩展下载失败：HTTP ${response.status}`)
    }
    const lengthHeader = response.headers.get('content-length')
    if (lengthHeader && Number(lengthHeader) > MAX_PACK_ZIP_BYTES) {
      throw new Error('远程扩展声明体积过大')
    }
    const buffer = await response.arrayBuffer()
    return installContentPackFromZip(buffer, options)
  } finally {
    globalThis.clearTimeout(timer)
  }
}

export async function fetchPackCatalog(url = '/extensions/catalog.json'): Promise<PackCatalog> {
  assertSafeRemoteUrl(url, false)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`无法加载扩展目录：HTTP ${response.status}`)
  }
  const data = await response.json() as PackCatalog
  if (!data || !Array.isArray(data.packs)) {
    throw new Error('扩展目录格式无效')
  }
  return data
}

export async function installCatalogEntry(
  entry: PackCatalogEntry,
  options?: LoadPackOptions,
): Promise<LoadedPackResult> {
  return installContentPackFromUrl(entry.url, {
    ...options,
    expectedSha256: entry.sha256 ?? options?.expectedSha256,
    allowExternalUrl: options?.allowExternalUrl,
  })
}
