import { expect, it } from 'vitest'
import mainSource from './main.tsx?raw'

it('boots the rewrite app without a query flag or legacy app import', () => {
  expect(mainSource).toContain("import { RewriteApp } from './rewrite/app/RewriteApp'")
  expect(mainSource).toContain('<RewriteApp />')
  expect(mainSource).not.toContain("from './app/App'")
  expect(mainSource).not.toContain('URLSearchParams')
})
