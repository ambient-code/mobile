# SSE + React Query Troubleshooting Guide

Common issues, diagnostics, and solutions for Server-Sent Events integration with React Query in React Native/Expo applications.

## Issue 1: Connection Drops Constantly

### Symptom

EventSource connection cycles repeatedly through states:

```
CONNECTING → CONNECTED → ERROR → RECONNECTING → CONNECTING → ...
```

Connection never stabilizes. In React Query DevTools, you see the SSE query constantly refetching.

### Diagnosis

**Step 1: Check Network Traffic**

Open Expo Dev Tools and filter network requests:

```bash
# In Expo Dev Tools Console
# Filter: "EventSource" or "/api/sessions/stream"
```

Look for:

- Status codes (should be 200, not 401/403/500)
- Response headers
- Connection duration (should stay open, not close immediately)

**Step 2: Verify Server Response Headers**

The SSE endpoint MUST return these headers:

```typescript
// Correct server response
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
Access-Control-Allow-Origin: * // or specific origin
Access-Control-Allow-Credentials: true
```

Test with curl:

```bash
curl -N -H "Authorization: Bearer YOUR_TOKEN" \
  http://your-api.com/api/sessions/stream
```

**Step 3: Check Authentication**

Add logging to your SSE connection:

```typescript
// hooks/useRealtimeSession.ts
const eventSource = new EventSource(url, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})

eventSource.onerror = (error) => {
  console.error('SSE Error Details:', {
    readyState: eventSource.readyState,
    url: eventSource.url,
    timestamp: new Date().toISOString(),
    error,
  })
}
```

Common auth issues:

- Token expired (check expiry with `jwt-decode`)
- Token not included in request
- Server requires different auth header format

**Step 4: Verify CORS Configuration**

For web/Expo web, CORS must allow EventSource:

```typescript
// Server-side (example)
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type'],
  })
)
```

Test CORS with:

```bash
curl -H "Origin: http://localhost:8081" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  -X OPTIONS \
  http://your-api.com/api/sessions/stream
```

### Solution

**Fix 1: Refresh Token Before Connecting**

```typescript
// hooks/useRealtimeSession.ts
const { data: session } = useQuery({
  queryKey: ['sse-connection'],
  queryFn: async () => {
    // Ensure fresh token
    const token = await getAccessToken()
    if (!token) throw new Error('No auth token')

    const url = `${API_URL}/sessions/stream?token=${token}`

    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(url)

      eventSource.onopen = () => {
        console.log('SSE Connected')
        resolve(eventSource)
      }

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error)
        eventSource.close()
        reject(error)
      }
    })
  },
  staleTime: Infinity, // Never refetch
  gcTime: Infinity, // Never garbage collect
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
})
```

**Fix 2: Add Server Heartbeat**

Prevent connection timeout with periodic messages:

```typescript
// Server-side
setInterval(() => {
  res.write(': heartbeat\n\n')
}, 30000) // Every 30 seconds
```

**Fix 3: Handle Network Changes**

React Native apps need to handle network state changes:

```typescript
import NetInfo from '@react-native-community/netinfo'

useEffect(() => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected && eventSource?.readyState === EventSource.CLOSED) {
      // Reconnect when network returns
      queryClient.invalidateQueries({ queryKey: ['sse-connection'] })
    }
  })

  return unsubscribe
}, [eventSource])
```

### Prevention

1. **Add Connection Monitoring**:

```typescript
const [connectionStats, setConnectionStats] = useState({
  connects: 0,
  disconnects: 0,
  errors: 0,
  lastConnected: null,
})

eventSource.onopen = () => {
  setConnectionStats((prev) => ({
    ...prev,
    connects: prev.connects + 1,
    lastConnected: new Date(),
  }))
}
```

2. **Set Realistic Timeouts**: Don't retry too aggressively

3. **Monitor Token Expiry**: Refresh tokens proactively before they expire

4. **Test on Real Devices**: Simulators may not accurately reflect network conditions

## Issue 2: Cache Shows Stale Data

### Symptom

SSE events are received (you see console.log messages), but the UI doesn't update. React Query DevTools shows old data in cache.

Example:

