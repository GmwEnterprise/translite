export interface ElectronAPI {
  translate: {
    start: (text: string, from: string, to: string) => string
    onChunk: (id: string, callback: (chunk: string) => void) => () => void
    onDone: (id: string, callback: () => void) => () => void
    onError: (id: string, callback: (err: string) => void) => () => void
    abort: (id: string) => void
  }
  store: {
    get: (key: string) => Promise<string | null>
    set: (key: string, value: string) => Promise<void>
  }
  window: {
    setAlwaysOnTop: (flag: boolean) => Promise<void>
    close: () => void
  }
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
