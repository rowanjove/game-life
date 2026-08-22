import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { CenteredResultDialog } from './CenteredResultDialog'

it('shows the locked result as an ornate destiny plaque', async () => {
  const user = userEvent.setup()
  const onConfirm = vi.fn()
  render(
    <CenteredResultDialog
      result={{
        kind: 'wheel',
        id: 'result-1',
        optionId: 'looks-8',
        title: '八分容貌',
        description: '命运已经落定。',
        effects: ['颜值设为 8'],
        payload: 8,
      }}
      onConfirm={onConfirm}
    />,
  )

  expect(screen.getByRole('dialog', { name: '命运结果' })).toBeVisible()
  expect(screen.getByRole('img', { name: '命运纹章' })).toBeVisible()
  expect(screen.getByText('命运印记')).toBeVisible()
  expect(screen.getByTestId('result-inner-frame')).toBeVisible()
  expect(screen.getByTestId('result-illustration')).toBeVisible()
  await user.click(screen.getByRole('button', { name: '确认，继续命运' }))
  expect(onConfirm).toHaveBeenCalledOnce()
})
