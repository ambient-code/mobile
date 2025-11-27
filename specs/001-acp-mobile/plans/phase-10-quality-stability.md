# Phase 10: Quality & Stability Sprint - Implementation Guide

**Status**: Ready for Implementation
**Duration**: ~1-2 weeks
**Priority**: P0 (Blocks production deployment)
**Prerequisite**: Phases 1-8 complete (87/87 tasks)

## Overview

This phase addresses critical production-readiness issues identified in BACKLOG.md. Split into 3 focused sub-phases for parallel work or sequential execution.

**Deliverables**:

- Production-grade error handling and observability
- Test coverage baseline (>50% for critical paths)
- Performance optimizations for production workload
- Zero known stability issues

---

## Sub-Phase 10.1: Quick Wins & Cleanup (30 minutes)

**Goal**: Remove technical debt and set up foundation for quality improvements

### Task 1: Remove why-did-you-render (5 minutes)

**Context**: Development-only dependency that's no longer used. Safe to remove.

**Files to modify**:

- `package.json`

**Steps**:

```bash
# Remove dependency
npm uninstall @welldone-software/why-did-you-render

# Verify removal
npm list @welldone-software/why-did-you-render
# Should show: (empty)

# Commit
git add package.json package-lock.json
git commit -m "Remove unused why-did-you-render dependency"
```

**Verification**: `npm run lint` and `npm start` both succeed without warnings.

---

### Task 2: Fix Inconsistent Type Imports (25 minutes)

**Context**: Codebase mixes `import type` and regular imports for TypeScript types. Enforce consistent pattern.

**Files to audit** (use grep to find violations):

```bash
# Find non-type imports that should be type-only
grep -r "import {.*} from.*types/" --include="*.ts" --include="*.tsx" | grep -v "import type"
```

**Pattern to enforce**:

```typescript
// ❌ Bad
import { User, Session } from '@/types/user'

// ✅ Good
import type { User, Session } from '@/types/user'
```

**Common violations**:

- `hooks/*.ts` - imports from `@/types/*`
- `services/api/*.ts` - imports from `@/types/*`
- `components/**/*.tsx` - imports from `@/types/*`

**Steps**:

1. Run grep command above to find all violations
2. For each violation, change `import {` to `import type {` if importing only types
3. Run `npm run type-check` after each batch of changes
4. Commit: `git commit -m "Enforce consistent type-only imports"`

**Verification**:

```bash
# Should return no results
grep -r "import {.*} from.*types/" --include="*.ts" --include="*.tsx" | grep -v "import type" | grep -v "test"
```

**ESLint rule to add** (prevents future violations):

```json
// .eslintrc.js
"@typescript-eslint/consistent-type-imports": ["error", {
  "prefer": "type-imports",
  "disallowTypeAnnotations": true
}]
```

---

## Sub-Phase 10.2: Production Hardening (3-4 days)

**Goal**: Add error boundaries, offline support, and observability for production deployment

### Task 3: Error Boundary Coverage (1 day)

**Context**: Triple-nested error boundary architecture exists in `app/_layout.tsx` but async operations in hooks lack error handling.

**Current state** (from `app/_layout.tsx:48-92`):

```typescript
// Outer boundary catches layout errors
<ErrorBoundary name="RootLayout">
  {/* Middle boundary catches navigation errors */}
  <ErrorBoundary name="Navigation">
    {/* Inner boundary catches screen-specific errors */}
    <ErrorBoundary name="Content">
      <Slot />
    </ErrorBoundary>
  </ErrorBoundary>
</ErrorBoundary>
```

**Problem**: Hooks like `useSessions`, `useNotifications`, `useChat` can throw errors that aren't caught.

**Files to modify**:

1. `hooks/useSessions.ts`
2. `hooks/useNotifications.ts`
3. `hooks/useChat.ts`
4. `components/ui/ErrorBoundary.tsx` (if needs enhancement)

**Implementation pattern for hooks**:

```typescript
// hooks/useSessions.ts (BEFORE)
export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchSessions() // Can throw!
      setSessions(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  return { sessions, loading }
}

// hooks/useSessions.ts (AFTER)
export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchSessions()
        setSessions(data)
        setError(null)
      } catch (err) {
        console.error('[useSessions] Fetch failed:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
        // Show cached data if available
        const cached = await PreferencesService.getCachedSessions()
        if (cached) setSessions(cached)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return { sessions, loading, error }
}
```

