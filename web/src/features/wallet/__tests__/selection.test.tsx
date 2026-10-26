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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'

import type {
  PlanRecord,
  UserSubscriptionRecord,
} from '@/features/subscriptions/types'
import { api } from '@/lib/api'

import { SubscriptionPlansCard } from '../components/subscription-plans-card'

const plans: PlanRecord[] = [
  {
    plan: {
      id: 1,
      title: 'Standard',
      price_amount: 10,
      currency: 'USD',
      duration_unit: 'month',
      duration_value: 1,
      quota_reset_period: 'monthly',
      enabled: true,
      sort_order: 0,
      allow_balance_pay: true,
      allow_wallet_overflow: true,
      max_purchase_per_user: 1,
      total_amount: 50000000,
    },
  },
  {
    plan: {
      id: 2,
      title: 'Pro',
      price_amount: 30,
      currency: 'USD',
      duration_unit: 'month',
      duration_value: 1,
      quota_reset_period: 'monthly',
      enabled: true,
      sort_order: 1,
      allow_balance_pay: true,
      allow_wallet_overflow: true,
      max_purchase_per_user: 0,
      total_amount: 150000000,
    },
  },
]

const subscriptions: UserSubscriptionRecord[] = [
  {
    subscription: {
      id: 101,
      user_id: 1,
      plan_id: 1,
      status: 'active',
      start_time: 1700000000,
      end_time: 4102444800,
      amount_total: 50000000,
      amount_used: 1000000,
    },
  },
  {
    subscription: {
      id: 102,
      user_id: 1,
      plan_id: 2,
      status: 'expired',
      start_time: 1600000000,
      end_time: 1700000000,
      amount_total: 150000000,
      amount_used: 150000000,
    },
  },
]

function renderSubscriptions(records: UserSubscriptionRecord[] = []) {
  vi.spyOn(api, 'get').mockImplementation(async (url) => ({
    data: {
      success: true,
      data:
        url === '/api/subscription/plans'
          ? plans
          : {
              subscriptions: records.filter(
                (record) => record.subscription.status === 'active'
              ),
              all_subscriptions: records,
              billing_preference: 'wallet_first',
            },
    },
  }))
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SubscriptionPlansCard topupInfo={null} />
    </QueryClientProvider>
  )
}

it('shows only the chosen plan and opens the purchase dialog for that plan', async () => {
  const user = userEvent.setup()
  renderSubscriptions()

  expect(await screen.findByRole('heading', { name: 'Standard' })).toBeVisible()
  expect(screen.queryByRole('heading', { name: 'Pro' })).not.toBeInTheDocument()
  const selector = screen.getByRole('combobox', { name: 'Subscription Plans' })
  await user.click(selector)
  await user.click(await screen.findByRole('option', { name: 'Pro' }))

  expect(await screen.findByRole('heading', { name: 'Pro' })).toBeVisible()
  expect(
    screen.queryByRole('heading', { name: 'Standard' })
  ).not.toBeInTheDocument()
  expect(screen.getByText('$30.00')).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Subscribe Now' }))
  const dialog = await screen.findByRole('dialog', {
    name: 'Purchase Subscription',
  })
  expect(within(dialog).getByText('Pro')).toBeVisible()
  expect(within(dialog).getByText('$30.00')).toBeVisible()
})

it('keeps the purchase limit attached to its plan after changing the selection', async () => {
  const user = userEvent.setup()
  renderSubscriptions(subscriptions)

  expect(
    await screen.findByRole('button', { name: 'Limit Reached' })
  ).toBeDisabled()
  const selector = screen.getByRole('combobox', { name: 'Subscription Plans' })
  await user.click(selector)
  await user.click(await screen.findByRole('option', { name: 'Pro' }))
  expect(
    await screen.findByRole('button', { name: 'Subscribe Now' })
  ).toBeEnabled()
  await user.click(selector)
  await user.click(await screen.findByRole('option', { name: 'Standard' }))
  expect(
    await screen.findByRole('button', { name: 'Limit Reached' })
  ).toBeDisabled()
})

it('opens active and expired subscription records from the compact summary', async () => {
  const user = userEvent.setup()
  renderSubscriptions(subscriptions)

  const historyButton = await screen.findByRole('button', {
    name: 'My Subscriptions',
  })
  expect(screen.queryByText(/Subscription #101/)).not.toBeInTheDocument()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  await user.click(historyButton)

  const dialog = await screen.findByRole('dialog', { name: 'My Subscriptions' })
  expect(within(dialog).getByText('Standard · Subscription #101')).toBeVisible()
  expect(within(dialog).getByText('Pro · Subscription #102')).toBeVisible()
  expect(within(dialog).getByText('Active')).toBeVisible()
  expect(within(dialog).getByText('Expired')).toBeVisible()
})
