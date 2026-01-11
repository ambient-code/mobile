import React, { useState } from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/hooks/useTheme'
import { IconSymbol } from '@/components/ui/icon-symbol'
import type { AppNotification } from '@/types/notification'
import { INSPIRING_QUOTES } from '@/types/notification'

interface NotificationsModalProps {
  visible: boolean
  onClose: () => void
}

export function NotificationsModal({ visible, onClose }: NotificationsModalProps) {
  const { colors } = useTheme()
  const [activeTab, setActiveTab] = useState<'notifications' | 'announcements'>('notifications')

  // Mock notifications
  const mockNotifications: AppNotification[] = [
    {
      id: '1',
      type: 'review_request' as AppNotification['type'],
      title: 'New Review Request',
      message: 'Your session "API Integration Refactor" is ready for review',
      timestamp: new Date(Date.now() - 15 * 60000), // 15 minutes ago
      read: false,
      sessionId: 'session-123',
      author: 'Claude AI',
    },
    {
      id: '2',
      type: 'session_update' as AppNotification['type'],
      title: 'Session Completed',
      message: 'Your session "Database Migration" has completed successfully',
      timestamp: new Date(Date.now() - 2 * 60 * 60000), // 2 hours ago
      read: false,
      sessionId: 'session-456',
    },
    {
      id: '3',
      type: 'review_request' as AppNotification['type'],
      title: 'Review Needed',
      message: 'Code review requested for "Authentication Flow Updates"',
      timestamp: new Date(Date.now() - 4 * 60 * 60000), // 4 hours ago
      read: true,
      sessionId: 'session-789',
      author: 'System',
    },
  ]

  // Mock announcements
  const mockAnnouncements: AppNotification[] = [
    {
      id: 'a1',
      type: 'announcement' as AppNotification['type'],
      title: 'New Feature: Dark Mode',
      message:
        'You can now switch between light and dark themes in Settings. Try it out and let us know what you think!',
      timestamp: new Date(Date.now() - 24 * 60 * 60000), // 1 day ago
      read: false,
    },
    {
      id: 'a2',
      type: 'inspiration' as AppNotification['type'],
      title: 'Weekly Inspiration',
      message:
        '"The best way to predict the future is to invent it." - Alan Kay. What will you build this week?',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60000), // 3 days ago
      read: false,
    },
    {
      id: 'a3',
      type: 'announcement' as AppNotification['type'],
      title: 'System Maintenance',
      message:
        'Scheduled maintenance on Saturday 2AM-4AM EST. Brief service interruption expected.',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60000), // 5 days ago
      read: true,
    },
  ]

  // Random inspiring quote
  const randomQuote = INSPIRING_QUOTES[Math.floor(Math.random() * INSPIRING_QUOTES.length)]

  const currentNotifications = activeTab === 'notifications' ? mockNotifications : mockAnnouncements

  const formatTimestamp = (timestamp: Date) => {
    const now = Date.now()
    const diff = now - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return timestamp.toLocaleDateString()
  }

  const renderEmptyState = (type: 'notifications' | 'announcements') => (
    <View style={styles.emptyState}>
      <View style={[styles.quoteCard, { backgroundColor: colors.card }]}>
        <IconSymbol name="sparkles" size={32} color={colors.primary} />
        <Text style={[styles.quoteText, { color: colors.textPrimary }]}>
          &quot;{randomQuote.quote}&quot;
        </Text>
        <View style={styles.quoteAuthor}>
          <Text style={[styles.authorName, { color: colors.primary }]}>{randomQuote.author}</Text>
          <Text style={[styles.authorContext, { color: colors.textSecondary }]}>
            {randomQuote.context}
          </Text>
        </View>
      </View>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {type === 'notifications'
          ? 'No notifications yet. Stay tuned!'
          : 'No announcements yet. Check back later!'}
      </Text>
    </View>
  )

  const renderNotification = (notification: AppNotification) => {
    const isUnread = !notification.read
    const iconName =
      notification.type === 'review_request'
        ? 'checkmark.circle.fill'
        : notification.type === 'session_update'
          ? 'arrow.triangle.2.circlepath'
          : notification.type === 'announcement'
            ? 'megaphone.fill'
            : 'sparkles'

    return (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationCard,
          {
            backgroundColor: isUnread ? colors.primary + '10' : colors.card,
            borderLeftColor: isUnread ? colors.primary : colors.border,
          },
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          <View style={[styles.notificationIcon, { backgroundColor: colors.primary + '20' }]}>
            <IconSymbol name={iconName} size={20} color={colors.primary} />
          </View>
          <View style={styles.notificationDetails}>
            <View style={styles.notificationHeader}>
              <Text
                style={[
                  styles.notificationTitle,
                  { color: colors.textPrimary, fontWeight: isUnread ? '700' : '600' },
                ]}
              >
                {notification.title}
              </Text>
              {isUnread && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
            </View>
            <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
              {notification.message}
            </Text>
            <View style={styles.notificationFooter}>
              {notification.author && (
                <Text style={[styles.notificationAuthor, { color: colors.primary }]}>
                  {notification.author}
                </Text>
              )}
              <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                {formatTimestamp(notification.timestamp)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Updates</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Text style={[styles.closeButton, { color: colors.primary }]}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'notifications' && {
                borderBottomColor: colors.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveTab('notifications')}
            activeOpacity={0.7}
          >
            <IconSymbol name="bell.fill" size={20} color={colors.textPrimary} />
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'notifications' ? colors.primary : colors.textSecondary,
                },
              ]}
            >
              Notifications
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'announcements' && {
                borderBottomColor: colors.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveTab('announcements')}
            activeOpacity={0.7}
          >
            <IconSymbol name="sparkles" size={20} color={colors.textPrimary} />
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'announcements' ? colors.primary : colors.textSecondary,
                },
              ]}
            >
              Announcements
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          {currentNotifications.length === 0
            ? renderEmptyState(activeTab)
            : currentNotifications.map(renderNotification)}
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 24,
  },
  quoteCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 26,
  },
  quoteAuthor: {
    alignItems: 'center',
    gap: 4,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
  },
  authorContext: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  notificationCard: {
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  notificationDetails: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  notificationAuthor: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
  },
})
