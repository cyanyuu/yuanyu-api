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
import { ArrowRight, Infinity as InfinityIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'

export function Stats() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.auth.user)

  return (
    <section
      className='home-credit-section'
      aria-labelledby='home-credit-title'
    >
      <div className='home-shell home-credit-band'>
        <InfinityIcon aria-hidden className='home-credit-symbol' />
        <div>
          <h2 id='home-credit-title'>
            {t('Top up once. Your balance stays available.')}
          </h2>
          <p>
            {t(
              'Your top-up balance does not expire. Pay for what you use, at your own pace.'
            )}
          </p>
        </div>
        <Button
          className='home-action-warm'
          size='lg'
          render={<Link to={user ? '/wallet' : '/sign-up'} />}
        >
          {user ? t('Top Up') : t('Get Started')}
          <ArrowRight aria-hidden />
        </Button>
      </div>
    </section>
  )
}
