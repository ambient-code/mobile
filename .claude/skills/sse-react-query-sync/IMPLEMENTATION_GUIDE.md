# SSE + React Query Sync Implementation Guide

A comprehensive guide for implementing Server-Sent Events (SSE) with React Query cache synchronization in React Native applications.

## Overview

This implementation provides a robust, production-ready solution for real-time data synchronization using Server-Sent Events (SSE) with React Query. It includes:

- Automatic React Query cache updates from SSE events
- Connection management with exponential backoff retry
- Background/foreground state handling
- Event deduplication
- Mock service for offline development
- TypeScript type safety

## Architecture

```
┌─────────────────┐      SSE Events      ┌──────────────────┐
│   Backend API   │ ──────────────────> │ RealtimeService  │
└─────────────────┘                      └──────────────────┘
                                                  │
                                                  │ Events
                                                  ▼
                                         ┌──────────────────┐
                                         │ useRealtimeHook  │
                                         └──────────────────┘
                                                  │
                                                  │ Cache Updates
                                                  ▼
                                         ┌──────────────────┐
                                         │  React Query     │
                                         │  Cache           │
                                         └──────────────────┘
                                                  │
                                                  │ Data
                                                  ▼
                                         ┌──────────────────┐
                                         │  UI Components   │
                                         └──────────────────┘
```

---

## Section 1: Environment Setup (150 lines)

### Prerequisites

Before starting, ensure you have:

- React Native 0.70+ with Expo SDK 52
- Node.js 18+ and npm/yarn
- TypeScript 5.x configured
- Expo development environment set up

### Step 1.1: Install Dependencies

Install required packages:

```bash
# Core SSE and React Query packages
npm install react-native-sse @tanstack/react-query

# Additional utilities
npm install @react-native-async-storage/async-storage
npm install expo-constants
```

Verify installation:

```bash
npm list react-native-sse @tanstack/react-query
```

Expected output:

```
├── @tanstack/react-query@5.x.x
└── react-native-sse@1.x.x
```

### Step 1.2: Configure TypeScript

Create or update `tsconfig.json`:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "jsx": "react-native",
    "lib": ["ES2020"],
    "types": ["react-native", "jest"],
    "paths": {
      "@/*": ["./*"],
      "@components/*": ["./components/*"],
      "@hooks/*": ["./hooks/*"],
      "@services/*": ["./services/*"],
      "@types/*": ["./types/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"],
  "exclude": ["node_modules"]
}
```

### Step 1.3: Set Up Environment Variables

Create `.env.example`:

```bash
# API Configuration
API_BASE_URL=https://api.example.com
API_VERSION=v1

# SSE Configuration
SSE_ENDPOINT=/api/v1/sessions/stream
SSE_RECONNECT_INTERVAL=5000
SSE_MAX_RECONNECT_ATTEMPTS=10

# Development Flags
USE_MOCK_SSE=false
ENABLE_SSE_LOGGING=true
```

Create `.env.local` (git-ignored):

```bash
# Development environment
API_BASE_URL=http://localhost:3000
USE_MOCK_SSE=true
ENABLE_SSE_LOGGING=true
```

Create `.env.production`:

```bash
# Production environment
API_BASE_URL=https://api.production.com
USE_MOCK_SSE=false
ENABLE_SSE_LOGGING=false
```

### Step 1.4: Configure Environment Loading

Create `config/env.ts`:

```typescript
import Constants from 'expo-constants'

interface EnvConfig {
  apiBaseUrl: string
  sseEndpoint: string
  useMockSSE: boolean
  enableSSELogging: boolean
  reconnectInterval: number
  maxReconnectAttempts: number
}

const env = Constants.expoConfig?.extra ?? {}

