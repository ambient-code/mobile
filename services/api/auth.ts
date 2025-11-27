import { apiClient } from './client'
import type { TokenResponse } from '@/types/api'
import { TokenManager } from '@/services/auth/token-manager'
import { OAuthService } from '@/services/auth/oauth'
import type { User } from '@/types/user'

export interface LoginResponse {
  authUrl: string
  state: string
}

export interface TokenExchangeRequest {
  code: string
  codeVerifier: string
  redirectUri: string
}

export class AuthAPI {
  static async initiateLogin(redirectUri: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login', { redirectUri })
  }

  static async exchangeToken(
    code: string,
    codeVerifier: string,
    redirectUri: string
  ): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/auth/token', {
      code,
      codeVerifier,
      redirectUri,
    })

    // Store tokens
    await TokenManager.setTokens(response.accessToken, response.refreshToken)

    return response
  }

  static async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/auth/refresh', {
      refreshToken,
    })

    // Update stored tokens
    await TokenManager.setTokens(response.accessToken, response.refreshToken)

    return response
  }

  static async getUserProfile(): Promise<User> {
    return apiClient.get<User>('/auth/profile')
  }

  static async logout(): Promise<void> {
    await TokenManager.clearTokens()
    OAuthService.clearCodeVerifier()
  }
}
