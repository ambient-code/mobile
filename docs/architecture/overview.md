# Architecture Overview

## Project Overview

ACP Mobile is a mobile companion app for the Ambient Code Platform (ACP) - a Kubernetes-native AI automation platform for software development. The app allows users to monitor AI coding sessions, review work, manage notifications, and interact with Claude directly from their mobile device.

## Technology Stack

### Mobile Framework

- **Framework**: React Native 0.76 with Expo SDK 52
- **Routing**: Expo Router (file-based routing)
- **Styling**: NativeWind 4 / StyleSheet
- **Language**: TypeScript 5.x
- **Icons**: @expo/vector-icons (Feather) + react-native-svg for custom icons
- **State Management**: React Context + TanStack Query
- **Storage**: Expo SecureStore + AsyncStorage

### Target Platforms

- **iOS**: iPhone 14 (primary test device)
- **Android**: Modern Android devices

## ACP Platform Architecture

The ACP Mobile app integrates with the broader ACP platform ecosystem:

### Backend Services

- **Frontend**: NextJS web application
- **Backend**: Go API server
- **GitHub Repository**: <https://github.com/ambient-code/platform>
- **API Endpoint**: <https://ambient-code.apps.rosa.vteam-stage.7fpc.p3.openshiftapps.com>
- **Authentication**: OAuth-proxy via Red Hat SSO

### Integration Points

1. **Authentication**: Red Hat SSO OAuth 2.0 + PKCE flow
2. **Session Management**: RESTful API for session CRUD operations
3. **Real-time Updates**: Server-Sent Events (SSE) for live session progress
4. **GitHub Integration**: Notifications and repository access via OAuth

## Mobile App Architecture

### Layer Structure

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Screens, Components, Navigation)      │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│          Business Logic Layer           │
│    (Hooks, State Management)            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│          Services Layer                 │
│  (API Clients, Auth, Storage, SSE)      │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         Infrastructure Layer            │
│  (HTTP Client, SecureStore, Cache)      │
└─────────────────────────────────────────┘
```

### Key Components

#### Presentation Layer

- **Expo Router**: File-based routing for screens
- **Screen Components**: Dashboard, Sessions, Session Detail, Settings
- **UI Components**: Reusable components (cards, badges, progress bars)
- **Layout Components**: Headers, navigation, modals

#### Business Logic Layer

- **Custom Hooks**:
  - `useAuth` - Authentication state and flow
  - `useSessions` - Session list management with React Query
  - `useRealtimeSession` - SSE integration for real-time updates
  - `useOffline` - Network state detection
  - `useTheme` - Theme switching (light/dark)
- **React Context**: Auth context, Theme context

#### Services Layer

- **API Services**:
  - `AuthAPI` - OAuth flow, token management, user profile
  - `SessionsAPI` - Session CRUD operations
  - `RealtimeService` - SSE connection management
- **Storage Services**:
  - `TokenManager` - Secure token storage with expiration handling
  - `CacheService` - AsyncStorage wrapper for session caching

#### Infrastructure Layer

- **API Client**: Axios-based HTTP client with token refresh interceptor
- **SecureStore**: Encrypted storage for sensitive data (tokens)
- **AsyncStorage**: Unencrypted storage for cached data
- **React Query**: Server state caching and synchronization

## Authentication Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Mobile  │         │ OAuth    │         │   ACP    │
│   App    │         │  Proxy   │         │   API    │
└──────────┘         └──────────┘         └──────────┘
     │                     │                     │
     │  1. Login Request   │                     │
     │────────────────────>│                     │
     │                     │                     │
     │  2. OAuth Challenge │                     │
     │<────────────────────│                     │
     │                     │                     │
     │  3. User Authorizes │                     │
     │────────────────────>│                     │
     │                     │                     │
     │  4. Auth Code       │                     │
     │<────────────────────│                     │
     │                     │                     │
     │  5. Exchange Code   │                     │
     │────────────────────>│                     │
     │                     │                     │
     │  6. Access Token    │                     │
     │<────────────────────│                     │
     │                     │                     │
     │  7. API Request     │                     │
     │────────────────────────────────────────>│
     │                     │                     │
     │  8. API Response    │                     │
     │<────────────────────────────────────────│
```

### Token Management

- **Access Token**: Short-lived, stored in SecureStore
- **Refresh Token**: Long-lived, stored in SecureStore
- **Auto-refresh**: Triggers 5 minutes before token expiration
- **Expiration Handling**: Automatic logout on expired tokens

