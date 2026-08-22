import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { createRun } from '../../engine/factory'
import { SummaryScreen } from './SummaryScreen'

it('summarizes the ending and requires confirmation before starting a new life', () => {
  const restart = vi.fn()
  const run = createRun(42, '2026-06-20T00:00:00.000Z', 'run-1')
  run.character.name = '林云深'
  run.character.level = 91
  run.character.endingId = 'legend-finale'
  run.flow = { phase: 'ending', step: 'summary', status: 'completed' }

  render(<SummaryScreen run={run} onRestart={restart} />)

  expect(screen.getByRole('heading', { name: '传奇落幕' })).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: '开始新人生' }))
  expect(restart).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: '确认开始' }))
  expect(restart).toHaveBeenCalledOnce()
})
