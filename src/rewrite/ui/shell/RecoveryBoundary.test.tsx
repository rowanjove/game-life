import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { RecoveryBoundary } from './RecoveryBoundary'

it('offers recovery, reload and confirmed restart without clearing history', () => {
  const recover = vi.fn()
  const reload = vi.fn()
  const restart = vi.fn()
  render(
    <RecoveryBoundary
      error={new Error('状态损坏')}
      onRecover={recover}
      onReload={reload}
      onRestart={restart}
    />,
  )

  fireEvent.click(screen.getByRole('button', { name: '恢复最近进度' }))
  fireEvent.click(screen.getByRole('button', { name: '重新加载' }))
  expect(recover).toHaveBeenCalledOnce()
  expect(reload).toHaveBeenCalledOnce()

  fireEvent.click(screen.getByRole('button', { name: '开始新人生' }))
  expect(screen.getByText('当前人生会结束，游玩历史会保留。')).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: '确认开始' }))
  expect(restart).toHaveBeenCalledOnce()
})
