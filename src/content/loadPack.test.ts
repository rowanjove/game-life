import { describe, expect, it } from 'vitest'
import JSZip from 'jszip'
import { buildBasePack } from '../rewrite/content/adapters'
import { loadContentPackFromZip, MAX_PACK_ZIP_BYTES } from './loadPack'
import { sha256Hex } from './integrity'

async function zipPack(pack: unknown, manifest?: Record<string, unknown>) {
  const zip = new JSZip()
  const packText = JSON.stringify(pack)
  zip.file('pack.json', packText)
  if (manifest) {
    zip.file('manifest.json', JSON.stringify(manifest))
  } else {
    zip.file(
      'manifest.json',
      JSON.stringify({
        id: (pack as { id: string }).id,
        name: (pack as { name: string }).name,
        version: (pack as { version: string }).version,
        entry: 'pack.json',
        sha256: await sha256Hex(packText),
      }),
    )
  }
  return zip.generateAsync({ type: 'arraybuffer' })
}

describe('loadContentPackFromZip', () => {
  it('loads a valid zipped base pack', async () => {
    const pack = buildBasePack()
    const buffer = await zipPack(pack)
    const loaded = await loadContentPackFromZip(buffer)
    expect(loaded.pack.id).toBe('base')
    expect(loaded.integrity.ok).toBe(true)
  })

  it('rejects path traversal in manifest.entry', async () => {
    const pack = buildBasePack()
    const buffer = await zipPack(pack, {
      id: 'base',
      name: 'x',
      version: '1',
      entry: '../pack.json',
    })
    await expect(loadContentPackFromZip(buffer)).rejects.toThrow(/路径非法/)
  })

  it('rejects oversized buffers', async () => {
    const huge = new ArrayBuffer(MAX_PACK_ZIP_BYTES + 1)
    await expect(loadContentPackFromZip(huge)).rejects.toThrow(/过大/)
  })
})
