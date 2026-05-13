import { ipcMain, BrowserWindow } from 'electron'
import Store from 'electron-store'
import { getSource, getAllSources } from './translate'

type CloseBehavior = 'tray' | 'quit'

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

  ipcMain.handle('translate:sources', () => {
    return getAllSources()
  })

  ipcMain.on('translate:start', async (event, { id, text, from, to }) => {
    const sourceId = store.get('translateSource', 'openai-compatible') as string
    const source = getSource(sourceId)
    if (!source) {
      event.sender.send('translate:error', { id, error: `Unknown source: ${sourceId}` })
      return
    }

    const controller = new AbortController()
    activeControllers.set(id, controller)

    try {
      await source.translate({
        text,
        from,
        to,
        signal: controller.signal,
        onChunk: (chunk) => {
          event.sender.send('translate:chunk', { id, chunk })
        },
      })
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
