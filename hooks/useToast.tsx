import React, { createContext, useContext, useState, ReactNode } from 'react'
import { ToastNotification } from '@/components/ui/Toast'

interface ToastContextType {
  showToast: (notification: Omit<ToastNotification, 'id'>) => void
  currentToast: ToastNotification | null
  dismissToast: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [currentToast, setCurrentToast] = useState<ToastNotification | null>(null)

  const showToast = (notification: Omit<ToastNotification, 'id'>) => {
    const id = Date.now().toString()
    setCurrentToast({ ...notification, id })
  }

  const dismissToast = () => {
    setCurrentToast(null)
  }

  return (
    <ToastContext.Provider value={{ showToast, currentToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
