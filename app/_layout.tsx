import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/hooks/useAuth'
import { ThemeProvider, useTheme } from '@/hooks/useTheme'
import { ToastProvider, useToast } from '@/hooks/useToast'
import { Toast } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { CreateFAB } from '@/components/layout/CreateFAB'
import { errorHandler } from '@/utils/errorHandler'
import { useLinking } from '@/hooks/useLinking'
import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

// Singleton QueryClient instance (prevents memory leaks and cache loss)
let queryClient: QueryClient | null = null

function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 2,
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          refetchOnWindowFocus: false,
          refetchOnReconnect: true,
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time)
          networkMode: 'offlineFirst', // Better offline support
        },
        mutations: {
          retry: 1,
          networkMode: 'offlineFirst',
        },
      },
    })

    if (__DEV__) {
      console.log('✅ QueryClient initialized with optimized settings')
    }
  }
  return queryClient
}

export const unstable_settings = {
  anchor: '(tabs)',
}

function RootLayoutNav() {
  const { colors, theme } = useTheme()
  const { currentToast, dismissToast } = useToast()
  const [lastError, setLastError] = useState<Error | null>(null)

  // Enable deep linking
  useLinking({
    enabled: true,
    onNavigationError: (url, error) => {
      console.error('[RootLayout] Deep link navigation error:', url, error)
      errorHandler.reportError(error, {
        source: 'DeepLink',
        url,
      })
    },
  })

  // Subscribe to global errors for UI updates
  useEffect(() => {
    const unsubscribe = errorHandler.onError((error, context) => {
      if (!context?.isFatal) {
        setLastError(error)
        // Auto-dismiss error banner after 5 seconds
        setTimeout(() => setLastError(null), 5000)
      }
    })

    return unsubscribe
  }, [])

  return (
    <>
      {/* Error banner for non-fatal errors */}
      {lastError && (
        <View style={[styles.errorBanner, { backgroundColor: '#ff4444' }]}>
          <Text style={styles.errorText}>⚠️ {lastError.message}</Text>
          <TouchableOpacity onPress={() => setLastError(null)}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.bg,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerBackTitle: '',
          headerBackTitleVisible: false,
          contentStyle: {
            backgroundColor: colors.bg,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: '' }} />
        <Stack.Screen
          name="notifications/index"
          options={{
            headerShown: true,
            headerTitle: '',
            headerBackTitle: '',
          }}
        />
        <Stack.Screen
          name="chat"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
      <Toast notification={currentToast} onDismiss={dismissToast} />
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <CreateFAB />
    </>
  )
}

export default function RootLayout() {
  const client = getQueryClient()

  // Initialize global error handler FIRST
  useEffect(() => {
    errorHandler.initialize()
  }, [])

  // Initialize performance monitoring in development
  useEffect(() => {
    if (__DEV__) {
      const { startMemoryMonitoring } = require('@/utils/performanceMonitor')
      const { startFPSMonitoring } = require('@/utils/fpsMonitor')

      // Start monitoring
      const memoryMonitor = startMemoryMonitoring({
        checkIntervalMs: 15000, // Check every 15 seconds
        warningThreshold: 0.75,
        criticalThreshold: 0.9,
      })

      const fpsMonitor = startFPSMonitoring({
        slowFrameThreshold: 30, // Warn if FPS drops below 30 (more reasonable for mobile)
      })

      console.log('🔍 Performance monitoring active')
      console.log('📊 Type "performance.report()" in console for metrics')

      // Expose global performance utilities for debugging
      if (typeof global !== 'undefined') {
        const { deepLinkAnalytics } = require('@/utils/deepLinkAnalytics')
        ;(global as any).performance = {
          ...(global as any).performance,
          memory: memoryMonitor,
          fps: fpsMonitor,
          deepLinks: deepLinkAnalytics,
          report: () => {
            memoryMonitor.printReport()
            fpsMonitor.printReport()
            const { getRenderTracker } = require('@/utils/renderTracker')
            getRenderTracker().printReport()
            console.log(deepLinkAnalytics.generateReport())
          },
        }
      }

      // Cleanup on unmount
      return () => {
        memoryMonitor.stop()
        fpsMonitor.stop()
      }
    }
  }, [])

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Report React errors to global handler
        errorHandler.reportError(error, {
          componentStack: errorInfo.componentStack ?? undefined,
          source: 'ErrorBoundary',
        })
      }}
    >
      <QueryClientProvider client={client}>
        <ThemeProvider>
          <ErrorBoundary
            onError={(error, errorInfo) => {
              errorHandler.reportError(error, {
                componentStack: errorInfo.componentStack ?? undefined,
                source: 'ErrorBoundary',
              })
            }}
          >
            <AuthProvider>
              <ToastProvider>
                <ErrorBoundary
                  onError={(error, errorInfo) => {
                    errorHandler.reportError(error, {
                      componentStack: errorInfo.componentStack ?? undefined,
                      source: 'ErrorBoundary',
                    })
                  }}
                >
                  <RootLayoutNav />
                </ErrorBoundary>
              </ToastProvider>
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

// Error banner styles
const styles = StyleSheet.create({
  errorBanner: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 9999,
  },
  errorText: {
    color: '#fff',
    flex: 1,
    fontSize: 14,
  },
  dismissText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 12,
  },
})