```typescript
// Event received at 14:32:15
console.log('SSE Event:', { type: 'session.updated', sessionId: '123' })

// But UI still shows old data from 14:30:00
```

### Diagnosis

**Step 1: Verify Event Handler Execution**

Add detailed logging:

```typescript
eventSource.addEventListener('session.updated', (event) => {
  const data = JSON.parse(event.data)
  console.log('Event Handler Called:', {
    timestamp: new Date().toISOString(),
    sessionId: data.sessionId,
    data,
  })

  queryClient.setQueryData(['sessions', 'list'], (oldData) => {
    console.log('Old Cache Data:', oldData)

    const newData = // ... update logic
      console.log('New Cache Data:', newData)
    return newData
  })
})
```

**Step 2: Check React Query DevTools**

Open React Query DevTools and inspect:

- Query key matches (`['sessions', 'list']`)
- Data structure in cache
- Last updated timestamp
- Observer count (should be > 0 if components are mounted)

**Step 3: Verify Cache Key Consistency**

All queries/mutations must use identical keys:

```typescript
// ❌ WRONG - Different key structures
useQuery({ queryKey: ['sessions'] })
setQueryData(['sessions', 'list'], newData)

// ✅ CORRECT - Same keys everywhere
const QUERY_KEYS = {
  sessions: {
    all: ['sessions'] as const,
    list: () => [...QUERY_KEYS.sessions.all, 'list'] as const,
    detail: (id: string) => [...QUERY_KEYS.sessions.all, 'detail', id] as const,
  },
}
```

**Step 4: Check Data Structure Match**

Ensure SSE data matches cache structure:

```typescript
// Cache structure
type SessionsCache = Session[]

// SSE event
const event = { sessionId: '123', title: 'Updated' }

// ❌ WRONG - Doesn't match structure
setQueryData(['sessions', 'list'], event)

// ✅ CORRECT - Merge with existing array
setQueryData(['sessions', 'list'], (old = []) => {
  const index = old.findIndex((s) => s.id === event.sessionId)
  if (index === -1) return old
  return [...old.slice(0, index), { ...old[index], ...event }, ...old.slice(index + 1)]
})
```

### Solution

**Fix 1: Update Both List and Detail Caches**

```typescript
// hooks/useRealtimeSession.ts
const updateSessionInCache = useCallback(
  (sessionId: string, updates: Partial<Session>) => {
    // Update list cache
    queryClient.setQueryData(['sessions', 'list'], (oldData: Session[] = []) => {
      const index = oldData.findIndex((s) => s.id === sessionId)
      if (index === -1) {
        console.warn('Session not found in list cache:', sessionId)
        return oldData
      }

      const updated = [...oldData]
      updated[index] = { ...updated[index], ...updates }
      return updated
    })

    // Update detail cache
    queryClient.setQueryData(['sessions', 'detail', sessionId], (oldData: Session | undefined) => {
      if (!oldData) {
        console.warn('Session not found in detail cache:', sessionId)
        return oldData
      }
      return { ...oldData, ...updates }
    })
  },
  [queryClient]
)

// Use in event handlers
eventSource.addEventListener('session.updated', (event) => {
  const data = JSON.parse(event.data)
  updateSessionInCache(data.sessionId, data)
})
```

**Fix 2: Force Component Re-render**

If cache updates but UI doesn't re-render, check component subscriptions:

```typescript
// ❌ WRONG - Component doesn't subscribe to query
const MyComponent = () => {
  const queryClient = useQueryClient()
  const sessions = queryClient.getQueryData(['sessions', 'list']) // Not reactive!

  return <SessionList sessions={sessions} />
}

// ✅ CORRECT - Component subscribes via useQuery
const MyComponent = () => {
  const { data: sessions } = useQuery({
    queryKey: ['sessions', 'list'],
    queryFn: fetchSessions,
  })

  return <SessionList sessions={sessions} />
}
```

**Fix 3: Invalidate Instead of Set**

For complex data structures, invalidation is safer:

```typescript
eventSource.addEventListener('session.updated', async (event) => {
  const data = JSON.parse(event.data)

  // Invalidate causes refetch with fresh data
  await queryClient.invalidateQueries({
    queryKey: ['sessions', 'detail', data.sessionId],
  })

  // Also invalidate list if it might include this session
  await queryClient.invalidateQueries({
    queryKey: ['sessions', 'list'],
    refetchType: 'active', // Only refetch if component is mounted
  })
})
```