export const config: EnvConfig = {
  apiBaseUrl: env.API_BASE_URL || 'http://localhost:3000',
  sseEndpoint: env.SSE_ENDPOINT || '/api/v1/sessions/stream',
  useMockSSE: env.USE_MOCK_SSE === 'true',
  enableSSELogging: env.ENABLE_SSE_LOGGING === 'true',
  reconnectInterval: parseInt(env.SSE_RECONNECT_INTERVAL || '5000', 10),
  maxReconnectAttempts: parseInt(env.SSE_MAX_RECONNECT_ATTEMPTS || '10', 10),
}
```

Update `app.json`:

```json
{
  "expo": {
    "name": "your-app-name",
    "extra": {
      "API_BASE_URL": process.env.API_BASE_URL,
      "SSE_ENDPOINT": process.env.SSE_ENDPOINT,
      "USE_MOCK_SSE": process.env.USE_MOCK_SSE,
      "ENABLE_SSE_LOGGING": process.env.ENABLE_SSE_LOGGING,
      "SSE_RECONNECT_INTERVAL": process.env.SSE_RECONNECT_INTERVAL,
      "SSE_MAX_RECONNECT_ATTEMPTS": process.env.SSE_MAX_RECONNECT_ATTEMPTS
    }
  }
}
```

### Step 1.5: Set Up React Query Provider

Create `app/_layout.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { useState } from 'react'

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  )
}
```

### Step 1.6: Verify Setup

Create a verification script `scripts/verify-setup.ts`:

```typescript
import { config } from '../config/env'

console.log('Environment Configuration:')
console.log('-------------------------')
console.log(`API Base URL: ${config.apiBaseUrl}`)
console.log(`SSE Endpoint: ${config.sseEndpoint}`)
console.log(`Use Mock SSE: ${config.useMockSSE}`)
console.log(`Enable Logging: ${config.enableSSELogging}`)
console.log(`Reconnect Interval: ${config.reconnectInterval}ms`)
console.log(`Max Reconnect Attempts: ${config.maxReconnectAttempts}`)
```

Run verification:

```bash
npx ts-node scripts/verify-setup.ts
```

---

## Section 2: Core Implementation (250 lines)

### Step 2.1: Create Type Definitions

Create `types/realtime.ts`:

```typescript
// Connection states
export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
  RECONNECTING = 'RECONNECTING',
}

// Event types from SSE
export enum SSEEventType {
  SESSION_CREATED = 'session.created',
  SESSION_UPDATED = 'session.updated',
  SESSION_COMPLETED = 'session.completed',
  SESSION_DELETED = 'session.deleted',
  HEARTBEAT = 'heartbeat',
}

// Base event structure
export interface SSEEvent<T = unknown> {
  id: string
  type: SSEEventType
  timestamp: number
  data: T
}

// Session-specific events
export interface SessionCreatedEvent {
  sessionId: string
  userId: string
  startedAt: string
  metadata?: Record<string, unknown>
}

export interface SessionUpdatedEvent {
  sessionId: string
  updates: {
    duration?: number
    status?: 'active' | 'paused' | 'completed'
    metadata?: Record<string, unknown>
  }
  updatedAt: string
}

export interface SessionCompletedEvent {
  sessionId: string
  completedAt: string
  summary?: {
    duration: number
    [key: string]: unknown
  }
}

export interface SessionDeletedEvent {
  sessionId: string
  deletedAt: string
}

export interface HeartbeatEvent {
  serverTime: number
}

// Event listener callback
export type EventCallback<T = unknown> = (event: SSEEvent<T>) => void

// Connection options
export interface RealtimeServiceOptions {
  url: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  debug?: boolean
  headers?: Record<string, string>
}

// Service interface
export interface IRealtimeService {
  connect(): void
  disconnect(): void
  getState(): ConnectionState
  addEventListener<T = unknown>(eventType: SSEEventType, callback: EventCallback<T>): () => void
}
```

### Step 2.2: Create RealtimeService Class

Create `services/api/realtime.ts`:

```typescript
import EventSource from 'react-native-sse'
import type {
  ConnectionState,
  EventCallback,
  IRealtimeService,
  RealtimeServiceOptions,
  SSEEvent,
  SSEEventType,
} from '@/types/realtime'

export class RealtimeService implements IRealtimeService {
  private eventSource: EventSource | null = null
  private state: ConnectionState = 'DISCONNECTED'
  private listeners = new Map<SSEEventType, Set<EventCallback>>()
  private reconnectAttempts = 0
  private reconnectTimeout: NodeJS.Timeout | null = null

  constructor(private options: RealtimeServiceOptions) {}

  public connect(): void {
    if (this.state === 'CONNECTED' || this.state === 'CONNECTING') {
      this.log('Already connected or connecting')
      return
    }

    this.setState('CONNECTING')
    this.log(`Connecting to ${this.options.url}`)

    try {
      this.eventSource = new EventSource(this.options.url, {
        headers: this.options.headers || {},
      })

      this.setupEventListeners()
    } catch (error) {
      this.handleError(error)
    }
  }

