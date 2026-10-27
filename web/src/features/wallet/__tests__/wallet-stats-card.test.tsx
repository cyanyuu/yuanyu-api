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
*/
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'

import { WalletStatsCard } from '../components/wallet-stats-card'

it('tilts the balance card toward the pointer and resets after leaving', () => {
  const originalMatchMedia = window.matchMedia
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }))

  try {
    render(<WalletStatsCard user={null} />)
    const interaction = screen.getByRole('region', { name: 'Current Balance' })
    vi.spyOn(interaction, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 300,
      height: 200,
      right: 300,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    fireEvent.pointerMove(interaction, {
      pointerType: 'mouse',
      clientX: 240,
      clientY: 50,
    })

    expect(interaction.style.getPropertyValue('--wallet-rotate-x')).toBe('2deg')
    expect(
      Number.parseFloat(interaction.style.getPropertyValue('--wallet-rotate-y'))
    ).toBeCloseTo(2.4)
    expect(
      Number.parseFloat(interaction.style.getPropertyValue('--wallet-shadow-x'))
    ).toBeCloseTo(-3)

    fireEvent.pointerLeave(interaction)

    expect(interaction.style.getPropertyValue('--wallet-rotate-x')).toBe('')
    expect(interaction.style.getPropertyValue('--wallet-rotate-y')).toBe('')
    expect(interaction.style.getPropertyValue('--wallet-shadow-x')).toBe('')
  } finally {
    vi.stubGlobal('matchMedia', originalMatchMedia)
  }
})

it('keeps the balance card static when reduced motion is enabled', () => {
  const originalMatchMedia = window.matchMedia
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }))

  try {
    render(<WalletStatsCard user={null} />)
    const interaction = screen.getByRole('region', { name: 'Current Balance' })
    vi.spyOn(interaction, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 300,
      height: 200,
      right: 300,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    fireEvent.pointerMove(interaction, {
      pointerType: 'mouse',
      clientX: 240,
      clientY: 50,
    })

    expect(interaction.style.getPropertyValue('--wallet-rotate-x')).toBe('')
    expect(interaction.style.getPropertyValue('--wallet-rotate-y')).toBe('')
  } finally {
    vi.stubGlobal('matchMedia', originalMatchMedia)
  }
})
