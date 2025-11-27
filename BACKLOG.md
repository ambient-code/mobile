# ACP Mobile - Development Backlog

**Generated:** 2025-11-26

This backlog contains prioritized recommendations from the comprehensive code review. Critical issues have been resolved. Items below are prioritized for future development.

---

## HIGH Priority

### 1. Error Boundary Coverage for Async Operations

**Confidence:** 90%
**Effort:** 1 day
**Files:** `app/_layout.tsx`

**Issue:** Error Boundaries only catch synchronous render errors, not async operations (API calls, SSE events, event handlers).

**Solution:**

```typescript
// app/_layout.tsx - Add global error handler
useEffect(() => {
  const previousHandler = ErrorUtils.getGlobalHandler()
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('Global error:', error, 'isFatal:', isFatal)
    if (isFatal) {
      Alert.alert('Fatal Error', 'The app needs to restart.', [
        { text: 'Restart', onPress: () => RNRestart.Restart() },
      ])
    }
    previousHandler?.(error, isFatal)
  })

  return () => {
    ErrorUtils.setGlobalHandler(previousHandler)
  }
}, [])
```

**Dependencies:** `react-native-restart` package

---

### 2. React Query Cache Invalidation Race Conditions

**Confidence:** 85%
**Effort:** 1 day
**Files:** `hooks/useRealtimeSession.ts:50-73`

**Issue:** SSE events update React Query cache with wildcard query key matching, causing updates to be applied to filtered queries incorrectly.

**Current Code:**

```typescript
queryClient.setQueriesData<Session[]>({ queryKey: ['sessions'] }, (old) => {
  // Updates ALL sessions queries, including filtered ones
})
```

**Improved Solution:**

```typescript
const handleProgressUpdate = useCallback(
  (data: SessionProgressData) => {
    // Update all sessions cache entries
    queryClient.setQueriesData<Session[]>({ queryKey: ['sessions'] }, (old) => {
      if (!old) {
        queryClient.invalidateQueries({ queryKey: ['sessions'] })
        return undefined
      }

      const sessionIndex = old.findIndex((s) => s.id === data.sessionId)
      if (sessionIndex === -1) {
        return old // Don't update if session not in this cache
      }

      const updated = [...old]
      updated[sessionIndex] = {
        ...updated[sessionIndex],
        progress: data.progress,
        currentTask: data.currentTask || updated[sessionIndex].currentTask,
        updatedAt: new Date(),
      }
      return updated
    })

    // Also update individual session detail cache
    queryClient.setQueryData<Session>(['session', data.sessionId], (old) => {
      if (!old) return undefined
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
```

---

### 3. Offline Mode UI Integration

**Confidence:** 85%
**Effort:** 2 days
**Files:** `hooks/useAuth.tsx`, `app/_layout.tsx`

**Issue:** Offline detection exists (`useOffline` hook) but isn't used to prevent critical operations or inform users.

**Solution:**

1. **Prevent login when offline:**

```typescript
// hooks/useAuth.tsx
const login = async () => {
  const netInfo = await NetInfo.fetch()
  if (!netInfo.isConnected) {
    throw new Error('Cannot log in while offline. Please check your internet connection.')
  }
  // ... existing login logic
}
```

2. **Show offline banner:**

```typescript
// app/_layout.tsx
import { useOffline } from '@/hooks/useOffline'

function RootLayoutNav() {
  const { isOffline } = useOffline()

  return (
    <>
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text>You're offline. Some features may not work.</Text>
        </View>
      )}
      <Stack>...</Stack>
    </>
  )
}
```

---

### 4. Test Infrastructure Setup

**Confidence:** 100%
**Effort:** 2-3 days
**Priority:** HIGH (Technical Debt)

**Issue:** Zero test coverage creates significant risk for regressions.

**Action Items:**

1. **Install testing dependencies:**

```bash
npm install --save-dev @testing-library/react-native @testing-library/jest-native jest
```

2. **Priority test files:**
   - `__tests__/services/auth/token-manager.test.ts` - Token expiration, refresh logic
   - `__tests__/services/api/client.test.ts` - Token refresh interceptor, request queueing
   - `__tests__/hooks/useAuth.test.tsx` - Auth flow, error handling
   - `__tests__/services/api/realtime.test.ts` - SSE reconnection, exponential backoff

3. **Test coverage goals:**
   - Auth flows: 90%+
   - API client: 85%+
   - Realtime service: 80%+

---

### 5. SSE Event Listener Memory Leak Prevention

**Confidence:** 75%
**Effort:** 4 hours
**Files:** `services/api/realtime.ts:140-162`

**Issue:** `EventSource.close()` may not remove event listeners in all polyfill implementations.

**Current Cleanup:**

```typescript
private cleanup(): void {
  if (this.eventSource) {
    this.eventSource.close()  // Doesn't explicitly remove listeners
    this.eventSource = null
  }
}
```

**Improved Solution:**

