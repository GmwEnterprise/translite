interface ResultPanelProps {
  result: string
  loading: boolean
  error: string | null
}

export default function ResultPanel({ result, loading, error }: ResultPanelProps) {
  function handleCopy() {
    if (result) {
      navigator.clipboard.writeText(result)
    }
  }

  return (
    <div className="flex-1 p-3 border-t border-edge relative min-h-0">
      <div className="h-full overflow-y-auto custom-scrollbar pr-24 pb-11">
        {loading && !result && (
          <div className="text-dim text-sm animate-pulse">翻译中...</div>
        )}
        {error && (
          <div className="text-danger text-sm">{error}</div>
        )}
        {result && (
          <div className="text-success text-sm whitespace-pre-wrap pr-4">
            {result}
            {loading && result && (
              <span className="inline-block w-1.5 h-4 bg-success animate-pulse ml-0.5" />
            )}
          </div>
        )}
      </div>
      {result && (
        <button
          onClick={handleCopy}
          className="absolute right-8 bottom-4 text-xs text-accent bg-accent/10 hover:bg-accent/15 border border-accent/20 px-3 py-1.5 rounded-full shadow-sm"
        >
          复制
        </button>
      )}
    </div>
  )
}
