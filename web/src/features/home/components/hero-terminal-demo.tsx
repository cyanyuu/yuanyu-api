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
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useChatPresets } from '@/features/chat/hooks/use-chat-presets'
import { cn } from '@/lib/utils'

interface HeroTerminalDemoProps {
  className?: string
}

export function HeroTerminalDemo(props: HeroTerminalDemoProps) {
  const { t } = useTranslation()
  const { serverAddress } = useChatPresets()
  const apiBase = `${serverAddress.replace(/\/+$/, '').replace(/\/v1$/, '')}/v1`
  const examples = [
    {
      id: 'curl',
      label: 'cURL',
      filename: 'request.sh',
      code: `curl '${apiBase}/chat/completions' \\\n  -H 'Authorization: Bearer YOUR_API_KEY' \\\n  -H 'Content-Type: application/json' \\\n  -d '{
    "model": "YOUR_MODEL",
    "messages": [
      { "role": "user", "content": "Hello!" }
    ]
  }'`,
    },
    {
      id: 'python',
      label: 'Python',
      filename: 'main.py',
      code: `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="${apiBase}"
)

response = client.chat.completions.create(
    model="YOUR_MODEL",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)`,
    },
    {
      id: 'node',
      label: 'Node.js',
      filename: 'index.mjs',
      code: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "YOUR_API_KEY",
  baseURL: "${apiBase}"
});

const response = await client.chat.completions.create({
  model: "YOUR_MODEL",
  messages: [{ role: "user", content: "Hello!" }]
});
console.log(response.choices[0].message.content);`,
    },
  ]

  return (
    <div className={cn('home-api-demo', props.className)} data-ui>
      <div className='home-api-address'>
        <div>
          <span>{t('API Base URL')}</span>
          <code>{apiBase}</code>
        </div>
        <CopyButton value={apiBase} aria-label={t('Copy API base URL')} />
      </div>
      <Tabs defaultValue='curl'>
        <TabsList
          aria-label={t('API examples')}
          className='home-code-tabs'
          variant='line'
        >
          {examples.map((example) => (
            <TabsTrigger value={example.id} key={example.id}>
              {example.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {examples.map((example) => (
          <TabsContent
            value={example.id}
            key={example.id}
            className='home-code-content'
          >
            <div className='home-code-toolbar'>
              <span>{example.filename}</span>
              <CopyButton
                value={example.code}
                aria-label={t('Copy API example')}
              />
            </div>
            <pre
              tabIndex={0}
              aria-label={`${example.label} ${t('API example')}`}
            >
              <code>{example.code}</code>
            </pre>
          </TabsContent>
        ))}
      </Tabs>
      <div className='home-api-endpoints'>
        <span>POST /v1/chat/completions</span>
        <span>POST /v1/responses</span>
      </div>
    </div>
  )
}
