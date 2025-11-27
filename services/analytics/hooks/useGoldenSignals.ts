import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../client'
import { ADMIN_METRICS } from '@/constants/AdminMetrics'
import type { GoldenSignalsPeriod } from '../types'

/**
 * Hook for fetching Golden Signals metrics (Latency, Traffic, Errors, Saturation)
 * Used in Golden Signals Dashboard (app/admin/signals.tsx)
 *
 * @param period - Time period for metrics ('7d' | '30d')
 *
 * Auto-refreshes every 5 minutes
 * Caches for 15 minutes
 * Data considered fresh for 4 minutes
 */
export function useGoldenSignals(period: GoldenSignalsPeriod = '7d') {
  return useQuery({
    queryKey: ['admin', 'golden-signals', period],
    queryFn: async () => {
      const response = await analyticsApi.getGoldenSignals(period)
      return response.data
    },
    staleTime: ADMIN_METRICS.STALE_TIME,
    cacheTime: ADMIN_METRICS.CACHE_TIME,
    refetchInterval: ADMIN_METRICS.REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}
