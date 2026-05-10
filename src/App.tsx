import { useState, useEffect, useCallback } from 'react'
import TitleBar from './components/TitleBar'
import InputPanel from './components/InputPanel'
import ResultPanel from './components/ResultPanel'
import Toolbar from './components/Toolbar'
import SettingsModal from './components/SettingsModal'
import { detectLang } from './lib/lang-detect'
import { translateStream } from './lib/translate'
import { getStore, setStore } from './lib/store'

export default function App() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alwaysOnTop, setAlwaysOnTop] = useState(true)
  const [langOverride, setLangOverride] = useState<'auto' | 'zh2en' | 'en2zh'>('auto')
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    getStore('deepseekApiKey').then((key) => {
      if (!key) {
        setShowSettings(true)
      }
      setApiKey(key || '')
    })
    getStore('alwaysOnTop').then((v) => {
      const flag = v !== 'false'
      setAlwaysOnTop(flag)
      window.api.window.setAlwaysOnTop(flag)
    })
  }, [])

  const handleSubmit = useCallback(() => {
    if (!input.trim() || loading) return
    setResult('')
    setError(null)
    setLoading(true)

    let from: string
    let to: string
    if (langOverride === 'zh2en') {
      from = 'zh'; to = 'en'
    } else if (langOverride === 'en2zh') {
      from = 'en'; to = 'zh'
    } else {
      const detected = detectLang(input)
      from = detected
      to = detected === 'zh' ? 'en' : 'zh'
    }

    translateStream(input, from, to, (chunk) => {
      setResult((prev) => prev + chunk)
    })
      .then(() => setLoading(false))
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [input, loading, langOverride])

  function handleToggleAlwaysOnTop() {
    const next = !alwaysOnTop
    setAlwaysOnTop(next)
    window.api.window.setAlwaysOnTop(next)
    setStore('alwaysOnTop', String(next))
  }

  function handleToggleLang() {
    if (langOverride === 'auto') setLangOverride('zh2en')
    else if (langOverride === 'zh2en') setLangOverride('en2zh')
    else setLangOverride('auto')
  }

  const langLabel = langOverride === 'auto' ? '自动' : langOverride === 'zh2en' ? '中→英' : '英→中'

  function handleSaveApiKey(key: string) {
    setApiKey(key)
    setStore('deepseekApiKey', key)
    setShowSettings(false)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 relative">
      <TitleBar />
      <InputPanel value={input} onChange={setInput} onSubmit={handleSubmit} loading={loading} />
      <ResultPanel result={result} loading={loading} error={error} />
      <Toolbar
        alwaysOnTop={alwaysOnTop}
        onToggleAlwaysOnTop={handleToggleAlwaysOnTop}
        langPair={langLabel}
        onToggleLang={handleToggleLang}
        onOpenSettings={() => setShowSettings(true)}
      />
      {showSettings && (
        <SettingsModal
          apiKey={apiKey}
          onSave={handleSaveApiKey}
          onClose={() => { if (apiKey) setShowSettings(false) }}
        />
      )}
    </div>
  )
}
