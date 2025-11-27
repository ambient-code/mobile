# SSE + React Query Realtime Sync

> **Production-ready Server-Sent Events (SSE) integration with React Query for real-time data synchronization in React Native**

## Overview

This skill documents the sophisticated realtime synchronization pattern used in the acp-mobile React Native application. It covers everything from basic SSE connection management to advanced race condition prevention and performance optimization.

### What You'll Learn

- ✅ Set up SSE with automatic reconnection and exponential backoff
- ✅ Integrate SSE events with React Query cache updates
- ✅ Handle app background/foreground transitions gracefully
- ✅ Prevent race conditions between SSE and API responses
- ✅ Optimize performance with event deduplication and batching
- ✅ Develop locally with a mock SSE service
- ✅ Deploy to production with proper error handling and monitoring

---

## When to Use This Pattern

Use SSE + React Query synchronization when you need:

- **Real-time updates** without polling (session progress, status changes, live data)
- **Unidirectional server → client** communication (no need to send messages from client)
- **Automatic cache synchronization** (update UI instantly without refetching)
- **Production-grade reliability** (reconnection, error handling, state management)
- **Mobile-optimized** (battery-efficient, handles background/foreground)

### NOT a good fit for:

- ❌ Bidirectional communication (use WebSockets)
- ❌ Binary data transfer (use WebSockets)
- ❌ Updates less frequent than 30s (use polling)
- ❌ Critical sub-100ms latency (use WebSockets)

---

## Prerequisites

Before starting, ensure you have:

### Required Knowledge

- **React Query basics**: Queries, mutations, `queryClient` methods
- **React hooks**: `useEffect`, `useCallback`, `useState`, `useRef`
- **TypeScript**: Types, interfaces, generics
- **React Native**: App lifecycle, AppState API

### Required Dependencies

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "react-native-sse": "^1.2.1",
    "react-native": "0.76.x",
    "expo": "^52.0.0"
  }
}
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         SSE Backend                              │
│                  (Server-Sent Events Endpoint)                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ EventSource connection
                            │ (auto-reconnect on error)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     RealtimeService                              │
│                 (Connection Management Layer)                    │
│                                                                   │
│  • Manages EventSource lifecycle                                 │
│  • Handles reconnection with exponential backoff                 │
│  • Parses SSE events → typed event objects                       │
│  • Notifies subscribers of events & state changes                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Event callbacks
                            │ (subscription pattern)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   useRealtimeSession Hook                        │
│                  (React Query Integration)                       │
│                                                                   │
│  • Subscribes to SSE events                                      │
│  • Deduplicates events (100ms window)                            │
│  • Queues cache updates (prevent race conditions)                │
│  • Updates React Query cache directly                            │
│  • Handles background/foreground transitions                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Cache mutations
                            │ (setQueryData, setQueriesData)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   React Query Cache                              │
│                                                                   │
│  ['sessions'] ───────────► List cache (all sessions)             │
│  ['sessions', {status}] ─► Filtered list cache                   │
│  ['session', id] ────────► Detail cache (single session)         │
│                                                                   │
│  Both list & detail updated on every SSE event                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ React components subscribe
                            │ (useQuery hooks)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         UI Components                            │
│                                                                   │
│  • SessionList (shows all sessions)                              │
│  • SessionDetail (shows single session)                          │
│  • ProgressBar (updates in real-time)                            │
│  • StatusBadge (changes on status events)                        │
│                                                                   │
│  Components re-render automatically when cache updates           │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Direct Cache Updates**: SSE events update cache directly via `setQueryData`, not `invalidateQueries`
   - ✅ No unnecessary refetches (save bandwidth)
   - ✅ Instant UI updates (no loading states)
   - ✅ SSE is the source of truth

2. **Dual Cache Updates**: Update BOTH list and detail caches
   - ✅ Consistency across all UI surfaces
   - ✅ No "detail shows old data" bugs
   - ✅ Works when multiple views are open

3. **Event Queuing**: Queue updates per session ID
   - ✅ Prevents race conditions
   - ✅ Ensures atomic updates
   - ✅ Maintains update order

