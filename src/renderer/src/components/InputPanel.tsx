interface InputPanelProps {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  loading: boolean
}

export default function InputPanel({ value, onChange, onSubmit, loading }: InputPanelProps) {
  const canSubmit = Boolean(value.trim()) && !loading

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (canSubmit) {
        onSubmit()
      }
    }
  }

  return (
    <div className="flex-1 p-3 relative min-h-0">
      <textarea
        className="w-full h-full bg-transparent text-primary text-sm resize-none outline-none placeholder-dim pr-24 pb-11 custom-scrollbar"
        placeholder="输入文本，按 Enter 翻译..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        autoFocus
      />
      <button
        type="button"
        className="absolute right-8 bottom-4 text-xs text-accent bg-accent/10 hover:bg-accent/15 border border-accent/20 disabled:text-dim disabled:bg-muted/50 disabled:border-edge disabled:cursor-not-allowed px-3 py-1.5 rounded-full shadow-sm"
        onClick={onSubmit}
        disabled={!canSubmit}
      >
        翻译
      </button>
    </div>
  )
}