**Steps**:

1. Add error state to all data-fetching hooks
2. Wrap async operations in try/catch
3. Log errors with context (hook name, operation)
4. Return error state to consumers
5. Update components to display error UI when `error` is present
6. Test error scenarios:
   ```bash
   # In Network tab of React Native Debugger, block API calls
   # Verify error UI appears instead of crash
   ```

**Error UI component** (create if needed):

```typescript
// components/ui/ErrorMessage.tsx
interface ErrorMessageProps {
  error: Error
  retry?: () => void
  showDetails?: boolean
}

export function ErrorMessage({ error, retry, showDetails = false }: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <IconSymbol name="exclamationmark.triangle" size={48} color="#ef4444" />
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{error.message}</Text>
      {showDetails && <Text style={styles.details}>{error.stack}</Text>}
      {retry && (
        <TouchableOpacity style={styles.retryButton} onPress={retry}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
```

**Verification**:

- Run app in offline mode → see cached data + offline banner (not crash)
- Disable API in network debugger → see error UI with retry button
- All hooks return `{ data, loading, error }` pattern consistently

---

### Task 4: Offline Mode UI Integration (2 days)

**Context**: `useOffline` hook exists (`hooks/useOffline.ts`) but UI isn't fully integrated across screens.

**Current state**:

```typescript
// hooks/useOffline.ts (EXISTS)
export function useOffline() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected)
    })
    return unsubscribe
  }, [])

  return { isOffline }
}
```

**Problem**: Screens don't show offline banner or disable network-dependent actions.

**Files to modify**:

1. All `app/*.tsx` screens (Dashboard, Sessions, Notifications, Settings)
2. Create `components/ui/OfflineBanner.tsx`
3. Update `components/layout/Header.tsx` to show global offline indicator

**Step 1: Create OfflineBanner component**:

```typescript
// components/ui/OfflineBanner.tsx
import { View, Text, StyleSheet } from 'react-native'
import { IconSymbol } from './icon-symbol'
import { useTheme } from '@/hooks/useTheme'

export function OfflineBanner() {
  const { colors } = useTheme()

  return (
    <View style={[styles.banner, { backgroundColor: colors.warning }]}>
      <IconSymbol name="wifi.slash" size={16} color="#fff" />
      <Text style={styles.text}>Offline - Using cached data</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
})
```

**Step 2: Add to screens**:

```typescript
// app/(tabs)/index.tsx (Dashboard)
import { useOffline } from '@/hooks/useOffline'
import { OfflineBanner } from '@/components/ui/OfflineBanner'

export default function DashboardScreen() {
  const { isOffline } = useOffline()
  const { sessions, loading, error } = useSessions()

  return (
    <View style={styles.container}>
      {isOffline && <OfflineBanner />}
      {/* ... rest of screen */}
    </View>
  )
}
```

**Step 3: Disable network actions when offline**:

```typescript
// Example: Disable refresh when offline
const handleRefresh = useCallback(() => {
  if (isOffline) {
    Alert.alert('Offline', 'Cannot refresh while offline')
    return
  }
  refetch()
}, [isOffline, refetch])

// Example: Disable create session button
<TouchableOpacity
  onPress={() => router.push('/sessions/new')}
  disabled={isOffline}
  style={[styles.fab, isOffline && styles.fabDisabled]}
>
  <IconSymbol name="plus" size={24} color="#fff" />
</TouchableOpacity>
```

**Screens to update**:

- `app/(tabs)/index.tsx` - Dashboard
- `app/sessions/index.tsx` - Sessions list
- `app/sessions/new.tsx` - New session (disable entirely when offline)
- `app/notifications/index.tsx` - GitHub notifications
- `app/chat.tsx` - Interactive chat (disable send when offline)
- `app/settings/repos.tsx` - Connected repos (disable add/remove)

**Verification**:

1. Toggle airplane mode on device
2. See offline banner appear immediately across all screens
3. Try to refresh/create/send → see "Offline" alert
4. Cached data still visible
5. Re-enable network → banner disappears, actions re-enabled

---

### Task 5: Sentry Error Tracking Integration (1 day)

**Context**: No error tracking in production. Need observability for crashes and errors.

