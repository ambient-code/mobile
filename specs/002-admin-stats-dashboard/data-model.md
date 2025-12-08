# Data Model: Admin Statistics Dashboard

**Feature**: 002-admin-stats-dashboard
**Date**: 2025-11-27

This document defines the data structures for admin statistics dashboard metrics, API responses, and internal state management.

## Overview

The admin statistics dashboard works with aggregated analytics data from PostHog and Sentry. All data is:

- **Read-only**: Dashboard displays metrics, does not create/update data
- **Ephemeral**: No persistent storage in mobile app (React Query in-memory cache only)
- **Time-series**: Most metrics track changes over time (hourly, daily)
- **Aggregated**: Pre-calculated on backend, not raw events

## Core Entities

### 1. User (Analytics Context)

Represents tracked user attributes from PostHog for platform/OS analytics.

```typescript
interface AnalyticsUser {
  userId: string // Unique user identifier
  platform: Platform // 'web' | 'mobile' | 'both'
  deviceType: DeviceType // 'Desktop' | 'Mobile' | 'Tablet'
  os: string // 'iOS' | 'Android' | 'Mac OS X' | 'Windows' | 'Linux'
  osVersion: string // e.g., '14.2', '10.15.7'
  deviceModel?: string // e.g., 'iPhone 14 Pro', 'SM-G998B'
  firstSeen: Date // First event timestamp
  lastActive: Date // Most recent activity timestamp
}

type Platform = 'web' | 'mobile' | 'both'
type DeviceType = 'Desktop' | 'Mobile' | 'Tablet'
```

**Relationships**:

- One user can have activity on multiple platforms (tracked separately)
- Users tracked via PostHog `$os`, `$device_type`, `$lib` properties

**Validation Rules**:

- `userId` must be non-empty string
- `platform` derived from `$lib` property: 'posthog-react-native' → 'mobile', 'posthog-js' → 'web'
- `firstSeen` ≤ `lastActive`

### 2. Metric Data Point

Represents a single measurement at a point in time for time-series charts.

```typescript
interface MetricDataPoint {
  timestamp: Date // When measurement was taken
  metricType: MetricType // Type of metric
  value: number // Metric value
  platform?: Platform // Platform filter (optional)
  metadata?: Record<string, unknown> // Additional context
}

type MetricType =
  | 'active_users' // Active user count
  | 'requests_per_minute' // Request rate
  | 'error_rate' // Error percentage
  | 'latency_p50' // 50th percentile latency
  | 'latency_p95' // 95th percentile latency
  | 'latency_p99' // 99th percentile latency
  | 'cpu_usage' // CPU utilization percentage
  | 'memory_usage' // Memory utilization percentage
  | 'db_pool_usage' // Database connection pool percentage
```

**Relationships**:

- Multiple data points form a time series
- Can be filtered by platform for platform-specific metrics

**Validation Rules**:

- `timestamp` must be valid date
- `value` must be non-negative number
- `error_rate`, CPU/memory/DB percentages: 0-100
- Latency values in milliseconds

### 3. Request (Analytics Context)

Represents aggregated request metrics for traffic/latency analysis.

```typescript
interface RequestMetrics {
  timeRange: TimeRange // Period these metrics cover
  totalRequests: number // Total request count
  requestsPerMinute: number // Average RPM
  platform: Platform // 'web' | 'mobile' | 'combined'
  statusCodeBreakdown: {
    '2xx': number // Successful requests
    '4xx': number // Client errors
    '5xx': number // Server errors
  }
  latencyPercentiles: {
    p50: number // 50th percentile (ms)
    p95: number // 95th percentile (ms)
    p99: number // 99th percentile (ms)
  }
}

interface TimeRange {
  start: Date
  end: Date
  resolution: 'hour' | 'day' // Granularity
}
```

**Relationships**:

- Derived from backend/Sentry request logs
- Can be aggregated by platform or combined

**Validation Rules**:

- `totalRequests` ≥ sum of status code counts
- `requestsPerMinute` = `totalRequests` / minutes in time range
- All latency percentiles must be: p50 ≤ p95 ≤ p99

### 4. Error Event

Represents error statistics for error tracking dashboard.

