import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { createRun } from '../../engine/factory'
import type { RewriteRun } from '../../engine/model'
import { EventScreen } from './EventScreen'

it('waits for an explicit event choice', async () => {
  const user = userEvent.setup()
  const dispatch = vi.fn()
  const base = createRun(42, '2026-06-20T00:00:00.000Z', 'run-1')
  const run: RewriteRun = {
    ...base,
    flow: { phase: 'primary-school', step: 'event-choice', status: 'choice-pending' },
    pending: {
      kind: 'event-choice',
      id: 'choice-1',
      title: '同学的秘密',
      description: '你发现同学暗中与圣殿接触。',
      choices: [
        { id: 'report', label: '告发', description: '' },
        { id: 'silence', label: '沉默', description: '' },
      ],
      payload: { eventId: 'primary-classmate-secret' },
    },
  }

  render(<EventScreen run={run} dispatch={dispatch} />)
  await user.click(screen.getByRole('button', { name: '告发' }))

  expect(dispatch).toHaveBeenCalledWith({
    type: 'CHOOSE_EVENT',
    choiceId: 'report',
  })
})
