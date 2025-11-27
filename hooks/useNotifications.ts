import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { AppState } from 'react-native'
import { NotificationsAPI } from '@/services/api/notifications'
import type { GitHubNotification } from '@/types/notification'
import { POLLING_INTERVALS, CACHE_TTL } from '@/utils/constants'

/**
 * Hook for fetching and managing GitHub notifications
 * - Polls every 30 seconds when app is active
 * - Refreshes when app comes to foreground
 * - Provides unread count for badge display
 */
export function useNotifications(unreadOnly = false) {
  const queryClient = useQueryClient()
  const appState = useRef(AppState.currentState)

  const query = useQuery({
    queryKey: ['notifications', unreadOnly ? 'unread' : 'all'],
    queryFn: () => NotificationsAPI.fetchNotifications(unreadOnly),
    staleTime: CACHE_TTL.NOTIFICATIONS,
    gcTime: CACHE_TTL.NOTIFICATIONS,
    // Poll every 30 seconds for new notifications
    refetchInterval: POLLING_INTERVALS.NOTIFICATIONS,
    refetchIntervalInBackground: false,
  })

  // Setup app foreground refresh
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const wasBackground = appState.current.match(/inactive|background/)
      const isActive = nextAppState === 'active'

      if (wasBackground && isActive) {
        // App has come to foreground, refetch immediately
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      }

      appState.current = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [queryClient])

  return {
    notifications: query.data?.notifications ?? [],
    unreadCount: query.data?.unreadCount ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Hook for marking notifications as read
 * - Optimistic update for instant UI feedback
 * - Invalidates queries on success
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationIds: string[]) => NotificationsAPI.markAsRead(notificationIds),
    onMutate: async (notificationIds) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] })

      // Snapshot previous values
      const previousAll = queryClient.getQueryData(['notifications', 'all'])
      const previousUnread = queryClient.getQueryData(['notifications', 'unread'])

      // Optimistically update to mark as read
      queryClient.setQueryData(
        ['notifications', 'all'],
        (old: { notifications: GitHubNotification[]; unreadCount: number } | undefined) => {
          if (!old) return old
          return {
            notifications: old.notifications.map((n) =>
              notificationIds.includes(n.id) ? { ...n, isUnread: false } : n
            ),
            unreadCount: Math.max(0, old.unreadCount - notificationIds.length),
          }
        }
      )

      queryClient.setQueryData(
        ['notifications', 'unread'],
        (old: { notifications: GitHubNotification[]; unreadCount: number } | undefined) => {
          if (!old) return old
          return {
            notifications: old.notifications.filter((n) => !notificationIds.includes(n.id)),
            unreadCount: Math.max(0, old.unreadCount - notificationIds.length),
          }
        }
      )

      return { previousAll, previousUnread }
    },
    onError: (_err, _notificationIds, context) => {
      // Rollback on error
      if (context?.previousAll) {
        queryClient.setQueryData(['notifications', 'all'], context.previousAll)
      }
      if (context?.previousUnread) {
        queryClient.setQueryData(['notifications', 'unread'], context.previousUnread)
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

/**
 * Hook for marking all notifications as read
 * - Optimistic update for instant UI feedback
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => NotificationsAPI.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })

      const previousAll = queryClient.getQueryData(['notifications', 'all'])
      const previousUnread = queryClient.getQueryData(['notifications', 'unread'])

      // Mark all as read
      queryClient.setQueryData(
        ['notifications', 'all'],
        (old: { notifications: GitHubNotification[]; unreadCount: number } | undefined) => {
          if (!old) return old
          return {
            notifications: old.notifications.map((n) => ({ ...n, isUnread: false })),
            unreadCount: 0,
          }
        }
      )

      queryClient.setQueryData(['notifications', 'unread'], {
        notifications: [],
        unreadCount: 0,
      })

      return { previousAll, previousUnread }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousAll) {
        queryClient.setQueryData(['notifications', 'all'], context.previousAll)
      }
      if (context?.previousUnread) {
        queryClient.setQueryData(['notifications', 'unread'], context.previousUnread)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

/**
 * Hook for muting a notification thread
 */
export function useMuteThread() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) => NotificationsAPI.muteThread(notificationId),
    onSuccess: () => {
      // Refetch notifications after muting
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