### Prevention

1. **Use Immer for Immutable Updates**:

```typescript
import { produce } from 'immer'

setQueryData(['sessions', 'list'], (draft) =>
  produce(draft, (state) => {
    const session = state.find((s) => s.id === sessionId)
    if (session) Object.assign(session, updates)
  })
)
```

2. **Create Cache Update Utilities**:

```typescript
// utils/cache.ts
export const updateListItem = <T extends { id: string }>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  itemId: string,
  updates: Partial<T>
) => {
  queryClient.setQueryData(queryKey, (old: T[] = []) => {
    const index = old.findIndex((item) => item.id === itemId)
    if (index === -1) return old
    const updated = [...old]
    updated[index] = { ...updated[index], ...updates }
    return updated
  })
}
```

3. **Add Cache Validation**: Log warnings when updates fail

4. **Test Cache Updates**: Write unit tests for cache update logic

## Issue 3: UI Lags with Rapid Events

### Symptom

When receiving many SSE events in quick succession (e.g., live progress updates), the UI freezes, stutters, or becomes unresponsive. React DevTools shows excessive re-renders.

Example:

```typescript
// Events arriving every 100ms
14:32:15.100 - session.progress: 45%
14:32:15.200 - session.progress: 46%
14:32:15.300 - session.progress: 47%
// ... UI frozen
```

### Diagnosis

**Step 1: Measure Event Frequency**

```typescript
let eventCount = 0
let lastLog = Date.now()

eventSource.addEventListener('session.progress', (event) => {
  eventCount++

  const now = Date.now()
  if (now - lastLog > 1000) {
    console.log('Events per second:', eventCount)
    eventCount = 0
    lastLog = now
  }
})
```

**Step 2: Profile React Re-renders**

Install React DevTools and enable Profiler:

```typescript
// App.tsx
import { Profiler } from 'react'

<Profiler
  id="SessionList"
  onRender={(id, phase, actualDuration) => {
    if (actualDuration > 16) {
      // Slower than 60fps
      console.warn('Slow render:', { id, phase, actualDuration })
    }
  }}
>
  <SessionList />
</Profiler>
```

**Step 3: Check Event Batching**

React 18+ automatically batches updates, but SSE events are asynchronous:

```typescript
// Without batching - each event causes re-render
eventSource.addEventListener('progress', (e1) => {
  updateCache(e1) // Re-render 1
})
eventSource.addEventListener('status', (e2) => {
  updateCache(e2) // Re-render 2
})

// With batching - both events cause single re-render
```

**Step 4: Identify Unnecessary Re-renders**

Use `why-did-you-render`:

```bash
npm install @welldone-software/why-did-you-render
```

```typescript
// App.tsx
if (__DEV__) {
  const whyDidYouRender = require('@welldone-software/why-did-you-render')
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  })
}
```

### Solution

**Fix 1: Implement Event Batching**

Collect events and update cache in batches:

```typescript
// hooks/useRealtimeSession.ts
import { useRef, useEffect } from 'react'

const useEventBatching = (onFlush: (events: Event[]) => void, interval = 100) => {
  const batch = useRef<Event[]>([])
  const timeoutRef = useRef<NodeJS.Timeout>()

  const addEvent = (event: Event) => {
    batch.current.push(event)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      if (batch.current.length > 0) {
        onFlush(batch.current)
        batch.current = []
      }
    }, interval)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return addEvent
}

// Usage
const flushEvents = useCallback(
  (events: Event[]) => {
    queryClient.setQueryData(['sessions', 'list'], (old) => {
      let updated = old
      events.forEach((event) => {
        const data = JSON.parse(event.data)
        // Apply all updates to same data structure
        updated = applyUpdate(updated, data)
      })
      return updated
    })
  },
  [queryClient]
)

const addEvent = useEventBatching(flushEvents, 100)

eventSource.addEventListener('session.progress', addEvent)
```

**Fix 2: Debounce Rapid Updates**

For high-frequency events (like progress %), debounce:

