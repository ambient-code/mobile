import React, { memo } from 'react'
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import type { GitHubNotification, NotificationType } from '@/types/notification'
import { useTheme } from '@/hooks/useTheme'

interface NotificationCardProps {
  notification: GitHubNotification
  onPress: (notification: GitHubNotification) => void
}

/**
 * Get icon name for notification type
 */
function getNotificationIcon(type: NotificationType): keyof typeof Feather.glyphMap {
  switch (type) {
    case 'pull_request':
      return 'git-pull-request'
    case 'pull_request_review':
      return 'eye'
    case 'issue':
      return 'alert-circle'
    case 'issue_comment':
      return 'message-circle'
    case 'commit_comment':
      return 'git-commit'
    case 'mention':
      return 'at-sign'
    case 'release':
      return 'tag'
    case 'security_alert':
      return 'shield'
    default:
      return 'bell'
  }
}

/**
 * Format timestamp to relative time
 */
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  // Format as date for older notifications
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function NotificationCardComponent({ notification, onPress }: NotificationCardProps) {
  const { colors } = useTheme()

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderLeftColor: notification.isUnread ? colors.accent : 'transparent',
        },
      ]}
      onPress={() => onPress(notification)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${notification.type} notification from ${notification.repository}: ${notification.title}`}
      accessibilityHint="Double tap to view notification actions"
    >
      {/* Unread indicator dot */}
      {notification.isUnread && (
        <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />
      )}

      {/* Icon */}
      <View style={styles.iconContainer}>
        <Feather
          name={getNotificationIcon(notification.type)}
          size={20}
          color={notification.isUnread ? colors.accent : colors.textSecondary}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Repository */}
        <Text style={[styles.repository, { color: colors.textSecondary }]} numberOfLines={1}>
          {notification.repository}
        </Text>

        {/* Title */}
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              fontWeight: notification.isUnread ? '600' : '400',
            },
          ]}
          numberOfLines={2}
        >
          {notification.title}
        </Text>

        {/* Metadata */}
        <View style={styles.metadata}>
          <Text style={[styles.metadataText, { color: colors.textSecondary }]}>
            #{notification.itemNumber} by {notification.author}
          </Text>
          <Text style={[styles.dot, { color: colors.textSecondary }]}>•</Text>
          <Text style={[styles.metadataText, { color: colors.textSecondary }]}>
            {formatRelativeTime(notification.timestamp)}
          </Text>
        </View>
      </View>

      {/* Chevron */}
      <Feather name="chevron-right" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  unreadDot: {
    position: 'absolute',
    top: 12,
    left: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  repository: {
    fontSize: 12,
    fontWeight: '500',
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metadataText: {
    fontSize: 12,
  },
  dot: {
    fontSize: 12,
  },
})

/**
 * Memoized NotificationCard to prevent unnecessary re-renders
 * Only re-renders when notification ID or isUnread status changes
 */
export const NotificationCard = memo(
  NotificationCardComponent,
  (prevProps, nextProps) =>
    prevProps.notification.id === nextProps.notification.id &&
    prevProps.notification.isUnread === nextProps.notification.isUnread
)
