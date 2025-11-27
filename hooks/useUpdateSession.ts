import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SessionsAPI } from '@/services/api/sessions'
import { SessionStatus } from '@/types/session'
import type { UpdateSessionRequest, Session } from '@/types/session'

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

export function useUpdateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, request }: { id: string; request: UpdateSessionRequest }) => {
      if (USE_MOCK_DATA) {
        // Get the session from cache and return updated version
        const cachedSession = queryClient.getQueryData<Session>(['session', id])
        if (!cachedSession) {
          throw new Error('Session not found')
        }

        // Determine new status based on action
        const newStatus =
          request.action === 'approve'
            ? SessionStatus.DONE
            : request.action === 'reject'
              ? SessionStatus.RUNNING
              : cachedSession.status

        // Return updated mock session
        // Note: The optimistic update in onMutate already updated the cache
        // This just confirms the "backend" response
        return {
          ...cachedSession,
          status: newStatus,
          updatedAt: new Date(),
        }
      }

      return SessionsAPI.updateSession(id, request)
    },

    onMutate: async ({ id, request }) => {
      // Cancel outgoing queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['sessions'] })
      await queryClient.cancelQueries({ queryKey: ['session', id] })

      // Snapshot current state for rollback
      const previousSession = queryClient.getQueryData<Session>(['session', id])

      // Determine new status based on action
      const newStatus = request.action === 'approve' ? SessionStatus.DONE : SessionStatus.RUNNING // reject goes back to RUNNING

      // Only update the individual session detail cache (not all session lists)
      // This reduces re-renders - the list will be updated in onSuccess
      queryClient.setQueryData<Session>(['session', id], (old) => {
        if (!old) return undefined
        return { ...old, status: newStatus, updatedAt: new Date() }
      })

      return { previousSession }
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousSession) {
        queryClient.setQueryData(['session', variables.id], context.previousSession)
      }
      // Sessions list will be refreshed in onSettled
    },

    onSuccess: (data, variables) => {
      // Update caches with the successful response data
      // This ensures the optimistic update is replaced with the real backend data
      queryClient.setQueryData<Session>(['session', variables.id], data)

      // Update the session in all session lists
      queryClient.setQueriesData<Session[]>({ queryKey: ['sessions'] }, (old) => {
        if (!old) return undefined
        return old.map((s) => (s.id === variables.id ? data : s))
      })
    },

    onSettled: () => {
      // Only invalidate sessions list to pick up any other changes
      // Don't invalidate the specific session since we just updated it with real data
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}