```typescript
import { debounce } from 'lodash'

const updateProgress = debounce(
  (sessionId: string, progress: number) => {
    queryClient.setQueryData(['sessions', 'detail', sessionId], (old) => ({
      ...old,
      progress,
    }))
  },
  200,
  { leading: true, trailing: true }
)

eventSource.addEventListener('session.progress', (event) => {
  const { sessionId, progress } = JSON.parse(event.data)
  updateProgress(sessionId, progress)
})
```

**Fix 3: Memoize Components**

Prevent unnecessary re-renders of child components:

```typescript
// components/SessionListItem.tsx
import { memo } from 'react'

const SessionListItem = memo(
  ({ session }: { session: Session }) => {
    return (
      <View>
        <Text>{session.title}</Text>
        <Text>{session.progress}%</Text>
      </View>
    )
  },
  (prevProps, nextProps) => {
    // Only re-render if session actually changed
    return prevProps.session.id === nextProps.session.id && prevProps.session.progress === nextProps.session.progress
  }
)
```

**Fix 4: Use React.useMemo and useCallback**

```typescript
const SessionList = () => {
  const { data: sessions } = useQuery({ queryKey: ['sessions', 'list'] })

  // Memoize filtered/sorted data
  const activeSessions = useMemo(() => sessions?.filter((s) => s.status === 'active'), [sessions])

  // Memoize callbacks
  const handlePress = useCallback(
    (sessionId: string) => {
      navigation.navigate('SessionDetail', { sessionId })
    },
    [navigation]
  )

  return <FlatList data={activeSessions} renderItem={({ item }) => <SessionListItem session={item} onPress={handlePress} />} keyExtractor={(item) => item.id} />
}
```

### Prevention

1. **Set Event Rate Limits**: Configure server to send updates at reasonable intervals

2. **Use FlatList Optimizations**:

```typescript
<FlatList
  data={sessions}
  renderItem={renderItem}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  windowSize={5}
  removeClippedSubviews={true}
  initialNumToRender={10}
/>
```

3. **Profile Early**: Monitor performance during development, not just in production

4. **Consider Request Animation Frame**: For very high-frequency updates:

```typescript
let rafId: number | null = null

eventSource.addEventListener('rapid-event', (event) => {
  if (rafId) cancelAnimationFrame(rafId)

  rafId = requestAnimationFrame(() => {
    updateCache(event)
    rafId = null
  })
})
```

## Issue 4: Race Condition Between SSE and API

### Symptom

Cache is updated by SSE event, but immediately overwritten by stale data from a slower API response. User sees data "flicker" or revert to old state.

Timeline:

```
T0: User updates session title to "New Title"
T1: API request sent: PATCH /sessions/123
T2: SSE event received: session.updated (title: "New Title")
T3: Cache updated via SSE ✓
T4: UI shows "New Title" ✓
T5: API response arrives with OLD data (title: "Old Title")
T6: Cache overwritten by stale API response ✗
T7: UI reverts to "Old Title" ✗
```

### Diagnosis

**Step 1: Add Timestamps to Cache Updates**

```typescript
type TimestampedSession = Session & {
  _updatedAt: number
}

const updateSession = (data: Session) => {
  queryClient.setQueryData(['sessions', 'detail', data.id], {
    ...data,
    _updatedAt: Date.now(),
  })
}

// Log all updates
queryClient.getQueryCache().subscribe((event) => {
  if (event.type === 'updated') {
    console.log('Cache Updated:', {
      queryKey: event.query.queryKey,
      timestamp: Date.now(),
      data: event.query.state.data,
    })
  }
})
```

**Step 2: Compare SSE vs API Timing**

```typescript
// SSE handler
eventSource.addEventListener('session.updated', (event) => {
  console.log('[SSE] Event received:', {
    timestamp: Date.now(),
    data: event.data,
  })
  updateCache(event.data)
})

// API mutation
const mutation = useMutation({
  mutationFn: updateSession,
  onMutate: async (variables) => {
    console.log('[API] Mutation started:', {
      timestamp: Date.now(),
      variables,
    })
  },
  onSuccess: (data) => {
    console.log('[API] Response received:', {
      timestamp: Date.now(),
      data,
    })
  },
})
```

