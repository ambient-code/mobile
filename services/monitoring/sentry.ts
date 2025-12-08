/**
 * Sentry Error Tracking Service
 *
 * Centralized error monitoring and performance tracking using Sentry.
 * Provides enhanced error context, user information, and breadcrumbs.
 */
import * as Sentry from '@sentry/react-native'
import Constants from 'expo-constants'

/**
 * Initialize Sentry with configuration
 * Should be called as early as possible in the app lifecycle
 */
export function initializeSentry() {
  // Only initialize if DSN is provided
  const dsn = Constants.expoConfig?.extra?.sentryDsn

  if (!dsn) {
    console.warn('Sentry DSN not configured. Error tracking disabled.')
    return
  }

  Sentry.init({
    dsn,
    // Enable automatic session tracking
    enableAutoSessionTracking: true,
    // Session tracking interval (30 seconds)
    sessionTrackingIntervalMillis: 30000,
    // Enable native crash reporting
    enableNative: true,
    // Enable automatic breadcrumbs
    enableAutoPerformanceTracing: true,
    // Trace sample rate (10% of transactions)
    tracesSampleRate: 0.1,
    // Environment based on release channel
    environment: __DEV__ ? 'development' : 'production',
    // Release version from app config
    release: `${Constants.expoConfig?.name}@${Constants.expoConfig?.version}`,
    // Dist (build number)
    dist: Constants.expoConfig?.extra?.buildNumber || '1',
    // Before send hook to filter/modify events
    beforeSend(event) {
      // Don't send events in development unless explicitly enabled
      if (__DEV__ && !Constants.expoConfig?.extra?.sentryInDev) {
        return null
      }
      return event
    },
    // Ignore specific errors
    ignoreErrors: [
      // Network errors that are expected
      'Network request failed',
      'Failed to fetch',
      // Cancelled requests
      'Request aborted',
      'cancelled',
    ],
  })
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  })
}

/**
 * Clear user context (e.g., on logout)
 */
export function clearUser() {
  Sentry.setUser(null)
}

/**
 * Add a breadcrumb for debugging context
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, unknown>,
  level: Sentry.SeverityLevel = 'info'
) {
  Sentry.addBreadcrumb({
    message,
    level,
    data,
    timestamp: Date.now() / 1000,
  })
}

/**
 * Capture an exception with additional context
 */
export function captureException(
  error: Error,
  context?: {
    tags?: Record<string, string>
    extra?: Record<string, unknown>
    level?: Sentry.SeverityLevel
  }
) {
  Sentry.withScope((scope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value)
      })
    }
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value)
      })
    }
    if (context?.level) {
      scope.setLevel(context.level)
    }
    Sentry.captureException(error)
  })
}

/**
 * Capture a message (non-error event)
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: {
    tags?: Record<string, string>
    extra?: Record<string, unknown>
  }
) {
  Sentry.withScope((scope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value)
      })
    }
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value)
      })
    }
    scope.setLevel(level)
    Sentry.captureMessage(message)
  })
}

/**
 * Start a performance transaction span
 */
export function startSpan(name: string, op: string) {
  return Sentry.startSpan(
    {
      name,
      op,
    },
    () => {
      // Span callback - operations tracked here
    }
  )
}

/**
 * Set a tag for all subsequent events
 */
export function setTag(key: string, value: string) {
  Sentry.setTag(key, value)
}

/**
 * Set context data for all subsequent events
 */
export function setContext(key: string, context: Record<string, unknown>) {
  Sentry.setContext(key, context)
}