```typescript
interface ErrorEvent {
  errorId: string // Unique error identifier (Sentry issue ID)
  message: string // Error message
  errorType: ErrorType // '4xx' | '5xx'
  count: number // Occurrences in time period
  lastSeen: Date // Most recent occurrence
  platform?: Platform // Where error occurred
  affectedUsers?: number // Number of users impacted
}

type ErrorType = '4xx' | '5xx'

interface ErrorBreakdown {
  total4xx: number // Total 4xx errors
  total5xx: number // Total 5xx errors
  percentage4xx: number // 4xx as % of total
  percentage5xx: number // 5xx as % of total
}
```

**Relationships**:

- Multiple occurrences of same error grouped by `errorId`
- Can be filtered by platform

**Validation Rules**:

- `count` must be positive integer
- `percentage4xx` + `percentage5xx` should equal 100
- `message` must be non-empty string

### 5. System Health Status

Represents overall platform health at a point in time.

```typescript
interface SystemHealthStatus {
  status: HealthStatus // 'healthy' | 'degraded' | 'down'
  timestamp: Date // When status was determined
  metrics: {
    activeUsers: {
      total: number
      web: number
      mobile: number
      both: number // Concurrent web + mobile sessions
    }
    requestsPerMinute: number
    errorRate: number // Percentage (0-100)
    latencyP95: number // Milliseconds
  }
  statusReasons: string[] // Why status is not healthy
}

type HealthStatus = 'healthy' | 'degraded' | 'down'

// Status determination logic
// - healthy: errorRate < 1% AND latencyP95 < 100ms
// - degraded: errorRate 1-5% OR latencyP95 100-500ms
// - down: errorRate > 5% OR latencyP95 > 500ms
```

**Relationships**:

- Derived from current RequestMetrics and ErrorEvent data
- Snapshots taken every 5 minutes (auto-refresh interval)

**Validation Rules**:

- `errorRate`: 0-100 (percentage)
- `latencyP95` ≥ 0 (milliseconds)
- `activeUsers.total` ≥ `activeUsers.web` + `activeUsers.mobile` - `activeUsers.both`
- `status` must match threshold rules

### 6. Engagement Metrics

Represents user engagement statistics (DAU/MAU).

```typescript
interface EngagementMetrics {
  timeRange: TimeRange
  dau: DailyActiveUsers[] // 24-hour hourly breakdown
  mau: number // 30-day unique users
  stickiness: number | null // (DAU/MAU) * 100, or null if MAU = 0
  newVsReturning: NewVsReturningData[]
}

interface DailyActiveUsers {
  hour: Date // Hour timestamp
  uniqueUsers: number // Unique users in that hour
}

interface NewVsReturningData {
  hour: Date // Hour timestamp
  newUsers: number // Users with firstSeen in last 24h
  returningUsers: number // Users with firstSeen > 24h ago
}
```

**Relationships**:

- `dau` is array of hourly data points over 24 hours
- `mau` is single number for rolling 30-day window
- `newVsReturning` uses `AnalyticsUser.firstSeen` to classify users

**Validation Rules**:

- `stickiness` = (current DAU / MAU) × 100, or `null` if MAU = 0
- `stickiness` range: 0-100 when not null
- `dau` array should have 24 entries (hourly buckets)
- `newVsReturning` array should have 24 entries

### 7. Platform Distribution

Represents platform usage breakdown.

```typescript
interface PlatformDistribution {
  timeRange: TimeRange
  distribution: {
    web: PlatformStats
    mobile: PlatformStats
    both: number // Users active on web AND mobile
  }
  osVersions: {
    mobile: OSVersionBreakdown[]
    web: OSVersionBreakdown[]
  }
}

interface PlatformStats {
  activeUsers: number // Unique users on platform
  percentage: number // % of total users
  requestsPerMinute: number
  errorRate: number // Platform-specific error rate
}

interface OSVersionBreakdown {
  os: string // 'iOS', 'Android', 'macOS', 'Windows', 'Linux'
  version: string // e.g., '14.2', '10.15.7', 'Unknown'
  count: number // Number of users
  percentage: number // % of platform users
}
```

**Relationships**:

- `distribution.both` counts users appearing in both web and mobile
- `osVersions.mobile` includes iOS and Android
- `osVersions.web` includes macOS, Windows, Linux