**Step 3: Check staleTime Configuration**

```typescript
// If staleTime is too low, queries refetch and overwrite SSE updates
const { data } = useQuery({
  queryKey: ['sessions', 'detail', id],
  queryFn: fetchSession,
  staleTime: 1000, // ❌ Too low - refetches every second
})

// Better configuration
const { data } = useQuery({
  queryKey: ['sessions', 'detail', id],
  queryFn: fetchSession,
  staleTime: 5 * 60 * 1000, // ✅ 5 minutes - SSE keeps it fresh
})
```

**Step 4: Inspect Network Waterfall**

Use Chrome DevTools Network tab to visualize request/response timing:

1. Filter by "Fetch/XHR"
2. Look for overlapping requests to same resource
3. Check "Timing" tab for each request
4. Identify which response arrives last

### Solution

**Fix 1: SSE as Source of Truth**

Make cache updates conditional on timestamp:

```typescript
const updateSessionCache = (source: 'sse' | 'api', sessionId: string, data: Partial<Session>) => {
  queryClient.setQueryData(
    ['sessions', 'detail', sessionId],
    (old: TimestampedSession | undefined) => {
      if (!old) return { ...data, _updatedAt: Date.now() }

      // SSE always wins
      if (source === 'sse') {
        return { ...old, ...data, _updatedAt: Date.now() }
      }

      // API only updates if no SSE update in last 5 seconds
      const timeSinceLastUpdate = Date.now() - old._updatedAt
      if (timeSinceLastUpdate < 5000) {
        console.log('Ignoring stale API response')
        return old
      }

      return { ...old, ...data, _updatedAt: Date.now() }
    }
  )
}

// Usage
eventSource.addEventListener('session.updated', (event) => {
  updateSessionCache('sse', event.sessionId, event.data)
})

mutation.onSuccess = (data) => {
  updateSessionCache('api', data.id, data)
}
```

**Fix 2: Optimistic Updates with Rollback**

```typescript
const useUpdateSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateSession,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['sessions', 'detail', variables.id] })

      // Snapshot previous value
      const previous = queryClient.getQueryData(['sessions', 'detail', variables.id])

      // Optimistically update
      queryClient.setQueryData(['sessions', 'detail', variables.id], (old) => ({
        ...old,
        ...variables,
        _optimistic: true,
      }))

      return { previous }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['sessions', 'detail', variables.id], context.previous)
      }
    },
    onSuccess: (data, variables) => {
      // Only update if not superseded by SSE
      const current = queryClient.getQueryData(['sessions', 'detail', variables.id])
      if (current?._optimistic) {
        queryClient.setQueryData(['sessions', 'detail', variables.id], {
          ...data,
          _optimistic: false,
        })
      }
    },
  })
}
```

**Fix 3: Server-Sent Timestamps**

Include server timestamp in both SSE events and API responses:

```typescript
// Server-side
{
  id: '123',
  title: 'Updated Title',
  updatedAt: '2024-01-15T14:32:15.123Z' // ISO timestamp from server
}

// Client-side comparison
const updateWithTimestamp = (source: string, data: Session) => {
  queryClient.setQueryData(['sessions', 'detail', data.id], (old: Session | undefined) => {
    if (!old) return data

    const oldTime = new Date(old.updatedAt).getTime()
    const newTime = new Date(data.updatedAt).getTime()

    if (newTime > oldTime) {
      console.log(`[${source}] Applying update (newer)`)
      return data
    } else {
      console.log(`[${source}] Ignoring update (older)`)
      return old
    }
  })
}
```

### Prevention

1. **Disable Background Refetching**: For SSE-managed data:

```typescript
const { data } = useQuery({
  queryKey: ['sessions', 'detail', id],
  queryFn: fetchSession,
  staleTime: Infinity, // Never refetch automatically
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
})
```

2. **Cancel Queries on Mutation**: Prevent race conditions:

```typescript
onMutate: async (variables) => {
  await queryClient.cancelQueries({ queryKey: ['sessions', 'detail', variables.id] })
}
```

3. **Use Mutation Observers**: Track mutation state:

