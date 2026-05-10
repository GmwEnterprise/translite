import { useState } from 'react'

interface SettingsModalProps {
  apiKey: string
  onSave: (key: string) => void
  onClose: () => void
}

export default function SettingsModal({ apiKey, onSave, onClose }: SettingsModalProps) {
  const [value, setValue] = useState(apiKey)

  function handleSave() {
    onSave(value.trim())
  }

  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-5 w-80 shadow-xl">
        <h2 className="text-white text-sm font-medium mb-3">设置 DeepSeek API Key</h2>
        <input
          type="password"
          className="w-full bg-gray-700 text-white text-sm px-3 py-2 rounded outline-none border border-gray-600 focus:border-blue-500"
          placeholder="sk-..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
          autoFocus
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded hover:bg-gray-700"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="text-sm text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
