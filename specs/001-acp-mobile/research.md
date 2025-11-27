# Research & Technology Decisions: ACP Mobile

**Feature**: 001-acp-mobile
**Date**: 2025-11-26
**Purpose**: Resolve technical unknowns from planning phase

## Research Questions

From Technical Context, we need to clarify:

1. E2E testing approach (Detox vs Maestro vs manual)
2. REST API endpoint structure and authentication flow details
3. Real-time updates mechanism (WebSocket vs polling)
4. Push notification strategy (FCM vs APNS direct)
5. GitHub integration approach (OAuth flow, rate limits, webhook vs polling)

---

## Decision 1: E2E Testing Framework

**Decision**: Maestro for E2E testing

**Rationale**:

- **Maestro advantages**: Simple YAML-based test definitions, works on physical devices and simulators, no code required, excellent for mobile flows, free and open source
- **Detox rejected**: Requires JavaScript test code (more complexity), primarily supports simulators (physical device support limited), steeper learning curve
- **Manual testing approach**: Insufficient for regression testing, doesn't scale, error-prone

**Implementation**:

- Use Maestro for critical user flows (login, session creation, review flow)
- Jest + React Native Testing Library for component/unit tests
- Manual exploratory testing for UX polish

**Alternatives considered**:

- Detox: More powerful but overkill for our needs, harder to maintain
- Appium: Cross-platform but heavy setup, better for apps with web views
- Manual only: Fast initially but unsustainable as app grows

---

## Decision 2: REST API Structure & Authentication

**Decision**: OAuth 2.0 with PKCE flow for Red Hat SSO, JWT bearer tokens for API authorization

**REST API Endpoint Structure** (based on ACP platform analysis):

```
Base URL: https://ambient-code.apps.rosa.vteam-stage.7fpc.p3.openshiftapps.com/api/v1

Authentication:
- POST /auth/login          # Initiate OAuth flow
- POST /auth/token          # Exchange authorization code for tokens
- POST /auth/refresh        # Refresh access token

Sessions:
- GET /sessions             # List all sessions (supports ?status=running filter)
- GET /sessions/{id}        # Get session details
- POST /sessions            # Create new session
- PATCH /sessions/{id}      # Update session (approve/reject review)
- GET /sessions/{id}/logs   # Get session execution logs

Notifications:
- GET /notifications        # GitHub notifications (supports ?unread=true filter)
- PATCH /notifications/{id} # Mark as read
- POST /notifications/{id}/mute # Mute thread

Repositories:
- GET /repos                # Connected repositories
- POST /repos               # Add repository
- DELETE /repos/{id}        # Remove repository

Chat:
- POST /chat                # Send message to Claude
- GET /chat/{thread_id}     # Get conversation history

User:
- GET /user/profile         # Current user info
- PATCH /user/preferences   # Update preferences
```

**Authentication Flow**:

1. Mobile app opens Red Hat SSO in browser (expo-auth-session)
2. User authenticates with corporate credentials
3. SSO redirects back with authorization code
4. Mobile app exchanges code for access/refresh tokens (PKCE for security)
5. Store tokens securely in Expo SecureStore (encrypted keychain)
6. Include access token in `Authorization: Bearer {token}` header for all API calls
7. Refresh token when access token expires (before 401 response or proactively at 80% lifetime)

**Token Management**:

- Access token TTL: 15 minutes
- Refresh token TTL: 7 days
- Automatic refresh via interceptor when access token expires
- Logout clears all tokens and redirects to login

**Rationale**:

- OAuth with PKCE is mobile security best practice (prevents authorization code interception)
- JWT bearer tokens are stateless, scalable, and standard for REST APIs
- Expo SecureStore provides platform-native secure storage (iOS Keychain, Android Keystore)
- Short access token TTL limits exposure, refresh token enables seamless UX

**Alternatives considered**:

- Session cookies: Not suitable for mobile (CSRF concerns, cookie handling complexity)
- Basic auth: Insecure for mobile, no SSO integration
- OAuth implicit flow: Deprecated due to security vulnerabilities

---

## Decision 3: Real-Time Updates Strategy

**Decision**: Hybrid approach - Long polling for session updates, Push notifications for critical events

**Implementation**:

- **Long polling**: Poll `/sessions` endpoint every 5 seconds when dashboard is active, 30 seconds when backgrounded
- **Push notifications**: Server sends APNS/FCM notifications for:
  - Session completion (awaiting review)
  - Session errors (blocking)
  - GitHub mentions (review requests)
- **Optimistic updates**: Update UI immediately on user actions, reconcile with server response
- **Offline queue**: Queue write operations when offline, sync when connection restored

**Rationale**:

- WebSockets rejected for mobile due to connection stability issues (cellular networks, app backgrounding)
- Long polling provides good-enough real-time UX without WebSocket complexity
- Push notifications ensure critical events never missed even when app is closed
- Battery efficient: infrequent polling + server-initiated notifications for urgent items

**Battery/Performance Optimization**:

- Stop polling when app is backgrounded for >1 minute
- Resume polling on app foreground
- Use exponential backoff on network errors
- Cache responses to reduce unnecessary re-fetching

**Alternatives considered**:

- WebSockets: Better real-time but unreliable on mobile (reconnection complexity, battery drain)
- Server-Sent Events (SSE): Similar WebSocket issues on mobile
- Aggressive polling (1s interval): Battery drain, server load, wasteful
- Push-only: Miss updates when user is actively using app

---

## Decision 4: Push Notification Strategy

**Decision**: Expo Push Notifications (abstracts FCM/APNS) with local notification handling

**Implementation**:

