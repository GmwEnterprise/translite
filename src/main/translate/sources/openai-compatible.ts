import type { TranslateSource } from '../types'
import Store from 'electron-store'
import os from 'os'
import fs from 'fs'
import path from 'path'

const store = new Store()

const languageNames: Record<string, string> = {
  en: 'English',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  fr: 'French',
  de: 'German',
}

const greetings: Record<string, string> = {
  en: 'Hello',
  ja: 'こんにちは',
  ko: '안녕하세요',
  zh: '你好',
  fr: 'Bonjour',
  de: 'Hallo',
}

function buildEndpoint(baseURL: string): string {
  let url = baseURL.replace(/\/+$/, '')
  if (!url.endsWith('/chat/completions')) {
    url += '/chat/completions'
  }
  return url
}

function appendRequestLog(entry: object): void {
  const logDir = path.join(os.homedir(), '.translite', 'ai-requests')
  const now = new Date()
  const dateStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')
  const logFile = path.join(logDir, `${dateStr}.jsonl`)
  fs.mkdirSync(logDir, { recursive: true })
  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n')
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

    const systemContent = [
      'You are a professional translator.',
      `- If the text is in ${fromName}, translate it to ${toName}.`,
      `- If the text is in ${toName}, translate it to ${fromName}.`,
      '',
      'Rules:',
      '- Provide a formal, literal translation based on the context of the sentence.',
      '- Preserve all markdown symbols and line breaks from the original text.',
      '',
      'You must respond with a JSON object:',
      '{"result": "translated text", "lang": "target language code"}',
      '',
      `Language codes: ${from}, ${to}`,
      '',
      'Examples:',
      `{"text": "${greetings[from]}", "lang_target": "${to}"} → {"result": "${greetings[to]}", "lang": "${to}"}`,
      `{"text": "${greetings[to]}", "lang_target": "${from}"} → {"result": "${greetings[from]}", "lang": "${from}"}`,
      '',
      'Do not include any text outside the JSON.',
    ].join('\n')

    const userContent = JSON.stringify({ text, lang_target: to })
    const endpoint = buildEndpoint(baseURL)

    const requestBody = {
      model,
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: userContent },
      ],
      stream: true,
      enable_thinking: false,
      thinking: { type: 'disabled' },
      response_format: { type: 'json_object' },
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal,
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`API error: ${response.status} ${errText}`)
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let sseBuffer = ''
    let fullContent = ''
    let usage: Record<string, unknown> | undefined

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      sseBuffer += decoder.decode(value, { stream: true })
      const lines = sseBuffer.split('\n')
      sseBuffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') continue

        try {
          const json = JSON.parse(data)
          const content = json.choices?.[0]?.delta?.content
          if (content) {
            fullContent += content
          }
          if (json.usage) {
            usage = json.usage as Record<string, unknown>
          }
        } catch {
          // skip malformed JSON
        }
      }
    }

    let resultText: string
    try {
      const parsed = JSON.parse(fullContent)
      resultText = parsed.result || ''
      onChunk(resultText)
    } catch {
      resultText = fullContent
      onChunk(fullContent)
    }

    appendRequestLog({
      timestamp: new Date().toISOString(),
      url: endpoint,
      request: requestBody,
      response: fullContent,
      usage: usage || null,
    })
  },
}
