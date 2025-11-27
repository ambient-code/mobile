import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/services/api/client'

export enum ApiStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  CHECKING = 'checking',
  ERROR = 'error',
}

interface UseApiStatusReturn {
  status: ApiStatus
  lastChecked: Date | null
  checkHealth: () => Promise<void>
  error: string | null
}

const HEALTH_CHECK_INTERVAL = 30000 // 30 seconds
const HEALTH_CHECK_TIMEOUT = 5000 // 5 seconds

/**
 * Hook to monitor ACP API health status
 * Performs periodic health checks and provides current API status
 */
export function useApiStatus(autoCheck = true): UseApiStatusReturn {
  const [status, setStatus] = useState<ApiStatus>(ApiStatus.CHECKING)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkHealth = useCallback(async () => {
    setStatus(ApiStatus.CHECKING)
    setError(null)

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Health check timeout')), HEALTH_CHECK_TIMEOUT)
      )

      // Race between health check and timeout
      const healthCheckPromise = apiClient.get<{ status: string }>('/health')

      const response = await Promise.race([healthCheckPromise, timeoutPromise])

      if ((response as { status: string }).status === 'ok') {
        setStatus(ApiStatus.ONLINE)
        setError(null)
      } else {
        setStatus(ApiStatus.ERROR)
        setError('API returned unexpected status')
      }
    } catch (err) {
      console.warn('API health check failed:', err)
      setStatus(ApiStatus.OFFLINE)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLastChecked(new Date())
    }
  }, [])

  useEffect(() => {
    if (!autoCheck) return

    // Initial check
    checkHealth()

    // Set up periodic health checks
    const interval = setInterval(checkHealth, HEALTH_CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [autoCheck, checkHealth])

  return {
    status,
    lastChecked,
    checkHealth,
    error,
  }
}
