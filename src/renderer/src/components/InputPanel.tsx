interface InputPanelProps {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  loading: boolean
}

export default function InputPanel({ value, onChange, onSubmit, loading }: InputPanelProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!loading && value.trim()) {
        onSubmit()
      }
    }
  }

  return (
    <div className="flex-1 p-3">
      <textarea
        className="w-full h-full bg-transparent text-primary text-sm resize-none outline-none placeholder-dim"
        placeholder="输入文本，按 Enter 翻译..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        autoFocus
      />
    </div>
  )
}
