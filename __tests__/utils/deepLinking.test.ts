/**
 * Deep Linking Utilities Tests
 *
 * Tests for URL parsing, validation, and route matching.
 */

import {
  parseDeepLink,
  extractRouteParams,
  isValidSessionId,
  isValidNotificationId,
  buildDeepLink,
  requiresAuth,
  getHandlerName,
  DEEP_LINK_ROUTES,
} from '@/utils/deepLinking'

describe('parseDeepLink', () => {
  describe('valid deep links', () => {
    it('should parse session detail URL', () => {
      const result = parseDeepLink('acp://sessions/abc123')

      expect(result.isValid).toBe(true)
      expect(result.path).toBe('/sessions/abc123')
      expect(result.scheme).toBe('acp')
      expect(result.errorMessage).toBeUndefined()
    })

    it('should parse session detail with query params', () => {
      const result = parseDeepLink('acp://sessions/abc123?tab=logs')

      expect(result.isValid).toBe(true)
      expect(result.path).toBe('/sessions/abc123')
      expect(result.queryParams).toEqual({ tab: 'logs' })
    })

    it('should parse notifications URL', () => {
      const result = parseDeepLink('acp://notifications')

      expect(result.isValid).toBe(true)
      expect(result.path).toBe('/notifications')
    })

    it('should parse settings URL', () => {
      const result = parseDeepLink('acp://settings')

      expect(result.isValid).toBe(true)
      expect(result.path).toBe('/settings')
    })

    it('should parse settings subsection URL', () => {
      const result = parseDeepLink('acp://settings/appearance')

      expect(result.isValid).toBe(true)
      expect(result.path).toBe('/settings/appearance')
    })

    it('should parse Universal Link (HTTPS)', () => {
      const result = parseDeepLink('https://ambient-code.redhat.com/sessions/abc123')

      expect(result.isValid).toBe(true)
      expect(result.path).toBe('/sessions/abc123')
      expect(result.scheme).toBe('https')
      expect(result.hostname).toBe('ambient-code.redhat.com')
    })

    it('should handle trailing slashes', () => {
      const result = parseDeepLink('acp://sessions/abc123/')

      expect(result.isValid).toBe(true)
      expect(result.path).toBe('/sessions/abc123')
    })

    it('should normalize multiple slashes', () => {
      const result = parseDeepLink('acp://sessions//abc123')

      expect(result.isValid).toBe(true)
      expect(result.path).toBe('/sessions/abc123')
    })
  })

  describe('invalid deep links', () => {
    it('should reject empty path', () => {
      const result = parseDeepLink('acp://')

      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toContain('missing path')
    })

    it('should reject unsupported route', () => {
      const result = parseDeepLink('acp://unknown/path')

      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toContain('Unsupported route')
    })

    it('should reject invalid session ID format', () => {
      const result = parseDeepLink('acp://sessions/invalid session id with spaces')

      expect(result.isValid).toBe(false)
    })
  })

  describe('query parameters', () => {
    it('should parse multiple query parameters', () => {
      const result = parseDeepLink('acp://sessions/abc123?tab=logs&filter=error')

      expect(result.isValid).toBe(true)
      expect(result.queryParams).toEqual({
        tab: 'logs',
        filter: 'error',
      })
    })

    it('should handle URL-encoded parameters', () => {
      const result = parseDeepLink('acp://sessions/new?repo=owner%2Frepo')

      expect(result.isValid).toBe(true)
      expect(result.queryParams.repo).toBe('owner/repo')
    })
  })
})

describe('extractRouteParams', () => {
  it('should extract session ID from path', () => {
    const pattern = /^\/sessions\/([a-zA-Z0-9_-]+)$/
    const params = extractRouteParams('/sessions/abc123', pattern)

    expect(params.id).toBe('abc123')
  })

  it('should extract settings section from path', () => {
    const pattern = /^\/settings\/(appearance|notifications|repos)$/
    const params = extractRouteParams('/settings/appearance', pattern)

    expect(params.section).toBe('appearance')
  })

  it('should return empty object for non-matching pattern', () => {
    const pattern = /^\/sessions\/([a-zA-Z0-9_-]+)$/
    const params = extractRouteParams('/notifications', pattern)

    expect(params).toEqual({})
  })
})

