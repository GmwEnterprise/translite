import { useState } from 'react'

export interface ApiConfig {
  baseURL: string
  apiKey: string
  model: string
}

interface SourceOption {
  id: string
  label: string
  description: string
}

const sourceOptions: SourceOption[] = [
  {
    id: 'openai-compatible',
    label: 'OpenAI 兼容 API',
    description: '支持 DeepSeek、OpenAI、Kimi、Ollama 等兼容接口',
  },
]

interface SettingsModalProps {
  config: ApiConfig
  onSave: (config: ApiConfig) => void
  onClose: () => void
}

export default function SettingsModal({ config, onSave, onClose }: SettingsModalProps) {
  const [selectedSource, setSelectedSource] = useState('openai-compatible')
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

  return (
    <div className="absolute inset-0 bg-overlay flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg p-5 w-80 shadow-xl border border-edge max-h-[90vh] overflow-y-auto">
        <h2 className="text-primary text-sm font-medium mb-3">设置翻译源</h2>
        <div className="space-y-3">
          {sourceOptions.map((source) => (
            <button
              key={source.id}
              onClick={() => setSelectedSource(source.id)}
              className={`w-full text-left px-3 py-2 rounded border text-sm ${selectedSource === source.id ? 'border-accent bg-accent/20 text-primary' : 'border-edge text-secondary hover:bg-muted'}`}
            >
              <div className="font-medium">{source.label}</div>
              <div className="text-xs text-dim mt-0.5">{source.description}</div>
            </button>
          ))}
        </div>
        {selectedSource === 'openai-compatible' && (
          <div className="space-y-3 mt-4">
            <label className="block">
              <span className="block text-xs text-secondary mb-1">Base URL</span>
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