  public disconnect(): void {
    this.log('Disconnecting')
    this.clearReconnectTimeout()

    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    this.setState('DISCONNECTED')
    this.reconnectAttempts = 0
  }

  public getState(): ConnectionState {
    return this.state
  }

  public addEventListener<T = unknown>(
    eventType: SSEEventType,
    callback: EventCallback<T>
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }

    this.listeners.get(eventType)!.add(callback as EventCallback)

    // Return cleanup function
    return () => {
      const callbacks = this.listeners.get(eventType)
      if (callbacks) {
        callbacks.delete(callback as EventCallback)
        if (callbacks.size === 0) {
          this.listeners.delete(eventType)
        }
      }
    }
  }

  private setupEventListeners(): void {
    if (!this.eventSource) return

    this.eventSource.addEventListener('open', () => {
      this.log('Connection opened')
      this.setState('CONNECTED')
      this.reconnectAttempts = 0
    })

    this.eventSource.addEventListener('error', (error) => {
      this.log('Connection error', error)
      this.handleError(error)
    })

    this.eventSource.addEventListener('message', (event) => {
      this.handleMessage(event)
    })
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const parsed: SSEEvent = JSON.parse(event.data)
      this.log('Received event', parsed)

      const callbacks = this.listeners.get(parsed.type as SSEEventType)
      if (callbacks) {
        callbacks.forEach((callback) => {
          try {
            callback(parsed)
          } catch (error) {
            this.log('Error in event callback', error)
          }
        })
      }
    } catch (error) {
      this.log('Failed to parse event data', error)
    }
  }

  private handleError(error: unknown): void {
    this.setState('ERROR')

    if (this.reconnectAttempts < (this.options.maxReconnectAttempts || 10)) {
      this.scheduleReconnect()
    } else {
      this.log('Max reconnection attempts reached')
    }
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimeout()
    this.setState('RECONNECTING')

    const delay = this.calculateBackoff()
    this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`)

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++
      this.connect()
    }, delay)
  }

  private calculateBackoff(): number {
    const baseInterval = this.options.reconnectInterval || 5000
    const exponentialDelay = Math.min(
      baseInterval * Math.pow(2, this.reconnectAttempts),
      60000 // Max 60 seconds
    )
    // Add jitter to prevent thundering herd
    return exponentialDelay + Math.random() * 1000
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }

  private setState(newState: ConnectionState): void {
    this.state = newState
    this.log(`State changed to ${newState}`)
  }

  private log(message: string, data?: unknown): void {
    if (this.options.debug) {
      console.log(`[RealtimeService] ${message}`, data || '')
    }
  }
}
```

### Step 2.3: Create useRealtimeSession Hook

Create `hooks/useRealtimeSession.ts`:

```typescript
import { useQueryClient } from '@tanstack/react-query'
import { AppState, type AppStateStatus } from 'react-native'
import { useEffect, useRef } from 'react'
import { RealtimeService } from '@/services/api/realtime'
import { config } from '@/config/env'
import { SSEEventType, type SSEEvent } from '@/types/realtime'

interface Session {
  id: string
  userId: string
  startedAt: string
  duration?: number
  status: 'active' | 'paused' | 'completed'
  metadata?: Record<string, unknown>
}

export function useRealtimeSession(userId: string) {
  const queryClient = useQueryClient()
  const serviceRef = useRef<RealtimeService | null>(null)
  const eventCacheRef = useRef(new Map<string, number>())
  const appStateRef = useRef(AppState.currentState)

  useEffect(() => {
    // Initialize service
    const service = new RealtimeService({
      url: `${config.apiBaseUrl}${config.sseEndpoint}`,
      reconnectInterval: config.reconnectInterval,
      maxReconnectAttempts: config.maxReconnectAttempts,
      debug: config.enableSSELogging,
      headers: {
        'Content-Type': 'text/event-stream',
        // Add auth token if needed
        // 'Authorization': `Bearer ${token}`,
      },
    })

    serviceRef.current = service

    // Event deduplication check
    const isDuplicate = (eventId: string): boolean => {
      const now = Date.now()
      const lastSeen = eventCacheRef.current.get(eventId)

      if (lastSeen && now - lastSeen < 5000) {
        return true
      }

      eventCacheRef.current.set(eventId, now)
      return false
    }

    // Session created handler
    const unsubscribeCreated = service.addEventListener(
      SSEEventType.SESSION_CREATED,
      (event: SSEEvent) => {
        if (isDuplicate(event.id)) return

        config.enableSSELogging && console.log('Session created:', event.data)

        // Update all sessions list
        queryClient.setQueriesData({ queryKey: ['sessions', userId] }, (old: Session[] = []) => [
          ...old,
          event.data as Session,
        ])

        // Set individual session data
        const session = event.data as Session
        queryClient.setQueryData(['session', session.id], session)
      }
    )

    // Session updated handler
    const unsubscribeUpdated = service.addEventListener(
      SSEEventType.SESSION_UPDATED,
      (event: SSEEvent) => {
        if (isDuplicate(event.id)) return

        config.enableSSELogging && console.log('Session updated:', event.data)

        const update = event.data as { sessionId: string; updates: Partial<Session> }

        // Update in all sessions list
        queryClient.setQueriesData({ queryKey: ['sessions', userId] }, (old: Session[] = []) =>
          old.map((session) =>
            session.id === update.sessionId ? { ...session, ...update.updates } : session
          )
        )

        // Update individual session
        queryClient.setQueryData(['session', update.sessionId], (old: Session | undefined) =>
          old ? { ...old, ...update.updates } : undefined
        )
      }
    )

    // Session completed handler
    const unsubscribeCompleted = service.addEventListener(
      SSEEventType.SESSION_COMPLETED,
      (event: SSEEvent) => {
        if (isDuplicate(event.id)) return

        config.enableSSELogging && console.log('Session completed:', event.data)

        const completion = event.data as { sessionId: string; completedAt: string }

        queryClient.setQueriesData({ queryKey: ['sessions', userId] }, (old: Session[] = []) =>
          old.map((session) =>
            session.id === completion.sessionId
              ? { ...session, status: 'completed' as const }
              : session
          )
        )

        queryClient.setQueryData(['session', completion.sessionId], (old: Session | undefined) =>
          old ? { ...old, status: 'completed' as const } : undefined
        )
      }
    )

    // Session deleted handler
    const unsubscribeDeleted = service.addEventListener(
      SSEEventType.SESSION_DELETED,
      (event: SSEEvent) => {
        if (isDuplicate(event.id)) return

        config.enableSSELogging && console.log('Session deleted:', event.data)

        const deletion = event.data as { sessionId: string }

        queryClient.setQueriesData({ queryKey: ['sessions', userId] }, (old: Session[] = []) =>
          old.filter((session) => session.id !== deletion.sessionId)
        )

        queryClient.removeQueries({ queryKey: ['session', deletion.sessionId] })
      }
    )

    // Connect to SSE
    service.connect()

    // Handle app state changes (background/foreground)
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground - reconnect if needed
        config.enableSSELogging && console.log('App foregrounded, reconnecting SSE')
        service.connect()
      } else if (nextAppState.match(/inactive|background/)) {
        // App went to background - disconnect to save resources
        config.enableSSELogging && console.log('App backgrounded, disconnecting SSE')
        service.disconnect()
      }

      appStateRef.current = nextAppState
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    // Cleanup
    return () => {
      unsubscribeCreated()
      unsubscribeUpdated()
      unsubscribeCompleted()
      unsubscribeDeleted()
      service.disconnect()
      subscription.remove()
      eventCacheRef.current.clear()
    }
  }, [userId, queryClient])

  return {
    connectionState: serviceRef.current?.getState() || 'DISCONNECTED',
  }
}
```

---

## Section 3: Mock Service Setup (150 lines)

### Why Use a Mock Service?

The mock SSE service enables:

1. **Offline Development**: Work without backend connection
2. **Predictable Testing**: Control event timing and content
3. **UI Development**: Build interfaces before API is ready
4. **Demo Mode**: Showcase features without live data
5. **Integration Testing**: Automated tests with deterministic events

### Step 3.1: Create MockSSEService Class

Create `services/api/mock-realtime.ts`:

```typescript
import type {
  ConnectionState,
  EventCallback,
  IRealtimeService,
  SSEEvent,
  SSEEventType,
} from '@/types/realtime'

interface MockEvent {
  type: SSEEventType
  data: unknown
  delay: number
}

export class MockSSEService implements IRealtimeService {
  private state: ConnectionState = 'DISCONNECTED'
  private listeners = new Map<SSEEventType, Set<EventCallback>>()
  private eventQueue: NodeJS.Timeout[] = []
  private eventIdCounter = 0

  constructor(private debug = false) {}

  public connect(): void {
    if (this.state === 'CONNECTED') return

    this.log('Mock service connecting...')
    this.setState('CONNECTING')

    // Simulate connection delay
    setTimeout(() => {
      this.setState('CONNECTED')
      this.log('Mock service connected')
      this.startMockEventStream()
    }, 500)
  }

  public disconnect(): void {
    this.log('Mock service disconnecting...')
    this.clearEventQueue()
    this.setState('DISCONNECTED')
  }

  public getState(): ConnectionState {
    return this.state
  }

  public addEventListener<T = unknown>(
    eventType: SSEEventType,
    callback: EventCallback<T>
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }

    this.listeners.get(eventType)!.add(callback as EventCallback)

    return () => {
      const callbacks = this.listeners.get(eventType)
      if (callbacks) {
        callbacks.delete(callback as EventCallback)
      }
    }
  }

  private startMockEventStream(): void {
    const mockEvents: MockEvent[] = [
      {
        type: 'session.created',
        data: {
          sessionId: 'mock-session-1',
          userId: 'user-123',
          startedAt: new Date().toISOString(),
          metadata: { source: 'mock' },
        },
        delay: 1000,
      },
      {
        type: 'session.updated',
        data: {
          sessionId: 'mock-session-1',
          updates: {
            duration: 30,
            status: 'active',
          },
          updatedAt: new Date().toISOString(),
        },
        delay: 3000,
      },
      {
        type: 'heartbeat',
        data: {
          serverTime: Date.now(),
        },
        delay: 5000,
      },
      {
        type: 'session.updated',
        data: {
          sessionId: 'mock-session-1',
          updates: {
            duration: 60,
            status: 'active',
          },
          updatedAt: new Date().toISOString(),
        },
        delay: 8000,
      },
      {
        type: 'session.completed',
        data: {
          sessionId: 'mock-session-1',
          completedAt: new Date().toISOString(),
          summary: {
            duration: 90,
          },
        },
        delay: 12000,
      },
    ]

    mockEvents.forEach((mockEvent) => {
      const timeout = setTimeout(() => {
        this.emitEvent(mockEvent.type, mockEvent.data)
      }, mockEvent.delay)

      this.eventQueue.push(timeout)
    })
  }

  private emitEvent(type: SSEEventType, data: unknown): void {
    const event: SSEEvent = {
      id: `mock-event-${++this.eventIdCounter}`,
      type,
      timestamp: Date.now(),
      data,
    }

    this.log('Emitting mock event:', event)

    const callbacks = this.listeners.get(type)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(event)
        } catch (error) {
          this.log('Error in mock event callback', error)
        }
      })
    }
  }

  private clearEventQueue(): void {
    this.eventQueue.forEach(clearTimeout)
    this.eventQueue = []
  }

  private setState(newState: ConnectionState): void {
    this.state = newState
    this.log(`Mock state changed to ${newState}`)
  }

  private log(message: string, data?: unknown): void {
    if (this.debug) {
      console.log(`[MockSSEService] ${message}`, data || '')
    }
  }
}
```

### Step 3.2: Create Service Factory

Create `services/api/realtime-factory.ts`:

```typescript
import { config } from '@/config/env'
import type { IRealtimeService } from '@/types/realtime'
import { RealtimeService } from './realtime'
import { MockSSEService } from './mock-realtime'

export function createRealtimeService(): IRealtimeService {
  if (config.useMockSSE) {
    console.log('[RealtimeFactory] Using mock SSE service')
    return new MockSSEService(config.enableSSELogging)
  }

  console.log('[RealtimeFactory] Using production SSE service')
  return new RealtimeService({
    url: `${config.apiBaseUrl}${config.sseEndpoint}`,
    reconnectInterval: config.reconnectInterval,
    maxReconnectAttempts: config.maxReconnectAttempts,
    debug: config.enableSSELogging,
  })
}
```

### Step 3.3: Update Hook to Use Factory

Update `hooks/useRealtimeSession.ts`:

```typescript
import { createRealtimeService } from '@/services/api/realtime-factory'

export function useRealtimeSession(userId: string) {
  const queryClient = useQueryClient()
  const serviceRef = useRef<IRealtimeService | null>(null)

  useEffect(() => {
    // Use factory instead of direct instantiation
    const service = createRealtimeService()
    serviceRef.current = service

    // ... rest of the hook implementation remains the same
  }, [userId, queryClient])
}
```

### Step 3.4: Toggle Between Mock and Production

Development mode (`.env.local`):

```bash
USE_MOCK_SSE=true
ENABLE_SSE_LOGGING=true
```

Production mode (`.env.production`):

```bash
USE_MOCK_SSE=false
ENABLE_SSE_LOGGING=false
```

Test toggle programmatically:

```typescript
// In your component
import { config } from '@/config/env'

export function DebugPanel() {
  return (
    <View>
      <Text>SSE Mode: {config.useMockSSE ? 'Mock' : 'Production'}</Text>
      <Text>Logging: {config.enableSSELogging ? 'Enabled' : 'Disabled'}</Text>
    </View>
  )
}
```

---

## Section 4: Testing Strategies (100 lines)

### Step 4.1: Unit Testing Event Handlers

Create `hooks/__tests__/useRealtimeSession.test.ts`:

```typescript
import { renderHook, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRealtimeSession } from '../useRealtimeSession'

describe('useRealtimeSession', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
  })

  it('should connect to SSE on mount', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useRealtimeSession('user-123'), { wrapper })

    await waitFor(() => {
      expect(result.current.connectionState).toBe('CONNECTED')
    })
  })

  it('should update cache on session.created event', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    renderHook(() => useRealtimeSession('user-123'), { wrapper })

    // Mock service will emit session.created after 1 second
    await waitFor(
      () => {
        const sessions = queryClient.getQueryData(['sessions', 'user-123'])
        expect(sessions).toBeDefined()
        expect(Array.isArray(sessions)).toBe(true)
      },
      { timeout: 2000 }
    )
  })
})
```

### Step 4.2: Integration Testing with React Query

```typescript
import { act } from '@testing-library/react-native'

describe('SSE + React Query Integration', () => {
  it('should sync SSE events with React Query cache', async () => {
    const queryClient = new QueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    renderHook(() => useRealtimeSession('user-123'), { wrapper })

    // Wait for initial session creation
    await waitFor(() => {
      const sessions = queryClient.getQueryData(['sessions', 'user-123']) as Session[]
      expect(sessions).toHaveLength(1)
      expect(sessions[0].id).toBe('mock-session-1')
    })

    // Wait for session update
    await waitFor(
      () => {
        const sessions = queryClient.getQueryData(['sessions', 'user-123']) as Session[]
        expect(sessions[0].duration).toBe(30)
      },
      { timeout: 5000 }
    )
  })
})
```

### Step 4.3: Testing Reconnection Logic

```typescript
describe('RealtimeService reconnection', () => {
  it('should attempt reconnection with exponential backoff', async () => {
    const service = new RealtimeService({
      url: 'http://invalid-url',
      reconnectInterval: 1000,
      maxReconnectAttempts: 3,
      debug: true,
    })

    service.connect()

    // Should be in ERROR state after connection failure
    await waitFor(() => {
      expect(service.getState()).toBe('ERROR')
    })

    // Should transition to RECONNECTING
    await waitFor(() => {
      expect(service.getState()).toBe('RECONNECTING')
    })
  })
})
```

### Step 4.4: Testing Background/Foreground Transitions

```typescript
import { AppState } from 'react-native'

describe('App state handling', () => {
  it('should disconnect on background and reconnect on foreground', async () => {
    const { result } = renderHook(() => useRealtimeSession('user-123'))

    // Simulate app going to background
    act(() => {
      AppState.currentState = 'background'
      AppState.emit('change', 'background')
    })

    await waitFor(() => {
      expect(result.current.connectionState).toBe('DISCONNECTED')
    })

    // Simulate app coming to foreground
    act(() => {
      AppState.currentState = 'active'
      AppState.emit('change', 'active')
    })

    await waitFor(() => {
      expect(result.current.connectionState).toBe('CONNECTED')
    })
  })
})
```

---

## Section 5: Production Deployment (50 lines)

### Step 5.1: Disable Mock Service

Update `.env.production`:

```bash
USE_MOCK_SSE=false
ENABLE_SSE_LOGGING=false
```

Verify in code:

```typescript
import { config } from '@/config/env'

if (config.useMockSSE) {
  console.warn('WARNING: Mock SSE is enabled in production!')
}
```

### Step 5.2: Configure Production SSE Endpoint

Update production configuration:

```bash
API_BASE_URL=https://api.production.com
SSE_ENDPOINT=/api/v1/sessions/stream
SSE_RECONNECT_INTERVAL=5000
SSE_MAX_RECONNECT_ATTEMPTS=10
```

### Step 5.3: Authentication Token Setup

Update `services/api/realtime-factory.ts`:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'

export async function createAuthenticatedRealtimeService(): Promise<IRealtimeService> {
  const token = await AsyncStorage.getItem('auth_token')

  if (!token) {
    throw new Error('Authentication token not found')
  }

  return new RealtimeService({
    url: `${config.apiBaseUrl}${config.sseEndpoint}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/event-stream',
    },
    reconnectInterval: config.reconnectInterval,
    maxReconnectAttempts: config.maxReconnectAttempts,
    debug: config.enableSSELogging,
  })
}
```

### Step 5.4: Monitoring and Logging

Create production monitoring:

```typescript
import * as Sentry from '@sentry/react-native'

export class MonitoredRealtimeService extends RealtimeService {
  private setupMonitoring(): void {
    this.addEventListener('error', (event) => {
      Sentry.captureException(new Error('SSE Connection Error'), {
        extra: { event },
      })
    })

    // Track reconnection attempts
    const originalScheduleReconnect = this.scheduleReconnect.bind(this)
    this.scheduleReconnect = () => {
      Sentry.addBreadcrumb({
        category: 'sse',
        message: 'Attempting reconnection',
        level: 'warning',
      })
      originalScheduleReconnect()
    }
  }
}
```

### Step 5.5: Health Checks

Add health check monitoring:

```typescript
export function useSSEHealthCheck() {
  const [isHealthy, setIsHealthy] = useState(true)
  const lastHeartbeatRef = useRef(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceHeartbeat = Date.now() - lastHeartbeatRef.current

      if (timeSinceHeartbeat > 30000) {
        // No heartbeat for 30 seconds
        setIsHealthy(false)
        console.error('SSE connection unhealthy - no heartbeat')
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return { isHealthy }
}
```

---

## Quick Reference

### Key Files

- `types/realtime.ts` - Type definitions
- `services/api/realtime.ts` - Production SSE service
- `services/api/mock-realtime.ts` - Mock SSE service
- `services/api/realtime-factory.ts` - Service factory
- `hooks/useRealtimeSession.ts` - React hook
- `config/env.ts` - Environment configuration

### Environment Variables

```bash
# Development
USE_MOCK_SSE=true
ENABLE_SSE_LOGGING=true

# Production
USE_MOCK_SSE=false
ENABLE_SSE_LOGGING=false
API_BASE_URL=https://api.production.com
SSE_ENDPOINT=/api/v1/sessions/stream
```

### Common Commands

```bash
# Start with mock SSE
npm start

# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

### Troubleshooting

**Connection not establishing:**

- Check `USE_MOCK_SSE` flag
- Verify `API_BASE_URL` and `SSE_ENDPOINT`
- Check network permissions in app.json
- Enable logging: `ENABLE_SSE_LOGGING=true`

**Events not updating cache:**

- Verify event types match `SSEEventType` enum
- Check event structure matches type definitions
- Enable debug logging in RealtimeService
- Inspect React Query DevTools

**Background/foreground issues:**

- Check AppState listener is registered
- Verify cleanup in useEffect
- Test with mock service first

---

## Quickstart

### 5-Minute Setup

```bash
# 1. Install dependencies
npm install react-native-sse @tanstack/react-query

# 2. Copy core files
cp types/realtime.ts services/api/realtime.ts hooks/useRealtimeSession.ts

# 3. Configure environment
echo "USE_MOCK_SSE=true" >> .env.local

# 4. Use in component
```

```typescript
import { useRealtimeSession } from '@/hooks/useRealtimeSession'

export function MyComponent() {
  const { connectionState } = useRealtimeSession('user-123')

  return <Text>Status: {connectionState}</Text>
}
```

```bash
# 5. Start app
npm start
```

SUCCESS
