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
import { ArrowRight, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { useSystemConfig } from '@/hooks/use-system-config'

export function RoutingDemo() {
  const { t } = useTranslation()
  const { systemName, logo } = useSystemConfig()
  const [failedOver, setFailedOver] = useState(false)

  return (
    <div className='home-routing-demo' data-ui data-failover={failedOver}>
      <div className='home-demo-toolbar'>
        <span>{t('Request flow')}</span>
        <span className='home-demo-caption'>{t('Routing demo')}</span>
      </div>
      <div className='home-route-map' aria-label={t('Request flow')}>
        <svg
          viewBox='0 0 640 360'
          preserveAspectRatio='none'
          className='home-route-wires'
          aria-hidden
        >
          <path d='M 125 180 H 280' className='home-wire-input' />
          <path
            d='M 340 180 H 395 Q 410 180 410 165 V 79 Q 410 64 430 64 H 493'
            className='home-wire-primary'
          />
          <path d='M 340 180 H 493' className='home-wire-backup' />
          <path d='M 340 180 H 395 Q 410 180 410 195 V 281 Q 410 296 430 296 H 493' />
          <circle r='4' className='home-request-packet home-packet-a' />
          <circle r='4' className='home-request-packet home-packet-b' />
          <circle r='4' className='home-request-packet home-packet-c' />
        </svg>
        <div className='home-map-app home-map-node'>
          <span className='home-map-app-icon' aria-hidden>
            &gt;_
          </span>
          <strong>{t('Your application')}</strong>
          <span>SDK / API</span>
        </div>
        <div className='home-map-gateway home-map-node'>
          <img src={logo} alt='' width='40' height='40' />
          <strong>{systemName}</strong>
          <span>{t('Load Balancing')}</span>
        </div>
        <div className='home-map-upstreams'>
          <div className='home-upstream home-upstream-primary'>
            <div>
              <strong>{t('Primary source')}</strong>
              <span>{t('Upstream')} A</span>
            </div>
            <span className='home-source-state'>
              {failedOver ? t('Unavailable') : t('Selected')}
            </span>
          </div>
          <div className='home-upstream home-upstream-backup'>
            <div>
              <strong>{t('Backup source')}</strong>
              <span>{t('Upstream')} B</span>
            </div>
            <span className='home-source-state'>
              {failedOver ? t('Selected') : t('Standby')}
            </span>
          </div>
          <div className='home-upstream'>
            <div>
              <strong>{t('Backup source')}</strong>
              <span>{t('Upstream')} C</span>
            </div>
            <span className='home-source-state'>{t('Standby')}</span>
          </div>
        </div>
      </div>
      <div className='home-demo-result'>
        <span className='home-route-status' role='status'>
          <span aria-hidden />
          {failedOver
            ? t('Backup selected. The request has another route.')
            : t('Requests follow the selected route.')}
        </span>
        <Button
          variant='secondary'
          size='sm'
          className='home-demo-switch'
          onClick={() => setFailedOver((value) => !value)}
        >
          {failedOver ? <RotateCcw aria-hidden /> : <ArrowRight aria-hidden />}
          {failedOver ? t('Reset demo') : t('Simulate failover')}
        </Button>
      </div>
      <div className='home-demo-protocols'>
        <span>OpenAI</span>
        <span>Claude</span>
        <span>Gemini</span>
        <span>DeepSeek</span>
      </div>
    </div>
  )
}
