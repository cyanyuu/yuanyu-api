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
import { ExternalLink, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@/components/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface RedemptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  code: string
  onCodeChange: (code: string) => void
  onRedeem: () => void
  redeeming: boolean
  enabled: boolean
  topupLink?: string
}

export function RedemptionDialog(props: RedemptionDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={t('Redeem')}
      description={t('Enter your redemption code')}
      contentClassName='sm:max-w-md'
    >
      {props.enabled ? (
        <form
          className='space-y-4'
          onSubmit={(event) => {
            event.preventDefault()
            if (props.code && !props.redeeming) props.onRedeem()
          }}
        >
          <div className='space-y-2'>
            <Label htmlFor='redemption-code'>{t('Have a Code?')}</Label>
            <Input
              id='redemption-code'
              value={props.code}
              onChange={(event) => props.onCodeChange(event.target.value)}
              placeholder={t('Enter your redemption code')}
              disabled={props.redeeming}
            />
          </div>
          {props.topupLink && (
            <p className='text-muted-foreground text-xs'>
              {t('Need a redemption code?')}{' '}
              <a
                href={props.topupLink}
                target='_blank'
                rel='noopener noreferrer'
                className='text-foreground inline-flex items-center gap-1 underline underline-offset-4'
              >
                {t('Get one here')}
                <ExternalLink className='size-3' aria-hidden='true' />
              </a>
            </p>
          )}
          <Button
            type='submit'
            className='w-full'
            disabled={!props.code || props.redeeming}
          >
            {props.redeeming && <Loader2 className='size-4 animate-spin' />}
            {t('Redeem')}
          </Button>
        </form>
      ) : (
        <Alert>
          <AlertDescription>
            {t(
              'Redemption codes are disabled until the administrator confirms compliance terms.'
            )}
          </AlertDescription>
        </Alert>
      )}
    </Dialog>
  )
}