**Files to create/modify**:

1. `package.json` - Add Sentry dependencies
2. `app/_layout.tsx` - Initialize Sentry
3. `services/monitoring/sentry.ts` - Sentry configuration
4. `.env.local` - Sentry DSN (never commit)

**Step 1: Install Sentry**:

```bash
npm install --save @sentry/react-native
npx @sentry/wizard@latest -i reactNative
```

**Step 2: Create Sentry service**:

```typescript
// services/monitoring/sentry.ts
import * as Sentry from '@sentry/react-native'

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('[Sentry] DSN not configured, error tracking disabled')
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: __DEV__ ? 'development' : 'production',
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
    tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 100% in dev, 20% in prod
    beforeSend(event) {
      // Don't send events in development
      if (__DEV__) return null
      return event
    },
  })
}

export function captureError(error: Error, context?: Record<string, any>) {
  console.error('[Sentry]', error, context)
  Sentry.captureException(error, {
    contexts: { custom: context },
  })
}

export function setUser(user: { id: string; email: string; name: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
  })
}

export function clearUser() {
  Sentry.setUser(null)
}

export function addBreadcrumb(message: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    data,
    level: 'info',
  })
}
```

**Step 3: Initialize in app**:

```typescript
// app/_layout.tsx
import { initSentry } from '@/services/monitoring/sentry'

export default function RootLayout() {
  useEffect(() => {
    // Initialize Sentry early
    initSentry()
  }, [])

  // ... rest of layout
}
```

**Step 4: Integrate with auth**:

```typescript
// hooks/useAuth.ts
import { setUser, clearUser } from '@/services/monitoring/sentry'

export function useAuth() {
  // ... existing code

  const login = async (token: string) => {
    const user = await fetchUserProfile()
    setUser(user) // Track user in Sentry
    setAuthUser(user)
  }

  const logout = async () => {
    clearUser() // Clear user from Sentry
    await clearTokens()
  }
}
```

**Step 5: Add breadcrumbs to critical operations**:

```typescript
// Example: Track session creation
import { addBreadcrumb } from '@/services/monitoring/sentry'

async function createSession(data: CreateSessionData) {
  addBreadcrumb('Creating new session', { workflow: data.workflowType })

  try {
    const session = await apiClient.post('/sessions', data)
    addBreadcrumb('Session created', { id: session.id })
    return session
  } catch (error) {
    captureError(error, { operation: 'createSession', data })
    throw error
  }
}
```

**Environment variable** (add to `.env.local`):