**Validation Rules**:

- `percentage` values: 0-100
- Sum of `osVersions` percentages per platform should equal 100
- `count` must be non-negative integer
- 'Unknown' OS versions included in totals

### 8. Golden Signals Metrics

Represents Google's SRE Golden Signals dashboard data.

```typescript
interface GoldenSignalsMetrics {
  timeRange: TimeRange
  latency: LatencyMetrics
  traffic: TrafficMetrics
  errors: ErrorMetrics
  saturation: SaturationMetrics
}

interface LatencyMetrics {
  timeSeries: MetricDataPoint[] // p50, p95, p99 over time
  trend: TrendIndicator // 'improving' | 'stable' | 'degrading'
  currentP95: number // Current p95 latency (ms)
}

interface TrafficMetrics {
  timeSeries: MetricDataPoint[] // RPM over time
  currentRPM: number // Current requests per minute
  activeSessions: number // Current active sessions
}

interface ErrorMetrics {
  timeSeries: MetricDataPoint[] // Error rate over time
  breakdown: ErrorBreakdown // 4xx vs 5xx split
  topErrors: ErrorEvent[] // Top 5 errors by count
}

interface SaturationMetrics {
  cpu: SaturationDataPoint // Current CPU usage
  memory: SaturationDataPoint // Current memory usage
  dbPool: SaturationDataPoint // Current DB connection pool
}

interface SaturationDataPoint {
  current: number // Current usage percentage (0-100)
  threshold: number // Warning threshold (e.g., 80)
  status: 'normal' | 'warning' | 'critical'
}

type TrendIndicator = 'improving' | 'stable' | 'degrading'
// improving: last hour avg < previous hour avg
// degrading: last hour avg > previous hour avg
// stable: difference < 10%
```

**Relationships**:

- `latency.timeSeries` contains multiple MetricDataPoint entries
- `errors.topErrors` limited to top 5 by count
- All metrics cover same `timeRange`

**Validation Rules**:

- All percentages: 0-100
- Latency values in milliseconds, must be positive
- `topErrors` sorted by count descending
- `trend` calculation compares last 2 hours of data

## API Response Shapes

### Backend API Contracts

All backend endpoints follow this response structure:

```typescript
interface APIResponse<T> {
  data: T
  cached: boolean // True if returned from cache
  lastUpdated: Date // When data was fetched/calculated
  error: string | null // Error message if API call failed but cached data available
}
```

### Endpoint Response Types

**GET /api/admin/analytics/system-health**

```typescript
type SystemHealthResponse = APIResponse<SystemHealthStatus>
```

**GET /api/admin/analytics/golden-signals?period=7d|30d**

```typescript
type GoldenSignalsResponse = APIResponse<GoldenSignalsMetrics>
```

**GET /api/admin/analytics/engagement?period=24h|7d|30d**

```typescript
type EngagementResponse = APIResponse<EngagementMetrics>
```

**GET /api/admin/analytics/platforms?period=30d**

```typescript
type PlatformDistributionResponse = APIResponse<PlatformDistribution>
```

**GET /api/admin/errors/summary?period=7d|30d**

```typescript
type ErrorSummaryResponse = APIResponse<ErrorMetrics>
```

## React Query Cache Keys

Mobile app uses these cache keys for React Query:

```typescript
// System health (overview dashboard)
;['admin', 'system-health'][
  // Golden Signals
  ('admin', 'golden-signals', period)
][ // period: '7d' | '30d'
  // Engagement (DAU/MAU)
  ('admin', 'engagement', period)
][ // period: '24h' | '7d' | '30d'
  // Platform distribution
  ('admin', 'platforms', period)
][ // period: '30d'
  // Error summary
  ('admin', 'errors', 'summary', period)
] // period: '7d' | '30d'
```

**Cache Configuration**:

- `staleTime`: 4 minutes (data considered fresh)
- `cacheTime`: 15 minutes (data kept in cache)
- `refetchInterval`: 5 minutes (auto-refresh)

## State Transitions

### System Health Status Transitions

