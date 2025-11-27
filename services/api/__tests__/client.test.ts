import MockAdapter from 'axios-mock-adapter'
import { apiClient } from '../client'
import { TokenManager } from '@/services/auth/token-manager'

jest.mock('@/services/auth/token-manager')

describe('API Client', () => {
  let mock: MockAdapter

  beforeEach(() => {
    // Mock the apiClient's axios instance, not the global axios
    mock = new MockAdapter(apiClient.getInstance())
    jest.clearAllMocks()
  })

  afterEach(() => {
    mock.restore()
  })

  describe('Token refresh interceptor', () => {
    it('refreshes token on 401 and retries original request', async () => {
      // First call returns 401
      mock.onGet('/sessions').replyOnce(401)

      // Refresh token call succeeds
      mock.onPost('/auth/refresh').replyOnce(200, {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      })

      // Retry original request succeeds
      mock.onGet('/sessions').replyOnce(200, { sessions: [] })
      ;(TokenManager.getRefreshToken as jest.Mock).mockResolvedValue('old-refresh-token')
      ;(TokenManager.setTokens as jest.Mock).mockResolvedValue(undefined)

      const response = await apiClient.get('/sessions')

      expect(response).toEqual({ sessions: [] })
      expect(TokenManager.setTokens).toHaveBeenCalledWith('new-access-token', 'new-refresh-token')
      expect(mock.history.get.length).toBe(2) // Original + retry
    })

    it('queues concurrent requests during token refresh', async () => {
      // First requests return 401
      mock.onGet('/sessions').replyOnce(401).onGet('/sessions').replyOnce(200, { sessions: [] })
      mock.onGet('/user').replyOnce(401).onGet('/user').replyOnce(200, { user: {} })

      // Refresh token call succeeds
      mock.onPost('/auth/refresh').replyOnce(200, {
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
      })
      ;(TokenManager.getRefreshToken as jest.Mock).mockResolvedValue('refresh-token')
      ;(TokenManager.setTokens as jest.Mock).mockResolvedValue(undefined)

      // Make concurrent requests
      await Promise.all([apiClient.get('/sessions'), apiClient.get('/user')])

      // Token refresh should only be called ONCE
      expect(mock.history.post.filter((r) => r.url === '/auth/refresh').length).toBe(1)
    })
  })

  describe('Proactive token refresh', () => {
    it('refreshes token before expiration during request', async () => {
      ;(TokenManager.shouldRefreshToken as jest.Mock).mockResolvedValue(true)
      ;(TokenManager.getRefreshToken as jest.Mock).mockResolvedValue('refresh-token')
      ;(TokenManager.setTokens as jest.Mock).mockResolvedValue(undefined)

      mock.onPost('/auth/refresh').replyOnce(200, {
        accessToken: 'proactive-new-token',
        refreshToken: 'proactive-new-refresh',
      })
      mock.onGet('/sessions').replyOnce(200, { sessions: [] })

      await apiClient.get('/sessions')

      expect(TokenManager.setTokens).toHaveBeenCalledWith(
        'proactive-new-token',
        'proactive-new-refresh'
      )
    })

    it('does not refresh when token is not expiring soon', async () => {
      ;(TokenManager.shouldRefreshToken as jest.Mock).mockResolvedValue(false)
      ;(TokenManager.getAccessToken as jest.Mock).mockResolvedValue('valid-token')

      mock.onGet('/sessions').replyOnce(200, { sessions: [] })

      await apiClient.get('/sessions')

      expect(TokenManager.setTokens).not.toHaveBeenCalled()
      expect(mock.history.post.filter((r) => r.url === '/auth/refresh').length).toBe(0)
    })
  })

  describe('Token refresh failure handling', () => {
    it('clears tokens and rejects request when refresh fails', async () => {
      // First call returns 401, triggering token refresh
      mock.onGet('/sessions').reply(401)

      // Refresh fails with 401
      mock.onPost('/auth/refresh').reply(401, { error: 'Invalid refresh token' })
      ;(TokenManager.getRefreshToken as jest.Mock).mockResolvedValue('invalid-refresh-token')
      ;(TokenManager.clearTokens as jest.Mock).mockResolvedValue(undefined)

      await expect(apiClient.get('/sessions')).rejects.toThrow('Session expired')

      expect(TokenManager.clearTokens).toHaveBeenCalled()
    })
  })

  describe('Request retry logic', () => {
    it('does not retry the same request twice', async () => {
      // All calls return 401 to ensure failure path
      mock.onGet('/sessions').reply(401)
      mock.onPost('/auth/refresh').reply(401)
      ;(TokenManager.getRefreshToken as jest.Mock).mockResolvedValue('refresh-token')
      ;(TokenManager.clearTokens as jest.Mock).mockResolvedValue(undefined)

      await expect(apiClient.get('/sessions')).rejects.toThrow()

      // Should only attempt the request twice (original + one retry after failed refresh)
      expect(mock.history.get.length).toBe(1) // Only original request (refresh fails, so no retry)
    })
  })
})
