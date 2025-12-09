import { useEffect } from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { AuthAPI } from '@/services/api/auth'
import { OAuthService } from '@/services/auth/oauth'

/**
 * OAuth Callback Handler
 *
 * This screen handles the OAuth redirect from Red Hat SSO.
 * URL format: acp://auth/callback?code=...&state=...
 *
 * Flow:
 * 1. Extract authorization code from URL params
 * 2. Exchange code for access/refresh tokens
 * 3. Navigate to dashboard
 */
export default function AuthCallbackScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()

  useEffect(() => {
    handleCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCallback = async () => {
    try {
      const { code, error, error_description } = params

      // Handle OAuth errors
      if (error) {
        console.error('[AuthCallback] OAuth error:', error, error_description)
        router.replace({
          pathname: '/login',
          params: {
            error: error_description || 'Authentication failed',
          },
        })
        return
      }

      // Validate authorization code
      if (!code || typeof code !== 'string') {
        console.error('[AuthCallback] Missing authorization code')
        router.replace({
          pathname: '/login',
          params: { error: 'Invalid authorization response' },
        })
        return
      }

      console.log('[AuthCallback] Exchanging code for tokens...')

      // Get PKCE code verifier
      const codeVerifier = OAuthService.getCodeVerifier()
      if (!codeVerifier) {
        throw new Error('Code verifier not found. Please try logging in again.')
      }

      // Exchange authorization code for tokens (use same redirect URI as login)
      const redirectUri = OAuthService.getRedirectUri()
      await AuthAPI.exchangeToken(code, codeVerifier, redirectUri)

      // Clear code verifier
      OAuthService.clearCodeVerifier()

      console.log('[AuthCallback] Login successful, redirecting to dashboard')

      // Navigate to dashboard (AuthProvider will fetch user profile)
      router.replace('/(tabs)')
    } catch (err) {
      console.error('[AuthCallback] Token exchange failed:', err)
      router.replace({
        pathname: '/login',
        params: {
          error: err instanceof Error ? err.message : 'Login failed',
        },
      })
    }
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4f46e5" />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    gap: 16,
  },
  text: {
    fontSize: 16,
    color: '#475569',
  },
})