4. **Background/Foreground Handling**: Disconnect on background, reconnect on foreground
   - ✅ iOS/Android compatibility
   - ✅ Prevents ghost connections
   - ✅ Saves battery

---

## Quick Start (5 Minutes)

Get SSE working in your app with this minimal setup:

### Step 1: Install Dependencies

```bash
npm install @tanstack/react-query react-native-sse
```

### Step 2: Copy Core Files

Copy these files from `REFERENCE_CODE/` to your project:

```bash
# Core SSE service
cp REFERENCE_CODE/RealtimeService.ts.example src/services/api/realtime.ts

# Type definitions
cp REFERENCE_CODE/types-realtime.ts.example src/types/realtime.ts

# React hook
cp REFERENCE_CODE/useRealtimeSession.ts.example src/hooks/useRealtimeSession.ts

# Mock service (optional, for development)
cp REFERENCE_CODE/MockSSEService.ts.example src/utils/mockData.ts
```

### Step 3: Configure API Endpoint

Edit `src/services/api/realtime.ts`:

```typescript
// Update this to your SSE endpoint
const url = `${API_BASE_URL}/sse/sessions`
```

### Step 4: Use in Your Component

```typescript
import { useRealtimeSession } from '@/hooks/useRealtimeSession'

export function SessionsScreen() {
  const { connectionState, isConnected, retry } = useRealtimeSession()

  return (
    <View>
      {/* Show connection status */}
      {!isConnected && (
        <Banner onPress={retry}>
          Connection lost. Tap to reconnect.
        </Banner>
      )}

      {/* Your session list component */}
      <SessionList />
    </View>
  )
}
```

### Step 5: Verify It Works

Open the console and look for:

```
[SSE] Connection opened
[Realtime] Received event: session.progress { sessionId: '123', progress: 50 }
[Realtime] Sessions cache updated
```

**That's it!** Your app now receives real-time updates via SSE.

---

## What's in This Skill

### 📖 Documentation

- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** (700 lines)
  - Complete step-by-step setup from scratch
  - Environment setup, configuration, testing
  - Mock service setup for local development
  - Production deployment checklist

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** (500 lines)
  - 5 Architecture Decision Records (ADRs)
  - Why we chose SSE over alternatives
  - Cache update strategy rationale
  - Trade-offs and design decisions

- **[EXAMPLES.md](./EXAMPLES.md)** (600 lines)
  - 6 complete, copy-pasteable code examples
  - Basic connection to advanced optimistic updates
  - Real production code with explanations

- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** (400 lines)
  - 5 common issues with diagnostic steps
  - Connection drops, stale cache, race conditions
  - Step-by-step debugging guides

### 💻 Reference Code

- **`RealtimeService.ts.example`** (254 lines)
  - Production SSE service with reconnection logic
  - TypeScript with full inline comments

- **`useRealtimeSession.ts.example`** (380 lines)
  - React hook for SSE + React Query integration
  - Event deduplication, queue management

- **`MockSSEService.ts.example`** (163 lines)
  - Mock SSE service for local development
  - Generates realistic random events

- **`types-realtime.ts.example`** (123 lines)
  - Complete TypeScript type definitions
  - Event types, connection states, configs

---

## Core Concepts

### Connection States

```typescript
enum ConnectionState {
  DISCONNECTED = 'disconnected', // Not connected
  CONNECTING = 'connecting', // Connection in progress
  CONNECTED = 'connected', // Active connection
  RECONNECTING = 'reconnecting', // Retrying after error
  ERROR = 'error', // Connection failed
}
```

**State Transitions**:

```
DISCONNECTED → connect() → CONNECTING
CONNECTING → onOpen() → CONNECTED
CONNECTED → onError() → RECONNECTING
RECONNECTING → onOpen() → CONNECTED
RECONNECTING → maxRetries → ERROR
ERROR → retry() → CONNECTING
```

### Event Types