```bash
EXPO_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

**Verification**:

1. Trigger an intentional error in dev → see Sentry event in dashboard
2. Check user context is attached to events
3. Verify breadcrumbs show user journey before error
4. Confirm no events sent in `__DEV__` mode

---

### Task 6: SSE Event Listener Memory Leak Fix (4 hours)

**Context**: EventSource connections not cleaned up properly in hooks, causing memory leaks on unmount.

**Likely affected files**:

1. `hooks/useSessions.ts` (if using SSE for real-time updates)
2. `services/sse/*.ts` (if SSE service exists)

**Investigation** (find SSE usage):

```bash
# Search for EventSource usage
grep -r "EventSource" --include="*.ts" --include="*.tsx"

# Search for SSE-related code
grep -r "text/event-stream" --include="*.ts"
```

**Common leak pattern**:

```typescript
// ❌ BAD - Memory leak
export function useSessions() {
  useEffect(() => {
    const eventSource = new EventSource('/api/sessions/stream')

    eventSource.onmessage = (event) => {
      setSessions(JSON.parse(event.data))
    }

    // Missing cleanup!
  }, [])
}

// ✅ GOOD - Proper cleanup
export function useSessions() {
  useEffect(() => {
    const eventSource = new EventSource('/api/sessions/stream')

    eventSource.onmessage = (event) => {
      setSessions(JSON.parse(event.data))
    }

    eventSource.onerror = (error) => {
      console.error('[SSE] Connection error:', error)
      eventSource.close()
    }

    // Cleanup on unmount
    return () => {
      console.log('[SSE] Closing connection')
      eventSource.close()
    }
  }, [])
}
```

**Additional fixes**:

1. Add connection state tracking
2. Implement automatic reconnection with exponential backoff
3. Close connections when app backgrounds

```typescript
// Advanced SSE hook with reconnection
export function useSSEConnection(url: string, onMessage: (data: any) => void) {
  const [connected, setConnected] = useState(false)
  const reconnectAttempts = useRef(0)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout

    const connect = () => {
      try {
        const eventSource = new EventSource(url)
        eventSourceRef.current = eventSource

        eventSource.onopen = () => {
          console.log('[SSE] Connected')
          setConnected(true)
          reconnectAttempts.current = 0
        }

        eventSource.onmessage = (event) => {
          onMessage(JSON.parse(event.data))
        }

        eventSource.onerror = () => {
          console.error('[SSE] Connection lost')
          setConnected(false)
          eventSource.close()

          // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          reconnectAttempts.current++

          console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`)
          reconnectTimeout = setTimeout(connect, delay)
        }
      } catch (error) {
        console.error('[SSE] Failed to connect:', error)
        setConnected(false)
      }
    }

    connect()

    // Cleanup
    return () => {
      console.log('[SSE] Cleaning up connection')
      clearTimeout(reconnectTimeout)
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [url, onMessage])

  return { connected }
}
```

**Verification**:

1. Open React Native Debugger → Memory tab
2. Navigate to screen with SSE connection
3. Navigate away (unmount component)
4. Check memory → should see EventSource cleaned up
5. Repeat 10x → memory should not increase

**Chrome DevTools technique**:

```javascript
// In Chrome console connected to React Native Debugger
performance.memory.usedJSHeapSize // Note value
// Navigate to/from screen 10 times
performance.memory.usedJSHeapSize // Should be similar (within 10%)
```

---

## Sub-Phase 10.3: Testing & Performance (4-5 days)

**Goal**: Establish test baseline and optimize performance for production load

### Task 7: Test Infrastructure Setup (2-3 days)

**Context**: Jest configured (`jest.config.js` exists) but zero tests written. Need baseline coverage.

**Target coverage**: >50% for critical paths:

- Authentication flow (login, token refresh, logout)
- Session CRUD operations
- API client (interceptors, error handling)
- Core UI components (SessionCard, ErrorBoundary, OfflineBanner)

**Files to create**:

1. `__tests__/services/api/client.test.ts`
2. `__tests__/hooks/useAuth.test.ts`
3. `__tests__/components/session/SessionCard.test.tsx`
4. `__tests__/components/ui/ErrorBoundary.test.tsx`
5. `__tests__/utils/test-helpers.tsx` (test utilities)

**Step 1: Create test helpers**:

```typescript
// __tests__/utils/test-helpers.tsx
import React from 'react'
import { render as rtlRender } from '@testing-library/react-native'
import { ThemeProvider } from '@/hooks/useTheme'
import { AuthProvider } from '@/hooks/useAuth'

// Wrap components with providers for testing
export function render(ui: React.ReactElement, options = {}) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    )
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options })
}

// Mock user for auth tests
export const mockUser = {
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'Developer',
  avatar: null,
  ssoProvider: 'Red Hat SSO',
  preferences: {
    theme: 'system',
    notifications: {
      blockingAlerts: true,
      reviewRequests: true,
      sessionUpdates: true,
      featuresAndNews: false,
    },
    quietHours: null,
  },
}

// Mock session
export const mockSession = {
  id: 'session-123',
  name: 'Test Session',
  status: 'running',
  progress: 50,
  model: 'sonnet-4.5',
  workflowType: 'review',
  repository: {
    id: 'repo-123',
    name: 'test/repo',
    url: 'https://github.com/test/repo',
    branch: 'main',
    isConnected: true,
  },
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-02'),
  currentTask: 'Reviewing code',
  tasksCompleted: ['Clone repo', 'Analyze code'],
  errorMessage: null,
}

// Re-export everything from RTL
export * from '@testing-library/react-native'
```

**Step 2: Test API client**:

```typescript
// __tests__/services/api/client.test.ts
import { apiClient } from '@/services/api/client'
import { TokenManager } from '@/services/auth/token-manager'

// Mock TokenManager
jest.mock('@/services/auth/token-manager')

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authorization header', () => {
    it('includes Bearer token when authenticated', async () => {
      const mockToken = 'test-access-token'
      ;(TokenManager.getAccessToken as jest.Mock).mockResolvedValue(mockToken)

      // Intercept request
      const requestSpy = jest.spyOn(apiClient, 'request')

      await apiClient.get('/sessions')

      expect(requestSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      )
    })

    it('omits Authorization header when not authenticated', async () => {
      ;(TokenManager.getAccessToken as jest.Mock).mockResolvedValue(null)

      const requestSpy = jest.spyOn(apiClient, 'request')

      await apiClient.get('/public-endpoint')

      expect(requestSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.anything(),
          }),
        })
      )
    })
  })

  describe('Token refresh', () => {
    it('refreshes token on 401 response', async () => {
      const mockRefresh = jest.fn().mockResolvedValue('new-token')
      ;(TokenManager.refreshAccessToken as jest.Mock).mockImplementation(mockRefresh)

      // Mock 401 response, then success
      const mockAdapter = apiClient.defaults.adapter
      apiClient.defaults.adapter = jest
        .fn()
        .mockRejectedValueOnce({ response: { status: 401 } })
        .mockResolvedValueOnce({ data: { sessions: [] } })

      await apiClient.get('/sessions')

      expect(mockRefresh).toHaveBeenCalledTimes(1)

      // Restore adapter
      apiClient.defaults.adapter = mockAdapter
    })
  })
})
```

**Step 3: Test authentication hook**:

```typescript
// __tests__/hooks/useAuth.test.ts
import { renderHook, act, waitFor } from '@testing-library/react-native'
import { useAuth } from '@/hooks/useAuth'
import { TokenManager } from '@/services/auth/token-manager'
import { mockUser } from '../utils/test-helpers'

jest.mock('@/services/auth/token-manager')
jest.mock('@/services/api/auth')

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes with null user', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('loads user on mount if token exists', async () => {
    ;(TokenManager.getAccessToken as jest.Mock).mockResolvedValue('token')
    ;(fetchUserProfile as jest.Mock).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  it('clears user on logout', async () => {
    const { result } = renderHook(() => useAuth())

    // Set user first
    act(() => {
      result.current.setUser(mockUser)
    })

    expect(result.current.isAuthenticated).toBe(true)

    // Logout
    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(TokenManager.clearTokens).toHaveBeenCalled()
  })
})
```

**Step 4: Test SessionCard component**:

```typescript
// __tests__/components/session/SessionCard.test.tsx
import { render, fireEvent, screen } from '@/tests/utils/test-helpers'
import { SessionCard } from '@/components/session/SessionCard'
import { mockSession } from '@/tests/utils/test-helpers'

describe('SessionCard', () => {
  it('renders session name and status', () => {
    render(<SessionCard session={mockSession} />)

    expect(screen.getByText('Test Session')).toBeTruthy()
    expect(screen.getByText('running')).toBeTruthy()
  })

  it('displays progress bar with correct percentage', () => {
    render(<SessionCard session={mockSession} />)

    const progressBar = screen.getByTestId('progress-bar')
    expect(progressBar.props.style).toMatchObject({
      width: '50%', // mockSession.progress = 50
    })
  })

  it('shows error indicator when session has error', () => {
    const errorSession = {
      ...mockSession,
      status: 'error',
      errorMessage: 'Build failed',
    }

    render(<SessionCard session={errorSession} />)

    expect(screen.getByText('error')).toBeTruthy()
    expect(screen.getByText('Build failed')).toBeTruthy()
  })

  it('calls onPress when tapped', () => {
    const onPress = jest.fn()
    render(<SessionCard session={mockSession} onPress={onPress} />)

    fireEvent.press(screen.getByTestId('session-card'))

    expect(onPress).toHaveBeenCalledWith(mockSession)
  })
})
```

**Step 5: Add test script to package.json**:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

**Run tests**:

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

**Coverage targets**:

- API Client: >80%
- Auth hooks: >70%
- Core components: >60%
- Overall: >50%

**Verification**:

- All tests pass: `npm test`
- Coverage meets targets: `npm run test:coverage`
- CI-ready: `npm run test:ci` succeeds

---

### Task 8: Performance Optimization (1-2 days)

**Context**: FlatList rendering is slow with 50+ sessions. Need optimization for production workload.

**Performance goals** (from spec.md Success Criteria):

- SC-001: Dashboard loads in <2 seconds
- SC-006: Handle 50 concurrent sessions without degradation
- SC-007: Handle 500+ GitHub notifications without lag
- SC-010: Theme switching has no perceptible lag

**Files to optimize**:

1. `app/(tabs)/index.tsx` - Dashboard with FlatList
2. `components/session/SessionCard.tsx` - Heavy component
3. `app/notifications/index.tsx` - GitHub notifications FlatList

**Step 1: Optimize SessionCard with memo**:

```typescript
// components/session/SessionCard.tsx (BEFORE)
export function SessionCard({ session, onPress }: SessionCardProps) {
  // Re-renders on every parent update, even if session unchanged
  return (
    <TouchableOpacity onPress={() => onPress(session)}>
      {/* ... */}
    </TouchableOpacity>
  )
}

