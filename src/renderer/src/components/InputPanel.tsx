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
        className="absolute right-8 bottom-4 text-accent bg-accent/10 hover:bg-accent/15 border border-accent/20 disabled:text-dim disabled:bg-muted/50 disabled:border-edge disabled:cursor-not-allowed p-2 rounded-full shadow-sm dark:text-accent-hover"
        onClick={onSubmit}
        disabled={!canSubmit}
        title="翻译"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
