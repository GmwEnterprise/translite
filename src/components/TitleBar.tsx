export default function TitleBar() {
  return (
    <div className="flex items-center justify-between h-8 px-3 bg-gray-800 select-none" style={{ WebkitAppRegion: 'drag' as any }}>
      <span className="text-xs text-gray-400 font-medium">Translite</span>
      <button
        style={{ WebkitAppRegion: 'no-drag' as any }}
        className="text-gray-400 hover:text-white text-sm leading-none w-6 h-6 flex items-center justify-center rounded hover:bg-gray-700"
        onClick={() => window.api.window.close()}
      >
        ×
      </button>
    </div>
  )
}
