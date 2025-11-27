# Test Infrastructure Summary

## Overview

The acp-mobile project has a comprehensive test infrastructure using Jest and React Native Testing Library. As of Phase 10.3, we have **161 passing tests** with **8 passing test suites** out of 14 total.

## Test Configuration

### Core Tools

- **Jest**: Test runner with `jest-expo` preset
- **React Native Testing Library**: Component testing utilities
- **Axios Mock Adapter**: HTTP request mocking
- **Jest Fetch Mock**: Fetch API mocking

### Configuration Files

- `jest.config.js`: Main Jest configuration
- `jest.setup.ts`: Global test setup and mocks
- `__mocks__/@sentry/react-native.ts`: Sentry SDK mock

### Key Settings

```javascript
{
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
}
```

## Test Organization

### Directory Structure

```
__tests__/
  utils/
    deepLinking.test.ts
    deepLinkAnalytics.test.ts

hooks/
  __tests__/
    useAuth.test.tsx

services/
  api/
    __tests__/
      client.test.ts
      realtime.test.ts
      repositories.test.ts
      sessions-helper.test.ts
  auth/
    __tests__/
      token-manager.test.ts

components/
  session/
    __tests__/
      ModelSelector.test.tsx
      RepositoryPicker.test.tsx
      WorkflowTypeGrid.test.tsx

app/
  sessions/
    __tests__/
      new.test.tsx

utils/
  __tests__/
    errorHandler.test.ts
```

## Global Mocks

The following modules are mocked globally in `jest.setup.ts`:

### Expo Modules

- **expo-secure-store**: Mock storage for tokens
- **expo-constants**: Mock app configuration

### React Native Modules

- **@react-native-community/netinfo**: Mock network connectivity

### Third-Party SDKs

- **@sentry/react-native**: Mock error tracking (added in Phase 10.2)

## Test Coverage

### Current Status (Phase 10.3)

| Category   | Current | Target | Status          |
| ---------- | ------- | ------ | --------------- |
| Statements | 20.23%  | 80%    | ❌ Below target |
| Branches   | 15.6%   | 75%    | ❌ Below target |
| Lines      | 20.79%  | 80%    | ❌ Below target |
| Functions  | 18.92%  | 80%    | ❌ Below target |

### Well-Covered Areas

- **services/api/repositories.ts**: 100% coverage
- **components/session/ModelSelector.tsx**: 100% coverage
- **components/session/RepositoryPicker.tsx**: 100% coverage
- **components/session/WorkflowTypeGrid.tsx**: 100% coverage
- **services/api/client.ts**: 90% coverage (excellent token refresh testing)
- **utils/deepLinkAnalytics.ts**: 98% coverage

### Areas Needing Coverage

