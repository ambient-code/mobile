import React, { useCallback, useMemo, memo } from 'react'
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { useSessions } from '@/hooks/useSessions'
import { useOffline } from '@/hooks/useOffline'
import { useRealtimeSession } from '@/hooks/useRealtimeSession'
import { useNotifications } from '@/hooks/useNotifications'
import { Header } from '@/components/layout/Header'
import { FAB } from '@/components/layout/FAB'
import { SessionCard } from '@/components/session/SessionCard'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { SessionStatus, type Session } from '@/types/session'
import { IconSymbol } from '@/components/ui/icon-symbol'

// Quick Action button types and data
interface QuickAction {
  id: string
  icon: string
  text: string
  route?: string
  onPress?: () => void
  disabled?: boolean
  badge?: string
  count?: number
}

interface QuickActionButtonProps {
  action: QuickAction
  colors: ReturnType<typeof useTheme>['colors']
}

// Memoized Quick Action Button component
const QuickActionButton = memo<QuickActionButtonProps>(
  ({ action, colors }: QuickActionButtonProps) => {
    const dynamicText = action.count !== undefined ? `${action.count} ${action.text}` : action.text

    return (
      <TouchableOpacity
        style={[
          styles.quickActionButton,
          { backgroundColor: action.disabled ? colors.card : colors.accent },
        ]}
        onPress={action.onPress}
        activeOpacity={0.8}
        disabled={action.disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: action.disabled }}
      >
        <IconSymbol
          name={action.icon as Parameters<typeof IconSymbol>[0]['name']}
          size={28}
          color={action.disabled ? colors.textSecondary : '#fff'}
        />
        <Text
          style={[
            styles.quickActionText,
            { color: action.disabled ? colors.textSecondary : '#fff' },
          ]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {dynamicText}
        </Text>
        {action.badge && (
          <View style={styles.soonBadge}>
            <Text style={styles.soonText}>{action.badge}</Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }
)

QuickActionButton.displayName = 'QuickActionButton'

export default function DashboardScreen() {
  const { colors } = useTheme()
  const { isLoading: authLoading } = useAuth()
  const {
    data: sessions,
    isLoading,
    refetch,
    isRefetching,
    isError: isQueryError,
    error: queryError,
  } = useSessions()
  const { isOffline } = useOffline()
  const { retry, isConnected, isError } = useRealtimeSession()
  const { unreadCount } = useNotifications()
  const router = useRouter()

  // Filter sessions by status - optimized with single-pass filter and memoization
  const { runningSessions, awaitingReview } = useMemo(() => {
    if (!sessions) return { runningSessions: [], awaitingReview: [] }

    const running: Session[] = []
    const review: Session[] = []

    for (const session of sessions) {
      if (session.status === SessionStatus.RUNNING) running.push(session)
      else if (session.status === SessionStatus.AWAITING_REVIEW) review.push(session)
    }

    return { runningSessions: running, awaitingReview: review }
  }, [sessions])

  const handleViewAllSessions = useCallback(() => {
    router.push('/sessions/')
  }, [router])

  const renderSessionCard = useCallback(
    ({ item }: { item: Session }) => (
      <View style={styles.reviewCardWrapper}>
        <SessionCard session={item} />
      </View>
    ),
    []
  )

  // Render callback for running sessions (no wrapper needed)
  const renderRunningSession = useCallback(
    ({ item }: { item: Session }) => <SessionCard session={item} />,
    []
  )

  const sessionKeyExtractor = useCallback((item: Session) => item.id, [])

  // Quick Actions data - memoized to prevent recreation
  const quickActions = useMemo<QuickAction[]>(
    () => [
      {
        id: 'chat',
        icon: 'message.fill',
        text: 'Interactive',
        onPress: () => router.push('/chat'),
      },
      {
        id: 'running',
        icon: 'bolt.fill',
        text: 'Running',
        count: runningSessions.length,
        onPress: () => router.push('/sessions/?filter=running'),
      },
      {
        id: 'notifications',
        icon: 'bell.fill',
        text: 'GitHub Notifications',
        count: unreadCount > 0 ? unreadCount : undefined,
        onPress: () => router.push('/notifications/'),
      },
      { id: 'lucky', icon: 'dice.fill', text: "I'm Feeling Lucky" },
      { id: 'inspire', icon: 'lightbulb.fill', text: 'Inspire Me' },
      { id: 'invent', icon: 'sparkles', text: 'Go Invent' },
      { id: 'add', icon: 'plus.circle.fill', text: 'Add Action', disabled: true, badge: 'Soon' },
    ],
    [runningSessions.length, unreadCount, router]
  )

  // Render callback for Quick Action buttons
  const renderQuickAction = useCallback(
    ({ item }: { item: QuickAction }) => <QuickActionButton action={item} colors={colors} />,
    [colors]
  )

  const quickActionKeyExtractor = useCallback((item: QuickAction) => item.id, [])

  if (authLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    )
  }

  // Show error UI if sessions failed to load
  if (isQueryError && queryError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <Header isRefetching={isRefetching} />
        <ErrorMessage error={queryError as Error} retry={refetch} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Header isRefetching={isRefetching} />

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {/* Offline Indicator */}
        {isOffline && (
          <View style={[styles.offlineBanner, { backgroundColor: colors.warning + '20' }]}>
            <Text style={[styles.offlineText, { color: colors.warning }]}>
              Offline - Showing cached data
            </Text>
          </View>
        )}

        {/* Connection Status - Only show when disconnected or error */}
        {!isConnected && !isOffline && (
          <View
            style={[
              styles.connectionBanner,
              { backgroundColor: isError ? colors.error + '20' : colors.warning + '20' },
            ]}
          >
            <View style={styles.connectionContent}>
              <View
                style={[
                  styles.connectionDot,
                  {
                    backgroundColor: isError ? colors.error : colors.warning,
                  },
                ]}
              />
              <Text
                style={[styles.connectionText, { color: isError ? colors.error : colors.warning }]}
              >
                {isError ? 'Real-time updates unavailable' : 'Connecting to updates...'}
              </Text>
            </View>
            {isError && (
              <TouchableOpacity
                onPress={retry}
                style={styles.retryButton}
                accessibilityRole="button"
                accessibilityLabel="Retry connection"
                accessibilityHint="Double tap to retry real-time connection"
              >
                <Text style={[styles.retryText, { color: colors.error }]}>Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Quick Actions - 2 rows of 3 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <View key={action.id} style={styles.quickActionWrapper}>
                <QuickActionButton action={action} colors={colors} />
              </View>
            ))}
          </View>
        </View>

        {/* My Reviews */}
        {awaitingReview.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>My Reviews</Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: colors.warning + '20', borderColor: colors.warning },
                ]}
              >
                <Text style={[styles.badgeText, { color: colors.warning }]}>
                  {awaitingReview.length}
                </Text>
              </View>
            </View>

            <FlatList
              horizontal
              data={awaitingReview}
              renderItem={renderSessionCard}
              keyExtractor={sessionKeyExtractor}
              showsHorizontalScrollIndicator={false}
              initialNumToRender={3}
              maxToRenderPerBatch={3}
              windowSize={3}
            />
          </View>
        )}

        {/* Active Sessions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Sessions</Text>
            {runningSessions.length > 0 && (
              <TouchableOpacity
                onPress={handleViewAllSessions}
                accessibilityRole="button"
                accessibilityLabel="View all sessions"
                accessibilityHint="Double tap to view all active sessions"
              >
                <Text style={[styles.viewAllText, { color: colors.accent }]}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {isLoading ? (
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading sessions...
            </Text>
          ) : runningSessions.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No active sessions
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                Tap the + button to start a new session
              </Text>
            </View>
          ) : (
            <FlatList
              data={runningSessions.slice(0, 3)}
              renderItem={renderRunningSession}
              keyExtractor={sessionKeyExtractor}
              scrollEnabled={false}
              initialNumToRender={3}
              maxToRenderPerBatch={3}
              windowSize={1}
            />
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
  offlineBanner: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  offlineText: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
  connectionBanner: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    fontWeight: '600',
    fontSize: 14,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryText: {
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  quickActionWrapper: {
    width: '31%', // 3 columns with gaps
  },
  quickActionButton: {
    width: '100%',
    height: 100,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  soonBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFA500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  soonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  reviewCardWrapper: {
    width: 300,
    marginRight: 12,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
  },
})
