import type { ReactNode } from 'react'
import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User } from '@/types/user'
import { TokenManager } from '@/services/auth/token-manager'
import { OAuthService } from '@/services/auth/oauth'
import { AuthAPI } from '@/services/api/auth'
import { USE_MOCK_AUTH } from '@/utils/constants'
import type { AuthSessionResult } from 'expo-auth-session'
import { errorHandler } from '@/utils/errorHandler'
import {
  setUser as setSentryUser,
  clearUser as clearSentryUser,
} from '@/services/monitoring/sentry'
import { MockAuthService } from '@/services/auth/mock-auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Use mock auth if enabled
      if (USE_MOCK_AUTH) {
        const mockUser = await MockAuthService.getUserProfile()
        setUser(mockUser)
        setSentryUser({
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.name,
        })
        return
      }

      // Real auth flow
      const isAuth = await TokenManager.isAuthenticated()
      if (isAuth) {
        // Fetch real user profile from API
        const userProfile = await AuthAPI.getUserProfile()
        setUser(userProfile)

        // Set user context in Sentry
        setSentryUser({
          id: userProfile.id,
          email: userProfile.email,
          username: userProfile.username,
        })
      }
    } catch (error) {
      console.error('Auth check error:', error)

      // Report to global error handler
      errorHandler.reportError(error instanceof Error ? error : new Error(String(error)), {
        source: 'Auth Check',
      })

      // If profile fetch fails, log out to prevent broken state
      await TokenManager.clearTokens()
      setUser(null)
      clearSentryUser()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async () => {
    try {
      setIsLoading(true)

      // Use mock auth if enabled
      if (USE_MOCK_AUTH) {
        const mockUser = await MockAuthService.login()
        setUser(mockUser)
        setSentryUser({
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.name,
        })
        return
      }

      // Real OAuth flow
      const result: AuthSessionResult = await OAuthService.initiateLogin()

      if (result.type === 'success' && result.params?.code) {
        const codeVerifier = OAuthService.getCodeVerifier()
        if (!codeVerifier) {
          throw new Error('Code verifier not found')
        }

        // Exchange code for tokens (use the same redirect URI that was used for login)
        const redirectUri = OAuthService.getRedirectUri()
        await AuthAPI.exchangeToken(result.params.code, codeVerifier, redirectUri)

        // Fetch user profile
        await checkAuth()
      } else if (result.type === 'error') {
        throw new Error(result.error?.message || 'Login failed')
      } else {
        throw new Error('Login was cancelled or failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Use mock auth if enabled
      if (USE_MOCK_AUTH) {
        await MockAuthService.logout()
        setUser(null)
        clearSentryUser()
        return
      }

      // Real logout
      await AuthAPI.logout()
      setUser(null)
      clearSentryUser()
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
