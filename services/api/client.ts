import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL, FEATURE_FLAGS } from '@/utils/constants'
import { TokenManager } from '@/services/auth/token-manager'
import { ApiError } from '@/types/api'
import { errorHandler } from '@/utils/errorHandler'

class ApiClient {
  private client: AxiosInstance
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value: string) => void
    reject: (error: unknown) => void
  }> = []

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor - add auth token and proactively refresh if needed
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Proactively refresh token if it's expiring soon (within 5 minutes)
        // This prevents auth interruptions during active usage
        if (await TokenManager.shouldRefreshToken()) {
          const refreshToken = await TokenManager.getRefreshToken()
          if (refreshToken && !this.isRefreshing) {
            this.isRefreshing = true
            try {
              const response = await this.client.post('/auth/refresh', { refreshToken })
              const { accessToken, refreshToken: newRefreshToken } = response.data
              await TokenManager.setTokens(accessToken, newRefreshToken)
            } catch (error) {
              // Let the response interceptor handle refresh failures
              console.warn('Proactive token refresh failed:', error)
            } finally {
              this.isRefreshing = false
            }
          }
        }

        const token = await TokenManager.getAccessToken()
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }

        if (FEATURE_FLAGS.DEBUG_API_CALLS) {
          console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data)
        }

        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor - handle 401 and refresh token
    this.client.interceptors.response.use(
      (response) => {
        if (FEATURE_FLAGS.DEBUG_API_CALLS) {
          console.log(`[API] Response:`, response.data)
        }
        return response
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean
        }

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue this request while refresh is in progress
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject })
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`
                }
                return this.client(originalRequest)
              })
              .catch((err) => Promise.reject(err))
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const refreshToken = await TokenManager.getRefreshToken()
            if (!refreshToken) {
              throw new Error('No refresh token available')
            }

            // Bypass interceptor for refresh request by marking it as already retried
            const response = await this.client.post('/auth/refresh', { refreshToken }, {
              _retry: true,
            } as InternalAxiosRequestConfig & { _retry?: boolean })

            const { accessToken, refreshToken: newRefreshToken } = response.data
            await TokenManager.setTokens(accessToken, newRefreshToken)

            // Retry all queued requests
            this.failedQueue.forEach((prom) => prom.resolve(accessToken))
            this.failedQueue = []

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`
            }
            return this.client(originalRequest)
          } catch (refreshError) {
            this.failedQueue.forEach((prom) => prom.reject(refreshError))
            this.failedQueue = []

            // Report token refresh failure to global handler
            errorHandler.reportError(new Error('Authentication failed. Please log in again.'), {
              source: 'API Client',
              extra: { url: originalRequest.url },
            })

            // Clear tokens and force re-login
            await TokenManager.clearTokens()
            throw new ApiError('Session expired. Please log in again.', 401)
          } finally {
            this.isRefreshing = false
          }
        }

        // Transform axios error to ApiError
        const errorData = error.response?.data as { message?: string } | undefined
        const message = errorData?.message || error.message || 'An error occurred'
        throw new ApiError(message, error.response?.status, error.response?.data)
      }
    )
  }

  getInstance(): AxiosInstance {
    return this.client
  }

  async get<T>(url: string, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }
}

export const apiClient = new ApiClient()
