import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { ConfirmRestartDialog } from './ConfirmRestartDialog'

it('never offers to clear history while confirming a new life', () => {
  const confirm = vi.fn()
  render(<ConfirmRestartDialog onCancel={vi.fn()} onConfirm={confirm} />)

  expect(screen.getByText('当前人生会结束，游玩历史会保留。')).toBeVisible()
  expect(screen.queryByText(/清空历史/)).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '确认开始' }))
  expect(confirm).toHaveBeenCalledOnce()
})
