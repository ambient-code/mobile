import React, { useState } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native'
import { mockNotificationHistory, restoreNotification } from '@/utils/mockInboxData'
import { Notification, NotificationStatus } from '@/types/inbox'
import { useTheme } from '@/hooks/useTheme'
import { AgentAvatar } from '@/components/ui/AgentAvatar'
import { NotificationStatusBadge } from '@/components/ui/NotificationStatusBadge'

export default function NotificationHistoryScreen() {
  const { colors } = useTheme()
  const [notifications, setNotifications] = useState(mockNotificationHistory)

  const handleRestore = async (id: string) => {
    try {
      await restoreNotification(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'restored' as NotificationStatus } : n))
      )
    } catch (error) {
      console.error('Failed to restore notification:', error)
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = diff / (1000 * 60 * 60)

    if (hours < 24) return 'Today'
    if (hours < 48) return 'Yesterday'
    return 'Earlier'
  }

  const groupedNotifications = notifications.reduce(
    (groups, notif) => {
      const group = formatDate(notif.createdAt)
      if (!groups[group]) groups[group] = []
      groups[group].push(notif)
      return groups
    },
    {} as Record<string, Notification[]>
  )

  const sections = Object.entries(groupedNotifications).map(([title, data]) => ({
    title,
    data,
  }))

  return (
    <FlatList
      data={sections}
      keyExtractor={(item) => item.title}
      renderItem={({ item: section }) => (
        <View>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            {section.title}
          </Text>
          {section.data.map((notif) => (
            <View key={notif.id} style={[styles.item, { backgroundColor: colors.card }]}>
              <AgentAvatar agentName={notif.agentName} size="small" />
              <View style={styles.content}>
                <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
                  {notif.title}
                </Text>
                <Text style={[styles.time, { color: colors.textSecondary }]}>
                  {notif.createdAt.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View style={styles.actions}>
                <NotificationStatusBadge status={notif.status} />
                {notif.status === 'dismissed' && (
                  <TouchableOpacity
                    style={[styles.restoreButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleRestore(notif.id)}
                  >
                    <Text style={styles.restoreText}>Restore</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.contentContainer}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 8,
  },
  item: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
    gap: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  time: {
    fontSize: 13,
  },
  actions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  restoreButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  restoreText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
})
