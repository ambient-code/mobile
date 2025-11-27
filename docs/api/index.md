# API Reference

Complete API documentation for the ACP Mobile codebase.

## Auto-Generated API Documentation

!!! note "TypeDoc Generation Required"
TypeDoc documentation has not been generated yet. Run `npm run docs:api` to generate the complete API reference from TypeScript source code.

TypeDoc will generate comprehensive API documentation including:

- All public classes, interfaces, and types
- Function signatures and parameters
- Return types and descriptions
- Usage examples from code comments
- Cross-references between related APIs

## Quick Reference

### Core Services

#### Authentication

- **[TokenManager](generated/classes/services_auth_token_manager.TokenManager.html)** - Secure token storage and management
- **[OAuthService](generated/classes/services_auth_oauth.OAuthService.html)** - OAuth 2.0 + PKCE authentication flow
- **[AuthAPI](generated/classes/services_api_auth.AuthAPI.html)** - Authentication API client

#### API Clients

- **[APIClient](generated/classes/services_api_client.APIClient.html)** - HTTP client with token refresh
- **[SessionsAPI](generated/classes/services_api_sessions.SessionsAPI.html)** - Session management API
- **[RealtimeService](generated/classes/services_api_realtime.RealtimeService.html)** - Server-Sent Events for real-time updates

#### Storage

- **[CacheService](generated/classes/services_storage_cache.CacheService.html)** - AsyncStorage wrapper for caching

### Custom Hooks

#### Authentication & User

- **[useAuth](generated/functions/hooks_useAuth.useAuth.html)** - Authentication state and methods
- **[useOffline](generated/functions/hooks_useOffline.useOffline.html)** - Network connectivity status

#### Sessions

- **[useSessions](generated/functions/hooks_useSessions.useSessions.html)** - Session list with React Query
- **[useRealtimeSession](generated/functions/hooks_useRealtimeSession.useRealtimeSession.html)** - SSE integration for real-time updates

#### UI State

- **[useTheme](generated/functions/hooks_useTheme.useTheme.html)** - Theme (light/dark) management
- **[useToast](generated/functions/hooks_useToast.useToast.html)** - Toast notifications

### Components

#### Session Components

- **[SessionCard](generated/functions/components_session_SessionCard.SessionCard.html)** - Session card with progress
- **[SessionProgress](generated/functions/components_session_SessionProgress.SessionProgress.html)** - Progress bar
- **[StatusBadge](generated/functions/components_session_StatusBadge.StatusBadge.html)** - Session status badge
- **[ModelBadge](generated/functions/components_session_ModelBadge.ModelBadge.html)** - AI model badge

#### UI Components

- **[Badge](generated/functions/components_ui_Badge.Badge.html)** - Generic badge component
- **[Toast](generated/functions/components_ui_Toast.Toast.html)** - Toast notification component

#### Layout Components

- **[Header](generated/functions/components_layout_Header.Header.html)** - Screen header
- **[LoadingSpinner](generated/functions/components_layout_LoadingSpinner.LoadingSpinner.html)** - Loading indicator

### Type Definitions

#### Core Types

- **[Session](generated/interfaces/types_session.Session.html)** - Session data structure
- **[User](generated/interfaces/types_user.User.html)** - User profile structure
- **[OAuthTokens](generated/interfaces/types_auth.OAuthTokens.html)** - OAuth token structure

#### Realtime Types

- **[RealtimeEvent](generated/interfaces/types_realtime.RealtimeEvent.html)** - SSE event structure
- **[SessionProgressData](generated/interfaces/types_realtime.SessionProgressData.html)** - Progress update payload
- **[SessionUpdatedData](generated/interfaces/types_realtime.SessionUpdatedData.html)** - Session update payload

### Utilities

- **[logger](generated/variables/utils_logger.logger.html)** - Logging utility (dev only)
- **[constants](generated/modules/utils_constants.html)** - App constants and config
- **[mockData](generated/modules/utils_mockData.html)** - Mock data for development

## Building the Documentation

### Generate TypeDoc

```bash
npm run docs:api
```

This generates markdown documentation in `docs/api/generated/`.

### View Locally

```bash
npm run docs:serve
```

Then visit <http://localhost:8000/api>

### Deploy to GitHub Pages

```bash
npm run docs:deploy
```

## Code Documentation Guidelines

### TypeScript Comments

Use TSDoc format for documenting code:

````typescript
/**
 * Fetches active sessions from the API.
 *
 * @param filters - Optional filters for session status
 * @returns Promise resolving to array of Session objects
 * @throws {APIError} When the API request fails
 *
 * @example
 * ```typescript
 * const sessions = await SessionsAPI.getSessions({ status: 'running' })
 * console.log(`Found ${sessions.length} running sessions`)
 * ```
 */
export async function getSessions(filters?: SessionFilters): Promise<Session[]> {
  // Implementation
}
````

### Documenting Components

````typescript
/**
 * Session card component displaying session info and progress.
 *
 * @param props - Component props
 * @param props.session - Session data to display
 * @param props.onPress - Optional callback when card is tapped
 *
 * @example
 * ```tsx
 * <SessionCard
 *   session={session}
 *   onPress={() => router.push(`/sessions/${session.id}`)}
 * />
 * ```
 */
export function SessionCard({ session, onPress }: SessionCardProps) {
  // Implementation
}
````

### Documenting Hooks

````typescript
/**
 * Hook for managing authentication state.
 *
 * Provides methods for login, logout, and tracks authentication status.
 * Automatically refreshes tokens before expiration.
 *
 * @returns Authentication state and methods
 *
 * @example
 * ```tsx
 * function LoginScreen() {
 *   const { login, isAuthenticated, isLoading } = useAuth()
 *
 *   if (isAuthenticated) {
 *     return <Redirect to="/dashboard" />
 *   }
 *
 *   return <Button onPress={login}>Sign In</Button>
 * }
 * ```
 */
export function useAuth() {
  // Implementation
}
````

## Additional Resources

- [TypeDoc Documentation](https://typedoc.org/)
- [TSDoc Specification](https://tsdoc.org/)
- [Architecture Overview](../architecture/overview.md)
- [Contributing Guide](../../CONTRIBUTING.md)

---

**Note**: The TypeDoc API documentation is generated automatically from source code comments. To update it, run `npm run docs:api` after making code changes.
