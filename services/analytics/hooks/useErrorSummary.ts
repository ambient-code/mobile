import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../client'
import { ADMIN_METRICS } from '@/constants/AdminMetrics'
import type { ErrorPeriod, ErrorMetrics } from '../types'

/**
 * Hook for fetching error summary and top errors
 * Used in Golden Signals Dashboard (app/admin/signals.tsx) - Errors panel
 *
 * @param period - Time period for error analysis ('7d' | '30d')
 *
 * Auto-refreshes every 5 minutes
 * Caches for 15 minutes
 * Data considered fresh for 4 minutes
 */
export function useErrorSummary(period: ErrorPeriod = '7d') {
  return useQuery<ErrorMetrics>({
    queryKey: ['admin', 'errors', 'summary', period],
    queryFn: async () => {
      const response = await analyticsApi.getErrorSummary(period)
      return response.data
    },
    staleTime: ADMIN_METRICS.STALE_TIME,
    gcTime: ADMIN_METRICS.CACHE_TIME,
    refetchInterval: ADMIN_METRICS.REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}
