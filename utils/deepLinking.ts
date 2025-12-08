/**
 * Deep Linking Utilities
 *
 * Provides URL parsing, validation, and sanitization for deep links.
 * Supports both custom URL schemes (acp://) and Universal Links.
 */

import * as Linking from 'expo-linking'

export interface ParsedDeepLink {
  scheme: string
  hostname?: string
  path: string
  queryParams: Record<string, string>
  isValid: boolean
  errorMessage?: string
}

export interface DeepLinkRoute {
  pattern: RegExp
  handler: string
  requiresAuth?: boolean
  validateParams?: (params: Record<string, string>) => boolean
}

/**
 * Supported deep link patterns
 */
export const DEEP_LINK_ROUTES: DeepLinkRoute[] = [
  {
    pattern: /^\/sessions\/([a-zA-Z0-9_-]+)$/,
    handler: 'session-detail',
    requiresAuth: true,
    validateParams: (params) => !!params.id && params.id.length > 0,
  },
  {
    pattern: /^\/sessions\/new$/,
    handler: 'session-create',
    requiresAuth: true,
  },
  {
    pattern: /^\/sessions$/,
    handler: 'sessions-list',
    requiresAuth: true,
  },
  {
    pattern: /^\/notifications$/,
    handler: 'notifications-list',
    requiresAuth: true,
  },
  {
    pattern: /^\/settings\/(appearance|notifications|repos)$/,
    handler: 'settings',
    requiresAuth: true,
  },
  {
    pattern: /^\/settings$/,
    handler: 'settings',
    requiresAuth: true,
  },
  {
    pattern: /^\/chat$/,
    handler: 'chat',
    requiresAuth: true,
  },
  {
    pattern: /^\/auth\/callback$/,
    handler: 'oauth-callback',
    requiresAuth: false,
  },
]

/**
 * Parse and validate a deep link URL
 */
export function parseDeepLink(url: string): ParsedDeepLink {
  try {
    const parsed = Linking.parse(url)

    // Validate URL structure
    if (!parsed.path) {
      return {
        scheme: parsed.scheme || '',
        path: '',
        queryParams: {},
        isValid: false,
        errorMessage: 'Invalid URL: missing path',
      }
    }

    // Sanitize path (remove trailing slashes, normalize)
    const sanitizedPath = sanitizePath(parsed.path)

    // Convert queryParams to Record<string, string>
    const normalizedParams: Record<string, string> = {}
    if (parsed.queryParams) {
      for (const [key, value] of Object.entries(parsed.queryParams)) {
        if (typeof value === 'string') {
          normalizedParams[key] = value
        } else if (Array.isArray(value)) {
          normalizedParams[key] = value[0] || ''
        }
      }
    }

    // Find matching route
    const matchedRoute = findMatchingRoute(sanitizedPath)

    if (!matchedRoute) {
      return {
        scheme: parsed.scheme || '',
        hostname: parsed.hostname || undefined,
        path: sanitizedPath,
        queryParams: normalizedParams,
        isValid: false,
        errorMessage: `Unsupported route: ${sanitizedPath}`,
      }
    }

    // Validate query parameters if validator exists
    if (matchedRoute.validateParams && !matchedRoute.validateParams(normalizedParams)) {
      return {
        scheme: parsed.scheme || '',
        hostname: parsed.hostname || undefined,
        path: sanitizedPath,
        queryParams: normalizedParams,
        isValid: false,
        errorMessage: 'Invalid query parameters',
      }
    }

    return {
      scheme: parsed.scheme || '',
      hostname: parsed.hostname || undefined,
      path: sanitizedPath,
      queryParams: normalizedParams,
      isValid: true,
    }
  } catch (error) {
    return {
      scheme: '',
      path: '',
      queryParams: {},
      isValid: false,
      errorMessage: `Failed to parse URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Sanitize URL path (remove trailing slashes, normalize)
 */
function sanitizePath(path: string): string {
  // Remove trailing slashes
  let sanitized = path.replace(/\/+$/, '')

  // Ensure leading slash
  if (!sanitized.startsWith('/')) {
    sanitized = `/${sanitized}`
  }

  // Normalize multiple slashes
  sanitized = sanitized.replace(/\/+/g, '/')

  return sanitized
}

/**
 * Find a matching route for the given path
 */
function findMatchingRoute(path: string): DeepLinkRoute | null {
  for (const route of DEEP_LINK_ROUTES) {
    if (route.pattern.test(path)) {
      return route
    }
  }
  return null
}

/**
 * Extract route parameters from path using pattern
 */
export function extractRouteParams(path: string, pattern: RegExp): Record<string, string> {
  const match = path.match(pattern)
  if (!match) return {}

  const params: Record<string, string> = {}

  // Session detail: /sessions/{id}
  if (pattern.source.includes('sessions') && match[1]) {
    params.id = match[1]
  }

  // Settings: /settings/{section}
  if (pattern.source.includes('settings') && match[1]) {
    params.section = match[1]
  }

  return params
}

/**
 * Validate a session ID format
 */
export function isValidSessionId(id: string): boolean {
  // Session IDs should be alphanumeric with hyphens/underscores
  return /^[a-zA-Z0-9_-]{1,100}$/.test(id)
}

/**
 * Validate notification ID format
 */
export function isValidNotificationId(id: string): boolean {
  // Notification IDs should be UUIDs or alphanumeric
  return /^[a-zA-Z0-9_-]{1,100}$/.test(id)
}

/**
 * Build a deep link URL for testing/sharing
 */
export function buildDeepLink(path: string, queryParams?: Record<string, string>): string {
  const isDev = __DEV__
  const baseUrl = isDev ? 'acp://' : 'https://ambient-code.redhat.com'

  let url = `${baseUrl}${path}`

  if (queryParams && Object.keys(queryParams).length > 0) {
    const params = new URLSearchParams(queryParams).toString()
    url += `?${params}`
  }

  return url
}

/**
 * Check if a deep link requires authentication
 */
export function requiresAuth(path: string): boolean {
  const route = findMatchingRoute(path)
  return route?.requiresAuth ?? true // Default to requiring auth
}

/**
 * Get handler name for a given path
 */
export function getHandlerName(path: string): string | null {
  const route = findMatchingRoute(path)
  return route?.handler || null
}
