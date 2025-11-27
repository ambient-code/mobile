/**
 * Deep Link Handlers Tests
 *
 * Integration tests for deep link navigation handlers.
 */

import {
  handleSessionDetail,
  handleSessionCreate,
  handleSessionsList,
  handleNotifications,
  handleSettings,
  handleChat,
  routeDeepLink,
} from '@/utils/deepLinkHandlers'
import type { ParsedDeepLink } from '@/utils/deepLinking'
import type { DeepLinkHandlerContext } from '@/utils/deepLinkHandlers'

import { SessionsAPI } from '@/services/api/sessions'

// Mock dependencies
jest.mock('@/services/api/sessions', () => ({
  SessionsAPI: {
    fetchSessionDetail: jest.fn(),
    fetchSessions: jest.fn(),
  },
}))

describe('Deep Link Handlers', () => {
  let mockContext: DeepLinkHandlerContext

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Create mock context
    mockContext = {
      router: {
        push: jest.fn(),
        replace: jest.fn(),
      } as any,
      queryClient: {
        prefetchQuery: jest.fn(),
      } as any,
      isAuthenticated: true,
    }
  })

  describe('handleSessionDetail', () => {
    it('should prefetch session data and navigate', async () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/sessions/abc123',
        queryParams: {},
        isValid: true,
      }

      ;(SessionsAPI.fetchSessionDetail as jest.Mock).mockResolvedValue({
        id: 'abc123',
        status: 'running',
      })

      const result = await handleSessionDetail(parsedLink, mockContext)

      expect(result).toBe(true)
      expect(mockContext.queryClient.prefetchQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['session', 'abc123'],
        })
      )
      expect(mockContext.router.push).toHaveBeenCalledWith('/sessions/abc123')
    })

    it('should navigate even if prefetch fails', async () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/sessions/abc123',
        queryParams: {},
        isValid: true,
      }

      ;(SessionsAPI.fetchSessionDetail as jest.Mock).mockRejectedValue(new Error('Network error'))

      const result = await handleSessionDetail(parsedLink, mockContext)

      expect(result).toBe(false)
      expect(mockContext.router.push).toHaveBeenCalledWith('/sessions/abc123')
    })

    it('should reject invalid session ID', async () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/sessions/invalid id with spaces',
        queryParams: {},
        isValid: true,
      }

      const result = await handleSessionDetail(parsedLink, mockContext)

      expect(result).toBe(false)
      expect(mockContext.router.push).toHaveBeenCalledWith('/(tabs)')
      expect(mockContext.queryClient.prefetchQuery).not.toHaveBeenCalled()
    })

    it('should handle tab query parameter', async () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/sessions/abc123',
        queryParams: { tab: 'logs' },
        isValid: true,
      }

      ;(SessionsAPI.fetchSessionDetail as jest.Mock).mockResolvedValue({
        id: 'abc123',
      })

      await handleSessionDetail(parsedLink, mockContext)

      // Tab handling is logged but not yet implemented
      expect(mockContext.router.push).toHaveBeenCalledWith('/sessions/abc123')
    })
  })

  describe('handleSessionCreate', () => {
    it('should navigate to session creation', async () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/sessions/new',
        queryParams: {},
        isValid: true,
      }

      const result = await handleSessionCreate(parsedLink, mockContext)

      expect(result).toBe(true)
      expect(mockContext.router.push).toHaveBeenCalledWith('/sessions/new')
    })

    it('should handle workflow parameters', async () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/sessions/new',
        queryParams: {
          repo: 'owner/repo',
          workflow: 'review',
          pr: '123',
        },
        isValid: true,
      }

      const result = await handleSessionCreate(parsedLink, mockContext)

      expect(result).toBe(true)
      expect(mockContext.router.push).toHaveBeenCalledWith('/sessions/new')
      // Parameters are logged but not yet passed to screen
    })
  })

  describe('handleSessionsList', () => {
    it('should prefetch sessions and navigate', async () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/sessions',
        queryParams: {},
        isValid: true,
      }

      ;(SessionsAPI.fetchSessions as jest.Mock).mockResolvedValue([
        { id: 'session1' },
        { id: 'session2' },
      ])

      const result = await handleSessionsList(parsedLink, mockContext)

      expect(result).toBe(true)
      expect(mockContext.queryClient.prefetchQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['sessions'],
        })
      )
      expect(mockContext.router.push).toHaveBeenCalledWith('/sessions')
    })

    it('should handle filter parameter', async () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/sessions',
        queryParams: { filter: 'running' },
        isValid: true,
      }

      ;(SessionsAPI.fetchSessions as jest.Mock).mockResolvedValue([])

      await handleSessionsList(parsedLink, mockContext)

      expect(mockContext.router.push).toHaveBeenCalledWith('/sessions')
      // Filter is logged but not yet applied
    })
  })

  describe('handleNotifications', () => {
    it('should navigate to notifications', async () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/notifications',
        queryParams: {},
        isValid: true,
      }

      const result = await handleNotifications(parsedLink, mockContext)

      expect(result).toBe(true)
      expect(mockContext.router.push).toHaveBeenCalledWith('/notifications')
    })

    it('should handle filter parameter', async () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/notifications',
        queryParams: { filter: 'unread' },
        isValid: true,
      }

      await handleNotifications(parsedLink, mockContext)

      expect(mockContext.router.push).toHaveBeenCalledWith('/notifications')
    })
  })

  describe('handleSettings', () => {
    it('should navigate to settings home', async () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/settings',
        queryParams: {},
        isValid: true,
      }

      const result = await handleSettings(parsedLink, mockContext)

      expect(result).toBe(true)
      expect(mockContext.router.push).toHaveBeenCalledWith('/settings')
    })

    it('should navigate to settings subsection', async () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/settings/appearance',
        queryParams: {},
        isValid: true,
      }

      const result = await handleSettings(parsedLink, mockContext)

      expect(result).toBe(true)
      expect(mockContext.router.push).toHaveBeenCalledWith('/settings/appearance')
    })

    it('should handle notifications subsection', async () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/settings/notifications',
        queryParams: {},
        isValid: true,
      }

      await handleSettings(parsedLink, mockContext)

      expect(mockContext.router.push).toHaveBeenCalledWith('/settings/notifications')
    })

    it('should handle repos subsection', async () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/settings/repos',
        queryParams: {},
        isValid: true,
      }

      await handleSettings(parsedLink, mockContext)

      expect(mockContext.router.push).toHaveBeenCalledWith('/settings/repos')
    })
  })

  describe('handleChat', () => {
    it('should navigate to chat', async () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/chat',
        queryParams: {},
        isValid: true,
      }

      const result = await handleChat(parsedLink, mockContext)

      expect(result).toBe(true)
      expect(mockContext.router.push).toHaveBeenCalledWith('/chat')
    })

    it('should handle session context parameter', async () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/chat',
        queryParams: { session: 'abc123' },
        isValid: true,
      }

      await handleChat(parsedLink, mockContext)

      expect(mockContext.router.push).toHaveBeenCalledWith('/chat')
      // Session context is logged but not yet passed
    })
  })

  describe('routeDeepLink', () => {
    it('should route to correct handler', async () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/sessions/abc123',
        queryParams: {},
        isValid: true,
      }

      ;(SessionsAPI.fetchSessionDetail as jest.Mock).mockResolvedValue({
        id: 'abc123',
      })

      const result = await routeDeepLink(parsedLink, 'session-detail', mockContext)

      expect(result).toBe(true)
      expect(mockContext.router.push).toHaveBeenCalledWith('/sessions/abc123')
    })

    it('should return false for unknown handler', async () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/unknown',
        queryParams: {},
        isValid: true,
      }

      const result = await routeDeepLink(parsedLink, 'unknown-handler', mockContext)

      expect(result).toBe(false)
    })

    it('should catch and log handler errors', async () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/sessions/abc123',
        queryParams: {},
        isValid: true,
      }

      // Make the handler throw an error
      ;(SessionsAPI.fetchSessionDetail as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await routeDeepLink(parsedLink, 'session-detail', mockContext)

      expect(result).toBe(false)
    })
  })
})
