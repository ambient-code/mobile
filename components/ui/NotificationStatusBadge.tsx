import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { NotificationStatus, NOTIFICATION_STATUS_COLORS } from '@/types/inbox'

interface NotificationStatusBadgeProps {
  status: NotificationStatus
}

export function NotificationStatusBadge({ status }: NotificationStatusBadgeProps) {
  const statusColor = NOTIFICATION_STATUS_COLORS[status]

  const getStatusLabel = () => {
    switch (status) {
      case 'dismissed':
        return 'DISMISSED'
      case 'reviewed':
        return 'REVIEWED ✓'
      case 'restored':
        return 'RESTORED'
    }
  }

  return (
    <View
      style={[styles.container, { backgroundColor: statusColor + '20' }]}
      accessibilityLabel={`Notification status: ${status}`}
      accessibilityRole="text"
    >
      <View style={[styles.dot, { backgroundColor: statusColor }]} />
      <Text style={[styles.label, { color: statusColor }]}>{getStatusLabel()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
})