```typescript
const isMutating = useIsMutating({ mutationKey: ['updateSession'] })

// Don't apply SSE updates during active mutations
if (isMutating > 0) {
  console.log('Mutation in progress, queuing SSE event')
}
```

4. **Monitor Version Conflicts**: Add version field to detect conflicts

## Issue 5: Memory Leak from Event Listeners

### Symptom

App performance degrades over time. Memory usage steadily increases. App eventually crashes or becomes unresponsive. Most noticeable after navigating between screens multiple times.

React DevTools Profiler shows:

- Increasing number of components rendered
- Same components rendering multiple times
- Memory usage climbing in browser/device

### Diagnosis

**Step 1: Check Cleanup Functions**

```typescript
// ❌ WRONG - No cleanup
useEffect(() => {
  const eventSource = new EventSource(url)

  eventSource.addEventListener('message', handleMessage)

  // Missing return cleanup function!
}, [])

// ✅ CORRECT - Proper cleanup
useEffect(() => {
  const eventSource = new EventSource(url)

  eventSource.addEventListener('message', handleMessage)

  return () => {
    eventSource.removeEventListener('message', handleMessage)
    eventSource.close()
  }
}, [])
```

**Step 2: Verify useEffect Dependencies**

```typescript
// ❌ WRONG - Dependencies cause re-subscription loop
useEffect(() => {
  const eventSource = new EventSource(url)

  eventSource.addEventListener('message', (event) => {
    // This creates new function reference every render
    queryClient.setQueryData(['sessions'], (old) => updateSessions(old, event))
  })

  return () => eventSource.close()
}, [queryClient, updateSessions]) // updateSessions changes every render!

// ✅ CORRECT - Stable dependencies
const updateSessions = useCallback((old, event) => {
  // Stable function reference
  return mergeSession(old, event)
}, []) // Empty deps - function never changes

useEffect(() => {
  const eventSource = new EventSource(url)

  eventSource.addEventListener('message', (event) => {
    queryClient.setQueryData(['sessions'], (old) => updateSessions(old, event))
  })

  return () => eventSource.close()
}, [queryClient, updateSessions]) // Now stable!
```

**Step 3: Profile Memory with React DevTools**

Install React DevTools Profiler:

```typescript
// App.tsx
import { Profiler } from 'react'

const onRenderCallback = (id, phase, actualDuration, baseDuration, startTime, commitTime, interactions) => {
  console.log('Profiler:', {
    id,
    phase,
    actualDuration,
    interactions: interactions.size,
  })
}

;<Profiler id="App" onRender={onRenderCallback}>
  <App />
</Profiler>
```

Take heap snapshots:

1. Navigate to Memory tab in Chrome DevTools
2. Take snapshot before navigation
3. Navigate between screens 5-10 times
4. Take another snapshot
5. Compare - look for "Detached EventSource" objects

**Step 4: Check for Multiple Subscriptions**

Add logging to detect duplicate listeners:

```typescript
let subscriptionCount = 0

useEffect(() => {
  subscriptionCount++
  console.log('SSE Subscription created:', subscriptionCount)

  const eventSource = new EventSource(url)

  return () => {
    subscriptionCount--
    console.log('SSE Subscription cleaned up:', subscriptionCount)
    eventSource.close()
  }
}, [])
```

If count keeps increasing without decreasing, you have a leak.

### Solution

**Fix 1: Proper Cleanup Pattern**

```typescript
// hooks/useRealtimeSession.ts
import { useEffect, useRef, useCallback } from 'react'

export const useRealtimeSession = () => {
  const eventSourceRef = useRef<EventSource | null>(null)
  const handlersRef = useRef<Map<string, (event: MessageEvent) => void>>(new Map())

  const subscribe = useCallback((eventType: string, handler: (event: MessageEvent) => void) => {
    if (!eventSourceRef.current) {
      eventSourceRef.current = new EventSource(API_URL)
    }

    // Store handler reference for cleanup
    handlersRef.current.set(eventType, handler)
    eventSourceRef.current.addEventListener(eventType, handler)

    console.log('Subscribed to:', eventType)
  }, [])

  const unsubscribe = useCallback((eventType: string) => {
    const handler = handlersRef.current.get(eventType)
    if (handler && eventSourceRef.current) {
      eventSourceRef.current.removeEventListener(eventType, handler)
      handlersRef.current.delete(eventType)
      console.log('Unsubscribed from:', eventType)
    }
  }, [])

  useEffect(() => {
    return () => {
      // Cleanup all handlers
      handlersRef.current.forEach((handler, eventType) => {
        eventSourceRef.current?.removeEventListener(eventType, handler)
      })
      handlersRef.current.clear()

      // Close connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
        console.log('EventSource closed')
      }
    }
  }, [])

  return { subscribe, unsubscribe }
}
```

