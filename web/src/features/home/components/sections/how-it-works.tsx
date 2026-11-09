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
import { CherryStudio } from '@lobehub/icons'
import { ArrowUpRight, Code2, Terminal } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'

import { HeroTerminalDemo } from '../hero-terminal-demo'

export function HowItWorks() {
  const { t } = useTranslation()

  return (
    <section
      id='home-integrations'
      className='home-section home-integration-section'
      aria-labelledby='home-integration-title'
    >
      <div className='home-shell'>
        <div className='home-section-heading'>
          <AnimateInView>
            <h2 id='home-integration-title'>{t('Your apps. One API.')}</h2>
          </AnimateInView>
          <p>
            {t(
              'Connect your favorite clients or build directly with a standard API.'
            )}
          </p>
        </div>
        <div className='home-integration-grid'>
          <div className='home-apps' data-ui>
            <AnimateInView className='home-app-tile home-app-cherry'>
              <CherryStudio.Color size={40} aria-hidden />
              <div>
                <h3>Cherry Studio</h3>
                <p>{t('Multi-model conversations')}</p>
              </div>
              <a
                href='https://cherry-ai.com'
                target='_blank'
                rel='noopener noreferrer'
                aria-label='Cherry Studio'
              >
                <ArrowUpRight aria-hidden />
              </a>
            </AnimateInView>
            <AnimateInView className='home-app-tile home-app-switch' delay={80}>
              <Terminal aria-hidden className='size-10' />
              <div>
                <h3>CC Switch</h3>
                <p>{t('Manage your coding clients')}</p>
              </div>
              <a
                href='https://ccswitch.io'
                target='_blank'
                rel='noopener noreferrer'
                aria-label='CC Switch'
              >
                <ArrowUpRight aria-hidden />
              </a>
            </AnimateInView>
            <AnimateInView className='home-app-tile home-app-sdk' delay={160}>
              <Code2 aria-hidden className='size-10' />
              <div>
                <h3>Python / Node.js / cURL</h3>
                <p>{t('Build with a compatible SDK')}</p>
              </div>
            </AnimateInView>
            <p className='home-integration-note'>
              {t(
                'API examples are templates. Replace the API key and choose a model available to your account.'
              )}
            </p>
          </div>
          <AnimateInView className='home-code-stage' delay={100}>
            <HeroTerminalDemo />
          </AnimateInView>
        </div>
      </div>
    </section>
  )
}
