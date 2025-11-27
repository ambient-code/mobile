import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { AppState } from 'react-native'
import { SessionsAPI } from '@/services/api/sessions'
import type { Session, SessionStatus } from '@/types/session'
import { POLLING_INTERVALS, CACHE_TTL, FEATURE_FLAGS } from '@/utils/constants'
import { MOCK_SESSIONS } from '@/utils/mockData'

/**
 * Feature flag for mock data
 * - Development: Enabled by default for easier testing
 * - Production: ALWAYS disabled to ensure real API usage
 */
const USE_MOCK_DATA = __DEV__ && process.env.EXPO_PUBLIC_USE_MOCK_DATA !== 'false'

// Fail-safe: Never use mock data in production builds
if (!__DEV__ && USE_MOCK_DATA) {
  throw new Error('Mock data cannot be enabled in production builds. This is a critical error.')
}

export function useSessions(status?: SessionStatus) {
  const queryClient = useQueryClient()
  const appState = useRef(AppState.currentState)

  const query = useQuery({
    queryKey: ['sessions', status],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        const sessions = MOCK_SESSIONS
        return status ? sessions.filter((s) => s.status === status) : sessions
      }
      return SessionsAPI.fetchSessions(status)
    },
    staleTime: CACHE_TTL.SESSIONS,
    gcTime: CACHE_TTL.SESSIONS,
  })

  // Setup app foreground refresh (keeps manual refresh working)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const wasBackground = appState.current.match(/inactive|background/)
      const isActive = nextAppState === 'active'

      if (wasBackground && isActive) {
        // App has come to foreground, refetch immediately
        queryClient.invalidateQueries({ queryKey: ['sessions'] })
      }

      appState.current = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [queryClient])

  // Automatic polling removed - use pull-to-refresh for manual updates
  // Event-driven updates (SSE) will be added in Phase 2

  return query
}

export function useSessionDetail(id: string) {
  return useQuery({
    queryKey: ['session', id],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        const session = MOCK_SESSIONS.find((s) => s.id === id)
        if (!session) throw new Error('Session not found')
        return session
      }
      return SessionsAPI.fetchSessionDetail(id)
    },
    staleTime: CACHE_TTL.SESSIONS,
    enabled: !!id,
  })
}

export function useSessionLogs(id: string) {
  return useQuery({
    queryKey: ['session', id, 'logs'],
    queryFn: () => SessionsAPI.fetchLogs(id),
    enabled: !!id,
  })
}