// components/session/SessionCard.tsx (AFTER)
import { memo } from 'react'

export const SessionCard = memo(({ session, onPress }: SessionCardProps) => {
  // Only re-renders if session or onPress changes
  const handlePress = useCallback(() => {
    onPress(session)
  }, [session, onPress])

  return (
    <TouchableOpacity onPress={handlePress}>
      {/* ... */}
    </TouchableOpacity>
  )
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if session data changed
  return (
    prevProps.session.id === nextProps.session.id &&
    prevProps.session.status === nextProps.session.status &&
    prevProps.session.progress === nextProps.session.progress
  )
})

SessionCard.displayName = 'SessionCard'
```

**Step 2: Optimize Dashboard FlatList**:

```typescript
// app/(tabs)/index.tsx (BEFORE)
<FlatList
  data={sessions}
  renderItem={({ item }) => <SessionCard session={item} />}
  keyExtractor={(item) => item.id}
/>

// app/(tabs)/index.tsx (AFTER)
const renderSession = useCallback(({ item }: { item: Session }) => (
  <SessionCard session={item} onPress={handleSessionPress} />
), [handleSessionPress])

const keyExtractor = useCallback((item: Session) => item.id, [])

const getItemLayout = useCallback((data, index) => ({
  length: ITEM_HEIGHT, // e.g., 120
  offset: ITEM_HEIGHT * index,
  index,
}), [])