- **hooks/**: 4.96% coverage
  - useChat, useNotifications, useRealtimeSession, useSessions: 0%
  - useOffline, useTheme, useToast: 0%
- **components/**: 0% coverage (except session components)
  - ErrorBoundary, PerformanceMonitor: 0%
  - UI components: OfflineBanner, ErrorMessage, Toast: 0%
  - Layout components: Header, FAB, CreateFAB: 0%
- **services/storage/**: 0% coverage
  - preferences.ts, cache.ts: 0%
- **services/monitoring/sentry.ts**: 39% coverage
- **utils/**: 31% coverage
  - fpsMonitor, performanceMonitor, renderTracker: 0%

## Test Patterns

### Hook Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react-native'
import { useAuth, AuthProvider } from '../useAuth'

describe('useAuth', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  it('loads authenticated user on mount', async () => {
    const mockUser = { id: '1', email: 'test@example.com' }
    ;(TokenManager.isAuthenticated as jest.Mock).mockResolvedValue(true)
    ;(AuthAPI.getUserProfile as jest.Mock).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)
  })
})
```

### API Client Testing

```typescript
import MockAdapter from 'axios-mock-adapter'
import { apiClient } from '../client'

describe('API Client', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(apiClient.getInstance())
    jest.clearAllMocks()
  })

  afterEach(() => {
    mock.restore()
  })

  it('refreshes token on 401 and retries original request', async () => {
    mock.onGet('/sessions').replyOnce(401)
    mock.onPost('/auth/refresh').replyOnce(200, {
      accessToken: 'new-token',
      refreshToken: 'new-refresh',
    })
    mock.onGet('/sessions').replyOnce(200, { sessions: [] })

    const response = await apiClient.get('/sessions')

    expect(response).toEqual({ sessions: [] })
    expect(TokenManager.setTokens).toHaveBeenCalled()
  })
})
```

### Component Testing

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { ModelSelector } from '../ModelSelector'

describe('ModelSelector', () => {
  const mockOnSelect = jest.fn()

  it('calls onSelect when model option is tapped', async () => {
    const { getByText } = render(
      <ModelSelector selectedModel="sonnet-4.5" onSelect={mockOnSelect} />
    )

    fireEvent.press(getByText('Opus'))

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith('opus')
    })
  })
})
```

## Running Tests

### All Tests

```bash
npm test
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

### Validation Suite (All Checks)

```bash
npm run validate
```

This runs:

1. Type checking (`tsc --noEmit`)
2. Linting (`npm run lint`)
3. Format checking (`npm run format:check`)
4. All tests (`npm test`)

## Known Issues

### Component Style Tests

Some component tests check for exact style objects, which can be fragile. These tests fail when:

- Style props are undefined (e.g., `disabled`, `activeOpacity`)
- Style arrays have different ordering
- Dynamic styles are applied

**Example failure**:

```typescript
// ❌ Fragile test - checks exact style object
expect(component.props.style).toContainEqual(expect.objectContaining({ borderColor: '#6366f1' }))

// ✅ Better approach - check behavior or visual snapshot
expect(component.props.onPress).toBeDefined()
```

**Recommendation**: Replace brittle style assertions with:

1. **Behavior testing**: Test that interactions work correctly
2. **Snapshot testing**: Capture full component output
3. **Accessibility testing**: Check ARIA labels and roles

### React Icon Act() Warnings

Some tests show `act()` warnings from @expo/vector-icons loading asynchronously. This is a known issue with icon libraries in test environments and does not affect actual functionality.

## Test Infrastructure Improvements (Phase 10.3)

### Completed

1. ✅ Added Sentry mock to support Phase 10.2 error tracking
2. ✅ Created `__mocks__/@sentry/react-native.ts` for proper module mocking
3. ✅ Verified 161 tests passing (82.9% pass rate)
4. ✅ Documented test infrastructure and coverage gaps

### Recommendations for Future Work

1. **Increase hook coverage**: Add tests for useOffline, useTheme, useToast, useNotifications
2. **Component testing**: Add tests for ErrorBoundary, OfflineBanner, ErrorMessage, Toast
3. **Storage testing**: Add tests for PreferencesService and CacheService
4. **Performance monitoring testing**: Add tests for fpsMonitor, performanceMonitor, renderTracker
5. **Fix fragile style tests**: Replace exact style matching with behavior or snapshot tests
6. **Integration tests**: Add end-to-end flows for critical user journeys

## Best Practices

### Do's ✅

- Use `renderHook` with providers for context-dependent hooks
- Mock external dependencies (APIs, storage, native modules)
- Use `waitFor` for async state changes
- Clean up mocks in `beforeEach`/`afterEach`
- Test behavior, not implementation details
- Use descriptive test names

### Don'ts ❌

- Don't test exact style objects (fragile)
- Don't rely on component internals (use public API)
- Don't mock React itself
- Don't skip cleanup (causes test pollution)
- Don't test third-party library behavior

## CI/CD Integration

Tests run automatically:

1. **Pre-commit**: Via Husky hooks (lint-staged)
2. **CI Pipeline**: Should run `npm run validate` on PRs

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
