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
import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { TitledCard } from '@/components/ui/titled-card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatNumber } from '@/lib/format'

import {
  formatCurrency,
  getDiscountLabel,
  getPaymentIcon,
  getMinTopupAmount,
  calculatePresetPricing,
} from '../lib'
import type {
  PaymentMethod,
  PresetAmount,
  TopupInfo,
  CreemProduct,
  WaffoPayMethod,
} from '../types'
import { CreemProductsSection } from './creem-products-section'

interface RechargeFormCardProps {
  topupInfo: TopupInfo | null
  presetAmounts: PresetAmount[]
  selectedPreset: number | null
  onSelectPreset: (preset: PresetAmount) => void
  topupAmount: number
  onTopupAmountChange: (amount: number) => void
  paymentAmount: number
  calculating: boolean
  onPaymentMethodSelect: (method: PaymentMethod) => void
  paymentLoading: string | null
  loading?: boolean
  priceRatio?: number
  usdExchangeRate?: number
  creemProducts?: CreemProduct[]
  enableCreemTopup?: boolean
  onCreemProductSelect?: (product: CreemProduct) => void
  enableWaffoTopup?: boolean
  waffoPayMethods?: WaffoPayMethod[]
  waffoMinTopup?: number
  onWaffoMethodSelect?: (method: WaffoPayMethod, index: number) => void
  enableWaffoPancakeTopup?: boolean
}

