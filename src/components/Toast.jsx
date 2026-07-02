import { createContext, useCallback, useContext, useState } from 'react'
import { createPortal } from 'react-dom'

const ToastContext = createContext(null)

// Minimal toast system: `const toast = useToast(); toast('Pesan')`.
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2600)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="pointer-events-auto rounded-full bg-ink px-4 py-2 text-sm text-white shadow-lg dark:bg-ink-dark dark:text-bg-dark"
            >
              {t.message}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}
