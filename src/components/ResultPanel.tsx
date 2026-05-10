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
    <div className="flex-1 p-3 border-t border-gray-700 relative">
      {loading && !result && (
        <div className="text-gray-500 text-sm animate-pulse">翻译中...</div>
      )}
      {error && (
        <div className="text-red-400 text-sm">{error}</div>
      )}
      {result && (
        <>
          <div className="text-green-300 text-sm whitespace-pre-wrap pr-8">{result}</div>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 text-xs text-gray-500 hover:text-white px-2 py-1 rounded hover:bg-gray-700"
          >
            复制
          </button>
        </>
      )}
      {loading && result && (
        <span className="inline-block w-1.5 h-4 bg-green-300 animate-pulse ml-0.5" />
      )}
    </div>
  )
}