<FlatList
  data={sessions}
  renderItem={renderSession}
  keyExtractor={keyExtractor}
  getItemLayout={getItemLayout} // Optimization for fixed-height items
  maxToRenderPerBatch={10} // Render 10 items per batch
  windowSize={21} // Keep 21 items in memory (10 above + 10 below + 1 visible)
  removeClippedSubviews={true} // Remove off-screen views (Android perf)
  initialNumToRender={10} // Render 10 items on mount
  updateCellsBatchingPeriod={50} // Batch updates every 50ms
/>
```

**Step 3: Add performance monitoring**:

```typescript
// utils/performance.ts
export function measureRender(componentName: string) {
  const startTime = performance.now()

  return () => {
    const endTime = performance.now()
    const duration = endTime - startTime

    if (duration > 16) {
      // >16ms = dropped frame at 60fps
      console.warn(`[Performance] ${componentName} render took ${duration.toFixed(2)}ms`)
    }
  }
}

// Usage in component
export function Dashboard() {
  useEffect(() => {
    const end = measureRender('Dashboard')
    return end
  })

  // ... component code
}
```

**Step 4: Optimize images and assets**:

```bash
# Install image optimization tools
npm install --save-dev sharp

# Create optimization script
cat > scripts/optimize-images.js << 'EOF'
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const assetsDir = path.join(__dirname, '../assets/images')
const files = fs.readdirSync(assetsDir).filter(f => /\.(png|jpg|jpeg)$/.test(f))

files.forEach(async file => {
  const inputPath = path.join(assetsDir, file)
  const outputPath = path.join(assetsDir, file.replace(/\.(png|jpg|jpeg)$/, '.webp'))

  await sharp(inputPath)
    .webp({ quality: 80 })
    .toFile(outputPath)

  console.log(`Optimized ${file} → ${path.basename(outputPath)}`)
})
EOF

node scripts/optimize-images.js
```

**Step 5: Profile with React DevTools**:

```bash
# 1. Start app with profiler enabled
EXPO_PUBLIC_ENABLE_PROFILER=true npm start

