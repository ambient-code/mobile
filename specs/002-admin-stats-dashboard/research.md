# Research: Admin Statistics Dashboard

**Feature**: 002-admin-stats-dashboard
**Date**: 2025-11-27
**Status**: Completed

This document resolves all "NEEDS CLARIFICATION" items from the Technical Context section of plan.md.

## 1. PostHog Integration

### Decision
Use **Personal API Keys** for backend proxy endpoints + **Project API Key** for standard event tracking via React Native SDK.

### Rationale
- **Project API Keys** are designed for public POST-only endpoints (event tracking) and are already integrated in the mobile app (posthog-react-native: ^4.14.0)
- **Personal API Keys** provide organization-level access to private GET endpoints required for querying analytics (DAU/MAU, platform stats, time-series data)
- Personal API Keys have rate limits: Query endpoint 120/hour, analytics endpoints 240/minute and 1200/hour
- Personal API Keys must NEVER be exposed in mobile apps due to org-level access concerns

### Implementation Approach
**Backend proxy pattern** (see Section 5):
- Mobile app uses existing Project API Key for event tracking
- Admin dashboard queries go through ACP backend endpoints (`/api/admin/analytics/*`)
- Backend uses Personal API Key to query PostHog's Query API

### API Query Patterns

**HogQL Query API for time-series data:**
```typescript
// POST /api/projects/:project_id/query/
{
  "query": {
    "kind": "HogQLQuery",
    "query": "SELECT properties.$os, count(*) FROM events WHERE event = 'app_opened' GROUP BY properties.$os"
  },
  "after": "2024-01-01T00:00:00",
  "before": "2024-01-01T23:59:59"
}
```

**DAU/MAU Calculation:**
- Create insight with series aggregated by "unique users" (DAU) and "monthly active users" (MAU)
- Use formula mode with A/B to calculate stickiness ratio
- Filter by `$device_type`, `$os`, `$browser` for platform-specific metrics

### Authentication
```typescript
// Backend to PostHog
headers: {
  'Authorization': 'Bearer <personal_api_key>'
}
```

### Alternatives Considered
- ❌ **Direct API calls from mobile**: Rejected due to Personal API Key security concerns (org-level access)
- ❌ **SDK methods only**: PostHog React Native SDK doesn't expose analytics query methods, only event capture

## 2. Sentry Integration

### Decision
Use **Sentry REST API with Auth Tokens** via backend proxy for fetching error metrics and performance data.

### Rationale
- **DSN (Data Source Name)** is for sending errors TO Sentry from the SDK, not for querying data
- **Auth Tokens** (Bearer tokens) are required for reading organization statistics and project metrics via REST API
- Sentry React Native SDK (~7.2.0 in package.json) handles error capture, not analytics queries
- API provides comprehensive endpoints for all required metrics

### Authentication Approach
Create **Internal Integration for Organization Token**:
```typescript
headers: {
  'Authorization': 'Bearer <auth_token>'
}
```

### API Endpoints for Admin Dashboard

**Error Rate & Breakdown:**
```bash
GET https://sentry.io/api/0/projects/{org_slug}/{project_slug}/stats/
# Query parameter: stat = "received" | "rejected"
# Supports resolution: 10s, 1h, 1d
```

**Top Errors:**
```bash
GET https://sentry.io/api/0/projects/{org_slug}/{project_slug}/issues/
```

**Performance/Latency Metrics:**
```bash
GET https://sentry.io/api/0/organizations/{org_slug}/sessions/
```

### SDK vs REST API
**Use Both:**
- **SDK (@sentry/react-native)**: Continue using for error capture and performance tracing (already configured)
- **REST API**: Backend-only for querying aggregated statistics for admin dashboard

### Implementation Notes
- SDK configuration: `tracesSampleRate` (0-1) for performance monitoring
- Performance metrics include: throughput, latency, failed API requests, slow endpoints
- Custom measurements via `Sentry.setMeasurement()` for app-specific metrics

### Alternatives Considered
- ❌ **DSN for queries**: DSN is for ingestion only, not data retrieval
- ❌ **SDK-based queries**: SDK doesn't expose methods for fetching aggregated statistics
- ❌ **Direct API from mobile**: Security risk - auth tokens should never be in client apps

