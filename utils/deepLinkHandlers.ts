/**
 * Deep Link Handlers
 *
 * Route-specific handlers for different deep link patterns.
 * Coordinates navigation, cache pre-warming, and error handling.
 */

import type { Router } from 'expo-router'
import type { QueryClient } from '@tanstack/react-query'
import type { ParsedDeepLink } from './deepLinking'
import { extractRouteParams, isValidSessionId } from './deepLinking'
import { SessionsAPI } from '../services/api/sessions'

export interface DeepLinkHandlerContext {
  router: Router
  queryClient: QueryClient
  isAuthenticated: boolean
}

export type DeepLinkHandler = (
  parsedLink: ParsedDeepLink,
  context: DeepLinkHandlerContext,
) => Promise<boolean>

/**
 * Handle session detail deep links: /sessions/{id}
 */
export async function handleSessionDetail(
  parsedLink: ParsedDeepLink,
  context: DeepLinkHandlerContext,
): Promise<boolean> {
  const { router, queryClient } = context
  const params = extractRouteParams(
    parsedLink.path,
    /^\/sessions\/([a-zA-Z0-9_-]+)$/,
  )

  const sessionId = params.id || parsedLink.queryParams.id

  // Validate session ID
  if (!sessionId || !isValidSessionId(sessionId)) {
    console.warn('[DeepLink] Invalid session ID:', sessionId)
    router.push('/(tabs)')
    return false
  }

  // Pre-warm cache by prefetching session data
  try {
    await queryClient.prefetchQuery({
      queryKey: ['session', sessionId],
      queryFn: () => SessionsAPI.fetchSessionDetail(sessionId),
      staleTime: 5000, // Keep fresh for 5s
    })

    // Navigate to session detail
    router.push(`/sessions/${sessionId}`)

    // Handle query parameters (e.g., ?tab=logs)
    const tab = parsedLink.queryParams.tab
    if (tab) {
      // TODO: Implement tab switching once session detail has tabs
      console.log('[DeepLink] Tab parameter:', tab)
    }

    return true
  } catch (error) {
    console.error('[DeepLink] Failed to fetch session:', error)
    // Navigate anyway - the session detail screen will handle the error
    router.push(`/sessions/${sessionId}`)
    return false
  }
}

/**
 * Handle session creation deep links: /sessions/new
 */
export async function handleSessionCreate(
  parsedLink: ParsedDeepLink,
  context: DeepLinkHandlerContext,
): Promise<boolean> {
  const { router } = context

  // Extract workflow parameters
  const repo = parsedLink.queryParams.repo
  const workflow = parsedLink.queryParams.workflow
  const pr = parsedLink.queryParams.pr

  // Navigate to session creation
  router.push('/sessions/new')

  // TODO: Pass parameters to session creation screen
  // Once the screen supports pre-filling from URL params
  if (repo || workflow || pr) {
    console.log('[DeepLink] Session creation params:', { repo, workflow, pr })
  }

  return true
}

/**
 * Handle sessions list deep links: /sessions
 */
export async function handleSessionsList(
  parsedLink: ParsedDeepLink,
  context: DeepLinkHandlerContext,
): Promise<boolean> {
  const { router, queryClient } = context

  // Extract filter parameters
  const filter = parsedLink.queryParams.filter

  // Pre-warm cache for sessions list
  try {
    await queryClient.prefetchQuery({
      queryKey: ['sessions'],
      queryFn: () => SessionsAPI.fetchSessions(),
      staleTime: 5000,
    })
  } catch (error) {
    console.error('[DeepLink] Failed to prefetch sessions:', error)
  }

  // Navigate to sessions list
  router.push('/sessions')

  // TODO: Apply filter once sessions list supports URL-based filtering
  if (filter) {
    console.log('[DeepLink] Sessions filter:', filter)
  }

  return true
}

/**
 * Handle notifications deep links: /notifications
 */
export async function handleNotifications(
  parsedLink: ParsedDeepLink,
  context: DeepLinkHandlerContext,
): Promise<boolean> {
  const { router } = context

  // Extract filter parameters
  const filter = parsedLink.queryParams.filter

  // Navigate to notifications
  router.push('/notifications')

  // TODO: Apply filter once notifications screen supports URL-based filtering
  if (filter) {
    console.log('[DeepLink] Notifications filter:', filter)
  }

  return true
}

/**
 * Handle settings deep links: /settings or /settings/{section}
 */
export async function handleSettings(
  parsedLink: ParsedDeepLink,
  context: DeepLinkHandlerContext,
): Promise<boolean> {
  const { router } = context
  const params = extractRouteParams(
    parsedLink.path,
    /^\/settings\/(appearance|notifications|repos)$/,
  )

  const section = params.section

  if (section) {
    // Navigate to specific settings section
    router.push(`/settings/${section}`)
  } else {
    // Navigate to settings home
    router.push('/settings')
  }

  return true
}

/**
 * Handle chat deep links: /chat
 */
export async function handleChat(
  parsedLink: ParsedDeepLink,
  context: DeepLinkHandlerContext,
): Promise<boolean> {
  const { router } = context

  // Extract context parameters
  const sessionId = parsedLink.queryParams.session

  // Navigate to chat
  router.push('/chat')

  // TODO: Pass session context once chat screen supports it
  if (sessionId) {
    console.log('[DeepLink] Chat session context:', sessionId)
  }

  return true
}

/**
 * Handle OAuth callback deep links: /auth/callback
 */
export async function handleOAuthCallback(
  parsedLink: ParsedDeepLink,
  context: DeepLinkHandlerContext,
): Promise<boolean> {
  // OAuth callback is handled by OAuthService
  // No action needed here - just let the existing flow handle it
  console.log('[DeepLink] OAuth callback - handled by OAuthService')
  return true
}

/**
 * Route deep links to appropriate handlers
 */
export async function routeDeepLink(
  parsedLink: ParsedDeepLink,
  handlerName: string,
  context: DeepLinkHandlerContext,
): Promise<boolean> {
  const handlers: Record<string, DeepLinkHandler> = {
    'session-detail': handleSessionDetail,
    'session-create': handleSessionCreate,
    'sessions-list': handleSessionsList,
    'notifications-list': handleNotifications,
    settings: handleSettings,
    chat: handleChat,
    'oauth-callback': handleOAuthCallback,
  }

  const handler = handlers[handlerName]

  if (!handler) {
    console.warn('[DeepLink] Unknown handler:', handlerName)
    return false
  }

  try {
    return await handler(parsedLink, context)
  } catch (error) {
    console.error('[DeepLink] Handler error:', error)
    return false
  }
}
