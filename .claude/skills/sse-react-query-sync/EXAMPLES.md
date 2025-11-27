# SSE + React Query Integration Examples

Comprehensive examples demonstrating how to use Server-Sent Events (SSE) with React Query for real-time session updates in the acp-mobile application.

## Table of Contents

1. [Basic SSE Connection](#example-1-basic-sse-connection)
2. [React Query Integration](#example-2-react-query-integration)
3. [Progress Updates](#example-3-progress-updates)
4. [Status Changes with Toasts](#example-4-status-changes-with-toasts)
5. [Optimistic Updates with SSE](#example-5-optimistic-updates-with-sse)
6. [Mock SSE Service](#example-6-mock-sse-service)

---

## Example 1: Basic SSE Connection

**What it does**: Demonstrates the core `RealtimeService` class, showing how to connect/disconnect and subscribe to events without React Query.

```typescript
import { realtimeService } from '@/services/api/realtime'
import { RealtimeEventUnion, ConnectionState } from '@/types/realtime'
import { logger } from '@/utils/logger'

// Component demonstrating basic SSE connection
export function BasicSSEExample() {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.DISCONNECTED
  )

  useEffect(() => {
    // Subscribe to connection state changes
    const unsubscribeState = realtimeService.onStateChange((state) => {
      logger.debug('[SSE] Connection state changed:', state)
      setConnectionState(state)
    })

    // Subscribe to all SSE events
    const unsubscribeEvents = realtimeService.onEvent((event: RealtimeEventUnion) => {
      logger.debug('[SSE] Received event:', event.type, event.data)

      // Handle events manually without React Query
      switch (event.type) {
        case RealtimeEventType.SESSION_PROGRESS:
          console.log('Progress update:', event.data)
          break
        case RealtimeEventType.SESSION_UPDATED:
          console.log('Session updated:', event.data)
          break
        case RealtimeEventType.SESSION_STATUS:
          console.log('Status changed:', event.data)
          break
      }
    })

    // Connect to SSE endpoint
    // Optionally pass authentication token: realtimeService.connect(token)
    realtimeService.connect()

    // Cleanup on unmount
    return () => {
      unsubscribeEvents()
      unsubscribeState()
      realtimeService.disconnect()
    }
  }, [])

  // Manual retry on error
  const handleRetry = () => {
    realtimeService.retry() // Resets backoff and reconnects
  }

  return (
    <View>
      <Text>Connection: {connectionState}</Text>
      {connectionState === ConnectionState.ERROR && (
        <Button title="Retry Connection" onPress={handleRetry} />
      )}
    </View>
  )
}

// The service handles automatic reconnection with exponential backoff:
// - Initial delay: 1s
// - Backoff multiplier: 2x
// - Max delay: 30s
// - Retries indefinitely until manual disconnect
```

---

## Example 2: React Query Integration

**What it does**: Shows the complete `useRealtimeSession` hook usage with React Query cache updates, demonstrating how SSE events update the cache without refetches.

```typescript
import { useRealtimeSession } from '@/hooks/useRealtimeSession'
import { useSessions } from '@/hooks/useSessions'
import { ConnectionState } from '@/types/realtime'
import { View, Text, ActivityIndicator } from 'react-native'

/**
 * Component demonstrating full SSE + React Query integration
 */
export function RealtimeSessionsExample() {
  // Setup real-time connection and cache updates
  const { connectionState, isConnected, isError, retry } = useRealtimeSession()

  // Fetch sessions (will be updated automatically via SSE events)
  const { data: sessions, isLoading, refetch } = useSessions()

  // Display connection status
  const renderConnectionBadge = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return <Text style={{ color: 'green' }}>● Live</Text>
      case ConnectionState.CONNECTING:
        return <Text style={{ color: 'orange' }}>● Connecting...</Text>
      case ConnectionState.RECONNECTING:
        return <Text style={{ color: 'orange' }}>● Reconnecting...</Text>
      case ConnectionState.ERROR:
        return (
          <View>
            <Text style={{ color: 'red' }}>● Disconnected</Text>
            <Button title="Retry" onPress={retry} />
          </View>
        )
      default:
        return <Text style={{ color: 'gray' }}>● Offline</Text>
    }
  }

  if (isLoading) {
    return <ActivityIndicator />
  }

  return (
    <View>
      {/* Connection status indicator */}
      <View style={{ padding: 10 }}>
        {renderConnectionBadge()}
      </View>

      {/* Sessions list - updates automatically from SSE events */}
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SessionCard
            session={item}
            // Progress, status, and other fields update in real-time
            // without manual refetch thanks to SSE cache updates
          />
        )}
        // Pull-to-refresh still works for manual updates
        refreshing={isLoading}
        onRefresh={refetch}
      />
    </View>
  )
}

/**
 * How SSE events update React Query cache:
 *
 * 1. SSE event received (e.g., session.progress)
 * 2. useRealtimeSession hook processes event
 * 3. Cache updated via queryClient.setQueriesData()
 * 4. Components re-render with new data
 * 5. No network refetch required - instant UI update
 *
 * Benefits:
 * - Real-time updates without polling
 * - Reduced backend load
 * - Instant UI feedback
 * - Automatic reconnection on errors
 * - Works seamlessly with pull-to-refresh
 */
```

---

## Example 3: Progress Updates

**What it does**: Demonstrates how SSE progress events update both the sessions list cache and individual session detail cache.

```typescript
import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { SessionProgressData } from '@/types/realtime'
import type { Session } from '@/types/session'
import { logger } from '@/utils/logger'

/**
 * Handle session progress updates from SSE
 *
 * Updates:
 * - All sessions list caches (filtered and unfiltered)
 * - Individual session detail cache
 * - Only updates if session exists in cache (no unnecessary updates)
 */
export function ProgressUpdateExample() {
  const queryClient = useQueryClient()

  const handleProgressUpdate = useCallback(
    (data: SessionProgressData) => {
      logger.debug('[Realtime] Updating progress for session:', data.sessionId, data.progress)

      // Update ALL sessions cache entries (handles filtered lists)
      queryClient.setQueriesData<Session[]>({ queryKey: ['sessions'] }, (old) => {
        if (!old) return old // No cache, skip update

        // Check if this session exists in THIS cache entry
        const sessionIndex = old.findIndex((s) => s.id === data.sessionId)
        if (sessionIndex === -1) {
          // Session not in this cache, don't modify
          return old
        }

        // Session exists, create updated array
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
        if (!old) return old // Detail not cached, skip

        return {
          ...old,
          progress: data.progress,
          currentTask: data.currentTask || old.currentTask,
          updatedAt: new Date(),
        }
      })
    },
    [queryClient]
  )

  return (
    <View>
      {/*
        When SSE event arrives:
        {
          type: 'session.progress',
          data: {
            sessionId: '123',
            progress: 67,
            currentTask: 'Analyzing code structure'
          }
        }

        The handler will:
        1. Find session in all cache entries
        2. Update progress and currentTask
        3. Update updatedAt timestamp
        4. Trigger re-render of all components using this data
        5. No network request needed
      */}
    </View>
  )
}

/**
 * Why use setQueriesData (plural) vs setQueryData?
 *
 * setQueriesData updates ALL matching caches:
 * - ['sessions'] - all sessions
 * - ['sessions', 'running'] - only running sessions
 * - ['sessions', 'awaiting_review'] - only review sessions
 *
 * This ensures filtered views stay in sync with SSE updates.
 */
```

---

## Example 4: Status Changes with Toasts

**What it does**: Handles session status transitions (e.g., running → awaiting_review) and shows toast notifications to the user.

```typescript
import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { SessionStatusData } from '@/types/realtime'
import { SessionStatus, type Session } from '@/types/session'
import { useToast } from '@/hooks/useToast'
import { logger } from '@/utils/logger'

/**
 * Handle session status changes with user notifications
 */
export function StatusChangeExample() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const handleStatusChange = useCallback(
    (data: SessionStatusData) => {
      logger.debug('[Realtime] Updating status for session:', data.sessionId, data.status)

      // Show toast notification for review requests
      if (data.status === SessionStatus.AWAITING_REVIEW) {
        // Get session name from cache for toast message
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

      // Show error toast for failed sessions
      if (data.status === SessionStatus.ERROR) {
        showToast({
          type: 'error',
          title: 'Session Failed',
          message: data.errorMessage || 'An unknown error occurred',
        })
      }

      // Update all sessions cache entries
      queryClient.setQueriesData<Session[]>({ queryKey: ['sessions'] }, (old) => {
        if (!old) return old

        const sessionIndex = old.findIndex((s) => s.id === data.sessionId)
        if (sessionIndex === -1) return old

        const updated = [...old]
        updated[sessionIndex] = {
          ...updated[sessionIndex],
          status: data.status,
          errorMessage: data.errorMessage || updated[sessionIndex].errorMessage,
          updatedAt: new Date(),
          // Auto-set progress to 100 when done
          progress: data.status === SessionStatus.DONE ? 100 : updated[sessionIndex].progress,
        }

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
          progress: data.status === SessionStatus.DONE ? 100 : old.progress,
        }
      })
    },
    [queryClient, showToast]
  )

  return (
    <View>
      {/*
        Status transition handling:

        RUNNING → AWAITING_REVIEW:
        - Show toast notification
        - Update UI to show "Review" button
        - Keep progress at current value

        RUNNING → DONE:
        - Set progress to 100
        - Update status badge
        - No toast (success is implicit)

        RUNNING → ERROR:
        - Show error toast with message
        - Display error state in UI
        - Store error message for detail view
      */}
    </View>
  )
}
```

---

## Example 5: Optimistic Updates with SSE

**What it does**: Demonstrates optimistic UI updates combined with SSE confirmation, showing how to handle user actions with immediate feedback.

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SessionsAPI } from '@/services/api/sessions'
import { Session, UpdateSessionRequest } from '@/types/session'
import { logger } from '@/utils/logger'

/**
 * Optimistic update pattern: Update UI immediately, confirm via SSE
 */
export function OptimisticUpdateExample({ sessionId }: { sessionId: string }) {
  const queryClient = useQueryClient()

  // Mutation for approving a session
  const approveMutation = useMutation({
    mutationFn: (request: UpdateSessionRequest) =>
      SessionsAPI.updateSession(sessionId, request),

    // 1. Optimistically update UI before API call
    onMutate: async (request) => {
      logger.debug('[Mutation] Optimistically approving session:', sessionId)

      // Cancel any in-flight queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['sessions'] })
      await queryClient.cancelQueries({ queryKey: ['session', sessionId] })

      // Snapshot previous state for rollback
      const previousSessions = queryClient.getQueryData<Session[]>(['sessions'])
      const previousSession = queryClient.getQueryData<Session>(['session', sessionId])

      // Optimistically update sessions list
      queryClient.setQueriesData<Session[]>({ queryKey: ['sessions'] }, (old) => {
        if (!old) return old

        return old.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                status: 'running' as const,
                updatedAt: new Date(),
              }
            : session
        )
      })

      // Optimistically update session detail
      queryClient.setQueryData<Session>(['session', sessionId], (old) => {
        if (!old) return old

        return {
          ...old,
          status: 'running' as const,
          updatedAt: new Date(),
        }
      })

      // Return context for rollback
      return { previousSessions, previousSession }
    },

    // 2. On error, rollback optimistic update
    onError: (error, variables, context) => {
      logger.error('[Mutation] Approval failed, rolling back:', error)

      if (context?.previousSessions) {
        queryClient.setQueryData(['sessions'], context.previousSessions)
      }

      if (context?.previousSession) {
        queryClient.setQueryData(['session', sessionId], context.previousSession)
      }

      // Show error toast
      showToast({
        type: 'error',
        title: 'Approval Failed',
        message: 'Could not approve session. Please try again.',
      })
    },

    // 3. On success, SSE will send confirmation event
    onSuccess: (data) => {
      logger.debug('[Mutation] Approval successful, waiting for SSE confirmation')

      // SSE event will arrive shortly with updated session data
      // No need to update cache here - SSE handler will do it
      // This prevents duplicate updates and race conditions

      // Note: The optimistic update provides instant feedback
      // The SSE event provides server-confirmed state
    },
  })

  const handleApprove = () => {
    approveMutation.mutate({
      action: 'approve',
    })
  }

  return (
    <View>
      <Button
        title="Approve Session"
        onPress={handleApprove}
        disabled={approveMutation.isPending}
      />

      {approveMutation.isPending && <ActivityIndicator />}
    </View>
  )
}

/**
 * Optimistic Update Flow:
 *
 * User clicks "Approve" button
 *     ↓
 * 1. onMutate runs - UI updates immediately (optimistic)
 *     ↓
 * 2. API request sent in background
 *     ↓
 * 3a. SUCCESS: SSE event confirms change (overwrites optimistic)
 * 3b. ERROR: Rollback to previous state (onError)
 *
 * Benefits:
 * - Instant UI feedback (feels fast)
 * - Server confirmation via SSE (ensures accuracy)
 * - Automatic rollback on errors
 * - No duplicate cache updates (SSE handles final state)
 */
```

---

## Example 6: Mock SSE Service

**What it does**: Shows how to use the `MockSSEService` for development and testing without a backend SSE endpoint.

```typescript
import { mockSSEService } from '@/utils/mockData'
import { RealtimeEventUnion } from '@/types/realtime'
import { logger } from '@/utils/logger'

/**
 * Using Mock SSE Service for development
 *
 * The mock service generates random SSE events every 3-5 seconds,
 * simulating real backend behavior for testing.
 */
export function MockSSEExample() {
  useEffect(() => {
    // Subscribe to mock events
    const unsubscribe = mockSSEService.subscribe((event: RealtimeEventUnion) => {
      logger.debug('[MockSSE] Received event:', event.type, event.data)

      // Process event same as production SSE
      // Your event handler works identically
    })

    // Start generating mock events
    mockSSEService.start()

    // Cleanup on unmount
    return () => {
      unsubscribe()
      mockSSEService.stop()
    }
  }, [])

  return <View>{/* Your UI */}</View>
}

/**
 * Toggling between Mock and Production SSE
 *
 * Controlled via environment variable and __DEV__ flag
 */

// In your code:
const USE_MOCK_SSE = __DEV__ && process.env.EXPO_PUBLIC_USE_MOCK_SSE !== 'false'

if (USE_MOCK_SSE) {
  // Development: Use mock service
  const unsubscribe = mockSSEService.subscribe(handleEvent)
  mockSSEService.start()
} else {
  // Production: Use real service
  const unsubscribe = realtimeService.onEvent(handleEvent)
  realtimeService.connect()
}

/**
 * Mock Event Generation
 *
 * The mock service generates events for RUNNING sessions only:
 * - 60% SESSION_PROGRESS events (most common)
 * - 25% SESSION_UPDATED events
 * - 15% SESSION_STATUS events
 *
 * Event structure matches production exactly:
 */

// Example mock progress event:
{
  type: 'session.progress',
  data: {
    sessionId: '1',
    progress: 67,
    currentTask: 'Analyzing code structure'
  },
  timestamp: 1732665234567
}

// Example mock status event:
{
  type: 'session.status',
  data: {
    sessionId: '1',
    status: 'awaiting_review',
    completedAt: '2025-11-26T20:30:00Z'
  },
  timestamp: 1732665234567
}

/**
 * Testing with Mock Service
 *
 * Perfect for:
 * - Developing UI without backend
 * - Testing error handling
 * - Demonstrating features to stakeholders
 * - Unit testing components
 *
 * Limitations:
 * - Events are random, not tied to real actions
 * - No authentication
 * - No backend validation
 *
 * Always test with production SSE before release!
 */

/**
 * Fail-Safe Protection
 *
 * Mock SSE is NEVER enabled in production builds:
 */
if (!__DEV__ && USE_MOCK_SSE) {
  throw new Error('Mock SSE cannot be enabled in production builds. This is a critical error.')
}

// To disable mock SSE in development, set environment variable:
// EXPO_PUBLIC_USE_MOCK_SSE=false
```

---

## Advanced Patterns

### Event Deduplication

The `useRealtimeSession` hook includes automatic event deduplication to handle duplicate SSE events (network issues, reconnections, etc.):

```typescript
// Deduplication window: 100ms
const DEDUP_WINDOW_MS = 100

const isDuplicateEvent = (event: RealtimeEventUnion): boolean => {
  const eventKey = `${event.type}:${JSON.stringify(event.data)}`
  const lastSeenTime = eventCache.current.get(eventKey)
  const now = Date.now()

  if (lastSeenTime && now - lastSeenTime < DEDUP_WINDOW_MS) {
    return true // Duplicate within 100ms window
  }

  eventCache.current.set(eventKey, now)
  return false
}
```

### Atomic Cache Updates

Cache updates are queued to prevent race conditions when multiple events arrive simultaneously:

```typescript
const queueCacheUpdate = async (sessionId: string, updateFn: () => void): Promise<void> => {
  // Wait for previous update for this session
  const previousUpdate = updateQueue.current.get(sessionId)
  if (previousUpdate) {
    await previousUpdate
  }

  // Queue new update
  const updatePromise = Promise.resolve().then(updateFn)
  updateQueue.current.set(sessionId, updatePromise)

  return updatePromise
}
```

### Background/Foreground Handling

SSE automatically disconnects when app goes to background (saves battery), reconnects on foreground:

```typescript
useEffect(() => {
  const subscription = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'background') {
      realtimeService.disconnect()
    } else if (nextAppState === 'active') {
      realtimeService.connect()
    }
  })

  return () => subscription.remove()
}, [])
```

---

## Common Pitfalls

### 1. Not Checking if Session Exists in Cache

**Wrong:**

```typescript
queryClient.setQueriesData<Session[]>({ queryKey: ['sessions'] }, (old) => {
  const updated = [...old]
  updated[0] = { ...updated[0], progress: 100 } // Assumes session exists at index 0
  return updated
})
```

**Correct:**

```typescript
queryClient.setQueriesData<Session[]>({ queryKey: ['sessions'] }, (old) => {
  if (!old) return old

  const sessionIndex = old.findIndex((s) => s.id === sessionId)
  if (sessionIndex === -1) return old // Session not in this cache

  const updated = [...old]
  updated[sessionIndex] = { ...updated[sessionIndex], progress: 100 }
  return updated
})
```

### 2. Updating Cache in onSuccess After Optimistic Update

**Wrong:**

```typescript
onSuccess: (data) => {
  // SSE will send update, this creates duplicate cache writes
  queryClient.setQueryData(['session', sessionId], data)
}
```

**Correct:**

```typescript
onSuccess: (data) => {
  // Let SSE handler update cache to prevent race conditions
  logger.debug('Mutation successful, waiting for SSE confirmation')
}
```

### 3. Not Canceling In-Flight Queries

**Wrong:**

```typescript
onMutate: async () => {
  // Optimistic update without canceling queries
  queryClient.setQueryData(['sessions'], newData) // May be overwritten by in-flight query!
}
```

**Correct:**

```typescript
onMutate: async () => {
  await queryClient.cancelQueries({ queryKey: ['sessions'] })
  queryClient.setQueryData(['sessions'], newData)
}
```

---

## Summary

These examples demonstrate the complete SSE + React Query integration:

1. **Basic Connection**: RealtimeService manages SSE lifecycle
2. **React Integration**: useRealtimeSession hook connects SSE to React Query
3. **Progress Updates**: Granular updates without full refetch
4. **Status Changes**: User notifications via toasts
5. **Optimistic Updates**: Instant UI feedback with server confirmation
6. **Mock Service**: Development without backend

**Key Principles:**

- SSE events update React Query cache directly (no refetch)
- Optimistic updates provide instant feedback
- SSE events provide server-confirmed state
- Deduplication prevents duplicate updates
- Atomic queue prevents race conditions
- Automatic reconnection with exponential backoff
- Background/foreground lifecycle handling

**Development Workflow:**

1. Use mock SSE for initial development
2. Test with production SSE before release
3. Monitor connection state for debugging
4. Use logger for event visibility
5. Test optimistic updates with slow network