describe('validation functions', () => {
  describe('isValidSessionId', () => {
    it('should accept alphanumeric IDs', () => {
      expect(isValidSessionId('abc123')).toBe(true)
      expect(isValidSessionId('session-123')).toBe(true)
      expect(isValidSessionId('session_456')).toBe(true)
    })

    it('should reject invalid formats', () => {
      expect(isValidSessionId('')).toBe(false)
      expect(isValidSessionId('invalid session')).toBe(false)
      expect(isValidSessionId('session@123')).toBe(false)
      expect(isValidSessionId('a'.repeat(101))).toBe(false) // Too long
    })
  })

  describe('isValidNotificationId', () => {
    it('should accept alphanumeric IDs', () => {
      expect(isValidNotificationId('notif123')).toBe(true)
      expect(isValidNotificationId('uuid-1234-5678')).toBe(true)
    })

    it('should reject invalid formats', () => {
      expect(isValidNotificationId('')).toBe(false)
      expect(isValidNotificationId('invalid notif')).toBe(false)
    })
  })
})

describe('buildDeepLink', () => {
  it('should build development deep link', () => {
    // Mock __DEV__
    ;(global as any).__DEV__ = true

    const url = buildDeepLink('/sessions/abc123')

    expect(url).toBe('acp:///sessions/abc123')
  })

  it('should build deep link with query params', () => {
    ;(global as any).__DEV__ = true

    const url = buildDeepLink('/sessions/abc123', { tab: 'logs', filter: 'error' })

    expect(url).toContain('acp:///sessions/abc123?')
    expect(url).toContain('tab=logs')
    expect(url).toContain('filter=error')
  })

  it('should build production deep link', () => {
    ;(global as any).__DEV__ = false

    const url = buildDeepLink('/sessions/abc123')

    expect(url).toBe('https://ambient-code.redhat.com/sessions/abc123')
  })
})

describe('route helpers', () => {
  describe('requiresAuth', () => {
    it('should return true for authenticated routes', () => {
      expect(requiresAuth('/sessions/abc123')).toBe(true)
      expect(requiresAuth('/notifications')).toBe(true)
      expect(requiresAuth('/settings')).toBe(true)
    })

    it('should return false for OAuth callback', () => {
      expect(requiresAuth('/auth/callback')).toBe(false)
    })

    it('should default to true for unknown routes', () => {
      expect(requiresAuth('/unknown')).toBe(true)
    })
  })

  describe('getHandlerName', () => {
    it('should return correct handler for session detail', () => {
      expect(getHandlerName('/sessions/abc123')).toBe('session-detail')
    })

    it('should return correct handler for notifications', () => {
      expect(getHandlerName('/notifications')).toBe('notifications-list')
    })

    it('should return correct handler for settings', () => {
      expect(getHandlerName('/settings')).toBe('settings')
      expect(getHandlerName('/settings/appearance')).toBe('settings')
    })

    it('should return null for unknown routes', () => {
      expect(getHandlerName('/unknown')).toBe(null)
    })
  })
})

describe('DEEP_LINK_ROUTES', () => {
  it('should have patterns for all main routes', () => {
    const handlers = DEEP_LINK_ROUTES.map((r) => r.handler)

    expect(handlers).toContain('session-detail')
    expect(handlers).toContain('session-create')
    expect(handlers).toContain('sessions-list')
    expect(handlers).toContain('notifications-list')
    expect(handlers).toContain('settings')
    expect(handlers).toContain('chat')
    expect(handlers).toContain('oauth-callback')
  })

  it('should mark all routes except OAuth as requiring auth', () => {
    const authRoutes = DEEP_LINK_ROUTES.filter((r) => r.requiresAuth)
    const noAuthRoutes = DEEP_LINK_ROUTES.filter((r) => !r.requiresAuth)

    expect(authRoutes.length).toBeGreaterThan(0)
    expect(noAuthRoutes.length).toBe(1)
    expect(noAuthRoutes[0].handler).toBe('oauth-callback')
  })
})
