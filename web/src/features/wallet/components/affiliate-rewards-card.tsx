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
import { Share2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { formatQuota } from '@/lib/format'

import type { UserWalletData } from '../types'

interface AffiliateRewardsCardProps {
  user: UserWalletData | null
  affiliateLink: string
  onTransfer: () => void
  complianceConfirmed?: boolean
  loading?: boolean
}

export function AffiliateRewardsCard({
  user,
  affiliateLink,
  onTransfer,
  complianceConfirmed = true,
  loading,
}: AffiliateRewardsCardProps) {
  const { t } = useTranslation()
  const hasRewards = (user?.aff_quota ?? 0) > 0

  return (
    <Card
      data-card-hover='false'
      className='wallet-referral py-0'
      aria-busy={loading || undefined}
    >
      <CardContent className='wallet-referral-content'>
        <div className='wallet-referral-intro'>
          <Share2
            className='wallet-referral-icon size-5 shrink-0'
            aria-hidden='true'
          />
          <div className='min-w-0'>
            <h3 className='text-sm font-semibold'>{t('Referral Program')}</h3>
            <p className='text-muted-foreground mt-1.5 text-xs leading-relaxed'>
              {t(
                'Earn rewards when users join through your referral link. Transfer accumulated rewards to your balance anytime.'
              )}
            </p>
          </div>
        </div>

        <dl className='wallet-referral-stats'>
          {[
            [t('Pending'), formatQuota(user?.aff_quota ?? 0)],
            [t('Total Earned'), formatQuota(user?.aff_history_quota ?? 0)],
            [t('Invites'), String(user?.aff_count ?? 0)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className='text-muted-foreground text-xs'>{label}</dt>
              <dd className='mt-1.5 text-lg font-semibold tabular-nums'>
                {loading ? (
                  <Skeleton
                    className='mx-auto h-7 w-16 max-w-full'
                    aria-hidden='true'
                  />
                ) : (
                  value
                )}
              </dd>
            </div>
          ))}
        </dl>

        <div className='wallet-referral-actions'>
          <div className='wallet-referral-link'>
            {loading ? (
              <Skeleton
                className='my-2 ml-3 h-6 min-w-0 flex-1'
                aria-hidden='true'
              />
            ) : (
              <>
                <Input
                  value={affiliateLink}
                  readOnly
                  aria-label={t('Copy referral link')}
                  className='h-10 min-w-0 flex-1 border-0 bg-transparent font-mono text-xs shadow-none'
                />
                <CopyButton
                  value={affiliateLink}
                  variant='ghost'
                  className='size-9 shrink-0'
                  iconClassName='size-4'
                  tooltip={t('Copy referral link')}
                  aria-label={t('Copy referral link')}
                />
              </>
            )}
          </div>
          {loading && (hasRewards || !user) ? (
            <Skeleton className='h-10 w-28 shrink-0' aria-hidden='true' />
          ) : null}
          {!loading && hasRewards && (
            <Button
              onClick={onTransfer}
              disabled={!complianceConfirmed}
              className='h-10 shrink-0 px-3'
              size='sm'
            >
              {t('Transfer to Balance')}
            </Button>
          )}
        </div>
        {!complianceConfirmed ? (
          <p className='wallet-referral-notice text-muted-foreground text-xs'>
            {t(
              'Referral reward transfer is disabled until the administrator confirms compliance terms.'
            )}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
