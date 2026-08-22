import { describe, expect, it } from 'vitest'
import { hmacSha256Hex, sha256Hex, verifyPackIntegrity } from './integrity'

describe('pack integrity', () => {
  it('computes stable sha256', async () => {
    const a = await sha256Hex('{"id":"demo"}')
    const b = await sha256Hex('{"id":"demo"}')
    expect(a).toBe(b)
    expect(a).toHaveLength(64)
  })

  it('verifies matching hmac', async () => {
    const body = '{"id":"douluo-life","name":"test"}'
    const hmac = await hmacSha256Hex(body)
    const report = await verifyPackIntegrity(body, { sha256: await sha256Hex(body), hmac })
    expect(report.ok).toBe(true)
    expect(report.hmacOk).toBe(true)
  })

  it('fails on tampered body', async () => {
    const body = '{"id":"douluo-life"}'
    const hmac = await hmacSha256Hex(body)
    const report = await verifyPackIntegrity(`${body} `, {
      sha256: await sha256Hex(body),
      hmac,
    })
    expect(report.ok).toBe(false)
    expect(report.errors.length).toBeGreaterThan(0)
  })
})
