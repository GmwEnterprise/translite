import { ipcMain, BrowserWindow } from 'electron'
import Store from 'electron-store'

type CloseBehavior = 'tray' | 'quit'

const languageNames: Record<string, string> = {
  en: 'English',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  fr: 'French',
  de: 'German',
}

const store = new Store()
const activeControllers = new Map<string, AbortController>()

export function registerIpcHandlers(mainWindow: BrowserWindow, closeWindow: (behavior?: CloseBehavior) => void) {
  ipcMain.handle('store:get', (_event, key: string) => {
    return store.get(key, null)
  })

  ipcMain.handle('store:set', (_event, key: string, value: string) => {
    store.set(key, value)
  })

  ipcMain.handle('window:setAlwaysOnTop', (_event, flag: boolean) => {
    mainWindow.setAlwaysOnTop(flag)
  })

  ipcMain.on('window:close', (_event, behavior?: CloseBehavior) => {
    closeWindow(behavior)
  })

  ipcMain.on('window:quit', () => {
    closeWindow('quit')
  })

  ipcMain.on('translate:start', async (event, { id, text, from, to }) => {
    const apiKey = store.get('deepseekApiKey', '') as string
    if (!apiKey) {
      event.sender.send('translate:error', { id, error: 'API Key not configured' })
      return
    }

    const controller = new AbortController()
    activeControllers.set(id, controller)

    try {
      const systemPrompt = 'You are a professional translator. Translate the following text. Only output the translation result, nothing else.'
      const fromName = languageNames[from] || from
      const toName = languageNames[to] || to
      const userPrompt = `The user's text is expected to be either ${fromName} or ${toName}. If it is ${fromName}, translate it to ${toName}. If it is ${toName}, translate it to ${fromName}. Only output the translation result.\n\n${text}`

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          stream: true,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errText = await response.text()
        event.sender.send('translate:error', { id, error: `API error: ${response.status} ${errText}` })
        return
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
              event.sender.send('translate:chunk', { id, chunk: content })
            }
          } catch {
            // skip malformed JSON
          }
        }
      }

      event.sender.send('translate:done', { id })
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        event.sender.send('translate:error', { id, error: (err as Error).message })
      }
    } finally {
      activeControllers.delete(id)
    }
  })

  ipcMain.on('translate:abort', (_event, id: string) => {
    const controller = activeControllers.get(id)
    if (controller) {
      controller.abort()
      activeControllers.delete(id)
    }
  })
}