## Real-time Updates Architecture

### Server-Sent Events (SSE)

The app uses SSE for real-time session progress updates:

```
┌──────────┐                    ┌──────────┐
│  Mobile  │                    │   ACP    │
│   App    │                    │   API    │
└──────────┘                    └──────────┘
     │                               │
     │  1. Open SSE Connection       │
     │──────────────────────────────>│
     │                               │
     │  2. Session Progress Event    │
     │<──────────────────────────────│
     │                               │
     │  3. Update React Query Cache  │
     │  (No HTTP refetch required)   │
     │                               │
     │  4. Session Updated Event     │
     │<──────────────────────────────│
     │                               │
     │  5. Update React Query Cache  │
     │                               │
```

### Event Types

- `session.progress` - Progress percentage and current task updates
- `session.updated` - Incremental session data changes
- `session.status` - Status transitions (running → paused → done)

### Reconnection Strategy

- **Exponential Backoff**: 1s, 2s, 4s, 8s, ..., max 30s
- **Automatic Retry**: Reconnects on disconnect
- **Connection State UI**: Visual indicator with manual retry button

## Data Flow

### Session List View

```
User Action → useAuth hook → TokenManager (validate)
    ↓
useSessions hook → React Query → API Client → Sessions API
    ↓
React Query Cache ← SSE Updates (RealtimeService)
    ↓
UI Re-render (SessionCard components)
```

### Offline Support

```
API Request → Network Check (useOffline)
    ↓
If Online: Fetch from API → Update Cache
    ↓
If Offline: Read from Cache → Show stale data indicator
```

## Security Architecture

### Data Storage

- **Sensitive Data** (tokens, credentials): SecureStore (encrypted)
- **Cached Data** (sessions): AsyncStorage (unencrypted, non-sensitive)
- **Never Store**: Passwords, code verifiers in plain text

### API Security

- **HTTPS Only**: All API requests use TLS
- **Token-based Auth**: OAuth 2.0 access tokens
- **Certificate Pinning**: Planned (not yet implemented)
- **Input Validation**: Zod schema validation on all API responses

### OWASP Mobile Top 10 Compliance

See [Security Best Practices](../security/best-practices.md) for detailed compliance information.

## Performance Considerations

### React Query Caching Strategy

- **Stale Time**: 5 minutes for session list
- **Cache Time**: 30 minutes for session details
- **Refetch on Focus**: Disabled (relies on SSE updates)
- **Optimistic Updates**: Direct cache mutations from SSE events

### Network Optimization

- **Conditional Requests**: Use `If-None-Match` headers
- **Request Deduplication**: React Query deduplicates concurrent requests
- **Background Refetch**: Disabled when app is backgrounded

### UI Performance

- **FlatList Virtualization**: For long session lists
- **Memoization**: `useMemo` and `useCallback` for expensive computations
- **Lazy Loading**: Code splitting for heavy screens (planned)

## Build Requirements

### Development

- **Mac with Xcode** for iOS builds
- **Node.js 20+**
- **Expo Go app** for rapid testing on physical devices

### Production

- **Apple Developer Account** ($99/year) for App Store submission
- **Google Play Developer Account** ($25 one-time) for Android submission
- **Expo Application Services (EAS)** for over-the-air (OTA) updates

## Deployment Architecture

```
┌─────────────────┐
│   Developer     │
│   Pushes Code   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  GitHub Actions │
│  CI/CD Pipeline │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   EAS Build     │
│   (iOS/Android) │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  App Store /    │
│  Google Play    │
└─────────────────┘
```

## Future Architecture Considerations

### Planned Enhancements

1. **Push Notifications**: Firebase Cloud Messaging (FCM)
2. **Offline-First**: Local-first architecture with sync
3. **Code Splitting**: Lazy load heavy features
4. **Background Sync**: Sync data while app is backgrounded
5. **Deep Linking**: Universal Links for iOS, App Links for Android

### Scalability

- **Pagination**: Implement cursor-based pagination for large session lists
- **Virtual Scrolling**: For extremely long lists (1000+ items)
- **Image Optimization**: Lazy load images, use CDN
- **Bundle Splitting**: Code split by feature for faster initial load

---

For more details on specific architectural decisions, see:

- [Design System](../design/design-system.md)
- [Security Best Practices](../security/best-practices.md)
- [Performance Monitoring](../performance/monitoring.md)
