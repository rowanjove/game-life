import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { createRun } from '../../engine/factory'
import { CreationSummaryScreen } from './CreationSummaryScreen'

it('presents the completed identity without exposing internal flow names', async () => {
  const user = userEvent.setup()
  const dispatch = vi.fn()
  const run = createRun(42, '2026-06-20T00:00:00.000Z', 'run-1')
  run.flow = { phase: 'creation', step: 'creation-summary', status: 'ready' }
  run.character = {
    ...run.character,
    name: '白清歌',
    gender: 'female',
    race: 'human',
    raceName: '人族',
    looks: 8,
    birthYear: 2632,
    currentYear: 2632,
    birthPlace: '天斗城',
    innatePower: 10,
    spirits: [{
      id: 'spirit-1',
      name: '琉璃莲',
      category: 'nature',
      quality: '顶级',
      evolvedFrom: null,
      fusionIds: [],
    }],
  }

  render(<CreationSummaryScreen run={run} dispatch={dispatch} />)

  expect(screen.getByRole('heading', { name: '命运初定' })).toBeVisible()
  expect(screen.getByText('白清歌')).toBeVisible()
  expect(screen.getByText('琉璃莲')).toBeVisible()
  expect(screen.getByText('天斗城').closest('div')).toHaveClass('creation-summary__wide')
  expect(screen.queryByText(/creation-summary|creation \//)).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: '踏入灵元大陆' }))
  expect(dispatch).toHaveBeenCalledWith({ type: 'CONTINUE' })
})
