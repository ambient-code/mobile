import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../client'
import { ADMIN_METRICS } from '@/constants/AdminMetrics'
import type { EngagementPeriod } from '../types'

/**
 * Hook for fetching user engagement metrics (DAU, MAU, stickiness)
 * Used in Engagement Dashboard (app/admin/users.tsx)
 *
 * @param period - Time period for DAU breakdown ('24h' | '7d' | '30d')
 *
 * Auto-refreshes every 5 minutes
 * Caches for 15 minutes
 * Data considered fresh for 4 minutes
 */
export function useEngagement(period: EngagementPeriod = '24h') {
  return useQuery({
    queryKey: ['admin', 'engagement', period],
    queryFn: async () => {
      const response = await analyticsApi.getEngagementMetrics(period)
      return response.data
    },
    staleTime: ADMIN_METRICS.STALE_TIME,
    cacheTime: ADMIN_METRICS.CACHE_TIME,
    refetchInterval: ADMIN_METRICS.REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}
