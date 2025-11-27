import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SessionStatus } from '@/types/session'
import { useTheme } from '@/hooks/useTheme'

interface StatusBadgeProps {
  status: SessionStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { colors } = useTheme()

  const getStatusColor = () => {
    switch (status) {
      case SessionStatus.RUNNING:
        return colors.accent
      case SessionStatus.PAUSED:
        return colors.warning
      case SessionStatus.DONE:
        return colors.success
      case SessionStatus.AWAITING_REVIEW:
        return colors.warning
      case SessionStatus.ERROR:
        return colors.error
      default:
        return colors.textSecondary
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case SessionStatus.RUNNING:
        return 'Running'
      case SessionStatus.PAUSED:
        return 'Paused'
      case SessionStatus.DONE:
        return 'Done'
      case SessionStatus.AWAITING_REVIEW:
        return 'Awaiting Review'
      case SessionStatus.ERROR:
        return 'Error'
      default:
        return status
    }
  }

  const statusColor = getStatusColor()

  return (
    <View style={[styles.container, { backgroundColor: statusColor + '20' }]}>
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
  },
})
