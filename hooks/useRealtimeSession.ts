import { useEffect, useState, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AppState } from 'react-native'
import { realtimeService } from '@/services/api/realtime'
import { mockSSEService } from '@/utils/mockData'
import { SessionStatus, type Session } from '@/types/session'
import {
  RealtimeEventType,
  ConnectionState,
  type RealtimeEventUnion,
  type SessionUpdatedData,
  type SessionProgressData,
  type SessionStatusData,
  type NotificationNewData,
  type NotificationReadData,
} from '@/types/realtime'
import { FEATURE_FLAGS } from '@/utils/constants'
import { useToast } from '@/hooks/useToast'
import { logger } from '@/utils/logger'
import { errorHandler } from '@/utils/errorHandler'

/**
 * Feature flag for mock SSE events
 * - Development: Enabled by default for easier testing without backend
 * - Production: ALWAYS disabled to ensure real SSE connection
 */
const USE_MOCK_SSE = __DEV__ && process.env.EXPO_PUBLIC_USE_MOCK_SSE !== 'false'

// Fail-safe: Never use mock SSE in production builds
if (!__DEV__ && USE_MOCK_SSE) {
  throw new Error('Mock SSE cannot be enabled in production builds. This is a critical error.')
}

/**
 * Hook for managing real-time session updates via SSE
 *
 * Connects to SSE endpoint (or mock service in dev), listens for session events,
 * and updates React Query cache directly without triggering refetches.
 */