```
┌─────────┐
│ healthy │
│ (green) │
└────┬────┘
     │
     │ error rate ≥ 1% OR latency ≥ 100ms
     ▼
┌──────────┐
│ degraded │
│ (yellow) │
└────┬─────┘
     │
     │ error rate ≥ 5% OR latency ≥ 500ms
     ▼
┌─────────┐
│  down   │
│  (red)  │
└─────────┘
```

**Recovery**: Status can transition back to healthy/degraded when metrics improve

### Latency Trend Transitions

```
┌────────────┐
│  improving │ ◄─── Last hour avg < previous hour avg
└────────────┘
      │
      │ diff < 10%
      ▼
┌────────────┐
│   stable   │
└────────────┘
      │
      │ diff ≥ 10%
      ▼
┌────────────┐
│ degrading  │ ◄─── Last hour avg > previous hour avg
└────────────┘
```

## Data Flow

```
┌────────────┐
│  PostHog   │ ──── User events, platform properties, DAU/MAU data
└────────────┘
      │
      ▼
┌────────────┐      ┌─────────────┐
│  Sentry    │ ──── Error events, latency, performance
└────────────┘      └─────────────┘
      │                    │
      │                    │
      ▼                    ▼
┌──────────────────────────────────┐
│   ACP Backend API                │
│   - Queries PostHog/Sentry       │
│   - Aggregates metrics           │
│   - Caches in Redis              │
│   - Transforms to API responses  │
└──────────┬───────────────────────┘
           │
           │ HTTPS (JWT auth)
           ▼
    ┌─────────────┐
    │ Mobile App  │
    │ React Query │ ──── In-memory cache (4 min stale, 15 min cache)
    └─────────────┘
           │
           ▼
    ┌─────────────┐
    │ Admin Views │
    │ - Charts    │
    │ - Metrics   │
    └─────────────┘
```

## Key Constraints

1. **No Write Operations**: All data is read-only from mobile app perspective
2. **No Persistent Storage**: No data stored in AsyncStorage or local database
3. **Ephemeral State**: React Query in-memory cache only
4. **Admin-Only Access**: All endpoints require `role === 'admin'` in JWT
5. **Time-Bounded Queries**: All metrics have time range limits (max 90 days)
6. **Cache Coherence**: Backend cache must invalidate after max 15 minutes
7. **Rate Limiting**: Backend enforces per-user rate limits for analytics queries

## Error Handling

### API Error States

```typescript
interface QueryError {
  status: 'error'
  message: string // User-friendly error message
  code: ErrorCode // Machine-readable error code
  retryable: boolean // Can user retry?
}

type ErrorCode =
  | 'ANALYTICS_API_DOWN' // PostHog/Sentry unavailable
  | 'UNAUTHORIZED' // Not admin user
  | 'RATE_LIMIT_EXCEEDED' // Too many requests
  | 'INVALID_TIME_RANGE' // Bad query parameters
  | 'NETWORK_ERROR' // Network failure
```

### Fallback Behaviors

| Error Type          | Mobile App Behavior                               |
| ------------------- | ------------------------------------------------- |
| Analytics API down  | Show cached data with "Last updated: X mins ago"  |
| No cached data      | Show "Unable to load metrics" with retry button   |
| Rate limit exceeded | Show "Too many requests, try again in X minutes"  |
| Unauthorized        | Redirect to main app with "Admin access required" |
| Network error       | Show "Network error" with retry button            |

## Calculation Formulas

### Stickiness

```
stickiness = (DAU / MAU) × 100

Where:
- DAU = unique users in current day
- MAU = unique users in rolling 30-day window
- Result = percentage (0-100)
- Special case: if MAU = 0, return null (not 0)
```

### Error Rate

```
errorRate = (errorCount / totalRequests) × 100

Where:
- errorCount = sum of 4xx + 5xx status codes
- totalRequests = all requests in time period
- Result = percentage (0-100)
```

### Requests Per Minute

```
rpm = totalRequests / (timeRange.minutes)

Where:
- totalRequests = count of all requests
- timeRange.minutes = (end - start) in minutes
- Result = average requests per minute
```

### Platform Percentage

```
platformPercentage = (platformUsers / totalUsers) × 100

Where:
- platformUsers = unique users on specific platform
- totalUsers = unique users across all platforms
- Note: web% + mobile% + both% may exceed 100% (users counted in multiple)
```
