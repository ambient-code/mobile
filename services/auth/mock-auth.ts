import type { User } from '@/types/user'
import { DEFAULT_PREFERENCES } from '@/types/user'

/**
 * Mock Authentication Service
 *
 * Provides fake authentication for development when OAuth backend is unavailable.
 * Enable via: EXPO_PUBLIC_USE_MOCK_AUTH=true in .env.local
 */

export const MOCK_USER: User = {
  id: 'mock-user-dev-123',
  name: 'Developer User',
  email: 'developer@redhat.com',
  role: 'developer',
  avatar: null,
  ssoProvider: 'mock',
  preferences: DEFAULT_PREFERENCES,
}

export class MockAuthService {
  /**
   * Simulate login - always succeeds instantly
   */
  static async login(): Promise<User> {
    console.log('[MockAuth] 🎭 Using mock authentication - login successful')
    return Promise.resolve(MOCK_USER)
  }

  /**
   * Simulate token check - always authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    return true
  }

  /**
   * Get mock user profile
   */
  static async getUserProfile(): Promise<User> {
    return MOCK_USER
  }

  /**
   * Simulate logout - always succeeds
   */
  static async logout(): Promise<void> {
    console.log('[MockAuth] 🎭 Mock logout')
    return Promise.resolve()
  }
}
