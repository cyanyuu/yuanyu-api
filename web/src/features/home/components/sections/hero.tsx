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
import { ArrowDown, ArrowRight, BookOpen, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { Button } from '@/components/ui/button'
import { useChatPresets } from '@/features/chat/hooks/use-chat-presets'
import { useStatus } from '@/hooks/use-status'
import { useSystemConfig } from '@/hooks/use-system-config'

import { RoutingDemo } from '../routing-demo'

interface HeroProps {
  isAuthenticated?: boolean
}

export function Hero(props: HeroProps) {
  const { t } = useTranslation()
  const { systemName } = useSystemConfig()
  const { serverAddress } = useChatPresets()
  const { status } = useStatus()
  const docsUrl =
    (status?.docs_link as string | undefined) || 'https://docs.newapi.pro'
  const externalDocs = /^https?:\/\//i.test(docsUrl)

  return (
    <section className='home-hero' aria-labelledby='home-title'>
      <div className='home-shell home-hero-grid'>
        <div className='home-hero-copy'>
          <h1 id='home-title'>{systemName}</h1>
          <p className='home-brand-line'>
            {t('Compute at the source. Intelligence connected.')}
          </p>
          <p className='home-lead'>
            {t(
              'One API for leading AI models. Reliable routing, backup sources, and a real person when you need help.'
            )}
          </p>
          <div className='home-hero-address' data-ui>
            <div>
              <span>{t('API Base URL')}</span>
              <code>{serverAddress}</code>
            </div>
            <CopyButton
              value={serverAddress}
              aria-label={t('Copy API base URL')}
              size='sm'
              className='home-hero-copy-button'
            >
              {t('Copy')}
            </CopyButton>
          </div>
          <div className='home-actions'>
            <Button
              className='home-action-primary'
              size='lg'
              render={
                <Link to={props.isAuthenticated ? '/dashboard' : '/sign-up'} />
              }
            >
              {props.isAuthenticated ? t('Go to Dashboard') : t('Get Started')}
              <ArrowRight aria-hidden />
            </Button>
            <Button
              className='home-action-secondary'
              size='lg'
              variant='ghost'
              render={<a href='#home-integrations' />}
            >
              {t('Explore API integration')}
              <ArrowDown aria-hidden />
            </Button>
          </div>
          <ul className='home-hero-benefits'>
            <li>
              <Check aria-hidden />
              {t('Load-balanced routing')}
            </li>
            <li>
              <Check aria-hidden />
              {t('Multiple backup sources')}
            </li>
            <li>
              <Check aria-hidden />
              {t('One-to-one support')}
            </li>
          </ul>
          <a
            className='home-docs-link'
            href={docsUrl}
            target={externalDocs ? '_blank' : undefined}
            rel={externalDocs ? 'noopener noreferrer' : undefined}
          >
            <BookOpen aria-hidden />
            {t('Docs')}
            <ArrowRight aria-hidden />
          </a>
        </div>
        <div className='home-hero-media'>
          <RoutingDemo />
        </div>
      </div>
    </section>
  )
}
