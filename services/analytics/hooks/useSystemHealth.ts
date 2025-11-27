import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../client'
import { ADMIN_METRICS } from '@/constants/AdminMetrics'

/**
 * Hook for fetching system health status
 * Used in Overview Dashboard (app/admin/index.tsx)
 *
 * Auto-refreshes every 5 minutes
 * Caches for 15 minutes
 * Data considered fresh for 4 minutes
 */
export function useSystemHealth() {
  return useQuery({
    queryKey: ['admin', 'system-health'],
    queryFn: async () => {
      const response = await analyticsApi.getSystemHealth()
      return response.data
    },
    staleTime: ADMIN_METRICS.STALE_TIME,
    cacheTime: ADMIN_METRICS.CACHE_TIME,
    refetchInterval: ADMIN_METRICS.REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}
