/**
 * Telemetry Service
 *
 * Production-ready telemetry implementation using PostHog
 * Handles event tracking, screen tracking, and user identification
 * with automatic opt-out support and development mode disabling
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import PostHog from 'posthog-react-native'

const TELEMETRY_STORAGE_KEY = 'telemetry_enabled'
const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

let posthogClient: PostHog | null = null
let isEnabled = true

/**
 * Initialize PostHog client
 * Called once at app startup
 */
export async function initializeTelemetry(): Promise<void> {
  // Disable in development mode
  if (__DEV__) {
    console.log('[Telemetry] Disabled in development mode')
    return
  }

  // Check if API key is configured
  if (!POSTHOG_API_KEY) {
    console.warn('[Telemetry] PostHog API key not configured')
    return
  }

  try {
    // Check user opt-out preference
    const enabled = await getTelemetryEnabled()
    isEnabled = enabled

    if (!enabled) {
      console.log('[Telemetry] Disabled by user preference')
      return
    }

    // Initialize PostHog
    posthogClient = new PostHog(POSTHOG_API_KEY, {
      host: POSTHOG_HOST,
    })

    console.log('[Telemetry] Initialized successfully')
  } catch (error) {
    console.error('[Telemetry] Failed to initialize:', error)
  }
}

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
): void {
  if (!isEnabled || !posthogClient || __DEV__) {
    return
  }

  try {
    posthogClient.capture(eventName, properties as any)
  } catch (error) {
    console.error('[Telemetry] Failed to track event:', error)
  }
}

/**
 * Track a screen view
 */
export function trackScreen(
  screenName: string,
  properties?: Record<string, string | number | boolean>
): void {
  if (!isEnabled || !posthogClient || __DEV__) {
    return
  }

  try {
    posthogClient.screen(screenName, properties as any)
  } catch (error) {
    console.error('[Telemetry] Failed to track screen:', error)
  }
}

/**
 * Identify a user
 */
export function identifyUser(
  userId: string,
  properties?: Record<string, string | number | boolean>
): void {
  if (!isEnabled || !posthogClient || __DEV__) {
    return
  }

  try {
    posthogClient.identify(userId, properties as any)
  } catch (error) {
    console.error('[Telemetry] Failed to identify user:', error)
  }
}

/**
 * Reset user identity (on logout)
 */
export function resetIdentity(): void {
  if (!isEnabled || !posthogClient || __DEV__) {
    return
  }

  try {
    posthogClient.reset()
  } catch (error) {
    console.error('[Telemetry] Failed to reset identity:', error)
  }
}

/**
 * Get telemetry enabled preference
 */
export async function getTelemetryEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(TELEMETRY_STORAGE_KEY)
    // Default to enabled if not set
    return value === null ? true : value === 'true'
  } catch (error) {
    console.error('[Telemetry] Failed to get preference:', error)
    return true
  }
}

/**
 * Set telemetry enabled preference
 */
export async function setTelemetryEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(TELEMETRY_STORAGE_KEY, String(enabled))
    isEnabled = enabled

    if (!enabled && posthogClient) {
      // Opt out of PostHog tracking
      posthogClient.optOut()
    } else if (enabled && posthogClient) {
      // Opt back in
      posthogClient.optIn()
    }
  } catch (error) {
    console.error('[Telemetry] Failed to set preference:', error)
  }
}

/**
 * Common event names for consistency
 */
export const TelemetryEvents = {
  // Session events
  SESSION_CREATED: 'session_created',
  SESSION_APPROVED: 'session_approved',
  SESSION_REJECTED: 'session_rejected',
  SESSION_VIEWED: 'session_viewed',

  // Chat events
  CHAT_MESSAGE_SENT: 'chat_message_sent',

  // Notification events
  NOTIFICATION_ACTION: 'notification_action',
  NOTIFICATION_RECEIVED: 'notification_received',

  // Screen events
  SCREEN_VIEWED: 'screen_viewed',

  // Auth events
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
} as const
