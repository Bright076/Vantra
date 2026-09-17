import * as React from "react"

export interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "success" | "error"
  onClose?: () => void
}

export function Toast({ title, description, variant = "default", onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  const variantStyles = {
    default: "bg-gray-900 dark:bg-gray-50",
    success: "bg-green-600 dark:bg-green-500",
    error: "bg-red-600 dark:bg-red-500",
  }

  return (
    <div
      className={`fixed bottom-24 right-4 z-50 flex max-w-sm items-start gap-3 rounded-lg p-4 text-white shadow-lg ${variantStyles[variant]}`}
    >
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {description && <p className="mt-1 text-sm opacity-90">{description}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-white opacity-70 hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  )
}