**Fix 2: Use React Query's Built-in Cleanup**

```typescript
// hooks/useSessionSSE.ts
import { useQuery } from '@tanstack/react-query'

export const useSessionSSE = (sessionId: string) => {
  return useQuery({
    queryKey: ['sse', 'session', sessionId],
    queryFn: () => {
      return new Promise((resolve, reject) => {
        const eventSource = new EventSource(`${API_URL}/sessions/${sessionId}/stream`)

        const handleMessage = (event: MessageEvent) => {
          const data = JSON.parse(event.data)
          resolve(data)
        }

        eventSource.addEventListener('message', handleMessage)
        eventSource.onerror = reject

        // React Query handles cleanup automatically when query is unmounted
        return () => {
          eventSource.removeEventListener('message', handleMessage)
          eventSource.close()
        }
      })
    },
    staleTime: Infinity,
    gcTime: 0, // Cleanup immediately when unmounted
  })
}
```

**Fix 3: Debounce Event Handlers**

Prevent memory buildup from rapid event handler creation:

```typescript
import { useMemo, useCallback } from 'react'
import { debounce } from 'lodash'

const useSessionUpdates = () => {
  const queryClient = useQueryClient()

  const handleUpdate = useCallback(
    (sessionId: string, data: Partial<Session>) => {
      queryClient.setQueryData(['sessions', 'detail', sessionId], (old) => ({
        ...old,
        ...data,
      }))
    },
    [queryClient]
  )

  // Memoize debounced version - same function reference across renders
  const debouncedUpdate = useMemo(() => debounce(handleUpdate, 200), [handleUpdate])

  useEffect(() => {
    const eventSource = new EventSource(url)

    eventSource.addEventListener('session.updated', (event) => {
      const data = JSON.parse(event.data)
      debouncedUpdate(data.sessionId, data)
    })

    return () => {
      debouncedUpdate.cancel() // Cancel pending debounced calls
      eventSource.close()
    }
  }, [debouncedUpdate])
}
```

**Fix 4: Use Weak References for Cache**

For long-lived connections with many sessions:

```typescript
// Use WeakMap to allow garbage collection
const sessionHandlers = new WeakMap()

const registerHandler = (session: Session, handler: Function) => {
  sessionHandlers.set(session, handler)
}

// When session is no longer referenced, handler is auto-garbage-collected
```

### Prevention

1. **Always Return Cleanup Functions**:

```typescript
useEffect(() => {
  const subscription = subscribe()

  return () => {
    subscription.unsubscribe()
  }
}, [])
```

2. **Use ESLint React Hooks Plugin**:

```bash
npm install eslint-plugin-react-hooks
```

```json
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

3. **Test Navigation Cycles**: Repeatedly navigate to/from screens during development

4. **Monitor Memory in Production**: Use tools like Sentry to track memory usage

5. **Use React Strict Mode**: Detects missing cleanup in development:

```typescript
// App.tsx
import { StrictMode } from 'react'

export default function App() {
  return (
    <StrictMode>
      <YourApp />
    </StrictMode>
  )
}
```

Strict Mode mounts components twice in development, exposing cleanup issues early.

---

## Additional Resources

- [React Query DevTools](https://tanstack.com/query/latest/docs/devtools)
- [EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
- [React Profiler](https://react.dev/reference/react/Profiler)
- [Chrome DevTools Memory Profiler](https://developer.chrome.com/docs/devtools/memory-problems)

## Getting Help

If you encounter issues not covered here:

1. Check React Query DevTools for cache state
2. Review browser/Expo console for errors
3. Profile with React DevTools Profiler
4. Test with curl to verify server behavior
5. Open issue with minimal reproduction case
