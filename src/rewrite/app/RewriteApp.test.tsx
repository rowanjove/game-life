import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import {
  createRewriteRepository,
  type StorageLike,
} from '../storage/repository'
import { RewriteApp } from './RewriteApp'

function memoryStorage(): StorageLike {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
}

it('opens the current life directly without save management controls', () => {
  render(
    <RewriteApp
      repository={createRewriteRepository(memoryStorage())}
      dependencies={{
        now: () => '2026-06-20T00:00:00.000Z',
        nextId: () => 'run-1',
        nextSeed: () => 42,
        reduce: (run) => run,
      }}
    />,
  )

  expect(screen.queryByRole('heading', { name: '轮盘人生' })).not.toBeInTheDocument()
  expect(screen.getByRole('heading', { name: '在石碑上刻下你的名字' })).toBeVisible()
  expect(screen.queryByRole('button', { name: '刷新游戏' })).not.toBeInTheDocument()
  expect(screen.queryByText('存档')).not.toBeInTheDocument()
  expect(screen.queryByText('导入')).not.toBeInTheDocument()
  expect(screen.queryByText('导出')).not.toBeInTheDocument()
})
