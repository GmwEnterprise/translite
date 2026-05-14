import { useState, useCallback, useRef } from 'react'

interface ResultPanelProps {
  result: string
  loading: boolean
  error: string | null
}

export default function ResultPanel({ result, loading, error }: ResultPanelProps) {
  const [copied, setCopied] = useState(false)
  const [copyDisabled, setCopyDisabled] = useState(false)
  const [hovered, setHovered] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout>>()
  const enableTimer = useRef<ReturnType<typeof setTimeout>>()

  const handleCopy = useCallback(() => {
    if (copyDisabled || !result) return
    navigator.clipboard.writeText(result)
    setCopied(true)
    setCopyDisabled(true)
    clearTimeout(hideTimer.current)
    clearTimeout(enableTimer.current)
    hideTimer.current = setTimeout(() => setCopied(false), 1500)
    enableTimer.current = setTimeout(() => setCopyDisabled(false), 1500)
  }, [copyDisabled, result])

  return (
    <div className="flex-1 p-3 border-t border-edge relative min-h-0">
      <div
        className={`h-full overflow-y-auto custom-scrollbar pb-11 ${result ? 'cursor-pointer' : ''}`}
        onClick={result ? handleCopy : undefined}
        onMouseEnter={() => result && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {loading && !result && (
          <div className="text-dim text-sm animate-pulse">翻译中...</div>
        )}
        {error && (
          <div className="text-danger text-sm">{error}</div>
        )}
        {result && (
          <div className={`text-success text-sm whitespace-pre-wrap transition-colors duration-150 ${hovered && !copyDisabled ? 'text-accent' : ''}`}>
            {result}
            {loading && result && (
              <span className="inline-block w-1.5 h-4 bg-success animate-pulse ml-0.5" />
            )}
          </div>
        )}
        {copied && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-sm text-accent bg-accent/15 border border-accent/20 px-4 py-2 rounded-lg shadow-sm animate-fade-shrink">
              已复制
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
