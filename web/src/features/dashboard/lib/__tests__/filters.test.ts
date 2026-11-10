import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { buildDefaultDashboardFilters } from '../filters'

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers({ toFake: ['Date'] })
})

afterEach(() => vi.useRealTimers())

it.each([
  new Date(2026, 10, 10, 15, 26, 42),
  new Date(2027, 0, 1, 0, 0, 0),
  new Date(2026, 10, 11, 0, 0, 1),
])('defaults to local midnight through the current moment (%s)', (now) => {
  vi.setSystemTime(now)
  const filters = buildDefaultDashboardFilters()
  const midnight = new Date(now)
  midnight.setHours(0, 0, 0, 0)
  expect(filters.start_timestamp).toEqual(midnight)
  expect(filters.end_timestamp).toEqual(now)
})
