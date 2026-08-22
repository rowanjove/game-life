import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { IdentityScreen, isValidCharacterName } from './IdentityScreen'

it('accepts only one to four Chinese characters as a role name', () => {
  expect(isValidCharacterName('林云深')).toBe(true)
  expect(isValidCharacterName(' 林 ')).toBe(true)
  expect(isValidCharacterName('Alex')).toBe(false)
  expect(isValidCharacterName('司徒云深海')).toBe(false)
})

it('presents the celestial identity ceremony with integrated controls', async () => {
  const user = userEvent.setup()
  const onConfirm = vi.fn()
  render(<IdentityScreen onConfirm={onConfirm} />)

  expect(screen.queryByRole('heading', { name: '轮盘人生' })).not.toBeInTheDocument()
  expect(screen.getByRole('img', { name: '命运星徽' })).toBeVisible()
  expect(screen.getByRole('img', { name: '男性纹章' })).toBeVisible()
  expect(screen.getByRole('img', { name: '女性纹章' })).toBeVisible()

  const nameControl = screen.getByTestId('name-control')
  expect(within(nameControl).getByLabelText('姓名')).toBeVisible()
  expect(within(nameControl).getByRole('button', { name: '随机姓名' })).toHaveTextContent('')

  await user.type(screen.getByLabelText('姓名'), '林云深')
  await user.click(screen.getByRole('button', { name: '男' }))
  await user.click(screen.getByRole('button', { name: '开始命运之旅' }))

  expect(onConfirm).toHaveBeenCalledWith('林云深', 'male')
})
