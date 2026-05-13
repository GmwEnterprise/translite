import { useState } from 'react'

export interface ApiConfig {
  baseURL: string
  apiKey: string
  model: string
}

interface SourceOption {
  id: string
  label: string
}

const sourceOptions: SourceOption[] = [
  {
    id: 'openai-compatible',
    label: 'AI 翻译',
  },
]

interface SettingsModalProps {
  config: ApiConfig
  onSave: (config: ApiConfig) => void
  onClose: () => void
}

export default function SettingsModal({ config, onSave, onClose }: SettingsModalProps) {
  const [selectedSource, setSelectedSource] = useState('openai-compatible')
  const [showSourceOptions, setShowSourceOptions] = useState(false)
  const [baseURL, setBaseURL] = useState(config.baseURL)
  const [apiKey, setApiKey] = useState(config.apiKey)
  const [model, setModel] = useState(config.model)

  function handleSave() {
    onSave({
      baseURL: baseURL.trim(),
      apiKey: apiKey.trim(),
      model: model.trim(),
    })
  }

  const canSave = baseURL.trim() && apiKey.trim() && model.trim()
  const selectedSourceLabel = sourceOptions.find((source) => source.id === selectedSource)?.label || ''

  return (
    <div className="absolute inset-0 bg-overlay flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg p-5 w-80 shadow-xl border border-edge max-h-[90vh] overflow-y-auto">
        <h2 className="text-primary text-sm font-medium mb-3">设置翻译源</h2>
        <div className="relative">
          <span className="block text-xs text-secondary mb-1">选择翻译源</span>
          <button
            type="button"
            className="w-full flex items-center justify-between bg-muted text-primary text-sm px-3 py-2 rounded outline-none border border-edge hover:border-accent focus:border-accent"
            onClick={() => setShowSourceOptions((visible) => !visible)}
          >
            <span>{selectedSourceLabel}</span>
            <svg className={`w-4 h-4 text-secondary transition-transform ${showSourceOptions ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>
          {showSourceOptions && (
            <div className="absolute z-10 mt-1 w-full rounded border border-edge bg-surface shadow-xl overflow-hidden">
              {sourceOptions.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  className={`w-full text-left text-sm px-3 py-2 ${selectedSource === source.id ? 'bg-accent/20 text-primary' : 'text-secondary hover:bg-muted hover:text-primary'}`}
                  onClick={() => {
                    setSelectedSource(source.id)
                    setShowSourceOptions(false)
                  }}
                >
                  {source.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedSource === 'openai-compatible' && (
          <div className="space-y-3 mt-4">
            <label className="block">
              <span className="block text-xs text-secondary mb-1">OpenAI BaseURL</span>
              <input
                type="url"
                className="w-full bg-muted text-primary text-sm px-3 py-2 rounded outline-none border border-edge focus:border-accent"
                placeholder="https://api.deepseek.com/v1"
                value={baseURL}
                onChange={(e) => setBaseURL(e.target.value)}
                autoFocus
              />
            </label>
            <label className="block">
              <span className="block text-xs text-secondary mb-1">API Key</span>
              <input
                type="password"
                className="w-full bg-muted text-primary text-sm px-3 py-2 rounded outline-none border border-edge focus:border-accent"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="block text-xs text-secondary mb-1">Model</span>
              <input
                type="text"
                className="w-full bg-muted text-primary text-sm px-3 py-2 rounded outline-none border border-edge focus:border-accent"
                placeholder="deepseek-chat"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </label>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="text-sm text-secondary hover:text-primary px-3 py-1.5 rounded hover:bg-muted"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="text-sm text-primary bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
