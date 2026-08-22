import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { createRun } from '../../engine/factory'
import type { RewriteRun } from '../../engine/model'
import { WheelScreen } from './WheelScreen'

function creationRun(status: 'ready' | 'animating' | 'result-pending'): RewriteRun {
  const base = createRun(42, '2026-06-20T00:00:00.000Z', 'run-1')
  return {
    ...base,
    character: { ...base.character, name: '林云深', gender: 'male' },
    flow: { phase: 'creation', step: 'looks', status },
    pending: status === 'ready'
      ? null
      : {
          kind: 'wheel',
          id: 'result-1',
          optionId: 'looks-8',
          title: '八分容貌',
          description: '命运已经落定。',
          effects: [],
          payload: 8,
        },
  }
}

it('dispatches animation completion when the spin library rests', async () => {
  const dispatch = vi.fn()
  render(<WheelScreen run={creationRun('animating')} dispatch={dispatch} />)

  await waitFor(() => {
    expect(dispatch).toHaveBeenCalledWith({ type: 'ANIMATION_FINISHED' })
  })
})

it('shows a persisted pending result immediately after reload', async () => {
  const user = userEvent.setup()
  const dispatch = vi.fn()
  render(<WheelScreen run={creationRun('result-pending')} dispatch={dispatch} />)

  expect(screen.getByRole('dialog', { name: '命运结果' })).toBeVisible()
  expect(screen.queryByText('正在旋转')).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: '确认，继续命运' }))
  expect(dispatch).toHaveBeenCalledWith({ type: 'CONFIRM_RESULT' })
})
