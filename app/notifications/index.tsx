import React, { useState, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '@/hooks/useTheme'
import { useOffline } from '@/hooks/useOffline'
import { useNotifications, useMarkAllAsRead } from '@/hooks/useNotifications'
import { useNotificationActions } from '@/components/notifications/NotificationActions'
import { NotificationCard } from '@/components/notifications/NotificationCard'
import { OfflineBanner } from '@/components/ui/OfflineBanner'
import type { GitHubNotification } from '@/types/notification'

type FilterType = 'all' | 'unread'

export default function NotificationsScreen() {
  const { colors } = useTheme()
  const { isOffline } = useOffline()
  const [filter, setFilter] = useState<FilterType>('all')
  const { notifications, unreadCount, isLoading, refetch } = useNotifications(filter === 'unread')
  const { showActions } = useNotificationActions()
  const markAllAsRead = useMarkAllAsRead()

  const filters: { label: string; value: FilterType; badge?: number }[] = [
    { label: 'All', value: 'all' },
    { label: 'Unread', value: 'unread', badge: unreadCount },
  ]

  const handleNotificationPress = useCallback(
    (notification: GitHubNotification) => {
      showActions(notification, () => {
        // Refetch after action completes
        refetch()
      })
    },
    [showActions, refetch]
  )

  const handleMarkAllAsRead = useCallback(() => {
    if (unreadCount === 0) {
      Alert.alert('No Unread Notifications', 'All notifications are already marked as read.')
      return
    }

    Alert.alert(
      'Mark All as Read',
      `Mark all ${unreadCount} notification${unreadCount === 1 ? '' : 's'} as read?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All',
          onPress: async () => {
            await markAllAsRead.mutateAsync()
            refetch()
          },
        },
      ]
    )
  }, [unreadCount, markAllAsRead, refetch])

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Offline Banner */}
      {isOffline && <OfflineBanner />}

      {/* Header with Mark All Read button */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>GitHub Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={[styles.markAllButton, { backgroundColor: colors.card }]}
            onPress={handleMarkAllAsRead}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Mark all notifications as read"
            accessibilityHint={`Mark all ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'} as read`}
          >
            <Feather name="check-circle" size={16} color={colors.accent} />
            <Text style={[styles.markAllText, { color: colors.accent }]}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((f) => {
          const isActive = filter === f.value
          return (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isActive ? colors.accent : colors.card,
                  borderColor: isActive ? colors.accent : colors.border,
                },
              ]}
              onPress={() => setFilter(f.value)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${f.label}`}
              accessibilityState={{ selected: isActive }}
              accessibilityHint={`Double tap to show ${f.label.toLowerCase()} notifications`}
            >
              <Text style={[styles.filterText, { color: isActive ? '#fff' : colors.text }]}>
                {f.label}
              </Text>
              {f.badge !== undefined && f.badge > 0 && (
                <View
                  style={[styles.badge, { backgroundColor: isActive ? '#fff' : colors.accent }]}
                >
                  <Text style={[styles.badgeText, { color: isActive ? colors.accent : '#fff' }]}>
                    {f.badge > 99 ? '99+' : f.badge}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={useCallback(
          ({ item }: { item: GitHubNotification }) => (
            <NotificationCard notification={item} onPress={handleNotificationPress} />
          ),
          [handleNotificationPress]
        )}
        keyExtractor={useCallback((item: GitHubNotification) => item.id, [])}
        contentContainerStyle={styles.scrollContent}
        ListEmptyComponent={
          isLoading ? (
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading notifications...
            </Text>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <Feather name="bell-off" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyStateText, { color: colors.text }]}>No notifications</Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                {filter === 'unread'
                  ? 'All caught up! No unread notifications.'
                  : "You're all caught up! Check back later."}
              </Text>
            </View>
          )
        }
        ListFooterComponent={<View style={{ height: 40 }} />}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        onRefresh={refetch}
        refreshing={isLoading}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filtersContainer: {
    flexGrow: 0,
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
  emptyState: {
    padding: 60,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
})
