import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import type { WheelOption } from '../../engine/creation'
import { DestinyWheel } from './DestinyWheel'

const options: WheelOption[] = [
  { id: 'a', name: '帝都', description: '帝国资源与权力汇聚。', weight: 60, color: '#3D7DD6', value: 'a' },
  { id: 'b', name: '极北之地', description: '冰雪磨砺出坚韧灵魂。', weight: 40, color: '#E07A9A', value: 'b' },
]

it('renders clean wheel chrome and opens details from option list', async () => {
  const user = userEvent.setup()
  const onSpin = vi.fn()
  render(<DestinyWheel options={options} status="ready" onSpin={onSpin} />)

  expect(screen.getByTestId('destiny-wheel')).toBeVisible()
  expect(screen.getByTestId('wheel-outer-frame')).toBeVisible()
  expect(screen.getByTestId('wheel-gem-center')).toBeVisible()
  expect(screen.getByTestId('wheel-pointer')).toBeVisible()
  expect(screen.getByTestId('wheel-rotor')).toBeVisible()

  await user.click(screen.getByRole('button', { name: '开始旋转' }))
  expect(onSpin).toHaveBeenCalledOnce()

  await user.click(screen.getByRole('button', { name: /查看全部选项/ }))
  await user.click(screen.getByRole('button', { name: '查看 帝都 详情' }))
  expect(screen.getByRole('dialog', { name: '扇区详情' })).toBeVisible()
})

it('disables spinning while animating', () => {
  render(
    <DestinyWheel
      options={options}
      status="animating"
      onSpin={vi.fn()}
      targetOptionId="a"
    />,
  )

  expect(screen.getByRole('button', { name: '正在旋转' })).toBeDisabled()
})
