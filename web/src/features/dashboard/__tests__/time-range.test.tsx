import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { api } from '@/lib/api'

import { LogStatCards } from '../components/models/log-stat-cards'
import { ModelsFilter } from '../components/models/models-filter-dialog'
import { DEFAULT_DASHBOARD_CHART_PREFERENCES } from '../constants'
import { buildDefaultDashboardFilters } from '../lib/filters'
import type { DashboardFilters } from '../types'

const now = new Date(2026, 10, 10, 15, 26, 42)

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal('Animation', class {})
  Object.defineProperty(HTMLElement.prototype, 'getAnimations', {
    configurable: true,
    value: () => [],
  })
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(now)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  Reflect.deleteProperty(HTMLElement.prototype, 'getAnimations')
})

it('requests and shares chart data from local midnight to now by default', async () => {
  const get = vi.spyOn(api, 'get').mockResolvedValue({
    data: { success: true, data: [] },
  })
  const onDataUpdate = vi.fn()
  const filters = buildDefaultDashboardFilters()
  render(<LogStatCards filters={filters} onDataUpdate={onDataUpdate} />)

  await waitFor(() => expect(onDataUpdate).toHaveBeenLastCalledWith([], false))
  expect(get).toHaveBeenCalledWith(
    '/api/data/self',
    expect.objectContaining({
      params: {
        start_timestamp: new Date(2026, 10, 10, 0, 0, 0).getTime() / 1000,
        end_timestamp: now.getTime() / 1000,
        default_time: 'hour',
      },
    })
  )
})

it('applies Today from the filter dialog and uses hourly chart buckets', async () => {
  const onFilterChange = vi.fn()
  const user = userEvent.setup()
  render(
    <ModelsFilter
      preferences={DEFAULT_DASHBOARD_CHART_PREFERENCES}
      currentFilters={{
        start_timestamp: new Date(2026, 10, 3, 15, 26, 42),
        end_timestamp: now,
        time_granularity: 'day',
        username: 'alice',
      }}
      onFilterChange={onFilterChange}
      onReset={vi.fn()}
    />
  )
  await user.click(screen.getByRole('button', { name: 'Filter' }))
  await user.click(screen.getByRole('button', { name: 'Today' }))
  expect(screen.getByRole('button', { name: 'Today' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  await user.click(screen.getByRole('button', { name: 'Apply Filters' }))

  expect(onFilterChange).toHaveBeenCalledWith({
    start_timestamp: new Date(2026, 10, 10),
    end_timestamp: now,
    time_granularity: 'hour',
    username: 'alice',
  })
})

function QuickRangeFilter(props: {
  onChange: (filters: DashboardFilters) => void
}) {
  const [filters, setFilters] = useState(() => buildDefaultDashboardFilters())
  return (
    <ModelsFilter
      showQuickRange
      preferences={DEFAULT_DASHBOARD_CHART_PREFERENCES}
      currentFilters={filters}
      onFilterChange={(next) => {
        setFilters(next)
        props.onChange(next)
      }}
      onReset={() => setFilters(buildDefaultDashboardFilters())}
    />
  )
}

it('switches the visible quick filter between today and rolling ranges', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<QuickRangeFilter onChange={onChange} />)
  const picker = screen.getByRole('combobox', { name: 'Quick Range' })
  expect(picker).toHaveTextContent('Today')
  await user.click(picker)
  await user.click(await screen.findByRole('option', { name: '24 Hours' }))
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({
      start_timestamp: new Date(2026, 10, 9, 15, 26, 42),
      end_timestamp: now,
      time_granularity: 'hour',
    })
  )
  await user.click(picker)
  await user.click(await screen.findByRole('option', { name: '7 Days' }))
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({
      start_timestamp: new Date(2026, 10, 3, 15, 26, 42),
      end_timestamp: now,
      time_granularity: 'day',
    })
  )
  await user.click(picker)
  await user.click(await screen.findByRole('option', { name: 'Today' }))
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({
      start_timestamp: new Date(2026, 10, 10),
      end_timestamp: now,
      time_granularity: 'hour',
    })
  )
})

it('opens custom filtering from the quick picker and resets back to today', async () => {
  const user = userEvent.setup()
  render(<QuickRangeFilter onChange={vi.fn()} />)
  const picker = screen.getByRole('combobox', { name: 'Quick Range' })
  await user.click(picker)
  await user.click(await screen.findByRole('option', { name: 'Custom' }))
  expect(await screen.findByRole('dialog')).toBeVisible()
  await user.click(screen.getByRole('button', { name: '7 Days' }))
  await user.click(screen.getByRole('button', { name: 'Apply Filters' }))
  expect(picker).toHaveTextContent('7 Days')
  await user.click(screen.getByRole('button', { name: 'Filter' }))
  await user.click(screen.getByRole('button', { name: 'Reset' }))
  expect(picker).toHaveTextContent('Today')
})

it('preserves a partial-day custom range when reopening and applying filters', async () => {
  const user = userEvent.setup()
  const onFilterChange = vi.fn()
  const start = new Date(2026, 10, 9, 17, 26, 42)
  render(
    <ModelsFilter
      showQuickRange
      preferences={DEFAULT_DASHBOARD_CHART_PREFERENCES}
      currentFilters={{
        start_timestamp: start,
        end_timestamp: now,
        time_granularity: 'hour',
      }}
      onFilterChange={onFilterChange}
      onReset={vi.fn()}
    />
  )
  expect(
    screen.getByRole('combobox', { name: 'Quick Range' })
  ).toHaveTextContent('Custom')
  await user.click(screen.getByRole('button', { name: 'Filter' }))
  expect(screen.getByRole('button', { name: '24 Hours' })).toHaveAttribute(
    'aria-pressed',
    'false'
  )
  await user.click(screen.getByRole('button', { name: 'Apply Filters' }))
  expect(onFilterChange).toHaveBeenCalledWith({
    start_timestamp: start,
    end_timestamp: now,
    time_granularity: 'hour',
  })
})
