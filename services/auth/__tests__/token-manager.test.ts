import * as SecureStore from 'expo-secure-store'
import { TokenManager } from '../token-manager'

// Mock SecureStore
jest.mock('expo-secure-store')

// Helper to create mock JWT tokens for testing
function createMockJWT(payload: Record<string, any>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64')
  return `${header}.${body}.signature`
}

describe('TokenManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('isAuthenticated', () => {
    it('returns false when no token exists', async () => {
      ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null)
      const result = await TokenManager.isAuthenticated()
      expect(result).toBe(false)
    })

    it('returns false and clears tokens when token is expired', async () => {
      // Create expired JWT (exp: Jan 1, 2020)
      const expiredToken = createMockJWT({ exp: 1577836800 })
      ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue(expiredToken)
      ;(SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined)

      const result = await TokenManager.isAuthenticated()

      expect(result).toBe(false)
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(2) // Clear both access and refresh tokens
    })

    it('returns true when token is valid and not expired', async () => {
      // Create future-expiring JWT (exp: 2030)
      const validToken = createMockJWT({ exp: 1893456000 })
      ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue(validToken)

      const result = await TokenManager.isAuthenticated()

      expect(result).toBe(true)
    })
  })

  describe('shouldRefreshToken', () => {
    it('returns true when token expires in less than 5 minutes', async () => {
      const nowInSeconds = Math.floor(Date.now() / 1000)
      const expiresIn3Minutes = nowInSeconds + 180 // 3 minutes from now

      const token = createMockJWT({ exp: expiresIn3Minutes })
      ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue(token)

      const result = await TokenManager.shouldRefreshToken()

      expect(result).toBe(true)
    })

    it('returns false when token expires in more than 5 minutes', async () => {
      const nowInSeconds = Math.floor(Date.now() / 1000)
      const expiresIn10Minutes = nowInSeconds + 600 // 10 minutes from now

      const token = createMockJWT({ exp: expiresIn10Minutes })
      ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue(token)

      const result = await TokenManager.shouldRefreshToken()

      expect(result).toBe(false)
    })
  })

  describe('SecureStore error handling', () => {
    it('handles getItemAsync failures gracefully', async () => {
      ;(SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error('Keychain locked'))

      const result = await TokenManager.getAccessToken()

      expect(result).toBeNull()
      // Should not throw, should log error
    })

    it('throws user-friendly error on setItemAsync failure', async () => {
      ;(SecureStore.setItemAsync as jest.Mock).mockRejectedValue(new Error('Storage full'))

      await expect(TokenManager.setAccessToken('token')).rejects.toThrow(
        'Failed to save authentication token'
      )
    })
  })
})
