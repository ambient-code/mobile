import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User } from '@/types/user'
import { TokenManager } from '@/services/auth/token-manager'
import { OAuthService } from '@/services/auth/oauth'
import { AuthAPI } from '@/services/api/auth'
import { OAUTH_CONFIG } from '@/utils/constants'
import type { AuthSessionResult } from 'expo-auth-session'
import { errorHandler } from '@/utils/errorHandler'

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
      const isAuth = await TokenManager.isAuthenticated()
      if (isAuth) {
        // Fetch real user profile from API
        const userProfile = await AuthAPI.getUserProfile()
        setUser(userProfile)
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
    } finally {
      setIsLoading(false)
    }
  }

  const login = async () => {
    try {
      setIsLoading(true)

      // Initiate OAuth flow
      const result: AuthSessionResult = await OAuthService.initiateLogin()

      if (result.type === 'success' && result.params?.code) {
        const codeVerifier = OAuthService.getCodeVerifier()
        if (!codeVerifier) {
          throw new Error('Code verifier not found')
        }

        // Exchange code for tokens
        await AuthAPI.exchangeToken(result.params.code, codeVerifier, OAUTH_CONFIG.redirectUri)

        // Fetch user profile
        await checkAuth()
      } else if (result.type === 'error') {
        throw new Error(result.error?.message || 'Login failed')
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
      await AuthAPI.logout()
      setUser(null)
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
