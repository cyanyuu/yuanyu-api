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
import { ArrowUpRight, Activity, Crown, WalletCards } from 'lucide-react'
import type { PointerEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { Skeleton } from '@/components/ui/skeleton'
import { formatNumber, formatQuota } from '@/lib/format'
import { useSystemConfigStore } from '@/stores/system-config-store'

import type { UserWalletData } from '../types'

interface WalletStatsCardProps {
  user: UserWalletData | null
  loading?: boolean
}

function resetBalanceCardTilt(event: PointerEvent<HTMLElement>) {
  event.currentTarget.style.removeProperty('--wallet-rotate-x')
  event.currentTarget.style.removeProperty('--wallet-rotate-y')
  event.currentTarget.style.removeProperty('--wallet-shadow-x')
}

export function WalletStatsCard(props: WalletStatsCardProps) {
  const { t } = useTranslation()
  const systemName = useSystemConfigStore((state) => state.config.systemName)
  const stats = [
    {
      label: t('Total Usage'),
      value: formatQuota(props.user?.used_quota ?? 0),
      icon: ArrowUpRight,
    },
    {
      label: t('API Requests'),
      value: formatNumber(props.user?.request_count ?? 0),
      icon: Activity,
    },
  ]

  return (
    <div className='wallet-overview' aria-busy={props.loading || undefined}>
      <section
        className='wallet-balance-interaction'
        aria-label={t('Current Balance')}
        onPointerMove={(event) => {
          if (
            event.pointerType !== 'mouse' ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ) {
            resetBalanceCardTilt(event)
            return
          }
          // Measure the stationary surface so the tilt cannot shift its own input.
          const card = event.currentTarget
          const bounds = card.getBoundingClientRect()
          const x = Math.max(
            0,
            Math.min(1, (event.clientX - bounds.left) / bounds.width)
          )
          const y = Math.max(
            0,
            Math.min(1, (event.clientY - bounds.top) / bounds.height)
          )
          card.style.setProperty('--wallet-glow-x', `${x * bounds.width}px`)
          card.style.setProperty('--wallet-glow-y', `${y * bounds.height}px`)
          card.style.setProperty('--wallet-rotate-x', `${(0.5 - y) * 8}deg`)
          card.style.setProperty('--wallet-rotate-y', `${(x - 0.5) * 8}deg`)
          card.style.setProperty('--wallet-shadow-x', `${(0.5 - x) * 10}px`)
        }}
        onPointerLeave={resetBalanceCardTilt}
        onPointerCancel={resetBalanceCardTilt}
      >
        <div className='wallet-balance-card'>
          <span className='wallet-card-glow' aria-hidden='true' />
          <div className='relative flex items-center justify-between gap-4'>
            <span className='wallet-card-brand' title={systemName || 'New API'}>
              <WalletCards className='size-5 shrink-0' aria-hidden='true' />
              <span className='truncate'>{systemName || 'New API'}</span>
            </span>
            <span className='wallet-card-vip' aria-hidden='true'>
              <Crown className='size-4' /> VIP
            </span>
          </div>
          <div className='wallet-card-amount'>
            <p className='wallet-card-label'>{t('Current Balance')}</p>
            <div className='wallet-card-value'>
              {props.loading ? (
                <Skeleton className='h-[1.15em] w-40 max-w-full bg-current/15' />
              ) : (
                formatQuota(props.user?.quota ?? 0)
              )}
            </div>
          </div>
          <div className='wallet-card-footer relative flex items-end justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <span className='wallet-card-chip' aria-hidden='true' />
              <span>{t('Remaining quota')}</span>
            </div>
            {props.loading ? (
              <Skeleton className='h-5 w-20 max-w-[40%] bg-current/15' />
            ) : (
              <span className='max-w-[60%] truncate text-sm font-medium'>
                {props.user?.username || '—'}
              </span>
            )}
          </div>
          <span
            className='wallet-card-attribution truncate font-semibold'
            title={systemName}
          >
            {systemName}
          </span>
        </div>
      </section>
      <dl className='wallet-metrics'>
        {stats.map((item) => (
          <div key={item.label} className='wallet-metric'>
            <dt className='text-muted-foreground flex items-center gap-2 text-sm'>
              <item.icon className='size-4 shrink-0' aria-hidden='true' />
              {item.label}
            </dt>
            <dd>
              {props.loading ? (
                <div className='wallet-metric-value'>
                  <Skeleton className='h-[1.2em] w-20 max-w-full' />
                </div>
              ) : (
                <span className='wallet-metric-value'>{item.value}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
