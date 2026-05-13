import type { TranslateSource } from '../types'
import Store from 'electron-store'

const store = new Store()

const languageNames: Record<string, string> = {
  en: 'English',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  fr: 'French',
  de: 'German',
}

function buildEndpoint(baseURL: string): string {
  let url = baseURL.replace(/\/+$/, '')
  if (!url.endsWith('/chat/completions')) {
    url += '/chat/completions'
  }
  return url
}

export const openaiCompatibleSource: TranslateSource = {
  id: 'openai-compatible',
  name: 'OpenAI Compatible',

  async translate({ text, from, to, signal, onChunk }) {
    const apiKey = store.get('apiKey', '') as string
    if (!apiKey) {
      throw new Error('API Key not configured')
    }

    const baseURL = store.get('apiBaseURL', '') as string
    if (!baseURL) {
      throw new Error('API Base URL not configured')
    }

    const model = store.get('apiModel', '') as string
    if (!model) {
      throw new Error('API Model not configured')
    }

    const fromName = languageNames[from] || from
    const toName = languageNames[to] || to

    const response = await fetch(buildEndpoint(baseURL), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a professional translator. Translate the following text. Only output the translation result, nothing else.' },
          { role: 'user', content: `The user's text is expected to be either ${fromName} or ${toName}. If it is ${fromName}, translate it to ${toName}. If it is ${toName}, translate it to ${fromName}. Only output the translation result.\n\n${text}` },
        ],
        stream: true,
      }),
      signal,
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`API error: ${response.status} ${errText}`)
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') continue

        try {
          const json = JSON.parse(data)
          const content = json.choices?.[0]?.delta?.content
          if (content) {
            onChunk(content)
          }
        } catch {
          // skip malformed JSON
        }
      }
    }
  },
}
