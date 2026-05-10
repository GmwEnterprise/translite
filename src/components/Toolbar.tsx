interface ToolbarProps {
  alwaysOnTop: boolean
  onToggleAlwaysOnTop: () => void
  langPair: string
  onToggleLang: () => void
  onOpenSettings: () => void
}

export default function Toolbar({ alwaysOnTop, onToggleAlwaysOnTop, langPair, onToggleLang, onOpenSettings }: ToolbarProps) {
  return (
    <div className="flex items-center justify-between h-9 px-3 bg-gray-800 border-t border-gray-700 select-none">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleAlwaysOnTop}
          className={`text-xs px-2 py-1 rounded ${alwaysOnTop ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
        >
          置顶
        </button>
        <button
          onClick={onToggleLang}
          className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700"
        >
          {langPair}
        </button>
      </div>
      <button
        onClick={onOpenSettings}
        className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded hover:bg-gray-700"
      >
        ⚙
      </button>
    </div>
  )
}