```typescript
private eventListeners = new Map<string, (event: MessageEvent) => void>()

private setupEventListeners(): void {
  if (!this.eventSource) return

  const sessionUpdatedListener = (event: MessageEvent) => {
    this.handleEvent(event, RealtimeEventType.SESSION_UPDATED)
  }
  this.eventListeners.set(RealtimeEventType.SESSION_UPDATED, sessionUpdatedListener)
  this.eventSource.addEventListener(RealtimeEventType.SESSION_UPDATED as never, sessionUpdatedListener)
  // ... repeat for other events
}

private cleanup(): void {
  if (this.eventSource) {
    // Remove all listeners explicitly
    this.eventListeners.forEach((listener, eventType) => {
      this.eventSource?.removeEventListener(eventType as never, listener)
    })
    this.eventListeners.clear()

    this.eventSource.close()
    this.eventSource = null
  }

  if (this.reconnectTimeout) {
    clearTimeout(this.reconnectTimeout)
    this.reconnectTimeout = null
  }
}
```

---

### 6. Sentry Error Tracking Integration

**Confidence:** 95%
**Effort:** 1 day
**Files:** `utils/errorHandler.ts`, `components/ErrorBoundary.tsx`, `app/_layout.tsx`, `package.json`

**Issue:** Error handler infrastructure exists but doesn't send errors to tracking service. Production errors are lost.

**Solution:**

1. **Install Sentry SDK:**

```bash
npm install @sentry/react-native
npx @sentry/wizard -i reactNative
```

2. **Initialize Sentry in app root:**

```typescript
// app/_layout.tsx
import * as Sentry from '@sentry/react-native'

if (!__DEV__) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: __DEV__ ? 'development' : 'production',
  })
}
```

3. **Integrate with error handler:**

```typescript
// utils/errorHandler.ts
import * as Sentry from '@sentry/react-native'

private trackError(error: Error, context?: ErrorContext): void {
  if (!__DEV__) {
    Sentry.captureException(error, {
      extra: context,
      tags: {
        source: context?.source || 'unknown',
      },
    })
  }
}
```

4. **Wrap ErrorBoundary:**

```typescript
// components/ErrorBoundary.tsx
import * as Sentry from '@sentry/react-native'

componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  console.error('ErrorBoundary caught:', error, errorInfo)

  if (!__DEV__) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    })
  }

  if (this.props.onError) {
    this.props.onError(error, errorInfo)
  }
}
```

**Prerequisites:**

- Create Sentry account and obtain DSN
- Add `EXPO_PUBLIC_SENTRY_DSN` to `.env`
- Test error tracking in staging environment first

**Validation:**

- Trigger test error in app
- Verify error appears in Sentry dashboard
- Confirm context (componentStack, source) is captured

---

### 7. Performance - Slow Frame Warnings During Modal Animations

**Confidence:** 75%
**Effort:** 1-2 days
**Files:** `components/session/ApprovalActions.tsx`, `components/PerformanceMonitor.tsx`

**Issue:** Frequent slow frame warnings (20-40 FPS) during modal open/close animations and optimistic updates.

**Observed Warnings:**
```
WARN  🐌 Slow frame detected: 38.4 FPS (26.06ms)
WARN  🐌 Slow frame detected: 21.4 FPS (46.70ms)
```

**Root Causes:**
1. Modal animations + React Query cache updates happening simultaneously
2. 300ms loading state + 800ms mock delay may cause layout thrashing
3. Multiple re-renders during optimistic update flow

**Solutions:**

1. **Use native driver for modal animations:**
```typescript
// ApprovalActions.tsx - Modal animation
<Modal
  animationType="fade"
  transparent
  hardwareAccelerated  // Add this
>
```

2. **Debounce optimistic updates:**
```typescript
// useUpdateSession.ts - Batch state updates
onMutate: async ({ id, request }) => {
  // Use startTransition for non-urgent updates
  startTransition(() => {
    queryClient.setQueriesData(...)
  })
}
```

3. **Profile with React DevTools:**
- Identify which components re-render during mutations
- Add more `memo()` boundaries if needed
- Check if Toast component causes layout shifts

**Priority:** Medium - App is functional but UX could be smoother

---

### 8. Remove Unused why-did-you-render Dependency

**Confidence:** 100%
**Effort:** 5 minutes
**Files:** `package.json`, `components/PerformanceMonitor.tsx`

**Issue:** Warning on every app start due to missing optional dependency.

**Warning:**
```
WARN  ⚠️  Could not initialize why-did-you-render:
[Error: Cannot find module '@welldone-software/why-did-you-render']
```

**Solution:**

Either:
1. **Remove the code** (recommended if not actively debugging):
```bash
# Find and remove why-did-you-render initialization code
grep -r "why-did-you-render" components/
```

2. **Or install the dependency** (if needed for debugging):
```bash
npm install --save-dev @welldone-software/why-did-you-render
```

**Recommendation:** Remove the code - this tool is for React development debugging and shouldn't be in the production codebase unless actively being used.

---

## MEDIUM Priority

### 6. Bundle Size Monitoring

**Confidence:** 80%
**Effort:** 4 hours

**Issue:** No visibility into app bundle size or what's contributing to it.

**Action Items:**

