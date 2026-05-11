import { app, BrowserWindow, globalShortcut, Menu, nativeImage, screen, Tray, type Rectangle } from 'electron'
import { join } from 'path'
import Store from 'electron-store'
import { registerIpcHandlers } from './ipc-handlers'

type CloseBehavior = 'tray' | 'quit'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false
const store = new Store()
const windowBoundsKey = 'windowBounds'
const closeBehaviorKey = 'closeBehavior'
const minWidth = 360
const minHeight = 420

function resolveIconPath(name: string): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, name)
  }
  return join(__dirname, '../../build', name)
}

function loadIcon(name: string): Electron.NativeImage {
  return nativeImage.createFromPath(resolveIconPath(name))
}

function loadTrayIcon(): Electron.NativeImage {
  return loadIcon('tray-icon.png')
}

function loadWindowIcon(): Electron.NativeImage {
  return loadIcon('icon.png')
}

function getDefaultBounds(): Rectangle {
  const { x: screenX, y: screenY, width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workArea
  const width = 420
  const height = 500

  return {
    width,
    height,
    x: screenX + screenWidth - width - 80,
    y: screenY + screenHeight - height - 120,
  }
}

function getInitialBounds(): Rectangle {
  const savedBounds = store.get(windowBoundsKey) as Partial<Rectangle> | undefined

  if (
    savedBounds &&
    typeof savedBounds.x === 'number' &&
    typeof savedBounds.y === 'number' &&
    typeof savedBounds.width === 'number' &&
    typeof savedBounds.height === 'number'
  ) {
    return {
      x: savedBounds.x,
      y: savedBounds.y,
      width: Math.max(savedBounds.width, minWidth),
      height: Math.max(savedBounds.height, minHeight),
    }
  }

  return getDefaultBounds()
}

function saveWindowBounds() {
  if (!mainWindow || mainWindow.isDestroyed()) return
  store.set(windowBoundsKey, mainWindow.getBounds())
}

function showWindow() {
  if (!mainWindow) return
  mainWindow.show()
  mainWindow.focus()
}

function quitApp() {
  isQuitting = true
  app.quit()
}

function createTray() {
  if (tray) return

  const icon = loadTrayIcon()
  tray = new Tray(icon)
  tray.setToolTip('Translite')
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: '显示', click: showWindow },
    { label: '退出', click: quitApp },
  ]))
  tray.on('click', showWindow)
}

function closeWindow(behavior = store.get(closeBehaviorKey, 'tray') as CloseBehavior) {
  saveWindowBounds()
  if (behavior === 'quit') {
    quitApp()
    return
  }

  createTray()
  mainWindow?.hide()
}

function createWindow() {
  const bounds = getInitialBounds()

  mainWindow = new BrowserWindow({
    ...bounds,
    minWidth,
    minHeight,
    frame: false,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    show: false,
    icon: loadWindowIcon(),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.on('moved', saveWindowBounds)
  mainWindow.on('resized', saveWindowBounds)

  mainWindow.on('close', (e) => {
    saveWindowBounds()
    if (isQuitting) return
    e.preventDefault()
    closeWindow()
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  registerIpcHandlers(mainWindow, closeWindow)
}

app.whenReady().then(() => {
  createWindow()

  globalShortcut.register('Alt+T', () => {
    if (!mainWindow) return
    if (mainWindow.isVisible()) {
      closeWindow('tray')
    } else {
      showWindow()
    }
  })
})

app.on('window-all-closed', () => {
  // Keep app running
})

app.on('before-quit', () => {
  globalShortcut.unregisterAll()
})
