import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../client'
import { ADMIN_METRICS } from '@/constants/AdminMetrics'
import type { PlatformPeriod } from '../types'

/**
 * Hook for fetching platform distribution and OS versions
 * Used in Platform Comparison Dashboard (app/admin/platforms.tsx)
 *
 * @param period - Time period for platform analysis ('30d')
 *
 * Auto-refreshes every 5 minutes
 * Caches for 15 minutes
 * Data considered fresh for 4 minutes
 */
export function usePlatforms(period: PlatformPeriod = '30d') {
  return useQuery({
    queryKey: ['admin', 'platforms', period],
    queryFn: async () => {
      const response = await analyticsApi.getPlatformDistribution(period)
      return response.data
    },
    staleTime: ADMIN_METRICS.STALE_TIME,
    cacheTime: ADMIN_METRICS.CACHE_TIME,
    refetchInterval: ADMIN_METRICS.REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}