## 3. Chart Library Selection

### Decision
Use **react-native-gifted-charts** for the admin statistics dashboard.

### Rationale

**Zero Additional Dependencies:**
- Uses `react-native-svg` which is already installed in the project (v15.12.1)
- No need to install React Native Skia (~2MB bundle size increase)
- No bundle size impact - leverages existing dependencies

**Simpler API:**
- Declarative, straightforward component API
- Less boilerplate than hook-based libraries
- Faster development time for admin dashboards
- Easier to maintain and understand

**Performance:**
- Good performance for admin dashboard use cases (60fps scrolling)
- Handles thousands of data points smoothly
- Sufficient for data visualization (doesn't need 100+ fps gaming performance)
- Smooth animations with optional Reanimated support

**Chart Types:**
- Line charts (latency, traffic, DAU trends)
- Bar charts (platform comparison, requests/min)
- Stacked bar charts (new vs returning users - built-in!)
- Pie/Donut charts (active users by platform, error breakdown)
- Population pyramids (could enhance platform comparison)

**TypeScript Support:**
- Full TypeScript definitions included
- Actively maintained with regular updates through 2024

**Excellent Documentation:**
- Live interactive examples at https://gifted-charts.web.app/
- Clear API documentation with code snippets
- Easy to find examples for each chart type

**Dependencies Alignment:**
Project already has the only required dependency:
- ✅ react-native-svg: 15.12.1 (already installed)
- Optional: react-native-reanimated: ~4.1.1 (already installed) for enhanced animations

### Supported Chart Types
- Line charts - `<LineChart />` with curved/straight lines, multiple datasets
- Bar charts - `<BarChart />` with grouping, spacing, rounded corners
- Stacked bar charts - Built-in stacking support (perfect for new vs returning users)
- Pie charts - `<PieChart />` with labels, percentages, pull-out slices
- Donut charts - For platform distribution visualization
- Population pyramids - For demographic comparisons

### Installation
```bash
npm install react-native-gifted-charts
```

### Example Usage
```typescript
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';

// Line chart for latency trends
<LineChart
  data={latencyData.map(d => ({
    value: d.p95,
    label: formatTime(d.timestamp),
    dataPointText: `${d.p95}ms`
  }))}
  height={220}
  color="#007AFF"
  thickness={2}
  curved
  animateOnDataChange
  animationDuration={800}
  spacing={40}
  initialSpacing={10}
  noOfSections={5}
  yAxisTextStyle={{ color: 'gray' }}
  xAxisLabelTextStyle={{ color: 'gray', fontSize: 10 }}
/>

// Pie chart for platform distribution
<PieChart
  data={[
    { value: webUsers, color: '#007AFF', text: `${webPct}%`, label: 'Web' },
    { value: mobileUsers, color: '#34C759', text: `${mobilePct}%`, label: 'Mobile' },
    { value: bothUsers, color: '#FF9500', text: `${bothPct}%`, label: 'Both' },
  ]}
  radius={120}
  innerRadius={60}
  donut
  showText
  textColor="white"
  textSize={14}
  showTextBackground
  focusOnPress
  centerLabelComponent={() => (
    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Users</Text>
  )}
/>

// Stacked bar chart for new vs returning users
<BarChart
  data={hourlyData.map((hour, index) => ({
    value: hour.newUsers,
    topLabelComponent: () => <Text>{hour.newUsers + hour.returningUsers}</Text>,
    frontColor: '#007AFF',
    stacks: [
      { value: hour.newUsers, color: '#007AFF' },
      { value: hour.returningUsers, color: '#34C759' },
    ],
    label: formatHour(hour.timestamp),
  }))}
  height={220}
  spacing={20}
  stackData={hourlyData.map(h => [
    { value: h.newUsers, color: '#007AFF' },
    { value: h.returningUsers, color: '#34C759' },
  ])}
/>
```

### Alternatives Considered

**❌ Victory Native XL:**
- Requires additional 2MB Skia dependency
- More complex hook-based API (slower development)
- Overkill for admin dashboards (100+ fps not needed)
- Fewer built-in chart types

**❌ Recharts:**
- Not compatible with React Native without WebView workaround
- Designed for React web, uses DOM APIs

**❌ React Native Chart Kit:**
- More limited than Gifted Charts
- Less flexible customization
- No stacked bar charts built-in

**❌ Victory Native (Classic):**
- Superseded by Victory Native XL
- Uses react-native-svg but with performance limitations

## 4. Platform Detection

### Decision
Use **PostHog's built-in autocaptured properties** (`$os`, `$browser`, `$device_type`) for platform detection. No custom event properties needed.

### Rationale
- PostHog automatically captures comprehensive platform properties on all events
- No additional implementation work required - already available in existing integration
- Consistent, standardized property names across all events
- Can be used for filtering, breakdowns, cohorts, and analysis

### Built-in PostHog Properties for Platform Detection

```typescript
// Automatically captured on every event
{
  $os: 'iOS' | 'Android' | 'Mac OS X' | 'Windows' | 'Linux',
  $os_version: '10.15.7' | '14.2',
  $browser: 'Chrome' | 'Safari' | 'Mobile Safari' | 'Chrome Mobile',
  $browser_version: '125' | '17.1',
  $device_type: 'Desktop' | 'Mobile' | 'Tablet',
  $device_manufacturer: 'Apple' | 'Samsung',
  $device_model: 'iPhone 14 Pro' | 'SM-G998B',
  $lib: 'posthog-react-native' | 'posthog-js',
  $lib_version: '4.14.0',
  $screen_height: 1080,
  $screen_width: 1920,
}
```

### Platform Detection Patterns

**Web vs Mobile Detection:**
```typescript
// Mobile users
filter: { "$device_type": "Mobile" }
// OR (more reliable)
filter: { "$lib": "posthog-react-native" }

// Web users
filter: { "$device_type": "Desktop" }
// OR
filter: { "$lib": "posthog-js" }

// iOS specifically
filter: { "$os": "iOS" }

// Android specifically
filter: { "$os": "Android" }
```

**OS Version Breakdown:**
```typescript
// HogQL query for OS version distribution
{
  "query": {
    "kind": "HogQLQuery",
    "query": "SELECT properties.$os, properties.$os_version, count(*) FROM events WHERE event = 'app_opened' GROUP BY properties.$os, properties.$os_version"
  }
}
```

### Cross-Platform User Tracking
- PostHog automatically associates events when user is authenticated on both platforms
- Use `posthog.identify(userId)` with the same userId on both web and mobile
- Events from both platforms unified in user's timeline

### Implementation Notes
- All properties starting with `$` are PostHog defaults (autocaptured)
- Properties available in insights, cohorts, breakdowns, and HogQL queries
- No performance impact - properties captured automatically with every event

### Best Practices
- Use `$device_type` for high-level mobile/desktop/tablet segmentation
- Use `$os` + `$os_version` for OS-specific analytics and issue correlation
- Use `$lib` as most reliable indicator of SDK source (react-native vs web)
- Combine multiple properties for precise segmentation (e.g., "iOS 16+ mobile users")

### Alternatives Considered
- ❌ **Custom event properties**: Unnecessary overhead, duplicates built-in functionality
- ❌ **User-agent parsing**: PostHog already does this automatically
- ❌ **Manual platform tagging**: Error-prone, inconsistent, maintenance burden

## 5. Backend Integration Strategy

### Decision
**Proxy all analytics API calls through ACP backend endpoints.** Never call PostHog/Sentry APIs directly from mobile.

### Rationale

**Security:**
- **Critical**: Personal API Keys and auth tokens provide organization-level access - exposing them in mobile apps is a severe security risk
- Any secret stored in a client app is extractable by attackers
- Backend proxy removes API keys from mobile attack surface entirely

**Control & Flexibility:**
- Backend can throttle requests to prevent abuse
- Can disable/rate-limit specific user accounts
- Can restrict which analytics queries are allowed
- Can add business logic (e.g., admin-only access checks)
- Can aggregate/transform data before sending to mobile

**Performance & Caching:**
- Backend can cache expensive analytics queries
- Reduces rate limit pressure on PostHog/Sentry
- PostHog Query API: only 120 requests/hour - requires caching for multiple admin users
- Can implement smart cache invalidation strategies

**Rate Limit Management:**
- PostHog private endpoints: Query 120/hour, Analytics 240/minute & 1200/hour
- Multiple admin users won't compete for mobile app's quota
- Backend can implement request queuing and retry logic

**Maintainability:**
- API keys managed in one place (backend env vars)
- Key rotation doesn't require mobile app updates
- Can switch analytics providers without mobile changes
- Centralized logging and monitoring of analytics access

### Recommended Architecture

```
┌─────────────────┐
│  Mobile App     │
│  (Admin Views)  │
└────────┬────────┘
         │ HTTPS (JWT auth)
         ▼
┌─────────────────────────────────────┐
│  ACP Backend API                    │
│  /api/admin/analytics/*             │
│  ┌───────────────────────────────┐  │
│  │ - Authentication/Authorization │  │
│  │ - Rate limiting                │  │
│  │ - Caching (Redis)              │  │
│  │ - Request aggregation          │  │
│  │ - Response transformation      │  │
│  └───────────────────────────────┘  │
└────────┬──────────────┬─────────────┘
         │              │
         │ Personal     │ Auth Token
         │ API Key      │
         ▼              ▼
    ┌─────────┐    ┌─────────┐
    │ PostHog │    │ Sentry  │
    │   API   │    │   API   │
    └─────────┘    └─────────┘
```

### Backend Endpoint Design

```typescript
// Example backend routes
// /api/admin/analytics/dau-mau
//   - GET ?period=7d|30d|90d
//   - Returns: { dau: number[], mau: number[], ratio: number[], timestamps: string[] }
//   - Cache: 15 minutes

// /api/admin/analytics/platform-distribution
//   - GET ?period=30d
//   - Returns: { ios: number, android: number, web: number }
//   - Cache: 30 minutes

// /api/admin/analytics/os-versions
//   - GET ?platform=ios|android
//   - Returns: { version: string, count: number, percentage: number }[]
//   - Cache: 1 hour

// /api/admin/errors/summary
//   - GET ?period=7d|30d
//   - Returns: { errorRate: number, topErrors: Error[], breakdown: ErrorBreakdown }
//   - Cache: 5 minutes

// /api/admin/errors/performance
//   - GET ?period=7d
//   - Returns: { latency: LatencyMetrics, throughput: number }
//   - Cache: 5 minutes
```

### Caching Strategy

**Redis-based caching on backend:**
```typescript
const CACHE_DURATIONS = {
  'dau-mau': 15 * 60,              // 15 minutes
  'platform-distribution': 30 * 60, // 30 minutes
  'os-versions': 60 * 60,           // 1 hour
  'error-summary': 5 * 60,          // 5 minutes
  'performance': 5 * 60,            // 5 minutes
}

const cacheKey = `analytics:${endpoint}:${period}:${date}`
```

**Benefits:**
- Protects against PostHog Query API's 120/hour limit
- Multiple admin users don't overwhelm rate limits
- Faster response times for mobile app
- Reduces external API costs

### Authentication & Authorization

**Mobile to Backend:**
```typescript
// Use existing JWT auth from ACP backend
headers: {
  'Authorization': `Bearer ${userJwtToken}`,
}

// Backend verifies:
// 1. Valid JWT
// 2. User has admin role
// 3. Rate limit check (per-user)
```

**Backend to Analytics APIs:**
```typescript
// PostHog
headers: {
  'Authorization': `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
}