- **Expo Push Notification Service**: Handles cross-platform complexity (FCM for Android, APNS for iOS)
- **Registration flow**:
  1. Request permission on first launch or from Settings
  2. Get Expo Push Token
  3. Send token to ACP backend: `POST /user/push-token`
  4. Backend stores token associated with user
- **Backend sends notifications**: Backend calls Expo Push API with user's token when events occur
- **Mobile handles notification**:
  - Foreground: Show in-app banner
  - Background/Killed: OS displays notification
  - Tap notification: Deep link to relevant screen (session detail, notification detail)

**Notification Payload** (from backend):

```json
{
  "to": "ExponentPushToken[xxxxxx]",
  "title": "Session Complete",
  "body": "platform Review is awaiting your approval",
  "data": {
    "type": "session_complete",
    "sessionId": "abc123",
    "deepLink": "acp://sessions/abc123"
  },
  "sound": "default",
  "priority": "high"
}
```

**Deep Link Handling**:

- Configure Expo app scheme: `acp://`
- Use Expo Linking to parse URLs
- Navigate to appropriate screen based on deep link

**Rationale**:

- Expo Push simplifies cross-platform notifications (no separate FCM/APNS integration)
- Free tier supports ACP's user volume
- Built-in support for deep linking
- Consistent notification format across platforms

**Alternatives considered**:

- Native FCM + APNS: More control but 2x development effort, harder to maintain
- OneSignal/Firebase: Third-party dependency, potential cost at scale
- No push notifications: Misses critical updates when app closed, poor UX

---

## Decision 5: GitHub Integration Strategy

**Decision**: GitHub OAuth + REST API polling for notifications, with intelligent rate limit management

**GitHub OAuth Flow**:

1. User initiates GitHub connection from Settings
2. Mobile app opens GitHub OAuth in browser: `https://github.com/login/oauth/authorize?client_id={id}&scope=notifications,repo`
3. User authorizes app
4. GitHub redirects with authorization code
5. Backend exchanges code for GitHub access token (keeps token server-side for security)
6. Mobile app receives success confirmation

**Token Storage**: Backend stores GitHub token, not mobile app (security best practice)

**Notification Fetching**:

- Backend polls GitHub API: `GET /notifications` (once per minute)
- Backend caches notifications, exposes via ACP API: `GET /api/v1/notifications`
- Mobile app fetches from ACP API (not directly from GitHub)
- Use `If-Modified-Since` header to reduce GitHub API calls

**Rate Limit Strategy** (GitHub: 5000 req/hour authenticated):

- Backend manages rate limits, not mobile app
- Cache GitHub responses (5 minute TTL for notifications)
- Use conditional requests (`If-Modified-Since`, `If-None-Match`)
- Monitor `X-RateLimit-Remaining` header, throttle when low
- Fallback: If rate limited, show cached data + banner "Updates delayed due to rate limits"

**Workflow Suggestion Mapping** (implemented in mobile app):

```typescript
const workflowMap = {
  pull_request: 'Review',
  pull_request_review: 'Review',
  issue: 'Bugfix',
  issue_comment: 'Chat',
  commit_comment: 'Review',
  mention: 'Chat',
  release: 'Research',
  security_alert: 'Bugfix',
}
```

**Rationale**:

- Backend polling GitHub is more efficient than mobile (single poll serves all users)
- Keeping GitHub token server-side prevents token leakage if mobile app compromised
- Rate limit management centralized at backend avoids mobile-side complexity
- Conditional requests minimize GitHub API usage

**Alternatives considered**:

- GitHub webhooks: Requires public endpoint, backend already exists, webhooks are overkill
- Mobile polls GitHub directly: Rate limits exhausted quickly, token security risk
- Real-time sync: Unnecessary, notifications can tolerate 1-minute delay

---

## Technology Stack Summary

### Frontend (Mobile App)

- **Framework**: React Native 0.76 + Expo SDK 52
- **Language**: TypeScript 5.x
- **Routing**: Expo Router (file-based)
- **State Management**: React Context + hooks (no Redux - app state is simple)
- **HTTP Client**: Axios with interceptors for auth
- **Storage**: Expo SecureStore (tokens), AsyncStorage (preferences/cache)
- **Push Notifications**: Expo Push Notifications
- **Testing**: Jest + React Native Testing Library (unit/integration), Maestro (E2E)

### Backend Integration

- **API**: ACP Go backend (existing)
- **Auth**: OAuth 2.0 + PKCE (Red Hat SSO)
- **Real-time**: Long polling + Push notifications
- **GitHub**: OAuth (backend-managed), REST API polling

### Development Tools

- **Package Manager**: npm (standard for React Native)
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode
- **CI/CD**: GitHub Actions (lint, test, build)

### Deployment

- **iOS**: Apple Developer Account → TestFlight → App Store
- **Android**: Google Play Console → Internal Testing → Production
- **OTA Updates**: Expo Updates (push JS bundle updates without app store review)

---

## Open Questions for Backend Team

1. **API Endpoints**: Do the endpoints listed in Decision 2 match actual ACP backend? Need OpenAPI spec.
2. **Token TTLs**: Confirm access token (15min) and refresh token (7d) lifetimes.
3. **Push Token Storage**: Does backend support `POST /user/push-token` to store Expo tokens?
4. **GitHub Integration**: Does backend poll GitHub and expose notifications via `/api/v1/notifications`, or should mobile poll GitHub directly?
5. **Rate Limits**: Any backend-side rate limiting mobile apps need to respect?
6. **Session Real-time**: Does backend support WebSocket connections, or should mobile use polling?

**Next Step**: Schedule API design meeting with backend team to align on contracts.
