import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { HistoryEntry } from '../../engine/model'
import { HistoryDrawer } from './HistoryDrawer'

const history: HistoryEntry[] = [
  {
    id: 'start',
    runId: 'run-1',
    at: '2026-06-20T00:00:00.000Z',
    type: 'run-start',
    summary: '开始新人生',
  },
  {
    id: 'ending',
    runId: 'run-1',
    at: '2026-06-20T01:00:00.000Z',
    type: 'ending',
    summary: '林云深抵达结局：传奇落幕',
  },
]

describe('HistoryDrawer', () => {
  it('shows newest entries first and only offers read-only filtering', () => {
    render(<HistoryDrawer history={history} />)

    fireEvent.click(screen.getByRole('button', { name: '游玩历史' }))

    const entries = screen.getAllByRole('listitem')
    expect(entries[0]).toHaveTextContent('传奇落幕')
    expect(screen.getByRole('combobox', { name: '筛选历史类型' })).toBeVisible()
    expect(screen.queryByRole('button', { name: /恢复|回档|删除|清空/ })).not.toBeInTheDocument()
  })
})
