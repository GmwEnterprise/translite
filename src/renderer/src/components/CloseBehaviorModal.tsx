type CloseBehavior = 'tray' | 'quit'

interface CloseBehaviorModalProps {
  value: CloseBehavior
  onSelect: (value: CloseBehavior) => void
  onCancel: () => void
}

export default function CloseBehaviorModal({ value, onSelect, onCancel }: CloseBehaviorModalProps) {
  return (
    <div className="absolute inset-0 bg-overlay flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg p-5 w-80 shadow-xl border border-edge">
        <h2 className="text-primary text-sm font-medium mb-2">关闭窗口时</h2>
        <p className="text-xs text-secondary mb-4">选择关闭按钮的行为，选择后会自动保存。</p>
        <div className="space-y-2">
          <button
            onClick={() => onSelect('tray')}
            className={`w-full text-left px-3 py-2 rounded border text-sm ${value === 'tray' ? 'border-accent bg-accent/20 text-primary' : 'border-edge text-secondary hover:bg-muted'}`}
          >
            最小化到右下角图标
          </button>
          <button
            onClick={() => onSelect('quit')}
            className={`w-full text-left px-3 py-2 rounded border text-sm ${value === 'quit' ? 'border-accent bg-accent/20 text-primary' : 'border-edge text-secondary hover:bg-muted'}`}
          >
            退出应用
          </button>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onCancel}
            className="text-sm text-secondary hover:text-primary px-3 py-1.5 rounded hover:bg-muted"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}
