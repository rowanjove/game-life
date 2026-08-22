import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { CelestialCrest, GenderSigil, WingedGem } from './CelestialDecor'

it('renders accessible celestial emblems', () => {
  render(
    <>
      <CelestialCrest label="命运星徽" />
      <WingedGem label="命运纹章" />
      <GenderSigil gender="male" />
      <GenderSigil gender="female" />
    </>,
  )

  expect(screen.getByRole('img', { name: '命运星徽' })).toBeVisible()
  expect(screen.getByRole('img', { name: '命运纹章' })).toBeVisible()
  expect(screen.getByRole('img', { name: '男性纹章' })).toBeVisible()
  expect(screen.getByRole('img', { name: '女性纹章' })).toBeVisible()
  expect(screen.getByRole('img', { name: '命运星徽' })).toHaveClass('celestial-linework')
  expect(screen.getByRole('img', { name: '男性纹章' })).toHaveClass('gender-sigil--line')
  expect(screen.getByRole('img', { name: '女性纹章' })).toHaveClass('gender-sigil--line')
})
