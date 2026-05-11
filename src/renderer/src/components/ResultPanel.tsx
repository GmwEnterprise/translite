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
    <div className="flex-1 p-3 border-t border-edge relative">
      {loading && !result && (
        <div className="text-dim text-sm animate-pulse">翻译中...</div>
      )}
      {error && (
        <div className="text-danger text-sm">{error}</div>
      )}
      {result && (
        <>
          <div className="text-success text-sm whitespace-pre-wrap pr-8">{result}</div>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 text-xs text-dim hover:text-primary px-2 py-1 rounded hover:bg-muted"
          >
            复制
          </button>
        </>
      )}
      {loading && result && (
        <span className="inline-block w-1.5 h-4 bg-success animate-pulse ml-0.5" />
      )}
    </div>
  )
}
