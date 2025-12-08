import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native'
import { router, useRootNavigationState, useLocalSearchParams } from 'expo-router'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { ApiStatusIndicator } from '@/components/ui/ApiStatusIndicator'
import { IconSymbol } from '@/components/ui/icon-symbol'

/**
 * Login Screen
 * Implements FR-018: Display ACP API status on login screen with online/offline indicator
 */
export default function LoginScreen() {
  const { colors } = useTheme()
  const { login, isAuthenticated, isLoading } = useAuth()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const rootNavigationState = useRootNavigationState()
  const params = useLocalSearchParams<{ error?: string }>()

  // Show error message from OAuth callback if present
  useEffect(() => {
    if (params.error) {
      Alert.alert('Authentication Error', params.error, [{ text: 'OK' }])
      // Clear error from URL
      router.setParams({ error: undefined })
    }
  }, [params.error])

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!rootNavigationState?.key) return // Wait for navigation to be ready

    if (isAuthenticated && !isLoading) {
      router.replace('/(tabs)')
    }
  }, [isAuthenticated, isLoading, rootNavigationState])

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true)
      await login()
      // Navigation handled by useEffect above after auth state updates
    } catch (error) {
      console.error('Login failed:', error)
      Alert.alert(
        'Login Failed',
        error instanceof Error ? error.message : 'Unable to sign in. Please try again.',
        [{ text: 'OK' }]
      )
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Show loading state during initial auth check
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Checking authentication...
        </Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <View style={[styles.logoCircle, { backgroundColor: colors.accent + '20' }]}>
          <IconSymbol name="terminal.fill" size={60} color={colors.accent} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>ACP Mobile</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Ambient Code Platform
        </Text>
      </View>

      {/* API Status Section */}
      <View style={styles.statusSection}>
        <ApiStatusIndicator size="large" showLabel={true} />
      </View>

      {/* Login Button */}
      <View style={styles.loginSection}>
        <TouchableOpacity
          style={[
            styles.loginButton,
            { backgroundColor: colors.accent },
            isLoggingIn && styles.loginButtonDisabled,
          ]}
          onPress={handleLogin}
          disabled={isLoggingIn}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Sign in with Red Hat SSO"
          accessibilityHint="Double tap to sign in using your Red Hat credentials"
        >
          {isLoggingIn ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.loginButtonText}>Signing in...</Text>
            </>
          ) : (
            <>
              <IconSymbol name="person.fill" size={20} color="#fff" />
              <Text style={styles.loginButtonText}>Sign in with Red Hat SSO</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.helpText, { color: colors.textSecondary }]}>
          Use your Red Hat credentials to access the Ambient Code Platform mobile companion
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Red Hat AI Engineering
        </Text>
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>Version 1.0.0</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusSection: {
    marginBottom: 48,
    alignItems: 'center',
  },
  loginSection: {
    gap: 16,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  versionText: {
    fontSize: 12,
  },
})
