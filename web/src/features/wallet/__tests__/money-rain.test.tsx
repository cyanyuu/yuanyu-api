/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { fireEvent, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { WalletMoneyRain } from '../components/wallet-money-rain'

afterEach(() => vi.unstubAllGlobals())

it.each([
  {
    viewport: 'desktop',
    visibleCount: 32,
    delayProperty: '--fall-delay',
    maxGap: 1,
  },
  {
    viewport: 'mobile',
    visibleCount: 12,
    delayProperty: '--fall-mobile-delay',
    maxGap: 2.1,
  },
])(
  'keeps $viewport money arrivals continuous across repeated cycles',
  (scenario) => {
    const view = render(<WalletMoneyRain />)
    const tracks = [
      ...view.container.querySelectorAll<HTMLElement>('.wallet-money-particle'),
    ].slice(0, scenario.visibleCount)
    const arrivals: number[] = []

    // Follow actual configured tracks for several cycles, including the wraparound.
    for (const track of tracks) {
      const duration = Number.parseFloat(
        track.style.getPropertyValue('--fall-duration')
      )
      const delay = Number.parseFloat(
        track.style.getPropertyValue(scenario.delayProperty)
      )
      expect(Number.isFinite(delay)).toBe(true)
      for (let time = delay; time <= 120; time += duration) {
        if (time >= 0) arrivals.push(time)
      }
    }
    arrivals.sort((a, b) => a - b)
    expect(arrivals[0]).toBeLessThanOrEqual(scenario.maxGap)
    for (let index = 1; index < arrivals.length; index++) {
      expect(arrivals[index] - arrivals[index - 1]).toBeLessThanOrEqual(
        scenario.maxGap
      )
    }
    expect(120 - (arrivals.at(-1) ?? 0)).toBeLessThanOrEqual(scenario.maxGap)
  }
)

it('pauses decorative motion when offscreen or hidden and resumes only when both are visible', () => {
  let notifyIntersection: (
    entries: { isIntersecting: boolean }[]
  ) => void = () => {
    throw new Error('Intersection observer was not initialized')
  }
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: typeof notifyIntersection) {
        notifyIntersection = callback
      }
      observe() {}
      disconnect() {}
    }
  )
  const visibility = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
  const view = render(<WalletMoneyRain />)
  const decoration = view.container.firstElementChild

  expect(decoration).toHaveAttribute('aria-hidden', 'true')
  expect(decoration).toHaveAttribute('data-paused', 'true')
  notifyIntersection([{ isIntersecting: true }])
  expect(decoration).toHaveAttribute('data-paused', 'false')

  visibility.mockReturnValue(true)
  fireEvent(document, new Event('visibilitychange'))
  expect(decoration).toHaveAttribute('data-paused', 'true')

  notifyIntersection([{ isIntersecting: false }])
  visibility.mockReturnValue(false)
  fireEvent(document, new Event('visibilitychange'))
  expect(decoration).toHaveAttribute('data-paused', 'true')

  notifyIntersection([{ isIntersecting: true }])
  expect(decoration).toHaveAttribute('data-paused', 'false')
})

it('still respects tab visibility when IntersectionObserver is unavailable', () => {
  const observer = Object.getOwnPropertyDescriptor(
    window,
    'IntersectionObserver'
  )
  Reflect.deleteProperty(window, 'IntersectionObserver')
  const visibility = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
  try {
    const view = render(<WalletMoneyRain />)
    const decoration = view.container.firstElementChild
    expect(decoration).toHaveAttribute('data-paused', 'false')

    visibility.mockReturnValue(true)
    fireEvent(document, new Event('visibilitychange'))
    expect(decoration).toHaveAttribute('data-paused', 'true')
  } finally {
    if (observer) {
      Object.defineProperty(window, 'IntersectionObserver', observer)
    }
  }
})
