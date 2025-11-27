import * as SecureStore from 'expo-secure-store'

const KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  EXPO_PUSH_TOKEN: 'expo_push_token',
}

/**
 * Decoded JWT payload
 */
interface JWTPayload {
  exp?: number // Expiration time (Unix timestamp)
  iat?: number // Issued at (Unix timestamp)
  sub?: string // Subject (user ID)
  [key: string]: unknown
}

/**
 * Decode JWT token without verification (client-side check only)
 * Server will still validate the token
 */
function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    // Decode base64url payload
    const payload = parts[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    return JSON.parse(jsonPayload) as JWTPayload
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}

/**
 * Check if JWT token is expired
 * @param token - JWT token string
 * @param bufferSeconds - Consider token expired this many seconds before actual expiration (default: 60)
 */
function isTokenExpired(token: string, bufferSeconds = 60): boolean {
  const payload = decodeJWT(token)
  if (!payload || !payload.exp) {
    // If we can't decode or no expiration, consider it expired for safety
    return true
  }

  const now = Math.floor(Date.now() / 1000) // Current time in seconds
  const expiresAt = payload.exp
  const expiresIn = expiresAt - now

  // Token is expired if expiration time has passed (with buffer)
  return expiresIn <= bufferSeconds
}

export class TokenManager {
  static async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN)
    } catch (error) {
      console.error('Failed to get access token from SecureStore:', error)
      // Graceful degradation - treat as logged out
      return null
    }
  }

  static async setAccessToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, token)
    } catch (error) {
      console.error('Failed to save access token to SecureStore:', error)
      // Critical error - can't save token means can't authenticate
      throw new Error('Failed to save authentication token. Please try logging in again.')
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN)
    } catch (error) {
      console.error('Failed to get refresh token from SecureStore:', error)
      return null
    }
  }

  static async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token)
    } catch (error) {
      console.error('Failed to save refresh token to SecureStore:', error)
      throw new Error('Failed to save authentication token. Please try logging in again.')
    }
  }

  static async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([this.setAccessToken(accessToken), this.setRefreshToken(refreshToken)])
  }

  static async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
    ])
  }

  static async getExpoPushToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(KEYS.EXPO_PUSH_TOKEN)
  }

  static async setExpoPushToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.EXPO_PUSH_TOKEN, token)
  }

  /**
   * Check if user is authenticated with a valid (non-expired) token
   */
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken()
    if (!token) {
      return false
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      console.warn('Access token is expired, clearing tokens')
      // Clear expired tokens to prevent infinite expired token loop
      await this.clearTokens()
      return false
    }

    return true
  }

  /**
   * Check if access token needs refresh
   * Returns true if token is expired or will expire within threshold
   * @param thresholdSeconds - Refresh token if it expires within this many seconds (default: 5 minutes)
   */
  static async shouldRefreshToken(thresholdSeconds = 300): Promise<boolean> {
    const token = await this.getAccessToken()
    if (!token) {
      return false // No token to refresh
    }

    return isTokenExpired(token, thresholdSeconds)
  }

  /**
   * Get time until token expiration in seconds
   * Returns null if token is invalid or doesn't have expiration
   * Returns negative number if already expired
   */
  static async getTokenExpiresIn(): Promise<number | null> {
    const token = await this.getAccessToken()
    if (!token) {
      return null
    }

    const payload = decodeJWT(token)
    if (!payload || !payload.exp) {
      return null
    }

    const now = Math.floor(Date.now() / 1000)
    return payload.exp - now
  }

  /**
   * Get decoded token payload (useful for getting user info)
   */
  static async getTokenPayload(): Promise<JWTPayload | null> {
    const token = await this.getAccessToken()
    if (!token) {
      return null
    }

    return decodeJWT(token)
  }
}