export function RechargeFormCard({
  topupInfo,
  presetAmounts,
  selectedPreset,
  onSelectPreset,
  topupAmount,
  onTopupAmountChange,
  paymentAmount,
  calculating,
  onPaymentMethodSelect,
  paymentLoading,
  loading,
  priceRatio = 1,
  usdExchangeRate = 1,
  creemProducts,
  enableCreemTopup,
  onCreemProductSelect,
  enableWaffoTopup,
  waffoPayMethods,
  waffoMinTopup,
  onWaffoMethodSelect,
  enableWaffoPancakeTopup,
}: RechargeFormCardProps) {
  const { t } = useTranslation()
  const [localAmount, setLocalAmount] = useState(topupAmount.toString())

  useEffect(() => {
    // Empty string must survive, otherwise the field can never be cleared
    setLocalAmount((prev) =>
      prev === '' && topupAmount === 0 ? prev : topupAmount.toString()
    )
  }, [topupAmount])

  const handleAmountChange = (value: string) => {
    setLocalAmount(value)
    const numValue = Number.parseInt(value) || 0
    if (numValue >= 0) {
      onTopupAmountChange(numValue)
    }
  }

  const hasConfigurableTopup =
    topupInfo?.enable_online_topup ||
    topupInfo?.enable_stripe_topup ||
    enableWaffoTopup ||
    enableWaffoPancakeTopup
  const hasAnyTopup = hasConfigurableTopup || enableCreemTopup
  const hasStandardPaymentMethods =
    Array.isArray(topupInfo?.pay_methods) && topupInfo.pay_methods.length > 0
  const hasWaffoPaymentMethods =
    Array.isArray(waffoPayMethods) && waffoPayMethods.length > 0
  const minTopup = getMinTopupAmount(topupInfo)

  return (
    <TitledCard
      title={t('Add Funds')}
      description={t('Choose an amount and payment method')}
      disableHoverEffect
      className='wallet-recharge rounded-2xl shadow-none ring-0'
      headerClassName='border-b-0 p-4 !pb-0 sm:p-5 sm:!pb-0'
      titleClassName='text-lg font-semibold tracking-tight sm:text-xl'
      descriptionClassName='mt-1 text-xs leading-relaxed sm:text-xs'
      contentClassName='space-y-4 p-4 sm:p-5'
    >
      {/* Online Topup Section */}
      {loading ? (
        <div className='space-y-4' aria-busy='true'>
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>{t('Amount')}</Label>
            <div
              className='wallet-preset-grid grid grid-cols-2 gap-2 sm:grid-cols-3'
              aria-hidden='true'
            >
              {Array.from(
                { length: presetAmounts.length || 8 },
                (_, index) => `preset-${index}`
              ).map((key) => (
                <Skeleton key={key} className='h-16 rounded-[10px]' />
              ))}
            </div>
          </div>
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>{t('Custom Amount')}</Label>
            <Skeleton
              className='h-11 w-full rounded-[10px] sm:h-10'
              aria-hidden='true'
            />
          </div>
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>{t('Payment Method')}</Label>
            <div
              className='grid grid-cols-2 gap-2 sm:grid-cols-3'
              aria-hidden='true'
            >
              {['primary', 'secondary'].map((key) => (
                <Skeleton key={key} className='h-11 rounded-[10px] sm:h-10' />
              ))}
            </div>
          </div>
          <div className='wallet-payment-total flex items-center justify-between gap-4 border-t pt-3'>
            <span className='text-muted-foreground text-sm'>
              {t('Amount to pay:')}
            </span>
            <Skeleton className='h-7 w-20' aria-hidden='true' />
          </div>
        </div>
      ) : null}
      {!loading &&
        (hasAnyTopup ? (
          <div className='space-y-4'>
            {hasConfigurableTopup && (
              <>
                {presetAmounts.length > 0 && (
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium'>{t('Amount')}</Label>
                    <div className='wallet-preset-grid grid grid-cols-2 gap-2 sm:grid-cols-3'>
                      {presetAmounts.map((preset) => {
                        const discount =
                          preset.discount ||
                          topupInfo?.discount?.[preset.value] ||
                          1.0
                        const {
                          displayValue,
                          actualPrice,
                          savedAmount,
                          hasDiscount,
                        } = calculatePresetPricing(
                          preset.value,
                          priceRatio,
                          discount,
                          usdExchangeRate
                        )
                        return (
                          <Button
                            key={preset.value}
                            variant='outline'
                            className='wallet-preset flex h-auto min-h-16 flex-col items-start justify-center gap-1 rounded-[10px] px-3 py-2 text-left whitespace-normal tabular-nums'
                            aria-pressed={selectedPreset === preset.value}
                            onClick={() => onSelectPreset(preset)}
                          >
                            <div className='flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-0.5'>
                              <div className='text-lg leading-tight font-semibold tracking-tight'>
                                {formatNumber(displayValue)}
                              </div>
                              {hasDiscount && (
                                <div className='text-xs font-medium text-emerald-700 dark:text-emerald-400'>
                                  {getDiscountLabel(discount, t)}
                                </div>
                              )}
                            </div>
                            <div className='text-muted-foreground w-full text-xs'>
                              {hasDiscount && savedAmount > 0 ? (
                                <Trans
                                  t={t}
                                  i18nKey='Pay {{amount}} <savings>• Save {{saved}}</savings>'
                                  values={{
                                    amount: formatCurrency(actualPrice),
                                    saved: formatCurrency(savedAmount),
                                  }}
                                  components={{
                                    savings: (
                                      <span className='text-emerald-700 dark:text-emerald-400' />
                                    ),
                                  }}
                                />
                              ) : (
                                t('Pay {{amount}}', {
                                  amount: formatCurrency(actualPrice),
                                })
                              )}
                            </div>
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className='space-y-2'>
                  <Label htmlFor='topup-amount' className='text-sm font-medium'>
                    {t('Custom Amount')}
                  </Label>
                  <div>
                    <Input
                      id='topup-amount'
                      type='number'
                      value={localAmount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      min={minTopup}
                      placeholder={t('Minimum {{amount}}', {
                        amount: minTopup,
                      })}
                      className='h-11 rounded-[10px] text-base font-medium tabular-nums sm:h-10'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium'>
                    {t('Payment Method')}
                  </Label>
                  {hasStandardPaymentMethods ? (
                    <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
                      {topupInfo?.pay_methods?.map((method) => {
                        const minTopup = Math.max(
                          method.min_topup || 0,
                          getMinTopupAmount(topupInfo)
                        )
                        const disabled = minTopup > topupAmount
                        const disabledReason = disabled
                          ? t('Minimum topup amount: {{amount}}', {
                              amount: minTopup,
                            })
                          : undefined
                        const disabledLabel = disabled
                          ? `${t('Minimum:')} ${minTopup}`
                          : undefined

                        const button = (
                          <Button
                            key={method.type}
                            variant='outline'
                            onClick={() => onPaymentMethodSelect(method)}
                            disabled={disabled || !!paymentLoading}
                            aria-busy={
                              paymentLoading === method.type || undefined
                            }
                            title={disabledReason}
                            aria-label={
                              disabledReason
                                ? `${method.name}. ${disabledReason}`
                                : method.name
                            }
                            className='wallet-payment-method h-auto min-h-11 min-w-0 justify-start gap-2 rounded-[10px] px-2.5 py-2 text-left text-xs sm:min-h-10'
                          >
                            {paymentLoading === method.type ? (
                              <Loader2 className='h-4 w-4 animate-spin' />
                            ) : (
                              getPaymentIcon(
                                method.type,
                                'h-4 w-4',
                                method.icon,
                                method.name
                              )
                            )}
                            <span className='flex min-w-0 flex-col items-start gap-0.5'>
                              <span className='max-w-full truncate'>
                                {method.name}
                              </span>
                              {disabledLabel && (
                                <span className='text-muted-foreground max-w-full truncate text-[11px] leading-4 font-normal'>
                                  {disabledLabel}
                                </span>
                              )}
                            </span>
                          </Button>
                        )

                        return disabled ? (
                          <TooltipProvider key={method.type}>
                            <Tooltip>
                              <TooltipTrigger render={button} />
                              <TooltipContent>{disabledReason}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          button
                        )
                      })}
                    </div>
                  ) : null}
                  {!hasStandardPaymentMethods && !hasWaffoPaymentMethods && (
                    <Alert>
                      <AlertDescription>
                        {t(
                          'No payment methods available. Please contact administrator.'
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {enableWaffoTopup &&
                  hasWaffoPaymentMethods &&
                  onWaffoMethodSelect && (
                    <div className='space-y-2'>
                      <Label className='text-xs font-medium'>
                        {t('Waffo Payment')}
                      </Label>
                      <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
                        {waffoPayMethods?.map((method, index) => {
                          const loadingKey = `waffo-${index}`
                          const methodKey = `${method.payMethodType ?? 'unknown'}-${method.payMethodName ?? method.name}`
                          const waffoMin = waffoMinTopup || 0
                          const belowMin = waffoMin > topupAmount
                          const disabledReason = belowMin
                            ? t('Minimum topup amount: {{amount}}', {
                                amount: waffoMin,
                              })
                            : undefined
                          const disabledLabel = belowMin
                            ? `${t('Minimum:')} ${waffoMin}`
                            : undefined

                          let methodIcon = getPaymentIcon('waffo')
                          if (paymentLoading === loadingKey) {
                            methodIcon = (
                              <Loader2 className='h-4 w-4 animate-spin' />
                            )
                          } else if (method.icon) {
                            methodIcon = (
                              <img
                                src={method.icon}
                                alt={method.name}
                                className='h-4 w-4 object-contain'
                              />
                            )
                          }

                          const button = (
                            <Button
                              key={methodKey}
                              variant='outline'
                              onClick={() => onWaffoMethodSelect(method, index)}
                              disabled={belowMin || !!paymentLoading}
                              aria-busy={
                                paymentLoading === loadingKey || undefined
                              }
                              title={disabledReason}
                              aria-label={
                                disabledReason
                                  ? `${method.name}. ${disabledReason}`
                                  : method.name
                              }
                              className='wallet-payment-method h-auto min-h-11 min-w-0 justify-start gap-2 rounded-[10px] px-2.5 py-2 text-left text-xs sm:min-h-10'
                            >
                              {methodIcon}
                              <span className='flex min-w-0 flex-col items-start gap-0.5'>
                                <span className='max-w-full truncate'>
                                  {method.name}
                                </span>
                                {disabledLabel && (
                                  <span className='text-muted-foreground max-w-full truncate text-[11px] leading-4 font-normal'>
                                    {disabledLabel}
                                  </span>
                                )}
                              </span>
                            </Button>
                          )

                          return belowMin ? (
                            <TooltipProvider key={methodKey}>
                              <Tooltip>
                                <TooltipTrigger render={button} />
                                <TooltipContent>
                                  {disabledReason}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            button
                          )
                        })}
                      </div>
                    </div>
                  )}
                <div
                  className='wallet-payment-total flex items-center justify-between gap-4 border-t pt-3'
                  aria-live='polite'
                  aria-busy={calculating}
                >
                  <span className='text-muted-foreground text-sm'>
                    {t('Amount to pay:')}
                  </span>
                  {calculating ? (
                    <Skeleton className='h-7 w-20' />
                  ) : (
                    <span className='text-xl font-semibold tracking-tight break-all tabular-nums'>
                      {formatCurrency(paymentAmount)}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              {t(
                'Online topup is not enabled. Please use redemption code or contact administrator.'
              )}
            </AlertDescription>
          </Alert>
        ))}

      {/* Creem Products Section */}
      {!loading &&
        enableCreemTopup &&
        Array.isArray(creemProducts) &&
        creemProducts.length > 0 &&
        onCreemProductSelect && (
          <div className='space-y-2 border-t pt-4'>
            <Label className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
              {t('Creem Payment')}
            </Label>
            <CreemProductsSection
              products={creemProducts}
              onProductSelect={onCreemProductSelect}
            />
          </div>
        )}
    </TitledCard>
  )
}
