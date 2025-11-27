// Admin Analytics Types
// Generated from data-model.md for feature 002-admin-stats-dashboard

// ============================================================================
// Platform & Device Types
// ============================================================================

export type Platform = 'web' | 'mobile' | 'both'
export type DeviceType = 'Desktop' | 'Mobile' | 'Tablet'
export type HealthStatus = 'healthy' | 'degraded' | 'down'
export type ErrorType = '4xx' | '5xx'
export type TrendIndicator = 'improving' | 'stable' | 'degrading'

// ============================================================================
// Core Entities
// ============================================================================

export interface AnalyticsUser {
  userId: string
  platform: Platform
  deviceType: DeviceType
  os: string
  osVersion: string
  deviceModel?: string
  firstSeen: Date
  lastActive: Date
}

export type MetricType =
  | 'active_users'
  | 'requests_per_minute'
  | 'error_rate'
  | 'latency_p50'
  | 'latency_p95'
  | 'latency_p99'
  | 'cpu_usage'
  | 'memory_usage'
  | 'db_pool_usage'

export interface MetricDataPoint {
  timestamp: Date
  metricType: MetricType
  value: number
  platform?: Platform
  metadata?: Record<string, unknown>
}

export interface TimeRange {
  start: Date
  end: Date
  resolution: 'hour' | 'day'
}

export interface RequestMetrics {
  timeRange: TimeRange
  totalRequests: number
  requestsPerMinute: number
  platform: Platform
  statusCodeBreakdown: {
    '2xx': number
    '4xx': number
    '5xx': number
  }
  latencyPercentiles: {
    p50: number
    p95: number
    p99: number
  }
}

export interface ErrorEvent {
  errorId: string
  message: string
  errorType: ErrorType
  count: number
  lastSeen: Date
  platform?: Platform
  affectedUsers?: number
}

export interface ErrorBreakdown {
  total4xx: number
  total5xx: number
  percentage4xx: number
  percentage5xx: number
}

// ============================================================================
// System Health
// ============================================================================

export interface SystemHealthStatus {
  status: HealthStatus
  timestamp: Date
  metrics: {
    activeUsers: {
      total: number
      web: number
      mobile: number
      both: number
    }
    requestsPerMinute: number
    errorRate: number
    latencyP95: number
  }
  statusReasons: string[]
}

// ============================================================================
// Engagement Metrics
// ============================================================================

export interface DailyActiveUsers {
  hour: Date
  uniqueUsers: number
}

export interface NewVsReturningData {
  hour: Date
  newUsers: number
  returningUsers: number
}

export interface EngagementMetrics {
  timeRange: TimeRange
  dau: DailyActiveUsers[]
  mau: number
  stickiness: number | null
  newVsReturning: NewVsReturningData[]
}

// ============================================================================
// Platform Distribution
// ============================================================================

export interface PlatformStats {
  activeUsers: number
  percentage: number
  requestsPerMinute: number
  errorRate: number
}

export interface OSVersionBreakdown {
  os: string
  version: string
  count: number
  percentage: number
}

export interface PlatformDistribution {
  timeRange: TimeRange
  distribution: {
    web: PlatformStats
    mobile: PlatformStats
    both: number
  }
  osVersions: {
    mobile: OSVersionBreakdown[]
    web: OSVersionBreakdown[]
  }
}

// ============================================================================
// Golden Signals
// ============================================================================

export interface LatencyMetrics {
  timeSeries: MetricDataPoint[]
  trend: TrendIndicator
  currentP95: number
}

export interface TrafficMetrics {
  timeSeries: MetricDataPoint[]
  currentRPM: number
  activeSessions: number
}

export interface ErrorMetrics {
  timeSeries: MetricDataPoint[]
  breakdown: ErrorBreakdown
  topErrors: ErrorEvent[]
}

export interface SaturationDataPoint {
  current: number
  threshold: number
  status: 'normal' | 'warning' | 'critical'
}

export interface SaturationMetrics {
  cpu: SaturationDataPoint
  memory: SaturationDataPoint
  dbPool: SaturationDataPoint
}

export interface GoldenSignalsMetrics {
  timeRange: TimeRange
  latency: LatencyMetrics
  traffic: TrafficMetrics
  errors: ErrorMetrics
  saturation: SaturationMetrics
}

// ============================================================================
// API Response Wrappers
// ============================================================================

export interface APIResponse<T> {
  data: T
  cached: boolean
  lastUpdated: Date
  error: string | null
}

export type SystemHealthResponse = APIResponse<SystemHealthStatus>
export type GoldenSignalsResponse = APIResponse<GoldenSignalsMetrics>
export type EngagementResponse = APIResponse<EngagementMetrics>
export type PlatformDistributionResponse = APIResponse<PlatformDistribution>
export type ErrorSummaryResponse = APIResponse<ErrorMetrics>

// ============================================================================
// Error Handling
// ============================================================================

export type ErrorCode =
  | 'ANALYTICS_API_DOWN'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_TIME_RANGE'
  | 'NETWORK_ERROR'

export interface QueryError {
  status: 'error'
  message: string
  code: ErrorCode
  retryable: boolean
}

// ============================================================================
// Query Parameters
// ============================================================================

export type GoldenSignalsPeriod = '7d' | '30d'
export type EngagementPeriod = '24h' | '7d' | '30d'
export type PlatformPeriod = '30d'
export type ErrorPeriod = '7d' | '30d'
