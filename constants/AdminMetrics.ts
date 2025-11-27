// Admin Metrics Constants
// Configuration values for admin statistics dashboard
// Feature 002-admin-stats-dashboard

// ============================================================================
// React Query Cache Configuration
// ============================================================================

export const ADMIN_METRICS = {
  // Cache timings (milliseconds)
  REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes - auto-refresh interval
  STALE_TIME: 4 * 60 * 1000, // 4 minutes - data considered fresh
  CACHE_TIME: 15 * 60 * 1000, // 15 minutes - data kept in cache

  // Health Status Thresholds
  HEALTH_THRESHOLDS: {
    ERROR_RATE_WARNING: 1, // 1% error rate = degraded
    ERROR_RATE_CRITICAL: 5, // 5% error rate = down
    LATENCY_WARNING: 100, // 100ms p95 latency = degraded
    LATENCY_CRITICAL: 500, // 500ms p95 latency = down
  },

  // Saturation Thresholds (percentages)
  SATURATION_THRESHOLDS: {
    CPU_WARNING: 70, // 70% CPU usage = warning
    CPU_CRITICAL: 90, // 90% CPU usage = critical
    MEMORY_WARNING: 75, // 75% memory usage = warning
    MEMORY_CRITICAL: 90, // 90% memory usage = critical
    DB_POOL_WARNING: 80, // 80% DB pool usage = warning
    DB_POOL_CRITICAL: 95, // 95% DB pool usage = critical
  },

  // Chart Colors
  CHART_COLORS: {
    primary: '#007AFF', // iOS blue
    success: '#34C759', // Green
    warning: '#FF9500', // Orange
    error: '#FF3B30', // Red
    secondary: '#5856D6', // Purple
    tertiary: '#AF52DE', // Purple light
    gray: '#8E8E93', // Gray
    darkGray: '#48484A', // Dark gray
  },

  // Chart Configuration
  CHART_CONFIG: {
    LINE_THICKNESS: 2,
    ANIMATION_DURATION: 800,
    DEFAULT_HEIGHT: 220,
    TABLET_HEIGHT: 300,
    SPACING: 40,
    INITIAL_SPACING: 10,
    NO_OF_SECTIONS: 5,
  },

  // Responsive Breakpoints
  BREAKPOINTS: {
    MOBILE_MAX_WIDTH: 768, // Below this = mobile layout
  },

  // API Endpoints (relative to base URL)
  ENDPOINTS: {
    SYSTEM_HEALTH: '/api/admin/analytics/system-health',
    GOLDEN_SIGNALS: '/api/admin/analytics/golden-signals',
    ENGAGEMENT: '/api/admin/analytics/engagement',
    PLATFORMS: '/api/admin/analytics/platforms',
    ERROR_SUMMARY: '/api/admin/errors/summary',
  },

  // Default Query Parameters
  DEFAULT_PERIODS: {
    GOLDEN_SIGNALS: '7d',
    ENGAGEMENT: '24h',
    PLATFORMS: '30d',
    ERRORS: '7d',
  },

  // Data Visualization Limits
  LIMITS: {
    TOP_ERRORS_COUNT: 5, // Show top 5 errors
    MAX_DATA_POINTS: 168, // Max 1 week hourly data
    DAU_HOURS: 24, // 24-hour hourly breakdown
  },

  // Trend Calculation
  TREND: {
    STABLE_THRESHOLD: 0.1, // 10% difference = stable
  },

  // Status Colors (matching health status)
  STATUS_COLORS: {
    healthy: '#34C759', // Green
    degraded: '#FF9500', // Orange
    down: '#FF3B30', // Red
    normal: '#34C759', // Green
    warning: '#FF9500', // Orange
    critical: '#FF3B30', // Red
  },
} as const

// ============================================================================
// Type Exports for Constants
// ============================================================================

export type ChartColor = (typeof ADMIN_METRICS.CHART_COLORS)[keyof typeof ADMIN_METRICS.CHART_COLORS]
export type StatusColor = (typeof ADMIN_METRICS.STATUS_COLORS)[keyof typeof ADMIN_METRICS.STATUS_COLORS]
export type AdminEndpoint = (typeof ADMIN_METRICS.ENDPOINTS)[keyof typeof ADMIN_METRICS.ENDPOINTS]