```typescript
enum RealtimeEventType {
  SESSION_PROGRESS = 'session.progress', // Progress updates (0-100%)
  SESSION_UPDATED = 'session.updated', // Partial session changes
  SESSION_STATUS = 'session.status', // Status transitions
}
```

### Cache Update Pattern

```typescript
// Update ALL list caches
queryClient.setQueriesData<Session[]>({ queryKey: ['sessions'] }, (old) =>
  updateSession(old, newData)
)

// ALSO update detail cache
queryClient.setQueryData<Session>(['session', sessionId], (old) => ({ ...old, ...newData }))
```

**Why both?** User might have both list view and detail view open. Update both to ensure consistency.

---

## Development Workflow

### Using Mock SSE Service

During development, use the mock service to avoid backend dependency:

```typescript
// In your .env or config
EXPO_PUBLIC_USE_MOCK_SSE = true
```

The mock service automatically:

- ✅ Generates realistic random events every 3-5 seconds
- ✅ Matches production event structure exactly
- ✅ Simulates progress updates, status changes
- ✅ Works offline

**Switch to production**: Set `EXPO_PUBLIC_USE_MOCK_SSE=false`

### Testing Strategy

1. **Unit Tests**: Test event handlers in isolation
2. **Integration Tests**: Test SSE + React Query integration
3. **E2E Tests**: Test full user flows with mock service
4. **Manual Testing**: Verify with React Query DevTools

---

## Production Readiness Checklist

Before deploying to production:

- [ ] **Authentication**: SSE endpoint requires Bearer token
- [ ] **Error Handling**: All error scenarios handled gracefully
- [ ] **Reconnection**: Exponential backoff configured (1s → 30s max)
- [ ] **Background Handling**: Disconnect on background, reconnect on foreground
- [ ] **Event Validation**: Validate event payloads before applying to cache
- [ ] **Monitoring**: Log connection state changes and errors
- [ ] **Mock Service Disabled**: `USE_MOCK_SSE = false` in production
- [ ] **HTTPS**: SSE endpoint uses `https://` (not `http://`)
- [ ] **Cleanup**: Event listeners properly removed on unmount
- [ ] **Performance**: Event deduplication enabled (100ms window)

---

## Next Steps

Choose your path based on your goal:

### 🆕 New to SSE/React Query?

1. Read this README completely
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) ADR 1 (Why SSE?)
3. Study [EXAMPLES.md](./EXAMPLES.md) Example 1 (Basic connection)
4. Follow Quick Start above

### 🔧 Ready to Implement?

1. Follow [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) Section 1 & 2
2. Copy code from [REFERENCE_CODE/](./REFERENCE_CODE/)
3. Test with mock service
4. Deploy to production (Section 5)

### 🐛 Debugging an Issue?

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for your symptom
2. Follow diagnostic steps
3. Apply solution
4. Verify fix with React Query DevTools

### 🎓 Understanding the Design?

1. Read all 5 ADRs in [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Study [EXAMPLES.md](./EXAMPLES.md) Examples 2 & 5
3. Review production code in [REFERENCE_CODE/](./REFERENCE_CODE/)

---

## Additional Resources

### Official Documentation

- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Server-Sent Events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [EventSource API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
- [React Native AppState](https://reactnative.dev/docs/appstate)

### Related Patterns

- **Optimistic Updates**: Update UI immediately, rollback on error
- **Polling**: Fallback when SSE not available
- **WebSockets**: For bidirectional communication
- **GraphQL Subscriptions**: For GraphQL backends

---

## Skill Maintenance

**This skill is maintained as part of the acp-mobile codebase.**

**Update triggers**:

- Production code changes in `services/api/realtime.ts`
- New event types added
- New bugs discovered
- New patterns emerge

**Current version**: 1.0.0 (2025-11-26)

---

## Questions?

- **Implementation questions**: See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
- **Architecture questions**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Code examples**: See [EXAMPLES.md](./EXAMPLES.md)
- **Debugging help**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Reference code**: See [REFERENCE_CODE/](./REFERENCE_CODE/)

---

**Ready to get started?** Jump to [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) →