# 2. Open React DevTools Profiler
# 3. Record Dashboard load with 50+ sessions
# 4. Identify slow components (>16ms render time)
# 5. Optimize with memo, useMemo, useCallback
```

**Performance checklist**:

- [ ] SessionCard memoized with custom comparison
- [ ] FlatList optimized (getItemLayout, windowSize, etc.)
- [ ] Dashboard renders in <2s with 50 sessions
- [ ] No frame drops during scrolling (60fps)
- [ ] Theme switching is instant (<16ms)
- [ ] Images optimized (WebP format, <100KB each)

**Verification**:

```bash
# Measure dashboard load time
# 1. Clear app data
# 2. Launch app
# 3. Time from splash screen to visible sessions
# Goal: <2 seconds

# Measure scroll performance
# 1. Load 50+ sessions
# 2. Enable "Show FPS Monitor" in React Native debugger
# 3. Scroll rapidly
# Goal: Maintain 55-60 FPS
```

---

## Completion Criteria

**Sub-Phase 10.1** (Quick Wins):

- [ ] why-did-you-render removed from package.json
- [ ] All type imports use `import type { }` syntax
- [ ] ESLint rule added to enforce type imports
- [ ] Zero linting errors: `npm run lint` passes

**Sub-Phase 10.2** (Production Hardening):

- [ ] All data-fetching hooks return `{ data, loading, error }`
- [ ] Error boundaries catch and display errors gracefully
- [ ] Offline banner appears on all screens when offline
- [ ] Network actions disabled when offline
- [ ] Sentry initialized and tracking errors in production
- [ ] User context attached to Sentry events
- [ ] SSE connections clean up on unmount
- [ ] Memory leak tests pass (10x mount/unmount)

**Sub-Phase 10.3** (Testing & Performance):

- [ ] Test coverage >50% overall
- [ ] Critical paths have >70% coverage
- [ ] All tests pass in CI: `npm run test:ci`
- [ ] Dashboard renders 50 sessions in <2s
- [ ] FlatList maintains 55-60 FPS while scrolling
- [ ] Theme switching has no perceptible lag
- [ ] Images optimized (<100KB each)

---

## Testing Checklist

Before marking Phase 10 complete, verify:

**Error Handling**:

1. Disconnect network → see offline banner
2. Force API error → see error UI with retry button
3. Trigger crash → see Sentry event in dashboard
4. Check Sentry user context → matches logged-in user

**Performance**:

1. Load 50+ sessions → Dashboard renders in <2s
2. Scroll through 100+ items → Maintains 55+ FPS
3. Switch theme 10x → No perceptible lag
4. Monitor memory → No leaks after 10x mount/unmount

**Tests**:

1. Run `npm test` → All tests pass
2. Run `npm run test:coverage` → >50% overall coverage
3. Run `npm run test:ci` → Passes (for CI/CD integration)

---

## Rollback Plan

If Phase 10 introduces regressions:

1. **Error boundaries causing crashes**:

   ```bash
   git revert <commit-hash>
   # Remove error boundaries from _layout.tsx
   # Fix underlying hook errors first
   ```

2. **Sentry blocking app startup**:

   ```bash
   # Disable Sentry temporarily
   export EXPO_PUBLIC_SENTRY_DSN=""
   npm start
   ```

3. **Performance regressions**:

   ```bash
   # Revert memo optimizations
   git revert <commit-hash>
   # Profile again to identify actual bottleneck
   ```

4. **Tests failing in CI**:
   ```bash
   # Run locally first
   npm run test:ci
   # Fix failures, then push
   ```

---

## Next Steps After Phase 10

Once all completion criteria met:

1. **Mark tasks complete** in `specs/001-acp-mobile/tasks.md`
2. **Update BACKLOG.md** - remove completed items
3. **Create Phase 10 retrospective** in `specs/001-acp-mobile/plans/phase-10-retro.md`
4. **Proceed to Phase 11** - Verify Phase 7 (Session Creation) implementation status

---

## Questions & Support

**Stuck on a task?**

- Review relevant spec files in `specs/001-acp-mobile/`
- Check existing implementations for patterns
- Ask in #acp-mobile Slack channel

**Found a bug?**

- Create GitHub issue with repro steps
- Tag with `phase-10` label
- Block on P0 issues, defer P2+ to backlog

**Need backend changes?**

- Phase 10 is frontend-only - no backend changes required
- If blocked, escalate to tech lead
