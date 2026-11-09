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
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'
import { Button } from '@/components/ui/button'

export function Features() {
  const { t } = useTranslation()

  return (
    <section className='home-section' aria-labelledby='home-reliability-title'>
      <div className='home-shell'>
        <div className='home-section-heading'>
          <AnimateInView>
            <h2 id='home-reliability-title'>
              {t('More routes. Less interruption.')}
            </h2>
          </AnimateInView>
          <p>
            {t(
              'From the first request to troubleshooting, there is always another route forward.'
            )}
          </p>
        </div>
        <div className='home-reliability-layout'>
          <AnimateInView className='home-source-panel' delay={80}>
            <div className='home-source-heading'>
              <h3>{t('Multiple backup sources')}</h3>
              <p>
                {t(
                  'A model can have more than one upstream source. Backup routes keep another option ready.'
                )}
              </p>
            </div>
            <div
              className='home-provider-board'
              data-ui
              aria-label={t('Models & Routing')}
            >
              {['OpenAI', 'Claude', 'Gemini', 'DeepSeek', 'Qwen', 'Llama'].map(
                (name) => (
                  <span key={name}>
                    {name}
                    <span className='home-model-connector' aria-hidden />
                  </span>
                )
              )}
              <div className='home-provider-caption'>
                {t('Unified access, flexible routing')}
              </div>
            </div>
          </AnimateInView>
          <div className='home-service-list'>
            <AnimateInView className='home-service-row' delay={120}>
              <h3>{t('Load-balanced routing')}</h3>
              <p>
                {t(
                  'Distribute requests across available channels with routing priorities and weights.'
                )}
              </p>
              <div className='home-load-bars' aria-hidden>
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </AnimateInView>
            <AnimateInView className='home-service-row' delay={180}>
              <h3>{t('Timely failover')}</h3>
              <p>
                {t(
                  'When an upstream has trouble, switch to an available backup to reduce disruption.'
                )}
              </p>
              <div className='home-failover-label' aria-hidden>
                <span />
                {t('Primary source')}
                <ArrowRight />
                <span />
                {t('Backup source')}
              </div>
            </AnimateInView>
            <AnimateInView
              className='home-service-row home-support-row'
              delay={240}
            >
              <div>
                <h3>{t('One-to-one support')}</h3>
                <p>
                  {t(
                    'Get personal help with integration, configuration, and troubleshooting.'
                  )}
                </p>
                <Button
                  variant='link'
                  render={<Link to='/about' />}
                  className='home-inline-link'
                >
                  {t('About Us')}
                  <ArrowRight aria-hidden />
                </Button>
              </div>
              <div className='home-support-mark' aria-hidden>
                1:1
              </div>
            </AnimateInView>
          </div>
        </div>
      </div>
    </section>
  )
}
