// Analytics API Client
// Wrapper for backend analytics endpoints
// Feature 002-admin-stats-dashboard

import { apiClient } from '@/services/api/client'
import { ADMIN_METRICS } from '@/constants/AdminMetrics'
import type {
  SystemHealthResponse,
  GoldenSignalsResponse,
  EngagementResponse,
  PlatformDistributionResponse,
  ErrorSummaryResponse,
  GoldenSignalsPeriod,
  EngagementPeriod,
  PlatformPeriod,
  ErrorPeriod,
} from './types'

/**
 * Analytics API Client
 * All requests require admin JWT authentication
 */
export const analyticsApi = {
  /**
   * Get current system health status
   * Endpoint: GET /api/admin/analytics/system-health
   */
  getSystemHealth: () =>
    apiClient.get<SystemHealthResponse>(ADMIN_METRICS.ENDPOINTS.SYSTEM_HEALTH),

  /**
   * Get Golden Signals metrics (Latency, Traffic, Errors, Saturation)
   * Endpoint: GET /api/admin/analytics/golden-signals?period={period}
   */
  getGoldenSignals: (period: GoldenSignalsPeriod = '7d') =>
    apiClient.get<GoldenSignalsResponse>(ADMIN_METRICS.ENDPOINTS.GOLDEN_SIGNALS, {
      params: { period },
    }),

  /**
   * Get user engagement metrics (DAU, MAU, stickiness)
   * Endpoint: GET /api/admin/analytics/engagement?period={period}
   */
  getEngagementMetrics: (period: EngagementPeriod = '24h') =>
    apiClient.get<EngagementResponse>(ADMIN_METRICS.ENDPOINTS.ENGAGEMENT, {
      params: { period },
    }),

  /**
   * Get platform distribution and OS versions
   * Endpoint: GET /api/admin/analytics/platforms?period={period}
   */
  getPlatformDistribution: (period: PlatformPeriod = '30d') =>
    apiClient.get<PlatformDistributionResponse>(ADMIN_METRICS.ENDPOINTS.PLATFORMS, {
      params: { period },
    }),

  /**
   * Get error summary and top errors
   * Endpoint: GET /api/admin/errors/summary?period={period}
   */
  getErrorSummary: (period: ErrorPeriod = '7d') =>
    apiClient.get<ErrorSummaryResponse>(ADMIN_METRICS.ENDPOINTS.ERROR_SUMMARY, {
      params: { period },
    }),
}