export function useRealtimeSession() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.DISCONNECTED
  )

  // Event deduplication state
  const eventCache = useRef<Map<string, number>>(new Map())
  const DEDUP_WINDOW_MS = 100 // 100ms deduplication window

  // Atomic update queue
  const updateQueue = useRef<Map<string, Promise<void>>>(new Map())

  /**
   * Check if event is a duplicate (within dedup window)
   */
  const isDuplicateEvent = useCallback((event: RealtimeEventUnion): boolean => {
    const eventKey = `${event.type}:${JSON.stringify(event.data)}`
    const lastSeenTime = eventCache.current.get(eventKey)
    const now = Date.now()

    if (lastSeenTime && now - lastSeenTime < DEDUP_WINDOW_MS) {
      logger.debug('[Realtime] Duplicate event ignored:', event.type)
      return true
    }

    eventCache.current.set(eventKey, now)

    // Clean up old entries (older than 1 second)
    for (const [key, time] of eventCache.current.entries()) {
      if (now - time > 1000) {
        eventCache.current.delete(key)
      }
    }

    return false
  }, [])

  /**
   * Queue cache updates to prevent race conditions
   */
  const queueCacheUpdate = useCallback(
    async (sessionId: string, updateFn: () => void): Promise<void> => {
      // Wait for previous update for this session to complete
      const previousUpdate = updateQueue.current.get(sessionId)
      if (previousUpdate) {
        await previousUpdate
      }

      // Create new update promise
      const updatePromise = Promise.resolve().then(() => {
        updateFn()
      })

      updateQueue.current.set(sessionId, updatePromise)

      // Clean up after completion
      updatePromise.finally(() => {
        if (updateQueue.current.get(sessionId) === updatePromise) {
          updateQueue.current.delete(sessionId)
        }
      })

      return updatePromise
    },
    []
  )

  /**
   * Update session progress without full refetch
   */
  const handleProgressUpdate = useCallback(
    (data: SessionProgressData) => {
      queueCacheUpdate(data.sessionId, () => {
        logger.debug('[Realtime] Updating progress for session:', data.sessionId, data.progress)

        // Update all sessions cache entries ONLY if session exists in that cache
        queryClient.setQueriesData<Session[]>({ queryKey: ['sessions'] }, (old) => {
          if (!old) return old

          // Check if this session exists in THIS cache entry
          const sessionIndex = old.findIndex((s) => s.id === data.sessionId)
          if (sessionIndex === -1) {
            // Session not in this cache, don't update
            return old
          }

          // Session exists, update it
          const updated = [...old]
          updated[sessionIndex] = {
            ...updated[sessionIndex],
            progress: data.progress,
            currentTask: data.currentTask || updated[sessionIndex].currentTask,
            updatedAt: new Date(),
          }

          logger.debug('[Realtime] Sessions cache updated')
          return updated
        })

        // Also update session detail cache if open
        queryClient.setQueryData<Session>(['session', data.sessionId], (old) => {
          if (!old) return old

          return {
            ...old,
            progress: data.progress,
            currentTask: data.currentTask || old.currentTask,
            updatedAt: new Date(),
          }
        })
      })
    },
    [queryClient, queueCacheUpdate]
  )

  /**
   * Apply partial session update
   */
  const handleSessionUpdate = useCallback(
    (data: SessionUpdatedData) => {
      queueCacheUpdate(data.sessionId, () => {
        logger.debug('[Realtime] Updating session:', data.sessionId)

        // Update all sessions cache entries ONLY if session exists in that cache
        queryClient.setQueriesData<Session[]>({ queryKey: ['sessions'] }, (old) => {
          if (!old) return old

          // Check if this session exists in THIS cache entry
          const sessionIndex = old.findIndex((s) => s.id === data.sessionId)
          if (sessionIndex === -1) {
            // Session not in this cache, don't update
            return old
          }

          // Session exists, update it
          const updated = [...old]
          updated[sessionIndex] = {
            ...updated[sessionIndex],
            ...data.changes,
            updatedAt: new Date(),
          }

          logger.debug('[Realtime] Sessions cache updated')
          return updated
        })

        // Also update session detail cache
        queryClient.setQueryData<Session>(['session', data.sessionId], (old) => {
          if (!old) return old
          return { ...old, ...data.changes, updatedAt: new Date() }
        })
      })
    },
    [queryClient, queueCacheUpdate]
  )

  /**
   * Handle session status change
   */
  const handleStatusChange = useCallback(
    (data: SessionStatusData) => {
      queueCacheUpdate(data.sessionId, () => {
        logger.debug('[Realtime] Updating status for session:', data.sessionId, data.status)

        // Show toast for review requests
        if (data.status === SessionStatus.AWAITING_REVIEW) {
          const sessions = queryClient.getQueryData<Session[]>(['sessions'])
          const session = sessions?.find((s) => s.id === data.sessionId)
          if (session) {
            showToast({
              type: 'review',
              title: 'Review Request',
              message: `${session.name} is ready for your review`,
              sessionId: data.sessionId,
            })
          }
        }

        // Update all sessions cache entries ONLY if session exists in that cache
        queryClient.setQueriesData<Session[]>({ queryKey: ['sessions'] }, (old) => {
          if (!old) return old

          // Check if this session exists in THIS cache entry
          const sessionIndex = old.findIndex((s) => s.id === data.sessionId)
          if (sessionIndex === -1) {
            // Session not in this cache, don't update
            return old
          }

          // Session exists, update it
          const updated = [...old]
          updated[sessionIndex] = {
            ...updated[sessionIndex],
            status: data.status,
            errorMessage: data.errorMessage || updated[sessionIndex].errorMessage,
            updatedAt: new Date(),
            // Set progress to 100 if completed
            progress: data.status === 'done' ? 100 : updated[sessionIndex].progress,
          }

          logger.debug('[Realtime] Sessions cache updated')
          return updated
        })

        // Update session detail cache
        queryClient.setQueryData<Session>(['session', data.sessionId], (old) => {
          if (!old) return old

          return {
            ...old,
            status: data.status,
            errorMessage: data.errorMessage || old.errorMessage,
            updatedAt: new Date(),
            progress: data.status === 'done' ? 100 : old.progress,
          }
        })
      })
    },
    [queryClient, showToast, queueCacheUpdate]
  )

  /**
   * Handle incoming SSE events and update React Query cache
   */
  const handleEvent = useCallback(
    (event: RealtimeEventUnion) => {
      try {
        // Check for duplicate
        if (isDuplicateEvent(event)) {
          return // Ignore duplicate
        }

        logger.debug('[Realtime] Received event:', event.type, event.data)

        switch (event.type) {
          case RealtimeEventType.SESSION_PROGRESS:
            handleProgressUpdate(event.data as SessionProgressData)
            break

          case RealtimeEventType.SESSION_UPDATED:
            handleSessionUpdate(event.data as SessionUpdatedData)
            break

          case RealtimeEventType.SESSION_STATUS:
            handleStatusChange(event.data as SessionStatusData)
            break

          case RealtimeEventType.NOTIFICATION_NEW:
          case RealtimeEventType.NOTIFICATION_READ:
            // Invalidate notifications query to trigger refetch
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            logger.debug('[Realtime] Notification event, invalidating cache')
            break

          default:
            console.warn('[Realtime] Unknown event type:', event.type)
        }
      } catch (error) {
        // Report error to global handler
        errorHandler.reportError(error instanceof Error ? error : new Error(String(error)), {
          source: 'SSE Event Handler',
          extra: { eventType: event.type },
        })
      }
    },
    [isDuplicateEvent, handleProgressUpdate, handleSessionUpdate, handleStatusChange]
  )

  /**
   * Manually retry connection
   */
  const retry = useCallback(() => {
    if (USE_MOCK_SSE) {
      mockSSEService.stop()
      mockSSEService.start()
      setConnectionState(ConnectionState.CONNECTED)
    } else {
      realtimeService.retry()
    }
  }, [])

  /**
   * Setup SSE connection on mount
   */
  useEffect(() => {
    if (USE_MOCK_SSE) {
      // Use mock SSE service for development
      logger.debug('[Realtime] Using mock SSE service')
      setConnectionState(ConnectionState.CONNECTED)

      const unsubscribe = mockSSEService.subscribe(handleEvent)
      mockSSEService.start()

      return () => {
        unsubscribe()
        mockSSEService.stop()
      }
    } else {
      // Use real SSE service
      logger.debug('[Realtime] Connecting to SSE endpoint')

      const unsubscribeEvents = realtimeService.onEvent(handleEvent)
      const unsubscribeState = realtimeService.onStateChange(setConnectionState)

      realtimeService.connect()

      return () => {
        unsubscribeEvents()
        unsubscribeState()
        realtimeService.disconnect()
      }
    }
  }, [handleEvent])

  /**
   * Disconnect when app goes to background, reconnect on foreground
   */
  useEffect(() => {
    if (USE_MOCK_SSE) {
      // Mock service doesn't need background/foreground handling
      return
    }

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        logger.debug('[Realtime] App backgrounded, disconnecting SSE')
        realtimeService.disconnect()
      } else if (nextAppState === 'active') {
        logger.debug('[Realtime] App foregrounded, reconnecting SSE')
        realtimeService.connect()
      }
    })

    return () => {
      subscription.remove()
    }
  }, [])

  return {
    connectionState,
    retry,
    isConnected: connectionState === ConnectionState.CONNECTED,
    isConnecting: connectionState === ConnectionState.CONNECTING,
    isError: connectionState === ConnectionState.ERROR,
    isReconnecting: connectionState === ConnectionState.RECONNECTING,
  }
}
