/**
 * useLinking Hook
 *
 * Main hook for handling deep links in the app.
 * Listens for URL events and routes to appropriate handlers.
 */

import { useEffect, useRef } from 'react'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import {
  parseDeepLink,
  getHandlerName,
  requiresAuth,
  type ParsedDeepLink,
} from '../utils/deepLinking'
import { routeDeepLink } from '../utils/deepLinkHandlers'
import { deepLinkAnalytics } from '../utils/deepLinkAnalytics'

interface UseLinkingOptions {
  enabled?: boolean
  onNavigationStart?: (url: string) => void
  onNavigationComplete?: (url: string, success: boolean) => void
  onNavigationError?: (url: string, error: Error) => void
}

/**
 * Hook for handling deep links throughout the app lifecycle
 */
export function useLinking(options: UseLinkingOptions = {}) {
  const { enabled = true, onNavigationStart, onNavigationComplete, onNavigationError } = options

  const router = useRouter()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  const isProcessingRef = useRef(false)

  useEffect(() => {
    if (!enabled) return

    let subscription: ReturnType<typeof Linking.addEventListener> | null = null

    const handleUrl = async (event: { url: string }) => {
      await handleDeepLink(event.url, 'foreground')
    }

    // Handle deep links when app is already open
    subscription = Linking.addEventListener('url', handleUrl)

    // Handle deep link that opened the app (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url, 'initial')
      }
    })

    return () => {
      subscription?.remove()
    }
  }, [enabled, isAuthenticated])

  /**
   * Process a deep link URL
   */
  const handleDeepLink = async (
    url: string,
    source: 'initial' | 'foreground' | 'background'
  ): Promise<void> => {
    // Prevent concurrent processing
    if (isProcessingRef.current) {
      console.warn('[useLinking] Already processing a deep link, ignoring:', url)
      return
    }

    isProcessingRef.current = true

    try {
      const startTime = performance.now()

      // Notify navigation start
      onNavigationStart?.(url)

      // Parse and validate the deep link
      const parsedLink = parseDeepLink(url)

      if (!parsedLink.isValid) {
        console.warn('[useLinking] Invalid deep link:', parsedLink.errorMessage)
        deepLinkAnalytics.trackValidationFailure(
          url,
          parsedLink.errorMessage || 'Unknown error',
          source
        )

        // Navigate to home on invalid link
        router.push('/(tabs)')
        onNavigationComplete?.(url, false)
        return
      }

      // Check authentication requirement
      if (requiresAuth(parsedLink.path) && !isAuthenticated) {
        console.warn('[useLinking] Deep link requires authentication:', url)
        deepLinkAnalytics.trackValidationFailure(url, 'Authentication required', source)

        // TODO: Store pending deep link and restore after auth
        // For now, just navigate to auth flow
        router.push('/(tabs)')
        onNavigationComplete?.(url, false)
        return
      }

      // Get handler for this route
      const handlerName = getHandlerName(parsedLink.path)

      if (!handlerName) {
        console.warn('[useLinking] No handler for path:', parsedLink.path)
        deepLinkAnalytics.trackValidationFailure(
          url,
          `No handler for path: ${parsedLink.path}`,
          source
        )
        router.push('/(tabs)')
        onNavigationComplete?.(url, false)
        return
      }

      // Route to appropriate handler
      const success = await routeDeepLink(parsedLink, handlerName, {
        router,
        queryClient,
        isAuthenticated,
      })

      const navigationTime = performance.now() - startTime

      // Track analytics
      deepLinkAnalytics.trackNavigation(url, parsedLink, handlerName, source, navigationTime)

      // Notify navigation complete
      onNavigationComplete?.(url, success)
    } catch (error) {
      console.error('[useLinking] Error handling deep link:', error)
      deepLinkAnalytics.trackValidationFailure(
        url,
        error instanceof Error ? error.message : 'Unknown error',
        source
      )
      onNavigationError?.(url, error as Error)

      // Fallback to home
      router.push('/(tabs)')
      onNavigationComplete?.(url, false)
    } finally {
      isProcessingRef.current = false
    }
  }

  return {
    handleDeepLink,
  }
}