// Sentry
headers: {
  'Authorization': `Bearer ${SENTRY_AUTH_TOKEN}`,
}

// Both stored in backend environment variables, never exposed
```

### Mobile App Implementation

```typescript
// services/analytics/posthog.ts
export const getDAUMAU = async (period: '7d' | '30d' | '90d') => {
  const response = await apiClient.get(`/api/admin/analytics/dau-mau`, {
    params: { period },
  })
  return response.data
}

// services/analytics/hooks/useEngagement.ts
export const useDAUMAU = (period: '7d' | '30d' | '90d') => {
  return useQuery({
    queryKey: ['admin', 'dau-mau', period],
    queryFn: () => getDAUMAU(period),
    staleTime: 5 * 60 * 1000,  // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  })
}
```

### Environment Variables

**Backend (.env):**
```bash
# PostHog
POSTHOG_PERSONAL_API_KEY=phx_xxx...
POSTHOG_PROJECT_ID=12345

# Sentry
SENTRY_AUTH_TOKEN=sntrys_xxx...
SENTRY_ORG_SLUG=your-org
SENTRY_PROJECT_SLUG=acp-mobile

# Caching
REDIS_URL=redis://...
```

**Mobile app (.env.local):**
```bash
# Only public tokens for event capture (already configured)
EXPO_PUBLIC_POSTHOG_API_KEY=phc_xxx...  # Project API Key (public)
# NO Sentry auth tokens
# NO PostHog Personal API Keys
```

### Performance Considerations

**Request Batching:**
```typescript
// Backend can batch multiple PostHog queries
POST /api/admin/analytics/dashboard
// Returns all dashboard data in one request
{
  "dauMau": { ... },
  "platformDistribution": { ... },
  "osVersions": { ... },
  "errors": { ... }
}
```

**Progressive Loading:**
```typescript
// Mobile requests summary first, details on-demand
1. GET /api/admin/analytics/summary (fast, cached)
2. User clicks "iOS details"
3. GET /api/admin/analytics/os-versions?platform=ios
```

### Error Handling
- Backend should handle PostHog/Sentry API failures gracefully
- Return cached data if available when API fails
- Include error status in response: `{ data: ..., cached: true, error: null }`

### Alternatives Considered

**❌ Direct API calls from mobile:**
- Security risk: API keys extractable from mobile app
- Rate limit issues: All users share mobile app's quota
- Inflexible: Can't add business logic or caching
- Key rotation requires app updates

**❌ Store API keys in Expo SecureStore:**
- Still extractable by determined attackers
- Doesn't solve rate limiting or caching issues
- Creates false sense of security

## Summary of Technical Decisions

| Component | Technology/Approach | Key Reason |
|-----------|-------------------|-----------|
| **PostHog Queries** | Personal API Key → Backend Proxy | Security, rate limits, caching |
| **Sentry Queries** | Auth Token → Backend Proxy | Security, organization-level access |
| **Charts** | react-native-gifted-charts | Zero deps (uses existing react-native-svg), simpler API, faster development |
| **Platform Detection** | PostHog built-in properties | No implementation needed, autocaptured |
| **Architecture** | Backend proxy pattern | Security, control, performance, caching |
| **Mobile Caching** | React Query | Client-side cache layer |
| **Backend Caching** | Redis | Rate limit protection, performance |

## Integration Testing Strategy

**PostHog/Sentry Data Fetching Tests:**

1. **Backend Integration Tests:**
   - Mock PostHog/Sentry API responses
   - Test caching behavior (cache hits, misses, expiration)
   - Test error handling (API down, rate limits, invalid responses)
   - Test authorization (admin-only access)

2. **Mobile Integration Tests:**
   - Mock backend API responses
   - Test React Query hooks (loading, success, error states)
   - Test data transformation and display
   - Test refresh behavior (pull-to-refresh, auto-refresh)

3. **Contract Tests:**
   - Verify backend queries match PostHog/Sentry API contracts
   - Verify mobile expects correct backend response shapes
   - Use API schemas in `contracts/` directory

## Key Gotchas

1. **PostHog Query API rate limit (120/hour)** - aggressive caching essential
2. **react-native-gifted-charts uses react-native-svg** - already installed, no additional deps needed
3. **Personal API Keys** - never expose in mobile, always backend-only
4. **Platform detection** - use `$lib` property as most reliable mobile/web indicator
5. **Sentry stats page** - no single API, must combine multiple endpoints

## Next Steps

1. Install Gifted Charts: `npm install react-native-gifted-charts`
2. Create backend API endpoints (requires backend team coordination)
3. Generate API contracts in `contracts/` directory
4. Create data model in `data-model.md`
5. Generate quickstart guide in `quickstart.md`
