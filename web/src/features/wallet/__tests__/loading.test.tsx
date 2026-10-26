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
import { act, fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'

import { api } from '@/lib/api'

import { AffiliateRewardsCard } from '../components/affiliate-rewards-card'
import { RechargeFormCard } from '../components/recharge-form-card'
import { SubscriptionPlansCard } from '../components/subscription-plans-card'
import { WalletStatsCard } from '../components/wallet-stats-card'

const user = {
  id: 1,
  username: 'wallet-member',
  quota: 500000,
  used_quota: 100000,
  request_count: 12,
  aff_quota: 500000,
  aff_history_quota: 1000000,
  aff_count: 2,
  group: 'default',
}

it('keeps the balance and metric layout slots while user data loads', () => {
  const view = render(<WalletStatsCard user={null} loading />)
  const balance = screen.getByRole('region', { name: 'Current Balance' })
  const metrics = screen.getByText('Total Usage').closest('dl')

  expect(balance.parentElement).toHaveAttribute('aria-busy', 'true')
  expect(screen.getByText('Total Usage')).toBeVisible()
  expect(screen.getByText('API Requests')).toBeVisible()
  expect(screen.queryByText('wallet-member')).not.toBeInTheDocument()

  view.rerender(<WalletStatsCard user={user} loading={false} />)

  expect(screen.getByRole('region', { name: 'Current Balance' })).toBe(balance)
  expect(screen.getByText('Total Usage').closest('dl')).toBe(metrics)
  expect(balance.parentElement).not.toHaveAttribute('aria-busy')
  expect(screen.getByText('wallet-member')).toBeVisible()
})

it('keeps the recharge header during loading and enables preset selection after data arrives', () => {
  const props = {
    topupInfo: {
      enable_online_topup: true,
      enable_stripe_topup: false,
      pay_methods: [{ name: 'Alipay', type: 'alipay' }],
      min_topup: 1,
      stripe_min_topup: 1,
      amount_options: [10, 20],
      discount: {},
    },
    presetAmounts: [{ value: 10 }, { value: 20 }],
    selectedPreset: 10,
    topupAmount: 10,
    paymentAmount: 10,
    calculating: false,
    paymentLoading: null,
    onSelectPreset: vi.fn(),
    onTopupAmountChange: vi.fn(),
    onPaymentMethodSelect: vi.fn(),
  }
  const view = render(<RechargeFormCard {...props} loading />)
  const title = screen.getByText('Add Funds')

  expect(screen.getByText('Payment Method')).toBeVisible()
  expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Alipay' })
  ).not.toBeInTheDocument()

  view.rerender(<RechargeFormCard {...props} loading={false} />)

  expect(screen.getByText('Add Funds')).toBe(title)
  expect(screen.getByRole('spinbutton', { name: 'Custom Amount' })).toHaveValue(
    10
  )
  expect(screen.getByRole('button', { name: /^10 / })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  fireEvent.click(screen.getByRole('button', { name: /^20 / }))
  expect(props.onSelectPreset).toHaveBeenCalledWith({ value: 20 })
  fireEvent.click(screen.getByRole('button', { name: 'Alipay' }))
  expect(props.onPaymentMethodSelect).toHaveBeenCalledWith(
    props.topupInfo.pay_methods[0]
  )
})

it('keeps referral labels visible while withholding actions until rewards load', () => {
  const onTransfer = vi.fn()
  const view = render(
    <AffiliateRewardsCard
      user={null}
      affiliateLink=''
      onTransfer={onTransfer}
      loading
    />
  )
  const title = screen.getByText('Referral Program')

  expect(screen.getByText('Invites')).toBeVisible()
  expect(
    screen.queryByRole('button', { name: 'Transfer to Balance' })
  ).not.toBeInTheDocument()

  view.rerender(
    <AffiliateRewardsCard
      user={user}
      affiliateLink='https://example.test/sign-up?aff=member'
      onTransfer={onTransfer}
      loading={false}
    />
  )

  expect(screen.getByText('Referral Program')).toBe(title)
  expect(
    screen.getByRole('textbox', { name: 'Copy referral link' })
  ).toHaveValue('https://example.test/sign-up?aff=member')
  fireEvent.click(screen.getByRole('button', { name: 'Transfer to Balance' }))
  expect(onTransfer).toHaveBeenCalledOnce()
})

it('keeps the subscription summary visible until both plan and subscription requests complete', async () => {
  let resolvePlans!: (value: unknown) => void
  let resolveSubscriptions!: (value: unknown) => void
  vi.spyOn(api, 'get').mockImplementation(
    (url) =>
      new Promise((resolve) => {
        if (url === '/api/subscription/plans') resolvePlans = resolve
        if (url === '/api/subscription/self') resolveSubscriptions = resolve
      })
  )
  const view = render(<SubscriptionPlansCard topupInfo={null} />)

  expect(screen.getByText('Subscription Plans')).toBeVisible()
  expect(screen.getByText('My Subscriptions')).toBeVisible()
  expect(view.container.querySelector('[aria-busy="true"]')).toBeInTheDocument()

  await act(async () => resolvePlans({ data: { success: true, data: [] } }))
  expect(screen.getByText('My Subscriptions')).toBeVisible()
  expect(view.container.querySelector('[aria-busy="true"]')).toBeInTheDocument()

  await act(async () =>
    resolveSubscriptions({
      data: {
        success: true,
        data: { subscriptions: [], all_subscriptions: [] },
      },
    })
  )
  expect(screen.queryByText('Subscription Plans')).not.toBeInTheDocument()
  expect(
    view.container.querySelector('[aria-busy="true"]')
  ).not.toBeInTheDocument()
})
