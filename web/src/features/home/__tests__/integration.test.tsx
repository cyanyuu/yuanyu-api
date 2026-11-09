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
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useStatus } from '@/hooks/use-status'

import { HeroTerminalDemo } from '../components/hero-terminal-demo'
import { RoutingDemo } from '../components/routing-demo'
import { Hero } from '../components/sections/hero'

vi.mock('@tanstack/react-router', () => ({
  Link: (props: { to: string; children?: React.ReactNode }) => (
    <a href={props.to}>{props.children}</a>
  ),
}))
vi.mock('@/hooks/use-status', () => ({
  useStatus: vi.fn(),
}))

vi.mock('@/hooks/use-system-config', () => ({
  useSystemConfig: () => ({ systemName: '源语 API', logo: '/logo.png' }),
}))
beforeEach(() => {
  localStorage.clear()
  vi.mocked(useStatus)
    .mockReset()
    .mockReturnValue({
      status: { server_address: 'https://gateway.example/v1/' },
      loading: false,
      error: null,
    })
})

describe('home routing demonstration', () => {
  it('switches the selected route to a backup and restores the primary route on reset', async () => {
    const user = userEvent.setup()
    render(<RoutingDemo />)
    expect(screen.getByText('源语 API')).toBeVisible()
    expect(screen.getByText('Routing demo')).toBeVisible()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Requests follow the selected route.'
    )

    await user.click(screen.getByRole('button', { name: 'Simulate failover' }))
    expect(screen.getByRole('status')).toHaveTextContent(
      'Backup selected. The request has another route.'
    )
    expect(screen.getByText('Unavailable')).toBeVisible()
    expect(screen.getAllByText('Selected')).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Reset demo' }))
    expect(screen.getByRole('status')).toHaveTextContent(
      'Requests follow the selected route.'
    )
    expect(screen.queryByText('Unavailable')).not.toBeInTheDocument()
  })
})

describe('home API address', () => {
  it('shows the configured server address in the hero and copies that exact address', async () => {
    const user = userEvent.setup()
    const clipboard = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined)
    render(<Hero />)

    expect(screen.getByText('https://gateway.example/v1/')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Copy API base URL' }))
    expect(clipboard).toHaveBeenCalledWith('https://gateway.example/v1/')
    expect(screen.getByRole('button', { name: 'Copied' })).toBeVisible()
  })

  it('refreshes the displayed address and copy value when the server configuration changes', async () => {
    const user = userEvent.setup()
    const clipboard = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined)
    const view = render(<Hero />)
    vi.mocked(useStatus).mockReturnValue({
      status: { server_address: 'https://new-gateway.example/proxy' },
      loading: false,
      error: null,
    })
    view.rerender(<Hero />)

    expect(
      screen.queryByText('https://gateway.example/v1/')
    ).not.toBeInTheDocument()
    expect(screen.getByText('https://new-gateway.example/proxy')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Copy API base URL' }))
    expect(clipboard).toHaveBeenCalledWith('https://new-gateway.example/proxy')
  })

  it('displays and copies the current origin when the global server address is not configured', async () => {
    const user = userEvent.setup()
    const clipboard = vi.spyOn(navigator.clipboard, 'writeText')
    vi.mocked(useStatus).mockReturnValue({
      status: {},
      loading: false,
      error: null,
    })
    render(<Hero />)

    expect(screen.getByText(window.location.origin)).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Copy API base URL' }))
    expect(clipboard).toHaveBeenCalledWith(window.location.origin)
  })
})

describe('home API examples', () => {
  it('uses the configured gateway address without duplicating the v1 suffix and copies a complete request', async () => {
    const user = userEvent.setup()
    const clipboard = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined)
    render(<HeroTerminalDemo />)
    const panel = screen.getByRole('tabpanel')
    expect(panel).toHaveTextContent(
      'https://gateway.example/v1/chat/completions'
    )
    expect(panel).not.toHaveTextContent('/v1/v1/')

    await user.click(screen.getByRole('button', { name: 'Copy API example' }))
    expect(clipboard).toHaveBeenCalledWith(
      expect.stringContaining('Authorization: Bearer YOUR_API_KEY')
    )
    const request = clipboard.mock.calls[0][0]
    expect(request).toContain(" \\\n  -H 'Authorization")
    expect(request).toContain('"model": "YOUR_MODEL"')
  })

  it('allows keyboard selection of SDK examples and copies the selected language', async () => {
    const user = userEvent.setup()
    const clipboard = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined)
    render(<HeroTerminalDemo />)
    screen.getByRole('tab', { name: 'cURL' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Python' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('tab', { name: 'Python' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(
      within(screen.getByRole('tabpanel')).getByLabelText('Python API example')
    ).toHaveTextContent('from openai import OpenAI')
    await user.click(screen.getByRole('button', { name: 'Copy API example' }))
    expect(clipboard).toHaveBeenCalledWith(
      expect.stringContaining('from openai import OpenAI')
    )
    await user.click(screen.getByRole('tab', { name: 'Node.js' }))
    expect(screen.getByRole('tabpanel')).toHaveTextContent(
      'await client.chat.completions.create'
    )
  })

  it('uses the current site address supplied by the shared hook when no gateway is configured', () => {
    vi.mocked(useStatus).mockReturnValue({
      status: {},
      loading: false,
      error: null,
    })
    render(<HeroTerminalDemo />)
    expect(screen.getByRole('tabpanel')).toHaveTextContent(
      `${window.location.origin}/v1/chat/completions`
    )
  })
})
