import { expect, it } from 'vitest'
import tokensCss from './tokens.css?raw'
import layoutCss from './layout.css?raw'

it('defines the bright celestial palette and accessible touch targets', () => {
  expect(tokensCss).toContain('--surface-ivory:')
  expect(tokensCss).toContain('--surface-pearl:')
  expect(tokensCss).toContain('--accent-sky:')
  expect(tokensCss).toContain('--accent-pink:')
  expect(tokensCss).toContain('--accent-champagne:')
  expect(tokensCss).toContain('--text-ink:')
  expect(layoutCss).toMatch(/button[^}]*min-height:\s*44px/s)
  expect(`${tokensCss}\n${layoutCss}`).not.toContain('#080c17')
})

it('keeps a centered desktop stage and a single-column mobile layout', () => {
  expect(layoutCss).toContain('min(720px')
  expect(layoutCss).toMatch(/@media\s*\(max-width:\s*700px\)/)
  expect(layoutCss).toContain('grid-template-columns: 1fr')
})