```bash
npm install --save-dev react-native-bundle-visualizer
```

```json
// package.json
{
  "scripts": {
    "analyze:ios": "EXPO_PUBLIC_ANALYZE=true expo export:ios && npx react-native-bundle-visualizer",
    "analyze:android": "EXPO_PUBLIC_ANALYZE=true expo export:android && npx react-native-bundle-visualizer"
  }
}
```

**Monitoring Goals:**

- Track bundle size over time
- Identify large dependencies (consider replacing `axios` with `fetch`)
- Verify tree-shaking is working
- Monitor unused Expo modules

---

### 7. Inconsistent Type Imports

**Confidence:** 80%
**Effort:** 1 hour
**Files:** Multiple

**Issue:** Some files don't use `import type` for type-only imports despite ESLint rule.

**Solution:**

```bash
npm run lint:fix
```

This should auto-fix most instances. Review and commit.

---

### 8. Security Audit Completion

**Confidence:** 95%
**Effort:** 2-3 weeks
**Files:** See `SECURITY_AUDIT_SUMMARY.md`

**Remaining Critical Items (Pre-App Store Submission):**

1. **Missing Privacy Manifest data declarations** - App Store blocker
2. **Missing SSL pinning** - Legitimate security gap
3. **Insecure deep links** - OAuth vulnerability
4. **Code verifier in memory** - PKCE security violation

**Refer to:** `SECURITY_AUDIT_SUMMARY.md` for detailed remediation steps.

---

## Code Quality Observations

### Excellent Patterns to Maintain

✅ **TypeScript Strict Mode** - `tsconfig.json` has `"strict": true`
✅ **Zod Schema Validation** - Comprehensive runtime API validation
✅ **Error Boundary Defense-in-Depth** - Triple-nested error boundaries
✅ **Expo Router File-Based Routing** - Clean navigation structure
✅ **Separation of Concerns** - Services, hooks, components layers
✅ **SecureStore for Tokens** - Proper sensitive data storage
✅ **Mock Data Infrastructure** - Environment-based feature flags
✅ **Pre-commit Hooks** - Husky + lint-staged configured

---

## Minor Code Smells (Low Priority)

### Magic Numbers in SSE Backoff

**File:** `services/api/realtime.ts:219-223`

```typescript
const delay = Math.min(
  this.reconnectionConfig.initialDelay *
    Math.pow(this.reconnectionConfig.backoffMultiplier, this.reconnectAttempts),
  this.reconnectionConfig.maxDelay
)
```

**Recommendation:** Already configurable via `reconnectionConfig`, no action needed.

---

### Unused Error Info Parameter

**File:** `components/ErrorBoundary.tsx:34-46`

```typescript
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  console.error('ErrorBoundary caught:', error, errorInfo)
  // TODO: Send to error tracking service
}
```

**Recommendation:** Integrate error tracking service (Sentry, Bugsnag) when ready.

---

## Completed (For Reference)

✅ **Missing Zod Dependency** - Added `zod@^4.1.13`
✅ **JWT Token Expiration Handling** - `TokenManager.isAuthenticated()` now clears expired tokens
✅ **SecureStore Error Handling** - All operations have try/catch blocks
✅ **Proactive Token Refresh** - API client refreshes 5 minutes before expiration
✅ **Production Debug Logging** - Created `logger` utility, wrapped all `console.log` calls
✅ **Hardcoded Mock User Data** - Replaced with `AuthAPI.getUserProfile()`
✅ **Type Error Fix** - Fixed `performanceMonitor.ts` `setInterval` type

---

## Next Sprint Recommendations

### Sprint Goal: Production Readiness

1. **Week 1:** Complete security audit items (SSL pinning, Privacy Manifest, deep link validation)
2. **Week 2:** Set up test infrastructure + write critical path tests (auth, token refresh)
3. **Week 3:** Add global error handling, fix React Query cache race conditions
4. **Week 4:** Bundle size optimization, offline mode UI, final QA

---

---

## Future Implementation (From Initial Planning)

These items represent the original roadmap for the ACP Mobile app:

### Production Backend Integration

1. **OAuth with Red Hat SSO** - Replace mock authentication with real OAuth flow
2. **ACP Backend API Connection** - Connect to production API for sessions and repositories
3. **GitHub OAuth + Notifications** - Implement GitHub integration for notifications
4. **Push Notifications** - Firebase Cloud Messaging / Apple Push Notification Service
5. **Data Persistence** - Implement robust offline storage (AsyncStorage/SQLite)
6. **Real-time Updates** - Complete SSE implementation (partially done)
7. **Error Handling** - Comprehensive error handling and loading states
8. **TestFlight / Google Play Internal Testing** - Beta testing program
9. **App Store / Google Play Submission** - Production release

### Migration from Mockup

The initial implementation used a single-file mockup (`app/(tabs)/index.tsx`, ~1800 lines) with StyleSheet for all styling. This has been refactored into a proper component-based architecture.

---

**Backlog Maintained By:** Code Review Agent
**Last Updated:** 2025-11-26
**Review Frequency:** After each major feature/sprint
