import { Alert } from 'react-native'
import { captureException, addBreadcrumb } from '@/services/monitoring/sentry'

/**
 * Global Error Handler
 *
 * Catches uncaught JavaScript errors and provides recovery strategies.
 * Integrates with React Error Boundaries for comprehensive error coverage.
 */

export interface ErrorContext {
  componentStack?: string
  source?: string
  isFatal?: boolean
  extra?: Record<string, any>
}

export type ErrorRecoveryStrategy = 'ignore' | 'retry' | 'restart' | 'logout'

class GlobalErrorHandler {
  private errorListeners: Set<(error: Error, context?: ErrorContext) => void> = new Set()
  private isInitialized = false

  /**
   * Initialize global error handler
   * Should be called once in app root (_layout.tsx)
   */
  initialize(): void {
    if (this.isInitialized) {
      console.warn('[ErrorHandler] Already initialized')
      return
    }

    // React Native global error handler
    const previousHandler = ErrorUtils.getGlobalHandler()

    ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.error('[GlobalErrorHandler] Uncaught error:', error, 'isFatal:', isFatal)

      // Track error
      this.trackError(error, { isFatal, source: 'ErrorUtils' })

      // Notify listeners
      this.notifyListeners(error, { isFatal, source: 'ErrorUtils' })

      // Handle fatal errors
      if (isFatal) {
        this.handleFatalError(error)
      } else {
        // Call previous handler for non-fatal errors
        previousHandler?.(error, isFatal)
      }
    })

    // Catch unhandled promise rejections
    if (typeof global !== 'undefined') {
      const originalRejectionHandler = global.onunhandledrejection

      global.onunhandledrejection = (event: PromiseRejectionEvent) => {
        const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))

        console.error('[GlobalErrorHandler] Unhandled promise rejection:', error)

        this.trackError(error, { source: 'UnhandledPromiseRejection' })
        this.notifyListeners(error, { source: 'UnhandledPromiseRejection' })

        // Call original handler with proper context
        if (originalRejectionHandler) {
          originalRejectionHandler.call(undefined as any, event)
        }
      }
    }

    this.isInitialized = true
    console.log('✅ Global error handler initialized')
  }

  /**
   * Track error to analytics/monitoring service
   */
  private trackError(error: Error, context?: ErrorContext): void {
    // Add breadcrumb for context
    addBreadcrumb(
      'Error occurred',
      {
        source: context?.source,
        isFatal: context?.isFatal,
        ...context?.extra,
      },
      'error'
    )

    // Report to Sentry with context
    captureException(error, {
      tags: {
        source: context?.source || 'unknown',
        fatal: context?.isFatal ? 'true' : 'false',
      },
      extra: {
        componentStack: context?.componentStack,
        ...context?.extra,
      },
      level: context?.isFatal ? 'fatal' : 'error',
    })

    if (__DEV__) {
      console.log('[ErrorHandler] Error tracked to Sentry:', error.message, context)
    }
  }

  /**
   * Notify error listeners (for UI updates, logging, etc.)
   */
  private notifyListeners(error: Error, context?: ErrorContext): void {
    this.errorListeners.forEach((listener) => {
      try {
        listener(error, context)
      } catch (listenerError) {
        console.error('[ErrorHandler] Error in listener:', listenerError)
      }
    })
  }

  /**
   * Handle fatal errors with user-facing recovery UI
   */
  private handleFatalError(error: Error): void {
    const errorMessage = error.message || 'An unexpected error occurred'

    Alert.alert(
      'App Error',
      `${errorMessage}\n\nThe app needs to restart to recover.`,
      [
        {
          text: 'Restart App',
          onPress: () => {
            // In production, you might use react-native-restart
            if (typeof global !== 'undefined' && (global as any).RNRestart) {
              ;(global as any).RNRestart.Restart()
            } else {
              console.log('Restart not available - would reload app')
            }
          },
        },
      ],
      { cancelable: false }
    )
  }

  /**
   * Subscribe to error events
   */
  onError(callback: (error: Error, context?: ErrorContext) => void): () => void {
    this.errorListeners.add(callback)
    return () => this.errorListeners.delete(callback)
  }

  /**
   * Manually report an error
   */
  reportError(error: Error, context?: ErrorContext): void {
    console.error('[ErrorHandler] Manual error report:', error, context)
    this.trackError(error, context)
    this.notifyListeners(error, context)
  }
}

export const errorHandler = new GlobalErrorHandler()
