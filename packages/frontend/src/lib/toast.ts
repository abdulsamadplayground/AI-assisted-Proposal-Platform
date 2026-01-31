import toast from 'react-hot-toast'

/**
 * Toast notification utilities
 * Use these instead of alert() throughout the application
 */

interface ToastOptions {
  duration?: number
  id?: string
}

export const showToast = {
  /**
   * Success notification (green)
   */
  success: (message: string, options?: ToastOptions) => {
    const { duration = 3000, id } = options || {}
    toast.success(message, {
      id,
      duration,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10B981',
      },
    })
  },

  /**
   * Error notification (red)
   */
  error: (message: string, options?: ToastOptions) => {
    const { duration = 4000, id } = options || {}
    toast.error(message, {
      id,
      duration,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#EF4444',
      },
    })
  },

  /**
   * Warning notification (yellow)
   */
  warning: (message: string, options?: ToastOptions) => {
    const { duration = 3500, id } = options || {}
    toast(message, {
      id,
      duration,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
      },
    })
  },

  /**
   * Info notification (blue)
   */
  info: (message: string, options?: ToastOptions) => {
    const { duration = 3000, id } = options || {}
    toast(message, {
      id,
      duration,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3B82F6',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
      },
    })
  },

  /**
   * Loading notification (shows until dismissed)
   */
  loading: (message: string, options?: { id?: string }) => {
    const { id } = options || {}
    return toast.loading(message, {
      id,
      position: 'top-right',
      style: {
        background: '#6B7280',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
      },
    })
  },

  /**
   * Promise-based notification (auto-handles loading, success, error)
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        position: 'top-right',
        style: {
          padding: '16px',
          borderRadius: '8px',
        },
      }
    )
  },

  /**
   * Dismiss a specific toast
   */
  dismiss: (toastId: string) => {
    toast.dismiss(toastId)
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    toast.dismiss()
  },

  /**
   * Custom toast with full control
   */
  custom: (message: string, options?: any) => {
    toast(message, {
      position: 'top-right',
      style: {
        padding: '16px',
        borderRadius: '8px',
      },
      ...options,
    })
  },
}

export default showToast
