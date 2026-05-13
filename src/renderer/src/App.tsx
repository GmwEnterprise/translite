import { useState, useEffect, useCallback } from 'react'
import TitleBar from './components/TitleBar'
import InputPanel from './components/InputPanel'
import ResultPanel from './components/ResultPanel'
import Toolbar from './components/Toolbar'
import SettingsModal, { type ApiConfig } from './components/SettingsModal'
import CloseBehaviorModal from './components/CloseBehaviorModal'
import LanguageSettingsModal, { type LanguageCode, type LanguagePair } from './components/LanguageSettingsModal'
import { translateStream } from './lib/translate'
import { getStore, setStore } from './lib/store'
import { useTheme } from './lib/useTheme'

type CloseBehavior = 'tray' | 'quit'

const defaultLanguagePair: LanguagePair = { source: 'zh', target: 'en' }

function isLanguageCode(value: unknown): value is LanguageCode {
  return value === 'en' || value === 'ja' || value === 'ko' || value === 'zh' || value === 'fr' || value === 'de'
}

function parseLanguagePair(value: string | null): LanguagePair {
  if (!value) return defaultLanguagePair

  try {
    const parsed = JSON.parse(value) as Partial<LanguagePair>
    if (isLanguageCode(parsed.source) && isLanguageCode(parsed.target)) return parsed as LanguagePair
  } catch {
    // Ignore invalid persisted settings.
  }

  return defaultLanguagePair
}

export default function App() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alwaysOnTop, setAlwaysOnTop] = useState(true)
  const [languagePair, setLanguagePair] = useState<LanguagePair>(defaultLanguagePair)
  const [showSettings, setShowSettings] = useState(false)
  const [showLanguageSettings, setShowLanguageSettings] = useState(false)
  const [showCloseBehavior, setShowCloseBehavior] = useState(false)
  const [closeBehaviorAction, setCloseBehaviorAction] = useState<'close' | 'settings'>('close')
  const [closeBehavior, setCloseBehavior] = useState<CloseBehavior>('tray')
  const [apiConfig, setApiConfig] = useState<ApiConfig>({ baseURL: '', apiKey: '', model: '' })
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    Promise.all([
      getStore('apiBaseURL'),
      getStore('apiKey'),
      getStore('apiModel'),
    ]).then(([baseURL, apiKey, model]) => {
      const config: ApiConfig = { baseURL: baseURL || '', apiKey: apiKey || '', model: model || '' }
      setApiConfig(config)
      if (!config.apiKey) {
        setShowSettings(true)
      }
    })
    getStore('alwaysOnTop').then((v) => {
      const flag = v !== 'false'
      setAlwaysOnTop(flag)
      window.api.window.setAlwaysOnTop(flag)
    })
    getStore('closeBehavior').then((v) => {
      if (v === 'quit' || v === 'tray') setCloseBehavior(v)
    })
    getStore('languagePair').then((v) => {
      setLanguagePair(parseLanguagePair(v))
    })
  }, [])

  const handleSubmit = useCallback(() => {
    if (!input.trim() || loading) return
    setResult('')
    setError(null)
    setLoading(true)

    translateStream(input, languagePair.source, languagePair.target, (chunk) => {
      setResult((prev) => prev + chunk)
    })
      .then(() => setLoading(false))
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [input, loading, languagePair])

  function handleToggleAlwaysOnTop() {
    const next = !alwaysOnTop
    setAlwaysOnTop(next)
    window.api.window.setAlwaysOnTop(next)
    setStore('alwaysOnTop', String(next))
  }

  function handleSaveApiConfig(config: ApiConfig) {
    setApiConfig(config)
    setStore('apiBaseURL', config.baseURL)
    setStore('apiKey', config.apiKey)
    setStore('apiModel', config.model)
    setShowSettings(false)
  }

  function handleSaveLanguagePair(value: LanguagePair) {
    setLanguagePair(value)
    setStore('languagePair', JSON.stringify(value))
    setShowLanguageSettings(false)
  }

  async function handleSelectCloseBehavior(value: CloseBehavior) {
    setCloseBehavior(value)
    await setStore('closeBehavior', value)
    setShowCloseBehavior(false)
    if (closeBehaviorAction === 'close') window.api.window.close(value)
  }

  return (
    <div className="h-screen flex flex-col bg-base relative">
      <TitleBar
        onOpenSettings={() => setShowSettings(true)}
        onOpenLanguageSettings={() => setShowLanguageSettings(true)}
        onOpenCloseBehavior={() => { setCloseBehaviorAction('settings'); setShowCloseBehavior(true) }}
        onClose={() => { setCloseBehaviorAction('close'); setShowCloseBehavior(true) }}
        onQuit={() => window.api.window.quit()}
      />
      <InputPanel value={input} onChange={setInput} onSubmit={handleSubmit} loading={loading} />
      <ResultPanel result={result} loading={loading} error={error} />
      <Toolbar
        theme={theme}
        onToggleTheme={toggleTheme}
        alwaysOnTop={alwaysOnTop}
        onToggleAlwaysOnTop={handleToggleAlwaysOnTop}
        languagePair={languagePair}
      />
      {showSettings && (
        <SettingsModal
          config={apiConfig}
          onSave={handleSaveApiConfig}
          onClose={() => setShowSettings(false)}
        />
      )}
      {showLanguageSettings && (
        <LanguageSettingsModal
          value={languagePair}
          onSave={handleSaveLanguagePair}
          onClose={() => setShowLanguageSettings(false)}
        />
      )}
      {showCloseBehavior && (
        <CloseBehaviorModal
          value={closeBehavior}
          onSelect={handleSelectCloseBehavior}
          onCancel={() => setShowCloseBehavior(false)}
        />
      )}
    </div>
  )
}
