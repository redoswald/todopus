interface ConfirmDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  itemName: string
  description?: string
  isPending?: boolean
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  description,
  isPending = false,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        {/* Red warning banner */}
        <div className="bg-red-50 border-b border-red-100 px-4 py-3 rounded-t-lg">
          <h2 className="text-lg font-semibold text-red-900">{title}</h2>
        </div>

        <div className="p-4">
          <p className="text-gray-700">
            Are you sure you want to delete <span className="font-semibold">{itemName}</span>? This action cannot be undone.
          </p>
          {description && (
            <p className="mt-2 text-sm text-gray-500">{description}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
